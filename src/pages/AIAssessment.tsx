import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Play, FileText } from 'lucide-react';
import { aiAssessmentApi } from '../api/aiAssessment';
import { controlsApi } from '../api/controls';
import { frameworksApi } from '../api/frameworks';
import type { AssessmentReport, OrganizationControlInstance } from '../types/api';
import { useAuthStore } from '../store/authStore';

export function AIAssessment() {
  const organization = useAuthStore((s) => s.organization);
  const queryClient = useQueryClient();
  const [selectedControls, setSelectedControls] = useState<number[]>([]);
  const [provider, setProvider] = useState('openai');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const { data: activatedFrameworks } = useQuery({
    queryKey: ['frameworks-activated'],
    queryFn: frameworksApi.activated,
    enabled: !!organization,
  });

  const organizationFrameworkId =
    activatedFrameworks && activatedFrameworks.length > 0 ? activatedFrameworks[0].id : null;

  const { data: controlsData } = useQuery({
    queryKey: ['controls', organization?.id, organizationFrameworkId],
    queryFn: () =>
      controlsApi.list({
        organizationFrameworkId: organizationFrameworkId!,
        limit: 100,
      }),
    enabled: !!organization && !!organizationFrameworkId,
  });

  const { data: history, isLoading } = useQuery({
    queryKey: ['ai-assessment', 'history'],
    queryFn: () => aiAssessmentApi.history({ limit: 20 }),
  });

  const assessMutation = useMutation({
    mutationFn: () => aiAssessmentApi.assess({ controlIds: selectedControls.map(String), provider }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-assessment'] });
    },
  });

  const controls = Array.isArray(controlsData)
    ? controlsData
    : (controlsData as { data?: OrganizationControlInstance[] })?.data ?? [];
  const reports = Array.isArray(history) ? history : (history as { data?: AssessmentReport[] })?.data ?? [];

  const toggleControl = (id: number) => {
    setSelectedControls((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  if (!organization) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">AI Assessment</h1>
        <p className="text-slate-400">Select or create an organisation to run AI assessments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">AI Assessment</h1>
      <p className="text-slate-400">
        Run AI-powered compliance assessment on selected controls. Select controls and provider, then start.
      </p>

      <div className="rounded-xl border border-slate-700 bg-surface-900 p-6">
        <h2 className="mb-4 font-semibold text-white">Start assessment</h2>
        <div className="mb-4">
          <label className="mb-2 block text-sm text-slate-400">Provider</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white"
          >
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
            <option value="anthropic">Anthropic</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm text-slate-400">Select controls</label>
          <div className="max-h-48 overflow-auto rounded border border-slate-600 bg-surface-800 p-2">
            {controls.slice(0, 50).map((c: OrganizationControlInstance) => (
              <label key={c.id} className="flex cursor-pointer items-center gap-2 py-1.5 px-2 hover:bg-slate-700/50">
                <input
                  type="checkbox"
                  checked={selectedControls.includes(c.id)}
                  onChange={() => toggleControl(c.id)}
                  className="rounded border-slate-600 bg-surface-800 text-accent"
                />
                <span className="text-sm text-slate-200">
                  {c.frameworkControl?.refCode ?? String(c.id)} — {c.frameworkControl?.name ?? 'Control'}
                </span>
              </label>
            ))}
          </div>
        </div>
        <button
          onClick={() => assessMutation.mutate()}
          disabled={selectedControls.length === 0 || assessMutation.isPending}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          <Play className="h-4 w-4" /> Start assessment
        </button>
      </div>

      <div className="rounded-xl border border-slate-700 bg-surface-900 overflow-hidden">
        <div className="border-b border-slate-700 px-6 py-4">
          <h2 className="font-semibold text-white">Assessment history</h2>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {reports.map((r: AssessmentReport) => (
              <div
                key={r.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="font-medium text-white">
                      Report — {r.status} {r.overallScore != null ? `(${r.overallScore}%)` : ''}
                    </p>
                    <p className="text-sm text-slate-400">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReportId(r.id)}
                  className="rounded px-3 py-1.5 text-sm text-accent hover:bg-accent/20"
                >
                  View report
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedReportId && (
        <ReportModal
          reportId={selectedReportId}
          onClose={() => setSelectedReportId(null)}
        />
      )}
    </div>
  );
}

function ReportModal({ reportId, onClose }: { reportId: string; onClose: () => void }) {
  const { data } = useQuery({
    queryKey: ['ai-assessment', 'report', reportId],
    queryFn: () => aiAssessmentApi.report(reportId),
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl border border-slate-700 bg-surface-900 p-6">
        <h2 className="mb-4 text-xl font-bold text-white">Assessment report</h2>
        {data ? (
          <div className="space-y-2 text-sm">
            <p><span className="text-slate-400">Status:</span> {data.status}</p>
            {data.overallScore != null && (
              <p><span className="text-slate-400">Score:</span> {data.overallScore}%</p>
            )}
            {(data as { summary?: string }).summary && (
              <div className="mt-4 rounded border border-slate-600 bg-surface-800 p-4 text-slate-200">
                {(data as { summary: string }).summary}
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-6 rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300"
        >
          Close
        </button>
      </div>
    </div>
  );
}
