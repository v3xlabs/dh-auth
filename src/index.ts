import fastifyRef from "fastify";
import { ContentType, HeaderItem } from "./types/fastify-utils";
import GithubRouter from "./controller/github";
import GoogleRouter from "./controller/google";
import DiscordRouter from "./controller/discord";
import AuthRouter from "./controller/auth";
import { setupDB } from "./service/database";
import { setupRedis } from "./service/redis";

/* Load .env variables */
require("dotenv").config();

const fastify = fastifyRef({ logger: process.env.FASTIFY_PRODUCTION == null ? true : !!process.env.FASTIFY_PRODUCTION, trustProxy: true });

/* Routers */
fastify.register(AuthRouter);
fastify.register(GithubRouter, { prefix: "/github" });
fastify.register(GoogleRouter, { prefix: "/google" });
fastify.register(DiscordRouter, { prefix: "/discord" });

/* Healthcheck */
fastify.get("/", async (_request, reply) => {
  return reply
    .code(200)
    .header(HeaderItem.CONTENT_TYPE, ContentType.TEXT_HTML)
    .send("");
});

/* Start Server */
const start = async () => {
  try {
    await setupDB();
    await setupRedis();
    await fastify.listen(3000, '0.0.0.0');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
