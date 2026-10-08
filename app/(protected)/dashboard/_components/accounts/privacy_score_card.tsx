interface PrivacyScoreCardProps {
    privacyScore: number;
}

export default function PrivacyScoreCard({
    privacyScore,
}: PrivacyScoreCardProps) {
    const getScoreColor = (score: number) => {
        if (score < 50) return "text-red-600 dark:text-red-400";
        if (score < 75) return "text-amber-700 dark:text-amber-400";
        return "text-emerald-600 dark:text-emerald-400";
    };

    return (
        <div className="rounded-lg border border-foreground/5 bg-foreground/2 p-6 hover:bg-foreground/3">
            <div className="space-y-3">
                <span className="text-[11px] font-medium uppercase tracking-widest text-foreground/40">Privacy Score</span>
                <div className={`text-4xl font-light tracking-tight ${getScoreColor(privacyScore)}`}>
                    {privacyScore}/100
                </div>
            </div>
        </div>
    );
}