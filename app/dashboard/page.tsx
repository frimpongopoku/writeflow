import { PenLine } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-3 select-none px-8 text-center">
      <div className="flex items-center justify-center size-12 rounded-2xl bg-surface">
        <PenLine className="size-5 text-text-secondary" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-[14px] font-semibold text-text-primary">Your writing space</p>
        <p className="text-[13px] font-normal text-text-secondary mt-1">
          Select a folder from the sidebar to get started.
        </p>
      </div>
    </div>
  );
}
