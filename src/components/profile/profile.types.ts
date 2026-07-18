export const PROFILE_SPECIALTIES = [
  "Médico(a)",
  "Nutricionista",
  "Personal Trainer",
  "Administrador",
  "Fisioterapeuta",
  "Recepcionista",
] as const;

export type ProfileSpecialty = (typeof PROFILE_SPECIALTIES)[number];

export const specialtyOptions = PROFILE_SPECIALTIES.map((value) => ({
  value,
  label: value,
}));

export type ProfileSession = {
  displayName: string;
  email: string;
  phone: string;
  specialty: string;
  roleLabel: string;
  avatarUrl: string | null;
};

export type ProfilePasswordFormValues = {
  currentPassword: string;
  newPassword: string;
};
