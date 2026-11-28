import { AlertTriangle, Sparkles } from 'lucide-react';
import Button from '../atoms/Button.jsx';
import Card from '../atoms/Card.jsx';

export default function AiInsightSection({
  loadingAi = false,
  aiError = '',
  aiInsight = null,
  onReload,
}) {
  return (
    <Card as="section" padding="md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#C84B24]" aria-hidden="true" />
          <h2 className="font-bold text-base text-[#1F1915]">AI Insight Penjualan</h2>
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <Button
            variant="link"
            size="inline"
            onClick={() => onReload?.(false)}
            className="-ml-2 sm:ml-0"
          >
            Muat Ulang Insight
          </Button>
          <span className="text-[#E7DFD3]" aria-hidden="true">
            |
          </span>
          <Button
            variant="ghost"
            size="inline"
            onClick={() => onReload?.(true)}
            className="font-medium hover:bg-transparent"
          >
            Uji Fallback AI
          </Button>
        </div>
      </div>

      {loadingAi ? (
        <p className="text-sm text-[#6B5E54]">Menganalisis data transaksi...</p>
      ) : aiError ? (
        <div
          role="alert"
          className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-amber-950">{aiError}</p>
            <p className="text-xs text-amber-800 mt-1">
              Fitur pencatatan pesanan dan laporan statistik tetap berjalan normal.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[#1F1915] leading-relaxed">{aiInsight?.summary}</p>
          <ul className="space-y-1.5">
            {(aiInsight?.recommendations || []).map((rec) => (
              <li key={rec} className="text-sm text-[#6B5E54] flex items-start gap-2">
                <span className="text-[#C84B24] font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
