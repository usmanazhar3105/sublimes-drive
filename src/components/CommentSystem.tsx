import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { EmojiPicker } from './EmojiPicker';
import { GifPicker } from './GifPicker';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useCommunityInteractions } from '../hooks/useCommunityInteractions';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';
import { 
  Heart, 
  MessageCircle, 
  MoreHorizontal, 
  Image, 
  Flag, 
  Trash2,
  Reply,
  X,
  Send,
  Edit
} from 'lucide-react';

interface Comment {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    role: 'admin' | 'editor' | 'car-owner' | 'garage-owner' | 'browser';
    verified: boolean;
    isAnonymous?: boolean;
  };
  content: {
    text?: string;
    images?: string[];
    gif?: string;
  };
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies: Comment[];
  isEdited?: boolean;
}

interface CommentSystemProps {
  postId: string;
  comments: Comment[];
  onAddComment: (postId: string, comment: Omit<Comment, 'id' | 'timestamp' | 'likes' | 'isLiked' | 'replies'>) => void;
  onLikeComment: (commentId: string) => void;
  onReplyToComment: (commentId: string, reply: Omit<Comment, 'id' | 'timestamp' | 'likes' | 'isLiked' | 'replies'>) => void;
  onDeleteComment?: (commentId: string) => void;
  onReportComment?: (commentId: string) => void;
  currentUser: {
    name: string;
    username: string;
    avatar: string;
    role: 'admin' | 'editor' | 'car-owner' | 'garage-owner' | 'browser';
    verified: boolean;
  };
}

