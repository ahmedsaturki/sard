import React from "react";
import { cn } from "../index";

export interface MenuItemProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  sx?: Record<string, any>;
  testId?: string;
}

/**
 * MenuItem - A menu item component for use inside Menu
 */
export const MenuItem: React.FC<MenuItemProps> = ({
  label,
  onClick,
  disabled = false,
  className,
  sx = {},
  testId,
}) => {
  const classes = cn(
    "sard-menu-item",
    disabled && "sard-menu-item--disabled",
    className
  );

  return (
    <div
      className={classes}
      style={sx}
      onClick={onClick}
      aria-disabled={disabled}
      data-testid={testId}
      role="menuitem"
    >
      {label}
    </div>
  );
};

MenuItem.displayName = "MenuItem";