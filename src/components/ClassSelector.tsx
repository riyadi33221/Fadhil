import React, { useState } from 'react';
import { ClassId } from '../types';
import { CLASSES } from '../data/initialData';
import { Users, CheckCircle2, AlertCircle, Filter } from 'lucide-react';

interface ClassSelectorProps {
  selectedClass: ClassId;
  onSelectClass: (classId: ClassId) => void;
  getClassStats: (classId: ClassId) => {
    totalStudents: number;
    passedStudents: number;
    passPercentage: number;
    averageScore: number;
  };
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({
  selectedClass,
  onSelectClass,
  getClassStats,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<'Semua' | 'VII' | 'VIII' | 'IX'>('VII');

  const filteredClasses = CLASSES.filter((c) => {
    if (selectedGrade === 'Semua') return true;
    return c.startsWith(selectedGrade);
  });

  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Title & Grade Filter */}
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-indigo-500" />
            Tingkat:
          </span>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            {(['VII', 'VIII', 'IX', 'Semua'] as const).map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedGrade === grade
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {grade === 'Semua' ? 'Semua' : `Kelas ${grade}`}
              </button>
            ))}
          </div>
        </div>

        {/* Class Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {filteredClasses.map((classId) => {
            const stats = getClassStats(classId);
            const isSelected = selectedClass === classId;

            return (
              <button
                key={classId}
                onClick={() => onSelectClass(classId)}
                className={`group relative flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all border text-left whitespace-nowrap ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold ring-2 ring-indigo-500/20 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 font-medium hover:bg-slate-50'
                }`}
              >
                <span className="text-xs sm:text-sm tracking-tight">{classId}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : stats.passPercentage >= 80
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {stats.passPercentage}% Tuntas
                </span>
                <span className="text-[11px] opacity-75 hidden sm:inline">
                  • {stats.totalStudents} Siswa
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
