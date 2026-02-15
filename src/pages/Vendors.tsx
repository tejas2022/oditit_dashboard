import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Building2, Mail, AlertTriangle } from 'lucide-react';
import { vendorsApi } from '../api/vendors';
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
  Select,
  Modal,
  StatusBadge,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Textarea,
  Alert,
} from '../components/ui';
import type { TprmVendor, VendorStatus } from '../types/api';
import { useAuthStore } from '../store/authStore';

export function Vendors() {
  const organization = useAuthStore((s) => s.organization);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VendorStatus | ''>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<TprmVendor | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: vendorsData, isLoading } = useQuery({
    queryKey: ['vendors', organization?.id, searchTerm, statusFilter],
    queryFn: () => vendorsApi.list({ page: 1, limit: 100 }),
    enabled: !!organization,
  });

  const createMutation = useMutation({
    mutationFn: vendorsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setIsCreateModalOpen(false);
    },
  });

  const vendors = Array.isArray(vendorsData) ? vendorsData : (vendorsData as { data?: TprmVendor[] })?.data ?? [];

  if (!organization) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Third-Party Risk Management</h1>
        <p className="text-slate-400">Select or create an organisation to manage vendors.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Third-Party Risk Management</h1>
          <p className="mt-1 text-slate-400">
            Manage vendor relationships and assess third-party risks
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Add Vendor
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as VendorStatus | '')}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
                { value: 'PENDING', label: 'Pending' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : vendors.length === 0 ? (
                <TableEmptyState
                  message="No vendors found. Add your first vendor to get started."
                  icon={<Building2 className="h-12 w-12" />}
                />
              ) : (
                vendors.map((vendor: TprmVendor) => (
                  <TableRow
                    key={vendor.id}
                    onClick={() => {
                      setSelectedVendor(vendor);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-accent" />
                        <span className="font-medium text-white">{vendor.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {vendor.email && (
                          <div className="flex items-center gap-1 text-slate-400">
                            <Mail className="h-3 w-3" />
                            {vendor.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge size="sm">{vendor.industry || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={vendor.status} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {vendor.startDate
                          ? new Date(vendor.startDate).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {vendor.expirationDate ? (
                        <div className="flex items-center gap-1">
                          <span className="text-sm">
                            {new Date(vendor.expirationDate).toLocaleDateString()}
                          </span>
                          {new Date(vendor.expirationDate) < new Date() && (
                            <AlertTriangle className="h-3 w-3 text-red-400" />
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Vendor Modal */}
      <CreateVendorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createMutation.mutate}
        isLoading={createMutation.isPending}
      />

      {/* Vendor Detail Modal */}
      {selectedVendor && (
        <VendorDetailModal
          vendor={selectedVendor}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedVendor(null);
          }}
        />
      )}
    </div>
  );
}

// Create Vendor Modal
function CreateVendorModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    industry: '',
    status: 'ACTIVE' as VendorStatus,
    startDate: '',
    expirationDate: '',
  });

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Vendor"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={isLoading}
            onClick={handleSubmit}
            disabled={!formData.name}
          >
            Create Vendor
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input
          label="Vendor Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Industry"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as VendorStatus })
            }
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
              { value: 'PENDING', label: 'Pending' },
            ]}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
          <Input
            label="Expiration Date"
            type="date"
            value={formData.expirationDate}
            onChange={(e) =>
              setFormData({ ...formData, expirationDate: e.target.value })
            }
          />
        </div>
      </div>
    </Modal>
  );
}

// Vendor Detail Modal
function VendorDetailModal({
  vendor,
  isOpen,
  onClose,
}: {
  vendor: TprmVendor;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={vendor.name} size="xl">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questionnaire">Questionnaire</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-300">Status</label>
                <div className="mt-1">
                  <StatusBadge status={vendor.status} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">Industry</label>
                <p className="mt-1 text-slate-400">{vendor.industry || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">Email</label>
                <p className="mt-1 text-slate-400">{vendor.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">Start Date</label>
                <p className="mt-1 text-slate-400">
                  {vendor.startDate
                    ? new Date(vendor.startDate).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
            {vendor.description && (
              <div>
                <label className="text-sm font-medium text-slate-300">Description</label>
                <p className="mt-2 text-sm text-slate-400">{vendor.description}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="questionnaire">
          <Alert variant="info">
            Questionnaire feature will allow vendors to answer compliance questions.
          </Alert>
        </TabsContent>

        <TabsContent value="evidence">
          <Alert variant="info">
            Vendor evidence uploads will be displayed here.
          </Alert>
        </TabsContent>

        <TabsContent value="notes">
          <Alert variant="info">
            Internal notes about this vendor will be shown here.
          </Alert>
        </TabsContent>
      </Tabs>
    </Modal>
  );
}
