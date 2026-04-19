import { useState } from 'react';
import { Users, BarChart2, Shield, LogOut, Check, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { adminAPI } from '../api/index.js';
import { useFetch } from '../hooks/useFetch.js';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [roleFilter, setRoleFilter] = useState('');

  const { data: statsData, loading: statsLoading } = useFetch(adminAPI.stats);
  const { data: usersData, loading: usersLoading, refetch: refetchUsers } = useFetch(
    () => adminAPI.users({ role: roleFilter || undefined }),
    [roleFilter]
  );

  const stats = statsData?.stats ?? {};
  const recentBookings = statsData?.recentBookings ?? [];
  const users = usersData?.users ?? [];

  const handleVerify = async (id) => {
    try { await adminAPI.verifyUser(id); toast.success('User verified ✓'); refetchUsers(); }
    catch { toast.error('Failed to verify user'); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    try { await adminAPI.deleteUser(id); toast.success('User deleted'); refetchUsers(); }
    catch { toast.error('Failed to delete user'); }
  };

  const navItems = [
    { id: 'stats', label: 'Dashboard', icon: <BarChart2 size={20} /> },
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'providers', label: 'Verify Providers', icon: <Shield size={20} /> },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">🐾 Admin</div>
        <div style={{ padding: '0 0.75rem 1.5rem', borderBottom: '1px solid var(--surface-container)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{user?.name}</div>
              <div className="chip chip-active" style={{ fontSize: '0.6875rem', padding: '0.1rem 0.5rem' }}>ADMIN</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, marginTop: '0.5rem' }}>
          {navItems.map((item) => (
            <button key={item.id} className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--surface-container)', paddingTop: '1rem' }}>
          <button className="sidebar-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--error)' }} onClick={logout}>
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        {/* Stats */}
        {activeTab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h2>Platform Overview</h2>
            {statsLoading ? (
              <div className="stats-grid">{[1,2,3,4].map((i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-xl)' }} />)}</div>
            ) : (
              <div className="stats-grid">
                {[
                  { label: 'Total Users', value: stats.users ?? 0, icon: '👥' },
                  { label: 'Total Pets', value: stats.pets ?? 0, icon: '🐾' },
                  { label: 'Total Bookings', value: stats.bookings ?? 0, icon: '📅' },
                  { label: 'Active Services', value: stats.services ?? 0, icon: '🛠️' },
                ].map((s) => (
                  <div key={s.label} className="stat-card">
                    <div className="stat-card-icon" style={{ fontSize: '1.375rem' }}>{s.icon}</div>
                    <div className="stat-card-value">{s.value}</div>
                    <div className="stat-card-label">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <h3 style={{ marginBottom: '1rem' }}>Recent Bookings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentBookings.map((b) => (
                  <div key={b.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{b.service?.title}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>{b.owner?.name} · {b.pet?.name}</div>
                    </div>
                    <span className={`chip ${b.status === 'CONFIRMED' ? 'chip-green' : b.status === 'CANCELLED' ? 'chip-red' : 'chip-orange'}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users management */}
        {(activeTab === 'users' || activeTab === 'providers') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <h2>{activeTab === 'providers' ? 'Provider Verification' : 'User Management'}</h2>
              <select className="form-input" style={{ width: 'auto', padding: '0.45rem 2rem 0.45rem 0.75rem' }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                <option value="OWNER">Pet Owners</option>
                <option value="PROVIDER">Providers</option>
                <option value="VET">Vets</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>

            {usersLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-lg)' }} />)}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {users.map((u) => (
                  <div key={u.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1rem 1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{u.name}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>{u.email}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--outline)', marginTop: '0.2rem' }}>
                          {u._count?.pets ?? 0} pets · {u._count?.bookingsAsOwner ?? 0} bookings
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className={`chip ${u.role === 'ADMIN' ? 'chip-active' : u.role === 'VET' ? 'chip-green' : u.role === 'PROVIDER' ? 'chip-orange' : ''}`}>{u.role}</span>
                      {u.isVerified ? (
                        <span className="chip chip-green" style={{ fontSize: '0.75rem' }}>✓ Verified</span>
                      ) : (
                        <button className="btn btn-sm btn-primary" onClick={() => handleVerify(u.id)}><Check size={14} /> Verify</button>
                      )}
                      {u.id !== user.id && (
                        <button className="btn btn-sm" style={{ background: 'var(--error-container)', color: 'var(--error)', border: 'none' }} onClick={() => handleDelete(u.id, u.name)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