export function CommentSystem({ 
  postId,
  comments, 
  onAddComment, 
  onLikeComment,
  onReplyToComment,
  onDeleteComment,
  onReportComment,
  currentUser 
}: CommentSystemProps) {
  const { addComment, toggleCommentLike, loading } = useCommunityInteractions();
  
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayComments, setDisplayComments] = useState<Comment[]>(comments);

  useEffect(() => {
    setDisplayComments(comments);
  }, [comments]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { text: 'Admin', style: 'bg-[var(--sublimes-gold)] text-black' };
      case 'editor':
        return { text: 'Editor', style: 'bg-blue-500 text-white' };
      case 'car-owner':
        return { text: 'Car Owner', style: 'bg-green-500 text-white' };
      case 'garage-owner':
        return { text: 'Garage Owner', style: 'bg-purple-500 text-white' };
      case 'browser':
        return { text: 'Browser', style: 'bg-gray-500 text-white' };
      default:
        return { text: 'Member', style: 'bg-gray-500 text-white' };
    }
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    
    const newImages: string[] = [];
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        newImages.push(url);
      }
    });
    
    setUploadedImages(prev => [...prev, ...newImages]);
    setSelectedGif(null); // Clear GIF if images are added
  };

  const handleGifSelect = (gifUrl: string) => {
    setSelectedGif(gifUrl);
    setUploadedImages([]); // Clear images if GIF is selected
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewComment(prev => prev + emoji);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() && uploadedImages.length === 0 && !selectedGif) return;

    // Build media array with images and GIF
    const media = [];
    if (uploadedImages.length > 0) {
      media.push(...uploadedImages.map(url => ({ type: 'image', url })));
    }
    if (selectedGif) {
      media.push({ type: 'gif', url: selectedGif });
    }

    // Call database
    const commentId = await addComment(
      postId,
      newComment.trim() || '',
      undefined, // no parent (not a reply)
      media.length > 0 ? media : undefined
    );

    if (commentId) {
      // Reset form immediately for better UX
      setNewComment('');
      setUploadedImages([]);
      setSelectedGif(null);
      
      // Trigger parent to refresh comments from backend
      // The parent's handleAddComment will refresh the comments list
      onAddComment(postId, {} as any);
    }
  };

  const handleSubmitReply = async (commentId: string) => {
    if (!replyText.trim()) return;

    // Call database with parent_id for reply
    const replyId = await addComment(
      postId,
      replyText.trim(),
      commentId, // parent comment ID
      undefined // no media for now
    );

    if (replyId) {
      // Reset form immediately
      setReplyText('');
      setReplyingTo(null);
      
      // Trigger parent to refresh comments from backend
      // The parent's handleReplyToComment will refresh the comments list
      onReplyToComment(commentId, {} as any);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeGif = () => {
    setSelectedGif(null);
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const [isEditingComment, setIsEditingComment] = useState(false);
    const [editedCommentText, setEditedCommentText] = useState(comment.content.text || '');
    
    const displayUser = comment.user.isAnonymous ? {
      name: 'Anonymous',
      username: 'anonymous',
      avatar: '',
      role: comment.user.role,
      verified: false
    } : comment.user;

    const handleEditComment = async () => {
      try {
        const { data, error } = await supabase.rpc('fn_edit_comment', {
          p_comment_id: comment.id,
          p_content: editedCommentText
        });

        if (error) throw error;

        // Check if function returned an error in the response
        if (data && !data.success) {
          throw new Error(data.message || data.error || 'Failed to update comment');
        }

        toast.success('Comment updated successfully!');
        setIsEditingComment(false);
        
        // Refresh comments instead of full page reload
        if (onAddComment) {
          // Trigger a refresh by calling the parent's refresh handler
          // This is better than window.location.reload()
          setTimeout(() => {
            window.location.reload(); // Fallback to reload if no refresh handler
          }, 500);
        } else {
          window.location.reload();
        }
      } catch (error: any) {
        console.error('Error updating comment:', error);
        const errorMessage = error?.message || error?.error || 'Failed to update comment';
        toast.error(errorMessage);
      }
    };

    return (
      <div className={`flex space-x-3 ${isReply ? 'ml-12 mt-3' : 'mb-4'}`}>
        <Avatar className="h-8 w-8 ring-1 ring-border">
          {displayUser.avatar ? (
            <AvatarImage src={displayUser.avatar} />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
          )}
          <AvatarFallback>{displayUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="bg-muted rounded-lg p-3">
            {/* User Info */}
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-medium text-sm">{displayUser.name}</span>
              {comment.user.isAnonymous && (
                <Badge variant="secondary" className="text-xs bg-gray-500 text-white">
                  Anonymous
                </Badge>
              )}
              <Badge 
                variant="secondary" 
                className={`text-xs ${getRoleBadge(displayUser.role).style}`}
              >
                {getRoleBadge(displayUser.role).text}
              </Badge>
              {displayUser.verified && (
                <div className="w-3 h-3 rounded-full bg-[var(--sublimes-gold)] flex items-center justify-center">
                  <span className="text-xs text-black">✓</span>
                </div>
              )}
              <span className="text-xs text-muted-foreground">@{displayUser.username}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
              {comment.isEdited && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
            </div>

            {/* Content */}
            {isEditingComment ? (
              <div className="space-y-2">
                <Textarea
                  value={editedCommentText}
                  onChange={(e) => setEditedCommentText(e.target.value)}
                  className="text-sm resize-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button onClick={handleEditComment} size="sm" className="h-7 text-xs">
                    Save
                  </Button>
                  <Button onClick={() => setIsEditingComment(false)} size="sm" variant="outline" className="h-7 text-xs">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              comment.content.text && (
                <p className="text-sm mb-2 whitespace-pre-wrap">{comment.content.text}</p>
              )
            )}

            {/* Images */}
            {comment.content.images && comment.content.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-2">
                {comment.content.images.map((image, index) => (
                  <ImageWithFallback
                    key={index}
                    src={image}
                    alt={`Comment image ${index + 1}`}
                    className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-90"
                    onClick={() => {
                      // Open in media viewer
                      console.log('Open comment image:', image);
                    }}
                  />
                ))}
              </div>
            )}

            {/* GIF */}
            {comment.content.gif && (
              <div className="mb-2">
                <img
                  src={comment.content.gif}
                  alt="GIF"
                  className="max-w-48 h-auto rounded cursor-pointer hover:opacity-90"
                  onClick={() => {
                    console.log('Open GIF:', comment.content.gif);
                  }}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 mt-2 text-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const res = await toggleCommentLike(comment.id);
                setDisplayComments(prev => prev.map(c => c.id === comment.id ? { ...c, isLiked: !!(res && (res as any).liked), likes: Math.max(0, (c.likes || 0) + ((res && (res as any).liked) ? 1 : -1)) } : c));
                onLikeComment(comment.id);
              }}
              disabled={loading}
              className={`h-6 px-2 ${comment.isLiked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
            >
              <Heart className={`h-3 w-3 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
              {comment.likes > 0 ? comment.likes : 'Like'}
            </Button>

            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(comment.id)}
                className="h-6 px-2 text-muted-foreground hover:text-foreground hover:text-blue-500"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}

            {comment.user.username === currentUser.username && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingComment(!isEditingComment)}
                  className="h-6 px-2 text-muted-foreground hover:text-blue-500"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                {onDeleteComment && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Delete this comment?')) {
                        onDeleteComment(comment.id);
                      }
                    }}
                    className="h-6 px-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                )}
              </>
            )}

            {onReportComment && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onReportComment(comment.id)}>
                    <Flag className="h-3 w-3 mr-2" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3 p-3 bg-background rounded-lg border border-border">
              <div className="flex space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder={`Reply to ${displayUser.name}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={2}
                    className="resize-none text-sm"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-1">
                      <EmojiPicker onEmojiSelect={(emoji) => setReplyText(prev => prev + emoji)} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={!replyText.trim()}
                        className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-4 flex items-center">
          <MessageCircle className="h-4 w-4 mr-2" />
          Comments ({comments.length})
        </h3>

        {/* Add Comment Form */}
        <div className="mb-6">
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="resize-none"
              />

              {/* Media Preview */}
              {(uploadedImages.length > 0 || selectedGif) && (
                <div className="mt-2 p-2 bg-muted rounded border">
                  {uploadedImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Upload ${index + 1}`}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedGif && (
                    <div className="relative inline-block">
                      <img
                        src={selectedGif}
                        alt="Selected GIF"
                        className="max-w-32 h-auto rounded"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeGif}
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-1">
                  <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                  <GifPicker onGifSelect={handleGifSelect} />
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() && uploadedImages.length === 0 && !selectedGif}
                  className="bg-[var(--sublimes-gold)] text-black hover:bg-[var(--sublimes-gold)]/80"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {displayComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>

        {comments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No comments yet</p>
            <p className="text-sm">Be the first to comment!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}