import { bootstrapHttpApp } from "@shared/infra/http/bootstrap-http-app";
import { AppModule } from "./app.module";

void bootstrapHttpApp(AppModule, {
  title: "Enrollment API",
  description: "Microsservico de matriculas em turmas.",
  port: process.env.PORT,
});
