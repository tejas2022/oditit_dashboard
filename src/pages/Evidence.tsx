import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { evidenceApi } from '../api/evidence';
import type { Evidence as EvidenceType } from '../types/api';

export function Evidence() {
  const [page] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['evidence', page],
    queryFn: () => evidenceApi.list({ page, limit: 20 }),
  });

  const list = Array.isArray(data) ? data : (data as { data?: EvidenceType[] })?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Evidence</h1>
      <div className="rounded-xl border border-slate-700 bg-surface-900 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {list.map((e: EvidenceType) => (
              <div
                key={e.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-white">{e.title}</p>
                    <p className="text-sm text-slate-400">{e.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
