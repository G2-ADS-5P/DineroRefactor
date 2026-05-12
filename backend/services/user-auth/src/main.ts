import { bootstrapHttpApp } from "@shared/infra/http/bootstrap-http-app";
import { AppModule } from "./app.module";

void bootstrapHttpApp(AppModule, {
  title: "User Auth API",
  description: "Microsservico de usuarios, autenticacao, JWT e permissoes.",
  port: process.env.PORT,
});
