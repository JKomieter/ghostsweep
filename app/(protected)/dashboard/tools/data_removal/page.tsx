// // app/tools/data-removal/page.tsx
// "use client";

// import { useMemo, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { AlertCircle, Mail } from "lucide-react";
// import Input from "@/components/ui/input";
// import { useQuery } from "@tanstack/react-query";
// import { toast } from "sonner";
// import { ServiceCombobox } from "./_components/service-combobox";


// export interface AllServicesResponse {
//     service: {
//         id: string;
//         name: string;
//         domain: string;
//         category: string;
//         logo_url: string;
//         is_breached: boolean | null;
//     } | null;
// }



// export default function DataRemovalToolPage() {

//     const [selectedServiceId, setSelectedServiceId] = useState<string>("");
//     const [copyStatus, setCopyStatus] = useState<string | null>(null);

//     const { data: services, status: servicesStatus } = useQuery({
//         queryKey: ["allServices"],
//         queryFn: async (): Promise<AllServicesResponse[]> => {
//             const res = await fetch("/api/user_services/all", {
//                 method: "GET",
//                 headers: { "Content-Type": "application/json" },
//             });

//             if (!res.ok) {
//                 throw new Error("Failed to fetch services");
//             }

//             const json = (await res.json())
//             return json.userServices
//         }
//     })

//     const servicesLoading = servicesStatus === "pending"

//     const selectedService = useMemo(
//         () => services?.find((s) => s.id === selectedServiceId) ?? null,
//         [services, selectedServiceId]
//     );

//     const emailSubject = useMemo(() => {
//         if (!selectedService) return "Request for deletion of my account and personal data";
//         const name = selectedService.name || "your service";
//         return `Request for deletion of my ${name} account and personal data`;
//     }, [selectedService]);

//     const emailBody = useMemo(() => {
//         const serviceName = selectedService?.name || "your company";
//         const serviceDomain = selectedService?.domain
//             ? `(${selectedService.domain})`
//             : "";
//         const email = "[your email here]";

//         const lines = [
//             `Subject: Request for Complete Account Deletion and Erasure of Personal Data (GDPR / CCPA)`,
//             "",
//             `To the Data Protection or Privacy Team at ${serviceName} ${serviceDomain},`,
//             "",
//             `I am writing to request the permanent deletion of my account and all personal data associated with it. This request is made under applicable data protection laws, including the GDPR (Article 17 — Right to Erasure) and the CCPA/CPRA (Section 1798.105), where relevant.`,
//             "",
//             `Account information for verification:`,
//             `- Email associated with the account: ${email}`,
//             serviceDomain ? `- Service domain: ${serviceDomain}` : "",
//             "",
//             `I am requesting that you:`,
//             `1. Permanently delete my account and all personal data associated with it from your systems, backups, archives, and logs.`,
//             `2. Stop processing or using my personal data for any purpose.`,
//             `3. Notify any third parties or processors with whom you have shared my data that they must also delete it.`,
//             "",
//             `Response timeframe:`,
//             `Under GDPR, you are expected to respond without undue delay and no later than 30 days from receiving this request. If you require additional information to verify my identity, please let me know as soon as possible.`,
//             "",
//             `Please confirm in writing when my account has been fully deleted and provide a brief summary of the actions taken, especially regarding third-party data deletion.`,
//             "",
//             `Thank you for your cooperation.`,
//             "",
//             `Sincerely,`,
//             `${email}`,
//         ];

//         return lines.join("\n");
//     }, [selectedService]);

//     const privacyEmail = selectedService?.contact || "";

//     const handleCopyTemplate = async () => {
//         try {
//             await navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
//             setCopyStatus("Template copied to clipboard");
//             toast.success("Template copied to clipboard")
//             setTimeout(() => setCopyStatus(null), 2500);
//         } catch (err) {
//             console.error("Error copying:", err);
//             setCopyStatus("Couldn’t copy to clipboard");
//             setTimeout(() => setCopyStatus(null), 2500);
//         }
//     };

//     const handleCopyRecipient = async () => {
//         if (!privacyEmail) return;
//         try {
//             await navigator.clipboard.writeText(privacyEmail);
//             setCopyStatus("Recipient email copied");
//             toast.success("Recipient email copied")
//             setTimeout(() => setCopyStatus(null), 2500);
//         } catch (err) {
//             console.error("Error copying recipient:", err);
//             setCopyStatus("Couldn’t copy email");
//             setTimeout(() => setCopyStatus(null), 2500);
//         }
//     };

//     const handleOpenEmailClient = () => {
//         const to = privacyEmail || "";
//         const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
//             emailSubject
//         )}&body=${encodeURIComponent(emailBody)}`;
//         window.location.href = url;
//     };

