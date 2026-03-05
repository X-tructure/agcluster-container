'use client';

import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import type { TodoItem } from '../lib/use-tool-stream';

interface TodoListProps {
  todos: TodoItem[];
}

export function TodoList({ todos }: TodoListProps) {
  console.log('[TodoList] ============ RENDERING ============');
  console.log('[TodoList] Rendering with todos:', todos);
  console.log('[TodoList] Todos length:', todos?.length);
  console.log('[TodoList] Todos type:', typeof todos);
  console.log('[TodoList] Todos is array:', Array.isArray(todos));

  // Force a visual indicator that component is mounting
  if (todos && todos.length > 0) {
    console.log('[TodoList] 🎯 TODOS AVAILABLE - Should be rendering!', todos.length, 'items');
  }

  const getStatusIcon = (status: TodoItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />;
      case 'in_progress':
        return <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />;
      case 'pending':
        return <Circle className="w-3.5 h-3.5 text-gray-500" />;
      default:
        return <Circle className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: TodoItem['status']) => {
    switch (status) {
      case 'completed':
        return 'text-[var(--text-secondary)] line-through';
      case 'in_progress':
        return 'text-[var(--text-primary)] font-medium';
      case 'pending':
        return 'text-[var(--text-secondary)]';
      default:
        return 'text-[var(--text-secondary)]';
    }
  };

  // Extract key change from content (first 60 chars)
  const getKeyChange = (todo: TodoItem) => {
    // Use activeForm if available and status is in_progress, otherwise use content
    const text = todo.status === 'in_progress' && todo.activeForm
      ? todo.activeForm
      : todo.content || '';
    return text.length > 60 ? `${text.substring(0, 60)}...` : text;
  };

  // Ensure todos is a valid array
  if (!todos || !Array.isArray(todos) || todos.length === 0) {
    console.log('[TodoList] Not rendering - todos is:', todos);
    return null; // Don't show empty state - saves DOM space
  }

  return (
    <div
      className="p-3 glass rounded-lg border border-[var(--border-glass)]"
      data-testid="todo-list"
    >
      <h3 className="text-xs font-semibold mb-2 text-[var(--text-primary)]">Tasks</h3>
      <div className="space-y-1">
        {todos.map((todo, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[var(--btn-secondary-bg)] transition-colors"
            data-testid="todo-item"
            data-status={todo.status}
          >
            <div data-testid="todo-status">
              {getStatusIcon(todo.status)}
            </div>
            <p className={`text-xs truncate ${getStatusColor(todo.status)}`}>
              {getKeyChange(todo)}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-[var(--border-glass)] flex items-center gap-3 text-[10px] text-[var(--text-secondary)]">
        <span>{todos.filter(t => t.status === 'completed').length} done</span>
        <span className="text-[var(--border-glass-hover)]">·</span>
        <span>{todos.filter(t => t.status === 'in_progress').length} active</span>
        <span className="text-[var(--border-glass-hover)]">·</span>
        <span>{todos.filter(t => t.status === 'pending').length} pending</span>
      </div>
    </div>
  );
}
