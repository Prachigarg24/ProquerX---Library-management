import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { BookOpen, LogOut, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppHeaderProps {
  onAddBook: () => void;
}

export default function AppHeader({ onAddBook }: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">Libraria</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onAddBook} size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Book
          </Button>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <span>{user?.email}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
