import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Microsoft account for user
    const { data, error } = await supabase
      .from('microsoft_accounts')
      .select('outlook_address')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching Microsoft account:', error);
      return NextResponse.json({ outlook_address: null });
    }

    return NextResponse.json({
      outlook_address: data?.outlook_address ?? null,
    });
  } catch (error) {
    console.error('Error in microsoft_account endpoint:', error);
    return NextResponse.json({ outlook_address: null });
  }
}
