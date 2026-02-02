"use client";

import { use } from "react";
import AccountDetailsPage from "../../_components/accounts/account_details";

export default function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);

    return (
        <div className="p-4 md:p-8 min-h-[calc(100vh-3.5rem)]">
            <div className="max-w-4xl mx-auto">
                <AccountDetailsPage accountId={id} />
            </div>
        </div>
    );
}
