import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuContent = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(function DropdownMenuContent(props, ref) {
  const { sideOffset = 8, style, ...rest } = props;
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          boxShadow: "0 12px 28px var(--shadow-medium)",
          padding: "0.25rem",
          minWidth: "14rem",
          ...style
        }}
        {...rest}
      />
    </DropdownMenuPrimitive.Portal>
  );
});

export const DropdownMenuItem = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Item>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(function DropdownMenuItem(props, ref) {
  const { style, ...rest } = props;
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      style={{
        borderRadius: "calc(var(--radius-md) - 0.25rem)",
        padding: "0.5rem 0.625rem",
        color: "var(--text-primary)",
        outline: "none",
        cursor: "default",
        userSelect: "none",
        ...style
      }}
      {...rest}
    />
  );
});

export const DropdownMenuSeparator = forwardRef<
  ElementRef<typeof DropdownMenuPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(function DropdownMenuSeparator(props, ref) {
  const { style, ...rest } = props;
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      style={{
        height: "1px",
        margin: "0.25rem",
        background: "var(--border-default)",
        ...style
      }}
      {...rest}
    />
  );
});
