// Matrimony profile form (POST matrimony/profiles). Option lists come from the
// Admin-managed masters (GET matrimony/master-data).

export type MatrimonyMasterItem = { id: number; name?: string; [key: string]: any };
export type MatrimonyMasters = Partial<Record<string, MatrimonyMasterItem[]>>;

export type MatrimonySelectField = {
  key: string; // request field, e.g. gender_id
  master: string; // key in master-data response, e.g. genders
  label: string;
};

export const MATRIMONY_SELECT_FIELDS: MatrimonySelectField[] = [
  { key: "gender_id", master: "genders", label: "Gender" },
  { key: "height_id", master: "heights", label: "Height" },
  { key: "marital_status_id", master: "marital_statuses", label: "Marital Status" },
  { key: "religion_id", master: "religions", label: "Religion" },
  { key: "caste_community_id", master: "caste_communities", label: "Caste / Community" },
  { key: "nationality_id", master: "nationalities", label: "Nationality" },
  { key: "diet_id", master: "diets", label: "Diet" },
  { key: "smoking_habit_id", master: "smoking_habits", label: "Smoking Habit" },
  { key: "drinking_habit_id", master: "drinking_habits", label: "Drinking Habit" },
];

/** Display text for a master row; heights may not use `name`. */
export const getMasterLabel = (item: MatrimonyMasterItem) =>
  String(item?.name ?? item?.label ?? item?.height ?? item?.value ?? item?.title ?? item?.id);

export const getActiveMasterItems = (masters: MatrimonyMasters | null, master: string) =>
  (masters?.[master] || [])
    .filter((item) => item?.is_active !== false && Number(item?.is_active) !== 0)
    .sort((a, b) => Number(a?.sort_order ?? 0) - Number(b?.sort_order ?? 0));

/** Parses a strict YYYY-MM-DD date; returns null when invalid. */
export const parseDateOfBirth = (value?: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
};

const getAge = (dob: Date) => {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
  return beforeBirthday ? age - 1 : age;
};

export const getMatrimonyValidationError = (
  values: Record<string, any>,
  masters: MatrimonyMasters | null
): string | null => {
  if (!String(values.full_name || "").trim()) return "Please enter Full Name";

  const dob = parseDateOfBirth(values.date_of_birth);
  if (!dob) return "Please select Date of Birth";

  const missing = MATRIMONY_SELECT_FIELDS.find((field) => !values[field.key]);
  if (missing) return `Please select ${missing.label}`;

  if (!String(values.mother_tongue || "").trim()) return "Please enter Mother Tongue";

  // Legal minimum age of marriage in India: 21 for men, 18 for women.
  const gender = (masters?.genders || []).find((g) => g.id === values.gender_id);
  const minAge = /^male$/i.test(getMasterLabel(gender as MatrimonyMasterItem)) ? 21 : 18;
  const age = getAge(dob);
  if (age < minAge) return `Age must be at least ${minAge} years`;
  if (age > 100) return "Please enter a valid Date of Birth";

  if (!values.declaration) return "Please accept the declaration";

  return null;
};

// ---- Profile display helpers (GET matrimony/profiles rows) ----

/** Name of a master relation, e.g. profile.religion → "Hindu". Accepts a nested object or a flat *_name field. */
export const getProfileMasterName = (profile: any, relation: string) => {
  const value = profile?.[relation];
  if (value && typeof value === "object") return getMasterLabel(value);
  return String(value ?? profile?.[`${relation}_name`] ?? "").trim();
};

export const getProfileAge = (profile: any) => {
  const dob = parseDateOfBirth(String(profile?.date_of_birth || "").slice(0, 10));
  return dob ? getAge(dob) : null;
};

export const getProfilePhoto = (profile: any, imageBaseUrl: string) => {
  const photo = String(profile?.profile_photo_url || profile?.profile_photo || "").trim();
  if (!photo) return "";
  if (/^(https?:|data:|file:)/.test(photo)) return photo;
  return `${imageBaseUrl}/${photo.replace(/^\//, "")}`;
};
