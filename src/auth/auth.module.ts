import { forwardRef, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt/jwt.strategy";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt", session: false }),

    JwtModule.register({
      secret: process.env.JWT_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRES },
    }),

    forwardRef(() => UsersModule),
  ],
  exports: [AuthService],

  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
