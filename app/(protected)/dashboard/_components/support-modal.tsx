"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { HelpCircle, Mail, Bug } from "lucide-react"
import Link from "next/link"

type SupportModalProps = {
    open: boolean
    onOpenChangeAction: React.Dispatch<React.SetStateAction<boolean>>
}

export function SupportModal({ open, onOpenChangeAction }: SupportModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChangeAction}>
            {/* Hidden trigger so you can control it from parent */}
            <DialogTrigger className="hidden">Support</DialogTrigger>

            <DialogContent className="max-w-md border border-foreground/10 bg-background">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold">
                        Support & Help
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Find answers, contact support, or let us know if something doesn&apos;t look right.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-3 space-y-3 text-sm">
                    {/* Help Center */}
                    <Link href="/help" onClick={() => onOpenChangeAction(false)}>
                        <div className="group flex items-start gap-3 rounded-lg border border-foreground/10 bg-background/40 px-3 py-3 hover:border-primary/60 hover:bg-foreground/5 transition">
                            <div className="mt-0.5 rounded-full bg-primary/10 p-1.5">
                                <HelpCircle className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium">Help Center</p>
                                <p className="text-[11px] text-muted-foreground">
                                    Browse common questions, troubleshooting steps, and guides on using GhostSweep.
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Contact Support */}
                    <a
                        href="mailto:support@ghostsweep.com?subject=GhostSweep%20Support"
                        onClick={() => onOpenChangeAction(false)}
                    >
                        <div className="group flex items-start gap-3 rounded-lg border border-foreground/10 bg-background/40 px-3 py-3 hover:border-primary/60 hover:bg-foreground/5 transition">
                            <div className="mt-0.5 rounded-full bg-primary/10 p-1.5">
                                <Mail className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium">Contact Support</p>
                                <p className="text-[11px] text-muted-foreground">
                                    Email our support team if you&apos;re stuck or something doesn&apos;t behave as expected.
                                </p>
                                <p className="text-[11px] text-primary/80">
                                    support@ghostsweep.com
                                </p>
                            </div>
                        </div>
                    </a>

                    {/* Report an Issue */}
                    <Link href="/support/report" onClick={() => onOpenChangeAction(false)}>
                        <div className="group flex items-start gap-3 rounded-lg border border-foreground/10 bg-background/40 px-3 py-3 hover:border-primary/60 hover:bg-foreground/5 transition">
                            <div className="mt-0.5 rounded-full bg-red-500/10 p-1.5">
                                <Bug className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium">Report an issue</p>
                                <p className="text-[11px] text-muted-foreground">
                                    Found a bug, security concern, or something that feels off? Send us a quick report.
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>

                <Separator className="my-3 border-foreground/10" />

                <div className="flex items-center justify-between">
                    <p className="text-[11px] text-muted-foreground">
                        We aim to respond to support requests as quickly as possible.
                    </p>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-[11px]"
                        onClick={() => onOpenChangeAction(false)}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}