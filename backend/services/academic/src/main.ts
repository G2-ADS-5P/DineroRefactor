import { bootstrapHttpApp } from "@shared/infra/http/bootstrap-http-app";
import { AppModule } from "./app.module";

void bootstrapHttpApp(AppModule, {
  title: "Academic API",
  description: "Microsservico de alunos, professores e disciplinas.",
  port: process.env.PORT,
});
