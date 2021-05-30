import { User } from "../types/user";
import { sign } from 'jsonwebtoken';

export function authCreateJWT(user: User): string {
    return sign({
        id: user.id
    }, process.env.AUTH_TOKEN, {
        issuer: 'auth',
        expiresIn: "10h"
    });
}