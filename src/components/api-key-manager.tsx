'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createApiKeyAction, revokeApiKeyAction } from '@/actions/api-key';
import { Key, Copy, Check, Trash2, ShieldAlert, Plus, Loader2 } from 'lucide-react';

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  isRevoked: boolean;
  createdAt: string | Date; // Menerima ISO string dari server
}

export function ApiKeyManager({ initialKeys }: { initialKeys: ApiKeyItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [keyName, setKeyName] = useState('');
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    startTransition(async () => {
      try {
        const res = await createApiKeyAction(keyName);
        setNewRawKey(res.rawKey);
        setKeyName('');
        router.refresh(); // <-- Refreshes Server Component Data
      } catch (err) {
        alert('Failed to create API Key');
      }
    });
  };

  const handleCopy = () => {
    if (!newRawKey) return;
    navigator.clipboard.writeText(newRawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async (id: string) => {
    if (confirm('Are you sure you want to revoke this API Key? It will immediately stop working.')) {
      setRevokingId(id);
      startTransition(async () => {
        try {
          await revokeApiKeyAction(id);
          router.refresh(); // <-- Refreshes Server Component Data
        } catch (err) {
          alert('Failed to revoke API Key');
        } finally {
          setRevokingId(null);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Modal / Alert Pop-up untuk Raw API Key Baru */}
      {newRawKey && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-semibold">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span>Save your API Key now!</span>
          </div>
          <p className="text-xs text-amber-700">
            This key will <strong>NEVER</strong> be shown again. Make sure to copy and store it securely.
          </p>
          <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-amber-300">
            <code className="flex-1 font-mono text-sm text-slate-800 break-all">{newRawKey}</code>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-medium hover:bg-slate-800 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <button
            onClick={() => setNewRawKey(null)}
            className="text-xs text-amber-800 underline font-medium hover:text-amber-900"
          >
            I have saved my key
          </button>
        </div>
      )}

      {/* Form Tambah API Key */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-600" />
          Create New API Key
        </h2>
        <form onSubmit={handleCreateKey} className="flex gap-3 max-w-lg">
          <input
            type="text"
            placeholder="e.g. Production Mobile App"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            required
            disabled={isPending}
            className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            {isPending && !revokingId ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {isPending && !revokingId ? 'Creating...' : 'Generate Key'}
          </button>
        </form>
      </section>

      {/* Tabel List API Keys */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Your API Keys</h2>
          <p className="text-xs text-slate-500">Manage and revoke active access keys</p>
        </div>

        {initialKeys.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No API keys found. Create your first API key above to start making requests!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Key Prefix</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {initialKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-medium text-slate-900">{key.name}</td>
                    <td className="p-4 font-mono text-xs text-slate-600">{key.keyPrefix}</td>
                    <td className="p-4 text-slate-500 text-xs" suppressHydrationWarning>
                      {new Date(key.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4">
                      {key.isRevoked ? (
                        <span className="px-2.5 py-1 text-xs rounded-full bg-rose-100 text-rose-700 font-medium">
                          Revoked
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-medium">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {!key.isRevoked && (
                        <button
                          onClick={() => handleRevoke(key.id)}
                          disabled={isPending && revokingId === key.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                          title="Revoke Key"
                        >
                          {isPending && revokingId === key.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}