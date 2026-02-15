import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Download,
  Plus,
  Save,
  Eye,
  Edit3,
  Link2,
  Sparkles,
} from 'lucide-react';
import { policiesApi } from '../api/policies';
import { controlsApi } from '../api/controls';
import { frameworksApi } from '../api/frameworks';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Alert,
  Modal,
  Textarea,
  Input,
  Select,
} from '../components/ui';
import type { Policy, PolicyVersion, OrganizationControlInstance, OrganizationSubcontrolInstance } from '../types/api';
import { useAuthStore } from '../store/authStore';

/** Strip markdown code fences if LLM returns them by mistake */
function stripMarkdownFences(text: string): string {
  let t = text.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
  }
  return t.trim();
}

export function PolicyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const organization = useAuthStore((s) => s.organization);

  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
  const [editContent, setEditContent] = useState('');
  const [isAddVersionOpen, setIsAddVersionOpen] = useState(false);
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [isEnhanceOpen, setIsEnhanceOpen] = useState(false);
  const [enhanceSelectionRange, setEnhanceSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const { data: policy, isLoading } = useQuery({
    queryKey: ['policy', id],
    queryFn: () => policiesApi.get(id!),
    enabled: !!id,
  });

  const versions = policy?.versions ?? [];
  const sortedVersions = [...versions].sort(
    (a, b) => (b.versionNumber ?? 0) - (a.versionNumber ?? 0)
  );
  const currentVersionId = selectedVersionId ?? policy?.currentVersionId ?? sortedVersions[0]?.id;
  const currentVersion = sortedVersions.find((v) => v.id === currentVersionId) ?? sortedVersions[0];

  const { data: versionDetail, isLoading: versionLoading } = useQuery({
    queryKey: ['policy-version', id, currentVersionId],
    queryFn: () => policiesApi.getVersion(id!, String(currentVersionId)),
    enabled: !!id && !!currentVersionId,
  });

  const displayContent =
    viewMode === 'edit'
      ? editContent
      : (versionDetail?.content ?? currentVersion?.content ?? '');

  const addVersionMutation = useMutation({
    mutationFn: (payload: { content?: string; changeNote?: string } | FormData) =>
      policiesApi.addVersion(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy', id] });
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      setIsAddVersionOpen(false);
      setViewMode('view');
    },
  });

  const updatePolicyMutation = useMutation({
    mutationFn: (body: { name?: string; description?: string }) =>
      policiesApi.update(id!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy', id] });
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });

  const enhanceMutation = useMutation({
    mutationFn: (payload: { userDescription: string; range: { start: number; end: number } }) => {
      const selectedText = editContent.slice(payload.range.start, payload.range.end);
      return policiesApi.enhanceSelection({
        policyName: policy!.name,
        fullPolicyContent: editContent,
        selectedText: selectedText || undefined,
        userDescription: payload.userDescription,
      });
    },
    onSuccess: (data, payload) => {
      applyEnhancedText(data.enhancedText, payload.range);
    },
  });

  const handleDownload = () => {
    const text = versionDetail?.content ?? currentVersion?.content ?? '';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${policy?.name ?? 'policy'}-v${currentVersion?.versionNumber ?? 1}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStartEdit = () => {
    setEditContent(versionDetail?.content ?? currentVersion?.content ?? '');
    setViewMode('edit');
  };

  const handleSaveEdit = () => {
    addVersionMutation.mutate({ content: editContent, changeNote: 'Edited in dashboard' });
  };

  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setSelectedVersionId(v ? Number(v) : null);
    setViewMode('view');
  };

  useEffect(() => {
    if (viewMode !== 'edit') return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        handleOpenEnhance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewMode, editContent]);

  const handleOpenEnhance = () => {
    const el = editorRef.current;
    if (el) {
      setEnhanceSelectionRange({ start: el.selectionStart, end: el.selectionEnd });
      setIsEnhanceOpen(true);
    } else {
      setEnhanceSelectionRange({ start: editContent.length, end: editContent.length });
      setIsEnhanceOpen(true);
    }
  };

  const applyEnhancedText = (enhancedText: string, range: { start: number; end: number }) => {
    const trimmed = stripMarkdownFences(enhancedText);
    const hasSelection = range.start !== range.end;
    const newContent = hasSelection
      ? editContent.slice(0, range.start) + trimmed + editContent.slice(range.end)
      : editContent.slice(0, range.start) + trimmed + editContent.slice(range.start);
    setEditContent(newContent);
    setEnhanceSelectionRange(null);
    setIsEnhanceOpen(false);
    requestAnimationFrame(() => {
      editorRef.current?.focus();
      const newStart = range.start;
      const newEnd = newStart + trimmed.length;
      editorRef.current?.setSelectionRange(newStart, newEnd);
    });
  };

  if (!id) {
    return (
      <div className="space-y-6">
        <Alert variant="danger">Missing policy ID.</Alert>
        <Link to="/policies">
          <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Policies
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading || !policy) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-800" />
        <div className="h-96 animate-pulse rounded-lg bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/policies">
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold text-white">{policy.name}</h1>
          {policy.description && (
            <p className="mt-1 text-sm text-slate-400">{policy.description}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            Owner: {policy.owner?.name || policy.owner?.email || 'Unassigned'} · Created{' '}
            {new Date(policy.dateAdded).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={String(currentVersionId)}
            onChange={handleVersionChange}
            className="min-w-[180px] rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white"
          >
            {sortedVersions.map((v) => (
              <option key={v.id} value={String(v.id)}>
                Version {v.versionNumber}{v.createdAt ? ` (${new Date(v.createdAt).toLocaleDateString()})` : ''}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" icon={<Download className="h-4 w-4" />} onClick={handleDownload}>
            Download
          </Button>
          {viewMode === 'view' ? (
            <Button variant="outline" size="sm" icon={<Edit3 className="h-4 w-4" />} onClick={handleStartEdit}>
              Edit
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                icon={<Sparkles className="h-4 w-4" />}
                onClick={handleOpenEnhance}
                disabled={enhanceMutation.isPending}
              >
                Enhance with AI
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('view')}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Save className="h-4 w-4" />}
                onClick={handleSaveEdit}
                disabled={addVersionMutation.isPending}
                loading={addVersionMutation.isPending}
              >
                Save as new version
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setIsAddVersionOpen(true)}>
            Add version
          </Button>
          <Button variant="outline" size="sm" icon={<Link2 className="h-4 w-4" />} onClick={() => setIsAttachOpen(true)}>
            Attach to control
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {viewMode === 'view' ? <Eye className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
            {viewMode === 'view' ? 'Content' : 'Editing content'}
            {currentVersion && (
              <Badge size="sm" variant="info">
                v{currentVersion.versionNumber}
                {currentVersion.createdAt &&
                  ` · ${new Date(currentVersion.createdAt).toLocaleString()}`}
              </Badge>
            )}
            {viewMode === 'edit' && enhanceMutation.isPending && (
              <Badge size="sm" variant="warning" className="animate-pulse">
                Enhancing…
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {versionLoading && viewMode === 'view' && !versionDetail ? (
            <div className="py-12 text-center text-slate-500">Loading version...</div>
          ) : viewMode === 'edit' ? (
            <div className="space-y-2 relative">
              {enhanceMutation.isPending && (
                <div className="absolute inset-0 bg-slate-900/40 z-10 rounded-lg flex items-center justify-center pointer-events-none">
                  <span className="text-sm text-slate-300 flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    AI is enhancing…
                  </span>
                </div>
              )}
              <Textarea
                ref={editorRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={24}
                className="font-mono text-sm resize-y min-h-[28rem]"
                placeholder="Policy content... Select text and use Enhance with AI to improve a section, or add a new section with no selection. Shortcut: Ctrl+E / Cmd+E"
                disabled={enhanceMutation.isPending}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-4">
              <pre className="whitespace-pre-wrap break-words font-mono text-sm text-slate-300">
                {displayContent || 'No content for this version.'}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <AddVersionModal
        policyId={id}
        isOpen={isAddVersionOpen}
        onClose={() => setIsAddVersionOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['policy', id] });
          setIsAddVersionOpen(false);
        }}
      />

      <AttachToSubcontrolModal
        policyId={id}
        versionId={currentVersionId}
        policyName={policy.name}
        isOpen={isAttachOpen}
        onClose={() => setIsAttachOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['policy', id] });
          setIsAttachOpen(false);
        }}
      />

      <EnhanceSelectionModal
        isOpen={isEnhanceOpen}
        onClose={() => {
          setIsEnhanceOpen(false);
          setEnhanceSelectionRange(null);
        }}
        onSubmit={(userDescription) => {
          if (enhanceSelectionRange) {
            enhanceMutation.mutate({ userDescription, range: enhanceSelectionRange });
          }
        }}
        isLoading={enhanceMutation.isPending}
        hasSelection={enhanceSelectionRange ? enhanceSelectionRange.start !== enhanceSelectionRange.end : false}
      />
    </div>
  );
}

function EnhanceSelectionModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  hasSelection,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userDescription: string) => void;
  isLoading: boolean;
  hasSelection: boolean;
}) {
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!isOpen) setDescription('');
  }, [isOpen]);

  const handleSubmit = () => {
    if (!description.trim() || isLoading) return;
    onSubmit(description.trim());
    setDescription('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enhance with AI"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!description.trim() || isLoading}
            loading={isLoading}
            icon={<Sparkles className="h-4 w-4" />}
          >
            {isLoading ? 'Enhancing…' : 'Enhance'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          {hasSelection
            ? 'Describe how you want the selected text improved (e.g. make it more formal, add bullet points, expand with examples).'
            : 'Describe the new section or content to add (e.g. add a section about incident reporting, add data retention clause).'}
        </p>
        <Input
          label="Instruction"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. make it more formal, add bullet points, add a new section about X"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSubmit())}
          disabled={isLoading}
        />
      </div>
    </Modal>
  );
}

function AddVersionModal({
  policyId,
  isOpen,
  onClose,
  onSuccess,
}: {
  policyId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [changeNote, setChangeNote] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const addMutation = useMutation({
    mutationFn: () => {
      if (file) {
        const form = new FormData();
        form.append('file', file);
        if (changeNote) form.append('changeNote', changeNote);
        return policiesApi.addVersion(policyId, form);
      }
      return policiesApi.addVersion(policyId, { content, changeNote: changeNote || undefined });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy', policyId] });
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      setContent('');
      setChangeNote('');
      setFile(null);
      onSuccess();
      onClose();
    },
  });

  const handleSubmit = () => {
    if (file || content.trim()) addMutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add new version"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={addMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={(!content.trim() && !file) || addMutation.isPending}
            loading={addMutation.isPending}
          >
            Add version
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input
          label="Change note (optional)"
          value={changeNote}
          onChange={(e) => setChangeNote(e.target.value)}
          placeholder="e.g. Updated scope section"
        />
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Content (paste text)</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="font-mono text-sm"
            placeholder="Or upload a file below..."
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Or upload file</label>
          <input
            type="file"
            accept=".txt,.md,.pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-400 file:mr-4 file:rounded file:border-0 file:bg-slate-700 file:px-4 file:py-2 file:text-white"
          />
          {file && (
            <p className="mt-1 text-xs text-slate-500">
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}

function AttachToSubcontrolModal({
  policyId,
  versionId,
  policyName,
  isOpen,
  onClose,
  onSuccess,
}: {
  policyId: string;
  versionId: number;
  policyName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const organization = useAuthStore((s) => s.organization);
  const [selectedControlId, setSelectedControlId] = useState<number | ''>('');
  const [selectedSubcontrolId, setSelectedSubcontrolId] = useState<number | ''>('');

  const { data: frameworks } = useQuery({
    queryKey: ['frameworks-activated'],
    queryFn: frameworksApi.activated,
    enabled: isOpen && !!organization,
  });
  const orgFrameworkId = frameworks?.[0]?.id;

  const { data: controlsData } = useQuery({
    queryKey: ['controls', organization?.id, orgFrameworkId],
    queryFn: () =>
      controlsApi.list({
        organizationFrameworkId: orgFrameworkId!,
        limit: 100,
      }),
    enabled: isOpen && !!orgFrameworkId,
  });

  const controlsList: OrganizationControlInstance[] = (controlsData as { data?: OrganizationControlInstance[] })?.data ?? [];

  const { data: controlDetail } = useQuery({
    queryKey: ['control', selectedControlId],
    queryFn: () => controlsApi.get(String(selectedControlId)),
    enabled: isOpen && !!selectedControlId,
  });

  const subcontrols = (controlDetail as OrganizationControlInstance)?.subcontrolInstances ?? [];
  const subcontrolOptions = subcontrols.map((s) => ({
    value: String(s.id),
    label: `${s.frameworkSubcontrol?.refCode ?? ''} ${s.frameworkSubcontrol?.name ?? s.id}`.trim(),
  }));

  const attachMutation = useMutation({
    mutationFn: () =>
      policiesApi.attachToSubcontrol(policyId, String(versionId), selectedSubcontrolId as number),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy', policyId] });
      queryClient.invalidateQueries({ queryKey: ['control'] });
      queryClient.invalidateQueries({ queryKey: ['subcontrol'] });
      onSuccess();
      onClose();
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Attach "${policyName}" to subcontrol`}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={attachMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => attachMutation.mutate()}
            disabled={!selectedSubcontrolId || attachMutation.isPending}
            loading={attachMutation.isPending}
          >
            Attach as evidence
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          This will create an evidence record from the selected policy version and link it to the subcontrol.
        </p>
        <Select
          label="Control"
          value={String(selectedControlId)}
          onChange={(e) => {
            setSelectedControlId(e.target.value ? Number(e.target.value) : '');
            setSelectedSubcontrolId('');
          }}
          options={[
            { value: '', label: 'Select control...' },
            ...controlsList.map((c) => ({
              value: String(c.id),
              label: `${c.frameworkControl?.refCode ?? ''} ${c.frameworkControl?.name ?? c.id}`.trim(),
            })),
          ]}
        />
        <Select
          label="Subcontrol"
          value={String(selectedSubcontrolId)}
          onChange={(e) => setSelectedSubcontrolId(e.target.value ? Number(e.target.value) : '')}
          options={[
            { value: '', label: selectedControlId ? 'Select subcontrol...' : 'Select a control first' },
            ...subcontrolOptions,
          ]}
          disabled={!selectedControlId}
        />
        {controlsList.length === 0 && (
          <Alert variant="info">Activate a framework on the Controls page first.</Alert>
        )}
      </div>
    </Modal>
  );
}
