import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Coins,
  Globe,
  DollarSign,
  Briefcase,
  HelpCircle,
  FileSpreadsheet,
  LogOut,
  RefreshCw,
  ExternalLink,
  Lock,
} from 'lucide-react';

import { Transaction, CurrencyType, CURRENCY_CONFIGS } from './types';
import { INITIAL_TRANSACTIONS, convertCurrency } from './data';
import MetricCard from './components/MetricCard';
import QuickEntry from './components/QuickEntry';
import AnalyticsCharts from './components/AnalyticsCharts';
import TransactionList from './components/TransactionList';
import TransactionModal from './components/TransactionModal';

// Firebase & Google Sheets helper imports
import { initAuth, googleSignIn, logout } from './lib/firebase';
import {
  fetchGoogleSheetTransactions,
  addTransactionToGoogleSheet,
  updateTransactionInGoogleSheet,
  deleteTransactionFromGoogleSheet,
  SPREADSHEET_ID,
  SHEET_NAME,
} from './lib/googleSheets';

export default function App() {
  // Load initial transactions from localStorage if present, else use default data
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('SO_THU_CHI_TRANSACTIONS');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved transactions, loading defaults');
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  // Active view currency (defaults to VND as preferred)
  const [activeCurrency, setActiveCurrency] = useState<CurrencyType>(() => {
    const saved = localStorage.getItem('SO_THU_CHI_ACTIVE_CURRENCY');
    return (saved as CurrencyType) || 'VND';
  });

  // Selected month filter (default to current month based on data and current local time 2026-07)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date();
    // Default to '2026-07' to show the rich seeded mock data instantly
    return '2026-07';
  });

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Custom delete confirmation control
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Google Sheets Authentication & Loading state
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);
  const [sheetStatus, setSheetStatus] = useState<{ type: 'success' | 'error' | 'info' | null; message: string }>({ type: null, message: '' });

  // Sync transactions to localStorage on change
  useEffect(() => {
    localStorage.setItem('SO_THU_CHI_TRANSACTIONS', JSON.stringify(transactions));
  }, [transactions]);

  // Sync active currency to localStorage
  useEffect(() => {
    localStorage.setItem('SO_THU_CHI_ACTIVE_CURRENCY', activeCurrency);
  }, [activeCurrency]);

  // Listen for Google OAuth / Firebase auth changes
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setSheetStatus({ type: 'info', message: 'Đang mở cửa sổ đăng nhập Google...' });
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setSheetStatus({ type: 'success', message: `Đã kết nối thành công tài khoản Google: ${result.user.email}` });
      }
    } catch (err: any) {
      console.error(err);
      setSheetStatus({ type: 'error', message: `Đăng nhập thất bại: ${err.message || err}` });
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setSheetStatus({ type: 'info', message: 'Đã ngắt kết nối tài khoản Google.' });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleLoadSheetData = async (appendMode: boolean) => {
    if (!token) {
      setSheetStatus({ type: 'error', message: 'Vui lòng kết nối Google trước khi tải dữ liệu.' });
      return;
    }

    setIsLoadingSheet(true);
    setSheetStatus({ type: 'info', message: 'Đang kết nối API Google Sheets và đọc bảng tính...' });

    try {
      const sheetTxs = await fetchGoogleSheetTransactions(token);
      
      if (sheetTxs.length === 0) {
        setSheetStatus({ type: 'error', message: `Không tìm thấy dòng dữ liệu hợp lệ nào trong tab "${SHEET_NAME}".` });
        setIsLoadingSheet(false);
        return;
      }

      if (appendMode) {
        // Append mode: avoid adding duplicate IDs if we run sync multiple times
        setTransactions((prev) => {
          const existingIds = new Set(prev.map(t => t.id));
          const filteredNew = sheetTxs.filter(t => !existingIds.has(t.id));
          return [...filteredNew, ...prev];
        });
        setSheetStatus({
          type: 'success',
          message: `Đồng bộ thành công! Đã gộp thêm ${sheetTxs.length} dòng giao dịch từ Google Sheet.`
        });
      } else {
        // Replace mode
        setTransactions(sheetTxs);
        setSheetStatus({
          type: 'success',
          message: `Đồng bộ thành công! Đã tải mới toàn bộ ${sheetTxs.length} giao dịch từ Google Sheet.`
        });
      }

      // Automatically change selectedMonth to the latest month in the fetched sheet
      if (sheetTxs.length > 0) {
        const sortedDates = [...sheetTxs].sort((a, b) => b.date.localeCompare(a.date));
        const latestMonth = sortedDates[0].date.substring(0, 7); // e.g. "2026-07"
        setSelectedMonth(latestMonth);
      }
    } catch (err: any) {
      console.error(err);
      setSheetStatus({
        type: 'error',
        message: `Lỗi kết nối bảng tính: ${err.message || err}. Đảm bảo bạn có quyền xem liên kết spreadsheet.`
      });
    } finally {
      setIsLoadingSheet(false);
    }
  };

  // Calculations for dashboard (converted to the active view currency)
  // Overall Balance (Lifetime)
  const totalBalance = transactions.reduce((sum, tx) => {
    const amountInActive = convertCurrency(tx.amount, tx.currency, activeCurrency);
    if (tx.type === 'INCOME') {
      return sum + amountInActive;
    } else {
      return sum - amountInActive;
    }
  }, 0);

  // Selected Month Incomes
  const monthIncome = transactions
    .filter((tx) => tx.type === 'INCOME' && tx.date.startsWith(selectedMonth))
    .reduce((sum, tx) => sum + convertCurrency(tx.amount, tx.currency, activeCurrency), 0);

  // Selected Month Expenses
  const monthExpense = transactions
    .filter((tx) => tx.type === 'EXPENSE' && tx.date.startsWith(selectedMonth))
    .reduce((sum, tx) => sum + convertCurrency(tx.amount, tx.currency, activeCurrency), 0);

  // Handler to add or edit a transaction
  const handleSaveTransaction = async (savedTx: Omit<Transaction, 'id'> & { id?: string }) => {
    if (savedTx.id) {
      // Edit mode
      // Optimistic update local state
      setTransactions((prev) =>
        prev.map((t) => (t.id === savedTx.id ? { ...t, ...savedTx } : t))
      );

      if (token) {
        if (savedTx.id.startsWith('sheet-')) {
          setSheetStatus({ type: 'info', message: 'Đang cập nhật thay đổi lên Google Sheets...' });
          try {
            await updateTransactionInGoogleSheet(token, savedTx.id, savedTx);
            setSheetStatus({ type: 'success', message: 'Đã cập nhật giao dịch thành công lên Google Sheets!' });
          } catch (err: any) {
            console.error(err);
            setSheetStatus({ type: 'error', message: `Lỗi khi cập nhật Google Sheets: ${err.message || err}` });
          }
        } else {
          // This is a local transaction, append as new row and upgrade ID
          setSheetStatus({ type: 'info', message: 'Đang lưu giao dịch cũ lên Google Sheets...' });
          try {
            const assignedId = await addTransactionToGoogleSheet(token, savedTx);
            setTransactions((prev) =>
              prev.map((t) => (t.id === savedTx.id ? { ...t, ...savedTx, id: assignedId } : t))
            );
            setSheetStatus({ type: 'success', message: 'Đã lưu giao dịch lên Google Sheets và nâng cấp liên kết!' });
          } catch (err: any) {
            console.error(err);
            setSheetStatus({ type: 'error', message: `Lỗi khi lưu lên Google Sheets: ${err.message || err}` });
          }
        }
      }
    } else {
      // Add mode
      if (token) {
        setSheetStatus({ type: 'info', message: 'Đang lưu giao dịch mới lên Google Sheets...' });
        try {
          const assignedId = await addTransactionToGoogleSheet(token, savedTx);
          const newTx: Transaction = {
            ...savedTx,
            id: assignedId,
          };
          setTransactions((prev) => [newTx, ...prev]);
          setSheetStatus({ type: 'success', message: 'Đã thêm giao dịch thành công lên Google Sheets!' });
        } catch (err: any) {
          console.error(err);
          setSheetStatus({ type: 'error', message: `Lỗi khi thêm lên Google Sheets: ${err.message || err}` });
          // Fallback to local
          const newTx: Transaction = {
            ...savedTx,
            id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          };
          setTransactions((prev) => [newTx, ...prev]);
        }
      } else {
        // Local only
        const newTx: Transaction = {
          ...savedTx,
          id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        };
        setTransactions((prev) => [newTx, ...prev]);
      }
    }
  };

  // Handler to delete a transaction (opens our beautiful iframe-safe confirm modal)
  const handleDeleteTransaction = (id: string) => {
    setDeleteConfirmId(id);
  };

  // The actual execution triggered after the user clicks confirm
  const confirmDeleteTransaction = async () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null);

    // Optimistic update
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    if (token && id.startsWith('sheet-')) {
      setSheetStatus({ type: 'info', message: 'Đang xóa giao dịch khỏi Google Sheets...' });
      try {
        await deleteTransactionFromGoogleSheet(token, id);
        setSheetStatus({ type: 'success', message: 'Đã xóa giao dịch thành công khỏi Google Sheets!' });
      } catch (err: any) {
        console.error(err);
        setSheetStatus({ type: 'error', message: `Lỗi khi xóa khỏi Google Sheets: ${err.message || err}` });
      }
    }
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Dynamic Grid Background Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] pointer-events-none opacity-25 h-[600px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header Navigation Panel */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-xs">
              <Coins className="h-5.5 w-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                  Sổ Thu Chi
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-md uppercase tracking-wider">
                  High Density
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Quản lý ngân sách đa tiền tệ thông minh và xuất bản báo cáo thuyết trình
              </p>
            </div>
          </div>

          {/* Controls: Currency switcher & Add entry */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Currency switcher selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center">
                {(['VND', 'AED', 'USD', 'GEL'] as CurrencyType[]).map((cur) => {
                  const isActive = activeCurrency === cur;
                  return (
                    <button
                      key={cur}
                      id={`currency-switcher-${cur}`}
                      onClick={() => setActiveCurrency(cur)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-md cursor-pointer transition-all ${
                        isActive
                          ? 'bg-white text-slate-800 dark:bg-slate-700 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-600/50'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      {cur}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add manually button */}
            <button
              id="btn-add-transaction-manual"
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md text-xs shadow-sm cursor-pointer transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Ghi Khoản Mới
            </button>
          </div>
        </header>

        {/* GOOGLE SHEETS SYNC PANEL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  Đồng bộ Google Sheet: <span className="text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold">{SHEET_NAME}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Đọc dữ liệu trực tiếp từ file Google Sheets của bạn. Cột In là Thu, Out là Chi (đơn vị AED).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <a
                href={`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`}
                target="_blank"
                referrerPolicy="no-referrer"
                className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition"
              >
                <span>Mở bảng tính</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Connection State / Actions */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {!user ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Lock className="h-4 w-4 text-amber-500" />
                  <span>Yêu cầu đăng nhập tài khoản Google để cấp quyền đọc dữ liệu.</span>
                </div>
                <button
                  onClick={handleGoogleLogin}
                  className="gsi-material-button flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm cursor-pointer transition-all duration-150"
                >
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>Kết nối với Google Sheets</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                {/* User profile & details */}
                <div className="flex items-center gap-2.5">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{user.displayName}</p>
                    <p className="text-[10px] text-slate-400">{user.email}</p>
                  </div>
                  <button
                    onClick={handleGoogleLogout}
                    title="Ngắt kết nối"
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 transition cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>

                {/* Loading actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleLoadSheetData(false)}
                    disabled={isLoadingSheet}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-bold rounded-lg text-xs cursor-pointer transition disabled:cursor-not-allowed"
                  >
                    {isLoadingSheet ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    <span>Tải dữ liệu mới (Ghi đè)</span>
                  </button>

                  <button
                    onClick={() => handleLoadSheetData(true)}
                    disabled={isLoadingSheet}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:bg-slate-100 text-xs font-bold rounded-lg cursor-pointer transition disabled:cursor-not-allowed"
                  >
                    <span>Gộp thêm dữ liệu</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sync Status Banner */}
          {sheetStatus.type && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                sheetStatus.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30'
                  : sheetStatus.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 border border-rose-100 dark:border-rose-900/30'
                  : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50'
              }`}
            >
              <div className="mt-0.5 font-bold">
                {sheetStatus.type === 'success' ? '✓' : sheetStatus.type === 'error' ? '⚠' : 'ℹ'}
              </div>
              <p className="flex-1 font-semibold">{sheetStatus.message}</p>
            </motion.div>
          )}
        </div>

        {/* SECTION 1: Metrics Overview (AED, VND, USD responsive view) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            id="metric-card-balance"
            title="Số Dư Tích Lũy (Tổng)"
            amount={totalBalance}
            currency={activeCurrency}
            type="balance"
          />
          <MetricCard
            id="metric-card-income"
            title={`Tổng Thu Tháng ${selectedMonth.substring(5)}`}
            amount={monthIncome}
            currency={activeCurrency}
            type="income"
          />
          <MetricCard
            id="metric-card-expense"
            title={`Tổng Chi Tháng ${selectedMonth.substring(5)}`}
            amount={monthExpense}
            currency={activeCurrency}
            type="expense"
          />
        </div>

        {/* SECTION 2: Quick templates additions */}
        <QuickEntry id="quick-entry-panel" activeCurrency={activeCurrency} onAddTransaction={handleSaveTransaction} />

        {/* SECTION 3: Visual monthly and categories analysis graphs */}
        <AnalyticsCharts
          id="analytics-charts-panel"
          transactions={transactions}
          activeCurrency={activeCurrency}
          selectedMonth={selectedMonth}
        />

        {/* SECTION 4: Detailed Transaction Ledger */}
        <TransactionList
          id="transaction-list-panel"
          transactions={transactions}
          activeCurrency={activeCurrency}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteTransaction}
        />

        {/* Pop-up Dialog for Add & Edit details */}
        <TransactionModal
          id="transaction-modal-dialog"
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTransaction}
          editingTransaction={editingTransaction}
          activeCurrency={activeCurrency}
        />

        {/* Custom Confirmation Modal for Deletion */}
        <AnimatePresence>
          {deleteConfirmId && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              {/* Overlay background */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteConfirmId(null)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />
              
              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl p-6 text-slate-800 dark:text-slate-100 overflow-hidden"
              >
                {/* Header with warning styling */}
                <div className="flex items-center gap-3 text-rose-500 dark:text-rose-400 mb-4">
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold">Xác nhận xóa ghi chép</h3>
                </div>

                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  Bạn có thật sự muốn xóa khoản ghi chép này không?
                </p>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={confirmDeleteTransaction}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer transition-colors"
                  >
                    Xác nhận xóa
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative footer */}
      <footer className="text-center text-slate-400 text-xs py-10 border-t border-slate-200 dark:border-slate-800/40">
        <p>© 2026 Sổ Thu Chi. Thiết kế giao diện tài chính đa tiền tệ chuyên nghiệp.</p>
        <p className="mt-1 text-[11px] text-slate-400/80">
          * Giao diện hỗ trợ quy đổi tỷ giá thời gian thực giữa <strong>VND</strong>, <strong>AED</strong>, và <strong>USD</strong>.
        </p>
      </footer>
    </div>
  );
}
