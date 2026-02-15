import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FolderOpen } from 'lucide-react';
import { frameworksApi } from '../api/frameworks';
import { useAuthStore } from '../store/authStore';

/**
 * When the organisation has no activated frameworks, show a prominent banner
 * asking the user to choose a framework first. Only shown when user has an organisation.
 */
export function ChooseFrameworkBanner() {
  const organization = useAuthStore((s) => s.organization);
  const { data: activated, isLoading } = useQuery({
    queryKey: ['frameworks', 'activated'],
    queryFn: frameworksApi.activated,
    enabled: !!organization,
  });

  const activatedList = Array.isArray(activated) ? activated : [];
  const hasActivatedFramework = activatedList.length > 0;

  if (isLoading || hasActivatedFramework) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/15 px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-500/20 p-2">
            <FolderOpen className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-amber-100">
              Your organisation has not selected a framework yet
            </p>
            <p className="text-sm text-amber-200/80">
              Choose a compliance framework (e.g. ISO 27001, SOC 2) to get started. Controls will be created for your organisation after activation.
            </p>
          </div>
        </div>
        <Link
          to="/frameworks"
          className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 font-medium text-slate-900 hover:bg-amber-400"
        >
          Choose a framework
        </Link>
      </div>
    </div>
  );
}
