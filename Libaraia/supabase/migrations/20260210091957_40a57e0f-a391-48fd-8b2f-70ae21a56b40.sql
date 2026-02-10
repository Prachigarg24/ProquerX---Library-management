
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT DEFAULT '',
  isbn TEXT UNIQUE,
  published_by TEXT DEFAULT '',
  publishing_date TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Fiction',
  binding TEXT NOT NULL DEFAULT 'Paperback',
  tags TEXT[] DEFAULT '{}',
  image_url TEXT DEFAULT '',
  is_draft BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Anyone logged in can view all books
CREATE POLICY "Authenticated users can view books" ON public.books FOR SELECT USING (auth.uid() IS NOT NULL);
-- Users can insert their own books
CREATE POLICY "Users can insert own books" ON public.books FOR INSERT WITH CHECK (auth.uid() = created_by);
-- Users can update their own books
CREATE POLICY "Users can update own books" ON public.books FOR UPDATE USING (auth.uid() = created_by);
-- Users can delete their own books
CREATE POLICY "Users can delete own books" ON public.books FOR DELETE USING (auth.uid() = created_by);

-- Update trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ISBN validation function
CREATE OR REPLACE FUNCTION public.validate_isbn()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.isbn IS NOT NULL AND NEW.isbn != '' THEN
    IF NEW.isbn ~ '[^0-9]' THEN
      RAISE EXCEPTION 'ISBN must contain only digits';
    END IF;
    IF length(NEW.isbn) > 10 THEN
      RAISE EXCEPTION 'ISBN must be at most 10 digits';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_isbn_trigger
  BEFORE INSERT OR UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.validate_isbn();
