import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";


export async function GET() {
    const supabase = await createClient()
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const {data, error} = await supabase.from('gmail_accounts')
                .select('gmail_address')
                .eq('user_id', user?.id)
                .order('created_at', {ascending: false})
                .select('gmail_address')
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
                throw error;
            }

            return NextResponse.json({ gmail_address: data?.gmail_address || null });

        } catch (error) {
            console.error('Error fetching user data:', error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
}