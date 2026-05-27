'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Clock, DollarSign, FileText, 
  CheckCircle, AlertCircle, Plus, Sparkles, Receipt, X, ArrowUpRight 
} from 'lucide-react';

const INITIAL_EMPLOYEES = [
  { id: 'emp1', name: 'Budi Santoso', role: 'CASHIER', hoursWorked: 160, baseRate: 15000, pin: '1111' },
  { id: 'emp2', name: 'Jono Raharjo', role: 'WAITER', hoursWorked: 142, baseRate: 12000, pin: '2222' },
  { id: 'emp3', name: 'Siti Aminah', role: 'BARISTA', hoursWorked: 168, baseRate: 16000, pin: '3333' },
];

const INITIAL_SCHEDULES = [
  { id: 's1', name: 'Budi Santoso', date: 'Senin, 25 Mei', shift: 'Pagi (08:00 - 16:00)' },
  { id: 's2', name: 'Jono Raharjo', date: 'Senin, 25 Mei', shift: 'Sore (16:00 - 00:00)' },
  { id: 's3', name: 'Siti Aminah', date: 'Selasa, 26 Mei', shift: 'Pagi (08:00 - 16:00)' },
];

const INITIAL_ATTENDANCES = [
  { id: 'att-1', employeeName: 'Budi Santoso', clockIn: '07:58', clockOut: '16:02', hours: 8.0, date: '25-05-2026', status: 'Hadir', location: 'Cafe Caocao (GPS: -6.2088, 106.8456)' },
  { id: 'att-2', employeeName: 'Siti Aminah', clockIn: '08:14', clockOut: '16:05', hours: 7.8, date: '25-05-2026', status: 'Hadir', location: 'Cafe Caocao (GPS: -6.2088, 106.8456)' },
];

