import buildURL from "build-url";
import { CONFIG } from "./config";
import {v4 as uuidv4} from 'uuid';
import fetch, { BodyInit, HeaderInit } from "node-fetch";
import { DiscordUser } from "../types/discord";
import { storeRedirectCode } from "./redis";
import FormData from "form-data";

export async function discordAuthURL(redirect_uri: string = process.env.SITE_URL): Promise<string> {
    const id = uuidv4();
    await storeRedirectCode(redirect_uri, id);
    return buildURL(
        CONFIG.DISCORD_URL, {
            queryParams: {
                response_type: "code",
                prompt: "consent",
                client_id: process.env.DISCORD_CLIENT_ID,
                redirect_uri: process.env.DISCORD_REDIRECT_URI,
                scope: 'identify guilds.join',
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
export async function discordFetchState(code: string): Promise<string> {

    const bodyFormData = new FormData();
    bodyFormData.append("code", code);
    bodyFormData.append("redirect_uri", process.env.DISCORD_REDIRECT_URI);
    bodyFormData.append("grant_type", "authorization_code");
    bodyFormData.append("client_id", process.env.DISCORD_CLIENT_ID);
    bodyFormData.append("client_secret", process.env.DISCORD_CLIENT_SECRET);
    bodyFormData.append("scope", "identify");

    const response = await fetch("https://discord.com/api/v8", {
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

export async function discordFetchUser(access_token: string): Promise<DiscordUser> {
    const res = await fetch(
        buildURL(
            'https://discordapp.com/api/users/@me'
        )
    , {
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    });
    return await res.json();
}