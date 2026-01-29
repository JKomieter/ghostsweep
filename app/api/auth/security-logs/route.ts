import { NextRequest, NextResponse } from 'next/server';
import { getSecurityEventHistory } from '@/utils/security-logging';

/**
 * Admin API endpoint to view security event logs
 * GET /api/auth/security-logs?email=user@example.com
 * 
 * Required headers:
 * - Authorization: Bearer <admin-token>
 */
export async function GET(request: NextRequest) {
    try {
        // Verify admin access
        const authHeader = request.headers.get('authorization');
        const adminToken = process.env.ADMIN_API_TOKEN;

        if (!adminToken || !authHeader || authHeader !== `Bearer ${adminToken}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const email = request.nextUrl.searchParams.get('email');
        
        if (!email) {
            return NextResponse.json(
                { error: 'Email parameter is required' },
                { status: 400 }
            );
        }

        const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50', 10);
        const events = await getSecurityEventHistory(email, Math.min(limit, 500));

        return NextResponse.json({
            email,
            eventCount: events.length,
            events,
        });
    } catch (error) {
        console.error('Error in security-logs endpoint:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
