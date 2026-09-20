/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  AssessmentItem,
  ClassId,
  SchoolProfile,
  ScoreRecord,
  Student,
} from './types';
import {
  CLASSES,
  DEFAULT_SCHOOL_PROFILE,
  INITIAL_PH_ITEMS,
  INITIAL_STUDENTS,
  generateInitialScores,
} from './data/initialData';
import {
  subscribeToSchoolProfile,
  subscribeToPhItems,
  subscribeToStudents,
  subscribeToScores,
  saveSchoolProfile,
  savePhItem,
  saveStudent,
  saveStudentsBatch,
  deleteStudentInCloud,
  deleteClassStudentsInCloud,
  saveScoreRecord,
  saveScoresBatch,
  seedInitialDataIfEmpty,
} from './firebase';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ClassSelector } from './components/ClassSelector';
import { AssessmentSelector } from './components/AssessmentSelector';
import { ScoreMatrixTable } from './components/ScoreMatrixTable';
import { AnalysisAndRemedialReport } from './components/AnalysisAndRemedialReport';
import { AssessmentPlanner } from './components/AssessmentPlanner';
import { DashboardCharts } from './components/DashboardCharts';
import { PrintableReportModal } from './components/PrintableReportModal';
import { AiRemedialModal } from './components/AiRemedialModal';
import { StudentManagerModal } from './components/StudentManagerModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { LkpdSheetView } from './components/LkpdSheetView';
import { PinLockModal } from './components/PinLockModal';
import { WorkspaceModal } from './components/WorkspaceModal';

