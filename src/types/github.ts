export type GithubUser = {
    login?: string;
    id?: number; // what we need
    node_id?: string;
    avatar_url?: string;
    gravatar_id?: string;
    url?: string;
    html_url?: string;
    followers_url?: string;
    following_url?: string;
    gists_url?: string;
    starred_url?: string;
    subscriptions_url?: string;
    organizations_url?: string;
    repos_url?: string;
    events_url?: string;
    received_events_url?: string;
    type?: 'User';
    site_admin?: boolean; // Ooh we could use this someday maybe
    name?: string;
    company?: string;
    blog?: string;
    location?: string;
    email?: string;
    hireable?: null;
    bio?: string;
    twitter_username?: null;
    public_repos?: 70;
    public_gists?: 1;
    followers?: 25;
    following?: 23;
    created_at?: string;
    updated_at?: string
};