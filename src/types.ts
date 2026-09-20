export type ClassId =
  | 'VII A' | 'VII B' | 'VII C' | 'VII D' | 'VII E' | 'VII F' | 'VII G'
  | 'VIII A' | 'VIII B' | 'VIII C' | 'VIII D' | 'VIII E' | 'VIII F' | 'VIII G'
  | 'IX A' | 'IX B' | 'IX C' | 'IX D' | 'IX E' | 'IX F' | 'IX G';

export interface SchoolProfile {
  schoolName: string;
  schoolAddress: string;
  logoUrl?: string;
  subject: string; // e.g. "Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)"
  gradeLevel: string; // e.g. "Kelas VII"
  teacherName: string;
  teacherNip: string;
  principalName: string;
  principalNip: string;
  academicYear: string; // e.g. "2025/2026"
  semester: string; // e.g. "1 (Ganjil)" or "2 (Genap)"
  location: string; // e.g. "Kutasari"
  reportDate: string;
}

export interface AssessmentItem {
  id: string; // "PH-1" to "PH-10"
  code: string; // "PH 1", "PH 2", etc.
  title: string; // e.g., "Permainan Bola Besar"
  topic: string; // e.g. "Sepak Bola, Bola Voli, Bola Basket"
  learningObjective: string; // TP: Tujuan Pembelajaran
  kkm: number; // Kriteria Ketuntasan Minimal (default 75)
  itemMaxScores: number[]; // e.g. [4, 5, 3, 4, 5, 4] for 6 questions
  totalMaxScore: number; // Sum of itemMaxScores, e.g. 25
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  classId: ClassId;
}

export interface ScoreRecord {
  studentId: string;
  phId: string; // "PH-1" .. "PH-10"
  classId: ClassId;
  itemScores: number[]; // Scores for each question
  totalScore: number; // Auto-sum
  percentageScore: number; // (totalScore / totalMaxScore) * 100
  isPassed: boolean; // percentageScore >= KKM
  remedialScore?: number | null; // Skor setelah perbaikan
  postRemedialPercentage?: number | null;
  isPassedPostRemedial?: boolean;
  remedialNotes?: string;
}

export interface RemedialProgramConfig {
  perbaikanMethods: string[];
  pengayaanMethods: string[];
  executionDate: string;
}

export interface AiRemedialRecommendation {
  remedialStrategy: string;
  remedialTasks: string[];
  pengayaanStrategy: string;
  pengayaanTasks: string[];
  teacherNote: string;
}
