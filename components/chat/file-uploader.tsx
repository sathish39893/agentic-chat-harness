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
      return <ImageIcon className="w-3.5 h-3.5 text-sky-400" />;
    }
    if (contentType.includes('csv') || contentType.includes('spreadsheet') || contentType.includes('excel')) {
      return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />;
    }
    return <FileText className="w-3.5 h-3.5 text-amber-400" />;
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.csv,.json,.txt,.py,.js,.ts"
      />

      {/* Render Attached Chips */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-2 px-1">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-xl bg-zinc-800/80 border border-white/10 text-xs text-zinc-200 group transition-all hover:border-white/20 shadow-xs"
            >
              {att.contentType.startsWith('image/') ? (
                <img
                  src={att.url}
                  alt={att.name}
                  className="w-5 h-5 rounded object-cover border border-white/10"
                />
              ) : (
                getFileIcon(att.contentType)
              )}
              <span className="max-w-[150px] truncate font-medium text-[11px] text-zinc-200">
                {att.name}
              </span>
              {att.size && (
                <span className="text-[10px] text-zinc-500 font-mono">
                  {formatSize(att.size)}
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemoveAttachment(att.id)}
                className="text-zinc-500 hover:text-rose-400 p-1 rounded-md hover:bg-zinc-700/50 transition-colors ml-0.5"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors disabled:opacity-50"
        title="Attach file (Images, CSV, PDF, Python)"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span className="text-zinc-300">Uploading...</span>
          </>
        ) : (
          <>
            <Paperclip className="w-4 h-4" />
            <span className="hidden sm:inline">Attach</span>
          </>
        )}
      </button>
    </div>
  );
}
