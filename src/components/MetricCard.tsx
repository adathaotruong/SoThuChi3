import { Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'motion/react';
import { CurrencyType } from '../types';
import { formatCurrencyValue } from '../data';

interface MetricCardProps {
  id: string;
  title: string;
  amount: number;
  currency: CurrencyType;
  type: 'balance' | 'income' | 'expense';
}

export default function MetricCard({ id, title, amount, currency, type }: MetricCardProps) {
  const getStyles = () => {
    switch (type) {
      case 'income':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30',
          titleText: 'text-emerald-600 dark:text-emerald-400',
          text: 'text-emerald-700 dark:text-emerald-300 font-black',
          iconBg: 'bg-emerald-600 text-white',
          icon: ArrowUpRight,
        };
      case 'expense':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30',
          titleText: 'text-rose-600 dark:text-rose-400',
          text: 'text-rose-700 dark:text-rose-300 font-black',
          iconBg: 'bg-rose-500 text-white',
          icon: ArrowDownRight,
        };
      default:
        return {
          bg: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
          titleText: 'text-slate-400 dark:text-slate-500',
          text: 'text-slate-800 dark:text-slate-100 font-black',
          iconBg: 'bg-slate-800 dark:bg-slate-700 text-white',
          icon: Wallet,
        };
    }
  };

  const styles = getStyles();
  const Icon = styles.icon;

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-xs flex items-center justify-between ${styles.bg}`}
    >
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${styles.titleText}`}>
          {title}
        </p>
        <h3 className={`text-3xl tracking-tight ${styles.text}`}>
          {formatCurrencyValue(amount, currency)}
        </h3>
        {type === 'balance' && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
            Công thức: Σ Thu nhập - Σ Chi tiêu
          </p>
        )}
      </div>
      <div className={`p-2.5 rounded-xl shadow-xs ${styles.iconBg}`}>
        <Icon className="h-5 w-5" />
      </div>
    </motion.div>
  );
}
