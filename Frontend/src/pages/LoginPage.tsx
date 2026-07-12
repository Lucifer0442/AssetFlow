import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, Zap } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>


export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await login(data.email, data.password)
      navigate('/dashboard')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — brand panel (dark plum, 40%) */}
      <div className="hidden lg:flex w-[40%] flex-col relative overflow-hidden" style={{ background: '#3D1F35' }}>
        {/* Faint network art */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" viewBox="0 0 500 700" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#C084A8" strokeWidth="0.5" fill="none">
              {Array.from({ length: 12 }, (_, i) => (
                <circle key={i} cx={100 + (i % 4) * 90} cy={80 + Math.floor(i / 4) * 160} r={3} fill="#C084A8" />
              ))}
              {Array.from({ length: 8 }, (_, i) => (
                <line key={i} x1={100 + (i % 4) * 90} y1={80 + Math.floor(i / 4) * 160} x2={190 + (i % 3) * 80} y2={240 + (i % 2) * 160} />
              ))}
              <circle cx="250" cy="350" r="120" strokeWidth="0.3" />
              <circle cx="250" cy="350" r="200" strokeWidth="0.2" />
            </g>
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10">
          <div>
            {/* Logo */}
            <div className="mb-16">
              <div>
                <p className="text-white font-bold text-lg tracking-tight">AssetFlow</p>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9C7A8A' }}>Enterprise Resource</p>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-white leading-tight">Manage every<br />asset.<br />Effortlessly.</h1>
            <p className="mt-4 text-base" style={{ color: '#C084A8' }}>
              One platform for allocation, bookings, maintenance, and audits — with role-based access for every team.
            </p>

            <div className="mt-10 space-y-3">
              {[
                { title: 'Asset Lifecycle Tracking', desc: 'From procurement to disposal' },
                { title: 'Smart Allocations', desc: 'Conflict-free with transfer flows' },
                { title: 'Resource Booking', desc: 'Calendar with overlap protection' },
                { title: 'Audit Cycles', desc: 'Discrepancy reports, one click' },
              ].map(f => (
                <div key={f.title} className="flex items-start gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{f.title}</p>
                    <p className="text-xs" style={{ color: '#9C7A8A' }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#5A3048' }}>
            Powered by AssetFlow ERP · v2.4
          </p>
        </div>
      </div>

      {/* Right — auth panel (white, 60%) */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <span className="font-bold text-lg" style={{ color: '#1A1621' }}>AssetFlow</span>
          </div>

          {/* Tab bar */}
          <div className="flex gap-0 mb-6 rounded-xl overflow-hidden" style={{ border: '1px solid #E7E5EA', background: '#F7F7F9' }}>
            {(['login', 'signup'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setActiveTab(t); if (t === 'signup') navigate('/signup') }}
                className="flex-1 py-2.5 text-sm font-semibold capitalize transition-all"
                style={activeTab === t
                  ? { background: '#7A3B5E', color: 'white', borderRadius: '10px' }
                  : { color: '#6B6470', background: 'transparent' }
                }
              >
                {t === 'login' ? 'Login' : 'Create Account'}
              </button>
            ))}
          </div>

          <h2 className="text-[28px] font-bold" style={{ color: '#1A1621' }}>Welcome back</h2>
          <p className="mt-1 text-sm" style={{ color: '#6B6470' }}>Sign in to your AssetFlow account</p>


          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#1A1621' }}>Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9C97A3' }} />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@company.com"
                  className="w-full pl-9 pr-3.5 py-3 rounded-xl border text-sm outline-none transition-all"
                  style={{ borderColor: '#E7E5EA', color: '#1A1621' }}
                  onFocus={e => e.target.style.borderColor = '#7A3B5E'}
                  onBlur={e => e.target.style.borderColor = '#E7E5EA'}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs" style={{ color: '#C0392B' }}>{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium" style={{ color: '#1A1621' }}>Password</label>
                <button type="button" className="text-xs font-medium hover:underline" style={{ color: '#7A3B5E' }}>Reset password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9C97A3' }} />
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-3 rounded-xl border text-sm outline-none transition-all"
                  style={{ borderColor: '#E7E5EA', color: '#1A1621' }}
                  onFocus={e => e.target.style.borderColor = '#7A3B5E'}
                  onBlur={e => e.target.style.borderColor = '#E7E5EA'}
                />
                <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9C97A3' }}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs" style={{ color: '#C0392B' }}>{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: '#7A3B5E' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#6E2F52' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#7A3B5E' }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Trust line */}
          <p className="mt-5 text-center text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#9C97A3' }}>
            🔒 Secure Corporate Access
          </p>
        </div>
      </div>
    </div>
  )
}
