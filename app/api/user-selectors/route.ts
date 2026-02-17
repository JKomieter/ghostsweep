import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { selector_value, selector_type } = body;

    if (!selector_value || typeof selector_value !== "string") {
      return NextResponse.json(
        { error: "selector_value is required" },
        { status: 400 }
      );
    }

    // Determine type if not provided
    const detectType = (val: string): string => {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return "email";
      if (/^\+?[\d\s\-().]{7,}$/.test(val.trim())) return "phone";
      return "username";
    };
    const type = selector_type || detectType(selector_value);

    const { data, error } = await supabase
      .from("user_selectors")
      .insert({
        user_id: user.id,
        selector_value: selector_value.trim().toLowerCase(),
        selector_type: type,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This selector has already been added" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ selector: data });
  } catch (error) {
    console.error("Add selector error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const selectorId = searchParams.get("id");

    if (!selectorId) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("user_selectors")
      .delete()
      .eq("id", parseInt(selectorId))
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete selector error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