export default function App() {
  // Sidebar State (Mobile open/close & Desktop collapsed/expanded)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('pjok_sidebar_collapsed') === 'true';
  });

  // Settings & Authentication Modal States
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Persist sidebar collapsed preference
  useEffect(() => {
    localStorage.setItem('pjok_sidebar_collapsed', isSidebarCollapsed ? 'true' : 'false');
  }, [isSidebarCollapsed]);

  // Workspace ID State
  const [workspaceId, setWorkspaceId] = useState<string>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const wsFromUrl = urlParams.get('ws');
    if (wsFromUrl) {
      localStorage.setItem('pjok_workspace_id', wsFromUrl);
      return wsFromUrl;
    }
    return localStorage.getItem('pjok_workspace_id') || 'smpn2kutasari';
  });

  // Edit Mode PIN Lock State (Default Locked)
  const [isEditUnlocked, setIsEditUnlocked] = useState<boolean>(() => {
    const saved = localStorage.getItem('pjok_edit_unlocked');
    return saved === 'true';
  });

  const [teacherPin, setTeacherPin] = useState<string>(() => {
    return localStorage.getItem(`pjok_pin_${workspaceId}`) || 'Admin22168';
  });

  // State Initialization with LocalStorage Persistence & Fallback to Initial Data
  const [profile, setProfile] = useState<SchoolProfile>(() => {
    const saved =
      localStorage.getItem(`pjok_school_profile_${workspaceId}`) ||
      localStorage.getItem('pjok_school_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.teacherName && parsed.teacherName.includes('Riyadi')) {
          parsed.teacherName = 'Purwanto, S.Pd.';
        }
        if (!parsed.logoUrl) {
          parsed.logoUrl = 'https://lh3.googleusercontent.com/d/1q-uihP_9bDg8jusw9As1Qkw_G6CdCKwA';
        }
        return parsed;
      } catch (e) {
        console.error('Error parsing school profile:', e);
      }
    }
    return DEFAULT_SCHOOL_PROFILE;
  });

  const [phItems, setPhItems] = useState<AssessmentItem[]>(() => {
    const saved =
      localStorage.getItem(`pjok_ph_items_${workspaceId}`) ||
      localStorage.getItem('pjok_ph_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error parsing ph items:', e);
      }
    }
    return INITIAL_PH_ITEMS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`pjok_students_${workspaceId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error parsing students:', e);
      }
    }
    return INITIAL_STUDENTS;
  });

  const [scores, setScores] = useState<ScoreRecord[]>(() => {
    const saved = localStorage.getItem(`pjok_scores_${workspaceId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error parsing scores:', e);
      }
    }
    return generateInitialScores(INITIAL_STUDENTS, INITIAL_PH_ITEMS);
  });

  // Cloud Status State
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Navigation & View States
  const [selectedClass, setSelectedClass] = useState<ClassId>('VII A');
  const [selectedPhId, setSelectedPhId] = useState<string>('PH-1');
  const [activeTab, setActiveTab] = useState<'matrix' | 'analysis' | 'lkpd' | 'planner' | 'charts'>('matrix');

  // Modal States
  const [printModalMode, setPrintModalMode] = useState<'matrix' | 'analysis' | 'lkpd' | 'remedial_final' | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showGoogleSheetsModal, setShowGoogleSheetsModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);

  // Sync to LocalStorage as secondary local cache (workspace-keyed)
  useEffect(() => {
    localStorage.setItem(`pjok_school_profile_${workspaceId}`, JSON.stringify(profile));
  }, [profile, workspaceId]);

  useEffect(() => {
    localStorage.setItem(`pjok_ph_items_${workspaceId}`, JSON.stringify(phItems));
  }, [phItems, workspaceId]);

  useEffect(() => {
    localStorage.setItem(`pjok_students_${workspaceId}`, JSON.stringify(students));
  }, [students, workspaceId]);

  useEffect(() => {
    localStorage.setItem(`pjok_scores_${workspaceId}`, JSON.stringify(scores));
  }, [scores, workspaceId]);

  // Real-time Cloud Firestore Subscriptions per Workspace ID
  useEffect(() => {
    // 1. Seed cloud workspace if empty
    seedInitialDataIfEmpty(
      workspaceId,
      profile,
      phItems.length > 0 ? phItems : INITIAL_PH_ITEMS,
      students.length > 0 ? students : INITIAL_STUDENTS,
      scores.length > 0 ? scores : generateInitialScores(INITIAL_STUDENTS, INITIAL_PH_ITEMS)
    );

    // 2. Subscribe to School Profile
    const unsubProfile = subscribeToSchoolProfile(workspaceId, (cloudProfile) => {
      if (cloudProfile) {
        setProfile(cloudProfile);
      }
      setIsCloudConnected(true);
    });

    // 3. Subscribe to PH Items
    const unsubPh = subscribeToPhItems(workspaceId, (cloudPhItems) => {
      if (cloudPhItems && cloudPhItems.length > 0) {
        setPhItems(cloudPhItems);
      }
      setIsCloudConnected(true);
    });

    // 4. Subscribe to Students (Directly set from Cloud as Source of Truth)
    const unsubStudents = subscribeToStudents(workspaceId, (cloudStudents) => {
      if (cloudStudents && Array.isArray(cloudStudents) && cloudStudents.length > 0) {
        setStudents(cloudStudents);
      }
      setIsCloudConnected(true);
    });

    // 5. Subscribe to Scores (Directly set from Cloud as Source of Truth)
    const unsubScores = subscribeToScores(workspaceId, (cloudScores) => {
      if (cloudScores && Array.isArray(cloudScores) && cloudScores.length > 0) {
        setScores(cloudScores);
      }
      setIsCloudConnected(true);
    });

    return () => {
      unsubProfile();
      unsubPh();
      unsubStudents();
      unsubScores();
    };
  }, [workspaceId]);

  // Selected PH Object
  const currentPh = phItems.find((p) => p.id === selectedPhId) || phItems[0];

  // Handler: Lock & Unlock PIN
  const handleUnlockSuccess = () => {
    setIsEditUnlocked(true);
    localStorage.setItem('pjok_edit_unlocked', 'true');
  };

  const handleLock = () => {
    setIsEditUnlocked(false);
    localStorage.setItem('pjok_edit_unlocked', 'false');
  };

  const handleChangePin = (newPin: string) => {
    setTeacherPin(newPin);
    localStorage.setItem(`pjok_pin_${workspaceId}`, newPin);
  };

  const handleSelectWorkspace = (newWsId: string) => {
    setWorkspaceId(newWsId);
    localStorage.setItem('pjok_workspace_id', newWsId);
    // Update URL query parameter without full reload
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('ws', newWsId);
    window.history.pushState({}, '', newUrl.toString());
  };

  // Handler: Update Profile
  const handleUpdateProfile = (newProfile: SchoolProfile) => {
    setProfile(newProfile);
    saveSchoolProfile(workspaceId, newProfile).catch(console.error);
  };

  // Handler: Force push local data to Cloud database
  const handlePushLocalToCloud = async () => {
    if (
      window.confirm(
        `Upload & Sinkronkan seluruh data siswa & nilai ke Ruang Kerja [${workspaceId}] Cloud Database?`
      )
    ) {
      setIsSyncing(true);
      try {
        await saveSchoolProfile(workspaceId, profile);
        for (const ph of phItems) {
          await savePhItem(workspaceId, ph);
        }
        await saveStudentsBatch(workspaceId, students);
        await saveScoresBatch(workspaceId, scores);
        alert(`✅ Seluruh data berhasil tersinkronisasi ke Ruang Kerja [${workspaceId}] Cloud Database!`);
      } catch (err) {
        console.error(err);
        alert('Gagal menyinkronkan data ke cloud.');
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Handler: Update Score Record
  const handleUpdateScoreRecord = (updatedRecord: ScoreRecord) => {
    setScores((prevScores) => {
      const index = prevScores.findIndex(
        (s) =>
          s.studentId === updatedRecord.studentId &&
          s.phId === updatedRecord.phId &&
          s.classId === updatedRecord.classId
      );

      if (index >= 0) {
        const copy = [...prevScores];
        copy[index] = updatedRecord;
        return copy;
      } else {
        return [...prevScores, updatedRecord];
      }
    });

    // Save to Firestore
    saveScoreRecord(workspaceId, updatedRecord).catch(console.error);
  };

  // Handler: Update PH Item (TP, KKM, max scores)
  const handleUpdatePhItem = (updatedPh: AssessmentItem) => {
    setPhItems((prevPhs) =>
      prevPhs.map((ph) => (ph.id === updatedPh.id ? updatedPh : ph))
    );
    savePhItem(workspaceId, updatedPh).catch(console.error);

    // Recalculate percentages for affected scores
    const updatedScoreRecords: ScoreRecord[] = [];
    setScores((prevScores) =>
      prevScores.map((s) => {
        if (s.phId === updatedPh.id) {
          const totalScore = s.itemScores.reduce((a, b) => a + b, 0);
          const percentageScore = Math.round(
            (totalScore / updatedPh.totalMaxScore) * 100
          );
          const isPassed = percentageScore >= updatedPh.kkm;
          const rec: ScoreRecord = {
            ...s,
            totalScore,
            percentageScore,
            isPassed,
          };
          updatedScoreRecords.push(rec);
          return rec;
        }
        return s;
      })
    );

    if (updatedScoreRecords.length > 0) {
      saveScoresBatch(workspaceId, updatedScoreRecords).catch(console.error);
    }
  };

  // Handler: Add Student
  const handleAddStudent = (newStudentData: Omit<Student, 'id'>) => {
    const newId = `${selectedClass.replace(' ', '')}-${Date.now().toString().slice(-4)}`;
    const newStudent: Student = {
      ...newStudentData,
      id: newId,
    };

    setStudents((prev) => [...prev, newStudent]);
    saveStudent(workspaceId, newStudent).catch(console.error);

    // Initialize blank score records for all 10 PHs for this new student
    const newRecords: ScoreRecord[] = phItems.map((ph) => ({
      studentId: newId,
      phId: ph.id,
      classId: selectedClass,
      itemScores: new Array(ph.itemMaxScores.length).fill(0),
      totalScore: 0,
      percentageScore: 0,
      isPassed: false,
    }));

    setScores((prev) => [...prev, ...newRecords]);
    saveScoresBatch(workspaceId, newRecords).catch(console.error);
  };

  // Handler: Bulk Import Students from Excel
  const handleImportStudents = (newStudentsList: Omit<Student, 'id'>[]) => {
    const formattedStudents: Student[] = newStudentsList.map((s, idx) => ({
      ...s,
      id: `${s.classId.replace(' ', '')}-${Date.now().toString().slice(-4)}-${idx}`,
    }));

    setStudents((prev) => [...prev, ...formattedStudents]);
    saveStudentsBatch(workspaceId, formattedStudents).catch(console.error);

    // Create default score records for imported students across all 10 PHs
    const newScores: ScoreRecord[] = [];
    formattedStudents.forEach((student) => {
      phItems.forEach((ph) => {
        newScores.push({
          studentId: student.id,
          phId: ph.id,
          classId: student.classId,
          itemScores: new Array(ph.itemMaxScores.length).fill(0),
          totalScore: 0,
          percentageScore: 0,
          isPassed: false,
        });
      });
    });

    setScores((prev) => [...prev, ...newScores]);
    saveScoresBatch(workspaceId, newScores).catch(console.error);
  };

  // Handler: Update Existing Student Info
  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    saveStudent(workspaceId, updatedStudent).catch(console.error);
  };

  // Handler: Delete Single Student
  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setScores((prev) => prev.filter((sc) => sc.studentId !== studentId));
    deleteStudentInCloud(workspaceId, studentId).catch(console.error);
  };

  // Handler: Delete All Students in Selected Class
  const handleDeleteAllStudents = (classId: ClassId) => {
    setStudents((prev) => prev.filter((s) => s.classId !== classId));
    setScores((prev) => prev.filter((sc) => sc.classId !== classId));
    deleteClassStudentsInCloud(workspaceId, classId).catch(console.error);
  };

  // Handler: Delete Demo / Default Students
  const handleDeleteDemoStudents = (classId?: ClassId) => {
    const isDemoStudent = (s: Student) =>
      s.id.startsWith('st-') || INITIAL_STUDENTS.some((init) => init.id === s.id);

    const demoStudents = students.filter(
      (s) => isDemoStudent(s) && (!classId || s.classId === classId)
    );

    if (demoStudents.length === 0) {
      alert('Tidak ditemukan siswa bawaan/demo pada kelas ini.');
      return;
    }

    const targetText = classId ? `di Kelas ${classId}` : 'di seluruh kelas';
    if (
      window.confirm(
        `Ditemukan ${demoStudents.length} siswa bawaan/demo ${targetText}. Yakin ingin menghapus seluruh siswa bawaan tersebut dari cloud & lokal?`
      )
    ) {
      demoStudents.forEach((st) => {
        deleteStudentInCloud(workspaceId, st.id).catch(console.error);
      });
      setStudents((prev) =>
        prev.filter((s) => !isDemoStudent(s) || (classId && s.classId !== classId))
      );
      setScores((prev) =>
        prev.filter((sc) => !demoStudents.some((st) => st.id === sc.studentId))
      );
      alert(`Berhasil menghapus ${demoStudents.length} siswa bawaan/demo.`);
    }
  };

  // Handler: Bulk Set Scores for Current Class & PH (e.g. Set Max Scores)
  const handleBulkSetScores = (type: 'max' | 'kkm') => {
    const classStudents = students.filter((s) => s.classId === selectedClass);
    const updatedRecords: ScoreRecord[] = [];

    setScores((prevScores) => {
      const scoreMap = new Map<string, ScoreRecord>();
      prevScores.forEach((s) => {
        if (s.phId === currentPh.id && s.classId === selectedClass) {
          scoreMap.set(s.studentId, s);
        }
      });

      const updatedMap = new Map(
        prevScores.map((s) => [`${s.studentId}_${s.phId}`, s])
      );

      classStudents.forEach((student) => {
        const itemScores =
          type === 'max'
            ? [...currentPh.itemMaxScores]
            : currentPh.itemMaxScores.map((m) => Math.ceil(m * (currentPh.kkm / 100)));

        const totalScore = itemScores.reduce((a, b) => a + b, 0);
        const percentageScore = Math.round(
          (totalScore / currentPh.totalMaxScore) * 100
        );
        const isPassed = percentageScore >= currentPh.kkm;

        const record: ScoreRecord = {
          studentId: student.id,
          phId: currentPh.id,
          classId: selectedClass,
          itemScores,
          totalScore,
          percentageScore,
          isPassed,
        };

        updatedMap.set(`${student.id}_${currentPh.id}`, record);
        updatedRecords.push(record);
      });

      return Array.from(updatedMap.values());
    });

    if (updatedRecords.length > 0) {
      saveScoresBatch(workspaceId, updatedRecords).catch(console.error);
    }
  };

  // Handler: Import Data directly from Google Sheets
  const handleImportGoogleSheetsData = (
    importedStudents: Student[],
    importedScores: ScoreRecord[]
  ) => {
    // 1. Merge or Replace Students
    setStudents((prev) => {
      const studentMap = new Map(prev.map((s) => [s.id, s]));
      importedStudents.forEach((st) => studentMap.set(st.id, st));
      return Array.from(studentMap.values());
    });
    saveStudentsBatch(workspaceId, importedStudents).catch(console.error);

    // 2. Merge Scores
    setScores((prev) => {
      const scoreMap = new Map(prev.map((sc) => [`${sc.studentId}_${sc.phId}`, sc]));
      importedScores.forEach((sc) => scoreMap.set(`${sc.studentId}_${sc.phId}`, sc));
      return Array.from(scoreMap.values());
    });
    saveScoresBatch(workspaceId, importedScores).catch(console.error);
  };

  // Handler: Reset App Data to Defaults
  const handleResetData = () => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin mengembalikan seluruh data Ruang Kerja [${workspaceId}] ke pengaturan awal sampel?`
      )
    ) {
      setProfile(DEFAULT_SCHOOL_PROFILE);
      setPhItems(INITIAL_PH_ITEMS);
      setStudents(INITIAL_STUDENTS);
      const initScores = generateInitialScores(INITIAL_STUDENTS, INITIAL_PH_ITEMS);
      setScores(initScores);

      // Push to Cloud
      saveSchoolProfile(workspaceId, DEFAULT_SCHOOL_PROFILE).catch(console.error);
      for (const ph of INITIAL_PH_ITEMS) {
        savePhItem(workspaceId, ph).catch(console.error);
      }
      saveStudentsBatch(workspaceId, INITIAL_STUDENTS).catch(console.error);
      saveScoresBatch(workspaceId, initScores).catch(console.error);

      localStorage.removeItem('pjok_school_profile');
      localStorage.removeItem('pjok_ph_items');
      localStorage.removeItem('pjok_students');
      localStorage.removeItem('pjok_scores');
    }
  };

  // Export JSON Backup
  const handleExportJson = () => {
    const data = {
      workspaceId,
      profile,
      phItems,
      students,
      scores,
      exportDate: new Date().toISOString(),
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `Backup_Analisis_PJOK_${workspaceId}_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.profile && parsed.phItems && parsed.students && parsed.scores) {
            setProfile(parsed.profile);
            setPhItems(parsed.phItems);
            setStudents(parsed.students);
            setScores(parsed.scores);

            const targetWs = parsed.workspaceId || workspaceId;
            saveSchoolProfile(targetWs, parsed.profile).catch(console.error);
            for (const ph of parsed.phItems) {
              savePhItem(targetWs, ph).catch(console.error);
            }
            saveStudentsBatch(targetWs, parsed.students).catch(console.error);
            saveScoresBatch(targetWs, parsed.scores).catch(console.error);

            alert('✅ Backup data JSON berhasil diimpor!');
          } else {
            alert('Format file JSON tidak valid.');
          }
        } catch (err) {
          console.error(err);
          alert('Gagal membaca file JSON.');
        }
      };
    }
  };

  // Calculate statistics for Class Selector tabs
  const getClassStats = (classId: ClassId) => {
    const classStudents = students.filter((s) => s.classId === classId);
    const totalCount = classStudents.length;

    let passedCount = 0;
    classStudents.forEach((student) => {
      const rec = scores.find(
        (s) =>
          s.studentId === student.id &&
          s.phId === selectedPhId &&
          s.classId === classId
      );
      if (rec?.isPassed) passedCount++;
    });

    const passedPercentage =
      totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

    return { totalCount, passedCount, passedPercentage };
  };

  // Current class remedial count for AI Modal
  const currentClassRemedialCount = students
    .filter((s) => s.classId === selectedClass)
    .filter((s) => {
      const rec = scores.find(
        (sc) => sc.studentId === s.id && sc.phId === currentPh.id
      );
      return !(rec?.isPassed ?? false);
    }).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans print:bg-white print:p-0">
      
      {/* Non-printable Sidebar (Fixed / Collapsible on Desktop & Drawer on Mobile) */}
      <div className="print:hidden">
        <Sidebar
          profile={profile}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenPrintModal={(mode) => setPrintModalMode(mode)}
          onOpenAiModal={() => setShowAiModal(true)}
          onOpenGoogleSheetsModal={() => setShowGoogleSheetsModal(true)}
          isCloudConnected={isCloudConnected}
          onPushLocalToCloud={handlePushLocalToCloud}
          isSyncingCloud={isSyncing}
          workspaceId={workspaceId}
          onOpenWorkspaceModal={() => setShowWorkspaceModal(true)}
          isEditUnlocked={isEditUnlocked}
          onOpenPinModal={() => setShowPinModal(true)}
          onOpenSettings={() => {
            if (isAuthenticated) {
              setShowSettingsModal(true);
            } else {
              setShowPasswordPrompt(true);
            }
          }}
          isAuthenticated={isAuthenticated}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
          onResetData={handleResetData}
        />
      </div>

      {/* Non-printable App Main Body (Adjusts padding-left based on desktop sidebar width) */}
      <div
        className={`print:hidden min-h-screen flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Top Header */}
        <Header
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          onResetData={handleResetData}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
          onOpenPrintModal={(mode) => setPrintModalMode(mode)}
          onOpenAiModal={() => setShowAiModal(true)}
          onOpenGoogleSheetsModal={() => setShowGoogleSheetsModal(true)}
          isCloudConnected={isCloudConnected}
          isSyncingCloud={isSyncing}
          onPushLocalToCloud={handlePushLocalToCloud}
          workspaceId={workspaceId}
          onOpenWorkspaceModal={() => setShowWorkspaceModal(true)}
          isEditUnlocked={isEditUnlocked}
          onOpenPinModal={() => setShowPinModal(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onToggleSidebarMobile={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onToggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isSidebarCollapsed={isSidebarCollapsed}
          showSettingsModal={showSettingsModal}
          setShowSettingsModal={setShowSettingsModal}
          showPasswordPrompt={showPasswordPrompt}
          setShowPasswordPrompt={setShowPasswordPrompt}
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />

        {/* Rombel / Class Selector Bar (VII A - VII G) */}
        <ClassSelector
          selectedClass={selectedClass}
          onSelectClass={setSelectedClass}
          getClassStats={getClassStats}
        />

        {/* Penilaian Harian Selector Bar (PH 1 - PH 10) */}
        <AssessmentSelector
          phItems={phItems}
          selectedPhId={selectedPhId}
          onSelectPh={setSelectedPhId}
          onUpdatePhItem={handleUpdatePhItem}
        />

        {/* Main View Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: Score Matrix Table (PDF Page 1 Layout) */}
          {activeTab === 'matrix' && (
            <ScoreMatrixTable
              profile={profile}
              selectedClass={selectedClass}
              phItem={currentPh}
              students={students}
              scores={scores}
              onUpdateScoreRecord={handleUpdateScoreRecord}
              onOpenAddStudentModal={() => setShowAddStudentModal(true)}
              onOpenGoogleSheetsModal={() => setShowGoogleSheetsModal(true)}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onBulkSetScores={handleBulkSetScores}
              onOpenPrintModal={(mode) => setPrintModalMode(mode)}
              isEditUnlocked={isEditUnlocked}
              onRequireUnlock={() => setShowPinModal(true)}
            />
          )}

          {/* TAB 2: Analysis & Remedial Program Report (PDF Page 2 Layout) */}
          {activeTab === 'analysis' && (
            <AnalysisAndRemedialReport
              profile={profile}
              selectedClass={selectedClass}
              phItem={currentPh}
              students={students}
              scores={scores}
              onUpdateScoreRecord={handleUpdateScoreRecord}
              onOpenAiModal={() => setShowAiModal(true)}
              onOpenPrintModal={(mode) => setPrintModalMode(mode)}
              onGoToHome={() => setActiveTab('matrix')}
            />
          )}

          {/* TAB 3: Lembar Kerja Peserta Didik (PDF Page 3 Layout) */}
          {activeTab === 'lkpd' && (
            <LkpdSheetView
              profile={profile}
              selectedClass={selectedClass}
              phItem={currentPh}
              students={students}
              onOpenPrintModal={(mode) => setPrintModalMode(mode)}
              onGoToHome={() => setActiveTab('matrix')}
            />
          )}

          {/* TAB 3: Semester Assessment Planner (10 PHs Overview) */}
          {activeTab === 'planner' && (
            <AssessmentPlanner
              phItems={phItems}
              selectedPhId={selectedPhId}
              onSelectPh={(phId) => {
                setSelectedPhId(phId);
                setActiveTab('matrix');
              }}
              onUpdatePhItem={handleUpdatePhItem}
            />
          )}

          {/* TAB 4: Dashboard Charts & Analytics */}
          {activeTab === 'charts' && (
            <DashboardCharts
              profile={profile}
              selectedClass={selectedClass}
              phItem={currentPh}
              allPhItems={phItems}
              students={students}
              scores={scores}
            />
          )}

        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 text-xs py-4 px-6 border-t border-slate-800 text-center space-y-1">
          <p>
            Aplikasi Analisis Penilaian {profile.subject || 'PJOK'} • {profile.schoolName} • Guru Mapel: <strong>{profile.teacherName}</strong>
          </p>
          <p className="text-[11px] font-mono text-slate-400 font-medium">
            pengembang app #poerwanto,s.pd.or
          </p>
        </footer>
      </div>

      {/* Modals */}
      {printModalMode && (
        <PrintableReportModal
          mode={printModalMode}
          profile={profile}
          selectedClass={selectedClass}
          phItem={currentPh}
          students={students}
          scores={scores}
          onClose={() => setPrintModalMode(null)}
        />
      )}

      {showAiModal && (
        <AiRemedialModal
          profile={profile}
          selectedClass={selectedClass}
          phItem={currentPh}
          remedialCount={currentClassRemedialCount}
          onClose={() => setShowAiModal(false)}
        />
      )}

      {showAddStudentModal && (
        <StudentManagerModal
          selectedClass={selectedClass}
          students={students}
          onAddStudent={handleAddStudent}
          onImportStudents={handleImportStudents}
          onUpdateStudent={handleUpdateStudent}
          onDeleteStudent={handleDeleteStudent}
          onDeleteAllStudents={handleDeleteAllStudents}
          onDeleteDemoStudents={handleDeleteDemoStudents}
          onClose={() => setShowAddStudentModal(false)}
        />
      )}

      {showGoogleSheetsModal && (
        <GoogleSheetsModal
          selectedClass={selectedClass}
          phItem={currentPh}
          profile={profile}
          students={students}
          scores={scores}
          onImportGoogleSheetsData={handleImportGoogleSheetsData}
          onClose={() => setShowGoogleSheetsModal(false)}
        />
      )}

      {/* PIN Pengunci Mode Edit Modal */}
      <PinLockModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        currentPin={teacherPin}
        isUnlocked={isEditUnlocked}
        onUnlockSuccess={handleUnlockSuccess}
        onLock={handleLock}
        onChangePin={handleChangePin}
        workspaceId={workspaceId}
      />

      {/* Workspace Switcher Modal */}
      <WorkspaceModal
        isOpen={showWorkspaceModal}
        onClose={() => setShowWorkspaceModal(false)}
        currentWorkspaceId={workspaceId}
        onSelectWorkspace={handleSelectWorkspace}
      />

    </div>
  );
}
