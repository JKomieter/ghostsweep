import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { revokeGoogleTokens } from "@/utils/google_revoke";

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createClient();
    
        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();
    
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    
        // get the account ID from the body
        const { accountId } = await request.json();
    
        if (!accountId) {
            return NextResponse.json({ error: "Account ID required" }, { status: 400 });
        }
    
        // Get the email address for notification and the tokens to revoke before deleting
        const { data: account } = await supabase
            .from("gmail_accounts")
            .select("gmail_address, refresh_token_encrypted, access_token_encrypted")
            .eq("id", accountId)
            .eq("user_id", user.id)
            .single();

        const email = account?.gmail_address;

        // Revoke GhostSweep's access at Google, not just our stored copy of the tokens
        if (account) {
            await revokeGoogleTokens(account);
        }
    
        // Delete Gmail account
        const { error } = await supabase
            .from("gmail_accounts")
            .delete()
            .eq("id", accountId)
            .eq("user_id", user.id);
            
        if (error) {
            console.error("Error deleting Gmail account:", error);
            return NextResponse.json(
                { error: "Could not disconnect Gmail account" },
                { status: 500 }
            );
        }

        const { error: notifyError } = await supabase
            .from("user_notifications")
            .insert({
              user_id: user.id,
              type: "gmail_disconnected",
              title: "Gmail Disconnected",
              message: `Your Gmail account (${email}) has been disconnected successfully.`,
            });

        if (notifyError) {
            console.error("Error creating notification:", notifyError);
        }

        return NextResponse.json({ success: true, email });
    } catch (error) {
        console.error("Error deleting Gmail account:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}