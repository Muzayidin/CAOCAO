'use client';

import React, { useEffect, useState } from 'react';
import { 
  ChefHat, Check, CheckCircle, RefreshCw, 
  Utensils, Users
} from 'lucide-react';
import { api } from '@/lib/api-client';

interface KdsItem {
  id: string;
  productName: string;
  quantity: number;
  isCompleted: boolean;
  category?: string;
  notes?: string;
}

interface KdsTicket {
  id: string;
  tableName: string;
  waiterName: string;
  createdAt: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'READY';
  items: KdsItem[];
}

const MOCK_KITCHEN_TICKETS: KdsTicket[] = [
  {
    id: 'k-1',
    tableName: 'Meja 12',
    waiterName: 'Dimas P.',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 mins ago (Warning)
    status: 'QUEUED',
    items: [
      { id: 'ki-1', productName: 'Spaghetti Aglio Olio', quantity: 2, isCompleted: false, category: 'Pasta', notes: 'Extra Spicy, No Parsley' },
      { id: 'ki-2', productName: 'Truffle Fries', quantity: 1, isCompleted: false, category: 'Snack' },
    ],
  },
  {
    id: 'k-2',
    tableName: 'Meja 5',
    waiterName: 'Siti A.',
    createdAt: new Date(Date.now() - 1000 * 60 * 27).toISOString(), // 27 mins ago (Urgent)
    status: 'QUEUED',
    items: [
      { id: 'ki-3', productName: 'Wagyu Steak Medium', quantity: 3, isCompleted: false, category: 'Main', notes: 'Mushroom Sauce on the side' },
      { id: 'ki-4', productName: 'Caesar Salad', quantity: 1, isCompleted: false, category: 'Appetizer' },
    ],
  },
  {
    id: 'k-3',
    tableName: 'Meja 2',
    waiterName: 'Budi H.',
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(), // 4 mins ago (Normal)
    status: 'QUEUED',
    items: [
      { id: 'ki-5', productName: 'Nasi Goreng CAOCAO', quantity: 1, isCompleted: false, category: 'Signature' },
    ],
  },
];

