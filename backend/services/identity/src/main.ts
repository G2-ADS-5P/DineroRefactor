import { bootstrapHttpApp } from "@shared/infra/http/bootstrap-http-app";
import { AppModule } from "./app.module";

void bootstrapHttpApp(AppModule, {
  title: "Dinero Identity API",
  description: "Microsservico de identidade, perfil e preferencias.",
  port: process.env.PORT,
});
