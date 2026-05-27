'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Plus, Minus, Download, TrendingDown, History, AlertTriangle, 
  X, Scale, RefreshCw
} from 'lucide-react';

interface IngredientLog {
  id: string;
  date: string;
  type: 'Inbound' | 'System (Sale)' | 'Manual Adj.' | 'Waste Log';
  adjustment: number;
  currentStock: number;
  user: string;
}

export default function IngredientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [ingredient, setIngredient] = useState<any>(null);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [logs, setLogs] = useState<IngredientLog[]>([]);
  const [filterType, setFilterType] = useState<string>('All Activities');
  
  // Modal states
  const [isAdjOpen, setIsAdjOpen] = useState(false);
  const [adjType, setAdjType] = useState<'ADD' | 'REDUCE'>('ADD');
  const [adjAmount, setAdjAmount] = useState('');
  const [adjReason, setAdjReason] = useState('');
  
  const [isThresholdOpen, setIsThresholdOpen] = useState(false);
  const [newThreshold, setNewThreshold] = useState('');

  // 1. Initial Data Sync
  useEffect(() => {
    const loadData = () => {
      const storedIngs = localStorage.getItem('pos_ingredients');
      let currentIngs: any[] = [];
      
      if (storedIngs) {
        currentIngs = JSON.parse(storedIngs);
      } else {
        // Fallback seed
        currentIngs = [
          { id: 'i1', name: 'Espresso Blend', stockLevel: 4250, unit: 'g', safetyThreshold: 1500, category: 'BAR', costPerUnit: 180, description: 'Signature house blend consisting of 70% Arabica Gayo and 30% Robusta Temanggung. Medium-dark roast profile for optimal crema and chocolatey notes.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqWfZgnWOGBIlaTR3PhA2KCFDJz0RAD-y1rX0uX1feWZmSxaa7D8nA801R0e1FH8szQcISpcnFwvSqTuqul-c7axD7t6bOSetrtCzqBrBe_RA0c4psqeXR83MqSiRHkjxOSWP8iJvx-MOMX2EiJANzVTX8qB3Hs8qAJVTupRgCg5OvpxfXDHPTeSFbgO5JE11Jwz1ATdw7kgpcmXT1YALFKsAErKUOvvCz__5yTPxB-zW4bjwb6hHq8Vth22vExXAeT4_LM9DFCKk' },
          { id: 'i2', name: 'Oat Milk (Barista Ed.)', stockLevel: 48, unit: 'units', safetyThreshold: 20, category: 'BAR', costPerUnit: 35000, description: 'Oatly Professional · 1L premium oat milk for perfect bar latte frothing.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRuwVLMQiCM4yjVFNzYrL_8Xx7O9oUD8YUwhA5VEAYeIaZlXv_yVdD1q2DW4qPTGh3DOyHauvLZBaRSUMXQMf7SBf1NS4zcGz9lTVpFzUnFwKxaSpcZc-9YEyvzStNEXhURBIXo4s02CPaCiThwCWWuy2wZDYBQ8KBIaqmwoQ5DUtI6FmUKs_BJlLYHSEk1CNjQubt9kPRspKETt0xDReYQ4mNvlFS3cGGmL4w7vpMhgzR8NmsGfei2YLXQx_dBFcrWpbq82rETeU' },
          { id: 'i3', name: 'Ceremonial Matcha', stockLevel: 12, unit: 'tins', safetyThreshold: 5, category: 'BAR', costPerUnit: 120000, description: 'Premium Uji matcha powder for authentic, smooth matcha lattes.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvfTbScd_WhAJU-NBf70-wJlmUnZJwOH-_ZAlj_pAb8K50MwXWpTHb_15DgCT31sskPOf4PK90YvFlbr8yLYVX_YxOlUZopOOdTKGFdHGoIaiPqWzmFEnMetR-YlFHe7jpbvHrHUK2Qj0XbCgQooVuMQ3EPUuebrBg3dWJAf7tyxxwRhD8-GG5dZxElUgG2Xrl0CfAegJ5iTzt9-paeAtq_zAiSWExnZXYOhWR1MjTPWPvAP35ngfHAFX-trarEfhS8lY1Z0E9N-4' },
          { id: 'i4', name: 'Madagascar Vanilla', stockLevel: 0.8, unit: 'L', safetyThreshold: 1.0, category: 'BAR', costPerUnit: 450000, description: 'Pure gourmet vanilla bean extract for artisanal flavored drinks and culinary finishes.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYiq0mXVO-MPlDOB3rIMsg0W8VJ5GPLELYXPdJmIiYi1dP4ADuImAjCqhFjmrIlE76U4OJdcOSy3efnco-UNNnuW_S4OekT7v4JsISLwEvaGyg4vNGxC5yYlOvro56yZBdD4JZ0oM0UpJTXMRUXfMONUr-klSu_APjj9WtzRsUqrDrvM742SIQqU2WXif0rF0chWjN3qzBQl9AMWgazfXwSuNc9Vt6gkA-2TankC8AB47mYUmCS_YUmjtT4GYnI4EdTPM1Rd2Xc58' }
        ];
        localStorage.setItem('pos_ingredients', JSON.stringify(currentIngs));
      }
      
      setIngredients(currentIngs);
      
      let matched = currentIngs.find(ing => ing.id === id);
      if (!matched) {
        // Fallback default
        matched = {
          id: id || 'i1',
          name: 'Espresso Blend',
          stockLevel: 4250,
          unit: 'g',
          safetyThreshold: 1500,
          category: 'BAR',
          costPerUnit: 180,
          description: 'Signature house blend consisting of 70% Arabica Gayo and 30% Robusta Temanggung. Medium-dark roast profile for optimal crema and chocolatey notes.',
          imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqWfZgnWOGBIlaTR3PhA2KCFDJz0RAD-y1rX0uX1feWZmSxaa7D8nA801R0e1FH8szQcISpcnFwvSqTuqul-c7axD7t6bOSetrtCzqBrBe_RA0c4psqeXR83MqSiRHkjxOSWP8iJvx-MOMX2EiJANzVTX8qB3Hs8qAJVTupRgCg5OvpxfXDHPTeSFbgO5JE11Jwz1ATdw7kgpcmXT1YALFKsAErKUOvvCz__5yTPxB-zW4bjwb6hHq8Vth22vExXAeT4_LM9DFCKk'
        };
      }
      
      // Standardize values (e.g. converting multi-kg inputs to standard format if needed)
      setIngredient(matched);
      setNewThreshold(matched.safetyThreshold.toString());
      
      // Load logs
      const logsKey = `pos_stock_logs_${matched.id}`;
      const storedLogs = localStorage.getItem(logsKey);
      if (storedLogs) {
        setLogs(JSON.parse(storedLogs));
      } else {
        const seedLogs: IngredientLog[] = [
          { id: 'l1', date: 'Hari ini, 10:45', type: 'System (Sale)', adjustment: matched.unit === 'g' ? -180 : -1, currentStock: matched.stockLevel, user: 'POS Terminal 1' },
          { id: 'l2', date: 'Hari ini, 07:12', type: 'Manual Adj.', adjustment: matched.unit === 'g' ? 500 : 5, currentStock: matched.unit === 'g' ? matched.stockLevel + 180 : matched.stockLevel + 1, user: 'Manager Aris' },
          { id: 'l3', date: 'Kemarin, 21:30', type: 'Waste Log', adjustment: matched.unit === 'g' ? -45 : -0.5, currentStock: matched.unit === 'g' ? matched.stockLevel - 320 : matched.stockLevel - 4, user: 'Barista Kevin' },
          { id: 'l4', date: '12 Mei, 14:15', type: 'Inbound', adjustment: matched.unit === 'g' ? 20000 : 100, currentStock: matched.unit === 'g' ? matched.stockLevel - 275 : matched.stockLevel - 4.5, user: 'Vendor: RoastCo' }
        ];
        setLogs(seedLogs);
        localStorage.setItem(logsKey, JSON.stringify(seedLogs));
      }
    };
    
    loadData();
  }, [id]);

  if (!ingredient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-cafe-500 font-sans">
        <RefreshCw className="w-8 h-8 animate-spin text-earth-olive" />
        <span className="text-sm font-bold">Memuat Detail Bahan Baku...</span>
      </div>
    );
  }

  const isLowStock = ingredient.stockLevel <= ingredient.safetyThreshold;

  // Handle Adjustment Modal Confirmation
  const handleConfirmAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjAmount || parseFloat(adjAmount) <= 0) return;
    
    const amountVal = parseFloat(adjAmount);
    const multiplier = adjType === 'ADD' ? 1 : -1;
    const finalAdjustment = amountVal * multiplier;
    
    const nextStock = Math.max(0, ingredient.stockLevel + finalAdjustment);
    
    // Update active ingredient
    const updatedIngredient = {
      ...ingredient,
      stockLevel: nextStock
    };
    setIngredient(updatedIngredient);
    
    // Update ingredients array and save to localStorage
    const updatedIngs = ingredients.map(ing => ing.id === ingredient.id ? updatedIngredient : ing);
    setIngredients(updatedIngs);
    localStorage.setItem('pos_ingredients', JSON.stringify(updatedIngs));
    
    // Add activity log
    const now = new Date();
    const formattedDate = `Hari ini, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newLogItem: IngredientLog = {
      id: 'log-' + Math.random().toString(36).substring(2, 7),
      date: formattedDate,
      type: 'Manual Adj.',
      adjustment: finalAdjustment,
      currentStock: nextStock,
      user: 'Manager (Bypass)'
    };
    
    const nextLogs = [newLogItem, ...logs];
    setLogs(nextLogs);
    localStorage.setItem(`pos_stock_logs_${ingredient.id}`, JSON.stringify(nextLogs));
    
    // Reset states and close modal
    setAdjAmount('');
    setAdjReason('');
    setIsAdjOpen(false);
    
    // Trigger global storage update to notify layout or sidebar if needed
    window.dispatchEvent(new Event('storage'));
    
    alert(`Stok ${ingredient.name} berhasil disesuaikan! Stok baru: ${nextStock.toLocaleString('id-ID')} ${ingredient.unit}`);
  };

  // Handle setting new threshold levels
  const handleUpdateThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreshold || parseFloat(newThreshold) < 0) return;
    
    const thresholdVal = parseFloat(newThreshold);
    const updatedIngredient = {
      ...ingredient,
      safetyThreshold: thresholdVal
    };
    setIngredient(updatedIngredient);
    
    const updatedIngs = ingredients.map(ing => ing.id === ingredient.id ? updatedIngredient : ing);
    setIngredients(updatedIngs);
    localStorage.setItem('pos_ingredients', JSON.stringify(updatedIngs));
    
    setIsThresholdOpen(false);
    
    window.dispatchEvent(new Event('storage'));
    alert(`Threshold minimum baru untuk ${ingredient.name} disetel ke ${thresholdVal.toLocaleString('id-ID')} ${ingredient.unit}`);
  };

  // Filter logs list based on user selections
  const filteredLogs = logs.filter(log => {
    if (filterType === 'All Activities') return true;
    if (filterType === 'Inbound') return log.type === 'Inbound';
    if (filterType === 'System (Sale)') return log.type === 'System (Sale)';
    if (filterType === 'Manual Adj.') return log.type === 'Manual Adj.';
    if (filterType === 'Waste Log') return log.type === 'Waste Log';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-1 py-4 space-y-8 font-sans">
      
      {/* Top Breadcrumb Navigation */}
      <section className="flex justify-between items-center h-12">
        <button 
          onClick={() => router.push('/dashboard/inventory')}
          className="flex items-center gap-2 text-cafe-600 hover:text-espresso-900 transition-colors text-xs font-bold bg-white border border-cafe-200/50 px-4 py-2 rounded-xl active:scale-95 duration-200"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Inventaris
        </button>
        <span className="text-[10px] font-black text-cafe-400 uppercase tracking-widest">Workspace Core</span>
      </section>

      {/* Main Material Identity Card */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-cafe-200/40 shadow-sm flex flex-col md:flex-row gap-8 items-start">
        
        {/* Left aspect image box */}
        <div className="w-full md:w-1/3 aspect-square rounded-2xl overflow-hidden border border-cafe-200 shadow-inner shrink-0 bg-cafe-50 flex items-center justify-center">
          {ingredient.imageUrl ? (
            <img 
              alt={ingredient.name} 
              className="w-full h-full object-cover" 
              src={ingredient.imageUrl} 
            />
          ) : (
            <Scale className="w-20 h-20 text-cafe-200" />
          )}
        </div>

        {/* Right Info blocks */}
        <div className="flex-1 flex flex-col justify-center w-full">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase">
              {ingredient.category || 'Bar Material'}
            </span>
            <span className="bg-cafe-50 text-cafe-500 border border-cafe-200/50 px-3 py-1 rounded-full text-[10px] font-bold">
              ID: {ingredient.id.toUpperCase()}
            </span>
          </div>

          <h1 className="text-3xl font-black text-espresso-900 tracking-tight mb-2">
            {ingredient.name}
          </h1>

          <p className="text-xs text-cafe-500 font-semibold leading-relaxed mb-6">
            {ingredient.description || 'Bahan baku kualitas premium pilihan untuk menjamin konsistensi racikan rasa menu di seluruh outlet CAOCAO Cafe.'}
          </p>

          {/* Bento metrics overlay */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            
            {/* Current Stock card */}
            <div className="bg-cafe-50 border border-cafe-200/60 rounded-2xl p-5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-cafe-400 uppercase tracking-wider block mb-1">Stok Saat Ini</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-espresso-900">{ingredient.stockLevel.toLocaleString('id-ID')}</span>
                <span className="text-xs font-bold text-cafe-500">{ingredient.unit}</span>
              </div>
            </div>

            {/* Safety threshold warning card */}
            <div className={`border rounded-2xl p-5 flex flex-col justify-between ${
              isLowStock ? 'bg-red-50/50 border-red-200' : 'bg-cafe-50 border-cafe-200/60'
            }`}>
              <div className="flex justify-between items-start mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${isLowStock ? 'text-red-500' : 'text-cafe-400'}`}>Limit Minimum</span>
                {isLowStock && <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black ${isLowStock ? 'text-red-650' : 'text-espresso-900'}`}>
                  {ingredient.safetyThreshold.toLocaleString('id-ID')}
                </span>
                <span className="text-xs font-bold text-cafe-500">{ingredient.unit}</span>
              </div>
            </div>

            {/* Quick adjust action bento */}
            <div 
              onClick={() => setIsAdjOpen(true)}
              className="bg-earth-olive text-cafe-50 rounded-2xl p-5 flex flex-col justify-between hover:opacity-95 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">Aksi Cepat</span>
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-sm font-extrabold mt-4">Sesuaikan Stok</span>
            </div>

          </div>
        </div>
      </section>

      {/* Usage trends and health graphs Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Usage Trend CSS bar graph */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-cafe-200/40 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-espresso-900">Tren Pemakaian Harian</h3>
              <p className="text-[11px] font-semibold text-cafe-400">Total konsumsi bahan baku 7 Hari Terakhir</p>
            </div>
            <button className="p-2 bg-cafe-50 border border-cafe-200/50 hover:bg-cafe-100 rounded-full text-cafe-650 transition-colors" title="Export Laporan">
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Dummy visual weekly chart bars */}
          <div className="h-44 w-full flex items-end justify-between gap-3 px-1">
            {[
              { day: 'Sen', val: '60%', active: false },
              { day: 'Sel', val: '85%', active: false },
              { day: 'Rab', val: '45%', active: false },
              { day: 'Kam', val: '95%', active: false },
              { day: 'Jum', val: '70%', active: false },
              { day: 'Sab', val: '100%', active: true },
              { day: 'Min', val: '80%', active: false }
            ].map((d, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-full bg-cafe-50 rounded-t-xl relative h-28 overflow-hidden">
                  <div 
                    className={`absolute bottom-0 w-full rounded-t-xl transition-all duration-500 ${
                      d.active ? 'bg-earth-olive h-full' : 'bg-earth-olive/20 group-hover:bg-earth-olive/30'
                    }`}
                    style={{ height: d.val }}
                  />
                </div>
                <span className={`text-[10px] ${d.active ? 'font-bold text-espresso-900' : 'font-semibold text-cafe-400'}`}>
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Health predictions & operations alert details */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-cafe-200/40 shadow-sm flex flex-col justify-between">
          <h3 className="text-lg font-bold text-espresso-900">Prediksi & Kesehatan Stok</h3>
          
          <div className="space-y-5 my-6">
            
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5 text-on-secondary-container" />
              </span>
              <div>
                <p className="text-xs font-bold text-espresso-900">Habis dalam ~4 hari</p>
                <p className="text-[10px] text-cafe-400 font-medium">Berdasarkan rata-rata konsumsi mingguan</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-full bg-cafe-50 border border-cafe-200/50 flex items-center justify-center shrink-0">
                <History className="w-5 h-5 text-cafe-500" />
              </span>
              <div>
                <p className="text-xs font-bold text-espresso-900">Restock Terakhir: 12 Mei</p>
                <p className="text-[10px] text-cafe-400 font-medium">
                  {ingredient.unit === 'g' ? '+20.000g' : '+100 unit'} bahan baku diterima
                </p>
              </div>
            </div>

          </div>

          <button 
            onClick={() => setIsThresholdOpen(true)}
            className="w-full py-3 bg-cafe-50 border border-cafe-200 hover:bg-cafe-100 text-espresso-900 font-bold text-xs rounded-2xl active:scale-95 transition-all shadow-sm"
          >
            UBAH NOTIFIKASI LIMIT MINIMUM
          </button>
        </div>

      </section>

      {/* Dynamic Logs Table */}
      <section className="bg-white rounded-3xl p-6 md:p-8 border border-cafe-200/40 shadow-sm">
        
        {/* Filters and Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-bold text-espresso-900">Riwayat Pergerakan Stok</h3>
          
          <div className="relative">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none bg-cafe-50 border border-cafe-200 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-espresso-900 focus:ring-0 focus:outline-none cursor-pointer"
            >
              <option>All Activities</option>
              <option>Inbound</option>
              <option>System (Sale)</option>
              <option>Manual Adj.</option>
              <option>Waste Log</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cafe-200 text-cafe-400 font-bold uppercase tracking-wider">
                <th className="pb-3 font-semibold">Tanggal & Waktu</th>
                <th className="pb-3 font-semibold">Tipe Log</th>
                <th className="pb-3 font-semibold">Perubahan</th>
                <th className="pb-3 font-semibold">Stok Akhir</th>
                <th className="pb-3 font-semibold">Petugas / Sumber</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cafe-50 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-cafe-400 font-semibold">
                    Tidak ada catatan aktivitas stock yang cocok.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isNegative = log.adjustment < 0;
                  
                  // Label Badge styling
                  let badgeClass = 'bg-cafe-100 text-cafe-700';
                  if (log.type === 'Inbound') badgeClass = 'bg-green-50 text-green-600 border border-green-150';
                  if (log.type === 'Manual Adj.') badgeClass = 'bg-secondary-container text-on-secondary-container';
                  if (log.type === 'Waste Log') badgeClass = 'bg-red-50 text-red-600 border border-red-150';

                  return (
                    <tr key={log.id} className="hover:bg-cafe-50/50 transition-colors">
                      <td className="py-3.5 text-espresso-900 font-bold">{log.date}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase ${badgeClass}`}>
                          {log.type}
                        </span>
                      </td>
                      <td className={`py-3.5 font-bold ${isNegative ? 'text-red-500' : 'text-earth-olive'}`}>
                        {isNegative ? '' : '+'}{log.adjustment.toLocaleString('id-ID')}{ingredient.unit}
                      </td>
                      <td className="py-3.5 text-espresso-950 font-bold">
                        {log.currentStock.toLocaleString('id-ID')}{ingredient.unit}
                      </td>
                      <td className="py-3.5 text-cafe-500 font-semibold">{log.user}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal 1: Quick Adjust Stock Form */}
      {isAdjOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setIsAdjOpen(false)}
            className="absolute inset-0 bg-espresso-900/40 backdrop-blur-sm"
          />
          
          <div className="relative bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-scale-up border border-cafe-150">
            <div className="flex justify-between items-center pb-3 border-b border-cafe-100 mb-5">
              <h3 className="text-base font-extrabold text-espresso-900">Penyesuaian Manual</h3>
              <button 
                onClick={() => setIsAdjOpen(false)}
                className="p-1.5 hover:bg-cafe-50 rounded-full text-cafe-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdjustment} className="space-y-4">
              
              {/* Type Switch buttons */}
              <div>
                <label className="block text-[10px] font-bold text-cafe-400 mb-2 uppercase tracking-wider">Tipe Koreksi</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setAdjType('ADD')}
                    className={`py-3 border-2 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      adjType === 'ADD' 
                        ? 'bg-secondary-container border-secondary text-on-secondary-container shadow-sm' 
                        : 'bg-white border-cafe-200 text-cafe-500 hover:bg-cafe-50'
                    }`}
                  >
                    <Plus className="w-4 h-4" /> TAMBAH STOK
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAdjType('REDUCE')}
                    className={`py-3 border-2 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      adjType === 'REDUCE' 
                        ? 'bg-red-50 border-red-300 text-red-700 shadow-sm' 
                        : 'bg-white border-cafe-200 text-cafe-500 hover:bg-cafe-50'
                    }`}
                  >
                    <Minus className="w-4 h-4" /> KURANGI STOK
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-[10px] font-bold text-cafe-400 mb-2 uppercase tracking-wider">Jumlah ({ingredient.unit})</label>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    step="any"
                    required
                    placeholder="0"
                    value={adjAmount}
                    onChange={(e) => setAdjAmount(e.target.value)}
                    className="w-full text-center px-4 py-3 bg-cafe-50 border border-cafe-200 rounded-2xl font-black text-xl focus:ring-1 focus:ring-earth-olive focus:border-earth-olive focus:outline-none"
                  />
                  <div className="px-4 py-3 bg-cafe-200 rounded-2xl font-bold text-espresso-900 flex items-center text-xs justify-center shrink-0 w-16">
                    {ingredient.unit}
                  </div>
                </div>
              </div>

              {/* Notes reason */}
              <div>
                <label className="block text-[10px] font-bold text-cafe-400 mb-2 uppercase tracking-wider">Keterangan / Alasan Audit</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Koreksi spillage harian atau restock vendor baru..."
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full px-4 py-3 bg-cafe-50 border border-cafe-200 rounded-2xl text-xs font-semibold focus:ring-1 focus:ring-earth-olive focus:border-earth-olive focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button 
                  type="button"
                  onClick={() => setIsAdjOpen(false)}
                  className="flex-1 py-3 bg-cafe-50 hover:bg-cafe-100 text-cafe-500 border border-cafe-200 font-bold text-xs rounded-2xl active:scale-95 transition-all"
                >
                  BATAL
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-espresso-900 text-white font-bold text-xs rounded-2xl active:scale-95 transition-all shadow-md hover:opacity-95"
                >
                  KONFIRMASI
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Adjust Minimum Alert Threshold */}
      {isThresholdOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsThresholdOpen(false)}
            className="absolute inset-0 bg-espresso-900/40 backdrop-blur-sm"
          />
          
          <div className="relative bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scale-up border border-cafe-150">
            <div className="flex justify-between items-center pb-2 border-b border-cafe-100 mb-4">
              <h3 className="text-base font-extrabold text-espresso-900">Set limit minimum</h3>
              <button 
                onClick={() => setIsThresholdOpen(false)}
                className="p-1 hover:bg-cafe-50 rounded-full text-cafe-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateThreshold} className="space-y-4">
              <div>
                <p className="text-[10px] text-cafe-400 leading-relaxed font-semibold mb-3">
                  Sistem akan memberikan tanda bahaya visual (Low Stock alert) jika stok bahan berada di bawah nilai ini.
                </p>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    step="any"
                    required
                    placeholder="Nilai Threshold"
                    value={newThreshold}
                    onChange={(e) => setNewThreshold(e.target.value)}
                    className="w-full text-center px-4 py-3 bg-cafe-50 border border-cafe-200 rounded-2xl font-bold text-sm focus:ring-1 focus:ring-earth-olive focus:border-earth-olive focus:outline-none"
                  />
                  <div className="px-4 py-3 bg-cafe-200 rounded-2xl font-bold text-espresso-900 flex items-center text-xs justify-center shrink-0">
                    {ingredient.unit}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setIsThresholdOpen(false)}
                  className="flex-1 py-2 bg-cafe-50 text-cafe-500 border border-cafe-200 font-bold text-xs rounded-xl"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-espresso-900 text-white font-bold text-xs rounded-xl shadow"
                >
                  Simpan Threshold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
