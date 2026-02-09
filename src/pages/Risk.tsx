import { Shield } from 'lucide-react';

export function Risk() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Risk Register</h1>
      <div className="rounded-xl border border-slate-700 bg-surface-900 p-8 text-center">
        <Shield className="mx-auto mb-4 h-12 w-12 text-slate-500" />
        <p className="text-slate-400">Risk register view. Connect to audit/risk API when available.</p>
      </div>
    </div>
  );
}
