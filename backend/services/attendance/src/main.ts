import { bootstrapHttpApp } from "@shared/infra/http/bootstrap-http-app";
import { AppModule } from "./app.module";

void bootstrapHttpApp(AppModule, {
  title: "Attendance API",
  description: "Microsservico de registro e consulta de presencas.",
  port: process.env.PORT,
});
