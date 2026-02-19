import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
    unlockAccount,
    getAccountLockoutStatus,
} from '@/utils/login-rate-limit';

/**
 * Admin API endpoint to manage account lockouts
 * POST /api/auth/manage-lockout - unlock or check status
 * 
 * Required headers:
 * - Authorization: Bearer <admin-token>
 * 
 * Body:
 * {
 *   "action": "unlock" | "status",
 *   "email": "user@example.com"
 * }
 */
export async function POST(request: NextRequest) {
    try {
        // Verify admin access
        const authHeader = request.headers.get('authorization');
        const adminToken = process.env.ADMIN_API_TOKEN;

        if (!adminToken || !authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const provided = Buffer.from(authHeader);
        const expected = Buffer.from(`Bearer ${adminToken}`);
        const tokenValid =
            provided.length === expected.length &&
            crypto.timingSafeEqual(provided, expected);
        if (!tokenValid) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { action, email } = body;

        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        if (action === 'unlock') {
            await unlockAccount(email);
            return NextResponse.json({
                success: true,
                message: `Account ${email} has been unlocked`,
            });
        }

        if (action === 'status') {
            const status = await getAccountLockoutStatus(email);
            return NextResponse.json({
                email,
                ...status,
            });
        }

        return NextResponse.json(
            { error: 'Invalid action. Use "unlock" or "status"' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error in manage-lockout endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
