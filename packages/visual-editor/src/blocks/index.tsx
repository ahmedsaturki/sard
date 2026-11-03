/**
 * @module @sard-cms/visual-editor/blocks
 * Visual Editor blocks for Payload 3 Lexical editor
 * Custom blocks for Portable Text content
 * 
 * Target: < 8s save-publish cycle
 */
import { 
  Block, 
  BlockSelection, 
  BlockComponent, 
  EditorConfig, 
  lexicalEditor 
} from '@payloadcms/richtext-lexical';
import React from 'react';
import { 
  Box, 
  TextField, 
  TextareaAutosize, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Typography,
  InputAdornment 
} from '@sard-cms/components';
import { 
  ImageIcon, 
  VideoIcon, 
  CodeIcon, 
  QuoteIcon, 
  ListIcon, 
  TableIcon, 
  DividerIcon,
  MoreVertIcon,
  DragIndicatorIcon,
  DeleteIcon,
  CopyIcon,
  EditIcon 
} from '@sard-cms/icons';
// ============================================
// Base Block Component
// ============================================
interface BaseBlockProps {
  block: any;
  onChange: (block: any) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  isSelected: boolean;
}
const BaseBlockWrapper: React.FC<BaseBlockProps & { children: React.ReactNode }> = ({
  block,
  onChange,
  onRemove,
  onDuplicate,
  isSelected,
  children,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  return (
    <div
      className={`sard-block-wrapper ${isSelected ? 'selected' : ''}`}
      style={{
        border: '1px solid var(--sard-color-neutral-300)',
        borderRadius: '8px',
        marginBottom: '16px',
        backgroundColor: 'var(--sard-color-neutral-50)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Block Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        backgroundColor: 'var(--sard-color-neutral-100)',
        borderBottom: '1px solid var(--sard-color-neutral-200)',
        borderRadius: '8px 8px 0 0',
      }}>
        {/* Drag Handle */}
        <span style={{
          cursor: 'grab',
          marginRight: '8px',
          color: 'var(--sard-color-neutral-500)',
          padding: '4px',
        }}>
          <DragIndicatorIcon />
        </span>
        {/* Block Type Label */}
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--sard-color-neutral-700)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginRight: '16px',
        }}>
          {block.type || 'block'}
        </span>
        <div style={{ flex: 1 }} />
        {/* Actions Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={(e) => e.currentTarget && setAnchorEl(e.currentTarget)}
            style={{
              padding: '4px 8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderRadius: '4px',
              color: 'var(--sard-color-neutral-500)',
            }}
          >
            <MoreVertIcon />
          </button>
        </div>
      </div>
      {/* Block Content */}
      <div style={{ padding: '16px' }}>
        {children}
      </div>
      {/* Context Menu */}
      {/* Menu component would go here */}
    </div>
  );
};
// ============================================
// Text Block (Paragraph, Heading)
// ============================================
interface TextBlockProps extends BaseBlockProps {
  block: {
    type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'blockquote';
    children: string;
  };
}
const TextBlock: React.FC<TextBlockProps> = ({ block, onChange, onRemove, onDuplicate, isSelected }) => {
  const [content, setContent] = React.useState(block.children || '');
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange({ ...block, children: content });
    }, 300);
    return () => clearTimeout(timeout);
  }, [content]);
  const tagMap = {
    paragraph: 'p',
    heading1: 'h1',
    heading2: 'h2',
    heading3: 'h3',
    heading4: 'h4',
    blockquote: 'blockquote',
  };
  const Tag = tagMap[block.type as keyof typeof tagMap] || 'p';
  return (
    <BaseBlockWrapper
      block={{ type: block.type }}
      onChange={onChange}
      onRemove={onRemove}
      onDuplicate={onDuplicate}
      isSelected={isSelected}
    >
      <Tag
        contentEditable
        suppressContentEditableWarning
        style={{
          minHeight: '40px',
          outline: 'none',
          fontSize: block.type === 'heading1' ? '2rem' : 
                     block.type === 'heading2' ? '1.5rem' :
                     block.type === 'heading3' ? '1.25rem' :
                     block.type === 'heading4' ? '1rem' : '1rem',
          fontWeight: block.type.startsWith('heading') ? 600 : 400,
          lineHeight: 1.6,
          color: 'var(--sard-color-neutral-900)',
        }}

        dir="auto"
        data-placeholder={block.type === 'blockquote' ? 'اقتباس...' : 'اكتب هنا...'}
      />
    </BaseBlockWrapper>
  );
};
// ============================================
// Image Block
// ============================================
interface ImageBlockProps extends BaseBlockProps {
  block: {
    type: 'image';
    url: string;
    alt: string;
    caption?: string;
    width?: number;
    height?: number;
  };
}
const ImageBlock: React.FC<ImageBlockProps> = ({ block, onChange, onRemove, onDuplicate, isSelected }) => {
  const [alt, setAlt] = React.useState(block.alt || '');
  const [caption, setCaption] = React.useState(block.caption || '');
  
  return (
    <BaseBlockWrapper
      block={{ type: 'image' }}
      onChange={onChange}
      onRemove={onRemove}
      onDuplicate={onDuplicate}
      isSelected={isSelected}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={block.url}
          alt={alt}
          style={{
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '8px',
            boxShadow: 'var(--sard-shadow-md)',
          }}
          onLoad={(_e) => {
            // Image loaded
          }}
        />
        {block.caption && (
          <div style={{
            marginTop: '8px',
            padding: '8px 12px',
            backgroundColor: 'var(--sard-color-neutral-100)',
            borderRadius: '8px',
            fontSize: '0.875rem',
            color: 'var(--sard-color-neutral-700)',
            textAlign: 'center',
          }}>
            {caption}
          </div>
        )}
      </div>
      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: 500 }}>
            النص البديل (Alt Text)
          </label>
          <input
            type="text"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="وصف الصورة للمكفوفين..."
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--sard-color-neutral-300)',
              borderRadius: '8px',
              fontSize: '1rem',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: 500 }}>
            التسمية التوضيحية (Caption)
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="تسمية توضيحية للصورة..."
            rows={2}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--sard-color-neutral-300)',
              borderRadius: '8px',
              fontSize: '1rem',
              resize: 'vertical',
            }}
          />
        </div>
      </div>
    </BaseBlockWrapper>
  );
};
// ============================================
// Video Block
// ============================================
interface VideoBlockProps extends BaseBlockProps {
  block: {
    type: 'video';
    url: string;
    title?: string;
    caption?: string;
  };
}
const VideoBlock: React.FC<VideoBlockProps> = ({ block, onChange, onRemove, onDuplicate, isSelected }) => {
  const [title, setTitle] = React.useState(block.title || '');
  const [caption, setCaption] = React.useState(block.caption || '');
  return (
    <BaseBlockWrapper
      block={{ type: 'video' }}
      onChange={onChange}
      onRemove={onRemove}
      onDuplicate={onDuplicate}
      isSelected={isSelected}
    >
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', backgroundColor: 'var(--sard-color-neutral-200)' }}>
        <iframe
          src={block.url}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
          allowFullScreen
          title={block.title || 'Video'}
        />
      </div>
      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: 500 }}>
            عنوان الفيديو
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان الفيديو..."
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--sard-color-neutral-300)',
              borderRadius: '8px',
              fontSize: '1rem',
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: 500 }}>
            التسمية التوضيحية
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="تسمية توضيحية..."
            rows={2}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--sard-color-neutral-300)',
              borderRadius: '8px',
              fontSize: '1rem',
              resize: 'vertical',
            }}
          />
        </div>
      </div>
    </BaseBlockWrapper>
  );
};
// ============================================
// Code Block
// ============================================
interface CodeBlockProps extends BaseBlockProps {
  block: {
    type: 'code';
    code: string;
    language: string;
  };
}
const CodeBlock: React.FC<CodeBlockProps> = ({ block, onChange, onRemove, onDuplicate, isSelected }) => {
  const [code, setCode] = React.useState(block.code || '');
  const [language, setLanguage] = React.useState(block.language || 'javascript');
  const languages = ['javascript', 'typescript', 'python', 'php', 'html', 'css', 'sql', 'json', 'bash', 'yaml', 'markdown'];
  return (
    <BaseBlockWrapper
      block={{ type: 'code' }}
      onChange={onChange}
      onRemove={onRemove}
      onDuplicate={onDuplicate}
      isSelected={isSelected}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--sard-color-neutral-300)',
            borderRadius: '8px',
            fontSize: '1rem',
            backgroundColor: 'white',
          }}
        >
          {languages.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="// اكتب الكود هنا..."
        rows={10}
        spellCheck={false}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid var(--sard-color-neutral-300)',
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontFamily: 'monospace',
          lineHeight: 1.6,
          backgroundColor: 'var(--sard-color-neutral-900)',
          color: 'var(--sard-color-neutral-100)',
          resize: 'vertical',
          minHeight: '200px',
        }}
      />
    </BaseBlockWrapper>
  );
};
// ============================================
// Gallery Block
// ============================================
interface GalleryBlockProps extends BaseBlockProps {
  block: {
    type: 'gallery';
    images: Array<{ url: string; alt: string; caption?: string }>;
  };
}
const GalleryBlock: React.FC<GalleryBlockProps> = ({ block, onChange, onRemove, onDuplicate, isSelected }) => {
  return (
    <BaseBlockWrapper
      block={{ type: 'gallery' }}
      onChange={onChange}
      onRemove={onRemove}
      onDuplicate={onDuplicate}
      isSelected={isSelected}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        {(block.images || []).map((image, index) => (
          <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '4/3' }}>
            <img
              src={image.url}
              alt={image.alt}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
            />
            <div style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              display: 'flex',
              gap: '4px',
            }}>
              <button
                onClick={() => {
                  const newImages = [...block.images];
                  newImages.splice(index, 1);
                  onChange({ ...block, images: newImages });
                }}
                style={{ padding: '4px 8px', border: 'none', backgroundColor: 'rgba(255,0,0,0.8)', color: 'white', borderRadius: '4px', cursor: 'pointer' }}
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => console.log('Open media picker')}
        style={{
          padding: '12px 24px',
          border: '2px dashed var(--sard-color-neutral-300)',
          borderRadius: '8px',
          backgroundColor: 'transparent',
          color: 'var(--sard-color-neutral-600)',
          cursor: 'pointer',
          width: '100%',
          fontSize: '1rem',
          fontWeight: 500,
        }}
      >
        + إضافة صور
      </button>
    </BaseBlockWrapper>
  );
};
// ============================================
// Block Registry
// ============================================
const blockComponents: Record<string, React.FC<any>> = {
  paragraph: TextBlock,
  heading1: TextBlock,
  heading2: TextBlock,
  heading3: TextBlock,
  heading4: TextBlock,
  blockquote: TextBlock,
  image: ImageBlock,
  video: VideoBlock,
  code: CodeBlock,
  gallery: GalleryBlock,
};
export function getBlockComponent(type: string): React.FC<any> | null {
  return blockComponents[type] || null;
}
export function getAllBlockTypes(): string[] {
  return Object.keys(blockComponents);
}
// ============================================
// Payload 3 Lexical Editor Configuration
// ============================================
export const sardLexicalEditor: any = lexicalEditor({
  // Custom blocks
  // blocks: getAllBlockTypes().map(type => ({
  //   type,
  //   // Component would be registered here
  // })),
  // Arabic/RTL support
  // Note: Lexical handles RTL via CSS direction
});
export const visualEditorConfig = {
  // Block types available
  blockTypes: getAllBlockTypes(),
  // Custom block components
  blockComponents,
  // Save/Publish performance targets
  saveTimeout: 8000, // < 8s target (HC-14)
  autoSaveInterval: 30000, // 30 seconds
  // Collaboration (future)
  collaboration: false,
  // RTL support
  rtl: true,
  // Media upload
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/*', 'video/mp4', 'application/pdf'],
  },
};
export default visualEditorConfig;
