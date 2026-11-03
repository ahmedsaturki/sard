import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@sard-cms/components';
import { ICONS } from '../components/Layout';

const STATS = [
  { label: 'Total Collections', value: '12', change: '+2 this month', icon: ICONS.database, color: 'bg-brand-primary-100 text-brand-primary-700', iconColor: 'text-brand-primary-600' },
  { label: 'Published Posts', value: '87', change: '+5 this week', icon: ICONS.document, color: 'bg-success-100 text-success-700', iconColor: 'text-success-600' },
  { label: 'Media Files', value: '1.2k', change: '+23 today', icon: ICONS.image, color: 'bg-warning-100 text-warning-700', iconColor: 'text-warning-600' },
  { label: 'Team Members', value: '8', change: '+1 this month', icon: ICONS.users, color: 'bg-info-100 text-info-700', iconColor: 'text-info-600' },
];

const RECENT_ACTIVITY = [
  { id: 1, action: 'Published', item: 'Getting Started with Sard', time: '2 hours ago', user: 'Admin User', type: 'publish' },
  { id: 2, action: 'Created', item: 'New Collection: Blog Posts', time: '4 hours ago', user: 'Admin User', type: 'create' },
  { id: 3, action: 'Updated', item: 'Homepage Content', time: '1 day ago', user: 'Jane Smith', type: 'update' },
  { id: 4, action: 'Uploaded', item: 'hero-banner.jpg', time: '2 days ago', user: 'John Doe', type: 'upload' },
  { id: 5, action: 'Deleted', item: 'Old Draft: Welcome Post', time: '3 days ago', user: 'Admin User', type: 'delete' },
];

const QUICK_ACTIONS = [
  { label: 'New Post', href: '/collections/posts/new', icon: ICONS.plus, color: 'bg-brand-primary-100 text-brand-primary-700', iconColor: 'text-brand-primary-600' },
  { label: 'Upload Media', href: '/media/upload', icon: ICONS.upload, color: 'bg-success-100 text-success-700', iconColor: 'text-success-600' },
  { label: 'New Page', href: '/collections/pages/new', icon: ICONS.file, color: 'bg-warning-100 text-warning-700', iconColor: 'text-warning-600' },
  { label: 'Manage Users', href: '/settings/users', icon: ICONS.users, color: 'bg-info-100 text-info-700', iconColor: 'text-info-600' },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-500 mt-1">Welcome back! Here's what's happening with your content.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/collections/posts/new" className="btn btn-primary">
            <ICONS.plus className="w-4 h-4" aria-hidden="true" />
            New Post
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">{stat.value}</p>
                <p className="text-xs text-success-600 mt-1">{stat.change}</p>
              </div>
              <div className={cn('p-3 rounded-xl', stat.color)}>
                <span className={cn('w-8 h-8', stat.iconColor)} aria-hidden="true">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors'
                  )}
                >
                  <span className={cn('p-2 rounded-lg', action.color)}>
                    <span className={cn('w-5 h-5', action.iconColor)} aria-hidden="true">{action.icon}</span>
                  </span>
                  <span className="font-medium text-neutral-900">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Recent Activity</h2>
              <Link to="/activity" className="text-sm text-brand-primary-600 hover:underline">View all</Link>
            </div>
            <div className="space-y-4">
              {RECENT_ACTIVITY.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                  <div className={cn(
                    'p-2 rounded-lg',
                    activity.type === 'publish' && 'bg-success-100 text-success-700',
                    activity.type === 'create' && 'bg-brand-primary-100 text-brand-primary-700',
                    activity.type === 'update' && 'bg-warning-100 text-warning-700',
                    activity.type === 'upload' && 'bg-info-100 text-info-700',
                    activity.type === 'delete' && 'bg-error-100 text-error-700'
                  )}>
                    {activity.type === 'publish' && ICONS.checkCircle}
                    {activity.type === 'create' && ICONS.plusCircle}
                    {activity.type === 'update' && ICONS.edit}
                    {activity.type === 'upload' && ICONS.upload}
                    {activity.type === 'delete' && ICONS.trash}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 truncate">{activity.action} <span className="font-medium">{activity.item}</span></p>
                    <p className="text-sm text-neutral-500">{activity.time} Â· {activity.user}</p>
                  </div>
                  <span className="text-xs text-neutral-400 whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Content Overview</h2>
          <div className="flex items-center gap-2">
            <select className="form-input form-input-sm w-auto" aria-label="Time period">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center text-neutral-400">
          <div className="text-center">
            <ICONS.chart className="w-12 h-12 mx-auto text-neutral-300 mb-2" />
            <p className="text-neutral-500">Content analytics chart coming soon</p>
            <p className="text-xs text-neutral-400 mt-1">Integrate with your analytics provider</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

