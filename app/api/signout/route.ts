import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    // Check if a user's logged in
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) {
        // "global" revokes every refresh token for this user on all devices (server-side, in Supabase Auth)
        // and clears the session cookies on this response
        const { error } = await supabase.auth.signOut({ scope: "global" });
        if (error) {
            console.error("Sign out failed:", error.message);
        }
    }

    revalidatePath("/", "layout");
    return NextResponse.redirect(new URL("/login", req.url), {
        status: 302,
    });
}