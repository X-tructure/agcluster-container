'use client';

import { ChevronDown, ChevronRight, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import type { ToolEvent } from '../lib/use-tool-stream';

interface ToolExecutionPanelProps {
  toolEvents: ToolEvent[];
  isConnected: boolean;
}

export function ToolExecutionPanel({ toolEvents, isConnected }: ToolExecutionPanelProps) {
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());

  const toggleExpand = (index: number) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const getStatusIcon = (event: ToolEvent) => {
    // Check event.status field (updated when tool completes)
    const status = event.status || event.type;

    switch (status) {
      case 'started':
      case 'tool_start':
        return <Loader2 className="w-4 h-4 animate-spin text-gray-500" />;
      case 'in_progress':
      case 'tool_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'completed':
      case 'tool_complete':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
      case 'tool_error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (event: ToolEvent) => {
    // Check event.status field (updated when tool completes)
    const status = event.status || event.type;

    switch (status) {
      case 'started':
      case 'tool_start':
        return 'border-l-blue-500';
      case 'in_progress':
      case 'tool_progress':
        return 'border-l-yellow-500';
      case 'completed':
      case 'tool_complete':
        return 'border-l-green-500';
      case 'error':
      case 'tool_error':
        return 'border-l-red-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    } catch {
      return timestamp;
    }
  };

  return (
    <div
      className="h-full flex flex-col glass border-l border-[var(--border-glass)]"
      data-testid="tool-execution-panel"
    >
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-glass)]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Tool Execution</h3>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-[var(--text-secondary)]'}`}
              title={isConnected ? 'Connected' : 'Disconnected'}
            />
            <span className="text-xs text-[var(--text-secondary)]">
              {toolEvents.length} {toolEvents.length === 1 ? 'event' : 'events'}
            </span>
          </div>
        </div>
      </div>

      {/* Tool Events List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {toolEvents.length === 0 && (
          <div className="text-center text-[var(--text-secondary)] text-sm mt-12">
            <p>No tool executions yet</p>
            <p className="text-xs mt-2">Tools will appear here as the agent uses them</p>
          </div>
        )}

        {toolEvents.map((event, index) => {
          const isExpanded = expandedEvents.has(index);

          return (
            <div
              key={index}
              className={`border-l-4 ${getStatusColor(event)} glass rounded-lg overflow-hidden`}
              data-testid="tool-event"
            >
              {/* Event Header */}
              <button
                onClick={() => toggleExpand(index)}
                className="w-full p-3 flex items-start gap-3 hover:bg-[var(--btn-secondary-bg)] transition-colors text-left"
              >
                <div className="mt-0.5" data-testid="tool-status">
                  {getStatusIcon(event)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold">
                      {event.tool_name}
                    </span>
                    {event.duration_ms && (
                      <span className="text-xs text-[var(--text-secondary)]">
                        ({event.duration_ms}ms)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {formatTimestamp(event.timestamp)}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                )}
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-2">
                  {event.tool_input !== undefined && event.tool_input !== null && (
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] mb-1">Input:</p>
                      <div className="text-xs glass p-2 rounded overflow-x-auto">
                        {event.tool_name === 'TodoWrite' && typeof event.tool_input === 'object' && event.tool_input && 'todos' in event.tool_input && Array.isArray((event.tool_input as any).todos) ? (
                          <div className="space-y-1">
                            {(event.tool_input as any).todos.map((todo: any, idx: number) => (
                              <div key={idx} className="flex items-start gap-2">
                                <span className="text-[var(--text-secondary)]">{idx + 1}.</span>
                                <span className="text-[var(--text-primary)]">{todo.content || todo}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <pre className="text-[var(--text-primary)]">{JSON.stringify(event.tool_input, null, 2)}</pre>
                        )}
                      </div>
                    </div>
                  )}
                  {event.output && event.status === 'completed' && (
                    <div>
                      <p className="text-xs text-[var(--text-secondary)] mb-1">Output:</p>
                      <pre className="text-xs glass p-2 rounded overflow-x-auto text-green-600 dark:text-green-300">
                        {typeof event.output === 'string' ? event.output : JSON.stringify(event.output, null, 2)}
                      </pre>
                    </div>
                  )}
                  {event.error && (
                    <div>
                      <p className="text-xs text-red-500 dark:text-red-400 mb-1">Error:</p>
                      <pre className="text-xs glass p-2 rounded overflow-x-auto text-red-500 dark:text-red-400">
                        {event.error}
                      </pre>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[var(--text-secondary)]">Status:</span>
                    <span className={`font-semibold ${
                      (event.status === 'completed' || event.type === 'tool_complete') ? 'text-green-600 dark:text-green-400' :
                      (event.status === 'error' || event.type === 'tool_error') ? 'text-red-500 dark:text-red-400' :
                      (event.status === 'in_progress' || event.type === 'tool_progress') ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-[var(--text-secondary)]'
                    }`}>
                      {event.status || event.type}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
