import ServiceDetailsPage from "../../../_components/user_services/service_details"


export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    return (
        <div className="p-4 md:p-8 min-h-[calc(100vh-3.5rem)]">
            <ServiceDetailsPage userServiceId={id} />
        </div>
    )
}