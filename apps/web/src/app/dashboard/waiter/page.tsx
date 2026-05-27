'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Minus, ShoppingCart, Search, X, 
  ChevronRight, RefreshCw, Table as TableIcon,
  ChevronDown, UtensilsCrossed, Send, Edit
} from 'lucide-react';
import { api } from '@/lib/api-client';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  subCategory?: string;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
  notes?: string;
}

const MOCK_ITEMS: Product[] = [
  { 
    id: 'w1', 
    name: 'Iced Latte', 
    price: 35000, 
    category: 'Coffee', 
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ6djTQJI382XUMkalB2G4kxioHlFLPfN2LtB7A-yK4wox_YdcjjOSZiZ7cc7cIyWXYlza62ancbwqoZ4wUdPLQX-eYIs41yXfTed1Nfp3qnX1AGlwRaglvPrwGFlLoRpPCKqH0vqMubXmcSzjhL_f_823mja_kU7TIyFlOePVlu-Cav0KTZKgpeiX1tVo6FgQDW9YSJvzvmUsHBeEo3BcYUqQ-WNnmpkWfL89eSe_sqmwDGiHWrrruuD5gGEhq1b0q3m_7cguG1g'
  },
  { 
    id: 'w2', 
    name: 'Flat White', 
    price: 32000, 
    category: 'Coffee', 
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk0U7mM5LpZvtAABVUIFEN8VcEbbMV0UnqYOHJqvT9VHwGFoSpC_Q-JCD_y0U327dK6m1nEdAXwqlN4wPZ-eCBju1oZA5a1Hg3C0_qZQAVzPH-_fG2VuRQiDazderWWzmPDpSlpYTg0FO4SygzELIv1ix_uTIepYUM_WSu1cpU8d87lvjjUcMTOGrLM1V-RZmSM3k2lRDHXMH1Ap-eUFK_L-Xhfg6fJPinTp6m_CBsPUZIisEeZzGJq9Ytsr-U4v_PjGQvJowsvfk'
  },
  { 
    id: 'w3', 
    name: 'Double Espresso', 
    price: 28000, 
    category: 'Coffee', 
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwko6BxchMt_jL5ZYFgMahkWpVSzwHfaMZEBySsbUBDkrw7CH40ECKvTlRJVnUtLNyG0lLeAnI5sDQyHC9ZIyfjFCCPnn-vgVimpysknk07lfCkUe7PULmZTtrgEVktxZy3mzqsWikM84FcqHNuueJW8NE0bpenWW8zhuVGr9nzazrUpRLq5-nG2fEiw4H7Ayg-WZ_dgoX3ueyiPXU_gTFSMgeGu4zQUdJnYAaLHgt06evyufRQ6QSQHh1Ui_KxetpxVnVG1cut5s'
  },
  { 
    id: 'w4', 
    name: 'Croissant Almond', 
    price: 34000, 
    category: 'Bakery', 
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=300&auto=format&fit=crop'
  },
];

const TABLES = ['Table 01', 'Table 02', 'Table 03', 'Table 04', 'Table 05', 'Bar Counter'];

