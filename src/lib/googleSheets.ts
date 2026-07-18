import { Transaction, CurrencyType } from '../types';

export const SPREADSHEET_ID = '1Fiw0jfiQxTQmM-F7Y1fXTK_tmgODCB2uSSEnsOQc_Eo';
export const SHEET_NAME = 'test';

export function mapDescriptionToCategory(description: string, isIncome: boolean): string {
  const desc = description.toLowerCase();
  
  if (isIncome) {
    if (desc.includes('lương') || desc.includes('salary') || desc.includes('thưởng') || desc.includes('bonus')) {
      return 'salary';
    }
    if (desc.includes('đầu tư') || desc.includes('investment') || desc.includes('chứng khoán') || desc.includes('stock') || desc.includes('vàng') || desc.includes('crypto') || desc.includes('cổ tức')) {
      return 'investment';
    }
    return 'other_income';
  } else {
    if (desc.includes('điện thoại') || desc.includes('phone') || desc.includes('internet') || desc.includes('wifi') || desc.includes('4g') || desc.includes('sim') || desc.includes('mạng')) {
      return 'phone';
    }
    if (desc.includes('cà phê') || desc.includes('cafe') || desc.includes('coffee') || desc.includes('highland') || desc.includes('starbucks') || desc.includes('trà sữa') || desc.includes('nước') || desc.includes('milktea') || desc.includes('drink') || desc.includes('phúc long') || desc.includes('the coffee house')) {
      return 'coffee';
    }
    if (desc.includes('siêu thị') || desc.includes('sieu thi') || desc.includes('winmart') || desc.includes('coop') || desc.includes('lotte') || desc.includes('aeon') || desc.includes('grocery') || desc.includes('tạp hóa') || desc.includes('tap hoa') || desc.includes('bách hóa') || desc.includes('bach hoa') || desc.includes('mart')) {
      return 'supermarket';
    }
    if (desc.includes('thuê nhà') || desc.includes('rent') || desc.includes('nhà cửa') || desc.includes('tiền nhà') || desc.includes('phòng trọ') || desc.includes('apartment')) {
      return 'rent';
    }
    if (desc.includes('y tế') || desc.includes('sức khỏe') || desc.includes('bệnh viện') || desc.includes('thuốc') || desc.includes('medical') || desc.includes('doctor') || desc.includes('pharmacy') || desc.includes('hospital') || desc.includes('khám')) {
      return 'medical';
    }
    if (desc.includes('học') || desc.includes('giáo dục') || desc.includes('sách') || desc.includes('school') || desc.includes('class') || desc.includes('book') || desc.includes('education') || desc.includes('khóa học')) {
      return 'education';
    }
    if (desc.includes('ăn') || desc.includes('food') || desc.includes('nhà hàng') || desc.includes('restaurant') || desc.includes('bữa trưa') || desc.includes('bữa tối') || desc.includes('bữa sáng') || desc.includes('cơm') || desc.includes('bánh') || desc.includes('chợ') || desc.includes('meat') || desc.includes('vegetable')) {
      return 'food';
    }
    if (desc.includes('xe') || desc.includes('bus') || desc.includes('metro') || desc.includes('taxi') || desc.includes('grab') || desc.includes('uber') || desc.includes('di chuyển') || desc.includes('xăng') || desc.includes('gas') || desc.includes('car') || desc.includes('be') || desc.includes('máy bay') || desc.includes('flight')) {
      return 'transport';
    }
    if (desc.includes('mua sắm') || desc.includes('shopping') || desc.includes('quần áo') || desc.includes('giày') || desc.includes('dép') || desc.includes('clothes') || desc.includes('shoes') || desc.includes('tiki') || desc.includes('shopee') || desc.includes('lazada') || desc.includes('amazon') || desc.includes('mall')) {
      return 'shopping';
    }
    if (desc.includes('điện') || desc.includes('nước') || desc.includes('electricity') || desc.includes('water') || desc.includes('bill') || desc.includes('hóa đơn') || desc.includes('rác')) {
      return 'utilities';
    }
    if (desc.includes('phim') || desc.includes('cinema') || desc.includes('cgv') || desc.includes('netflix') || desc.includes('game') || desc.includes('chơi') || desc.includes('du lịch') || desc.includes('travel') || desc.includes('vé') || desc.includes('ticket') || desc.includes('bể bơi') || desc.includes('gym')) {
      return 'entertainment';
    }
    if (desc.includes('đầu tư') || desc.includes('investment') || desc.includes('chứng khoán') || desc.includes('stock') || desc.includes('vàng') || desc.includes('crypto')) {
      return 'investment';
    }
    return 'others';
  }
}

