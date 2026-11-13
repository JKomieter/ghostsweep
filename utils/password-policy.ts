// Single source of truth for password rules. Must match Supabase Auth settings
// (Authentication → Providers → Email): minimum length 12 and
// "Lowercase, uppercase letters, digits and symbols". Supabase also enforces these
// server-side and rejects breached passwords (HaveIBeenPwned).

export const PASSWORD_MIN_LENGTH = 12;

// Same symbol set Supabase Auth accepts for the "symbols" requirement
const SYMBOL_REGEX = /[!@#$%^&*()_+\-=\[\]{};'\\:"|<>?,./`~]/;

export const PASSWORD_RULES: { label: string; test: (pw: string) => boolean }[] = [
    { label: `${PASSWORD_MIN_LENGTH}+ characters`, test: (pw) => pw.length >= PASSWORD_MIN_LENGTH },
    { label: "Uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
    { label: "Lowercase letter", test: (pw) => /[a-z]/.test(pw) },
    { label: "Number", test: (pw) => /[0-9]/.test(pw) },
    { label: "Symbol", test: (pw) => SYMBOL_REGEX.test(pw) },
];

export const PASSWORD_REQUIREMENTS_MESSAGE =
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters and include an uppercase letter, a lowercase letter, a number and a symbol.`;

export function isPasswordValid(password: string): boolean {
    return PASSWORD_RULES.every((rule) => rule.test(password));
}
