import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { organizationsApi } from '../api/organizations';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Modal, Button } from './ui';

export function CreateOrganizationModal() {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const showCreateOrgModal = useAuthStore((s) => s.showCreateOrgModal);
  const setShowCreateOrgModal = useAuthStore((s) => s.setShowCreateOrgModal);
  const switchOrganization = useAuthStore((s) => s.switchOrganization);

  const createMutation = useMutation({
    mutationFn: () => organizationsApi.create({ name, ...(slug && { slug }) }),
    onSuccess: async (data: { id: number; name: string; slug?: string }) => {
      setError('');
      try {
        const tokens = await authApi.switchOrganization(data.id);
        switchOrganization(
          { id: data.id, name: data.name, slug: data.slug ?? '', dateAdded: '', dateUpdated: '' },
          tokens.accessToken,
          tokens.refreshToken
        );
        setShowCreateOrgModal(false);
        setName('');
        setSlug('');
      } catch (e: unknown) {
        setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to switch to organisation');
      }
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setError(err?.response?.data?.message ?? 'Failed to create organisation');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Organisation name is required');
      return;
    }
    createMutation.mutate();
  };

  if (!showCreateOrgModal) return null;

  return (
    <Modal
      isOpen
      onClose={() => {}}
      title="Create your organisation"
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={createMutation.isPending || !name.trim()}
          >
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </Button>
        </div>
      }
    >
      <p className="mb-4 text-sm text-slate-400">
        You need an organisation to use frameworks and compliance features. Create one to get started.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded bg-red-500/20 px-3 py-2 text-sm text-red-400">{error}</div>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Organisation name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white focus:border-accent focus:outline-none"
            placeholder="Acme Corp"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Slug (optional)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-surface-800 px-3 py-2 text-white focus:border-accent focus:outline-none"
            placeholder="acme-corp"
          />
        </div>
      </form>
    </Modal>
  );
}
