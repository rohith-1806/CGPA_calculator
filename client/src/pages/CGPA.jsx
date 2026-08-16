import React, { useState, useEffect } from 'react';
import { getAcademicRecord } from '../services/academicApi';
import { CircularProgress } from '../components/CircularProgress';
import { Award, TrendingUp, CheckCircle, AlertTriangle, Layers, BookCheck } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const CGPA = () => {
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
        console.error('Failed to fetch CGPA overview:', err);
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
          <p style={{ color: 'var(--text-secondary)' }}>Loading CGPA Overview...</p>
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

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Title Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px' }}>
          CGPA Overview
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Comprehensive academic performance metrics, progress rings & classification award.
        </p>
      </div>

      {/* Main Circular Progress & Core Badges Panel */}
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
            label="Cumulative CGPA"
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

        {/* Class Awarded & Backlogs Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
          {/* Class Award Card */}
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
            <Award size={32} color="var(--accent-primary)" />
            <div>
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Class Awarded
              </span>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>
                {classAwarded}
              </div>
            </div>
          </div>

          {/* Backlogs Card */}
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
              <CheckCircle size={32} color="var(--accent-emerald)" />
            ) : (
              <AlertTriangle size={32} color="var(--accent-rose)" />
            )}
            <div>
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Total Active Backlogs
              </span>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '800',
                  color: backlogsCount === 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                  marginTop: '2px'
                }}
              >
                {backlogsCount} {backlogsCount === 0 ? '(Clean Academic Record ✓)' : 'Backlog(s)'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Grid Cards */}
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
            Max Achievable CGPA
          </span>
          <div style={{ fontSize: '22px', fontWeight: '800', marginTop: '6px', color: 'var(--text-main)' }}>
            10.00
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
            Max Percentage Scale
          </span>
          <div style={{ fontSize: '22px', fontWeight: '800', marginTop: '6px', color: 'var(--text-main)' }}>
            95.00%
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
            Total Earned Credits
          </span>
          <div style={{ fontSize: '22px', fontWeight: '800', marginTop: '6px', color: 'var(--accent-primary)' }}>
            {summary?.totalCredits || 0}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
            Total Semesters
          </span>
          <div style={{ fontSize: '22px', fontWeight: '800', marginTop: '6px', color: 'var(--accent-cyan)' }}>
            {summary?.totalSemesters || 0}
          </div>
        </div>
      </div>

      {/* CGPA Progression Line Chart */}
      {lineChartData.length > 0 && (
        <div className="glass-panel animate-fade-in" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <TrendingUp size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>CGPA Progression Trend</h3>
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
    </div>
  );
};
