import React from 'react';
import { cn, useTheme, useRtl } from '@sard-cms/components';
import { ICONS } from '../components/Layout';
import { DesignConstraintsProvider, SimplifiedDashboard, InteractiveGuide, useClientHandoffSystem } from '@sard-cms/client-handoff';

const GUIDE_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Sard CMS',
    description: 'This interactive guide will walk you through managing your content.',
    position: 'center' as const,
  },
  {
    id: 'collections',
    title: 'Your Content Collections',
    description: 'Click here to view and manage your pages, posts, and other content types.',
    target: '[href="/collections"]',
    position: 'right' as const,
  },
  {
    id: 'media',
    title: 'Media Library',
    description: 'Upload and organize images, videos, and documents for your content.',
    target: '[href="/media"]',
    position: 'right' as const,
  },
  {
    id: 'editor',
    title: 'Visual Editor',
    description: 'Edit your content visually with drag-and-drop blocks and live preview.',
    target: '[href*="/collections/"]',
    position: 'left' as const,
  },
];

export function ClientHandoffPage() {
  const { mode, resolvedMode } = useTheme();
  const { dir, locale, setLocale } = useRtl();
  const { 
    layer, 
    setLayer, 
    isClientMode, 
    enableClientMode, 
    disableClientMode,
    switchToDashboard,
    switchToGuide,
    switchToConstraints,
  } = useClientHandoffSystem();

  const handleStartGuide = () => {
    switchToGuide();
    setLayer('guide');
  };

  return (
    <DesignConstraintsProvider>
      <div className="min-h-screen bg-neutral-50" dir={dir}>
        {/* Admin Bar - shows handoff layer controls */}
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
          <div className="max-w-full mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <span className="font-semibold text-lg text-neutral-900">Sard CMS</span>
                </Link>
                
                {/* Layer Switcher */}
                <div className="hidden md:flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
                  {(['constraints', 'dashboard', 'guide'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLayer(l)}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                        layer === l 
                          ? 'bg-white text-brand-primary-700 shadow-sm' 
                          : 'text-neutral-500 hover:text-neutral-700'
                      )}
                    >
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Client Mode Toggle */}
                {!isClientMode ? (
                  <button
                    onClick={enableClientMode}
                    className="btn btn-outline btn-sm"
                  >
                    {ICONS.shield className="w-4 h-4" aria-hidden="true" }
                    Enable Client Mode
                  </button>
                ) : (
                  <button
                    onClick={disableClientMode}
                    className="btn btn-primary btn-sm"
                  >
                    {ICONS.unlock className="w-4 h-4" aria-hidden="true" }
                    Exit Client Mode
                  </button>
                )}

                {/* Theme Toggle */}
                <button
                  onClick={() => mode === 'dark' ? document.documentElement.classList.remove('dark') : document.documentElement.classList.add('dark')}
                  className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                  aria-label="Toggle theme"
                >
                  <span className="sr-only">Toggle theme</span>
                  {resolvedMode === 'dark' ? ICONS.sun : ICONS.moon}
                </button>

                {/* Locale Selector */}
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as 'en' | 'ar')}
                  className="form-input form-input-sm w-auto"
                  aria-label="Select language"
                >
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* Layer Content */}
        <main className="p-6">
          {layer === 'constraints' && (
            <ClientConstraintsView />
          )}
          {layer === 'dashboard' && (
            <SimplifiedDashboard
              collections={[
                { slug: 'pages', name: 'Pages', icon: '📄', count: 12, description: 'Static pages like About, Contact' },
                { slug: 'posts', name: 'Blog Posts', icon: '📝', count: 24, description: 'Blog articles and news' },
                { slug: 'products', name: 'Products', icon: '🛍️', count: 8, description: 'Product catalog' },
              ]}
              onNavigate={(path) => window.location.href = path}
              userName="Client User"
              userRole="editor"
            />
          )}
          {layer === 'guide' && (
            <InteractiveGuide
              steps={GUIDE_STEPS}
              onComplete={() => { setLayer('dashboard'); alert('Guide completed!'); }}
              onSkip={() => setLayer('dashboard')}
            />
          )}
        </main>
      </div>
    </DesignConstraintsProvider>
  );
}

function ClientConstraintsView() {
  const { constraints, violations, isClientMode, setClientMode } = useClientHandoffSystem();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Design Constraints</h1>
          <p className="text-neutral-500 mt-1">Manage design system constraints for client handoff</p>
        </div>
        <div className="flex gap-3">
          {!isClientMode ? (
            <button onClick={() => setClientMode(true)} className="btn btn-primary">
              Enable Client Mode
            </button>
          ) : (
            <button onClick={() => setClientMode(false)} className="btn btn-outline">
              Exit Client Mode
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Active Constraints</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ConstraintCard 
              title="Colors" 
              description={`${constraints.colors.allowed.length} allowed colors`}
              icon="🎨"
              locked={constraints.colors.preventCustom}
            />
            <ConstraintCard 
              title="Typography" 
              description={`${constraints.typography.allowedFonts.length} allowed fonts`}
              icon="🔤"
              locked={constraints.typography.lockSizes || constraints.typography.lockWeights}
            />
            <ConstraintCard 
              title="Spacing" 
              description={constraints.spacing.scaleOnly ? 'Scale only' : 'Custom allowed'}
              icon="📏"
              locked={constraints.spacing.scaleOnly}
            />
            <ConstraintCard 
              title="Layout" 
              description={`Max width: ${constraints.layout.maxWidth}`}
              icon="📐"
              locked={constraints.layout.preventFullWidth}
            />
            <ConstraintCard 
              title="Components" 
              description={`${constraints.components.locked.length} locked components`}
              icon="🧩"
              locked={constraints.components.locked.length > 0}
            />
            <ConstraintCard 
              title="Media" 
              description={`Max ${(constraints.media.maxUploadSize / 1024 / 1024).toFixed(0)}MB`}
              icon="🖼️"
              locked={constraints.media.enforceAltText}
            />
          </div>
        </div>
      </div>

      {violations.length > 0 && (
        <div className="card border-error-200 bg-error-50">
          <div className="p-4 border-b border-error-200">
            <h2 className="text-lg font-semibold text-error-900 flex items-center gap-2">
              <ICONS.alertTriangle className="w-5 h-5" />
              Design Violations (${violations.length})
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {violations.map((v, i) => (
              <div key={i} className="p-3 bg-white border border-error-200 rounded-lg">
                <p className="font-medium text-error-900">{v.type}: {v.message}</p>
                {v.element && <p className="text-sm text-error-700 mt-1">Element: {v.element}</p>}
                {v.value && <p className="text-sm text-error-600 mt-1">Attempted value: {v.value}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ConstraintCard({ title, description, icon, locked }: { title: string; description: string; icon: string; locked: boolean }) {
  return (
    <div className="p-4 rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-semibold text-neutral-900">{title}</h3>
        {locked && (
          <span className="ml-auto badge badge-sm badge-warning">Locked</span>
        )}
      </div>
      <p className="text-sm text-neutral-500">{description}</p>
    </div>
  );
}

export default ClientHandoffPage;

