import { bootstrapHttpApp } from "@shared/infra/http/bootstrap-http-app";
import { AppModule } from "./app.module";

void bootstrapHttpApp(AppModule, {
  title: "Dinero Financial API",
  description:
    "Microsservico de transacoes, cartoes, categorias, balanco, sync e reconciliacao.",
  port: process.env.PORT,
});
