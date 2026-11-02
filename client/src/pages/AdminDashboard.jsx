import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams, NavLink } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useTheme } from '../context/ThemeContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { BRANCHES } from '../utils/constants';
import {
  getAdminStats,
  getAdminStudents,
  createStudent,
  getStudentDetails,
  updateStudentProfile,
  resetStudentPassword,
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
  FiRefreshCw,
  FiKey,
  FiArrowLeft
} from 'react-icons/fi';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramStudentId } = useParams();
  const { adminUser, logoutAdminAccount } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();

  // Determine current active view based on React Router location path
  const viewMode = useMemo(() => {
    const path = location.pathname;
    if (path === '/admin/students/create') return 'create';
    if (path.startsWith('/admin/students/') && path.endsWith('/edit')) return 'edit';
    if (path.startsWith('/admin/students/') && paramStudentId) return 'details';
    if (path === '/admin/students') return 'students';
    if (path === '/admin/records') return 'records';
    return 'dashboard'; // /admin/dashboard or default
  }, [location.pathname, paramStudentId]);

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
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Reset Password Modal State
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetPasswordStudent, setResetPasswordStudent] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Active Detailed Student View State
  const [activeStudentDetails, setActiveStudentDetails] = useState(null);
  const [activeAcademicRecord, setActiveAcademicRecord] = useState(null);
  const [activeAcademicSummary, setActiveAcademicSummary] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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

  // Load Main Dashboard Data on Mount
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

  // Fetch Student Details when navigating directly to /admin/students/:id or /admin/students/:id/edit
  useEffect(() => {
    if (paramStudentId && (viewMode === 'details' || viewMode === 'edit')) {
      const loadDetails = async () => {
        setLoadingDetails(true);
        try {
          const res = await getStudentDetails(paramStudentId);
          if (res.success) {
            setActiveStudentDetails(res.student);
            setActiveAcademicRecord(res.academicRecord);
            setActiveAcademicSummary(res.summary);

            if (viewMode === 'edit') {
              setEditForm({
                name: res.student.name || '',
                rollNumber: res.student.rollNumber || '',
                email: res.student.email || res.student.loginId || '',
                password: '',
                university: res.student.university || 'JNTUK',
                regulation: res.student.regulation || 'R20',
                branch: res.student.branch || 'CSE',
                courseType: res.student.courseType || 'B.Tech',
                presentYear: res.student.presentYear || '4th Year',
                presentSemester: res.student.presentSemester || '1st Semester'
              });
            }
          }
        } catch (err) {
          console.error('Error fetching student details:', err);
        } finally {
          setLoadingDetails(false);
        }
      };
      loadDetails();
    }
  }, [paramStudentId, viewMode]);

  const showToast = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Filtered and Sorted Students List
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

  // Handler: Create Student in MongoDB
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await createStudent(createForm);
      if (res.success) {
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
        showToast('Student created successfully in MongoDB!');
        fetchData();
        navigate('/admin/students');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create student.');
    }
  };

  // Handler: Save Edited Student Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const targetId = paramStudentId || activeStudentDetails?._id;
    if (!targetId) return;
    try {
      const res = await updateStudentProfile(targetId, editForm);
      if (res.success) {
        showToast('Student profile updated successfully!');
        fetchData();
        setActiveStudentDetails(res.student);
        navigate(`/admin/students/${targetId}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update student profile.');
    }
  };

  // Handler: Reset Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetPasswordStudent || !newPasswordInput) return;
    try {
      const res = await resetStudentPassword(resetPasswordStudent._id, newPasswordInput);
      if (res.success) {
        setIsResetPasswordModalOpen(false);
        setNewPasswordInput('');
        setResetPasswordStudent(null);
        showToast(res.message || 'Student password reset successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset student password.');
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
            fetchData();
            if (location.pathname.startsWith('/admin/students/')) {
              navigate('/admin/students');
            }
          }
        } catch (err) {
          alert(err.response?.data?.message || 'Failed to delete student.');
        }
      }
    });
  };

  // Academic Actions: Semesters & Subjects
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
        showToast('Semester saved successfully!');
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
        showToast('Subject saved successfully!');
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
      {/* Persistent Admin Sidebar */}
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '0 12px 24px',
              borderBottom: '1px solid var(--border-color)'
            }}
          >
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

          {/* Navigation Links using NavLink for exact active route highlights */}
          <nav style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Dashboard Link */}
            <NavLink
              to="/admin/dashboard"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                textDecoration: 'none',
                background: isActive ? 'var(--accent-gradient)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '14px',
                transition: 'all 0.2s ease'
              })}
            >
              <FiActivity size={18} />
              <span>Dashboard</span>
            </NavLink>

            {/* Students Link */}
            <NavLink
              to="/admin/students"
              style={({ isActive }) => {
                const isStudentsActive =
                  isActive ||
                  (location.pathname.startsWith('/admin/students/') && location.pathname !== '/admin/students/create');
                return {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  background: isStudentsActive ? 'var(--accent-gradient)' : 'transparent',
                  color: isStudentsActive ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                };
              }}
            >
              <FiUsers size={18} />
              <span>Students</span>
            </NavLink>

            {/* Create Student Link */}
            <NavLink
              to="/admin/students/create"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                textDecoration: 'none',
                background: isActive ? 'var(--accent-gradient)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '14px',
                transition: 'all 0.2s ease'
              })}
            >
              <FiUserPlus size={18} />
              <span>Create Student</span>
            </NavLink>

            {/* Student Records Link */}
            <NavLink
              to="/admin/records"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                textDecoration: 'none',
                background: isActive ? 'var(--accent-gradient)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '14px',
                transition: 'all 0.2s ease'
              })}
            >
              <FiBookOpen size={18} />
              <span>Student Records</span>
            </NavLink>
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

      {/* Main Content View Area */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        {/* Top Header Bar */}
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
              {viewMode === 'dashboard' && 'Admin Dashboard Overview'}
              {viewMode === 'students' && 'Student Directory Management'}
              {viewMode === 'create' && 'Create Student Account'}
              {viewMode === 'details' && (activeStudentDetails ? `${activeStudentDetails.name} Profile` : 'Student Academic Details')}
              {viewMode === 'edit' && 'Edit Student Profile'}
              {viewMode === 'records' && 'Student Academic Records Governance'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0' }}>
              Academic Governance & Real MongoDB Records Integration
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

            {viewMode !== 'create' && (
              <button
                onClick={() => navigate('/admin/students/create')}
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
            )}
          </div>
        </header>

        {/* Success Message Toast Banner */}
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

        {/* ==================================================== */}
        {/* VIEW 1: DASHBOARD OVERVIEW (/admin/dashboard) */}
        {/* ==================================================== */}
        {viewMode === 'dashboard' && (
          <>
            {/* Overview Metric Cards */}
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

            {/* Recent Students Overview Table */}
            <section className="glass-panel" style={{ padding: '28px', borderRadius: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Student Directory Overview ({students.length})
                </h3>
                <button
                  onClick={() => navigate('/admin/students')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'transparent',
                    color: 'var(--accent-primary)',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  View Full Directory →
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  Loading student directory...
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ padding: '14px 16px' }}>Student</th>
                        <th style={{ padding: '14px 16px' }}>Roll Number</th>
                        <th style={{ padding: '14px 16px' }}>Email</th>
                        <th style={{ padding: '14px 16px' }}>Branch</th>
                        <th style={{ padding: '14px 16px' }}>Year / Sem</th>
                        <th style={{ padding: '14px 16px', textAlign: 'center' }}>CGPA</th>
                        <th style={{ padding: '14px 16px', textAlign: 'center' }}>Status</th>
                        <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.slice(0, 8).map((s) => (
                        <tr key={s._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{s.name}</td>
                          <td style={{ padding: '16px', fontWeight: 600, color: 'var(--accent-primary)', letterSpacing: '0.03em' }}>{s.rollNumber}</td>
                          <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{s.email}</td>
                          <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>{s.branch || 'CSE'}</td>
                          <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{s.presentYear} – {s.presentSemester}</td>
                          <td style={{ padding: '16px', textAlign: 'center', fontWeight: 800, color: s.cgpa >= 7.5 ? 'var(--accent-emerald)' : 'var(--text-main)' }}>{s.cgpa > 0 ? s.cgpa.toFixed(2) : 'N/A'}</td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)' }}>
                              Active
                            </span>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                              <button
                                onClick={() => navigate(`/admin/students/${s._id}`)}
                                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                              >
                                View
                              </button>
                              <button
                                onClick={() => navigate(`/admin/students/${s._id}/edit`)}
                                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                              >
                                Edit
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
          </>
        )}

        {/* ==================================================== */}
        {/* VIEW 2: STUDENTS DIRECTORY PAGE (/admin/students) */}
        {/* ==================================================== */}
        {viewMode === 'students' && (
          <>
            {/* Filter, Search & Controls Bar */}
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
                    placeholder="Search by Name, Email, or Roll Number..."
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

                {/* Branch Filter dynamically rendered from central BRANCHES */}
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
                    {BRANCHES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
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

            {/* Student Directory Table */}
            <section className="glass-panel" style={{ padding: '28px', borderRadius: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  All Registered Students ({filteredStudents.length})
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
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
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
                        <th style={{ padding: '14px 16px' }}>Student</th>
                        <th style={{ padding: '14px 16px' }}>Roll Number</th>
                        <th style={{ padding: '14px 16px' }}>Email</th>
                        <th style={{ padding: '14px 16px' }}>Branch</th>
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
                          <td style={{ padding: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{s.name}</td>
                          <td style={{ padding: '16px', fontWeight: 600, color: 'var(--accent-primary)', letterSpacing: '0.03em' }}>{s.rollNumber}</td>
                          <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{s.email}</td>
                          <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>{s.branch || 'CSE'}</td>
                          <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '13px' }}>{s.presentYear} – {s.presentSemester}</td>
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
                                onClick={() => navigate(`/admin/students/${s._id}`)}
                                title="View Academic Profile"
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
                                onClick={() => navigate(`/admin/students/${s._id}/edit`)}
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
                                onClick={() => {
                                  setResetPasswordStudent(s);
                                  setNewPasswordInput('');
                                  setIsResetPasswordModalOpen(true);
                                }}
                                title="Reset Password"
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '10px',
                                  border: '1px solid var(--border-color)',
                                  background: 'rgba(168, 85, 247, 0.1)',
                                  color: '#A855F7',
                                  fontWeight: 600,
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <FiKey size={15} />
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
          </>
        )}

        {/* ==================================================== */}
        {/* VIEW 3: CREATE STUDENT PAGE (/admin/students/create) */}
        {/* ==================================================== */}
        {viewMode === 'create' && (
          <section className="glass-panel animate-fade-in" style={{ padding: '36px', borderRadius: '24px', maxWidth: '750px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--accent-gradient)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiUserPlus size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Create New Student Account
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '2px 0 0' }}>
                  Register student credentials & store in MongoDB Atlas
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateStudent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Rohith"
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Roll Number *</label>
                <input
                  type="text"
                  required
                  value={createForm.rollNumber}
                  onChange={(e) => setCreateForm({ ...createForm, rollNumber: e.target.value })}
                  placeholder="e.g. 23351A6181"
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Email / Login ID *</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="e.g. rohith@example.com"
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Password *</label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Initial Password"
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }}
                />
              </div>

              {/* Branch Select Dropdown from central BRANCHES */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Branch *</label>
                <select
                  value={createForm.branch}
                  onChange={(e) => setCreateForm({ ...createForm, branch: e.target.value })}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px', fontWeight: 600, outline: 'none' }}
                >
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Present Year *</label>
                <select
                  value={createForm.presentYear}
                  onChange={(e) => setCreateForm({ ...createForm, presentYear: e.target.value })}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px', fontWeight: 600, outline: 'none' }}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Present Semester *</label>
                <select
                  value={createForm.presentSemester}
                  onChange={(e) => setCreateForm({ ...createForm, presentSemester: e.target.value })}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px', fontWeight: 600, outline: 'none' }}
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>University</label>
                <input
                  type="text"
                  value={createForm.university}
                  onChange={(e) => setCreateForm({ ...createForm, university: e.target.value })}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => navigate('/admin/students')}
                  style={{ padding: '14px 24px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '14px 28px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: '#FFF', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(79, 70, 229, 0.35)' }}
                >
                  Create Student in MongoDB
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ==================================================== */}
        {/* VIEW 4: STUDENT DETAILS PAGE (/admin/students/:id) */}
        {/* ==================================================== */}
        {viewMode === 'details' && (
          <>
            {loadingDetails ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                Loading complete student academic record...
              </div>
            ) : !activeStudentDetails ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                Student not found or failed to load.
              </div>
            ) : (
              <div className="animate-fade-in">
                {/* Back Link & Header Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <button
                    onClick={() => navigate('/admin/students')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                  >
                    <FiArrowLeft size={16} />
                    <span>Back to Students Directory</span>
                  </button>

                  <button
                    onClick={() => navigate(`/admin/students/${activeStudentDetails._id}/edit`)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', border: 'none', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                  >
                    <FiEdit3 size={16} />
                    <span>Edit Student Profile</span>
                  </button>
                </div>

                {/* Profile Information Banner */}
                <div className="glass-panel" style={{ padding: '28px', borderRadius: '24px', marginBottom: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                      <h2 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-main)' }}>
                        {activeStudentDetails.name}
                      </h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '14px' }}>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.03em' }}>
                          Roll: {activeStudentDetails.rollNumber}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{activeStudentDetails.email || activeStudentDetails.loginId}</span>
                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                        <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                          Branch: {activeStudentDetails.branch || 'CSE'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <span style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <FiCheck size={14} /> Active MongoDB Account
                      </span>
                    </div>
                  </div>

                  {/* Profile Details List */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>University</span>
                      <strong style={{ color: 'var(--text-main)' }}>{activeStudentDetails.university || 'JNTUK'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Regulation</span>
                      <strong style={{ color: 'var(--text-main)' }}>{activeStudentDetails.regulation || 'R20'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Present Year</span>
                      <strong style={{ color: 'var(--text-main)' }}>{activeStudentDetails.presentYear || '4th Year'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Present Semester</span>
                      <strong style={{ color: 'var(--text-main)' }}>{activeStudentDetails.presentSemester || '1st Semester'}</strong>
                    </div>
                  </div>
                </div>

                {/* Academic Metrics Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                  <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>CGPA</span>
                    <h3 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0 0', color: 'var(--accent-primary)' }}>
                      {activeAcademicSummary?.cgpa || '0.00'}
                    </h3>
                  </div>

                  <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Backlogs</span>
                    <h3 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0 0', color: activeAcademicSummary?.backlogs > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                      {activeAcademicSummary?.backlogs || 0}
                    </h3>
                  </div>

                  <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Credits</span>
                    <h3 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0 0', color: 'var(--text-main)' }}>
                      {activeAcademicSummary?.totalCredits || 0}
                    </h3>
                  </div>

                  <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Passed Subjects</span>
                    <h3 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0 0', color: 'var(--accent-emerald)' }}>
                      {activeAcademicSummary?.passed || 0}
                    </h3>
                  </div>

                  <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Class Awarded</span>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, margin: '8px 0 0', color: 'var(--accent-primary)' }}>
                      {activeAcademicSummary?.classAwarded || 'N/A'}
                    </h4>
                  </div>
                </div>

                {/* Semesters & Academic Editing Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Recorded Semesters & Subject Grades
                  </h3>
                  <button
                    onClick={() => {
                      setSemModalData({ id: null, name: '' });
                      setIsSemModalOpen(true);
                    }}
                    style={{
                      padding: '10px 18px',
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
                  <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', borderRadius: '20px', color: 'var(--text-muted)' }}>
                    No semesters recorded for this student yet. Click "Add Semester" to create one.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {activeAcademicRecord.semesters.map((sem) => (
                      <div key={sem._id} className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                              {sem.semesterName}
                            </h4>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                              ({sem.subjects ? sem.subjects.length : 0} subjects)
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '10px' }}>
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
                                padding: '8px 14px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color)',
                                background: 'rgba(99, 102, 241, 0.1)',
                                color: 'var(--accent-primary)',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <FiPlus size={15} /> Add Subject
                            </button>

                            <button
                              onClick={() => {
                                setSemModalData({ id: sem._id, name: sem.semesterName });
                                setIsSemModalOpen(true);
                              }}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color)',
                                background: 'transparent',
                                color: '#F59E0B',
                                fontSize: '13px',
                                cursor: 'pointer'
                              }}
                            >
                              <FiEdit3 size={15} />
                            </button>

                            <button
                              onClick={() => confirmDeleteSemester(sem._id, sem.semesterName)}
                              style={{
                                padding: '8px 12px',
                                borderRadius: '10px',
                                border: '1px solid rgba(244, 63, 94, 0.2)',
                                background: 'rgba(244, 63, 94, 0.1)',
                                color: 'var(--accent-rose)',
                                fontSize: '13px',
                                cursor: 'pointer'
                              }}
                            >
                              <FiTrash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Subjects Table */}
                        {(!sem.subjects || sem.subjects.length === 0) ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0, fontStyle: 'italic' }}>
                            No subjects added to this semester.
                          </p>
                        ) : (
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <th style={{ padding: '10px 14px' }}>Subject Name</th>
                                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Grade</th>
                                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Points</th>
                                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Credits</th>
                                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sem.subjects.map((sub) => (
                                <tr key={sub._id} style={{ borderTop: '1px dashed var(--border-color)' }}>
                                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-main)' }}>
                                    {sub.subjectName}
                                  </td>
                                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                    <span
                                      style={{
                                        padding: '4px 10px',
                                        borderRadius: '8px',
                                        fontWeight: 700,
                                        fontSize: '12px',
                                        background: (sub.grade === 'F' || sub.grade === 'Ab') ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                        color: (sub.grade === 'F' || sub.grade === 'Ab') ? 'var(--accent-rose)' : 'var(--accent-emerald)'
                                      }}
                                    >
                                      {sub.grade}
                                    </span>
                                  </td>
                                  <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700 }}>
                                    {sub.gradePoint}
                                  </td>
                                  <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600 }}>
                                    {sub.credits}
                                  </td>
                                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
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
                                      style={{ background: 'transparent', border: 'none', color: '#F59E0B', cursor: 'pointer', padding: '6px', marginRight: '8px' }}
                                    >
                                      <FiEdit3 size={15} />
                                    </button>
                                    <button
                                      onClick={() => confirmDeleteSubject(sub._id, sub.subjectName)}
                                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '6px' }}
                                    >
                                      <FiTrash2 size={15} />
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
            )}
          </>
        )}

        {/* ==================================================== */}
        {/* VIEW 5: EDIT STUDENT PAGE (/admin/students/:id/edit) */}
        {/* ==================================================== */}
        {viewMode === 'edit' && (
          <section className="glass-panel animate-fade-in" style={{ padding: '36px', borderRadius: '24px', maxWidth: '750px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiEdit3 size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Edit Student Profile
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '2px 0 0' }}>
                  Update student profile information in MongoDB
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Student Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Roll Number *</label>
                <input
                  type="text"
                  required
                  value={editForm.rollNumber}
                  onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }}
                />
              </div>

              {/* Branch Select Dropdown from central BRANCHES */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Branch *</label>
                <select
                  value={editForm.branch}
                  onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px', fontWeight: 600, outline: 'none' }}
                >
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Present Year *</label>
                <select
                  value={editForm.presentYear}
                  onChange={(e) => setEditForm({ ...editForm, presentYear: e.target.value })}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px', fontWeight: 600, outline: 'none' }}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Present Semester *</label>
                <select
                  value={editForm.presentSemester}
                  onChange={(e) => setEditForm({ ...editForm, presentSemester: e.target.value })}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px', fontWeight: 600, outline: 'none' }}
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>University</label>
                <input
                  type="text"
                  value={editForm.university}
                  onChange={(e) => setEditForm({ ...editForm, university: e.target.value })}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Regulation</label>
                <input
                  type="text"
                  value={editForm.regulation}
                  onChange={(e) => setEditForm({ ...editForm, regulation: e.target.value })}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => navigate(paramStudentId ? `/admin/students/${paramStudentId}` : '/admin/students')}
                  style={{ padding: '14px 24px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '14px 28px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#FFF', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(245, 158, 11, 0.35)' }}
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ==================================================== */}
        {/* VIEW 6: STUDENT RECORDS PAGE (/admin/records) */}
        {/* ==================================================== */}
        {viewMode === 'records' && (
          <>
            {/* Filter & Search Bar */}
            <section className="glass-panel" style={{ padding: '24px', borderRadius: '20px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <FiSearch size={18} />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search student records by Name, Roll, or Email..."
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
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>

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
              </div>
            </section>

            {/* Academic Records Directory */}
            <section className="glass-panel" style={{ padding: '28px', borderRadius: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 20px', color: 'var(--text-main)' }}>
                Academic Performance Directory ({filteredStudents.length})
              </h3>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  Loading academic records...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  No matching student academic records found.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <th style={{ padding: '14px 16px' }}>Student</th>
                        <th style={{ padding: '14px 16px' }}>Roll Number</th>
                        <th style={{ padding: '14px 16px' }}>Branch</th>
                        <th style={{ padding: '14px 16px', textAlign: 'center' }}>Total Credits</th>
                        <th style={{ padding: '14px 16px', textAlign: 'center' }}>Passed / Total</th>
                        <th style={{ padding: '14px 16px', textAlign: 'center' }}>CGPA</th>
                        <th style={{ padding: '14px 16px', textAlign: 'center' }}>Backlogs</th>
                        <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s) => (
                        <tr key={s._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{s.name}</td>
                          <td style={{ padding: '16px', fontWeight: 600, color: 'var(--accent-primary)', letterSpacing: '0.03em' }}>{s.rollNumber}</td>
                          <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>{s.branch || 'CSE'}</td>
                          <td style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>{s.totalCredits || 0}</td>
                          <td style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>{s.passedSubjects || 0} / {s.totalSubjects || 0}</td>
                          <td style={{ padding: '16px', textAlign: 'center', fontWeight: 800, color: s.cgpa >= 7.5 ? 'var(--accent-emerald)' : 'var(--text-main)' }}>
                            {s.cgpa > 0 ? s.cgpa.toFixed(2) : 'N/A'}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, background: s.backlogs > 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: s.backlogs > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                              {s.backlogs}
                            </span>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <button
                              onClick={() => navigate(`/admin/students/${s._id}`)}
                              style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--accent-gradient)', color: '#FFF', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <FiBookOpen size={15} />
                              <span>Inspect Records</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* RESET PASSWORD MODAL */}
      {isResetPasswordModalOpen && resetPasswordStudent && (
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
              maxWidth: '440px',
              padding: '32px',
              borderRadius: '24px',
              background: 'var(--card-bg)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', color: '#A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiKey size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Reset Password
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {resetPasswordStudent.name} ({resetPasswordStudent.rollNumber})
                  </span>
                </div>
              </div>
              <button onClick={() => setIsResetPasswordModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Enter new password"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'transparent',
                    color: 'var(--text-main)',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #8B5CF6, #D946EF)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Reset Password
                </button>
              </div>
            </form>
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
