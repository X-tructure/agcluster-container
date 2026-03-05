'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface ConfigInfo {
  id: string;
  name: string;
  description: string;
  allowed_tools: string[];
  permission_mode: string;
}

interface LoadConfigModalProps {
  onLoad: (configId: string) => void;
  onClose: () => void;
}

export function LoadConfigModal({ onLoad, onClose }: LoadConfigModalProps) {
  const [configs, setConfigs] = useState<ConfigInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/configs/`);

      if (!res.ok) {
        throw new Error('Failed to load configurations');
      }

      const data = await res.json();
      setConfigs(data.configs || []);
    } catch (error) {
      console.error('Error loading configs:', error);
      setError(error instanceof Error ? error.message : 'Failed to load configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (configId: string) => {
    onLoad(configId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-base)] rounded-lg w-full max-w-3xl max-h-3/4 flex flex-col border border-[var(--border-glass)]">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-glass)] flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg">Load Configuration</h3>
            <p className="text-xs text-[var(--text-secondary)]">Select a configuration to load into the builder</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--btn-secondary-bg)] rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--text-secondary)]" />
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && configs.length === 0 && (
            <div className="text-center text-[var(--text-secondary)] py-12">
              <p>No configurations found</p>
            </div>
          )}

          {!loading && !error && configs.length > 0 && (
            <div className="grid gap-3">
              {configs.map((config) => (
                <button
                  key={config.id}
                  onClick={() => handleSelect(config.id)}
                  className="p-4 bg-[var(--card-bg)] hover:bg-[var(--card-header-bg)] rounded-lg border border-[var(--border-glass)] text-left transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-base">{config.name}</h4>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{config.description}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-xs px-2 py-1 bg-[var(--btn-secondary-bg)] text-[var(--text-secondary)] rounded">
                          {config.allowed_tools?.length || 0} tools
                        </span>
                        <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded">
                          {config.permission_mode}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] font-mono">{config.id}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
