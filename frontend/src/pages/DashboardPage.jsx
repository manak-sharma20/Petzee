import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, Calendar, Bell, MessageCircle, Plus, LogOut, Settings, Home, Scissors } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { petsAPI, bookingsAPI, notificationsAPI } from '../api/index.js';
import { useFetch } from '../hooks/useFetch.js';

const Sidebar = ({ active, onNav, onLogout, user }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { id: 'pets', label: 'My Pets', icon: <PawPrint size={20} /> },
    { id: 'bookings', label: 'Bookings', icon: <Calendar size={20} /> },
    { id: 'consultations', label: 'Vet Chat', icon: <MessageCircle size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'services', label: 'Find Services', icon: <Scissors size={20} /> },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">🐾 Petzee</div>
      <div style={{ padding: '0 0.75rem 1.5rem', borderBottom: '1px solid var(--surface-container)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--on-surface)' }}>{user?.name}</div>
            <div className="chip chip-orange" style={{ fontSize: '0.6875rem', padding: '0.1rem 0.5rem' }}>{user?.role}</div>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, marginTop: '0.5rem' }}>
        {navItems.map((item) => (
          <button key={item.id} className={`sidebar-item ${active === item.id ? 'active' : ''}`} onClick={() => onNav(item.id)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            {item.icon} {item.label}
          </button>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--surface-container)', paddingTop: '1rem' }}>
        <button className="sidebar-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--error)' }} onClick={onLogout}>
          <LogOut size={20} /> Sign Out
        </button>
      </div>
    </aside>
  );
};

const PetCard = ({ pet, onSelect }) => (
  <div className="pet-card" onClick={() => onSelect(pet)}>
    <div style={{ width: '100%', height: 160, background: 'linear-gradient(135deg,var(--primary-fixed),var(--surface-container))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
      {pet.species === 'Dog' ? '🐕' : pet.species === 'Cat' ? '🐱' : pet.species === 'Bird' ? '🐦' : '🐾'}
    </div>
    <div className="pet-card-body">
      <div className="pet-card-name">{pet.name}</div>
      <div className="chip" style={{ fontSize: '0.75rem' }}>{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</div>
    </div>
    <div className="pet-card-footer">
      <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>
        {pet.vaccinationRecords?.[0] ? `Last vacc: ${new Date(pet.vaccinationRecords[0].givenAt).toLocaleDateString()}` : 'No records yet'}
      </span>
      <span className="chip chip-green" style={{ fontSize: '0.75rem' }}>Active</span>
    </div>
  </div>
);

const AddPetModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ name: '', species: 'Dog', breed: '', gender: '', weight: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      await petsAPI.create(fd);
      toast.success(`${form.name} added! 🐾`);
      onSave();
      onClose();
    } catch { toast.error('Failed to add pet'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(25,28,30,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Add a Pet 🐾</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group"><label className="form-label">Pet Name *</label><input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Bruno" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Species *</label>
              <select className="form-input" value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })}>
                {['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Other'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Breed</label><input className="form-input" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} placeholder="e.g. Labrador" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select</option><option>Male</option><option>Female</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Weight (kg)</label><input className="form-input" type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 12.5" /></div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>{loading ? 'Saving…' : 'Add Pet'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddPet, setShowAddPet] = useState(false);

  const { data: petsData, loading: petsLoading, refetch: refetchPets } = useFetch(petsAPI.list);
  const { data: bookingsData, loading: bookingsLoading } = useFetch(bookingsAPI.list);
  const { data: notifData, refetch: refetchNotifs } = useFetch(notificationsAPI.list);

  const pets = petsData?.pets ?? petsData ?? [];
  const bookings = bookingsData?.bookings ?? bookingsData ?? [];
  const notifications = notifData?.notifications ?? [];
  const unreadCount = notifData?.unreadCount ?? 0;

  const handleMarkRead = async (id) => {
    await notificationsAPI.markRead(id);
    refetchNotifs();
  };

  return (
    <div className="dashboard-layout">
      <Sidebar active={activeTab} onNav={setActiveTab} onLogout={logout} user={user} />

      <main className="dashboard-main">
        {/* ── Dashboard overview ── */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 style={{ marginBottom: '0.25rem' }}>Good morning, {user?.name?.split(' ')[0]}! 🌅</h2>
              <p>Here's what's happening with your pets today.</p>
            </div>
            <div className="stats-grid">
              {[
                { label: 'My Pets', value: pets.length, icon: '🐾' },
                { label: 'Bookings', value: bookings.length, icon: '📅' },
                { label: 'Notifications', value: unreadCount, icon: '🔔' },
                { label: 'Consultations', value: 0, icon: '💬' },
              ].map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="stat-card-icon" style={{ fontSize: '1.375rem' }}>{s.icon}</div>
                  <div className="stat-card-value">{s.value}</div>
                  <div className="stat-card-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Bookings */}
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Recent Bookings</h3>
              {bookingsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 'var(--radius-lg)' }} />)}
                </div>
              ) : bookings.length === 0 ? (
                <div className="card-flat" style={{ textAlign: 'center', padding: '3rem' }}>
                  <p>No bookings yet. <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('services')}>Find services →</button></p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {bookings.slice(0, 5).map((b) => (
                    <div key={b.id} className="card" style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1rem 1.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{b.service?.title}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>{b.pet?.name} · {new Date(b.scheduledAt).toLocaleDateString()}</div>
                      </div>
                      <span className={`chip ${b.status === 'CONFIRMED' ? 'chip-green' : b.status === 'CANCELLED' ? 'chip-red' : 'chip-orange'}`}>{b.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── My Pets ── */}
        {activeTab === 'pets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2>My Pets</h2>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddPet(true)}><Plus size={16} /> Add Pet</button>
            </div>
            {petsLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1.5rem' }}>
                {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 'var(--radius-xl)' }} />)}
              </div>
            ) : pets.length === 0 ? (
              <div className="card-flat" style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐾</div>
                <h3 style={{ marginBottom: '0.5rem' }}>No pets yet</h3>
                <p style={{ marginBottom: '1.5rem' }}>Add your first pet to get started</p>
                <button className="btn btn-primary" onClick={() => setShowAddPet(true)}><Plus size={16} /> Add Your First Pet</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1.5rem' }}>
                {pets.map((pet) => <PetCard key={pet.id} pet={pet} onSelect={() => {}} />)}
                <div className="pet-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280, border: '2px dashed var(--outline-variant)', background: 'transparent', cursor: 'pointer', boxShadow: 'none' }} onClick={() => setShowAddPet(true)}>
                  <div style={{ textAlign: 'center', color: 'var(--outline)' }}><Plus size={32} /><div style={{ marginTop: '0.5rem', fontWeight: 600 }}>Add Pet</div></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Bookings ── */}
        {activeTab === 'bookings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2>My Bookings</h2>
            {bookingsLoading ? <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-xl)' }} /> : (
              bookings.length === 0 ? (
                <div className="card-flat" style={{ textAlign: 'center', padding: '4rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                  <p>No bookings yet. <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('services')}>Explore Services →</button></p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {bookings.map((b) => (
                    <div key={b.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1.25rem 1.75rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🛠️</div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{b.service?.title}</div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>For {b.pet?.name} · {new Date(b.scheduledAt).toLocaleString()}</div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginTop: '0.2rem' }}>₹{b.totalPrice}</div>
                        </div>
                      </div>
                      <span className={`chip ${b.status === 'CONFIRMED' ? 'chip-green' : b.status === 'CANCELLED' ? 'chip-red' : b.status === 'COMPLETED' ? 'chip-active' : 'chip-orange'}`}>{b.status}</span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* ── Notifications ── */}
        {activeTab === 'notifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2>Notifications {unreadCount > 0 && <span className="badge" style={{ marginLeft: '0.5rem' }}>{unreadCount}</span>}</h2>
              {unreadCount > 0 && <button className="btn btn-ghost btn-sm" onClick={() => { notificationsAPI.markAllRead(); refetchNotifs(); }}>Mark all read</button>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.length === 0 ? (
                <div className="card-flat" style={{ textAlign: 'center', padding: '4rem' }}><Bell size={40} style={{ color: 'var(--outline)', marginBottom: '1rem' }} /><p>No notifications yet</p></div>
              ) : notifications.map((n) => (
                <div key={n.id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem 1.5rem', opacity: n.isRead ? 0.7 : 1, borderLeft: n.isRead ? 'none' : '3px solid var(--primary)' }}>
                  <div style={{ fontSize: '1.5rem' }}>{n.type === 'VACCINATION_REMINDER' ? '💉' : n.type.includes('BOOKING') ? '📅' : '🔔'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{n.title}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginTop: '0.25rem' }}>{n.message}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--outline)', marginTop: '0.5rem' }}>{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  {!n.isRead && <button className="btn btn-ghost btn-sm" onClick={() => handleMarkRead(n.id)}>Mark read</button>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Vet Chat (list consultations) ── */}
        {activeTab === 'consultations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2>Vet Consultations</h2>
              <Link to="/services" className="btn btn-primary btn-sm"><Plus size={16} /> New Consultation</Link>
            </div>
            <div className="card-flat" style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Start your first consultation</h3>
              <p style={{ marginBottom: '1.5rem' }}>Connect with a certified vet in real-time</p>
              <Link to="/services" className="btn btn-primary">Find a Vet</Link>
            </div>
          </div>
        )}

        {/* ── Services tab ── */}
        {activeTab === 'services' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2>Find Services</h2>
            <p>Browse and book verified pet services in your area.</p>
            <Link to="/services" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Browse All Services →</Link>
          </div>
        )}
      </main>

      {showAddPet && <AddPetModal onClose={() => setShowAddPet(false)} onSave={refetchPets} />}
    </div>
  );
}
