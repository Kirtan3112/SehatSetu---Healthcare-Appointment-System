import React, { useState, useEffect } from 'react';
import { api } from '../services/4631_api';
import { Calendar, Clock, X, AlertCircle, CheckCircle2, FileText, DollarSign } from 'lucide-react';

export default function BookingModal({ doctor, onClose, onBookingSuccess }) {
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('General Consultation');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchSlots();
  }, [doctor]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.getSlots({ doctorId: doctor._id, onlyAvailable: true });
      const fetchedSlots = res.data || [];
      setSlots(fetchedSlots);

      // Extract unique dates
      const dates = Array.from(new Set(
        fetchedSlots.map(s => new Date(s.date).toISOString().split('T')[0])
      )).sort();

      setAvailableDates(dates);
      if (dates.length > 0) {
        setSelectedDate(dates[0]);
      }
    } catch (err) {
      setErrorMsg('Failed to load doctor slots: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentDaySlots = slots.filter(
    s => new Date(s.date).toISOString().split('T')[0] === selectedDate
  );

  const handleBook = async () => {
    if (!selectedSlot) {
      setErrorMsg('Please select a time slot.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await api.bookAppointment(selectedSlot._id, reason, notes);
      onBookingSuccess(res.data);
      onClose();
    } catch (err) {
      if (err.status === 409) {
        setErrorMsg('Booking Conflict: This slot was just booked by another user. Please choose another time.');
        fetchSlots();
      } else {
        setErrorMsg(err.message || 'Booking failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 800 }}>Book Appointment</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              with {doctor.userId?.name} · {doctor.specializationId?.name || doctor.qualification}
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
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading available schedule slots...
            </div>
          ) : availableDates.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <Clock size={32} color="var(--amber-400)" style={{ marginBottom: '8px' }} />
              <p style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>No Available Slots</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                This specialist currently has no open slots. Please check back later or select another provider.
              </p>
            </div>
          ) : (
            <>
              {/* Step 1: Pick Date */}
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-400)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Calendar size={13} />
                1. Select Clinical Date
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

              {/* Step 2: Pick Time Slot */}
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-400)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Clock size={13} />
                2. Select Discrete Time Slot
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

              {/* Step 3: Reason & Notes */}
              <div style={{ marginTop: '20px' }}>
                <label className="form-label">
                  <FileText size={13} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                  Reason for Visit
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Routine checkup, chronic illness review"
                  className="form-input"
                  style={{ marginBottom: '14px' }}
                />

                <label className="form-label">
                  Clinical Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any symptoms, medications, or relevant patient history"
                  className="form-textarea"
                />
              </div>

              {/* Consultation Fee Pill */}
              <div style={{
                marginTop: '16px',
                padding: '12px 18px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid var(--border-light)'
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Consultation Fee</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>₹{doctor.fee || 500}</span>
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
            onClick={handleBook}
            disabled={!selectedSlot || submitting}
          >
            {submitting ? 'Confirming...' : 'Confirm Appointment'}
          </button>
        </div>
      </div>
    </div>
  );
}
