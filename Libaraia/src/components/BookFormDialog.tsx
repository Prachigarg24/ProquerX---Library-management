import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

const CATEGORIES = ["Fiction", "Non-Fiction", "Science Fiction", "Fantasy", "Romance", "Thriller", "Biography", "Self-Help", "Business", "Philosophy", "History", "Poetry"];
const BINDINGS = ["Paperback", "Hardcover", "Spiral", "Library Binding", "eBook"];

interface BookFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: BookFormData, isDraft: boolean) => Promise<void>;
  editBook?: Tables<"books"> | null;
}

export interface BookFormData {
  title: string;
  author: string;
  description: string;
  isbn: string;
  published_by: string;
  publishing_date: string;
  category: string;
  binding: string;
  tags: string;
  image_url: string;
}

export default function BookFormDialog({ open, onClose, onSave, editBook }: BookFormDialogProps) {
  const [form, setForm] = useState<BookFormData>({
    title: "", author: "", description: "", isbn: "", published_by: "",
    publishing_date: "", category: "Fiction", binding: "Paperback", tags: "", image_url: "",
  });
  const [isbnError, setIsbnError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editBook) {
      setForm({
        title: editBook.title,
        author: editBook.author,
        description: editBook.description || "",
        isbn: editBook.isbn || "",
        published_by: editBook.published_by || "",
        publishing_date: editBook.publishing_date || "",
        category: editBook.category,
        binding: editBook.binding,
        tags: editBook.tags?.join(", ") || "",
        image_url: editBook.image_url || "",
      });
    } else {
      setForm({ title: "", author: "", description: "", isbn: "", published_by: "", publishing_date: "", category: "Fiction", binding: "Paperback", tags: "", image_url: "" });
    }
    setIsbnError("");
  }, [editBook, open]);

  const validateIsbn = (val: string) => {
    if (!val) { setIsbnError(""); return true; }
    if (/[^0-9]/.test(val)) { setIsbnError("ISBN must contain only digits"); return false; }
    if (val.length > 10) { setIsbnError("ISBN must be at most 10 digits"); return false; }
    setIsbnError("");
    return true;
  };

  const handleIsbnChange = (val: string) => {
    setForm((f) => ({ ...f, isbn: val }));
    validateIsbn(val);
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!validateIsbn(form.isbn)) return;
    setSaving(true);
    await onSave(form, isDraft);
    setSaving(false);
  };

  const update = (key: keyof BookFormData, val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{editBook ? "Edit Book" : "Add New Book"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left column */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Book title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input id="author" value={form.author} onChange={(e) => update("author", e.target.value)} placeholder="Author name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Brief description..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={form.isbn}
                onChange={(e) => handleIsbnChange(e.target.value)}
                placeholder="e.g. 1234567890"
                maxLength={11}
              />
              {isbnError && <p className="text-xs text-destructive">{isbnError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="published_by">Published By</Label>
              <Input id="published_by" value={form.published_by} onChange={(e) => update("published_by", e.target.value)} placeholder="Publisher name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publishing_date">Publishing Year & Month</Label>
              <Input id="publishing_date" type="month" value={form.publishing_date} onChange={(e) => update("publishing_date", e.target.value)} />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Binding</Label>
              <Select value={form.binding} onValueChange={(v) => update("binding", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BINDINGS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input id="tags" value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="e.g. classic, fiction, adventure" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input id="image_url" value={form.image_url} onChange={(e) => update("image_url", e.target.value)} placeholder="https://..." />
              {form.image_url && (
                <div className="mt-2 h-32 w-24 overflow-hidden rounded-md border border-border">
                  <img src={form.image_url} alt="Preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="mt-4 flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={() => handleSubmit(true)} disabled={saving || !form.title || !form.author}>
            Save Draft
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={() => handleSubmit(false)} disabled={saving || !form.title || !form.author || !!isbnError}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editBook ? "Update" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
