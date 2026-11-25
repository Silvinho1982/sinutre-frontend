import { List } from '@phosphor-icons/react';

interface SimpleHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const DRAWER_ID = 'main-drawer';

export function SimpleHeader({ title, subtitle, action }: SimpleHeaderProps) {
  return (
    <header className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-3 w-full">
        <div className="flex-none lg:hidden">
          <label
            htmlFor={DRAWER_ID}
            className="btn btn-square btn-ghost drawer-button"
            aria-label="Abrir menu"
          >
            <List size={24} />
          </label>
        </div>

        <div className="flex-1">
          <h1 className="text-xl lg:text-4xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm lg:text-base text-base-content/60">{subtitle}</p>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
