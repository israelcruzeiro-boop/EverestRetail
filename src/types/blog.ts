export interface BlogPost {
    id: string;
    profile_id: string;
    title: string;
    content: string;
    image_url?: string;
    average_rating: number;
    total_votes: number;
    created_at: string;
    updated_at: string;
    profile?: {
        name: string;
        avatar_url: string | null;
    };
    boosted_until?: string;
    is_highlight?: boolean;
}

export interface PostRating {
    id: string;
    post_id: string;
    profile_id: string;
    rating: number;
    created_at: string;
}

export interface PostComment {
    id: string;
    post_id: string;
    profile_id: string;
    content: string;
    created_at: string;
    profile?: {
        name: string;
        avatar_url: string | null;
    };
}
