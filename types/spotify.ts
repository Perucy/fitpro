export interface SpotifyUser {
    id: string;
    display_name: string;
    email: string;
    followers: { total: number };
    images: { url: string }[];
    country?: string;
    product?: string;
}

export interface AuthResult {
    success: boolean;
    user_id: string;
    user_info: SpotifyUser;
    message: string;
}