import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Menu,
  X,
  User,
  LogOut,
  ClipboardList,
  Settings,
  Cake,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useCartStore } from '../store/cart.store';
import { BRAND } from '../styles/brand';

const ADMIN_ROLES = ['OPERADOR', 'GERENTE', 'ADMINISTRADOR'];

/* ─── Tiny decorative star ─── */
function NavStar({ size = 8, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <path
        d="M50 0L61 28 82 10 70 37 99 38 77 55 91 80 64 72 62 99 50 78 38 99 36 72 9 80 23 55 1 38 30 37 18 10 43 28Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ─── Stacked Logo ─── */
function StackedLogo() {
  return (
    <Link to="/" className="flex-shrink-0 group relative" aria-label="Início">
      <div style={{ lineHeight: 0.75, letterSpacing: '-0.02em' }}>
        <span
          className="font-display block"
          style={{
            fontSize: 18,
            fontWeight: 800,
            fontStyle: 'italic',
            color: BRAND.rosa,
            transform: 'translateY(2px)',
            transition: 'color 0.3s',
          }}
        >
          delícias
        </span>
        <span
          className="font-display block"
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: BRAND.marrom,
            letterSpacing: '-0.04em',
            transition: 'color 0.3s',
          }}
        >
          <span
            style={{
              fontSize: 10,
              verticalAlign: 'super',
              marginRight: 2,
              fontWeight: 800,
              fontStyle: 'italic',
              color: BRAND.rosa,
            }}
          >
            da
          </span>
          van
        </span>
      </div>
      {/* Hover underline drip effect */}
      <span
        className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
        style={{ background: BRAND.rosa }}
      />
    </Link>
  );
}

