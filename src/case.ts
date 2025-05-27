export function toCamelCase(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .split(/[\s-_]+/)
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join('');
}

export function toPascalCase(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .split(/[\s-_]+/)
    .map((word, index) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

export function toUpperCase(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .split(/[\s-_]+/)
    .join('_');
}
