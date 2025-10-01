"use client";

interface AdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminDialog({ isOpen, onClose }: AdminDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl border border-purple-400/30 shadow-2xl max-w-4xl w-full h-[600px] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Admin Screen</h2>
          <p className="text-purple-300 text-lg">TBD</p>
        </div>
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-purple-300 hover:text-white transition-colors text-2xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
