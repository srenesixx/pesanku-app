import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MENU_CATEGORY_FILTERS } from '../constants/domain.js';
import { menuApi, orderApi, reportApi } from '../services/api.js';
import { validateTrackCode } from '../utils/validation.js';
import { EmptyState, FilterPillGroup, PageHeader } from '../components/molecules/index.js';
import {
  MenuCard,
  MobileCartBar,
  OrderSuccessBanner,
  OrderSummaryPanel,
  OrderTrackerSection,
  StorefrontHeader,
} from '../components/organisms/index.js';
import { useOrderDraft } from '../hooks/useOrderDraft.js';
import { useOverlayDialog } from '../hooks/useOverlayDialog.js';

export function subscribeMediaQuery(
  query,
  onChange,
  win = typeof window !== 'undefined' ? window : undefined
) {
  if (!win || typeof win.matchMedia !== 'function') {
    return { matches: false, unsubscribe: () => {} };
  }
  const mediaQuery = win.matchMedia(query);
  const handleChange = (event) => onChange(event.matches);
  mediaQuery.addEventListener('change', handleChange);
  return {
    matches: Boolean(mediaQuery.matches),
    unsubscribe: () => mediaQuery.removeEventListener('change', handleChange),
  };
}

export async function submitCustomerOrder({
  createOrder,
  customerName,
  notes,
  cartItems,
  setError,
  setFieldErrors,
  setSubmitting,
  setLastOrder,
  setCart,
  setCustomerName,
  setNotes,
  setSheetOpen,
}) {
  setError('');
  setFieldErrors?.({});
  setSubmitting(true);
  try {
    const created = await createOrder({
      customerName,
      notes,
      items: cartItems,
    });
    setLastOrder(created);
    setCart({});
    setCustomerName('');
    setNotes('');
    setSheetOpen(false);
    return created;
  } catch (err) {
    if (err.errors) {
      setFieldErrors?.(err.errors);
    }
    setError(err.message || 'Gagal mengirim pesanan.');
    return null;
  } finally {
    setSubmitting(false);
  }
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return Boolean(window.matchMedia(query).matches);
  });

  useEffect(() => {
    const { matches: currentMatches, unsubscribe } = subscribeMediaQuery(query, setMatches);
    setMatches(currentMatches);
    return unsubscribe;
  }, [query]);

  return matches;
}

