import React, { useState } from 'react';
import { AssessmentItem, ClassId, SchoolProfile, ScoreRecord, Student } from '../types';
import {
  CheckCircle2,
  XCircle,
  Search,
  UserPlus,
  Zap,
  Filter,
  Check,
  Edit2,
  Trash2,
  AlertTriangle,
  Info,
  Printer,
  Download,
  FileSpreadsheet,
} from 'lucide-react';

interface ScoreMatrixTableProps {
  profile: SchoolProfile;
  selectedClass: ClassId;
  phItem: AssessmentItem;
  students: Student[];
  scores: ScoreRecord[];
  onUpdateScoreRecord: (updated: ScoreRecord) => void;
  onOpenAddStudentModal: () => void;
  onOpenGoogleSheetsModal?: () => void;
  onUpdateStudent?: (updated: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onBulkSetScores: (type: 'max' | 'kkm') => void;
  onOpenPrintModal?: (mode: 'matrix' | 'analysis' | 'lkpd' | 'remedial_final') => void;
  isEditUnlocked?: boolean;
  onRequireUnlock?: () => void;
}

export const ScoreMatrixTable: React.FC<ScoreMatrixTableProps> = ({
  profile,
  selectedClass,
  phItem,
  students,
  scores,
  onUpdateScoreRecord,
  onOpenAddStudentModal,
  onOpenGoogleSheetsModal,
  onUpdateStudent,
  onDeleteStudent,
  onBulkSetScores,
  onOpenPrintModal,
  isEditUnlocked = false,
  onRequireUnlock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'passed' | 'remedial'>('all');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  // Filter students in current class sorted alphabetically by name
  const classStudents = students
    .filter((s) => s.classId === selectedClass)
    .sort((a, b) => a.name.localeCompare(b.name, 'id', { sensitivity: 'base' }));

  // Map student ID to their score record for current PH
  const scoreMap = new Map<string, ScoreRecord>();
  scores.forEach((s) => {
    if (s.phId === phItem.id && s.classId === selectedClass) {
      scoreMap.set(s.studentId, s);
    }
  });

  // Filtered list based on search and status
  const filteredStudents = classStudents.filter((student) => {
    const scoreRec = scoreMap.get(student.id);
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nis.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'passed') return scoreRec?.isPassed ?? false;
    if (filterStatus === 'remedial') return !(scoreRec?.isPassed ?? false);

    return true;
  });

  // Calculations for Column Footer Summaries (Matching PDF Page 1)
  const questionCount = phItem.itemMaxScores.length;
  const questionSums = new Array(questionCount).fill(0);
  const questionMaxes = phItem.itemMaxScores.map((m) => m * classStudents.length);
  let grandTotalScore = 0;
  let grandTotalMax = phItem.totalMaxScore * classStudents.length;

  classStudents.forEach((student) => {
    const record = scoreMap.get(student.id);
    if (record) {
      record.itemScores.forEach((s, idx) => {
        if (idx < questionCount) {
          questionSums[idx] += s;
        }
      });
      grandTotalScore += record.totalScore;
    }
  });

  const questionPercentages = questionSums.map((sum, idx) => {
    const maxPoss = questionMaxes[idx];
    return maxPoss > 0 ? Math.round((sum / maxPoss) * 100) : 0;
  });

  // Quick Inline Item Score Change handler
  const handleItemScoreChange = (
    studentId: string,
    questionIdx: number,
    val: number
  ) => {
    if (!isEditUnlocked) {
      if (onRequireUnlock) onRequireUnlock();
      return;
    }

    const existing = scoreMap.get(studentId);
    const maxForQuestion = phItem.itemMaxScores[questionIdx] || 5;
    const sanitizedVal = Math.min(maxForQuestion, Math.max(0, val));

    let updatedItemScores = existing
      ? [...existing.itemScores]
      : new Array(questionCount).fill(0);

    // ensure array length
    while (updatedItemScores.length < questionCount) {
      updatedItemScores.push(0);
    }

    updatedItemScores[questionIdx] = sanitizedVal;

    const totalScore = updatedItemScores.reduce((a, b) => a + b, 0);
    const percentageScore = Math.round((totalScore / phItem.totalMaxScore) * 100);
    const isPassed = percentageScore >= phItem.kkm;

    const updatedRecord: ScoreRecord = {
      studentId,
      phId: phItem.id,
      classId: selectedClass,
      itemScores: updatedItemScores,
      totalScore,
      percentageScore,
      isPassed,
      remedialScore: existing?.remedialScore,
      postRemedialPercentage: existing?.postRemedialPercentage,
      isPassedPostRemedial: existing?.isPassedPostRemedial ?? isPassed,
      remedialNotes: existing?.remedialNotes,
    };

    onUpdateScoreRecord(updatedRecord);
  };

  // Handler for updating remedial score directly from the matrix table
  const handleRemedialScoreChange = (studentId: string, inputVal: string) => {
    const existing = scoreMap.get(studentId);
    if (inputVal === '' || inputVal === undefined) {
      if (existing) {
        onUpdateScoreRecord({
          ...existing,
          remedialScore: null,
          postRemedialPercentage: null,
          isPassedPostRemedial: existing.isPassed,
        });
      }
      return;
    }

    const num = parseInt(inputVal) || 0;
    let remedialScore: number;
    let postRemedialPercentage: number;

    if (num > phItem.totalMaxScore) {
      postRemedialPercentage = Math.min(100, Math.max(0, num));
      remedialScore = Math.round((postRemedialPercentage / 100) * phItem.totalMaxScore);
    } else {
      remedialScore = Math.min(phItem.totalMaxScore, Math.max(0, num));
      postRemedialPercentage = Math.round((remedialScore / phItem.totalMaxScore) * 100);
    }

    const isPassedPostRemedial = postRemedialPercentage >= phItem.kkm;

    const itemScores = existing?.itemScores || new Array(questionCount).fill(0);
    const totalScore = existing?.totalScore ?? 0;
    const percentageScore = existing?.percentageScore ?? 0;
    const isPassed = existing?.isPassed ?? false;

    const updatedRecord: ScoreRecord = {
      studentId,
      phId: phItem.id,
      classId: selectedClass,
      itemScores,
      totalScore,
      percentageScore,
      isPassed,
      remedialScore,
      postRemedialPercentage,
      isPassedPostRemedial,
      remedialNotes: existing?.remedialNotes,
    };

    onUpdateScoreRecord(updatedRecord);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Formal Header Banner (PDF Page 1 Style) */}
      <div className="p-5 border-b border-slate-200 bg-slate-900 text-white">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-widest text-emerald-400 font-extrabold">
              ANALISIS ASESMEN LINGKUP MATERI
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              {phItem.code} : {phItem.title}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-xs text-slate-300 pt-1">
              <div>Mata Pelajaran: <strong className="text-white">{profile.subject.includes('PJOK') ? 'PJOK' : profile.subject}</strong></div>
              <div>Kelas: <strong className="text-amber-300">{selectedClass}</strong></div>
              <div>Tahun Ajaran: <strong className="text-white">{profile.academicYear}</strong></div>
              <div>Semester: <strong className="text-white">{profile.semester}</strong></div>
              <div>UH/Asesmen ke: <strong className="text-white">{phItem.code}</strong></div>
              <div>KKM: <strong className="text-emerald-400">{phItem.kkm}</strong></div>
              <div className="sm:col-span-2">Materi: <strong className="text-white">{phItem.title}</strong></div>
            </div>

            {phItem.learningObjective && (
              <div className="text-xs text-slate-300 pt-1 border-t border-slate-800/80 mt-2">
                <span className="font-bold text-slate-200">Tujuan Pembelajaran (TP) :</span>
                <p className="text-slate-100 font-normal leading-relaxed mt-0.5">{phItem.learningObjective}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenGoogleSheetsModal && (
              <button
                onClick={onOpenGoogleSheetsModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md border border-emerald-500/40"
                title="Sinkron / Impor Penilaian dari Google Spreadsheet SAAS v.3"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                <span>Impor Google Sheets</span>
              </button>
            )}

            {onOpenPrintModal && (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => onOpenPrintModal('matrix')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                  title="Simpan PDF Halaman 1 (Matriks)"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>PDF Hal 1</span>
                </button>

                <button
                  onClick={() => onOpenPrintModal('analysis')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                  title="Simpan PDF Halaman 2 (Laporan Analisis & Remedial)"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>PDF Hal 2</span>
                </button>

                <button
                  onClick={() => onOpenPrintModal('lkpd')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                  title="Simpan PDF Halaman 3 (Lembar Kerja Peserta Didik / LKPD)"
                >
                  <Download className="w-3.5 h-3.5 text-amber-200" />
                  <span>PDF Hal 3 (LKPD)</span>
                </button>
              </div>
            )}

            <button
              onClick={() => {
                if (!isEditUnlocked && onRequireUnlock) {
                  onRequireUnlock();
                } else {
                  onOpenAddStudentModal();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Siswa</span>
            </button>

            <button
              onClick={() => {
                if (!isEditUnlocked && onRequireUnlock) {
                  onRequireUnlock();
                } else {
                  onBulkSetScores('max');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
              title="Set Nilai Maksimal untuk Semua Siswa"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Isi Nilai Maks</span>
            </button>
          </div>
        </div>
      </div>

      {/* Read-Only Notice Banner */}
      {!isEditUnlocked && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2 font-medium">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Mode Baca Saja (Terkunci):</strong> Data nilai dan data siswa dilindungi dari perubahan tidak sengaja.
            </span>
          </div>
          <button
            onClick={onRequireUnlock}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm text-xs transition-all flex items-center gap-1 shrink-0"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Buka Kunci Edit (PIN Guru)</span>
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama siswa atau NIS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'bg-white border text-slate-700 hover:bg-slate-100'
            }`}
          >
            Semua ({classStudents.length})
          </button>
          <button
            onClick={() => setFilterStatus('passed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterStatus === 'passed'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Tuntas (
            {classStudents.filter((s) => scoreMap.get(s.id)?.isPassed).length})
          </button>
          <button
            onClick={() => setFilterStatus('remedial')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterStatus === 'remedial'
                ? 'bg-rose-600 text-white font-bold'
                : 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50'
            }`}
          >
            Belum Tuntas (
            {classStudents.filter((s) => !scoreMap.get(s.id)?.isPassed).length})
          </button>
        </div>
      </div>

      {/* Main Score Matrix Table (Matches PDF Page 1) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            {/* Top Header Row */}
            <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold uppercase tracking-wider">
              <th className="p-2.5 text-center border-r border-slate-300 w-12">NO</th>
              <th className="p-2.5 border-r border-slate-300 min-w-[180px]">NAMA SISWA</th>
              <th
                colSpan={questionCount}
                className="p-2 text-center border-r border-slate-300 bg-slate-200/80"
              >
                NOMOR SOAL/ASPEK ASESMEN/SKOR MAKS
              </th>
              <th className="p-2.5 text-center border-r border-slate-300 bg-emerald-50 font-bold text-emerald-900 min-w-[70px]">
                JUMLAH SKOR
              </th>
              <th className="p-2.5 text-center border-r border-slate-300 bg-emerald-100/80 font-bold text-emerald-950 min-w-[80px]">
                KETERCAPAIAN (%)
              </th>
              <th colSpan={2} className="p-2 text-center border-r border-slate-300 bg-slate-100">
                KETUNTASAN BELAJAR
              </th>
              <th className="p-2 text-center border-r border-slate-300 bg-amber-100/90 text-amber-950 font-black min-w-[110px]">
                NILAI REMEDIAL
              </th>
              <th className="p-2 text-center w-16">AKSI</th>
            </tr>

            {/* Sub Header Row for Question Numbers & Max Scores */}
            <tr className="bg-slate-50 border-b border-slate-300 text-slate-700 font-semibold">
              <th className="p-1 border-r border-slate-300"></th>
              <th className="p-1 border-r border-slate-300 text-slate-500 font-normal italic px-2">
                Skor Maksimal Soal &rarr;
              </th>

              {phItem.itemMaxScores.map((maxScore, idx) => (
                <th
                  key={idx}
                  className="p-1.5 text-center border-r border-slate-300 min-w-[48px] bg-slate-100/90"
                >
                  <div className="text-[11px] font-bold text-slate-900">{idx + 1}</div>
                  <div className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 rounded px-1 mt-0.5 inline-block">
                    {maxScore}
                  </div>
                </th>
              ))}

              <th className="p-1 border-r border-slate-300 bg-emerald-50 text-center font-bold text-emerald-900">
                {phItem.totalMaxScore}
              </th>
              <th className="p-1 border-r border-slate-300 bg-emerald-100/80 text-center font-bold text-emerald-950">
                KKM: {phItem.kkm}
              </th>
              <th className="p-1 text-center border-r border-slate-300 text-emerald-700 font-bold min-w-[42px]">
                YA
              </th>
              <th className="p-1 text-center border-r border-slate-300 text-rose-700 font-bold min-w-[48px]">
                TIDAK
              </th>
              <th className="p-1 text-center border-r border-slate-300 bg-amber-50 text-amber-900 font-bold text-[10px] min-w-[110px]">
                PERBAIKAN
              </th>
              <th className="p-1"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {filteredStudents.length === 0 ? (
              <tr>
                <td
                  colSpan={questionCount + 8}
                  className="p-8 text-center text-slate-500 italic bg-slate-50"
                >
                  Tidak ada data siswa ditemukan untuk kriteria ini.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, index) => {
                const record = scoreMap.get(student.id);
                const itemScores = record?.itemScores || new Array(questionCount).fill(0);
                const totalScore = record?.totalScore ?? 0;
                const percentageScore = record?.percentageScore ?? 0;
                const isPassed = record?.isPassed ?? false;

                return (
                  <tr
                    key={student.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      !isPassed ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    {/* Index */}
                    <td className="p-2 text-center border-r border-slate-200 font-medium text-slate-600">
                      {index + 1}
                    </td>

                    {/* Student Name */}
                    <td className="p-2 border-r border-slate-200 font-semibold text-slate-900">
                      <div className="flex items-center justify-between">
                        <span>{student.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                          ({student.gender})
                        </span>
                      </div>
                    </td>

                    {/* Question Scores Inputs */}
                    {phItem.itemMaxScores.map((maxForQuestion, qIdx) => {
                      const currentVal = itemScores[qIdx] ?? 0;
                      return (
                        <td
                          key={qIdx}
                          className="p-1 text-center border-r border-slate-200"
                        >
                          <input
                            type="number"
                            min="0"
                            max={maxForQuestion}
                            value={currentVal}
                            onChange={(e) =>
                              handleItemScoreChange(
                                student.id,
                                qIdx,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className={`w-10 text-center py-1 rounded font-bold outline-none focus:ring-2 focus:ring-emerald-500 border ${
                              currentVal < maxForQuestion * 0.7
                                ? 'bg-rose-100/80 border-rose-300 text-rose-900'
                                : 'bg-white border-slate-300 text-slate-800'
                            }`}
                          />
                        </td>
                      );
                    })}

                    {/* Total Score */}
                    <td className="p-2 text-center border-r border-slate-200 bg-emerald-50/50 font-bold text-emerald-900 text-sm">
                      {totalScore}
                    </td>

                    {/* Percentage Score (%) */}
                    <td
                      className={`p-2 text-center border-r border-slate-200 font-extrabold text-sm ${
                        isPassed
                          ? 'bg-emerald-100/60 text-emerald-900'
                          : 'bg-rose-100 text-rose-900'
                      }`}
                    >
                      {percentageScore}%
                    </td>

                    {/* Pass Check (Ya) */}
                    <td className="p-2 text-center border-r border-slate-200">
                      {isPassed && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      )}
                    </td>

                    {/* Fail Check (Tidak) */}
                    <td className="p-2 text-center border-r border-slate-200">
                      {!isPassed && (
                        <XCircle className="w-4 h-4 text-rose-600 mx-auto" />
                      )}
                    </td>

                    {/* Nilai Remedial (Perbaikan) */}
                    <td className="p-1.5 text-center border-r border-slate-200 bg-amber-50/20">
                      {isPassed ? (
                        <span className="text-slate-400 font-medium text-xs block text-center">-</span>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max={100}
                            placeholder="Nilai..."
                            value={
                              record?.postRemedialPercentage !== undefined && record?.postRemedialPercentage !== null
                                ? record.postRemedialPercentage
                                : record?.remedialScore !== undefined && record?.remedialScore !== null
                                ? record.remedialScore
                                : ''
                            }
                            onChange={(e) => handleRemedialScoreChange(student.id, e.target.value)}
                            className={`w-14 text-center py-1 rounded font-extrabold text-xs outline-none focus:ring-2 border transition-all ${
                              (record?.postRemedialPercentage ?? 0) >= phItem.kkm
                                ? 'bg-emerald-100 border-emerald-400 text-emerald-950 focus:ring-emerald-500'
                                : 'bg-white border-amber-300 text-slate-900 focus:ring-amber-500'
                            }`}
                          />
                          {record?.postRemedialPercentage !== undefined && record?.postRemedialPercentage !== null && (
                            <span
                              className={`text-[9px] font-extrabold px-1 py-0.5 rounded ${
                                record.postRemedialPercentage >= phItem.kkm
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {record.postRemedialPercentage >= phItem.kkm ? 'Tuntas' : 'Belum'}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-1 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            if (!isEditUnlocked && onRequireUnlock) {
                              onRequireUnlock();
                            } else {
                              setStudentToEdit(student);
                            }
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 rounded-lg transition-colors"
                          title="Edit Nama / NIS Siswa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (!isEditUnlocked && onRequireUnlock) {
                              onRequireUnlock();
                            } else {
                              setStudentToDelete(student);
                            }
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded-lg transition-colors"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Footer Summaries (Matching PDF Page 1 Rows: Jumlah Skor, Jumlah Maks, % Ketercapaian) */}
          <tfoot className="bg-slate-900 text-white font-bold border-t-2 border-slate-800">
            {/* Row 1: JUMLAH SKOR */}
            <tr>
              <td colSpan={2} className="p-2 text-right border-r border-slate-700 font-bold text-amber-300">
                Jumlah Skor
              </td>
              {questionSums.map((sum, idx) => (
                <td key={idx} className="p-2 text-center border-r border-slate-700 text-emerald-400 font-extrabold">
                  {sum}
                </td>
              ))}
              <td className="p-2 text-center border-r border-slate-700 bg-emerald-900/80 text-emerald-200 text-sm font-extrabold">
                {grandTotalScore}
              </td>
              <td colSpan={5} className="p-2 border-r border-slate-700 bg-slate-800/80 text-slate-300 text-[11px] font-normal italic">
                * Total akumulasi skor per indikator/soal
              </td>
            </tr>

            {/* Row 2: JUMLAH MAKS */}
            <tr className="bg-slate-800 text-slate-200">
              <td colSpan={2} className="p-2 text-right border-r border-slate-700 font-semibold text-slate-300">
                Jumlah Maks
              </td>
              {questionMaxes.map((maxP, idx) => (
                <td key={idx} className="p-2 text-center border-r border-slate-700 text-slate-300">
                  {maxP}
                </td>
              ))}
              <td className="p-2 text-center border-r border-slate-700 bg-slate-800 font-bold text-amber-300">
                {grandTotalMax}
              </td>
              <td colSpan={5} className="p-2 border-r border-slate-700 text-slate-400 text-[11px] font-normal italic">
                * Skor maksimal seluruh siswa ({classStudents.length} siswa)
              </td>
            </tr>

            {/* Row 3: % KETERCAPAIAN */}
            <tr className="bg-slate-950 text-white">
              <td colSpan={2} className="p-2 text-right border-r border-slate-800 font-bold text-emerald-400">
                % Ketercapaian
              </td>
              {questionPercentages.map((pct, idx) => (
                <td
                  key={idx}
                  className={`p-2 text-center border-r border-slate-800 font-extrabold text-xs ${
                    pct >= 75 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {pct}%
                </td>
              ))}
              <td className="p-2 text-center border-r border-slate-800 bg-emerald-900 text-emerald-200 text-sm font-extrabold">
                {grandTotalMax > 0 ? Math.round((grandTotalScore / grandTotalMax) * 100) : 0}%
              </td>
              <td colSpan={5} className="p-2 text-emerald-300 text-[11px] font-medium">
                Target Daya Serap Minimal: {phItem.kkm}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Legend & Guidance */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tuntas (Nilai &ge; {phItem.kkm})
          </span>
          <span className="flex items-center gap-1">
            <XCircle className="w-4 h-4 text-rose-600" /> Perlu Remedial (Nilai &lt; {phItem.kkm})
          </span>
        </div>
        <div className="text-slate-500 italic">
          * Perubahan nilai di tabel ini langsung memperbarui analisis dan laporan perbaikan otomatis di Halaman 2.
        </div>
      </div>

      {/* MODAL 1: Confirm Delete Student */}
      {studentToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Konfirmasi Hapus Siswa</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus siswa <strong>{studentToDelete.name}</strong> (NIS: {studentToDelete.nis}) dari Kelas <strong>{selectedClass}</strong>?
              <span className="block mt-1 text-rose-600 font-semibold">Tindakan ini tidak dapat dibatalkan.</span>
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteStudent(studentToDelete.id);
                  setStudentToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Ya, Hapus Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Student Info */}
      {studentToEdit && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-600" />
                Edit Data Siswa
              </h3>
              <button
                onClick={() => setStudentToEdit(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (studentToEdit && onUpdateStudent) {
                  onUpdateStudent(studentToEdit);
                }
                setStudentToEdit(null);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  value={studentToEdit.name}
                  onChange={(e) => setStudentToEdit({ ...studentToEdit, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">NIS / NISN</label>
                  <input
                    type="text"
                    value={studentToEdit.nis}
                    onChange={(e) => setStudentToEdit({ ...studentToEdit, nis: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    value={studentToEdit.gender}
                    onChange={(e) => setStudentToEdit({ ...studentToEdit, gender: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStudentToEdit(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
