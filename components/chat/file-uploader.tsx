'use client';

import React, { useRef, useState } from 'react';
import { AttachmentItem } from '@/lib/types';
import { Paperclip, X, FileText, Image as ImageIcon, FileSpreadsheet, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  attachments: AttachmentItem[];
  onAddAttachment: (item: AttachmentItem) => void;
  onRemoveAttachment: (id: string) => void;
}

export function FileUploader({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }

        const data = await res.json();
        onAddAttachment({
          id: `att_${Date.now()}_${i}`,
          name: data.name,
          url: data.url,
          contentType: data.contentType,
          size: data.size,
        });
      }
    } catch (err) {
      console.error('File upload error:', err);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('image/')) {
      return <ImageIcon className="w-3.5 h-3.5 text-blue-400" />;
    }
    if (contentType.includes('csv') || contentType.includes('spreadsheet') || contentType.includes('excel')) {
      return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />;
    }
    return <FileText className="w-3.5 h-3.5 text-amber-400" />;
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Uploaded Attachment Chips */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 group transition-colors hover:border-zinc-600"
            >
              {getFileIcon(att.contentType)}
              <span className="max-w-[140px] truncate font-medium">{att.name}</span>
              {att.size && (
                <span className="text-[10px] text-zinc-400">({formatSize(att.size)})</span>
              )}
              <button
                type="button"
                onClick={() => onRemoveAttachment(att.id)}
                className="text-zinc-400 hover:text-red-400 ml-1 p-0.5 rounded transition-colors"
                title="Remove attachment"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden File Input & Upload Trigger */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.csv,.json,.txt,.py,.js,.ts"
      />

      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/80 transition-colors disabled:opacity-50"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <Paperclip className="w-3.5 h-3.5 text-zinc-400" />
            <span>Attach Files (Images, CSV, PDF, Code)</span>
          </>
        )}
      </button>
    </div>
  );
}

