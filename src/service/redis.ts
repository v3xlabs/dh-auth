import { createClient, RedisClient } from "redis";

let client: RedisClient = null;

export async function setupRedis(): Promise<void> {
    return new Promise<void>((acc, rej) => {
        client = createClient({
            host: process.env.REDIS_HOST
        });
        client.on('ready', () => {
            acc();
        });
    });
}

export async function storeRedirectCode(redirect_uri: string, code: string): Promise<void> {
    return new Promise<void>((acc, rej) => {
        client.set('dh_redirect_' + code, redirect_uri, (error) => {
            if (error) {
                rej(error);
                return;
            }
            client.expire('dh_redirect_' + code, 60 * 5, (error) => {
                if (error) {
                    rej(error);
                    return;
                }
                acc();
            })
        })
    });
}

export async function getRedirectCode(code: string): Promise<string> {
    return new Promise<string>((acc, rej) => {
        client.get('dh_redirect_' + code, (error, reply) => {
            if (error) {
                rej(error);
                return;
            }
            client.del('dh_redirect_' + code, (error) => {
                if (error) {
                    rej(error);
                    return;
                }
                acc(reply)
            });
        });
    });
}