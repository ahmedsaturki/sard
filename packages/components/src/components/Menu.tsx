import React from "react";
import { cn } from "../index";

interface MenuProps {
  anchorEl?: HTMLElement | null;
  open?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
  sx?: Record<string, any>;
  testId?: string;
  items?: Array<{ label: string; onClick?: () => void; disabled?: boolean }>;
}

/**
 * Menu - A dropdown menu component.
 * anchorEl, onClose and items are accepted for API compatibility with
 * consumers that drive the menu from an anchor element; the simple
 * implementation renders children when open is true.
 */
export const Menu: React.FC<MenuProps> = (props) => {
  const { open = false, children, className, sx = {}, testId } = props;

  const classes = cn(
    "sard-menu",
    open && "sard-menu--open",
    className
  );

  if (!open) {
    return null;
  }

  return (
    <div
      className={classes}
      style={sx}
      data-testid={testId}
      role="menu"
    >
      {children}
    </div>
  );
};

Menu.displayName = "Menu";