import { forwardRef, Module } from "@nestjs/common";
import { AuthService } from "./service/auth.service";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt/jwt.strategy";
import { UsersModule } from "src/users/users.module";
import { AuthController } from "./controller/auth.controller";
import { GoogleStrategy } from "./strategies/google.strategies";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt", session: false }),

    //* Local Use
    JwtModule.register({
      secret: process.env.JWT_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRES },
    }),
    forwardRef(() => UsersModule),
  ],
  exports: [AuthService],

  controllers: [AuthController],

  providers: [AuthService, JwtStrategy, GoogleStrategy],
})
export class AuthModule {}
