// app/api/services/[id]/deletion-playbook/route.ts
import { ServiceDeletionPlaybook } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: serviceId } = await params;

        if (!serviceId) {
            return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
        }

        const supabase = await createClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1) Check for existing playbook
        const { data: playbook, error: playbookError } = await supabase
            .from("service_deletion_playbooks")
            .select("*")
            .eq("service_id", serviceId)
            .maybeSingle<ServiceDeletionPlaybook>();

        if (playbookError && playbookError.code !== "PGRST116") {
            console.error("Error fetching playbook:", playbookError);
            return NextResponse.json({ error: "Failed to fetch playbook" }, { status: 500 });
        }

        return NextResponse.json({ playbook }, { status: 200 });

    } catch (error) {
        console.error("Failed to get deletion playbook:", error);
        return NextResponse.json(
            { error: "Failed to generate deletion playbook" },
            { status: 500 }
        );
    }
}
