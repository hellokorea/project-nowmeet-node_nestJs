export interface GoogleUser {
  email: string;
  // accesToekn: string;
}

export type GoogleRequest = Request & { user: GoogleUser };
