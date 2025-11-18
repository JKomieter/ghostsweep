import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
    
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    
        // check if user subscriptions exist
        const { data, error } = await supabase
            .from('user_subscriptions')
            .select('current_plan')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false })
            .single();
    
        if (error) {
            console.error('Error fetching user subscription:', error);
            throw error;
        }
    
        if (!data) {
            return NextResponse.json({ error: 'No subscription data found' }, { status: 404 });
        }
        return NextResponse.json({ current_plan: data.current_plan });
    } catch (error) {
        console.error('Error fetching user data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}