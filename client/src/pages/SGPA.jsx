import React, { useState, useEffect } from 'react';
import { getAcademicRecord } from '../services/academicApi';
import { BarChart3, Award, BookOpen } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export const SGPA = () => {
  const [academicRecord, setAcademicRecord] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAcademicRecord();
        if (res.success) {
          setAcademicRecord(res.academicRecord);
          setSummary(res.summary);
        }
      } catch (err) {
        console.error('Failed to load SGPA stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading SGPA metrics...</p>
        </div>
      </div>
    );
  }

  const chartData = (summary?.semesters || []).map((sem) => ({
    name: sem.semesterName,
    sgpa: Number(sem.sgpa.toFixed(2)),
    credits: sem.credits
  }));

  const barColors = ['#6366F1', '#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B'];

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Title */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px' }}>
          SGPA Performance
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Semester Grade Point Average breakdown across all active semesters.
        </p>
      </div>

      {chartData.length > 0 ? (
        <>
          {/* Performance Chart Card */}
          <div className="glass-panel animate-fade-in" style={{ padding: '28px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <BarChart3 size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Semester SGPA Comparison</h3>
            </div>

            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                  <YAxis domain={[0, 10]} stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--modal-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      color: 'var(--text-main)'
                    }}
                    formatter={(val) => [`SGPA: ${val}`, 'Performance']}
                  />
                  <Bar dataKey="sgpa" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Semester Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '20px'
            }}
          >
            {summary.semesters.map((sem, idx) => (
              <div
                key={sem._id}
                className="glass-card-interactive animate-fade-in"
                style={{ padding: '24px', animationDelay: `${idx * 0.05}s` }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{sem.semesterName}</h3>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--accent-primary)',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}
                  >
                    {sem.credits} Credits
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '32px', fontWeight: '800', fontFamily: "'Outfit', sans-serif" }}>
                    {sem.sgpa.toFixed(2)}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                    / 10.00 SGPA
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Included Subjects: <strong>{sem.subjectCount}</strong>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <BookOpen size={48} style={{ color: 'var(--accent-primary)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>No Semesters Recorded</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Go to the Calculator page to add your first semester.
          </p>
        </div>
      )}
    </div>
  );
};
