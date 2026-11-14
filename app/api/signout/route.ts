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
        // Default "global" revokes every refresh token for this user on all devices (server-side,
        // in Supabase Auth) and clears the session cookies on this response.
        // "?scope=local" ends only this session: used when asking the user to sign in again
        // before a sensitive change, without logging them out of their other devices.
        const scope = req.nextUrl.searchParams.get("scope") === "local" ? "local" : "global";
        const { error } = await supabase.auth.signOut({ scope });
        if (error) {
            console.error("Sign out failed:", error.message);
        }
    }

    revalidatePath("/", "layout");
    const res = NextResponse.redirect(new URL("/login", req.url), {
        status: 302,
    });
    // Browser-enforced cleanup: wipe localStorage, sessionStorage and IndexedDB for this site.
    // ("cache" is omitted: authenticated pages are already no-store, and it can stall Chrome.)
    res.headers.set("Clear-Site-Data", '"storage"');
    return res;
}