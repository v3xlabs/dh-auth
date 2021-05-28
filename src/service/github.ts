import buildURL from "build-url";
import { CONFIG } from "./config";
import {v4 as uuidv4} from 'uuid';
import { storeRedirectCode } from "./auth";
import fetch from "node-fetch";
import { GithubUser } from "../types/github";

export function githubAuthURL(redirect_uri: string = process.env.SITE_URL): string {
    const id = uuidv4();
    storeRedirectCode(redirect_uri, id);
    return buildURL(
        CONFIG.GITHUB_URL, {
            queryParams: {
                client_id: process.env.GITHUB_CLIENT_ID,
                redirect_uri: process.env.GITHUB_REDIRECT_URI,
                scope: 'user:user,user:email',
                state: id
            }
        }
    )
}

/**
 * Converts the Github OAuthCode into their User ID
 * @param code Github Code
 * @returns Github User ID
 */
export async function githubFetchState(code: string): Promise<string> {
    const res = await fetch(
        buildURL(
            'https://github.com/login/oauth/access_token', {
                queryParams: {
                    client_id: process.env.GITHUB_CLIENT_ID,
                    client_secret: process.env.GITHUB_CLIENT_SECRET,
                    code: code
                }
            }));
    const response = await res.text();
    if (!response.includes('access_token='))
        throw new Error('No access_token found');
    const access_token = response.replace(/access_token\=(.*)&scope.*/g, '$1');

    //TODO: Check if access token matches the correct pattern [a-zA-Z0-9_]

    return access_token;
}

export async function githubFetchUser(access_token: string): Promise<GithubUser> {
    const res = await fetch(
        buildURL(
            'https://api.github.com/user'
        )
    , {
        headers: {
            'Authorization': 'token ' + access_token
        }
    });
    return await res.json();
}