import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@sard-cms/components';
import { ICONS } from '../components/Layout';

const COLLECTIONS = [
  { slug: 'posts', name: 'Blog Posts', type: 'post', count: 47, lastUpdated: '2 hours ago' },
  { slug: 'pages', name: 'Pages', type: 'page', count: 12, lastUpdated: '1 day ago' },
  { slug: 'products', name: 'Products', type: 'product', count: 89, lastUpdated: '3 hours ago' },
  { slug: 'categories', name: 'Categories', type: 'taxonomy', count: 15, lastUpdated: '1 week ago' },
  { slug: 'tags', name: 'Tags', type: 'taxonomy', count: 42, lastUpdated: '3 days ago' },
  { slug: 'authors', name: 'Authors', type: 'user', count: 8, lastUpdated: '2 weeks ago' },
];

export function Collections() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Collections</h1>
          <p className="text-neutral-500 mt-1">Manage your content collections</p>
        </div>
        <Link to="/collections/new" className="btn btn-primary">
          <ICONS.plus className="w-4 h-4" aria-hidden="true" />
          New Collection
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th className="w-12">Icon</th>
              <th>Name</th>
              <th className="hidden md:table-cell">Type</th>
              <th className="hidden lg:table-cell">Entries</th>
              <th className="hidden md:table-cell">Last Updated</th>
              <th className="w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {COLLECTIONS.map((collection) => (
              <tr key={collection.slug}>
                <td>
                  <div className="w-8 h-8 rounded-lg bg-brand-primary-100 flex items-center justify-center">
                    <span className="text-brand-primary-700 font-bold text-sm">{collection.name.charAt(0)}</span>
                  </div>
                </td>
                <td>
                  <Link to={`/collections/${collection.slug}`} className="font-medium text-neutral-900 hover:text-brand-primary-600">
                    {collection.name}
                  </Link>
                </td>
                <td className="hidden md:table-cell">
                  <span className="badge badge-neutral capitalize">{collection.type}</span>
                </td>
                <td className="hidden lg:table-cell text-neutral-500">{collection.count}</td>
                <td className="hidden md:table-cell text-neutral-500 text-sm">{collection.lastUpdated}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <Link to={`/collections/${collection.slug}`} className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700" aria-label={`View ${collection.name}`}>
                      {ICONS.eye}
                    </Link>
                    <Link to={`/collections/${collection.slug}/new`} className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700" aria-label={`Add entry to ${collection.name}`}>
                      {ICONS.plus}
                    </Link>
                    <button className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700" aria-label={`Settings for ${collection.name}`}>
                      {ICONS.settings}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center py-8">
        <Link to="/collections/new" className="btn btn-primary">
          <ICONS.plus className="w-4 h-4" aria-hidden="true" />
          Create New Collection
        </Link>
      </div>
    </div>
  );
}

export default Collections;

