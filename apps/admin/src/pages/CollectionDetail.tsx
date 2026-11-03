import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { cn } from '@sard-cms/components';
import { ICONS } from '../components/Layout';

const ENTRIES = [
  { id: 1, slug: 'getting-started-with-sard', title: 'Getting Started with Sard', status: 'published', updated: '2 hours ago', author: 'Admin User' },
  { id: 2, slug: 'building-a-blog-with-sard', title: 'Building a Blog with Sard', status: 'published', updated: '1 day ago', author: 'Jane Smith' },
  { id: 3, slug: 'advanced-theming-guide', title: 'Advanced Theming Guide', status: 'draft', updated: '3 days ago', author: 'John Doe' },
  { id: 4, slug: 'migrating-from-wordpress', title: 'Migrating from WordPress', status: 'in_review', updated: '1 week ago', author: 'Admin User' },
];

export function CollectionDetail() {
  const { slug } = useParams<{ slug: string | undefined }>();
  const safeSlug = slug || 'new';
  const collection = { slug: safeSlug, name: safeSlug.charAt(0).toUpperCase() + safeSlug.slice(1).replace(/-/g, ' ') };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link to="/collections" className="text-sm text-neutral-500 hover:underline mb-2 inline-block">All Collections</Link>
          <h1 className="text-2xl font-bold text-neutral-900">{collection.name}</h1>
          <p className="text-neutral-500 mt-1">Manage your {collection.name.toLowerCase()}</p>
        </div>
        <div className="flex gap-3">
          <Link to={`/collections/${safeSlug}/new`} className="btn btn-primary">
            <ICONS.plus className="w-4 h-4" aria-hidden="true" />
            New Entry
          </Link>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th className="w-10">Status</th>
              <th>Title</th>
              <th className="hidden md:table-cell">Slug</th>
              <th className="hidden lg:table-cell">Author</th>
              <th className="hidden md:table-cell">Updated</th>
              <th className="w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ENTRIES.map((entry) => (
              <tr key={entry.id}>
                <td>
                  <span className={cn(
                    'badge',
                    entry.status === 'published' && 'badge-success',
                    entry.status === 'draft' && 'badge-neutral',
                    entry.status === 'in_review' && 'badge-warning',
                    entry.status === 'archived' && 'badge-error'
                  )}>
                    {entry.status.charAt(0).toUpperCase() + entry.status.slice(1).replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <Link to={`/collections/${safeSlug}/${entry.slug}`} className="font-medium text-neutral-900 hover:text-brand-primary-600">
                    {entry.title}
                  </Link>
                </td>
                <td className="hidden md:table-cell text-neutral-500 text-sm font-mono">/${entry.slug}</td>
                <td className="hidden lg:table-cell text-neutral-500">{entry.author}</td>
                <td className="hidden md:table-cell text-neutral-500 text-sm">{entry.updated}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <Link to={`/collections/${safeSlug}/${entry.slug}`} className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700" aria-label={`Edit ${entry.title}`}>
                      <ICONS.edit className="w-5 h-5" />
                    </Link>
                    <button className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700" aria-label={`Duplicate ${entry.title}`}>
                      <ICONS.copy className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-lg text-error-500 hover:bg-error-50 hover:text-error-700" aria-label={`Delete ${entry.title}`}>
                      <ICONS.trash className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CollectionDetail;