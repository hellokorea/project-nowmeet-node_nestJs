import { Module, forwardRef } from "@nestjs/common";
import { InAppController } from "./controller/in-app.controller";
import { InAppService } from "./service/in-app.service";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [InAppController],
  providers: [InAppService],
  exports: [],
})
export class InAppModule {}
