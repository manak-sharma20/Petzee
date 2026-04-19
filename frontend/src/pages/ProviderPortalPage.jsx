import { useState } from 'react';
import { Plus, Package, Calendar, BarChart2, LogOut, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { servicesAPI, bookingsAPI } from '../api/index.js';
import { useFetch } from '../hooks/useFetch.js';

const categories = ['grooming', 'walking', 'boarding', 'vet', 'training', 'other'];

const ServiceCard = ({ service, onToggle }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--on-surface)' }}>{service.title}</div>
        <div className="chip chip-orange" style={{ marginTop: '0.35rem', fontSize: '0.75rem' }}>{service.category}</div>
      </div>
      <span className={`chip ${service.isActive ? 'chip-green' : 'chip-red'}`} style={{ fontSize: '0.75rem' }}>
        {service.isActive ? 'Active' : 'Paused'}
      </span>
    </div>
    {service.description && <p style={{ fontSize: '0.875rem' }}>{service.description}</p>}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--primary)', fontFamily: 'var(--font-headline)' }}>₹{service.price}</span>
      {service.duration && <span className="chip" style={{ fontSize: '0.75rem' }}>{service.duration} min</span>}
    </div>
    <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--surface-container)' }}>
      <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', flex: 1 }}>
        {service._count?.bookings ?? 0} bookings total
      </div>
      <button className="btn btn-ghost btn-sm" onClick={() => onToggle(service)}>
        {service.isActive ? <><X size={14} /> Pause</> : <><Check size={14} /> Activate</>}
      </button>
    </div>
  </div>
);

const AddServiceModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ title: '', description: '', category: 'grooming', price: '', duration: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      await servicesAPI.create(fd);
      toast.success('Service added!');
      onSave();
      onClose();
    } catch { toast.error('Failed to add service'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(25,28,30,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 480 }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Add New Service</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Full Grooming Session" /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="What's included…" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Price (₹) *</label><input className="form-input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="500" /></div>
            <div className="form-group"><label className="form-label">Duration (min)</label><input className="form-input" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="60" /></div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>{loading ? 'Saving…' : 'Add Service'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ProviderPortalPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('services');
  const [showAddService, setShowAddService] = useState(false);

  const { data: servicesData, loading: servicesLoading, refetch: refetchServices } = useFetch(servicesAPI.myServices);
  const services = servicesData ?? [];

  const handleToggle = async (service) => {
    try {
      const fd = new FormData();
      fd.append('isActive', String(!service.isActive));
      await servicesAPI.update(service.id, fd);
      toast.success(service.isActive ? 'Service paused' : 'Service activated');
      refetchServices();
    } catch { toast.error('Failed to update service'); }
  };

  const navItems = [
    { id: 'services', label: 'My Services', icon: <Package size={20} /> },
    { id: 'bookings', label: 'Incoming Bookings', icon: <Calendar size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={20} /> },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">🐾 Petzee</div>
        <div style={{ padding: '0 0.75rem 1.5rem', borderBottom: '1px solid var(--surface-container)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#6e2f00', fontSize: '1rem' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--on-surface)' }}>{user?.name}</div>
              <div className="chip chip-orange" style={{ fontSize: '0.6875rem', padding: '0.1rem 0.5rem' }}>PROVIDER</div>
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
        {/* Services Tab */}
        {activeTab === 'services' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2>My Services</h2>
                <p>{services.length} service{services.length !== 1 ? 's' : ''} listed</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowAddService(true)}><Plus size={16} /> Add Service</button>
            </div>

            {/* Stats */}
            <div className="stats-grid">
              {[
                { label: 'Active Services', value: services.filter((s) => s.isActive).length, icon: '✅' },
                { label: 'Total Bookings', value: services.reduce((a, s) => a + (s._count?.bookings ?? 0), 0), icon: '📅' },
                { label: 'Verified', value: user?.isVerified ? 'Yes' : 'No', icon: '🛡️' },
              ].map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="stat-card-icon" style={{ fontSize: '1.375rem' }}>{s.icon}</div>
                  <div className="stat-card-value">{s.value}</div>
                  <div className="stat-card-label">{s.label}</div>
                </div>
              ))}
            </div>

            {servicesLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.5rem' }}>
                {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-xl)' }} />)}
              </div>
            ) : services.length === 0 ? (
              <div className="card-flat" style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛠️</div>
                <h3 style={{ marginBottom: '0.5rem' }}>No services yet</h3>
                <p style={{ marginBottom: '1.5rem' }}>Add your first service to start receiving bookings</p>
                <button className="btn btn-primary" onClick={() => setShowAddService(true)}><Plus size={16} /> Add Your First Service</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.5rem' }}>
                {services.map((s) => <ServiceCard key={s.id} service={s} onToggle={handleToggle} />)}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && <IncomingBookings />}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2>Analytics</h2>
            <div className="stats-grid">
              {[
                { label: 'Total Revenue', value: `₹${services.reduce((a, s) => a + (s._count?.bookings ?? 0) * s.price, 0).toLocaleString()}`, icon: '💰' },
                { label: 'Total Bookings', value: services.reduce((a, s) => a + (s._count?.bookings ?? 0), 0), icon: '📅' },
                { label: 'Active Services', value: services.filter((s) => s.isActive).length, icon: '✅' },
              ].map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="stat-card-icon" style={{ fontSize: '1.375rem' }}>{s.icon}</div>
                  <div className="stat-card-value" style={{ fontSize: '1.375rem' }}>{s.value}</div>
                  <div className="stat-card-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="card-flat" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📊</div>
              <p>Detailed charts coming soon!</p>
            </div>
          </div>
        )}
      </main>

      {showAddService && <AddServiceModal onClose={() => setShowAddService(false)} onSave={refetchServices} />}
    </div>
  );
}

function IncomingBookings() {
  const { data, loading, refetch } = useFetch(bookingsAPI.list);
  const bookings = data?.bookings ?? data ?? [];

  const handleStatus = async (id, status) => {
    try {
      await bookingsAPI.updateStatus(id, status);
      toast.success(`Booking ${status.toLowerCase()}`);
      refetch();
    } catch { toast.error('Failed to update booking'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2>Incoming Bookings</h2>
      {loading ? <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-xl)' }} /> : (
        bookings.length === 0 ? (
          <div className="card-flat" style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
            <p>No bookings yet. Add services to start receiving bookings!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookings.map((b) => (
              <div key={b.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1.25rem 1.75rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{b.service?.title}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>
                    {b.pet?.name} · {b.owner?.name} · {new Date(b.scheduledAt).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 700, marginTop: '0.25rem' }}>₹{b.totalPrice}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className={`chip ${b.status === 'CONFIRMED' ? 'chip-green' : b.status === 'CANCELLED' ? 'chip-red' : b.status === 'COMPLETED' ? 'chip-active' : 'chip-orange'}`}>{b.status}</span>
                  {b.status === 'PENDING' && (
                    <>
                      <button className="btn btn-sm chip-green" style={{ background: 'var(--chip-green)', color: '#1a5c35', border: 'none' }} onClick={() => handleStatus(b.id, 'CONFIRMED')}><Check size={14} /> Confirm</button>
                      <button className="btn btn-sm chip-red" style={{ background: 'var(--error-container)', color: 'var(--error)', border: 'none' }} onClick={() => handleStatus(b.id, 'CANCELLED')}><X size={14} /> Decline</button>
                    </>
                  )}
                  {b.status === 'CONFIRMED' && (
                    <button className="btn btn-sm btn-primary" onClick={() => handleStatus(b.id, 'COMPLETED')}><Check size={14} /> Mark Complete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
