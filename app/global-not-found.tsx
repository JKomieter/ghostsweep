// Import global styles and fonts
import './globals.css'
import { JetBrains_Mono } from 'next/font/google'
import type { Metadata } from 'next'
import { Ghost } from '@/svgs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const inter = JetBrains_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: '404 - Page Not Found | GhostSweep',
    description: 'The page you are looking for does not exist. Return to GhostSweep and discover your hidden accounts.',
    robots: {
        index: false,
        follow: true,
    },
    openGraph: {
        title: '404 - Page Not Found',
        description: 'The page you requested could not be found.',
        url: 'https://ghostsweep.com/404',
        type: 'website',
    },
}

export default function GlobalNotFound() {
    return (
        <html lang="en" className={inter.className}>
            <body className='antialiased bg-black'>
                <div className="min-h-screen faint-grid-bg flex justify-center items-center flex-col px-4">
                    {/* Animated Ghost Icon */}
                    <div className='animate-[wiggle_1s_ease-in-out_infinite] mb-8'>
                        <Ghost className="w-32 md:w-40 h-32 md:h-40 text-cyan-400/60 hover:text-cyan-400/80 transition-colors duration-300" />
                    </div>

                    {/* Main Content */}
                    <div className="text-center max-w-2xl">
                        <div className="mb-6">
                            <span className="inline-block px-4 py-2 bg-cyan-400/10 text-cyan-400 rounded-full text-sm font-semibold">
                                Error 404
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
                            Page Not Found
                        </h1>

                        <p className="text-lg md:text-xl text-gray-400 mb-8 leading-relaxed">
                            The path you&apos;re looking for seems to have vanished into the digital shadow. Let&apos;s get you back on track.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href='/'>
                                <Button 
                                    className='cursor-pointer px-8 py-6 text-base font-semibold' 
                                    size={'lg'}
                                >
                                    Return Home
                                </Button>
                            </Link>
                            <Link href='/help'>
                                <Button 
                                    variant="outline"
                                    className='cursor-pointer px-8 py-6 text-base font-semibold border-gray-600 text-gray-300 hover:bg-gray-900 hover:text-white' 
                                    size={'lg'}
                                >
                                    Get Help
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Helpful Text */}
                    <p className="mt-16 text-sm text-gray-500 text-center">
                        If you believe this is an error, please{' '}
                        <Link href='/support' className="text-cyan-400 hover:text-cyan-300 underline">
                            contact support
                        </Link>
                    </p>
                </div>
            </body>
        </html>
    )
}