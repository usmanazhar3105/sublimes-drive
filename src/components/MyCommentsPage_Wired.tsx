import { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Loader2, MessageSquare, ArrowLeft } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

interface MyCommentsPageProps {
  onNavigate?: (page: string) => void;
}

interface CommentRow {
  id: string;
  post_id?: string | null;
  user_id?: string | null;
  author_id?: string | null;
  created_by?: string | null;
  body?: string | null;
  content?: string | null;
  created_at: string;
}

interface PostRow {
  id: string;
  title?: string | null;
  body?: string | null;
  content?: string | null;
  images?: string[] | null;
  media?: any[] | null;
}

export function MyCommentsPage({ onNavigate }: MyCommentsPageProps) {
  const [rows, setRows] = useState<(CommentRow & { post?: PostRow | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRows([]);
        setLoading(false);
        return;
      }

      let q = supabase.from('comments').select('*').order('created_at', { ascending: false });
      const uid = user.id;
      const { data: draft, error } = await q.or(`user_id.eq.${uid},author_id.eq.${uid},created_by.eq.${uid}`);
      if (error) throw error;

      const comments = (draft || []) as CommentRow[];
      const postIds = Array.from(new Set(comments.map(c => c.post_id).filter(Boolean))) as string[];

      let postMap: Record<string, PostRow> = {};
      if (postIds.length) {
        const { data: posts } = await supabase
          .from('posts')
          .select('id, title, body, content, images, media')
          .in('id', postIds);
        (posts || []).forEach(p => { postMap[p.id] = p; });
      }

      setRows(comments.map(c => ({ ...c, post: c.post_id ? postMap[c.post_id] : null })));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">My Comments</h1>
            <p className="text-sm text-muted-foreground">Your recent comments across communities</p>
          </div>
          <Button variant="outline" onClick={() => onNavigate?.('profile')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
          </Button>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-1">No comments yet</h3>
              <p className="text-sm text-muted-foreground">Join a conversation in Communities</p>
              <div className="mt-4">
                <Button onClick={() => onNavigate?.('communities')}>Go to Communities</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {rows.map((c) => {
              const text = c.body || c.content || '';
              const postTitle = c.post?.title || c.post?.content || c.post?.body || 'Post';
              return (
                <Card key={c.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="pr-4">
                        <div className="text-xs text-muted-foreground mb-1">
                          {new Date(c.created_at).toLocaleDateString()} • on {postTitle}
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{text}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Comment</Badge>
                        {c.post && (
                          <Button size="sm" variant="outline" onClick={() => onNavigate?.('communities')}>
                            View Post
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
