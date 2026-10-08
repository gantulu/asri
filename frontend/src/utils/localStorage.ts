import type { StoredCredentials } from "../types/auth";

const STORAGE_KEY = "asri_user";

export function getStoredCredentials(): StoredCredentials | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const value = JSON.parse(raw) as Partial<StoredCredentials>;
    if (
      typeof value.name !== "string" ||
      typeof value.phone !== "string" ||
      typeof value.password !== "string" ||
      !value.phone ||
      !value.password
    ) {
      return null;
    }

    return {
      name: value.name,
      phone: value.phone,
      password: value.password,
    };
  } catch {
    return null;
  }
}

export function setStoredCredentials(credentials: StoredCredentials): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
}

export function clearStoredCredentials(): void {
  localStorage.removeItem(STORAGE_KEY);
}
