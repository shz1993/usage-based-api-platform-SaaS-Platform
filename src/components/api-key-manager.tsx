// src/components/api-key-manager.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  ShieldAlert,
  Loader2,
  Trash2,
  Key,
} from 'lucide-react';
import { createApiKeyAction, revokeApiKeyAction } from '@/actions/api-key';

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  isRevoked: boolean;
  createdAt: Date | string;
}

interface ApiKeyManagerProps {
  initialKeys: ApiKey[];
}

export function ApiKeyManager({ initialKeys }: ApiKeyManagerProps) {
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [keyName, setKeyName] = useState('');
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Handle Create API Key
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    setIsCreating(true);
    try {
      const res = await createApiKeyAction(keyName);
      if (res?.rawKey) {
        setNewRawKey(res.rawKey);
        setKeyName('');
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to create key:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Revoke API Key
  const handleRevokeKey = async (id: string) => {
    setRevokingId(id);
    try {
      await revokeApiKeyAction(id);
      router.refresh();
    } catch (error) {
      console.error('Failed to revoke key:', error);
    } finally {
      setRevokingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 text-slate-100">
      {/* 🟢 CREATE NEW API KEY SECTION */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-800/40 text-indigo-400">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Create New API Key
            </h3>
            <p className="text-xs text-slate-400">
              Generate a secret key to authenticate your REST API requests.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="e.g. Production Backend, Mobile App Key"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            required
          />
          <button
            type="submit"
            disabled={isCreating || !keyName.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium text-xs rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98] whitespace-nowrap"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Generate Key</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* ⚠️ NEW KEY DISPLAY MODAL / BANNER */}
      {newRawKey && (
        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-3 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Save Your Secret API Key
              </h4>
              <p className="text-xs text-amber-200/80 mt-0.5">
                Please copy your API key now. You won't be able to see it again!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-amber-500/20 rounded-xl p-2.5">
            <code className="flex-1 font-mono text-xs text-amber-300 break-all px-2">
              {newRawKey}
            </code>
            <button
              onClick={() => copyToClipboard(newRawKey)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-medium transition-colors border border-amber-500/30"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 📋 API KEYS LIST TABLE */}
      <div className="space-y-4 pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Your API Keys
            </h3>
          </div>
          <span className="text-xs font-medium text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
            {initialKeys.length} {initialKeys.length === 1 ? 'key' : 'keys'}
          </span>
        </div>

        {initialKeys.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-800/80 bg-slate-950/40">
            <KeyRound className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-xs font-medium text-slate-400">No API keys created yet</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Create your first secret key above to start connecting your applications.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800/80">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Key Prefix</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {initialKeys.map((key) => (
                  <tr
                    key={key.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-medium text-white">
                      {key.name}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-400">
                      {key.keyPrefix}••••••••
                    </td>
                    <td className="px-4 py-3.5">
                      {key.isRevoked ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-950/80 text-rose-400 border border-rose-800/50">
                          Revoked
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">
                      {new Date(key.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {!key.isRevoked && (
                        <button
                          onClick={() => handleRevokeKey(key.id)}
                          disabled={revokingId === key.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg transition-colors border border-transparent hover:border-rose-900/50 disabled:opacity-50"
                        >
                          {revokingId === key.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          <span>Revoke</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}