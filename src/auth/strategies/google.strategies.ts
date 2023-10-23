import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile, VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_API_KEY,
      // callbackURL: process.env.LOCAL_GOOGLE_LOGIN_CB,
      callbackURL: process.env.EC2_GOOGLE_LOGIN_CB,
      scope: ["email", "profile"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
    try {
      const { name, emails, id } = profile;
      const user = {
        provider: "google",
        providerId: id,
        name: name,
        email: emails[0].value,
      };
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
}
