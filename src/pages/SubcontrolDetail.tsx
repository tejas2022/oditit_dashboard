import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  Paperclip,
  Send,
  Sparkles,
} from 'lucide-react';
import { controlsApi } from '../api/controls';
import { EvidenceForSubcontrolModal } from '../components/EvidenceForSubcontrolModal';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Textarea,
  StatusBadge,
  Badge,
  Progress,
  Alert,
} from '../components/ui';
import type { OrganizationSubcontrolInstance } from '../types/api';
import { useAuthStore } from '../store/authStore';
import { canChangeApplicability, canRunAIAssessment } from '../lib/rbac';
import type { UserRole } from '../types/api';

export function SubcontrolDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const roles = useAuthStore((s) => s.roles) as string[];
  const primaryRole = (roles?.[0] ?? undefined) as UserRole | undefined;
  const userCanChangeApplicability = canChangeApplicability(primaryRole);
  const userCanRunAIAssessment = canRunAIAssessment(primaryRole);

  const [newNote, setNewNote] = useState('');
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);

  const { data: subcontrol, isLoading } = useQuery({
    queryKey: ['subcontrol', id],
    queryFn: () => controlsApi.getSubcontrol(id!),
    enabled: !!id,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['subcontrol-notes', id],
    queryFn: () => controlsApi.getSubcontrolNotes(id!),
    enabled: !!id,
  });

  const addNoteMutation = useMutation({
    mutationFn: (content: string) => controlsApi.addSubcontrolNote(id!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcontrol-notes', id] });
      setNewNote('');
    },
  });

  const updateApplicabilityMutation = useMutation({
    mutationFn: (isApplicable: boolean) =>
      controlsApi.updateSubcontrol(id!, { isApplicable }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcontrol', id] });
      queryClient.invalidateQueries({ queryKey: ['control'] });
      queryClient.invalidateQueries({ queryKey: ['controls'] });
      queryClient.invalidateQueries({ queryKey: ['control-stats'] });
    },
  });

  const aiAssessMutation = useMutation({
    mutationFn: () => controlsApi.aiAssessSubcontrol(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcontrol', id] });
      queryClient.invalidateQueries({ queryKey: ['control'] });
      queryClient.invalidateQueries({ queryKey: ['controls'] });
    },
  });

  if (!id) {
    return (
      <div className="space-y-6">
        <Alert variant="danger">Missing subcontrol ID.</Alert>
        <Link to="/controls">
          <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
            Back to Controls
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading || !subcontrol) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-800" />
        <div className="h-64 animate-pulse rounded-lg bg-slate-800" />
      </div>
    );
  }

  const fs = subcontrol.frameworkSubcontrol;
  const evidenceLinks = subcontrol.evidenceLinks ?? [];
  const parentControl = subcontrol.organizationControlInstance;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/controls">
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
            Back
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold text-white">
            {fs.refCode ?? 'Subcontrol'} – {fs.name}
          </h1>
          {parentControl && (
            <p className="mt-1 text-sm text-slate-400">
              Under control: {parentControl.frameworkControl?.refCode} –{' '}
              {parentControl.frameworkControl?.name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {userCanChangeApplicability ? (
            <select
              value={String(subcontrol.isApplicable !== false)}
              onChange={(e) =>
                updateApplicabilityMutation.mutate(e.target.value === 'true')
              }
              disabled={updateApplicabilityMutation.isPending}
              className="rounded border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-white"
            >
              <option value="true">Applicable</option>
              <option value="false">Not applicable</option>
            </select>
          ) : (
            <Badge
              variant={subcontrol.isApplicable !== false ? 'success' : 'warning'}
            >
              {subcontrol.isApplicable !== false ? 'Applicable' : 'Not applicable'}
            </Badge>
          )}
          <StatusBadge status={subcontrol.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Summary & description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm text-slate-500">Applicability</span>
              <p className="mt-0.5 text-sm text-slate-300">
                {subcontrol.isApplicable !== false ? 'Applicable' : 'Not applicable'}
              </p>
            </div>
            <div>
              <span className="text-sm text-slate-500">Implementation progress</span>
              <Progress value={subcontrol.implementedPct} className="mt-2" />
            </div>
            {fs.description && (
              <div>
                <span className="text-sm font-medium text-slate-300">Description</span>
                <p className="mt-2 text-sm text-slate-400">{fs.description}</p>
              </div>
            )}
            {fs.guidance && (
              <div>
                <span className="text-sm font-medium text-slate-300">Guidance</span>
                <p className="mt-2 text-sm text-slate-400">{fs.guidance}</p>
              </div>
            )}
            {subcontrol.reviewNotes && (
              <div>
                <span className="text-sm font-medium text-slate-300">Review notes</span>
                <p className="mt-2 text-sm text-slate-400">{subcontrol.reviewNotes}</p>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {subcontrol.aiAssessed && (
                <div>
                  <span className="text-sm font-medium text-slate-300">AI assessment</span>
                  <Badge variant={subcontrol.aiAssessmentResult === 'PASS' ? 'success' : 'warning'}>
                    {subcontrol.aiAssessmentResult}
                  </Badge>
                </div>
              )}
              {userCanRunAIAssessment && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Sparkles className="h-4 w-4" />}
                  onClick={() => aiAssessMutation.mutate()}
                  disabled={aiAssessMutation.isPending}
                  loading={aiAssessMutation.isPending}
                >
                  {aiAssessMutation.isPending ? 'Assessing…' : 'Run AI assessment'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paperclip className="h-5 w-5" />
              Evidence ({evidenceLinks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {evidenceLinks.length === 0 ? (
              <p className="text-sm text-slate-500">No evidence linked yet.</p>
            ) : (
              <ul className="space-y-2">
                {evidenceLinks.map((link) => (
                  <li
                    key={link.id}
                    className="flex items-center justify-between rounded border border-slate-700 bg-slate-800/30 px-3 py-2"
                  >
                    <span className="text-sm text-white">{link.evidence?.name}</span>
                    <Link
                      to={`/evidence?highlight=${link.evidence?.id}`}
                      className="text-xs text-accent hover:underline"
                    >
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Button
              variant="outline"
              size="sm"
              icon={<Paperclip className="h-4 w-4" />}
              onClick={() => setEvidenceModalOpen(true)}
            >
              Upload / link evidence
            </Button>
          </CardContent>
        </Card>
      </div>

      <EvidenceForSubcontrolModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        subcontrolId={Number(id)}
        subcontrolLabel={subcontrol ? `${fs.refCode ?? ''} ${fs.name}`.trim() : undefined}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['subcontrol', id] });
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Notes ({notes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              rows={2}
              className="flex-1"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => addNoteMutation.mutate(newNote)}
              disabled={!newNote.trim() || addNoteMutation.isPending}
              loading={addNoteMutation.isPending}
              icon={<Send className="h-4 w-4" />}
            >
              Add note
            </Button>
          </div>
          <ul className="space-y-2">
            {Array.isArray(notes) && notes.length === 0 ? (
              <li className="text-sm text-slate-500">No notes yet.</li>
            ) : (
              (notes as { id: number; content: string; dateAdded: string }[]).map((note) => (
                <li
                  key={note.id}
                  className="rounded border border-slate-700 bg-slate-800/30 px-3 py-2 text-sm text-slate-300"
                >
                  {note.content}
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(note.dateAdded).toLocaleString()}
                  </p>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" size="sm" icon={<Sparkles className="h-4 w-4" />}>
          Run AI assessment
        </Button>
        <Link to="/controls">
          <Button variant="ghost" size="sm">
            Back to Controls
          </Button>
        </Link>
      </div>
    </div>
  );
}
