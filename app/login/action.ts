'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

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

export async function login({email, password}: { email: string, password: string }) {
    try {
        // Validate inputs
        if (!email || !password) {
            throw new Error('Email and password are required.')
        }

        if (!email.includes('@')) {
            throw new Error('Please enter a valid email address.')
        }

        const supabase = await createClient()

        const data = {
            email: email.trim().toLowerCase(),
            password,
        }

        const { error } = await supabase.auth.signInWithPassword(data)

        if (error) {
            const formattedError = formatAuthError(error)
            throw new Error(formattedError.message)
        }

        revalidatePath('/', 'layout')
        redirect('/dashboard')
    } catch (error) {
        const formattedError = formatAuthError(error)
        throw new Error(formattedError.message)
    }
}

export async function signup({ email, password }: { email: string, password: string }) {
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

        const supabase = await createClient()

        const { error } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
        })

        if (error) {
            const formattedError = formatAuthError(error)
            throw new Error(formattedError.message)
        }
    } catch (error) {
        const formattedError = formatAuthError(error)
        throw new Error(formattedError.message)
    }
}