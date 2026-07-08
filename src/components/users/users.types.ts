export const USER_ROLES = ["SUPER_ADMIN", "ADMIN", "TRAINER", "MEMBER"] as const;
export const USER_STATUSES = ["active", "inactive"] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl: string | null;
};

export type UserFormValues = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatarUrl: string | null;
};

export const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  TRAINER: "Trainer",
  MEMBER: "Member",
};

export const roleOptions = USER_ROLES.map((value) => ({
  value,
  label: roleLabels[value],
}));

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && (USER_ROLES as readonly string[]).includes(value);
}
