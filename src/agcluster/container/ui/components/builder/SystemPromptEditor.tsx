'use client';

import { SystemPrompt, SystemPromptPreset, isSystemPromptPreset } from './types';

interface SystemPromptEditorProps {
  value: SystemPrompt | undefined;
  onChange: (value: SystemPrompt) => void;
}

const inputCls = 'w-full px-4 py-2 bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm';
const btnBase = 'px-4 py-2 rounded text-sm font-medium transition-colors';
const btnActive = `${btnBase} bg-[var(--btn-secondary-hover)] text-[var(--text-primary)]`;
const btnInactive = `${btnBase} bg-[var(--input-bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--btn-secondary-bg)]`;

export function SystemPromptEditor({ value, onChange }: SystemPromptEditorProps) {
  const isPreset = isSystemPromptPreset(value);
  const promptType = isPreset ? 'preset' : 'custom';

  const handleTypeChange = (newType: 'custom' | 'preset') => {
    if (newType === 'preset') {
      onChange({
        type: 'preset',
        preset: 'claude_code',
        append: '',
      });
    } else {
      onChange('');
    }
  };

  const handleCustomChange = (text: string) => {
    onChange(text);
  };

  const handleAppendChange = (text: string) => {
    if (isPreset) {
      onChange({
        ...value,
        append: text,
      });
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">System Prompt</label>

      {/* Type Selector */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleTypeChange('preset')}
          className={promptType === 'preset' ? btnActive : btnInactive}
        >
          Preset (Claude Code)
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('custom')}
          className={promptType === 'custom' ? btnActive : btnInactive}
        >
          Custom
        </button>
      </div>

      {/* Preset Mode */}
      {isPreset && (
        <div className="space-y-3">
          <div className="p-3 bg-[var(--input-bg-secondary)] border border-[var(--border-glass)] rounded text-sm">
            <p className="text-[var(--text-primary)] mb-1">
              <strong>Using Claude Code Preset</strong>
            </p>
            <p className="text-[var(--text-secondary)] text-xs">
              This preset includes optimized instructions for software development, TDD principles,
              and tool usage. You can add additional instructions below.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
              Additional Instructions (Optional)
            </label>
            <textarea
              value={value.append || ''}
              onChange={(e) => handleAppendChange(e.target.value)}
              placeholder="Add any additional instructions to append to the preset..."
              rows={5}
              className={inputCls}
            />
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              These instructions will be appended to the claude_code preset
            </p>
          </div>
        </div>
      )}

      {/* Custom Mode */}
      {!isPreset && (
        <div>
          <textarea
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="You are a helpful assistant that specializes in..."
            rows={10}
            className={inputCls}
          />
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Complete custom system prompt that defines the agent&apos;s behavior
          </p>
        </div>
      )}
    </div>
  );
}
