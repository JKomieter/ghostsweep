import HomePageClient from "./_components/home-page-client";
import LatestBlogs from "./_components/latest-blogs";

// Statically render the homepage and refresh it (and its latest posts) hourly.
export const revalidate = 3600;

export default function HomePage() {
    return <HomePageClient latestBlogs={<LatestBlogs />} />;
}
