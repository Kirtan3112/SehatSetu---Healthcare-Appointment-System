import React, { useState, useEffect } from 'react';
import { api } from '../services/4631_api';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Stethoscope, 
  Sliders, 
  Sparkles, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Award, 
  ShieldCheck, 
  Zap, 
  Save,
  TrendingUp,
  Edit3,
  Search,
  Filter,
  BarChart3,
  Activity,
  X,
  Check,
  RefreshCw,
  Users
} from 'lucide-react';

export default function DoctorView({ currentUser, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'schedule' | 'availability' | 'settings'
  const [appointments, setAppointments] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  // Doctor Profile & Fee state
  const [doctorProfile, setDoctorProfile] = useState(currentUser.doctorProfile || null);
  const [currentFee, setCurrentFee] = useState(currentUser.doctorProfile?.fee || 500);
  const [isEditingFee, setIsEditingFee] = useState(false);
  const [newFeeInput, setNewFeeInput] = useState(currentUser.doctorProfile?.fee || 500);
  const [savingFee, setSavingFee] = useState(false);

  // Profile Settings Form state
  const [editQualification, setEditQualification] = useState(currentUser.doctorProfile?.qualification || '');
  const [editExperience, setEditExperience] = useState(currentUser.doctorProfile?.experience || 5);
  const [editBio, setEditBio] = useState(currentUser.doctorProfile?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Availability state
  const doctorId = doctorProfile?._id;

  const [weeklySchedule, setWeeklySchedule] = useState([
    { dayOfWeek: 1, dayName: 'Monday', enabled: true, startTime: '09:00', endTime: '17:00', slotDuration: 30 },
    { dayOfWeek: 2, dayName: 'Tuesday', enabled: true, startTime: '09:00', endTime: '17:00', slotDuration: 30 },
    { dayOfWeek: 3, dayName: 'Wednesday', enabled: true, startTime: '09:00', endTime: '17:00', slotDuration: 30 },
    { dayOfWeek: 4, dayName: 'Thursday', enabled: true, startTime: '09:00', endTime: '17:00', slotDuration: 30 },
    { dayOfWeek: 5, dayName: 'Friday', enabled: true, startTime: '09:00', endTime: '17:00', slotDuration: 30 }
  ]);
  const [generatingSlots, setGeneratingSlots] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Keep state synced with currentUser updates
  useEffect(() => {
    if (currentUser?.doctorProfile) {
      setDoctorProfile(currentUser.doctorProfile);
      setCurrentFee(currentUser.doctorProfile.fee || 500);
      setNewFeeInput(currentUser.doctorProfile.fee || 500);
      setEditQualification(currentUser.doctorProfile.qualification || '');
      setEditExperience(currentUser.doctorProfile.experience || 5);
      setEditBio(currentUser.doctorProfile.bio || '');
    }
  }, [currentUser]);

  // Initial and reactive fetch of appointments
  useEffect(() => {
    fetchSchedule();
  }, [statusFilter]);

  const fetchSchedule = async () => {
    try {
      setLoadingSchedule(true);
      const params = {};
      if (statusFilter && statusFilter.trim()) {
        params.status = statusFilter.trim();
      }
      const res = await api.getDoctorSchedule(params);
      setAppointments(res.data || []);
    } catch (err) {
      console.error('Error fetching schedule:', err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Update status of an appointment
  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      await api.updateAppointmentStatus(apptId, newStatus);
      setActionMsg(`Appointment status updated to ${newStatus}.`);
      fetchSchedule();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  // Quick Fee Update Handler
  const handleSaveFee = async (feeToSave) => {
    const feeVal = Number(feeToSave !== undefined ? feeToSave : newFeeInput);
    if (isNaN(feeVal) || feeVal < 0) {
      alert('Please enter a valid consultation fee.');
      return;
    }

    try {
      setSavingFee(true);

      // Call API to update doctor fee
      if (doctorId) {
        await api.updateDoctorProfile(doctorId, { fee: feeVal });
      }
      const profileRes = await api.updateProfile({ fee: feeVal });

      // Update local state
      setCurrentFee(feeVal);
      setNewFeeInput(feeVal);
      setIsEditingFee(false);

      if (profileRes?.data?.user) {
        setDoctorProfile(profileRes.data.user.doctorProfile);
        if (onUserUpdate) {
          onUserUpdate(profileRes.data.user);
        }
      }

      setActionMsg(`Consultation fee successfully updated to ₹${feeVal}.`);
      setTimeout(() => setActionMsg(''), 4500);
    } catch (err) {
      alert('Failed to update consultation fee: ' + err.message);
    } finally {
      setSavingFee(false);
    }
  };

  // Full Profile Update Handler
  const handleSaveFullProfile = async (e) => {
    e.preventDefault();
    const feeVal = Number(newFeeInput);
    const expVal = Number(editExperience);

    try {
      setSavingProfile(true);
      const payload = {
        fee: feeVal,
        qualification: editQualification.trim(),
        experience: expVal,
        bio: editBio.trim()
      };

      if (doctorId) {
        await api.updateDoctorProfile(doctorId, payload);
      }
      const profileRes = await api.updateProfile(payload);

      setCurrentFee(feeVal);
      if (profileRes?.data?.user) {
        setDoctorProfile(profileRes.data.user.doctorProfile);
        if (onUserUpdate) {
          onUserUpdate(profileRes.data.user);
        }
      }

      setActionMsg('Doctor profile and consultation fee updated successfully.');
      setTimeout(() => setActionMsg(''), 4500);
    } catch (err) {
      alert('Failed to save profile: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // Weekly availability saving
  const handleSaveAvailability = async () => {
    if (!doctorId) return;
    try {
      setSavingSchedule(true);
      const schedulePayload = weeklySchedule
        .filter(s => s.enabled)
        .map(s => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          slotDuration: Number(s.slotDuration)
        }));

      await api.setWeeklyAvailability(doctorId, schedulePayload);
      setActionMsg('Weekly schedule saved successfully.');
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert('Failed to save availability: ' + err.message);
    } finally {
      setSavingSchedule(false);
    }
  };

  // 14-Day slot generator
  const handleGenerateSlots = async () => {
    if (!doctorId) return;
    try {
      setGeneratingSlots(true);
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const res = await api.generateSlots(doctorId, startDate, endDate);
      setActionMsg(`Discrete slots generated: ${res.data.created} newly created (${res.data.existing} existing preserved). Total available.`);
      setTimeout(() => setActionMsg(''), 5000);
    } catch (err) {
      alert('Failed to generate slots: ' + err.message);
    } finally {
      setGeneratingSlots(false);
    }
  };

  // Analytics & Metric Calculations
  const totalAppointments = appointments.length;
  const confirmedCount = appointments.filter(a => a.status === 'CONFIRMED').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
  const pendingCount = appointments.filter(a => a.status === 'PENDING').length;
  const cancelledCount = appointments.filter(a => a.status === 'CANCELLED').length;
  const noShowCount = appointments.filter(a => a.status === 'NO_SHOW').length;

  // Realized and Projected Financials in Indian Rupees (₹)
  const realizedRevenue = completedCount * (currentFee || 0);
  const projectedRevenue = (completedCount + confirmedCount) * (currentFee || 0);
  const completionRate = totalAppointments > 0 ? Math.round((completedCount / totalAppointments) * 100) : 0;

  // Unique Patients Count
  const uniquePatientIds = new Set(appointments.map(a => a.patientId?._id || a.patientId).filter(Boolean));
  const uniquePatientsCount = uniquePatientIds.size;

  // Today's Date in local ISO YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => {
    if (!a.slotId?.date) return false;
    return new Date(a.slotId.date).toISOString().split('T')[0] === todayStr;
  });

  // Filtered Appointments (Search Query + Status Filter)
  const filteredAppointments = appointments.filter(appt => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const patientName = appt.patientId?.name?.toLowerCase() || '';
    const patientEmail = appt.patientId?.email?.toLowerCase() || '';
    const patientPhone = appt.patientId?.phone?.toLowerCase() || '';
    const reason = appt.reason?.toLowerCase() || '';
    const notes = appt.notes?.toLowerCase() || '';
    return patientName.includes(q) || patientEmail.includes(q) || patientPhone.includes(q) || reason.includes(q) || notes.includes(q);
  });

  return (
    <div>
      {/* 1. Doctor Credential & Verification Status Bar */}
      {doctorProfile && !doctorProfile.approved ? (
        <div className="pending-verification-banner">
          <div className="pending-banner-icon">
            <Clock size={28} color="var(--amber-400)" />
          </div>
          <div>
            <div className="pending-banner-title">Doctor Credentials Verification Pending</div>
            <div className="pending-banner-text">
              Your profile is currently awaiting review by a system administrator.
              While pending, your profile is hidden from public patient searches. You can still set up your weekly working hours, discrete appointment slots, and consultation fee below.
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="doctor-avatar-circle" style={{ width: '52px', height: '52px', fontSize: '1.25rem' }}>
              <Stethoscope size={26} />
              <span className="online-dot"></span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>{currentUser.name}</span>
                <span className="status-badge status-CONFIRMED">
                  <ShieldCheck size={13} />
                  Verified Specialist
                </span>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>
                {doctorProfile?.departmentId?.name || 'Department'} · {doctorProfile?.specializationId?.name || doctorProfile?.qualification} · {doctorProfile?.experience || 0} yrs experience
              </p>
            </div>
          </div>

          {/* Interactive Fee Pill with 1-Click Edit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                  Consultation Fee (₹)
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald-400)', fontFamily: 'Outfit, sans-serif' }}>
                  ₹{currentFee}
                </div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setNewFeeInput(currentFee);
                  setIsEditingFee(!isEditingFee);
                }}
                title="Update your consultation fee in ₹"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
              >
                <Edit3 size={14} />
                <span>{isEditingFee ? 'Cancel' : 'Edit Fee'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Fee Editor Drawer / Modal */}
      {isEditingFee && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '2px solid var(--primary-500)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-md)',
          animation: 'slideUp 200ms ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-400)' }}>₹</span>
              <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Update Consultation Fee (₹ INR)</h4>
            </div>
            <button
              onClick={() => setIsEditingFee(false)}
              className="btn btn-sm btn-secondary"
              style={{ padding: '4px 8px' }}
            >
              <X size={16} />
            </button>
          </div>

          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Set the official fee charged per patient consultation visit. This fee is immediately displayed to booking patients in searches and appointment receipts.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>Quick Presets:</span>
            {[500, 800, 1000, 1200, 1500, 2000].map(amt => (
              <button
                key={amt}
                type="button"
                className={`fee-chip-btn ${Number(newFeeInput) === amt ? 'active' : ''}`}
                onClick={() => setNewFeeInput(amt)}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontWeight: 800,
                color: 'var(--text-muted)',
                fontSize: '1rem'
              }}>
                ₹
              </span>
              <input
                type="number"
                min="0"
                max="100000"
                step="50"
                value={newFeeInput}
                onChange={e => setNewFeeInput(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '30px', fontWeight: 700, fontSize: '1.05rem' }}
                placeholder="Enter custom fee"
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={() => handleSaveFee(newFeeInput)}
              disabled={savingFee}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={16} />
              {savingFee ? 'Saving Fee...' : `Save Fee as ₹${newFeeInput || 0}`}
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setIsEditingFee(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Global Success / Action Notification Message */}
      {actionMsg && (
        <div style={{
          background: 'var(--status-confirmed-bg)',
          color: 'var(--status-confirmed-text)',
          border: '1px solid var(--status-confirmed-border)',
          padding: '14px 20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          fontWeight: 600,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <CheckCircle2 size={18} />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* 2. Main Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <BarChart3 size={16} />
          Dashboard & Analysis
        </button>
        <button
          className={`btn ${activeTab === 'schedule' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('schedule')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Calendar size={16} />
          All Appointments ({appointments.length})
        </button>
        <button
          className={`btn ${activeTab === 'availability' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('availability')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Sliders size={16} />
          Weekly Schedule & Slots
        </button>
        <button
          className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('settings')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <User size={16} />
          Profile & Fee Settings
        </button>
      </div>

      {/* =========================================================================
          TAB 1: DASHBOARD & CLINICAL ANALYSIS (Primary Command Center)
          ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div>
          {/* 6-Card Bento Metrics Grid */}
          <div className="kpi-grid">
            {/* Total Appointments */}
            <div className="kpi-card">
              <div className="kpi-icon">
                <Calendar size={22} />
              </div>
              <div>
                <div className="kpi-value">{totalAppointments}</div>
                <div className="kpi-label">Total Appointments</div>
              </div>
            </div>

            {/* Realized Revenue in ₹ */}
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--emerald-400)', borderColor: 'rgba(52, 211, 153, 0.3)' }}>
                <TrendingUp size={22} />
              </div>
              <div>
                <div className="kpi-value" style={{ color: 'var(--emerald-400)' }}>₹{realizedRevenue.toLocaleString()}</div>
                <div className="kpi-label">Realized Revenue ({completedCount} visits)</div>
              </div>
            </div>

            {/* Projected Revenue in ₹ */}
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(56, 189, 248, 0.12)', color: 'var(--primary-400)', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                <Sparkles size={22} />
              </div>
              <div>
                <div className="kpi-value" style={{ color: 'var(--primary-400)' }}>₹{projectedRevenue.toLocaleString()}</div>
                <div className="kpi-label">Projected Pipeline (₹{currentFee}/visit)</div>
              </div>
            </div>

            {/* Confirmed Visits */}
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(14, 165, 233, 0.12)', color: 'var(--primary-400)', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <div className="kpi-value">{confirmedCount}</div>
                <div className="kpi-label">Confirmed Upcoming</div>
              </div>
            </div>

            {/* Completed Consultations */}
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-400)', borderColor: 'rgba(129, 140, 248, 0.3)' }}>
                <Award size={22} />
              </div>
              <div>
                <div className="kpi-value">{completedCount}</div>
                <div className="kpi-label">Completed Consults</div>
              </div>
            </div>

            {/* Unique Patients Treated */}
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(236, 72, 153, 0.12)', color: '#f472b6', borderColor: 'rgba(244, 114, 182, 0.3)' }}>
                <Users size={22} />
              </div>
              <div>
                <div className="kpi-value">{uniquePatientsCount}</div>
                <div className="kpi-label">Unique Patients Treated</div>
              </div>
            </div>
          </div>

          {/* Visual Clinical Analysis Panel: Distribution & Performance */}
          <div className="analytics-card">
            <div className="analytics-header">
              <div>
                <div className="analytics-title">
                  <BarChart3 size={20} color="var(--primary-400)" />
                  Appointments Clinical Distribution & Completion Analysis
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Visual breakdown of patient booking statuses and clinical throughput.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>Completion Rate:</span>
                <span className="status-badge status-CONFIRMED" style={{ fontSize: '0.9rem', padding: '4px 10px' }}>
                  {completionRate}% Successful
                </span>
              </div>
            </div>

            {/* Multi-Segment Proportion Bar */}
            <div className="analytics-bar-wrapper">
              <div 
                className="analytics-bar-segment" 
                style={{ width: `${totalAppointments ? (completedCount / totalAppointments) * 100 : 0}%`, background: 'var(--emerald-400)' }} 
                title={`Completed: ${completedCount}`}
              />
              <div 
                className="analytics-bar-segment" 
                style={{ width: `${totalAppointments ? (confirmedCount / totalAppointments) * 100 : 0}%`, background: 'var(--primary-400)' }} 
                title={`Confirmed: ${confirmedCount}`}
              />
              <div 
                className="analytics-bar-segment" 
                style={{ width: `${totalAppointments ? (pendingCount / totalAppointments) * 100 : 0}%`, background: 'var(--amber-400)' }} 
                title={`Pending: ${pendingCount}`}
              />
              <div 
                className="analytics-bar-segment" 
                style={{ width: `${totalAppointments ? (cancelledCount / totalAppointments) * 100 : 0}%`, background: 'var(--rose-400)' }} 
                title={`Cancelled: ${cancelledCount}`}
              />
              <div 
                className="analytics-bar-segment" 
                style={{ width: `${totalAppointments ? (noShowCount / totalAppointments) * 100 : 0}%`, background: '#94a3b8' }} 
                title={`No Show: ${noShowCount}`}
              />
            </div>

            {/* Legend Grid */}
            <div className="analytics-legend-grid">
              <div className="analytics-legend-item">
                <span className="analytics-legend-dot" style={{ background: 'var(--emerald-400)' }}></span>
                <span>Completed: <strong>{completedCount}</strong> ({totalAppointments ? Math.round((completedCount/totalAppointments)*100) : 0}%)</span>
              </div>
              <div className="analytics-legend-item">
                <span className="analytics-legend-dot" style={{ background: 'var(--primary-400)' }}></span>
                <span>Confirmed: <strong>{confirmedCount}</strong> ({totalAppointments ? Math.round((confirmedCount/totalAppointments)*100) : 0}%)</span>
              </div>
              <div className="analytics-legend-item">
                <span className="analytics-legend-dot" style={{ background: 'var(--amber-400)' }}></span>
                <span>Pending: <strong>{pendingCount}</strong> ({totalAppointments ? Math.round((pendingCount/totalAppointments)*100) : 0}%)</span>
              </div>
              <div className="analytics-legend-item">
                <span className="analytics-legend-dot" style={{ background: 'var(--rose-400)' }}></span>
                <span>Cancelled: <strong>{cancelledCount}</strong> ({totalAppointments ? Math.round((cancelledCount/totalAppointments)*100) : 0}%)</span>
              </div>
              <div className="analytics-legend-item">
                <span className="analytics-legend-dot" style={{ background: '#94a3b8' }}></span>
                <span>No Show: <strong>{noShowCount}</strong> ({totalAppointments ? Math.round((noShowCount/totalAppointments)*100) : 0}%)</span>
              </div>
            </div>
          </div>

          {/* Today's Consultations Alert Card (If any today) */}
          {todayAppointments.length > 0 && (
            <div style={{
              background: 'rgba(14, 165, 233, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px 24px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} color="var(--primary-400)" />
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                    Today's Consultations ({todayAppointments.length})
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {todayAppointments.map(appt => (
                  <div 
                    key={appt._id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                        {appt.patientId?.name || 'Patient'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--primary-400)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        <Clock size={12} />
                        {appt.slotId?.startTime} · Reason: {appt.reason}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select
                        className="filter-select"
                        value={appt.status}
                        onChange={e => handleUpdateStatus(appt._id, e.target.value)}
                        style={{ padding: '4px 10px', fontSize: '0.82rem' }}
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="NO_SHOW">NO SHOW</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Appointments Section on Dashboard */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '22px 24px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.18rem', margin: 0, fontWeight: 800 }}>Appointments & Schedule</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Manage patient visits and update status directly from your dashboard.
                </p>
              </div>

              {/* Search & Refresh */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '220px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search patient / reason..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '32px', fontSize: '0.84rem', paddingRight: '8px' }}
                  />
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={fetchSchedule}
                  title="Refresh schedule"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={13} className={loadingSchedule ? 'spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Quick Status Filters */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
              {['', 'CONFIRMED', 'COMPLETED', 'PENDING', 'CANCELLED', 'NO_SHOW'].map(st => (
                <button
                  key={st}
                  className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setStatusFilter(st)}
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  {st === '' ? `All (${appointments.length})` : `${st} (${appointments.filter(a => a.status === st).length})`}
                </button>
              ))}
            </div>

            {/* Appointments List Render */}
            {loadingSchedule ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                Loading appointments...
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 20px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-medium)'
              }}>
                <Calendar size={32} color="var(--primary-400)" style={{ marginBottom: '10px' }} />
                <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem' }}>No Appointments Found</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {searchQuery ? `No appointments matching "${searchQuery}"` : 'No appointments booked under the current filter.'}
                </p>
              </div>
            ) : (
              <div className="appointment-list">
                {filteredAppointments.slice(0, 8).map(appt => {
                  const patient = appt.patientId;
                  const slot = appt.slotId;
                  const isToday = slot?.date && new Date(slot.date).toISOString().split('T')[0] === todayStr;

                  return (
                    <div 
                      key={appt._id} 
                      className="appointment-card"
                      style={{
                        borderColor: isToday ? 'var(--primary-400)' : 'var(--border-light)',
                        background: isToday ? 'rgba(14, 165, 233, 0.04)' : 'var(--bg-surface)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                            {patient?.name || 'Patient'}
                          </span>
                          <span className={`status-badge status-${appt.status}`}>
                            <span className="status-dot"></span>
                            {appt.status}
                          </span>
                          {isToday && (
                            <span className="status-badge" style={{ background: 'rgba(14, 165, 233, 0.2)', color: 'var(--primary-400)', fontWeight: 800 }}>
                              TODAY
                            </span>
                          )}
                        </div>

                        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={13} /> {patient?.email}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={13} /> {patient?.phone || 'No phone'}
                          </span>
                        </p>

                        <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '6px' }}>
                          Reason: <strong>{appt.reason}</strong> {appt.notes && `· Notes: ${appt.notes}`}
                        </p>

                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-400)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={13} />
                          {slot?.date ? new Date(slot.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBD'}
                          <span style={{ color: 'var(--text-light)' }}>•</span>
                          <Clock size={13} />
                          {slot?.startTime || 'Time TBD'}
                          <span style={{ color: 'var(--text-light)' }}>•</span>
                          <span style={{ color: 'var(--emerald-400)', fontWeight: 700 }}>Fee: ₹{currentFee}</span>
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</label>
                        <select
                          className="filter-select"
                          value={appt.status}
                          onChange={e => handleUpdateStatus(appt._id, e.target.value)}
                        >
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="NO_SHOW">NO SHOW</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {filteredAppointments.length > 8 && (
              <div style={{ textAlign: 'center', marginTop: '18px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setActiveTab('schedule')}
                >
                  View All {filteredAppointments.length} Appointments in Full Schedule ➔
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: FULL PATIENT SCHEDULE (Detailed filterable list)
          ========================================================================= */}
      {activeTab === 'schedule' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map(st => (
                <button
                  key={st}
                  className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st === '' ? 'All Appointments' : st}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: '250px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search patient, email, reason..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {loadingSchedule ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              Loading appointments schedule...
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '64px 24px', 
              background: 'var(--bg-surface)', 
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)'
            }}>
              <Calendar size={36} color="var(--primary-400)" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>No Appointments in Schedule</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                No patient bookings found matching the selected filter or search query.
              </p>
            </div>
          ) : (
            <div className="appointment-list">
              {filteredAppointments.map(appt => {
                const patient = appt.patientId;
                const slot = appt.slotId;

                return (
                  <div key={appt._id} className="appointment-card">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                          {patient?.name || 'Patient'}
                        </span>
                        <span className={`status-badge status-${appt.status}`}>
                          <span className="status-dot"></span>
                          {appt.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={13} /> {patient?.email}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={13} /> {patient?.phone || 'No phone'}
                        </span>
                      </p>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '6px' }}>
                        Reason: <strong>{appt.reason}</strong> {appt.notes && `· Notes: ${appt.notes}`}
                      </p>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-400)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={13} />
                        {slot?.date ? new Date(slot.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBD'}
                        <span style={{ color: 'var(--text-light)' }}>•</span>
                        <Clock size={13} />
                        {slot?.startTime || 'Time TBD'}
                        <span style={{ color: 'var(--text-light)' }}>•</span>
                        <span style={{ color: 'var(--emerald-400)' }}>Fee: ₹{currentFee}</span>
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</label>
                      <select
                        className="filter-select"
                        value={appt.status}
                        onChange={e => handleUpdateStatus(appt._id, e.target.value)}
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="NO_SHOW">NO SHOW</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: WEEKLY AVAILABILITY & 14-DAY SLOT GENERATOR
          ========================================================================= */}
      {activeTab === 'availability' && (
        <div style={{ 
          background: 'var(--bg-surface)', 
          padding: '28px', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Weekly Working Schedule</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Configure recurring clinical hours and trigger the discrete slot generator algorithm.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-secondary"
                onClick={handleSaveAvailability}
                disabled={savingSchedule}
              >
                <Save size={15} />
                {savingSchedule ? 'Saving...' : 'Save Schedule Rules'}
              </button>
              <button
                className="btn btn-shimmer"
                onClick={handleGenerateSlots}
                disabled={generatingSlots}
              >
                <Zap size={15} />
                {generatingSlots ? 'Generating...' : 'Generate Slots (Next 14 Days)'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {weeklySchedule.map((day, idx) => (
              <div
                key={day.dayOfWeek}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '14px 18px',
                  background: day.enabled ? 'var(--bg-elevated)' : 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  transition: 'all var(--transition-fast)',
                  flexWrap: 'wrap'
                }}
              >
                <input
                  type="checkbox"
                  checked={day.enabled}
                  onChange={e => {
                    const updated = [...weeklySchedule];
                    updated[idx].enabled = e.target.checked;
                    setWeeklySchedule(updated);
                  }}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary-500)' }}
                />
                <span style={{ width: '110px', fontWeight: 700, color: day.enabled ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  {day.dayName}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Start:</label>
                  <input
                    type="time"
                    value={day.startTime}
                    disabled={!day.enabled}
                    onChange={e => {
                      const updated = [...weeklySchedule];
                      updated[idx].startTime = e.target.value;
                      setWeeklySchedule(updated);
                    }}
                    className="form-input"
                    style={{ padding: '6px 10px', width: 'auto' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>End:</label>
                  <input
                    type="time"
                    value={day.endTime}
                    disabled={!day.enabled}
                    onChange={e => {
                      const updated = [...weeklySchedule];
                      updated[idx].endTime = e.target.value;
                      setWeeklySchedule(updated);
                    }}
                    className="form-input"
                    style={{ padding: '6px 10px', width: 'auto' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Duration:</label>
                  <select
                    value={day.slotDuration}
                    disabled={!day.enabled}
                    onChange={e => {
                      const updated = [...weeklySchedule];
                      updated[idx].slotDuration = Number(e.target.value);
                      setWeeklySchedule(updated);
                    }}
                    className="filter-select"
                    style={{ padding: '6px 10px' }}
                  >
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: PROFILE & FEE (₹) SETTINGS
          ========================================================================= */}
      {activeTab === 'settings' && (
        <div style={{ 
          background: 'var(--bg-surface)', 
          padding: '28px', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          maxWidth: '750px'
        }}>
          <div style={{ marginBottom: '22px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Clinical Profile & Consultation Fee</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Manage your consultation fee in Indian Rupees (₹), medical qualification, experience, and patient biography.
            </p>
          </div>

          <form onSubmit={handleSaveFullProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Consultation Fee Section */}
            <div>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Consultation Fee (₹ INR) *
              </label>
              <div style={{ position: 'relative', maxWidth: '300px' }}>
                <span style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontWeight: 800,
                  color: 'var(--emerald-400)',
                  fontSize: '1.1rem'
                }}>
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  max="100000"
                  step="50"
                  required
                  value={newFeeInput}
                  onChange={e => setNewFeeInput(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '32px', fontWeight: 800, fontSize: '1.15rem' }}
                />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '4px' }}>
                Quick options: 
                <span style={{ marginLeft: '6px' }}>
                  {[500, 800, 1000, 1500, 2000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setNewFeeInput(amt)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-400)',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        marginRight: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </span>
              </p>
            </div>

            {/* Medical Qualification */}
            <div>
              <label className="form-label" style={{ fontWeight: 700 }}>Medical Qualifications</label>
              <input
                type="text"
                value={editQualification}
                onChange={e => setEditQualification(e.target.value)}
                placeholder="e.g. MD, FACC, Harvard Medical School"
                className="form-input"
              />
            </div>

            {/* Years of Experience */}
            <div>
              <label className="form-label" style={{ fontWeight: 700 }}>Years of Clinical Experience</label>
              <input
                type="number"
                min="0"
                max="70"
                value={editExperience}
                onChange={e => setEditExperience(e.target.value)}
                className="form-input"
                style={{ maxWidth: '200px' }}
              />
            </div>

            {/* Clinical Bio */}
            <div>
              <label className="form-label" style={{ fontWeight: 700 }}>Professional Biography</label>
              <textarea
                rows={4}
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                placeholder="Share your clinical focus, treatments, and approach to patient care..."
                className="form-input"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingProfile}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Save size={16} />
                {savingProfile ? 'Saving Changes...' : 'Save Profile & Fee Changes'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setNewFeeInput(currentFee);
                  setEditQualification(doctorProfile?.qualification || '');
                  setEditExperience(doctorProfile?.experience || 5);
                  setEditBio(doctorProfile?.bio || '');
                }}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
