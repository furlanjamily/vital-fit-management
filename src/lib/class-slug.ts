/** Converte nome da modalidade em slug para URL (/classes/crossfit). */
export function classNameToSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function matchesClassSlug(className: string, slug: string): boolean {
  return classNameToSlug(className) === slug.toLowerCase();
}
