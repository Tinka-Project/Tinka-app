# Tinka Digital - Entrepreneur Sales Tracker

![Tinka Banner](public/favicon/android-chrome-192x192.png) 
*(A digital companion for entrepreneurs, built for the CochaTech Hackathon 2026 - Fintech Category)*

## 📖 About the Project

Entrepreneurs belonging to the "Tinka" community of Banco FIE often manage their daily sales manually, writing down transactions from their shops and fairs in physical notebooks. This manual practice prevents them from accessing organized data, making data-driven decisions, and projecting their business growth.

**Tinka Digital** is a smart, mobile-first Progressive Web App (PWA) designed to solve this problem. It allows entrepreneurs to easily register their sales, understand their finances through actionable reports, and integrate seamlessly with their digital banking ecosystem. The app features deep dark mode styling, native app-like interactions, and "Zero-Friction" data entry powered by AI voice recognition.

---

## ✨ Features and Functions

The app is divided into several powerful modules designed specifically for micro-entrepreneurs:

### 1. 🎙️ Zero-Friction Sales Entry (AI Voice Input & Manual)
- **Voice Assistant:** Users can hit the floating microphone button and speak naturally (e.g., *"I sold 2 leather wallets for 150 Bs via QR at the fair"*). The simulated AI auto-fills the transaction form (Product, Amount, Payment Method, Location, Category).
- **Manual Entry:** A clean, optimized form for quick manual sales logging.
- Offline support mapping: Transactions can be saved locally if the device has no internet connection.

### 2. 📱 Smart Dashboard
- **Welcome Profile:** Displays the user's current "Digital Formality" level and Tinka Score.
- **Connection Status:** Real-time online/offline indicator.
- **Sales Tracking:** Visual progress bars and columns showing sales categorized by product type, compared against monthly/weekly goals.

### 3. 🏦 Bank Synchronization (Banco FIE Integration)
- **Auto-sync:** Simulates bi-directional synchronization with "BancaMovil FIE".
- **Smart Detection:** Automatically detects incoming transfers and expenses, categorizing them into sales or supplier payments, reducing the burden of manual entries.

### 4. 💱 Integrated QR Payments
- **Dynamic QR Generation:** Instead of just registering a cash sale, entrepreneurs can select "QR" as the payment method, which generates a fully-branded Banco FIE QR code.
- **Web Share API:** Easily share the generated QR code via WhatsApp or generic OS share sheets.

### 5. 📊 BI Insights & Reports
- **Sales Analytics:** Beautiful, interactive charts (using `recharts`) showing total revenue, payment method breakdowns, and chronological sales trends.
- **Export capabilities:** One-click export to PDF or CSV to print reports or share them with accountants.
- **AI Business Intelligence:** Provides actionable advice based on sales patterns (e.g., *"Your sales peak on weekends. Consider stocking up on Fridays."*)

### 6. 🏆 Gamification (Tinka Score)
- A scoring system designed to encourage complete digital formalization.
- Rewards points for achieving sales goals, syncing bank accounts, consistently logging daily sales, and utilizing the QR payment module.

### 7. 🤝 Supplier Management
- **Directory:** Keep track of vital suppliers.
- **Evaluations:** Rate and evaluate supplier performance to make better supply chain decisions over time.

---

## 🏗️ Architecture

The app is structured as a **Single Page Application (SPA)** utilizing modern React patterns and a robust Context API for state management. It embodies an absolute **Mobile-First** approach, replicating an iOS/Android native feel through fluid animations and a Bottom Navigation Bar.

### Key Architectural Patterns:
- **Context API (`AppContext.tsx`):** Centralized state managing user sessions, theme preferences, internet connectivity, and the global transaction registry.
- **Component-Driven Layout:** Modular UI relying on Shadcn/Radix primitives located in `src/app/components/ui`.
- **Progressive Web App (PWA):** Service workers and manifest files allow the app to be "installed" on the user's home screen and function under spotty network conditions (Offline mode).

### File Structure Overview:
```text
src/
├── app/
│   ├── components/      # Feature-specific complex components (VoiceInput, Dashboard, QR, BI)
│   │   ├── auth/        # Login and biometric flows
│   │   ├── banksync/    # Fake bank APIs and sync views
│   │   ├── ui/          # Reusable low-level UI components (Buttons, Modals, Cards)
│   ├── contexts/        # React Context providers (Global State)
│   ├── hooks/           # Custom React hooks (e.g., useOfflineDetection)
│   └── utils/           # Helper functions (Currency formatting, dates)
├── styles/              # Global CSS, Tailwind configurations, fonts
└── main.tsx             # Application entry point
```

---

## 🛠️ Technologies Used

- **Framework:** [React 18](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/) for type safety.
- **Build Tool:** [Vite](https://vitejs.dev/) for extremely fast HMR and optimized builds.
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) for utility-first styling alongside CSS variables for deep Dark Mode theming.
- **UI Components:** [Radix UI](https://www.radix-ui.com/) & Shadcn patterns for completely accessible, unstyled primitives.
- **Animations:** [Motion (Framer Motion)](https://motion.dev/) for fluid layout transitions and micro-interactions.
- **Data Visualization:** [Recharts](https://recharts.org/) for rendering sales metrics and goal tracking.
- **Icons:** [Lucide React](https://lucide.dev/) for clean, consistent iconography.
- **Forms & Validation:** `react-hook-form` handled internally for robust input capture.

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **pnpm**, **yarn**, or **npm** (The project uses a `pnpm-workspace` setup)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Tinka-app
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```
   The application will run locally at `http://localhost:5173`. We highly recommend viewing it on a mobile device emulator in your browser's Developer Tools (e.g., iPhone 14 Pro view) to experience the intended Mobile-First layout.

### Building for Production
To build the optimized PWA for production:
```bash
pnpm build
# or
npm run build
```
This command compiles the React + TS files and outputs the static assets into the `dist/` directory, ready to be served by any static host.

