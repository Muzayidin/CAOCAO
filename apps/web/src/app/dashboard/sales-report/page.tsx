'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Download, Search, Filter, 
  QrCode, CreditCard, DollarSign, ChevronLeft, ChevronRight, 
  CheckCircle, XCircle, TrendingUp, Info 
} from 'lucide-react';

interface Transaction {
  id: string;
  time: string;
  cashier: string;
  method: 'QRIS' | 'Debit' | 'Tunai';
  total: number;
  status: 'Selesai' | 'Batal';
}

export default function SalesReportPage() {
  const [userName, setUserName] = useState('Owner');
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('Bulan Ini');
  
  // Seeded mock transactions
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '#CC-2901-01', time: '09:12 AM', cashier: 'Siska Amelia', method: 'QRIS', total: 85000, status: 'Selesai' },
    { id: '#CC-2901-02', time: '09:45 AM', cashier: 'Budi Setiawan', method: 'Tunai', total: 122000, status: 'Selesai' },
    { id: '#CC-2901-03', time: '10:02 AM', cashier: 'Siska Amelia', method: 'Debit', total: 45000, status: 'Selesai' },
    { id: '#CC-2901-04', time: '10:15 AM', cashier: 'Siska Amelia', method: 'QRIS', total: 210000, status: 'Batal' },
    { id: '#CC-2901-05', time: '11:30 AM', cashier: 'Budi Setiawan', method: 'QRIS', total: 64000, status: 'Selesai' },
    { id: '#CC-2901-06', time: '12:05 PM', cashier: 'Siska Amelia', method: 'Tunai', total: 185000, status: 'Selesai' },
    { id: '#CC-2901-07', time: '01:40 PM', cashier: 'Budi Setiawan', method: 'Debit', total: 95000, status: 'Selesai' },
    { id: '#CC-2901-08', time: '03:15 PM', cashier: 'Siska Amelia', method: 'QRIS', total: 140000, status: 'Selesai' }
  ]);

  // Loaded aggregates
  const [liveStats, setLiveStats] = useState({
    totalRevenue: 142500000,
    qrisPercent: 65,
    debitPercent: 25,
    cashPercent: 10,
    bestSellerSold: 1240
  });

  useEffect(() => {
    // 1. Get Logged in User Name
    const storedUser = localStorage.getItem('pos_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.name) setUserName(u.name.replace('Staff ', '').replace('Simulator ', ''));
      } catch (e) {}
    }

    // 2. Load Completed orders from cashier sessions to aggregate dynamic reports
    const storedOrders = localStorage.getItem('pos_completed_orders');
    if (storedOrders) {
      try {
        const parsed = JSON.parse(storedOrders);
        setCompletedOrders(parsed);

        // Convert order queues to table items
        const transformed: Transaction[] = parsed.map((o: any, idx: number) => {
          const orderTime = o.time || new Date(o.createdAt || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' AM';
          let method: 'QRIS' | 'Debit' | 'Tunai' = 'QRIS';
          if (o.paymentMethod === 'CASH') method = 'Tunai';
          else if (o.paymentMethod === 'DEBIT') method = 'Debit';

          return {
            id: o.orderId ? `#${o.orderId.slice(0, 8).toUpperCase()}` : `#CC-NEW-0${idx + 1}`,
            time: orderTime,
            cashier: o.cashierName || 'Siska Amelia',
            method: method,
            total: o.finalTotal || o.total || 0,
            status: 'Selesai'
          };
        });

        // Combine mock seed with live cash register sales
        setTransactions(prevMock => {
          const ids = new Set(transformed.map(t => t.id));
          const filteredMock = prevMock.filter(t => !ids.has(t.id));
          return [...transformed, ...filteredMock];
        });

        // 3. Aggregate stats dynamically
        const liveRevenue = parsed.reduce((sum: number, o: any) => sum + (o.finalTotal || o.total || 0), 0);
        
        let qrisCount = 0;
        let debitCount = 0;
        let cashCount = 0;
        
        parsed.forEach((o: any) => {
          if (o.paymentMethod === 'CASH') cashCount++;
          else if (o.paymentMethod === 'DEBIT') debitCount++;
          else qrisCount++;
        });

        const totalOrdersCount = parsed.length || 1;
        const liveQris = Math.round((qrisCount / totalOrdersCount) * 100);
        const liveDebit = Math.round((debitCount / totalOrdersCount) * 100);
        const liveCash = 100 - liveQris - liveDebit;

        setLiveStats(prev => ({
          totalRevenue: 142500000 + liveRevenue,
          qrisPercent: parsed.length > 0 ? liveQris : prev.qrisPercent,
          debitPercent: parsed.length > 0 ? liveDebit : prev.debitPercent,
          cashPercent: parsed.length > 0 ? Math.max(0, liveCash) : prev.cashPercent,
          bestSellerSold: 1240 + parsed.length
        }));

      } catch (e) {}
    }
  }, []);

  // Filter logs logic
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.cashier.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMethod = filterMethod === 'ALL' || t.method === filterMethod;
    
    return matchesSearch && matchesMethod;
  });

  // Simple Pagination config
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportPDF = () => {
    alert('Simulasi Export Laporan PDF Berhasil! Laporan ringkasan penjualan bulanan diunduh.');
  };

  return (
    <div className="max-w-7xl mx-auto px-1 py-4 space-y-8 font-sans">
      
      {/* Header welcome banner & calendar filters */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black text-cafe-400 uppercase tracking-widest mb-1">
            ANALYTICS BUSINESS OVERVIEW
          </p>
          <h2 className="text-3xl font-black text-espresso-900 tracking-tight">
            Selamat Pagi, {userName}
          </h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white border border-cafe-200/60 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm text-xs font-bold text-espresso-900">
            <Calendar className="w-4 h-4 text-cafe-500" />
            <span>01 Jan 2026 - 31 Jan 2026</span>
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-earth-olive border-none p-0 pr-1 text-xs font-bold focus:ring-0 focus:outline-none cursor-pointer"
            >
              <option>Hari Ini</option>
              <option>Minggu Ini</option>
              <option>Bulan Ini</option>
            </select>
          </div>
          <button 
            onClick={handleExportPDF}
            className="bg-espresso-900 text-white rounded-2xl px-5 py-3 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </section>

      {/* Premium Bento Grid Overhaul */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Revenue chart (Large Bento - 8 Columns) */}
        <div className="md:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-cafe-200/40 shadow-sm flex flex-col justify-between min-h-[380px]">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-espresso-900">Ringkasan Pendapatan</h3>
              <p className="text-xs text-cafe-400 font-semibold mt-0.5">Pertumbuhan omzet operasional cafe</p>
            </div>
            <div className="text-right">
              <span className="text-2xl md:text-3xl font-black block text-espresso-900">
                Rp {liveStats.totalRevenue.toLocaleString('id-ID')}
              </span>
              <span className="text-secondary font-bold text-xs flex items-center justify-end gap-0.5 mt-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +12.5% dibanding bulan lalu
              </span>
            </div>
          </div>

          {/* Graphical weekday bars */}
          <div className="w-full h-40 flex items-end gap-2 md:gap-4 mt-8 px-1">
            {[
              { day: 'Sen', val: '40%', amount: '12.2M' },
              { day: 'Sel', val: '60%', amount: '15.5M' },
              { day: 'Rab', val: '45%', amount: '13.1M' },
              { day: 'Kam', val: '85%', amount: '22.5M', highlight: true },
              { day: 'Jum', val: '55%', amount: '18.0M' },
              { day: 'Sab', val: '70%', amount: '20.4M' },
              { day: 'Min', val: '50%', amount: '14.8M' }
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-full bg-cafe-50 rounded-t-xl relative h-28 overflow-hidden">
                  <div 
                    className={`absolute bottom-0 w-full rounded-t-xl transition-all duration-500 ${
                      bar.highlight 
                        ? 'bg-espresso-900 h-full' 
                        : 'bg-earth-olive/20 group-hover:bg-earth-olive/30'
                    }`}
                    style={{ height: bar.val }}
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-espresso-950 text-white text-[8px] font-bold px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {bar.amount}
                  </div>
                </div>
                <span className={`text-[10px] ${bar.highlight ? 'font-bold text-espresso-900' : 'font-semibold text-cafe-400'}`}>
                  {bar.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Splits (Medium Bento - 4 Columns) */}
        <div className="md:col-span-4 bg-white rounded-3xl p-6 md:p-8 border border-cafe-200/40 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-espresso-900 mb-6">Metode Pembayaran</h3>
            
            <div className="space-y-5">
              
              {/* QRIS */}
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center text-xs font-bold text-espresso-900 mb-1">
                    <span>QRIS (E-Wallet)</span>
                    <span>{liveStats.qrisPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-cafe-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-secondary transition-all duration-500" 
                      style={{ width: `${liveStats.qrisPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Debit Card */}
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl bg-cafe-50 border border-cafe-250 flex items-center justify-center shrink-0 text-espresso-900">
                  <CreditCard className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center text-xs font-bold text-espresso-900 mb-1">
                    <span>Kartu Debit / Credit</span>
                    <span>{liveStats.debitPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-cafe-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-espresso-900 transition-all duration-500" 
                      style={{ width: `${liveStats.debitPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Tunai (Cash) */}
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl bg-cafe-50 border border-cafe-250 flex items-center justify-center shrink-0 text-espresso-900">
                  <DollarSign className="w-5 h-5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center text-xs font-bold text-espresso-900 mb-1">
                    <span>Tunai (Cash Drawer)</span>
                    <span>{liveStats.cashPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-cafe-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cafe-550 transition-all duration-500" 
                      style={{ width: `${liveStats.cashPercent}%` }}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          <p className="text-[10px] text-cafe-400 font-semibold italic mt-6 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 shrink-0 text-cafe-300" /> data mencakup seluruh kanal kasir outlet
          </p>
        </div>

        {/* Top 5 Best Selling Menu Items (Horizontal Bento - 12 Columns) */}
        <div className="md:col-span-12 bg-espresso-900 text-white rounded-3xl p-6 md:p-8 shadow-sm flex flex-col lg:flex-row gap-8 items-center border border-espresso-850">
          <div className="lg:w-1/3 space-y-2 text-center lg:text-left">
            <h3 className="text-xl font-bold tracking-tight">Top 5 Best Selling Menu</h3>
            <p className="text-xs text-outline-variant leading-relaxed">
              Daftar menu terfavorit pelanggan bulan ini yang mendominasi 40% dari total omzet penjualan bersih kafe.
            </p>
          </div>
          
          <div className="flex-1 w-full flex flex-nowrap overflow-x-auto gap-4 scroll-hide pb-2">
            
            {/* Rank 1 */}
            <div className="min-w-[170px] bg-white/10 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center text-center border border-white/5 group hover:border-secondary/40 transition-all">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-secondary shadow-md shrink-0">
                <img 
                  alt="Signature Latte" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAC6gYbA7qqCXUMIDlujTqjBcB_JRutP31_dIEG1VE__ThN_uRWS53Lv70h8Kd8lnIjWmyj5hBW-z0HypV-whfMxNa2rsUxzi69-xy0meOg2FwT2FQDzyqgHP1Eu_8YC1otxXuto_2tXmIFB8BHCgLlO1brwbFkL7RGXWSCEBWfM0BwHbAum6wYy-kqgfIcJ6fUZ2AsT3qCfbY4aAfCqtHDaLH8qUKV9FE0Jp4-ssxZicQ3k-Ka1dUQ7a0-dDjcr5JTt3y8Eapelro" 
                />
              </div>
              <span className="text-[9px] font-extrabold text-secondary-container uppercase mb-0.5">Rank #1</span>
              <h4 className="text-xs font-bold">Signature Latte</h4>
              <p className="text-[10px] text-white/60 mt-0.5">{liveStats.bestSellerSold} Terjual</p>
            </div>

            {/* Rank 2 */}
            <div className="min-w-[170px] bg-white/5 rounded-2xl p-4 flex flex-col items-center text-center border border-transparent hover:border-white/10 transition-all">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border border-white/10 shadow shrink-0">
                <img 
                  alt="Double Espresso" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8w3usI18dcn8ooK1X_AwmXcJ84ouxoTczx10upRjfaCPO83-TH5PmrYTR2xRnU49KiDx8ZnMEWjVH1M-CpJoj-cTFRAf3vRYs9Dss0S2dVBfWQTYQOo3uUGiRTSeGjiTVYLCSf0Skx9-SAqlh9tegU__wJ55o_II6ZSF2IOoxUi4_0F3QK7phDU1taRn1vVSWp4SbMmYv4COCQOCzBzWVCVpuLvvqpJPHKAI9OekxWg-FBI93yjQYy2848g3LWa-hDbJUU7_0Cio" 
                />
              </div>
              <span className="text-[9px] font-extrabold text-white/50 uppercase mb-0.5">Rank #2</span>
              <h4 className="text-xs font-bold">Double Espresso</h4>
              <p className="text-[10px] text-white/60 mt-0.5">982 Terjual</p>
            </div>

            {/* Rank 3 */}
            <div className="min-w-[170px] bg-white/5 rounded-2xl p-4 flex flex-col items-center text-center border border-transparent hover:border-white/10 transition-all">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border border-white/10 shadow shrink-0">
                <img 
                  alt="Artisan Croissant" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4BtGzKwB8qVSQzIRNb09qBga07x-5RxgOtubIgwuwo-PfWsME8vt78n9FwdBatZu1ntuucn18PfEhfxmLLeAOn8so6j0NkXtLtgkLw8Bc1iiwSUFMNX9BSCVAe4XYt1ViHA1a2_hTq9FH9I4LkLf55wZMXgoFR83t_ymjg7RkLzPtxfvA5YPL-shke4De3GckFQRC7JdvbyOFN5YJfhf6bbTU8pGNY_NSAq7EsRDO-7Z94SQ0-shL3t4tk60PcEoqwa078_5YjAE" 
                />
              </div>
              <span className="text-[9px] font-extrabold text-white/50 uppercase mb-0.5">Rank #3</span>
              <h4 className="text-xs font-bold">Artisan Croissant</h4>
              <p className="text-[10px] text-white/60 mt-0.5">845 Terjual</p>
            </div>

            {/* Rank 4 */}
            <div className="min-w-[170px] bg-white/5 rounded-2xl p-4 flex flex-col items-center text-center border border-transparent hover:border-white/10 transition-all">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border border-white/10 shadow shrink-0">
                <img 
                  alt="Kyoto Matcha" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTJqht1sQD4GSxM7SM2NDynSDQ1jHlTWbJAO_NFkuqFHYTuWgDNQBQhgod8C5pWzcXHNBkht6idsdb40rSWFVNV_UxXKPIUENQKc-wlGWAmLgk6rExb0wpi_t0wIpD_jnymUQRRZ_PilI5YwZKwHgomHLywvczCNn_zpUafmwzyhTH_WsKMaDBuqjYKTHWMtKh2ih1dd-GD2W4OUbVAdJC9IxTlRkA0jhzAICHXJsWtcEpuENhPeg17wL0eBMvbuFDPDZ3Nwhrg4k" 
                />
              </div>
              <span className="text-[9px] font-extrabold text-white/50 uppercase mb-0.5">Rank #4</span>
              <h4 className="text-xs font-bold">Kyoto Matcha</h4>
              <p className="text-[10px] text-white/60 mt-0.5">720 Terjual</p>
            </div>

            {/* Rank 5 */}
            <div className="min-w-[170px] bg-white/5 rounded-2xl p-4 flex flex-col items-center text-center border border-transparent hover:border-white/10 transition-all">
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border border-white/10 shadow shrink-0">
                <img 
                  alt="Avocado Toast" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoNxt7wqTM26VhORno_KzZeNo14WaO0rscL2qPdZbCD0vMTw2OyLP1tU6a43s8Bd5-D56vH7pqkClnkPdS_DdMPT0JOjI5QTQm-R4QgoPZcU1BnMeC7k21kyEh_Gw0cB54tr9gQT6IiTTCC52HctXthiXWLFi429eAGRo2cv-MARj4FIxwHgWsEGb7ey8LGxW_0cJZVcTzf8QLLOy67ZeNatyIqSDsnWUZxqNjwAXWfHVLQmqx_ca1oBh8Sj9iG4dkRRFeQa3rruI" 
                />
              </div>
              <span className="text-[9px] font-extrabold text-white/50 uppercase mb-0.5">Rank #5</span>
              <h4 className="text-xs font-bold">Avocado Toast</h4>
              <p className="text-[10px] text-white/60 mt-0.5">610 Terjual</p>
            </div>

          </div>
        </div>

      </section>

      {/* Stateful table transaction registers */}
      <section className="bg-white rounded-3xl shadow-sm border border-cafe-200/40 overflow-hidden">
        
        {/* Title, Search, and Filters */}
        <div className="px-6 py-5 border-b border-cafe-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-base font-bold text-espresso-900">Rincian Transaksi Harian</h3>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="flex-1 md:w-64 relative min-w-[200px]">
              <Search className="w-4 h-4 text-cafe-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Cari ID Transaksi atau Kasir..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-cafe-50 border border-cafe-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-espresso-900 focus:border-espresso-900 focus:bg-white transition-all"
              />
            </div>
            
            {/* Filter Method */}
            <div className="relative">
              <select 
                value={filterMethod}
                onChange={(e) => {
                  setFilterMethod(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-cafe-50 border border-cafe-200 rounded-xl px-4 py-2 pr-9 text-xs font-bold text-espresso-900 focus:ring-0 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Metode</option>
                <option value="QRIS">QRIS</option>
                <option value="Debit">Debit</option>
                <option value="Tunai">Tunai</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-cafe-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cafe-50/50 text-cafe-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">ID Transaksi</th>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Nama Kasir</th>
                <th className="px-6 py-4">Metode Bayar</th>
                <th className="px-6 py-4 text-right">Total Transaksi</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cafe-50 font-medium">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-cafe-400 font-bold">
                    Tidak ada transaksi tercatat.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((t) => {
                  const isCancel = t.status === 'Batal';
                  
                  let badgeStyle = 'bg-secondary-container text-on-secondary-container';
                  if (t.method === 'Tunai') badgeStyle = 'bg-cafe-50 text-espresso-900 border border-cafe-250';
                  if (t.method === 'Debit') badgeStyle = 'bg-espresso-900 text-white';

                  return (
                    <tr key={t.id} className="hover:bg-cafe-50/35 transition-colors">
                      <td className="px-6 py-4 text-espresso-950 font-black tracking-tight">{t.id}</td>
                      <td className="px-6 py-4 text-cafe-500 font-semibold">{t.time}</td>
                      <td className="px-6 py-4 text-espresso-900 font-bold">{t.cashier}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase ${badgeStyle}`}>
                          {t.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-espresso-950">
                        Rp {t.total.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1 text-[11px] font-bold ${isCancel ? 'text-red-500' : 'text-secondary'}`}>
                          {isCancel ? (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" /> Batal
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-secondary shrink-0" /> Selesai
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginations Footer info */}
        <div className="px-6 py-4 border-t border-cafe-100 flex justify-between items-center bg-cafe-50/20">
          <span className="text-[10px] text-cafe-400 font-bold uppercase tracking-wider">
            Menampilkan {paginatedTransactions.length} dari {filteredTransactions.length} transaksi
          </span>
          
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-cafe-200 bg-white hover:bg-cafe-50 text-espresso-900 active:scale-95 disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="w-9 h-9 flex items-center justify-center rounded-xl bg-espresso-900 text-white font-bold text-xs select-none">
              {currentPage}
            </span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-cafe-200 bg-white hover:bg-cafe-50 text-espresso-900 active:scale-95 disabled:opacity-40 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </section>

    </div>
  );
}
