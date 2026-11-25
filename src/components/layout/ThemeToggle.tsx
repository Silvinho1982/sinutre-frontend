import { Moon, Sun } from '@phosphor-icons/react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  compact?: boolean;
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="btn btn-ghost btn-circle"
        aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
        title={isDark ? 'Modo claro' : 'Modo escuro'}
      >
        {isDark ? <Sun size={22} /> : <Moon size={22} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn btn-ghost gap-3 justify-start w-full"
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
      <span>{isDark ? 'Modo claro' : 'Modo escuro'}</span>
    </button>
  );
}
