import { Request, Response, Router } from 'express';

const router = Router();

/*
    Login Endpoint
    -> If user is already logged in
        -> Redirect them to the REDIRECT URI
    -> If user is not already logged in
        -> Show them an options screen on how to login
*/
router.get('/login', (req: Request, res: Response) => {
    res.send('Hello, login using github or discord');
});

export default router;