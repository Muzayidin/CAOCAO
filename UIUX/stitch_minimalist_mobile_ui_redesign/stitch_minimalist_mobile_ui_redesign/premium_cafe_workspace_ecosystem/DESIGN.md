---
name: Premium Cafe Workspace Ecosystem
colors:
  surface: '#fdf8f7'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3f1'
  surface-container: '#f1edec'
  surface-container-high: '#ece7e6'
  surface-container-highest: '#e6e1e0'
  on-surface: '#1c1b1b'
  on-surface-variant: '#4d4541'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#7f7570'
  outline-variant: '#d0c4be'
  surface-tint: '#635d5a'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1f1b19'
  on-primary-container: '#8a827f'
  inverse-primary: '#cec5c1'
  secondary: '#5a632e'
  on-secondary: '#ffffff'
  secondary-container: '#dce5a3'
  on-secondary-container: '#5f6732'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c1c'
  on-tertiary-container: '#838484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#eae1dd'
  primary-fixed-dim: '#cec5c1'
  on-primary-fixed: '#1f1b19'
  on-primary-fixed-variant: '#4b4643'
  secondary-fixed: '#dfe8a6'
  secondary-fixed-dim: '#c3cc8c'
  on-secondary-fixed: '#191e00'
  on-secondary-fixed-variant: '#434b18'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#fdf8f7'
  on-background: '#1c1b1b'
  surface-variant: '#e6e1e0'
  espresso-900: '#1A1614'
  cafe-50: '#F9F8F7'
  cafe-200: '#E5E1DE'
  earth-olive: '#4B5320'
  charcoal-text: '#121212'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  touch-target-min: 48px
  touch-target-opt: 52px
  gutter: 1.5rem
  margin-mobile: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
---

# POS CAOCAO: MASTER DESIGN SPECIFICATION
## Comprehensive UI/UX, Responsive Viewports, State Management, and Architecture Design

Dokumen ini merupakan panduan spesifikasi desain terpadu (Master Design Specification) untuk aplikasi **POS CAOCAO** (Premium Cafe Workspace Ecosystem). POS CAOCAO adalah sistem Point of Sale (POS) multi-tenant premium yang dirancang khusus untuk Food & Beverage (F&B) dengan optimasi tiga jenis *viewport*, sistem otomatisasi resep (BOM), Kitchen & Bar Display Systems (KDS) real-time, manajemen absensi geofencing GPS, pembukuan keuangan (PnL), payroll karyawan, serta ketahanan operasional offline penuh.

---

## PRINSIP DESAIN GLOBAL & TOKEN ESTETIKA
Untuk menghadirkan pengalaman visual premium yang selaras dengan kafe kelas atas, POS CAOCAO menerapkan prinsip estetika modern netral hangat dengan panduan gaya berikut:
*   **Warm Neutral Palette**: Dominasi warna cokelat espresso pekat (`bg-cafe-900`), abu-abu cafe lembut (`bg-cafe-50`), teks arang hitam solid (`text-cafe-900`), aksen hijau zaitun pekat (`text-earth-olive` / `bg-earth-olive`), dan latar belakang putih bersih (`bg-white`).
*   **No Gold Gradients**: Menghindari penggunaan gradasi emas atau warna emas imitasi agar tampilan tetap elegan, kontemporer, dan bersahaja.
*   **Elevated Components**: Penerapan sudut membulat lebar (`rounded-3xl` / `rounded-2xl`), bayangan melayang yang lembut (`shadow-premium` / `shadow-sm`), batas transparan ultra-tipis (`border-cafe-200/50`), dan lapisan buram blur di latar belakang (`backdrop-blur-sm`).
*   **Micro-Animations**: Transisi skala dinamis (`active:scale-95 transition-all`), efek transisi sorot warna (`hover:bg-cafe-800 hover:text-white`), efek denyut (`animate-pulse`), dan visual pemuatan khusus.
*   **Touch Targets**: Jaminan tap-target minimal **48x48 piksel** (dioptimalkan ke **52px** atau lebih pada seluler/tablet) untuk kenyamanan penuh jari waiter dan barista saat bekerja cepat.
