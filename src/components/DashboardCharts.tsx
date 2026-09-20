import React from 'react';
import { AssessmentItem, ClassId, SchoolProfile, ScoreRecord, Student } from '../types';
import { CLASSES } from '../data/initialData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell,
} from 'recharts';
import { Award, TrendingUp, HelpCircle, Users } from 'lucide-react';

interface DashboardChartsProps {
  profile?: SchoolProfile;
  selectedClass: ClassId;
  phItem: AssessmentItem;
  allPhItems: AssessmentItem[];
  students: Student[];
  scores: ScoreRecord[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  profile,
  selectedClass,
  phItem,
  allPhItems,
  students,
  scores,
}) => {
  // 1. Data for Class Comparison (% Ketuntasan on current PH across VII A - VII G)
  const classComparisonData = CLASSES.map((cId) => {
    const cStudents = students.filter((s) => s.classId === cId);
    const cScores = scores.filter((s) => s.classId === cId && s.phId === phItem.id);
    const total = cStudents.length;
    const passed = cScores.filter((s) => s.isPassed).length;
    const passPercentage = total > 0 ? Math.round((passed / total) * 100) : 0;

    return {
      classId: cId,
      passPercentage,
      passedCount: passed,
      totalCount: total,
    };
  });

  // 2. Data for Question/Indicator Item Ketercapaian (%) for current PH
  const classStudents = students.filter((s) => s.classId === selectedClass);
  const questionCount = phItem.itemMaxScores.length;
  const questionSums = new Array(questionCount).fill(0);
  const questionMaxes = phItem.itemMaxScores.map((m) => m * classStudents.length);

  scores.forEach((s) => {
    if (s.classId === selectedClass && s.phId === phItem.id) {
      s.itemScores.forEach((scoreVal, idx) => {
        if (idx < questionCount) {
          questionSums[idx] += scoreVal;
        }
      });
    }
  });

  const questionItemData = phItem.itemMaxScores.map((maxVal, idx) => {
    const sumVal = questionSums[idx];
    const totalPoss = questionMaxes[idx];
    const percentage = totalPoss > 0 ? Math.round((sumVal / totalPoss) * 100) : 0;

    return {
      questionName: `Soal ${idx + 1}`,
      percentage,
      maxScore: maxVal,
    };
  });

  // 3. Trend Data across PH 1 - PH 10 for the selected Class
  const phTrendData = allPhItems.map((ph) => {
    const phScores = scores.filter(
      (s) => s.classId === selectedClass && s.phId === ph.id
    );
    const avgPercentage =
      phScores.length > 0
        ? Math.round(
            phScores.reduce((acc, curr) => acc + curr.percentageScore, 0) /
              phScores.length
          )
        : 0;

    const passPct =
      phScores.length > 0
        ? Math.round(
            (phScores.filter((s) => s.isPassed).length / phScores.length) * 100
          )
        : 0;

    return {
      code: ph.code,
      title: ph.title,
      avgPercentage,
      passPct,
      kkm: ph.kkm,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Award className="w-6 h-6 text-emerald-400" />
          Grafik Analisis Ketuntasan Belajar & Daya Serap {profile?.subject || 'PJOK'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Visualisasi performa siswa per rombel (VII A - VII G), analisis ketercapaian indikator/soal, dan tren ketuntasan 10 Penilaian Harian.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Perbandingan Ketuntasan Belajar Per Kelas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center justify-between">
              <span>Perbandingan % Ketuntasan Per Kelas ({phItem.code})</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                Target: &ge; 80%
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Persentase siswa tuntas (Nilai &ge; {phItem.kkm}) untuk topik {phItem.title}
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="classId" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val}% Tuntas`, 'Ketuntasan']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="passPercentage" radius={[6, 6, 0, 0]}>
                  {classComparisonData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.classId === selectedClass ? '#4f46e5' : '#94a3b8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 italic text-center">
            * Batang indigo menunjukkan kelas yang sedang dipilih ({selectedClass}).
          </p>
        </div>

        {/* Chart 2: Analisis Daya Serap Per Indikator / Nomor Soal */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Daya Serap Per Soal ({selectedClass} - {phItem.code})
            </h3>
            <p className="text-xs text-slate-500">
              Mendeteksi indikator / teknik gerakan yang memerlukan penjelasan ulang
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={questionItemData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="questionName" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, '% Ketercapaian']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                  {questionItemData.map((entry, index) => (
                    <Cell
                      key={`cell-q-${index}`}
                      fill={entry.percentage >= 75 ? '#10b981' : '#f43f5e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 italic text-center">
            * Batang merah menunjukkan soal/indikator dengan Ketercapaian &lt; 75% (Perlu Remedial Teknik).
          </p>
        </div>

      </div>

      {/* Chart 3: Trend Rata-rata & % Ketuntasan PH 1 - PH 10 */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Tren Ketuntasan & Rata-Rata Nilai 10 Penilaian Harian ({selectedClass})
          </h3>
          <p className="text-xs text-slate-500">
            Perkembangan capaian pembelajaran siswa kelas {selectedClass} sepanjang semester 1
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={phTrendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="code" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="avgPercentage"
                name="Rata-rata Nilai (%)"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="passPct"
                name="% Siswa Tuntas"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="kkm"
                name="Garis KKM (75)"
                stroke="#ef4444"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
