import { useState } from 'react';
import { Transaction, CurrencyType, CATEGORIES } from '../types';
import { formatCurrencyValue, convertCurrency } from '../data';
import {
  Utensils,
  Coffee,
  Car,
  ShoppingBag,
  Zap,
  Film,
  Coins,
  TrendingUp,
  HelpCircle,
  Calendar,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Store,
  Home,
  Heart,
  BookOpen,
  Phone,
  PlusCircle,
} from 'lucide-react';

const IconMap: Record<string, any> = {
  Utensils,
  Coffee,
  Car,
  ShoppingBag,
  Zap,
  Film,
  Coins,
  TrendingUp,
  HelpCircle,
  Store,
  Home,
  Heart,
  BookOpen,
  Phone,
  PlusCircle,
};

interface TransactionListProps {
  id: string;
  transactions: Transaction[];
  activeCurrency: CurrencyType;
  selectedMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionList({
  id,
  transactions,
  activeCurrency,
  selectedMonth,
  onMonthChange,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [sortOrder, setSortOrder] = useState<'DATE_DESC' | 'DATE_ASC' | 'AMOUNT_DESC' | 'AMOUNT_ASC'>('DATE_DESC');

  // Gather all unique months present in transactions to build a select filter
  const getAvailableMonths = () => {
    const months = new Set<string>();
    // Make sure current month is always present even if empty
    const today = new Date();
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    months.add(currentMonthStr);

    transactions.forEach((tx) => {
      months.add(tx.date.substring(0, 7));
    });

    return Array.from(months).sort((a, b) => b.localeCompare(a)); // Newest first
  };

  const availableMonths = getAvailableMonths();

  // Handle month steps
  const handlePrevMonth = () => {
    const idx = availableMonths.indexOf(selectedMonth);
    if (idx < availableMonths.length - 1) {
      onMonthChange(availableMonths[idx + 1]);
    }
  };

  const handleNextMonth = () => {
    const idx = availableMonths.indexOf(selectedMonth);
    if (idx > 0) {
      onMonthChange(availableMonths[idx - 1]);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions
    .filter((tx) => {
      // 1. Month filter
      const txMonth = tx.date.substring(0, 7);
      if (txMonth !== selectedMonth) return false;

      // 2. Type filter
      if (filterType !== 'ALL' && tx.type !== filterType) return false;

      // 3. Search term filter (search in note, amount, category labels)
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const noteMatch = tx.note.toLowerCase().includes(query);
        const catConfig = CATEGORIES[tx.category];
        const catLabelMatch = catConfig ? catConfig.label.toLowerCase().includes(query) : false;
        const amountMatch = tx.amount.toString().includes(query);
        return noteMatch || catLabelMatch || amountMatch;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort logic
      if (sortOrder === 'DATE_DESC') return b.date.localeCompare(a.date);
      if (sortOrder === 'DATE_ASC') return a.date.localeCompare(b.date);

      // For amount, convert to active currency first to compare fairly
      const amtA = convertCurrency(a.amount, a.currency, activeCurrency);
      const amtB = convertCurrency(b.amount, b.currency, activeCurrency);

      if (sortOrder === 'AMOUNT_DESC') return amtB - amtA;
      return amtA - amtB;
    });

  // Calculate stats for current visible filtered list
  const filteredStats = filteredTransactions.reduce(
    (acc, tx) => {
      const converted = convertCurrency(tx.amount, tx.currency, activeCurrency);
      if (tx.type === 'INCOME') {
        acc.income += converted;
      } else {
        acc.expense += converted;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'shopping':
        return 'bg-pink-50 text-pink-600 border-pink-100 dark:bg-pink-950/20 dark:text-pink-400 dark:border-pink-900/30';
      case 'salary':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'other_income':
        return 'bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/30';
      case 'transport':
        return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
      case 'food':
        return 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
      case 'coffee':
        return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
      case 'phone':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30';
      case 'utilities':
        return 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/30';
      case 'rent':
        return 'bg-cyan-50 text-cyan-600 border-cyan-100 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/30';
      case 'medical':
        return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
      case 'education':
        return 'bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/30';
      case 'entertainment':
        return 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30';
      case 'investment':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'supermarket':
        return 'bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700/50';
    }
  };

  const [yearStr, monthStr] = selectedMonth.split('-');

  return (
    <div id={id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
      {/* Title & Filter bar (High Density Section Header) */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between bg-slate-50/50 dark:bg-slate-900/30 gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Chi Tiết Tháng</h3>
          
          {/* Month Stepper Selector */}
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
            <button
              onClick={handlePrevMonth}
              disabled={availableMonths.indexOf(selectedMonth) === availableMonths.length - 1}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md disabled:opacity-40 cursor-pointer"
              title="Tháng trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest whitespace-nowrap">
              Tháng {monthStr}/{yearStr}
            </span>
            <button
              onClick={handleNextMonth}
              disabled={availableMonths.indexOf(selectedMonth) === 0}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md disabled:opacity-40 cursor-pointer"
              title="Tháng sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            {(['ALL', 'EXPENSE', 'INCOME'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 text-xs font-bold rounded-md cursor-pointer transition-all ${
                  filterType === t
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {t === 'ALL' ? 'Tất cả' : t === 'INCOME' ? 'Thu nhập' : 'Khoản chi'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Internal Padding Wrapper for controls */}
      <div className="p-6 space-y-4">
        {/* Search and Sort controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm theo ghi chú, danh mục hoặc số tiền..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Sort */}
          <div className="relative flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Sắp xếp:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="DATE_DESC">Mới nhất trước</option>
              <option value="DATE_ASC">Cũ nhất trước</option>
              <option value="AMOUNT_DESC">Số tiền giảm dần</option>
              <option value="AMOUNT_ASC">Số tiền tăng dần</option>
            </select>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider h-10">
                <th className="px-6">Ngày</th>
                <th className="px-6">Phân Loại</th>
                <th className="px-6">Ghi chú</th>
                <th className="px-6 text-right">Số tiền gốc</th>
                <th className="px-6 text-right">Quy đổi ({activeCurrency})</th>
                <th className="px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs font-medium">
                    Không tìm thấy giao dịch nào phù hợp
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const catConfig = CATEGORIES[tx.category] || CATEGORIES.others;
                  const convertedAmount = convertCurrency(tx.amount, tx.currency, activeCurrency);
                  const isIncome = tx.type === 'INCOME';

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group h-14 ${
                        isIncome ? 'bg-emerald-50/10 dark:bg-emerald-950/5' : ''
                      }`}
                    >
                      {/* Date */}
                      <td className="px-6 text-xs font-bold text-slate-700 dark:text-slate-300 italic whitespace-nowrap">
                        {tx.date}
                      </td>

                      {/* Category Badge style */}
                      <td className="px-6 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getCategoryBadgeClass(tx.category)}`}>
                          {catConfig.label}
                        </span>
                      </td>

                      {/* Note */}
                      <td className="px-6 text-xs text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                        {tx.note || '-'}
                      </td>

                      {/* Original Amount */}
                      <td className="px-6 text-xs font-bold text-right whitespace-nowrap">
                        <span className={isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}>
                          {isIncome ? '+' : '-'} {formatCurrencyValue(tx.amount, tx.currency)}
                        </span>
                      </td>

                      {/* Converted Amount */}
                      <td className="px-6 text-xs font-bold text-right whitespace-nowrap">
                        <span className={isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {isIncome ? '+' : '-'} {formatCurrencyValue(convertedAmount, activeCurrency)}
                        </span>
                      </td>

                      {/* Action buttons (always clean and scannable, subtle hover transition) */}
                      <td className="px-6 text-center whitespace-nowrap">
                        <div className="flex justify-center items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit(tx)}
                            title="Sửa"
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-500 rounded-lg cursor-pointer transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(tx.id)}
                            title="Xóa"
                            className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded-lg cursor-pointer transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* List Statistics Banner */}
        {filteredTransactions.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Thống kê kết quả hiển thị trên trang ({filteredTransactions.length} mục)
            </span>
            <div className="flex items-center gap-6 font-bold flex-wrap justify-end">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                Tổng Thu: +{formatCurrencyValue(filteredStats.income, activeCurrency)}
              </span>
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                Tổng Chi: -{formatCurrencyValue(filteredStats.expense, activeCurrency)}
              </span>
              <span className={`flex items-center gap-1 border-l pl-6 border-slate-200 dark:border-slate-800 ${
                filteredStats.income - filteredStats.expense >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                Chênh lệch: {formatCurrencyValue(filteredStats.income - filteredStats.expense, activeCurrency)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
