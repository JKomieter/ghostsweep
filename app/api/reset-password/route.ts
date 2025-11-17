import { createClient } from "@/utils/supabase/server";


export async function POST(request: Request) {
    const supabase = await createClient();
    const { email } = await request.json();
    if (!email) {
        return Response.json({ error: "Email is required" }, { status: 400 });
    }

    try {
        // Generate a password reset link using Supabase and email it to the user
        const { data, error } = await supabase.auth.resetPasswordForEmail(
            email,
            {
                redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
            }
        );
        if (error) {
            return Response.json({ error: error.message }, { status: 400 });
        }

        return Response.json(data);
    } catch (error) {
        return Response.json({ error });
    }
}