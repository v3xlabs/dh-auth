import { authCreateJWT } from '../service/auth';
import { googleAuthURL, googleFetchState, googleFetchUser } from '../service/google';
import { dataFetchUser } from '../service/database';
import BuildUrl from 'build-url';
import { User } from '../types/user';
import { getRedirectCode } from '../service/redis';


export default function (fastify, _opts, next) {
    /*
    *  /login
    *  Send the user to google
    */
    fastify.get('/login', async (_request, reply) => {

        const redirect_uri = 'https://dogehouse.online/dashboard';
        return reply.redirect(
            await googleAuthURL(redirect_uri)
        );

    });


    /*
     * /callback
     * Process data from google
     */
    fastify.get('/callback', async (request, reply) => {
        return reply.redirect(await (async () => {
            if (!request.query['code'])
                return '/google/login';
            if (!request.query['state'])
                return '/';
            const access_token = await googleFetchState(request.query['code'].toString());

            const googleUser = await googleFetchUser(access_token);
            console.log(googleUser.id);

            const user_instance = await dataFetchUser('google', googleUser.id.toString(), () => User.create(
                {
                    username: googleUser.name || '',
                    avatar: googleUser.picture || '',
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