export type UserRole = "SUPER_ADMIN" | "ADMIN" | "TRAINER" | "MEMBER";

export type UserStatus = "active" | "inactive";

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

export const roleOptions = (
  Object.entries(roleLabels) as [UserRole, string][]
).map(([value, label]) => ({ value, label }));
