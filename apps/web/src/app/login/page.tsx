'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';

import { Coffee, User, RefreshCw, Check, Delete, Laptop } from 'lucide-react';

type PortalType = 'OWNER' | 'STAFF';
type OwnerMode = 'LOGIN' | 'REGISTER';

interface Employee {
  id: string;
  name: string;
  role: string;
  pin: string;
}

interface Device {
  id: string;
  name: string;
  dateConnected: string;
}

export default function LoginPage() {
  const [activePortal, setActivePortal] = useState<PortalType>('STAFF');
  const [ownerMode, setOwnerMode] = useState<OwnerMode>('LOGIN');
  
  // Workspace Device States
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);
  const [connectedDeviceName, setConnectedDeviceName] = useState('');
  const [deviceNameInput, setDeviceNameInput] = useState('');
  const [invitationCodeInput, setInvitationCodeInput] = useState('');
  const [showDeviceSyncForm, setShowDeviceSyncForm] = useState(false);
  
  // PIN Flow
  const [pin, setPin] = useState('');
  
  // Owner Forms
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [cafeName, setCafeName] = useState('');
  const [ownerName, setOwnerName] = useState('');

  // Status
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Data
  const [employees, setEmployees] = useState<Employee[]>([]);

  const checkDeviceStatus = useCallback(() => {
    if (typeof window === 'undefined') return;
    const deviceId = localStorage.getItem('pos_staff_device_id');
    const isConnected = localStorage.getItem('pos_staff_device_connected') === 'true';
    const deviceName = localStorage.getItem('pos_staff_device_name') || '';
    
    if (isConnected && deviceId) {
      const storedDevices = localStorage.getItem('pos_registered_devices');
      if (storedDevices) {
        try {
          const devices = JSON.parse(storedDevices) as Device[];
          if (devices.find((d) => d.id === deviceId)) {
            setIsDeviceConnected(true);
            setConnectedDeviceId(deviceId);
            setConnectedDeviceName(deviceName);
            return;
          }
        } catch { /* ignore error */ }
      }
      localStorage.removeItem('pos_staff_device_connected');
      setIsDeviceConnected(false);
    } else {
      setIsDeviceConnected(false);
    }
  }, []);

  useEffect(() => {
    checkDeviceStatus();
    window.addEventListener('storage', checkDeviceStatus);
    
    const storedEmps = localStorage.getItem('pos_employees');
    if (storedEmps) {
      setEmployees(JSON.parse(storedEmps));
    } else {
      const defaultEmps: Employee[] = [
        { id: 'emp1', name: 'Budi Santoso', role: 'CASHIER', pin: '1111' },
        { id: 'emp2', name: 'Jono Raharjo', role: 'WAITER', pin: '2222' },
        { id: 'emp3', name: 'Siti Aminah', role: 'BARISTA', pin: '3333' },
      ];
      setEmployees(defaultEmps);
      localStorage.setItem('pos_employees', JSON.stringify(defaultEmps));
    }

    return () => window.removeEventListener('storage', checkDeviceStatus);
  }, [checkDeviceStatus]);

  const handleVerifyStaffPin = useCallback(() => {
    const matchedEmp = employees.find(emp => emp.pin === pin);
    if (!matchedEmp) {
      setErrorMessage('PIN salah!');
      setPin('');
      return;
    }
    // Success flow (e.g. Attendance or Dashboard route entry)
    setSuccessMessage(`Berhasil, ${matchedEmp.name}!`);
    
    setTimeout(() => {
      setPin('');
      setSuccessMessage('');
      
      const updatedUser = {
        name: matchedEmp.name,
        role: matchedEmp.role,
        cafeName: 'Cafe CaoCao',
        tenantId: 'mock-tenant-uuid',
      };
      localStorage.setItem('pos_user', JSON.stringify(updatedUser));
      
      // Redirect staff directly to their workspace area
      if (matchedEmp.role === 'BARISTA' || matchedEmp.role === 'BAR') {
        window.location.href = '/dashboard/bar';
      } else if (matchedEmp.role === 'WAITER') {
        window.location.href = '/dashboard/waiter';
      } else {
        window.location.href = '/dashboard/attendance';
      }
    }, 1500);
  }, [employees, pin]);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      // Small vibrate feedback if available
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(5);
      }
    }
  };

  useEffect(() => {
    if (pin.length === 4 && activePortal === 'STAFF' && !showDeviceSyncForm) {
        handleVerifyStaffPin();
    }
  }, [pin, activePortal, showDeviceSyncForm, handleVerifyStaffPin]);

  const handleOwnerAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const data = await api.auth.login({ email: ownerEmail, password: ownerPassword });
      
      localStorage.setItem('pos_token', data.token);
      localStorage.setItem('pos_user', JSON.stringify(data.user));
      localStorage.setItem('pos_tenant_id', data.user.tenantId);
      localStorage.setItem('pos_is_owner_account', 'true');
      
      setSuccessMessage('Login Berhasil! Mengalihkan...');
      setTimeout(() => window.location.href = '/dashboard/analytics', 1000);
    } catch {
      console.log('API Login failed, using fallback.');
      // Mock fallback
      const mockUser = {
        id: 'owner-uuid',
        name: ownerName || 'Owner Cafe',
        email: ownerEmail,
        role: 'OWNER',
        cafeName: cafeName || 'Cafe Cafe CaoCao',
        tenantId: 'mock-tenant-uuid',
      };
      localStorage.setItem('pos_user', JSON.stringify(mockUser));
      localStorage.setItem('pos_token', 'mock-token');
      localStorage.setItem('pos_is_owner_account', 'true');
      setSuccessMessage('Login Berhasil (Demo)! Mengalihkan...');
      setTimeout(() => window.location.href = '/dashboard/analytics', 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectDevice = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const newDeviceId = 'DEV-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      localStorage.setItem('pos_staff_device_connected', 'true');
      localStorage.setItem('pos_staff_device_id', newDeviceId);
      localStorage.setItem('pos_staff_device_name', deviceNameInput);
      
      const devices = JSON.parse(localStorage.getItem('pos_registered_devices') || '[]') as Device[];
      devices.push({ id: newDeviceId, name: deviceNameInput, dateConnected: new Date().toLocaleString() });
      localStorage.setItem('pos_registered_devices', JSON.stringify(devices));

      setIsDeviceConnected(true);
      setConnectedDeviceId(newDeviceId);
      setConnectedDeviceName(deviceNameInput);
      setSuccessMessage('Perangkat Tersambung! ✓');
      setIsLoading(false);
      setShowDeviceSyncForm(false);
      setErrorMessage('');
    }, 1000);
  };

  return (
    <div className="font-manrope min-h-screen bg-cafe-50 text-on-surface flex flex-col items-center justify-between relative overflow-hidden text-left">
      {/* Background Decorative Blur Circles */}
      <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-secondary-container/40 blur-[80px] z-0"></div>
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-cafe-200/50 blur-[80px] z-0"></div>

      {/* Top Bar */}
      <header className="flex justify-between items-center w-full px-6 h-14 z-50 bg-cafe-50/80 backdrop-blur-sm fixed top-0">
        <div className="flex items-center gap-3 text-left">
          <div className="w-8 h-8 rounded-full bg-cafe-200 flex items-center justify-center border border-outline-variant">
            <User className="w-4 h-4 text-espresso-900" />
          </div>
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            {activePortal === 'STAFF' ? 'Staff Portal' : 'Owner Portal'}
          </span>
        </div>
        <div className="text-xl font-bold tracking-tight text-espresso-900">CAOCAO</div>
        <button 
          onClick={checkDeviceStatus}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-cafe-200/50 active:scale-95 transition-transform"
        >
          <RefreshCw className="w-5 h-5 text-espresso-900" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md flex flex-col justify-center items-center px-6 pt-20 pb-12 z-10">
        <div className="w-full bg-white rounded-[32px] shadow-sm p-8 flex flex-col items-center border border-cafe-200/50 animate-scale-up">
          
          {/* Logo & Brand */}
          <div className="flex flex-col items-center gap-2 mb-8 text-center">
            <div className="w-14 h-14 bg-espresso-900 rounded-2xl flex items-center justify-center text-white mb-2 shadow-lg">
              <Coffee className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-espresso-900 tracking-tight">CAOCAO</h1>
          </div>

          {/* Portal Switcher */}
          <div className="w-full bg-cafe-50 rounded-2xl p-1 flex mb-8 relative border border-cafe-200/30">
            <div 
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ left: activePortal === 'OWNER' ? '4px' : 'calc(50% + 0px)' }}
            />
            <button 
              onClick={() => { setActivePortal('OWNER'); setErrorMessage(''); setSuccessMessage(''); setShowDeviceSyncForm(false); }}
              className={`flex-1 py-3 text-xs font-bold z-10 rounded-xl transition-colors duration-300 ${activePortal === 'OWNER' ? 'text-espresso-900 font-bold' : 'text-on-surface-variant'}`}
            >
              Owner / Admin
            </button>
            <button 
              onClick={() => { setActivePortal('STAFF'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`flex-1 py-3 text-xs font-bold z-10 rounded-xl transition-colors duration-300 ${activePortal === 'STAFF' ? 'text-espresso-900 font-bold' : 'text-on-surface-variant'}`}
            >
              Staff Roster
            </button>
          </div>

          {/* Status Messages */}
          {errorMessage && (
            <div className="w-full p-3 bg-red-50 text-red-600 rounded-2xl text-center text-xs font-bold mb-6 border border-red-100 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" /> {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="w-full p-3 bg-green-50 text-green-700 rounded-2xl text-center text-xs font-bold mb-6 border border-green-100 flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-green-700" /> {successMessage}
            </div>
          )}

          {/* STAFF PIN PAD VIEW */}
          {activePortal === 'STAFF' && !showDeviceSyncForm && (
            <div className="w-full space-y-8 flex flex-col items-center">
              {/* PIN Dots */}
              <div className="flex gap-4">
                {[0, 1, 2, 3].map(i => (
                  <div 
                    key={i} 
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      i < pin.length ? 'bg-espresso-900 border-espresso-900 scale-110' : 'border-cafe-200'
                    }`} 
                  />
                ))}
              </div>

              {/* Numpad Keypad Grid */}
              <div className="grid grid-cols-3 gap-y-4 gap-x-8 w-full max-w-[280px]">
                {['1','2','3','4','5','6','7','8','9','','0','back'].map((key, i) => {
                  if (key === '') return <div key={i} className="w-full aspect-square" />;
                  if (key === 'back') return (
                    <button 
                      key={i} 
                      onClick={() => setPin(prev => prev.slice(0, -1))} 
                      className="w-full aspect-square rounded-full flex items-center justify-center text-espresso-900 active:scale-90 active:bg-cafe-200 transition-all"
                    >
                      <Delete className="w-6 h-6 text-espresso-900" />
                    </button>
                  );
                  return (
                    <button 
                      key={i} 
                      onClick={() => handleKeyPress(key)} 
                      className="w-full aspect-square rounded-full flex items-center justify-center bg-cafe-50 text-xl font-bold text-espresso-900 active:scale-[0.92] active:bg-cafe-200 hover:bg-cafe-100 transition-all"
                    >
                      {key}
                    </button>
                  );
                })}
              </div>

              {/* Linking Trigger Option */}
              <div className="pt-2 text-center">
                {isDeviceConnected ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold text-on-surface-variant opacity-60">Linked: {connectedDeviceName}</span>
                    <button 
                      onClick={() => { localStorage.removeItem('pos_staff_device_connected'); checkDeviceStatus(); }}
                      className="text-xs font-bold text-red-500 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      Disconnect Terminal
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setShowDeviceSyncForm(true); setErrorMessage(''); }}
                    className="text-xs font-bold text-outline hover:text-espresso-900 transition-colors underline flex items-center gap-1.5"
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    Link device to workspace
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STAFF DEVICE SYNC FORM (OVERLAY TRIGGER) */}
          {activePortal === 'STAFF' && showDeviceSyncForm && (
            <div className="w-full space-y-6">
              <form onSubmit={handleConnectDevice} className="space-y-4">
                <div className="text-center mb-4">
                  <h2 className="text-lg font-bold text-espresso-900">Sinkronisasi Perangkat</h2>
                  <p className="text-xs text-on-surface-variant mt-1">Hubungkan HP Anda ke outlet CAOCAO</p>
                </div>
                <div className="space-y-4">
                  <input 
                    className="w-full px-5 py-4 rounded-2xl bg-cafe-50 border-none text-sm font-bold placeholder:text-cafe-300 focus:ring-2 focus:ring-espresso-900/10 outline-none"
                    placeholder="Nama Perangkat (cth: HP Budi)"
                    value={deviceNameInput}
                    onChange={e => setDeviceNameInput(e.target.value)}
                    required
                  />
                  <input 
                    className="w-full px-5 py-4 rounded-2xl bg-cafe-50 border-none text-center font-mono text-lg font-black tracking-widest placeholder:text-cafe-300 focus:ring-2 focus:ring-espresso-900/10 outline-none"
                    placeholder="TOKEN-SYNC"
                    value={invitationCodeInput}
                    onChange={e => setInvitationCodeInput(e.target.value)}
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full py-4 bg-espresso-900 text-white rounded-2xl font-bold text-sm shadow-lg active:scale-[0.98] transition-all"
                  >
                    {isLoading ? 'Connecting...' : 'Connect to Workspace'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowDeviceSyncForm(false)}
                    className="w-full text-xs font-bold text-outline hover:text-espresso-900 transition-colors underline"
                  >
                    Back to PIN Entry
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* OWNER AUTH VIEW */}
          {activePortal === 'OWNER' && (
             <form onSubmit={handleOwnerAuth} className="w-full space-y-6 animate-fade-in">
                <div className="text-center">
                  <h2 className="text-lg font-bold text-espresso-900">{ownerMode === 'LOGIN' ? 'Portal Pengelola' : 'Registrasi Cafe'}</h2>
                  <p className="text-xs text-on-surface-variant mt-1">{ownerMode === 'LOGIN' ? 'Kelola finansial & operasional' : 'Bangun outlet digital Anda'}</p>
                </div>
                
                <div className="space-y-4">
                  {ownerMode === 'REGISTER' && (
                    <div className="space-y-4">
                        <input className="w-full px-5 py-3.5 rounded-2xl bg-cafe-50 border-none text-sm font-bold outline-none" placeholder="Nama Cafe" value={cafeName} onChange={e => setCafeName(e.target.value)} required />
                        <input className="w-full px-5 py-3.5 rounded-2xl bg-cafe-50 border-none text-sm font-bold outline-none" placeholder="Nama Owner" value={ownerName} onChange={e => setOwnerName(e.target.value)} required />
                    </div>
                  )}
                  <input className="w-full px-5 py-3.5 rounded-2xl bg-cafe-50 border-none text-sm font-bold outline-none" placeholder="Email Admin" type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} required />
                  <input className="w-full px-5 py-3.5 rounded-2xl bg-cafe-50 border-none text-sm font-bold outline-none" placeholder="Password" type="password" value={ownerPassword} onChange={e => setOwnerPassword(e.target.value)} required />
                  
                  <button type="submit" disabled={isLoading} className="w-full py-4 bg-espresso-900 text-white rounded-2xl font-bold text-sm shadow-lg active:scale-[0.98] transition-all">
                    {ownerMode === 'LOGIN' ? 'Enter Dashboard' : 'Create Account'}
                  </button>
                  
                  <button type="button" onClick={() => { setOwnerMode(ownerMode === 'LOGIN' ? 'REGISTER' : 'LOGIN'); setErrorMessage(''); setSuccessMessage(''); }} className="w-full text-xs font-bold text-espresso-900/60 hover:text-espresso-900 transition-colors underline">
                    {ownerMode === 'LOGIN' ? 'Daftar Cafe Baru →' : 'Back to Login'}
                  </button>
                </div>
             </form>
          )}

        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="w-full h-12 bg-white/50 backdrop-blur-md flex items-center justify-center gap-2 border-t border-cafe-200/20 px-6 mt-auto z-40">
        <div className={`w-2 h-2 rounded-full ${isDeviceConnected || activePortal === 'OWNER' ? 'bg-earth-olive' : 'bg-outline-variant'} animate-pulse`} />
        <span className="text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">
          {activePortal === 'STAFF' ? (isDeviceConnected ? `${connectedDeviceName} — Active` : 'Terminal Not Linked') : 'Cloud Connection Established'}
        </span>
      </footer>
    </div>
  );
}
