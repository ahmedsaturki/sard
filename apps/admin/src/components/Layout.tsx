import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn, useTheme, useRtl } from '@sard/components';
import { defaultEditorConfig } from '@sard/visual-editor';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/collections', label: 'Collections', icon: 'database' },
  { path: '/media', label: 'Media', icon: 'image' },
  { path: '/export', label: 'Static Export', icon: 'download' },
  { path: '/handoff', label: 'Client Handoff', icon: 'users' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

const ICONS = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  database: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5V19A9 3 0 0 0 21 19" />
    </svg>
  ),
  image: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  download: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 1 4.6 9a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V15a2 2 0 0 1 2 2 2 2 0 0 1 2 2h.09a1.65 1.65 0 0 1 1 1.51 1.65 1.65 0 0 0 1.82.33l.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82H9a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 1 3 4.6a1.65 1.65 0 0 0-1.82-.33l-.06-.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0 1.51-1H15a2 2 0 0 1 2 2 2 2 0 0 1 2 2v.09A1.65 1.65 0 0 1 19.4 9a1.65 1.65 0 0 0 1.82.33l.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a2 2 0 0 1-2 2 2 2 0 0 1-2-2h-.09A1.65 1.65 0 0 1 15 3a1.65 1.65 0 0 0-1.82-.33l-.06-.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2h.09A1.65 1.65 0 0 1 21 4.6a1.65 1.65 0 0 0 1.82.33l.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82H15a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 1 9 1a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0 2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 1 4.6 1a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82H9a2 2 0 0 1 2-2 2 2 0 0 1 2 2h.09A1.65 1.65 0 0 1 15 1a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0-.33-1.82H3a2 2 0 0 1-2 2 2 2 0 0 1 2 2z" />
    </svg>
  ),
  menu: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  sun: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  moon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  user: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  logout: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  chevronRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  chevronDown: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  globe: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  unlock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  alertTriangle: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

export function Layout() {
  const location = useLocation();
  const { mode, toggleMode, resolvedMode } = useTheme();
  const { dir, locale, isRtl, setLocale } = useRtl();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [localeMenuOpen, setLocaleMenuOpen] = React.useState(false);
  
  // Simple auth state - in real app would come from context
  const [user] = React.useState({
    name: 'Admin User',
    email: 'admin@sard.dev',
    avatar: null,
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleSidebarCollapsed = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <div className="layout" dir={dir}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'sidebar transition-all duration-300 lg:translate-x-0',
          sidebarCollapsed && 'collapsed',
          sidebarOpen && 'translate-x-0'
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-200">
            <Link to="/dashboard" className="flex items-center gap-2" aria-label="Sard Admin Home">
              <div className="w-8 h-8 rounded-lg bg-brand-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="sidebar-label font-semibold text-lg text-neutral-900">Sard Admin</span>
            </Link>
            <button
              onClick={toggleSidebarCollapsed}
              className="p-2 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 lg:hidden"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? ICONS.chevronRight : ICONS.chevronLeft}
            </button>
          </div>

          {/* Navigation */}
          <nav className="nav" role="navigation" aria-label="Main navigation">
            <ul className="space-y-1" role="list">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path || 
                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        'nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-150',
                        isActive
                          ? 'bg-brand-primary-50 text-brand-primary-700'
                          : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className="nav-item-icon flex-shrink-0 w-5 h-5" aria-hidden="true">
                        {ICONS[item.icon as keyof typeof ICONS]}
                      </span>
                      <span className="sidebar-label truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar Footer - User Info */}
          <div className="p-4 border-t border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="avatar avatar-md bg-brand-primary-100 text-brand-primary-700">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 sidebar-label">
                <p className="font-medium text-sm text-neutral-900 truncate">{user.name}</p>
                <p className="text-xs text-neutral-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar toggle button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-3 rounded-full bg-brand-primary-600 text-white shadow-lg"
        aria-label="Open navigation menu"
      >
        {ICONS.menu}
      </button>

      {/* Main Content */}
      <main className="main flex-1 lg:ml-64 transition-all duration-300" style={{ marginLeft: sidebarCollapsed ? '16rem' : '0' }}>
        {/* Header */}
        <header className="header">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-neutral-500 hover:bg-neutral-100"
              aria-label="Open navigation menu"
            >
              {ICONS.menu}
            </button>
            <div className="flex-1" />
            
            {/* Theme Toggle */}
            <button
              onClick={toggleMode}
              className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
              aria-label={resolvedMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {resolvedMode === 'dark' ? ICONS.sun : ICONS.moon}
            </button>

            {/* Locale Selector */}
            <div className="relative">
              <button
                onClick={() => setLocaleMenuOpen(!localeMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                aria-label="Select language"
                aria-expanded={localeMenuOpen}
                aria-haspopup="true"
              >
                <span className="w-5 h-5 flex-shrink-0" aria-hidden="true">
                  {locale === 'ar' ? '🇸🇦' : '🇺🇸'}
                </span>
                <span className="hidden sm:block font-medium text-sm text-neutral-700">
                  {locale === 'ar' ? 'العربية' : 'English'}
                </span>
                <ICONS.chevronDown className="text-neutral-400" />
              </button>
              
              {localeMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLocaleMenuOpen(false)} aria-hidden="true" />
                  <div className="absolute right-0 mt-2 w-40 dropdown-menu">
                    <button
                      onClick={() => { setLocale('en'); setLocaleMenuOpen(false); }}
                      className={cn('dropdown-item flex w-full items-center gap-2', locale === 'en' && 'text-brand-primary-600')}
                    >
                      <span className="w-5 h-5" aria-hidden="true">🇺🇸</span>
                      <span>English</span>
                    </button>
                    <button
                      onClick={() => { setLocale('ar'); setLocaleMenuOpen(false); }}
                      className={cn('dropdown-item flex w-full items-center gap-2', locale === 'ar' && 'text-brand-primary-600')}
                    >
                      <span className="w-5 h-5" aria-hidden="true">🇸🇦</span>
                      <span>العربية</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <div className="avatar avatar-sm bg-brand-primary-100 text-brand-primary-700">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block font-medium text-sm text-neutral-700">{user.name}</span>
                <ICONS.chevronDown className="text-neutral-400" />
              </button>
              
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
                  <div className="absolute right-0 mt-2 w-48 dropdown-menu">
                    <div className="px-3 py-2 border-b border-neutral-200">
                      <p className="font-medium text-sm text-neutral-900">{user.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                    </div>
                    <button className="dropdown-item flex w-full items-center gap-2">
                      {ICONS.user}
                      <span>Profile</span>
                    </button>
                    <button className="dropdown-item flex w-full items-center gap-2">
                      {ICONS.settings}
                      <span>Settings</span>
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item flex w-full items-center gap-2 text-error">
                      {ICONS.logout}
                      <span>Sign out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Toast Container */}
      <div className="toast-container" aria-live="polite" aria-atomic="true" />
    </div>
  );
}

export default Layout;
