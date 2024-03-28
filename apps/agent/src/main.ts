/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app/app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { urlencoded, json } from "express";
import * as fs from "fs";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const origins = (process.env.ALLOWED_ORIGINS || "").split(",");
  app.enableCors({
    origin: origins.length > 1 ? origins : origins[0] || "",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  });
  app.use(json({ limit: "40mb" }));
  app.use(urlencoded({ extended: true, limit: "40mb" }));

  const globalPrefix = "api";
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.AGENT_PORT || 3001;
  app.enableShutdownHooks();

  if (process.env.SWAGGER === "true") {
    const config = new DocumentBuilder()
      .setTitle("Agent")
      .setDescription("Agent API")
      .setVersion("1.0")
      .addBearerAuth()
      .addBasicAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    fs.writeFileSync("./agent-swagger.json", JSON.stringify(document, null, 2));
    SwaggerModule.setup("api", app, document);
    Logger.log(`Swagger file written`);
    return process.kill(0);
  }

  await app.listen(port, "0.0.0.0");
  Logger.log(
    `🚀 Application is running on: http://0.0.0.0:${port}/${globalPrefix}`,
  );
}

bootstrap();
