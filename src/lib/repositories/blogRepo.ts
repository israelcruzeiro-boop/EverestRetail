import { supabase } from '../supabase';
import { BlogPost, PostRating, PostComment } from '@/types/blog';

export const blogRepo = {
    async getPosts(): Promise<BlogPost[]> {
        const { data, error } = await supabase
            .from('posts')
            .select('*, profile:profiles(name, avatar_url)')
            .order('boosted_until', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching posts:', error);
            return [];
        }

        return data || [];
    },

    async createPost(post: { title: string; content: string; image_url?: string }): Promise<BlogPost | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('posts')
            .insert([{
                ...post,
                profile_id: user.id
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating post:', error);
            throw error;
        }

        return data;
    },

    async getComments(postId: string): Promise<PostComment[]> {
        const { data, error } = await supabase
            .from('post_comments')
            .select('*, profile:profiles(name, avatar_url)')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching comments:', error);
            return [];
        }

        return data || [];
    },

    async addComment(postId: string, content: string): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { error } = await supabase
            .from('post_comments')
            .insert([{
                post_id: postId,
                profile_id: user.id,
                content
            }]);

        if (error) {
            console.error('Error adding comment:', error);
            return false;
        }

        return true;
    },

    async getMyRating(postId: string): Promise<number | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('post_ratings')
            .select('rating')
            .eq('post_id', postId)
            .eq('profile_id', user.id)
            .maybeSingle();

        if (error) return null;
        return data?.rating || null;
    },

    async submitRating(postId: string, rating: number): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        try {
            const { data, error } = await supabase
                .from('post_ratings')
                .upsert({
                    post_id: postId,
                    profile_id: user.id,
                    rating
                }, { onConflict: 'post_id,profile_id' })
                .select('*');

            if (error) {
                console.error('Error submitting rating:', error);
                alert(`Erro Supabase: ${error.message} \nDetalhes: ${error.details}`);
                return false;
            }

            if (!data || data.length === 0) {
                alert('Erro Silencioso do Banco: O post não salvou a nota. O gatilho de média (update_post_rating) pode estar revertendo a transação.');
                return false;
            }

            return true;
        } catch (err: any) {
            console.error('Crash no submitRating:', err);
            alert(`Exception: ${err.message}`);
            return false;
        }
    },

    async deletePost(postId: string): Promise<boolean> {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);

        if (error) {
            console.error('Error deleting post:', error);
            return false;
        }

        return true;
    }
};
