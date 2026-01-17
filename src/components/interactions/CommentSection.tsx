/**
 * Comment Section Component
 * Display and add comments with threading support
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { MessageCircle, Send, Trash2 } from 'lucide-react';
import { useUniversalInteractions, ItemType } from '../../src/hooks/useUniversalInteractions';
import { formatDistanceToNow } from 'date-fns';

interface CommentSectionProps {
  itemType: ItemType;
  itemId: string;
  className?: string;
}

export function CommentSection({ itemType, itemId, className }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  
  const {
    comments,
    commentCount,
    addComment,
    deleteComment,
    loading,
  } = useUniversalInteractions(itemType, itemId);

  async function handleAddComment() {
    if (!newComment.trim()) return;
    
    await addComment(newComment);
    setNewComment('');
  }

  async function handleAddReply(parentId: string) {
    if (!replyContent.trim()) return;
    
    await addComment(replyContent, parentId);
    setReplyContent('');
    setReplyTo(null);
  }

  async function handleDeleteComment(commentId: string) {
    if (confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(commentId);
    }
  }

  // Group comments by parent
  const topLevelComments = comments.filter(c => !c.parent_comment_id);
  const getReplies = (parentId: string) => 
    comments.filter(c => c.parent_comment_id === parentId);

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5" />
        <h3 className="font-semibold">
          Comments ({commentCount})
        </h3>
      </div>

      {/* Add Comment */}
      <div className="mb-6">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-2"
          rows={3}
        />
        <Button
          onClick={handleAddComment}
          disabled={!newComment.trim() || loading}
          size="sm"
        >
          <Send className="h-4 w-4 mr-2" />
          Post Comment
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {topLevelComments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          topLevelComments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              {/* Comment */}
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user?.avatar_url} />
                  <AvatarFallback>
                    {comment.user?.display_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {comment.user?.display_name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-sm">{comment.content}</p>
                  
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyTo(comment.id)}
                      className="h-7 text-xs"
                    >
                      Reply
                    </Button>
                    
                    {comment.user_id === comment.user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="h-7 text-xs text-destructive"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Reply Form */}
              {replyTo === comment.id && (
                <div className="ml-11 space-y-2">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAddReply(comment.id)}
                      disabled={!replyContent.trim()}
                    >
                      Reply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReplyTo(null);
                        setReplyContent('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {getReplies(comment.id).map((reply) => (
                <div key={reply.id} className="ml-11 flex gap-3">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={reply.user?.avatar_url} />
                    <AvatarFallback>
                      {reply.user?.display_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {reply.user?.display_name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-sm">{reply.content}</p>
                    
                    {reply.user_id === reply.user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(reply.id)}
                        className="h-7 text-xs text-destructive"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