function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const cartCount = items.reduce((sum, i) => sum + i.quantidade, 0);
  const isAdmin = user && ADMIN_ROLES.includes(user.role);

  // Track scroll for header style change
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  }

  const navLinks = [
    { to: '/', label: 'início' },
    { to: '/cardapio', label: 'cardápio' },
    { to: '/montar', label: 'montar bolo' },
  ];

  const isActiveLink = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 w-full z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? `${BRAND.bege}f2`
            : `${BRAND.bege}00`,
          backdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'none',
          borderBottom: scrolled ? `1px solid ${BRAND.begeEsc}88` : '1px solid transparent',
          boxShadow: scrolled
            ? '0 4px 30px rgba(66,39,22,0.06)'
            : 'none',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-5 md:px-8">
          <div className="flex items-center justify-between h-[68px]">
            {/* ── Logo ── */}
            <StackedLogo />

            {/* ── Desktop Navigation ── */}
            <nav className="hidden md:flex items-center">
              <div
                className="flex items-center gap-0.5 p-1 rounded-full"
                style={{
                  background: `${BRAND.branco}cc`,
                  border: `1px solid ${BRAND.begeEsc}66`,
                  boxShadow: '0 2px 12px rgba(66,39,22,0.04)',
                }}
              >
                {navLinks.map((link) => {
                  const active = isActiveLink(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="relative px-5 py-2 font-body text-[13px] font-semibold tracking-wide transition-all duration-300"
                      style={{
                        color: active ? BRAND.branco : BRAND.marrom,
                        borderRadius: 999,
                      }}
                    >
                      {active && (
                        <motion.div
                          layoutId="navPill"
                          className="absolute inset-0 rounded-full"
                          style={{ background: BRAND.marrom }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{link.label}</span>
                    </Link>
                  );
                })}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="relative flex items-center gap-1.5 px-4 py-2 font-body text-[13px] font-semibold tracking-wide transition-all duration-300"
                    style={{
                      color: location.pathname.startsWith('/admin') ? BRAND.branco : BRAND.marrom,
                      borderRadius: 999,
                    }}
                  >
                    {location.pathname.startsWith('/admin') && (
                      <motion.div
                        layoutId="navPill"
                        className="absolute inset-0 rounded-full"
                        style={{ background: BRAND.marrom }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Settings size={13} className="relative z-10" />
                    <span className="relative z-10">admin</span>
                  </Link>
                )}
              </div>
            </nav>

            {/* ── Right side: Cart + User + Mobile ── */}
            <div className="flex items-center gap-1.5">
              {/* Cart */}
              <Link
                to="/checkout"
                className="relative group p-2.5 rounded-full transition-all duration-300"
                style={{
                  background: cartCount > 0 ? `${BRAND.rosa}15` : 'transparent',
                  color: BRAND.marrom,
                }}
                aria-label="Carrinho"
              >
                <ShoppingBag
                  size={20}
                  strokeWidth={2.2}
                  className="group-hover:scale-110 transition-transform duration-300"
                  style={{ color: cartCount > 0 ? BRAND.rosa : BRAND.marrom }}
                />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key="cart-badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 flex items-center justify-center font-body font-bold"
                      style={{
                        minWidth: 20,
                        height: 20,
                        padding: '0 5px',
                        fontSize: 10,
                        color: BRAND.bege,
                        background: BRAND.rosa,
                        borderRadius: 999,
                        border: `2px solid ${BRAND.bege}`,
                        boxShadow: '0 2px 8px rgba(237,113,162,0.35)',
                      }}
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Desktop User Menu */}
              <div className="hidden md:block">
                {isAuthenticated && user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 py-1.5 pl-1.5 pr-3 rounded-full font-body font-semibold text-[13px] transition-all duration-300"
                      style={{
                        background: userMenuOpen ? `${BRAND.rosa}15` : `${BRAND.branco}cc`,
                        border: `1px solid ${userMenuOpen ? BRAND.rosa + '40' : BRAND.begeEsc + '66'}`,
                        color: BRAND.marrom,
                        boxShadow: '0 2px 12px rgba(66,39,22,0.04)',
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-[13px]"
                        style={{ background: BRAND.rosa, color: BRAND.bege }}
                      >
                        {user.nome.charAt(0).toUpperCase()}
                      </div>
                      <span className="max-w-[80px] truncate">{user.nome.split(' ')[0]}</span>
                      <ChevronDown
                        size={14}
                        className="transition-transform duration-200"
                        style={{
                          transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          opacity: 0.5,
                        }}
                      />
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute right-0 mt-2 w-60 overflow-hidden"
                          style={{
                            background: BRAND.branco,
                            borderRadius: 20,
                            border: `1px solid ${BRAND.begeEsc}66`,
                            boxShadow:
                              '0 20px 40px rgba(66,39,22,0.12), 0 4px 12px rgba(66,39,22,0.06)',
                          }}
                        >
                          {/* User info header */}
                          <div
                            className="px-5 py-4"
                            style={{
                              background: `linear-gradient(135deg, ${BRAND.rosa}12, ${BRAND.roxo}08)`,
                              borderBottom: `1px solid ${BRAND.begeEsc}44`,
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-base"
                                style={{ background: BRAND.rosa, color: BRAND.bege }}
                              >
                                {user.nome.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p
                                  className="font-display font-semibold text-sm truncate"
                                  style={{ color: BRAND.marrom }}
                                >
                                  {user.nome}
                                </p>
                                <p
                                  className="font-body text-[11px] truncate"
                                  style={{ color: `${BRAND.marrom}88` }}
                                >
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="py-2 px-2">
                            <Link
                              to="/pedidos"
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-[13px] font-medium transition-all duration-200"
                              style={{ color: BRAND.marrom }}
                              onClick={() => setUserMenuOpen(false)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = `${BRAND.rosa}0c`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <ClipboardList size={16} style={{ color: BRAND.rosa }} />
                              meus pedidos
                            </Link>
                            <Link
                              to="/perfil"
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-body text-[13px] font-medium transition-all duration-200"
                              style={{ color: BRAND.marrom }}
                              onClick={() => setUserMenuOpen(false)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = `${BRAND.rosa}0c`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <User size={16} style={{ color: BRAND.rosa }} />
                              perfil
                            </Link>
                          </div>

                          <div style={{ borderTop: `1px dashed ${BRAND.begeEsc}66` }} className="px-2 py-2">
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-body text-[13px] font-medium transition-all duration-200"
                              style={{ color: `${BRAND.marrom}99` }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = `${BRAND.rosa}0c`;
                                e.currentTarget.style.color = BRAND.marrom;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = `${BRAND.marrom}99`;
                              }}
                            >
                              <LogOut size={16} style={{ color: BRAND.rosa }} />
                              sair
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="group flex items-center gap-2 py-2 pl-4 pr-5 rounded-full font-body font-bold text-[13px] transition-all duration-300"
                    style={{
                      background: BRAND.marrom,
                      color: BRAND.bege,
                      boxShadow: '0 2px 12px rgba(66,39,22,0.15)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = BRAND.rosa;
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(237,113,162,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = BRAND.marrom;
                      e.currentTarget.style.boxShadow = '0 2px 12px rgba(66,39,22,0.15)';
                    }}
                  >
                    <Cake size={15} className="group-hover:rotate-12 transition-transform duration-300" />
                    entrar
                  </Link>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2.5 rounded-full transition-all duration-300"
                style={{
                  color: BRAND.marrom,
                  background: mobileOpen ? `${BRAND.rosa}15` : 'transparent',
                }}
                aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ─── Mobile Menu ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{
                background: `${BRAND.marrom}40`,
                backdropFilter: 'blur(8px)',
              }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 h-full w-[300px] md:hidden flex flex-col"
              style={{
                background: BRAND.bege,
                boxShadow: '-20px 0 60px rgba(66,39,22,0.15)',
              }}
            >
              {/* Mobile header */}
              <div
                className="flex items-center justify-between px-6 h-[68px] flex-shrink-0"
                style={{ borderBottom: `1px dashed ${BRAND.begeEsc}` }}
              >
                <div className="flex items-center gap-2">
                  <NavStar size={10} className="text-brand-rosa" />
                  <span className="font-display text-lg font-bold" style={{ color: BRAND.marrom }}>
                    menu
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-full transition-all"
                  style={{ color: BRAND.marrom }}
                  aria-label="Fechar"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col px-4 py-6 gap-1 flex-1">
                {navLinks.map((link, i) => {
                  const active = isActiveLink(link.to);
                  return (
                    <motion.div
                      key={link.to}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.05 }}
                    >
                      <Link
                        to={link.to}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-display text-[15px] font-semibold transition-all duration-200"
                        style={{
                          color: active ? BRAND.bege : BRAND.marrom,
                          background: active ? BRAND.marrom : 'transparent',
                          fontStyle: 'italic',
                        }}
                      >
                        {active && <NavStar size={8} className="text-brand-rosa" />}
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
                {isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-display text-[15px] font-semibold transition-all duration-200"
                      style={{
                        color: location.pathname.startsWith('/admin') ? BRAND.bege : BRAND.marrom,
                        background: location.pathname.startsWith('/admin') ? BRAND.marrom : 'transparent',
                        fontStyle: 'italic',
                      }}
                    >
                      <Settings size={16} />
                      admin
                    </Link>
                  </motion.div>
                )}
              </nav>

              {/* User section at bottom */}
              <div
                className="flex-shrink-0 px-4 py-5"
                style={{ borderTop: `1px dashed ${BRAND.begeEsc}` }}
              >
                {isAuthenticated && user ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex flex-col gap-1"
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-base flex-shrink-0"
                        style={{ background: BRAND.rosa, color: BRAND.bege }}
                      >
                        {user.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-sm truncate" style={{ color: BRAND.marrom }}>
                          {user.nome}
                        </p>
                        <p className="font-body text-[11px] truncate" style={{ color: `${BRAND.marrom}77` }}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/pedidos"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl font-body text-[13px] font-medium"
                      style={{ color: BRAND.marrom }}
                    >
                      <ClipboardList size={16} style={{ color: BRAND.rosa }} />
                      meus pedidos
                    </Link>
                    <Link
                      to="/perfil"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl font-body text-[13px] font-medium"
                      style={{ color: BRAND.marrom }}
                    >
                      <User size={16} style={{ color: BRAND.rosa }} />
                      perfil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-body text-[13px] font-medium"
                      style={{ color: `${BRAND.marrom}88` }}
                    >
                      <LogOut size={16} style={{ color: BRAND.rosa }} />
                      sair
                    </button>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <Link
                      to="/login"
                      className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-body font-bold text-sm"
                      style={{
                        background: BRAND.marrom,
                        color: BRAND.bege,
                        boxShadow: '0 4px 16px rgba(66,39,22,0.2)',
                      }}
                    >
                      <Cake size={16} />
                      entrar
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: BRAND.bege }}>
      <Header />
      <main className="pt-[68px]">{children}</main>
    </div>
  );
}
