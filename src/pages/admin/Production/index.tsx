import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSlotsRange } from '../../../hooks/useSlots';
import { BRAND } from '../../../styles/brand';

function startOfWeek(d: Date) {
  const copy = new Date(d);
  const day = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(d: Date, n: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function fmtDateISO(d: Date) {
  return d.toISOString().split('T')[0];
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function AdminProduction() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const from = useMemo(() => fmtDateISO(weekStart), [weekStart]);
  const to = useMemo(() => fmtDateISO(addDays(weekStart, 6)), [weekStart]);

  const { data: slots = [], isLoading } = useSlotsRange(from, to);

  const slotsByDay = useMemo(() => {
    const map = new Map<string, any[]>();
    for (let i = 0; i < 7; i++) {
      const key = fmtDateISO(addDays(weekStart, i));
      map.set(key, []);
    }
    for (const s of slots) {
      const key = s.data.split('T')[0];
      const arr = map.get(key);
      if (arr) arr.push(s);
    }
    return map;
  }, [slots, weekStart]);

  return (
    <div className="min-h-screen font-body" style={{ background: BRAND.bege }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl font-black text-brand-marrom">
              Produção
            </h1>
            <p className="text-brand-marrom/60 mt-1">
              Semana de {weekStart.toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setWeekStart((w) => addDays(w, -7))}
              className="px-4 py-2 rounded-full text-xs font-bold bg-white text-brand-marrom"
              style={{ border: `2px solid ${BRAND.begeEsc}` }}
            >
              ← Semana anterior
            </button>
            <button
              onClick={() => setWeekStart(startOfWeek(new Date()))}
              className="px-4 py-2 rounded-full text-xs font-bold text-white"
              style={{ background: BRAND.rosa }}
            >
              Hoje
            </button>
            <button
              onClick={() => setWeekStart((w) => addDays(w, 7))}
              className="px-4 py-2 rounded-full text-xs font-bold bg-white text-brand-marrom"
              style={{ border: `2px solid ${BRAND.begeEsc}` }}
            >
              Próxima semana →
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-brand-marrom/50 font-medium">
            Carregando slots...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {DIAS.map((dia, i) => {
              const day = addDays(weekStart, i);
              const key = fmtDateISO(day);
              const daySlots = slotsByDay.get(key) ?? [];

              return (
                <div key={key} className="flex flex-col gap-2">
                  <div className="text-center">
                    <div className="text-xs font-bold text-brand-marrom/50 uppercase">
                      {dia}
                    </div>
                    <div className="font-display text-2xl font-black text-brand-marrom">
                      {day.getDate()}
                    </div>
                  </div>

                  {daySlots.length === 0 ? (
                    <div
                      className="rounded-xl p-3 text-xs text-center text-brand-marrom/40"
                      style={{ border: `1.5px dashed ${BRAND.begeEsc}` }}
                    >
                      sem slots
                    </div>
                  ) : (
                    daySlots.map((s: any, idx: number) => {
                      const pct = s.percentualOcupado;
                      const barColor =
                        pct >= 100
                          ? '#CC0000'
                          : pct >= 75
                            ? '#B5651D'
                            : BRAND.rosa;
                      return (
                        <motion.div
                          key={s.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="bg-white rounded-xl p-3"
                          style={{
                            border: `1.5px solid ${BRAND.begeEsc}`,
                            boxShadow: '0 2px 8px rgba(66,39,22,.04)',
                          }}
                        >
                          <div className="text-xs font-bold text-brand-marrom">
                            {fmtTime(s.horaInicio)} — {fmtTime(s.horaFim)}
                          </div>
                          <div className="text-xs text-brand-marrom/60 mt-1">
                            {s.capacidadeOcupada}/{s.capacidadeMaxima} pts
                          </div>
                          <div
                            className="mt-2 h-1.5 rounded-full overflow-hidden"
                            style={{ background: BRAND.begeEsc }}
                          >
                            <div
                              className="h-full transition-all"
                              style={{
                                width: `${Math.min(pct, 100)}%`,
                                background: barColor,
                              }}
                            />
                          </div>
                          {s.reservas?.length > 0 && (
                            <div className="mt-2 text-[10px] text-brand-marrom/50">
                              {s.reservas.length} pedido
                              {s.reservas.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
