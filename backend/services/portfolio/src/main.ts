import { bootstrapHttpApp } from "@shared/infra/http/bootstrap-http-app";
import { AppModule } from "./app.module";

void bootstrapHttpApp(AppModule, {
  title: "Portfolio API",
  description: "Microsservico de portfolio de investimentos.",
  port: process.env.PORT,
});
