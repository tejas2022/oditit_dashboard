import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { evidenceApi } from '../api/evidence';
import { Modal, Button } from './ui';
import type { Evidence, EvidenceFile } from '../types/api';

/** Evidence Preview Modal – show file by type (image, PDF, or link). Reused on Evidence page and SubcontrolDetail. */
export function EvidencePreviewModal({
  evidence,
  fileIndex,
  onClose,
  onFileIndexChange,
}: {
  evidence: Evidence | null;
  fileIndex: number;
  onClose: () => void;
  onFileIndexChange: (index: number) => void;
}) {
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!evidence) {
      setFiles([]);
      setPreviewUrl(null);
      setFileName('');
      setFileType('');
      setError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        let list = evidence.files ?? [];
        if (list.length === 0) {
          const full = await evidenceApi.get(String(evidence.id));
          list = full?.files ?? [];
        }
        if (cancelled) return;
        setFiles(list);
        if (list.length === 0) {
          setError('No files in this evidence.');
          setPreviewUrl(null);
          setLoading(false);
          return;
        }
        const idx = Math.min(fileIndex, list.length - 1);
        const file = list[idx];
        const { url, fileName: fn, fileType: ft } = await evidenceApi.getFileDownloadUrl(String(evidence.id), file.id);
        if (cancelled) return;
        setPreviewUrl(url);
        setFileName(fn || file.fileName || 'file');
        setFileType(ft || file.fileType || '');
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load preview.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [evidence?.id, fileIndex]);

  const currentFiles = files;
  const hasMultiple = currentFiles.length > 1;
  const isImage = fileType.startsWith('image/');
  const isPdf = fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

  if (!evidence) return null;

  return (
    <Modal isOpen={!!evidence} onClose={onClose} title={evidence.name} size="lg">
      <div className="space-y-4">
        {evidence.description && (
          <p className="text-sm text-slate-400">{evidence.description}</p>
        )}
        {loading && (
          <div className="flex min-h-[200px] items-center justify-center text-slate-400">
            Loading preview...
          </div>
        )}
        {error && !loading && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-red-400">
            {error}
          </div>
        )}
        {previewUrl && !loading && !error && (
          <>
            {hasMultiple && (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={fileIndex <= 0}
                  onClick={() => onFileIndexChange(fileIndex - 1)}
                >
                  Previous file
                </Button>
                <span className="text-sm text-slate-400">
                  File {fileIndex + 1} of {currentFiles.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={fileIndex >= currentFiles.length - 1}
                  onClick={() => onFileIndexChange(fileIndex + 1)}
                >
                  Next file
                </Button>
              </div>
            )}
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-slate-700 bg-slate-900/50 p-4">
              {isImage && (
                <img
                  src={previewUrl}
                  alt={fileName}
                  className="max-h-[70vh] max-w-full object-contain"
                />
              )}
              {isPdf && !isImage && (
                <iframe
                  src={previewUrl}
                  title={fileName}
                  className="h-[70vh] w-full rounded border-0"
                />
              )}
              {!isImage && !isPdf && (
                <div className="flex flex-col items-center gap-3 text-center">
                  <FileText className="h-12 w-12 text-slate-500" />
                  <p className="text-sm text-slate-400">
                    This file type cannot be previewed inline.
                  </p>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    Open in new tab
                  </a>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500">{fileName}</p>
          </>
        )}
      </div>
    </Modal>
  );
}
