import { useState } from 'react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [role, setRole] = useState<'doctor' | 'admin'>('doctor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Branding & Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-indigo-900/90 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop" 
          alt="Medical Team" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
        />
        
        <div className="relative z-20 flex flex-col justify-between h-full p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">HealthGuard AI</span>
          </div>

          <div className="space-y-6 max-w-lg">
            <h1 className="text-4xl font-bold leading-tight">
              The Future of <br/>
              <span className="text-blue-200">Post-Operative Care</span>
            </h1>
            <p className="text-lg text-blue-100/80 leading-relaxed">
              Automate patient follow-ups, detect risks early with AI, and improve recovery outcomes with our intelligent monitoring platform.
            </p>
            
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-blue-50">Real-time Symptom Analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-blue-50">Automated WhatsApp Check-ins</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-blue-50">Instant Risk Alerts</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-blue-200/60">
            © 2024 HealthGuard AI. HIPAA Compliant Platform.
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 mt-2">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`text-sm font-medium py-2.5 rounded-md transition-all duration-200 ${
                  role === 'doctor' 
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                Medical Staff
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`text-sm font-medium py-2.5 rounded-md transition-all duration-200 ${
                  role === 'admin' 
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                Administrator
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input 
                    type="email" 
                    placeholder="name@hospital.com" 
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="remember" 
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" 
              />
              <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none">
                Keep me signed in for 30 days
              </label>
            </div>

            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all">
              Sign in to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <a href="#" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                Request Access
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
