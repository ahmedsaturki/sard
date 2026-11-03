import React from 'react';
import { cn } from '@sard-cms/components';
import { ICONS } from '../components/Layout';

const SETTINGS_TABS = [
  { id: 'general', label: 'General', icon: ICONS.settings },
  { id: 'appearance', label: 'Appearance', icon: ICONS.palette },
  { id: 'seo', label: 'SEO', icon: ICONS.search },
  { id: 'users', label: 'Users', icon: ICONS.users },
  { id: 'integrations', label: 'Integrations', icon: ICONS.puzzle },
  { id: 'advanced', label: 'Advanced', icon: ICONS.shield },
];

export function Settings() {
  const [activeTab, setActiveTab] = React.useState('general');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-neutral-900">General Settings</h2>
            <div className="card p-6 space-y-6">
              <div className="space-y-2">
                <label htmlFor="site-name" className="form-label">Site Name</label>
                <input type="text" id="site-name" className="form-input" defaultValue="Sard CMS" />
              </div>
              <div className="space-y-2">
                <label htmlFor="site-tagline" className="form-label">Site Tagline</label>
                <input type="text" id="site-tagline" className="form-input" placeholder="Your site tagline" />
              </div>
              <div className="space-y-2">
                <label htmlFor="site-url" className="form-label">Site URL</label>
                <input type="url" id="site-url" className="form-input" defaultValue="https://example.com" />
              </div>
              <div className="space-y-2">
                <label htmlFor="admin-email" className="form-label">Admin Email</label>
                <input type="email" id="admin-email" className="form-input" defaultValue="admin@example.com" />
              </div>
              <div className="space-y-2">
                <label htmlFor="timezone" className="form-label">Timezone</label>
                <select id="timezone" className="form-input">
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="date-format" className="form-label">Date Format</label>
                <select id="date-format" className="form-input">
                  <option value="YYYY-MM-DD">2024-01-15</option>
                  <option value="MM/DD/YYYY">01/15/2024</option>
                  <option value="DD/MM/YYYY">15/01/2024</option>
                  <option value="MMMM D, YYYY">January 15, 2024</option>
                </select>
              </div>
              <button className="btn btn-primary">Save Changes</button>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-neutral-900">Appearance</h2>
            <div className="card p-6 space-y-6">
              <div className="space-y-2">
                <label className="form-label">Theme Mode</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="theme" defaultChecked className="w-4 h-4 text-brand-primary-600 border-neutral-300 focus:ring-brand-primary-500" />
                    <span className="text-sm text-neutral-700">Light</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="theme" className="w-4 h-4 text-brand-primary-600 border-neutral-300 focus:ring-brand-primary-500" />
                    <span className="text-sm text-neutral-700">Dark</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="theme" className="w-4 h-4 text-brand-primary-600 border-neutral-300 focus:ring-brand-primary-500" />
                    <span className="text-sm text-neutral-700">System</span>
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="form-label">Primary Color</label>
                <input type="color" className="w-12 h-10 rounded-lg border border-neutral-300 cursor-pointer" defaultValue="#0ea5e9" />
              </div>
              <div className="space-y-2">
                <label className="form-label">Font Family</label>
                <select className="form-input">
                  <option value="inter">Inter (Default)</option>
                  <option value="system">System UI</option>
                  <option value="roboto">Roboto</option>
                  <option value="open-sans">Open Sans</option>
                </select>
              </div>
              <button className="btn btn-primary">Save Changes</button>
            </div>
          </div>
        );
      case 'seo':
        return (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-neutral-900">SEO Settings</h2>
            <div className="card p-6 space-y-6">
              <div className="space-y-2">
                <label htmlFor="meta-title" className="form-label">Default Meta Title</label>
                <input type="text" id="meta-title" className="form-input" placeholder="Your site title" />
              </div>
              <div className="space-y-2">
                <label htmlFor="meta-description" className="form-label">Default Meta Description</label>
                <textarea id="meta-description" className="form-input" rows={3} placeholder="Default meta description for pages" />
              </div>
              <div className="space-y-2">
                <label htmlFor="og-image" className="form-label">Default Open Graph Image</label>
                <input type="url" id="og-image" className="form-input" placeholder="https://example.com/og-image.jpg" />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-brand-primary-600 border-neutral-300 rounded focus:ring-brand-primary-500" defaultChecked />
                  <span className="text-sm text-neutral-700">Enable XML Sitemap</span>
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-brand-primary-600 border-neutral-300 rounded focus:ring-brand-primary-500" />
                  <span className="text-sm text-neutral-700">Enable Robots.txt</span>
                </label>
              </div>
              <button className="btn btn-primary">Save Changes</button>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Users</h2>
              <button className="btn btn-primary">
                <ICONS.plus className="w-4 h-4" aria-hidden="true" />
                Invite User
              </button>
            </div>
            <div className="card overflow-hidden">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th className="w-32">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-medium text-neutral-900">Admin User</td>
                    <td className="text-neutral-500">admin@example.com</td>
                    <td><span className="badge badge-error">Admin</span></td>
                    <td><span className="badge badge-success">Active</span></td>
                    <td><button className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100">{ICONS.edit}</button></td>
                  </tr>
                  <tr>
                    <td className="font-medium text-neutral-900">Jane Smith</td>
                    <td className="text-neutral-500">jane@example.com</td>
                    <td><span className="badge badge-warning">Editor</span></td>
                    <td><span className="badge badge-success">Active</span></td>
                    <td><button className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100">{ICONS.edit}</button></td>
                  </tr>
                  <tr>
                    <td className="font-medium text-neutral-900">John Doe</td>
                    <td className="text-neutral-500">john@example.com</td>
                    <td><span className="badge badge-neutral">Author</span></td>
                    <td><span className="badge badge-success">Active</span></td>
                    <td><button className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100">{ICONS.edit}</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-lg font-semibold text-neutral-900">{SETTINGS_TABS.find(t => t.id === activeTab)?.label}</h2>
            <div className="card p-6">
              <p className="text-neutral-500">Settings for {SETTINGS_TABS.find(t => t.id === activeTab)?.label} coming soon.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
          <p className="text-neutral-500 mt-1">Manage your site configuration</p>
        </div>
      </div>

      <div className="card">
        <div className="tabs" role="tablist" aria-label="Settings sections">
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'tab',
                activeTab === tab.id ? 'text-brand-primary-600' : 'text-neutral-500 hover:text-neutral-700'
              )}
            >
              <span className="flex items-center gap-2">
                <span className="w-5 h-5" aria-hidden="true">{tab.icon}</span>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
        <div id="settings-panels" className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default Settings;

