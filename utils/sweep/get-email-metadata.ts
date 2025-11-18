import { gmail_v1 } from "googleapis";


export type EmailMetadata = {
    id: string;
    from: string;
    subject: string;
    date: string;
    internalDate?: string;
}

export async function getEmailMetadataFromClient(
    gmail: gmail_v1.Gmail,
    messageId: string
): Promise<EmailMetadata> {
    const res = await gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "Date"],
    });

    const data = res.data;
    const headers = data.payload?.headers ?? [];

    const from =
        headers.find((h) => h.name === "From")?.value?.toString() ?? "";
    const subject =
        headers.find((h) => h.name === "Subject")?.value?.toString() ?? "";
    const dateHeader =
        headers.find((h) => h.name === "Date")?.value?.toString() ?? "";

    const internalDate = data.internalDate
        ? new Date(Number(data.internalDate)).toISOString()
        : undefined;

    return {
        id: data.id ?? messageId,
        from,
        subject,
        date: dateHeader,
        internalDate,
    };
}