export default function KitchenDisplay() {
  const [tickets, setTickets] = useState<KdsTicket[]>(MOCK_KITCHEN_TICKETS);
  const [now, setNow] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // KDS Confirmation States
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
      const data = await api.order.getKdsTickets('FOOD');
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

  const handleCompleteTicket = (ticketId: string) => {
    setConfirmTicketId(ticketId);
  };

  const executeCompleteTicket = async () => {
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
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-cafe-200/50 px-6 py-4 flex justify-between items-center shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-cafe-200 flex items-center justify-center overflow-hidden border border-cafe-300">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD13dEza8FDpZKMqDgMm7Xmem_f5hQHX-eYGLrZHFZ6nx7EqdpVBB9t1qGBy29tmJgxmpyDzraYOeeuxsb3Bg_KCe3haLbkaA9fdr2-Q--1rjnqISVLYu3Oo45Cf8_AVCrU61O5nGyoCqcbaEyZ15IZV9w5ma_Tyk8kqXIBZg_GhI__Zd40qQ0ze-C-eN_dJb0nPrb03ZW9FDEgogWSiYhSXYwy_wjmdJu8txnWtQBIh3pepwY2L5GHP7Ecqp-n4ttD42Jf0m2fJnI" 
              alt="Chef Profile" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-espresso-900 tracking-tight">KDS Kitchen</h1>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Antrean Dapur Utama</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-cafe-50 rounded-full border border-cafe-200/50">
            <CheckCircle className="w-4 h-4 text-earth-olive" />
            <span className="text-xs font-bold text-on-surface">8 Pesanan Selesai</span>
          </div>
          <button 
            onClick={loadKdsTickets}
            className={`p-2 hover:bg-cafe-100 rounded-xl transition-all ${isLoading ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-5 h-5 text-espresso-900" />
          </button>
        </div>
      </header>

      {/* Kanban Board Container */}
      <main className="flex-1 overflow-x-auto p-6 scroll-smooth custom-scrollbar">
        <div className="flex gap-6 h-full min-w-max pb-4">
          {tickets.map((ticket) => {
            const elapsedMs = now.getTime() - new Date(ticket.createdAt).getTime();
            const elapsedMin = Math.floor(elapsedMs / (1000 * 60));
            const elapsedSec = Math.floor((elapsedMs / 1000) % 60);
            
            const isWarning = elapsedMin >= 15;
            const isUrgent = elapsedMin >= 25;
            const isSlideOut = slideOutTicketId === ticket.id;

            return (
              <div 
                key={ticket.id}
                style={{
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isSlideOut ? 'translateY(-20px)' : 'none',
                  opacity: isSlideOut ? 0 : 1,
                }}
                className={`w-[340px] md:w-[400px] flex flex-col bg-white rounded-3xl shadow-sm border overflow-hidden shrink-0 ${
                  isUrgent ? 'border-error/20 animate-pulse-subtle' : isWarning ? 'border-amber-500/20' : 'border-cafe-200/30'
                }`}
              >
                {/* Ticket Header */}
                <div className={`p-5 border-b flex justify-between items-start ${
                  isUrgent ? 'bg-error-container/10 border-error-container' : 'bg-cafe-50/30 border-cafe-50'
                }`}>
                  <div>
                    <h2 className="text-xl font-bold text-espresso-900">{ticket.tableName}</h2>
                    <p className="text-xs font-medium text-on-surface-variant mt-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      Waiter: {ticket.waiterName}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-xl font-bold ${
                      isUrgent ? 'text-error' : isWarning ? 'text-amber-600' : 'text-espresso-900'
                    }`}>
                      {elapsedMin.toString().padStart(2, '0')}:{elapsedSec.toString().padStart(2, '0')}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${
                      isUrgent ? 'text-error' : 'text-outline'
                    }`}>
                      {isUrgent ? 'Terlambat' : isWarning ? 'Menunggu' : 'Baru'}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {ticket.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="group flex items-start gap-3 p-3 rounded-2xl hover:bg-cafe-50 transition-colors cursor-pointer"
                      onClick={() => toggleItemCompleted(ticket.id, item.id, item.isCompleted)}
                    >
                      <button className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all active:scale-90 shrink-0 ${
                        item.isCompleted ? 'bg-earth-olive/10 border-earth-olive' : 'border-cafe-200'
                      }`}>
                        {item.isCompleted && <Check className="w-4 h-4 text-earth-olive" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <span className={`text-sm font-bold leading-tight ${item.isCompleted ? 'line-through opacity-40' : 'text-on-surface'}`}>
                            {item.quantity}x {item.productName}
                          </span>
                          {item.category && (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-cafe-200/30 rounded text-on-surface-variant uppercase shrink-0">
                              {item.category}
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <div className={`mt-1.5 p-2 rounded-lg border-l-4 ${
                            isUrgent ? 'bg-error-container/20 border-error/30' : 'bg-cafe-50 border-espresso-900/10'
                          }`}>
                            <p className="text-[10px] font-bold text-on-surface-variant italic leading-relaxed">
                              Note: {item.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-white border-t border-cafe-50">
                  <button 
                    onClick={() => handleCompleteTicket(ticket.id)}
                    className="w-full h-12 bg-espresso-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Selesaikan Pesanan
                  </button>
                </div>
              </div>
            );
          })}

          {tickets.length === 0 && (
            <div className="w-full flex flex-col items-center justify-center py-24 px-12 opacity-50">
              <div className="w-24 h-24 bg-cafe-100 rounded-full flex items-center justify-center mb-6 border border-cafe-200">
                <ChefHat className="w-12 h-12 text-earth-olive" />
              </div>
              <h3 className="text-xl font-bold text-espresso-900">Antrean Kosong</h3>
              <p className="text-sm font-medium text-on-surface-variant text-center max-w-xs mt-2">
                Dapur siap melayani! Pesanan baru akan muncul di sini secara real-time.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      {confirmTicketId && (
        <div className="fixed inset-0 bg-espresso-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-premium border border-cafe-100 animate-scale-up">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-espresso-900">Selesaikan Pesanan?</h3>
              <p className="text-xs text-on-surface-variant font-medium mt-1 leading-relaxed">
                Hidangan sudah siap disajikan? Tindakan ini akan memberi tahu kasir dan waiter.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={executeCompleteTicket}
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
