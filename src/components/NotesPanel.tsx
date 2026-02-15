import { useState } from 'react';
import { Send, Trash2, Edit2, X, Check } from 'lucide-react';
import { Button, Textarea, Badge, ConfirmModal } from './ui';
import type { ControlInstanceComment, User } from '../types/api';

interface NotesPanelProps {
  entityType: string;
  entityId: number;
  comments?: ControlInstanceComment[];
  currentUser?: User;
  onAddComment?: (content: string, mentions: number[]) => void;
  onEditComment?: (commentId: number, content: string) => void;
  onDeleteComment?: (commentId: number) => void;
  isLoading?: boolean;
}

export function NotesPanel({
  entityType: _entityType,
  entityId: _entityId,
  comments = [],
  currentUser,
  onAddComment,
  onEditComment,
  onDeleteComment,
  isLoading = false,
}: NotesPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const mentions: number[] = [];
    // In a real implementation, you'd look up user IDs from mentions

    onAddComment?.(newComment, mentions);
    setNewComment('');
  };

  const handleStartEdit = (comment: ControlInstanceComment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim() || !editingCommentId) return;
    
    onEditComment?.(editingCommentId, editContent);
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleDeleteComment = () => {
    if (!deleteCommentId) return;
    
    onDeleteComment?.(deleteCommentId);
    setDeleteCommentId(null);
  };

  return (
    <div className="space-y-4">
      {/* Comments List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center">
            <p className="text-slate-500">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 transition-colors hover:border-slate-600"
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
                    {comment.owner?.name?.[0] || comment.owner?.email?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {comment.owner?.name || comment.owner?.email || 'Unknown User'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(comment.dateAdded).toLocaleString()}
                    </p>
                  </div>
                </div>
                {currentUser && comment.ownerId === currentUser.id && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleStartEdit(comment)}
                      className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setDeleteCommentId(comment.id)}
                      className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              {editingCommentId === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      icon={<X className="h-3 w-3" />}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleSaveEdit}
                      icon={<Check className="h-3 w-3" />}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                  {comment.mentions && comment.mentions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {comment.mentions.map((mention) => (
                        <Badge key={mention.id} variant="info" size="sm">
                          @{mention.user.name || mention.user.email}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {comment.dateUpdated !== comment.dateAdded && (
                    <p className="mt-2 text-xs italic text-slate-500">
                      Edited {new Date(comment.dateUpdated).toLocaleString()}
                    </p>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment... Use @ to mention team members"
          rows={3}
          className="mb-3"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Tip: Use @username to mention team members
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddComment}
            disabled={!newComment.trim() || isLoading}
            loading={isLoading}
            icon={<Send className="h-4 w-4" />}
          >
            Comment
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteCommentId !== null}
        onClose={() => setDeleteCommentId(null)}
        onConfirm={handleDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
