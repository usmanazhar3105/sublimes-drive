import { useState } from 'react';
import { usePosts, useComments, useReplies } from '@/features/community/hooks';

export default function CommunityDebug() {
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const { items: posts, add: addPost, toggleLike: likePost } = usePosts();
  const { items: comments, add: addComment, toggleLike: likeComment } = useComments(selectedPost);
  const { items: replies, add: addReply, toggleLike: likeReply } = useReplies(selectedComment);

  return (
    <div className="p-6 space-y-6">
      <div className="space-x-2">
        <button onClick={() => addPost('Hello from CommunityDebug')} className="px-3 py-2 rounded bg-black text-white">Add Post</button>
      </div>

      <h2 className="font-bold text-lg">Posts</h2>
      <ul className="space-y-2">
        {posts.map(p => (
          <li key={p.id} className="border rounded p-3">
            <div className="flex items-center gap-2">
              <button onClick={() => likePost(p.id)} className="px-2 py-1 border rounded">Like/Unlike</button>
              <button onClick={() => setSelectedPost(p.id)} className="px-2 py-1 border rounded">{selectedPost === p.id ? 'Selected' : 'Select'}</button>
            </div>
            <div className="text-sm opacity-80">{p.content}</div>
          </li>
        ))}
      </ul>

      {selectedPost && (
        <>
          <div className="mt-6 space-x-2">
            <button onClick={() => addComment('Nice post!')} className="px-3 py-2 rounded bg-black text-white">Add Comment</button>
          </div>
          <h3 className="font-semibold">Comments for post {selectedPost.slice(0,8)}…</h3>
          <ul className="space-y-2">
            {comments.map(c => (
              <li key={c.id} className="border rounded p-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => likeComment(c.id)} className="px-2 py-1 border rounded">Like/Unlike</button>
                  <button onClick={() => setSelectedComment(c.id)} className="px-2 py-1 border rounded">{selectedComment === c.id ? 'Selected' : 'Select'}</button>
                </div>
                <div className="text-sm opacity-80">{c.content}</div>
              </li>
            ))}
          </ul>
        </>
      )}

      {selectedComment && (
        <>
          <div className="mt-6 space-x-2">
            <button onClick={() => addReply('Replying…')} className="px-3 py-2 rounded bg-black text-white">Add Reply</button>
          </div>
          <h4 className="font-semibold">Replies for comment {selectedComment.slice(0,8)}…</h4>
          <ul className="space-y-2">
            {replies.map(r => (
              <li key={r.id} className="border rounded p-3">
                <button onClick={() => likeReply(r.id)} className="px-2 py-1 border rounded">Like/Unlike</button>
                <div className="text-sm opacity-80">{r.content}</div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

