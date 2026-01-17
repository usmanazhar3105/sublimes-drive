import { useState } from 'react'
import { addComment, uploadCommentImage } from './api'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Image, X } from 'lucide-react'

interface CommentComposerProps {
  postId: string
  onAdded: () => void
}

export default function CommentComposer({ postId, onAdded }: CommentComposerProps) {
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setFilePreview(URL.createObjectURL(selectedFile))
    }
  }

  const removeFile = () => {
    setFile(null)
    if (filePreview) {
      URL.revokeObjectURL(filePreview)
      setFilePreview(null)
    }
  }

  const handleSubmit = async () => {
    if (!text.trim() && !file) {
      toast.error('Please add some content or an image')
      return
    }

    setBusy(true)
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not signed in')

      // Create comment (body is required, use placeholder if empty)
      const commentBody = text.trim() || '[Image Comment]'
      const cid = await addComment(postId, commentBody)

      // Upload image if provided
      if (file) {
        await uploadCommentImage(cid, file, user.user.id)
      }

      toast.success('Comment posted!')
      setText('')
      removeFile()
      onAdded()
    } catch (e: any) {
      console.error('Error posting comment:', e)
      toast.error(String(e.message || e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 p-4 border border-[#2A3441] rounded-lg bg-[#1A1F2E]">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment…"
        className="w-full min-h-[80px] p-3 rounded bg-[#0F1419] border border-[#2A3441] text-white placeholder-gray-500 focus:outline-none focus:border-[#3A4A5C] resize-none"
        disabled={busy}
      />
      
      {filePreview && (
        <div className="relative inline-block">
          <img
            src={filePreview}
            alt="Preview"
            className="h-24 w-24 object-cover rounded border border-[#2A3441]"
          />
          <button
            onClick={removeFile}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex gap-2 items-center">
        <label className="cursor-pointer px-3 py-2 rounded bg-[#2A3441] text-white hover:bg-[#3A4A5C] transition-colors flex items-center gap-2">
          <Image size={16} />
          <span className="text-sm">Add Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={busy}
          />
        </label>

        <button
          onClick={handleSubmit}
          disabled={busy || (!text.trim() && !file)}
          className="px-4 py-2 rounded bg-[#4A5568] text-white hover:bg-[#5A6678] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {busy ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  )
}

