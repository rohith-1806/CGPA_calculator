import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useTheme } from '../context/ThemeContext';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  getAdminStats,
  getAdminStudents,
  createStudent,
  getStudentDetails,
  updateStudentProfile,
  deleteStudent,
  addSemesterAdmin,
  updateSemesterAdmin,
  deleteSemesterAdmin,
  addSubjectAdmin,
  updateSubjectAdmin,
  deleteSubjectAdmin
} from '../services/adminApi';
import {
  FiShield,
  FiUsers,
  FiUserPlus,
  FiBookOpen,
  FiLayers,
  FiSearch,
  FiFilter,
  FiLogOut,
  FiSun,
  FiMoon,
  FiEye,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiX,
  FiCheck,
  FiAward,
  FiActivity,
  FiChevronRight,
  FiRefreshCw
} from 'react-icons/fi';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { adminUser, logoutAdminAccount } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();

  // Active Tab
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'students', 'records'

  // Data States
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalSemestersRecorded: 0,
    totalSubjectsRecorded: 0
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Search, Filter & Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'rollNumber', 'cgpa'
  const [sortOrder, setSortOrder] = useState('asc');

  // Modals & Active View States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState(null);

  // Detailed View Modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeStudentDetails, setActiveStudentDetails] = useState(null);
  const [activeAcademicRecord, setActiveAcademicRecord] = useState(null);
  const [activeAcademicSummary, setActiveAcademicSummary] = useState(null);

  // Sub-Modals for Academic Records
  const [isSemModalOpen, setIsSemModalOpen] = useState(false);
  const [semModalData, setSemModalData] = useState({ id: null, name: '' });

  const [isSubjModalOpen, setIsSubjModalOpen] = useState(false);
  const [subjModalData, setSubjModalData] = useState({
    semesterId: '',
    subjectId: null,
    subjectName: '',
    grade: 'A',
    credits: 3,
    status: 'Regular'
  });

  // Confirmation Modal State
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // Form States for Create Student
  const [createForm, setCreateForm] = useState({
    name: '',
    rollNumber: '',
    email: '',
    password: '',
    university: 'JNTUK',
    regulation: 'R20',
    branch: 'CSE',
    courseType: 'B.Tech',
    presentYear: '1st Year',
    presentSemester: '1st Semester'
  });

  // Form States for Edit Student
  const [editForm, setEditForm] = useState({
    name: '',
    rollNumber: '',
    email: '',
    password: '',
    university: 'JNTUK',
    regulation: 'R20',
    branch: 'CSE',
    courseType: 'B.Tech',
    presentYear: '1st Year',
    presentSemester: '1st Semester'
  });

  // Load Data on Mount
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, studentsRes] = await Promise.all([
        getAdminStats(),
        getAdminStudents()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (studentsRes.success) setStudents(studentsRes.students);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
      setError('Failed to load dashboard data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Filtered and Sorted Students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
          s.name?.toLowerCase().includes(query) ||
          s.rollNumber?.toLowerCase().includes(query) ||
          s.email?.toLowerCase().includes(query);

        const matchesBranch = branchFilter === 'ALL' || s.branch === branchFilter;
        const matchesYear = yearFilter === 'ALL' || s.presentYear === yearFilter;
        const matchesSemester = semesterFilter === 'ALL' || s.presentSemester === semesterFilter;

        return matchesSearch && matchesBranch && matchesYear && matchesSemester;
      })
      .sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';

        if (sortBy === 'cgpa') {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [students, searchTerm, branchFilter, yearFilter, semesterFilter, sortBy, sortOrder]);

  // Handler: Create Student
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await createStudent(createForm);
      if (res.success) {
        setIsCreateModalOpen(false);
        setCreateForm({
          name: '',
          rollNumber: '',
          email: '',
          password: '',
          university: 'JNTUK',
          regulation: 'R20',
          branch: 'CSE',
          courseType: 'B.Tech',
          presentYear: '1st Year',
          presentSemester: '1st Semester'
        });
        showToast('Student created successfully with fresh academic records!');
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create student.');
    }
  };

  // Handler: Open Edit Profile Modal
  const openEditModal = (student) => {
    setSelectedStudentForEdit(student);
    setEditForm({
      name: student.name || '',
      rollNumber: student.rollNumber || '',
      email: student.email || student.loginId || '',
      password: '',
      university: student.university || 'JNTUK',
      regulation: student.regulation || 'R20',
      branch: student.branch || 'CSE',
      courseType: student.courseType || 'B.Tech',
      presentYear: student.presentYear || '4th Year',
      presentSemester: student.presentSemester || '1st Semester'
    });
    setIsEditProfileModalOpen(true);
  };

  // Handler: Save Edited Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!selectedStudentForEdit) return;
    try {
      const res = await updateStudentProfile(selectedStudentForEdit._id, editForm);
      if (res.success) {
        setIsEditProfileModalOpen(false);
        showToast('Student profile updated successfully!');
        fetchData();
        if (activeStudentDetails?._id === selectedStudentForEdit._id) {
          setActiveStudentDetails(res.student);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update student profile.');
    }
  };

  // Handler: Delete Student
  const confirmDeleteStudent = (student) => {
    setConfirmModalState({
      isOpen: true,
      title: `Delete Student Record?`,
      message: `Are you sure you want to delete ${student.name} (${student.rollNumber})? This will permanently remove their user account and all recorded semesters/grades.`,
      onConfirm: async () => {
        try {
          const res = await deleteStudent(student._id);
          if (res.success) {
            setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
            showToast('Student account deleted successfully.');
            if (activeStudentDetails?._id === student._id) {
              setIsDetailsModalOpen(false);
            }
            fetchData();
          }
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to delete student.');
        }
      }
    });
  };

  // Handler: Open View Details Modal
  const openStudentDetails = async (studentId) => {
    try {
      const res = await getStudentDetails(studentId);
      if (res.success) {
        setActiveStudentDetails(res.student);
        setActiveAcademicRecord(res.academicRecord);
        setActiveAcademicSummary(res.summary);
        setIsDetailsModalOpen(true);
      }
    } catch (err) {
      alert('Failed to load student details.');
    }
  };

  // Academic Actions
  const handleSaveSemester = async (e) => {
    e.preventDefault();
    if (!activeStudentDetails) return;
    try {
      let res;
      if (semModalData.id) {
        res = await updateSemesterAdmin(activeStudentDetails._id, semModalData.id, semModalData.name);
      } else {
        res = await addSemesterAdmin(activeStudentDetails._id, semModalData.name);
      }
      if (res.success) {
        setActiveAcademicRecord(res.academicRecord);
        setActiveAcademicSummary(res.summary);
        setIsSemModalOpen(false);
        setSemModalData({ id: null, name: '' });
        showToast('Semester updated successfully!');
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save semester.');
    }
  };

  const confirmDeleteSemester = (semesterId, semesterName) => {
    setConfirmModalState({
      isOpen: true,
      title: `Delete Semester?`,
      message: `Are you sure you want to delete "${semesterName}" and all of its subjects?`,
      onConfirm: async () => {
        try {
          const res = await deleteSemesterAdmin(activeStudentDetails._id, semesterId);
          if (res.success) {
            setActiveAcademicRecord(res.academicRecord);
            setActiveAcademicSummary(res.summary);
            setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
            showToast('Semester deleted.');
            fetchData();
          }
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to delete semester.');
        }
      }
    });
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!activeStudentDetails) return;
    try {
      let res;
      if (subjModalData.subjectId) {
        res = await updateSubjectAdmin(
          activeStudentDetails._id,
          subjModalData.subjectId,
          {
            subjectName: subjModalData.subjectName,
            grade: subjModalData.grade,
            credits: Number(subjModalData.credits),
            status: subjModalData.status
          }
        );
      } else {
        res = await addSubjectAdmin(
          activeStudentDetails._id,
          subjModalData.semesterId,
          {
            subjectName: subjModalData.subjectName,
            grade: subjModalData.grade,
            credits: Number(subjModalData.credits),
            status: subjModalData.status
          }
        );
      }

      if (res.success) {
        setActiveAcademicRecord(res.academicRecord);
        setActiveAcademicSummary(res.summary);
        setIsSubjModalOpen(false);
        showToast('Subject updated successfully!');
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save subject.');
    }
  };

  const confirmDeleteSubject = (subjectId, subjectName) => {
    setConfirmModalState({
      isOpen: true,
      title: `Delete Subject?`,
      message: `Are you sure you want to delete "${subjectName}"?`,
      onConfirm: async () => {
        try {
          const res = await deleteSubjectAdmin(activeStudentDetails._id, subjectId);
          if (res.success) {
            setActiveAcademicRecord(res.academicRecord);
            setActiveAcademicSummary(res.summary);
            setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
            showToast('Subject deleted.');
            fetchData();
          }
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to delete subject.');
        }
      }
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '260px',
          background: 'var(--card-bg)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 16px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 10
        }}
      >
        <div>
          {/* Logo & Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 12px 24px', borderBottom: '1px solid var(--border-color)' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <FiShield size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                GrowX Admin
              </h2>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Academic Governance
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'dashboard' ? 'var(--accent-gradient)' : 'transparent',
                color: activeTab === 'dashboard' ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <FiActivity size={18} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'students' ? 'var(--accent-gradient)' : 'transparent',
                color: activeTab === 'students' ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <FiUsers size={18} />
              <span>Students</span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <FiUserPlus size={18} color="var(--accent-primary)" />
              <span>Create Student</span>
            </button>

            <button
              onClick={() => setActiveTab('records')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'records' ? 'var(--accent-gradient)' : 'transparent',
                color: activeTab === 'records' ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <FiBookOpen size={18} />
              <span>Student Records</span>
            </button>
          </nav>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {theme === 'dark' ? <FiSun size={16} color="#F59E0B" /> : <FiMoon size={16} color="#6366F1" />}
              {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
            </span>
          </button>

          <button
            onClick={() => {
              logoutAdminAccount();
              navigate('/admin');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              background: 'rgba(244, 63, 94, 0.08)',
              color: 'var(--accent-rose)',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        {/* Top Bar Header */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}
        >
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              GrowX Admin Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0' }}>
              Academic Management Dashboard & Student Data Governance
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={fetchData}
              title="Refresh Data"
              className="glass-btn-secondary"
              style={{
                padding: '10px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FiRefreshCw size={18} className={loading ? 'spin' : ''} />
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                padding: '12px 20px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(79, 70, 229, 0.35)'
              }}
            >
              <FiUserPlus size={18} />
              <span>Create Student</span>
            </button>
          </div>
        </header>

        {/* Success Toast */}
        {successMessage && (
          <div
            style={{
              padding: '14px 20px',
              borderRadius: '14px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--accent-emerald)',
              fontSize: '14px',
              fontWeight: 700,
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <FiCheck size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Dashboard Overview Cards */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '36px'
          }}
        >
          {/* Total Students Card */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Students
              </span>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiUsers size={20} />
              </div>
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              {stats.totalStudents}
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--accent-emerald)', fontWeight: 600, display: 'inline-block', marginTop: '6px' }}>
              Real MongoDB Users
            </span>
          </div>

          {/* Active Students Card */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Students
              </span>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiActivity size={20} />
              </div>
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              {stats.activeStudents}
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, display: 'inline-block', marginTop: '6px' }}>
              Verified Accounts
            </span>
          </div>

          {/* Semesters Recorded Card */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Semesters Recorded
              </span>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', color: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiLayers size={20} />
              </div>
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              {stats.totalSemestersRecorded}
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, display: 'inline-block', marginTop: '6px' }}>
              Across All Students
            </span>
          </div>

          {/* Subjects Recorded Card */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Subjects Recorded
              </span>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiBookOpen size={20} />
              </div>
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              {stats.totalSubjectsRecorded}
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, display: 'inline-block', marginTop: '6px' }}>
              Grade Entries
            </span>
          </div>
        </section>

        {/* Filter, Search & Controls Header */}
        <section className="glass-panel" style={{ padding: '24px', borderRadius: '20px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <FiSearch size={18} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Name, Roll Number, or Email..."
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 48px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--card-bg)',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Branch Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiFilter size={16} color="var(--text-muted)" />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--card-bg)',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none'
                }}
              >
                <option value="ALL">All Branches</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
              </select>
            </div>

            {/* Year Filter */}
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'var(--card-bg)',
                color: 'var(--text-main)',
                fontSize: '14px',
                fontWeight: 600,
                outline: 'none'
              }}
            >
              <option value="ALL">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>

            {/* Sorting */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
              }}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'var(--card-bg)',
                color: 'var(--text-main)',
                fontSize: '14px',
                fontWeight: 600,
                outline: 'none'
              }}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="rollNumber-asc">Roll Number (Asc)</option>
              <option value="rollNumber-desc">Roll Number (Desc)</option>
              <option value="cgpa-desc">CGPA (High to Low)</option>
              <option value="cgpa-asc">CGPA (Low to High)</option>
            </select>
          </div>
        </section>

        {/* Student Records Table */}
        <section className="glass-panel" style={{ padding: '28px', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              Registered Students Directory ({filteredStudents.length})
            </h3>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              Loading students from MongoDB...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              No matching student records found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px',
                  textAlign: 'left'
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '2px solid var(--border-color)',
                      color: 'var(--text-muted)',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    <th style={{ padding: '14px 16px' }}>Student Name</th>
                    <th style={{ padding: '14px 16px' }}>Roll Number</th>
                    <th style={{ padding: '14px 16px' }}>Email</th>
                    <th style={{ padding: '14px 16px' }}>Year / Sem</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center' }}>CGPA</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center' }}>SGPA</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center' }}>Backlogs</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center' }}>Status</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr
                      key={s._id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <td style={{ padding: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {s.name}
                      </td>
                      <td style={{ padding: '16px', fontWeight: 600, color: 'var(--accent-primary)', letterSpacing: '0.03em' }}>
                        {s.rollNumber}
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                        {s.email}
                      </td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {s.presentYear} – {s.presentSemester}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', fontWeight: 800, color: s.cgpa >= 7.5 ? 'var(--accent-emerald)' : 'var(--text-main)' }}>
                        {s.cgpa > 0 ? s.cgpa.toFixed(2) : 'N/A'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        {s.sgpa > 0 ? s.sgpa.toFixed(2) : 'N/A'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            background: s.backlogs > 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: s.backlogs > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)'
                          }}
                        >
                          {s.backlogs}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: 'var(--accent-emerald)'
                          }}
                        >
                          Active
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => openStudentDetails(s._id)}
                            title="View Academic Record"
                            style={{
                              padding: '8px 12px',
                              borderRadius: '10px',
                              border: '1px solid var(--border-color)',
                              background: 'rgba(99, 102, 241, 0.1)',
                              color: 'var(--accent-primary)',
                              fontWeight: 600,
                              fontSize: '13px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <FiEye size={15} />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => openEditModal(s)}
                            title="Edit Profile"
                            style={{
                              padding: '8px 12px',
                              borderRadius: '10px',
                              border: '1px solid var(--border-color)',
                              background: 'rgba(245, 158, 11, 0.1)',
                              color: '#F59E0B',
                              fontWeight: 600,
                              fontSize: '13px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <FiEdit3 size={15} />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => confirmDeleteStudent(s)}
                            title="Delete Student"
                            style={{
                              padding: '8px 12px',
                              borderRadius: '10px',
                              border: '1px solid rgba(244, 63, 94, 0.2)',
                              background: 'rgba(244, 63, 94, 0.1)',
                              color: 'var(--accent-rose)',
                              fontWeight: 600,
                              fontSize: '13px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <FiTrash2 size={15} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* CREATE STUDENT MODAL */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            className="glass-panel animate-scale-up"
            style={{
              width: '100%',
              maxWidth: '650px',
              padding: '32px',
              borderRadius: '24px',
              background: 'var(--card-bg)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-gradient)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiUserPlus size={20} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Create New Student Account
                </h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <FiX size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. VETTI AMBIKA"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Roll Number *</label>
                <input
                  type="text"
                  required
                  value={createForm.rollNumber}
                  onChange={(e) => setCreateForm({ ...createForm, rollNumber: e.target.value })}
                  placeholder="e.g. 23351A6101"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="e.g. student@gmail.com"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Login Password *</label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Initial Password"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>University</label>
                <input
                  type="text"
                  value={createForm.university}
                  onChange={(e) => setCreateForm({ ...createForm, university: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Regulation</label>
                <input
                  type="text"
                  value={createForm.regulation}
                  onChange={(e) => setCreateForm({ ...createForm, regulation: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Branch</label>
                <input
                  type="text"
                  value={createForm.branch}
                  onChange={(e) => setCreateForm({ ...createForm, branch: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Course Type</label>
                <input
                  type="text"
                  value={createForm.courseType}
                  onChange={(e) => setCreateForm({ ...createForm, courseType: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Present Year</label>
                <select
                  value={createForm.presentYear}
                  onChange={(e) => setCreateForm({ ...createForm, presentYear: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Present Semester</label>
                <select
                  value={createForm.presentSemester}
                  onChange={(e) => setCreateForm({ ...createForm, presentSemester: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'var(--accent-gradient)', color: '#FFF', fontWeight: 700 }}>Create Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT PROFILE MODAL */}
      {isEditProfileModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            className="glass-panel animate-scale-up"
            style={{
              width: '100%',
              maxWidth: '650px',
              padding: '32px',
              borderRadius: '24px',
              background: 'var(--card-bg)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiEdit3 size={20} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Edit Student Profile
                </h3>
              </div>
              <button onClick={() => setIsEditProfileModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <FiX size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Student Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Roll Number</label>
                <input
                  type="text"
                  required
                  value={editForm.rollNumber}
                  onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>New Password (Leave blank to keep unchanged)</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>University</label>
                <input
                  type="text"
                  value={editForm.university}
                  onChange={(e) => setEditForm({ ...editForm, university: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Regulation</label>
                <input
                  type="text"
                  value={editForm.regulation}
                  onChange={(e) => setEditForm({ ...editForm, regulation: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Branch</label>
                <input
                  type="text"
                  value={editForm.branch}
                  onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Course Type</label>
                <input
                  type="text"
                  value={editForm.courseType}
                  onChange={(e) => setEditForm({ ...editForm, courseType: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Present Year</label>
                <select
                  value={editForm.presentYear}
                  onChange={(e) => setEditForm({ ...editForm, presentYear: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Present Semester</label>
                <select
                  value={editForm.presentSemester}
                  onChange={(e) => setEditForm({ ...editForm, presentSemester: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsEditProfileModalOpen(false)} style={{ padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'var(--accent-gradient)', color: '#FFF', fontWeight: 700 }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT ACADEMIC DETAILS MODAL */}
      {isDetailsModalOpen && activeStudentDetails && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 900,
            padding: '20px'
          }}
        >
          <div
            className="glass-panel animate-scale-up"
            style={{
              width: '100%',
              maxWidth: '900px',
              padding: '32px',
              borderRadius: '24px',
              background: 'var(--card-bg)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  {activeStudentDetails.name}
                </h2>
                <span style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.03em' }}>
                  Roll: {activeStudentDetails.rollNumber} | {activeStudentDetails.email}
                </span>
              </div>
              <button onClick={() => setIsDetailsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <FiX size={24} />
              </button>
            </div>

            {/* Profile Summary & Academic Metrics Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '28px' }}>
              <div className="glass-panel" style={{ padding: '16px', borderRadius: '14px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>CGPA</span>
                <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '4px 0 0', color: 'var(--accent-primary)' }}>
                  {activeAcademicSummary?.cgpa || '0.00'}
                </h3>
              </div>

              <div className="glass-panel" style={{ padding: '16px', borderRadius: '14px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Backlogs</span>
                <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '4px 0 0', color: activeAcademicSummary?.backlogs > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                  {activeAcademicSummary?.backlogs || 0}
                </h3>
              </div>

              <div className="glass-panel" style={{ padding: '16px', borderRadius: '14px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Credits</span>
                <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '4px 0 0', color: 'var(--text-main)' }}>
                  {activeAcademicSummary?.totalCredits || 0}
                </h3>
              </div>

              <div className="glass-panel" style={{ padding: '16px', borderRadius: '14px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Passed</span>
                <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '4px 0 0', color: 'var(--accent-emerald)' }}>
                  {activeAcademicSummary?.passed || 0}
                </h3>
              </div>

              <div className="glass-panel" style={{ padding: '16px', borderRadius: '14px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Semesters</span>
                <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '4px 0 0', color: 'var(--text-main)' }}>
                  {activeAcademicRecord?.semesters?.length || 0}
                </h3>
              </div>
            </div>

            {/* Profile Information Cards */}
            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '16px', marginBottom: '28px', fontSize: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
              <div><strong style={{ color: 'var(--text-muted)' }}>University:</strong> <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{activeStudentDetails.university || 'JNTUK'}</div></div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Regulation:</strong> <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{activeStudentDetails.regulation || 'R20'}</div></div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Branch:</strong> <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{activeStudentDetails.branch || 'CSE'}</div></div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Class Awarded:</strong> <div style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{activeAcademicSummary?.classAwarded || 'Not Available'}</div></div>
            </div>

            {/* Semesters & Academic Editing Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Academic Record & Semesters
              </h3>
              <button
                onClick={() => {
                  setSemModalData({ id: null, name: '' });
                  setIsSemModalOpen(true);
                }}
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'var(--accent-gradient)',
                  color: '#FFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FiPlus size={16} />
                <span>Add Semester</span>
              </button>
            </div>

            {/* Semesters List */}
            {(!activeAcademicRecord?.semesters || activeAcademicRecord.semesters.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '32px', border: '1px dashed var(--border-color)', borderRadius: '16px', color: 'var(--text-muted)' }}>
                No semesters recorded for this student yet. Click "Add Semester" to create one.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {activeAcademicRecord.semesters.map((sem) => (
                  <div key={sem._id} className="glass-panel" style={{ padding: '20px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                          {sem.semesterName}
                        </h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                          ({sem.subjects ? sem.subjects.length : 0} subjects)
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setSubjModalData({
                              semesterId: sem._id,
                              subjectId: null,
                              subjectName: '',
                              grade: 'A',
                              credits: 3,
                              status: 'Regular'
                            });
                            setIsSubjModalOpen(true);
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'rgba(99, 102, 241, 0.1)',
                            color: 'var(--accent-primary)',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <FiPlus size={14} /> Add Subject
                        </button>

                        <button
                          onClick={() => {
                            setSemModalData({ id: sem._id, name: sem.semesterName });
                            setIsSemModalOpen(true);
                          }}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'transparent',
                            color: '#F59E0B',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          <FiEdit3 size={14} />
                        </button>

                        <button
                          onClick={() => confirmDeleteSemester(sem._id, sem.semesterName)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid rgba(244, 63, 94, 0.2)',
                            background: 'rgba(244, 63, 94, 0.1)',
                            color: 'var(--accent-rose)',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Subjects Table */}
                    {(!sem.subjects || sem.subjects.length === 0) ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, fontStyle: 'italic' }}>
                        No subjects added to this semester.
                      </p>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                            <th style={{ padding: '8px 12px' }}>Subject Name</th>
                            <th style={{ padding: '8px 12px', textAlign: 'center' }}>Grade</th>
                            <th style={{ padding: '8px 12px', textAlign: 'center' }}>Points</th>
                            <th style={{ padding: '8px 12px', textAlign: 'center' }}>Credits</th>
                            <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sem.subjects.map((sub) => (
                            <tr key={sub._id} style={{ borderTop: '1px dashed var(--border-color)' }}>
                              <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-main)' }}>
                                {sub.subjectName}
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                <span
                                  style={{
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    fontSize: '12px',
                                    background: (sub.grade === 'F' || sub.grade === 'Ab') ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                    color: (sub.grade === 'F' || sub.grade === 'Ab') ? 'var(--accent-rose)' : 'var(--accent-emerald)'
                                  }}
                                >
                                  {sub.grade}
                                </span>
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>
                                {sub.gradePoint}
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>
                                {sub.credits}
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                                <button
                                  onClick={() => {
                                    setSubjModalData({
                                      semesterId: sem._id,
                                      subjectId: sub._id,
                                      subjectName: sub.subjectName,
                                      grade: sub.grade,
                                      credits: sub.credits,
                                      status: sub.status || 'Regular'
                                    });
                                    setIsSubjModalOpen(true);
                                  }}
                                  style={{ background: 'transparent', border: 'none', color: '#F59E0B', cursor: 'pointer', padding: '4px', marginRight: '6px' }}
                                >
                                  <FiEdit3 size={14} />
                                </button>
                                <button
                                  onClick={() => confirmDeleteSubject(sub._id, sub.subjectName)}
                                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '4px' }}
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEMESTER MODAL */}
      {isSemModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div className="glass-panel animate-scale-up" style={{ width: '100%', maxWidth: '420px', padding: '28px', borderRadius: '20px', background: 'var(--card-bg)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 16px', color: 'var(--text-main)' }}>
              {semModalData.id ? 'Rename Semester' : 'Add New Semester'}
            </h3>
            <form onSubmit={handleSaveSemester}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Semester Name</label>
                <input
                  type="text"
                  required
                  value={semModalData.name}
                  onChange={(e) => setSemModalData({ ...semModalData, name: e.target.value })}
                  placeholder="e.g. 4-1 Semester"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsSemModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'var(--accent-gradient)', color: '#FFF', fontWeight: 700 }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBJECT MODAL */}
      {isSubjModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
          <div className="glass-panel animate-scale-up" style={{ width: '100%', maxWidth: '480px', padding: '28px', borderRadius: '20px', background: 'var(--card-bg)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 16px', color: 'var(--text-main)' }}>
              {subjModalData.subjectId ? 'Edit Subject' : 'Add Subject to Semester'}
            </h3>
            <form onSubmit={handleSaveSubject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Subject Name *</label>
                <input
                  type="text"
                  required
                  value={subjModalData.subjectName}
                  onChange={(e) => setSubjModalData({ ...subjModalData, subjectName: e.target.value })}
                  placeholder="e.g. Data Structures"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Grade</label>
                  <select
                    value={subjModalData.grade}
                    onChange={(e) => setSubjModalData({ ...subjModalData, grade: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                  >
                    <option value="S">S (10 Points)</option>
                    <option value="A">A (9 Points)</option>
                    <option value="B">B (8 Points)</option>
                    <option value="C">C (7 Points)</option>
                    <option value="D">D (6 Points)</option>
                    <option value="E">E (5 Points)</option>
                    <option value="F">F (0 Points - Fail)</option>
                    <option value="Ab">Ab (0 Points - Absent)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>Credits</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={subjModalData.credits}
                    onChange={(e) => setSubjModalData({ ...subjModalData, credits: e.target.value })}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsSubjModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 600 }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: 'var(--accent-gradient)', color: '#FFF', fontWeight: 700 }}>Save Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG */}
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        onClose={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModalState.onConfirm}
        title={confirmModalState.title}
        message={confirmModalState.message}
      />
    </div>
  );
};
