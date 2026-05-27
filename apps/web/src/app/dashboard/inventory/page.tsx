'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, AlertTriangle, Scale, Plus, Flame, 
  Sparkles, Coffee, Trash2, ArrowRight, DollarSign, Award, UtensilsCrossed, Info, X, Settings, TrendingUp 
} from 'lucide-react';
import { api } from '@/lib/api-client';

const INITIAL_INGREDIENTS = [
  // BAR Ingredients
  { id: 'i1', name: 'Ethiopian Yirgacheffe', stockLevel: 4.2, unit: 'kg', safetyThreshold: 5.0, category: 'BAR', costPerUnit: 180000, description: 'Single Origin · 250g bags', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZoyQ-PxzR_tIaA-jG9UbG3Q0DVcV3zhdrUSSl5g-YouWYn_ID0w6OBDY2VsrXUHExsnLDs-1sVI0P0a9t0yPxty_IhcwzKMx75hzIbpPn4ibFY90B6Fol3f4P8HJ9wCUfnt1C0LUMBjLZ2HPQonq2jhOgIRO68bMNqg3bDv5zgNxw6DQOh2I_0v065kY2_OUR_Ba-XctzwK7cbujMHnXEP8Wx1--amQ2kHChfdOqyBgYFJepiJG2ImPtm_5kKCSHxNJS0Dt3_IJ8' },
  { id: 'i2', name: 'Oat Milk (Barista Ed.)', stockLevel: 48, unit: 'units', safetyThreshold: 20, category: 'BAR', costPerUnit: 35000, description: 'Oatly Professional · 1L', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRuwVLMQiCM4yjVFNzYrL_8Xx7O9oUD8YUwhA5VEAYeIaZlXv_yVdD1q2DW4qPTGh3DOyHauvLZBaRSUMXQMf7SBf1NS4zcGz9lTVpFzUnFwKxaSpcZc-9YEyvzStNEXhURBIXo4s02CPaCiThwCWWuy2wZDYBQ8KBIaqmwoQ5DUtI6FmUKs_BJlLYHSEk1CNjQubt9kPRspKETt0xDReYQ4mNvlFS3cGGmL4w7vpMhgzR8NmsGfei2YLXQx_dBFcrWpbq82rETeU' },
  { id: 'i3', name: 'Ceremonial Matcha', stockLevel: 12, unit: 'tins', safetyThreshold: 5, category: 'BAR', costPerUnit: 120000, description: 'Uji Region · 100g Tins', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvfTbScd_WhAJU-NBf70-wJlmUnZJwOH-_ZAlj_pAb8K50MwXWpTHb_15DgCT31sskPOf4PK90YvFlbr8yLYVX_YxOlUZopOOdTKGFdHGoIaiPqWzmFEnMetR-YlFHe7jpbvHrHUK2Qj0XbCgQooVuMQ3EPUuebrBg3dWJAf7tyxxwRhD8-GG5dZxElUgG2Xrl0CfAegJ5iTzt9-paeAtq_zAiSWExnZXYOhWR1MjTPWPvAP35ngfHAFX-trarEfhS8lY1Z0E9N-4' },
  { id: 'i4', name: 'Madagascar Vanilla', stockLevel: 0.8, unit: 'L', safetyThreshold: 1.0, category: 'BAR', costPerUnit: 450000, description: 'Premium Extract · 500ml', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYiq0mXVO-MPlDOB3rIMsg0W8VJ5GPLELYXPdJmIiYi1dP4ADuImAjCqhFjmrIlE76U4OJdcOSy3efnco-UNNnuW_S4OekT7v4JsISLwEvaGyg4vNGxC5yYlOvro56yZBdD4JZ0oM0UpJTXMRUXfMONUr-klSu_APjj9WtzRsUqrDrvM742SIQqU2WXif0rF0chWjN3qzBQl9AMWgazfXwSuNc9Vt6gkA-2TankC8AB47mYUmCS_YUmjtT4GYnI4EdTPM1Rd2Xc58' },
];

const INITIAL_PRODUCTS = [
  // Menu BOM
  { id: 'p1', name: 'Cold Brew Nitro', price: 35000, category: 'DRINK', isBOM: true, recipe: [
    { ingredientName: 'Ethiopian Yirgacheffe', quantity: 0.02, unit: 'kg' },
  ], manualHPP: null, opCost: 1500 },
  { id: 'p2', name: 'Avocado Tartine', price: 42000, category: 'FOOD', isBOM: true, recipe: [
    { ingredientName: 'Madagascar Vanilla', quantity: 0.005, unit: 'L' },
  ], manualHPP: null, opCost: 2000 },
  
  // Menu Biasa (Regular Menu)
  { id: 'p3', name: 'Oat Latte', price: 32000, category: 'DRINK', isBOM: false, recipe: [], manualHPP: 6000, opCost: 500 },
];

export default function InventoryBOM() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeIngredientTab, setActiveIngredientTab] = useState<'BAR' | 'KITCHEN'>('BAR');
  const [userRole, setUserRole] = useState<string>('ADMIN');
  const [view, setView] = useState<'inventory' | 'bom'>('inventory');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isWasteOpen, setIsWasteOpen] = useState(false);
  const [isOpnameOpen, setIsOpnameOpen] = useState(false);
  const [selectedOpnameIngredient, setSelectedOpnameIngredient] = useState<any>(null);

  // Owner Business Pricing Settings Modal state
  const [isBusinessOpen, setIsBusinessOpen] = useState(false);
  const [selectedBusinessProduct, setSelectedBusinessProduct] = useState<any>(null);
  const [sellingPriceInput, setSellingPriceInput] = useState('');
  const [manualHppInput, setManualHppInput] = useState('');
  const [opCostInput, setOpCostInput] = useState('');

  // Stock Opname Form Inputs
  const [physicalStockInput, setPhysicalStockInput] = useState('');
  const [opnameNote, setOpnameNote] = useState('Audit berkala');

  // Waste state & logs
  const [wasteLogs, setWasteLogs] = useState<any[]>([]);
  // Opname logs
  const [opnameLogs, setOpnameLogs] = useState<any[]>([]);

  // Form states
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    stockLevel: '',
    unit: 'kg',
    safetyThreshold: '',
    category: 'BAR', // BAR or KITCHEN
    costPerUnit: '',
    description: '',
  });

  const [wasteInput, setWasteInput] = useState({
    ingredientId: 'i1',
    quantity: '',
    reason: 'EXPIRED',
  });

  // Dynamic products recipe builder
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'DRINK',
    price: '',
    isBOM: true, // Toggle BOM vs Regular Menu!
  });
  
  const [recipeBindings, setRecipeBindings] = useState<any[]>([]);
  const [selectedIngredientForRecipe, setSelectedIngredientForRecipe] = useState('i1');
  const [ingredientQtyForRecipe, setIngredientQtyForRecipe] = useState('');

  // Stock Opname Direct Sidebar state
  const [quickOpnameMaterial, setQuickOpnameMaterial] = useState('i1');
  const [quickOpnameCount, setQuickOpnameCount] = useState('');

  useEffect(() => {
    // 1. Determine view query param
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setView(params.get('view') === 'bom' ? 'bom' : 'inventory');
    }

    // 2. Load user role and active locked configurations
    const storedUser = localStorage.getItem('pos_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        const savedMerge = localStorage.getItem('pos_merge_bar_cashier') === 'true';
        const activeRole = (u.role === 'CASHIER' && savedMerge) ? 'BAR' : u.role;
        setUserRole(activeRole);
        if (activeRole === 'KITCHEN') {
          setActiveIngredientTab('KITCHEN');
          setNewIngredient(prev => ({ ...prev, category: 'KITCHEN' }));
        } else if (activeRole === 'BAR') {
          setActiveIngredientTab('BAR');
          setNewIngredient(prev => ({ ...prev, category: 'BAR' }));
        }
      } catch (e) {}
    }

    // 3. Sync states with API or local cache
    const loadData = async () => {
      try {
        const [ings, prods, waste] = await Promise.all([
          api.inventory.getIngredients(),
          api.inventory.getProducts(),
          api.inventory.getWasteLogs()
        ]);
        setIngredients(ings);
        setProducts(prods);
        setWasteLogs(waste);
      } catch (err) {
        console.log('Inventory API Server offline, fallback mock mode activated.');
        const storedIngs = localStorage.getItem('pos_ingredients');
        if (storedIngs) {
          setIngredients(JSON.parse(storedIngs));
        } else {
          setIngredients(INITIAL_INGREDIENTS);
          localStorage.setItem('pos_ingredients', JSON.stringify(INITIAL_INGREDIENTS));
        }

        const storedProds = localStorage.getItem('pos_products');
        if (storedProds) {
          setProducts(JSON.parse(storedProds));
        } else {
          setProducts(INITIAL_PRODUCTS);
          localStorage.setItem('pos_products', JSON.stringify(INITIAL_PRODUCTS));
        }

        const storedWaste = localStorage.getItem('pos_waste_logs');
        if (storedWaste) {
          setWasteLogs(JSON.parse(storedWaste));
        } else {
          const initialWaste = [
            { id: 'w-1', name: 'Oat Milk (Barista Ed.)', quantity: 2, unit: 'units', reason: 'SPILLED', loggedBy: 'Staff Kasir', date: '26-05-2026', costLoss: 70000 }
          ];
          setWasteLogs(initialWaste);
          localStorage.setItem('pos_waste_logs', JSON.stringify(initialWaste));
        }
      }
    };

    loadData();

    const storedOpname = localStorage.getItem('pos_opname_logs');
    if (storedOpname) {
      setOpnameLogs(JSON.parse(storedOpname));
    } else {
      const initialOpname = [
        { id: 'op-1', date: '25-05-2026', ingredientName: 'Ethiopian Yirgacheffe', systemStock: 4.5, physicalStock: 4.2, discrepancy: -0.3, discrepancyValue: -54000, note: 'Penyusutan roastery', auditor: 'Admin' }
      ];
      setOpnameLogs(initialOpname);
      localStorage.setItem('pos_opname_logs', JSON.stringify(initialOpname));
    }
  }, []);

  // Update dropdown selection based on loaded ingredients
  useEffect(() => {
    if (ingredients.length > 0) {
      const allowed = ingredients.filter(ing => userRole === 'ADMIN' || ing.category === userRole);
      if (allowed.length > 0) {
        setWasteInput(prev => ({ ...prev, ingredientId: allowed[0].id }));
        setQuickOpnameMaterial(allowed[0].id);
      }
      setSelectedIngredientForRecipe(ingredients[0].id);
    }
  }, [ingredients, userRole]);

  // Dynamic BOM recipe HPP calculator
  const calculateRecipeHPP = (recipe: any[]) => {
    return recipe.reduce((sum, item) => {
      const ing = ingredients.find(i => 
        i.name.toLowerCase().includes(item.ingredientName.toLowerCase()) || 
        item.ingredientName.toLowerCase().includes(i.name.toLowerCase())
      );
      const cost = ing ? ing.costPerUnit || 0 : 0;
      return sum + (item.quantity * cost);
    }, 0);
  };

  // Dynamic BOM stock check - how many portions can be served based on limiting raw materials
  const getBOMStockStatus = (prod: any) => {
    if (!prod.isBOM || !prod.recipe || prod.recipe.length === 0) {
      return { status: 'TERSEDIA', portions: 'Unlimited' };
    }

    let minPortions = Infinity;
    for (const item of prod.recipe) {
      const matched = ingredients.find(i => 
        i.name.toLowerCase().includes(item.ingredientName.toLowerCase()) ||
        item.ingredientName.toLowerCase().includes(i.name.toLowerCase())
      );
      if (!matched) {
        minPortions = 0;
        break;
      }
      const portions = Math.floor(matched.stockLevel / item.quantity);
      if (portions < minPortions) {
        minPortions = portions;
      }
    }

    if (minPortions === Infinity || minPortions <= 0) {
      return { status: 'HABIS', portions: 0 };
    }
    return { status: 'TERSEDIA', portions: minPortions };
  };

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredient.name || !newIngredient.stockLevel || !newIngredient.costPerUnit) return;

    const ingData = {
      name: newIngredient.name,
      stockLevel: parseFloat(newIngredient.stockLevel),
      unit: newIngredient.unit,
      safetyThreshold: parseFloat(newIngredient.safetyThreshold || '5'),
      category: newIngredient.category,
      costPerUnit: parseFloat(newIngredient.costPerUnit),
      description: newIngredient.description || 'Bahan Baku Tambahan',
    };

    try {
      const ing = await api.inventory.createIngredient(ingData);
      setIngredients([...ingredients, ing]);
    } catch (err) {
      const ing = {
        id: 'i-' + Math.random().toString(36).slice(2, 6),
        ...ingData
      };
      const updated = [...ingredients, ing];
      setIngredients(updated);
      localStorage.setItem('pos_ingredients', JSON.stringify(updated));
    }

    setNewIngredient({ name: '', stockLevel: '', unit: 'kg', safetyThreshold: '', category: userRole === 'KITCHEN' ? 'KITCHEN' : 'BAR', costPerUnit: '', description: '' });
    setIsAddOpen(false);
    alert('Bahan baku berhasil didaftarkan!');
  };

  const handleAddWaste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wasteInput.quantity) return;

    const matched = ingredients.find(i => i.id === wasteInput.ingredientId);
    if (!matched) return;

    const wasteQty = parseFloat(wasteInput.quantity);
    const lossValue = wasteQty * (matched.costPerUnit || 0);

    const updatedIngredients = ingredients.map((ing) => {
      if (ing.id === wasteInput.ingredientId) {
        return { ...ing, stockLevel: Math.max(0, ing.stockLevel - wasteQty) };
      }
      return ing;
    });

    const newLog = {
      id: 'w-' + Math.random().toString(36).slice(2, 6),
      name: matched.name,
      quantity: wasteQty,
      unit: matched.unit,
      reason: wasteInput.reason,
      loggedBy: userRole + ' Staf',
      date: new Date().toLocaleDateString('id-ID'),
      costLoss: lossValue,
    };

    const updatedWasteLogs = [newLog, ...wasteLogs];

    setIngredients(updatedIngredients);
    setWasteLogs(updatedWasteLogs);

    localStorage.setItem('pos_ingredients', JSON.stringify(updatedIngredients));
    localStorage.setItem('pos_waste_logs', JSON.stringify(updatedWasteLogs));

    setWasteInput(prev => ({ ...prev, quantity: '', reason: 'EXPIRED' }));
    setIsWasteOpen(false);
    alert(`Pencatatan waste ${matched.name} berhasil disimpan!`);
  };

  const handleOpenOpname = (ing: any) => {
    setSelectedOpnameIngredient(ing);
    setPhysicalStockInput(ing.stockLevel.toString());
    setOpnameNote('Audit berkala');
    setIsOpnameOpen(true);
  };

  const handleSaveOpname = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpnameIngredient || physicalStockInput === '') return;

    const physicalVal = parseFloat(physicalStockInput);
    const systemVal = selectedOpnameIngredient.stockLevel;
    const discrepancy = physicalVal - systemVal;
    const discrepancyCost = discrepancy * (selectedOpnameIngredient.costPerUnit || 0);

    const logRecord = {
      id: 'op-' + Math.random().toString(36).slice(2, 6),
      date: new Date().toLocaleDateString('id-ID'),
      ingredientName: selectedOpnameIngredient.name,
      systemStock: systemVal,
      physicalStock: physicalVal,
      discrepancy: discrepancy,
      discrepancyValue: discrepancyCost,
      note: opnameNote || 'Audit berkala',
      auditor: userRole || 'Staf',
    };

    const updatedIngredients = ingredients.map(ing => {
      if (ing.id === selectedOpnameIngredient.id) {
        return { ...ing, stockLevel: physicalVal };
      }
      return ing;
    });

    const updatedOpnameLogs = [logRecord, ...opnameLogs];

    setIngredients(updatedIngredients);
    setOpnameLogs(updatedOpnameLogs);

    localStorage.setItem('pos_ingredients', JSON.stringify(updatedIngredients));
    localStorage.setItem('pos_opname_logs', JSON.stringify(updatedOpnameLogs));

    setIsOpnameOpen(false);
    setPhysicalStockInput('');
    setOpnameNote('Audit berkala');
    alert(`Audit Stock Opname ${selectedOpnameIngredient.name} berhasil disimpan!`);
  };

  const handleQuickOpname = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickOpnameCount) return;
    const matched = ingredients.find(i => i.id === quickOpnameMaterial);
    if (!matched) return;

    const physicalVal = parseFloat(quickOpnameCount);
    const systemVal = matched.stockLevel;
    const discrepancy = physicalVal - systemVal;
    const discrepancyCost = discrepancy * (matched.costPerUnit || 0);

    const logRecord = {
      id: 'op-' + Math.random().toString(36).slice(2, 6),
      date: new Date().toLocaleDateString('id-ID'),
      ingredientName: matched.name,
      systemStock: systemVal,
      physicalStock: physicalVal,
      discrepancy: discrepancy,
      discrepancyValue: discrepancyCost,
      note: 'Audit Opname Cepat via Widget',
      auditor: userRole || 'Staf',
    };

    const updatedIngredients = ingredients.map(ing => {
      if (ing.id === matched.id) {
        return { ...ing, stockLevel: physicalVal };
      }
      return ing;
    });

    const updatedOpnameLogs = [logRecord, ...opnameLogs];

    setIngredients(updatedIngredients);
    setOpnameLogs(updatedOpnameLogs);

    localStorage.setItem('pos_ingredients', JSON.stringify(updatedIngredients));
    localStorage.setItem('pos_opname_logs', JSON.stringify(updatedOpnameLogs));

    setQuickOpnameCount('');
    alert(`Audit Opname Cepat ${matched.name} berhasil disesuaikan!`);
  };

  const handleOpenBusinessSettings = (prod: any) => {
    setSelectedBusinessProduct(prod);
    setSellingPriceInput(prod.price.toString());
    setManualHppInput(prod.manualHPP !== null ? prod.manualHPP.toString() : '');
    setOpCostInput(prod.opCost ? prod.opCost.toString() : '0');
    setIsBusinessOpen(true);
  };

  const handleSaveBusinessSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusinessProduct) return;

    const priceVal = parseFloat(sellingPriceInput) || selectedBusinessProduct.price;
    const hppVal = manualHppInput !== '' ? parseFloat(manualHppInput) : null;
    const opVal = parseFloat(opCostInput) || 0;

    const updatedProducts = products.map(p => {
      if (p.id === selectedBusinessProduct.id) {
        return {
          ...p,
          price: priceVal,
          manualHPP: hppVal,
          opCost: opVal,
        };
      }
      return p;
    });

    setProducts(updatedProducts);
    localStorage.setItem('pos_products', JSON.stringify(updatedProducts));

    try {
      const cached = localStorage.getItem('cached_products');
      if (cached) {
        const list = JSON.parse(cached);
        const updatedList = list.map((item: any) => {
          if (item.id === selectedBusinessProduct.id) {
            return {
              ...item,
              price: priceVal,
            };
          }
          return item;
        });
        localStorage.setItem('cached_products', JSON.stringify(updatedList));
      }
    } catch (err) {}

    setIsBusinessOpen(false);
    alert(`Pengaturan bisnis menu ${selectedBusinessProduct.name} berhasil disimpan!`);
  };

  const handleAddToRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredientQtyForRecipe) return;

    const matched = ingredients.find(i => i.id === selectedIngredientForRecipe);
    if (!matched) return;

    if (recipeBindings.some(r => r.ingredientId === selectedIngredientForRecipe)) {
      alert('Bahan baku tersebut sudah dimasukkan ke dalam daftar resep!');
      return;
    }

    setRecipeBindings([
      ...recipeBindings,
      {
        ingredientId: selectedIngredientForRecipe,
        ingredientName: matched.name,
        quantity: parseFloat(ingredientQtyForRecipe),
        unit: matched.unit,
      }
    ]);
    setIngredientQtyForRecipe('');
  };

  const handleRemoveFromRecipe = (ingredientId: string) => {
    setRecipeBindings(recipeBindings.filter(r => r.ingredientId !== ingredientId));
  };

  const handleRegisterProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    const prodData = {
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      isBOM: newProduct.isBOM,
      recipe: newProduct.isBOM ? recipeBindings.map(r => ({
        ingredientId: r.ingredientId,
        quantity: r.quantity,
      })) : [],
    };

    try {
      const prod = await api.inventory.createProduct(prodData);
      setProducts([...products, prod]);
    } catch (err) {
      const prod = {
        id: 'p-' + Math.random().toString(36).slice(2, 6),
        ...prodData,
        recipe: newProduct.isBOM ? recipeBindings.map(r => ({
          ingredientName: r.ingredientName,
          quantity: r.quantity,
          unit: r.unit,
        })) : [],
        manualHPP: null,
        opCost: 1000, 
      };

      const updated = [...products, prod];
      setProducts(updated);
      localStorage.setItem('pos_products', JSON.stringify(updated));

      const posProducts = JSON.parse(localStorage.getItem('cached_products') || '[]');
      posProducts.push({
        id: prod.id,
        name: prod.name + (prod.isBOM ? ' (BOM)' : ''),
        price: prod.price,
        category: prod.category,
        isBOM: prod.isBOM,
      });
      localStorage.setItem('cached_products', JSON.stringify(posProducts));
    }

    setNewProduct({ name: '', category: 'DRINK', price: '', isBOM: true });
    setRecipeBindings([]);
    alert('Menu baru berhasil didaftarkan!');
  };

  const currentRecipeHpp = recipeBindings.reduce((sum, r) => {
    const matched = ingredients.find(i => i.id === r.ingredientId);
    return sum + (r.quantity * (matched?.costPerUnit || 0));
  }, 0);

  const profitMarginPercent = newProduct.price 
    ? (((parseFloat(newProduct.price) - currentRecipeHpp) / parseFloat(newProduct.price)) * 100).toFixed(1)
    : '0';

  // Stats calculation
  const totalAssetsValue = ingredients.filter(ing => ing.category === activeIngredientTab).reduce((sum, ing) => sum + (ing.stockLevel * (ing.costPerUnit || 0)), 0);
  const criticalItemsCount = ingredients.filter(ing => ing.category === activeIngredientTab && ing.stockLevel <= ing.safetyThreshold).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-1 py-4">
      {/* Top Header Controls */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="font-label-md text-label-md text-on-surface-variant mb-1 uppercase tracking-wider">
            {view === 'bom' ? 'RECIPE & YIELD DESIGNER' : 'GUDANG & STOK OPERASIONAL'}
          </p>
          <h2 className="text-3xl font-bold text-espresso-900 font-sans tracking-tight">
            {view === 'bom' ? 'Recipe BOM Setup' : 'BOM & Inventory'}
          </h2>
        </div>
        <div className="flex gap-2 self-start md:self-auto">
          {view !== 'bom' ? (
            <>
              {(userRole === 'ADMIN' || userRole === 'OWNER') && (
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="px-4 py-2.5 bg-espresso-900 text-white rounded-xl text-xs font-bold active:scale-95 shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> New Material
                </button>
              )}
              <button
                onClick={() => setIsWasteOpen(true)}
                className="px-4 py-2.5 bg-red-950/20 text-red-700 hover:bg-red-900/30 border border-red-900/10 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Flame className="w-4 h-4 animate-pulse" /> Record Waste
              </button>
            </>
          ) : (
            <button
              onClick={() => setView('inventory')}
              className="px-4 py-2.5 bg-espresso-900 text-white rounded-xl text-xs font-bold active:scale-95 shadow-sm"
            >
              Back to Inventory
            </button>
          )}
        </div>
      </section>

      {/* RENDER VIEW 1: INVENTORY & DIRECTORIES */}
      {view !== 'bom' && (
        <div className="space-y-8 animate-scale-up">
          {/* Asset Summary Cards (Bento Style) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-cafe-200/20 flex flex-col justify-between h-40 group hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <span className="p-3 bg-secondary-container text-on-secondary-container rounded-2xl">
                  <span className="material-symbols-outlined select-none text-[24px]">account_balance_wallet</span>
                </span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Inventory Value</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-espresso-900">Rp {totalAssetsValue.toLocaleString('id-ID')}</h2>
                <p className="text-[10px] font-bold text-secondary flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +2.4% from last month
                </p>
              </div>
            </div>

            <div className={`bg-white rounded-3xl p-6 border flex flex-col justify-between h-40 transition-all ${
              criticalItemsCount > 0 ? 'border-red-200 bg-red-50/20 animate-pulse' : 'border-cafe-200/20 hover:shadow-md'
            }`}>
              <div className="flex justify-between items-start">
                <span className={`p-3 rounded-2xl ${criticalItemsCount > 0 ? 'bg-error-container text-on-error-container' : 'bg-cafe-50 text-espresso-900'}`}>
                  <span className="material-symbols-outlined select-none text-[24px]">warning</span>
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${criticalItemsCount > 0 ? 'text-red-650' : 'text-on-surface-variant'}`}>
                  Critical Alerts
                </span>
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${criticalItemsCount > 0 ? 'text-red-650' : 'text-espresso-900'}`}>
                  {criticalItemsCount} Items
                </h2>
                <p className="text-[10px] text-on-surface-variant mt-1 font-semibold">Requiring immediate restock</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-cafe-200/20 flex flex-col justify-between h-40 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <span className="p-3 bg-cafe-50 text-espresso-900 rounded-2xl">
                  <span className="material-symbols-outlined select-none text-[24px]">recycling</span>
                </span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Waste Today</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-espresso-900">1.2%</h2>
                <p className="text-[10px] text-on-surface-variant mt-1 font-semibold">Below target threshold</p>
              </div>
            </div>
          </section>

          {/* Main Workspace: Directory & Tools */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Sidebar: Directory & Tabs */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex bg-cafe-200/40 p-1 rounded-2xl w-fit border border-cafe-200/20">
                  <button 
                    onClick={() => setActiveIngredientTab('BAR')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeIngredientTab === 'BAR' ? 'bg-white text-espresso-900 shadow-sm' : 'text-on-surface-variant hover:text-espresso-900'}`}
                  >
                    Bar Directory
                  </button>
                  <button 
                    onClick={() => setActiveIngredientTab('KITCHEN')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${activeIngredientTab === 'KITCHEN' ? 'bg-white text-espresso-900 shadow-sm' : 'text-on-surface-variant hover:text-espresso-900'}`}
                  >
                    Kitchen Stores
                  </button>
                </div>
              </div>

              {/* Raw Material Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {ingredients.filter(ing => ing.category === activeIngredientTab).map((ing) => {
                  const isLow = ing.stockLevel <= ing.safetyThreshold;

                  return (
                    <div key={ing.id} className="bg-white rounded-3xl p-5 border border-cafe-200/20 hover:border-espresso-900/20 hover:shadow-sm transition-all group flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <Link href={`/dashboard/inventory/${ing.id}`} className="w-16 h-16 rounded-2xl bg-cafe-50 flex items-center justify-center overflow-hidden border border-cafe-200/50 cursor-pointer block">
                            {ing.imageUrl ? (
                              <img alt={ing.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={ing.imageUrl} />
                            ) : (
                              ing.category === 'BAR' ? <Coffee className="w-8 h-8 text-cafe-300" /> : <UtensilsCrossed className="w-8 h-8 text-cafe-300" />
                            )}
                          </Link>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            isLow ? 'bg-error-container text-on-error-container animate-pulse' : 'bg-secondary-container text-on-secondary-container'
                          }`}>
                            {isLow ? 'Low Stock' : 'Optimal'}
                          </span>
                        </div>
                        <Link href={`/dashboard/inventory/${ing.id}`} className="group-hover:text-earth-olive transition-colors">
                          <h3 className="text-base font-bold text-espresso-900 mb-1 flex items-center gap-1.5 hover:underline">
                            {ing.name} <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all text-earth-olive" />
                          </h3>
                        </Link>
                        <p className="text-[11px] font-semibold text-on-surface-variant mb-4">{ing.description || `${ing.category} Material`}</p>
                      </div>

                      <div className="flex justify-between items-end border-t border-cafe-200/10 pt-3 mt-2">
                        <div>
                          <span className="text-[9px] font-extrabold text-on-surface-variant uppercase tracking-wider block">On Hand</span>
                          <span className="text-xl font-bold text-espresso-900">
                            {ing.stockLevel.toLocaleString('id-ID')} <span className="text-xs font-normal text-on-surface-variant">{ing.unit}</span>
                          </span>
                        </div>
                        <button 
                          onClick={() => handleOpenOpname(ing)}
                          className="w-10 h-10 rounded-full border border-cafe-200 flex items-center justify-center text-espresso-900 hover:bg-espresso-900 hover:text-white transition-all active:scale-95"
                          title="Audit Stock Opname"
                        >
                          <Scale className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Sidebar: Quick Actions & Forms */}
            <div className="lg:col-span-4 space-y-6">
              {/* Stock Opname Tool */}
              <div className="bg-white rounded-3xl border border-cafe-200/30 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-earth-olive text-xl select-none">inventory</span>
                  <h3 className="text-base font-bold text-espresso-900">Stock Opname</h3>
                </div>
                <form onSubmit={handleQuickOpname} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Select Material</label>
                    <select 
                      value={quickOpnameMaterial}
                      onChange={(e) => setQuickOpnameMaterial(e.target.value)}
                      className="w-full px-4 py-3 bg-cafe-50 border border-cafe-200 rounded-2xl focus:ring-espresso-900 focus:border-espresso-900 transition-all text-xs font-semibold text-cafe-900"
                    >
                      {ingredients
                        .filter(ing => ing.category === activeIngredientTab)
                        .map(ing => (
                          <option key={ing.id} value={ing.id}>{ing.name}</option>
                        ))
                      }
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Actual Count</label>
                    <div className="flex gap-2">
                      <input 
                        type="number"
                        step="any"
                        required
                        placeholder="0.00"
                        value={quickOpnameCount}
                        onChange={(e) => setQuickOpnameCount(e.target.value)}
                        className="flex-1 px-4 py-3 bg-cafe-50 border border-cafe-200 rounded-2xl focus:ring-espresso-900 focus:border-espresso-900 transition-all text-xs font-semibold"
                      />
                      <div className="px-4 py-3 bg-cafe-200 rounded-2xl font-bold text-espresso-900 flex items-center text-xs">
                        {ingredients.find(i => i.id === quickOpnameMaterial)?.unit || 'unit'}
                      </div>
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-3.5 bg-espresso-900 text-white rounded-2xl font-bold text-xs transition-all active:scale-95 shadow-md hover:opacity-90"
                  >
                    Adjust Inventory
                  </button>
                </form>
              </div>

              {/* Waste Recording */}
              <div className="bg-cafe-50 rounded-3xl border border-cafe-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-on-surface-variant text-xl select-none">delete_sweep</span>
                  <h3 className="text-base font-bold text-espresso-900">Waste Log</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setWasteInput(prev => ({ ...prev, reason: 'SPILLED' }))}
                      className={`flex-1 py-3 border rounded-xl text-[10px] font-bold uppercase transition-all ${
                        wasteInput.reason === 'SPILLED' ? 'bg-espresso-900 border-espresso-900 text-white' : 'bg-white border-cafe-200 text-on-surface-variant'
                      }`}
                    >
                      Spillage
                    </button>
                    <button 
                      onClick={() => setWasteInput(prev => ({ ...prev, reason: 'EXPIRED' }))}
                      className={`flex-1 py-3 border rounded-xl text-[10px] font-bold uppercase transition-all ${
                        wasteInput.reason === 'EXPIRED' ? 'bg-espresso-900 border-espresso-900 text-white' : 'bg-white border-cafe-200 text-on-surface-variant'
                      }`}
                    >
                      Expired
                    </button>
                  </div>
                  
                  <div 
                    onClick={() => setIsWasteOpen(true)}
                    className="p-4 bg-white/60 border border-dashed border-cafe-200 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-espresso-900/30 transition-colors"
                  >
                    <span className="material-symbols-outlined text-3xl text-cafe-200 mb-2 select-none animate-pulse">add_a_photo</span>
                    <span className="text-[10px] font-bold text-on-surface-variant">Tap to attach proof &amp; submit</span>
                  </div>
                </div>
              </div>

              {/* Recipe Binder Shortcut */}
              <div 
                onClick={() => setView('bom')}
                className="bg-white rounded-3xl p-6 relative overflow-hidden group cursor-pointer active:scale-95 border border-cafe-200/20 hover:shadow-md transition-all h-36 flex flex-col justify-between"
              >
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-espresso-900 mb-1">Recipe Binder</h3>
                  <p className="text-xs font-semibold text-on-surface-variant">Update Menu BOM &amp; Yields</p>
                </div>
                <div className="flex items-center gap-2 text-earth-olive font-bold text-xs relative z-10">
                  <span>Open Setup</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-[100px] select-none">menu_book</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* RENDER VIEW 2: RECIPE BINDER & BOM */}
      {view === 'bom' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-scale-up">
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-white rounded-3xl p-6 border border-cafe-200/20 shadow-sm">
              <h3 className="text-lg font-bold text-espresso-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-earth-olive animate-pulse" /> Menu BOM Yield Listings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((prod) => {
                  const recipeHPP = prod.isBOM ? calculateRecipeHPP(prod.recipe) : 0;
                  const activeHPP = prod.manualHPP !== null && prod.manualHPP !== undefined ? prod.manualHPP : recipeHPP;
                  const activeOpCost = prod.opCost || 0;
                  const totalCostPerPortion = activeHPP + activeOpCost;
                  const netProfitVal = prod.price - totalCostPerPortion;
                  const netMarginPercent = prod.price > 0 ? ((netProfitVal / prod.price) * 100).toFixed(1) : '0';

                  const stockStatus = getBOMStockStatus(prod);

                  return (
                    <div key={prod.id} className="p-5 bg-cafe-50 rounded-2xl border border-cafe-200/30 text-xs flex flex-col justify-between hover:scale-[1.01] transition-all relative">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-espresso-900 text-sm">{prod.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase shrink-0 border ${
                            prod.isBOM ? 'bg-secondary-container text-on-secondary-container border-secondary-container/20' : 'bg-cafe-200 text-on-surface-variant border-cafe-300'
                          }`}>
                            {prod.isBOM ? 'Menu BOM' : 'Menu Biasa'}
                          </span>
                        </div>

                        {/* BOM Stock Constraints Indicators */}
                        <div className="flex items-center">
                          {stockStatus.status === 'HABIS' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-error-container text-on-error-container font-bold text-[9px] border border-error-container/20">
                              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> Out of stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary-container text-on-secondary-container font-bold text-[9px] border border-secondary-container/20">
                              Optimal ({stockStatus.portions === 'Unlimited' ? 'Unlimited' : `${stockStatus.portions} Porsi`})
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between text-[11px] text-on-surface-variant font-semibold pt-1">
                          <span>Harga Jual:</span>
                          <span className="text-espresso-900 font-bold text-sm">Rp {prod.price.toLocaleString('id-ID')}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-cafe-200/20 space-y-3">
                        {prod.isBOM ? (
                          <div>
                            <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Recipe:</span>
                            <ul className="space-y-1 text-[10px] text-cafe-700 font-medium">
                              {prod.recipe.map((r: any, idx: number) => {
                                const matched = ingredients.find(i => 
                                  i.name.toLowerCase().includes(r.ingredientName.toLowerCase()) ||
                                  r.ingredientName.toLowerCase().includes(i.name.toLowerCase())
                                );
                                const costVal = r.quantity * (matched?.costPerUnit || 0);

                                return (
                                  <li key={idx} className="flex justify-between">
                                    <span>&bull; {r.ingredientName} ({r.quantity} {r.unit})</span>
                                    <span className="text-on-surface-variant font-bold">Rp {costVal.toLocaleString('id-ID')}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ) : (
                          <div className="text-[10px] text-on-surface-variant font-semibold italic flex items-center gap-1 py-1">
                            <Info className="w-3.5 h-3.5 text-earth-olive" /> Regular Menu (No ingredients reduction)
                          </div>
                        )}

                        <div className="pt-2.5 border-t border-dashed border-cafe-200 font-bold space-y-1 text-[10px]">
                          <div className="flex justify-between items-center">
                            <span className="text-on-surface-variant uppercase text-[8px]">HPP Pokok:</span>
                            {prod.manualHPP !== null && prod.manualHPP !== undefined && prod.manualHPP !== '' ? (
                              <span className="text-espresso-900 font-bold">Rp {Number(prod.manualHPP).toLocaleString('id-ID')} (Manual)</span>
                            ) : (
                              <span className="text-earth-olive font-bold">Rp {recipeHPP.toLocaleString('id-ID')} (Resep)</span>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-on-surface-variant uppercase text-[8px]">Biaya Ops/Porsi:</span>
                            <span className="text-on-surface-variant font-bold">Rp {activeOpCost.toLocaleString('id-ID')}</span>
                          </div>

                          <div className="pt-1.5 border-t border-cafe-200/50 flex justify-between items-center font-extrabold text-[10px]">
                            <div>
                              <span className="text-earth-olive text-[11px] block font-bold">Profit: Rp {netProfitVal.toLocaleString('id-ID')}</span>
                              <span className="text-earth-olive/80 text-[9px]">{netMarginPercent}% Net Margin</span>
                            </div>
                            
                            <button
                              onClick={() => handleOpenBusinessSettings(prod)}
                              className="px-2.5 py-1.5 bg-cafe-50 hover:bg-cafe-200 text-espresso-900 rounded-lg transition-all font-bold text-[9px] inline-flex items-center gap-1.5 active:scale-95 border border-cafe-200/50 shadow-sm"
                            >
                              <Settings className="w-3.5 h-3.5 text-earth-olive" /> Edit Pricing
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Interactive Menu input builder (Right Column) */}
          <div className="lg:col-span-4 space-y-6">
            {userRole === 'ADMIN' || userRole === 'OWNER' ? (
              <section className="bg-white rounded-3xl p-6 border border-cafe-200/20 shadow-sm">
                <h3 className="font-bold text-espresso-900 text-base mb-4 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-earth-olive" /> Register New Product
                </h3>
                
                <form onSubmit={handleRegisterProduct} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Nama Menu</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Caramel Macchiato Oats"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Harga Jual (Rp)</label>
                      <input
                        type="number"
                        required
                        placeholder="32000"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Kategori</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50"
                      >
                        <option value="DRINK">Minuman (Bar)</option>
                        <option value="FOOD">Makanan (Kitchen)</option>
                        <option value="ADD_ON">Add-on</option>
                      </select>
                    </div>
                  </div>

                  {/* TIPE MENU SELECTION (BOM VS REGULAR MENU) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface-variant block uppercase tracking-wider">Tipe Menu</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setNewProduct({ ...newProduct, isBOM: true })}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                          newProduct.isBOM ? 'bg-espresso-900 border-espresso-900 text-white shadow-sm' : 'bg-cafe-50 text-on-surface-variant border-cafe-200'
                        }`}
                      >
                        Menu BOM
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewProduct({ ...newProduct, isBOM: false })}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                          !newProduct.isBOM ? 'bg-espresso-900 border-espresso-900 text-white shadow-sm' : 'bg-cafe-50 text-on-surface-variant border-cafe-200'
                        }`}
                      >
                        Menu Biasa
                      </button>
                    </div>
                  </div>

                  {/* DYNAMIC RECIPE BUILDER WITH LIVE COST PREVIEWS */}
                  {newProduct.isBOM && (
                    <div className="border-t border-cafe-100 pt-3 space-y-3">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Bind Ingredients:</span>
                      
                      {/* Current bindings list */}
                      {recipeBindings.length > 0 && (
                        <div className="space-y-1.5 p-3 bg-cafe-50 rounded-2xl border border-cafe-200 mb-3 max-h-[140px] overflow-y-auto">
                          {recipeBindings.map((r) => {
                            const matched = ingredients.find(i => i.id === r.ingredientId);
                            const cost = r.quantity * (matched?.costPerUnit || 0);

                            return (
                              <div key={r.ingredientId} className="flex justify-between items-center text-[10px] font-bold text-espresso-900">
                                <span>{r.ingredientName}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-earth-olive font-extrabold">- {r.quantity} {r.unit} (Rp {cost.toLocaleString('id-ID')})</span>
                                  <button 
                                    type="button"
                                    onClick={() => handleRemoveFromRecipe(r.ingredientId)}
                                    className="text-red-500 hover:text-red-700 p-0.5"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Bound selection bar */}
                      <div className="flex gap-2">
                        <select
                          value={selectedIngredientForRecipe}
                          onChange={(e) => setSelectedIngredientForRecipe(e.target.value)}
                          className="w-1/2 px-2 py-2 rounded-xl border border-cafe-200 text-[10px] focus:outline-none bg-cafe-50/50 font-semibold"
                        >
                          {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>{ing.name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          step="any"
                          placeholder="Qty"
                          value={ingredientQtyForRecipe}
                          onChange={(e) => setIngredientQtyForRecipe(e.target.value)}
                          className="w-1/4 px-2 py-2 rounded-xl border border-cafe-200 text-[10px] focus:outline-none bg-cafe-50/50 font-semibold text-center"
                        />
                        <button
                          type="button"
                          onClick={handleAddToRecipe}
                          className="px-3 bg-espresso-900 text-white rounded-xl text-[10px] font-bold transition-all shrink-0 hover:opacity-90"
                        >
                          Add
                        </button>
                      </div>

                      {/* Dynamic Live Cost & Margin Indicators */}
                      <div className="p-3 bg-earth-olive/5 border border-earth-olive/10 rounded-2xl text-[10px] space-y-1 font-bold text-on-surface-variant">
                        <div className="flex justify-between">
                          <span>Total HPP Resep:</span>
                          <span className="text-espresso-900 font-extrabold">Rp {currentRecipeHpp.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rasio Margin:</span>
                          <span className="text-earth-olive font-extrabold">{profitMarginPercent}% Margin</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-espresso-900 text-white rounded-xl text-xs font-bold active:scale-95 shadow-sm mt-2 hover:opacity-90"
                  >
                    Daftarkan Menu Jual
                  </button>
                </form>
              </section>
            ) : (
              <section className="bg-white rounded-3xl p-6 border border-cafe-200/20 text-center text-xs text-on-surface-variant shadow-premium">
                <Info className="w-6 h-6 mx-auto mb-2 text-cafe-300" />
                Input menu dan resep BOM terkunci untuk role selain Owner atau Admin.
              </section>
            )}
          </div>
        </div>
      )}

      {/* POPUP MODAL 1: TAMBAH BAHAN BAKU BARU */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-cafe-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-premium relative animate-scale-up border border-cafe-100">
            <div className="flex justify-between items-center pb-3 border-b border-cafe-100 mb-4">
              <h3 className="font-extrabold text-espresso-900 text-base">New Raw Material</h3>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-lg bg-cafe-50 text-cafe-400 hover:text-cafe-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddIngredient} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Nama Bahan Baku</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bubuk Coklat Hershey"
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Deskripsi Singkat</label>
                <input
                  type="text"
                  placeholder="Contoh: Premium Extract · 500ml"
                  value={newIngredient.description}
                  onChange={(e) => setNewIngredient({ ...newIngredient, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Kategori Lokasi</label>
                <select
                  value={newIngredient.category}
                  onChange={(e) => setNewIngredient({ ...newIngredient, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none bg-cafe-50/50 font-semibold text-cafe-900"
                >
                  <option value="BAR">Bahan Baku Bar (Minuman)</option>
                  <option value="KITCHEN">Bahan Baku Kitchen (Makanan)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Harga Beli / Unit (Rp)</label>
                  <input
                    type="number"
                    required
                    placeholder="180000"
                    value={newIngredient.costPerUnit}
                    onChange={(e) => setNewIngredient({ ...newIngredient, costPerUnit: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Unit Takaran</label>
                  <select
                    value={newIngredient.unit}
                    onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none bg-cafe-50/50"
                  >
                    <option value="kg">kg</option>
                    <option value="units">units</option>
                    <option value="tins">tins</option>
                    <option value="L">L</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Stock Awal</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="10"
                    value={newIngredient.stockLevel}
                    onChange={(e) => setNewIngredient({ ...newIngredient, stockLevel: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Safety Threshold</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="5"
                    value={newIngredient.safetyThreshold}
                    onChange={(e) => setNewIngredient({ ...newIngredient, safetyThreshold: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-espresso-900 text-white rounded-xl text-xs font-bold active:scale-95 shadow-md flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Daftarkan Bahan Baku
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: CATAT BAHAN TERBUANG (WASTE) */}
      {isWasteOpen && (
        <div className="fixed inset-0 bg-cafe-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-premium relative animate-scale-up border border-cafe-100">
            <div className="flex justify-between items-center pb-3 border-b border-cafe-100 mb-4">
              <h3 className="font-extrabold text-espresso-900 text-base">Record Waste</h3>
              <button 
                onClick={() => setIsWasteOpen(false)}
                className="p-1.5 rounded-lg bg-cafe-50 text-cafe-400 hover:text-cafe-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddWaste} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Bahan Baku</label>
                <select
                  value={wasteInput.ingredientId}
                  onChange={(e) => setWasteInput({ ...wasteInput, ingredientId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none bg-cafe-50/50 font-semibold text-cafe-900"
                >
                  {ingredients
                    .filter((ing) => userRole === 'ADMIN' || ing.category === userRole)
                    .map((ing) => (
                      <option key={ing.id} value={ing.id}>{ing.name}</option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Jumlah Terbuang</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="2"
                  value={wasteInput.quantity}
                  onChange={(e) => setWasteInput({ ...wasteInput, quantity: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Alasan Waste</label>
                <select
                  value={wasteInput.reason}
                  onChange={(e) => setWasteInput({ ...wasteInput, reason: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none bg-cafe-50/50"
                >
                  <option value="EXPIRED">EXPIRED (Kadaluarsa)</option>
                  <option value="SPILLED">SPILLED (Tumpah / Pecah)</option>
                  <option value="DEFECTIVE">DEFECTIVE (Rusak / Membusuk)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-red-950/20 hover:bg-red-900/30 text-red-700 border border-red-900/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Flame className="w-4 h-4 animate-pulse" /> Simpan Pencatatan Waste
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL 3: AUDIT STOCK OPNAME */}
      {isOpnameOpen && selectedOpnameIngredient && (
        <div className="fixed inset-0 bg-cafe-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-premium relative animate-scale-up border border-cafe-100">
            <div className="flex justify-between items-center pb-3 border-b border-cafe-100 mb-4">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-espresso-900 text-base">Audit Stock Opname</h3>
                <p className="text-[9px] text-on-surface-variant uppercase font-extrabold">Verifikasi Fisik Lapangan</p>
              </div>
              <button 
                onClick={() => setIsOpnameOpen(false)}
                className="p-1.5 rounded-lg bg-cafe-50 text-cafe-400 hover:text-cafe-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOpname} className="space-y-4 text-xs font-semibold text-cafe-700">
              <div className="p-3 bg-cafe-50 rounded-2xl border border-cafe-200/30 space-y-1.5">
                <div className="flex justify-between">
                  <span>Bahan Baku:</span>
                  <span className="text-espresso-900 font-extrabold">{selectedOpnameIngredient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stok di Sistem:</span>
                  <span className="text-espresso-900 font-bold">{selectedOpnameIngredient.stockLevel.toLocaleString('id-ID')} {selectedOpnameIngredient.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Harga Beli:</span>
                  <span className="text-on-surface-variant">Rp {selectedOpnameIngredient.costPerUnit?.toLocaleString('id-ID')} / {selectedOpnameIngredient.unit}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Stok Fisik Aktual Terhitung</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="Masukkan jumlah fisik"
                  value={physicalStockInput}
                  onChange={(e) => setPhysicalStockInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-extrabold text-espresso-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Catatan Audit</label>
                <input
                  type="text"
                  required
                  placeholder="Catatan penyesuaian"
                  value={opnameNote}
                  onChange={(e) => setOpnameNote(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50"
                />
              </div>

              {physicalStockInput !== '' && (
                <div className="p-3 bg-cafe-50 rounded-2xl border border-cafe-200/30 font-bold space-y-1">
                  {(() => {
                    const systemVal = selectedOpnameIngredient.stockLevel;
                    const physicalVal = parseFloat(physicalStockInput) || 0;
                    const discrepancy = physicalVal - systemVal;
                    const discrepancyCost = discrepancy * (selectedOpnameIngredient.costPerUnit || 0);

                    if (discrepancy === 0) {
                      return (
                        <div className="text-green-600 text-[10px] text-center font-bold">
                          Stok Fisik Sesuai dengan Sistem
                        </div>
                      );
                    } else if (discrepancy > 0) {
                      return (
                        <div className="text-green-650 text-[10px] space-y-0.5 font-bold">
                          <div className="flex justify-between">
                            <span>Kelebihan:</span>
                            <span>+{discrepancy} {selectedOpnameIngredient.unit}</span>
                          </div>
                          <div className="flex justify-between text-green-700">
                            <span>Estimasi Nilai:</span>
                            <span>+Rp {discrepancyCost.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-red-650 text-[10px] space-y-0.5 font-bold">
                          <div className="flex justify-between">
                            <span>Kekurangan:</span>
                            <span>{discrepancy} {selectedOpnameIngredient.unit}</span>
                          </div>
                          <div className="flex justify-between text-red-700">
                            <span>Estimasi Kerugian:</span>
                            <span>-Rp {Math.abs(discrepancyCost).toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-espresso-900 text-white rounded-xl text-xs font-bold active:scale-95 shadow-sm"
              >
                Simpan Audit Opname
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL 4: OWNER BUSINESS PRICING & HPP SETTINGS */}
      {isBusinessOpen && selectedBusinessProduct && (
        <div className="fixed inset-0 bg-cafe-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-premium relative animate-scale-up border border-cafe-100">
            <div className="flex justify-between items-center pb-3 border-b border-cafe-100 mb-4">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-espresso-900 text-base">Edit Product Config</h3>
                <p className="text-[9px] text-on-surface-variant uppercase font-extrabold">HPP Manual & Harga Jual</p>
              </div>
              <button 
                onClick={() => setIsBusinessOpen(false)}
                className="p-1.5 rounded-lg bg-cafe-50 text-cafe-400 hover:text-cafe-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBusinessSettings} className="space-y-4 text-xs font-semibold text-cafe-700">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Nama Menu</label>
                <div className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 bg-cafe-100 text-espresso-900 text-xs font-extrabold">
                  {selectedBusinessProduct.name}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Harga Jual POS (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="35000"
                  value={sellingPriceInput}
                  onChange={(e) => setSellingPriceInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none focus:border-earth-olive bg-cafe-50/50 font-extrabold text-espresso-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">HPP Manual Override (Rp)</label>
                <input
                  type="number"
                  placeholder="Kosongkan untuk otomatis resep"
                  value={manualHppInput}
                  onChange={(e) => setManualHppInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none bg-cafe-50/50 font-bold"
                />
                <span className="text-[9px] text-on-surface-variant font-normal block mt-0.5">
                  Recipe HPP: Rp {calculateRecipeHPP(selectedBusinessProduct.recipe).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Biaya Operasional/Porsi (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 1500"
                  value={opCostInput}
                  onChange={(e) => setOpCostInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-cafe-200 text-xs focus:outline-none bg-cafe-50/50 font-bold"
                />
              </div>

              {sellingPriceInput !== '' && (
                <div className="p-3 bg-earth-olive/5 border border-earth-olive/10 rounded-2xl space-y-1.5 text-[10px] font-bold text-on-surface-variant">
                  {(() => {
                    const price = parseFloat(sellingPriceInput) || 0;
                    const recipeCost = calculateRecipeHPP(selectedBusinessProduct.recipe);
                    const hpp = manualHppInput !== '' ? parseFloat(manualHppInput) : recipeCost;
                    const op = parseFloat(opCostInput) || 0;
                    const totalCost = hpp + op;
                    const netProfit = price - totalCost;
                    const netMargin = price > 0 ? (netProfit / price * 100) : 0;

                    let advice = '';
                    let adviceColor = '';
                    if (netMargin >= 65) {
                      advice = 'Sangat Sehat & Menguntungkan (Ideal)';
                      adviceColor = 'text-green-600';
                    } else if (netMargin >= 40) {
                      advice = 'Sehat & Sesuai Standard F&B';
                      adviceColor = 'text-earth-olive';
                    } else {
                      advice = 'Margin Kritis! Disarankan menaikkan harga jual.';
                      adviceColor = 'text-red-650';
                    }

                    return (
                      <>
                        <div className="flex justify-between">
                          <span>Total Cost (HPP + Ops):</span>
                          <span className="text-espresso-900">Rp {totalCost.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Net Profit:</span>
                          <span className="text-earth-olive">Rp {netProfit.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Net Margin:</span>
                          <span className="text-earth-olive">{netMargin.toFixed(1)}% Laba</span>
                        </div>
                        <hr className="border-cafe-200/50 my-1" />
                        <div className={`text-center font-extrabold ${adviceColor} text-[9px] uppercase tracking-wide`}>
                          {advice}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-espresso-900 text-white rounded-xl text-xs font-bold active:scale-95 shadow-sm"
              >
                Simpan Config Bisnis
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
