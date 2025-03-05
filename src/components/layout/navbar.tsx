
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bell, 
  Calendar, 
  ChevronDown, 
  LogOut, 
  Menu,
  Moon, 
  Settings, 
  Sun, 
  User, 
  X 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CustomButton } from "@/components/ui/custom-button";

interface NavbarProps {
  user?: { name: string; email: string; avatarUrl?: string };
}

export function Navbar({ user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const profileRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
    toast({
      title: isDarkMode ? "Light mode activated" : "Dark mode activated",
      duration: 1500,
    });
  };

  const handleLogout = () => {
    // In a real app, this would call Supabase auth.signOut()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div ref={menuRef} className="lg:hidden">
            <CustomButton
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </CustomButton>
            
            {isMenuOpen && (
              <div className="absolute top-16 left-0 w-full animate-fade-in">
                <nav className="glass border-b p-4 space-y-4">
                  <a 
                    href="/" 
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent smooth-transition"
                  >
                    Dashboard
                  </a>
                  <a 
                    href="#tasks" 
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent smooth-transition"
                  >
                    My Tasks
                  </a>
                  <a 
                    href="#calendar" 
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent smooth-transition"
                  >
                    <Calendar size={18} />
                    Calendar
                  </a>
                </nav>
              </div>
            )}
          </div>
          
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight">DevTaskr</span>
          </a>
          
          <nav className="hidden lg:flex items-center gap-6 ml-6">
            <a 
              href="/" 
              className="text-sm font-medium hover:text-primary smooth-transition"
            >
              Dashboard
            </a>
            <a 
              href="#tasks" 
              className="text-sm font-medium hover:text-primary smooth-transition"
            >
              My Tasks
            </a>
            <a 
              href="#calendar" 
              className="text-sm font-medium hover:text-primary smooth-transition"
            >
              Calendar
            </a>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <CustomButton
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </CustomButton>
          
          <CustomButton
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </CustomButton>
          
          {user ? (
            <div ref={profileRef} className="relative">
              <button
                onClick={toggleProfile}
                className="flex items-center gap-2 hover:text-primary smooth-transition"
              >
                <span className="hidden sm:inline-block font-medium">
                  {user.name}
                </span>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <ChevronDown size={16} className={isProfileOpen ? "rotate-180" : ""} />
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 animate-scale glass rounded-lg shadow-lg overflow-hidden">
                  <div className="p-3 border-b border-border">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <a
                      href="#profile"
                      className="flex items-center gap-2 p-2 text-sm rounded-md hover:bg-accent smooth-transition"
                    >
                      <User size={16} />
                      Profile
                    </a>
                    <a
                      href="#settings"
                      className="flex items-center gap-2 p-2 text-sm rounded-md hover:bg-accent smooth-transition"
                    >
                      <Settings size={16} />
                      Settings
                    </a>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 p-2 text-sm rounded-md w-full text-left hover:bg-accent smooth-transition"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <CustomButton onClick={() => navigate("/login")}>
              Sign in
            </CustomButton>
          )}
        </div>
      </div>
    </header>
  );
}
