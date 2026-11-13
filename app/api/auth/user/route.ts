import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Session cookies are HttpOnly, so the browser asks the server who is signed in.
// Returns only what the UI needs, never tokens.
export async function GET() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: { id: user.id, email: user.email ?? null } });
}
