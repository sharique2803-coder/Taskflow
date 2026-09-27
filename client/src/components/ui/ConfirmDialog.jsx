import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirm Action'}>
      <div className="flex flex-col items-center text-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/60 dark:to-red-950/60 border border-rose-100 dark:border-rose-800/40 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-rose-400" />
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-xs">{message}</p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white text-sm font-semibold shadow-md shadow-rose-200 dark:shadow-rose-900/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            Delete Task
          </button>
        </div>
      </div>
    </Modal>
  );
}
