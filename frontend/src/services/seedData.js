export const SEED_MENUS = [
  {
    id: 'm1',
    name: 'Nasi Ayam Geprek Original',
    category: 'Makanan',
    price: 15000,
    available: true,
    description: 'Ayam crispy digeprek sambal bawang pedas, nasi hangat, lalapan.',
  },
  {
    id: 'm2',
    name: 'Nasi Ayam Bakar Madu',
    category: 'Makanan',
    price: 18000,
    available: true,
    description: 'Ayam ungkep dibakar bumbu madu kecap manis, sambal terasi.',
  },
  {
    id: 'm3',
    name: 'Nasi Ayam Goreng Kremes',
    category: 'Makanan',
    price: 16000,
    available: true,
    description: 'Ayam goreng gurih dengan taburan kremesan renyah.',
  },
  {
    id: 'm4',
    name: 'Paket Geprek Komplit + Es Teh',
    category: 'Paket',
    price: 19000,
    available: true,
    description: 'Nasi Ayam Geprek, tahu tempe goreng, dan Es Teh Manis.',
  },
  {
    id: 'm5',
    name: 'Es Teh Manis',
    category: 'Minuman',
    price: 5000,
    available: true,
    description: 'Teh melati segar diseduh manis dengan es batu.',
  },
  {
    id: 'm6',
    name: 'Es Jeruk Peras',
    category: 'Minuman',
    price: 7000,
    available: true,
    description: 'Perasan jeruk asli tanpa sirup buatan.',
  },
  {
    id: 'm7',
    name: 'Tahu & Tempe Goreng (4 pcs)',
    category: 'Tambahan',
    price: 6000,
    available: true,
    description: 'Lauk pendamping hangat dengan bumbu ketumbar.',
  },
];

function daysAgoIso(days, hour = 12, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const SEED_ORDERS = [
  {
    id: 'ord-1001',
    code: 'PK-1001',
    customerName: 'Budi Santoso',
    notes: 'Sambal sedang, tidak pakai timun',
    status: 'Selesai',
    createdAt: daysAgoIso(3, 12, 15),
    items: [
      { menuId: 'm1', name: 'Nasi Ayam Geprek Original', price: 15000, qty: 2, subtotal: 30000 },
      { menuId: 'm5', name: 'Es Teh Manis', price: 5000, qty: 2, subtotal: 10000 },
    ],
    totalItems: 4,
    totalAmount: 40000,
  },
  {
    id: 'ord-1002',
    code: 'PK-1002',
    customerName: 'Rina Wijaya',
    notes: 'Bungkus terpisah',
    status: 'Selesai',
    createdAt: daysAgoIso(2, 13, 5),
    items: [
      { menuId: 'm4', name: 'Paket Geprek Komplit + Es Teh', price: 19000, qty: 3, subtotal: 57000 },
    ],
    totalItems: 3,
    totalAmount: 57000,
  },
  {
    id: 'ord-1003',
    code: 'PK-1003',
    customerName: 'Dimas Pratama',
    notes: 'Pedas banget',
    status: 'Selesai',
    createdAt: daysAgoIso(1, 18, 30),
    items: [
      { menuId: 'm2', name: 'Nasi Ayam Bakar Madu', price: 18000, qty: 2, subtotal: 36000 },
      { menuId: 'm6', name: 'Es Jeruk Peras', price: 7000, qty: 2, subtotal: 14000 },
    ],
    totalItems: 4,
    totalAmount: 50000,
  },
  {
    id: 'ord-1004',
    code: 'PK-1004',
    customerName: 'Siti Aminah',
    notes: 'Makan di tempat meja 3',
    status: 'Selesai',
    createdAt: daysAgoIso(0, 11, 45),
    items: [
      { menuId: 'm1', name: 'Nasi Ayam Geprek Original', price: 15000, qty: 2, subtotal: 30000 },
      { menuId: 'm7', name: 'Tahu & Tempe Goreng (4 pcs)', price: 6000, qty: 1, subtotal: 6000 },
    ],
    totalItems: 3,
    totalAmount: 36000,
  },
  {
    id: 'ord-1005',
    code: 'PK-1005',
    customerName: 'Andi Kurniawan',
    notes: 'Kremesan dipisah',
    status: 'Diproses',
    createdAt: daysAgoIso(0, 12, 20),
    items: [
      { menuId: 'm3', name: 'Nasi Ayam Goreng Kremes', price: 16000, qty: 2, subtotal: 32000 },
      { menuId: 'm5', name: 'Es Teh Manis', price: 5000, qty: 2, subtotal: 10000 },
    ],
    totalItems: 4,
    totalAmount: 42000,
  },
  {
    id: 'ord-1006',
    code: 'PK-1006',
    customerName: 'Nadia Putri',
    notes: 'Sambal pisah',
    status: 'Menunggu',
    createdAt: daysAgoIso(0, 12, 40),
    items: [
      { menuId: 'm4', name: 'Paket Geprek Komplit + Es Teh', price: 19000, qty: 1, subtotal: 19000 },
      { menuId: 'm1', name: 'Nasi Ayam Geprek Original', price: 15000, qty: 1, subtotal: 15000 },
    ],
    totalItems: 2,
    totalAmount: 34000,
  },
];
