import { createClient } from "../supabase/server";
import { extractEmailAddress, extractDomain, extractName } from "./extraction";
import { EmailMetadata } from "./get-email-metadata";


export type DomainAggregate = {
    domain: string;
    emailCount: number;
    firstSeenAt: string | null; // ISO
    lastSeenAt: string | null;  // ISO
    serviceId: string | null;
};

export async function summarizeByDomain(metadataList: EmailMetadata[]): Promise<DomainAggregate[]> {
    const supabase = await createClient();
    const map = new Map<string, DomainAggregate>();
    const serviceIds = new Map<string, string>();

    for (const meta of metadataList) {
        const email = extractEmailAddress(meta.from);
        const domain = extractDomain(email);
        if (!domain) continue;

        // prefer internalDate if present, fallback to header date
        const iso =
            meta.internalDate ||
            (meta.date ? new Date(meta.date).toISOString() : null);

        let serviceId = null;

        // check cache first
        if (serviceIds.has(domain)) {
            serviceId = serviceIds.get(domain)!;
        } else {
            // get the service id with the domain
            const { data: service, error: servicesError } = await supabase
                .from("services")
                .select("id")
                .eq("domain", domain)
                .single();
    
            if ((servicesError && servicesError.code === "PGRST116") || !service) {
                const { data, error } = await supabase.functions.invoke('create-new-service', {
                    body: { 
                        domain,
                        name: extractName(meta.from)
                     }
                })
    
                if (error || !data) {
                    console.error("Error creating new service:", error);
                }
    
                serviceId = data.serviceId;
            } else if (servicesError) {
                console.error("Error fetching service:", servicesError);
            }
    
            if (service) {
                serviceId = service.id;
            }
        }


        // cache serviceId for domain
        serviceIds.set(domain, serviceId);


        if (!map.has(domain)) {
            map.set(domain, {
                domain,
                emailCount: 0,
                firstSeenAt: iso,
                lastSeenAt: iso,
                serviceId: serviceId || null,
            });
        }

        const agg = map.get(domain)!;
        agg.emailCount += 1;

        if (iso) {
            if (!agg.firstSeenAt || iso < agg.firstSeenAt) {
                agg.firstSeenAt = iso;
            }
            if (!agg.lastSeenAt || iso > agg.lastSeenAt) {
                agg.lastSeenAt = iso;
            }
        }
    }

    return Array.from(map.values());
}