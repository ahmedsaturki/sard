/**
 * @module @sard/client-handoff/SimplifiedPanel
 * Client Handoff Layer 2: Simplified Arabic admin panel
 * "إدارة الموقع" - Only what the client needs to touch
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Typography, Avatar, AddIcon, VisibilityIcon, PeopleIcon, ExpandMoreIcon } from '@sard-cms/components';

export interface SimplifiedPanelProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
}

export interface NavigationItem {
  id: string;
  label: { ar: string; en: string };
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
}

export const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: { ar: 'الرئيسية', en: 'Dashboard' }, icon: PeopleIcon, href: '/admin' },
  { id: 'posts', label: { ar: 'المقالات', en: 'Posts' }, icon: PeopleIcon, href: '/admin/collections/posts' },
  { id: 'pages', label: { ar: 'الصفحات', en: 'Pages' }, icon: PeopleIcon, href: '/admin/collections/pages' },
  { id: 'media', label: { ar: 'الوسائط', en: 'Media' }, icon: PeopleIcon, href: '/admin/collections/media' },
  { id: 'forms', label: { ar: 'النماذج', en: 'Forms' }, icon: PeopleIcon, href: '/admin/collections/forms' },
];

export const SimplifiedPanel: React.FC<SimplifiedPanelProps> = ({ user }) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const getLocalizedLabel = (label: { ar: string; en: string }) => {
    return isRtl ? label.ar : label.en;
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', direction: isRtl ? 'rtl' : 'ltr' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 260,
          borderLeft: isRtl ? '1px solid' : 'none',
          borderRight: isRtl ? 'none' : '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'fixed',
          [isRtl ? 'right' : 'left']: 0,
          top: 0,
          zIndex: 1200,
        }}
      >
        {/* Logo/Brand */}
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={700} color="primary">
            {isRtl ? 'إدارة الموقع' : 'Site Management'}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {isRtl ? 'لوحة تحكم مبسطة' : 'Simplified Dashboard'}
          </Typography>
        </Box>

        {/* Navigation */}
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          <nav>
            {navigationItems.map((item) => (
              <Button
                as="a"
                href={item.href}
                startIcon={<item.icon />}
                variant="outlined"
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  width: '100%',
                  justifyContent: isRtl ? 'flex-end' : 'flex-start',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                  },
                }}
              >
                {getLocalizedLabel(item.label)}
              </Button>
            ))}
          </nav>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom={true}>
            {isRtl ? 'إجراءات سريعة' : 'Quick Actions'}
          </Typography>
          <Button
            as="button"
            startIcon={<AddIcon />}
            variant="outlined"
            sx={{ mb: 1, width: '100%' }}
            onClick={() => window.location.href = '/admin/collections/posts/create'}
          >
            {isRtl ? 'مقال جديد' : 'New Post'}
          </Button>
          <Button
            as="button"
            startIcon={<VisibilityIcon />}
            variant="outlined"
            sx={{ width: '100%' }}
            onClick={() => window.open('/', '_blank')}
          >
            {isRtl ? 'معاينة الموقع' : 'Preview Site'}
          </Button>
        </Box>

        {/* User Profile */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            as="button"
            onClick={() => {}}
            startIcon={user.avatar ? <Avatar src={user.avatar} sx={{ width: 24, height: 24 }} /> : <PeopleIcon />}
            endIcon={<ExpandMoreIcon />}
            variant="text"
            sx={{ py: 1, width: '100%', justifyContent: isRtl ? 'flex-end' : 'flex-start', textAlign: isRtl ? 'right' : 'left' }}
          >
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {user.name}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ color: 'text.secondary' }}>
                {user.email}
              </Typography>
            </Box>
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        as="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: isRtl ? 0 : 260,
          marginRight: isRtl ? 260 : 0,
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {/* Page content would be rendered here by Next.js */}
          <Typography variant="h6" color="textSecondary">
            {isRtl ? 'مرحباً بك في لوحة التحكم' : 'Welcome to the Dashboard'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SimplifiedPanel;