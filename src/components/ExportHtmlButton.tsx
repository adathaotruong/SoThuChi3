import { Download } from 'lucide-react';
import { Transaction, CurrencyType, CATEGORIES, CURRENCY_CONFIGS } from '../types';
import { convertCurrency, formatCurrencyValue } from '../data';

interface ExportHtmlButtonProps {
  id: string;
  transactions: Transaction[];
  activeCurrency: CurrencyType;
  selectedMonth: string; // YYYY-MM
}

export default function ExportHtmlButton({ id, transactions, activeCurrency, selectedMonth }: ExportHtmlButtonProps) {
  const handleExport = () => {
    const [year, month] = selectedMonth.split('-');
    const reportTitle = `Báo Cáo Thu Chi Tháng ${month}/${year}`;
    const generatedAt = new Date().toLocaleString('vi-VN');

    // Aggregate statistics for the selected month in VND, AED, and USD
    const computeStats = (curr: CurrencyType) => {
      let income = 0;
      let expense = 0;
      transactions
        .filter((tx) => tx.date.startsWith(selectedMonth))
        .forEach((tx) => {
          const amt = convertCurrency(tx.amount, tx.currency, curr);
          if (tx.type === 'INCOME') income += amt;
          else expense += amt;
        });
      return { income, expense, balance: income - expense };
    };

    const statsVnd = computeStats('VND');
    const statsAed = computeStats('AED');
    const statsUsd = computeStats('USD');

    // Aggregate expense categories
    const categoryTotals: Record<string, number> = {};
    let totalExpenseInActive = 0;
    transactions
      .filter((tx) => tx.type === 'EXPENSE' && tx.date.startsWith(selectedMonth))
      .forEach((tx) => {
        const amt = convertCurrency(tx.amount, tx.currency, activeCurrency);
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amt;
        totalExpenseInActive += amt;
      });

    const categoriesList = Object.keys(categoryTotals)
      .map((catKey) => {
        const amount = categoryTotals[catKey];
        const config = CATEGORIES[catKey] || CATEGORIES.others;
        const pct = totalExpenseInActive > 0 ? (amount / totalExpenseInActive) * 100 : 0;
        return { label: config.label, amount, percentage: pct, color: config.textColor };
      })
      .sort((a, b) => b.amount - a.amount);

    // List of active month transactions
    const monthTxList = transactions
      .filter((tx) => tx.date.startsWith(selectedMonth))
      .sort((a, b) => b.date.localeCompare(a.date));

    // Construct self-contained HTML content with elegant styles
    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportTitle} - Sổ Thu Chi Demo</title>
  <style>
    :root {
      --primary: #4f46e5;
      --income: #10b981;
      --expense: #f43f5e;
      --background: #fafafa;
      --surface: #ffffff;
      --text: #1e293b;
      --text-muted: #64748b;
      --border: #f1f5f9;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--background);
      color: var(--text);
      line-height: 1.5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 1000px;
      margin: 40px auto;
      padding: 0 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .header h1 {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--text);
      margin: 0 0 10px 0;
      letter-spacing: -0.025em;
    }
    .header p {
      color: var(--text-muted);
      font-size: 1rem;
      margin: 0;
    }
    .badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 700;
      background-color: #e0e7ff;
      color: #4338ca;
      margin-top: 12px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    .card-title {
      font-size: 0.8rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-top: 0;
      margin-bottom: 12px;
    }
    .amount {
      font-size: 1.8rem;
      font-weight: 800;
      margin-bottom: 15px;
    }
    .text-income { color: var(--income); }
    .text-expense { color: var(--expense); }
    .text-balance { color: var(--primary); }
    
    .currency-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      padding: 8px 0;
      border-bottom: 1px dashed var(--border);
    }
    .currency-row:last-child {
      border-bottom: none;
    }
    .currency-name {
      font-weight: 600;
      color: var(--text-muted);
    }
    .currency-val {
      font-weight: 700;
    }

    .section-title {
      font-size: 1.3rem;
      font-weight: 700;
      margin-bottom: 20px;
      padding-bottom: 8px;
      border-b: 2px solid var(--border);
    }
    
    .row-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 40px;
    }
    @media (max-width: 768px) {
      .row-layout {
        grid-template-columns: 1fr;
      }
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background-color: var(--border);
      border-radius: 9999px;
      overflow: hidden;
      margin-top: 6px;
    }
    .progress-fill {
      height: 100%;
      border-radius: 9999px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
    }
    th, td {
      padding: 14px 20px;
      text-align: left;
    }
    th {
      background-color: #f8fafc;
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--border);
    }
    tr {
      border-bottom: 1px solid var(--border);
    }
    tr:last-child {
      border-bottom: none;
    }
    .note {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .category-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      background-color: #f1f5f9;
      color: #475569;
    }
    .footer {
      text-align: center;
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      color: var(--text-muted);
      font-size: 0.8rem;
    }
    .footer strong {
      color: var(--text);
    }
    
    @media print {
      body { background-color: #fff; }
      .container { margin: 0; }
      .card { box-shadow: none; border: 1px solid #ddd; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p class="no-print">BÁO CÁO MẪU KIỂM THỬ KHÁCH HÀNG (DEMO)</p>
      <h1>${reportTitle}</h1>
      <p>Báo cáo tự động được tạo ngày ${generatedAt} • Đơn vị hiển thị chính: <strong>${activeCurrency}</strong></p>
      <span class="badge">BẢN THUYẾT TRÌNH THU CHI</span>
    </div>

    <!-- Multi-currency Summary Grid -->
    <div class="grid">
      <!-- Total Income Card -->
      <div class="card">
        <p class="card-title">Tổng Thu Nhập (Income)</p>
        <div class="amount text-income">+${formatCurrencyValue(statsVnd.income, 'VND')}</div>
        <div class="currency-row">
          <span class="currency-name">Đổi sang USD</span>
          <span class="currency-val text-income">+${formatCurrencyValue(statsUsd.income, 'USD')}</span>
        </div>
        <div class="currency-row">
          <span class="currency-name">Đổi sang AED</span>
          <span class="currency-val text-income">+${formatCurrencyValue(statsAed.income, 'AED')}</span>
        </div>
      </div>

      <!-- Total Expense Card -->
      <div class="card">
        <p class="card-title">Tổng Chi Tiêu (Expense)</p>
        <div class="amount text-expense">-${formatCurrencyValue(statsVnd.expense, 'VND')}</div>
        <div class="currency-row">
          <span class="currency-name">Đổi sang USD</span>
          <span class="currency-val text-expense">-${formatCurrencyValue(statsUsd.expense, 'USD')}</span>
        </div>
        <div class="currency-row">
          <span class="currency-name">Đổi sang AED</span>
          <span class="currency-val text-expense">-${formatCurrencyValue(statsAed.expense, 'AED')}</span>
        </div>
      </div>

      <!-- Net Balance Card -->
      <div class="card">
        <p class="card-title">Số Dư Tích Lũy (Net Balance)</p>
        <div class="amount text-balance">${statsVnd.balance >= 0 ? '+' : ''}${formatCurrencyValue(statsVnd.balance, 'VND')}</div>
        <div class="currency-row">
          <span class="currency-name">Đổi sang USD</span>
          <span class="currency-val text-balance">${statsUsd.balance >= 0 ? '+' : ''}${formatCurrencyValue(statsUsd.balance, 'USD')}</span>
        </div>
        <div class="currency-row">
          <span class="currency-name">Đổi sang AED</span>
          <span class="currency-val text-balance">${statsAed.balance >= 0 ? '+' : ''}${formatCurrencyValue(statsAed.balance, 'AED')}</span>
        </div>
      </div>
    </div>

    <!-- Core Layout Sections -->
    <div class="row-layout">
      <!-- Category distribution -->
      <div class="card">
        <h2 class="section-title">Cơ Cấu Chi Tiêu (Phân Loại)</h2>
        ${
          categoriesList.length === 0
            ? '<p style="font-size:0.85rem; color:var(--text-muted);">Không phát sinh khoản chi tiêu nào trong tháng này.</p>'
            : categoriesList
                .map(
                  (c) => `
          <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
              <span style="font-weight: 700;">${c.label}</span>
              <span style="font-weight: 600; color: var(--text-muted);">${formatCurrencyValue(
                c.amount,
                activeCurrency
              )} (${c.percentage.toFixed(1)}%)</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${c.percentage}%; background-color: var(--primary);"></div>
            </div>
          </div>
        `
                )
                .join('')
        }
      </div>

      <!-- Note summary metadata -->
      <div class="card" style="display: flex; flex-col; justify-content: center;">
        <h2 class="section-title">Thông Tin Chuyển Đổi Tỷ Giá</h2>
        <p style="font-size: 0.85rem; margin-bottom: 10px;">Báo cáo áp dụng các tỷ giá kiểm thử tiêu chuẩn sau:</p>
        <div class="currency-row">
          <span class="currency-name">1 USD (Đô la Mỹ)</span>
          <span class="currency-val">${formatCurrencyValue(CURRENCY_CONFIGS.VND.rateToUsd, 'VND')}</span>
        </div>
        <div class="currency-row">
          <span class="currency-name">1 USD (Đô la Mỹ)</span>
          <span class="currency-val">${formatCurrencyValue(CURRENCY_CONFIGS.AED.rateToUsd, 'AED')}</span>
        </div>
        <div class="currency-row">
          <span class="currency-name">1 AED (Dirham UAE)</span>
          <span class="currency-val">~ ${formatCurrencyValue(
            CURRENCY_CONFIGS.VND.rateToUsd / CURRENCY_CONFIGS.AED.rateToUsd,
            'VND'
          )}</span>
        </div>
        <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 15px;">* Ghi chú: Các tỷ giá quy đổi mang tính chất mô phỏng chính xác phục vụ cho bản thuyết trình demo khách hàng và kiểm tra tính nhất quán dòng tiền tệ.</p>
      </div>
    </div>

    <!-- Transaction detailed ledger table -->
    <div class="card">
      <h2 class="section-title">Nhật Ký Giao Dịch Chi Tiết (${monthTxList.length} Giao dịch)</h2>
      <div style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Phân Loại</th>
              <th>Ghi chú</th>
              <th style="text-align: right;">Số tiền gốc</th>
              <th style="text-align: right;">Quy đổi (${activeCurrency})</th>
            </tr>
          </thead>
          <tbody>
            ${
              monthTxList.length === 0
                ? '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);font-size:0.85rem;">Chưa có giao dịch ghi chép cho tháng này.</td></tr>'
                : monthTxList
                    .map((tx) => {
                      const converted = convertCurrency(tx.amount, tx.currency, activeCurrency);
                      const isIncome = tx.type === 'INCOME';
                      const badgeLabel = CATEGORIES[tx.category]?.label || 'Khác';
                      return `
              <tr>
                <td style="font-weight: 500; font-size: 0.85rem;">${tx.date}</td>
                <td><span class="category-badge">${badgeLabel}</span></td>
                <td class="note" style="font-size: 0.85rem;">${tx.note || '-'}</td>
                <td style="text-align: right; font-weight: 600; font-size: 0.85rem;" class="${
                  isIncome ? 'text-income' : 'text-expense'
                }">
                  ${isIncome ? '+' : '-'} ${formatCurrencyValue(tx.amount, tx.currency)}
                </td>
                <td style="text-align: right; font-weight: 700; font-size: 0.85rem;" class="${
                  isIncome ? 'text-income' : 'text-expense'
                }">
                  ${isIncome ? '+' : '-'} ${formatCurrencyValue(converted, activeCurrency)}
                </td>
              </tr>
            `;
                    })
                    .join('')
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Footer of the exported HTML -->
    <div class="footer">
      <p>Báo cáo xuất từ ứng dụng <strong>Sổ Thu Chi</strong> của khách hàng • Bản demo kiểm thử giao diện</p>
      <p style="font-size:0.7rem; color:var(--text-muted);">Sản phẩm được phát triển bởi Designer AI & React Vite Environment. Hỗ trợ đầy đủ ba loại tiền tệ VND, AED, USD.</p>
    </div>
  </div>
</body>
</html>`;

    // Download file logic
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sổ_Thu_Chi_Báo_Cáo_${selectedMonth}_${activeCurrency}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      id={id}
      onClick={handleExport}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-bold rounded-md text-xs shadow-sm cursor-pointer transition-all duration-150"
    >
      <Download className="h-4 w-4" />
      Xuất File HTML Demo
    </button>
  );
}
