// "A", "A and B", "A, B and C": reads naturally for any number of names.
export function formatNames(names: string[]): string {
    if (names.length <= 1) return names[0] ?? '';
    return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}
