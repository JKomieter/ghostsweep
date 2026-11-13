"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

/** "https://www.Netflix.com/path" → "www.netflix.com" */
function toHostname(domain?: string | null): string | null {
    if (!domain) return null
    const host = domain.trim().toLowerCase().replace(/^[a-z]+:\/\//, "").split(/[/?#:]/)[0]
    return host.includes(".") ? host : null
}

function logoSources(src?: string | null, domain?: string | null): string[] {
    const sources: string[] = []
    // Stored logo.dev URLs would put the key in the page; those go through our proxy instead
    if (src && !src.includes("img.logo.dev")) sources.push(src)
    const host = toHostname(domain)
    if (host) sources.push(`/api/logo/${encodeURIComponent(host)}`)
    return sources
}

/**
 * Company logo that shows a shimmer while loading, falls back from the stored logo to logo.dev
 * (via /api/logo), and finally to the name's initials. Fills its parent, so size the parent.
 */
export default function ServiceLogo({
    src,
    domain,
    name,
    initials = 1,
    className,
    fallbackClassName,
}: {
    src?: string | null
    domain?: string | null
    name?: string | null
    initials?: number
    className?: string
    fallbackClassName?: string
}) {
    const sources = logoSources(src, domain)
    const sourcesKey = sources.join("|")

    const [state, setState] = useState({ key: sourcesKey, index: 0, loaded: false })
    // Rows get reused with different data (sorting, filtering): start over when the sources change
    if (state.key !== sourcesKey) {
        setState({ key: sourcesKey, index: 0, loaded: false })
    }

    const imgRef = useRef<HTMLImageElement>(null)
    const current = sources[state.index]

    const handleError = () => setState((s) => ({ ...s, index: s.index + 1, loaded: false }))
    const handleLoad = () => setState((s) => ({ ...s, loaded: true }))

    // An image can finish loading before React hydrates and attaches onLoad/onError
    useEffect(() => {
        const img = imgRef.current
        if (!img || !img.complete) return
        if (img.naturalWidth > 0) handleLoad()
        else handleError()
    }, [current])

    if (!current) {
        const label = (name || toHostname(domain) || "?").slice(0, initials).toUpperCase()
        return (
            <span className={cn("text-xs font-bold text-foreground/50", fallbackClassName)} aria-label={name ?? undefined}>
                {label}
            </span>
        )
    }

    return (
        <span className={cn("relative flex h-full w-full items-center justify-center", className)}>
            {!state.loaded && <Skeleton className="absolute inset-0 rounded-[inherit]" />}
            {/* eslint-disable-next-line @next/next/no-img-element -- any host, with our own fallback chain */}
            <img
                ref={imgRef}
                key={current}
                src={current}
                alt={name ?? ""}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onLoad={handleLoad}
                onError={handleError}
                className={cn("h-full w-full object-contain transition-opacity", state.loaded ? "opacity-100" : "opacity-0")}
            />
        </span>
    )
}
