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
                .select('id, gmail_address, created_at')
                .eq('user_id', user?.id)
                .order('created_at', {ascending: false})

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching Gmail account:', error);
                return NextResponse.json({ accounts: [] });
            }

            return NextResponse.json({ 
                accounts: data || []
             });

        } catch (error) {
            console.error('Error fetching user data:', error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
}