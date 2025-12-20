

export default function Input({
    id,
    placeholder,
    value,
    onChange,
    type = "text",
    required,
    disableCopyPaste = false,
    readOnly = false,
    className = "",
    autoComplete= "",
    disabled = false
}: {
    id: string;
    placeholder?: string;
    value: string;
    onChange: React.Dispatch<React.SetStateAction<string>>;
    type?: string;
    required?: boolean;
    disableCopyPaste?: boolean;
    readOnly?: boolean
    className?: string
    autoComplete?: string
        disabled?: boolean
}) {

    return (
        <input
            id={id}
            type={type}
            className={`w-full rounded-md bg-background border border-border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            onCopy={(e) => disableCopyPaste && e.preventDefault()}
            onPaste={(e) => disableCopyPaste && e.preventDefault()}
            onCut={(e) => disableCopyPaste && e.preventDefault()}
            readOnly={readOnly}
            autoComplete={autoComplete}
            disabled={disabled}
        />
    )
}