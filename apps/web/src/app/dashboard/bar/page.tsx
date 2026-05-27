'use client';

import React, { useEffect, useState } from 'react';
import { 
  Coffee, Check, CheckCircle, RefreshCw, 
  Users, Bell, AlertTriangle
} from 'lucide-react';
import { api } from '@/lib/api-client';

interface KdsItem {
  id: string;
  productName: string;
  quantity: number;
  isCompleted: boolean;
  notes?: string;
  category?: string;
}

interface KdsTicket {
  id: string;
  tableName: string;
  waiterName: string;
  createdAt: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'READY';
  items: KdsItem[];
}

const MOCK_BAR_TICKETS: KdsTicket[] = [
  {
    id: 'b-1',
    tableName: 'Bar Counter 1',
    waiterName: 'Budi',
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(), // 3 mins ago
    status: 'QUEUED',
    items: [
      { id: 'bi-1', productName: 'V60 Gayo High', quantity: 1, isCompleted: false, notes: 'Warm, Low Acid', category: 'Coffee' },
      { id: 'bi-2', productName: 'Iced Latte', quantity: 1, isCompleted: false, notes: 'Oat milk, No Sugar', category: 'Coffee' },
    ],
  },
  {
    id: 'b-2',
    tableName: 'Sofa Area A2',
    waiterName: 'Siti',
    createdAt: new Date(Date.now() - 1000 * 60 * 11).toISOString(), // 11 mins ago (Warning)
    status: 'QUEUED',
    items: [
      { id: 'bi-3', productName: 'Manual Brew Kalita', quantity: 2, isCompleted: false, notes: 'Java Preanger, Hot', category: 'Coffee' },
    ],
  },
  {
    id: 'b-3',
    tableName: 'VIP Room',
    waiterName: 'Andre',
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 mins ago (In Progress)
    status: 'IN_PROGRESS',
    items: [
      { id: 'bi-4', productName: 'Espresso Double', quantity: 4, isCompleted: false, notes: 'House Blend', category: 'Coffee' },
    ],
  },
];

