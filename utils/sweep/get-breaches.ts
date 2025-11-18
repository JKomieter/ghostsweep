
type Breach = {
    Name: string;
    Title: string;
    Domain: string;
    BreachDate: string;
    AddedDate: string;
    ModifiedDate: string;
    PwnCount: number;
    Description: string;
    DataClasses: string[];
    IsVerified: boolean;
    IsFabricated: boolean;
    IsSensitive: boolean;
    IsRetired: boolean;
    IsSpamList: boolean;
    LogoPath: string;
}

export async function getBreaches(email: string) {
    const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`, {
        method: 'GET',
        headers: {
            'hibp-api-key': process.env.HIBP_API_KEY || '',
        }
    });

    if (response.status === 404) {
        // No breaches found
        return [];
    }

    if (!response.ok) {
        console.error('Error fetching breaches:', response.statusText);
        throw new Error(`Error fetching breaches: ${response.statusText}`);
    }

    const breaches = await response.json() as Breach[];

    return breaches || [];
    
}