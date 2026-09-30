import React, { useState } from 'react';
import { X, Lock, Mail, User, GraduationCap, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { UserProfile } from '../../types';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'teacher'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('BCA 3rd Year');
  const [studentId, setStudentId] = useState('');
  const [teacherName, setTeacherName] = useState('Prof. Rajesh Kumar Mishra');
  const [teacherKey, setTeacherKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'teacher') {
      if (!teacherKey.trim()) {
        setError('Please enter your generated teacher key');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        const teacherUser: UserProfile = {
          id: 'tch-001',
          fullName: teacherName,
          email: 'principal@niisgroup.org',
          role: 'teacher',
          department: 'Computer Applications & Administration',
          studentId: 'FACULTY-TCH-001',
          profilePic: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('niis_student_user', JSON.stringify(teacherUser));
        onSuccess(teacherUser);
        setLoading(false);
        onClose();
      }, 400);
      return;
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    setLoading(true);
    const endpoint = mode === 'login' ? '/api/auth/student/login' : '/api/auth/student/register';
    const body = mode === 'login' 
      ? { email, password }
      : { fullName, email, password, department, studentId };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('niis_student_user', JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem('niis_token', data.token);
      }
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-5 sm:p-7 shadow-2xl border border-white/20 my-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl glass-panel text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-5">
          <h2 className="text-2xl font-black text-white tracking-tight font-display">
            {mode === 'login' ? 'Student Sign In' : mode === 'register' ? 'Create Student Account' : 'Teacher Portal Login'}
          </h2>
          <p className="text-xs text-white/50 mt-1">
            {mode === 'teacher' 
              ? 'Enter teacher credentials and generated key to view your class schedule'
              : 'Access saved campus places, customized routes & preferences'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 rounded-2xl bg-white/5 mb-5">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login' ? 'bg-[#FF3FA4] text-white shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'register' ? 'bg-[#FF3FA4] text-white shadow-md' : 'text-white/60 hover:text-white'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => { setMode('teacher'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'teacher' ? 'bg-[#00f0ff] text-[#08070B] shadow-md font-black' : 'text-white/60 hover:text-white'
            }`}
          >
            Teacher
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'teacher' ? (
            /* Teacher Login Mode (Requirement 29) */
            <>
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">
                  TEACHER NAME
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00f0ff]" />
                  <input
                    type="text"
                    required
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="e.g. Prof. Rajesh Kumar Mishra"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">
                  GENERATED KEY
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    required
                    value={teacherKey}
                    onChange={(e) => setTeacherKey(e.target.value)}
                    placeholder="Enter key (e.g. TCH-KEY-2026)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs font-mono focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#0099ff] hover:brightness-110 disabled:opacity-50 text-[#08070B] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00f0ff]/20 transition-all cursor-pointer mt-4 min-h-[44px]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>LOGIN TO TEACHER PORTAL</span>}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTeacherName('Prof. Rajesh Kumar Mishra');
                    setTeacherKey('TCH-KEY-2026');
                  }}
                  className="text-[11px] text-[#00f0ff] hover:underline cursor-pointer"
                >
                  Autofill Demo Teacher Key (TCH-KEY-2026)
                </button>
              </div>
            </>
          ) : (
            /* Student Login & Register Modes */
            <>
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">
                      FULL NAME
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Aman Sharma"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:border-[#FF3FA4]"
                      />
                    </div>
                  </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">
                  DEPARTMENT
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:border-[#FF3FA4] bg-[#171019]"
                  >
                    <option value="BCA 1st Year">BCA 1st Year</option>
                    <option value="BCA 2nd Year">BCA 2nd Year</option>
                    <option value="BCA 3rd Year">BCA 3rd Year</option>
                    <option value="B.Sc Computer Science">B.Sc Computer Science</option>
                    <option value="MCA Department">MCA Department</option>
                    <option value="MBA Department">MBA Department</option>
                    <option value="BBA Department">BBA Department</option>
                    <option value="Faculty / Staff">Faculty / Staff</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">
                  STUDENT ID / ROLL NO. (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. NIIS-BCA-2024-042"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:border-[#FF3FA4]"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@student.niis.ac.in"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:border-[#FF3FA4]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">
              PASSWORD
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:border-[#FF3FA4]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 mb-1">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs focus:outline-none focus:border-[#FF3FA4]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF3FA4] to-[#c73570] hover:brightness-110 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FF3FA4]/20 transition-all cursor-pointer mt-4"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'SIGN IN TO GEONAV' : 'REGISTER STUDENT ACCOUNT'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Demo Credentials Autofill Helper */}
          {mode === 'login' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('student@niis.ac.in');
                  setPassword('student123');
                }}
                className="text-[11px] text-[#E9B95F] hover:underline cursor-pointer"
              >
                Fill Demo Student Credentials (student@niis.ac.in)
              </button>
            </div>
          )}
            </>
          )}
        </form>
      </div>
    </div>
  );
};
