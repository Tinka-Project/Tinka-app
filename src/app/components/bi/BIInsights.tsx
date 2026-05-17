import { useMemo } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Download, Share2 } from 'lucide-react';
import { useApp, Sale } from '../../contexts/AppContext';
import { formatBs } from '../../utils/currency';
import { toast } from 'sonner';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const HOUR_RANGES = ['8-10', '10-12', '12-14', '14-16', '16-18', '18-20'];

function thisMonthSales(sales: Sale[]) {
  const now = new Date();
  return sales.filter(s => {
    const d = new Date(s.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}

function getTopProduct(sales: Sale[]) {
  const map: Record<string, { total: number; count: number }> = {};
  sales.forEach(s => {
    if (!map[s.product]) map[s.product] = { total: 0, count: 0 };
    map[s.product].total += s.amount;
    map[s.product].count += 1;
  });
  const sorted = Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  return sorted[0] ?? null;
}

function getBestDay(sales: Sale[]) {
  const map: Record<number, number> = {};
  sales.forEach(s => {
    const day = new Date(s.date).getDay();
    map[day] = (map[day] ?? 0) + s.amount;
  });
  const sorted = Object.entries(map).sort((a, b) => Number(b[1]) - Number(a[1]));
  return sorted[0] ? Number(sorted[0][0]) : -1;
}

function getDailyMap(sales: Sale[]) {
  const map: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  sales.forEach(s => {
    const day = new Date(s.date).getDay();
    map[day] = (map[day] ?? 0) + s.amount;
  });
  return map;
}

function getHourlyMap(sales: Sale[]) {
  const map: Record<string, number> = {};
  HOUR_RANGES.forEach(r => { map[r] = 0; });
  sales.forEach(s => {
    const h = new Date(s.date).getHours();
    const range = HOUR_RANGES.find(r => {
      const [start] = r.split('-').map(Number);
      return h >= start && h < start + 2;
    });
    if (range) map[range] = (map[range] ?? 0) + s.amount;
  });
  return map;
}

function getTopPayment(sales: Sale[]) {
  const map: Record<string, number> = {};
  sales.forEach(s => { map[s.paymentMethod] = (map[s.paymentMethod] ?? 0) + s.amount; });
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? null;
}

const PAYMENT_NAMES: Record<string, string> = { cash: 'Efectivo', qr: 'QR', transfer: 'Transferencia', card: 'Tarjeta' };

export function BIInsights() {
  const { sales, categories, user } = useApp();

  const monthlySales = useMemo(() => thisMonthSales(sales), [sales]);
  const monthTotal = useMemo(() => monthlySales.reduce((s, t) => s + t.amount, 0), [monthlySales]);

  const daysPassed = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const projection = daysPassed > 0 ? (monthTotal / daysPassed) * daysInMonth : 0;
  const goal = user?.monthlySalesGoal ?? 8000;
  const goalPct = Math.min(100, Math.round((projection / goal) * 100));

  const topProduct = useMemo(() => getTopProduct(sales), [sales]);
  const bestDay = useMemo(() => getBestDay(sales), [sales]);
  const dailyMap = useMemo(() => getDailyMap(sales), [sales]);
  const hourlyMap = useMemo(() => getHourlyMap(sales), [sales]);
  const topPayment = useMemo(() => getTopPayment(sales), [sales]);

  const maxDaily = Math.max(...Object.values(dailyMap), 1);
  const maxHourly = Math.max(...Object.values(hourlyMap), 1);

  const recommendations = useMemo(() => {
    const recs: { icon: string; text: string; type: 'info' | 'warning' | 'success' }[] = [];

    if (bestDay >= 0) {
      recs.push({
        icon: '📅',
        text: `Los ${DAY_NAMES[bestDay]} vendes significativamente más. Considera aumentar tu stock ese día.`,
        type: 'info',
      });
    }
    if (topProduct) {
      const margin = Math.round(((topProduct[1].total / topProduct[1].count) / topProduct[1].total) * 100 * 50);
      recs.push({
        icon: '💡',
        text: `"${topProduct[0]}" es tu producto más rentable con Bs ${formatBs(topProduct[1].total)} vendidos este período.`,
        type: 'success',
      });
    }
    if (topPayment) {
      recs.push({
        icon: '📱',
        text: `El ${PAYMENT_NAMES[topPayment] ?? topPayment} es tu método de cobro más usado. Mantén ese canal disponible siempre.`,
        type: 'info',
      });
    }
    if (projection < goal * 0.7) {
      recs.push({
        icon: '⚠️',
        text: `Estás en camino a alcanzar ${formatBs(projection)} este mes (meta: ${formatBs(goal)}). Considera una promoción en feria.`,
        type: 'warning',
      });
    }
    if (projection >= goal) {
      recs.push({
        icon: '🏆',
        text: `¡Vas a superar tu meta mensual de ${formatBs(goal)}! Proyección: ${formatBs(projection)}. Excelente trabajo.`,
        type: 'success',
      });
    }
    return recs;
  }, [bestDay, topProduct, topPayment, projection, goal]);

  const handleExport = () => {
    toast.success('📄 Reporte listo para exportar', {
      description: 'PDF con resumen ejecutivo e insights IA',
      duration: 3500,
      action: { label: 'Compartir', onClick: () => {} },
    });
  };

  return (
    <div className="bg-background pb-4">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp size={20} style={{ color: '#d946ef' }} />
            Inteligencia de Negocio
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Análisis IA basado en tus ventas</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border text-xs text-muted-foreground"
        >
          <Download size={13} />
          Exportar
        </button>
      </div>

      {/* Projection card */}
      <div className="px-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl border border-border"
          style={{ background: 'linear-gradient(135deg, #1a0a2e, #2d1055)' }}
        >
          <p className="text-xs text-purple-300 mb-1">Proyección del mes</p>
          <p className="text-4xl font-bold text-white mb-1">{formatBs(projection)}</p>
          <p className="text-sm text-purple-200 mb-4">Meta: {formatBs(goal)} · {goalPct}% proyectado</p>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: goalPct >= 100 ? '#10b981' : 'linear-gradient(90deg, #9333ea, #d946ef)' }}
              initial={{ width: 0 }}
              animate={{ width: `${goalPct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-purple-300 mt-2">
            Basado en {daysPassed} días de {daysInMonth} del mes
          </p>
        </motion.div>
      </div>

      {/* Day heatmap */}
      <div className="px-5 mb-5">
        <p className="text-sm font-semibold mb-3">Ventas por día de la semana</p>
        <div className="p-4 rounded-2xl bg-card border border-border">
          <div className="flex items-end gap-2 h-20">
            {DAY_NAMES.map((day, i) => {
              const val = dailyMap[i] ?? 0;
              const pct = Math.max((val / maxDaily) * 100, 4);
              const isBest = i === bestDay;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex flex-col justify-end" style={{ height: '64px' }}>
                    <motion.div
                      className="w-full rounded-t-lg"
                      style={{ height: `${pct}%`, backgroundColor: isBest ? '#d946ef' : '#3f3f46' }}
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{ duration: 0.7, delay: i * 0.07 }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground" style={{ color: isBest ? '#d946ef' : undefined }}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
          {bestDay >= 0 && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              🏆 Mejor día: <span style={{ color: '#d946ef' }}>{DAY_NAMES[bestDay]}</span>
            </p>
          )}
        </div>
      </div>

      {/* Hour heatmap */}
      <div className="px-5 mb-5">
        <p className="text-sm font-semibold mb-3">Horarios de mayor venta</p>
        <div className="p-4 rounded-2xl bg-card border border-border">
          <div className="space-y-2">
            {HOUR_RANGES.map(range => {
              const val = hourlyMap[range] ?? 0;
              const pct = maxHourly > 0 ? (val / maxHourly) * 100 : 0;
              const isTop = val === maxHourly && val > 0;
              return (
                <div key={range} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-12 flex-shrink-0">{range}h</span>
                  <div className="flex-1 h-4 bg-[#27272a] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: isTop ? '#d946ef' : '#3f3f46' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(pct, val > 0 ? 4 : 0)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  {val > 0 && (
                    <span className="text-xs text-muted-foreground w-20 text-right flex-shrink-0">
                      {formatBs(val)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="px-5">
        <p className="text-sm font-semibold mb-3">Recomendaciones IA</p>
        <div className="space-y-3">
          {recommendations.map((rec, i) => {
            const borderColor = rec.type === 'success' ? '#10b981' : rec.type === 'warning' ? '#f59e0b' : '#d946ef';
            const bgColor = rec.type === 'success' ? '#10b98115' : rec.type === 'warning' ? '#f59e0b15' : '#d946ef15';
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-4 rounded-2xl border"
                style={{ backgroundColor: bgColor, borderColor: borderColor + '44' }}
              >
                <span className="text-xl flex-shrink-0">{rec.icon}</span>
                <p className="text-sm text-foreground leading-relaxed">{rec.text}</p>
              </motion.div>
            );
          })}

          {recommendations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <span className="text-3xl block mb-2">🤖</span>
              <p className="text-sm">Registra más ventas para obtener insights personalizados</p>
            </div>
          )}
        </div>

        {/* Share report */}
        {recommendations.length > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExport}
            className="w-full mt-5 py-4 rounded-2xl border border-[#d946ef]/40 flex items-center justify-center gap-2 text-sm font-medium"
            style={{ color: '#d946ef', backgroundColor: '#d946ef11' }}
          >
            <Share2 size={16} />
            Compartir reporte con mi contador
          </motion.button>
        )}
      </div>
    </div>
  );
}
