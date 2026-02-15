import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, CheckCircle, Clock } from 'lucide-react';
import { frameworksApi } from '../api/frameworks';
import { useAuthStore } from '../store/authStore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Modal,
  Badge,
  Progress,
  Alert,
  Skeleton,
} from '../components/ui';
import type { Framework, OrganizationFramework } from '../types/api';

export function Frameworks() {
  const organization = useAuthStore((s) => s.organization);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: availableFrameworksRaw, isLoading: loadingAvailable } = useQuery({
    queryKey: ['frameworks'],
    queryFn: () => frameworksApi.list(),
    enabled: !!organization,
  });
  const availableFrameworks = (availableFrameworksRaw as { data?: Framework[] } | undefined)?.data ?? (Array.isArray(availableFrameworksRaw) ? availableFrameworksRaw : []);

  const { data: activeFrameworks, isLoading: loadingActive } = useQuery({
    queryKey: ['organization-frameworks', organization?.id],
    queryFn: frameworksApi.listActive,
    enabled: !!organization,
  });

  const activateMutation = useMutation({
    mutationFn: (frameworkId: number) => frameworksApi.activate(frameworkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-frameworks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setIsActivateModalOpen(false);
      setSelectedFramework(null);
    },
  });

  const filteredFrameworks = (availableFrameworks ?? []).filter((f: Framework) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeFrameworkIds = new Set(
    activeFrameworks?.map((af) => af.frameworkId) || []
  );

  if (!organization) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Compliance Frameworks</h1>
        <p className="text-slate-400">Create an organisation first to select and manage frameworks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Compliance Frameworks</h1>
        <p className="mt-1 text-slate-400">
          Select and manage your compliance frameworks
        </p>
      </div>

      {/* Active Frameworks */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-white">
          Active Frameworks ({activeFrameworks?.length || 0})
        </h2>
        {loadingActive ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : activeFrameworks && activeFrameworks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeFrameworks.map((orgFramework) => (
              <ActiveFrameworkCard
                key={orgFramework.id}
                framework={orgFramework}
              />
            ))}
          </div>
        ) : (
          <Alert variant="info">
            No frameworks activated yet. Choose from available frameworks below to get started.
          </Alert>
        )}
      </div>

      {/* Available Frameworks */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Available Frameworks
          </h2>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search frameworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
              icon={<Search className="h-4 w-4" />}
            />
          </div>
        </div>

        {loadingAvailable ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFrameworks?.map((framework: Framework) => {
              const isActive = activeFrameworkIds.has(framework.id);
              return (
                <Card
                  key={framework.id}
                  hover={!isActive}
                  className={isActive ? 'opacity-60' : ''}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {framework.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {framework.code.toUpperCase()}
                        </CardDescription>
                      </div>
                      {isActive ? (
                        <Badge variant="success" size="sm">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="default" size="sm">
                          Available
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-400 line-clamp-3">
                      {framework.description || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Total Controls</span>
                      <span className="font-semibold text-white">
                        {framework.totalControlsCount}
                      </span>
                    </div>
                    {!isActive && (
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={() => {
                          setSelectedFramework(framework);
                          setIsActivateModalOpen(true);
                        }}
                        icon={<Plus className="h-4 w-4" />}
                      >
                        Activate Framework
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Activate Framework Modal */}
      <Modal
        isOpen={isActivateModalOpen}
        onClose={() => {
          setIsActivateModalOpen(false);
          setSelectedFramework(null);
        }}
        title="Activate Framework"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setIsActivateModalOpen(false);
                setSelectedFramework(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={activateMutation.isPending}
              onClick={() => {
                if (selectedFramework) {
                  activateMutation.mutate(selectedFramework.id);
                }
              }}
            >
              Activate
            </Button>
          </div>
        }
      >
        {selectedFramework && (
          <div className="space-y-4">
            <Alert variant="info">
              You are about to activate the <strong>{selectedFramework.name}</strong> framework for your organization.
            </Alert>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-300">
                  Framework Code
                </label>
                <p className="mt-1 text-slate-400">
                  {selectedFramework.code.toUpperCase()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">
                  Total Controls
                </label>
                <p className="mt-1 text-slate-400">
                  {selectedFramework.totalControlsCount} controls will be created
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">
                  Description
                </label>
                <p className="mt-1 text-slate-400">
                  {selectedFramework.description || 'No description available'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ActiveFrameworkCard({ framework }: { framework: OrganizationFramework }) {
  return (
    <Card hover className="border-accent/30">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {framework.framework.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {framework.framework.code.toUpperCase()}
            </CardDescription>
          </div>
          <Badge variant="success" size="sm">
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <Progress
            value={framework.completionProgress}
            label="Completion Progress"
            showLabel
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-slate-800 p-2">
            <p className="text-lg font-bold text-white">
              {framework.totalControlsCount}
            </p>
            <p className="text-xs text-slate-500">Controls</p>
          </div>
          <div className="rounded-lg bg-slate-800 p-2">
            <p className="text-lg font-bold text-white">
              {framework.totalPoliciesCount}
            </p>
            <p className="text-xs text-slate-500">Policies</p>
          </div>
          <div className="rounded-lg bg-slate-800 p-2">
            <p className="text-lg font-bold text-white">
              {framework.totalProceduresCount}
            </p>
            <p className="text-xs text-slate-500">Procedures</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Started</span>
            <span className="text-white">
              {new Date(framework.startedAt).toLocaleDateString()}
            </span>
          </div>
          {framework.nextAssessmentDue && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Next Review
              </span>
              <span className="text-white">
                {new Date(framework.nextAssessmentDue).toLocaleDateString()}
              </span>
            </div>
          )}
          {framework.owner && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Owner</span>
              <span className="text-white">{framework.owner.name || framework.owner.email}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            // Navigate to framework detail/controls page
            window.location.href = `/controls?frameworkId=${framework.id}`;
          }}
        >
          View Controls
        </Button>
      </CardContent>
    </Card>
  );
}
