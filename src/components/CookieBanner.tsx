import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND } from '../styles/brand';

const KEY = 'delicias-cookie-consent';

export default function CookieBanner() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) {
      setVisivel(true);
    }
  }, []);

  const aceitar = () => {
    localStorage.setItem(KEY, 'accepted');
    setVisivel(false);
  };

  const recusar = () => {
    localStorage.setItem(KEY, 'rejected');
    setVisivel(false);
  };

  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
        >
          <div
            className="bg-white rounded-2xl p-5 shadow-2xl"
            style={{ border: `2px solid ${BRAND.rosa}` }}
          >
            <div className="text-sm font-medium text-brand-marrom mb-3">
              Usamos cookies para melhorar sua experiência. Leia nossa{' '}
              <Link
                to="/privacidade"
                className="font-bold underline"
                style={{ color: BRAND.rosa }}
              >
                política de privacidade
              </Link>
              .
            </div>
            <div className="flex gap-2">
              <button
                onClick={recusar}
                className="flex-1 py-2 rounded-xl text-xs font-bold"
                style={{
                  background: BRAND.bege,
                  color: BRAND.marrom,
                  border: `1.5px solid ${BRAND.begeEsc}`,
                }}
              >
                Recusar
              </button>
              <button
                onClick={aceitar}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white"
                style={{ background: BRAND.rosa }}
              >
                Aceitar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
