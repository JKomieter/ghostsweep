import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

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

        // Get the email address for notification before deleting
        const { data: account } = await supabase
            .from("microsoft_accounts")
            .select("outlook_address")
            .eq("id", accountId)
            .eq("user_id", user.id)
            .single();

        const email = account?.outlook_address;

        // Delete Microsoft account
        const { error } = await supabase
            .from("microsoft_accounts")
            .delete()
            .eq("id", accountId)
            .eq("user_id", user.id);
            
        if (error) {
            console.error("Error deleting Microsoft account:", error);
            return NextResponse.json(
                { error: "Could not disconnect Microsoft account" },
                { status: 500 }
            );
        }

        const { error: notifyError } = await supabase
            .from("user_notifications")
            .insert({
              user_id: user.id,
              type: "microsoft_disconnected",
              title: "Microsoft Account Disconnected",
              message: `Your Microsoft account (${email}) has been disconnected successfully.`,
            });

        if (notifyError) {
            console.error("Error creating notification:", notifyError);
        }

        return NextResponse.json({ success: true, email });
    } catch (error) {
        console.error("Error deleting Microsoft account:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
