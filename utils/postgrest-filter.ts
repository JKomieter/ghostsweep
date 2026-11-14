// Safe values for PostgREST filter strings (used by Supabase .or() / .filter()), which are parsed
// as filter syntax: unescaped commas, dots or parentheses in user input could add conditions.

const MAX_SEARCH_LENGTH = 100;

/**
 * Builds a quoted, escaped "contains" pattern for ilike inside .or(), e.g.
 *   query.or(`name.ilike.${containsPattern(term)},domain.ilike.${containsPattern(term)}`)
 * - LIKE wildcards (% and _) and backslashes in the input match literally
 * - the value is wrapped in double quotes with " and \ escaped, so PostgREST treats it as one value
 */
export function containsPattern(input: string): string {
    const term = input.slice(0, MAX_SEARCH_LENGTH);
    const likeEscaped = term.replace(/[\\%_]/g, (c) => `\\${c}`);
    const quoted = `%${likeEscaped}%`.replace(/["\\]/g, (c) => `\\${c}`);
    return `"${quoted}"`;
}
