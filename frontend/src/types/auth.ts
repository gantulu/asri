export type AuthStatus = "UNKNOWN" | "AUTHENTICATED" | "UNAUTHENTICATED";

export type AsriUser = {
  user_id: string;
  name: string;
  phone: string;
  created_at: string;
};

export type StoredCredentials = {
  name: string;
  phone: string;
  password: string;
};

export type AuthResponse = {
  user: AsriUser;
};
