import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CircleCheck, ExternalLink, Lock } from "lucide-react";
import { toast } from "sonner";

interface SummaryTabProps {
    lastSeen: string
    firstSeen: string
    emailCount: number
    breached: boolean,
    websiteUrl: string | null
    default_privacy_email: string | null | undefined
    current_plan: "free" | "pro"| undefined
    deleteMyDataAndAccount: () => void
    reduceMyData: () => void
}

export default function SummaryTab({
    lastSeen,
    firstSeen,
    emailCount,
    breached,
    websiteUrl,
    default_privacy_email,
    current_plan,
    deleteMyDataAndAccount,
    reduceMyData
}: SummaryTabProps) {
    return (
        <>
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/10 bg-black/40 p-3 text-sm">
                <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Last seen</div>
                    <div className="font-medium">{lastSeen}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">First seen</div>
                    <div className="font-medium">{firstSeen}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Emails detected</div>
                    <div className="font-medium">{emailCount}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="font-medium">
                        {breached ? "At risk" : "Low risk (so far)"}
                    </div>
                </div>
            </div>

            {/* Breach section (MVP simple) */}
            <div className="space-y-2">
                <h3 className="text-sm font-semibold">Breaches</h3>
                {breached ? (
                    <p className="text-xs leading-relaxed text-red-200/80 bg-red-500/5 border border-red-500/20 rounded-md p-3">
                        This service appears in at least one known data breach associated
                        with your email. Consider changing your password, enabling
                        two-factor authentication, and reviewing devices/sessions.
                    </p>
                ) : (
                    <p className="text-xs leading-relaxed text-muted-foreground bg-zinc-900/60 border border-zinc-800 rounded-md p-3">
                        No known breaches found for this service from our current breach
                        sources. This does not guarantee the service has never been
                        breached — just that we don’t have a matching record yet.
                    </p>
                )}
            </div>

            {/* What you can do */}
            <div className="space-y-2">
                <h3 className="text-sm font-semibold">Recommended next steps</h3>
                <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1.5">
                    <li>Use a unique, strong password for this account.</li>
                    <li>Enable two-factor authentication if available.</li>
                    <li>
                        Review recent activity and connected devices.
                    </li>
                    <li>
                        If you no longer use this service, look for{" "}
                        <span className="font-medium text-foreground">Delete account</span>{" "}
                        or <span className="font-medium text-foreground">Close my account</span>{" "}
                        in the settings.
                    </li>
                </ul>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col gap-2">
                {websiteUrl && (
                    <Button
                        asChild
                        size="sm"
                        className="justify-between bg-primary/10 text-primary border border-primary/40 hover:bg-primary/20"
                    >
                        <a href={websiteUrl} target="_blank" rel="noreferrer">
                            Open website
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                )}

                {default_privacy_email && (
                    <>
                        <Button
                            variant="outline"
                            size="sm"
                            className="justify-between border-white/20 bg-white/5"
                            onClick={() => {
                                navigator.clipboard
                                    .writeText(default_privacy_email || "")
                                    .then(() => {
                                        toast(() => (
                                            <div className="flex flex-row items-center gap-2">
                                                <CircleCheck color="green" /> Privacy email copied to clipboard
                                            </div>
                                        ));
                                    })
                                    .catch(() => { });
                            }}
                        >
                            Copy privacy email
                            <span className="text-xs text-muted-foreground">
                                {default_privacy_email}
                            </span>
                        </Button>
                    </>
                )}
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full">Send Privacy Request Email</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-w-sm min-w-72 w-full" align="start">
                    <DropdownMenuItem className="focus:bg-red-600/10 focus:text-red-400" onClick={deleteMyDataAndAccount}>
                        <div className="flex items-center justify-between w-full">
                            <span>Delete my data & account</span>
                            {current_plan !== "pro" && <Lock color="yellow" />}
                        </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="focus:bg-red-600/10 focus:text-red-400" onClick={reduceMyData}>
                        <div className="flex items-center justify-between w-full">
                            <span>Reduce my data usage</span>
                            {current_plan !== "pro" && <Lock color="yellow" />}
                        </div>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground border-t border-white/5 pt-4">
                GhostSweep analyses your email metadata (From, Subject, Date) to
                detect services linked to your inbox. We never read or store the
                bodies of your emails.
            </p>
        </div>
        </>
    )
}