# Company Checker - Design System

## 🎨 Design Philosophy

High-contrast, mobile-first design system focused on clarity, trust, and speed. Uses a "clean slate" aesthetic with vibrant primary accents.

---

## 🅰️ Typography

**Font Family:** `Inter` / System Sans-serif

### Scale & Hierarchy

| Role | Size (Mobile/Desktop) | Weight | Tailwind | Usage |
|------|----------------------|--------|----------|-------|
| **Hero Title** | 30px / 36px | Black (900) | `text-3xl md:text-4xl font-black` | App Header |
| **Subtitle** | 14px | Semibold (600) | `text-sm font-semibold` | Under App Header |
| **Card Title** | 14px | Semibold (600) | `text-sm font-semibold` | Company Name |
| **Body** | 12px | Medium (500) | `text-xs font-medium` | Descriptions, metadata |
| **Caps Label** | 12px | Bold (700) | `text-xs font-bold uppercase` | Section headers |
| **Badge** | 10px | Bold (700) | `text-[10px] font-bold uppercase` | Status chips |

---

## 🎨 Color Palette

### Neutrals (Slate)
Used for text, borders, and backgrounds to create a crisp, technical look.

| Name | Hex | Usage |
|------|-----|-------|
| `slate-900` | `#0f172a` | Primary Text, Dark Mode Bg |
| `slate-600` | `#475569` | Secondary Text |
| `slate-400` | `#94a3b8` | Placeholders, Icons |
| `slate-200` | `#e2e8f0` | Borders |
| `slate-50`  | `#f8fafc` | Input Backgrounds |
| `white`     | `#ffffff` | Card Backgrounds |

### Primary (Blue)
Represents trust, verification, and actions.

| Name | Hex | Usage |
|------|-----|-------|
| `blue-600` | `#2563eb` | Primary Buttons, Active States |
| `blue-500` | `#3b82f6` | Icons, Focus Rings |
| `blue-50`  | `#eff6ff` | Hover backgrounds |

### Status Colors
| Status | Color | Bg | Border | Meaning |
|--------|-------|----|--------|---------|
| **DELISTED** | `red-700` | `red-100` | `red-200` | Danger, Warning |
| **TML** | `green-700` | `green-100` | `green-200` | Approved, Safe |
| **GOOD** | `blue-700` | `blue-100` | `blue-200` | Verified Corporate |
| **OFFLINE** | `yellow-800` | `yellow-50` | `yellow-200` | Network Issue |

---

## 📐 Layout & Spacing

### Mobile-First Grid
Base unit: **4px**

- **Container:** `max-w-sm` (384px) - Optimized for single-hand use
- **Borders:** `rounded-xl` (12px) and `rounded-2xl` (16px) for friendly feel
- **Padding:**
  - Screen: `p-4`
  - Cards: `p-6`
  - List Items: `px-5 py-4`
- **Gap:**
  - Section: `mb-8`
  - Elements: `gap-3`

---

## 🧱 Components

### 1. Cards
- **Background:** White
- **Border:** `1px solid slate-100`
- **Shadow:** `shadow-xl` (Soft, diffused)
- **Radius:** `rounded-2xl`

### 2. Search Bar
- **Height:** 48px+ (Touch friendly)
- **Bg:** `slate-50`
- **Focus:** Blue border + Blue ring (accessibility)
- **Icon:** Left-aligned `slate-400`

### 3. List Items
- **Interactable:** Full width touch target
- **Hover:** `bg-blue-50`
- **Separator:** `divide-y divide-slate-100`
- **Animation:** `animate-scale-in`

### 4. Badges
- **Style:** Flat, pastel background
- **Border:** Thin, darker shade
- **Text:** Uppercase, tracking-wide

---

## ✨ Effects & Animation

### Shadows
- **Card:** `shadow-xl` (`0 20px 25px -5px rgb(0 0 0 / 0.1)`)
- **Icon:** `shadow-lg shadow-blue-500/30` (Glow effect)

### Animations
- **Scale In:** `animate-scale-in` (0.2s ease-out)
- **Spin:** `animate-spin` (Linear infinite)
- **Transitions:** `transition-all duration-200`

---

## 📱 Responsiveness

| Breakpoint | Behavior |
|------------|----------|
| **< 640px** | Full width cards, stack layout |
| **> 640px** | 3xl Title, Centered layout |
| **DarkMode** | Full support (`slate-950` bg) |

---

## 🔮 Future Design Tokens

```css
:root {
  --radius-card: 1rem;
  --radius-input: 0.75rem;
  --color-primary: 37 99 235;
  --font-hero: 'Inter', sans-serif;
}
```
