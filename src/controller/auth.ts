import { CONFIG } from "../service/config";
import { ContentType, HeaderItem } from "../types/fastify-utils";

/*
    Login Endpoint
    -> If user is already logged in
        -> Redirect them to the REDIRECT URI
    -> If user is not already logged in
        -> Show them an options screen on how to login
*/
export default function (fastify, _opts, next) {
  fastify.get("/login", (_request, reply) => {
    return reply
      .code(200)
      .header(HeaderItem.CONTENT_TYPE, ContentType.TEXT_HTML)
      .send("Hello, login using github or discord");
  });

  next();
}
/**
 * Checks redirect url. 
 * Returns CONFIG.REDIRECT_URL if redirect url is not redirecting to mobile app or official domain
 * @param  {string|undefined} url
 * @returns string
 */
export const checkRedirectUrl = (url: string | undefined): string => {
  if (!url) return CONFIG.REDIRECT_URL
  if(url.startsWith('dogehouse://') || url.startsWith('https://dogehouse.online/')) {
      return url
    } else {
      return CONFIG.REDIRECT_URL
  }
}
