import { NextRequest, NextResponse } from "next/server";

// HIBP API base + key
const HIBP_API_BASE = "https://haveibeenpwned.com/api/v3";
const HIBP_API_KEY = process.env.HIBP_API_KEY;

// --------- helpers ----------

function normalizeDomain(input: string): string | null {
    if (!input) return null;

    let x = input.trim().toLowerCase();

    // If it's an email → extract domain
    if (x.includes("@")) {
        x = x.split("@")[1];
    }

    // Remove scheme and www
    x = x.replace(/^https?:\/\//, "").replace(/^www\./, "");

    // Cut off path
    x = x.split("/")[0];

    // If it’s like announce.airtimetools.com → airtimetools.com
    const parts = x.split(".");
    if (parts.length > 2) {
        x = parts.slice(parts.length - 2).join(".");
    }

    return x || null;
}

function isEmail(input: string): boolean {
    return /\S+@\S+\.\S+/.test(input);
}

// --------- main handler ----------

export async function POST(req: NextRequest) {
    try {
        if (!HIBP_API_KEY) {
            console.error("Missing HIBP_API_KEY env");
            return NextResponse.json(
                { error: "Server not configured for HIBP" },
                { status: 500 }
            );
        }

        const body = await req.json().catch(() => null);

        if (!body || !body.query) {
            return NextResponse.json(
                { error: "Missing 'query' in request body" },
                { status: 400 }
            );
        }

        const query = String(body.query).trim();
        const isAccount = isEmail(query);

        if (isAccount) {
            // ===============================
            // Email / account breach check
            // ===============================
            const account = query;

            const url = `${HIBP_API_BASE}/breachedaccount/${encodeURIComponent(
                account
            )}?truncateResponse=false`;

            const res = await fetch(url, {
                headers: {
                    "hibp-api-key": HIBP_API_KEY,
                    "User-Agent": "GhostSweep/1.0",
                },
            });

            if (res.status === 404) {
                // No breaches found (HIBP returns 404 for none)
                return NextResponse.json(
                    {
                        type: "account",
                        query: account,
                        found: false,
                        breaches: [],
                    },
                    { status: 200 }
                );
            }

            if (!res.ok) {
                const text = await res.text();
                console.error("HIBP account error:", res.status, text);
                return NextResponse.json(
                    { error: "Failed to check account breaches" },
                    { status: 502 }
                );
            }

            const breaches = await res.json();

            return NextResponse.json(
                {
                    type: "account",
                    query: account,
                    found: Array.isArray(breaches) && breaches.length > 0,
                    breaches,
                },
                { status: 200 }
            );
        } else {
            // ===============================
            // Domain breach check
            // ===============================
            const domain = normalizeDomain(query);

            if (!domain) {
                return NextResponse.json(
                    { error: "Invalid email or domain" },
                    { status: 400 }
                );
            }

            const url = `${HIBP_API_BASE}/breaches?domain=${encodeURIComponent(
                domain
            )}`;

            const res = await fetch(url, {
                headers: {
                    "hibp-api-key": HIBP_API_KEY,
                    "User-Agent": "GhostSweep/1.0",
                },
            });

            if (res.status === 404) {
                return NextResponse.json(
                    {
                        type: "domain",
                        query,
                        normalized: domain,
                        found: false,
                        breaches: [],
                    },
                    { status: 200 }
                );
            }

            if (!res.ok) {
                const text = await res.text();
                console.error("HIBP domain error:", res.status, text);
                return NextResponse.json(
                    { error: "Failed to check domain breaches" },
                    { status: 502 }
                );
            }

            const breaches = await res.json();

            return NextResponse.json(
                {
                    type: "domain",
                    query,
                    normalized: domain,
                    found: Array.isArray(breaches) && breaches.length > 0,
                    breaches,
                },
                { status: 200 }
            );
        }
    } catch (err) {
        console.error("breach-check fatal:", err);
        return NextResponse.json(
            { error: "Internal Server Error", details: String(err) },
            { status: 500 }
        );
    }
}