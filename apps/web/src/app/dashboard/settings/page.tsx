'use client';

import React, { useEffect, useState } from 'react';
import { 
  Settings, Coffee, Percent, Grid, Plus, Trash2, Save, 
  ToggleLeft, ShieldCheck, ToggleRight, Sparkles, QrCode, RefreshCw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '@/lib/api-client';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [invitationCode, setInvitationCode] = useState('CAO-STAFF-2026');
  const [registeredDevices, setRegisteredDevices] = useState<any[]>([]);
  
  // Cafe profile state config (PPN, service charge)
  const [cafeConfig, setCafeConfig] = useState({
    cafeName: 'Cafe CaoCao',
    address: 'Jakarta Selatan, Indonesia',
    phone: '081234567890',
    taxRate: 11, // PPN 11%
    serviceRate: 5, // Service charge 5%
    autoPrintReceipt: true,
  });

  const [mergeBarCashier, setMergeBarCashier] = useState(false);

  // Discounts settings state tokens list
  const [discounts, setDiscounts] = useState<any[]>([
    { id: 'd1', code: 'SENJA10', type: 'PERCENTAGE', value: 10 },
    { id: 'd2', code: 'PROMOCOFFEE', type: 'NOMINAL', value: 5000 },
  ]);

  const [newDiscount, setNewDiscount] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: '',
  });

  // Tables dynamic list state
  const [tables, setTables] = useState<any[]>([
    { id: 't1', name: 'Meja 1', x: 1, y: 1, status: 'AVAILABLE' },
    { id: 't2', name: 'Meja 2', x: 2, y: 1, status: 'OCCUPIED' },
    { id: 't3', name: 'Meja 3', x: 3, y: 1, status: 'AVAILABLE' },
  ]);

  const [newTable, setNewTable] = useState({
    name: '',
    x: 1,
    y: 1,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('pos_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
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
      // Seed initial devices for premium mockup experience if empty
      const initialDevices = [
        { id: 'dev-budi123', name: 'Xiaomi Budi (Barista)', dateConnected: '2026-05-25 14:20' },
        { id: 'dev-siti456', name: 'iPhone Siti (Waitress)', dateConnected: '2026-05-25 15:45' }
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

    // Sync tables with API
    const loadTables = async () => {
      try {
        const data = await api.order.getTables();
        if (data && data.length > 0) {
          setTables(data);
        }
      } catch (e) {
        console.log('Order API Server offline, using local tables.');
      }
    };
    loadTables();
  }, []);

  const handleRevokeDevice = (deviceId: string) => {
    if (confirm('Apakah Anda yakin ingin mencabut akses perangkat staf ini? Perangkat ini akan segera dikeluarkan dari Workspace.')) {
      const updated = registeredDevices.filter(d => d.id !== deviceId);
      setRegisteredDevices(updated);
      localStorage.setItem('pos_registered_devices', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      alert('Akses perangkat berhasil dicabut!');
    }
  };

  const handleSaveConfig = () => {
    alert('Konfigurasi Cafe Profile berhasil disimpan!');
  };

  const handleToggleMerge = () => {
    const nextVal = !mergeBarCashier;
    setMergeBarCashier(nextVal);
    localStorage.setItem('pos_merge_bar_cashier', String(nextVal));
    alert('Pengaturan penyatuan peran Bar & Kasir berhasil diperbarui!');
  };

  const handleAddDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscount.code || !newDiscount.value) return;

    const disc = {
      id: 'd-' + Math.random().toString(36).slice(2, 6),
      code: newDiscount.code.toUpperCase(),
      type: newDiscount.type,
      value: parseFloat(newDiscount.value),
    };

    const updated = [...discounts, disc];
    setDiscounts(updated);
    localStorage.setItem('pos_discounts', JSON.stringify(updated));
    setNewDiscount({ code: '', type: 'PERCENTAGE', value: '' });
    alert('Token diskon baru ' + disc.code + ' berhasil ditambahkan!');
  };

  const handleDeleteDiscount = (id: string) => {
    const updated = discounts.filter(d => d.id !== id);
    setDiscounts(updated);
    localStorage.setItem('pos_discounts', JSON.stringify(updated));
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTable.name) return;

    const tblData = {
      name: newTable.name,
      x: parseInt(newTable.x as any),
      y: parseInt(newTable.y as any),
      status: 'AVAILABLE',
    };

    try {
      const tbl = await api.order.createTable(tblData);
      setTables([...tables, tbl]);
    } catch (err) {
      const tbl = {
        id: 't-' + Math.random().toString(36).slice(2, 6),
        ...tblData
      };
      setTables([...tables, tbl]);
    }

    setNewTable({ name: '', x: 1, y: 1 });
    alert(newTable.name + ' berhasil ditambahkan!');
  };

  const handleDeleteTable = (id: string) => {
    setTables(tables.filter(t => t.id !== id));
  };

  if (!user) return <div className="p-8 text-center text-xs font-semibold">Memuat pengaturan...</div>;

  const isOwner = user.role === 'OWNER';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header section */}
      <div className="flex items-center gap-3 border-b border-cafe-200 pb-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cafe-800 text-cafe-100 rounded-xl flex items-center justify-center shadow">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-cafe-900 font-sans">Pengaturan & Konfigurasi</h2>
            <p className="text-xs text-cafe-500">Sesuaikan profil cafe, token diskon aktif, PPN pajak, dan denah meja kasir</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Cafe Profile configuration (restricted to OWNER or Admin with custom views) */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white rounded-3xl p-6 border border-cafe-200/50 shadow-premium">
            <h3 className="font-extrabold text-cafe-900 text-base mb-4 flex items-center gap-2">
              <Coffee className="w-4 h-4 text-cafe-600" /> Profil Cafe
            </h3>
            
            {!isOwner && (
              <div className="p-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-[10px] font-semibold mb-4 flex gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Pengaturan PPN & Service rate hanya dapat diubah oleh Owner.</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider">Nama Cafe</label>
                <input
                  type="text"
                  value={cafeConfig.cafeName}
                  onChange={(e) => setCafeConfig({ ...cafeConfig, cafeName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider">Alamat Lengkap</label>
                <input
                  type="text"
                  value={cafeConfig.address}
                  onChange={(e) => setCafeConfig({ ...cafeConfig, address: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider">Pajak PPN (%)</label>
                  <input
                    type="number"
                    disabled={!isOwner}
                    value={cafeConfig.taxRate}
                    onChange={(e) => setCafeConfig({ ...cafeConfig, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-semibold disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider">Service Charge (%)</label>
                  <input
                    type="number"
                    disabled={!isOwner}
                    value={cafeConfig.serviceRate}
                    onChange={(e) => setCafeConfig({ ...cafeConfig, serviceRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-semibold disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-b border-cafe-100">
                <span className="text-xs font-semibold text-cafe-700">Cetak struk belanja kasir otomatis</span>
                <button 
                  onClick={() => setCafeConfig({ ...cafeConfig, autoPrintReceipt: !cafeConfig.autoPrintReceipt })}
                  className="text-earth-olive focus:outline-none"
                >
                  {cafeConfig.autoPrintReceipt ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-cafe-400" />}
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-cafe-100">
                <div>
                  <span className="text-xs font-semibold text-cafe-700 block">Gabungkan Bar & Kasir</span>
                  <span className="text-[9px] text-cafe-400 font-semibold block">Satukan peran barista dan kasir kafe</span>
                </div>
                <button 
                  onClick={handleToggleMerge}
                  className="text-earth-olive focus:outline-none"
                >
                  {mergeBarCashier ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-cafe-400" />}
                </button>
              </div>

              <button
                onClick={handleSaveConfig}
                className="w-full py-3 bg-earth-olive text-cafe-50 rounded-xl text-xs font-bold btn-premium shadow-sm flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Simpan Profil
              </button>
            </div>
          </section>

          {/* Staff Invitation Device Code Section */}
          <section className="bg-white rounded-3xl p-6 border border-cafe-200/50 shadow-premium mt-6">
            <h3 className="font-extrabold text-cafe-900 text-base mb-2 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-cafe-650" /> Kode Unik Sinkronisasi Staf
            </h3>
            <p className="text-[10px] text-cafe-400 font-semibold mb-4 leading-relaxed">
              Scan QR Code ini menggunakan HP Staf saat pertama kali membuka aplikasi untuk sinkronisasi perangkat otomatis dengan outlet kafe ini.
            </p>
            
            <div className="flex flex-col gap-4 items-center bg-cafe-50 border border-cafe-200 p-5 rounded-2xl w-full">
              {/* Real scannable QR Code */}
              <div className="bg-white rounded-2xl border border-cafe-200 p-3 shadow-sm">
                <QRCodeSVG
                  value={invitationCode}
                  size={148}
                  bgColor="#ffffff"
                  fgColor="#1a1008"
                  level="M"
                />
              </div>

              <div className="w-full text-center">
                <span className="text-[9px] font-bold text-cafe-400 uppercase tracking-wider block">KODE SINKRONISASI OUTLET</span>
                <span className="text-sm font-black text-cafe-900 tracking-wider font-mono uppercase bg-white border border-cafe-200 px-3 py-1.5 rounded-xl mt-1 inline-block select-all">
                  {invitationCode}
                </span>
              </div>
              
              <button
                onClick={() => {
                  const newCode = 'CAO-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
                  localStorage.setItem('pos_staff_invitation_code', newCode);
                  window.dispatchEvent(new Event('storage'));
                  setInvitationCode(newCode);
                }}
                className="w-full px-4 py-3 bg-cafe-800 hover:bg-cafe-950 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-sm flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Acak Kode &amp; QR Baru
              </button>
            </div>
          </section>

          {/* Connected Staff Devices Management Card */}
          <section className="bg-white rounded-3xl p-6 border border-cafe-200/50 shadow-premium mt-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <h3 className="font-extrabold text-cafe-900 text-base">
                Perangkat Staf Terhubung
              </h3>
            </div>
            <p className="text-[10px] text-cafe-400 font-semibold mb-4 leading-relaxed">
              Daftar smartphone staf yang terhubung ke workspace kafe ini. Anda dapat mencabut akses perangkat kapan saja secara instan.
            </p>

            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {registeredDevices.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-cafe-200 rounded-2xl text-[10px] font-semibold text-cafe-400">
                  Belum ada perangkat staf yang terhubung.
                </div>
              ) : (
                registeredDevices.map((device) => (
                  <div key={device.id} className="p-3 bg-cafe-50 border border-cafe-200/60 rounded-2xl flex justify-between items-center text-xs font-semibold hover:border-cafe-300 transition-all">
                    <div>
                      <span className="block font-bold text-cafe-950">{device.name}</span>
                      <span className="block text-[9px] text-cafe-400 mt-0.5">ID: {device.id}</span>
                      <span className="block text-[8px] text-cafe-400 font-medium">Sinkron: {device.dateConnected}</span>
                    </div>
                    <button
                      onClick={() => handleRevokeDevice(device.id)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-all active:scale-95"
                      title="Cabut Akses Perangkat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>


        {/* Center/Right Columns: Tables map config and Discount Tokens lists */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Discount setting tokens lists */}
            <section className="bg-white rounded-3xl p-6 border border-cafe-200/50 shadow-premium flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-cafe-900 text-base mb-4 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-cafe-600" /> Token Diskon Aktif
                </h3>
                
                {/* List discounts */}
                <div className="space-y-3 mb-6 max-h-[220px] overflow-y-auto pr-1">
                  {discounts.map((disc) => (
                    <div key={disc.id} className="p-3 bg-cafe-50/50 border border-cafe-200/40 rounded-2xl flex justify-between items-center text-xs font-bold">
                      <div>
                        <span className="px-2 py-0.5 bg-earth-olive text-cafe-50 rounded text-[9px] uppercase tracking-wider">{disc.code}</span>
                        <p className="text-[10px] text-cafe-400 mt-1 font-semibold">
                          Potongan: {disc.type === 'PERCENTAGE' ? `${disc.value}%` : `Rp ${disc.value.toLocaleString('id-ID')}`}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleDeleteDiscount(disc.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Discount Form */}
              <form onSubmit={handleAddDiscount} className="space-y-3 border-t border-cafe-100 pt-4">
                <span className="text-[10px] font-extrabold text-cafe-500 uppercase tracking-wider block">Tambah Kupon Baru</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SENJA20"
                    value={newDiscount.code}
                    onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 uppercase"
                  />
                  <select
                    value={newDiscount.type}
                    onChange={(e) => setNewDiscount({ ...newDiscount, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50"
                  >
                    <option value="PERCENTAGE">Persen %</option>
                    <option value="NOMINAL">Nominal Rp</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    placeholder={newDiscount.type === 'PERCENTAGE' ? 'Nilai (Contoh: 20)' : 'Nilai (Contoh: 10000)'}
                    value={newDiscount.value}
                    onChange={(e) => setNewDiscount({ ...newDiscount, value: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cafe-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Tambah
                  </button>
                </div>
              </form>
            </section>

            {/* Table layout grid builder */}
            <section className="bg-white rounded-3xl p-6 border border-cafe-200/50 shadow-premium flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-cafe-900 text-base mb-4 flex items-center gap-2">
                  <Grid className="w-4 h-4 text-cafe-600" /> Daftar Tata Letak Meja
                </h3>
                
                {/* List Tables */}
                <div className="space-y-3 mb-6 max-h-[220px] overflow-y-auto pr-1">
                  {tables.map((tbl) => (
                    <div key={tbl.id} className="p-3 bg-cafe-50/50 border border-cafe-200/40 rounded-2xl flex justify-between items-center text-xs font-semibold text-cafe-800">
                      <div>
                        <span className="font-bold">{tbl.name}</span>
                        <span className="text-[10px] text-cafe-400 block mt-0.5">Koordinat Grid: ({tbl.x}, {tbl.y})</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteTable(tbl.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Table Layout Form */}
              <form onSubmit={handleAddTable} className="space-y-3 border-t border-cafe-100 pt-4">
                <span className="text-[10px] font-extrabold text-cafe-500 uppercase tracking-wider block">Tambah Meja Dinamis</span>
                
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Meja 6"
                    value={newTable.name}
                    onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50"
                  />
                  <input
                    type="number"
                    min="1"
                    max="6"
                    placeholder="Baris (1-6)"
                    value={newTable.x || ''}
                    onChange={(e) => setNewTable({ ...newTable, x: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50"
                  />
                  <input
                    type="number"
                    min="1"
                    max="6"
                    placeholder="Kolom (1-6)"
                    value={newTable.y || ''}
                    onChange={(e) => setNewTable({ ...newTable, y: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-cafe-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Tambah Meja ke Laci Grid
                </button>
              </form>
            </section>

          </div>

          {/* Settings features modules configuration */}
          <section className="bg-white rounded-3xl p-6 border border-cafe-200/50 shadow-premium">
            <h3 className="font-extrabold text-cafe-900 text-base mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cafe-500" /> Integrasi Fitur Langganan Tenant
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-cafe-800">
              <div className="p-4 bg-cafe-50/50 border border-cafe-200/20 rounded-2xl flex justify-between items-center">
                <div>
                  <h4>Modul Resep Bahan Baku (BOM)</h4>
                  <p className="text-[10px] text-cafe-400 font-semibold mt-0.5">Potong otomatis biji kopi & fresh milk</p>
                </div>
                <span className="px-2.5 py-1 bg-green-50 text-green-600 border border-green-100 rounded-full text-[9px]">Aktif</span>
              </div>
              <div className="p-4 bg-cafe-50/50 border border-cafe-200/20 rounded-2xl flex justify-between items-center">
                <div>
                  <h4>Sistem Kas Drawer Kasir (Reconciliation)</h4>
                  <p className="text-[10px] text-cafe-400 font-semibold mt-0.5">Pantau modal awal vs fisik drawer penutupan</p>
                </div>
                <span className="px-2.5 py-1 bg-green-50 text-green-600 border border-green-100 rounded-full text-[9px]">Aktif</span>
              </div>
            </div>
          </section>
        </div>

      </div>

    </div>
  );
}

