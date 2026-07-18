export type CurrencyType = 'AED' | 'VND' | 'USD' | 'GEL';

export interface CurrencyConfig {
  code: CurrencyType;
  symbol: string;
  rateToUsd: number; // Amount of this currency per 1 USD (e.g. 25000 VND, 3.67 AED, 2.72 GEL)
  label: string;
}

export const CURRENCY_CONFIGS: Record<CurrencyType, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', rateToUsd: 1.0, label: 'US Dollar' },
  VND: { code: 'VND', symbol: '₫', rateToUsd: 25000.0, label: 'Việt Nam Đồng' },
  AED: { code: 'AED', symbol: 'د.إ', rateToUsd: 3.67, label: 'UAE Dirham' },
  GEL: { code: 'GEL', symbol: '₾', rateToUsd: 2.72, label: 'Georgian Lari' },
};

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface CategoryConfig {
  id: string;
  label: string;
  iconName: string;
  color: string; // Tailwind bg-class
  textColor: string; // Tailwind text-class
}

export const CATEGORIES: Record<string, CategoryConfig> = {
  food: { id: 'food', label: 'Ăn uống & Nhà hàng', iconName: 'Utensils', color: 'bg-orange-100 text-orange-600', textColor: 'text-orange-600' },
  coffee: { id: 'coffee', label: 'Cafe & Đồ uống', iconName: 'Coffee', color: 'bg-amber-100 text-amber-700', textColor: 'text-amber-700' },
  supermarket: { id: 'supermarket', label: 'Siêu thị & Chợ búa', iconName: 'Store', color: 'bg-teal-100 text-teal-600', textColor: 'text-teal-600' },
  transport: { id: 'transport', label: 'Di chuyển & Xăng xe', iconName: 'Car', color: 'bg-blue-100 text-blue-600', textColor: 'text-blue-600' },
  shopping: { id: 'shopping', label: 'Mua sắm & Quần áo', iconName: 'ShoppingBag', color: 'bg-pink-100 text-pink-600', textColor: 'text-pink-600' },
  phone: { id: 'phone', label: 'Điện thoại & Internet', iconName: 'Phone', color: 'bg-indigo-100 text-indigo-700', textColor: 'text-indigo-700' },
  utilities: { id: 'utilities', label: 'Hóa đơn & Điện nước', iconName: 'Zap', color: 'bg-yellow-100 text-yellow-600', textColor: 'text-yellow-600' },
  rent: { id: 'rent', label: 'Nhà cửa & Thuê phòng', iconName: 'Home', color: 'bg-cyan-100 text-cyan-600', textColor: 'text-cyan-600' },
  medical: { id: 'medical', label: 'Y tế & Sức khỏe', iconName: 'Heart', color: 'bg-rose-100 text-rose-600', textColor: 'text-rose-600' },
  education: { id: 'education', label: 'Giáo dục & Học tập', iconName: 'BookOpen', color: 'bg-violet-100 text-violet-600', textColor: 'text-violet-600' },
  entertainment: { id: 'entertainment', label: 'Giải trí & Du lịch', iconName: 'Film', color: 'bg-purple-100 text-purple-600', textColor: 'text-purple-600' },
  salary: { id: 'salary', label: 'Lương & Thưởng', iconName: 'Coins', color: 'bg-emerald-100 text-emerald-600', textColor: 'text-emerald-600' },
  investment: { id: 'investment', label: 'Đầu tư & Tiết kiệm', iconName: 'TrendingUp', color: 'bg-indigo-100 text-indigo-600', textColor: 'text-indigo-600' },
  other_income: { id: 'other_income', label: 'Thu nhập khác', iconName: 'PlusCircle', color: 'bg-emerald-100 text-emerald-700', textColor: 'text-emerald-700' },
  others: { id: 'others', label: 'Chi tiêu khác', iconName: 'HelpCircle', color: 'bg-slate-100 text-slate-600', textColor: 'text-slate-600' },
};

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // Original amount in its currency
  currency: CurrencyType;
  category: string;
  date: string; // YYYY-MM-DD
  note: string;
}
