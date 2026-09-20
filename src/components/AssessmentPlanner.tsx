import React from 'react';
import { AssessmentItem } from '../types';
import { Target, Edit2, Layers, CheckCircle, BookOpen } from 'lucide-react';

interface AssessmentPlannerProps {
  phItems: AssessmentItem[];
  selectedPhId: string;
  onSelectPh: (phId: string) => void;
  onUpdatePhItem: (updated: AssessmentItem) => void;
}

export const AssessmentPlanner: React.FC<AssessmentPlannerProps> = ({
  phItems,
  selectedPhId,
  onSelectPh,
  onUpdatePhItem,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 inline-block mb-2">
              Kurikulum Merdeka PJOK SMP Kelas VII
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Rencana 10 Penilaian Harian (PH 1 - PH 10) Semester
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Pemetaan alur tujuan pembelajaran (ATP), lingkup materi, dan alokasi penilaian harian PJOK selama 1 semester untuk kelas VII A, B, C, D, E, F, G.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 text-center flex-shrink-0">
            <span className="text-xs text-slate-400 block font-medium">Target Penilaian</span>
            <strong className="text-2xl font-black text-emerald-400">10 Penilaian</strong>
            <span className="text-[10px] text-slate-400 block">Sesuai Modul Ajar PJOK</span>
          </div>
        </div>
      </div>

      {/* Grid of 10 Penilaian Harian Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {phItems.map((ph, idx) => {
          const isSelected = ph.id === selectedPhId;

          return (
            <div
              key={ph.id}
              className={`bg-white rounded-2xl p-5 border transition-all shadow-sm flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-900 text-white text-xs font-black px-2.5 py-1 rounded-lg">
                      {ph.code}
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-indigo-200">
                      KKM: {ph.kkm}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {ph.itemMaxScores.length} Soal / Indikator (Maks: {ph.totalMaxScore})
                  </span>
                </div>

                {/* Title & Topic */}
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                    {ph.title}
                  </h3>
                  <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                    {ph.topic}
                  </p>
                </div>

                {/* TP (Tujuan Pembelajaran) */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-slate-900">
                    <Target className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Tujuan Pembelajaran (TP):</span>
                  </div>
                  <p className="leading-relaxed text-slate-600 pl-4">{ph.learningObjective}</p>
                </div>

                {/* Item Max Scores Breakdown */}
                <div className="text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800">Skor Maks per Soal: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {ph.itemMaxScores.map((score, sIdx) => (
                      <span
                        key={sIdx}
                        className="bg-slate-100 text-slate-800 border border-slate-200 px-1.5 py-0.5 rounded font-bold"
                      >
                        S{sIdx + 1}: {score}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Card Action */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectPh(ph.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {isSelected ? 'Sedang Dipilih' : 'Pilih & Analisis PH Ini'}
                </button>

                <span className="text-xs text-slate-400 font-medium">
                  PH ke-{idx + 1} dari 10
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
