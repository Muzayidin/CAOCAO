'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Trash2, ArrowUpRight, 
  Award, Flame, Sparkles, FileText, Download, PieChart, Info, Scale, Users, CheckCircle, Clock 
} from 'lucide-react';
import { api } from '@/lib/api-client';

export default function AnalyticsDashboard() {
  const [activeRange, setActiveRange] = useState('BULAN_INI');
  const [activeTab, setActiveTab] = useState<'FINANCE' | 'PERFORMANCE'>('FINANCE');

  // Security and role simulation
  const [userRole, setUserRole] = useState('ADMIN');
  const [mergeAdminOwner, setMergeAdminOwner] = useState(false);

  // Financial States
  const [grossRevenue, setGrossRevenue] = useState(142850.00); // styled to mockup default
  const [wasteLoss, setWasteLoss] = useState(3120.40);       // styled to mockup default
  const [opnameLoss, setOpnameLoss] = useState(0); 
  const [hppValue, setHppValue] = useState(44569.20);        // 31.2% HPP Ratio

  const [productsList, setProductsList] = useState<any[]>([]);
  const [ingredientsList, setIngredientsList] = useState<any[]>([]);

  // HR & Employee States
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [hrPolicy, setHrPolicy] = useState<any>({
    lateTolerance: 15,
    overtimeRate: 20000,
    latePenaltyHours: 1,
  });

  useEffect(() => {
    const loadAllStates = async () => {
      try {
        // Load User role and Merge policy
        const storedUser = localStorage.getItem('pos_user');
        if (storedUser) {
          try {
            setUserRole(JSON.parse(storedUser).role);
          } catch (e) {}
        }
        const storedMerge = localStorage.getItem('pos_merge_admin_owner');
        if (storedMerge) {
          setMergeAdminOwner(JSON.parse(storedMerge));
        }

        // Load data from API
        try {
          const [ings, prods, waste, users, atts] = await Promise.all([
            api.inventory.getIngredients(),
            api.inventory.getProducts(),
            api.inventory.getWasteLogs(),
            api.auth.getUsers(),
            api.employee.getAttendance()
          ]);
          setIngredientsList(ings);
          setProductsList(prods);
          setWasteLoss(waste.reduce((acc: number, log: any) => acc + (log.costLoss || 0), 0));
          setEmployees(users);
          setAttendances(atts);
        } catch (apiErr) {
          console.log('Analytics API Server offline, using local fallback.');
          
          // Load Products
          const storedProds = localStorage.getItem('pos_products');
          if (storedProds) {
            setProductsList(JSON.parse(storedProds));
          } else {
            const fallbacks = [
              { id: 'p1', name: 'Cold Brew Nitro', price: 35000, category: 'DRINK', isBOM: true, recipe: [{ ingredientName: 'Biji Kopi Toraja (Espresso Beans)', quantity: 20 }, { ingredientName: 'Sirup Caramel', quantity: 15 }], manualHPP: 6300, opCost: 1500 },
              { id: 'p2', name: 'Avocado Tartine', price: 42000, category: 'FOOD', isBOM: true, recipe: [{ ingredientName: 'Mentega Croissant', quantity: 80 }, { ingredientName: 'Tepung Almond', quantity: 15 }], manualHPP: 15120, opCost: 2000 },
              { id: 'p3', name: 'Oat Latte', price: 32000, category: 'DRINK', isBOM: true, recipe: [{ ingredientName: 'Biji Kopi Toraja (Espresso Beans)', quantity: 20 }, { ingredientName: 'Susu Segar (Fresh Milk)', quantity: 250 }], manualHPP: 28160, opCost: 500 },
            ];
            setProductsList(fallbacks);
          }

          // Load Ingredients
          const storedIngs = localStorage.getItem('pos_ingredients');
          if (storedIngs) {
            setIngredientsList(JSON.parse(storedIngs));
          } else {
            const fallbacksIngs = [
              { name: 'Biji Kopi Toraja (Espresso Beans)', costPerUnit: 15 },
              { name: 'Susu Segar (Fresh Milk)', costPerUnit: 20 },
              { name: 'Sirup Caramel', costPerUnit: 30 },
              { name: 'Mentega Croissant', costPerUnit: 50 },
              { name: 'Daging Sapi Patty (Beef Patty)', costPerUnit: 12000 },
              { name: 'Tepung Almond', costPerUnit: 80 },
            ];
            setIngredientsList(fallbacksIngs);
          }

          // Load Waste
          const storedWaste = localStorage.getItem('pos_waste_logs');
          let currentWaste = 3120.40; // Mockup default
          if (storedWaste) {
            const wasteLogs = JSON.parse(storedWaste);
            if (Array.isArray(wasteLogs) && wasteLogs.length > 0) {
              const sum = wasteLogs.reduce((acc: number, log: any) => acc + (log.costLoss || 0), 0);
              if (sum > 0) {
                currentWaste = sum;
              }
            }
          }
          setWasteLoss(currentWaste);

          // Load HR States
          const storedEmps = localStorage.getItem('pos_employees');
          if (storedEmps) {
            setEmployees(JSON.parse(storedEmps));
          } else {
            const fallbackEmps = [
              { id: 'emp1', name: 'Budi Santoso', role: 'CASHIER', hoursWorked: 160, baseRate: 15000, pin: '1111' },
              { id: 'emp2', name: 'Jono Raharjo', role: 'WAITER', hoursWorked: 142, baseRate: 12000, pin: '2222' },
              { id: 'emp3', name: 'Siti Aminah', role: 'BARISTA', hoursWorked: 168, baseRate: 16000, pin: '3333' },
            ];
            setEmployees(fallbackEmps);
          }

          const storedAtts = localStorage.getItem('pos_attendances');
          if (storedAtts) {
            setAttendances(JSON.parse(storedAtts));
          } else {
            const fallbackAtts = [
              { id: 'att-1', employeeName: 'Budi Santoso', clockIn: '07:58', clockOut: '16:02', hours: 8.0, date: '25-05-2026', status: 'Hadir', location: 'Cafe Caocao (GPS: -6.2088, 106.8456)' },
              { id: 'att-2', employeeName: 'Siti Aminah', clockIn: '08:14', clockOut: '16:05', hours: 7.8, date: '25-05-2026', status: 'Hadir', location: 'Cafe Caocao (GPS: -6.2088, 106.8456)' },
            ];
            setAttendances(fallbackAtts);
          }
        }

        // Load Financial Orders (Still from local cache for real-time POS feedback)
        const storedOrders = localStorage.getItem('pos_completed_orders');
        let currentGross = 142850; // Mockup default
        if (storedOrders) {
          const orders = JSON.parse(storedOrders);
          if (Array.isArray(orders) && orders.length > 0) {
            const sum = orders.reduce((acc: number, o: any) => acc + o.totalAfter, 0);
            if (sum > 0) {
              currentGross = sum;
            }
          }
        }
        setGrossRevenue(currentGross);

        // Load Opname
        const storedOpname = localStorage.getItem('pos_opname_logs');
        let currentOpname = 0;
        if (storedOpname) {
          const opnameLogs = JSON.parse(storedOpname);
          if (Array.isArray(opnameLogs) && opnameLogs.length > 0) {
            const sum = opnameLogs
              .filter((log: any) => log.discrepancyValue < 0)
              .reduce((acc: number, log: any) => acc + Math.abs(log.discrepancyValue), 0);
            if (sum > 0) {
              currentOpname = sum;
            }
          }
        }
        setOpnameLoss(currentOpname);

        // HPP Ratio (mockup default is 31.2%)
        setHppValue(Math.round(currentGross * 0.312));

        const storedPolicy = localStorage.getItem('pos_hr_policy');
        if (storedPolicy) {
          setHrPolicy(JSON.parse(storedPolicy));
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadAllStates();

    // Listen to storage updates for instant syncing between routes
    const handleStorageChange = () => {
      loadAllStates();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Performance calculations
  const totalLateCount = attendances.filter(a => a.status === 'Terlambat').length;
  
  // Calculate dynamic labor payroll cost
  const totalLaborCost = employees.reduce((sum, emp) => {
    const empLates = attendances.filter(a => a.employeeName === emp.name && a.status === 'Terlambat').length;
    const lateDeduction = empLates * (hrPolicy.latePenaltyHours || 1) * emp.baseRate;
    
    const standardLimit = 140;
    const standardHours = Math.min(standardLimit, emp.hoursWorked);
    const overtimeHours = Math.max(0, emp.hoursWorked - standardLimit);
    
    const basePay = standardHours * emp.baseRate;
    const overtimePay = overtimeHours * (hrPolicy.overtimeRate || 20000);
    
    return sum + (basePay + overtimePay - lateDeduction);
  }, 0);

  // Stats definition reflecting premium styles
  const isIDR = grossRevenue > 200000;
  const currencySign = isIDR ? 'Rp ' : '$';
  const formatMoney = (val: number) => {
    return currencySign + val.toLocaleString('id-ID', { minimumFractionDigits: isIDR ? 0 : 2, maximumFractionDigits: isIDR ? 0 : 2 });
  };

  const detailedPnL = [
    { category: 'COGS - Beverages (Roasted Beans & Milk)', budgeted: isIDR ? 12000000 : 12000.00, actual: isIDR ? 13240000 : 13240.00, variance: '+10.3%', status: 'OVER_BUDGET' },
    { category: 'Labor - Front of House (Barista & Waiter)', budgeted: isIDR ? 18500000 : 18500.00, actual: isIDR ? 17920000 : 17920.00, variance: '-3.1%', status: 'OPTIMIZED' },
    { category: 'Facility - Utilities (Electric, Water & HVAC)', budgeted: isIDR ? 2400000 : 2400.00, actual: isIDR ? 2450000 : 2450.00, variance: '+2.0%', status: 'ON_TRACK' },
    { category: 'Marketing & PR (Socials & Influencers)', budgeted: isIDR ? 3000000 : 3000.00, actual: isIDR ? 2100000 : 2100.00, variance: '-30.0%', status: 'SAVINGS' },
  ];

  const handleExportCSV = () => {
    if (activeTab === 'FINANCE') {
      alert('Spreadsheet Laporan Keuangan Lengkap POS Cafe berhasil diekspor! (pos_financial_report_' + activeRange.toLowerCase() + '.csv)');
    } else {
      alert('Spreadsheet Laporan Performa Kehadiran Staf berhasil diekspor! (pos_employee_performance_' + activeRange.toLowerCase() + '.csv)');
    }
  };

  // Restricted Access screen for Admin if mergeRole toggle is false
  const isRestricted = userRole === 'ADMIN' && !mergeAdminOwner;

  if (isRestricted) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-cafe-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-espresso-900 text-cafe-50 rounded-xl flex items-center justify-center shadow">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-espresso-900 font-sans">Owner Dashboard restricted</h2>
              <p className="text-xs text-on-surface-variant font-medium">Akses laporan dan analitik dikunci oleh Owner.</p>
            </div>
          </div>
        </div>

        <div className="py-20 flex flex-col items-center justify-center bg-white border border-cafe-200 rounded-3xl p-8 text-center max-w-lg mx-auto shadow-premium space-y-4">
          <div className="w-16 h-16 bg-error-container text-on-error-container border border-error-container/20 rounded-2xl flex items-center justify-center animate-bounce shadow">
            <Scale className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-extrabold text-espresso-900">Akses Terbatas: Hanya untuk Owner!</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed max-w-sm">
              Laporan keuangan laba rugi (PnL), margin biaya HPP resep, dan laporan performa presensi karyawan adalah data bisnis rahasia.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-1 py-4">
      {/* Welcome & Date Picker */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider">DASHBOARD OVERVIEW</p>
          <h2 className="text-3xl font-bold text-espresso-900 font-sans tracking-tight">Analytics Intelligence</h2>
        </div>
        <div className="flex items-center bg-white border border-cafe-200/50 rounded-2xl p-1.5 shadow-sm self-start md:self-auto">
          <button 
            onClick={() => setActiveRange('HARI_INI')}
            className={`px-4 py-2 font-label-md text-label-md transition-colors rounded-xl font-semibold ${activeRange === 'HARI_INI' ? 'bg-espresso-900 text-white' : 'text-on-surface-variant hover:bg-cafe-50'}`}
          >
            Day
          </button>
          <button 
            onClick={() => setActiveRange('BULAN_INI')}
            className={`px-4 py-2 font-label-md text-label-md transition-colors rounded-xl font-semibold ${activeRange === 'BULAN_INI' ? 'bg-espresso-900 text-white' : 'text-on-surface-variant hover:bg-cafe-50'}`}
          >
            Month
          </button>
          <button 
            onClick={() => setActiveRange('TAHUN_INI')}
            className={`px-4 py-2 font-label-md text-label-md transition-colors rounded-xl font-semibold ${activeRange === 'TAHUN_INI' ? 'bg-espresso-900 text-white' : 'text-on-surface-variant hover:bg-cafe-50'}`}
          >
            Year
          </button>
        </div>
      </section>

      {/* Primary tab switcher */}
      <div className="flex bg-cafe-200/40 p-1 rounded-2xl border border-cafe-200/20 w-fit">
        <button
          onClick={() => setActiveTab('FINANCE')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'FINANCE' ? 'bg-white text-espresso-900 shadow-sm' : 'text-on-surface-variant hover:text-espresso-900'}`}
        >
          Metrik Finansial
        </button>
        <button
          onClick={() => setActiveTab('PERFORMANCE')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'PERFORMANCE' ? 'bg-white text-espresso-900 shadow-sm' : 'text-on-surface-variant hover:text-espresso-900'}`}
        >
          Performa Kehadiran Roster
        </button>
      </div>

      {activeTab === 'FINANCE' && (
        <div className="space-y-8 animate-scale-up">
          {/* Financial Summary Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Gross Revenue */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-cafe-200/20 group hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-secondary-container text-on-secondary-container rounded-2xl">
                  <span className="material-symbols-outlined select-none text-[24px]">payments</span>
                </div>
                <span className="text-green-600 font-label-sm text-label-sm flex items-center gap-1 font-bold">
                  +12.4% <TrendingUp className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant">Gross Revenue</p>
              <h3 className="text-2xl font-bold text-espresso-900 mt-1">{formatMoney(grossRevenue)}</h3>
            </div>

            {/* HPP Ratio */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-cafe-200/20 group hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-cafe-50 text-espresso-900 rounded-2xl">
                  <span className="material-symbols-outlined select-none text-[24px]">inventory_2</span>
                </div>
                <span className="text-on-surface-variant font-label-sm text-label-sm font-semibold">Target &lt; 28%</span>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant">HPP Ratio</p>
              <h3 className="text-2xl font-bold text-espresso-900 mt-1">31.2%</h3>
            </div>

            {/* Labor Cost */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-cafe-200/20 group hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-cafe-50 text-espresso-900 rounded-2xl">
                  <span className="material-symbols-outlined select-none text-[24px]">badge</span>
                </div>
                <span className="text-green-600 font-label-sm text-label-sm flex items-center gap-1 font-bold">
                  -2.1% <TrendingDown className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant">Labor Cost</p>
              <h3 className="text-2xl font-bold text-espresso-900 mt-1">{isIDR ? '22.5%' : formatMoney(totalLaborCost || 32141.25)}</h3>
            </div>

            {/* Waste Loss */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-cafe-200/20 group hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-error-container text-on-error-container rounded-2xl">
                  <span className="material-symbols-outlined select-none text-[24px]">delete_sweep</span>
                </div>
                <span className="text-error font-label-sm text-label-sm flex items-center gap-1 font-bold">
                  +4.5% <Flame className="w-3.5 h-3.5 text-error animate-pulse" />
                </span>
              </div>
              <p className="font-label-md text-label-md text-on-surface-variant">Waste Loss</p>
              <h3 className="text-2xl font-bold text-espresso-900 mt-1">{formatMoney(wasteLoss + opnameLoss)}</h3>
            </div>
          </section>

          {/* Middle Row: Health Ratios & Decision Engine */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Business Health & BEP */}
            <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-cafe-200/20 flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-espresso-900 mb-6 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-earth-olive" /> Health Ratios
                </h4>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2 font-semibold">
                      <span className="font-label-md text-label-md text-on-surface-variant">Break-Even Point (BEP)</span>
                      <span className="font-label-md text-label-md text-espresso-900">82% Achieved</span>
                    </div>
                    <div className="h-2 w-full bg-cafe-50 rounded-full overflow-hidden">
                      <div className="h-full bg-earth-olive rounded-full" style={{ width: '82%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 font-semibold">
                      <span className="font-label-md text-label-md text-on-surface-variant">Net Profit Margin</span>
                      <span className="font-label-md text-label-md text-espresso-900">18.4%</span>
                    </div>
                    <div className="h-2 w-full bg-cafe-50 rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: '18.4%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 font-semibold">
                      <span className="font-label-md text-label-md text-on-surface-variant">Operational Efficiency</span>
                      <span className="font-label-md text-label-md text-espresso-900">94%</span>
                    </div>
                    <div className="h-2 w-full bg-cafe-50 rounded-full overflow-hidden">
                      <div className="h-full bg-espresso-900 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 p-4 bg-cafe-50 rounded-2xl border border-cafe-200/50">
                <p className="text-xs text-on-surface-variant italic font-medium leading-relaxed">
                  "Your BEP is projected to be reached by Day 24 this month. Higher HPP on coffee beans is being offset by lower waste in pastries."
                </p>
              </div>
            </div>

            {/* BI Decision Engine: Menu Profitability */}
            <div className="lg:col-span-2 bg-espresso-900 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <span className="material-symbols-outlined text-[180px] select-none">insights</span>
              </div>
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-secondary-container" /> Menu Profitability Engine
                  </h4>
                  <span className="bg-earth-olive px-3.5 py-1 rounded-full font-bold text-[10px] tracking-wider text-white">AI-POWERED</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: Excellent */}
                  <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-secondary-container font-bold text-[10px] tracking-wider uppercase">Excellent</span>
                        <CheckCircle className="w-4 h-4 text-secondary-container" />
                      </div>
                      <h5 className="font-semibold text-base mb-1">Cold Brew Nitro</h5>
                      <p className="text-[11px] text-white/60">Margin: 82% | Volume: High</p>
                    </div>
                    <button 
                      onClick={() => alert('Item Cold Brew Nitro berhasil dipromosikan ke halaman depan POS Kasir!')}
                      className="mt-6 w-full py-2 bg-white text-espresso-900 rounded-xl font-bold text-xs active:scale-95 transition-transform"
                    >
                      Promote Item
                    </button>
                  </div>

                  {/* Card 2: Healthy */}
                  <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-white/80 font-bold text-[10px] tracking-wider uppercase">Healthy</span>
                        <CheckCircle className="w-4 h-4 text-white/80" />
                      </div>
                      <h5 className="font-semibold text-base mb-1">Avocado Tartine</h5>
                      <p className="text-[11px] text-white/60">Margin: 64% | Volume: Mid</p>
                    </div>
                    <button 
                      onClick={() => alert('Membuka tren performa produk Avocado Tartine...')}
                      className="mt-6 w-full py-2 bg-white/20 text-white rounded-xl font-bold text-xs active:scale-95 transition-transform"
                    >
                      View Trends
                    </button>
                  </div>

                  {/* Card 3: Critical */}
                  <div className="bg-error/20 backdrop-blur-md p-5 rounded-2xl border border-error/30 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-error-container font-bold text-[10px] tracking-wider uppercase">Critical</span>
                        <span className="material-symbols-outlined text-error-container text-sm">error</span>
                      </div>
                      <h5 className="font-semibold text-base mb-1">Oat Latte</h5>
                      <p className="text-[11px] text-white/60">Margin: 12% | Cost Spike</p>
                    </div>
                    <button 
                      onClick={() => alert('Rekomendasi Owner: Naikkan harga Oat Latte sebesar Rp 3.000 untuk mengembalikan rasio profit sehat.')}
                      className="mt-6 w-full py-2 bg-error text-white rounded-xl font-bold text-xs active:scale-95 transition-transform"
                    >
                      Adjust Price
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PnL Ledger Table */}
          <section className="bg-white rounded-3xl shadow-sm border border-cafe-200/20 overflow-hidden">
            <div className="px-8 py-6 border-b border-cafe-200/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h4 className="text-lg font-bold text-espresso-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-earth-olive" /> Profit &amp; Loss Ledger
              </h4>
              <div className="flex gap-2">
                <button 
                  onClick={() => alert('PDF Laporan Laba Rugi berhasil diunduh.')}
                  className="flex items-center gap-2 px-4 py-2 bg-cafe-50 rounded-xl font-bold text-xs text-on-surface-variant hover:bg-cafe-200/50 transition-colors"
                >
                  <Download className="w-4 h-4" /> Export PDF
                </button>
                <button 
                  onClick={() => alert('Membuka filter anggaran...')}
                  className="flex items-center gap-2 px-4 py-2 bg-cafe-50 rounded-xl font-bold text-xs text-on-surface-variant hover:bg-cafe-200/50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] select-none">filter_list</span> Filter
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-cafe-50/50 text-on-surface-variant uppercase font-bold text-[10px] tracking-wider border-b border-cafe-200/30">
                    <th className="px-8 py-4">Account Category</th>
                    <th className="px-8 py-4 text-right">Budgeted</th>
                    <th className="px-8 py-4 text-right">Actual</th>
                    <th className="px-8 py-4 text-right">Variance</th>
                    <th className="px-8 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cafe-200/30 text-xs font-semibold text-cafe-800">
                  {detailedPnL.map((row, idx) => (
                    <tr key={idx} className="hover:bg-cafe-50/30 transition-colors">
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-espresso-900">{row.category}</p>
                      </td>
                      <td className="px-8 py-5 text-right font-medium text-on-surface-variant">{formatMoney(row.budgeted)}</td>
                      <td className="px-8 py-5 text-right font-bold text-espresso-900">{formatMoney(row.actual)}</td>
                      <td className={`px-8 py-5 text-right font-bold ${row.variance.startsWith('-') ? 'text-green-600' : 'text-error'}`}>{row.variance}</td>
                      <td className="px-8 py-5 text-right">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          row.status === 'OVER_BUDGET' ? 'bg-error-container text-on-error-container' : 
                          row.status === 'OPTIMIZED' ? 'bg-secondary-container text-on-secondary-container' :
                          row.status === 'ON_TRACK' ? 'bg-cafe-200 text-on-surface-variant' :
                          'bg-secondary-container text-on-secondary-container'
                        }`}>
                          {row.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'PERFORMANCE' && (
        <div className="space-y-6 animate-scale-up">
          <section className="bg-white rounded-3xl p-6 border border-cafe-200/50 shadow-premium space-y-4">
            <div>
              <h3 className="font-extrabold text-espresso-900 text-base">Analisis Performa Absensi &amp; Disiplin Karyawan</h3>
              <p className="text-[10px] text-on-surface-variant font-semibold">Pemeringkatan efisiensi jam kerja roster dinas, rasio keterlambatan, denda potong gaji, dan verifikasi geofencing GPS</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-cafe-200/50 text-on-surface-variant uppercase font-extrabold tracking-wider">
                    <th className="pb-3 px-4">Karyawan</th>
                    <th className="pb-3 text-right px-4">Jam Kerja</th>
                    <th className="pb-3 text-center px-4">Absensi Masuk</th>
                    <th className="pb-3 text-center px-4">Frekuensi Telat</th>
                    <th className="pb-3 text-right px-4">Denda Terpotong</th>
                    <th className="pb-3 text-center px-4">Rasio Disiplin</th>
                    <th className="pb-3 text-center px-4">Verifikasi Geofencing</th>
                    <th className="pb-3 text-center px-4">Peringkat Performa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cafe-50 font-semibold text-cafe-850">
                  {employees.map((emp) => {
                    const empAtts = attendances.filter(a => a.employeeName === emp.name);
                    const totalAttCount = empAtts.length || 1;
                    const lateCount = empAtts.filter(a => a.status === 'Terlambat').length;
                    const awayCount = empAtts.filter(a => a.status === 'Diluar Area (Tidak Valid)').length;
                    
                    const dendaVal = lateCount * (hrPolicy.latePenaltyHours || 1) * emp.baseRate;
                    const disciplineRatio = ((totalAttCount - lateCount - awayCount) / totalAttCount) * 100;
                    
                    let rating = 'GOOD';
                    let ratingAdvice = 'Baik (Disiplin)';
                    let ratingColor = 'bg-earth-olive/10 text-earth-olive border border-earth-olive/20';
                    
                    if (disciplineRatio >= 95) {
                      rating = 'EXCELLENT';
                      ratingAdvice = 'Sempurna';
                      ratingColor = 'bg-secondary-container text-on-secondary-container border border-secondary-container/20';
                    } else if (disciplineRatio < 80 || awayCount > 0) {
                      rating = 'CRITICAL';
                      ratingAdvice = 'Butuh Pembinaan';
                      ratingColor = 'bg-error-container text-on-error-container border border-error-container/20';
                    }

                    const hasAway = awayCount > 0;
                    const mainLoc = hasAway ? 'Di Luar Area GPS' : 'Cafe Caocao (GPS)';

                    return (
                      <tr key={emp.id} className="hover:bg-cafe-50/20 transition-all">
                        <td className="py-4 px-4">
                          <span className="text-espresso-900 font-bold block">{emp.name}</span>
                          <span className="text-[9px] text-on-surface-variant uppercase">{emp.role} &bull; Upah Rp {emp.baseRate.toLocaleString('id-ID')}/jam</span>
                        </td>
                        <td className="py-4 text-right font-extrabold text-espresso-900 px-4">{emp.hoursWorked} Jam</td>
                        <td className="py-4 text-center px-4">{totalAttCount} kali</td>
                        <td className="py-4 text-center text-error font-bold px-4">{lateCount} hari</td>
                        <td className="py-4 text-right text-error font-bold px-4">
                          {dendaVal > 0 ? `-Rp ${dendaVal.toLocaleString('id-ID')}` : 'Rp 0'}
                        </td>
                        <td className="py-4 text-center font-bold text-espresso-900 px-4">
                          {disciplineRatio.toFixed(0)}%
                        </td>
                        <td className="py-4 text-center font-semibold text-[10px] px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold border inline-block ${
                            hasAway ? 'bg-error-container text-on-error-container border-error-container/20' : 'bg-secondary-container text-on-secondary-container border-secondary-container/20'
                          }`}>
                            {mainLoc}
                          </span>
                        </td>
                        <td className="py-4 text-center px-4">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-extrabold border ${ratingColor}`}>
                            {rating} ({ratingAdvice})
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
