import { useState } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Smile } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  trigger?: React.ReactNode;
}

export function EmojiPicker({ onEmojiSelect, trigger }: EmojiPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState('smileys');

  const emojiCategories = {
    smileys: {
      name: 'Smileys & People',
      emojis: [
        '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
        '🙂', '🙃', '😉', '😍', '🥰', '😘', '😗', '😙', '😚', '😋',
        '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳',
        '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖',
        '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯'
      ]
    },
    activities: {
      name: 'Activities',
      emojis: [
        '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸',
        '🥅', '🏒', '🏑', '🥍', '🏏', '⛳', '🏹', '🎣', '🤿', '🥊',
        '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂',
        '🏋️', '🤼', '🤸', '⛹️', '🤺', '🏇', '🧘', '🏄', '🏊', '🤽'
      ]
    },
    cars: {
      name: 'Cars & Transport',
      emojis: [
        '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
        '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🚁',
        '✈️', '🛩️', '🚀', '🛸', '🚉', '🚊', '🚝', '🚞', '🚋', '🚃',
        '🚂', '🚄', '🚅', '🚈', '🚇', '🚆', '🚘', '🚖', '⛽', '🛣️'
      ]
    },
    objects: {
      name: 'Objects',
      emojis: [
        '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💽', '💾', '💿',
        '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️',
        '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '⏱️', '⏲️', '⏰',
        '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔'
      ]
    },
    symbols: {
      name: 'Symbols',
      emojis: [
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
        '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
        '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
        '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐'
      ]
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Smile className="h-4 w-4" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="flex flex-col h-80">
          {/* Category Tabs */}
          <div className="flex border-b border-border">
            {Object.entries(emojiCategories).map(([key, category]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "ghost"}
                size="sm"
                className="flex-1 rounded-none text-xs"
                onClick={() => setSelectedCategory(key)}
              >
                {category.emojis[0]}
              </Button>
            ))}
          </div>
          
          {/* Emoji Grid */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-8 gap-1">
              {emojiCategories[selectedCategory as keyof typeof emojiCategories].emojis.map((emoji, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-lg hover:bg-muted"
                  onClick={() => onEmojiSelect(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Recent Emojis */}
          <div className="border-t border-border p-2">
            <div className="text-xs text-muted-foreground mb-1">Recently used</div>
            <div className="flex space-x-1">
              {['❤️', '😂', '👍', '🔥', '😍', '🚗', '⚡', '💯'].map((emoji, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-sm hover:bg-muted"
                  onClick={() => onEmojiSelect(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}