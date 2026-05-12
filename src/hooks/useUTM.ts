import { useEffect, useState } from 'react';

const STORAGE_KEY = 'delicias-utm';
const FIELDS = ['utmSource', 'utmMedium', 'utmCampaign', 'utmContent'] as const;
type UtmField = (typeof FIELDS)[number];
const PARAM_MAP: Record<UtmField, string> = {
  utmSource: 'utm_source',
  utmMedium: 'utm_medium',
  utmCampaign: 'utm_campaign',
  utmContent: 'utm_content',
};

export type UTMParams = Partial<Record<UtmField, string>>;

function lerSession(): UTMParams {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function escreverSession(v: UTMParams) {
  try {
    if (Object.keys(v).length === 0) sessionStorage.removeItem(STORAGE_KEY);
    else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {
    // ignora
  }
}

/**
 * Captura UTMs da URL (?utm_source=...) na primeira visita da sessão e persiste
 * em sessionStorage. Após capturar, retorna sempre o mesmo set durante a aba.
 */
export function useUTM(): UTMParams {
  const [utm, setUtm] = useState<UTMParams>(() => lerSession());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const novo: UTMParams = { ...lerSession() };
    let mudou = false;
    for (const campo of FIELDS) {
      const valor = params.get(PARAM_MAP[campo]);
      if (valor && novo[campo] !== valor) {
        novo[campo] = valor;
        mudou = true;
      }
    }
    if (mudou) {
      escreverSession(novo);
      setUtm(novo);
    }
  }, []);

  return utm;
}

/** Lê UTMs salvos sem hook (pra usar no submit do checkout). */
export function getUTMSalvos(): UTMParams {
  return lerSession();
}
