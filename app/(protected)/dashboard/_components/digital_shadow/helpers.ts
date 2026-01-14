import React from "react";
import { Confidence } from "../../digital_shadow/page";


// -------------------- Helpers --------------------
function useIsMobile(breakpoint = 900) {
    const [isMobile, setIsMobile] = React.useState(false);
    React.useEffect(() => {
        const mq = window.matchMedia(`(max-width:${breakpoint}px)`);
        const onChange = () => setIsMobile(mq.matches);
        onChange();
        mq.addEventListener?.("change", onChange);
        return () => mq.removeEventListener?.("change", onChange);
    }, [breakpoint]);
    return isMobile;
}

function confidenceColor(c: Confidence) {
    if (c === "confirmed") return "#22c55e"; // emerald-500
    if (c === "likely") return "#f59e0b"; // amber-500
    return "#94a3b8"; // slate-400
}

function confidenceLabel(c: Confidence) {
    if (c === "confirmed") return "Confirmed";
    if (c === "likely") return "Likely";
    return "Possible";
}

function getRiskLevel(score: number): { level: string; color: string; bgColor: string } {
    if (score >= 75) return { level: "Critical", color: "text-red-500", bgColor: "bg-red-500/10" };
    if (score >= 50) return { level: "High", color: "text-orange-500", bgColor: "bg-orange-500/10" };
    if (score >= 25) return { level: "Medium", color: "text-yellow-500", bgColor: "bg-yellow-500/10" };
    return { level: "Low", color: "text-emerald-500", bgColor: "bg-emerald-500/10" };
}

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

export { useIsMobile, confidenceColor, confidenceLabel, getRiskLevel, clamp };