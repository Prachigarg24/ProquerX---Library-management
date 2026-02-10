import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const CATEGORIES = ["All", "Fiction", "Non-Fiction", "Science Fiction", "Fantasy", "Romance", "Thriller", "Biography", "Self-Help", "Business", "Philosophy", "History", "Poetry"];

interface BookFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  totalCount: number;
}

export default function BookFilters({ search, onSearchChange, category, onCategoryChange, totalCount }: BookFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search books by title..."
          className="pl-9"
        />
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{totalCount} book{totalCount !== 1 ? "s" : ""}</span>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