//     return (
//         <div className="min-h-[calc(100vh-4rem)] bg-[#050505] text-white px-4 py-8 sm:px-6 lg:px-10">
//             <div className="mx-auto max-w-3xl space-y-6">
//                 {/* Header */}
//                 <div className="space-y-2">
//                     <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
//                         <ShieldDot />
//                         Privacy tools · Data removal
//                     </div>
//                     <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
//                         Data removal email templates
//                     </h1>
//                     <p className="text-sm text-muted-foreground max-w-xl">
//                         Generate ready-to-send emails asking services to delete your account and personal data.
//                         Copy, paste, and send it to the service&apos;s privacy or support email.
//                     </p>
//                 </div>

//                 {/* Plan gate */}
//                 <div className="rounded-xl border border-white/10 bg-[#0c0c0c] p-4 flex items-center justify-between gap-3">
//                     <div className="space-y-1">
//                         <p className="text-xs font-medium text-muted-foreground">Plan access</p>
//                         <p className="text-sm">
//                             You&apos;re on <span className="font-semibold">Free</span>. Data removal templates are a Pro feature.

//                         </p>
//                     </div>
//                 </div>

//                 <div className="mt-4 space-y-6">
//                     {/* Service selection */}
//                     <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-5 space-y-3">
//                         <p className="text-sm font-medium">1. Choose a service</p>
//                         <p className="text-xs text-muted-foreground">
//                             Select a service from your latest sweep. We&apos;ll generate a tailored email you can send to ask
//                             them to delete your account and data.
//                         </p>

//                         <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
//                             <div className="flex-1">
//                                 <ServiceCombobox
//                                     services={services}
//                                     servicesLoading={servicesLoading}
//                                     selectedServiceId={selectedServiceId}
//                                     setSelectedServiceId={setSelectedServiceId}
//                                 />
//                             </div>
//                         </div>

//                         {servicesStatus === "error" && (
//                             <p className="flex items-center gap-1 text-[11px] text-red-400">
//                                 <AlertCircle className="h-3 w-3" />
//                                 Problem getting services
//                             </p>
//                         )}
//                     </div>

//                     {/* Template preview */}
//                     <div className="rounded-xl border border-white/10 bg-[#0b0b0b] p-5 space-y-4">
//                         <p className="text-sm font-medium">2. Review & send the email</p>
//                         <p className="text-xs text-muted-foreground">
//                             Copy this into your email app and send it to the service&apos;s privacy or support email. You can edit
//                             the text before sending if you’d like.
//                         </p>

//                         {/* Recipient */}
//                         <div className="space-y-2">
//                             <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
//                                 Recipient email
//                             </label>
//                             <div className="flex gap-2">
//                                 <div className="relative flex-1">
//                                     <Mail className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
//                                     <Input
//                                         value={privacyEmail || ""}
//                                         readOnly
//                                         placeholder="No dedicated privacy email stored for this service"
//                                         id="email"
//                                         type="email"
//                                         onChange={() => { }}
//                                     />
//                                 </div>
//                                 <Button
//                                     variant="outline"
//                                     size="sm"
//                                     disabled={!privacyEmail}
//                                     onClick={handleCopyRecipient}
//                                 >
//                                     Copy
//                                 </Button>
//                                 <Button
//                                     variant="outline"
//                                     size="sm"
//                                     disabled={!privacyEmail || !selectedService}
//                                     onClick={handleOpenEmailClient}
//                                 >
//                                     Open mail
//                                 </Button>
//                             </div>
//                             <p className="text-[11px] text-muted-foreground">
//                                 If no privacy email is listed, use the service&apos;s support/contact email or contact form instead.
//                             </p>
//                         </div>

//                         {/* Subject */}
//                         <div className="space-y-2">
//                             <label className="text-xs font-medium text-muted-foreground">Email subject</label>
//                             <Input
//                                 value={emailSubject}
//                                 readOnly
//                                 onChange={() => { }}
//                                 id="subject"
//                             />
//                         </div>

//                         {/* Body */}
//                         <div className="space-y-2">
//                             <label className="text-xs font-medium text-muted-foreground">Email body</label>
//                             <Textarea
//                                 value={emailBody}
//                                 readOnly
//                                 rows={12}
//                                 className="bg-[#111111] border-white/15 text-xs font-mono"
//                             />
//                         </div>

//                         <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
//                             <Button
//                                 size="sm"
//                                 onClick={handleCopyTemplate}
//                             >
//                                 Copy full template
//                             </Button>
//                             {copyStatus && (
//                                 <p className="text-[11px] text-emerald-300">{copyStatus}</p>
//                             )}
//                         </div>

//                         {!selectedService && (
//                             <p className="text-[11px] text-muted-foreground pt-1">
//                                 Select a service above to generate a tailored email template.
//                             </p>
//                         )}
//                     </div>

//                     {/* Note */}
//                     <p className="text-[11px] text-muted-foreground">
//                         GhostSweep does not send emails on your behalf. You stay in control — review and send messages from your
//                         own email account.
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// }

// // Tiny shield-dot icon without pulling in a full icon set if you want a subtle header badge
// function ShieldDot() {
//     return (
//         <span className="relative inline-flex h-3 w-3 items-center justify-center">
//             <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-500/40" />
//             <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
//         </span>
//     );
// }

export default function DataRemovalToolPage() {
    return null
}