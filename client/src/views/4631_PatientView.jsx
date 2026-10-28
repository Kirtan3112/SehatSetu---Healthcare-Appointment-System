import React, { useState, useEffect } from 'react';
import { api } from '../services/4631_api';
import BookingModal from '../components/4631_BookingModal';
import RescheduleModal from '../components/4631_RescheduleModal';
import { 
  Search, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Star, 
  Award, 
  CalendarSync, 
  XCircle, 
  Stethoscope, 
  CheckCircle2, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function PatientView({ currentUser }) {
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'appointments'
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Booking & Rescheduling states
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [selectedApptForReschedule, setSelectedApptForReschedule] = useState(null);

  // Appointments
  const [myAppointments, setMyAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchDepartments();
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [selectedDept]);

  useEffect(() => {
    if (activeTab === 'appointments') {
      fetchMyAppointments();
    }
  }, [activeTab, statusFilter]);

  const fetchDepartments = async () => {
    try {
      const res = await api.getDepartments();
      setDepartments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const params = {};
      if (selectedDept) params.departmentId = selectedDept;
      if (searchQuery) params.search = searchQuery;

      const res = await api.searchDoctors(params);
      setDoctors(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchMyAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const res = await api.getMyAppointments(statusFilter || undefined);
      setMyAppointments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleCancelAppointment = async (apptId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment? Your time slot will be immediately released back to the clinical pool.')) {
      return;
    }

    try {
      await api.cancelAppointment(apptId);
      setActionMessage('Appointment cancelled successfully and slot released.');
      fetchMyAppointments();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert('Failed to cancel appointment: ' + err.message);
    }
  };

  return (
    <div>
      {/* 21st.dev Segmented Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
        <button
          className={`btn ${activeTab === 'browse' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('browse')}
        >
          <Search size={16} />
          Find Doctors & Book
        </button>
        <button
          className={`btn ${activeTab === 'appointments' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('appointments')}
        >
          <Calendar size={16} />
          My Appointments ({myAppointments.length})
        </button>
      </div>

      {actionMessage && (
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
          <span>{actionMessage}</span>
        </div>
      )}

      {/* TAB 1: BROWSE DOCTORS */}
      {activeTab === 'browse' && (
        <div>
          {/* 21st.dev Command Palette / Search Bar */}
          <div className="search-card" style={{ marginBottom: '24px' }}>
            <div className="search-input-group">
              <Search size={18} color="var(--primary-400)" />
              <input
                type="text"
                className="search-input"
                placeholder="Search specialists by name, specialty, bio or clinical keyword..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchDoctors()}
              />
              <span className="kbd-badge">↵ Enter</span>
            </div>
            <button className="btn btn-shimmer" onClick={fetchDoctors}>
              Search Doctors
            </button>
          </div>

          {/* Department Filter Pills */}
          <div className="dept-pills-row">
            <button
              className={`dept-pill ${selectedDept === '' ? 'active' : ''}`}
              onClick={() => setSelectedDept('')}
            >
              <Layers size={14} />
              All Specialties
            </button>
            {departments.map(dept => (
              <button
                key={dept._id}
                className={`dept-pill ${selectedDept === dept._id ? 'active' : ''}`}
                onClick={() => setSelectedDept(dept._id)}
              >
                <Stethoscope size={14} />
                {dept.name}
              </button>
            ))}
          </div>

          {/* Doctors Grid (21st.dev Bento Style) */}
          {loadingDoctors ? (
            <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>
              <div style={{ animation: 'pulse-glow 1.5s infinite', display: 'inline-block', marginBottom: '12px' }}>
                <Stethoscope size={32} color="var(--primary-400)" />
              </div>
              <p>Discovering verified healthcare practitioners...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '64px 24px', 
              background: 'var(--bg-surface)', 
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🔍</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>No Specialists Found</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 16px' }}>
                Try adjusting your search criteria or choosing another specialty category.
              </p>
              <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedDept(''); setSearchQuery(''); }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="doctor-grid">
              {doctors.map(doctor => (
                <div key={doctor._id} className="doctor-card">
                  <div className="doctor-card-header">
                    <div className="doctor-avatar-circle">
                      {doctor.userId?.name ? doctor.userId.name.replace('Dr. ', '').charAt(0) : 'D'}
                      <span className="online-dot" title="Available for appointments"></span>
                    </div>
                    <div className="doctor-header-info">
                      <div className="doctor-title-row">
                        <span className="doctor-name">{doctor.userId?.name}</span>
                        <span className="doctor-verified-badge" title="Administrator Verified">
                          <ShieldCheck size={13} />
                          Verified
                        </span>
                      </div>
                      <div className="doctor-specialty">
                        {doctor.specializationId?.name || doctor.departmentId?.name || 'Specialist'}
                      </div>
                      <div className="doctor-qual">
                        <Award size={12} style={{ verticalAlign: 'middle', marginRight: '4px', color: 'var(--text-muted)' }} />
                        {doctor.qualification} · {doctor.experience} yrs exp
                      </div>
                    </div>
                  </div>

                  <p className="doctor-bio">
                    {doctor.bio || 'Compassionate healthcare professional dedicated to delivering comprehensive patient-centered clinical care.'}
                  </p>

                  <div className="doctor-meta-row">
                    <div className="doctor-fee-box">
                      <span className="fee-label">Consultation</span>
                      <span className="fee-amount">₹{doctor.fee || 500}</span>
                    </div>
                    <button
                      className="btn btn-shimmer btn-sm"
                      onClick={() => setSelectedDoctorForBooking(doctor)}
                    >
                      <Calendar size={14} />
                      Book Visit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY APPOINTMENTS */}
      {activeTab === 'appointments' && (
        <div>
          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {['', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'].map(st => (
              <button
                key={st}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter(st)}
              >
                {st === '' ? 'All Appointments' : st}
              </button>
            ))}
          </div>

          {loadingAppointments ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              Loading appointments...
            </div>
          ) : myAppointments.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '64px 24px', 
              background: 'var(--bg-surface)', 
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)'
            }}>
              <Calendar size={36} color="var(--primary-400)" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>No Appointments Found</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '18px' }}>
                You haven't booked any appointments in this status category yet.
              </p>
              <button
                className="btn btn-shimmer"
                onClick={() => setActiveTab('browse')}
              >
                Book Your First Visit
              </button>
            </div>
          ) : (
            <div className="appointment-list">
              {myAppointments.map(appt => {
                const slot = appt.slotId;
                const doc = appt.doctorId;
                const canModify = appt.status === 'CONFIRMED' || appt.status === 'PENDING';

                return (
                  <div key={appt._id} className="appointment-card">
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div className="doctor-avatar-circle" style={{ width: '48px', height: '48px', fontSize: '1.1rem' }}>
                        <Stethoscope size={22} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                            {doc?.userId?.name || 'Doctor'}
                          </span>
                          <span className={`status-badge status-${appt.status}`}>
                            <span className="status-dot"></span>
                            {appt.status}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                          {doc?.specializationId?.name || doc?.departmentId?.name} · Reason: <span style={{ color: 'var(--text-main)' }}>{appt.reason}</span>
                        </p>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-400)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={13} />
                          {slot?.date ? new Date(slot.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBD'}
                          <span style={{ color: 'var(--text-light)' }}>•</span>
                          <Clock size={13} />
                          {slot?.startTime || 'Time TBD'}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {canModify && (
                        <>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setSelectedApptForReschedule(appt)}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            <CalendarSync size={14} />
                            Reschedule
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancelAppointment(appt._id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            <XCircle size={14} />
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {selectedDoctorForBooking && (
        <BookingModal
          doctor={selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
          onBookingSuccess={(newAppt) => {
            setActionMessage('Appointment confirmed! Notification has been delivered to your inbox.');
            fetchMyAppointments();
            setActiveTab('appointments');
            setTimeout(() => setActionMessage(''), 5000);
          }}
        />
      )}

      {/* Reschedule Modal */}
      {selectedApptForReschedule && (
        <RescheduleModal
          appointment={selectedApptForReschedule}
          onClose={() => setSelectedApptForReschedule(null)}
          onSuccess={(updated) => {
            setActionMessage('Appointment successfully rescheduled! Previous slot was released and new slot claimed.');
            fetchMyAppointments();
            setTimeout(() => setActionMessage(''), 5000);
          }}
        />
      )}
    </div>
  );
}
