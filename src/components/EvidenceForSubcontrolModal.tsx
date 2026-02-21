import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, X, FileCheck } from 'lucide-react';
import { evidenceApi } from '../api/evidence';
import { policiesApi } from '../api/policies';
import {
  Modal,
  Button,
  Input,
  Textarea,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Alert,
  Select,
} from './ui';
import type { Evidence } from '../types/api';
import type { Policy, PolicyVersion } from '../types/api';

interface EvidenceForSubcontrolModalProps {
  isOpen: boolean;
  onClose: () => void;
  subcontrolId: number;
  subcontrolLabel?: string;
  onSuccess?: () => void;
}

export function EvidenceForSubcontrolModal({
  isOpen,
  onClose,
  subcontrolId,
  subcontrolLabel,
  onSuccess,
}: EvidenceForSubcontrolModalProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [policySearch, setPolicySearch] = useState('');
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('');
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: evidenceResponse, isLoading } = useQuery({
    queryKey: ['evidence-list', search],
    queryFn: () => evidenceApi.list({ page: 1, limit: 50 }),
    enabled: isOpen,
  });

  const evidenceList = Array.isArray(evidenceResponse)
    ? evidenceResponse
    : (evidenceResponse as { data?: Evidence[] })?.data ?? [];
  const filteredEvidence = search.trim()
    ? evidenceList.filter(
        (e) =>
          e.name.toLowerCase().includes(search.toLowerCase()) ||
          (e.description ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : evidenceList;

  const linkMutation = useMutation({
    mutationFn: (evidenceId: number) =>
      evidenceApi.linkToSubcontrol(String(evidenceId), subcontrolId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['control'] });
      queryClient.invalidateQueries({ queryKey: ['subcontrol', String(subcontrolId)] });
      onSuccess?.();
      onClose();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      form.append('name', uploadName);
      form.append('description', uploadDescription);
      if (uploadFiles[0]) form.append('file', uploadFiles[0]);
      const created = await evidenceApi.upload(form);
      const evidenceId = (created as Evidence).id;
      if (uploadFiles.length > 1) {
        const form2 = new FormData();
        uploadFiles.slice(1).forEach((f) => form2.append('files', f));
        await evidenceApi.addFiles(String(evidenceId), form2);
      }
      await evidenceApi.linkToSubcontrol(String(evidenceId), subcontrolId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidence-list'] });
      queryClient.invalidateQueries({ queryKey: ['control'] });
      queryClient.invalidateQueries({ queryKey: ['subcontrol', String(subcontrolId)] });
      setUploadName('');
      setUploadDescription('');
      setUploadFiles([]);
      onSuccess?.();
      onClose();
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setUploadFiles(Array.from(e.target.files));
  };
  const removeFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = () => {
    if (!uploadName.trim() || uploadFiles.length === 0) return;
    uploadMutation.mutate();
  };

  const { data: policiesList } = useQuery({
    queryKey: ['policies', policySearch],
    queryFn: () => policiesApi.list({ page: 1, limit: 50, search: policySearch || undefined }),
    enabled: isOpen,
  });
  const policies = (policiesList as { data?: Policy[] })?.data ?? [];

  const { data: selectedPolicyDetail } = useQuery({
    queryKey: ['policy', selectedPolicyId],
    queryFn: () => policiesApi.get(selectedPolicyId),
    enabled: isOpen && !!selectedPolicyId,
  });
  const versions = ((selectedPolicyDetail as Policy)?.versions ?? []).slice().sort((a, b) => (b.versionNumber ?? 0) - (a.versionNumber ?? 0));

  const attachPolicyMutation = useMutation({
    mutationFn: () =>
      policiesApi.attachToSubcontrol(selectedPolicyId, selectedVersionId, subcontrolId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['control'] });
      queryClient.invalidateQueries({ queryKey: ['subcontrol', String(subcontrolId)] });
      queryClient.invalidateQueries({ queryKey: ['policy'] });
      onSuccess?.();
      onClose();
    },
  });

  const title = subcontrolLabel
    ? `Evidence for: ${subcontrolLabel}`
    : 'Link or upload evidence';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <Tabs defaultValue="link">
        <TabsList>
          <TabsTrigger value="link">Link existing evidence</TabsTrigger>
          <TabsTrigger value="upload">Upload new evidence</TabsTrigger>
          <TabsTrigger value="policy">Attach policy</TabsTrigger>
        </TabsList>

        <TabsContent value="link">
          <div className="space-y-4">
            <Input
              placeholder="Search evidence by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {isLoading ? (
              <div className="py-8 text-center text-slate-500">Loading evidence...</div>
            ) : filteredEvidence.length === 0 ? (
              <p className="py-6 text-center text-slate-500">
                {evidenceList.length === 0
                  ? 'No evidence in your organization yet. Use the "Upload new evidence" tab to add some.'
                  : 'No evidence matches your search.'}
              </p>
            ) : (
              <ul className="max-h-72 space-y-2 overflow-y-auto">
                {filteredEvidence.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white">{ev.name}</p>
                      {ev.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                          {ev.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-500">
                        {ev.files?.length ?? 0} file(s) · {new Date(ev.collectedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => linkMutation.mutate(ev.id)}
                      disabled={linkMutation.isPending}
                      loading={linkMutation.isPending}
                    >
                      Link
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        <TabsContent value="upload">
          <div className="space-y-4">
            <Input
              label="Evidence name"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              placeholder="e.g. Policy document v1"
              required
            />
            <Textarea
              label="Description (optional)"
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="Brief description..."
              rows={2}
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                File(s) <span className="text-red-400">*</span>
              </label>
              <div
                className="rounded-lg border-2 border-dashed border-slate-600 p-4 transition-colors hover:border-slate-500"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-2 text-center">
                  <Upload className="h-10 w-10 text-slate-500" />
                  <p className="text-sm text-slate-400">
                    Click to select files or drag and drop
                  </p>
                </div>
              </div>
            </div>
            {uploadFiles.length > 0 && (
              <ul className="space-y-2">
                {uploadFiles.map((file, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2 text-slate-300">
                      <FileText className="h-4 w-4" />
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Alert variant="info">
              This will create the evidence and link it to the subcontrol in one step.
            </Alert>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUploadSubmit}
                disabled={!uploadName.trim() || uploadFiles.length === 0 || uploadMutation.isPending}
                loading={uploadMutation.isPending}
                icon={<Upload className="h-4 w-4" />}
              >
                Upload and link
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="policy">
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Attach a policy version as evidence to this subcontrol. This creates an evidence record from the policy.
            </p>
            <Input
              placeholder="Search policies..."
              value={policySearch}
              onChange={(e) => setPolicySearch(e.target.value)}
            />
            <Select
              label="Policy"
              value={selectedPolicyId}
              onChange={(e) => {
                setSelectedPolicyId(e.target.value);
                setSelectedVersionId('');
              }}
              options={[
                { value: '', label: 'Select a policy...' },
                ...policies.map((p) => ({ value: String(p.id), label: p.name })),
              ]}
            />
            <Select
              label="Version"
              value={selectedVersionId}
              onChange={(e) => setSelectedVersionId(e.target.value)}
              options={[
                { value: '', label: selectedPolicyId ? 'Select version...' : 'Select a policy first' },
                ...versions.map((v: PolicyVersion) => ({
                  value: String(v.id),
                  label: `Version ${v.versionNumber}${v.createdAt ? ` (${new Date(v.createdAt).toLocaleDateString()})` : ''}`,
                })),
              ]}
              disabled={!selectedPolicyId}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => attachPolicyMutation.mutate()}
                disabled={!selectedPolicyId || !selectedVersionId || attachPolicyMutation.isPending}
                loading={attachPolicyMutation.isPending}
                icon={<FileCheck className="h-4 w-4" />}
              >
                Attach policy as evidence
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Modal>
  );
}
