import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";


export async function GET() {
    const supabase = await createClient();
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
    
        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
    const { data, error } = await supabase
        .from("news")
        .select("*")
        .single();

    if (error && error.code !== "PGRST116") {
        console.error("Error fetching news:", error);
        return NextResponse.json(
            { error: "Internal Server Error", code: "NEWS_FETCH_ERROR" },
            { status: 500 }
        );
    }

    return NextResponse.json({ news: data || {} });
}