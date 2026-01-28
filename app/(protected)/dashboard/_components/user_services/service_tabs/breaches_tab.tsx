"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UserBreach, Breach } from "@/types";
import { formatDate } from "@/utils/format_date";


export default function BreachesTab({ userBreaches }: {userBreaches: Array<UserBreach & {breach: Breach}> | null}) {
    if (!userBreaches || userBreaches?.length === 0) {
        return (
            <div className="text-sm text-white/60 py-6 text-center">
                No known breaches for this service.
            </div>
        );
    }

    return (
        <div className="space-y-4 pt-4">
            {userBreaches?.map((ub) => {
                const description = ub.breach?.description ?? null;

                return (
                    <Card
                        key={ub.id}
                        className="bg-white/2 border border-white/5 hover:border-white/10 transition-colors"
                    >
                        <CardContent className="p-5 space-y-4">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-light text-white">
                                    {ub.breach.domain || "Unknown Domain"}
                                </h3>

                                <div className="flex items-center gap-2">
                                    <div className={`h-1.5 w-1.5 rounded-full ${
                                        ub.breach.is_sensitive ? 'bg-red-500' : 'bg-amber-500'
                                    }`} />
                                    <span className={`text-xs ${
                                        ub.breach.is_sensitive ? 'text-red-400' : 'text-amber-400'
                                    }`}>
                                        {ub.breach.is_sensitive ? "Sensitive" : "Standard"}
                                    </span>
                                </div>
                            </div>

                            {/* Breach Date */}
                            <p className="text-sm text-white/60">
                                Breach Date:{" "}
                                <span className="text-white/80">
                                    {ub.breach.breach_date ? formatDate(ub.breach.breach_date) : "Unknown"}
                                </span>
                            </p>

                            {/* Data Classes */}
                            {ub.breach.data_classes && ub.breach.data_classes.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[11px] uppercase tracking-widest text-white/40">Exposed Data:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {ub.breach.data_classes.map((cls) => (
                                            <span
                                                key={cls}
                                                className="text-xs text-white/60"
                                            >
                                                {cls}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            {!!description && (
                                <div className="space-y-2">
                                    <p className="text-[11px] uppercase tracking-widest text-white/40">What happened:</p>
                                    <p className="text-xs text-white/60 max-h-28 overflow-y-auto pr-1">
                                        {String(description)}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="pt-3 border-t border-white/5">
                                <p className="text-xs text-white/40 mb-2">What you can do:</p>
                                <div className="flex gap-3">
                                    <button
                                        className="px-3 py-1.5 rounded-md bg-red-500/10 text-red-300 border border-red-500/20 text-xs hover:bg-red-500/20 transition"
                                    >
                                        Request Account Deletion
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}