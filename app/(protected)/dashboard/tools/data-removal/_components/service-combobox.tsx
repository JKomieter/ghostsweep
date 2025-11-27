import { useState, useMemo } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Service } from "../page";

export function ServiceCombobox({
    services,
    servicesLoading,
    selectedServiceId,
    setSelectedServiceId,
}: {
    services: Service[] | undefined;
    servicesLoading: boolean;
    selectedServiceId: string;
    setSelectedServiceId: (val: string) => void;
}) {
    const [open, setOpen] = useState(false);

    const selectedService = useMemo(
        () => services?.find((s) => s.id === selectedServiceId),
        [services, selectedServiceId]
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    disabled={servicesLoading || !services?.length}
                    className={cn(
                        "w-full flex justify-between items-center rounded-md border bg-[#111111] px-3 py-2 text-sm",
                        "border-white/15 text-left",
                        (!services || services.length === 0) && "opacity-60 cursor-not-allowed"
                    )}
                >
                    {servicesLoading
                        ? "Loading services..."
                        : selectedService
                            ? `${selectedService.name}${selectedService.domain ? ` (${selectedService.domain})` : ""}`
                            : services?.length
                                ? "Select a service"
                                : "No services found from sweeps yet"}

                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </button>
            </PopoverTrigger>

            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-[#111111] border-white/10">
                <Command>
                    <CommandInput placeholder="Search services..." />

                    <CommandEmpty>No services found.</CommandEmpty>

                    <CommandGroup>
                        {services?.map((service) => {
                            const label = service.name || "Unknown service";
                            const domain = service.domain ? ` (${service.domain})` : "";

                            return (
                                <CommandItem
                                    key={service.id}
                                    value={service?.name || ""}
                                    onSelect={() => {
                                        setSelectedServiceId(service.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedServiceId === service.id
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    {label}
                                    {domain}
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}