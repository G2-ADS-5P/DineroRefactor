import { bootstrapHttpApp } from "@shared/infra/http/bootstrap-http-app";
import { AppModule } from "./app.module";

void bootstrapHttpApp(AppModule, {
  title: "Class Offering API",
  description: "Microsservico de ofertas de turma.",
  port: process.env.PORT,
});