export default function WaiterOrderTaking() {
  const [products, setProducts] = useState<Product[]>(MOCK_ITEMS);
  const [selectedTable, setSelectedTable] = useState('Table 04');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await api.inventory.getProducts();
        if (data && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.log('Inventory API Server offline, using mock items.');
      }
    };
    loadProducts();
  }, []);

  const categories = ['All', 'Coffee', 'Non-Coffee', 'Food', 'Bakery'];

  const addToCart = (product: Product) => {
    const existing = cart.findIndex(c => c.id === product.id);
    if (existing > -1) {
      const newCart = [...cart];
      newCart[existing].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const data = await api.inventory.getProducts();
      if (data && data.length > 0) setProducts(data);
    } catch (e) {}
    setTimeout(() => setIsSyncing(false), 1500);
  };

  const handleSendToKitchen = async () => {
    if (cart.length === 0) return;
    setIsSyncing(true);
    
    const userStr = localStorage.getItem('pos_user');
    const activeUser = userStr ? JSON.parse(userStr) : { id: 'mock-waiter-uuid', name: 'Waiter Staff' };

    const orderPayload = {
      tableName: selectedTable,
      waiterId: activeUser.id,
      waiterName: activeUser.name,
      items: cart.map(item => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        notes: item.notes || '',
        category: item.category
      })),
      isPaid: false, // Waiter orders are usually not paid yet
    };

    try {
      await api.order.createOrder(orderPayload);
      alert('Pesanan berhasil dikirim ke dapur!');
      setCart([]);
      setIsSheetOpen(false);
    } catch (err) {
      alert('Gagal mengirim pesanan. Menggunakan mode offline.');
      // Logic for offline queueing could be added here
    } finally {
      setIsSyncing(false);
    }
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const filteredProducts = products.filter(p => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="font-manrope h-full flex flex-col -m-4 md:-m-6 bg-surface relative overflow-x-hidden">
      {/* Top App Bar */}
      <header className="bg-cafe-50/80 backdrop-blur-md flex justify-between items-center w-full px-4 h-14 z-50 fixed top-0 left-0 border-b border-cafe-200/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cafe-200 flex items-center justify-center overflow-hidden border border-cafe-300">
            <img 
              alt="Staff Profile" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAg6dRiAa5MUYx6BBPzmR5BdN0898iTpNhHCz3jFFCsb1voiG02ln3GGgBBwmBlkcygR0-8GABPQ28qRbkR2mCZxX99Ki4SxPR4pK_BAllWgzQp6OMy8jEmzf-oW1mGmvxVU6GPMRgwTNNqwjMmdyfUBES6co3H4n8h4pYiaD2dMTCezUMtI8IBeZockZ03aWwTAdIRHzexySMC3m78xNI6oS1QXU2KlcD_2bCJDB268b6MVLyQY978gGWkamvaHyICQDlJ8ZxqdJM" 
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-espresso-900">CAOCAO</span>
        </div>
        <button 
          onClick={handleSync}
          className={`active:scale-95 transition-transform duration-200 text-espresso-900 ${isSyncing ? 'animate-spin' : ''}`}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </header>

      <main className="pt-16 pb-32 px-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
        {/* Sticky Header: Table & Search */}
        <section className="sticky top-[10px] z-40 py-2 bg-surface/95 backdrop-blur-md -mx-4 px-4 flex gap-3 items-center">
          <div className="relative">
             <select 
               className="appearance-none flex items-center gap-2 bg-white pl-10 pr-8 h-12 rounded-2xl shadow-sm border border-cafe-200/50 active:scale-95 transition-all font-bold text-espresso-900 text-sm outline-none cursor-pointer"
               value={selectedTable}
               onChange={(e) => setSelectedTable(e.target.value)}
             >
                {TABLES.map(t => <option key={t} value={t}>{t}</option>)}
             </select>
             <TableIcon className="w-5 h-5 text-earth-olive absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
             <ChevronDown className="w-4 h-4 text-outline absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input 
              className="w-full h-12 pl-10 pr-4 bg-cafe-50 border-none rounded-2xl focus:ring-2 focus:ring-earth-olive/20 font-medium text-sm" 
              placeholder="Search menu..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {/* Category Tabs */}
        <nav className="flex overflow-x-auto no-scrollbar gap-2 py-1 -mx-4 px-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-6 py-2 rounded-full font-bold text-xs transition-all active:scale-95 ${
                activeCategory === cat 
                  ? 'bg-espresso-900 text-cafe-50 shadow-lg' 
                  : 'bg-white text-on-surface-variant border border-cafe-200/50 hover:bg-cafe-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* Product List */}
        <section className="grid grid-cols-2 gap-4">
          {filteredProducts.map((p) => (
            <div 
              key={p.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-cafe-200/50 active:scale-[0.98] transition-all group flex flex-col"
            >
              <div className="aspect-square relative overflow-hidden bg-cafe-100">
                <img 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  src={p.image} 
                  alt={p.name}
                />
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <h3 className="font-bold text-sm text-espresso-900 line-clamp-1">{p.name}</h3>
                <div className="flex justify-between items-end">
                  <span className="font-bold text-lg text-espresso-900 font-mono">
                    Rp {p.price.toLocaleString('id-ID')}
                  </span>
                  <button 
                    onClick={() => addToCart(p)}
                    className="w-10 h-10 rounded-2xl bg-earth-olive text-white flex items-center justify-center active:scale-90 transition-all shadow-md"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-40">
              <UtensilsCrossed className="w-12 h-12 mb-2" />
              <p className="text-sm font-bold">Menu tidak ditemukan</p>
            </div>
          )}
        </section>
      </main>

      {/* Persistent Bottom Cart Bar */}
      {cartCount > 0 && !isSheetOpen && (
        <div className="fixed bottom-20 left-0 w-full px-4 z-40 transition-transform duration-300">
          <div 
            onClick={() => setIsSheetOpen(true)}
            className="bg-espresso-900 text-white rounded-3xl p-4 flex items-center justify-between shadow-2xl active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center relative">
                <ShoppingCart className="w-5 h-5 text-white" />
                <span className="absolute -top-2 -right-2 bg-earth-olive text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-espresso-900 font-bold">
                  {cartCount}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-cafe-200 uppercase tracking-wider">Total Pesanan</p>
                <p className="text-lg font-bold">Rp {cartTotal.toLocaleString('id-ID')}</p>
              </div>
            </div>
            <button className="bg-earth-olive px-6 h-12 rounded-2xl font-bold text-xs flex items-center gap-2">
              Review Order
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Sheet Cart */}
      {isSheetOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[55] transition-opacity animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setIsSheetOpen(false)} />
          <div className="fixed bottom-0 left-0 w-full h-[80vh] bg-surface rounded-t-[40px] z-[60] shadow-[0_-20px_40px_rgba(0,0,0,0.1)] flex flex-col animate-slide-up">
            {/* Handle */}
            <div className="w-full flex justify-center pt-4 pb-2" onClick={() => setIsSheetOpen(false)}>
              <div className="w-12 h-1.5 bg-cafe-200 rounded-full"></div>
            </div>

            <div className="px-6 flex justify-between items-center pb-6 border-b border-cafe-200/30">
              <h2 className="text-2xl font-bold text-espresso-900">Current Order</h2>
              <button 
                className="w-10 h-10 rounded-full bg-cafe-50 flex items-center justify-center text-outline"
                onClick={() => setIsSheetOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-cafe-50 shrink-0">
                    <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-espresso-900 text-sm truncate">{item.name}</h4>
                        <button className="text-[10px] text-outline font-bold flex items-center gap-1 mt-1 hover:text-earth-olive transition-colors">
                          <Edit className="w-3 h-3" />
                          {item.notes || 'Tambah catatan...'}
                        </button>
                      </div>
                      <span className="font-bold text-sm text-espresso-900 font-mono">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-4 bg-white border border-cafe-200 rounded-xl px-3 py-1.5 shadow-sm">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="text-outline hover:text-espresso-900 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-sm min-w-[12px] text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="text-outline hover:text-espresso-900 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                  <ShoppingCart className="w-16 h-16 mb-4" />
                  <p className="font-bold">Keranjang kosong</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-cafe-50 rounded-t-[32px] space-y-4 pb-10">
              <div className="flex justify-between items-center text-espresso-900">
                <span className="text-sm font-bold text-on-surface-variant">Subtotal</span>
                <span className="font-bold text-2xl font-mono">Rp {cartTotal.toLocaleString('id-ID')}</span>
              </div>
              <button 
                disabled={cart.length === 0 || isSyncing}
                onClick={handleSendToKitchen}
                className="w-full h-14 bg-earth-olive text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                {isSyncing ? 'Sending...' : 'Send to Kitchen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar (Simulated placeholder for Dashboard Layout compatibility) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 h-[72px] bg-white/90 shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)] rounded-t-3xl backdrop-blur-md border-t border-cafe-100">
        <button className="flex flex-col items-center justify-center text-earth-olive bg-secondary-container/30 rounded-xl px-4 py-2 transition-all">
          <UtensilsCrossed className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Orders</span>
        </button>
        <button className="flex flex-col items-center justify-center text-outline px-4 py-2 opacity-60">
          <TableIcon className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Tables</span>
        </button>
        <button className="flex flex-col items-center justify-center text-outline px-4 py-2 opacity-60">
          <RefreshCw className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1">Sync</span>
        </button>
      </nav>
    </div>
  );
}
