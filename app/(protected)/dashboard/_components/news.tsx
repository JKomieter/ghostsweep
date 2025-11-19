import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query"
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

    return (
        <div className="col-span-1 rounded-xl border border-white/10 bg-[#0f0f0f] min-h-[300px] flex relative ">
            {status === 'pending' && (
                <div className="text-gray-500 flex items-center justify-center flex-1">
                    <Spinner className="text-primary" /> Loading news...
                </div>
            )}
            {status === "error" && (
                <div className="text-red-500 flex items-center justify-center flex-1">
                    Failed to load news.
                </div>
            )}
            {status === "success" && data ? (
                <div className="relative flex-1 p-5 flex flex-col">
                    <Image
                        src={data.image_url}
                        alt={data.title}
                        className="absolute top-0 left-0 w-full h-full object-cover opacity-30 rounded-xl"
                        fill
                    />
                    <h1 className="font-bold relative z-10 uppercase text-2xl">
                        News
                    </h1>
                    <h3 className="font-medium relative z-10 mt-4 text-lg">
                        {data.title}
                    </h3>
                    <p className="text-sm relative z-10 mt-2 flex-1 overflow-y-auto">
                        {data.description.slice(0, 150)}...
                    </p>
                    <div className="flex justify-end">
                        <a
                            href={data.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 relative z-10 text-primary font-medium hover:underline"
                        >
                            Read more
                        </a>
                    </div>
                </div>
            ) : (
                <div className="text-gray-500  flex items-center justify-center flex-1">
                    No news available.
                </div>
            )}
        </div>
    )
}