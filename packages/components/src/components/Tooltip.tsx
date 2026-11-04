import React from "react";
import { cn } from "../index";

interface TooltipProps {
  children: React.ReactNode;
  title: string;
  placement?: "top" | "bottom" | "left" | "right";
  className?: string;
  sx?: Record<string, any>;
  style?: React.CSSProperties;
  testId?: string;
}

/**
 * Tooltip - A simple tooltip component
 * Note: In a production implementation, this would use a portal for proper positioning
 */
export const Tooltip: React.FC<TooltipProps> = ({
  children,
  title,
  placement = "top",
  className,
  sx = {},
  style,
  testId,
}) => {
  const classes = cn("sard-tooltip", className);

  return React.createElement("div", {
    className: cn(classes),
    style: {
      ...style,
      ...sx,
      position: "relative",
      display: "inline-block",
    },
    "data-testid": testId,
  }, [
    children,
    React.createElement("div", {
      key: "tooltip",
      className: "sard-tooltip-content",
      style: {
        position: "absolute",
        zIndex: 1000,
        backgroundColor: "black",
        color: "white",
        padding: "4px 8px",
        borderRadius: 4,
        fontSize: 12,
        whiteSpace: "nowrap",
        maxWidth: 200,
        opacity: 0,
        transition: "opacity 0.2s",
        ...getPlacementStyle(placement),
      },
      "data-testid": `${testId}-content`,
    }, title),
  ]);
};

function getPlacementStyle(placement: "top" | "bottom" | "left" | "right") {
  switch (placement) {
    case "top":
      return { bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: 4 };
    case "bottom":
      return { top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: 4 };
    case "left":
      return { right: "100%", top: "50%", transform: "translateY(-50%)", marginRight: 4 };
    case "right":
      return { left: "100%", top: "50%", transform: "translateY(-50%)", marginLeft: 4 };
    default:
      return { bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: 4 };
  }
};

Tooltip.displayName = "Tooltip";