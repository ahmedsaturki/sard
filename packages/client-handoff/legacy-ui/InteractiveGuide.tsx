/**
 * @module @sard/client-handoff/InteractiveGuide
 * Client Handoff Layer 3: Interactive in-app guide
 * Step-by-step walkthrough for common tasks
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Typography, Paper, IconButton, Tooltip, Divider } from '@sard/components';
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, HelpOutlineIcon } from '@sard/icons';

interface GuideStep {
  id: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  targetSelector?: string;
  action?: 'click' | 'hover' | 'input';
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface InteractiveGuideProps {
  isOpen: boolean;
  onClose: () => void;
  currentTask?: string;
}

const guides: Record<string, GuideStep[]> = {
  'edit-homepage': [
    {
      id: 'step-1',
      title: { ar: 'الذهاب للصفحة الرئيسية', en: 'Go to Homepage' },
      description: { ar: 'اضغط على "الرئيسية" في الشريط الجانبي', en: 'Click "Home" in the sidebar' },
      targetSelector: '[href="/admin"]',
      action: 'click',
      position: 'right',
    },
    {
      id: 'step-2',
      title: { ar: 'الضغط على "معاينة الموقع"', en: 'Click Preview Site' },
      description: { ar: 'في أسفل الشريط الجانبي، اضغط "معاينة الموقع"', en: 'At bottom of sidebar, click "Preview Site"' },
      targetSelector: 'button:contains("معاينة الموقع")',
      action: 'click',
      position: 'left',
    },
    {
      id: 'step-3',
      title: { ar: 'الضغط على العنوان', en: 'Click the Title' },
      description: { ar: 'في المعاينة، اضغط على عنوان الصفحة الرئيسية للتعديل', en: 'In preview, click the homepage title to edit' },
      targetSelector: 'h1[data-editable="true"]',
      action: 'click',
      position: 'top',
    },
    {
      id: 'step-4',
      title: { ar: 'تعديل النص', en: 'Edit Text' },
      description: { ar: 'اكتب النص الجديد: "مرحباً بكم في موقعنا الجديد"', en: 'Type new text: "Welcome to our new website"' },
      targetSelector: '[data-slate-editor="true"]',
      action: 'input',
      position: 'bottom',
    },
    {
      id: 'step-5',
      title: { ar: 'النشر', en: 'Publish' },
      description: { ar: 'اضغط زر "نشر" في الزاوية', en: 'Click "Publish" button in corner' },
      targetSelector: 'button:contains("نشر")',
      action: 'click',
      position: 'left',
    },
  ],
  
  'create-post': [
    {
      id: 'step-1',
      title: { ar: 'الذهاب للمقالات', en: 'Go to Posts' },
      description: { ar: 'اضغط "المقالات" في الشريط الجانبي', en: 'Click "Posts" in sidebar' },
      targetSelector: '[href="/admin/collections/posts"]',
      action: 'click',
      position: 'right',
    },
    {
      id: 'step-2',
      title: { ar: 'مقال جديد', en: 'New Post' },
      description: { ar: 'اضغط زر "مقال جديد"', en: 'Click "New Post" button' },
      targetSelector: 'button:contains("مقال جديد")',
      action: 'click',
      position: 'right',
    },
    {
      id: 'step-3',
      title: { ar: 'كتابة العنوان', en: 'Write Title' },
      description: { ar: 'اكتب عنوان المقال في الحقل الأول', en: 'Type post title in first field' },
      targetSelector: 'input[name="title"]',
      action: 'input',
      position: 'bottom',
    },
    {
      id: 'step-4',
      title: { ar: 'كتابة المحتوى', en: 'Write Content' },
      description: { ar: 'اكتب محتوى المقال في المحرر', en: 'Write content in the editor' },
      targetSelector: '[data-slate-editor="true"]',
      action: 'input',
      position: 'bottom',
    },
    {
      id: 'step-5',
      title: { ar: 'إضافة صورة', en: 'Add Image' },
      description: { ar: 'اضغط أيقونة الصورة وأضف صورة رئيسية', en: 'Click image icon and add featured image' },
      targetSelector: 'button:contains("صورة")',
      action: 'click',
      position: 'top',
    },
    {
      id: 'step-6',
      title: { ar: 'النشر', en: 'Publish' },
      description: { ar: 'اضغط "نشر" في الزاوية العلوية', en: 'Click "Publish" in top corner' },
      targetSelector: 'button:contains("نشر")',
      action: 'click',
      position: 'left',
    },
  ],
};

const InteractiveGuide: React.FC<InteractiveGuideProps> = ({ isOpen, onClose, currentTask }) => {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const guideRef = useRef<HTMLDivElement>(null);
  
  const guide = currentTask && guides[currentTask] ? guides[currentTask] : guides['edit-homepage'];
  const current = guide[currentStep];
  const isRtl = i18n.language === 'ar';
  
  useEffect(() => {
    if (isOpen && current) {
      highlightElement(current.targetSelector);
    }
    return () => removeHighlights();
  }, [currentStep, isOpen]);
  
  const highlightElement = (selector?: string) => {
    removeHighlights();
    if (!selector) return;
    
    try {
      const element = document.querySelector(current?.targetSelector || '');
      if (element) {
        element.classList.add('sard-guide-highlight');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (e) {
      console.warn('Guide highlight failed:', e);
    }
  };
  
  const removeHighlights = () => {
    document.querySelectorAll('.sard-guide-highlight').forEach(el => {
      el.classList.remove('sard-guide-highlight');
    });
  };
  
  const handleNext = () => {
    if (currentStep < guide.length - 1) {
      setCompletedSteps(prev => new Set([...prev, guide[currentStep].id]));
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleSkip = () => {
    setCompletedSteps(prev => new Set([...prev, ...guide.map(s => s.id)]));
    setCurrentStep(guide.length - 1);
  };
  
  if (!isOpen) return null;
  
  const progress = Math.round(((currentStep + 1) / guide.length) * 100);
  
  return (
    <Box sx={{ position: 'fixed', bottom: 24, [isRtl ? 'left' : 'right']: 24, zIndex: 9999 }}>
      <Paper elevation={8} sx={{ minWidth: 360, maxWidth: 420, borderRadius: 3, overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={600}>
            {current?.title?.[i18n.language] || current?.title?.en}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={isRtl ? 'إغلاق' : 'Close'}>
              <IconButton onClick={onClose} size="small" aria-label="Close">
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Progress */}
        <Box sx={{ px: 2, py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{ flexGrow: 1, height: 4, borderRadius: 2, bgcolor: 'grey.300' }}>
              <Box
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  width: `${progress}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 50, textAlign: 'center' }}>
              ${currentStep + 1} / ${guide.length}
            </Typography>
          </Box>
        </Box>
        
        {/* Content */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="body1" color="text.primary" gutterBottom>
            {current?.description?.[i18n.language] || current?.description?.en}
          </Typography>
          
          {/* Step indicators */}
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              {isRtl ? 'الخطوات:' : 'Steps:'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {guide.map((step, index) => (
                <Box
                  key={step.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: index === currentStep ? 'primary.light' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 600,
                      bgcolor: completedSteps.has(step.id) ? 'success.main' : (index === currentStep ? 'primary.main' : 'grey.400'),
                      color: completedSteps.has(step.id) || index === currentStep ? 'white' : 'grey.600',
                    }}
                  >
                    {completedSteps.has(step.id) ? <CheckCircleIcon fontSize="small" /> : (index + 1)}
                  </Box>
                  <Typography variant="body2" sx={{ flex: 1, color: index === currentStep ? 'primary.main' : 'inherit' }}>
                    {step.title?.[i18n.language] || step.title?.en}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
        
        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            onClick={handlePrev}
            disabled={currentStep === 0}
            startIcon={<ChevronRightIcon />}
            variant="outlined"
          >
            {isRtl ? 'التالي' : 'Previous'}
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={handleSkip}
              variant="text"
              disabled={currentStep === guide.length - 1}
            >
              {isRtl ? 'تخطي' : 'Skip'}
            </Button>
            
            <Button
              onClick={currentStep === guide.length - 1 ? onClose : handleNext}
              variant="contained"
              endIcon={currentStep === guide.length - 1 ? <CheckCircleIcon /> : <ChevronLeftIcon />}
            >
              {currentStep === guide.length - 1 
                ? (isRtl ? 'انتهيت!' : 'Done!') 
                : (isRtl ? 'التالي' : 'Next')}
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Floating help button */}
      <Tooltip title={isRtl ? 'دليل تفاعلي' : 'Interactive Guide'}>
        <IconButton
          onClick={() => {}}
          sx={{
            position: 'fixed',
            bottom: 24,
            [isRtl ? 'right' : 'left']: 24,
            zIndex: 9998,
            bgcolor: 'primary.main',
            color: 'white',
            boxShadow: 3,
          }}
          aria-label="Interactive Guide"
        >
          <HelpOutlineIcon />
        </IconButton>
      </Tooltip>
    </>
  );
};

export default InteractiveGuide;
