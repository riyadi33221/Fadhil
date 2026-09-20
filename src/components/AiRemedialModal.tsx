import React, { useState } from 'react';
import { AssessmentItem, ClassId, AiRemedialRecommendation, SchoolProfile } from '../types';
import { Sparkles, Loader2, CheckCircle2, Award, BookOpen, AlertTriangle, X } from 'lucide-react';

interface AiRemedialModalProps {
  profile?: SchoolProfile;
  selectedClass: ClassId;
  phItem: AssessmentItem;
  remedialCount: number;
  onClose: () => void;
}

export const AiRemedialModal: React.FC<AiRemedialModalProps> = ({
  profile,
  selectedClass,
  phItem,
  remedialCount,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AiRemedialRecommendation | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/remedial-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: profile?.subject || 'PJOK',
          topicName: `${phItem.code}: ${phItem.title} (${phItem.topic})`,
          learningObjective: phItem.learningObjective,
          kkm: phItem.kkm,
          lowScoringItems: `Soal teknik dasar & pemahaman konsep ${phItem.title}`,
          lowScoredStudentsCount: remedialCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal terhubung dengan layanan Gemini AI.');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memproses rekomendasi AI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Rekomendasi AI Remedial & Pengayaan
              </h3>
              <p className="text-xs text-slate-500">
                PJOK Kelas {selectedClass} • {phItem.code}: {phItem.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 font-bold text-xl rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-2 mb-4">
          <div className="font-bold flex items-center gap-1.5 text-purple-950">
            <BookOpen className="w-4 h-4 text-purple-700" />
            <span>Materi Analisis: {phItem.topic}</span>
          </div>
          <p className="text-purple-800">
            Sebanyak <strong>{remedialCount} siswa</strong> memerlukan program perbaikan (Remedial) untuk mencapai KKM ({phItem.kkm}). AI akan menyusun strategi pembelajaran ulang dan tantangan pengayaan khusus PJOK.
          </p>
        </div>

        {/* Action Button if no result yet */}
        {!result && (
          <div className="text-center py-6 space-y-4">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Gemini AI Sedang Menyusun Rekomendasi...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Buatkan Rekomendasi Remedial PJOK Sekarang</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl text-left">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        )}

        {/* Display Results */}
        {result && (
          <div className="space-y-4 text-xs">
            
            {/* Strategy Remedial */}
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 space-y-2">
              <h4 className="font-extrabold text-rose-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Strategi Remedial (Perbaikan Gerak)
              </h4>
              <p className="text-slate-800 leading-relaxed">{result.remedialStrategy}</p>
              
              <div className="pt-2">
                <strong className="text-slate-900 block mb-1">Rekomendasi Tugas/Praktik Remedial:</strong>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {result.remedialTasks?.map((task, i) => (
                    <li key={i}>{task}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Strategy Pengayaan */}
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-2">
              <h4 className="font-extrabold text-emerald-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                Strategi Pengayaan (Siswa Tuntas)
              </h4>
              <p className="text-slate-800 leading-relaxed">{result.pengayaanStrategy}</p>
              
              <div className="pt-2">
                <strong className="text-slate-900 block mb-1">Tantangan Pengayaan:</strong>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {result.pengayaanTasks?.map((task, i) => (
                    <li key={i}>{task}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Teacher Motivation Note */}
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 font-medium italic">
              &ldquo;{result.teacherNote}&rdquo;
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
              >
                {loading ? 'Memproses...' : 'Buat Ulang AI'}
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
              >
                Selesai
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
