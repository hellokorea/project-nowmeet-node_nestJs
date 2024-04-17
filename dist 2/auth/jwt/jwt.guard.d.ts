import { CanActivate, ExecutionContext } from "@nestjs/common";
declare const GoogleGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class GoogleGuard extends GoogleGuard_base {
}
declare const AppleGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class AppleGuard extends AppleGuard_base {
}
export declare class CustomJwtGuards implements CanActivate {
    private readonly googleGuard;
    private readonly appleGuard;
    constructor(googleGuard: GoogleGuard, appleGuard: AppleGuard);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export {};
