import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Edit2, CreditCard, Search, ChevronDown, Check } from 'lucide-react';
import { Transaction, TransactionType, CurrencyType, CATEGORIES } from '../types';

interface TransactionModalProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'> & { id?: string }) => void;
  editingTransaction: Transaction | null;
  activeCurrency?: CurrencyType;
}

export default function TransactionModal({ id, isOpen, onClose, onSave, editingTransaction, activeCurrency = 'VND' }: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyType>('VND');
  const [category, setCategory] = useState<string>('food');
  const [date, setDate] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  useEffect(() => {
    setIsDropdownOpen(false);
    setCategorySearchQuery('');
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCurrency(editingTransaction.currency);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setNote(editingTransaction.note);
    } else {
      // Set to default values for new entry
      setType('EXPENSE');
      setAmount('');
      setCurrency(activeCurrency);
      setCategory('food');
      // Set default date to today in local timezone
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setDate(`${year}-${month}-${day}`);
      setNote('');
    }
  }, [editingTransaction, isOpen, activeCurrency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ!');
      return;
    }
    if (!category) {
      alert('Vui lòng chọn danh mục!');
      return;
    }
    if (!date) {
      alert('Vui lòng chọn ngày!');
      return;
    }

    onSave({
      id: editingTransaction?.id,
      type,
      amount: Number(amount),
      currency,
      category,
      date,
      note: note.trim(),
    });
    onClose();
  };

  const filteredCategories = Object.values(CATEGORIES).filter((cat) => {
    const labelMatches = cat.label.toLowerCase().includes(categorySearchQuery.toLowerCase());
    const idMatches = cat.id.toLowerCase().includes(categorySearchQuery.toLowerCase());
    return labelMatches || idMatches;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div id={id} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl z-10 overflow-visible"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-5">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {editingTransaction ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {editingTransaction ? 'Chỉnh Sửa Ghi Chép' : 'Thêm Khoản Ghi Chép'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500 cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('EXPENSE')}
                  className={`py-2 text-sm font-bold rounded-lg cursor-pointer transition-all ${
                    type === 'EXPENSE'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Khoản Chi (Chi tiêu)
                </button>
                <button
                  type="button"
                  onClick={() => setType('INCOME')}
                  className={`py-2 text-sm font-bold rounded-lg cursor-pointer transition-all ${
                    type === 'INCOME'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Khoản Thu (Thu nhập)
                </button>
              </div>

              {/* Amount & Currency */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Số Tiền *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-3 pr-12 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 font-bold">
                      {currency}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Đơn vị *
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyType)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="VND" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">VND (₫)</option>
                    <option value="AED" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">AED (د.إ)</option>
                    <option value="USD" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">USD ($)</option>
                    <option value="GEL" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">GEL (₾)</option>
                  </select>
                </div>
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Danh Mục *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500 text-left transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="truncate">
                        {CATEGORIES[category]?.label || 'Chọn danh mục'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                    </button>

                    {isDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setIsDropdownOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 overflow-hidden flex flex-col max-h-56">
                          {/* Search Input */}
                          <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-900/50">
                            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
                            <input
                              type="text"
                              autoFocus
                              placeholder="Tìm danh mục..."
                              value={categorySearchQuery}
                              onChange={(e) => setCategorySearchQuery(e.target.value)}
                              className="w-full bg-transparent border-none text-xs focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 py-1"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          {/* Options List */}
                          <div className="overflow-y-auto py-1 divide-y divide-slate-50 dark:divide-slate-800/40">
                            {filteredCategories.length === 0 ? (
                              <div className="px-3 py-2.5 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                                Không tìm thấy danh mục nào
                              </div>
                            ) : (
                              filteredCategories.map((cat) => (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => {
                                    setCategory(cat.id);
                                    setIsDropdownOpen(false);
                                    setCategorySearchQuery('');
                                  }}
                                  className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer text-left transition-colors ${
                                    category === cat.id
                                      ? 'bg-indigo-50/50 dark:bg-indigo-950/20 font-bold text-indigo-600 dark:text-indigo-400'
                                      : 'text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  <span>{cat.label}</span>
                                  {category === cat.id && (
                                    <Check className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                                  )}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Ngày Ghi Nhận *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Ghi Chú / Chi Tiết
                </label>
                <textarea
                  rows={2}
                  value={note}
                  placeholder="Ví dụ: Ăn phở ăn sáng, Lương tháng làm thêm..."
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-md cursor-pointer transition-all ${
                    type === 'INCOME' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'
                  }`}
                >
                  {editingTransaction ? 'Lưu Thay Đổi' : 'Xác Nhận Thêm'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
