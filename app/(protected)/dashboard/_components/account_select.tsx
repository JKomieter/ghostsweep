"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GmailLogo, OutLookLogo } from "@/svgs";

type GmailAccount = { id: string; gmail_address: string; created_at?: string };
type MicrosoftAccount = { id: string; outlook_address: string; created_at?: string };

export default function AccountSelect({
  gmailAccounts,
  microsoftAccounts,
  valueEmail,
  valueProvider,
  onChangeAction,
}: {
  gmailAccounts: GmailAccount[];
  microsoftAccounts: MicrosoftAccount[];
  valueEmail: string | null;
  valueProvider: "gmail" | "outlook" | null;
  onChangeAction: (email: string, provider: "gmail" | "outlook") => void;
}) {
  const selectedValue = valueEmail && valueProvider ? `${valueProvider}:${valueEmail}` : "";

  return (
    <Select
      value={selectedValue}
      onValueChange={(val) => {
        const [provider, ...rest] = val.split(":");
        const email = rest.join(":");
        const prov = (provider === "gmail" ? "gmail" : "outlook") as "gmail" | "outlook";
        onChangeAction(email, prov);
      }}
    >
      <SelectTrigger className="w-full bg-background/40 border-foreground/20 text-foreground">
        <SelectValue placeholder="Select an account" />
      </SelectTrigger>
      <SelectContent className="bg-card border-foreground/20">
        {gmailAccounts.map((acc) => (
          <SelectItem key={acc.id} value={`gmail:${acc.gmail_address}`}>
            <div className="flex items-center gap-2">
              <GmailLogo className="h-3.5 w-3.5" />
              <span>{acc.gmail_address}</span>
            </div>
          </SelectItem>
        ))}
        {microsoftAccounts.map((acc) => (
          <SelectItem key={acc.id} value={`outlook:${acc.outlook_address}`}>
            <div className="flex items-center gap-2">
              <OutLookLogo className="h-3.5 w-3.5" />
              <span>{acc.outlook_address}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
