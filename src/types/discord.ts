export type DiscordUser = {
    id: string,    
    username?: string,    
    discriminator?: string,    
    avatar?: string,    
    verified?: true,
    email?: string, 
    flags?: 64,
    premium_type?: 1,
    public_flags?: 64
};