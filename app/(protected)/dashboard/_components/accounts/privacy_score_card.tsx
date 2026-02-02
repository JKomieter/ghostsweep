interface PrivacyScoreCardProps {
    privacyScore: number;
    breachedCount: number;
    unusedCount: number;
    totalCount: number;
}

export default function PrivacyScoreCard({
    privacyScore,
    breachedCount,
    unusedCount,
}: PrivacyScoreCardProps) {
    const getScoreColor = (score: number) => {
        if (score < 50) return "text-red-400";
        if (score < 75) return "text-amber-400";
        return "text-emerald-400";
    };

    return (
        <div className="rounded-lg border border-white/5 bg-white/2 p-6 hover:bg-white/3">
            <div className="space-y-3">
                <span className="text-[11px] font-medium uppercase tracking-widest text-white/40">Privacy Score</span>
                <div className={`text-4xl font-light tracking-tight ${getScoreColor(privacyScore)}`}>
                    {privacyScore}/100
                </div>
            </div>
        </div>
    );
}