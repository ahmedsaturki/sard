import React from 'react';
import { cn } from '@sard-cms/components';
import { ICONS } from '../components/Layout';

const MEDIA_ITEMS = [
  { id: 1, name: 'hero-banner.jpg', type: 'image', size: '2.4 MB', dimensions: '1920x1080', uploaded: '2 hours ago' },
  { id: 2, name: 'logo.svg', type: 'image', size: '45 KB', dimensions: '512x512', uploaded: '1 day ago' },
  { id: 3, name: 'product-demo.mp4', type: 'video', size: '15.2 MB', duration: '2:34', uploaded: '3 days ago' },
  { id: 4, name: 'documentation.pdf', type: 'document', size: '1.8 MB', pages: 12, uploaded: '1 week ago' },
];

export function Media() {
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = React.useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedItems.length === MEDIA_ITEMS.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(MEDIA_ITEMS.map(m => m.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Media Library</h1>
          <p className="text-neutral-500 mt-1">Manage your images, videos, and documents</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline" aria-label="Switch to grid view">
            <ICONS.grid />
          </button>
          <button className="btn btn-outline" aria-label="Switch to list view">
            {ICONS.list}
          </button>
          <button className="btn btn-primary">
            <ICONS.upload className="w-4 h-4" aria-hidden="true" />
            Upload
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 p-4 border-b border-neutral-200">
          <input
            type="checkbox"
            id="select-all"
            checked={selectedItems.length === MEDIA_ITEMS.length && MEDIA_ITEMS.length > 0}
            onChange={selectAll}
            className="w-4 h-4 rounded border-neutral-300 text-brand-primary-600 focus:ring-brand-primary-500"
          />
          <label htmlFor="select-all" className="text-sm font-medium text-neutral-700 cursor-pointer">Select all</label>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="view-mode" className="sr-only">View mode</label>
              <button
                onClick={() => setViewMode('grid')}
                className={cn('p-2 rounded-lg', viewMode === 'grid' ? 'bg-brand-primary-100 text-brand-primary-700' : 'text-neutral-500 hover:bg-neutral-100')}
                aria-label="Grid view"
              >
                {ICONS.grid}
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn('p-2 rounded-lg', viewMode === 'list' ? 'bg-brand-primary-100 text-brand-primary-700' : 'text-neutral-500 hover:bg-neutral-100')}
                aria-label="List view"
              >
                {ICONS.list}
              </button>
            </div>
          </div>
        </div>

        <div className={cn('p-4', viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'space-y-3')}>
          {MEDIA_ITEMS.map((item) => (
            <div
              key={item.id}
              className={cn(
                'relative rounded-lg border border-neutral-200 overflow-hidden transition-all',
                viewMode === 'grid' ? 'group' : 'flex items-center gap-4 p-3'
              )}
            >
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => toggleSelect(item.id)}
                className="absolute top-2 left-2 z-10 w-4 h-4 rounded border-neutral-300 text-brand-primary-600 focus:ring-brand-primary-500"
              />
              
              {viewMode === 'grid' ? (
                <>
                  <div className="aspect-video bg-neutral-100 relative overflow-hidden">
                    {item.type === 'image' && (
                      <div className="w-full h-full bg-gradient-to-br from-brand-primary-100 to-brand-primary-200 flex items-center justify-center">
                        <ICONS.image className="w-12 h-12 text-brand-primary-400" />
                      </div>
                    )}
                    {item.type === 'video' && (
                      <div className="w-full h-full bg-neutral-900 flex items-center justify-center relative">
                        <ICONS.play className="w-12 h-12 text-white/80" />
                      </div>
                    )}
                    {item.type === 'document' && (
                      <div className="w-full h-full bg-red-100 flex items-center justify-center">
                        <ICONS.fileText className="w-12 h-12 text-red-600" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm text-neutral-900 truncate">{item.name}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {item.type === 'video' ? item.duration : item.dimensions || item.pages ? `${item.pages} pages` : ''}
                      <span className="mx-1">·</span>
                      {item.size}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-10 flex-shrink-0 rounded bg-neutral-100 flex items-center justify-center">
                    {item.type === 'image' && <ICONS.image className="w-8 h-8 text-brand-primary-400" />}
                    {item.type === 'video' && <ICONS.video className="w-8 h-8 text-neutral-400" />}
                    {item.type === 'document' && <ICONS.fileText className="w-8 h-8 text-red-400" />}
                  </>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">{item.name}</p>
                    <p className="text-sm text-neutral-500">
                      {item.type} · {item.dimensions || item.duration || `${item.pages} pages`} · {item.size} · {item.uploaded}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100" aria-label="Download">{ICONS.download}</button>
                    <button className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100" aria-label="Edit">{ICONS.edit}</button>
                    <button className="p-2 rounded-lg text-error-500 hover:bg-error-50" aria-label="Delete">{ICONS.trash}</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        
        {selectedItems.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-brand-primary-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-4">
            <span>{selectedItems.length} items selected</span>
            <button className="btn btn-sm btn-outline" style={{background: 'white', color: 'white', borderColor: 'white'}}>Delete</button>
            <button className="btn btn-sm btn-outline" style={{background: 'white', color: 'white', borderColor: 'white'}}>Download</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Media;

