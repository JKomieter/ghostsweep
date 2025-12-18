

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
    gmailAddress,
    receiver_email,
    subject,
    template_used,
}: {
        accessToken: string,
    gmailAddress: string,
    receiver_email: string,
    subject: string,
    template_used: string,
}) {
    const raw = makeRawEmail({ from: gmailAddress, to: receiver_email, subject, body: template_used });

    const sendRes = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw }),
    });

    return sendRes
}