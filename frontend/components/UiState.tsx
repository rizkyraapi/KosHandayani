'use client';

import { AlertCircle, FileText, Loader2, RefreshCw } from 'lucide-react';

type UiStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function LoadingState({ title = 'Memuat data', description }: Partial<UiStateProps>) {
  return (
    <div className="rounded-xl border border-[#e7eeff] bg-[#f9f9ff] px-5 py-10 text-center">
      <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#006e2f] shadow-sm">
        <Loader2 className="animate-spin" size={20} />
      </span>
      <p className="mt-3 text-base font-semibold text-[#111c2d]">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#3d4a3d]">{description}</p>}
    </div>
  );
}

export function EmptyState({ title, description, actionLabel, onAction }: UiStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-[#bccbb9] bg-[#f9f9ff] px-5 py-10 text-center">
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#e7eeff] text-[#006e2f]">
        <FileText size={22} />
      </span>
      <p className="mt-3 text-base font-semibold text-[#111c2d]">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#3d4a3d]">{description}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#d8e3fb] bg-white px-4 text-sm font-bold text-[#111c2d] transition hover:bg-[#f0f3ff]"
        >
          <RefreshCw size={15} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorState({ title, description, actionLabel = 'Coba lagi', onAction }: UiStateProps) {
  return (
    <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-5 text-red-800">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 shrink-0" size={20} />
        <div>
          <p className="text-sm font-bold">{title}</p>
          {description && <p className="mt-1 text-sm leading-6">{description}</p>}
          {onAction && (
            <button
              type="button"
              onClick={onAction}
              className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-white px-3 text-sm font-bold text-red-800 transition hover:bg-red-100"
            >
              <RefreshCw size={15} />
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
