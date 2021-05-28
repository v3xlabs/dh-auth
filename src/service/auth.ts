import { User } from "../types/user";
import { sign } from 'jsonwebtoken';

export function authCreateJWT(user: User): string {
    return sign({
        id: user.id
    }, process.env.AUTH_TOKEN, {
        issuer: 'auth',
        expiresIn: "10m"
    });
}

//TODO connect this to DB
const totallyARedisDB: {[key: string]: string} = {};

export function storeRedirectCode(redirect_uri: string, code: string) {
    totallyARedisDB[code] = redirect_uri;
}

export function getRedirectCode(code: string): string {
    return totallyARedisDB[code];
}