import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Menu,
  X,
  User,
  LogOut,
  ClipboardList,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useCartStore } from '../store/cart.store';

const ADMIN_ROLES = ['OPERADOR', 'GERENTE', 'ADMINISTRADOR'];

function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const items = useCartStore((s) => s.items);
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const cartCount = items.reduce((sum, i) => sum + i.quantidade, 0);
  const isAdmin = user && ADMIN_ROLES.includes(user.role);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close mobile menu on route change
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
    { to: '/cardapio', label: 'Cardápio' },
    { to: '/montar', label: 'Montar Bolo' },
  ];

  const isActiveLink = (path: string) => location.pathname === path;

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-brand-begeEsc/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <Link
              to="/"
              className="flex-shrink-0 font-display text-2xl text-brand-marrom hover:text-brand-rosa transition-colors duration-200"
            >
              Delícias da Vann
            </Link>

            {/* Center: Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    relative px-4 py-2 rounded-full font-body font-semibold text-sm tracking-wide transition-all duration-200
                    ${
                      isActiveLink(link.to)
                        ? 'text-brand-rosa bg-brand-rosa/10'
                        : 'text-brand-marrom hover:text-brand-rosa hover:bg-brand-rosa/5'
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-full font-body font-semibold text-sm tracking-wide transition-all duration-200
                    ${
                      location.pathname.startsWith('/admin')
                        ? 'text-brand-rosa bg-brand-rosa/10'
                        : 'text-brand-marrom hover:text-brand-rosa hover:bg-brand-rosa/5'
                    }
                  `}
                >
                  <Settings size={15} />
                  Admin
                </Link>
              )}
            </nav>

            {/* Right: Cart + Auth + Mobile toggle */}
            <div className="flex items-center gap-2">
              {/* Cart icon — always visible */}
              <Link
                to="/checkout"
                className="relative p-2 rounded-full text-brand-marrom hover:text-brand-rosa hover:bg-brand-rosa/5 transition-all duration-200"
                aria-label="Carrinho"
              >
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-body font-bold text-white bg-brand-rosa rounded-full shadow-sm">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Desktop auth */}
              <div className="hidden md:block">
                {isAuthenticated && user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-full text-brand-marrom hover:text-brand-rosa hover:bg-brand-rosa/5 transition-all duration-200 font-body font-semibold text-sm"
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-rosa/15 flex items-center justify-center">
                        <User size={16} className="text-brand-rosa" />
                      </div>
                      <span className="max-w-[120px] truncate">
                        {user.nome.split(' ')[0]}
                      </span>
                    </button>

                    {/* Dropdown */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-brand-begeEsc/30 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-4 py-2 border-b border-brand-begeEsc/30">
                          <p className="font-body font-semibold text-sm text-brand-marrom truncate">
                            {user.nome}
                          </p>
                          <p className="font-body text-xs text-brand-marrom/60 truncate">
                            {user.email}
                          </p>
                        </div>
                        <Link
                          to="/pedidos"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-body text-brand-marrom hover:bg-brand-bege transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <ClipboardList size={16} className="text-brand-rosa" />
                          Meus Pedidos
                        </Link>
                        <Link
                          to="/perfil"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-body text-brand-marrom hover:bg-brand-bege transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User size={16} className="text-brand-rosa" />
                          Perfil
                        </Link>
                        <div className="border-t border-brand-begeEsc/30 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-body text-brand-marrom hover:bg-brand-bege transition-colors"
                          >
                            <LogOut size={16} className="text-brand-rosa" />
                            Sair
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="px-5 py-2 rounded-full bg-brand-rosa text-white font-body font-semibold text-sm hover:bg-brand-rosa/90 transition-colors duration-200 shadow-sm"
                  >
                    Entrar
                  </Link>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-full text-brand-marrom hover:text-brand-rosa hover:bg-brand-rosa/5 transition-all duration-200"
                aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile slide-in menu */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-brand-marrom/30 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-out md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-brand-begeEsc/30">
          <span className="font-display text-lg text-brand-marrom">Menu</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-full text-brand-marrom hover:text-brand-rosa hover:bg-brand-rosa/5 transition-all"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col px-3 py-4 gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-3 rounded-xl font-body font-semibold text-sm transition-all duration-200 ${
                isActiveLink(link.to)
                  ? 'text-brand-rosa bg-brand-rosa/10'
                  : 'text-brand-marrom hover:text-brand-rosa hover:bg-brand-rosa/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-body font-semibold text-sm transition-all duration-200 ${
                location.pathname.startsWith('/admin')
                  ? 'text-brand-rosa bg-brand-rosa/10'
                  : 'text-brand-marrom hover:text-brand-rosa hover:bg-brand-rosa/5'
              }`}
            >
              <Settings size={16} />
              Admin
            </Link>
          )}
        </nav>

        <div className="border-t border-brand-begeEsc/30 px-3 py-4">
          {isAuthenticated && user ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-brand-rosa/15 flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-brand-rosa" />
                </div>
                <div className="min-w-0">
                  <p className="font-body font-semibold text-sm text-brand-marrom truncate">
                    {user.nome}
                  </p>
                  <p className="font-body text-xs text-brand-marrom/60 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <Link
                to="/pedidos"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body text-brand-marrom hover:bg-brand-bege transition-colors"
              >
                <ClipboardList size={16} className="text-brand-rosa" />
                Meus Pedidos
              </Link>
              <Link
                to="/perfil"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body text-brand-marrom hover:bg-brand-bege transition-colors"
              >
                <User size={16} className="text-brand-rosa" />
                Perfil
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-body text-brand-marrom hover:bg-brand-bege transition-colors"
              >
                <LogOut size={16} className="text-brand-rosa" />
                Sair
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center w-full px-5 py-3 rounded-xl bg-brand-rosa text-white font-body font-semibold text-sm hover:bg-brand-rosa/90 transition-colors shadow-sm"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bege">
      <Header />
      <main className="pt-16">{children}</main>
    </div>
  );
}
