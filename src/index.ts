import express, { Request, Response } from "express";
import {} from "jsonwebtoken";
import GithubRouter from "./controller/github";
import AuthRouter from "./controller/auth";
import { setupDB } from "./service/database";
require("dotenv").config();

import fastifyRef from "fastify";
import { ContentType, HeaderItem } from "./types/fastify-utils";
const fastify = fastifyRef({ logger: true });

fastify.register(AuthRouter);
fastify.register(GithubRouter, { prefix: "/github" });

fastify.get("/", async (_request, reply) => {
  return reply
    .code(200)
    .header(HeaderItem.CONTENT_TYPE, ContentType.TEXT_HTML)
    .send("");
});

const start = async () => {
  try {
    await setupDB();
    await fastify.listen(3000);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
