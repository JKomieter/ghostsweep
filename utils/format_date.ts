export const formatDate = (dateString: string | null): string => {
    // Returns examples like: 6d ago, 2y ago, 3mo ago
    if (!dateString) return "Unknown";

    const date = new Date(dateString);

    // Basic validation for invalid date strings
    if (isNaN(date.getTime())) return "Invalid Date";

    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // Check if the date is in the future
    if (diff < 0) return "Just now";

    // Calculate differences (floor is critical for whole, passed units)
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // Use an average month/year length for cleaner calculation
    const years = Math.floor(days / 365);
    const months = Math.floor(days / 30);

    // Check from largest unit down
    if (years > 0) return `${years}y ago`;

    // FIX: Use 'mo' for months to avoid ambiguity with minutes ('m')
    if (months > 0) return `${months}mo ago`;

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;

    // Use 'm' for minutes
    if (minutes > 0) return `${minutes}m ago`;

    // Less than a minute
    return "Just now";
};