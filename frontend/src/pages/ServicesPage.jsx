import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, Clock, MapPin } from 'lucide-react';
import { servicesAPI } from '../api/index.js';
import { useFetch } from '../hooks/useFetch.js';
import { useAuth } from '../context/AuthContext.jsx';

const categories = ['All', 'grooming', 'walking', 'boarding', 'vet', 'training', 'other'];

const categoryEmojis = {
  grooming: '✂️', walking: '🦮', boarding: '🏠', vet: '👨‍⚕️', training: '🎾', other: '🐾',
};

export default function ServicesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState('');

  const params = {
    ...(category !== 'All' && { category }),
    ...(maxPrice && { maxPrice }),
  };

  const { data, loading } = useFetch(() => servicesAPI.list(params), [category, maxPrice]);
  const allServices = data?.services ?? data ?? [];

  const filtered = allServices.filter((s) =>
    search === '' || s.title.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">🐾 Petzee</Link>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '3.5rem 1.5rem 2.5rem', background: 'linear-gradient(135deg,var(--primary) 0%,var(--primary-container) 100%)', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', marginBottom: '0.75rem' }}>Find Trusted Pet Services</h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.0625rem', marginBottom: '2rem' }}>All providers verified by Petzee</p>

        <div style={{ maxWidth: 540, margin: '0 auto', display: 'flex', gap: '0.75rem', background: '#fff', borderRadius: 'var(--radius-full)', padding: '0.375rem 0.375rem 0.375rem 1.25rem', boxShadow: 'var(--shadow-lg)' }}>
          <Search size={18} style={{ color: 'var(--outline)', flexShrink: 0, alignSelf: 'center' }} />
          <input
            style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'var(--on-surface)', background: 'transparent' }}
            placeholder="Search grooming, vets, walking…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary btn-sm">Search</button>
        </div>
      </section>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map((c) => (
              <button key={c} className={`chip ${category === c ? 'chip-active' : ''}`} style={{ cursor: 'pointer', border: 'none', padding: '0.45rem 1rem' }} onClick={() => setCategory(c)}>
                {c !== 'All' ? categoryEmojis[c] + ' ' : ''}{c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
            <Filter size={16} color="var(--outline)" />
            <select className="form-input" style={{ width: 'auto', padding: '0.45rem 2rem 0.45rem 0.75rem', fontSize: '0.875rem' }} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}>
              <option value="">Any price</option>
              <option value="500">Under ₹500</option>
              <option value="1000">Under ₹1000</option>
              <option value="2000">Under ₹2000</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>
          {loading ? 'Loading…' : `${filtered.length} services found`}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton" style={{ height: 260, borderRadius: 'var(--radius-xl)' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ marginBottom: '0.5rem' }}>No services found</h3>
            <p>Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.5rem' }}>
            {filtered.map((service) => (
              <ServiceCard key={service.id} service={service} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceCard({ service, user }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'default' }}>
      <div style={{ height: 140, background: `linear-gradient(135deg,var(--primary-fixed),var(--surface-container))`, borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
        {categoryEmojis[service.category] ?? '🐾'}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem' }}>{service.title}</div>
        <div className="chip chip-orange" style={{ fontSize: '0.75rem' }}>{service.category}</div>
        {service.description && <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{service.description}</p>}
      </div>
      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>
        {service.duration && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={13} /> {service.duration} min</span>}
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Star size={13} fill="var(--secondary-container)" color="var(--secondary-container)" /> {service.provider?.rating?.toFixed(1) ?? 'New'}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--surface-container)' }}>
        <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)', fontFamily: 'var(--font-headline)' }}>₹{service.price}</span>
        {user ? (
          <Link to="/dashboard" className="btn btn-secondary btn-sm">Book Now</Link>
        ) : (
          <Link to="/register" className="btn btn-primary btn-sm">Book Now</Link>
        )}
      </div>
    </div>
  );
}
