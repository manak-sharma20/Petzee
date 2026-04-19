import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const roles = [
  { value: 'OWNER', label: '🐾 Pet Owner', desc: 'Manage pets & book services' },
  { value: 'PROVIDER', label: '🛠️ Service Provider', desc: 'Offer grooming, boarding & more' },
  { value: 'VET', label: '👨‍⚕️ Veterinarian', desc: 'Provide online consultations' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'OWNER', phone: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Account created! Welcome to Petzee, ${user.name}! 🐾`);
      const routes = { OWNER: '/dashboard', PROVIDER: '/provider', VET: '/dashboard', ADMIN: '/admin' };
      navigate(routes[user.role] || '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.5rem', background: 'linear-gradient(135deg,var(--primary),var(--primary-container))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🐾 Petzee</Link>
          <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Create your account</h2>
          <p>Join 10,000+ pet parents already on Petzee</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Role picker */}
            <div className="form-group">
              <label className="form-label">I am a…</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
                {roles.map((r) => (
                  <button key={r.value} type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    style={{ padding: '0.75rem', borderRadius: 'var(--radius-lg)', border: '2px solid', borderColor: form.role === r.value ? 'var(--primary)' : 'var(--outline-variant)', background: form.role === r.value ? 'var(--primary-fixed)' : 'var(--surface-bright)', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem' }}>{r.label.split(' ')[0]}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: form.role === r.value ? 'var(--primary)' : 'var(--on-surface)', marginTop: '0.25rem' }}>{r.label.slice(2)}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
                  <input id="reg-name" type="text" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="Ravi Kumar" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone (optional)</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
                  <input id="reg-phone" type="tel" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="+91 99999 00000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
                <input id="reg-email" type="email" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="you@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
                <input id="reg-password" type={showPw ? 'text' : 'password'} className="form-input" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} placeholder="At least 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button id="reg-submit" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account 🐾'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9375rem' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
