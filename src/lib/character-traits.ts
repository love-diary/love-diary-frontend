/**
 * Character Traits Configuration
 * Supports multiple locales for occupation and personality names
 */

export type Locale = "en";

// Occupation names by language
export const OCCUPATIONS: Record<Locale, string[]> = {
  en: [
    "Software Engineer",
    "Doctor",
    "Teacher",
    "Artist",
    "Chef",
    "Musician",
    "Writer",
    "Athlete",
    "Scientist",
    "Entrepreneur",
  ],
};

// Personality names by language
export const PERSONALITIES: Record<Locale, string[]> = {
  en: [
    "Adventurous",
    "Caring",
    "Creative",
    "Analytical",
    "Outgoing",
    "Reserved",
    "Optimistic",
    "Pragmatic",
    "Romantic",
    "Mysterious",
  ],
};

// Gender labels by language
export const GENDER_LABELS: Record<Locale, string[]> = {
  en: ["Male", "Female", "Non-Binary"],
};

// Sexual orientation labels by language
export const ORIENTATION_LABELS: Record<Locale, string[]> = {
  en: ["Straight", "Same Gender", "Bisexual", "Pansexual", "Asexual"],
};

// Language labels (display names)
export const LANGUAGE_LABELS: Record<Locale, string[]> = {
  en: ["English"],
};

/**
 * Get occupation name by ID and locale
 */
export function getOccupationName(occupationId: number, locale: Locale = "en"): string {
  return OCCUPATIONS[locale][occupationId] || "Unknown";
}

/**
 * Get personality name by ID and locale
 */
export function getPersonalityName(personalityId: number, locale: Locale = "en"): string {
  return PERSONALITIES[locale][personalityId] || "Unknown";
}

/**
 * Get gender label by ID and locale
 */
export function getGenderLabel(gender: number, locale: Locale = "en"): string {
  return GENDER_LABELS[locale][gender] || "Unknown";
}

/**
 * Get orientation label by ID and locale
 */
export function getOrientationLabel(orientation: number, locale: Locale = "en"): string {
  return ORIENTATION_LABELS[locale][orientation] || "Unknown";
}

/**
 * Get language label by ID and locale
 */
export function getLanguageLabel(languageId: number, locale: Locale = "en"): string {
  return LANGUAGE_LABELS[locale][languageId] || "Unknown";
}
