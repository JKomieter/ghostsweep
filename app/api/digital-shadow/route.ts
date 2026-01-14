// app/api/user/digital-shadow/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type Confidence = "confirmed" | "likely" | "possible";

type BrokerType = "ad_network" | "broker" | "government" | "other";

type UserServiceRow = {
    service_id: string;
    service: {
        id: string;
        name: string | null;
        domain: string | null;
        category: string | null;
    } | null;
};

type BrokerLinkRow = {
    service_id: string;
    confidence: Confidence;
    source: string | null;
    data_broker: {
        id: string;
        name: string;
        type: BrokerType;
        description: string | null;
        removal_url: string | null;
        contact_email: string | null;
        category: string | null;
    } | null;
};

type BrokerOut = {
    id: string;
    name: string;
    type: BrokerType;
    description: string | null;
    removal_url: string | null;
    contact_email: string | null;
    category: string | null;
    serviceCount: number;
    services: Array<{
        id: string;
        name?: string | null;
        domain?: string | null;
        category?: string | null;
        confidence: Confidence;
        source: string | null;
    }>;
    highestConfidence: Confidence;
};

export async function GET() {
    const supabase = await createClient();

    // 1) Auth
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // 2) Check Pro
    const { data: sub, error: subError } = await supabase
        .from("user_subscriptions")
        .select("current_plan")
        .eq("user_id", userId)
        .maybeSingle();

    if (subError) {
        return NextResponse.json(
            { error: "Failed to check subscription" },
            { status: 500 }
        );
    }

    const isPro = (sub?.current_plan ?? "free") !== "free";

    // 3) Get user's services
    const { data: userServices, error: servicesError } = await supabase
        .from("user_services")
        .select(
            `
      service_id,
      service:services (
        id,
        name,
        domain,
        category
      )
    `
        )
        .eq("user_id", userId);

    if (servicesError) {
        return NextResponse.json(
            { error: "Failed to fetch services" },
            { status: 500 }
        );
    }

    const services = (userServices ?? []) as unknown as UserServiceRow[];

    if (services.length === 0) {
        return NextResponse.json({
            message: "No services found. Scan your email first.",
            brokers: [],
            stats: null,
            isPro,
        });
    }

    const serviceIds = services.map((s) => s.service_id);

    // Build quick lookup to avoid repeated .find()
    const serviceById = new Map<string, UserServiceRow>();
    for (const s of services) serviceById.set(s.service_id, s);

    // 4) Get broker links for those services
    const { data: brokerLinks, error: linksError } = await supabase
        .from("service_data_broker_links")
        .select(
            `
      service_id,
      confidence,
      source,
      data_broker:data_brokers (
        id,
        name,
        type,
        description,
        removal_url,
        contact_email,
        category
      )
    `
        )
        .in("service_id", serviceIds);

    if (linksError) {
        return NextResponse.json(
            { error: "Failed to fetch broker links" },
            { status: 500 }
        );
    }

    const links = (brokerLinks ?? []) as unknown as BrokerLinkRow[];

    if (links.length === 0) {
        return NextResponse.json({
            message: "No data brokers found for your services.",
            brokers: [],
            stats: null,
            isPro,
        });
    }

    // 5) Group by broker
    const brokerMap = new Map<string, BrokerOut>();

    const confidenceRank: Record<Confidence, number> = {
        confirmed: 3,
        likely: 2,
        possible: 1,
    };

    for (const link of links) {
        const dataBroker = link.data_broker;
        if (!dataBroker) continue;

        const brokerId = dataBroker.id;

        if (!brokerMap.has(brokerId)) {
            brokerMap.set(brokerId, {
                id: dataBroker.id,
                name: dataBroker.name,
                type: dataBroker.type ?? "other",
                description: dataBroker.description ?? null,
                removal_url: dataBroker.removal_url ?? null,
                contact_email: dataBroker.contact_email ?? null,
                category: dataBroker.category ?? null,
                serviceCount: 0,
                services: [],
                highestConfidence: link.confidence,
            });
        }

        const broker = brokerMap.get(brokerId)!;
        broker.serviceCount += 1;

        const serviceRow = serviceById.get(link.service_id);
        broker.services.push({
            id: link.service_id,
            name: serviceRow?.service?.name ?? null,
            domain: serviceRow?.service?.domain ?? null,
            category: serviceRow?.service?.category ?? null,
            confidence: link.confidence,
            source: link.source ?? null,
        });

        // Update highest confidence
        if (confidenceRank[link.confidence] > confidenceRank[broker.highestConfidence]) {
            broker.highestConfidence = link.confidence;
        }
    }

    const allBrokers = Array.from(brokerMap.values()).sort(
        (a, b) => b.serviceCount - a.serviceCount
    );

    // 6) Stats
    const stats = {
        totalServices: serviceIds.length,
        totalBrokers: allBrokers.length,
        totalLinks: links.length,

        byType: {
            ad_network: allBrokers.filter((b) => b.type === "ad_network").length,
            broker: allBrokers.filter((b) => b.type === "broker").length,
            government: allBrokers.filter((b) => b.type === "government").length,
            other: allBrokers.filter((b) => b.type === "other").length,
        },

        byConfidence: {
            confirmed: allBrokers.filter((b) => b.highestConfidence === "confirmed").length,
            likely: allBrokers.filter((b) => b.highestConfidence === "likely").length,
            possible: allBrokers.filter((b) => b.highestConfidence === "possible").length,
        },

        byCategory: allBrokers.reduce((acc, broker) => {
            const cat = broker.category || "Other";
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),

        topBrokers: allBrokers.slice(0, 10),
        riskScore: calculateRiskScore(allBrokers),
    };

    // 7) Free preview gating
    if (!isPro) {
        const previewTop = allBrokers.slice(0, 3);
        return NextResponse.json({
            preview: true,
            isPro: false,
            stats: {
                totalServices: stats.totalServices,
                totalBrokers: stats.totalBrokers,
                totalLinks: stats.totalLinks,
                byType: stats.byType,
                riskScore: stats.riskScore,
            },
            topBrokers: previewTop.map((b) => ({
                name: b.name,
                type: b.type,
                serviceCount: b.serviceCount,
                highestConfidence: b.highestConfidence,
            })),
            lockedCount: Math.max(0, allBrokers.length - previewTop.length),
            upgradeMessage: "Upgrade to Pro to see all data brokers and opt-out",
        });
    }

    // Get user's opt-out requests
    const { data: optOutRequests } = await supabase
        .from("opt_out_requests")
        .select("broker_id, status, method, updated_at, notes")
        .eq("user_id", userId);

    // Create map for quick lookup
    const optOutMap = new Map(
        optOutRequests?.map((r) => [r.broker_id, r]) || []
    );

    // Add opt-out status to each broker
    const brokersWithStatus = allBrokers.map((broker) => ({
        ...broker,
        optOutRequest: optOutMap.get(broker.id) || null,
    }));

    // 8) Pro full response
    return NextResponse.json({
        preview: false,
        isPro: true,
        brokers: brokersWithStatus,
        stats,
    });
}

function calculateRiskScore(brokers: Array<{ type: string; highestConfidence: string; serviceCount: number }>): number {
    let score = 0;

    const typeWeight: Record<string, number> = {
        government: 10,
        broker: 5,
        ad_network: 3,
        other: 1,
    };

    const confidenceWeight: Record<string, number> = {
        confirmed: 3,
        likely: 2,
        possible: 1,
    };

    for (const b of brokers) {
        const tw = typeWeight[b.type] ?? 1;
        const cw = confidenceWeight[b.highestConfidence] ?? 1;
        score += tw * cw * (b.serviceCount ?? 0);
    }

    // Normalize to 0–100 (rough)
    const maxPossible = Math.max(brokers.length * 10 * 3 * 10, 1);
    return Math.min(Math.round((score / maxPossible) * 100), 100);
}