import React, { useState, useEffect } from 'react';
import { getAcademicRecord } from '../services/academicApi';
import { CircularProgress } from '../components/CircularProgress';
import { FiTrendingUp, FiAward, FiCheckCircle, FiAlertTriangle, FiBookOpen } from 'react-icons/fi';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const Performance = () => {
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
        console.error('Failed to fetch academic performance:', err);
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
          <p style={{ color: 'var(--text-secondary)' }}>Loading Academic Performance...</p>
        </div>
      </div>
    );
  }

  // Calculate cumulative CGPA trend over semesters for the Line Chart
  const lineChartData = [];
  if (academicRecord && academicRecord.semesters) {
    let cumulativeWeightedPoints = 0;
    let cumulativeCredits = 0;

    academicRecord.semesters.forEach((sem) => {
      (sem.subjects || []).forEach((sub) => {
        const cred = Number(sub.credits) || 0;
        if (cred > 0) {
          cumulativeWeightedPoints += cred * (sub.gradePoint || 0);
          cumulativeCredits += cred;
        }
      });

      const currentCGPA = cumulativeCredits > 0 ? Number((cumulativeWeightedPoints / cumulativeCredits).toFixed(2)) : 0;
      lineChartData.push({
        semester: sem.semesterName,
        cgpa: currentCGPA
      });
    });
  }

  const cgpaVal = summary?.cgpa || 0;
  const percentageVal = summary?.percentage || 0;
  const backlogsCount = summary?.backlogs || 0;
  const classAwarded = summary?.classAwarded || 'Not Available';
  const semestersList = summary?.semesters || [];

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px' }}>
          Academic Performance
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Unified SGPA semester analytics, cumulative CGPA progression & classification award.
        </p>
      </div>

      {semestersList.length > 0 ? (
        <>
          {/* Top Performance Stat Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}
          >
            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                Current CGPA
              </span>
              <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: 'var(--accent-primary)', fontFamily: "'Outfit', sans-serif" }}>
                {cgpaVal > 0 ? cgpaVal.toFixed(2) : '--'}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                Percentage
              </span>
              <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: 'var(--accent-cyan)', fontFamily: "'Outfit', sans-serif" }}>
                {percentageVal > 0 ? `${percentageVal.toFixed(2)}%` : '--'}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                Total Credits
              </span>
              <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '6px', color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>
                {summary?.totalCredits || 0}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                Backlogs
              </span>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  marginTop: '6px',
                  color: backlogsCount === 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                  fontFamily: "'Outfit', sans-serif"
                }}
              >
                {backlogsCount}
              </div>
            </div>
          </div>

          {/* Semester Performance Cards Grid */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Semester Performance</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '20px'
              }}
            >
              {semestersList.map((sem, idx) => (
                <div
                  key={sem._id}
                  className="glass-card-interactive animate-fade-in"
                  style={{ padding: '20px', animationDelay: `${idx * 0.05}s` }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '700' }}>{sem.semesterName}</h4>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: 'var(--accent-primary)',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}
                    >
                      {sem.credits} Credits
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '28px', fontWeight: '800', fontFamily: "'Outfit', sans-serif" }}>
                      {sem.sgpa > 0 ? sem.sgpa.toFixed(2) : '--'}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>
                      SGPA
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall CGPA & Class Award Section */}
          <div
            className="glass-panel animate-fade-in"
            style={{
              padding: '36px 28px',
              marginBottom: '32px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px',
              alignItems: 'center'
            }}
          >
            {/* Ring 1: CGPA */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CircularProgress
                value={cgpaVal}
                max={10}
                size={160}
                strokeWidth={12}
                label="Overall CGPA"
                sublabel="Scale 10.0"
                colorGradient={['#6366F1', '#8B5CF6']}
              />
            </div>

            {/* Ring 2: Percentage */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CircularProgress
                value={percentageVal}
                max={100}
                size={160}
                strokeWidth={12}
                label="Percentage"
                sublabel="(CGPA - 0.5) × 10"
                colorGradient={['#06B6D4', '#3B82F6']}
              />
            </div>

            {/* Class Award Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: '16px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <FiAward size={32} color="var(--accent-primary)" />
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Class Awarded
                  </span>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>
                    {classAwarded}
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: '16px',
                  background: backlogsCount === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                  border: `1px solid ${backlogsCount === 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                {backlogsCount === 0 ? (
                  <FiCheckCircle size={32} color="var(--accent-emerald)" />
                ) : (
                  <FiAlertTriangle size={32} color="var(--accent-rose)" />
                )}
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Academic Status
                  </span>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: '800',
                      color: backlogsCount === 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                      marginTop: '2px'
                    }}
                  >
                    {backlogsCount === 0 ? 'Clean Record (0 Backlogs)' : `${backlogsCount} Active Backlog(s)`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CGPA Progress Line Chart */}
          {lineChartData.length > 0 && (
            <div className="glass-panel animate-fade-in" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <FiTrendingUp size={20} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>CGPA Progress Trend</h3>
              </div>

              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="semester" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <YAxis domain={[0, 10]} stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--modal-bg)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        color: 'var(--text-main)'
                      }}
                      formatter={(val) => [`CGPA: ${val}`, 'Progression']}
                    />
                    <Line
                      type="monotone"
                      dataKey="cgpa"
                      stroke="var(--accent-primary)"
                      strokeWidth={3}
                      dot={{ r: 6, fill: 'var(--accent-primary)', strokeWidth: 2, stroke: '#FFF' }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty State for Fresh Users */
        <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <FiBookOpen size={54} style={{ color: 'var(--accent-primary)', marginBottom: '16px', opacity: 0.8 }} />
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>No Performance Data Available</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Go to the CGPA Calculator to add your first semester and subjects.
          </p>
        </div>
      )}
    </div>
  );
};
