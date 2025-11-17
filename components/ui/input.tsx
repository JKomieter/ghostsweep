

export default function Input({
    id,
    placeholder,
    value,
    onChange,
    type = "text",
    required
}: {
    id: string;
    placeholder?: string;
    value: string;
    onChange: React.Dispatch<React.SetStateAction<string>>;
    type?: string;
    required?: boolean;
}) {
    return (
        <input
            id={id}
            type={type}
            className="w-full rounded-md bg-background border border-border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
        />
    )
}