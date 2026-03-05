'use client';

import { useState } from 'react';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { ThinkingEvent } from '../lib/use-tool-stream';

interface ThinkingCardProps {
  event: ThinkingEvent;
}

export function ThinkingCard({ event }: ThinkingCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  const previewContent = event.content.length > 100
    ? event.content.substring(0, 100) + '...'
    : event.content;

  return (
    <div
      className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-[var(--input-bg-secondary)] border border-[var(--border-glass)] max-w-3xl"
      data-testid="thinking-card"
    >
      <div className="flex-shrink-0">
        <div className="w-6 h-6 rounded-lg bg-[var(--btn-secondary-bg)] flex items-center justify-center">
          <Brain className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-medium text-[var(--text-primary)]">Thinking</h4>
            <span className="text-[10px] text-[var(--text-secondary)]">{formatTime(event.timestamp)}</span>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-[var(--btn-secondary-bg)] rounded transition-colors"
            aria-label={isCollapsed ? "Expand thinking" : "Collapse thinking"}
          >
            {isCollapsed ? (
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            )}
          </button>
        </div>

        <div className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
          {isCollapsed ? previewContent : event.content}
        </div>
      </div>
    </div>
  );
}
