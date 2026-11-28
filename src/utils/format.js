export function formatRupiah(amount) {
  const num = Number(amount) || 0;
  return 'Rp' + num.toLocaleString('id-ID');
}

export function formatDateTime(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatShortDate(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function calculateOrderTotals(items) {
  const normalized = (items || []).map((item) => {
    const qty = Number(item.qty) || 0;
    const price = Number(item.price) || 0;
    return {
      ...item,
      qty,
      price,
      subtotal: qty * price,
    };
  });
  const totalItems = normalized.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = normalized.reduce((sum, item) => sum + item.subtotal, 0);
  return { items: normalized, totalItems, totalAmount };
}

export function validateOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return 'Pilih minimal satu menu sebelum mengirim pesanan.';
  }
  const hasInvalidQty = items.some((item) => !Number.isInteger(item.qty) || item.qty <= 0);
  if (hasInvalidQty) {
    return 'Jumlah pesanan setiap menu harus lebih dari 0.';
  }
  const hasExcessiveQty = items.some((item) => item.qty > 99);
  if (hasExcessiveQty) {
    return 'Jumlah pesanan per menu maksimal 99 porsi.';
  }
  const hasInvalidPrice = items.some(
    (item) => item.price !== undefined && (!Number.isFinite(Number(item.price)) || Number(item.price) <= 0)
  );
  if (hasInvalidPrice) {
    return 'Harga setiap menu dalam pesanan harus lebih dari Rp0.';
  }
  return null;
}

export function exportTransactionsCSV(orders) {
  const headers = ['Kode Pesanan', 'Waktu', 'Pelanggan', 'Status', 'Rincian Menu', 'Total (Rp)'];
  const rows = orders.map((order) => [
    order.code,
    formatDateTime(order.createdAt),
    order.customerName,
    order.status,
    order.items.map((i) => `${i.name} x${i.qty}`).join('; '),
    order.totalAmount,
  ]);
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `laporan-pesanku-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
