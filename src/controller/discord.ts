import { authCreateJWT } from "../service/auth";
import {
  discordAuthURL,
  discordFetchState,
  discordFetchUser,
} from "../service/discord";
import { dataFetchUser } from "../service/database";
import BuildUrl from "build-url";
import { User } from "../types/user";
import { getRedirectCode } from "../service/redis";

export default function (fastify, _opts, next) {
  /*
  *  /login
  *  Send the user to discord
  */
  fastify.get("/login", async (_request, reply) => {
    const redirect_uri = "https://dogehouse.online/dashboard";
    return reply
      .redirect(
        await discordAuthURL(redirect_uri),
      );
  });

  /*
  * /callback
  * Process data from discord
  */
  fastify.get("/callback", async (request, reply) => {
    return reply.redirect(await (async () => {
      if (!request.query['code'])
        return '/discord/login';
      if (!request.query['state'])
        return '/';
      const access_token = await discordFetchState(request.query['code'].toString());

      const discordUser = await discordFetchUser(access_token);
      console.log(discordUser.id);

      const user_instance = await dataFetchUser('discord', discordUser.id.toString(), () => User.create(
        {
          username: discordUser.username || '',
          avatar: (discordUser.avatar ? 'https://cdn.discordapp.com/' + discordUser.avatar + '.jpeg' : ''),
          bio: ''
        }
      ))

      return BuildUrl(
        await getRedirectCode(request.query['state'].toString() || ''), {
        queryParams: {
          'token': authCreateJWT(user_instance)
        }
      }
      );

    })());
  });

  next();
}
