import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface LoginSecurityEvent {
    timestamp: string;
    email: string;
    ip: string;
    eventType: 'failed_attempt' | 'successful_login' | 'account_locked' | 'captcha_required';
    userAgent?: string;
    reason?: string;
}

/**
 * Log security events for audit trail and suspicious activity detection
 */
export async function logLoginSecurityEvent(event: LoginSecurityEvent): Promise<void> {
    try {
        const eventKey = `security_event:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
        
        // Store event in Redis with 30-day expiration
        await redis.setex(eventKey, 30 * 24 * 60 * 60, JSON.stringify(event));

        // Also maintain a per-user event list for quick lookups
        const userEventKey = `user_security_events:${event.email.toLowerCase()}`;
        const eventList = JSON.stringify(event);
        
        // Keep last 100 events per user, each stored for 7 days
        await redis.lpush(userEventKey, eventList);
        await redis.ltrim(userEventKey, 0, 99);
        await redis.expire(userEventKey, 7 * 24 * 60 * 60);

        // Track failed attempts by IP for early detection
        if (event.eventType === 'failed_attempt') {
            const ipFailureKey = `ip_failures:${event.ip}`;
            await redis.incr(ipFailureKey);
            await redis.expire(ipFailureKey, 60 * 60); // 1 hour
        }

        console.log(`📊 Security event logged: ${event.eventType} for ${event.email}`);
    } catch (error) {
        console.error('Error logging security event:', error);
    }
}

/**
 * Detect suspicious login patterns
 */
export async function checkSuspiciousActivity(email: string, _ip: string): Promise<{
    isSuspicious: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    reason?: string;
}> {
    try {
        const userEventKey = `user_security_events:${email.toLowerCase()}`;
        const events = await redis.lrange(userEventKey, 0, 10);

        if (!events || events.length === 0) {
            return { isSuspicious: false, riskLevel: 'low' };
        }

        // Parse events
        const parsedEvents: LoginSecurityEvent[] = events
            .map(e => {
                try {
                    return JSON.parse(e as string);
                } catch {
                    return null;
                }
            })
            .filter((e): e is LoginSecurityEvent => e !== null);

        // Check for multiple IPs in short time
        const recentIPs = new Set(parsedEvents.map(e => e.ip));
        if (recentIPs.size > 3) {
            return {
                isSuspicious: true,
                riskLevel: 'high',
                reason: 'Multiple login attempts from different IPs detected',
            };
        }

        // Check for rapid failed attempts
        const recentFailures = parsedEvents
            .filter(e => e.eventType === 'failed_attempt')
            .slice(0, 5);

        if (recentFailures.length >= 3) {
            return {
                isSuspicious: true,
                riskLevel: 'high',
                reason: 'Multiple failed login attempts detected',
            };
        }

        return { isSuspicious: false, riskLevel: 'low' };
    } catch (error) {
        console.error('Error checking suspicious activity:', error);
        return { isSuspicious: false, riskLevel: 'low' };
    }
}

/**
 * Get security event history for a user (admin function)
 */
export async function getSecurityEventHistory(email: string, limit: number = 50): Promise<LoginSecurityEvent[]> {
    try {
        const userEventKey = `user_security_events:${email.toLowerCase()}`;
        const events = await redis.lrange(userEventKey, 0, limit - 1);

        if (!events) {
            return [];
        }

        return events
            .map(e => {
                try {
                    return JSON.parse(e as string) as LoginSecurityEvent;
                } catch {
                    return null;
                }
            })
            .filter((e): e is LoginSecurityEvent => e !== null);
    } catch (error) {
        console.error('Error getting security event history:', error);
        return [];
    }
}
