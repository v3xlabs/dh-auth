import buildURL from "build-url";
import { CONFIG } from "./config";
import {v4 as uuidv4} from 'uuid';
import fetch, { BodyInit, HeaderInit } from "node-fetch";
import { GoogleUser } from "../types/google";
import FormData from "form-data";
import { storeRedirectCode } from "./redis";

export async function googleAuthURL(redirect_uri: string = process.env.SITE_URL): Promise<string> {
    const id = uuidv4();
    await storeRedirectCode(redirect_uri, id);
    return buildURL(
        CONFIG.GOOGLE_URL, {
            queryParams: {
                response_type: 'code',
                client_id: process.env.GOOGLE_CLIENT_ID,
                access_type: 'offline',
                redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                scope: 'openid email profile',
                approval_prompt: 'auto',
                state: id
            }
        }
    )
}

/**
 * Converts the Google OAuthCode into their User ID
 * @param code Google Code
 * @returns Google User ID
 */
export async function googleFetchState(code: string): Promise<string> {

    const bodyFormData = new FormData();
    bodyFormData.append("code", code);
    bodyFormData.append("redirect_uri", process.env.GOOGLE_REDIRECT_URI);
    bodyFormData.append("grant_type", "authorization_code");
    bodyFormData.append("client_id", process.env.GOOGLE_CLIENT_ID);
    bodyFormData.append("client_secret", process.env.GOOGLE_CLIENT_SECRET);
    bodyFormData.append("scope", "openid email profile");

    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: 'POST',
        headers: bodyFormData.getHeaders(),
        body: bodyFormData,
        redirect: 'follow'
    });

    const responseJsonParsed = await response.json();

    if (!responseJsonParsed?.access_token)
        throw new Error('No access_token found');
    const access_token = responseJsonParsed.access_token;

    return access_token;
}

export async function googleFetchUser(access_token: string): Promise<GoogleUser> {
    const res = await fetch(
        buildURL(
            'https://www.googleapis.com/oauth2/v1/userinfo',
            { 
                queryParams: {
                    alt:"json",
                    access_token: access_token
                }
            }
        )
    );
    return await res.json();
}