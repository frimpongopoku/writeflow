"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    className="toaster group"
    toastOptions={{
      classNames: {
        toast:
          "group toast !bg-popup !text-text-primary !border-border !shadow-lg font-[var(--font-ui)]",
        description: "!text-text-secondary",
        actionButton: "!bg-primary !text-primary-foreground",
        cancelButton: "!bg-muted !text-muted-foreground",
      },
    }}
    {...props}
  />
);

export { Toaster };
