import { useNavigate } from 'react-router-dom';
import { SignOut } from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { NAV_ITEMS } from '@/constants/navigation';
import { SidebarBrand } from './SidebarBrand';
import { SidebarItem } from './SidebarItem';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
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

export function Sidebar({ drawerId }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const expanded = true;

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="drawer-side z-50">
      <label
        htmlFor={drawerId}
        aria-label="Fechar menu"
        className="drawer-overlay"
      />
      <div
        className={`bg-base-100 flex flex-col min-h-full border-r border-base-300 shadow-sm transition-all duration-300 ${
          expanded ? 'w-64 items-start' : 'w-20 items-center'
        }`}
      >
        <SidebarBrand expanded={expanded} />

        <ul className="menu w-full grow pt-4 gap-2 px-2">
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.id}
              label={item.label}
              Icon={item.Icon}
              to={item.to}
              expanded={expanded}
            />
          ))}
        </ul>

        <div className="w-full border-t border-base-300 p-3 flex flex-col gap-2">
          <ThemeToggle />

          {user && (
            <div className="flex items-center gap-3 px-1 py-1">
              {user.avatarUrl ? (
                <div className="avatar">
                  <div className="w-9 rounded-full">
                    <img src={user.avatarUrl} alt={`Avatar de ${user.name}`} />
                  </div>
                </div>
              ) : (
                <div className="avatar avatar-placeholder">
                  <div className="bg-primary text-primary-content w-9 rounded-full">
                    <span className="text-sm font-bold">{initials(user.name)}</span>
                  </div>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-xs text-base-content/60 truncate">
                  {user.email ?? (user.githubLogin ? `@${user.githubLogin}` : 'Conta SiNutre')}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-ghost justify-start gap-3 text-error"
          >
            <SignOut size={20} />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
