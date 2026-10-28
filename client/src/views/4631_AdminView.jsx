import React, { useState, useEffect } from 'react';
import { api } from '../services/4631_api';
import { 
  BarChart3, 
  Users, 
  Stethoscope, 
  Clock, 
  Calendar, 
  Layers, 
  ScrollText, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  FolderPlus, 
  Plus, 
  UserCheck, 
  UserX,
  AlertTriangle,
  X,
  Lock,
  Mail,
  Phone,
  GraduationCap,
  Award,
  DollarSign,
  FileText,
  UserPlus
} from 'lucide-react';

export default function AdminView({ currentUser }) {
  const [activeTab, setActiveTab] = useState('metrics'); // 'metrics' | 'doctors' | 'users' | 'catalog' | 'logs'
  const [metrics, setMetrics] = useState(null);
  const [allDoctors, setAllDoctors] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [specializations, setSpecializations] = useState([]);

  // Form state for Onboarding New Doctor (Admin Only)
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [docName, setDocName] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docPassword, setDocPassword] = useState('Doctor@123');
  const [docPhone, setDocPhone] = useState('');
  const [docDeptId, setDocDeptId] = useState('');
  const [docSpecId, setDocSpecId] = useState('');
  const [docQual, setDocQual] = useState('MBBS, MD');
  const [docExp, setDocExp] = useState(5);
  const [docFee, setDocFee] = useState(800);
  const [docBio, setDocBio] = useState('');
  const [addingDoctor, setAddingDoctor] = useState(false);
  const [docError, setDocError] = useState('');

  // Form states for catalog
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [newSpecName, setNewSpecName] = useState('');
  const [newSpecDeptId, setNewSpecDeptId] = useState('');

  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchMetrics();
    fetchDoctors();
    fetchUsers();
    fetchCatalog();
    fetchAuditLogs();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await api.getAdminMetrics();
      setMetrics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.searchDoctors({ includeUnapproved: true });
      const docs = res.data || [];
      setAllDoctors(docs);
      setPendingDoctors(docs.filter(d => !d.approved));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.getAdminUsers();
      setAllUsers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCatalog = async () => {
    try {
      const [deptRes, specRes] = await Promise.all([
        api.getDepartments(),
        api.getSpecializations()
      ]);
      const depts = deptRes.data || [];
      const specs = specRes.data || [];
      setDepartments(depts);
      setSpecializations(specs);
      if (depts.length > 0) {
        setNewSpecDeptId(depts[0]._id);
        if (!docDeptId) setDocDeptId(depts[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDoctorSpecs = specializations.filter(
    s => !docDeptId || s.departmentId?._id === docDeptId || s.departmentId === docDeptId
  );

  useEffect(() => {
    if (filteredDoctorSpecs.length > 0) {
      setDocSpecId(filteredDoctorSpecs[0]._id);
    } else {
      setDocSpecId('');
    }
  }, [docDeptId, specializations]);

  const fetchAuditLogs = async () => {
    try {
      const res = await api.getAuditLogs();
      setAuditLogs(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveDoctor = async (doctorId) => {
    try {
      await api.approveDoctor(doctorId);
      setActionMsg('Doctor profile approved and activated.');
      fetchDoctors();
      fetchMetrics();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert('Approval failed: ' + err.message);
    }
  };

  const handleRejectDoctor = async (doctorId) => {
    try {
      await api.rejectDoctor(doctorId);
      setActionMsg('Doctor approval revoked.');
      fetchDoctors();
      fetchMetrics();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert('Action failed: ' + err.message);
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      const res = await api.toggleUserStatus(userId);
      setActionMsg(`User status updated to ${res.data.isActive ? 'Active' : 'Deactivated'}.`);
      fetchUsers();
      fetchMetrics();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert('Failed to toggle user status: ' + err.message);
    }
  };

  const handleOnboardDoctor = async (e) => {
    e.preventDefault();
    setDocError('');

    if (!docName.trim() || !docEmail.trim() || !docPassword) {
      setDocError('Doctor name, email, and password are required.');
      return;
    }

    if (docPassword.length < 6) {
      setDocError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setAddingDoctor(true);
      await api.createDoctorByAdmin({
        name: docName.trim(),
        email: docEmail.trim().toLowerCase(),
        password: docPassword,
        phone: docPhone.trim(),
        departmentId: docDeptId || undefined,
        specializationId: docSpecId || undefined,
        qualification: docQual.trim() || 'MD / MBBS',
        experience: Number(docExp),
        fee: Number(docFee),
        bio: docBio.trim()
      });

      setActionMsg(`Doctor "${docName.trim()}" successfully created, activated, and added to the medical registry.`);
      setShowAddDoctorModal(false);
      // Reset form
      setDocName('');
      setDocEmail('');
      setDocPhone('');
      setDocBio('');
      fetchDoctors();
      fetchMetrics();
      fetchUsers();
      setTimeout(() => setActionMsg(''), 5000);
    } catch (err) {
      setDocError(err.message || 'Failed to create doctor.');
    } finally {
      setAddingDoctor(false);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    try {
      const token = localStorage.getItem('has_token');
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newDeptName.trim(), description: newDeptDesc.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to create department');
      setActionMsg(`Department "${newDeptName}" created.`);
      setNewDeptName('');
      setNewDeptDesc('');
      fetchCatalog();
      fetchMetrics();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateSpecialization = async (e) => {
    e.preventDefault();
    if (!newSpecName.trim() || !newSpecDeptId) return;
    try {
      const token = localStorage.getItem('has_token');
      const res = await fetch('/api/specializations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newSpecName.trim(), departmentId: newSpecDeptId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to create specialization');
      setActionMsg(`Specialization "${newSpecName}" created.`);
      setNewSpecName('');
      fetchCatalog();
      fetchMetrics();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* 21st.dev Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'metrics' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('metrics')}
        >
          <BarChart3 size={16} />
          KPI Analytics
        </button>
        <button
          className={`btn ${activeTab === 'doctors' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('doctors')}
        >
          <Stethoscope size={16} />
          Doctors & Onboarding ({allDoctors.length})
          {pendingDoctors.length > 0 && (
            <span style={{ 
              background: 'var(--amber-500)', 
              color: '#000', 
              fontSize: '0.7rem', 
              fontWeight: 800, 
              padding: '1px 6px', 
              borderRadius: '9999px',
              marginLeft: '4px'
            }}>
              {pendingDoctors.length}
            </span>
          )}
        </button>
        <button
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} />
          User Directory ({allUsers.length})
        </button>
        <button
          className={`btn ${activeTab === 'catalog' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('catalog')}
        >
          <Layers size={16} />
          Clinical Catalog
        </button>
        <button
          className={`btn ${activeTab === 'logs' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('logs')}
        >
          <ScrollText size={16} />
          Audit Trail ({auditLogs.length})
        </button>
      </div>

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

      {/* TAB 1: METRICS */}
      {activeTab === 'metrics' && metrics && (
        <div>
          {/* 21st.dev Bento Analytics Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon">
                <Users size={22} />
              </div>
              <div>
                <div className="kpi-value">{metrics.users.patients}</div>
                <div className="kpi-label">Registered Patients</div>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--emerald-400)', borderColor: 'rgba(52, 211, 153, 0.3)' }}>
                <Stethoscope size={22} />
              </div>
              <div>
                <div className="kpi-value">{metrics.users.approvedDoctors}</div>
                <div className="kpi-label">Active Approved Doctors</div>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--amber-400)', borderColor: 'rgba(251, 191, 36, 0.3)' }}>
                <Clock size={22} />
              </div>
              <div>
                <div className="kpi-value">{metrics.users.pendingApprovals}</div>
                <div className="kpi-label">Pending Verifications</div>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: 'var(--accent-400)', borderColor: 'rgba(129, 140, 248, 0.3)' }}>
                <Calendar size={22} />
              </div>
              <div>
                <div className="kpi-value">{metrics.appointments.total}</div>
                <div className="kpi-label">Total Appointments</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '16px' }}>Appointments by Status</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(metrics.appointments.byStatus).map(([st, cnt]) => (
                  <div key={st} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                    <span className={`status-badge status-${st}`}>
                      <span className="status-dot"></span>
                      {st}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>{cnt}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '16px' }}>Medical Catalog Capacity</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                    <Layers size={16} /> Clinical Departments
                  </span>
                  <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>{metrics.catalog.departments}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                    <Stethoscope size={16} /> Specialized Practices
                  </span>
                  <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>{metrics.catalog.specializations}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOCTOR DIRECTORY & ONBOARDING (ADMIN ONLY) */}
      {activeTab === 'doctors' && (
        <div>
          {/* Header Bar with Action Button */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px', 
            flexWrap: 'wrap', 
            gap: '12px' 
          }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>Doctor Management</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Add new certified doctors directly or review pending credentials.
              </p>
            </div>
            <button 
              className="btn btn-shimmer"
              onClick={() => {
                setDocError('');
                setShowAddDoctorModal(true);
              }}
            >
              <UserPlus size={16} />
              Add New Doctor
            </button>
          </div>

          <div className="data-table-container">
            {allDoctors.length === 0 ? (
              <div style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Stethoscope size={36} color="var(--primary-400)" style={{ marginBottom: '12px' }} />
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '4px' }}>No Doctors in Registry</h3>
                <p>Click "Add New Doctor" above to onboard your first healthcare practitioner.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Doctor Name</th>
                    <th>Department & Specialty</th>
                    <th>Qualifications & Exp</th>
                    <th>Fee (₹)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allDoctors.map(doc => (
                    <tr key={doc._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{doc.userId?.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{doc.userId?.email}</div>
                      </td>
                      <td>{doc.departmentId?.name || 'Unassigned'} · {doc.specializationId?.name || 'General'}</td>
                      <td>{doc.qualification} ({doc.experience} yrs)</td>
                      <td style={{ fontWeight: 700 }}>₹{doc.fee}</td>
                      <td>
                        {doc.approved ? (
                          <span className="status-badge status-CONFIRMED">
                            <span className="status-dot"></span>
                            Active
                          </span>
                        ) : (
                          <span className="status-badge status-PENDING">
                            <span className="status-dot"></span>
                            Pending Approval
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {!doc.approved ? (
                            <>
                              <button
                                className="btn btn-shimmer btn-sm"
                                onClick={() => handleApproveDoctor(doc._id)}
                              >
                                <CheckCircle2 size={13} />
                                Approve
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRejectDoctor(doc._id)}
                              >
                                <XCircle size={13} />
                                Reject
                              </button>
                            </>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--emerald-400)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <ShieldCheck size={14} /> Certified
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: USER ACCOUNTS */}
      {activeTab === 'users' && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </td>
                  <td>
                    <span className={`role-dashboard-badge badge-${u.role.toLowerCase()}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.phone || '—'}</td>
                  <td>
                    <span style={{ 
                      color: u.isActive ? 'var(--emerald-400)' : 'var(--rose-400)', 
                      fontWeight: 700, 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '4px' 
                    }}>
                      <span className="status-dot" style={{ background: u.isActive ? 'var(--emerald-400)' : 'var(--rose-400)' }}></span>
                      {u.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    {u.role !== 'ADMIN' && (
                      <button
                        className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-secondary'}`}
                        onClick={() => handleToggleUser(u._id)}
                      >
                        {u.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: DEPARTMENTS & SPECIALIZATIONS */}
      {activeTab === 'catalog' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          {/* Add Dept */}
          <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FolderPlus size={18} color="var(--primary-400)" />
              Add Clinical Department
            </h4>
            <form onSubmit={handleCreateDepartment}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Department Name (e.g. Ophthalmology)"
                  value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  placeholder="Clinical description..."
                  rows={2}
                  value={newDeptDesc}
                  onChange={e => setNewDeptDesc(e.target.value)}
                  className="form-textarea"
                />
              </div>
              <button className="btn btn-shimmer btn-sm" type="submit">
                <Plus size={14} />
                Create Department
              </button>
            </form>

            <h5 style={{ marginTop: '28px', marginBottom: '12px', color: 'var(--text-muted)' }}>
              Existing Departments ({departments.length})
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
              {departments.map(d => (
                <div key={d._id} style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', fontWeight: 600, border: '1px solid var(--border-light)' }}>
                  {d.name}
                </div>
              ))}
            </div>
          </div>

          {/* Add Specialization */}
          <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Stethoscope size={18} color="var(--accent-400)" />
              Add Specialization
            </h4>
            <form onSubmit={handleCreateSpecialization}>
              <div className="form-group">
                <select
                  value={newSpecDeptId}
                  onChange={e => setNewSpecDeptId(e.target.value)}
                  className="form-select"
                  required
                >
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Specialization Name (e.g. Pediatric Cardiology)"
                  value={newSpecName}
                  onChange={e => setNewSpecName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
              <button className="btn btn-shimmer btn-sm" type="submit">
                <Plus size={14} />
                Create Specialization
              </button>
            </form>

            <h5 style={{ marginTop: '28px', marginBottom: '12px', color: 'var(--text-muted)' }}>
              Existing Specializations ({specializations.length})
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
              {specializations.map(s => (
                <div key={s._id} style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', border: '1px solid var(--border-light)' }}>
                  <strong style={{ color: 'var(--text-main)' }}>{s.name}</strong> <span style={{ color: 'var(--text-muted)' }}>({s.departmentId?.name})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log._id}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{log.actor?.name || 'System Task'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{log.actor?.email}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary-400)' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    {log.target}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 21st.dev ONBOARD NEW DOCTOR MODAL (ADMIN ONLY) */}
      {showAddDoctorModal && (
        <div className="modal-overlay" onClick={() => setShowAddDoctorModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Stethoscope size={20} color="var(--primary-400)" />
                  Onboard Certified Doctor
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Create practitioner account with auto-approved clinical credentials.
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddDoctorModal(false)} style={{ padding: '6px' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleOnboardDoctor}>
              <div className="modal-body">
                {docError && (
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
                    <AlertTriangle size={18} />
                    <span>{docError}</span>
                  </div>
                )}

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      Doctor Full Name *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Dr. Emily Stone"
                      value={docName}
                      onChange={e => setDocName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+1 (555) 234-5678"
                      value={docPhone}
                      onChange={e => setDocPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">
                      Doctor Email Address *
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="emily.stone@healthcare.com"
                      value={docEmail}
                      onChange={e => setDocEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Initial Password *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={docPassword}
                      onChange={e => setDocPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Clinical Department *</label>
                    <select
                      className="form-select"
                      value={docDeptId}
                      onChange={e => setDocDeptId(e.target.value)}
                      required
                    >
                      {departments.map(d => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <select
                      className="form-select"
                      value={docSpecId}
                      onChange={e => setDocSpecId(e.target.value)}
                    >
                      {filteredDoctorSpecs.length === 0 ? (
                        <option value="">General Clinical Practice</option>
                      ) : (
                        filteredDoctorSpecs.map(s => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="doctor-meta-grid">
                  <div className="form-group">
                    <label className="form-label">Qualifications & Degrees</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="MBBS, MD Cardiology, FACC"
                      value={docQual}
                      onChange={e => setDocQual(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Experience (Years)</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      className="form-input"
                      value={docExp}
                      onChange={e => setDocExp(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" title="Consultation Fee (₹ INR)">
                      Consultation Fee (₹ INR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={docFee}
                      onChange={e => setDocFee(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Professional Bio / Summary</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    placeholder="Senior consultant with expertise in preventive cardiology and patient care..."
                    value={docBio}
                    onChange={e => setDocBio(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAddDoctorModal(false)}
                  disabled={addingDoctor}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-shimmer"
                  disabled={addingDoctor}
                >
                  <UserPlus size={15} />
                  {addingDoctor ? 'Onboarding Doctor...' : 'Onboard & Activate Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
