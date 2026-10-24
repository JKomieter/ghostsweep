import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { clampCount } from "@/lib/share";

// 1200×630 social card for /share links. Shows only a count, never anything identifying.
export async function GET(req: NextRequest) {
    const n = clampCount(req.nextUrl.searchParams.get("n"));

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "72px 80px",
                    background: "linear-gradient(135deg, #04140f 0%, #0b2a20 55%, #0f3d2e 100%)",
                    color: "#ffffff",
                    fontFamily: "sans-serif",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, color: "#6ee7b7", fontWeight: 600 }}>
                    👻 GhostSweep
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: 44, color: "#a7f3d0" }}>I had</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 28 }}>
                        <span style={{ fontSize: 200, fontWeight: 800, lineHeight: 1, color: "#34d399" }}>
                            {n.toLocaleString("en-US")}
                        </span>
                        <span style={{ fontSize: 64, fontWeight: 700 }}>ghost account{n === 1 ? "" : "s"} 👻</span>
                    </div>
                    <div style={{ marginTop: 24, fontSize: 34, color: "#d1fae5" }}>
                        Old sign-ups still holding my data.
                    </div>
                </div>
                <div style={{ display: "flex", fontSize: 30, color: "#6ee7b7" }}>Find yours free at ghostsweep.com</div>
            </div>
        ),
        { width: 1200, height: 630, emoji: "twemoji" }
    );
}
