import { useState, useEffect } from 'react'
import { toggleLike, publicImageUrl } from './api'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Heart } from 'lucide-react'

interface CommentItemProps {
  c: any
}

export default function CommentItem({ c }: CommentItemProps) {
  const [count, setCount] = useState<number>(() => {
    // Extract like count from the aggregated data
    if (c.community_comment_likes && Array.isArray(c.community_comment_likes) && c.community_comment_likes.length > 0) {
      return c.community_comment_likes[0].count || 0
    }
    return 0
  })
  const [liked, setLiked] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)

  // Check if current user has liked this comment
  useEffect(() => {
    const checkLiked = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('community_comment_likes')
        .select('id')
        .eq('comment_id', c.id)
        .eq('user_id', user.id)
        .single()

      setLiked(!!data)
    }
    checkLiked()
  }, [c.id])

  const handleToggleLike = async () => {
    if (loading) return
    setLoading(true)

    try {
      const res = await toggleLike(c.id)
      const r = res?.[0]
      if (r) {
        setLiked(r.liked)
        setCount(Number(r.like_count))
      }
    } catch (e: any) {
      console.error('Error toggling like:', e)
      toast.error(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }

  const images = c.community_comment_images || []

  return (
    <div className="border-b border-[#2A3441] py-3">
      <div className="text-sm text-gray-300 mb-2">{c.body}</div>
      
      {images.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {images.map((img: any) => (
            <img
              key={img.storage_path}
              src={publicImageUrl(img.storage_path)}
              alt="Comment"
              className="h-16 w-16 object-cover rounded border border-[#2A3441]"
              onError={(e) => {
                console.error('Failed to load image:', img.storage_path)
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          ))}
        </div>
      )}

      <div className="flex gap-2 items-center mt-2">
        <button
          onClick={handleToggleLike}
          disabled={loading}
          className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${
            liked
              ? 'text-red-400 bg-red-500/20 hover:bg-red-500/30'
              : 'text-gray-400 hover:text-red-400 hover:bg-gray-800'
          }`}
        >
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          <span>{count}</span>
        </button>
      </div>
    </div>
  )
}

