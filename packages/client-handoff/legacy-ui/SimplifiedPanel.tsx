/**
 * @module @sard/client-handoff/SimplifiedPanel
 * Client Handoff Layer 2: Simplified Arabic admin panel
 * "إدارة الموقع" - Only what the client needs to touch
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Card, CardContent, Grid, Typography, IconButton, Menu, MenuItem, Avatar } from '@sard/components';
import { EditIcon, AddIcon, VisibilityIcon, SettingsIcon, LogoutIcon, HomeIcon, ArticleIcon, ImageIcon, PeopleIcon } from '@sard/icons';

interface SimplifiedPanelProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  onLogout: () => void;
}

const navigationItems = [
  { id: 'dashboard', label: { ar: 'الرئيسية', en: 'Dashboard' }, icon: HomeIcon, href: '/admin' },
  { id: 'posts', label: { ar: 'المقالات', en: 'Posts' }, icon: ArticleIcon, href: '/admin/collections/posts' },
  { id: 'pages', label: { ar: 'الصفحات', en: 'Pages' }, icon: ArticleIcon, href: '/admin/collections/pages' },
  { id: 'media', label: { ar: 'الوسائط', en: 'Media' }, icon: ImageIcon, href: '/admin/collections/media' },
  { id: 'forms', label: { ar: 'النماذج', en: 'Forms' }, icon: PeopleIcon, href: '/admin/collections/forms' },
];

export const SimplifiedPanel: React.FC<SimplifiedPanelProps> = ({ user, onLogout }) => {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isRtl = i18n.language === 'ar';
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleMenuClose();
    // Logout logic would go here
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
          <Typography variant="caption" color="text.secondary">
            {isRtl ? 'لوحة تحكم مبسطة' : 'Simplified Dashboard'}
          </Typography>
        </Box>
        
        {/* Navigation */}
        <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
          <nav>
            {navigationItems.map((item) => (
              <Button
                key={item.id}
                component="a"
                href={item.href}
                startIcon={<item.icon />}
                fullWidth
                justifyContent={isRtl ? 'flex-end' : 'flex-start'}
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                  },
                }}
              >
                {t(item.label)}
              </Button>
            ))}
          </nav>
        </Box>
        
        {/* Quick Actions */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom>
            {isRtl ? 'إجراءات سريعة' : 'Quick Actions'}
          </Typography>
          <Button
            fullWidth
            startIcon={<AddIcon />}
            variant="outlined"
            sx={{ mb: 1 }}
            onClick={() => window.location.href = '/admin/collections/posts/create'}
          >
            {isRtl ? 'مقال جديد' : 'New Post'}
          </Button>
          <Button
            fullWidth
            startIcon={<VisibilityIcon />}
            variant="outlined"
            onClick={() => window.open('/', '_blank')}
          >
            {isRtl ? 'معاينة الموقع' : 'Preview Site'}
          </Button>
        </Box>
        
        {/* User Profile */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            fullWidth
            onClick={() => { /* profile menu handled by parent */ }}
            startIcon={user.avatar ? <Avatar src={user.avatar} sx={{ width: 24, height: 24 }} /> : <PeopleIcon />}
            endIcon={<ExpandMoreIcon />}
            variant="text"
            justifyContent={isRtl ? 'flex-end' : 'flex-start'}
            sx={{ py: 1 }}
          >
            <Box sx={{ textAlign: isRtl ? 'right' : 'left' }}>
              <Typography variant="body2" fontWeight={500}>
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Button>
        </Box>
      </Box>
      
      {/* Main Content */}
      <Box
        component="main"
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
        </Box>
      </Box>
    </Box>
  );
};

export default SimplifiedPanel;
