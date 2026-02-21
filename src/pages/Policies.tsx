import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, Sparkles, LayoutTemplate } from 'lucide-react';
import { policiesApi } from '../api/policies';
import {
  Card,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyState,
  Button,
  Input,
  Modal,
  Textarea,
  Badge,
  Alert,
  Select,
} from '../components/ui';
import type { Policy, PolicyTemplate } from '../types/api';
import { useAuthStore } from '../store/authStore';

export function Policies() {
  const organization = useAuthStore((s) => s.organization);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [createMode, setCreateMode] = useState<'none' | 'new' | 'template' | 'ai' | 'upload-template'>('none');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: listResponse, isLoading } = useQuery({
    queryKey: ['policies', organization?.id, searchTerm, page],
    queryFn: () =>
      policiesApi.list({
        page,
        limit: 20,
        search: searchTerm || undefined,
      }),
    enabled: !!organization,
  });

  const policiesData = listResponse as { data?: Policy[]; meta?: { page: number; limit: number; total: number; totalPages: number } } | undefined;
  const policies = policiesData?.data ?? [];
  const meta = policiesData?.meta;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => policiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });

  if (!organization) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Policies</h1>
        <p className="text-slate-400">Select or create an organisation to manage policies.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Policies</h1>
          <p className="mt-1 text-slate-400">
            Organisation policies with versioning, templates, and AI generation. Attach to controls as evidence.
          </p>
        </div>
        <div className="relative">
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setDropdownOpen((o) => !o)}
          >
            Create policy
          </Button>
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                aria-hidden
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-slate-700 bg-slate-800 py-1 shadow-xl">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700"
                  onClick={() => {
                    setCreateMode('new');
                    setDropdownOpen(false);
                  }}
                >
                  <FileText className="h-4 w-4" />
                  New policy
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700"
                  onClick={() => {
                    setCreateMode('template');
                    setDropdownOpen(false);
                  }}
                >
                  <LayoutTemplate className="h-4 w-4" />
                  From template
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700"
                  onClick={() => {
                    setCreateMode('ai');
                    setDropdownOpen(false);
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate with AI
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700"
                  onClick={() => {
                    setCreateMode('upload-template');
                    setDropdownOpen(false);
                  }}
                >
                  <LayoutTemplate className="h-4 w-4" />
                  Create org template
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardContent>
          <Input
            placeholder="Search policies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Versions</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : policies.length === 0 ? (
                <TableEmptyState
                  message="No policies found. Create one from scratch, from a template, or with AI."
                  icon={<FileText className="h-12 w-12" />}
                />
              ) : (
                policies.map((policy: Policy) => (
                  <TableRow key={policy.id}>
                    <TableCell>
                      <Link
                        to={`/policies/${policy.id}`}
                        className="flex items-center gap-2 font-medium text-white hover:text-accent"
                      >
                        <FileText className="h-4 w-4 text-accent" />
                        {policy.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="line-clamp-1 text-sm text-slate-400">
                        {policy.description || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-300">
                        {policy.owner?.name || policy.owner?.email || 'Unassigned'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge size="sm">{policy.versions?.length ?? 0} versions</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-400">
                        {policy.dateAdded
                          ? new Date(policy.dateAdded).toLocaleDateString()
                          : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link to={`/policies/${policy.id}`}>
                          <Button size="sm" variant="ghost">
                            Open
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-400 hover:text-red-400"
                          onClick={(e) => {
                            e.preventDefault();
                            if (window.confirm(`Delete "${policy.name}"?`))
                              deleteMutation.mutate(String(policy.id));
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <CreatePolicyModal
        isOpen={createMode === 'new'}
        onClose={() => setCreateMode('none')}
        onSuccess={(id) => {
          queryClient.invalidateQueries({ queryKey: ['policies'] });
          setCreateMode('none');
          if (id) navigate(`/policies/${id}`);
        }}
      />

      <CreateFromTemplateModal
        isOpen={createMode === 'template'}
        onClose={() => setCreateMode('none')}
        onSuccess={(id) => {
          queryClient.invalidateQueries({ queryKey: ['policies'] });
          setCreateMode('none');
          if (id) navigate(`/policies/${id}`);
        }}
      />

      <GenerateWithAIModal
        isOpen={createMode === 'ai'}
        onClose={() => setCreateMode('none')}
        onSuccess={(id) => {
          queryClient.invalidateQueries({ queryKey: ['policies'] });
          setCreateMode('none');
          if (id) navigate(`/policies/${id}`);
        }}
      />

      <CreateTemplateModal
        isOpen={createMode === 'upload-template'}
        onClose={() => setCreateMode('none')}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['policy-templates'] });
          setCreateMode('none');
        }}
      />
    </div>
  );
}

function CreatePolicyModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (id?: number) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  const createMutation = useMutation({
    mutationFn: () =>
      policiesApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
        content: content.trim() || undefined,
      }),
    onSuccess: (policy) => {
      onSuccess(policy?.id);
      setName('');
      setDescription('');
      setContent('');
      onClose();
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New policy"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => createMutation.mutate()}
            disabled={!name.trim() || createMutation.isPending}
            loading={createMutation.isPending}
          >
            Create
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input
          label="Policy name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Information Security Policy"
          required
        />
        <Input
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description..."
        />
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Initial content (optional)
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="font-mono text-sm"
            placeholder="Paste or type policy content. You can also add versions later."
          />
        </div>
      </div>
    </Modal>
  );
}

function CreateFromTemplateModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (id?: number) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState<number | ''>('');

  const { data: templates } = useQuery({
    queryKey: ['policy-templates'],
    queryFn: () => policiesApi.listTemplates(),
    enabled: isOpen,
  });

  const templateList = (Array.isArray(templates) ? templates : []) as PolicyTemplate[];

  const createMutation = useMutation({
    mutationFn: () =>
      policiesApi.create({
        name: name.trim(),
        templateId: templateId as number,
      }),
    onSuccess: (policy) => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      onSuccess(policy?.id);
      setName('');
      setTemplateId('');
      onClose();
    },
  });

  const selectedTemplate = templateList.find((t) => t.id === templateId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create from template"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => createMutation.mutate()}
            disabled={!name.trim() || !templateId || createMutation.isPending}
            loading={createMutation.isPending}
          >
            Create policy
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Alert variant="info">
          Default templates (e.g. Information Security, Acceptable Use) can be seeded with{' '}
          <code className="rounded bg-slate-700 px-1">npm run prisma:seed-templates</code> in the backend.
          The template&apos;s text is loaded as the first version so you can edit it in the policy editor.
        </Alert>
        <Select
          label="Template"
          value={String(templateId)}
          onChange={(e) => setTemplateId(e.target.value ? Number(e.target.value) : '')}
          options={[
            { value: '', label: 'Select a template...' },
            ...templateList.map((t) => ({
              value: String(t.id),
              label: t.organizationId == null ? `${t.name} (default)` : t.name,
            })),
          ]}
        />
        {templateList.length === 0 && (
          <p className="text-sm text-slate-500">No templates yet. Create a new policy and save as template, or seed default templates in the backend.</p>
        )}
        {selectedTemplate && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const text = selectedTemplate.content ?? '';
                const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${selectedTemplate.name.replace(/[^a-zA-Z0-9-_]/g, '_')}-template.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Download template as file
            </Button>
            <span className="text-xs text-slate-500">
              Use this file to edit offline; create a policy from this template to load its text into the editor.
            </span>
          </div>
        )}
        <Input
          label="Policy name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. My Information Security Policy"
          required
        />
        {selectedTemplate?.description && (
          <p className="text-sm text-slate-400">{selectedTemplate.description}</p>
        )}
      </div>
    </Modal>
  );
}

function GenerateWithAIModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (id?: number) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const generateMutation = useMutation({
    mutationFn: () =>
      policiesApi.generateWithAi({
        name: name.trim(),
        description: description.trim(),
      }),
    onSuccess: (policy) => {
      onSuccess(policy?.id);
      setName('');
      setDescription('');
      onClose();
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate policy with AI"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={generateMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => generateMutation.mutate()}
            disabled={!name.trim() || !description.trim() || generateMutation.isPending}
            loading={generateMutation.isPending}
            icon={<Sparkles className="h-4 w-4" />}
          >
            {generateMutation.isPending ? 'Generating…' : 'Generate'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Alert variant="info">
          Provide a policy name and a short description or keywords. The AI will generate a first version using your organisation context.
        </Alert>
        <Input
          label="Policy name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Acceptable Use Policy"
          required
        />
        <Textarea
          label="Description / keywords"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Acceptable Use Policy for IT and data; cover email, internet, devices, data handling"
          rows={4}
          required
        />
      </div>
    </Modal>
  );
}

function CreateTemplateModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  const createMutation = useMutation({
    mutationFn: () =>
      policiesApi.createTemplate({
        name: name.trim(),
        description: description.trim() || undefined,
        content: content.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-templates'] });
      setName('');
      setDescription('');
      setContent('');
      onSuccess();
      onClose();
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create org template"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => createMutation.mutate()}
            disabled={!name.trim() || createMutation.isPending}
            loading={createMutation.isPending}
          >
            Create template
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Alert variant="info">
          Org-specific templates appear in &quot;From template&quot; and can be used when creating new policies.
        </Alert>
        <Input
          label="Template name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Internal Security Policy"
          required
        />
        <Input
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description..."
        />
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">Content (optional)</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="font-mono text-sm"
            placeholder="Default content for policies created from this template..."
          />
        </div>
      </div>
    </Modal>
  );
}
