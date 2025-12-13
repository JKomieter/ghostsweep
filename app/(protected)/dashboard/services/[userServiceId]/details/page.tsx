import ServiceDetailsPage from "../../../_components/services/service-details"


export default async function Page({
    params,
}: {
    params: Promise<{ userServiceId: string }>
}) {
    const { userServiceId } = await params

    return (
        <div className="p-4 md:p-8 min-h-[calc(100vh-3.5rem)]">
            <ServiceDetailsPage userServiceId={userServiceId} />
        </div>
    )
}