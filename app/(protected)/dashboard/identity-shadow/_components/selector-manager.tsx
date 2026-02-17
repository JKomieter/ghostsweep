"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, X, Mail, User, Phone, Loader2 } from "lucide-react";

type Selector = {
  id: number;
  selector_type: string;
  selector_value: string;
  last_scanned_at: string | null;
};

export default function SelectorManager({
  selectors,
}: {
  selectors: Selector[];
}) {
  const [value, setValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();

  const detectSelectorType = (input: string): "email" | "phone" | "username" => {
    const trimmed = input.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "email";
    if (/^\+?[\d\s\-().]{7,}$/.test(trimmed)) return "phone";
    return "username";
  };

  const detectedType = value.trim() ? detectSelectorType(value) : null;

  const addMutation = useMutation({
    mutationFn: async (selectorValue: string) => {
      const res = await fetch("/api/user-selectors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selector_value: selectorValue,
          selector_type: detectSelectorType(selectorValue),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add selector");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Selector added");
      setValue("");
      setIsAdding(false);
      queryClient.invalidateQueries({ queryKey: ["shadow-data"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/user-selectors?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Selector removed");
      queryClient.invalidateQueries({ queryKey: ["shadow-data"] });
    },
    onError: () => {
      toast.error("Failed to remove selector");
    },
  });

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    addMutation.mutate(trimmed);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-widest text-white/40">
          Selectors
        </span>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        )}
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="email, phone, or username"
            className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 font-mono"
            autoFocus
          />
          {detectedType && (
            <div className="flex items-center gap-1.5 px-1">
              {detectedType === "email" && <Mail className="h-3 w-3 text-emerald-400/70" />}
              {detectedType === "phone" && <Phone className="h-3 w-3 text-blue-400/70" />}
              {detectedType === "username" && <User className="h-3 w-3 text-amber-400/70" />}
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/30">
                Detected as <span className={detectedType === "email" ? "text-emerald-400/70" : detectedType === "phone" ? "text-blue-400/70" : "text-amber-400/70"}>{detectedType}</span>
              </span>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={addMutation.isPending || !value.trim()}
              className="flex-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs"
            >
              {addMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setValue("");
              }}
              className="text-white/40 hover:text-white/60 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Selector list */}
      <div className="space-y-1">
        {selectors.length === 0 && !isAdding && (
          <p className="text-xs text-white/20 py-2">
            No selectors added yet. Add an email, phone, or username to begin scanning.
          </p>
        )}
        {selectors.map((sel) => (
          <div
            key={sel.id}
            className="group/sel flex items-center justify-between rounded-md px-2.5 py-2 hover:bg-white/3 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              {sel.selector_type === "email" ? (
                <Mail className="h-3 w-3 text-emerald-400/50 shrink-0" />
              ) : sel.selector_type === "phone" ? (
                <Phone className="h-3 w-3 text-blue-400/50 shrink-0" />
              ) : (
                <User className="h-3 w-3 text-amber-400/50 shrink-0" />
              )}
              <span className="text-xs font-mono text-white/60 truncate">
                {sel.selector_value}
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-white/20 shrink-0">
                {sel.selector_type}
              </span>
            </div>
            <button
              onClick={() => deleteMutation.mutate(sel.id)}
              className="opacity-0 group-hover/sel:opacity-100 text-white/30 hover:text-red-400 transition-all p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
