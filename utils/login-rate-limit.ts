import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limiter for login attempts per IP: 10 attempts per 15 minutes
export const loginRateLimitByIP = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, '15 m'),
    analytics: false,
});

// Rate limiter for login attempts per email: 5 attempts per 15 minutes
export const loginRateLimitByEmail = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: false,
});

// Track failed login attempts for account lockout
const FAILED_ATTEMPTS_KEY = (email: string) => `failed_attempts:${email.toLowerCase()}`;
const ACCOUNT_LOCKED_KEY = (email: string) => `account_locked:${email.toLowerCase()}`;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const MAX_FAILED_ATTEMPTS = 5;
const CAPTCHA_THRESHOLD = 3; // Show CAPTCHA after 3 failed attempts

export interface LoginRateLimitResult {
    allowed: boolean;
    reason?: string;
    shouldShowCaptcha: boolean;
    remainingAttempts: number;
    resetTime?: string;
}

/**
 * Check if login attempt should be allowed
 * Enforces rate limiting and account lockout
 */
export async function checkLoginRateLimit(
    email: string,
    ip: string
): Promise<LoginRateLimitResult> {
    const normalizedEmail = email.toLowerCase();

    try {
        // Check if account is locked
        const isLocked = await redis.get(ACCOUNT_LOCKED_KEY(normalizedEmail));
        if (isLocked) {
            return {
                allowed: false,
                reason: 'Account temporarily locked due to too many failed login attempts. Please try again later.',
                shouldShowCaptcha: false,
                remainingAttempts: 0,
                resetTime: new Date(Date.now() + LOCKOUT_DURATION).toISOString(),
            };
        }

        // Check IP-based rate limit (10 per 15 minutes)
        const ipLimitResult = await loginRateLimitByIP.limit(ip);
        if (!ipLimitResult.success) {
            const retryAfterSeconds = Math.max(1, Math.ceil((ipLimitResult.reset - Date.now()) / 1000));
            return {
                allowed: false,
                reason: 'Too many login attempts from your IP. Please wait before trying again.',
                shouldShowCaptcha: false,
                remainingAttempts: Math.max(0, ipLimitResult.remaining),
                resetTime: new Date(ipLimitResult.reset).toISOString(),
            };
        }

        // Check email-based rate limit (5 per 15 minutes)
        const emailLimitResult = await loginRateLimitByEmail.limit(normalizedEmail);
        if (!emailLimitResult.success) {
            const retryAfterSeconds = Math.max(1, Math.ceil((emailLimitResult.reset - Date.now()) / 1000));
            return {
                allowed: false,
                reason: 'Too many login attempts for this account. Please wait before trying again.',
                shouldShowCaptcha: false,
                remainingAttempts: 0,
                resetTime: new Date(emailLimitResult.reset).toISOString(),
            };
        }

        // Get current failed attempts
        const failedAttemptsStr = await redis.get(FAILED_ATTEMPTS_KEY(normalizedEmail));
        const failedAttempts = failedAttemptsStr ? parseInt(failedAttemptsStr as string, 10) : 0;

        const shouldShowCaptcha = failedAttempts >= CAPTCHA_THRESHOLD;

        return {
            allowed: true,
            shouldShowCaptcha,
            remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - failedAttempts),
        };
    } catch (error) {
        console.error('Error checking login rate limit:', error);
        // Fail open - allow login if rate limit check fails
        return {
            allowed: true,
            shouldShowCaptcha: false,
            remainingAttempts: MAX_FAILED_ATTEMPTS,
        };
    }
}

/**
 * Record a failed login attempt
 * Tracks attempts and locks account if threshold exceeded
 */
export async function recordFailedLoginAttempt(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase();

    try {
        // Increment failed attempts counter
        const currentAttempts = await redis.incr(FAILED_ATTEMPTS_KEY(normalizedEmail));

        // Set expiry to 15 minutes if this is the first attempt
        if (currentAttempts === 1) {
            await redis.expire(FAILED_ATTEMPTS_KEY(normalizedEmail), 15 * 60);
        }

        // Lock account if max attempts reached
        if (currentAttempts >= MAX_FAILED_ATTEMPTS) {
            await redis.setex(ACCOUNT_LOCKED_KEY(normalizedEmail), LOCKOUT_DURATION / 1000, 'true');
            console.warn(`🔒 Account locked due to too many failed login attempts: ${normalizedEmail}`);
        } else {
            console.warn(`⚠️  Failed login attempt ${currentAttempts}/${MAX_FAILED_ATTEMPTS} for ${normalizedEmail}`);
        }
    } catch (error) {
        console.error('Error recording failed login attempt:', error);
    }
}

/**
 * Clear failed login attempts on successful login
 */
export async function clearFailedLoginAttempts(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase();

    try {
        await redis.del(FAILED_ATTEMPTS_KEY(normalizedEmail));
        console.log(`✅ Cleared failed attempts for ${normalizedEmail}`);
    } catch (error) {
        console.error('Error clearing failed login attempts:', error);
    }
}

/**
 * Manually unlock an account (admin function)
 */
export async function unlockAccount(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase();

    try {
        await redis.del(ACCOUNT_LOCKED_KEY(normalizedEmail));
        await redis.del(FAILED_ATTEMPTS_KEY(normalizedEmail));
        console.log(`🔓 Account unlocked: ${normalizedEmail}`);
    } catch (error) {
        console.error('Error unlocking account:', error);
    }
}

/**
 * Get current account lockout status
 */
export async function getAccountLockoutStatus(email: string): Promise<{
    isLocked: boolean;
    failedAttempts: number;
    lockoutExpiresAt?: string;
}> {
    const normalizedEmail = email.toLowerCase();

    try {
        const isLocked = await redis.get(ACCOUNT_LOCKED_KEY(normalizedEmail));
        const failedAttemptsStr = await redis.get(FAILED_ATTEMPTS_KEY(normalizedEmail));
        const failedAttempts = failedAttemptsStr ? parseInt(failedAttemptsStr as string, 10) : 0;

        const ttl = await redis.ttl(ACCOUNT_LOCKED_KEY(normalizedEmail));
        const lockoutExpiresAt = ttl > 0 ? new Date(Date.now() + ttl * 1000).toISOString() : undefined;

        return {
            isLocked: !!isLocked,
            failedAttempts,
            lockoutExpiresAt,
        };
    } catch (error) {
        console.error('Error getting account lockout status:', error);
        return {
            isLocked: false,
            failedAttempts: 0,
        };
    }
}
