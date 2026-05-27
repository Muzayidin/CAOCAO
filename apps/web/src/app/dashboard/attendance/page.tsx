'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, Sparkles, X, MapPin, QrCode, RefreshCw,
  ChevronRight, Keyboard, LogIn, LogOut
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '@/lib/api-client';

interface AttendanceRecord {
  id: string;
  employeeName: string;
  clockIn: string;
  clockOut: string;
  hours: number;
  date: string;
  status: string;
  location: string;
  locationOut?: string;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  hoursWorked: number;
  baseRate: number;
  pin: string;
}

export default function StaffAttendancePage() {
  // Data States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [hrPolicy, setHrPolicy] = useState<any>({
    lateTolerance: 15,
    overtimeRate: 20000,
    latePenaltyHours: 1,
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<'attendance' | 'management'>('attendance');

  // UI States
  const [gpsMode, setGpsMode] = useState<'CAFE' | 'AWAY'>('CAFE');
  const [clockPin, setClockPin] = useState('');
  const [isNumpadVisible, setIsNumpadVisible] = useState(false);
  
  // QR States
  const [activeQrEmployee, setActiveQrEmployee] = useState<Employee | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Dynamic QR Code States
  const [activeAttendanceToken, setActiveAttendanceToken] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  // Real-time time display
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
      setCurrentTime(`${timeStr} • ${dateStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const loadAllConfigs = async () => {
      try {
        const [empData, attData] = await Promise.all([
          api.auth.getUsers(), // Employees are users in this system context
          api.employee.getAttendance()
        ]);
        setEmployees(empData);
        setAttendances(attData);
      } catch (err) {
        console.log('Employee/Attendance API Server offline, fallback mock mode activated.');
        const storedEmps = localStorage.getItem('pos_employees');
        if (storedEmps) {
          setEmployees(JSON.parse(storedEmps));
        } else {
          const fallbackEmps: Employee[] = [
            { id: 'emp1', name: 'Alex Harrison', role: 'BARISTA', hoursWorked: 160, baseRate: 15000, pin: '1111' },
            { id: 'emp2', name: 'Siti Aminah', role: 'CASHIER', hoursWorked: 142, baseRate: 12000, pin: '2222' },
            { id: 'emp3', name: 'Jono Raharjo', role: 'WAITER', hoursWorked: 168, baseRate: 16000, pin: '3333' },
          ];
          setEmployees(fallbackEmps);
          localStorage.setItem('pos_employees', JSON.stringify(fallbackEmps));
        }

        const storedAtts = localStorage.getItem('pos_attendances');
        if (storedAtts) {
          setAttendances(JSON.parse(storedAtts));
        } else {
          const fallbackAtts: AttendanceRecord[] = [
            { id: 'att-1', employeeName: 'Alex Harrison', clockIn: '08:45', clockOut: '-', hours: 0, date: new Date().toLocaleDateString('id-ID'), status: 'Hadir', location: 'Cafe Caocao (GPS: -6.2088, 106.8456)' },
          ];
          setAttendances(fallbackAtts);
          localStorage.setItem('pos_attendances', JSON.stringify(fallbackAtts));
        }
      }

      const storedPolicy = localStorage.getItem('pos_hr_policy');
      if (storedPolicy) setHrPolicy(JSON.parse(storedPolicy));
    };

    loadAllConfigs();
    const handleStorageChange = () => loadAllConfigs();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleRegeneratePin = (empId: string) => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    const updated = employees.map(emp => emp.id === empId ? { ...emp, pin: newPin } : emp);
    setEmployees(updated);
    localStorage.setItem('pos_employees', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleGenerateDynamicQr = () => {
    const randomCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    const timestamp = Date.now();
    const token = 'QR-ATT-' + randomCode + '-' + timestamp;
    setActiveAttendanceToken(token);
    setTimeLeft(60);
    localStorage.setItem('pos_active_attendance_token', token);
    localStorage.setItem('pos_active_attendance_timestamp', timestamp.toString());
    window.dispatchEvent(new Event('storage'));
  };

  const performAttendanceLogic = async (matchedPin: string) => {
    const matched = employees.find(e => e.pin === matchedPin);
    if (!matched) {
      alert('PIN tidak terdaftar!');
      setClockPin('');
      return;
    }

    const todayDateStr = new Date().toLocaleDateString('id-ID');
    const existingIndex = attendances.findIndex(att => att.employeeName === matched.name && att.date === todayDateStr);
    const now = new Date();
    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > hrPolicy.lateTolerance);

    const locInfo = gpsMode === 'CAFE' ? 'CAOCAO HQ (-6.2088, 106.8456)' : 'AWAY (-6.2300, 106.8120)';
    const attStatus = gpsMode === 'CAFE' ? (isLate ? 'Terlambat' : 'Hadir') : 'Diluar Area (Tidak Valid)';

    try {
      if (existingIndex === -1) {
        await api.employee.clockIn({ employeeId: matched.id, location: locInfo });
      } else {
        const existingRecord = attendances[existingIndex];
        if (existingRecord.clockOut !== '-') return;
        await api.employee.clockOut({ employeeId: matched.id, location: locInfo });
      }
      // Refresh data after success
      const attData = await api.employee.getAttendance();
      setAttendances(attData);
    } catch (err) {
      console.log('Attendance API Error, using local fallback.');
      if (existingIndex === -1) {
        const record: AttendanceRecord = {
          id: 'att-' + Math.random().toString(36).slice(2, 6),
          employeeName: matched.name,
          clockIn: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          clockOut: '-',
          hours: 0,
          date: todayDateStr,
          status: attStatus,
          location: locInfo,
        };
        const updated = [record, ...attendances];
        setAttendances(updated);
        localStorage.setItem('pos_attendances', JSON.stringify(updated));
      } else {
        const existingRecord = attendances[existingIndex];
        if (existingRecord.clockOut !== '-') return;
        const hoursSim = (attStatus.includes('Diluar Area')) ? 0 : 8.0;
        const updatedAtts = attendances.map((att, idx) => idx === existingIndex ? { ...att, clockOut: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), hours: hoursSim, locationOut: locInfo, status: attStatus.includes('Diluar Area') ? 'Diluar Area' : att.status } : att);
        const updatedEmps = employees.map(emp => emp.id === matched.id ? { ...emp, hoursWorked: emp.hoursWorked + hoursSim } : emp);
        setAttendances(updatedAtts);
        setEmployees(updatedEmps);
        localStorage.setItem('pos_attendances', JSON.stringify(updatedAtts));
        localStorage.setItem('pos_employees', JSON.stringify(updatedEmps));
      }
    }
    
    setClockPin('');
    setIsNumpadVisible(false);
    window.dispatchEvent(new Event('storage'));
  };

  const getTimerCircleColor = () => {
    if (timeLeft > 30) return '#4B5320';
    if (timeLeft > 10) return '#5a632e';
    return '#ba1a1a';
  };

  return (
    <div className="font-manrope space-y-8 max-w-7xl mx-auto px-1 py-4 text-left">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-cafe-200/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-espresso-900 rounded-2xl flex items-center justify-center shadow-premium">
            <Clock className="w-6 h-6 text-inverse-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-espresso-900 tracking-tight">Staff Attendance</h1>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">Workspace Gateway & Geofencing</p>
          </div>
        </div>

        <div className="flex bg-cafe-50 p-1 rounded-2xl border border-cafe-200/40 w-fit">
          <button onClick={() => setActiveTab('attendance')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'attendance' ? 'bg-white text-espresso-900 shadow-sm' : 'text-on-surface-variant hover:text-espresso-900'}`}>Clock In/Out</button>
          <button onClick={() => setActiveTab('management')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'management' ? 'bg-white text-espresso-900 shadow-sm' : 'text-on-surface-variant hover:text-espresso-900'}`}>Admin Console</button>
        </div>
      </header>

      {activeTab === 'attendance' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <main className="lg:col-span-7 flex flex-col items-center gap-8">
            <section className="w-full">
              <h2 className="text-3xl font-bold text-espresso-900">Good Morning, Staff</h2>
              <p className="text-sm font-medium text-on-surface-variant mt-1">{currentTime}</p>
            </section>

            <section className="bg-white rounded-[40px] p-10 shadow-premium w-full max-w-[380px] flex flex-col items-center relative border border-cafe-200/50">
              <div className="relative w-64 h-64 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="#F1EDEC" strokeWidth="4" />
                  <circle 
                    cx="50" cy="50" r="48" fill="none" 
                    stroke={getTimerCircleColor()} strokeWidth="4" 
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={(2 * Math.PI * 48) * (1 - (timeLeft / 60))}
                    className="transition-all duration-1000 linear"
                  />
                </svg>
                <div className="bg-white p-5 rounded-3xl z-10 shadow-glass">
                  {timeLeft > 0 ? (
                    <QRCodeSVG value={activeAttendanceToken} size={160} />
                  ) : (
                    <div className="w-40 h-40 flex flex-col items-center justify-center text-cafe-200 bg-cafe-50 rounded-2xl">
                      <QrCode className="w-12 h-12 mb-3" />
                      <p className="text-[10px] font-bold uppercase tracking-wider">Token Expired</p>
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-8 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Scan to Clock In</p>
              <div className="text-lg font-black text-espresso-900 mt-1 font-mono tracking-[0.2em]">{timeLeft > 0 ? `00:${timeLeft.toString().padStart(2, '0')}` : 'RELOAD'}</div>
              <button onClick={handleGenerateDynamicQr} className="mt-6 p-3 bg-cafe-50 rounded-full hover:bg-cafe-100 transition-colors">
                <RefreshCw className={`w-5 h-5 text-earth-olive ${timeLeft > 0 ? '' : 'animate-spin'}`} />
              </button>
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-cafe-200/50 w-full max-w-[460px]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-espresso-900">Geofencing Status</h3>
                  <p className="text-[10px] font-mono font-bold text-outline mt-0.5 uppercase tracking-tighter">40.7128° N, 74.0060° W</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border ${gpsMode === 'CAFE' ? 'bg-secondary-container/50 text-on-secondary-container border-secondary-container/30' : 'bg-error-container text-on-error-container border-error-container/30'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${gpsMode === 'CAFE' ? 'bg-earth-olive animate-pulse' : 'bg-error'}`}></span>
                  {gpsMode === 'CAFE' ? 'VALID (IN RADIUS)' : 'INVALID (OUTSIDE)'}
                </div>
              </div>
              <div className="h-28 w-full rounded-2xl overflow-hidden grayscale relative border border-cafe-100">
                <img className="w-full h-full object-cover opacity-40" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDttI8RmvtHy1U0E6Lf6ybOtiHFhN4FNSY_THBBNOP8yo_fP031ol5d2vBCOvY7qmYE0U8z6OctBwuWYprw6KhEJXVKqyONxXEkDEg5HR_DHaVnVzKXpp5uoYGUNTAR-coFpOUPWCog2Etn9E_b7JuV7FHHmJPhHLW_Tniizyq5fsGc26_HWBWjde9aimW8T-cK0dYDjpfg9UlhdMC6-Wla82rApviL4S9rb6Cq_m-iB9g1xS_Bo-S8J3gyg78PqjAMld7GIWMwtMg" alt="Geofence Map" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="p-2 bg-espresso-900 text-white rounded-full shadow-lg">
                      <MapPin className="w-4 h-4" />
                   </div>
                </div>
                <div className="absolute bottom-2 right-2 flex bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-cafe-200/50 text-[8px] font-bold">
                  <button onClick={() => setGpsMode('CAFE')} className={`px-2 py-0.5 rounded ${gpsMode === 'CAFE' ? 'bg-earth-olive text-white' : 'text-cafe-400'}`}>CAFE</button>
                  <button onClick={() => setGpsMode('AWAY')} className={`px-2 py-0.5 rounded ${gpsMode === 'AWAY' ? 'bg-error text-white' : 'text-cafe-400'}`}>AWAY</button>
                </div>
              </div>
            </section>

            <button onClick={() => setIsNumpadVisible(!isNumpadVisible)} className="flex items-center justify-between w-full max-w-[460px] h-[64px] bg-white rounded-2xl px-6 border border-cafe-200/50 shadow-sm active:scale-[0.98] transition-all">
              <div className="flex items-center gap-4">
                <Keyboard className="w-5 h-5 text-espresso-900" />
                <span className="text-sm font-bold text-espresso-900">Enter PIN Manually</span>
              </div>
              <ChevronRight className={`w-5 h-5 text-outline transition-transform ${isNumpadVisible ? 'rotate-90' : ''}`} />
            </button>

            {isNumpadVisible && (
              <div className="bg-white rounded-[32px] p-6 border border-cafe-200/50 shadow-premium w-full max-w-[460px] animate-scale-up space-y-6">
                <div className="w-full flex justify-center gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${i < clockPin.length ? 'bg-espresso-900 border-espresso-900 scale-110' : 'border-cafe-200'}`} />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1,2,3,4,5,6,7,8,9, 'C', 0, 'OK'].map((k) => (
                    <button key={k} onClick={() => {
                      if (k === 'C') setClockPin('');
                      else if (k === 'OK') performAttendanceLogic(clockPin);
                      else if (clockPin.length < 4) setClockPin(clockPin + k.toString());
                    }} className={`h-14 rounded-2xl flex items-center justify-center font-bold text-lg active:scale-90 transition-all ${k === 'OK' ? 'bg-earth-olive text-white' : k === 'C' ? 'bg-error-container text-error' : 'bg-cafe-50 text-espresso-900'}`}>{k}</button>
                  ))}
                </div>
              </div>
            )}
          </main>

          <aside className="lg:col-span-5 space-y-6">
             <div className="flex justify-between items-center px-2">
                <h3 className="text-xl font-bold text-espresso-900">Recent Shifts</h3>
                <button className="text-xs font-bold text-earth-olive hover:underline">View All</button>
             </div>
             <div className="space-y-4">
                {attendances.map((att) => (
                  <div key={att.id} className="bg-white rounded-3xl p-5 flex items-center justify-between border border-cafe-200/40 shadow-sm group hover:border-espresso-900/10 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${att.clockOut === '-' ? 'bg-secondary-container/40 text-earth-olive' : 'bg-cafe-50 text-on-surface-variant'}`}>
                           {att.clockOut === '-' ? <LogIn className="w-5 h-5" /> : <LogOut className="w-5 h-5" />}
                        </div>
                        <div>
                           <p className="font-bold text-espresso-900">{att.employeeName}</p>
                           <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-0.5">{att.date} • {att.clockIn} {att.clockOut !== '-' ? `→ ${att.clockOut}` : ''}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase border ${att.status === 'Hadir' ? 'bg-earth-olive/10 text-earth-olive border-earth-olive/20' : 'bg-error-container/20 text-error border-error-container/30'}`}>{att.status}</span>
                        <p className="text-[10px] font-bold text-on-surface-variant mt-1">{att.hours > 0 ? `${att.hours} hrs` : 'Active'}</p>
                     </div>
                  </div>
                ))}
             </div>
          </aside>
        </div>
      ) : (
        <div className="animate-scale-up bg-white rounded-[32px] p-8 border border-cafe-200/50 shadow-premium">
           <div className="flex justify-between items-center mb-8 border-b border-cafe-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-espresso-900">Roster Management</h2>
                <p className="text-xs text-on-surface-variant font-medium">Manage employee PINs and attendance policies</p>
              </div>
              <button className="px-4 py-2 bg-espresso-900 text-white rounded-xl text-xs font-bold active:scale-95 shadow-md">Add Staff</button>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-cafe-50">
                    <th className="pb-4 px-2">Staff Name</th>
                    <th className="pb-4 px-2">Role</th>
                    <th className="pb-4 px-2 text-center">PIN</th>
                    <th className="pb-4 px-2 text-center">Work Hours</th>
                    <th className="pb-4 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cafe-50">
                   {employees.map(emp => (
                     <tr key={emp.id} className="group">
                        <td className="py-4 px-2 font-bold text-espresso-900 text-sm">{emp.name}</td>
                        <td className="py-4 px-2"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cafe-50 border border-cafe-200">{emp.role}</span></td>
                        <td className="py-4 px-2 text-center font-mono font-black text-espresso-900 tracking-widest">{emp.pin}</td>
                        <td className="py-4 px-2 text-center font-bold text-earth-olive text-sm">{emp.hoursWorked.toFixed(1)}h</td>
                        <td className="py-4 px-2 text-right">
                           <button onClick={() => { setActiveQrEmployee(emp); setIsQrModalOpen(true); }} className="p-2 hover:bg-cafe-50 rounded-lg text-espresso-900 transition-colors"><QrCode className="w-4 h-4" /></button>
                           <button onClick={() => handleRegeneratePin(emp.id)} className="p-2 hover:bg-cafe-50 rounded-lg text-earth-olive transition-colors"><Sparkles className="w-4 h-4" /></button>
                        </td>
                     </tr>
                   ))}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {isQrModalOpen && activeQrEmployee && (
        <div className="fixed inset-0 bg-espresso-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-[40px] p-8 max-w-sm w-full shadow-premium animate-scale-up text-center border border-cafe-100">
              <div className="flex justify-between items-center mb-8">
                <span className="bg-cafe-50 px-3 py-1 rounded-full text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Employee Card</span>
                <button onClick={() => setIsQrModalOpen(false)} className="p-2 bg-cafe-50 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              <div className="bg-cafe-50 rounded-[32px] p-8 mb-6 border border-cafe-200/50 shadow-inner inline-block">
                <div className="bg-white p-4 rounded-2xl shadow-glass border border-cafe-100">
                  <QRCodeSVG value={`QR-EMP-${activeQrEmployee.pin}`} size={160} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-espresso-900 mb-1">{activeQrEmployee.name}</h3>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-8">{activeQrEmployee.role} • PIN: {activeQrEmployee.pin}</p>
              <button onClick={() => setIsQrModalOpen(false)} className="w-full py-4 bg-espresso-900 text-white rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-transform">Download Card</button>
           </div>
        </div>
      )}
    </div>
  );
}
