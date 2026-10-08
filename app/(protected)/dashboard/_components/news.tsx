import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query"
import { ExternalLink } from "lucide-react";
import Image from "next/image";

interface NewsProps {
    id: string;
    title: string;
    link: string;
    description: string;
    created_at: string;
    image_url: string
}

export default function News() {
    const { data, status } = useQuery({
        queryKey: ['news'],
        queryFn: async (): Promise<NewsProps> => {
            const res = await fetch('/api/news')
            if (!res.ok) {
                throw new Error('Network response was not ok')
            }
            const data = await res.json()
            return data.news
        },
    })

    const truncatedDescription =
        data?.description && data.description.length > 180
            ? data.description.slice(0, 180) + "…"
            : data?.description

    return (
        <div className="col-span-1 relative flex min-h-[280px] rounded-xl border border-foreground/10 bg-background overflow-hidden">
            {/* Background image + overlay when we have news */}
            {status === "success" && data?.image_url && (
                <>
                    <Image
                        src={data.image_url}
                        alt={data.title}
                        fill
                        className="object-cover opacity-40"
                        priority={false}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-background/60 via-background/75 to-background" />
                </>
            )}

            {/* Content */}
            <div className="relative flex flex-1 flex-col p-5">
                {/* Header */}
                <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                            Privacy News
                        </span>
                        <p className="text-[11px] text-muted-foreground/80">
                            Stay updated on data breaches and privacy trends.
                        </p>
                    </div>
                </div>

                {/* States */}
                {status === "pending" && (
                    <div className="flex flex-1 flex-col items-center justify-center text-xs text-muted-foreground gap-2">
                        <Spinner className="text-primary" />
                        <span>Loading news…</span>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-1 flex-col items-center justify-center text-xs text-red-600 dark:text-red-400">
                        Failed to load news.
                    </div>
                )}

                {status === "success" && !data && (
                    <div className="flex flex-1 flex-col items-center justify-center text-xs text-muted-foreground">
                        No news available right now.
                    </div>
                )}

                {status === "success" && data && (
                    <>
                        <h3 className="mt-1 text-base font-semibold leading-snug">
                            {data.title}
                        </h3>
                        {truncatedDescription && (
                            <p className="mt-3 flex-1 text-sm text-muted-foreground leading-relaxed">
                                {truncatedDescription}
                            </p>
                        )}

                        <div className="mt-4 flex justify-end">
                            <a
                                href={data.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-foreground/10 transition"
                            >
                                Read more
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}