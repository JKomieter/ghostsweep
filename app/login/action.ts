'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/utils/supabase/server'
import { checkLoginRateLimit, clearFailedLoginAttempts, recordFailedLoginAttempt } from '@/utils/login-rate-limit'
import { logLoginSecurityEvent } from '@/utils/security-logging'
import { headers } from 'next/headers'

interface AuthError {
    message: string
    status?: number
    code?: string
}

function formatAuthError(error: unknown): AuthError {
    if (!error) {
        return { message: 'An unknown error occurred. Please try again.' }
    }

    // Handle Supabase errors
    if (typeof error === 'object' && 'message' in error) {
        const err = error as { message: string; status?: number; code?: string }
        const message = err.message || ''
        
        // Map specific Supabase error messages to user-friendly messages
        if (message.includes('Invalid login credentials')) {
            return {
                message: 'Incorrect email or password. Please try again.',
                status: err.status,
                code: err.code,
            }
        }
        if (message.includes('Email not confirmed')) {
            return {
                message: 'Please confirm your email before signing in. Check your inbox for the confirmation link.',
                status: err.status,
                code: err.code,
            }
        }
        if (message.includes('User already registered')) {
            return {
                message: 'This email is already registered. Please sign in instead.',
                status: err.status,
                code: err.code,
            }
        }
        if (message.includes('Password')) {
            return {
                message: 'Password does not meet security requirements. Please choose a stronger password.',
                status: err.status,
                code: err.code,
            }
        }
        if (message.includes('rate')) {
            return {
                message: 'Too many attempts. Please wait a few minutes before trying again.',
                status: err.status,
                code: err.code,
            }
        }
        
        return {
            message,
            status: err.status,
            code: err.code,
        }
    }

    // Handle Error objects
    if (error instanceof Error) {
        return { message: error.message }
    }

    // Handle string errors
    if (typeof error === 'string') {
        return { message: error }
    }

    return { message: 'An unexpected error occurred. Please try again.' }
}

export async function login({email, password, captchaToken}: { email: string, password: string, captchaToken: string | null }) {
    try {
        // Validate inputs
        if (!email || !password) {
            throw new Error('Email and password are required.')
        }

        if (!email.includes('@')) {
            throw new Error('Please enter a valid email address.')
        }

        // Get client IP from headers
        const headersList = await headers()
        const ip = headersList.get('x-forwarded-for')?.split(',')[0] ||
                   headersList.get('x-real-ip') ||
                   headersList.get('cf-connecting-ip') ||
                   'unknown'

        // Check rate limiting and account lockout
        const rateLimitCheck = await checkLoginRateLimit(email.toLowerCase(), ip)

        if (!rateLimitCheck.allowed) {
            return {
                success: false,
                error: rateLimitCheck.reason || 'Too many login attempts. Please try again later.',
                shouldShowCaptcha: rateLimitCheck.shouldShowCaptcha,
                remainingAttempts: rateLimitCheck.remainingAttempts,
            }
        }

        // If CAPTCHA should be shown, require token
        if (rateLimitCheck.shouldShowCaptcha && !captchaToken) {
            return {
                success: false,
                error: 'Please complete the CAPTCHA verification.',
                shouldShowCaptcha: true,
                remainingAttempts: rateLimitCheck.remainingAttempts,
            }
        }

        // Verify CAPTCHA token if provided (Manual verification because Supabase CAPTCHA setting is disabled)
        if (captchaToken) {
            try {
                const formData = new URLSearchParams()
                formData.append('secret', process.env.HCAPTCHA_SECRET!)
                formData.append('response', captchaToken)

                const captchaVerification = await fetch('https://hcaptcha.com/siteverify', {
                    method: 'POST',
                    body: formData,
                })

                const captchaResult = await captchaVerification.json() as { success?: boolean; score?: number }

                if (!captchaResult.success) {
                    return {
                        success: false,
                        error: 'CAPTCHA verification failed. Please try again.',
                        shouldShowCaptcha: true,
                        remainingAttempts: rateLimitCheck.remainingAttempts,
                    }
                }
            } catch (captchaError) {
                console.error('CAPTCHA verification error:', captchaError)
                return {
                    success: false,
                    error: 'Failed to verify CAPTCHA. Please try again.',
                    shouldShowCaptcha: true,
                    remainingAttempts: rateLimitCheck.remainingAttempts,
                }
            }
        }

        const supabase = await createClient()

        const data = {
            email: email.trim().toLowerCase(),
            password,
            options: {
                // We verify captcha manually above, so we don't pass it to Supabase
                // to avoid "Captcha verification failed" error if Supabase protection is OFF.
            }
        }

        const { error } = await supabase.auth.signInWithPassword(data)

        if (error) {
            // Record failed attempt
            await recordFailedLoginAttempt(email.toLowerCase())
            
            // Log security event
            await logLoginSecurityEvent({
                timestamp: new Date().toISOString(),
                email: email.toLowerCase(),
                ip,
                eventType: 'failed_attempt',
                reason: error.message,
            })
            
            const formattedError = formatAuthError(error)

            // Re-check rate limit to get updated captcha status
            const updatedRateLimit = await checkLoginRateLimit(email.toLowerCase(), ip)

            return {
                success: false,
                error: formattedError.message,
                shouldShowCaptcha: updatedRateLimit.shouldShowCaptcha,
                remainingAttempts: updatedRateLimit.remainingAttempts,
            }
        }

        // Clear failed attempts on successful login
        await clearFailedLoginAttempts(email.toLowerCase())

        // Log successful login
        await logLoginSecurityEvent({
            timestamp: new Date().toISOString(),
            email: email.toLowerCase(),
            ip,
            eventType: 'successful_login',
        })

        revalidatePath('/', 'layout')
        // Return a success result instead of throwing redirect
        // The client will handle the redirect
        return { success: true }
    } catch (error) {
        const formattedError = formatAuthError(error)
        return { success: false, error: formattedError.message }
    }
}

export async function signup({ email, password, captchaToken }: { email: string, password: string, captchaToken?: string | null   }) {
    try {
        // Validate inputs
        if (!email || !password) {
            throw new Error('Email and password are required.')
        }

        if (!email.includes('@')) {
            throw new Error('Please enter a valid email address.')
        }

        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters long.')
        }

        // Verify CAPTCHA token for signup (Always required)
        if (!captchaToken) {
            throw new Error('Please complete the CAPTCHA verification.')
        }

        try {
            const formData = new URLSearchParams()
            formData.append('secret', process.env.HCAPTCHA_SECRET!)
            formData.append('response', captchaToken)

            const captchaVerification = await fetch('https://hcaptcha.com/siteverify', {
                method: 'POST',
                body: formData,
            })

            const captchaResult = await captchaVerification.json() as { success: boolean }

            if (!captchaResult.success) {
                throw new Error('CAPTCHA verification failed. Please try again.')
            }
        } catch (error) {
            console.error('CAPTCHA validation error:', error)
            throw new Error('Unable to verify CAPTCHA. Please try again.')
        }


        const supabase = await createClient()

        const { error } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
        })

        if (error) {
            const formattedError = formatAuthError(error)
            throw new Error(formattedError.message)
        }

        return { success: true }
    } catch (error) {
        const formattedError = formatAuthError(error)
        return { success: false, error: formattedError.message }
    }
}