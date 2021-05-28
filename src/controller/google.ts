import { Request, Response, Router } from 'express';
import { authCreateJWT, getRedirectCode, storeRedirectCode } from '../service/auth';
import { googleAuthURL, googleFetchState, googleFetchUser } from '../service/google';
import { dataFetchUser } from '../service/database';
import BuildUrl from 'build-url';
import { User } from '../types/user';
const router = Router();

/*
 *  /login
 *  Send the user to google
 */
router.get('/login', (req: Request, res: Response) => {

    const redirect_uri = 'https://dogehouse.online/dashboard';
    res.redirect(
        googleAuthURL(redirect_uri)
    );
    
});


/*
 * /callback
 * Process data from google
 */
router.get('/callback', async (req: Request, res: Response) => {
    res.redirect(await (async () => {
        if (!req.query['code'])
            return '/google/login';
        if (!req.query['state'])
            return '/';
        const access_token = await googleFetchState(req.query['code'].toString());

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
            getRedirectCode(req.query['state'].toString() || ''), {
            queryParams: {
                    'token': authCreateJWT(user_instance)
            }
        }
        );

    })());
});

export default router;