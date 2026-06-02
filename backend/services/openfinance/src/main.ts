import { bootstrapHttpApp } from "@shared/infra/http/bootstrap-http-app";
import { AppModule } from "./app.module";

void bootstrapHttpApp(AppModule, {
  title: "OpenFinance API",
  description: "Microsserviço de conexões bancárias via Open Finance.",
  port: process.env.PORT,
});
