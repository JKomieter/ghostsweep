// Import global styles and fonts
import './globals.css'
import { JetBrains_Mono } from 'next/font/google'
import type { Metadata } from 'next'
import { Ghost } from '@/svgs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const inter = JetBrains_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: '404 - Page Not Found',
    description: 'The page you are looking for does not exist.',
}

export default function GlobalNotFound() {
    return (
        <html lang="en" className={inter.className}>
            <body className='antialiased bg-[#000000]'>
                <div className="min-h-screen faint-grid-bg flex justify-center items-center flex-col">
                    <div className='animate-[wiggle_1s_ease-in-out_infinite]'>
                        <Ghost className="w-40 h-40 shadow-lg shadow-[rgba(0, 242, 222, 0.25)" />
                    </div>
                    <h1 className="mt-10 text-4xl md:text-6xl font-bold text-white/10 select-none">
                        404 - Page Not Found
                    </h1>
                    <p className="mt-4 text-lg md:text-2xl text-white/10 select-none">
                        It looks like the path you followed doesn’t exist anymore.
                    </p>
                    <Link href='/' className='mt-8'>
                        <Button className='cursor-pointer' size={'lg'}>
                            Return Home
                        </Button>
                    </Link>
                </div>
            </body>
        </html>
    )
}