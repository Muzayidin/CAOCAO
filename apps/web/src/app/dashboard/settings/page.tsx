'use client';

import React, { useEffect, useState } from 'react';
import { 
  Settings, Coffee, Percent, Grid, Plus, Trash2, Save, 
  ToggleLeft, ToggleRight, Sparkles, QrCode, Smartphone, Timer, Trash 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '@/lib/api-client';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [invitationCode, setInvitationCode] = useState('CAO-STAFF-2026');
  const [registeredDevices, setRegisteredDevices] = useState<any[]>([]);
  const [timerString, setTimerString] = useState('04:59');
  
  // Cafe profile state config (PPN, service charge)
  const [cafeConfig, setCafeConfig] = useState({
    cafeName: 'Cafe CaoCao Central',
    address: 'Jakarta Selatan, Indonesia',
    phone: '081234567890',
    taxRate: 11, // PPN 11%
    serviceRate: 5, // Service charge 5%
    autoPrintReceipt: true,
  });

  const [mergeBarCashier, setMergeBarCashier] = useState(false);
  const [storeStatusOpen, setStoreStatusOpen] = useState(true);

  // Discounts settings state tokens list
  const [discounts, setDiscounts] = useState<any[]>([
    { id: 'd1', code: 'MORNING15', type: 'PERCENTAGE', value: 15, usageLimit: 45 },
    { id: 'd2', code: 'LOYALTY50', type: 'NOMINAL', value: 50000, usageLimit: 999 },
  ]);

  const [newDiscount, setNewDiscount] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: '',
    usageLimit: '100'
  });

  // Tables dynamic list state
  const [tables, setTables] = useState<any[]>([
    { id: 't1', name: 'Meja 01', seats: '2 Kursi', active: true },
    { id: 't2', name: 'Meja 02', seats: '4 Kursi', active: true },
    { id: 't3', name: 'Meja 03', seats: 'Bar Area', active: true },
    { id: 't4', name: 'Meja 04', seats: '2 Kursi', active: false },
  ]);

  const [newTable, setNewTable] = useState({
    name: '',
    seats: '2 Kursi',
  });

  // 1. Initial State Sync
  useEffect(() => {
    const storedUser = localStorage.getItem('pos_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      const defaultUser = {
        name: 'Staff OWNER',
        role: 'OWNER',
        cafeName: 'Cafe CaoCao',
      };
      setUser(defaultUser);
      localStorage.setItem('pos_user', JSON.stringify(defaultUser));
    }

    const savedCode = localStorage.getItem('pos_staff_invitation_code');
    if (savedCode) {
      setInvitationCode(savedCode);
    } else {
      localStorage.setItem('pos_staff_invitation_code', 'CAO-STAFF-2026');
    }
    
    // Load registered devices
    const savedDevices = localStorage.getItem('pos_registered_devices');
    if (savedDevices) {
      setRegisteredDevices(JSON.parse(savedDevices));
    } else {
      const initialDevices = [
        { id: 'dev-budi123', name: 'Samsung Galaxy S23 Ultra', waiter: 'Budi', status: 'Aktif sekarang' },
        { id: 'dev-siti456', name: 'iPhone 14 Pro', waiter: 'Siti', status: 'Terakhir aktif 2 jam lalu' }
      ];
      setRegisteredDevices(initialDevices);
      localStorage.setItem('pos_registered_devices', JSON.stringify(initialDevices));
    }

    const savedDiscounts = localStorage.getItem('pos_discounts');
    if (savedDiscounts) {
      setDiscounts(JSON.parse(savedDiscounts));
    } else {
      localStorage.setItem('pos_discounts', JSON.stringify(discounts));
    }
    const savedMerge = localStorage.getItem('pos_merge_bar_cashier');
    if (savedMerge) {
      setMergeBarCashier(savedMerge === 'true');
    }

    // Sync tables with API or seed
    const loadTables = async () => {
      try {
        const data = await api.order.getTables();
        if (data && data.length > 0) {
          setTables(data.map((t: any) => ({
            id: t.id,
            name: t.name,
            seats: t.seats || '4 Kursi',
            active: t.status === 'AVAILABLE'
          })));
        }
      } catch (e) {
        console.log('Order API offline, using seeded tables.');
      }
    };
    loadTables();
  }, []);

  // 2. Ticking Countdown Timer for QR Sync Code
  useEffect(() => {
    let secondsLeft = 299; // 5 minutes
    const interval = setInterval(() => {
      if (secondsLeft <= 0) {
        const newCode = 'CAO-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
        setInvitationCode(newCode);
        localStorage.setItem('pos_staff_invitation_code', newCode);
        secondsLeft = 299;
      } else {
        secondsLeft--;
      }
      const mins = Math.floor(secondsLeft / 60);
      const secs = secondsLeft % 60;
      setTimerString(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRevokeDevice = (deviceId: string) => {
    if (confirm('Apakah Anda yakin ingin mencabut akses perangkat staf ini? Perangkat ini akan segera dikeluarkan dari outlet.')) {
      const updated = registeredDevices.filter(d => d.id !== deviceId);
      setRegisteredDevices(updated);
      localStorage.setItem('pos_registered_devices', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      alert('Akses perangkat berhasil dicabut!');
    }
  };

  const handleSaveConfig = () => {
    alert('Konfigurasi Profil Kafe berhasil disimpan secara lokal!');
  };

  const handleToggleMerge = () => {
    const nextVal = !mergeBarCashier;
    setMergeBarCashier(nextVal);
    localStorage.setItem('pos_merge_bar_cashier', String(nextVal));
    alert('Pengaturan penyatuan peran Bar & Kasir berhasil diperbarui!');
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscount.code || !newDiscount.value) return;

    const disc = {
      id: 'd-' + Math.random().toString(36).slice(2, 6),
      code: newDiscount.code.toUpperCase(),
      type: newDiscount.type,
      value: parseFloat(newDiscount.value),
      usageLimit: parseInt(newDiscount.usageLimit) || 100
    };

    const updated = [...discounts, disc];
    setDiscounts(updated);
    localStorage.setItem('pos_discounts', JSON.stringify(updated));
    setNewDiscount({ code: '', type: 'PERCENTAGE', value: '', usageLimit: '100' });
    alert('Voucher diskon ' + disc.code + ' berhasil ditambahkan!');
  };

  const handleDeleteDiscount = (id: string) => {
    const updated = discounts.filter(d => d.id !== id);
    setDiscounts(updated);
    localStorage.setItem('pos_discounts', JSON.stringify(updated));
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTable.name) return;

    const tbl = {
      id: 't-' + Math.random().toString(36).slice(2, 6),
      name: newTable.name,
      seats: newTable.seats,
      active: true
    };

    const updated = [...tables, tbl];
    setTables(updated);
    setNewTable({ name: '', seats: '2 Kursi' });
    alert(tbl.name + ' berhasil ditambahkan!');
  };

  const handleDeleteTable = (id: string) => {
    setTables(tables.filter(t => t.id !== id));
  };

  if (!user) return <div className="p-8 text-center text-xs font-semibold">Memuat pengaturan...</div>;

  const isOwner = user.role === 'OWNER';

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-1 py-4 font-sans text-on-background">
      
      {/* Top Section Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black text-cafe-400 uppercase tracking-widest mb-1">
            CAFE CONFIGURATION PANEL
          </p>
          <h2 className="text-3xl font-black text-espresso-900 tracking-tight">
            Pengaturan Kafe
          </h2>
        </div>
      </section>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Business Profile & Quick Nav */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* Logo & Cafe Profile card */}
          <section className="bg-white rounded-3xl p-6 border border-cafe-200/40 shadow-sm flex flex-col items-center text-center">
            
            {/* Custom Cafe Logo aspect frame */}
            <div className="w-24 h-24 bg-cafe-50 rounded-2xl mb-4 flex items-center justify-center border-2 border-dashed border-cafe-200 relative group overflow-hidden">
              <img 
                alt="Cafe Logo" 
                className="absolute inset-0 w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuABDIwGhvkM83Ae7zUp2gspbVLMdgfKq06hjW5xg5aWwpMzws1AQIi1FlmLE6vayxCgRrrEiUGV1wDRIlaSnKwfpvuYl8ZJf5ti7UbTLo1cxRSHHFrVtvmWJ3RjAasgaroEHDbkO31Dnw02JS330n7w1zKGI_pkdjWCVCM2skqdrKfEEe-6HMVyaBmWpUasKPOmd1oZd3gzF6KZRASEr1zDVaxIzgJZfAWBTMjRza-qRvEAOJs9NZUr5j3mZCVI1ijTtoEu9Q3dcH4" 
              />
            </div>

            <h2 className="text-lg font-black text-espresso-900">{cafeConfig.cafeName}</h2>
            <p className="text-[10px] font-extrabold text-cafe-400 uppercase tracking-wider mb-6">
              Profil Bisnis • Cabang Sudirman
            </p>

            <div className="w-full space-y-2">
              <div 
                onClick={() => setStoreStatusOpen(!storeStatusOpen)}
                className="flex justify-between items-center p-3 bg-cafe-50 hover:bg-cafe-100/60 rounded-2xl cursor-pointer transition-all border border-cafe-200/50"
              >
                <span className="text-xs font-bold text-cafe-500">Status Toko</span>
                <span className={`text-xs font-extrabold flex items-center gap-1.5 ${
                  storeStatusOpen ? 'text-secondary' : 'text-red-500'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    storeStatusOpen ? 'bg-secondary animate-pulse' : 'bg-red-500'
                  }`} /> 
                  {storeStatusOpen ? 'Buka' : 'Tutup'}
                </span>
              </div>
            </div>
          </section>

          {/* Quick Settings menu navigation mockup */}
          <nav className="bg-white rounded-3xl p-2 border border-cafe-200/40 shadow-sm space-y-0.5">
            <button className="w-full flex items-center gap-3 p-4 bg-secondary-container text-on-secondary-container rounded-2xl font-bold text-xs text-left">
              <Settings className="w-4 h-4 text-earth-olive" />
              <span>Pengaturan Kafe</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 text-cafe-500 hover:bg-cafe-50 hover:text-espresso-900 rounded-2xl font-bold text-xs text-left transition-colors">
              <Percent className="w-4 h-4 text-cafe-400" />
              <span>Pajak & Layanan</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 text-cafe-500 hover:bg-cafe-50 hover:text-espresso-900 rounded-2xl font-bold text-xs text-left transition-colors">
              <Grid className="w-4 h-4 text-cafe-400" />
              <span>Editor Denah Meja</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 text-cafe-500 hover:bg-cafe-50 hover:text-espresso-900 rounded-2xl font-bold text-xs text-left transition-colors">
              <QrCode className="w-4 h-4 text-cafe-400" />
              <span>Sinkronisasi Perangkat</span>
            </button>
          </nav>

        </aside>

        {/* Right Column: Settings configuration modules */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tax Rates & Charges Bento Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Standalone PPN Tax Card */}
            <section className="bg-white rounded-3xl p-6 border border-cafe-200/40 shadow-sm flex flex-col justify-between h-56">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-espresso-900">Tarif PPN (11%)</h3>
                  <span className="p-2 bg-cafe-50 rounded-xl border border-cafe-200/55">
                    <Percent className="w-4 h-4 text-cafe-400" />
                  </span>
                </div>
                <p className="text-[11px] text-cafe-450 leading-relaxed font-semibold">
                  Pajak Pertambahan Nilai standar di Indonesia yang otomatis dibebankan pada struk belanja menu.
                </p>
              </div>
              <div className="flex items-end justify-between border-t border-cafe-50 pt-4">
                <span className="text-3xl font-black text-espresso-900">{cafeConfig.taxRate}%</span>
                <input 
                  type="number"
                  disabled={!isOwner}
                  value={cafeConfig.taxRate}
                  onChange={(e) => setCafeConfig({ ...cafeConfig, taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-16 text-center py-1.5 border border-cafe-200 rounded-xl text-xs font-bold bg-cafe-50/50 disabled:opacity-50"
                />
              </div>
            </section>

            {/* Standalone Service Charge Card with Custom Switch */}
            <section className="bg-white rounded-3xl p-6 border border-cafe-200/40 shadow-sm flex flex-col justify-between h-56">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-espresso-900">Service Charge</h3>
                  <span className="p-2 bg-cafe-50 rounded-xl border border-cafe-200/55">
                    <Coffee className="w-4 h-4 text-cafe-400" />
                  </span>
                </div>
                <p className="text-[11px] text-cafe-450 leading-relaxed font-semibold">
                  Biaya layanan opsional sebesar 5% untuk menunjang operasional kru dan makan di tempat (Dine-in).
                </p>
              </div>
              
              <div className="flex items-center justify-between border-t border-cafe-50 pt-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-espresso-900">{cafeConfig.serviceRate}%</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* custom input */}
                  <input 
                    type="number"
                    disabled={!isOwner}
                    value={cafeConfig.serviceRate}
                    onChange={(e) => setCafeConfig({ ...cafeConfig, serviceRate: parseFloat(e.target.value) || 0 })}
                    className="w-16 text-center py-1.5 border border-cafe-200 rounded-xl text-xs font-bold bg-cafe-50/50 disabled:opacity-50"
                  />
                  {/* Custom Toggle switch representation */}
                  <button 
                    onClick={() => setCafeConfig(c => ({ ...c, serviceRate: c.serviceRate === 5 ? 0 : 5 }))}
                    className="text-earth-olive focus:outline-none shrink-0"
                  >
                    {cafeConfig.serviceRate > 0 ? (
                      <ToggleRight className="w-8 h-8 text-secondary" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-cafe-300" />
                    )}
                  </button>
                </div>
              </div>
            </section>

          </div>

          {/* Device Sync & scannable QR Code section */}
          <section className="bg-espresso-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-md">
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              <div className="md:col-span-8 space-y-4">
                <h3 className="text-xl font-bold tracking-tight">Sinkronisasi Perangkat Staf</h3>
                
                <p className="text-xs text-white/70 leading-relaxed max-w-md">
                  Hubungkan ponsel pramusaji atau tablet waiter baru secara instan. Pindai kode QR sementara ini dengan Aplikasi Staf CAOCAO untuk otorisasi akses cepat.
                </p>
                
                <div className="flex items-center gap-2 text-secondary-container">
                  <Timer className="w-4 h-4 animate-pulse" />
                  <span className="text-[11px] font-bold">
                    Kode QR kedaluwarsa dalam <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded">{timerString}</span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button 
                    onClick={() => {
                      const newCode = 'CAO-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
                      setInvitationCode(newCode);
                      localStorage.setItem('pos_staff_invitation_code', newCode);
                      alert('Kode sinkronisasi dan QR Code baru berhasil dibuat!');
                    }}
                    className="px-4 py-2.5 bg-secondary text-on-secondary rounded-xl font-extrabold text-xs hover:opacity-90 active:scale-95 transition-all shadow"
                  >
                    Buat Kode Baru
                  </button>
                  
                  <div className="px-3 py-2 bg-white/15 border border-white/10 rounded-xl font-mono text-xs select-all text-white font-extrabold flex items-center">
                    {invitationCode}
                  </div>
                </div>
              </div>

              {/* QR display block */}
              <div className="md:col-span-4 flex justify-center">
                <div className="bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center shrink-0">
                  <QRCodeSVG
                    value={invitationCode}
                    size={112}
                    bgColor="#ffffff"
                    fgColor="#1A1614"
                    level="L"
                  />
                </div>
              </div>

            </div>

            {/* Premium backdrop glow filter */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
          </section>

          {/* Dynamic Table Denah Map Layout */}
          <section className="bg-white rounded-3xl p-6 border border-cafe-200/40 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h3 className="text-lg font-bold text-espresso-900">Denah Tata Letak Meja</h3>
                <p className="text-xs text-cafe-400 font-semibold mt-0.5">Atur layout koordinat meja di lantai utama kafe</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
              {tables.map((t) => (
                <div 
                  key={t.id} 
                  className={`aspect-square rounded-2xl border-2 p-3 flex flex-col items-center justify-center gap-1 transition-all group relative cursor-pointer select-none ${
                    t.active 
                      ? 'bg-white border-secondary hover:bg-secondary/5' 
                      : 'bg-cafe-50 border-cafe-200'
                  }`}
                >
                  <span className="text-[9px] font-bold text-cafe-400 uppercase tracking-widest">Meja</span>
                  <span className="text-xl font-black text-espresso-900">{t.name.replace('Meja ', '')}</span>
                  <span className="text-[9px] text-cafe-450 font-bold">{t.seats}</span>
                  
                  {/* Delete overlay */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTable(t.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity p-0.5 bg-red-50 rounded"
                    title="Hapus Meja"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>

                  {t.active && (
                    <span className="absolute -top-2 -right-2 bg-secondary text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase shadow-sm">
                      AKTIF
                    </span>
                  )}
                </div>
              ))}

              {/* Add Table trigger block */}
              <div 
                onClick={() => {
                  const num = String(tables.length + 1).padStart(2, '0');
                  const seats = prompt('Masukkan kapasitas kursi (e.g. 2 Kursi, 4 Kursi, Bar Area):', '4 Kursi');
                  if (seats) {
                    setTables(prev => [...prev, {
                      id: 't-' + Math.random().toString(36).substring(2,7),
                      name: `Meja ${num}`,
                      seats: seats,
                      active: true
                    }]);
                  }
                }}
                className="aspect-square border-2 border-dashed border-cafe-200 rounded-2xl flex flex-col items-center justify-center hover:bg-cafe-50 transition-all cursor-pointer hover:border-earth-olive group text-cafe-400"
              >
                <Plus className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold">Tambah Meja</span>
              </div>
            </div>
          </section>

          {/* Voucher Management lists */}
          <section className="bg-white rounded-3xl p-6 border border-cafe-200/40 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-espresso-900">Voucher Diskon Aktif</h3>
                <p className="text-xs text-cafe-400 font-semibold mt-0.5">Manajemen program promosi outlet kafe</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {discounts.map((disc) => (
                <div 
                  key={disc.id} 
                  className="p-4 rounded-2xl bg-cafe-50 border border-cafe-200/60 flex items-center justify-between hover:border-cafe-250 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-secondary">
                      <Percent className="w-5 h-5" />
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-espresso-950 tracking-wide font-mono uppercase">
                        {disc.code}
                      </h4>
                      <p className="text-[10px] text-cafe-450 font-bold mt-0.5">
                        Potongan {disc.type === 'PERCENTAGE' ? `${disc.value}%` : `Rp ${disc.value.toLocaleString('id-ID')}`} • Sisa Kuota: {disc.usageLimit}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[8px] font-extrabold rounded uppercase tracking-wider">
                      AKTIF
                    </span>
                    <button 
                      onClick={() => handleDeleteDiscount(disc.id)}
                      className="text-cafe-400 hover:text-red-500 p-1 bg-white border border-cafe-200 rounded-lg active:scale-95 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Voucher input form inline */}
            <form onSubmit={handleAddDiscount} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-4 border-t border-cafe-50">
              <input 
                type="text"
                required
                placeholder="Kode (e.g. DISKON20)"
                value={newDiscount.code}
                onChange={(e) => setNewDiscount(n => ({ ...n, code: e.target.value }))}
                className="px-3 py-2 bg-cafe-50 border border-cafe-200 rounded-xl text-xs font-bold uppercase focus:ring-0 focus:outline-none"
              />
              <select 
                value={newDiscount.type}
                onChange={(e) => setNewDiscount(n => ({ ...n, type: e.target.value }))}
                className="px-3 py-2 bg-cafe-50 border border-cafe-200 rounded-xl text-xs font-bold focus:ring-0 focus:outline-none"
              >
                <option value="PERCENTAGE">Persentase (%)</option>
                <option value="NOMINAL">Nominal (Rupiah)</option>
              </select>
              <input 
                type="number"
                required
                placeholder="Nilai (e.g. 15)"
                value={newDiscount.value}
                onChange={(e) => setNewDiscount(n => ({ ...n, value: e.target.value }))}
                className="px-3 py-2 bg-cafe-50 border border-cafe-200 rounded-xl text-xs font-bold focus:ring-0 focus:outline-none"
              />
              <button 
                type="submit"
                className="bg-espresso-900 text-white rounded-xl text-xs font-bold hover:opacity-95 active:scale-95 transition-all"
              >
                Tambah Voucher
              </button>
            </form>
          </section>

          {/* Linked devices management */}
          <section className="bg-white rounded-3xl p-6 border border-cafe-200/40 shadow-sm">
            <h3 className="text-lg font-bold text-espresso-900 mb-2">Perangkat Terhubung</h3>
            <p className="text-xs text-cafe-400 font-semibold mb-4 leading-relaxed">
              Daftar perangkat pramusaji yang aktif di bawah otorisasi kasir utama. Anda dapat mencabut akses perangkat untuk menghentikan sinkronisasi pesanan.
            </p>

            <div className="divide-y divide-cafe-100">
              {registeredDevices.length === 0 ? (
                <div className="text-center py-6 text-xs text-cafe-400 font-semibold">
                  Belum ada perangkat pramusaji terhubung.
                </div>
              ) : (
                registeredDevices.map((dev) => (
                  <div key={dev.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 rounded-full bg-cafe-50 border border-cafe-200 flex items-center justify-center shrink-0">
                        <Smartphone className="w-5 h-5 text-cafe-500" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-espresso-900">{dev.name}</p>
                        <p className="text-[10px] text-cafe-400 font-semibold mt-0.5">
                          {dev.status} • Waiter: {dev.waiter || 'Staf'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRevokeDevice(dev.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold hover:underline"
                    >
                      Cabut Akses
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Merge Roles & Auto Receipts */}
          <section className="bg-white rounded-3xl p-6 border border-cafe-200/40 shadow-sm">
            <h3 className="text-lg font-bold text-espresso-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-earth-olive" /> Modul Fitur Lanjutan
            </h3>
            
            <div className="divide-y divide-cafe-50 font-medium">
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="text-xs font-bold text-espresso-950 block">Gabungkan Peran Bar & Kasir</span>
                  <span className="text-[10px] text-cafe-400 mt-0.5 block leading-relaxed font-semibold">
                    Barista merangkap kasir utama untuk penyesuaian operasional kafe kecil.
                  </span>
                </div>
                <button 
                  onClick={handleToggleMerge}
                  className="text-earth-olive focus:outline-none"
                >
                  {mergeBarCashier ? (
                    <ToggleRight className="w-8 h-8 text-secondary shrink-0" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-cafe-300 shrink-0" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="text-xs font-bold text-espresso-950 block">Cetak Struk Belanja Otomatis</span>
                  <span className="text-[10px] text-cafe-400 mt-0.5 block leading-relaxed font-semibold">
                    Struk pembelian kasir langsung dicetak otomatis setelah transaksi dinyatakan selesai.
                  </span>
                </div>
                <button 
                  onClick={() => setCafeConfig(c => ({ ...c, autoPrintReceipt: !c.autoPrintReceipt }))}
                  className="text-earth-olive focus:outline-none"
                >
                  {cafeConfig.autoPrintReceipt ? (
                    <ToggleRight className="w-8 h-8 text-secondary shrink-0" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-cafe-300 shrink-0" />
                  )}
                </button>
              </div>

            </div>
          </section>

          {/* Sticky action saving bar simulation */}
          <div className="pt-2 flex justify-end gap-3">
            <button 
              onClick={handleSaveConfig}
              className="px-6 py-3.5 bg-espresso-900 text-white text-xs font-bold rounded-2xl flex items-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-md"
            >
              <Save className="w-4 h-4" /> SIMPAN KONFIGURASI
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
