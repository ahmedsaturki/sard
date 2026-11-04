import React from "react";
import { cn } from "../index";

interface ButtonProps {
  as?: React.ElementType;
  children?: React.ReactNode;
  variant?: "text" | "outlined" | "contained";
  size?: "small" | "medium" | "large";
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  className?: string;
  sx?: Record<string, any>;
  testId?: string;
  href?: string;
}

/**
 * Button - A styled button component using design tokens
 */
export const Button: React.FC<ButtonProps> = ({
  as = "button",
  children,
  variant = "contained",
  size = "medium",
  onClick,
  disabled = false,
  startIcon,
  endIcon,
  className,
  sx = {},
  testId,
  href,
}) => {

  const classes = cn(
    "sard-button",
    variant && `sard-button--${variant}`,
    size && `sard-button--${size}`,
    className
  );

  const handleClick = (e: React.MouseEvent) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return React.createElement(as, {
    className: cn(classes, className),
    style: {
      ...(disabled && { opacity: 0.5, cursor: "not-allowed" }),
      ...sx,
    },
    disabled,
    onClick: handleClick,
    "data-testid": testId,
    "aria-disabled": disabled,
    "type": "button",
    ...(href && { href }),
  }, startIcon, children, endIcon);
};

Button.displayName = "Button";