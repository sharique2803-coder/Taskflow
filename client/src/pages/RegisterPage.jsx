import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, CheckCircle2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const steps = [
  'Create your free account',
  'Set up your first task',
  'Track your progress',
];

function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 6 characters', pass: password.length >= 6 },
    { label: 'Contains a number',     pass: /\d/.test(password) },
    { label: 'Contains a letter',     pass: /[a-zA-Z]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ['bg-slate-200', 'bg-rose-400', 'bg-amber-400', 'bg-emerald-400'];
  const labels = ['', 'Weak', 'Fair', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score] : 'bg-slate-100'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {checks.map(({ label, pass }) => (
            <span key={label} className={`flex items-center gap-1 text-xs transition-colors ${pass ? 'text-emerald-500' : 'text-slate-300'}`}>
              <Check className="w-3 h-3" />
              {label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className={`text-xs font-semibold ${score === 3 ? 'text-emerald-500' : score === 2 ? 'text-amber-500' : 'text-rose-400'}`}>
            {labels[score]}
          </span>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form,         setForm]         = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [errors,       setErrors]       = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())              e.name    = 'Name is required';
    else if (form.name.trim().length < 2) e.name  = 'Name must be at least 2 characters';
    if (!form.email)                    e.email   = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)                 e.password = 'Password is required';
    else if (form.password.length < 6)  e.password = 'Password must be at least 6 characters';
    if (!form.confirm)                  e.confirm = 'Please confirm your password';
    else if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const result = await register(form.name.trim(), form.email, form.password);
    if (result.success) {
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  const inputClass = (key) =>
    `w-full px-4 py-3 rounded-xl border text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all ${
      errors[key] ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50 focus:bg-white'
    }`;

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}
          />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">TaskFlow</span>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Start your<br />
              <span className="text-indigo-200">productivity journey</span>
            </h2>
            <p className="text-indigo-200 text-base leading-relaxed">
              Join thousands of people who use TaskFlow to stay on top of their work.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-5">
            {steps.map((step, i) => (
              <div key={step} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shrink-0 text-white font-bold text-sm">
                  {i + 1}
                </div>
                <span className="text-indigo-100 text-sm font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white font-bold text-xs">
                MR
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Mohammad R.</p>
                <p className="text-indigo-300 text-xs">Product Designer</p>
              </div>
            </div>
            <p className="text-indigo-100 text-sm italic leading-relaxed">
              "TaskFlow changed how I manage my daily work. Simple, fast, and beautiful."
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">TaskFlow</span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create an account</h1>
            <p className="text-slate-400 mt-2 text-sm">Free forever. No credit card required.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className={inputClass('name')}
                />
                {errors.name && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className={inputClass('email')}
                />
                {errors.email && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    className={inputClass('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.password}</p>}
                <PasswordStrength password={form.password} />
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    placeholder="••••••••"
                    className={inputClass('confirm')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirm && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.confirm}</p>}
                {form.confirm && form.password === form.confirm && !errors.confirm && (
                  <p className="text-emerald-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Passwords match
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-60 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-200 text-sm mt-2"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
