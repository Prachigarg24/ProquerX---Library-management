import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { seedBooksIfEmpty } from "@/lib/seedBooks";
import AppHeader from "@/components/AppHeader";
import BookCard from "@/components/BookCard";
import BookFilters from "@/components/BookFilters";
import BookFormDialog, { BookFormData } from "@/components/BookFormDialog";
import { Loader2, BookOpen } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [books, setBooks] = useState<Tables<"books">[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editBook, setEditBook] = useState<Tables<"books"> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchBooks = async () => {
    const { data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading books", description: error.message, variant: "destructive" });
    } else {
      setBooks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    seedBooksIfEmpty(user.id).then(() => fetchBooks());
  }, [user]);

  const filteredBooks = useMemo(() => {
    let result = books;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
    }
    if (category !== "All") {
      result = result.filter((b) => b.category === category);
    }
    return result;
  }, [books, search, category]);

  const handleSave = async (data: BookFormData, isDraft: boolean) => {
    if (!user) return;
    const tags = data.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const payload = {
      title: data.title,
      author: data.author,
      description: data.description || null,
      isbn: data.isbn || null,
      published_by: data.published_by || null,
      publishing_date: data.publishing_date || null,
      category: data.category,
      binding: data.binding,
      tags,
      image_url: data.image_url || null,
      is_draft: isDraft,
    };

    if (editBook) {
      const { error } = await supabase.from("books").update(payload).eq("id", editBook.id);
      if (error) {
        toast({ title: "Error updating book", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Book updated!" });
    } else {
      const { error } = await supabase.from("books").insert({ ...payload, created_by: user.id });
      if (error) {
        toast({ title: "Error adding book", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Book added!" });
    }
    setFormOpen(false);
    setEditBook(null);
    fetchBooks();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("books").delete().eq("id", deleteId);
    if (error) {
      toast({ title: "Error deleting book", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Book deleted" });
      fetchBooks();
    }
    setDeleteId(null);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onAddBook={() => { setEditBook(null); setFormOpen(true); }} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground">Your Library</h2>
          <p className="text-sm text-muted-foreground">Manage your book collection</p>
        </div>

        <BookFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          totalCount={filteredBooks.length}
        />

        {loading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="mt-16 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/40" />
            <p className="mt-3 text-muted-foreground">No books found</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isOwner={book.created_by === user.id}
                onEdit={(b) => { setEditBook(b); setFormOpen(true); }}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>
        )}
      </main>

      <BookFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditBook(null); }}
        onSave={handleSave}
        editBook={editBook}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. Are you sure?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
