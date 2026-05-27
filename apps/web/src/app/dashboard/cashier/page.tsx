'use client';

import React, { useEffect, useState } from 'react';
import { 
  Plus, Minus, Receipt, CreditCard, 
  Search, Coffee, ShoppingCart, X, 
  Filter, ArrowRight, Wallet, QrCode
} from 'lucide-react';
import localforage from 'localforage';
import { api } from '@/lib/api-client';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  isBOM?: boolean;
  recipe?: string;
  image?: string;
}

interface Table {
  id: string;
  name: string;
  status: string;
  capacity?: string;
}

interface CartItem extends Product {
  quantity: number;
  notes: string;
}

interface Discount {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'NOMINAL';
  value: number;
}

interface ReceiptData {
  tableName?: string;
  waiterName?: string;
  items?: {
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
  totalBefore?: number;
  discountAmount?: number;
  taxAmount?: number;
  serviceAmount?: number;
  totalAfter?: number;
  paymentMethod?: string;
  isOfflineSaved?: boolean;
}

const INITIAL_PRODUCTS: Product[] = [
  // BOM Menus (classified with isBOM: true)
  { id: 'p1', name: 'Dirty Matcha Latte', price: 38000, category: 'DRINK', isBOM: true, recipe: '20g Beans, 150ml Milk', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL48ompUxJGv8yjaW_OqOVGJdjm-D2FNsUUEPZxaMXS_WFTLAr3pAILPxkIXvOlpFu3a5syjnEX5YjO4899TucInFT3KumfSNbsWR_cXZYvx_mKFqJ8UsexVIYU0mfOyn67jWb_zRm1TNqb_X5Sr-iJyTF8B8aNRqfWk-CK_EVSlIT6O-sDL38S35lifIYkEJKC07w6b5eQxmZ7jIgn_z0qPu-rY7iF8sSOv53o2rRqnthEEIfjHQ-t3HZ2zqHz-fvctgaNfag_-I' },
  { id: 'p2', name: 'Butter Croissant', price: 22000, category: 'FOOD', isBOM: true, recipe: '80g Butter', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFRJQrgSlD-nlZ9nA2Lj_zB3LmDJhRs8AOo82YZ1XcOjQVtdMKwZ5XZ5o5UH082ciWHn3naxqW-jk3-VkQ7oj_lpOPyCiT__yn64FV-espQpSSUOavNMEdL-CinPB1wlncn7gd6RHSVDl4TWCbthSlKEilxmD14cORyfMZHicKExthhWYcOxCzQnQk6-A764Pt30JBeFFMubQ2rHJWF9DHW2BgJazOMnMwdgP9hQSAR0F2xIaY5ADn_ihTRdcmx3Ug6IJ7hlPyiK8' },
  { id: 'p3', name: 'Avocado Poached Egg', price: 55000, category: 'FOOD', isBOM: false, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDR3v4QZH5nWVhFjTQh6FBWMNvelMBT-bkwdVvWYB6f2SgdSOhxj9e3aI5HEpggxvLQRA4EuCwmSwcxDXAmYYV8H3NJ2O20wWNdfrq1oPLolZSNe5_ycgpCL2zHHMzJhXB-huNmcTy0GIr1pCaJqDeyF40aIG1eOy3RXWno0cPz-oUZVYGJfDuqk8OsKsJkPDpuYF8f-OGUmz15DQsoO-8A6VgSKHTZCgFlKLSVXaq1_PD6XAUoHcat6vW4coRbevvzM0N3ddHJu9o' },
  { id: 'p4', name: 'Cold Brew Black', price: 32000, category: 'DRINK', isBOM: true, recipe: 'Coffee beans', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxQeeSrWzvT8-sIhOCHGmZ7yD7AbjQS_suGZAZj1EUKQglV5MTwVqW2A-t0bYLLP-2kIvYKmQSmeY3_dpoKLBdWdqOBc370GP8vjrJJm7uxqD3rPbTI3gytgiP0W5k21v4WxCH1Xp4lAXoFhdAZ8qx1sP1AYOug3n9MSHs-0m1MVmUNuPYjET1o_YLdgyBbyCVaDUr1njaIWNvK3McmN_0PXDECNijKe6t_TqrtXo7VVvbxmNEdybOzZXNbx8iQtkrNHBRejlL_Bs' },
  { id: 'p5', name: 'Air Mineral Pristine', price: 10000, category: 'DRINK', isBOM: false },
  { id: 'p6', name: 'Lotus Cheese Cake Slice', price: 35000, category: 'FOOD', isBOM: false },
  { id: 'p7', name: 'Spaghetti Bolognese (BOM)', price: 42000, category: 'FOOD', isBOM: true, recipe: 'Pasta, Beef Sauce' },
  { id: 'p8', name: 'Vanilla Syrup Modifier', price: 5000, category: 'ADD_ON', isBOM: false },
];

const INITIAL_TABLES: Table[] = [
  { id: 't1', name: 'Meja 01', status: 'AVAILABLE', capacity: '4 Kursi' },
  { id: 't2', name: 'Meja 02', status: 'OCCUPIED', capacity: 'Occupied' },
  { id: 't3', name: 'Meja 03', status: 'AVAILABLE', capacity: '2 Kursi' },
  { id: 't4', name: 'Meja 04', status: 'BILL_PRINTED', capacity: 'Bill Printed' },
  { id: 't5', name: 'Meja 05', status: 'AVAILABLE', capacity: '6 Kursi' },
  { id: 't6', name: 'Meja 06', status: 'AVAILABLE', capacity: '2 Kursi' },
];

export default function CashierPOS() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<Table>(INITIAL_TABLES[0]);

  // POS State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'NOMINAL' | null>(null);
  const [discountVal, setDiscountVal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'DEBIT'>('CASH');

  // Modals status
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [lastReceiptData, setLastReceiptData] = useState<ReceiptData | null>(null);
  const [isConfirmingCheckout, setIsConfirmingCheckout] = useState(false);

  // Syncing state
  const [isOffline, setIsOffline] = useState(false);
  const [activeDiscountsList, setActiveDiscountsList] = useState<Discount[]>([]);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const updateConn = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateConn);
    window.addEventListener('offline', updateConn);

    loadCachedData();

    const savedDiscounts = localStorage.getItem('pos_discounts');
    if (savedDiscounts) {
      setActiveDiscountsList(JSON.parse(savedDiscounts));
    } else {
      const initialDiscounts: Discount[] = [
        { id: 'd1', code: 'SENJA10', type: 'PERCENTAGE', value: 10 },
        { id: 'd2', code: 'PROMOCOFFEE', type: 'NOMINAL', value: 5000 },
      ];
      setActiveDiscountsList(initialDiscounts);
      localStorage.setItem('pos_discounts', JSON.stringify(initialDiscounts));
    }

    return () => {
      window.removeEventListener('online', updateConn);
      window.removeEventListener('offline', updateConn);
    };
  }, []);

  const loadCachedData = async () => {
    try {
      const data = await api.inventory.getProducts();
      if (data && data.length > 0) {
        setProducts(data);
        await localforage.setItem('cached_products', data);
      }
      
      const tableData = await api.order.getTables();
      if (tableData && tableData.length > 0) {
        setTables(tableData);
        await localforage.setItem('cached_tables', tableData);
      }
    } catch {
      console.log('Using offline cached DB models.');
    }
  };

  const addToCart = (product: Product) => {
    const existingIndex = cart.findIndex((item) => item.id === product.id);
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { ...product, quantity: 1, notes: '' }]);
    }
  };

  const updateQuantity = (productId: string, val: number) => {
    const newCart = cart.map((item) => {
      if (item.id === productId) {
        const q = Math.max(0, item.quantity + val);
        if (q === 0) return null;
        return { ...item, quantity: q };
      }
      return item;
    }).filter((item): item is CartItem => item !== null);
    setCart(newCart);
  };

  const handleNotesChange = (productId: string, notes: string) => {
    setCart(cart.map((item) => (item.id === productId ? { ...item, notes } : item)));
  };

  // Cost calculations
  const totalBefore = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  let discountAmount = 0;
  if (discountType === 'PERCENTAGE') {
    discountAmount = totalBefore * (discountVal / 100);
  } else if (discountType === 'NOMINAL') {
    discountAmount = discountVal;
  }

  const subtotalNet = Math.max(0, totalBefore - discountAmount);
  const taxAmount = subtotalNet * 0.11; // 11% PPN
  const serviceAmount = subtotalNet * 0.05; // 5% Service Charge
  const totalAfter = subtotalNet + taxAmount + serviceAmount;

  const handleCheckout = async () => {
    if (!cart.length) return;

    const tenantId = localStorage.getItem('pos_tenant_id') || 'mock-tenant-uuid';
    const userStr = localStorage.getItem('pos_user');
    const activeUser = userStr ? JSON.parse(userStr) : { id: 'mock-uuid', name: 'Cashier Staff' };

    const orderPayload = {
      tableId: selectedTable.id,
      tableName: selectedTable.name,
      waiterId: activeUser.id,
      waiterName: activeUser.name,
      items: cart.map((item) => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        notes: item.notes,
        category: item.category,
      })),
      discountType,
      discountVal,
      paymentMethod,
      isPaid: true,
      createdAt: new Date().toISOString(),
    };

    if (isOffline) {
      try {
        const queue: any[] = (await localforage.getItem('offline_orders')) || [];
        queue.push(orderPayload);
        await localforage.setItem('offline_orders', queue);
        
        // Log order for close-shift expected payments calculations
        const completedRecord = {
          id: 'ord-' + Math.random().toString(36).slice(2, 6),
          tableName: selectedTable.name,
          totalAfter: totalAfter,
          paymentMethod: paymentMethod,
          createdAt: new Date().toISOString(),
        };
        try {
          const stored = localStorage.getItem('pos_completed_orders');
          const list = stored ? JSON.parse(stored) : [];
          list.push(completedRecord);
          localStorage.setItem('pos_completed_orders', JSON.stringify(list));
        } catch { /* ignore log error */ }

        setLastReceiptData({
          ...orderPayload,
          totalBefore,
          discountAmount,
          taxAmount,
          serviceAmount,
          totalAfter,
          isOfflineSaved: true,
        });
        setIsCheckoutSuccess(true);
        setIsCartOpen(false);
        setCart([]);
      } catch {
        alert('Gagal memproses pembayaran offline');
      }
    } else {
      try {
        const data = await api.order.createOrder(orderPayload);
        
        // Log order for close-shift expected payments calculations
        const completedRecord = {
          id: 'ord-' + Math.random().toString(36).slice(2, 6),
          tableName: selectedTable.name,
          totalAfter: totalAfter,
          paymentMethod: paymentMethod,
          createdAt: new Date().toISOString(),
        };
        try {
          const stored = localStorage.getItem('pos_completed_orders');
          const list = stored ? JSON.parse(stored) : [];
          list.push(completedRecord);
          localStorage.setItem('pos_completed_orders', JSON.stringify(list));
        } catch { /* ignore log error */ }

        setLastReceiptData({
          ...data,
          tableName: selectedTable.name,
          discountAmount,
          isOfflineSaved: false,
        });
        setIsCheckoutSuccess(true);
        setIsCartOpen(false);
        setCart([]);
      } catch {
        const queue: any[] = (await localforage.getItem('offline_orders')) || [];
        queue.push(orderPayload);
        await localforage.setItem('offline_orders', queue);
        
        // Log order for close-shift expected payments calculations
        const completedRecord = {
          id: 'ord-' + Math.random().toString(36).slice(2, 6),
          tableName: selectedTable.name,
          totalAfter: totalAfter,
          paymentMethod: paymentMethod,
          createdAt: new Date().toISOString(),
        };
        try {
          const stored = localStorage.getItem('pos_completed_orders');
          const list = stored ? JSON.parse(stored) : [];
          list.push(completedRecord);
          localStorage.setItem('pos_completed_orders', JSON.stringify(list));
        } catch { /* ignore log error */ }

        setLastReceiptData({
          ...orderPayload,
          totalBefore,
          discountAmount,
          taxAmount,
          serviceAmount,
          totalAfter,
          isOfflineSaved: true,
        });
        setIsCheckoutSuccess(true);
        setIsCartOpen(false);
        setCart([]);
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === 'ALL' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="font-manrope h-full flex flex-col -m-4 md:-m-6">
      <main className="flex-1 flex overflow-hidden">
        {/* Left Content: Tables & Menu */}
        <section className="flex-1 flex flex-col p-6 overflow-y-auto space-y-8 custom-scrollbar">
          {/* Table Map Section */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-xl font-bold text-espresso-900">Pilih Meja & Pesanan</h2>
                <p className="text-sm text-on-surface-variant">Klik meja untuk memulai pesanan baru</p>
              </div>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-cafe-200"></span> Tersedia</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-espresso-900"></span> Terisi</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-earth-olive"></span> Billing</div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {tables.map((tbl) => (
                <button
                  key={tbl.id}
                  onClick={() => setSelectedTable(tbl)}
                  className={`aspect-square rounded-3xl shadow-sm flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border ${
                    selectedTable?.id === tbl.id
                      ? 'border-espresso-900 bg-espresso-900 text-white shadow-premium'
                      : tbl.status === 'OCCUPIED'
                      ? 'bg-espresso-900 text-white border-espresso-900'
                      : tbl.status === 'BILL_PRINTED'
                      ? 'bg-earth-olive text-white border-earth-olive'
                      : 'bg-white border-cafe-200/50 hover:border-espresso-900/20 text-on-surface'
                  }`}
                >
                  <span className="text-sm font-bold">{tbl.name}</span>
                  <span className={`text-[10px] ${selectedTable?.id === tbl.id || tbl.status !== 'AVAILABLE' ? 'opacity-80' : 'text-on-surface-variant'}`}>
                    {tbl.status === 'OCCUPIED' ? 'Occupied' : tbl.status === 'BILL_PRINTED' ? 'Bill Printed' : tbl.capacity || 'Tersedia'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Menu Catalog */}
          <div className="flex-1 flex flex-col">
            <div className="sticky top-0 bg-cafe-50 z-10 py-2 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Cari menu favorit..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-cafe-200 rounded-2xl focus:ring-1 focus:ring-espresso-900 outline-none transition-all text-sm"
                  />
                </div>
                <button className="p-3 bg-white border border-cafe-200 rounded-2xl hover:bg-cafe-50 transition-colors">
                  <Filter className="w-5 h-5 text-on-surface" />
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {['ALL', 'FOOD', 'DRINK', 'ADD_ON'].map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                      activeCategory === cat 
                        ? 'bg-espresso-900 text-white' 
                        : 'bg-white border border-cafe-200 text-on-surface hover:bg-cafe-50'
                    }`}
                  >
                    {cat === 'ALL' ? 'All' : cat === 'FOOD' ? 'Food' : cat === 'DRINK' ? 'Drink' : 'Add-ons'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
              {filteredProducts.map((prod) => (
                <div 
                  key={prod.id} 
                  onClick={() => addToCart(prod)}
                  className="bg-white p-4 rounded-3xl shadow-sm border border-cafe-200/50 group cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <div className="relative h-32 w-full rounded-2xl overflow-hidden mb-3 bg-cafe-50 flex items-center justify-center">
                    {prod.image ? (
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <Coffee className="w-10 h-10 text-cafe-200" />
                    )}
                    {prod.isBOM && (
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className="bg-earth-olive text-white text-[10px] px-2 py-0.5 rounded-full font-bold">BOM</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-espresso-900 truncate">{prod.name}</h3>
                  <div className="flex justify-between items-end mt-2">
                    <p className="text-sm font-bold text-on-surface-variant">Rp {prod.price.toLocaleString('id-ID')}</p>
                    <span className="w-8 h-8 bg-cafe-50 rounded-xl flex items-center justify-center text-espresso-900 group-hover:bg-espresso-900 group-hover:text-white transition-colors">
                      <Plus className="w-5 h-5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Side: Order Summary */}
        <aside className="hidden lg:flex w-full max-w-sm bg-white border-l border-cafe-200 flex-col z-20">
          <div className="p-6 border-b border-cafe-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <ShoppingCart className="text-espresso-900 w-6 h-6" />
                <h2 className="text-lg font-bold">Pesanan Aktif</h2>
              </div>
              <span className="px-3 py-1 bg-cafe-50 rounded-full text-[10px] font-bold text-espresso-900 uppercase tracking-wider border border-cafe-100">
                {selectedTable?.name || 'Meja --'}
              </span>
            </div>
            
            {/* Order Items */}
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="py-8 text-center">
                  <ShoppingCart className="w-12 h-12 text-cafe-100 mx-auto mb-3" />
                  <p className="text-xs text-cafe-400 font-medium">Belum ada pesanan.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-cafe-50 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Coffee className="w-6 h-6 text-cafe-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-espresso-900 truncate">{item.name}</h4>
                      <input
                        type="text"
                        placeholder="Tambahkan catatan..."
                        value={item.notes}
                        onChange={(e) => handleNotesChange(item.id, e.target.value)}
                        className="text-[10px] text-on-surface-variant bg-transparent outline-none w-full border-b border-transparent focus:border-cafe-200 transition-colors"
                      />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 border border-cafe-200 rounded-md flex items-center justify-center text-xs hover:bg-cafe-50 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 border border-cafe-200 rounded-md flex items-center justify-center text-xs hover:bg-cafe-50 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-end gap-6 overflow-y-auto custom-scrollbar">
            {/* Payment Method */}
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant mb-3 uppercase tracking-wider">Metode Pembayaran</p>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setPaymentMethod('CASH')}
                  className={`flex flex-col items-center gap-1 p-3 border rounded-2xl transition-all ${
                    paymentMethod === 'CASH' ? 'border-espresso-900 bg-cafe-50' : 'border-cafe-200 hover:border-espresso-900/40'
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                  <span className="text-[10px] font-bold">Cash</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`flex flex-col items-center gap-1 p-3 border rounded-2xl transition-all ${
                    paymentMethod === 'QRIS' ? 'border-espresso-900 bg-cafe-50' : 'border-cafe-200 hover:border-espresso-900/40'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-[10px] font-bold">QRIS</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('DEBIT')}
                  className={`flex flex-col items-center gap-1 p-3 border rounded-2xl transition-all ${
                    paymentMethod === 'DEBIT' ? 'border-espresso-900 bg-cafe-50' : 'border-cafe-200 hover:border-espresso-900/40'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-[10px] font-bold">Debit</span>
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div className="space-y-2 border-t border-dashed border-cafe-200 pt-6 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="font-medium">Rp {totalBefore.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <div className="flex flex-col">
                  <span className="text-on-surface-variant">Diskon</span>
                  <select
                    value={discountType ? (discountType + '||' + discountVal) : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setDiscountType(null);
                        setDiscountVal(0);
                      } else {
                        const [type, value] = val.split('||');
                        setDiscountType(type as any);
                        setDiscountVal(parseFloat(value));
                      }
                    }}
                    className="text-[10px] bg-transparent font-bold text-earth-olive outline-none cursor-pointer"
                  >
                    <option value="">Pilih Program</option>
                    {activeDiscountsList.map((disc) => (
                      <option key={disc.id} value={disc.type + '||' + disc.value}>
                        {disc.code} ({disc.type === 'PERCENTAGE' ? `${disc.value}%` : `Rp ${disc.value.toLocaleString('id-ID')}`})
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-red-600 font-bold">- Rp {discountAmount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tax (11%)</span>
                <span className="font-medium">Rp {taxAmount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Service (5%)</span>
                <span className="font-medium">Rp {serviceAmount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-espresso-900 pt-2 border-t border-cafe-50">
                <span>Total Net</span>
                <span>Rp {totalAfter.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Action Button */}
            <button 
              onClick={() => setIsConfirmingCheckout(true)}
              disabled={cart.length === 0}
              className="w-full h-12 bg-espresso-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-espresso-900/20 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
            >
              <span>{isOffline ? 'Proses Offline' : 'Proses Pembayaran'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </aside>
      </main>

      {/* Mobile Cart Trigger */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-6 right-6 z-40">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="px-6 py-4 bg-espresso-900 text-white font-bold rounded-2xl flex items-center gap-3 shadow-2xl active:scale-95 transition-all border border-espresso-900/20"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-sm">({cart.length}) Rp {totalAfter.toLocaleString('id-ID')}</span>
          </button>
        </div>
      )}

      {/* Mobile Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-espresso-900/60 backdrop-blur-sm z-50 flex justify-end">
          <div onClick={() => setIsCartOpen(false)} className="absolute inset-0" />
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl p-6 flex flex-col animate-slide-right">
             <div className="flex justify-between items-center pb-4 border-b border-cafe-100">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="text-espresso-900 w-6 h-6" />
                  <h3 className="font-bold text-lg">Ringkasan Pesanan</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 bg-cafe-50 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-cafe-50 shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <Coffee className="w-6 h-6 text-cafe-200" />
                        )}
                     </div>
                     <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold truncate">{item.name}</h4>
                        <p className="text-[10px] text-on-surface-variant">Rp {item.price.toLocaleString('id-ID')}</p>
                     </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 bg-cafe-50 rounded-lg flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 bg-cafe-50 rounded-lg flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                     </div>
                  </div>
                ))}
             </div>

             <div className="pt-6 space-y-4 border-t border-cafe-100">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Subtotal</span>
                    <span>Rp {totalBefore.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-red-600 font-bold">
                    <span>Diskon</span>
                    <span>- Rp {discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-cafe-50">
                    <span>Total Net</span>
                    <span>Rp {totalAfter.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <button 
                  onClick={() => { setIsCartOpen(false); setIsConfirmingCheckout(true); }}
                  className="w-full h-14 bg-espresso-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                  Konfirmasi Pembayaran
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Success Receipt Modal */}
      {isCheckoutSuccess && lastReceiptData && (
        <div className="fixed inset-0 bg-espresso-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-premium relative animate-scale-up">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-earth-olive/10 text-earth-olive rounded-full flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">Transaksi Berhasil</h3>
              <p className="text-xs text-on-surface-variant mt-1">Struk telah siap untuk dicetak</p>
            </div>

            <div id="receipt-print-area" className="border-2 border-dashed border-cafe-200 p-4 rounded-2xl bg-cafe-50 font-mono text-[11px] space-y-3">
              <div className="text-center font-bold">
                <p className="text-sm">POS CAOCAO</p>
                <p className="text-[10px] font-normal">Premium Cafe System</p>
                <p className="mt-1">Meja: {lastReceiptData.tableName || 'Takeaway'}</p>
              </div>
              <hr className="border-dashed border-cafe-300" />
              <div className="space-y-1">
                {lastReceiptData.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.productName} x{item.quantity}</span>
                    <span>Rp {(item.unitPrice * item.quantity).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
              <hr className="border-dashed border-cafe-300" />
              <div className="space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>Rp {(lastReceiptData.totalBefore || 0).toLocaleString('id-ID')}</span></div>
                {(lastReceiptData.discountAmount || 0) > 0 && <div className="flex justify-between text-red-600"><span>Diskon</span><span>- Rp {(lastReceiptData.discountAmount || 0).toLocaleString('id-ID')}</span></div>}
                <div className="flex justify-between font-bold text-sm"><span>Total</span><span>Rp {(lastReceiptData.totalAfter || 0).toLocaleString('id-ID')}</span></div>
              </div>
              <hr className="border-dashed border-cafe-300" />
              <div className="text-center text-[9px] text-on-surface-variant">
                <p>Metode: {lastReceiptData.paymentMethod}</p>
                <p>{new Date().toLocaleString('id-ID')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={() => window.print()} className="py-3 bg-espresso-900 text-white rounded-xl text-xs font-bold">Cetak</button>
              <button onClick={() => { setIsCheckoutSuccess(false); setLastReceiptData(null); }} className="py-3 bg-cafe-100 text-on-surface rounded-xl text-xs font-bold">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmingCheckout && (
        <div className="fixed inset-0 bg-espresso-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-premium animate-scale-up">
             <div className="text-center mb-6">
                <h3 className="font-bold text-lg">Konfirmasi Bayar</h3>
                <p className="text-sm text-on-surface-variant mt-2">
                  Proses pembayaran Rp <span className="font-bold text-espresso-900">{totalAfter.toLocaleString('id-ID')}</span> via <span className="font-bold text-earth-olive">{paymentMethod}</span>?
                </p>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { handleCheckout().catch(() => alert('Terjadi kesalahan')); setIsConfirmingCheckout(false); }} className="py-3 bg-earth-olive text-white rounded-xl text-xs font-bold">Ya, Proses</button>
                <button onClick={() => setIsConfirmingCheckout(false)} className="py-3 bg-cafe-100 text-on-surface rounded-xl text-xs font-bold">Batal</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
