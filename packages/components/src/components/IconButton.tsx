import React from "react";
import { cn } from "../index";

interface IconButtonProps {
  as?: React.ElementType;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  color?: "default" | "inherit" | "primary" | "secondary";
  edge?: "start" | "end" | false;
  className?: string;
  sx?: Record<string, any>;
  testId?: string;
}

/**
 * IconButton - A button component designed for icons
 */
export const IconButton: React.FC<IconButtonProps> = ({
  as = "button",
  children,
  onClick,
  disabled = false,
  size = "medium",
  color = "default",
  edge = false,
  className,
  sx = {},
  testId,
}) => {
  const classes = cn(
    "sard-icon-button",
    size && `sard-icon-button--${size}`,
    color && `sard-icon-button--color-${color}`,
    edge && `sard-icon-button--edge-${edge}`,
    className
  );

  const handleClick = (e: React.MouseEvent) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return React.createElement(as, {
    className: classes,
    style: {
      ...(disabled && { opacity: 0.5, cursor: "not-allowed" }),
      ...sx,
    },
    disabled,
    onClick: handleClick,
    "data-testid": testId,
    "aria-disabled": disabled,
    "type": "button",
  }, children);
};

IconButton.displayName = "IconButton";