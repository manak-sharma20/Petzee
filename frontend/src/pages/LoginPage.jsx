import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}! 🐾`);
      const routes = { OWNER: '/dashboard', PROVIDER: '/provider', VET: '/consultations/vets', ADMIN: '/admin' };
      navigate(routes[user.role] || '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--background)' }}>
      {/* Left panel */}
      <div className="gradient-bg" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem', minWidth: 0 }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <Link to="/" style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.75rem', color: '#fff', textDecoration: 'none' }}>🐾 Petzee</Link>
          <h2 style={{ color: '#fff', marginTop: '3rem', marginBottom: '1rem' }}>Your pet's world,<br />all in one place.</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.0625rem' }}>Manage health records, book services, and chat with vets — anytime, anywhere.</p>
          <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['Add unlimited pet profiles', 'Vaccination reminders by email', 'Chat live with certified vets', 'Book verified groomers & walkers'].map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(255,255,255,0.9)', fontSize: '0.9375rem', fontWeight: 500 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>✓</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', minWidth: 0 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Welcome back 👋</h2>
          <p style={{ marginBottom: '2rem' }}>Sign in to your Petzee account</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
                <input id="login-email" type="email" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="you@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
                <input id="login-password" type={showPw ? 'text' : 'password'} className="form-input" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button id="login-submit" type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9375rem' }}>
            Don't have an account? <Link to="/register" style={{ fontWeight: 700, color: 'var(--primary)' }}>Sign up free</Link>
          </p>
          <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.875rem' }}>
            <Link to="/services" style={{ color: 'var(--outline)' }}>Browse services without an account →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
