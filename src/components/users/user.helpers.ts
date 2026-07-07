/** Paleta estilo Google Workspace para avatares com iniciais. */
const AVATAR_COLORS = [
  "#e35d6a",
  "#d96570",
  "#c2185b",
  "#8e24aa",
  "#5e35b1",
  "#3949ab",
  "#1e88e5",
  "#00897b",
  "#43a047",
  "#f4511e",
  "#6d4c41",
  "#546e7a",
];

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

export function getAvatarColor(name: string): string {
  const normalized = name.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }

  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