export default function BarDisplay() {
  const [tickets, setTickets] = useState<KdsTicket[]>(MOCK_BAR_TICKETS);
  const [now, setNow] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // KDS Confirmation states
  const [confirmTicketId, setConfirmTicketId] = useState<string | null>(null);
  
  // Animation states for sliding out cards
  const [slideOutTicketId, setSlideOutTicketId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    loadKdsTickets();
    return () => clearInterval(timer);
  }, []);

  const loadKdsTickets = async () => {
    setIsLoading(true);
    try {
      const data = await api.order.getKdsTickets('DRINK');
      if (data && data.length > 0) {
        setTickets(data);
      }
    } catch {
      console.log('Using offline mock tickets.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItemCompleted = async (ticketId: string, itemId: string, current: boolean) => {
    // Optimistic update
    setTickets(tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          items: t.items.map((i) => i.id === itemId ? { ...i, isCompleted: !current } : i),
        };
      }
      return t;
    }));

    try {
      await api.order.updateKdsItem(itemId, !current);
    } catch {
      console.log('Item status updated offline.');
    }
  };

  const startProgress = async (ticketId: string) => {
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: 'IN_PROGRESS' } : t));
    try {
      await api.order.updateKdsTicket(ticketId, 'IN_PROGRESS');
    } catch {
      console.log('Ticket status updated offline.');
    }
  };

  const triggerCompleteConfirmation = (ticketId: string) => {
    setConfirmTicketId(ticketId);
  };

  const handleExecuteCompleteTicket = async () => {
    if (!confirmTicketId) return;

    const ticketId = confirmTicketId;
    setConfirmTicketId(null);
    setSlideOutTicketId(ticketId);

    setTimeout(async () => {
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      setSlideOutTicketId(null);

      try {
        await api.order.updateKdsTicket(ticketId, 'READY');
      } catch {
        console.log('Ticket completed offline.');
      }
    }, 300);
  };

  return (
    <div className="font-manrope h-full flex flex-col -m-4 md:-m-6 bg-background">
      {/* Header Bar */}
      <header className="bg-espresso-900 shadow-sm px-6 py-4 flex justify-between items-center shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Coffee className="text-inverse-primary w-8 h-8" />
          <h1 className="text-xl font-bold text-inverse-primary tracking-tight">KDS Bar - Antrean Minuman</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-white text-[10px] font-bold uppercase tracking-widest">Status: Online</span>
            <span className="text-on-primary-container text-[10px] font-medium">Shift Pagi - Barista A</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={loadKdsTickets}
              className={`text-white p-2 hover:bg-white/10 rounded-full transition-colors ${isLoading ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button className="relative text-white p-2 hover:bg-white/10 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-cafe-200 flex items-center justify-center overflow-hidden border border-white/20">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2EnGwNqwfbXVAgbT7XYjlHlL2VQgbKBlF9BBef6EXq9XfpKA7ZlPDSTD9lNPpEuT6WJnCLbvks7w6IYMCxvjjyk8apV3OhJfmM0OpGekgKNbSXwfhYVoYeOhBYSagrRnQZkKoRjrn-uqSRzQ3UdMH2Bm3euS-xDPbmSn4TfH1_W4qeLsguaJf8bsXpmSB4pTrhJbN3bmwXOHjQu801pF_weD0vHo7GX23eKRvd4FRCQ4G4iKxCbCWzq1jLxxe4kmTGm64NTLvgaM" 
                alt="Barista Profile" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-hidden flex flex-col gap-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-cafe-200/50">
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Antrean</p>
            <h3 className="text-2xl font-bold text-espresso-900">{tickets.length}</h3>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-cafe-200/50">
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Sedang Dibuat</p>
            <h3 className="text-2xl font-bold text-espresso-900">{tickets.filter(t => t.status === 'IN_PROGRESS').length}</h3>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-cafe-200/50">
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Rata-rata Servis</p>
            <h3 className="text-2xl font-bold text-earth-olive">4.2m</h3>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-cafe-200/50">
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">Target 10m</p>
            <h3 className="text-2xl font-bold text-error">92%</h3>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 flex gap-8 overflow-x-auto pb-4 scroll-smooth custom-scrollbar">
          {/* Column: Pesanan Baru */}
          <section className="min-w-[340px] max-w-[400px] flex flex-col gap-4">
            <div className="flex items-center justify-between px-2 shrink-0">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
                Pesanan Baru
              </h2>
              <span className="bg-cafe-200 text-espresso-900 px-3 py-1 rounded-full text-xs font-bold">
                {tickets.filter(t => t.status === 'QUEUED').length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {tickets.filter(t => t.status === 'QUEUED').map(ticket => (
                <KdsTicketCard 
                  key={ticket.id} 
                  ticket={ticket} 
                  now={now} 
                  onAction={() => startProgress(ticket.id)}
                  actionLabel="Mulai Buat"
                  isSlideOut={slideOutTicketId === ticket.id}
                />
              ))}
            </div>
          </section>

          {/* Column: Sedang Dibuat */}
          <section className="min-w-[340px] max-w-[400px] flex flex-col gap-4">
            <div className="flex items-center justify-between px-2 shrink-0">
              <h2 className="font-bold text-lg flex items-center gap-2 text-earth-olive">
                <span className="w-2.5 h-2.5 rounded-full bg-earth-olive"></span>
                Sedang Dibuat
              </h2>
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold">
                {tickets.filter(t => t.status === 'IN_PROGRESS').length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {tickets.filter(t => t.status === 'IN_PROGRESS').map(ticket => (
                <KdsTicketCard 
                  key={ticket.id} 
                  ticket={ticket} 
                  now={now} 
                  onAction={() => triggerCompleteConfirmation(ticket.id)}
                  actionLabel="Selesai"
                  isSlideOut={slideOutTicketId === ticket.id}
                  showCheckboxes
                  onToggleItem={(itemId, current) => toggleItemCompleted(ticket.id, itemId, current)}
                />
              ))}
            </div>
          </section>

          {/* Column: Empty/History Example */}
          <section className="min-w-[340px] max-w-[400px] flex flex-col gap-4">
             <div className="flex items-center justify-between px-2 shrink-0">
              <h2 className="font-bold text-lg flex items-center gap-2 text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-outline"></span>
                Siap Diambil
              </h2>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center bg-cafe-50/50 rounded-3xl border-2 border-dashed border-cafe-200 p-8 text-center opacity-60">
              <div className="w-20 h-20 bg-cafe-200/50 rounded-full flex items-center justify-center mb-4">
                <Coffee className="w-10 h-10 text-on-surface-variant" />
              </div>
              <h3 className="font-bold text-espresso-900 mb-1">Belum Ada Minuman Siap</h3>
              <p className="text-on-surface-variant text-xs font-medium">Selesaikan pesanan di kolom proses untuk memindahkan ke sini.</p>
            </div>
          </section>
        </div>
      </main>

      {/* Confirmation Modal */}
      {confirmTicketId && (
        <div className="fixed inset-0 bg-espresso-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-premium border border-cafe-100 animate-scale-up">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-espresso-900">Selesaikan Minuman?</h3>
              <p className="text-xs text-on-surface-variant font-medium mt-1 leading-relaxed">
                Apakah racikan minuman ini sudah siap disajikan ke pelanggan?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleExecuteCompleteTicket}
                className="py-3 bg-earth-olive text-white rounded-xl text-xs font-bold active:scale-95 transition-all"
              >
                Ya, Selesai
              </button>
              <button 
                onClick={() => setConfirmTicketId(null)}
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

function KdsTicketCard({ 
  ticket, 
  now, 
  onAction, 
  actionLabel, 
  isSlideOut,
  showCheckboxes = false,
  onToggleItem
}: { 
  ticket: KdsTicket; 
  now: Date; 
  onAction: () => void; 
  actionLabel: string;
  isSlideOut: boolean;
  showCheckboxes?: boolean;
  onToggleItem?: (itemId: string, current: boolean) => void;
}) {
  const elapsedMs = now.getTime() - new Date(ticket.createdAt).getTime();
  const elapsedMin = Math.floor(elapsedMs / (1000 * 60));
  
  const isWarning = elapsedMin >= 10;
  const isUrgent = elapsedMin >= 20;

  return (
    <div 
      style={{
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isSlideOut ? 'translateY(-20px)' : 'none',
        opacity: isSlideOut ? 0 : 1,
      }}
      className={`bg-white rounded-3xl p-5 shadow-sm border-2 transition-all hover:shadow-md group flex flex-col ${
        isUrgent ? 'border-error animate-pulse-subtle' : isWarning ? 'border-amber-500' : 'border-transparent'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase bg-cafe-50 px-2 py-0.5 rounded">#{(ticket.id.slice(0,4))}</span>
          <h4 className="text-md font-bold text-espresso-900 mt-1">{ticket.tableName}</h4>
          <p className="text-[10px] text-on-surface-variant font-bold flex items-center gap-1">
            <Users className="w-3 h-3" /> Waiter: {ticket.waiterName}
          </p>
        </div>
        <div className="text-right">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
            isUrgent ? 'bg-error-container text-error' : 'bg-cafe-200 text-espresso-900'
          }`}>
            {elapsedMin}m ago
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6 flex-1">
        {ticket.items.map((item) => (
          <div 
            key={item.id} 
            className={`flex items-start gap-3 p-2 rounded-xl transition-colors ${showCheckboxes ? 'hover:bg-cafe-50 cursor-pointer' : ''}`}
            onClick={() => showCheckboxes && onToggleItem?.(item.id, item.isCompleted)}
          >
            {showCheckboxes && (
              <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                item.isCompleted ? 'bg-earth-olive/10 border-earth-olive' : 'border-cafe-200'
              }`}>
                {item.isCompleted && <Check className="w-3 h-3 text-earth-olive" />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex gap-2">
                <span className={`font-bold text-espresso-900 ${item.isCompleted ? 'opacity-30 line-through' : ''}`}>{item.quantity}x</span>
                <div>
                  <p className={`text-xs font-bold text-espresso-900 ${item.isCompleted ? 'opacity-30 line-through' : ''}`}>{item.productName}</p>
                  {item.notes && (
                    <p className="text-[10px] text-on-secondary-container bg-secondary-container/30 px-2 rounded-md inline-block font-medium mt-1">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={onAction}
        className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform ${
          actionLabel === 'Selesai' ? 'bg-earth-olive text-white' : 'bg-espresso-900 text-white'
        }`}
      >
        {actionLabel === 'Selesai' && <CheckCircle className="w-4 h-4" />}
        {actionLabel}
      </button>
    </div>
  );
}