export default function CustomerOrderPage({ onOpenLogin }) {
  const [menus, setMenus] = useState([]);
  const [topMenuNames, setTopMenuNames] = useState([]);
  const [category, setCategory] = useState('Semua');
  const [submitting, setSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [trackCode, setTrackCode] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [showTracker, setShowTracker] = useState(false);

  const {
    cart,
    setCart,
    cartItems,
    totalItems,
    totalAmount,
    customerName,
    setCustomerName,
    notes,
    setNotes,
    fieldErrors,
    setFieldErrors,
    error,
    setError,
    updateQty,
    validateDraft,
  } = useOrderDraft(menus);

  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const summaryTriggerRef = useRef(null);
  const dialogRef = useRef(null);
  const backdropMouseDownRef = useRef(false);
  const lastOrderBannerRef = useRef(null);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  useOverlayDialog(sheetOpen && !isDesktop, closeSheet, summaryTriggerRef, dialogRef);

  useEffect(() => {
    if (!lastOrder) return;
    lastOrderBannerRef.current?.scrollIntoView?.({ block: 'nearest' });
    lastOrderBannerRef.current?.focus?.({ preventScroll: true });
  }, [lastOrder]);

  useEffect(() => {
    if (isDesktop && sheetOpen) {
      setSheetOpen(false);
    }
  }, [isDesktop, sheetOpen]);

  useEffect(() => {
    Promise.all([menuApi.list(), reportApi.getDashboardSummary()]).then(([menuList, summary]) => {
      setMenus(menuList);
      setTopMenuNames((summary.topMenus || []).slice(0, 2).map((m) => m.name));
    });
  }, []);

  const visibleMenus = useMemo(() => {
    if (category === 'Semua') return menus;
    return menus.filter((m) => m.category === category);
  }, [menus, category]);

  async function handleSubmitOrder(e) {
    e.preventDefault();
    if (!validateDraft()) return;
    await submitCustomerOrder({
      createOrder: orderApi.create,
      customerName,
      notes,
      cartItems,
      setError,
      setFieldErrors,
      setSubmitting,
      setLastOrder,
      setCart,
      setCustomerName,
      setNotes,
      setSheetOpen,
    });
  }

  async function handleTrack(e) {
    e.preventDefault();
    setTrackError('');
    setTrackedOrder(null);
    const validation = validateTrackCode(trackCode);
    if (!validation.valid) {
      setTrackError(validation.message);
      return;
    }
    try {
      const order = await orderApi.getByCode(validation.normalizedCode);
      setTrackedOrder(order);
    } catch (err) {
      setTrackError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <StorefrontHeader
        showTracker={showTracker}
        onToggleTracker={() => setShowTracker((v) => !v)}
        onOpenLogin={onOpenLogin}
      />

      <main className="max-w-6xl mx-auto px-3.5 sm:px-6 pt-6 sm:pt-8 pb-28 lg:pb-8">
        {showTracker && (
          <OrderTrackerSection
            trackCode={trackCode}
            trackError={trackError}
            trackedOrder={trackedOrder}
            onTrackCodeChange={(val) => {
              setTrackCode(val);
              if (trackError) setTrackError('');
            }}
            onSubmit={handleTrack}
          />
        )}

        <OrderSuccessBanner
          order={lastOrder}
          bannerRef={lastOrderBannerRef}
          onTrackOrder={() => {
            setTrackCode(lastOrder.code);
            setTrackedOrder(lastOrder);
            setTrackError('');
            setShowTracker(true);
            setLastOrder(null);
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 min-w-0">
            <PageHeader
              title="Daftar Menu Hari Ini"
              subtitle="Pilih makanan dan minuman favorit Anda, pesanan langsung tercatat ke dapur."
              titleClassName="text-2xl sm:text-3xl"
              subtitleClassName="mt-1"
              className="mb-5"
            />

            <FilterPillGroup
              options={MENU_CATEGORY_FILTERS}
              activeOption={category}
              onSelect={setCategory}
              className="mb-5"
            />

            {visibleMenus.length === 0 ? (
              <EmptyState
                title="Belum ada menu pada kategori ini"
                description="Pilih kategori lain untuk melihat menu yang tersedia."
                dashed={true}
                className="p-8"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {visibleMenus.map((menu) => (
                  <MenuCard
                    key={menu.id}
                    menu={menu}
                    qty={cart[menu.id] || 0}
                    isRecommended={topMenuNames.includes(menu.name)}
                    onUpdateQty={updateQty}
                  />
                ))}
              </div>
            )}
          </div>

          {isDesktop && (
            <aside className="lg:col-span-4 lg:sticky lg:top-22">
              <OrderSummaryPanel
                cartItems={cartItems}
                totalItems={totalItems}
                totalAmount={totalAmount}
                customerName={customerName}
                notes={notes}
                error={error}
                fieldErrors={fieldErrors}
                submitting={submitting}
                variant="sidebar"
                onCustomerNameChange={setCustomerName}
                onNotesChange={setNotes}
                onUpdateQty={updateQty}
                onSubmit={handleSubmitOrder}
              />
            </aside>
          )}
        </div>
      </main>

      {!isDesktop && (
        <MobileCartBar
          totalItems={totalItems}
          totalAmount={totalAmount}
          sheetOpen={sheetOpen}
          triggerRef={summaryTriggerRef}
          onOpenSheet={() => setSheetOpen(true)}
        />
      )}

      {!isDesktop && sheetOpen && (
        <>
          <div
            aria-hidden="true"
            onMouseDown={(e) => {
              backdropMouseDownRef.current = e.target === e.currentTarget;
            }}
            onClick={(e) => {
              const startedOnBackdrop = backdropMouseDownRef.current;
              backdropMouseDownRef.current = false;
              if (e.target === e.currentTarget && startedOnBackdrop) {
                closeSheet();
              }
            }}
            className="fixed inset-0 z-40 bg-black/40 cursor-pointer"
          />
          <div
            ref={dialogRef}
            tabIndex={-1}
            id="customer-order-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Pesanan Anda"
            className="fixed inset-x-0 bottom-0 z-50 w-full max-w-4xl mx-auto bg-white rounded-t-2xl border border-b-0 border-[#E7DFD3] max-h-[85dvh] flex flex-col overflow-hidden shadow-2xl pb-[env(safe-area-inset-bottom)]"
          >
            <OrderSummaryPanel
              cartItems={cartItems}
              totalItems={totalItems}
              totalAmount={totalAmount}
              customerName={customerName}
              notes={notes}
              error={error}
              fieldErrors={fieldErrors}
              submitting={submitting}
              variant="sheet"
              onCustomerNameChange={setCustomerName}
              onNotesChange={setNotes}
              onUpdateQty={updateQty}
              onSubmit={handleSubmitOrder}
              onClose={closeSheet}
            />
          </div>
        </>
      )}
    </div>
  );
}
