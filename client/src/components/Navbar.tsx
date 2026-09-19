import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sparkles, LayoutDashboard, LogOut, LogIn, UserPlus } from 'lucide-react';

interface NavbarProps {
  onOpenWidget?: () => void;
  unreadCount?: number;
}

export const Navbar = ({ onOpenWidget, unreadCount = 0 }: NavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 max-w-6xl">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg hover:opacity-85">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span>Changelog</span>
          </Link>

          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Public Feed
            </Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <LayoutDashboard className="size-4" />
                Admin Studio
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenWidget && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenWidget}
              className="gap-1.5"
            >
              <Sparkles className="size-3.5 text-amber-500" />
              <span>What's New</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" size="sm" className="ml-1 px-1.5 py-0 h-4">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md border">
                <span className="font-medium text-foreground">{user.name}</span>
                {user.role === 'admin' && (
                  <Badge variant="secondary" size="sm" className="text-[10px] uppercase font-bold">
                    Admin
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-1 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LogIn className="size-3.5" />
                  <span>Login</span>
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="gap-1.5">
                  <UserPlus className="size-3.5" />
                  <span>Sign Up</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
