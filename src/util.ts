export function plural(n: number, singular: string, plural: string) {
    return n === 1 ? singular : plural;
}