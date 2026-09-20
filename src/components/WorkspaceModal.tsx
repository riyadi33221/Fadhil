import React, { useState } from 'react';
import { Layers, Check, ArrowRight, ShieldCheck, X, PlusCircle } from 'lucide-react';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWorkspaceId: string;
  onSelectWorkspace: (wsId: string) => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  currentWorkspaceId,
  onSelectWorkspace,
}) => {
  const [newWsInput, setNewWsInput] = useState('');
  const [savedWorkspaces] = useState<string[]>(() => {
    const list = ['smpn2kutasari'];
    if (!list.includes(currentWorkspaceId)) {
      list.push(currentWorkspaceId);
    }
    return list;
  });

  if (!isOpen) return null;

  const handleSwitch = (wsId: string) => {
    const clean = wsId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (!clean) return;
    onSelectWorkspace(clean);
    onClose();
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsInput.trim()) return;
    handleSwitch(newWsInput);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative space-y-4">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-700">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Ruang Kerja Terpisah (Workspace)
            </h3>
            <p className="text-xs text-slate-500">
              Data terisolasi aman per Kode Ruang Kerja
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs space-y-1.5 text-slate-700">
          <div className="flex items-center gap-2 font-bold text-indigo-900">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Keamanan & Kemandirian Data Guru</span>
          </div>
          <p className="leading-relaxed">
            Gunakan <strong>Kode Ruang Kerja</strong> berbeda jika Anda atau rekan guru lain ingin mengelola data sekolah/materi tersendiri tanpa mengubah atau mempengaruhi data utama <strong>SMPN 2 Kutasari</strong>.
          </p>
        </div>

        {/* Saved/Quick Workspaces */}
        <div className="space-y-2 text-xs">
          <label className="block text-slate-700 font-bold">Pilih Ruang Kerja Terdaftar:</label>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {savedWorkspaces.map((ws) => {
              const isCurrent = ws === currentWorkspaceId;
              return (
                <button
                  key={ws}
                  onClick={() => handleSwitch(ws)}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                    isCurrent
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-extrabold shadow-sm'
                      : 'bg-white border-slate-200 hover:border-indigo-300 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="uppercase text-xs tracking-wider">{ws}</span>
                    {ws === 'smpn2kutasari' && (
                      <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                        Utama (Purwanto, S.Pd.)
                      </span>
                    )}
                  </div>
                  {isCurrent ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Create / Switch to New Workspace */}
        <form onSubmit={handleCreateSubmit} className="space-y-3 pt-2 border-t border-slate-100 text-xs">
          <label className="block text-slate-700 font-bold">
            Buat atau Masuk ke Kode Ruang Kerja Baru:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newWsInput}
              onChange={(e) => setNewWsInput(e.target.value)}
              placeholder="Contoh: guru-smpn1, kelas-b, riyadi-pjok..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-medium"
            />
            <button
              type="submit"
              disabled={!newWsInput.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buka</span>
            </button>
          </div>
        </form>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