export default function EmployeeSchedulePayroll() {
  const [activeSubTab, setActiveSubTab] = useState<'SHIFT' | 'SCHEDULE' | 'PAYROLL' | 'POLICY'>('SHIFT');
  
  // Data States
  const [employees, setEmployees] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [shiftLogs, setShiftLogs] = useState<any[]>([]);

  // Shift Drawer States
  const [activeShift, setActiveShift] = useState<any>({ status: 'CLOSED' });
  const [shiftCapital, setShiftCapital] = useState('500000'); 
  const [expectedCashSales, setExpectedCashSales] = useState(850000);
  const [expectedQrisSales, setExpectedQrisSales] = useState(300000);
  const [expectedCardSales, setExpectedCardSales] = useState(200000);

  // Cashier close shift physically keyed entries
  const [actualCash, setActualCash] = useState('1345000'); 
  const [actualQris, setActualQris] = useState('300000');
  const [actualCard, setActualCard] = useState('200000');

  // Modals overlays triggers
  const [isEmployeeOpen, setIsEmployeeOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isClockOpen, setIsClockOpen] = useState(false);

  // Form Inputs
  const [newEmp, setNewEmp] = useState({ name: '', role: 'CASHIER', baseRate: '', pin: '' });
  const [newSched, setNewSched] = useState({ employeeId: 'emp1', date: 'Rabu, 27 Mei', shift: 'Pagi (08:00 - 16:00)' });
  const [clockPin, setClockPin] = useState('');

  // Payroll slips states
  const [payrollSlips, setPayrollSlips] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState('emp1');
  const [payrollInputs, setPayrollInputs] = useState({
    monthYear: 'Mei 2026',
    allowances: '200000',
    deductions: '50000',
  });

  // HR policy configuration state (Configurable by Owner)
  const [hrPolicy, setHrPolicy] = useState<any>({
    lateTolerance: 15, // toleransi telat (menit)
    overtimeRate: 20000, // upah lembur per jam
    latePenaltyHours: 1, // denda potong 1 jam gaji
  });

  const [userRole, setUserRole] = useState('ADMIN');
  const [mergeAdminOwner, setMergeAdminOwner] = useState(false);
  const [gpsMode, setGpsMode] = useState<'CAFE' | 'AWAY'>('CAFE');
  const [isMerged, setIsMerged] = useState(false); // Bar & Kasir merge
  const [rolePins, setRolePins] = useState<any>({
    OWNER: '123456',
    ADMIN: '9999',
    CASHIER: '3333',
    KITCHEN: '5555',
    BAR: '4444',
  });

  // Sync state data on mount
  useEffect(() => {
    // 1. Employees Roster
    const storedEmps = localStorage.getItem('pos_employees');
    if (storedEmps) {
      setEmployees(JSON.parse(storedEmps));
    } else {
      setEmployees(INITIAL_EMPLOYEES);
      localStorage.setItem('pos_employees', JSON.stringify(INITIAL_EMPLOYEES));
    }

    // 2. Schedules
    const storedScheds = localStorage.getItem('pos_schedules');
    if (storedScheds) {
      setSchedules(JSON.parse(storedScheds));
    } else {
      setSchedules(INITIAL_SCHEDULES);
      localStorage.setItem('pos_schedules', JSON.stringify(INITIAL_SCHEDULES));
    }

    // 3. Attendances
    const storedAtts = localStorage.getItem('pos_attendances');
    if (storedAtts) {
      setAttendances(JSON.parse(storedAtts));
    } else {
      setAttendances(INITIAL_ATTENDANCES);
      localStorage.setItem('pos_attendances', JSON.stringify(INITIAL_ATTENDANCES));
    }

    // 4. Shift Logs History
    const storedShiftLogs = localStorage.getItem('pos_shift_logs');
    if (storedShiftLogs) {
      setShiftLogs(JSON.parse(storedShiftLogs));
    } else {
      const initialLogs = [
        { id: 'sh-1', date: '24-05-2026', cashier: 'Budi Santoso', capital: 500000, expected: 1850000, actual: 1845000, discrepancy: -5000, notes: 'Uang fisik kas kurang Rp 5.000 (Tunai Rp 1.345.000 vs Rp 1.350.000)' }
      ];
      setShiftLogs(initialLogs);
      localStorage.setItem('pos_shift_logs', JSON.stringify(initialLogs));
    }

    // 5. Active Cash Drawer session state
    const storedActiveShift = localStorage.getItem('pos_active_shift');
    if (storedActiveShift) {
      setActiveShift(JSON.parse(storedActiveShift));
    }

    // 6. Dynamic Expected payment types from completed cashier checkouts
    const storedOrders = localStorage.getItem('pos_completed_orders');
    if (storedOrders) {
      try {
        const list = JSON.parse(storedOrders);
        if (Array.isArray(list) && list.length > 0) {
          const cash = list.filter((o: any) => o.paymentMethod === 'CASH').reduce((sum: number, o: any) => sum + o.totalAfter, 0);
          const qris = list.filter((o: any) => o.paymentMethod === 'QRIS').reduce((sum: number, o: any) => sum + o.totalAfter, 0);
          const card = list.filter((o: any) => o.paymentMethod === 'DEBIT').reduce((sum: number, o: any) => sum + o.totalAfter, 0);
          
          setExpectedCashSales(cash);
          setExpectedQrisSales(qris);
          setExpectedCardSales(card);

          // Update close physical inputs to match closely
          const capitalVal = parseInt(shiftCapital) || 500000;
          setActualCash((capitalVal + cash).toString());
          setActualQris(qris.toString());
          setActualCard(card.toString());
        }
      } catch (e) {}
    }

    // 7. Load global HR policy
    const storedPolicy = localStorage.getItem('pos_hr_policy');
    if (storedPolicy) {
      setHrPolicy(JSON.parse(storedPolicy));
    } else {
      const initialPolicy = {
        lateTolerance: 15,
        overtimeRate: 20000,
        latePenaltyHours: 1,
      };
      setHrPolicy(initialPolicy);
      localStorage.setItem('pos_hr_policy', JSON.stringify(initialPolicy));
    }

    // 8. Load user role for lock-downs
    const storedUser = localStorage.getItem('pos_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUserRole(u.role);
      } catch (e) {}
    }

    // 9. Load merge policy
    const storedMerge = localStorage.getItem('pos_merge_admin_owner');
    if (storedMerge) {
      setMergeAdminOwner(JSON.parse(storedMerge));
    }

    const storedBarMerge = localStorage.getItem('pos_merge_bar_cashier');
    if (storedBarMerge) {
      setIsMerged(JSON.parse(storedBarMerge));
    }

    const storedPins = localStorage.getItem('pos_role_pins');
    if (storedPins) {
      try {
        setRolePins(JSON.parse(storedPins));
      } catch (e) {}
    } else {
      const initialPins = {
        OWNER: '123456',
        ADMIN: '9999',
        KITCHEN: '5555',
        BAR: '4444',
        CASHIER: '3333',
      };
      localStorage.setItem('pos_role_pins', JSON.stringify(initialPins));
      setRolePins(initialPins);
    }

    const handleStorageChange = () => {
      const u = localStorage.getItem('pos_user');
      if (u) {
        try {
          setUserRole(JSON.parse(u).role);
        } catch (e) {}
      }
      const m = localStorage.getItem('pos_merge_admin_owner');
      if (m) {
        setMergeAdminOwner(JSON.parse(m));
      }
      const bm = localStorage.getItem('pos_merge_bar_cashier');
      if (bm) {
        setIsMerged(JSON.parse(bm));
      }
      const pins = localStorage.getItem('pos_role_pins');
      if (pins) {
        try {
          setRolePins(JSON.parse(pins));
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Redirect if they are ADMIN and role is not merged
  useEffect(() => {
    if ((activeSubTab === 'PAYROLL' || activeSubTab === 'POLICY') && userRole === 'ADMIN' && !mergeAdminOwner) {
      setActiveSubTab('SHIFT');
    }
  }, [activeSubTab, userRole, mergeAdminOwner]);

  // Update default selected employee dropdown
  useEffect(() => {
    if (employees.length > 0) {
      setSelectedEmp(employees[0].id);
      setNewSched(prev => ({ ...prev, employeeId: employees[0].id }));
    }
  }, [employees]);

  // A. CASH SHIFT SESSIONS CONTROLLER
  const handleOpenShift = () => {
    const capitalVal = parseInt(shiftCapital) || 0;
    
    // Choose active cashier from roster schedule
    const todayCashier = employees.find(e => e.role === 'CASHIER')?.name || 'Budi Santoso';

    const newShift = {
      status: 'OPEN',
      cashier: todayCashier,
      openedAt: new Date().toLocaleTimeString('id-ID'),
      capital: capitalVal,
      date: new Date().toLocaleDateString('id-ID'),
    };

    setActiveShift(newShift);
    localStorage.setItem('pos_active_shift', JSON.stringify(newShift));
    alert(`Sesi Cash Drawer Kasir Baru berhasil dibuka!\nKasir Aktif: ${newShift.cashier}\nModal Awal: Rp ${capitalVal.toLocaleString('id-ID')}`);
  };

  const handleCloseShift = () => {
    const capitalVal = activeShift.capital || 0;
    const actualCashVal = parseInt(actualCash) || 0;
    const actualQrisVal = parseInt(actualQris) || 0;
    const actualCardVal = parseInt(actualCard) || 0;

    const expectedTotal = capitalVal + expectedCashSales + expectedQrisSales + expectedCardSales;
    const actualTotal = actualCashVal + actualQrisVal + actualCardVal;
    const discrepancy = actualTotal - expectedTotal;

    const cashDiscrepancy = actualCashVal - (capitalVal + expectedCashSales);
    const qrisDiscrepancy = actualQrisVal - expectedQrisSales;
    const cardDiscrepancy = actualCardVal - expectedCardSales;

    const detailsText = `Tunai Selisih: Rp ${cashDiscrepancy.toLocaleString('id-ID')}, QRIS Selisih: Rp ${qrisDiscrepancy.toLocaleString('id-ID')}, Debit Selisih: Rp ${cardDiscrepancy.toLocaleString('id-ID')}`;

    const log = {
      id: 'sh-' + Math.random().toString(36).slice(2,6),
      date: new Date().toLocaleDateString('id-ID'),
      cashier: activeShift.cashier || 'Kasir',
      capital: capitalVal,
      expected: expectedTotal,
      actual: actualTotal,
      discrepancy,
      notes: discrepancy !== 0 ? `Sesi shift ditutup. ${detailsText}` : 'Laci kas seimbang sempurna di seluruh jenis pembayaran!',
    };

    const updatedLogs = [log, ...shiftLogs];
    setShiftLogs(updatedLogs);
    localStorage.setItem('pos_shift_logs', JSON.stringify(updatedLogs));

    // Clear active shift and completed orders cache to refresh checkout for the next shift session!
    const closedShiftState = { status: 'CLOSED' };
    setActiveShift(closedShiftState);
    localStorage.setItem('pos_active_shift', JSON.stringify(closedShiftState));
    localStorage.setItem('pos_completed_orders', '[]');
    
    // Reset expected values
    setExpectedCashSales(0);
    setExpectedQrisSales(0);
    setExpectedCardSales(0);
    setActualCash('500000');
    setActualQris('0');
    setActualCard('0');

    alert(`Shift berhasil ditutup!\nKasir: ${log.cashier}\nTotal Selisih Laci Kas: Rp ${discrepancy.toLocaleString('id-ID')}`);
  };

  // B. PIN CLOCK-IN ATTENDANCE NUMPAD CONTROLLER
  const handlePinClock = () => {
    if (!clockPin) return;

    // Match employee by PIN
    const matched = employees.find(e => e.pin === clockPin);
    if (!matched) {
      alert('PIN salah atau Karyawan tidak terdaftar!');
      setClockPin('');
      return;
    }

    const todayDateStr = new Date().toLocaleDateString('id-ID');

    // Check if employee has clocked in today
    const existingIndex = attendances.findIndex(att => att.employeeName === matched.name && att.date === todayDateStr);

    const now = new Date();
    const elapsedMinutes = (now.getHours() - 8) * 60 + now.getMinutes();
    const isLate = elapsedMinutes > (hrPolicy.lateTolerance || 15);

    const locInfo = gpsMode === 'CAFE' 
      ? 'Cafe Caocao (GPS: -6.2088, 106.8456)' 
      : 'Di Luar Area Cafe (GPS: -6.2300, 106.8120 - Jarak 4.8 km)';
    
    const attStatus = gpsMode === 'CAFE' 
      ? (isLate ? 'Terlambat' : 'Hadir')
      : 'Diluar Area (Tidak Valid)';

    if (existingIndex === -1) {
      // Clock In (Masuk Dinas)
      const clockInTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      const record = {
        id: 'att-' + Math.random().toString(36).slice(2, 6),
        employeeName: matched.name,
        clockIn: clockInTime,
        clockOut: '-',
        hours: 0,
        date: todayDateStr,
        status: attStatus,
        location: locInfo,
      };

      const updated = [record, ...attendances];
      setAttendances(updated);
      localStorage.setItem('pos_attendances', JSON.stringify(updated));
      alert(`ABSEN MASUK BERHASIL!\nSelamat bekerja, ${matched.name}\nJam Masuk: ${clockInTime} (${record.status})\nLokasi: ${locInfo}`);
    } else {
      // Clock Out (Pulang Dinas)
      const existingRecord = attendances[existingIndex];
      if (existingRecord.clockOut !== '-') {
        alert(`${matched.name} sudah melakukan absensi masuk dan keluar hari ini!`);
        setClockPin('');
        setIsClockOpen(false);
        return;
      }

      const clockOutTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      
      // Calculate active working hours (simulate 8 hours or actual elapsed time)
      // If either clock-in or clock-out is away, they get 0 hours credited!
      const hasInvalidLocation = existingRecord.status === 'Diluar Area (Tidak Valid)' || gpsMode === 'AWAY';
      const hoursSim = hasInvalidLocation ? 0 : 8.0; 

      const updatedAtts = attendances.map((att, idx) => {
        if (idx === existingIndex) {
          return {
            ...att,
            clockOut: clockOutTime,
            hours: hoursSim,
            locationOut: locInfo,
            status: hasInvalidLocation ? 'Diluar Area (Tidak Valid)' : att.status,
          };
        }
        return att;
      });

      // DYNAMIC SALARY INTEGRATION: Increment employee's hoursWorked dynamically!
      const updatedEmployees = employees.map(emp => {
        if (emp.id === matched.id) {
          return {
            ...emp,
            hoursWorked: emp.hoursWorked + hoursSim,
          };
        }
        return emp;
      });

      setAttendances(updatedAtts);
      setEmployees(updatedEmployees);

      localStorage.setItem('pos_attendances', JSON.stringify(updatedAtts));
      localStorage.setItem('pos_employees', JSON.stringify(updatedEmployees));

      alert(`ABSEN KELUAR BERHASIL!\nTerima kasih kerjanya, ${matched.name}\nJam Pulang: ${clockOutTime}\nKerja Hari Ini: ${hoursSim} Jam\nTotal Jam Kerja Roster Anda diperbarui!`);
    }

    setClockPin('');
    setIsClockOpen(false);
  };

  // C. ROSTER SCHEDULER & EMP REGISTER FORMS
  const handleRegisterEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.baseRate || !newEmp.pin) return;

    const roster = {
      id: 'emp-' + Math.random().toString(36).slice(2, 6),
      name: newEmp.name,
      role: newEmp.role,
      hoursWorked: 0, 
      baseRate: parseFloat(newEmp.baseRate),
      pin: newEmp.pin,
    };

    const updated = [...employees, roster];
    setEmployees(updated);
    localStorage.setItem('pos_employees', JSON.stringify(updated));

    setNewEmp({ name: '', role: 'CASHIER', baseRate: '', pin: '' });
    setIsEmployeeOpen(false);
    alert(`Roster karyawan baru ${roster.name} (${roster.role}) berhasil didaftarkan!`);
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = employees.find(e => e.id === newSched.employeeId);
    if (!matched) return;

    const schedRecord = {
      id: 's-' + Math.random().toString(36).slice(2, 6),
      name: matched.name,
      date: newSched.date,
      shift: newSched.shift,
    };

    const updated = [...schedules, schedRecord];
    setSchedules(updated);
    localStorage.setItem('pos_schedules', JSON.stringify(updated));

    setIsScheduleOpen(false);
    alert(`Jadwal roster dinas untuk ${matched.name} berhasil ditambahkan!`);
  };

  // D. AUTOMATED MONTHLY PAYROLL GENERATOR WITH DYNAMIC OVERTIME & LATENESS PENALTIES
  const handleSaveHrPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('pos_hr_policy', JSON.stringify(hrPolicy));
    alert(`Kebijakan HR berhasil diperbarui!\nToleransi Telat: ${hrPolicy.lateTolerance} menit\nPotongan Telat: ${hrPolicy.latePenaltyHours} jam gaji\nUpah Lembur: Rp ${hrPolicy.overtimeRate.toLocaleString('id-ID')}/jam`);
  };

  const handleUpdateRolePin = (role: string, value: string) => {
    setRolePins((prev: any) => ({
      ...prev,
      [role]: value,
    }));
  };

  const handleSaveRolePins = () => {
    localStorage.setItem('pos_role_pins', JSON.stringify(rolePins));
    window.dispatchEvent(new Event('storage'));
    alert('PIN Akses Peran Berhasil Diperbarui!');
  };

  const handleUpdateEmployee = (empId: string, fields: any) => {
    const updated = employees.map(emp => {
      if (emp.id === empId) {
        return { ...emp, ...fields };
      }
      return emp;
    });
    setEmployees(updated);
    localStorage.setItem('pos_employees', JSON.stringify(updated));
  };

  const handleResetHours = (empId: string) => {
    const matched = employees.find(e => e.id === empId);
    if (!matched) return;
    if (confirm(`Apakah Anda yakin ingin mereset akumulasi jam kerja ${matched.name} kembali ke 0?`)) {
      handleUpdateEmployee(empId, { hoursWorked: 0 });
      alert(`Jam kerja untuk ${matched.name} berhasil di-reset ke 0!`);
    }
  };

  const handleDeleteEmployee = (empId: string) => {
    const matched = employees.find(e => e.id === empId);
    if (!matched) return;
    if (confirm(`Apakah Anda yakin ingin menghapus karyawan ${matched.name} dari roster?`)) {
      const updated = employees.filter(e => e.id !== empId);
      setEmployees(updated);
      localStorage.setItem('pos_employees', JSON.stringify(updated));
      alert(`Karyawan ${matched.name} berhasil dihapus.`);
    }
  };

  const handleRegeneratePin = (empId: string) => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    handleUpdateEmployee(empId, { pin: newPin });
    alert(`PIN Baru untuk karyawan berhasil digenerate: ${newPin}`);
  };

  const handleOpenEmployeeModal = () => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setNewEmp({ name: '', role: 'CASHIER', baseRate: '', pin: randomPin });
    setIsEmployeeOpen(true);
  };

  const handleGeneratePayroll = () => {
    const emp = employees.find(e => e.id === selectedEmp);
    if (!emp) return;

    // 1. Calculate lateness counts from attendance logs for this employee
    const lateDays = attendances.filter(att => att.employeeName === emp.name && att.status === 'Terlambat');
    const lateCount = lateDays.length;
    const latePenaltyVal = lateCount * (hrPolicy.latePenaltyHours || 1) * emp.baseRate;

    // 2. Calculate standard vs overtime hours (target monthly hours limit is 140)
    const standardLimit = 140; 
    const totalHours = emp.hoursWorked;
    const standardHours = Math.min(standardLimit, totalHours);
    const overtimeHours = Math.max(0, totalHours - standardLimit);

    const baseWage = standardHours * emp.baseRate;
    const overtimeWage = overtimeHours * (hrPolicy.overtimeRate || 20000);

    const allowances = parseInt(payrollInputs.allowances) || 0;
    const deductions = parseInt(payrollInputs.deductions) || 0;
    
    // Net Pay = base wage + overtime wage + allowances - deductions - late penalty
    const netPay = baseWage + overtimeWage + allowances - deductions - latePenaltyVal;

    const slip = {
      id: 'sl-' + Math.random().toString(36).slice(2,6),
      employeeName: emp.name,
      role: emp.role,
      monthYear: payrollInputs.monthYear,
      baseWage,
      overtimeHours,
      overtimeWage,
      lateCount,
      latePenaltyVal,
      allowances,
      deductions,
      netPay,
      hours: totalHours,
    };

    const updatedSlips = [slip, ...payrollSlips];
    setPayrollSlips(updatedSlips);
    alert(`Payslip digital bulanan berhasil diterbitkan!\nGaji Pokok: Rp ${baseWage.toLocaleString('id-ID')}\nLembur (${overtimeHours.toFixed(1)} Jam): Rp ${overtimeWage.toLocaleString('id-ID')}\nDenda Telat (${lateCount} kali): -Rp ${latePenaltyVal.toLocaleString('id-ID')}\nGaji Bersih: Rp ${netPay.toLocaleString('id-ID')}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Primary header navbar */}
      <div className="flex flex-col sm:flex-row sm:items-center border-b border-cafe-200 pb-4 justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-espresso-900 text-cafe-100 rounded-xl flex items-center justify-center shadow">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-espresso-900 font-sans">Shift, Attendance & Payroll</h2>
            </div>
            <p className="text-xs text-cafe-500">Manajemen jadwal kasir, clock-in, rekonsiliasi laci kas, dan slip gaji digital</p>
          </div>
        </div>

        {/* Secondary Sub Tabs & Floating Triggers */}
        <div className="flex flex-wrap gap-2 items-center self-start sm:self-center">
          <div className="flex bg-cafe-200/50 p-1 rounded-2xl border border-cafe-200/20 shrink-0">
            {(['SHIFT', 'SCHEDULE', 'PAYROLL', 'POLICY'] as const)
              .filter((tab) => {
                if (tab === 'PAYROLL' || tab === 'POLICY') {
                  return userRole === 'OWNER' || mergeAdminOwner;
                }
                return true;
              })
              .map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeSubTab === tab
                      ? 'bg-white text-cafe-900 shadow-sm'
                      : 'text-cafe-500 hover:text-cafe-800'
                  }`}
                >
                  {tab === 'SHIFT' 
                    ? 'Laci Kas / Shift' 
                    : tab === 'SCHEDULE' 
                      ? 'Jadwal & Absen' 
                      : tab === 'PAYROLL'
                        ? 'Payroll Gaji'
                        : 'Pengaturan HR (Owner)'}
                </button>
              ))}
          </div>

          {activeSubTab === 'SCHEDULE' && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsClockOpen(true)}
                className="px-3.5 py-2 bg-espresso-900 text-cafe-50 text-xs font-bold rounded-xl btn-premium shadow-sm flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" /> Absen PIN
              </button>
              <button
                onClick={() => setIsScheduleOpen(true)}
                className="px-3.5 py-2 bg-earth-olive text-cafe-50 text-xs font-bold rounded-xl btn-premium shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Roster Dinas
              </button>
              <button
                onClick={handleOpenEmployeeModal}
                className="px-3.5 py-2 bg-cafe-200 text-cafe-850 hover:bg-cafe-300 transition-all text-xs font-bold rounded-xl border border-cafe-300 shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Karyawan Baru
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SUB TAB 1: CASH DRAWER SHIFT SESSIONS */}
      {activeSubTab === 'SHIFT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="space-y-6 lg:col-span-1">
            {/* Active Shift Session Badge */}
            <section className="bg-white rounded-3xl p-6 border border-cafe-200/50 shadow-premium">
              <h3 className="font-extrabold text-cafe-900 text-base mb-3 flex items-center gap-2">
                Status Drawer Kasir
              </h3>
              {activeShift.status === 'OPEN' ? (
                <div className="p-4 bg-green-50/50 border border-green-155/30 rounded-2xl text-xs space-y-2.5 font-semibold text-cafe-700 animate-scale-up">
                  <div className="flex items-center gap-1.5 text-green-650 font-extrabold text-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" /> Sesi Kas Terbuka (Aktif)
                  </div>
                  <div className="space-y-1 pt-1 border-t border-green-100/40 text-[10px]">
                    <div className="flex justify-between">
                      <span>Kasir Aktif:</span>
                      <span className="text-cafe-900 font-extrabold uppercase">{activeShift.cashier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Modal Buka:</span>
                      <span className="text-cafe-900 font-bold">Rp {activeShift.capital.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dibuka Pukul:</span>
                      <span>{activeShift.openedAt} WIB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tanggal:</span>
                      <span>{activeShift.date}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50/50 border border-red-155/30 rounded-2xl text-xs font-semibold text-red-650 flex flex-col items-center text-center gap-2 py-6 animate-scale-up">
                  <AlertCircle className="w-8 h-8 text-red-500 animate-bounce" />
                  <div>
                    <h4 className="font-extrabold text-sm">Kas Tutup / Belum Aktif</h4>
                    <p className="text-[10px] text-cafe-400 font-normal mt-1 leading-snug">Sesi kasir kosong. Harap buka shift baru terlebih dahulu untuk mencatat transaksi keuangan laci kasir.</p>
                  </div>
                </div>
              )}
            </section>

            {/* Shift Open Box */}
            {activeShift.status !== 'OPEN' && (
              <section className="bg-white rounded-3xl p-6 border border-cafe-200/50 shadow-premium animate-fade-in">
                <h3 className="font-extrabold text-cafe-900 text-base mb-4">Mulai Shift Baru</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider">Modal Awal Laci Kas (IDR)</label>
                    <input
                      type="number"
                      value={shiftCapital}
                      onChange={(e) => setShiftCapital(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-extrabold text-cafe-900"
                    />
                  </div>
                  <button
                    onClick={handleOpenShift}
                    className="w-full py-3 bg-earth-olive text-cafe-50 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md btn-premium"
                  >
                    <Clock className="w-4 h-4" /> Buka Shift Kasir
                  </button>
                </div>
              </section>
            )}

            {/* Shift Close Reconciliation Box */}
            {activeShift.status === 'OPEN' && (
              <section className="bg-white rounded-3xl p-6 border border-cafe-200/50 shadow-premium animate-fade-in">
                <h3 className="font-extrabold text-cafe-900 text-base mb-4">Reconcile & Tutup Shift</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-cafe-50 rounded-2xl border border-cafe-200/20 text-[10px] space-y-1.5 font-semibold text-cafe-700">
                    <span className="font-extrabold text-cafe-500 uppercase tracking-wider block mb-1">Ekspektasi Sistem (Expected):</span>
                    <div className="flex justify-between">
                      <span>Modal Awal:</span>
                      <span>Rp {activeShift.capital.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Penjualan Tunai:</span>
                      <span>Rp {expectedCashSales.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Penjualan QRIS:</span>
                      <span>Rp {expectedQrisSales.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Penjualan Debit:</span>
                      <span>Rp {expectedCardSales.toLocaleString('id-ID')}</span>
                    </div>
                    <hr className="border-cafe-200/60" />
                    <div className="flex justify-between font-extrabold text-cafe-900 text-sm">
                      <span>Total Kas & Laci:</span>
                      <span>Rp {( activeShift.capital + expectedCashSales + expectedQrisSales + expectedCardSales ).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider">Uang Fisik Kas Terhitung (IDR)</label>
                    <input
                      type="number"
                      value={actualCash}
                      onChange={(e) => setActualCash(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-extrabold text-cafe-900"
                    />
                    <span className="text-[9px] text-cafe-400 font-semibold block mt-0.5">Termasuk modal awal laci laci kasir</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider">Total Fisik QRIS Terhitung (IDR)</label>
                    <input
                      type="number"
                      value={actualQris}
                      onChange={(e) => setActualQris(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider">Total Resi Debit Fisik (IDR)</label>
                    <input
                      type="number"
                      value={actualCard}
                      onChange={(e) => setActualCard(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-bold"
                    />
                  </div>

                  <button
                    onClick={handleCloseShift}
                    className="w-full py-3.5 bg-red-950/20 hover:bg-red-900/30 text-red-700 border border-red-900/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <AlertCircle className="w-4 h-4 animate-pulse" /> Reconcile Kas & Tutup Shift
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* Shift Logs Tables (Right 2 Columns) */}
          <div className="lg:col-span-2">
            <section className="bg-white rounded-3xl p-6 border border-cafe-200/50 shadow-premium">
              <h3 className="font-extrabold text-cafe-900 text-base mb-4">Riwayat Penutupan Laci Kasir</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-cafe-100 text-cafe-400 uppercase font-extrabold tracking-wider">
                      <th className="pb-3">Tanggal</th>
                      <th className="pb-3">Kasir</th>
                      <th className="pb-3 text-right">Modal Awal</th>
                      <th className="pb-3 text-right">Ekspektasi Kas</th>
                      <th className="pb-3 text-right">Fisik Terhitung</th>
                      <th className="pb-3 text-right">Selisih Kas</th>
                      <th className="pb-3">Catatan Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cafe-50 font-semibold text-cafe-800">
                    {shiftLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-cafe-50/40 transition-all">
                        <td className="py-3.5 whitespace-nowrap">{log.date}</td>
                        <td className="py-3.5 text-cafe-900 font-extrabold uppercase">{log.cashier}</td>
                        <td className="py-3.5 text-right">Rp {log.capital.toLocaleString('id-ID')}</td>
                        <td className="py-3.5 text-right font-extrabold">Rp {log.expected.toLocaleString('id-ID')}</td>
                        <td className="py-3.5 text-right text-cafe-900 font-extrabold">Rp {log.actual.toLocaleString('id-ID')}</td>
                        <td className={`py-3.5 text-right font-bold ${log.discrepancy < 0 ? 'text-red-650' : log.discrepancy > 0 ? 'text-green-650' : 'text-cafe-500'}`}>
                          Rp {log.discrepancy > 0 ? `+${log.discrepancy.toLocaleString('id-ID')}` : log.discrepancy.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3.5 text-cafe-450 italic text-[10px] max-w-[150px] truncate">{log.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* SUB TAB 2: SCHEDULES & PIN-BASED CLOCK INS */}
      {activeSubTab === 'SCHEDULE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Scheduling roster lists */}
          <section className="bg-white rounded-3xl p-6 border border-cafe-200/50 shadow-premium lg:col-span-1 space-y-4">
            <h3 className="font-extrabold text-cafe-900 text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cafe-500" /> Jadwal Roster Dinas Staf
            </h3>
            <div className="space-y-3 overflow-y-auto max-h-[450px] pr-1">
              {schedules.map((s) => (
                <div key={s.id} className="p-4 bg-cafe-50/50 rounded-2xl border border-cafe-200/20 flex justify-between items-center text-xs font-semibold hover:scale-[1.01] transition-all">
                  <div>
                    <h4 className="font-extrabold text-cafe-900 text-sm">{s.name}</h4>
                    <p className="text-cafe-400 text-[10px] mt-0.5">{s.date}</p>
                  </div>
                  <span className="px-3 py-1.5 bg-earth-olive/10 text-earth-olive border border-earth-olive/20 rounded-xl text-[10px] font-extrabold uppercase">
                    {s.shift}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Quick PIN Attendance Active roster logs */}
          <section className="bg-white rounded-3xl p-6 border border-cafe-200/50 shadow-premium lg:col-span-2">
            <h3 className="font-extrabold text-cafe-900 text-base mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-earth-olive" /> Kehadiran Roster Aktif Hari Ini
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-cafe-100 text-cafe-400 uppercase font-extrabold tracking-wider">
                    <th className="pb-3">Karyawan</th>
                    <th className="pb-3">Jam Masuk</th>
                    <th className="pb-3">Jam Keluar</th>
                    <th className="pb-3 text-right">Jam Kerja Hari Ini</th>
                    <th className="pb-3 text-center">Lokasi Absen</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cafe-50 font-semibold text-cafe-850">
                  {attendances.map((att) => (
                    <tr key={att.id}>
                      <td className="py-3.5 text-cafe-950 font-bold">{att.employeeName}</td>
                      <td className="py-3.5 text-earth-olive font-extrabold">{att.clockIn}</td>
                      <td className="py-3.5 text-cafe-500">{att.clockOut}</td>
                      <td className="py-3.5 text-right font-extrabold text-cafe-900">{att.hours > 0 ? `${att.hours} Jam` : '-'}</td>
                      <td className="py-3.5 text-center font-bold">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold border inline-block ${
                          att.location && att.location.includes('Luar')
                            ? 'bg-red-50 text-red-650 border-red-150'
                            : 'bg-green-50 text-green-650 border-green-150'
                        }`}>
                          {att.location || 'Cafe Caocao (Simulasi)'}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] border font-extrabold ${
                          att.status === 'Terlambat' 
                            ? 'bg-amber-50 text-amber-600 border-amber-100' 
                            : att.status === 'Diluar Area (Tidak Valid)'
                              ? 'bg-red-100 text-red-600 border-red-200'
                              : 'bg-green-50 text-green-600 border-green-100'
                        }`}>
                          {att.status}
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

      {/* SUB TAB 3: AUTOMATED MONTHLY PAYROLL SLIPS GENERATION */}
      {activeSubTab === 'PAYROLL' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="space-y-6 lg:col-span-1">
            {/* Generate Slips inputs box */}
            <section className="bg-white rounded-3xl p-6 border border-cafe-200/50 shadow-premium">
              <h3 className="font-extrabold text-cafe-900 text-base mb-4 flex items-center gap-1.5">
                <DollarSign className="w-4.5 h-4.5 text-earth-olive" /> Proses Payroll Bulanan
              </h3>
              <div className="space-y-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider">Pilih Karyawan Roster</label>
                  <select
                    value={selectedEmp}
                    onChange={(e) => setSelectedEmp(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-bold text-cafe-900"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                    ))}
                  </select>
                </div>

                {/* Live Work Hours Constraints Display */}
                {(() => {
                  const emp = employees.find(e => e.id === selectedEmp);
                  if (!emp) return null;
                  return (
                    <div className="p-3 bg-cafe-50 border border-cafe-200/30 rounded-2xl text-[10px] space-y-1 font-bold text-cafe-700 animate-scale-up">
                      <div className="flex justify-between">
                        <span>Upah Per Jam:</span>
                        <span>Rp {emp.baseRate.toLocaleString('id-ID')} / Jam</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Roster Jam Kerja:</span>
                        <span className="text-cafe-900 font-extrabold">{emp.hoursWorked} Jam</span>
                      </div>
                      <div className="flex justify-between text-earth-olive pt-1 border-t border-cafe-200/50 text-[11px]">
                        <span>Estimasi Gaji Pokok:</span>
                        <span>Rp {(emp.hoursWorked * emp.baseRate).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider">Periode Bulan</label>
                  <input
                    type="text"
                    value={payrollInputs.monthYear}
                    onChange={(e) => setPayrollInputs({ ...payrollInputs, monthYear: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider">Insentif/Tunjangan</label>
                    <input
                      type="number"
                      value={payrollInputs.allowances}
                      onChange={(e) => setPayrollInputs({ ...payrollInputs, allowances: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider">Potongan Gaji</label>
                    <input
                      type="number"
                      value={payrollInputs.deductions}
                      onChange={(e) => setPayrollInputs({ ...payrollInputs, deductions: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGeneratePayroll}
                  className="w-full py-3.5 bg-espresso-900 text-cafe-100 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm btn-premium"
                >
                  <DollarSign className="w-4 h-4 animate-bounce" /> Hitung & Terbitkan Gaji
                </button>
              </div>
            </section>
          </div>

          {/* Payslip digital logs listings (Right 2 Columns) */}
          <div className="lg:col-span-2">
            <section className="bg-white rounded-3xl p-6 border border-cafe-200/50 shadow-premium h-full flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-extrabold text-cafe-900 text-base mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cafe-500" /> Digital Payslips Roster (Verified Gaji)
                </h3>
                
                {payrollSlips.length === 0 ? (
                  <div className="py-24 text-center text-cafe-300 font-semibold flex flex-col items-center justify-center">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 text-cafe-200" />
                    <p className="text-xs">Belum ada payslip digital bulan ini yang dihitung.</p>
                  </div>
                ) : (
                  <div className="space-y-4 overflow-y-auto max-h-[450px] pr-1">
                    {payrollSlips.map((slip) => (
                      <div key={slip.id} className="p-5 border border-dashed border-cafe-300 bg-cafe-50/30 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4 text-xs font-semibold animate-scale-up">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase tracking-wider font-extrabold text-cafe-400">{slip.monthYear} Period</span>
                          <h4 className="font-extrabold text-cafe-900 text-sm leading-snug">{slip.employeeName}</h4>
                          <p className="text-cafe-500 font-semibold">{slip.role} &bull; Total kerja {slip.hours} Jam</p>
                        </div>
                        <div className="text-right space-y-1">
                          <span className="text-[9px] uppercase font-bold text-cafe-400 block">Total Gaji Netto</span>
                          <span className="text-base font-extrabold text-earth-olive block">Rp {slip.netPay.toLocaleString('id-ID')}</span>
                          <button
                            onClick={() => window.print()}
                            className="px-3 py-1.5 bg-white text-cafe-700 border border-cafe-350 hover:bg-cafe-100 transition-all font-extrabold rounded-lg text-[10px] inline-flex items-center gap-1 mt-1 shadow-sm"
                          >
                            <Receipt className="w-3.5 h-3.5" /> Unduh Payslip
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-cafe-100 text-[10px] text-cafe-400 font-semibold text-center flex items-center gap-1.5 justify-center">
                <Sparkles className="w-3.5 h-3.5 text-earth-olive" /> Perhitungan terintegrasi jam kerja kehadiran digital
              </div>
            </section>
          </div>
        </div>
      )}

      {/* SUB TAB 4: OWNER HR & WAGE SETTINGS (POLICY) */}
      {activeSubTab === 'POLICY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left Column: Global HR Policy Editor */}
          <div className="space-y-6 lg:col-span-1">
            <section className="bg-white rounded-3xl p-6 border border-cafe-200/50 shadow-premium">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-earth-olive" />
                <h3 className="font-extrabold text-cafe-900 text-base">Kebijakan Gaji & Kehadiran</h3>
              </div>
              
              <form onSubmit={handleSaveHrPolicy} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider block">Toleransi Telat (Menit)</label>
                  <input
                    type="number"
                    value={hrPolicy.lateTolerance}
                    onChange={(e) => setHrPolicy({ ...hrPolicy, lateTolerance: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-bold text-cafe-900"
                  />
                  <span className="text-[9px] text-cafe-400 block font-medium">Batas toleransi clock-in dari jam standar (08:00 WIB) sebelum dianggap terlambat.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider block">Denda Terlambat (Denda Gaji Jam)</label>
                  <input
                    type="number"
                    value={hrPolicy.latePenaltyHours}
                    onChange={(e) => setHrPolicy({ ...hrPolicy, latePenaltyHours: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-bold text-cafe-900"
                  />
                  <span className="text-[9px] text-cafe-400 block font-medium">Nilai denda dalam jumlah jam kerja yang dipotong (contoh: 1 = dipotong 1 jam upah kerja per keterlambatan).</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider block">Tarif Lembur per Jam (Rp)</label>
                  <input
                    type="number"
                    value={hrPolicy.overtimeRate}
                    onChange={(e) => setHrPolicy({ ...hrPolicy, overtimeRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-bold text-cafe-900"
                  />
                  <span className="text-[9px] text-cafe-400 block font-medium">Tarif lembur yang dibayarkan per jam untuk akumulasi kerja bulanan di atas 140 jam.</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-earth-olive text-cafe-50 rounded-xl text-xs font-bold btn-premium shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <CheckCircle className="w-4 h-4" /> Simpan Kebijakan HR
                </button>
              </form>
            </section>

            {/* Info Simulator Card */}
            <section className="bg-cafe-50 rounded-3xl p-5 border border-cafe-200/50 text-xs font-medium text-cafe-700 space-y-3 animate-scale-up">
              <h4 className="font-extrabold text-cafe-900 flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-earth-olive">
                <AlertCircle className="w-4 h-4" /> Simulasi Perhitungan Denda & Lembur
              </h4>
              <p className="leading-relaxed text-[11px]">
                Sistem menghitung payroll bulanan secara otomatis berdasarkan log clock-in & clock-out kehadiran karyawan:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-cafe-600">
                <li>
                  <strong>Batas Absen Standard:</strong> 08:00 WIB. Jam masuk dinas melebihi <span className="font-bold text-cafe-900">08:{hrPolicy.lateTolerance.toString().padStart(2, '0')} WIB</span> akan terhitung sebagai <strong>Terlambat</strong>.
                </li>
                <li>
                  <strong>Pemotongan Gaji (Late Penalty):</strong> Setiap keterlambatan memotong gaji bersih sebesar <span className="font-bold text-cafe-900">{hrPolicy.latePenaltyHours} jam &times; Upah Per Jam</span> masing-masing karyawan.
                </li>
                <li>
                  <strong>Lembur (Overtime):</strong> Jam kerja melebihi batas standard (140 jam/bulan) dibayar sebesar <span className="font-bold text-cafe-900">Rp {hrPolicy.overtimeRate.toLocaleString('id-ID')} / jam</span>.
                </li>
              </ul>
            </section>
          </div>

          {/* Right Column (2 spans): Access merge, role PIN, and employee roster */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Integrasi Peran & PIN Akses Workspace */}
            <section className="bg-white rounded-3xl p-6 border border-cafe-200/50 shadow-premium">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cafe-100">
                <Sparkles className="w-5 h-5 text-earth-olive" />
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-cafe-900 text-base">Integrasi Peran & PIN Akses</h3>
                  <p className="text-[10px] text-cafe-500">Gabungkan hak akses workspace dan kelola PIN keamanan masing-masing peran aktif</p>
                </div>
              </div>

              {/* Grid for Toggles and PIN inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left: Beautiful Capsule Switches for Merging Roles */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-extrabold text-cafe-900 uppercase tracking-wider block mb-2 border-l-2 border-earth-olive pl-2 font-sans">
                    Penggabungan Peran Staf
                  </h4>
                  
                  {/* Toggle 1: Bar & Kasir */}
                  <div className="p-4 bg-cafe-50/50 rounded-2xl border border-cafe-200/30 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="font-extrabold text-cafe-900 text-xs block">Gabungkan Bar & Kasir</span>
                      <p className="text-[9px] text-cafe-400 font-semibold leading-relaxed">
                        Menyatukan layar KDS Bar ke dalam dashboard Kasir dan membebaskan daftar inventaris bagi Kasir.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const val = !isMerged;
                        setIsMerged(val);
                        localStorage.setItem('pos_merge_bar_cashier', JSON.stringify(val));
                        window.dispatchEvent(new Event('storage'));
                      }}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isMerged ? 'bg-earth-olive' : 'bg-cafe-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isMerged ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 2: Admin & Owner */}
                  {userRole === 'OWNER' && (
                    <div className="p-4 bg-cafe-50/50 rounded-2xl border border-cafe-200/30 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="font-extrabold text-cafe-900 text-xs block">Gabungkan Owner & Admin</span>
                        <p className="text-[9px] text-cafe-400 font-semibold leading-relaxed">
                          Mengizinkan Admin mengakses laporan Analytics keuangan, payroll gaji, dan kebijakan HR kafe.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const val = !mergeAdminOwner;
                          setMergeAdminOwner(val);
                          localStorage.setItem('pos_merge_admin_owner', JSON.stringify(val));
                          window.dispatchEvent(new Event('storage'));
                        }}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          mergeAdminOwner ? 'bg-earth-olive' : 'bg-cafe-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            mergeAdminOwner ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Role Access PIN Configurator */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-extrabold text-cafe-900 uppercase tracking-wider block mb-2 border-l-2 border-earth-olive pl-2 font-sans">
                    PIN Keamanan Peran Workspace
                  </h4>

                  <div className="space-y-2.5 p-4 bg-cafe-50/50 rounded-2xl border border-cafe-200/30">
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-cafe-450 uppercase">PIN Owner</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={rolePins.OWNER || ''}
                          onChange={(e) => handleUpdateRolePin('OWNER', e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl border border-cafe-200 focus:outline-none focus:border-earth-olive bg-white text-xs font-mono font-bold text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-cafe-450 uppercase">PIN Admin</label>
                        <input
                          type="text"
                          maxLength={4}
                          value={rolePins.ADMIN || ''}
                          onChange={(e) => handleUpdateRolePin('ADMIN', e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl border border-cafe-200 focus:outline-none focus:border-earth-olive bg-white text-xs font-mono font-bold text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-cafe-450 uppercase">PIN Kasir (Cashier)</label>
                        <input
                          type="text"
                          maxLength={4}
                          value={rolePins.CASHIER || ''}
                          onChange={(e) => handleUpdateRolePin('CASHIER', e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl border border-cafe-200 focus:outline-none focus:border-earth-olive bg-white text-xs font-mono font-bold text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-cafe-450 uppercase">PIN KDS Kitchen</label>
                        <input
                          type="text"
                          maxLength={4}
                          value={rolePins.KITCHEN || ''}
                          onChange={(e) => handleUpdateRolePin('KITCHEN', e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl border border-cafe-200 focus:outline-none focus:border-earth-olive bg-white text-xs font-mono font-bold text-center"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[9px] font-bold text-cafe-450 uppercase">PIN KDS Bar</label>
                        <input
                          type="text"
                          maxLength={4}
                          value={rolePins.BAR || ''}
                          onChange={(e) => handleUpdateRolePin('BAR', e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl border border-cafe-200 focus:outline-none focus:border-earth-olive bg-white text-xs font-mono font-bold text-center"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveRolePins}
                      className="w-full py-2 bg-earth-olive text-cafe-50 rounded-xl text-[10px] font-extrabold hover:bg-earth-olive/90 active:scale-95 transition-all shadow-sm block text-center"
                    >
                      Perbarui PIN Akses Peran
                    </button>
                  </div>
                </div>

              </div>
            </section>
            <section className="bg-white rounded-3xl p-6 border border-cafe-200/50 shadow-premium">
              <div className="flex justify-between items-center mb-4">
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-cafe-900 text-base">Daftar Karyawan & Gaji Pokok</h3>
                  <p className="text-[10px] text-cafe-500">Kelola upah per jam, kode PIN absen, akumulasi jam kerja bulanan staf</p>
                </div>
                <button
                  onClick={() => setIsEmployeeOpen(true)}
                  className="px-3.5 py-2 bg-espresso-900 text-cafe-50 text-xs font-bold rounded-xl btn-premium shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Karyawan Baru
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-cafe-100 text-cafe-400 uppercase font-extrabold tracking-wider">
                      <th className="pb-3">Karyawan</th>
                      <th className="pb-3">Jabatan</th>
                      <th className="pb-3 text-center">PIN Absen</th>
                      <th className="pb-3 text-right">Upah / Jam</th>
                      <th className="pb-3 text-right">Total Jam Kerja</th>
                      <th className="pb-3 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cafe-50 font-semibold text-cafe-850">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-cafe-50/20 transition-all">
                        <td className="py-3.5">
                          <span className="text-cafe-950 font-bold block">{emp.name}</span>
                          <span className="text-[9px] text-cafe-400 font-mono">ID: {emp.id}</span>
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] border font-extrabold ${
                            emp.role === 'CASHIER' 
                              ? 'bg-blue-50 text-blue-650 border-blue-100' 
                              : emp.role === 'BARISTA' 
                                ? 'bg-amber-50 text-amber-650 border-amber-100'
                                : emp.role === 'KITCHEN' 
                                  ? 'bg-purple-50 text-purple-650 border-purple-100'
                                  : 'bg-green-50 text-green-650 border-green-100'
                          }`}>
                            {emp.role}
                          </span>
                        </td>
                        <td className="py-3.5 text-center">
                          {userRole === 'OWNER' || mergeAdminOwner ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <input
                                type="text"
                                maxLength={4}
                                value={emp.pin}
                                onChange={(e) => handleUpdateEmployee(emp.id, { pin: e.target.value })}
                                className="w-12 px-1 py-0.5 text-center border border-cafe-200 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-earth-olive bg-cafe-50/50"
                              />
                              <button
                                onClick={() => handleRegeneratePin(emp.id)}
                                className="p-1 bg-cafe-100 hover:bg-cafe-200 text-cafe-650 rounded-lg transition-all"
                                title="Acak PIN Baru"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="font-mono text-cafe-400 font-bold">••••</span>
                          )}
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {userRole === 'OWNER' || mergeAdminOwner ? (
                              <>
                                <span className="text-cafe-450 text-[10px]">Rp</span>
                                <input
                                  type="number"
                                  value={emp.baseRate}
                                  onChange={(e) => handleUpdateEmployee(emp.id, { baseRate: parseFloat(e.target.value) || 0 })}
                                  className="w-16 px-1 py-0.5 text-right border border-cafe-200 rounded-lg text-xs font-bold focus:outline-none focus:border-earth-olive bg-cafe-50/50"
                                />
                              </>
                            ) : (
                              <span className="font-bold text-cafe-400 pr-2">*****</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-extrabold text-cafe-950">{emp.hoursWorked} Jam</span>
                            <button
                              onClick={() => handleResetHours(emp.id)}
                              className="text-[9px] text-cafe-400 hover:text-red-600 hover:underline"
                              title="Reset jam kerja bulan ini"
                            >
                              Reset
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 text-center">
                          <button
                            onClick={() => handleDeleteEmployee(emp.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                            title="Hapus Karyawan"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* POPUP MODAL 1: DAFTARKAN KARYAWAN BARU */}
      {isEmployeeOpen && (
        <div className="fixed inset-0 bg-cafe-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-premium relative border border-cafe-100 animate-scale-up">
            <div className="flex justify-between items-center pb-3 border-b border-cafe-100 mb-4">
              <h3 className="font-extrabold text-cafe-900 text-base">Daftarkan Karyawan Baru</h3>
              <button 
                onClick={() => setIsEmployeeOpen(false)}
                className="p-1.5 rounded-lg bg-cafe-50 text-cafe-400 hover:text-cafe-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterEmployee} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Siti Aisyah"
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider">Jabatan / Role</label>
                  <select
                    value={newEmp.role}
                    onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-bold"
                  >
                    <option value="CASHIER">Kasir</option>
                    <option value="BARISTA">Barista (Bar)</option>
                    <option value="KITCHEN">Koki (Kitchen)</option>
                    <option value="WAITER">Waiter</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider">Upah / Jam (Rp)</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 15000"
                    value={newEmp.baseRate}
                    onChange={(e) => setNewEmp({ ...newEmp, baseRate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider block">PIN Clock-In Absen (4 Digit)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    required
                    placeholder="PIN"
                    value={newEmp.pin}
                    onChange={(e) => setNewEmp({ ...newEmp, pin: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-mono text-center tracking-widest text-lg font-extrabold"
                  />
                  <button
                    type="button"
                    onClick={() => setNewEmp({ ...newEmp, pin: Math.floor(1000 + Math.random() * 9000).toString() })}
                    className="px-3 bg-cafe-100 hover:bg-cafe-200 text-cafe-850 text-[10px] font-bold rounded-xl border border-cafe-200 transition-all shrink-0"
                  >
                    Acak PIN
                  </button>
                </div>
                <span className="text-[8px] text-cafe-400 font-semibold block">Disarankan untuk menggunakan PIN acak yang dihasilkan sistem kasir demi keamanan.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-earth-olive text-cafe-50 rounded-xl text-xs font-bold btn-premium shadow-md flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Daftarkan Karyawan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: BUAT JADWAL ROSTER BARU */}
      {isScheduleOpen && (
        <div className="fixed inset-0 bg-cafe-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-premium relative border border-cafe-100 animate-scale-up">
            <div className="flex justify-between items-center pb-3 border-b border-cafe-100 mb-4">
              <h3 className="font-extrabold text-cafe-900 text-base">Buat Roster Dinas</h3>
              <button 
                onClick={() => setIsScheduleOpen(false)}
                className="p-1.5 rounded-lg bg-cafe-50 text-cafe-400 hover:text-cafe-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider">Pilih Karyawan</label>
                <select
                  value={newSched.employeeId}
                  onChange={(e) => setNewSched({ ...newSched, employeeId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-bold"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider">Tanggal Dinas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rabu, 27 Mei"
                  value={newSched.date}
                  onChange={(e) => setNewSched({ ...newSched, date: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-cafe-500 uppercase tracking-wider">Shift Dinas</label>
                <select
                  value={newSched.shift}
                  onChange={(e) => setNewSched({ ...newSched, shift: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs bg-cafe-50/50 font-semibold"
                >
                  <option value="Pagi (08:00 - 16:00)">Shift Pagi (08:00 - 16:00)</option>
                  <option value="Sore (16:00 - 00:00)">Shift Sore (16:00 - 00:00)</option>
                  <option value="Full Day (08:00 - 00:00)">Full Day (08:00 - 00:00)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-earth-olive text-cafe-50 rounded-xl text-xs font-bold btn-premium shadow-md flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Daftarkan Jadwal Roster
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL 3: ABSENSI PIN CLOCK-IN NUMPAD */}
      {isClockOpen && (
        <div className="fixed inset-0 bg-cafe-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-premium relative border border-cafe-100 animate-scale-up">
            <div className="flex justify-between items-center pb-3 border-b border-cafe-100 mb-4">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-cafe-900 text-base">Numpad Absensi Roster</h3>
                <p className="text-[9px] text-cafe-400 uppercase font-extrabold">Clock-In & Clock-Out Staf</p>
              </div>
              <button 
                onClick={() => {
                  setClockPin('');
                  setIsClockOpen(false);
                }}
                className="p-1.5 rounded-lg bg-cafe-50 text-cafe-400 hover:text-cafe-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Display code entered */}
              <div className="w-full py-4 rounded-2xl bg-cafe-100 border border-cafe-200 text-center text-2xl font-extrabold tracking-widest text-cafe-900 min-h-[64px] flex items-center justify-center">
                {clockPin.split('').map(() => '•').join(' ') || <span className="text-cafe-300 font-semibold text-xs tracking-normal">MASUKKAN PIN 4 DIGIT</span>}
              </div>

              {/* Geolocation simulated switch */}
              <div className="p-3 bg-cafe-50 border border-cafe-200/50 rounded-2xl space-y-1.5 text-[10px] font-semibold text-cafe-700">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold uppercase text-earth-olive tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-pulse" /> GPS Geofencing Absen:
                  </span>
                  <div className="flex bg-cafe-200 p-0.5 rounded-lg shrink-0 text-[9px] font-bold">
                    <button
                      type="button"
                      onClick={() => setGpsMode('CAFE')}
                      className={`px-2 py-0.5 rounded transition-all ${gpsMode === 'CAFE' ? 'bg-white text-cafe-900 shadow-sm' : 'text-cafe-400'}`}
                    >
                      Di Cafe
                    </button>
                    <button
                      type="button"
                      onClick={() => setGpsMode('AWAY')}
                      className={`px-2 py-0.5 rounded transition-all ${gpsMode === 'AWAY' ? 'bg-white text-cafe-900 shadow-sm' : 'text-cafe-400'}`}
                    >
                      Di Luar
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-[9px] text-cafe-400 font-mono pt-1 border-t border-cafe-200/40">
                  <span>Satelit GPS:</span>
                  <span className={gpsMode === 'CAFE' ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                    {gpsMode === 'CAFE' ? 'Lat -6.2088, Lng 106.8456 (Radius 5m ✓)' : 'Lat -6.2300, Lng 106.8120 (Radius 4.8km ✗)'}
                  </span>
                </div>
              </div>

              {/* Grid numeric pad layout */}
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      if (clockPin.length < 4) {
                        setClockPin(clockPin + num.toString());
                      }
                    }}
                    className="h-14 bg-cafe-50 hover:bg-cafe-100 text-cafe-900 border border-cafe-200/50 rounded-2xl text-lg font-extrabold active:scale-95 transition-all shadow-sm"
                  >
                    {num}
                  </button>
                ))}
                
                {/* Clear Button */}
                <button
                  onClick={() => setClockPin('')}
                  className="h-14 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/50 rounded-2xl text-sm font-extrabold active:scale-95 transition-all shadow-sm"
                >
                  C
                </button>
                
                {/* Zero Button */}
                <button
                  onClick={() => {
                    if (clockPin.length < 4) {
                      setClockPin(clockPin + '0');
                    }
                  }}
                  className="h-14 bg-cafe-50 hover:bg-cafe-100 text-cafe-900 border border-cafe-200/50 rounded-2xl text-lg font-extrabold active:scale-95 transition-all shadow-sm"
                >
                  0
                </button>
                
                {/* OK / Checkin Button */}
                <button
                  onClick={handlePinClock}
                  disabled={clockPin.length < 4}
                  className={`h-14 rounded-2xl text-xs font-extrabold active:scale-95 transition-all shadow-sm ${
                    clockPin.length < 4
                      ? 'bg-cafe-100 text-cafe-350 cursor-not-allowed border border-cafe-200/50'
                      : 'bg-earth-olive text-cafe-50 border border-earth-olive/20'
                  }`}
                >
                  OK
                </button>
              </div>

              {/* Instructions reminder */}
              <div className="text-[10px] text-cafe-400 font-semibold leading-relaxed p-3 bg-cafe-50 border border-cafe-100 rounded-2xl text-center">
                Masukkan PIN Roster Dinas Anda (e.g. Budi: <span className="font-bold text-cafe-800">1111</span>, Jono: <span className="font-bold text-cafe-800">2222</span>, Siti: <span className="font-bold text-cafe-800">3333</span>). Absen Masuk pertama kali, Absen Pulang kedua kalinya!
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
