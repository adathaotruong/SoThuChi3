import { useState } from 'react';
import { Transaction, CurrencyType, CATEGORIES } from '../types';
import { convertCurrency, formatCurrencyValue } from '../data';
import { TrendingUp, TrendingDown, Calendar, Percent } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalyticsChartsProps {
  id: string;
  transactions: Transaction[];
  activeCurrency: CurrencyType;
  selectedMonth: string; // YYYY-MM
}

export default function AnalyticsCharts({ id, transactions, activeCurrency, selectedMonth }: AnalyticsChartsProps) {
  const [hoveredMonth, setHoveredMonth] = useState<{
    monthCode: string;
    label: string;
    income: number;
    expense: number;
    count: number;
  } | null>(null);

  // 1. Group transactions by month (e.g., '2026-07')
  const getMonthlyData = () => {
    const dataMap: Record<string, { income: number; expense: number; count: number }> = {};

    transactions.forEach((tx) => {
      const monthStr = tx.date.substring(0, 7); // 'YYYY-MM'
      if (!dataMap[monthStr]) {
        dataMap[monthStr] = { income: 0, expense: 0, count: 0 };
      }

      dataMap[monthStr].count += 1;
      const convertedAmount = convertCurrency(tx.amount, tx.currency, activeCurrency);
      if (tx.type === 'INCOME') {
        dataMap[monthStr].income += convertedAmount;
      } else {
        dataMap[monthStr].expense += convertedAmount;
      }
    });

    // Convert map to sorted array
    return Object.keys(dataMap)
      .sort()
      .map((m) => {
        const [year, month] = m.split('-');
        return {
          monthCode: m,
          label: `Tháng ${month}/${year.substring(2)}`,
          income: dataMap[m].income,
          expense: dataMap[m].expense,
          count: dataMap[m].count,
        };
      });
  };

  const monthlyData = getMonthlyData();

  // Find max value across all months for scaling the bars
  const maxVal = Math.max(
    ...monthlyData.flatMap((d) => [d.income, d.expense]),
    1000 // default minimum to avoid dividing by 0
  );

  // 2. Category distribution for the currently selected month
  const getCategoryData = () => {
    const distribution: Record<string, number> = {};
    let totalExpense = 0;

    transactions
      .filter((tx) => tx.type === 'EXPENSE' && tx.date.startsWith(selectedMonth))
      .forEach((tx) => {
        const convertedAmount = convertCurrency(tx.amount, tx.currency, activeCurrency);
        distribution[tx.category] = (distribution[tx.category] || 0) + convertedAmount;
        totalExpense += convertedAmount;
      });

    return Object.keys(distribution)
      .map((catKey) => {
        const amount = distribution[catKey];
        const pct = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
        return {
          category: catKey,
          amount,
          percentage: pct,
          config: CATEGORIES[catKey] || CATEGORIES.others,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  };

  const categoryData = getCategoryData();
  const totalSelectedMonthExpense = categoryData.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div id={id} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Monthly Income & Expense Bars */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200">Xu Hướng Thu Chi Hàng Tháng</h3>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="h-3 w-3 rounded-full bg-emerald-500" /> Thu nhập
              </span>
              <span className="flex items-center gap-1.5 text-rose-500">
                <span className="h-3 w-3 rounded-full bg-rose-500" /> Chi tiêu
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mb-6">Biểu đồ so sánh tổng thu nhập và chi tiêu quy đổi sang {activeCurrency}</p>
        </div>

        {/* Custom SVG Bar Chart */}
        <div className="relative h-64 w-full border-b border-slate-100 dark:border-slate-800 pb-2">
          {monthlyData.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
              Chưa có dữ liệu tháng nào
            </div>
          ) : (
            <div className="w-full h-full flex items-end justify-start gap-4 overflow-x-auto pb-1 px-1 scrollbar-thin scrollbar-thumb-slate-200">
              {monthlyData.map((d) => {
                const incomeHeight = `${(d.income / maxVal) * 85}%`;
                const expenseHeight = `${(d.expense / maxVal) * 85}%`;

                return (
                  <div
                    key={d.monthCode}
                    className="flex flex-col items-center flex-1 min-w-[70px] max-w-[120px] group"
                    onMouseEnter={() => setHoveredMonth(d)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    <div className="flex items-end gap-1.5 h-44 w-full justify-center relative">
                      {/* Income Bar */}
                      <div className="relative flex flex-col items-center justify-end h-full w-5 sm:w-6">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: incomeHeight }}
                          transition={{ type: 'spring', stiffness: 80, delay: 0.1 }}
                          className={`w-full rounded-t-md bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-xs cursor-pointer transition-colors duration-150 ${
                            d.monthCode === selectedMonth ? 'ring-2 ring-offset-2 ring-emerald-400 dark:ring-offset-slate-900' : ''
                          }`}
                        />
                      </div>

                      {/* Expense Bar */}
                      <div className="relative flex flex-col items-center justify-end h-full w-5 sm:w-6">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: expenseHeight }}
                          transition={{ type: 'spring', stiffness: 80, delay: 0.2 }}
                          className={`w-full rounded-t-md bg-rose-500 hover:bg-rose-400 dark:bg-rose-600 dark:hover:bg-rose-500 shadow-xs cursor-pointer transition-colors duration-150 ${
                            d.monthCode === selectedMonth ? 'ring-2 ring-offset-2 ring-rose-400 dark:ring-offset-slate-900' : ''
                          }`}
                        />
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold mt-2 truncate w-full text-center ${d.monthCode === selectedMonth ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                      {d.label}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400 mt-0.5">
                      {d.count} dòng
                    </span>
                    <span className={`text-[9px] font-bold mt-1 px-1 py-0.5 rounded ${d.income - d.expense >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'}`}>
                      {d.income - d.expense >= 0 ? 'Dư:' : 'Âm:'} {formatCurrencyValue(Math.abs(d.income - d.expense), activeCurrency)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Interactive Tooltip Overlay */}
          {hoveredMonth && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 bg-slate-900 dark:bg-slate-800 text-white rounded-xl p-3 shadow-xl text-xs flex flex-col gap-1.5 z-10 animate-fade-in pointer-events-none border border-slate-700/50 min-w-[200px]">
              <div className="flex items-center justify-between border-b border-slate-700/40 pb-1">
                <span className="font-bold text-slate-200">{hoveredMonth.label}</span>
                <span className="text-[10px] font-bold bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                  {hoveredMonth.count} dòng
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span>Thu nhập:</span>
                </span>
                <span className="font-extrabold text-emerald-400">
                  {formatCurrencyValue(hoveredMonth.income, activeCurrency)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  <span>Chi tiêu:</span>
                </span>
                <span className="font-extrabold text-rose-400">
                  {formatCurrencyValue(hoveredMonth.expense, activeCurrency)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-700/30">
                <span className="text-slate-400">Số dư (Thu - Chi):</span>
                <span className={`font-black ${hoveredMonth.income - hoveredMonth.expense >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrencyValue(hoveredMonth.income - hoveredMonth.expense, activeCurrency)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Category distribution of the active month */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200">Cơ Cấu Chi Tiêu</h3>
          <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full dark:bg-rose-950/30 dark:text-rose-400">
            Tháng {selectedMonth.substring(5)}/{selectedMonth.substring(0, 4)}
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-6">Mức chi theo từng danh mục phân loại trong tháng được chọn ({activeCurrency})</p>

        {categoryData.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
            <Percent className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-xs text-slate-400 font-medium">Chưa phát sinh chi tiêu trong tháng này</p>
          </div>
        ) : (
          <div className="space-y-4 h-[210px] overflow-y-auto pr-1">
            {categoryData.map((item, idx) => (
              <div key={item.category} className="group">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.config.color.split(' ')[0]}`} />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.config.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-slate-500">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {formatCurrencyValue(item.amount, activeCurrency)}
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className={`h-full rounded-full ${
                      idx === 0 ? 'bg-rose-500' : idx === 1 ? 'bg-orange-400' : 'bg-amber-400'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
