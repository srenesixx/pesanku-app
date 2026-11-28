import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { ORDER_STATUS_FILTERS } from '../constants/domain.js';
import { menuApi, orderApi } from '../services/api.js';
import { Button } from '../components/atoms/index.js';
import { EmptyState, FilterPillGroup, PageHeader } from '../components/molecules/index.js';
import { CashierOrderModal, OrderCard } from '../components/organisms/index.js';
import { useOrderDraft } from '../hooks/useOrderDraft.js';

export default function OrdersPage({
  initialOrders = [],
  initialMenus = [],
  initialModalOpen = false,
} = {}) {
  const [orders, setOrders] = useState(initialOrders);
  const [menus, setMenus] = useState(() => initialMenus.filter((m) => m.available));
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [modalOpen, setModalOpen] = useState(initialModalOpen);
  const newOrderTriggerRef = useRef(null);

  const {
    cart: draftCart,
    cartItems: draftItems,
    totalAmount,
    customerName,
    setCustomerName,
    notes,
    setNotes,
    fieldErrors,
    setFieldErrors,
    error,
    setError,
    updateQty: adjustDraftQty,
    resetDraft,
    validateDraft,
  } = useOrderDraft(menus);

  const closeModal = useCallback(() => setModalOpen(false), []);

  async function refresh() {
    const [orderList, menuList] = await Promise.all([orderApi.list(), menuApi.list()]);
    setOrders(orderList);
    setMenus(menuList.filter((m) => m.available));
  }

  useEffect(() => {
    refresh();
  }, []);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'Semua') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  async function handleStatusChange(orderId, nextStatus) {
    await orderApi.updateStatus(orderId, nextStatus);
    await refresh();
  }

  async function handleCreateOrder(e) {
    e.preventDefault();
    if (!validateDraft()) return;
    try {
      await orderApi.create({ customerName, notes, items: draftItems });
      setModalOpen(false);
      resetDraft();
      await refresh();
    } catch (err) {
      if (err.errors) setFieldErrors(err.errors);
      setError(err.message);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pencatatan Pesanan"
        subtitle="Terima pesanan pembeli, perbarui status dapur, atau catat pesanan langsung di kasir."
        actions={
          <Button
            ref={newOrderTriggerRef}
            variant="primary"
            onClick={() => {
              setError('');
              setFieldErrors({});
              setModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Catat Pesanan Baru
          </Button>
        }
      />

      <FilterPillGroup
        options={ORDER_STATUS_FILTERS}
        activeOption={statusFilter}
        onSelect={setStatusFilter}
      />

      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <EmptyState title="Belum ada pesanan dengan status ini." padding="lg" className="p-8" />
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>

      <CashierOrderModal
        open={modalOpen}
        menus={menus}
        draftCart={draftCart}
        customerName={customerName}
        notes={notes}
        fieldErrors={fieldErrors}
        error={error}
        totalAmount={totalAmount}
        triggerRef={newOrderTriggerRef}
        onCustomerNameChange={setCustomerName}
        onNotesChange={setNotes}
        onAdjustQty={adjustDraftQty}
        onSubmit={handleCreateOrder}
        onClose={closeModal}
      />
    </div>
  );
}
