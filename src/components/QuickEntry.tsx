import { Coffee, Utensils, Car, ShoppingBag, Coins, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { Transaction, CurrencyType } from '../types';
import { formatCurrencyValue, convertCurrency } from '../data';

interface QuickTemplate {
  label: string;
  amount: number;
  currency: CurrencyType;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  note: string;
  icon: any;
  color: string;
}

const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    label: 'Cà phê sáng',
    amount: 45000,
    currency: 'VND',
    type: 'EXPENSE',
    category: 'coffee',
    note: 'Cà phê sáng tiện lợi',
    icon: Coffee,
    color: 'from-amber-500/10 to-amber-600/10 border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/15',
  },
  {
    label: 'Ăn trưa',
    amount: 85000,
    currency: 'VND',
    type: 'EXPENSE',
    category: 'food',
    note: 'Cơm trưa văn phòng',
    icon: Utensils,
    color: 'from-orange-500/10 to-orange-600/10 border-orange-200 dark:border-orange-800/30 text-orange-700 dark:text-orange-400 hover:bg-orange-500/15',
  },
  {
    label: 'Taxi / Metro',
    amount: 15,
    currency: 'AED',
    type: 'EXPENSE',
    category: 'transport',
    note: 'Phí di chuyển công việc',
    icon: Car,
    color: 'from-rose-500/10 to-rose-600/10 border-rose-200 dark:border-rose-800/30 text-rose-700 dark:text-rose-400 hover:bg-rose-500/15',
  },
  {
    label: 'Siêu thị nhanh',
    amount: 25,
    currency: 'USD',
    type: 'EXPENSE',
    category: 'shopping',
    note: 'Mua sắm nhu yếu phẩm',
    icon: ShoppingBag,
    color: 'from-pink-500/10 to-pink-600/10 border-pink-200 dark:border-pink-800/30 text-pink-700 dark:text-pink-400 hover:bg-pink-500/15',
  },
  {
    label: 'Lương Freelance',
    amount: 200,
    currency: 'USD',
    type: 'INCOME',
    category: 'salary',
    note: 'Thu nhập làm thêm dự án',
    icon: Coins,
    color: 'from-emerald-500/10 to-emerald-600/10 border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15',
  },
  {
    label: 'Lợi nhuận',
    amount: 100,
    currency: 'AED',
    type: 'INCOME',
    category: 'investment',
    note: 'Cổ tức / Lợi nhuận định kỳ',
    icon: TrendingUp,
    color: 'from-indigo-500/10 to-indigo-600/10 border-indigo-200 dark:border-indigo-800/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/15',
  },
];

interface QuickEntryProps {
  id: string;
  activeCurrency: CurrencyType;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

export default function QuickEntry({ id, activeCurrency, onAddTransaction }: QuickEntryProps) {
  const handleQuickAdd = (template: QuickTemplate) => {
    // Get today's date formatted as YYYY-MM-DD in local timezone
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const localDate = `${year}-${month}-${day}`;

    // Convert template's original amount to the activeCurrency selected by user
    const convertedAmount = convertCurrency(template.amount, template.currency, activeCurrency);

    onAddTransaction({
      type: template.type,
      amount: convertedAmount,
      currency: activeCurrency,
      category: template.category,
      date: localDate,
      note: template.note,
    });
  };

  return (
    <div id={id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Ghi Chép Nhanh</h3>
          <p className="text-xs text-slate-500">Bấm để ghi nhanh các khoản thu chi phổ biến hôm nay theo {activeCurrency}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {QUICK_TEMPLATES.map((template, idx) => {
          const IconComponent = template.icon;
          // Dynamically convert template amount to currently selected currency
          const convertedAmount = convertCurrency(template.amount, template.currency, activeCurrency);

          return (
            <motion.button
              key={idx}
              id={`quick-add-btn-${idx}`}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickAdd(template)}
              className={`flex flex-col items-center justify-between p-3 rounded-xl border bg-gradient-to-b text-center cursor-pointer transition-all duration-150 min-h-[110px] ${template.color}`}
            >
              <div className="p-2 rounded-lg bg-white/60 dark:bg-slate-800/60 mb-2">
                <IconComponent className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs font-bold truncate w-full">{template.label}</span>
              <span className="text-[10px] font-extrabold opacity-90 mt-1">
                {template.type === 'INCOME' ? '+' : '-'} {formatCurrencyValue(convertedAmount, activeCurrency)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
