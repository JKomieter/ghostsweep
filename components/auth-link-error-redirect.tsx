"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { linkErrorPath } from "@/utils/auth-link-error"

// Supabase puts implicit-flow email link errors in the URL hash, which never reaches the server,
// so this catches them on whatever page the user lands on and shows the "link expired" page instead.
export default function AuthLinkErrorRedirect() {
    const router = useRouter()

    useEffect(() => {
        const hash = window.location.hash.replace(/^#/, "")
        if (!hash.includes("error")) return

        const path = linkErrorPath(new URLSearchParams(hash))
        if (path) router.replace(path)
    }, [router])

    return null
}
