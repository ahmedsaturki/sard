import React from 'react';
import { cn, useTheme } from '@sard-cms/components';
import { ICONS } from '../components/Layout';

const EXPORT_FORMATS = [
  { id: 'html', name: 'HTML/CSS/JS', description: 'Static files for any hosting', icon: ICONS.code },
  { id: 'astro', name: 'Astro Project', description: 'Full Astro project with components', icon: ICONS.database },
  { id: 'nextjs', name: 'Next.js Project', description: 'Next.js App Router project', icon: ICONS.settings },
];

const EXPORT_STATUSES = [
  { id: 'html', status: 'ready', label: 'Ready', color: 'success' },
  { id: 'astro', status: 'ready', label: 'Ready', color: 'success' },
  { id: 'nextjs', status: 'beta', label: 'Beta', color: 'warning' },
];

export function StaticExport() {
  const { mode, toggleMode, resolvedMode } = useTheme();
  const [exporting, setExporting] = React.useState(false);
  const [selectedFormats, setSelectedFormats] = React.useState<string[]>(['html']);
  const [exportProgress, setExportProgress] = React.useState<Record<string, number>>({});
  const [lastExport, setLastExport] = React.useState<string | null>(null);

  const toggleFormat = (format: string) => {
    setSelectedFormats(prev => prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]);
  };

  const handleExport = async () => {
    setExporting(true);
    setExportProgress({});
    
    for (const format of selectedFormats) {
      setExportProgress(prev => ({ ...prev, [format]: 0 }));
      
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setExportProgress(prev => ({ ...prev, [format]: i }));
      }
    }
    
    setExporting(false);
    const now = new Date().toLocaleString();
    setLastExport(now);
    
    // In real implementation, trigger download
    console.log('Export completed for:', selectedFormats);
  };

  const getStatusBadge = (format: string) => {
    const status = EXPORT_STATUSES.find(s => s.id === format);
    if (!status) return null;
    
    return (
      <span className={cn(
        'badge badge-sm',
        status.color === 'success' && 'badge-success',
        status.color === 'warning' && 'badge-warning',
        status.color === 'error' && 'badge-error',
        status.color === 'neutral' && 'badge-neutral'
      )}>
        {status.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Static Export</h1>
          <p className="text-neutral-500 mt-1">Export your site as static files for any hosting provider</p>
        </div>
        <div className="flex gap-3">
          <button 
            className={cn('btn', exporting ? 'btn-disabled' : 'btn-primary')}
            onClick={handleExport}
            disabled={exporting || selectedFormats.length === 0}
          >
            <ICONS.download className="w-4 h-4" aria-hidden="true" /> {exporting ? 'Exporting...' : 'Export Selected'}
          </button>
        </div>
      </div>

      {/* Export Formats */}
      <div className="card">
        <div className="p-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Export Formats</h2>
        </div>
        <div className="divide-y divide-neutral-200">
          {EXPORT_FORMATS.map((format) => (
            <div key={format.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-primary-100 flex items-center justify-center flex-shrink-0">
                  <ICONS.document className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">{format.name}</h3>
                  <p className="text-sm text-neutral-500 mt-1">{format.description}</p>
                  {getStatusBadge(format.id)}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFormats.includes(format.id)}
                  onChange={() => toggleFormat(format.id)}
                  className="w-4 h-4 rounded border-neutral-300 text-brand-primary-600 focus:ring-brand-primary-500"
                />
                <span className="text-sm font-medium text-neutral-700">Include</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="card mt-6">
        <div className="p-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Export Options</h2>
        </div>
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="form-label">Output Directory</label>
            <input
              type="text"
              className="form-input"
              defaultValue="dist"
              placeholder="dist"
            />
            <p className="text-sm text-neutral-500">Relative path for exported files</p>
          </div>
          <div className="space-y-2">
            <label className="form-label">Base URL</label>
            <input
              type="url"
              className="form-input"
              defaultValue="https://example.com"
              placeholder="https://example.com"
            />
            <p className="text-sm text-neutral-500">Base URL for absolute links and sitemap</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-neutral-300 text-brand-primary-600 focus:ring-brand-primary-500" />
              <span className="text-sm font-medium text-neutral-700">Generate sitemap.xml</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer ml-4">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-neutral-300 text-brand-primary-600 focus:ring-brand-primary-500" />
              <span className="text-sm font-medium text-neutral-700">Generate robots.txt</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer ml-4">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-neutral-300 text-brand-primary-600 focus:ring-brand-primary-500" />
              <span className="text-sm font-medium text-neutral-700">Copy assets (images, fonts, etc.)</span>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-brand-primary-600 focus:ring-brand-primary-500" />
              <span className="text-sm font-medium text-neutral-700">Minify HTML/CSS/JS</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer ml-4">
              <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-brand-primary-600 focus:ring-brand-primary-500" />
              <span className="text-sm font-medium text-neutral-700">Generate llms.txt for AI crawlers</span>
            </label>
          </div>
        </div>
      </div>

      {/* Export Progress */}
      {exporting && (
        <div className="card">
          <div className="p-4 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">Export Progress</h2>
          </div>
          <div className="p-4 space-y-4">
            {selectedFormats.map((format) => (
              <div key={format} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-900">{format.toUpperCase()}</span>
                  <span className="text-sm text-neutral-500">{exportProgress[format] || 0}%</span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-primary-600 rounded-full transition-all duration-300"
                    style={{ width: (exportProgress[format] || 0) + '%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Export Info */}
      {lastExport && (
        <div className="card bg-success-50 border-success-200">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
                <ICONS.check className="w-5 h-5 text-success-700" />
              </div>
              <div>
                <h3 className="font-semibold text-success-900">Export Completed</h3>
                <p className="text-sm text-success-700">Last export: {lastExport}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaticExport;

