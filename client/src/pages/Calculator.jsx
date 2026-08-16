import React, { useState, useEffect } from 'react';
import {
  getAcademicRecord,
  addSemester,
  deleteSemester,
  addSubject,
  updateSubject,
  deleteSubject
} from '../services/academicApi';
import { GradeBadge } from '../components/GradeBadge';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiBookOpen,
  FiChevronDown
} from 'react-icons/fi';
import { FaCalculator } from 'react-icons/fa';

const PREDEFINED_SEMESTERS = [
  '1-1 Semester',
  '1-2 Semester',
  '2-1 Semester',
  '2-2 Semester',
  '3-1 Semester',
  '3-2 Semester',
  '4-1 Semester',
  '4-2 Semester'
];

export const Calculator = () => {
  const [academicRecord, setAcademicRecord] = useState(null);
  const [summary, setSummary] = useState(null);
  const [activeSemId, setActiveSemId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false });

  const [showAddSemModal, setShowAddSemModal] = useState(false);
  const [selectedSemName, setSelectedSemName] = useState(PREDEFINED_SEMESTERS[0]);

  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [editingSub, setEditingSub] = useState(null);

  const [subName, setSubName] = useState('');
  const [subGrade, setSubGrade] = useState('A');
  const [subCredits, setSubCredits] = useState('3');
  const [subStatus, setSubStatus] = useState('Regular');

  const [deletingSem, setDeletingSem] = useState(null);
  const [deletingSub, setDeletingSub] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const fetchRecord = async () => {
    try {
      setLoading(true);
      const res = await getAcademicRecord();
      if (res.success) {
        setAcademicRecord(res.academicRecord);
        setSummary(res.summary);
        if (res.academicRecord.semesters.length > 0 && !activeSemId) {
          setActiveSemId(res.academicRecord.semesters[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load academic records:', err);
      showToast('Unable to load academic records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
  }, []);

  const activeSemester = academicRecord?.semesters.find((s) => s._id === activeSemId) || academicRecord?.semesters[0];

  const handleAddSemesterSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSemName) return;

    try {
      const res = await addSemester(selectedSemName);
      if (res.success) {
        setAcademicRecord(res.academicRecord);
        setSummary(res.summary);
        const newSem = res.academicRecord.semesters[res.academicRecord.semesters.length - 1];
        if (newSem) setActiveSemId(newSem._id);
        setShowAddSemModal(false);
        showToast('Saved ✓ Semester added');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add semester', 'error');
    }
  };

  const handleDeleteSemesterConfirm = async () => {
    if (!deletingSem) return;
    try {
      const res = await deleteSemester(deletingSem._id);
      if (res.success) {
        setAcademicRecord(res.academicRecord);
        setSummary(res.summary);
        setDeletingSem(null);
        if (res.academicRecord.semesters.length > 0) {
          setActiveSemId(res.academicRecord.semesters[0]._id);
        } else {
          setActiveSemId(null);
        }
        showToast('Saved ✓ Semester deleted');
      }
    } catch (err) {
      showToast('Failed to delete semester', 'error');
    }
  };

  const openAddSubject = () => {
    setEditingSub(null);
    setSubName('');
    setSubGrade('A');
    setSubCredits('3');
    setSubStatus('Regular');
    setShowAddSubModal(true);
  };

  const openEditSubject = (sub) => {
    setEditingSub(sub);
    setSubName(sub.subjectName);
    setSubGrade(sub.grade);
    setSubCredits(sub.credits.toString());
    setSubStatus(sub.status || 'Regular');
    setShowAddSubModal(true);
  };

  const handleSubjectFormSubmit = async (e) => {
    e.preventDefault();
    if (!subName.trim()) return;

    const payload = {
      subjectName: subName.trim(),
      grade: subGrade,
      credits: Number(subCredits),
      status: subStatus
    };

    try {
      if (editingSub) {
        const res = await updateSubject(editingSub._id, payload);
        if (res.success) {
          setAcademicRecord(res.academicRecord);
          setSummary(res.summary);
          showToast('Saved ✓ Subject updated');
        }
      } else {
        if (!activeSemester) return;
        const res = await addSubject(activeSemester._id, payload);
        if (res.success) {
          setAcademicRecord(res.academicRecord);
          setSummary(res.summary);
          showToast('Saved ✓ Subject added');
        }
      }
      setShowAddSubModal(false);
    } catch (err) {
      showToast('Unable to save changes. Please try again.', 'error');
    }
  };

  const handleDeleteSubjectConfirm = async () => {
    if (!deletingSub) return;
    try {
      const res = await deleteSubject(deletingSub._id);
      if (res.success) {
        setAcademicRecord(res.academicRecord);
        setSummary(res.summary);
        setDeletingSub(null);
        showToast('Saved ✓ Subject removed');
      }
    } catch (err) {
      showToast('Failed to delete subject', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading your academic records...</p>
        </div>
      </div>
    );
  }

  const activeSemSummary = summary?.semesters?.find((s) => s._id === activeSemester?._id);

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px' }}>
            CGPA Calculator
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Add semesters and subjects to build your personalized academic record.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedSemName(PREDEFINED_SEMESTERS[0]);
            setShowAddSemModal(true);
          }}
          className="gradient-btn"
          style={{ padding: '10px 18px', fontSize: '14px' }}
        >
          <FiPlus size={18} />
          <span>Add Semester</span>
        </button>
      </div>

      {/* Stat Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
            CGPA
          </span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-primary)', marginTop: '4px' }}>
            {summary?.cgpa ? summary.cgpa.toFixed(2) : '--'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
            Percentage
          </span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '4px' }}>
            {summary?.percentage ? `${summary.percentage.toFixed(2)}%` : '--'}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
            Credits
          </span>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
            {summary?.totalCredits || 0}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
            Backlogs
          </span>
          <div
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: summary?.backlogs === 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
              marginTop: '4px'
            }}
          >
            {summary?.backlogs || 0}
          </div>
        </div>
      </div>

      {/* Semesters & Subjects */}
      {academicRecord?.semesters.length > 0 ? (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '12px',
              marginBottom: '24px'
            }}
          >
            {academicRecord.semesters.map((sem) => {
              const isActive = activeSemester?._id === sem._id;
              return (
                <button
                  key={sem._id}
                  onClick={() => setActiveSemId(sem._id)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: isActive ? '700' : '600',
                    background: isActive ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.04)',
                    color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                    border: '1px solid',
                    borderColor: isActive ? 'transparent' : 'var(--border-color)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 4px 15px rgba(99, 102, 241, 0.3)' : 'none'
                  }}
                >
                  {sem.semesterName}
                </button>
              );
            })}
          </div>

          {activeSemester && (
            <div className="glass-panel" style={{ padding: '28px', marginBottom: '32px' }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '20px',
                  marginBottom: '20px'
                }}
              >
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px' }}>
                    {activeSemester.semesterName}
                  </h2>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    SGPA:{' '}
                    <strong style={{ color: 'var(--accent-primary)', fontSize: '15px' }}>
                      {activeSemSummary?.sgpa ? activeSemSummary.sgpa.toFixed(2) : '--'}
                    </strong>{' '}
                    • Credits: <strong>{activeSemSummary?.credits || 0}</strong> • Subjects:{' '}
                    <strong>{activeSemester.subjects.length}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={openAddSubject}
                    className="gradient-btn"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    <FiPlus size={16} />
                    <span>Add Subject</span>
                  </button>

                  <button
                    onClick={() => setDeletingSem(activeSemester)}
                    style={{
                      background: 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid rgba(244, 63, 94, 0.2)',
                      color: 'var(--accent-rose)',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FiTrash2 size={16} />
                    <span>Delete Sem</span>
                  </button>
                </div>
              </div>

              {activeSemester.subjects.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          color: 'var(--text-muted)',
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}
                      >
                        <th style={{ padding: '12px 16px' }}>Subject</th>
                        <th style={{ padding: '12px 16px' }}>Grade</th>
                        <th style={{ padding: '12px 16px' }}>Credits</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeSemester.subjects.map((sub) => (
                        <tr
                          key={sub._id}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                            transition: 'background 0.2s ease'
                          }}
                        >
                          <td style={{ padding: '16px', fontWeight: '600', color: 'var(--text-main)' }}>
                            {sub.subjectName}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <GradeBadge grade={sub.grade} />
                          </td>
                          <td style={{ padding: '16px', fontWeight: '600', color: 'var(--text-main)' }}>
                            {sub.credits}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button
                                onClick={() => openEditSubject(sub)}
                                title="Edit Subject"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  border: '1px solid var(--border-color)',
                                  color: 'var(--text-secondary)',
                                  padding: '6px 10px',
                                  borderRadius: '8px',
                                  cursor: 'pointer'
                                }}
                              >
                                <FiEdit2 size={14} />
                              </button>

                              <button
                                onClick={() => setDeletingSub(sub)}
                                title="Delete Subject"
                                style={{
                                  background: 'rgba(244, 63, 94, 0.1)',
                                  border: '1px solid rgba(244, 63, 94, 0.2)',
                                  color: 'var(--accent-rose)',
                                  padding: '6px 10px',
                                  borderRadius: '8px',
                                  cursor: 'pointer'
                                }}
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <FiBookOpen size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p style={{ fontWeight: '600', marginBottom: '12px' }}>No subjects added to this semester yet.</p>
                  <button onClick={openAddSubject} className="gradient-btn" style={{ padding: '8px 16px' }}>
                    + Add Subject
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* Fresh User Empty State */
        <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <FiBookOpen size={54} style={{ color: 'var(--accent-primary)', marginBottom: '16px', opacity: 0.8 }} />
          <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>Your academic journey starts here.</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', maxWidth: '440px', margin: '0 auto 24px' }}>
            Add your first semester to calculate your SGPA and CGPA.
          </p>
          <button
            onClick={() => {
              setSelectedSemName(PREDEFINED_SEMESTERS[0]);
              setShowAddSemModal(true);
            }}
            className="gradient-btn"
            style={{ padding: '12px 24px', fontSize: '15px' }}
          >
            <FiPlus size={18} />
            <span>+ Add Semester</span>
          </button>
        </div>
      )}

      {/* Modal: Add Semester */}
      <Modal isOpen={showAddSemModal} onClose={() => setShowAddSemModal(false)} title="Select Semester">
        <form onSubmit={handleAddSemesterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Semester
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedSemName}
                onChange={(e) => setSelectedSemName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'var(--modal-bg)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '15px',
                  fontWeight: '600',
                  outline: 'none',
                  cursor: 'pointer',
                  appearance: 'none'
                }}
              >
                {PREDEFINED_SEMESTERS.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
              <FiChevronDown
                size={18}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: 'var(--text-muted)'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={() => setShowAddSemModal(false)} className="glass-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="gradient-btn">
              Create Semester
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add / Edit Subject */}
      <Modal
        isOpen={showAddSubModal}
        onClose={() => setShowAddSubModal(false)}
        title={editingSub ? 'Edit Subject' : `Add Subject to ${activeSemester?.semesterName}`}
      >
        <form onSubmit={handleSubjectFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Subject Name
            </label>
            <input
              type="text"
              placeholder="e.g. Design & Analysis of Algorithms"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Grade
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={subGrade}
                onChange={(e) => setSubGrade(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'var(--modal-bg)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  fontWeight: '600',
                  outline: 'none',
                  appearance: 'none'
                }}
              >
                <option value="S">S Superior · 10 Points</option>
                <option value="A">A Excellent · 9 Points</option>
                <option value="B">B Very Good · 8 Points</option>
                <option value="C">C Good · 7 Points</option>
                <option value="D">D Average · 6 Points</option>
                <option value="E">E Pass · 5 Points</option>
                <option value="F">F Fail · 0 Points</option>
                <option value="Ab">Ab Absent · 0 Points</option>
              </select>
              <FiChevronDown
                size={16}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: 'var(--text-muted)'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Credits
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="10"
                value={subCredits}
                onChange={(e) => setSubCredits(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Status
              </label>
              <select
                value={subStatus}
                onChange={(e) => setSubStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'var(--modal-bg)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="Regular">Regular</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={() => setShowAddSubModal(false)} className="glass-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="gradient-btn">
              {editingSub ? 'Save Changes' : 'Add Subject'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal: Delete Semester */}
      <Modal isOpen={!!deletingSem} onClose={() => setDeletingSem(null)} title="Delete this semester?">
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            All subjects inside <strong>{deletingSem?.semesterName}</strong> will be removed.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button onClick={() => setDeletingSem(null)} className="glass-btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleDeleteSemesterConfirm}
              style={{
                background: 'rgba(244, 63, 94, 0.9)',
                color: '#FFF',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Delete Semester
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal: Delete Subject */}
      <Modal isOpen={!!deletingSub} onClose={() => setDeletingSub(null)} title="Delete this subject?">
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            This academic record for <strong>"{deletingSub?.subjectName}"</strong> will be permanently removed.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button onClick={() => setDeletingSub(null)} className="glass-btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleDeleteSubjectConfirm}
              style={{
                background: 'rgba(244, 63, 94, 0.9)',
                color: '#FFF',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
