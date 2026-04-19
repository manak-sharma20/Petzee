import { Link } from 'react-router-dom';
import { PawPrint, Shield, Clock, MessageCircle, Star, ChevronRight, Check } from 'lucide-react';

const features = [
  { icon: <PawPrint size={24} />, title: 'Pet Profiles', desc: 'Manage all your pets in one place with health records, vaccination history, and more.' },
  { icon: <Shield size={24} />, title: 'Verified Services', desc: 'Book trusted groomers, walkers, and boarding centers — all verified by Petzee.' },
  { icon: <Clock size={24} />, title: 'Smart Reminders', desc: 'Never miss a vaccination again. Get timely email and in-app reminders.' },
  { icon: <MessageCircle size={24} />, title: 'Vet on Demand', desc: 'Chat live with certified veterinarians from the comfort of your home.' },
];

const testimonials = [
  { name: 'Priya Sharma', pet: 'Golden Retriever owner', text: "Petzee made managing Bruno's health records so easy. The vet chat feature is a lifesaver!", rating: 5 },
  { name: 'Arjun Mehta', pet: 'Cat parent', text: 'Found an amazing groomer for Whiskers in under 2 minutes. Highly recommend!', rating: 5 },
  { name: 'Neha Kapoor', pet: 'Two dogs & a rabbit', text: 'The vaccination reminders alone are worth using Petzee. My vet even prefers it!', rating: 5 },
];

const plans = [
  { name: 'Basic', price: 'Free', features: ['2 pet profiles', 'Vaccination reminders', 'Browse services'], cta: 'Get Started', primary: false },
  { name: 'Pro', price: '₹299/mo', features: ['Unlimited pets', 'Priority vet chat', 'Prescription storage', 'Booking history'], cta: 'Start Free Trial', primary: true },
  { name: 'Family', price: '₹499/mo', features: ['Everything in Pro', 'Up to 5 family members', 'Dedicated account manager', 'Advanced analytics'], cta: 'Contact Us', primary: false },
];

export default function LandingPage() {
  return (
    <div className="page" style={{ background: 'var(--background)' }}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <span className="navbar-logo">🐾 Petzee</span>
          <ul className="navbar-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#testimonials">Reviews</a></li>
            <li><a href="#pricing">Pricing</a></li>
            <li><Link to="/services">Services</Link></li>
          </ul>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '5rem 1.5rem 4rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,119,194,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div className="chip chip-orange" style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>🐾 Trusted by 10,000+ pet parents in India</div>
          <h1 style={{ marginBottom: '1.25rem', maxWidth: 700, margin: '0 auto 1.25rem' }}>
            Your Pet's Complete<br />
            <span className="gradient-text">Digital Home</span>
          </h1>
          <p style={{ fontSize: '1.125rem', maxWidth: 560, margin: '0 auto 2.5rem', color: 'var(--on-surface-variant)' }}>
            Manage health records, book verified services, chat with vets, and get vaccination reminders — all in one beautifully simple platform.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Start for Free <ChevronRight size={18} /></Link>
            <Link to="/services" className="btn btn-outline btn-lg">Explore Services</Link>
          </div>

          {/* Hero illustration / stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '4rem', flexWrap: 'wrap' }}>
            {[['10K+', 'Pet Owners'], ['500+', 'Verified Vets'], ['2K+', 'Service Providers'], ['98%', 'Satisfaction']].map(([val, label]) => (
              <div key={label} className="card" style={{ textAlign: 'center', minWidth: 130, padding: '1.25rem 1.75rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-headline)', background: 'linear-gradient(135deg,var(--primary),var(--primary-container))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--on-surface-variant)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '5rem 1.5rem', background: 'var(--surface-low)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="chip" style={{ marginBottom: '0.75rem' }}>Why Petzee?</div>
            <h2>Everything your pet needs,<br /><span className="gradient-text">in one place</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {features.map((f) => (
              <div key={f.title} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ width: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.125rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.9375rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>Get started in <span className="gradient-text">3 simple steps</span></h2>
          </div>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { step: '01', title: 'Create your account', desc: 'Sign up free in under a minute – no card required.' },
              { step: '02', title: 'Add your pets', desc: 'Build profiles with photos, health records, and vaccinations.' },
              { step: '03', title: 'Book & Connect', desc: 'Find trusted services and chat with vets instantly.' },
            ].map((s) => (
              <div key={s.step} style={{ flex: '1 1 220px', maxWidth: 300, textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg,var(--primary),var(--primary-container))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#fff', fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.125rem' }}>{s.step}</div>
                <h3 style={{ fontSize: '1.0625rem', marginBottom: '0.5rem' }}>{s.title}</h3>
                <p style={{ fontSize: '0.9375rem' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" style={{ padding: '5rem 1.5rem', background: 'var(--surface-low)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>Loved by pet parents <span className="gradient-text">across India</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {testimonials.map((t) => (
              <div key={t.name} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {Array(t.rating).fill(0).map((_, i) => <Star key={i} size={16} fill="var(--secondary-container)" color="var(--secondary-container)" />)}
                </div>
                <p style={{ fontSize: '0.9375rem', fontStyle: 'italic' }}>"{t.text}"</p>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--on-surface)', fontSize: '0.9375rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>{t.pet}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '5rem 1.5rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>Simple, <span className="gradient-text">transparent pricing</span></h2>
            <p style={{ marginTop: '0.75rem' }}>No hidden fees. Cancel anytime.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
            {plans.map((p) => (
              <div key={p.name} className="card" style={{ border: p.primary ? '2px solid var(--primary)' : 'none', position: 'relative', textAlign: 'center', padding: '2rem 1.5rem' }}>
                {p.primary && <div className="chip chip-orange" style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)' }}>Most Popular</div>}
                <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.5rem' }}>{p.name}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem' }}>{p.price}</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem', textAlign: 'left' }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem', color: 'var(--on-surface-variant)' }}>
                      <Check size={16} color="var(--primary)" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`btn ${p.primary ? 'btn-primary' : 'btn-outline'}`} style={{ width: '100%' }}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 1.5rem', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Ready to give your pet the best care?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', fontSize: '1.0625rem' }}>Join thousands of happy pet parents on Petzee today.</p>
          <Link to="/register" className="btn" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 700, fontSize: '1rem', padding: '1rem 2.25rem' }}>
            Create Free Account <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem 1.5rem', background: 'var(--surface-container)', textAlign: 'center' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--outline)' }}>© 2026 Petzee. Made with ❤️ for pet lovers.</p>
      </footer>
    </div>
  );
}
