import React, { useState, useEffect } from 'react';
import { api } from '../services/4631_api';
import { Calendar, Clock, X, AlertCircle, CalendarSync } from 'lucide-react';

export default function RescheduleModal({ appointment, onClose, onSuccess }) {
  const [slots, setSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const doctorId = appointment.doctorId?._id || appointment.doctorId;

  useEffect(() => {
    fetchSlots();
  }, [doctorId]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await api.getSlots({ doctorId, onlyAvailable: true });
      const fetchedSlots = res.data || [];
      setSlots(fetchedSlots);

      const dates = Array.from(new Set(
        fetchedSlots.map(s => new Date(s.date).toISOString().split('T')[0])
      )).sort();

      setAvailableDates(dates);
      if (dates.length > 0) setSelectedDate(dates[0]);
    } catch (err) {
      setErrorMsg('Failed to load slots: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentDaySlots = slots.filter(
    s => new Date(s.date).toISOString().split('T')[0] === selectedDate
  );

  const handleReschedule = async () => {
    if (!selectedSlot) return;

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await api.rescheduleAppointment(appointment._id, selectedSlot._id);
      onSuccess(res.data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Rescheduling failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 800 }}>Reschedule Appointment</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Current time: {appointment.slotId ? `${new Date(appointment.slotId.date).toISOString().split('T')[0]} at ${appointment.slotId.startTime}` : 'N/A'}
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {errorMsg && (
            <div style={{
              background: 'var(--status-cancelled-bg)',
              color: 'var(--status-cancelled-text)',
              border: '1px solid var(--status-cancelled-border)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading new slots...
            </p>
          ) : availableDates.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <Clock size={32} color="var(--amber-400)" style={{ marginBottom: '8px' }} />
              <p style={{ fontWeight: 700, color: 'var(--text-main)' }}>No Other Available Slots</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                This specialist currently has no other open slots.
              </p>
            </div>
          ) : (
            <>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-400)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Calendar size={13} />
                Select New Clinical Date
              </label>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '18px' }}>
                {availableDates.map(dateStr => (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: selectedDate === dateStr ? '1px solid var(--primary-400)' : '1px solid var(--border-light)',
                      background: selectedDate === dateStr ? 'rgba(14, 165, 233, 0.15)' : 'var(--bg-elevated)',
                      color: selectedDate === dateStr ? 'var(--primary-400)' : 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {new Date(dateStr + 'T00:00:00Z').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </button>
                ))}
              </div>

              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-400)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Clock size={13} />
                Select New Time Slot
              </label>
              <div className="slot-grid">
                {currentDaySlots.map(slot => (
                  <div
                    key={slot._id}
                    className={`slot-pill ${selectedSlot?._id === slot._id ? 'selected' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot.startTime}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className="btn btn-shimmer"
            onClick={handleReschedule}
            disabled={!selectedSlot || submitting}
          >
            <CalendarSync size={15} />
            {submitting ? 'Swapping...' : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </div>
  );
}
