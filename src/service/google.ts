import buildURL from "build-url";
import { CONFIG } from "./config";
import {v4 as uuidv4} from 'uuid';
import { storeRedirectCode } from "./auth";
import fetch, { BodyInit, HeaderInit } from "node-fetch";
import { GoogleUser } from "../types/google";

export function googleAuthURL(redirect_uri: string = process.env.SITE_URL): string {
    const id = uuidv4();
    storeRedirectCode(redirect_uri, id);
    return buildURL(
        CONFIG.GOOGLE_URL, {
            queryParams: {
                response_type: 'code',
                client_id: process.env.GITHUB_CLIENT_ID,
                access_type: 'online',
                redirect_uri: 'http://localhost:3000/google/callback',
                scope: 'openid%20profile%20email',
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

    const customHeaders = {"Content-Type": "application/x-www-form-urlencoded"};

    const body_formData = new FormData();
    body_formData.append("code", code);
    body_formData.append("redirect_uri", "http://localhost:3000/google/callback");
    body_formData.append("client_id", process.env.GOOGLE_CLIENT_ID);
    body_formData.append("client_secret", process.env.GOOGLE_CLIENT_SECRET);
    body_formData.append("scope", "openid%20profile%20email");
    body_formData.append("grant_type", "authorization_code");

    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: 'POST',
        headers: customHeaders as HeaderInit,
        body: body_formData as BodyInit,
        redirect: 'follow'
    });

    const response = await res.json();
    if (!response?.access_token)
        throw new Error('No access_token found');
    const access_token = response.access_token;

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