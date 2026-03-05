'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { User, Bot } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

interface MessageCardProps {
  message: Message;
}

export function MessageCard({ message }: MessageCardProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      data-testid="message-card"
    >
      <div
        className={`flex items-start gap-3 max-w-3xl p-3.5 rounded-2xl ${
          isUser
            ? 'bg-[var(--btn-secondary-hover)] text-[var(--text-primary)]'
            : 'glass border border-[var(--border-glass)]'
        }`}
      >
        <div className="flex-shrink-0">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center bg-[var(--btn-secondary-bg)]`}>
            {isUser ? (
              <User className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4 text-[var(--text-secondary)]" />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose dark:prose-invert prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  code: (props) => {
                    const { className, children } = props;
                    const isInline = !className || !className.startsWith('language-');
                    return isInline ? (
                      <code className="px-2 py-0.5 rounded-md bg-[var(--btn-secondary-bg)] text-[var(--text-primary)] text-xs font-mono border border-[var(--border-glass)]">
                        {children}
                      </code>
                    ) : (
                      <code className={className}>
                        {children}
                      </code>
                    );
                  },
                  pre: (props) => (
                    <pre className="overflow-x-auto rounded-xl bg-[var(--hljs-bg)] border border-[var(--border-glass)] p-4 my-3">
                      {props.children}
                    </pre>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
