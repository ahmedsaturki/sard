import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn, useTheme, useRtl, ChevronLeftIcon, ChevronRightIcon, ExpandMoreIcon, SettingsIcon, LogoutIcon, HomeIcon, ArticleIcon, ImageIcon, AddIcon, CloseIcon, MoreVertIcon, VisibilityIcon, PeopleIcon, ShieldIcon, UnlockIcon, AlertTriangleIcon, EditIcon, CopyIcon, DeleteIcon, HelpOutlineIcon, CodeIcon, CheckCircleIcon, VideoIcon, TableIcon, ListIcon } from '@sard-cms/components';

// Map icon keys to components
export const ICONS = {
  chevronRight: ChevronRightIcon,
  chevronLeft: ChevronLeftIcon,
  menu: MoreVertIcon,
  sun: VisibilityIcon,
  moon: VisibilityIcon,
  chevronDown: ExpandMoreIcon,
  dashboard: HomeIcon,
  database: ArticleIcon,
  image: ImageIcon,
  download: AddIcon,
  users: PeopleIcon,
  settings: SettingsIcon,
  logout: LogoutIcon,
  user: PeopleIcon,
  shield: ShieldIcon,
  unlock: UnlockIcon,
  alertTriangle: AlertTriangleIcon,
  plus: AddIcon,
  plusCircle: AddIcon,
  check: CheckCircleIcon,
  checkCircle: CheckCircleIcon,
  code: CodeIcon,
  eye: VisibilityIcon,
  eyeOff: VisibilityIcon,
  edit: EditIcon,
  copy: CopyIcon,
  trash: DeleteIcon,
  search: HelpOutlineIcon,
  palette: MoreVertIcon,
  puzzle: CodeIcon,
  upload: AddIcon,
  document: ArticleIcon,
  file: ArticleIcon,
  video: VideoIcon,
  play: VideoIcon,
  fileText: ArticleIcon,
  grid: TableIcon,
  list: ListIcon,
  chart: TableIcon,
  lock: ShieldIcon,
} as const;

export type IconKey = keyof typeof ICONS;

interface IconProps {
  className?: string;
}

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/collections', label: 'Collections', icon: 'database' },
  { path: '/media', label: 'Media', icon: 'image' },
  { path: '/export', label: 'Static Export', icon: 'download' },
  { path: '/handoff', label: 'Client Handoff', icon: 'users' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];


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
              {sidebarCollapsed ? <ICONS.chevronRight /> : <ICONS.chevronLeft />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="nav" role="navigation" aria-label="Main navigation">
            <ul className="space-y-1" role="list">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path || 
                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                const IconComponent = ICONS[item.icon as IconKey];
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
                        <IconComponent />
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
        <ICONS.menu />
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
              <ICONS.menu />
            </button>
            <div className="flex-1" />
            
            {/* Theme Toggle */}
            <button
              onClick={toggleMode}
              className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
              aria-label={resolvedMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {resolvedMode === 'dark' ? <ICONS.sun /> : <ICONS.moon />}
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
                      <ICONS.user />
                      <span>Profile</span>
                    </button>
                    <button className="dropdown-item flex w-full items-center gap-2">
                      <ICONS.settings />
                      <span>Settings</span>
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item flex w-full items-center gap-2 text-error">
                      <ICONS.logout />
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

