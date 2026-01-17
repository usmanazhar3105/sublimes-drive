import { useEffect, useState } from 'react'
import { listComments } from './api'
import CommentComposer from './CommentComposer'
import CommentItem from './CommentItem'
import FailsafeDataProbe from '@/components/FailsafeDataProbe'

interface CommentsPaneProps {
  postId: string
}

export default function CommentsPane({ postId }: CommentsPaneProps) {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const comments = await listComments(postId)
      setRows(comments || [])
    } catch (e: any) {
      console.error('Error loading comments:', e)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [postId])

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-400">
        Loading comments…
      </div>
    )
  }

  return (
    <div className="p-4">
      <CommentComposer postId={postId} onAdded={load} />
      
      <div className="mt-4 space-y-2">
        {rows.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          rows.map((c) => <CommentItem key={c.id} c={c} />)
        )}
      </div>

      <FailsafeDataProbe />
    </div>
  )
}

