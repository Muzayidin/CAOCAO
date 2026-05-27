'use client';

import React, { useState, useEffect } from 'react';
import { 
  Coins, Lock, Unlock, FileText, Download, ChevronRight, Info, 
  Clock, CheckCircle2, Eye, Settings, RefreshCw
} from 'lucide-react';

interface ReconciliationLog {
  id: string;
  dateTime: string;
  type: string;
  staffName: string;
  variance: number;
  status: 'VERIFIED' | 'FLAGGED';
}

export default function PayrollShiftControl() {
  const openingBalance = 450000; // 450k IDR
  const [currentCash, setCurrentCash] = useState(1284500); // Default placeholder
  const [expectedCash, setExpectedCash] = useState(1280000); // Default placeholder
  
  // Interactive States
  const [reconcileState, setReconcileState] = useState<'IDLE' | 'LOADING' | 'COMPLETED'>('IDLE');
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);
  const [lateTolerance, setLateTolerance] = useState(7); // 7 mins
  const [overtimeRate, setOvertimeRate] = useState(1.5); // 1.5x
  const [breakDeduction, setBreakDeduction] = useState(30); // 30 mins

  // Data logs
  const [logs, setLogs] = useState<ReconciliationLog[]>([
    { id: '1', dateTime: '24 Mei 2026, 23:15', type: 'Night Close', staffName: 'Marcus Chen', variance: -15000, status: 'FLAGGED' },
    { id: '2', dateTime: '24 Mei 2026, 15:30', type: 'Mid-Shift Handover', staffName: 'Sarah Jenkins', variance: 0, status: 'VERIFIED' },
    { id: '3', dateTime: '23 Mei 2026, 23:45', type: 'Night Close', staffName: 'Marcus Chen', variance: 12000, status: 'VERIFIED' },
  ]);

  // Load from Cashier dynamic orders
  useEffect(() => {
    const stored = localStorage.getItem('pos_completed_orders');
    if (stored) {
      try {
        const orders = JSON.parse(stored) as { paymentMethod: string; totalAfter?: number; items?: { category?: string; unitPrice?: number; quantity?: number }[] }[];
        // Sum cash transactions
        const totalCashOrders = orders
          .filter(o => o.paymentMethod === 'CASH')
          .reduce((sum, o) => sum + (o.totalAfter || 0), 0);
        
        // Add to opening balance
        setCurrentCash(450000 + totalCashOrders);
        setExpectedCash(450000 + totalCashOrders);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleOpenDrawer = () => {
    // Simulated Point-of-Sale physical drawer trigger
    alert('Sinyal dikirim: Laci kasir fisik berhasil dibuka.');
  };

  const handleCloseShift = () => {
    setReconcileState('LOADING');
    setTimeout(() => {
      setReconcileState('COMPLETED');
      
      // Append a new verified log entry
      const activeUser = JSON.parse(localStorage.getItem('pos_user') || '{"name":"Owner Cafe"}') as { name: string };
      const timeNow = new Date().toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const newLog: ReconciliationLog = {
        id: Math.random().toString(36).slice(2, 6),
        dateTime: timeNow,
        type: 'Shift Reconciliation Close',
        staffName: activeUser.name,
        variance: currentCash - expectedCash,
        status: currentCash - expectedCash === 0 ? 'VERIFIED' : 'FLAGGED'
      };

      setLogs(prev => [newLog, ...prev]);

      // Direct to shift Z-Report after success
      setTimeout(() => {
        window.location.href = '/dashboard/shift-report';
      }, 1000);
    }, 1500);
  };

  return (
    <div className="font-manrope min-h-screen text-on-surface bg-cafe-50 -m-4 md:-m-6 flex flex-col">
      {/* Page Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-cafe-200/50 px-6 py-5 flex justify-between items-center shrink-0 z-10">
        <div>
          <span className="text-[10px] font-bold text-earth-olive uppercase tracking-wider">Financial Operations</span>
          <h1 className="text-xl font-bold text-espresso-900 tracking-tight mt-0.5">Payroll & Shift Control</h1>
        </div>
        <button 
          onClick={() => {
            alert('Menghitung kompensasi & slip gaji terbaru untuk seluruh roster...');
          }}
          className="h-11 px-5 bg-earth-olive text-white rounded-2xl flex items-center gap-2 text-xs font-bold active:scale-95 transition-all shadow-sm"
        >
          <Coins className="w-4 h-4" />
          Generate Payroll
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24">
        
        {/* Bento Column Left: Cash Drawer & Shift */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* Cash Drawer Controller */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-cafe-200/50 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-espresso-900">Cash Drawer Controller</h3>
                <p className="text-xs text-on-surface-variant mt-1">Manage physical register status and reconciliation.</p>
              </div>
              <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-earth-olive animate-pulse" />
                Active Shift
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-cafe-50 p-4 rounded-2xl border border-cafe-200/50">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Opening Balance</span>
                <p className="text-xl font-bold text-espresso-900 mt-1.5">Rp {openingBalance.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-cafe-50 p-4 rounded-2xl border border-cafe-200/50">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Current Cash</span>
                <p className="text-xl font-bold text-espresso-900 mt-1.5">Rp {currentCash.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-cafe-50 p-4 rounded-2xl border border-cafe-200/50">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Expected Cash</span>
                <p className="text-xl font-bold text-espresso-900 mt-1.5">Rp {expectedCash.toLocaleString('id-ID')}</p>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="flex flex-col md:flex-row gap-3">
              <button 
                onClick={handleOpenDrawer}
                className="flex-1 h-12 border-2 border-espresso-900 text-espresso-900 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-espresso-900 hover:text-white transition-all active:scale-95"
              >
                <Unlock className="w-4 h-4" />
                Open Drawer
              </button>
              
              <button 
                onClick={handleCloseShift}
                disabled={reconcileState === 'LOADING'}
                className={`flex-1 h-12 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md ${
                  reconcileState === 'COMPLETED' 
                    ? 'bg-earth-olive text-white' 
                    : 'bg-espresso-900 text-white hover:bg-espresso-800'
                }`}
              >
                {reconcileState === 'LOADING' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Reconciling...
                  </>
                ) : reconcileState === 'COMPLETED' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 animate-bounce" />
                    Shift Closed & Synced ✓
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Close Shift & Reconcile
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Cash Reconciliation Audit Logs */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-cafe-200/50 overflow-hidden">
            <h3 className="text-lg font-bold text-espresso-900 mb-4">Recent Reconciliation Logs</h3>
            
            <div className="overflow-x-auto -mx-6">
              <div className="inline-block min-w-full align-middle px-6">
                <table className="min-w-full divide-y divide-cafe-100 text-left">
                  <thead>
                    <tr>
                      <th className="pb-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Date / Time</th>
                      <th className="pb-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Staff Name</th>
                      <th className="pb-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Variance</th>
                      <th className="pb-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                      <th className="pb-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cafe-50">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-cafe-50/50 transition-colors">
                        <td className="py-4">
                          <p className="text-xs font-bold text-espresso-900">{log.dateTime}</p>
                          <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">{log.type}</p>
                        </td>
                        <td className="py-4 text-xs font-bold text-espresso-900">{log.staffName}</td>
                        <td className={`py-4 text-xs font-mono font-bold ${
                          log.variance === 0 
                            ? 'text-earth-olive' 
                            : log.variance > 0 
                            ? 'text-blue-600' 
                            : 'text-error'
                        }`}>
                          {log.variance === 0 ? 'Rp 0' : `${log.variance > 0 ? '+' : '-'} Rp ${Math.abs(log.variance).toLocaleString('id-ID')}`}
                        </td>
                        <td className="py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            log.status === 'VERIFIED' 
                              ? 'bg-secondary-container text-on-secondary-container' 
                              : 'bg-error-container text-on-error-container'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => alert(`Membuka audit log verifikasi detail untuk shift Marcus Chen - Selisih: ${log.variance}`)}
                            className="p-2 hover:bg-cafe-100 rounded-xl transition-all inline-flex items-center justify-center text-on-surface-variant hover:text-espresso-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Column Right: Policy & Engine */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          
          {/* HR Policy Config */}
          <div className="bg-espresso-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
            {/* Subtle backdrop pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '16px 16px' }} />
            
            <div className="relative z-10">
              <h3 className="text-md font-bold mb-5 flex items-center gap-2 text-cafe-200">
                <Settings className="w-5 h-5 text-secondary-fixed animate-pulse-subtle" />
                HR Policy Config
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <div>
                    <p className="text-xs font-bold">Late Tolerance</p>
                    <p className="text-[10px] text-white/50">Grace period for clock-in</p>
                  </div>
                  <span className="bg-white/10 px-3 py-1 rounded-xl text-xs font-bold">{lateTolerance} mins</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <div>
                    <p className="text-xs font-bold">Overtime Multiplier</p>
                    <p className="text-[10px] text-white/50">After 40 weekly hours</p>
                  </div>
                  <span className="bg-white/10 px-3 py-1 rounded-xl text-xs font-bold">{overtimeRate}x</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <div>
                    <p className="text-xs font-bold">Break Deduction</p>
                    <p className="text-[10px] text-white/50">Auto-remove per 6hr shift</p>
                  </div>
                  <span className="bg-white/10 px-3 py-1 rounded-xl text-xs font-bold">{breakDeduction} mins</span>
                </div>
              </div>

              <button 
                onClick={() => setShowPoliciesModal(true)}
                className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 transition-all rounded-xl text-xs font-bold uppercase tracking-wider border border-white/10 active:scale-95"
              >
                Update Policies
              </button>
            </div>
          </div>

          {/* Automated Payroll Engine */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-cafe-200/50 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-espresso-900 mb-4">Payroll Engine</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-cafe-50 rounded-2xl border border-cafe-200/30 flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-cafe-200">
                    <FileText className="w-5 h-5 text-espresso-900" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-espresso-900 truncate">Mei_2026_Full_Report.pdf</p>
                    <p className="text-[9px] text-on-surface-variant font-bold">2.4 MB • Generated Today</p>
                  </div>
                  <button 
                    onClick={() => alert('Mengunduh dokumen PDF slip rekapitulasi gaji terbaru...')}
                    className="p-2 hover:bg-cafe-200 rounded-xl transition-all"
                  >
                    <Download className="w-4 h-4 text-on-surface-variant hover:text-espresso-900" />
                  </button>
                </div>

                <div className="p-3 bg-cafe-50 rounded-2xl border border-cafe-200/30 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-cafe-200">
                      <Clock className="w-5 h-5 text-espresso-900" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-espresso-900">Payroll History</p>
                      <p className="text-[9px] text-on-surface-variant font-bold">View last 12 months</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert('Membuka panel riwayat pembayaran payroll tahunan...')}
                    className="p-2 hover:bg-cafe-200 rounded-xl transition-all"
                  >
                    <ChevronRight className="w-4 h-4 text-on-surface-variant hover:text-espresso-900" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-secondary-container/20 rounded-2xl border border-secondary/15">
              <div className="flex items-center gap-2 mb-1.5 text-on-secondary-container">
                <Info className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">Automation Note</span>
              </div>
              <p className="text-[11px] text-on-secondary-container/80 leading-relaxed font-semibold">
                Next automated payroll run is scheduled for <span className="font-bold">31 Mei, 04:00 AM</span>. Ensure all shift variances are cleared by then.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Edit Policies Modal */}
      {showPoliciesModal && (
        <div className="fixed inset-0 bg-espresso-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-premium border border-cafe-100 animate-scale-up">
            <h3 className="text-lg font-bold text-espresso-900 mb-4">Edit HR Policies</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Late Grace Period (Mins)</label>
                <input 
                  type="number"
                  value={lateTolerance}
                  onChange={(e) => setLateTolerance(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-cafe-50 border border-cafe-200 rounded-xl font-bold outline-none focus:ring-1 focus:ring-espresso-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Overtime Rate Multiplier</label>
                <input 
                  type="number"
                  step="0.1"
                  value={overtimeRate}
                  onChange={(e) => setOvertimeRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-cafe-50 border border-cafe-200 rounded-xl font-bold outline-none focus:ring-1 focus:ring-espresso-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1.5">Auto Break Deduction (Mins)</label>
                <input 
                  type="number"
                  value={breakDeduction}
                  onChange={(e) => setBreakDeduction(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-cafe-50 border border-cafe-200 rounded-xl font-bold outline-none focus:ring-1 focus:ring-espresso-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => {
                  setShowPoliciesModal(false);
                  alert('Kebijakan HR berhasil diperbarui secara global!');
                }}
                className="py-3 bg-espresso-900 text-white rounded-xl text-xs font-bold active:scale-95 transition-all"
              >
                Simpan
              </button>
              <button 
                onClick={() => setShowPoliciesModal(false)}
                className="py-3 bg-cafe-50 text-on-surface rounded-xl text-xs font-bold active:scale-95 transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
