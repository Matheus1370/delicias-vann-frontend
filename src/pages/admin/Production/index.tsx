import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSlotsRange } from '../../../hooks/useSlots';
import { BRAND } from '../../../styles/brand';
import { Star11 } from '../../../components/BrandElements';

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

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <div style={{ fontSize: 12, color: BRAND.rosa, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'Space Grotesk' }}>
            <Star11 size={12} color={BRAND.rosa} /> calendario de producao
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1
                className="font-display"
                style={{
                  fontSize: 'clamp(36px, 5vw, 64px)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  lineHeight: 0.95,
                  fontStyle: 'italic',
                  color: BRAND.marrom,
                  marginTop: 8,
                }}
              >
                producao<span style={{ color: BRAND.rosa }}>.</span>
              </h1>
              <p className="font-mono" style={{ color: `${BRAND.marrom}88`, fontSize: 12, marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Semana de {weekStart.toLocaleDateString('pt-BR')}
              </p>
            </div>

            {/* Week nav */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setWeekStart((w) => addDays(w, -7))}
                style={{
                  padding: '8px 18px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  background: BRAND.branco,
                  color: BRAND.marrom,
                  border: `1.5px solid ${BRAND.begeEsc}`,
                  cursor: 'pointer',
                }}
              >
                ← Anterior
              </button>
              <button
                onClick={() => setWeekStart(startOfWeek(new Date()))}
                style={{
                  padding: '8px 18px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  background: BRAND.rosa,
                  color: BRAND.branco,
                  border: `1.5px solid ${BRAND.rosa}`,
                  cursor: 'pointer',
                }}
              >
                Hoje
              </button>
              <button
                onClick={() => setWeekStart((w) => addDays(w, 7))}
                style={{
                  padding: '8px 18px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  background: BRAND.branco,
                  color: BRAND.marrom,
                  border: `1.5px solid ${BRAND.begeEsc}`,
                  cursor: 'pointer',
                }}
              >
                Proxima →
              </button>
            </div>
          </div>
        </motion.div>

        {/* Calendar grid */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '80px 0', color: `${BRAND.marrom}77`, fontWeight: 500 }}
          >
            Carregando slots...
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
            {DIAS.map((dia, i) => {
              const day = addDays(weekStart, i);
              const key = fmtDateISO(day);
              const daySlots = slotsByDay.get(key) ?? [];
              const isToday = fmtDateISO(new Date()) === key;

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  {/* Day header */}
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '12px 0',
                      borderRadius: 16,
                      background: isToday ? BRAND.rosa : 'transparent',
                    }}
                  >
                    <div className="font-mono" style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: isToday ? `${BRAND.branco}bb` : `${BRAND.marrom}66`,
                    }}>
                      {dia}
                    </div>
                    <div className="font-display" style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: isToday ? BRAND.branco : BRAND.marrom,
                    }}>
                      {day.getDate()}
                    </div>
                  </div>

                  {/* Slots */}
                  {daySlots.length === 0 ? (
                    <div
                      style={{
                        borderRadius: 16,
                        padding: 16,
                        textAlign: 'center',
                        border: `1.5px dashed ${BRAND.begeEsc}`,
                        fontSize: 11,
                        color: `${BRAND.marrom}55`,
                      }}
                    >
                      sem slots
                    </div>
                  ) : (
                    daySlots.map((s: any, idx: number) => {
                      const pct = s.percentualOcupado;
                      const barColor =
                        pct >= 100 ? '#DC2626' : pct >= 75 ? '#F59E0B' : BRAND.rosa;
                      return (
                        <motion.div
                          key={s.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          style={{
                            background: BRAND.branco,
                            borderRadius: 16,
                            padding: 14,
                            border: `1px solid ${BRAND.begeEsc}`,
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.marrom }}>
                            {fmtTime(s.horaInicio)} — {fmtTime(s.horaFim)}
                          </div>
                          <div className="font-mono" style={{ fontSize: 11, color: `${BRAND.marrom}88`, marginTop: 4 }}>
                            {s.capacidadeOcupada}/{s.capacidadeMaxima} pts
                          </div>
                          {/* Capacity bar */}
                          <div
                            style={{
                              marginTop: 8,
                              height: 6,
                              borderRadius: 999,
                              background: BRAND.begeEsc,
                              overflow: 'hidden',
                            }}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(pct, 100)}%` }}
                              transition={{ duration: 0.6, delay: idx * 0.05 }}
                              style={{
                                height: '100%',
                                borderRadius: 999,
                                background: barColor,
                              }}
                            />
                          </div>
                          {s.reservas?.length > 0 && (
                            <div className="font-mono" style={{ marginTop: 6, fontSize: 10, color: `${BRAND.marrom}66` }}>
                              {s.reservas.length} pedido{s.reservas.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
