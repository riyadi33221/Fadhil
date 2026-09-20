import React, { useState } from 'react';
import {
  Share2,
  X,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  QrCode,
  Users,
  Award,
  Sparkles,
} from 'lucide-react';

interface ShareAppModalProps {
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ onClose }) => {
  const appUrl =
    typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
      ? window.location.origin
      : 'https://ais-pre-fs3sfbmvavc5iwmrypwhwc-768538907806.asia-southeast1.run.app';

  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = `Halo Bapak/Ibu Guru! ⚽🏀
Silakan gunakan Sistem Analisis Asesmen Sumatif (SAAS) v.3 SMPN 2 Kutasari untuk analisis nilai UH/Asesmen, program remedial, dan integrasi Google Sheets.

Akses aplikasi di sini:
${appUrl}`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 text-indigo-800 rounded-2xl flex-shrink-0">
              <Share2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-500/10 text-indigo-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Bagikan ke Rekan Guru
                </span>
                <span className="text-slate-400 text-xs font-semibold">SAAS v.3</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                Link Aplikasi SAAS SMPN 2 Kutasari
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 font-bold text-xl rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Bagikan link aplikasi ini kepada rekan guru PJOK atau guru mata pelajaran lain untuk memudahkan analisis nilai harian, program remedial/pengayaan, dan rekapitulasi Google Sheets.
          </p>

          {/* Copy Link Input Card */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Link Aplikasi Aktif:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Kirim via WhatsApp</span>
            </a>

            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Buka di Tab Baru</span>
            </a>
          </div>

          {/* Info Card */}
          <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100 flex items-start gap-3 text-xs">
            <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div className="text-slate-700 space-y-1">
              <span className="font-extrabold text-indigo-950">Keunggulan Aplikasi ini untuk Guru:</span>
              <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                <li>Integrasi penuh dengan Google Spreadsheet SAAS v.3</li>
                <li>Analisis ketuntasan & rekomendasi remedial otomatis dari AI</li>
                <li>Ekspor Laporan & Matriks Halaman 1-2 siap cetak PDF</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
