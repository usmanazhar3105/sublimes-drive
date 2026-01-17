import React from 'react';
import { Sparkles } from 'lucide-react';

interface FreyaBadgeProps {
  sources?: Array<{ title: string; url: string }>;
  timestamp?: string;
}

export const FreyaBadge: React.FC<FreyaBadgeProps> = ({ sources, timestamp }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
      <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 dark:bg-purple-950/20 rounded-full">
        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
        <span className="text-xs font-medium text-purple-700 dark:text-purple-400">
          Freya · Sublimes Drive AI
        </span>
      </div>
      
      {sources && sources.length > 0 && (
        <div className="flex items-center gap-1 text-xs">
          <span>•</span>
          <span>Sources:</span>
          {sources.map((source, idx) => (
            <a
              key={idx}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
              title={source.title}
            >
              [{idx + 1}]
            </a>
          ))}
        </div>
      )}
      
      {timestamp && (
        <span className="text-xs text-muted-foreground">
          • {new Date(timestamp).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};
