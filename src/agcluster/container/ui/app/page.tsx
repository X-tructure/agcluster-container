'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Code2, Search, BarChart3, Rocket, Plus } from 'lucide-react';
import { listConfigs, launchAgent, getConfig, type ConfigInfo, type AgentConfig } from '@/lib/api-client';
import Navigation from '@/components/Navigation';
import { McpCredentialsModal } from '@/components/McpCredentialsModal';

const PRESET_ICONS = {
  'code-assistant': Code2,
  'research-agent': Search,
  'data-analysis': BarChart3,
  'fullstack-team': Rocket,
  'github-code-review': Code2,
} as const;

export default function DashboardPage() {
  const router = useRouter();
  const [configs, setConfigs] = useState<ConfigInfo[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [backendConnected, setBackendConnected] = useState(false);
  const [mcpModalOpen, setMcpModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<{ id: string; fullConfig: AgentConfig | null }>({ id: '', fullConfig: null });

  // Load API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('anthropic_api_key');
    if (savedKey) setApiKey(savedKey);
    const savedBaseUrl = localStorage.getItem('anthropic_base_url');
    if (savedBaseUrl) setApiBaseUrl(savedBaseUrl);
  }, []);

  // Fetch available configs from backend
  useEffect(() => {
    listConfigs()
      .then((fetchedConfigs) => {
        setConfigs(fetchedConfigs);
        setBackendConnected(true);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to connect to AgCluster API:', err.message);
        setError('Cannot connect to AgCluster API. Make sure the backend is running on http://localhost:8000');
        setBackendConnected(false);
        setLoading(false);
      });
  }, []);

  const handleLaunchAgent = async (configId: string) => {
    if (!apiKey) {
      setError('Please enter your Anthropic API key');
      return;
    }

    setError('');

    // Check if config has MCP servers
    const configInfo = configs.find(c => c.id === configId);
    if (configInfo?.has_mcp_servers) {
      // Fetch full config to get MCP server details
      try {
        const fullConfig = await getConfig(configId);
        setSelectedConfig({ id: configId, fullConfig });
        setMcpModalOpen(true);
      } catch (err) {
        setError('Failed to load config details');
      }
    } else {
      // Launch directly without MCP credentials
      await doLaunchAgent(configId, {});
    }
  };

  const doLaunchAgent = async (configId: string, mcpEnv: Record<string, Record<string, string>>) => {
    setLoading(true);
    setError('');

    try {
      // Save API key
      localStorage.setItem('anthropic_api_key', apiKey);
      if (apiBaseUrl) {
        localStorage.setItem('anthropic_base_url', apiBaseUrl);
      } else {
        localStorage.removeItem('anthropic_base_url');
      }

      // Launch agent with config
      const response = await launchAgent({
        api_key: apiKey,
        base_url: apiBaseUrl || undefined,
        config_id: configId,
        mcp_env: Object.keys(mcpEnv).length > 0 ? mcpEnv : undefined,
      });

      // Navigate to chat with session ID
      router.push(`/chat/${response.session_id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to launch agent';
      setError(message);
      setLoading(false);
    }
  };

  const handleMcpCredentialsSubmit = async (credentials: Record<string, Record<string, string>>) => {
    setMcpModalOpen(false);
    await doLaunchAgent(selectedConfig.id, credentials);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Header */}
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 gradient-text">
            Launch Your Agent
          </h2>
          <p className="text-[var(--text-secondary)] text-sm max-w-2xl mx-auto mb-8">
            Choose from specialized agent configurations or build your own
          </p>

          {/* API Key Input */}
          <div className="max-w-md mx-auto space-y-3">
            <input
              type="password"
              placeholder="Enter your Anthropic API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
            />
            <input
              type="text"
              placeholder="API Base URL (optional, e.g. https://your-proxy.com)"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
            />
            <p className="text-xs text-[var(--text-secondary)]">Your API key is stored locally and never sent to our servers</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--text-secondary)] mb-4"></div>
            <p className="text-[var(--text-secondary)]">Connecting to AgCluster API...</p>
          </div>
        )}

        {/* Backend Connection Error */}
        {!loading && !backendConnected && (
          <div className="max-w-2xl mx-auto">
            <div className="glass rounded-xl p-8 border-2 border-red-500/50">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                  <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-red-500 dark:text-red-400 mb-2">Backend Not Running</h3>
                <p className="text-[var(--text-secondary)] mb-6">{error}</p>
              </div>

              <div className="space-y-4 text-sm text-[var(--text-secondary)]">
                <p className="font-semibold text-[var(--text-primary)]">To start the AgCluster backend:</p>
                <div className="glass rounded-lg p-4 bg-[var(--input-bg-secondary)] font-mono text-xs">
                  <div className="mb-2 text-[var(--text-secondary)]"># From agcluster-container root directory:</div>
                  <div className="text-[var(--text-primary)]">python -m uvicorn agcluster.container.api.main:app --host 0.0.0.0 --port 8000</div>
                </div>
                <p className="text-[var(--text-secondary)] text-xs pt-2">
                  Or use Docker: <code className="bg-[var(--btn-secondary-bg)] px-2 py-1 rounded">docker compose up -d</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message (for other errors) */}
        {!loading && backendConnected && error && (
          <div className="mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Agent Presets Grid */}
        {!loading && backendConnected && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {configs.map((config) => {
            const Icon = PRESET_ICONS[config.id as keyof typeof PRESET_ICONS] || Code2;

            return (
              <button
                key={config.id}
                onClick={() => handleLaunchAgent(config.id)}
                disabled={loading}
                className="glow-card glass glass-hover rounded-xl p-6 text-left transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-slate-200 dark:bg-gradient-to-br dark:from-primary-500/20 dark:to-primary-700/20 group-hover:bg-slate-300 dark:group-hover:from-primary-500/30 dark:group-hover:to-primary-700/30 transition-colors">
                    <Icon className="w-6 h-6 text-slate-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2 text-[var(--text-primary)]">{config.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                      {config.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs px-2 py-1 rounded bg-slate-200 dark:bg-primary-500/20 text-slate-700 dark:text-primary-300">
                        {config.allowed_tools.length} tools
                      </span>
                      {config.has_sub_agents && (
                        <span className="text-xs px-2 py-1 rounded bg-slate-200 dark:bg-gray-700/30 text-slate-600 dark:text-gray-300">
                          Multi-Agent
                        </span>
                      )}
                      {config.has_mcp_servers && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                          MCP
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Custom Builder Card */}
          <button
            onClick={() => router.push('/builder')}
            className="glass glass-hover rounded-xl p-6 text-left transition-all duration-300 hover:scale-105 group border-2 border-dashed border-[var(--border-glass-hover)]"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-slate-200 dark:bg-gradient-to-br dark:from-gray-500/20 dark:to-gray-700/20 group-hover:bg-slate-300 dark:group-hover:from-gray-500/30 dark:group-hover:to-gray-700/30 transition-colors">
                <Plus className="w-6 h-6 text-slate-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 text-[var(--text-primary)]">Custom Agent</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Build your own agent configuration with specialized tools and prompts
                </p>
              </div>
            </div>
          </button>
          </div>
        )}
      </main>

      {/* MCP Credentials Modal */}
      <McpCredentialsModal
        isOpen={mcpModalOpen}
        onClose={() => setMcpModalOpen(false)}
        mcpServers={selectedConfig.fullConfig?.mcp_servers || {}}
        onSubmit={handleMcpCredentialsSubmit}
      />
    </div>
  );
}
