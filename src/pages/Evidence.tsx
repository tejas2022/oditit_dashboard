import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Upload,
  Search,
  FileText,
  Download,
  Trash2,
  Plus,
  X,
  File,
  Image,
} from 'lucide-react';
import { evidenceApi } from '../api/evidence';
import {
  Card,
  CardContent,
  Button,
  Input,
  Textarea,
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyState,
  Badge,
  Alert,
  ConfirmModal,
} from '../components/ui';
import type { Evidence } from '../types/api';
import { useAuthStore } from '../store/authStore';

export function Evidence() {
  const organization = useAuthStore((s) => s.organization);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  const { data: evidenceData, isLoading } = useQuery({
    queryKey: ['evidence', organization?.id, searchTerm, page],
    queryFn: () => evidenceApi.list({ page, limit: 20 }),
    enabled: !!organization,
  });

  const uploadMutation = useMutation({
    mutationFn: evidenceApi.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidence'] });
      setIsUploadModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => evidenceApi.delete(String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidence'] });
      setIsDeleteModalOpen(false);
      setSelectedEvidence(null);
    },
  });

  const evidence = Array.isArray(evidenceData) ? evidenceData : (evidenceData as { data?: Evidence[] })?.data ?? [];
  const meta = Array.isArray(evidenceData) ? undefined : (evidenceData as { meta?: { page: number; limit: number; total: number } })?.meta;

  if (!organization) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Evidence</h1>
        <p className="text-slate-400">Select or create an organisation to manage evidence.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Evidence</h1>
          <p className="mt-1 text-slate-400">
            Upload and manage compliance evidence
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setIsUploadModalOpen(true)}
        >
          Upload Evidence
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent>
          <Input
            placeholder="Search evidence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </CardContent>
      </Card>

      {/* Evidence List */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Files</TableHead>
                <TableHead>Collected Date</TableHead>
                <TableHead>Owner</TableHead>
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
              ) : evidence.length === 0 ? (
                <TableEmptyState
                  message="No evidence found. Upload your first evidence to get started."
                  icon={<FileText className="h-12 w-12" />}
                />
              ) : (
                evidence.map((item: Evidence) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-accent" />
                        <span className="font-medium text-white">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="line-clamp-1 text-sm text-slate-400">
                        {item.description || 'No description'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge>{item.files?.length || 0} files</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(item.collectedDate).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {item.owner?.name || item.owner?.email || 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedEvidence(item);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
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

      {/* Pagination */}
      {meta && Math.ceil(meta.total / meta.limit) > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Showing {(meta.page - 1) * meta.limit + 1} to{' '}
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} evidence
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= Math.ceil(meta.total / meta.limit)}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <UploadEvidenceModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={uploadMutation.mutate}
        isLoading={uploadMutation.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedEvidence(null);
        }}
        onConfirm={() => {
          if (selectedEvidence) {
            deleteMutation.mutate(selectedEvidence.id);
          }
        }}
        title="Delete Evidence"
        message={`Are you sure you want to delete "${selectedEvidence?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

// Upload Evidence Modal Component
function UploadEvidenceModal({
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
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!name || files.length === 0) return;

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    files.forEach((file) => {
      formData.append('files', file);
    });

    onSubmit(formData);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setFiles([]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetForm();
      }}
      title="Upload Evidence"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={isLoading}
            onClick={handleSubmit}
            disabled={!name || files.length === 0}
          >
            Upload
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input
          label="Evidence Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter evidence name..."
          required
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe this evidence..."
          rows={3}
        />

        {/* File Upload Area */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Files <span className="text-red-400">*</span>
          </label>
          <div
            className={`relative rounded-lg border-2 border-dashed transition-colors ${
              dragActive
                ? 'border-accent bg-accent/5'
                : 'border-slate-600 hover:border-slate-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              className="cursor-pointer p-8 text-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto mb-3 h-12 w-12 text-slate-500" />
              <p className="mb-1 text-sm font-medium text-slate-300">
                Drop files here or click to browse
              </p>
              <p className="text-xs text-slate-500">
                Supports PDF, images, documents (max 10MB each)
              </p>
            </div>
          </div>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Selected Files ({files.length})
            </label>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 p-3"
                >
                  <div className="flex items-center gap-3">
                    {file.type.startsWith('image/') ? (
                      <Image className="h-5 w-5 text-blue-400" />
                    ) : (
                      <File className="h-5 w-5 text-slate-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{file.name}</p>
                      <p className="text-xs text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length === 0 && (
          <Alert variant="info">
            Please upload at least one file to continue.
          </Alert>
        )}
      </div>
    </Modal>
  );
}