// Convert common date formats to YYYY-MM-DD
function parseDate(dateStr: string): string {
  if (!dateStr) {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Handle MM/DD/YYYY or MM/DD/YY as requested
  const parts = dateStr.split(/[\/\-]/);
  if (parts.length === 3) {
    const p0 = parts[0].trim();
    const p1 = parts[1].trim();
    let p2 = parts[2].trim();

    // Check if the last part is the year (either 4 digits or 2 digits)
    if (p2.length === 4 || p2.length === 2) {
      if (p2.length === 2) {
        p2 = `20${p2}`;
      }
      // MM/DD/YYYY -> YYYY-MM-DD
      const month = p0.padStart(2, '0');
      const day = p1.padStart(2, '0');
      const year = p2;
      return `${year}-${month}-${day}`;
    } else if (p0.length === 4) {
      // YYYY/MM/DD -> YYYY-MM-DD
      const year = p0;
      const month = p1.padStart(2, '0');
      const day = p2.padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  return dateStr;
}

// Construct a full date from separate month and date columns
function parseSheetMonthAndDay(rawMonth: string, rawDate: string): string {
  if (!rawMonth) {
    return parseDate(rawDate);
  }

  // If rawDate already looks like a full date (contains multiple parts), use parseDate(rawDate)
  if (rawDate.includes('/') || rawDate.includes('-')) {
    return parseDate(rawDate);
  }

  // Parse day
  let dayNum = parseInt(rawDate.replace(/[^\d]/g, ''), 10);
  if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
    dayNum = 1;
  }

  // Parse month
  let monthNum = 7; // Default to July
  let yearNum = 2026; // Default to 2026

  const monthStr = rawMonth.toLowerCase().trim();
  
  // Check if monthStr is like "2026-03" or "03/2026"
  if (/\d{4}[-\/]\d{1,2}/.test(monthStr)) {
    const parts = monthStr.split(/[-\/]/);
    yearNum = parseInt(parts[0], 10);
    monthNum = parseInt(parts[1], 10);
  } else if (/\d{1,2}[-\/]\d{4}/.test(monthStr)) {
    const parts = monthStr.split(/[-\/]/);
    monthNum = parseInt(parts[0], 10);
    yearNum = parseInt(parts[1], 10);
  } else {
    // Try to find any digits in monthStr (e.g. "Tháng 12" -> "12", "05" -> "5")
    const digits = monthStr.replace(/[^\d]/g, '');
    if (digits) {
      const parsed = parseInt(digits, 10);
      if (parsed >= 1 && parsed <= 12) {
        monthNum = parsed;
      }
    } else {
      // English months matching
      if (monthStr.includes('jan')) monthNum = 1;
      else if (monthStr.includes('feb')) monthNum = 2;
      else if (monthStr.includes('mar')) monthNum = 3;
      else if (monthStr.includes('apr')) monthNum = 4;
      else if (monthStr.includes('may')) monthNum = 5;
      else if (monthStr.includes('jun')) monthNum = 6;
      else if (monthStr.includes('jul')) monthNum = 7;
      else if (monthStr.includes('aug')) monthNum = 8;
      else if (monthStr.includes('sep')) monthNum = 9;
      else if (monthStr.includes('oct')) monthNum = 10;
      else if (monthStr.includes('nov')) monthNum = 11;
      else if (monthStr.includes('dec')) monthNum = 12;
    }
  }

  const y = String(yearNum);
  const m = String(monthNum).padStart(2, '0');
  const d = String(dayNum).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function fetchGoogleSheetTransactions(accessToken: string): Promise<Transaction[]> {
  const range = `'${SHEET_NAME}'!A1:Z1000`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch Google Sheet data: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const rows: string[][] = data.values || [];

  if (rows.length === 0) {
    return [];
  }

  // Find headers in the first row
  const headers = rows[0].map(h => h.trim().toLowerCase());
  
  // Find column indexes based on user specifications
  let inColIndex = headers.findIndex(h => h === 'in' || h === 'thu' || h === 'thu nhập' || h === 'thu nap');
  let outColIndex = headers.findIndex(h => h === 'out' || h === 'chi' || h === 'chi tiêu' || h === 'chi tieu');
  let descColIndex = headers.findIndex(h => h === 'description' || h === 'ghi chú' || h === 'note' || h === 'diễn giải' || h === 'ghi chu' || h === 'dien giai' || h === 'mô tả' || h === 'mo ta' || h === 'nội dung' || h === 'noi dung');
  let dateColIndex = headers.findIndex(h => h === 'date' || h === 'ngày' || h === 'ngay' || h === 'thời gian' || h === 'thoi gian');
  let monthColIndex = headers.findIndex(h => h === 'month' || h === 'tháng' || h === 'thang');
  let currencyColIndex = headers.findIndex(h => h === 'currency' || h === 'tiền tệ' || h === 'tien te' || h === 'unit' || h === 'đơn vị' || h === 'don vi');

  // If column mappings fail, fall back to best guess
  if (inColIndex === -1) inColIndex = headers.findIndex(h => h.includes('in') || h.includes('thu'));
  if (outColIndex === -1) outColIndex = headers.findIndex(h => h.includes('out') || h.includes('chi'));
  if (descColIndex === -1) descColIndex = headers.findIndex(h => h.includes('desc') || h.includes('note') || h.includes('ghi') || h.includes('diễn') || h.includes('mô') || h.includes('nội dung') || h.includes('noi dung'));
  if (dateColIndex === -1) dateColIndex = headers.findIndex(h => h.includes('date') || h.includes('ngày') || h.includes('ngay'));
  if (monthColIndex === -1) monthColIndex = headers.findIndex(h => h.includes('month') || h.includes('tháng') || h.includes('thang'));
  if (currencyColIndex === -1) currencyColIndex = headers.findIndex(h => h.includes('cur') || h.includes('tiền') || h.includes('tien') || h.includes('đơn') || h.includes('don'));

  // Absolute fallbacks
  if (inColIndex === -1) inColIndex = 2; 
  if (outColIndex === -1) outColIndex = 3; 
  if (descColIndex === -1) descColIndex = 4; 
  if (dateColIndex === -1) dateColIndex = 0; 

  const transactions: Transaction[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    // Get values
    const rawDate = row[dateColIndex] ? row[dateColIndex].trim() : '';
    const rawMonth = monthColIndex !== -1 && row[monthColIndex] ? row[monthColIndex].trim() : '';
    const rawDesc = row[descColIndex] ? row[descColIndex].trim() : '';
    const rawIn = row[inColIndex] ? row[inColIndex].trim() : '';
    const rawOut = row[outColIndex] ? row[outColIndex].trim() : '';
    const rawCurrency = currencyColIndex !== -1 && row[currencyColIndex] ? row[currencyColIndex].trim().toUpperCase() : '';

    if (!rawIn && !rawOut) {
      continue; // Skip rows with no money values
    }

    // Clean and parse numbers
    const cleanNumberStr = (str: string) => {
      // Remove thousands separators, currency symbols, and convert to dot decimal
      return parseFloat(str.replace(/[^\d\.\,\-]/g, '').replace(/,/g, ''));
    };

    const inVal = rawIn ? cleanNumberStr(rawIn) : 0;
    const outVal = rawOut ? cleanNumberStr(rawOut) : 0;

    if (isNaN(inVal) && isNaN(outVal)) {
      continue;
    }

    const type = inVal > 0 ? 'INCOME' : 'EXPENSE';
    const amount = type === 'INCOME' ? inVal : outVal;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      continue;
    }

    const category = mapDescriptionToCategory(rawDesc, type === 'INCOME');
    const date = parseSheetMonthAndDay(rawMonth, rawDate);

    // Determine currency: if the row contains a valid currency, use it. Otherwise, default to AED.
    let currency: CurrencyType = 'AED';
    if (['VND', 'AED', 'USD', 'GEL'].includes(rawCurrency)) {
      currency = rawCurrency as CurrencyType;
    }

    transactions.push({
      id: `sheet-${i}`,
      type,
      amount,
      currency,
      category,
      date,
      note: rawDesc,
    });
  }

  return transactions;
}

interface SheetMapping {
  headers: string[];
  totalRows: number;
  inColIndex: number;
  outColIndex: number;
  descColIndex: number;
  dateColIndex: number;
  monthColIndex: number;
  currencyColIndex: number;
}

export async function getSheetMapping(accessToken: string): Promise<SheetMapping> {
  const range = `'${SHEET_NAME}'!A1:Z1000`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch Google Sheet structure: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const rows: string[][] = data.values || [];

  const headers = rows.length > 0 ? rows[0].map(h => h.trim().toLowerCase()) : [];
  
  // Find column indexes (using the same logic as fetchGoogleSheetTransactions)
  let inColIndex = headers.findIndex(h => h === 'in' || h === 'thu' || h === 'thu nhập' || h === 'thu nap');
  let outColIndex = headers.findIndex(h => h === 'out' || h === 'chi' || h === 'chi tiêu' || h === 'chi tieu');
  let descColIndex = headers.findIndex(h => h === 'description' || h === 'ghi chú' || h === 'note' || h === 'diễn giải' || h === 'ghi chu' || h === 'dien giai' || h === 'mô tả' || h === 'mo ta' || h === 'nội dung' || h === 'noi dung');
  let dateColIndex = headers.findIndex(h => h === 'date' || h === 'ngày' || h === 'ngay' || h === 'thời gian' || h === 'thoi gian');
  let monthColIndex = headers.findIndex(h => h === 'month' || h === 'tháng' || h === 'thang');
  let currencyColIndex = headers.findIndex(h => h === 'currency' || h === 'tiền tệ' || h === 'tien te' || h === 'unit' || h === 'đơn vị' || h === 'don vi');

  // If column mappings fail, fall back to best guess
  if (inColIndex === -1) {
    inColIndex = headers.findIndex(h => h.includes('in') || h.includes('thu'));
    if (inColIndex === -1) inColIndex = 2;
  }
  if (outColIndex === -1) {
    outColIndex = headers.findIndex(h => h.includes('out') || h.includes('chi'));
    if (outColIndex === -1) outColIndex = 3;
  }
  if (descColIndex === -1) {
    descColIndex = headers.findIndex(h => h.includes('desc') || h.includes('note') || h.includes('ghi') || h.includes('diễn') || h.includes('mô') || h.includes('nội dung') || h.includes('noi dung'));
    if (descColIndex === -1) descColIndex = 4;
  }
  if (dateColIndex === -1) {
    dateColIndex = headers.findIndex(h => h.includes('date') || h.includes('ngày') || h.includes('ngay'));
    if (dateColIndex === -1) dateColIndex = 0;
  }
  if (monthColIndex === -1) {
    monthColIndex = headers.findIndex(h => h.includes('month') || h.includes('tháng') || h.includes('thang'));
  }
  if (currencyColIndex === -1) {
    currencyColIndex = headers.findIndex(h => h.includes('cur') || h.includes('tiền') || h.includes('tien') || h.includes('đơn') || h.includes('don'));
  }

  return {
    headers: rows[0] || [],
    totalRows: rows.length,
    inColIndex,
    outColIndex,
    descColIndex,
    dateColIndex,
    monthColIndex,
    currencyColIndex,
  };
}

function buildRowArray(tx: Omit<Transaction, 'id'>, mapping: SheetMapping): string[] {
  const maxIndex = Math.max(
    mapping.dateColIndex,
    mapping.monthColIndex,
    mapping.inColIndex,
    mapping.outColIndex,
    mapping.descColIndex,
    mapping.currencyColIndex
  );
  
  const row = Array(maxIndex + 1).fill('');
  
  // 1. Date & Month
  if (mapping.monthColIndex !== -1) {
    const dateParts = tx.date.split('-');
    const day = dateParts[2] ? parseInt(dateParts[2], 10).toString() : tx.date;
    const month = `${dateParts[0]}-${dateParts[1]}`;
    row[mapping.dateColIndex] = day;
    row[mapping.monthColIndex] = month;
  } else {
    row[mapping.dateColIndex] = tx.date;
  }
  
  // 2. In / Out
  if (tx.type === 'INCOME') {
    row[mapping.inColIndex] = tx.amount.toString();
    row[mapping.outColIndex] = '';
  } else {
    row[mapping.inColIndex] = '';
    row[mapping.outColIndex] = tx.amount.toString();
  }
  
  // 3. Description
  row[mapping.descColIndex] = tx.note || tx.category;
  
  // 4. Currency
  if (mapping.currencyColIndex !== -1) {
    row[mapping.currencyColIndex] = tx.currency;
  }
  
  return row;
}

export async function addTransactionToGoogleSheet(
  accessToken: string,
  tx: Omit<Transaction, 'id'>
): Promise<string> {
  const mapping = await getSheetMapping(accessToken);
  const rowData = buildRowArray(tx, mapping);
  
  const range = `'${SHEET_NAME}'!A1`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [rowData],
    }),
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to append transaction to Google Sheet: ${response.status} ${errText}`);
  }
  
  const result = await response.json();
  const updatedRange = result.updates?.updatedRange || '';
  
  const rangePart = updatedRange.split('!')[1] || '';
  const startCell = rangePart.split(':')[0] || '';
  const rowNumberStr = startCell.replace(/[^\d]/g, '');
  const rowNumber = parseInt(rowNumberStr, 10);
  
  if (isNaN(rowNumber)) {
    const fallbackRow = mapping.totalRows + 1;
    return `sheet-${fallbackRow - 1}`;
  }
  
  return `sheet-${rowNumber - 1}`;
}

export async function updateTransactionInGoogleSheet(
  accessToken: string,
  id: string,
  tx: Omit<Transaction, 'id'>
): Promise<void> {
  const match = id.match(/^sheet-(\d+)$/);
  if (!match) {
    throw new Error(`Invalid Google Sheet transaction ID format: ${id}`);
  }
  
  const rowNum = parseInt(match[1], 10) + 1;
  
  const mapping = await getSheetMapping(accessToken);
  const rowData = buildRowArray(tx, mapping);
  
  const range = `'${SHEET_NAME}'!A${rowNum}:Z${rowNum}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [rowData],
    }),
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to update transaction in Google Sheet at row ${rowNum}: ${response.status} ${errText}`);
  }
}

export async function deleteTransactionFromGoogleSheet(
  accessToken: string,
  id: string
): Promise<void> {
  const match = id.match(/^sheet-(\d+)$/);
  if (!match) {
    return;
  }
  
  const rowNum = parseInt(match[1], 10) + 1;
  
  const mapping = await getSheetMapping(accessToken);
  
  const maxIndex = Math.max(
    mapping.dateColIndex,
    mapping.monthColIndex,
    mapping.inColIndex,
    mapping.outColIndex,
    mapping.descColIndex,
    mapping.currencyColIndex
  );
  const emptyRow = Array(maxIndex + 1).fill('');
  
  const range = `'${SHEET_NAME}'!A${rowNum}:Z${rowNum}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [emptyRow],
    }),
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to clear transaction from Google Sheet at row ${rowNum}: ${response.status} ${errText}`);
  }
}

