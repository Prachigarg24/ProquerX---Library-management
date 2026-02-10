import { supabase } from "@/integrations/supabase/client";

const SAMPLE_BOOKS = [
  { title: "To Kill a Mockingbird", author: "Harper Lee", description: "A gripping tale of racial injustice in the American South.", isbn: "0446310786", published_by: "J.B. Lippincott", publishing_date: "1960-07", category: "Fiction", binding: "Hardcover", tags: ["classic", "drama"] },
  { title: "1984", author: "George Orwell", description: "A dystopian novel set in a totalitarian society.", isbn: "0451524934", published_by: "Secker & Warburg", publishing_date: "1949-06", category: "Science Fiction", binding: "Paperback", tags: ["dystopia", "classic"] },
  { title: "Pride and Prejudice", author: "Jane Austen", description: "A romantic novel about manners and marriage.", isbn: "0141439513", published_by: "T. Egerton", publishing_date: "1813-01", category: "Romance", binding: "Paperback", tags: ["classic", "romance"] },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", description: "A story of wealth, love, and the American Dream.", isbn: "0743273567", published_by: "Charles Scribner's", publishing_date: "1925-04", category: "Fiction", binding: "Hardcover", tags: ["classic", "american"] },
  { title: "Sapiens", author: "Yuval Noah Harari", description: "A brief history of humankind.", isbn: "0062316095", published_by: "Harper", publishing_date: "2015-02", category: "Non-Fiction", binding: "Paperback", tags: ["history", "science"] },
  { title: "Dune", author: "Frank Herbert", description: "An epic science fiction novel set on the desert planet Arrakis.", isbn: "0441172717", published_by: "Chilton Books", publishing_date: "1965-08", category: "Science Fiction", binding: "Paperback", tags: ["sci-fi", "adventure"] },
  { title: "The Hobbit", author: "J.R.R. Tolkien", description: "A fantasy adventure of Bilbo Baggins.", isbn: "0547928227", published_by: "Allen & Unwin", publishing_date: "1937-09", category: "Fantasy", binding: "Hardcover", tags: ["fantasy", "adventure"] },
  { title: "Atomic Habits", author: "James Clear", description: "Tiny changes, remarkable results.", isbn: "0735211299", published_by: "Avery", publishing_date: "2018-10", category: "Self-Help", binding: "Hardcover", tags: ["productivity", "habits"] },
  { title: "The Catcher in the Rye", author: "J.D. Salinger", description: "A teenage boy's journey through New York City.", isbn: "0316769487", published_by: "Little, Brown", publishing_date: "1951-07", category: "Fiction", binding: "Paperback", tags: ["classic", "coming-of-age"] },
  { title: "Brave New World", author: "Aldous Huxley", description: "A dystopian vision of a genetically engineered society.", isbn: "0060850523", published_by: "Chatto & Windus", publishing_date: "1932-01", category: "Science Fiction", binding: "Paperback", tags: ["dystopia", "classic"] },
  { title: "The Alchemist", author: "Paulo Coelho", description: "A shepherd's journey to find his personal legend.", isbn: "0062315005", published_by: "HarperOne", publishing_date: "1988-01", category: "Fiction", binding: "Paperback", tags: ["philosophical", "adventure"] },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", description: "How two systems drive the way we think.", isbn: "0374533555", published_by: "Farrar, Straus", publishing_date: "2011-10", category: "Non-Fiction", binding: "Hardcover", tags: ["psychology", "science"] },
  { title: "The Art of War", author: "Sun Tzu", description: "Ancient Chinese military treatise.", isbn: "1590302257", published_by: "Shambhala", publishing_date: "2005-03", category: "Non-Fiction", binding: "Paperback", tags: ["strategy", "classic"] },
  { title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", description: "A young wizard discovers his magical heritage.", isbn: "0590353403", published_by: "Bloomsbury", publishing_date: "1997-06", category: "Fantasy", binding: "Hardcover", tags: ["fantasy", "magic"] },
  { title: "The Lean Startup", author: "Eric Ries", description: "How entrepreneurs use innovation to create businesses.", isbn: "0307887898", published_by: "Crown Business", publishing_date: "2011-09", category: "Business", binding: "Hardcover", tags: ["startup", "business"] },
  { title: "Crime and Punishment", author: "Fyodor Dostoevsky", description: "A psychological exploration of guilt and redemption.", isbn: "0486415872", published_by: "The Russian Messenger", publishing_date: "1866-01", category: "Fiction", binding: "Paperback", tags: ["classic", "russian"] },
  { title: "Educated", author: "Tara Westover", description: "A memoir about growing up in a survivalist family.", isbn: "0399590501", published_by: "Random House", publishing_date: "2018-02", category: "Biography", binding: "Hardcover", tags: ["memoir", "education"] },
  { title: "The Hitchhiker's Guide to the Galaxy", author: "Douglas Adams", description: "A comedic science fiction adventure across the galaxy.", isbn: "0345391802", published_by: "Pan Books", publishing_date: "1979-10", category: "Science Fiction", binding: "Paperback", tags: ["comedy", "sci-fi"] },
  { title: "Meditations", author: "Marcus Aurelius", description: "Personal writings on Stoic philosophy.", isbn: "0140449335", published_by: "Penguin Classics", publishing_date: "2006-05", category: "Philosophy", binding: "Paperback", tags: ["philosophy", "stoicism"] },
  { title: "The Power of Habit", author: "Charles Duhigg", description: "Why we do what we do in life and business.", isbn: "0812981605", published_by: "Random House", publishing_date: "2012-02", category: "Self-Help", binding: "Paperback", tags: ["habits", "psychology"] },
  { title: "Fahrenheit 451", author: "Ray Bradbury", description: "A future American society where books are outlawed.", isbn: "1451673310", published_by: "Ballantine", publishing_date: "1953-10", category: "Science Fiction", binding: "Paperback", tags: ["dystopia", "classic"] },
  { title: "Gone Girl", author: "Gillian Flynn", description: "A thriller about a marriage gone terribly wrong.", isbn: "0307588378", published_by: "Crown", publishing_date: "2012-06", category: "Thriller", binding: "Hardcover", tags: ["thriller", "mystery"] },
  { title: "Steve Jobs", author: "Walter Isaacson", description: "The biography of Apple's visionary co-founder.", isbn: "1451648537", published_by: "Simon & Schuster", publishing_date: "2011-10", category: "Biography", binding: "Hardcover", tags: ["biography", "technology"] },
  { title: "The Da Vinci Code", author: "Dan Brown", description: "A symbologist uncovers a religious mystery.", isbn: "0307474275", published_by: "Doubleday", publishing_date: "2003-03", category: "Thriller", binding: "Paperback", tags: ["thriller", "mystery"] },
  { title: "A Brief History of Time", author: "Stephen Hawking", description: "An exploration of the universe's biggest questions.", isbn: "0553380168", published_by: "Bantam Dell", publishing_date: "1988-04", category: "Non-Fiction", binding: "Paperback", tags: ["science", "physics"] },
];

export async function seedBooksIfEmpty(userId: string) {
  const { count } = await supabase.from("books").select("*", { count: "exact", head: true });
  if (count && count > 0) return;

  const booksWithUser = SAMPLE_BOOKS.map((b) => ({ ...b, created_by: userId, is_draft: false }));
  await supabase.from("books").insert(booksWithUser);
}
