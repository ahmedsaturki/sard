import React from "react";
import { cn } from "../index";

interface AvatarProps {
  src?: string;
  alt?: string;
  children?: React.ReactNode;
  variant?: "circular" | "rounded";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  sx?: Record<string, any>;
  testId?: string;
}

/**
 * Avatar - A user avatar or image component
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "",
  children,
  variant = "circular",
  size = "md",
  className,
  sx = {},
  testId,
}) => {
  const classes = cn(
    "sard-avatar",
    variant && `sard-avatar--${variant}`,
    size && `sard-avatar--${size}`,
    className
  );

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={classes}
        style={sx}
        data-testid={testId}
      />
    );
  }

  return (
    <div
      className={classes}
      style={sx}
      data-testid={testId}
    >
      {children}
    </div>
  );
};

Avatar.displayName = "Avatar";