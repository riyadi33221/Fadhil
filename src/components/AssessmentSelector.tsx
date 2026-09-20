import React, { useState } from 'react';
import { AssessmentItem } from '../types';
import { Target, Edit, Layers, ChevronRight, CheckCircle2 } from 'lucide-react';

interface AssessmentSelectorProps {
  phItems: AssessmentItem[];
  selectedPhId: string;
  onSelectPh: (phId: string) => void;
  onUpdatePhItem: (updated: AssessmentItem) => void;
}

export const AssessmentSelector: React.FC<AssessmentSelectorProps> = ({
  phItems,
  selectedPhId,
  onSelectPh,
  onUpdatePhItem,
}) => {
  const currentPh = phItems.find((item) => item.id === selectedPhId) || phItems[0];
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<AssessmentItem>(currentPh);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePhItem(editForm);
    setShowEditModal(false);
  };

  const handleMaxScoreChange = (index: number, val: number) => {
    const updatedMaxes = [...editForm.itemMaxScores];
    updatedMaxes[index] = Math.max(0, Math.min(100, val));
    const totalMax = updatedMaxes.reduce((a, b) => a + b, 0);
    setEditForm({
      ...editForm,
      itemMaxScores: updatedMaxes,
      totalMaxScore: totalMax,
    });
  };

  const handleAddQuestion = () => {
    if (editForm.itemMaxScores.length >= 20) return;
    const updatedMaxes = [...editForm.itemMaxScores, 5];
    setEditForm({
      ...editForm,
      itemMaxScores: updatedMaxes,
      totalMaxScore: updatedMaxes.reduce((a, b) => a + b, 0),
    });
  };

  const handleRemoveQuestion = () => {
    if (editForm.itemMaxScores.length <= 4) return;
    const updatedMaxes = editForm.itemMaxScores.slice(0, -1);
    setEditForm({
      ...editForm,
      itemMaxScores: updatedMaxes,
      totalMaxScore: updatedMaxes.reduce((a, b) => a + b, 0),
    });
  };

  return (
    <div className="bg-slate-50 border-b border-slate-200 py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-3">
        
        {/* PH Tabs Bar (10 PHs) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {phItems.map((ph) => {
            const isSelected = ph.id === selectedPhId;
            return (
              <button
                key={ph.id}
                onClick={() => onSelectPh(ph.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-500/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{ph.code}</span>
                <span className="opacity-80 font-normal hidden sm:inline">• {ph.title}</span>
              </button>
            );
          })}
        </div>

        {/* Selected PH Detail Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-lg border border-indigo-200">
                {currentPh.code}: {currentPh.title}
              </span>
              <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                KKM: <strong className="text-indigo-600 font-bold">{currentPh.kkm}</strong>
              </span>
              <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                Jumlah Soal/Indikator: <strong>{currentPh.itemMaxScores.length} Soal</strong>
              </span>
              <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                Total Skor Maks: <strong>{currentPh.totalMaxScore}</strong>
              </span>
            </div>

            <div className="text-xs sm:text-sm text-slate-800 pt-0.5">
              <span className="font-bold text-slate-900">Materi / Topik: </span>
              <span className="text-slate-700 font-medium">{currentPh.topic}</span>
            </div>

            <div className="text-xs text-slate-600 flex items-start gap-1.5">
              <Target className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <span><strong>TP (Tujuan Pembelajaran):</strong> {currentPh.learningObjective}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                setEditForm(currentPh);
                setShowEditModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
            >
              <Edit className="w-4 h-4 text-slate-600" />
              <span>Edit PH / Skor Soal</span>
            </button>
          </div>
        </div>

      </div>

      {/* Edit PH Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <Edit className="w-5 h-5 text-emerald-600" />
                Edit Pengaturan {editForm.code}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul PH</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Topik / Materi Pokok PJOK</label>
                <input
                  type="text"
                  value={editForm.topic}
                  onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tujuan Pembelajaran (TP)
                </label>
                <textarea
                  rows={2}
                  value={editForm.learningObjective}
                  onChange={(e) => setEditForm({ ...editForm, learningObjective: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800">
                    KKM (Kriteria Ketuntasan Minimal)
                  </label>
                  <span className="text-[11px] text-indigo-600 font-semibold">
                    Disesuaikan Kedalaman Materi
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={editForm.kkm}
                      onChange={(e) => setEditForm({ ...editForm, kkm: parseInt(e.target.value) || 75 })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-700 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      readOnly
                      value={editForm.totalMaxScore}
                      className="w-full px-3 py-2 border bg-slate-200/60 rounded-lg font-bold text-slate-700"
                      title="Total Skor Maksimal"
                    />
                  </div>
                </div>

                {/* Preset KKM Berdasarkan Kedalaman & Kesulitan Materi */}
                <div>
                  <span className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Pilih Preset KKM Berdasarkan Kesulitan / Kedalaman Materi:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, kkm: 70 })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        editForm.kkm === 70
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50'
                      }`}
                      title="Materi sangat kompleks / risiko tinggi (contoh: Senam Lantai, Renang)"
                    >
                      70 (Sangat Sulit)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, kkm: 72 })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        editForm.kkm === 72
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                      }`}
                      title="Materi butuh koordinasi tinggi (contoh: Pencak Silat, Atletik)"
                    >
                      72 (Cukup Sulit)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, kkm: 75 })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        editForm.kkm === 75
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50'
                      }`}
                      title="Materi tingkat kesulitan standar (contoh: Bola Besar, Bola Kecil, Senam Ritmik)"
                    >
                      75 (Sedang)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, kkm: 78 })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        editForm.kkm === 78
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                      }`}
                      title="Materi relatif mudah / fisik dasar (contoh: Kebugaran Jasmani, Kesehatan Remaja)"
                    >
                      78 (Cukup Mudah)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, kkm: 80 })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        editForm.kkm === 80
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-teal-50'
                      }`}
                      title="Materi teori / pemahaman umum (contoh: Pola Makan Sehat, Gizi)"
                    >
                      80 (Sangat Mudah)
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Skor Maksimal Per Nomor Soal (Min 4 – Maks 20 Soal)
                    </label>
                    <span className="text-[10px] text-slate-500">Skor tiap soal: 0 s.d. 100</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleRemoveQuestion}
                      disabled={editForm.itemMaxScores.length <= 4}
                      className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold disabled:opacity-40 transition-colors"
                      title="Kurangi Soal (Minimal 4 Soal)"
                    >
                      - Soal
                    </button>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      disabled={editForm.itemMaxScores.length >= 20}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold disabled:opacity-40 transition-colors"
                      title="Tambah Soal (Maksimal 20 Soal)"
                    >
                      + Soal
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-52 overflow-y-auto p-1">
                  {editForm.itemMaxScores.map((score, idx) => (
                    <div key={idx} className="bg-slate-50 p-2 border border-slate-200 rounded-lg text-center">
                      <span className="block text-[11px] font-bold text-slate-600 mb-1">
                        Soal {idx + 1}
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={score}
                        onChange={(e) => {
                          const parsed = parseInt(e.target.value);
                          handleMaxScoreChange(idx, isNaN(parsed) ? 0 : parsed);
                        }}
                        className="w-full text-center py-1 border border-slate-300 rounded font-bold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
