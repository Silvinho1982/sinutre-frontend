import { List, Target } from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  drawerId: string;
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function Header({ drawerId }: HeaderProps) {
  const { user, profile } = useAuth();

  return (
    <header className="flex items-center gap-3 w-full">
      <div className="flex-none lg:hidden">
        <label
          htmlFor={drawerId}
          className="btn btn-square btn-ghost drawer-button"
          aria-label="Abrir menu"
        >
          <List size={24} />
        </label>
      </div>

      {user &&
        (user.avatarUrl ? (
          <div className="avatar shrink-0">
            <div className="w-10 lg:w-14 rounded-full border border-base-300">
              <img src={user.avatarUrl} alt={`Avatar de ${user.name}`} />
            </div>
          </div>
        ) : (
          <div className="avatar avatar-placeholder shrink-0">
            <div className="bg-primary text-primary-content w-10 lg:w-14 rounded-full">
              <span className="text-sm lg:text-lg font-bold">
                {initials(user.name)}
              </span>
            </div>
          </div>
        ))}

      <div className="min-w-0 flex-1">
        <h1 className="text-lg lg:text-3xl font-bold tracking-tight truncate">
          Olá, {user?.name?.split(' ')[0] ?? 'visitante'}!
        </h1>
        <p className="text-xs lg:text-sm text-base-content/60 hidden sm:block">
          Acompanhe sua ingestão de macronutrientes de hoje.
        </p>
      </div>

      {profile?.targetDietDaily != null && (
        <div className="hidden sm:flex items-center gap-2 rounded-box bg-primary/10 text-primary px-3 py-2">
          <Target size={18} weight="fill" />
          <span className="text-sm font-semibold">
            Meta: {profile.targetDietDaily.toLocaleString('pt-BR')} kcal
          </span>
        </div>
      )}

      <div className="hidden lg:block">
        <ThemeToggle compact />
      </div>
    </header>
  );
}
