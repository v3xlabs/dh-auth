import GithubRouter from "./controller/github";
import AuthRouter from "./controller/auth";
import { setupDB } from "./service/database";
import fastifyRef from "fastify";
import { ContentType, HeaderItem } from "./types/fastify-utils";
require("dotenv").config();

const fastify = fastifyRef({ logger: !!process.env.FASTIFY_PRODUCTION, trustProxy: true });

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
    await fastify.listen(3000, '0.0.0.0');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
