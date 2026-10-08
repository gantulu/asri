import type { AuthResponse, StoredCredentials } from "../../types/auth";
import { apiRequest } from "./client";

export function registerUser(input: StoredCredentials): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginUser(input: Pick<StoredCredentials, "phone" | "password">): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
