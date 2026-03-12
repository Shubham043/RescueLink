import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BACKEND_URL } from '../src/config';

const ROLES = [
  {
    id: 'rescuer',
    label: 'Individual Rescuer',
    desc: 'Volunteer or trained individual responder',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 'ngo',
    label: 'NGO / Organization',
    desc: 'Registered organization or relief team',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
];

export default function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState('rescuer');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    orgName: '',
    orgWebsite: '',
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role,
        ...(role === 'ngo' && { orgName: formData.orgName, orgWebsite: formData.orgWebsite }),
      };
      const res = await axios.post(`${BACKEND_URL}/api/auth/register`, payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Account created! Welcome to RescueLink.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-blue-500/10 animate-ping" style={{ animationDuration: '5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-blue-400/8 animate-ping" style={{ animationDuration: '3.5s', animationDelay: '1.5s' }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          
          {/* Logo */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-3 shadow-lg shadow-blue-600/40">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Join RescueLink</h1>
            <p className="text-blue-300/60 text-sm mt-1">Create your rescuer account</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLES.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`flex flex-col items-start p-3.5 rounded-xl border transition-all duration-200 text-left ${
                  role === r.id
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'border-white/10 text-white/50 hover:border-white/25 hover:text-white/70'
                }`}
              >
                <div className={`mb-1.5 ${role === r.id ? 'text-blue-400' : ''}`}>{r.icon}</div>
                <span className="text-sm font-semibold leading-tight">{r.label}</span>
                <span className="text-xs mt-0.5 opacity-60">{r.desc}</span>
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-blue-200/70 mb-1.5">Username *</label>
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="john_rescue"
                  className="w-full border border-white/15 text-white placeholder-white/20 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-200/70 mb-1.5">Phone</label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765..."
                  className="w-full border border-white/15 text-white placeholder-white/20 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-blue-200/70 mb-1.5">Email Address *</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="rescuer@example.com"
                className="w-full border border-white/15 text-white placeholder-white/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />
            </div>

            {/* NGO-specific fields */}
            {role === 'ngo' && (
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-blue-500/20" style={{ background: 'rgba(59,130,246,0.07)' }}>
                <div>
                  <label className="block text-xs font-medium text-blue-200/70 mb-1.5">Organization Name *</label>
                  <input
                    name="orgName"
                    type="text"
                    value={formData.orgName}
                    onChange={handleChange}
                    placeholder="Relief Foundation"
                    className="w-full border border-white/15 text-white placeholder-white/20 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-200/70 mb-1.5">Website (optional)</label>
                  <input
                    name="orgWebsite"
                    type="url"
                    value={formData.orgWebsite}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full border border-white/15 text-white placeholder-white/20 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-blue-200/70 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="w-full border border-white/15 text-white placeholder-white/20 rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Password strength bar */}
              {formData.password && (
                <div className="mt-2 flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      formData.password.length >= i * 2
                        ? formData.password.length >= 8 ? 'bg-green-500' : 'bg-yellow-500'
                        : 'bg-white/10'
                    }`} />
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                `Create ${role === 'ngo' ? 'NGO' : 'Rescuer'} Account`
              )}
            </button>
          </form>

          <div className="flex items-center my-5">
            <div className="flex-1 border-t border-white/10" />
            <span className="px-3 text-white/25 text-xs">OR</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          <p className="text-center text-white/50 text-sm">
            Already a rescuer?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Sign in
            </button>
          </p>

          <p className="text-center text-white/25 text-xs mt-3">
            In an emergency?{' '}
            <button onClick={() => navigate('/')} className="text-red-400 hover:text-red-300 transition-colors">
              Get help now →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}