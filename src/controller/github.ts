import { Request, Response, Router } from 'express';
import { authCreateJWT, getRedirectCode, storeRedirectCode } from '../service/auth';
import { githubAuthURL, githubFetchState, githubFetchUser } from '../service/github';
import { dataFetchUser } from '../service/database';
import BuildUrl from 'build-url';
import { User } from '../types/user';

const router = Router();

/*
 *  /login
 *  Send the user to github
 */
router.get('/login', (req: Request, res: Response) => {
    // fetch the redirect uri
    const redirect_uri = 'https://dogehouse.online/dashboard';
    // store id:redirect_uri in redis (w expiration)
    res.redirect(
        githubAuthURL(redirect_uri)
    );
});

/*
 * /callback
 * Process data from github
 */
router.get('/callback', async (req: Request, res: Response) => {
    res.redirect(await (async () => {
        if (!req.query['code'])
            return '/github/login';
        if (!req.query['state'])
            return '/';
        const access_token = await githubFetchState(req.query['code'].toString());
        
        const githubuser = await githubFetchUser(access_token);
        console.log(githubuser.id);

        const user = await dataFetchUser('github', githubuser.id.toString(), () => User.create(
            {
                username: githubuser.name || '',
                avatar: githubuser.avatar_url || '',
                bio: githubuser.bio || ''
            }
        ))

        return BuildUrl(
            getRedirectCode(req.query['state'].toString() || ''), {
                queryParams: {
                    'token': authCreateJWT(user)
                }
            }
        );
    })());
});

export default router;