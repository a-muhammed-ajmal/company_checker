# Company Checker

> **Instant company verification system** for validating company status across multiple databases with real-time search and priority-based results.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Supabase](https://img.shields.io/badge/Database-Supabase-green)](https://supabase.com)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org)

---

## 🎯 Overview

Company Checker is a Progressive Web App (PWA) that instantly verifies company status by searching across 7 Supabase database tables, providing real-time results with intelligent priority sorting:

- **🔴 DELISTED** - Companies with suspended/delisted status
- **🟢 TML (Trade Mark List)** - Approved employers (EIB, ENBD, Payroll, Credit Card)
- **🔵 GOOD LISTED** - Verified corporate status companies
- **⚪ NOT LISTED** - Companies not found in any database

## ✨ Features

### Core Functionality
- ⚡ **Real-time Search** - Instant company verification across 7 tables
- 🎯 **Priority-Based Results** - DELISTED > TML > GOOD > NOT LISTED
- 🔍 **Fuzzy Matching** - Smart name normalization and match scoring
- 📱 **PWA Support** - Install as mobile/desktop app with offline caching
- 🌐 **Offline Detection** - Visual indicator when network is unavailable

### Performance & Security
- 🚀 **Hybrid Caching** - 5-minute memory cache + 24-hour localStorage
- 🔒 **Input Sanitization** - XSS/injection attack prevention
- ⏱️ **Loading Timeout** - 10-second protection against hanging requests
- 🛡️ **Environment Variables** - Secure credential management
- 📊 **Optimized Queries** - GIN trigram indexes for fast ILIKE searches

### User Experience
- 🌙 **Dark Mode** - Automatic theme detection
- 📱 **Mobile-First Design** - Responsive UI optimized for mobile
- ♿ **Accessibility** - WCAG compliant with semantic HTML
- 🎨 **Modern UI** - Clean design with Tailwind CSS + shadcn/ui

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite 5 |
| **Styling** | Tailwind CSS 3.4 + shadcn/ui |
| **Database** | Supabase (PostgreSQL) |
| **State Management** | React Hooks |
| **PWA** | Vite PWA Plugin + Workbox |
| **Icons** | Lucide React |
| **Hosting** | Vercel (recommended) |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account with database access
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/company_checker.git
cd company_checker

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your Supabase credentials to .env
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Environment Variables

Create a `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **⚠️ Important:** The application will not start without these environment variables.

### Database Setup

Run the following SQL scripts in your **Supabase SQL Editor**:

1. **Row-Level Security (RLS)**
   ```bash
   scripts/01_enable_row_level_security.sql
   ```

2. **Performance Indexes**
   ```bash
   scripts/02_create_performance_indexes.sql
   ```

3. **Database Linter Fixes** (Optional but recommended)
   ```bash
   scripts/04_fix_function_search_path.sql
   scripts/05_fix_duplicate_policies.sql
   scripts/06_remove_unused_indexes.sql
   ```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📦 Database Schema

The application searches across 7 tables with the following priority:

| Table Name | Type | Priority | Description |
|------------|------|----------|-------------|
| `delisted_company_1` | DELISTED | 1 | Suspended employers (Jan 2008+) |
| `delisted_company_2` | DELISTED | 2 | Suspended employers (Jul 2002 - Dec 2007) |
| `eib_approved` | TML | 3 | EIB Approved Employers |
| `enbd_approved` | TML | 4 | ENBD Approved Employers |
| `payroll_approved` | TML | 5 | Payroll Employers |
| `credit_card_approved` | TML | 6 | Credit Card Approved Employers |
| `good_listed` | GOOD | 7 | Verified Corporate Status |

### Required Database Columns

Each table must have:
- `id` (UUID, primary key)
- `company_name` or `employer_name` (text)
- `created_at` (timestamp)

---

## 🌐 Deployment

### Deploy to Vercel

1. **Connect Repository**
   - Import your GitHub repository to Vercel
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Set Environment Variables**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Deploy**
   ```bash
   git push origin main
   ```

### Manual Deployment

```bash
# Build production bundle
npm run build

# Deploy dist/ folder to your hosting provider
```

---

## 📖 Usage

### Basic Search

1. Enter company name in the search bar
2. Click **Search** or press `Enter`
3. View results sorted by priority (DELISTED first)
4. Click on a result to see detailed information

### Advanced Features

- **Refresh Database**: Force refresh cache to get latest data
- **Offline Mode**: App works offline with cached results
- **PWA Installation**: Install as desktop/mobile app from browser menu

### Search Algorithm

The app uses intelligent fuzzy matching:

1. **Text Normalization**: Removes special characters, entity types (LLC, FZE)
2. **Match Scoring**:
   - 100 = Exact match
   - 85 = Substring match
   - 0-100 = Token-based match percentage
3. **Threshold**: Results with score < 40 are filtered out
4. **Deduplication**: If same company appears in multiple lists, DELISTED is shown first

---

## 🔒 Security

### Implemented Security Measures

- ✅ **Environment Variables**: No hardcoded credentials
- ✅ **Input Sanitization**: Prevents XSS/SQL injection
- ✅ **RLS (Row-Level Security)**: Database-level access control
- ✅ **Secure Headers**: CSP and HTTPS enforcement
- ✅ **Production Build**: Minified, no source maps in production

### Security Best Practices

1. Never commit `.env` file to Git
2. Rotate Supabase keys regularly
3. Enable RLS on all database tables
4. Use HTTPS in production
5. Keep dependencies updated

---

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Build production (validates TypeScript)
npm run build
```

### Manual Testing Checklist

- [ ] Search for known company names
- [ ] Test offline mode (DevTools → Network → Offline)
- [ ] Verify caching (search same query twice)
- [ ] Test on mobile device
- [ ] Verify PWA installation works

---

## 📁 Project Structure

```
company_checker/
├── src/
│   ├── components/         # React components
│   │   ├── cards/          # Result cards (Delisted, TML, Good, NotListed)
│   │   ├── ui/             # shadcn/ui components
│   │   ├── SearchBar.tsx   # Search input component
│   │   └── SuggestionList.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useSearch.ts    # Search logic with timeout
│   │   └── useNetworkStatus.ts
│   ├── services/           # API services
│   │   └── api.ts          # Supabase search logic
│   ├── utils/              # Utilities
│   │   └── cache.ts        # Caching system
│   ├── App.tsx             # Main app component
│   ├── constants.ts        # Environment variables
│   └── types.ts            # TypeScript definitions
├── scripts/                # SQL setup scripts
│   ├── 01_enable_row_level_security.sql
│   ├── 02_create_performance_indexes.sql
│   ├── 04_fix_function_search_path.sql
│   ├── 05_fix_duplicate_policies.sql
│   └── 06_remove_unused_indexes.sql
├── public/                 # Static assets
├── .env.example            # Environment template
├── DEPLOYMENT_GUIDE.md     # Deployment documentation
└── README.md               # This file
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use semantic commit messages
- Add comments for complex logic
- Test on multiple devices before PR

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Muhammed Ajmal**
[LinkedIn](https://www.linkedin.com/in/muhammed-ajmal-consultant/) | [GitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend and database
- [shadcn/ui](https://ui.shadcn.com) - UI components
- [Lucide](https://lucide.dev) - Icon library
- [Vite](https://vitejs.dev) - Build tool

---

## 📞 Support

For issues and questions:
- 📧 Email: [your.email@example.com](mailto:your.email@example.com)
- 💬 GitHub Issues: [Create an issue](https://github.com/yourusername/company_checker/issues)
- 📚 Documentation: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

<p align="center">
  <strong>Database Last Updated:</strong> January 15, 2026
</p>

<p align="center">
  Made with ❤️ by Muhammed Ajmal
</p>
