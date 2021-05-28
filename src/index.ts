import express, { Request, Response } from "express";
import { } from 'jsonwebtoken';
import GithubRouter from './controller/github';
import AuthRouter from './controller/auth';
import { setupDB } from "./service/database";
require('dotenv').config();

(async () => {

    const app = express();

    /* Healthchecks */
    app.get('/', (req: Request, res: Response) => {
        res.sendStatus(200);
    });

    /* Setup all the Routers */
    app.use('/', AuthRouter);
    app.use('/github', GithubRouter);

    await setupDB();

    /* Listen on port 3000 */
    app.listen(3000, () => {
        console.log('Live');
    });

})();