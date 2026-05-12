import { useEffect, useRef } from 'react';
import { api } from '../services/api';

const SESSAO_KEY = 'delicias-funil-sessao';

function getSessaoId(): string {
  try {
    let sid = localStorage.getItem(SESSAO_KEY);
    if (!sid) {
      sid = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSAO_KEY, sid);
    }
    return sid;
  } catch {
    return `s_ephemeral_${Date.now()}`;
  }
}

async function dispararEvento(etapa: string, payload?: Record<string, any>) {
  try {
    await api.post('/telemetria/evento', {
      sessaoId: getSessaoId(),
      etapa,
      payload: payload ?? undefined,
    });
  } catch {
    // falha silenciosa — telemetria nao bloqueia UX
  }
}

/** Dispara um evento simples de funil (fire-and-forget). */
export function trackFunil(etapa: string, payload?: Record<string, any>) {
  void dispararEvento(etapa, payload);
}

/** Hook que dispara `etapa` ao montar e novamente quando `key` muda. */
export function useTrackEtapa(etapa: string, key?: any, payload?: Record<string, any>) {
  const ultimoRef = useRef<string | null>(null);
  useEffect(() => {
    const composite = `${etapa}:${JSON.stringify(key ?? null)}`;
    if (ultimoRef.current === composite) return;
    ultimoRef.current = composite;
    void dispararEvento(etapa, payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapa, JSON.stringify(key)]);
}

/** Marca abandono quando a aba fica oculta com a etapa atual. */
export function useTrackAbandono(getEtapaAtual: () => string | null) {
  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState !== 'hidden') return;
      const etapa = getEtapaAtual();
      if (!etapa) return;
      void dispararEvento('ABANDONO', { etapaAtual: etapa });
    };
    document.addEventListener('visibilitychange', onHidden);
    return () => document.removeEventListener('visibilitychange', onHidden);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
