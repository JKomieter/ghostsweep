

function makeRawEmail(opts: { from: string; to: string; subject: string; body: string }) {
    // Minimal RFC 2822 email
    const lines = [
        `From: ${opts.from}`,
        `To: ${opts.to}`,
        `Subject: ${opts.subject}`,
        "MIME-Version: 1.0",
        'Content-Type: text/plain; charset="UTF-8"',
        "Content-Transfer-Encoding: 7bit",
        "",
        opts.body,
    ];
    const msg = lines.join("\r\n");

    // Gmail expects base64url
    const b64 = Buffer.from(msg, "utf8").toString("base64");
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}


export default async function sendEmail({
    accessToken,
    from,
    to,
    subject,
    body,
    threadId, // Add threadId as an optional parameter
}: {
    accessToken: string;
    from: string;
    to: string;
    subject: string;
    body: string;
    threadId?: string; // Optional threadId for threading
}) {
    const raw = makeRawEmail({ from, to, subject, body });

    const sendRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            raw,
            ...(threadId ? { threadId } : {}), // Include threadId if provided
        }),
    });

    if (!sendRes.ok) {
        console.error("Failed to send email:", await sendRes.text());
        throw new Error(`Failed to send email: ${sendRes.status} ${sendRes.statusText}`);
    }

    const data = await sendRes.json();
    console.log("Email sent successfully:", data);
    return data;
}