"use client"
import ServiceTable from "../_components/services/service-table";


export default function ServicePage() {
    return (
        <div className="min-h-[calc(100vh-3.5rem)] px-4 py-6 md:px-8 md:py-8">
            <ServiceTable />
        </div>
    );
}