interface GoogleUser {
  email: string;
}

export type GoogleRequest = Request & { user: GoogleUser };
