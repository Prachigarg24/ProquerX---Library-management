import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface BookCardProps {
  book: Tables<"books">;
  onEdit: (book: Tables<"books">) => void;
  onDelete: (id: string) => void;
  isOwner: boolean;
}

export default function BookCard({ book, onEdit, onDelete, isOwner }: BookCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      layout
    >
      <Card className="group overflow-hidden border-border transition-shadow hover:shadow-md">
        <CardContent className="p-0">
          <div className="flex gap-4 p-4">
            <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-md bg-secondary">
              {book.image_url ? (
                <img src={book.image_url} alt={book.title} className="h-full w-full rounded-md object-cover" />
              ) : (
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-base font-semibold text-foreground">{book.title}</h3>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                </div>
                {isOwner && (
                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(book)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(book.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
              {book.description && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{book.description}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-xs">{book.category}</Badge>
                <Badge variant="outline" className="text-xs">{book.binding}</Badge>
                {book.is_draft && <Badge variant="destructive" className="text-xs">Draft</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
