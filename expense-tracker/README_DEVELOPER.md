# 🛠️ README_DEVELOPER.md — Expense AI Developer Documentation

<div align="center">

![Expense AI](https://img.shields.io/badge/Expense%20AI-v1.0.0-22c55e?style=for-the-badge&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss)

</div>

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Setup & Installation](#setup--installation)
5. [Tailwind CSS Configuration](#tailwind-css-configuration)
6. [API Integration](#api-integration)
7. [State Management](#state-management)
8. [Component Architecture](#component-architecture)
9. [Deployment (Vercel)](#deployment-vercel)
10. [Development Workflow](#development-workflow)
11. [Environment Details](#environment-details)
12. [Future Improvements](#future-improvements)
13. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**Expense AI** is a modern SaaS-style expense tracking dashboard built as an internship assignment project. It features real-time currency conversion, category-wise analytics, and a premium glassmorphism dark UI.

### Core Features
- ✅ Add / Delete expenses with full form validation
- ✅ Category-wise spending breakdown with animated progress bars
- ✅ Live currency conversion (USD → INR, EUR, GBP, JPY) via Frankfurter API
- ✅ Summary panel with total, converted amount, and top category
- ✅ Sort & filter expenses by category and date/amount
- ✅ Animated empty state, loading spinners, error handling
- ✅ Fully responsive — mobile (414px) to desktop (1600px)

---

## 🧰 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.x | UI framework |
| **Vite** | 5.x | Build tool & dev server |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **Framer Motion** | 11.x | Animations & transitions |
| **Axios** | 1.x | HTTP requests to currency API |
| **React Icons** | 5.x | Icon library (MD icons) |
| **PostCSS** | – | Tailwind CSS processing |
| **Autoprefixer** | – | CSS vendor prefixes |

---

## 📁 Project Structure

```
expense-tracker/
│
├── public/                    # Static assets
│   └── vite.svg
│
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── Navbar.jsx         # Sticky glass navbar with logo
│   │   ├── SummaryPanel.jsx   # Hero analytics dashboard panel
│   │   ├── ExpenseForm.jsx    # Add expense form with validation
│   │   ├── ExpenseList.jsx    # Filterable, sortable expense list
│   │   ├── ExpenseCard.jsx    # Individual expense card
│   │   ├── CategoryBreakdown.jsx  # Category progress bars
│   │   ├── CurrencyConverter.jsx  # Live API currency converter
│   │   ├── Loader.jsx         # Animated loading spinner
│   │   └── EmptyState.jsx     # Empty state with illustration
│   │
│   ├── pages/
│   │   └── Home.jsx           # Main dashboard page (layout)
│   │
│   ├── services/
│   │   └── currencyApi.js     # Frankfurter API calls (Axios)
│   │
│   ├── data/
│   │   └── categories.js      # Category config & currency list
│   │
│   ├── App.jsx                # Root component
│   ├── main.jsx               # React DOM entry point
│   └── index.css              # Global styles + Tailwind directives
│
├── index.html                 # HTML template with SEO meta
├── tailwind.config.js         # Tailwind custom config
├── postcss.config.js          # PostCSS config
├── vite.config.js             # Vite config
└── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** `>= 18.x` (LTS recommended)
- **npm** `>= 9.x`
- Internet connection (for API calls and Google Fonts)

### Step-by-Step Installation

```bash
# 1. Clone or navigate to the project directory
cd expense-tracker

# 2. Install all dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

```bash
npm run dev        # Start Vite dev server (hot module reload)
npm run build      # Build production bundle → dist/
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

---

## 🎨 Tailwind CSS Configuration

### Custom Design Tokens (`tailwind.config.js`)

```javascript
// Colors
colors: {
  bg: {
    primary: '#0f172a',    // Deep navy — main background
    secondary: '#1e293b',  // Card backgrounds
    tertiary: '#334155',   // Subtle borders
  },
  accent: {
    green: '#22c55e',      // Primary accent
    red: '#ef4444',        // Danger / delete
    blue: '#3b82f6',       // Currency / secondary
    purple: '#a855f7',     // Category / chart accent
  },
  text: {
    primary: '#f8fafc',    // Main text
    secondary: '#94a3b8',  // Labels
    muted: '#64748b',      // Placeholders, hints
  }
}
```

### Key Utility Classes (Custom)
- `.glass-card` — Glassmorphism card with backdrop-blur
- `.input-field` — Styled form inputs
- `.btn-primary` — Green gradient button
- `.gradient-text` — Green gradient text
- `.progress-bar-track / fill` — Animated progress bars

### Font Setup
Fonts are loaded via Google Fonts CDN in `index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800&display=swap');
```
No additional npm packages needed.

---

## 🌐 API Integration

### Frankfurter API

**Endpoint:** `https://api.frankfurter.app/latest`  
**Method:** `GET`  
**Auth:** None required (free, open API)

**Request:**
```
GET https://api.frankfurter.app/latest?from=USD
```

**Response:**
```json
{
  "amount": 1,
  "base": "USD",
  "date": "2024-01-15",
  "rates": {
    "INR": 83.12,
    "EUR": 0.92,
    "GBP": 0.79,
    "JPY": 148.50
  }
}
```

### Service Layer (`src/services/currencyApi.js`)

```javascript
// Fetch rates — returns { success, rates, base, date } or { success: false, error }
fetchExchangeRates(baseCurrency = 'USD')

// Convert amount between currencies using fetched rates
convertAmount(amount, from, to, rates)
```

### Error Handling Strategy
- API timeout set to **8000ms**
- Network failures → `{ success: false, error: "..." }`
- UI shows a red error banner with the error message
- Refresh button allows manual retry

---

## 🧠 State Management

**No Redux, No Context API.** All state is managed in `Home.jsx` using React hooks, then passed via **props** to child components.

### State in `Home.jsx`

```javascript
const [expenses, setExpenses]                 // Array of expense objects
const [selectedCurrency, setSelectedCurrency] // Current target currency code
const [convertedAmount, setConvertedAmount]   // Converted total (from API)
const [isConverting, setIsConverting]         // Loading state for conversion
```

### Local State in Components

| Component | Local State |
|---|---|
| `ExpenseForm` | `form`, `errors`, `isSubmitting`, `successAnim` |
| `ExpenseList` | `filter`, `sortBy` |
| `CurrencyConverter` | `rates`, `loading`, `error`, `lastUpdated` |

### Data Flow Diagram

```
Home.jsx (main state)
├── SummaryPanel    ← expenses, convertedAmount, selectedCurrency
├── ExpenseForm     → onAddExpense callback
├── ExpenseList     ← expenses, → onDelete callback
├── CategoryBreakdown ← expenses
└── CurrencyConverter ← totalUSD, selectedCurrency
                      → onCurrencyChange, onConvertedAmount
```

---

## 🏗️ Component Architecture

### Component Hierarchy
```
App
└── Navbar
└── Home (state manager)
    ├── SummaryPanel
    ├── ExpenseForm
    ├── ExpenseList
    │   ├── ExpenseCard (×n)
    │   └── EmptyState
    ├── CategoryBreakdown
    └── CurrencyConverter
        └── Loader
```

### Props Contract

**ExpenseCard**
```typescript
{ expense: { id, name, amount, category, date }, onDelete: (id) => void, index: number }
```

**CurrencyConverter**
```typescript
{ totalUSD: number, selectedCurrency: string, onCurrencyChange: (code) => void, onConvertedAmount: (amount) => void }
```

---

## 🚀 Deployment (Vercel)

### Prerequisites
- Vercel account at [vercel.com](https://vercel.com)
- Vercel CLI: `npm install -g vercel`

### Deploy Steps

#### Option A — Vercel CLI
```bash
# Inside expense-tracker/
vercel

# Follow prompts:
# Project name → expense-ai (or your choice)
# Framework preset → Vite
# Build command → npm run build
# Output directory → dist
```

#### Option B — GitHub Integration
1. Push code to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo
4. Vercel auto-detects Vite — click **Deploy**

#### Option C — Manual Build Upload
```bash
npm run build
# Upload dist/ folder to Vercel
```

### Build Settings
| Setting | Value |
|---|---|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node Version | 18.x |

> ⚠️ **No environment variables required** — the Frankfurter API is public and free.

---

## 🔄 Development Workflow

```bash
# Feature development
git checkout -b feature/your-feature-name
# ... make changes ...
npm run dev           # Test locally
git add .
git commit -m "feat: description"
git push origin feature/your-feature-name
# Open PR → merge to main
```

### Code Style Guidelines
- **Component naming:** PascalCase (`ExpenseCard.jsx`)
- **Variable naming:** camelCase (`totalAmount`)
- **CSS classes:** Tailwind utilities + custom `.glass-card` classes
- **Props:** Destructured at component top level
- **Callbacks:** Prefixed with `on` (e.g., `onDelete`, `onAddExpense`)
- **Comments:** JSDoc-style at file top, inline for complex logic

---

## 🖥️ Environment Details

| Detail | Value |
|---|---|
| Node.js | ≥ 18.x (LTS) |
| npm | ≥ 9.x |
| Browser Support | Chrome 90+, Firefox 85+, Edge 90+, Safari 14+ |
| Responsive Breakpoints | `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px` |
| External API | Frankfurter (no API key) |
| External CDN | Google Fonts |

---

## 🔮 Future Improvements

| Priority | Feature | Notes |
|---|---|---|
| 🔴 High | LocalStorage persistence | Save expenses between sessions |
| 🔴 High | Monthly budget setting | Set limits per category |
| 🟡 Medium | Bar/Pie charts | Recharts or Chart.js integration |
| 🟡 Medium | Date range filter | Filter by week, month, year |
| 🟡 Medium | Export to CSV/PDF | Download expense reports |
| 🟢 Low | Multi-currency input | Enter expenses in any currency |
| 🟢 Low | Dark/Light toggle | Theme switcher |
| 🟢 Low | Receipt image upload | OCR-based auto-fill |
| 🟢 Low | User authentication | Firebase / Supabase auth |
| 🟢 Low | Multi-user collaboration | Shared expense groups |

---

## 🔧 Troubleshooting

### ❌ `tailwind classes not applying`
```bash
# Ensure content paths in tailwind.config.js include your src files
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
# Then restart dev server
npm run dev
```

### ❌ `Framer Motion animation not working`
```bash
# Ensure version compatibility
npm install framer-motion@latest
```

### ❌ `Currency API returns no data / CORS error`
The Frankfurter API (`api.frankfurter.app`) supports CORS by default.
- Check internet connection
- Ensure no ad-blocker is blocking the request
- Try the manual "Refresh Rates" button in the UI

### ❌ `Google Fonts not loading`
The fonts are loaded via `@import` in `index.css`. If offline:
- Install fonts locally or use `fontsource` npm packages:
```bash
npm install @fontsource/inter @fontsource/poppins
```
Then import in `main.jsx`:
```javascript
import '@fontsource/inter';
import '@fontsource/poppins';
```

### ❌ `Build fails — PostCSS error`
```bash
# Ensure postcss.config.js exists and has correct format
# Check tailwind.config.js exports default (not module.exports)
```

### ❌ `Port 5173 already in use`
```bash
npm run dev -- --port 3000
```

---

<div align="center">

Made with ❤️ for internship excellence · Powered by React + Vite + Tailwind CSS

</div>
