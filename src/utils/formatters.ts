export const formatMoney = (value: number | string): string => {
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.')) || 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export const formatDateBR = (isoDate: string): string => {
  if (!isoDate) return '—';
  // Handle YYYY-MM-DD cleanly without timezone offset shift
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString('pt-BR');
  } catch {
    return isoDate;
  }
};

export const calculateItemTotal = (qty: number, price: number): number => {
  const q = Number(qty) || 0;
  const p = Number(price) || 0;
  return q * p;
};

export const calculateGrandTotal = (items: Array<{ qty: number; price: number }>): number => {
  return items.reduce((acc, item) => acc + calculateItemTotal(item.qty, item.price), 0);
};
