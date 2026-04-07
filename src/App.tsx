import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, 
  Search, 
  Languages, 
  Crown, 
  ChevronLeft, 
  BookOpen, 
  CheckCircle2,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  User
} from 'lucide-react';
import Markdown from 'react-markdown';
import { BOOKS, LANGUAGES } from './constants';
import { getBookContent } from './services/geminiService';
import { cn } from './lib/utils';

interface BookType {
  id: number;
  title: string;
  author: string;
  category: string;
}

export default function App() {
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [language, setLanguage] = useState('English');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [bookContent, setBookContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Membership calculation
  const originalPrice = 50;
  const discountPercent = 100;
  const discountedPrice = (originalPrice * (1 - discountPercent / 100)).toFixed(2);

  const filteredBooks = useMemo(() => {
    return BOOKS.filter(book => 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleReadBook = async (book: BookType) => {
    setSelectedBook(book);
    setIsLoading(true);
    setBookContent(null);
    setReadingProgress(0);
    
    const content = await getBookContent(book.title, book.author, language);
    setBookContent(content);
    setIsLoading(false);
    
    // Simulate reading progress
    const interval = setInterval(() => {
      setReadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  const toggleCreatorMode = () => {
    setIsPremium(!isPremium);
  };

  return (
    <div className="min-h-screen bg-dark-gray text-white font-sans selection:bg-gold selection:text-dark-gray">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-dark-gray/80 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedBook(null)}>
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center shadow-lg shadow-gold/20">
              <Book className="text-dark-gray w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">
              Mind <span className="text-gold">&</span> Health
            </h1>
          </div>

          <div className="flex-1 max-w-md mx-4 relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search books, authors, categories..."
              className="w-full bg-medium-gray border border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gold/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-medium-gray px-3 py-1.5 rounded-full border border-white/10">
              <Languages className="w-4 h-4 text-gold" />
              <select 
                className="bg-transparent text-sm focus:outline-none cursor-pointer"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.name} className="bg-medium-gray text-white">
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={toggleCreatorMode}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all shadow-lg",
                isPremium 
                  ? "bg-gold text-dark-gray shadow-gold/30" 
                  : "bg-white/5 hover:bg-white/10 border border-white/10"
              )}
            >
              <Crown className="w-4 h-4" />
              <span className="hidden xs:inline">{isPremium ? "Creator Mode" : "Go Premium"}</span>
            </button>

            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 z-40 bg-dark-gray pt-20 px-6"
          >
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search books..."
                  className="w-full bg-medium-gray border border-white/10 rounded-xl py-3 pl-10 pr-4"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="text-white/40 uppercase text-xs font-bold tracking-widest">Language</h3>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map(lang => (
                    <button 
                      key={lang.code}
                      onClick={() => { setLanguage(lang.name); setIsMenuOpen(false); }}
                      className={cn(
                        "py-2 px-4 rounded-lg text-sm border transition-all",
                        language === lang.name ? "bg-gold text-dark-gray border-gold" : "bg-medium-gray border-white/5"
                      )}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!selectedBook ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Hero Section */}
              <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-medium-gray to-dark-gray border border-white/5 p-8 md:p-12">
                <div className="relative z-10 max-w-2xl">
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 bg-gold/10 text-gold px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6"
                  >
                    <Sparkles className="w-3 h-3" />
                    Special Offer for Creators
                  </motion.div>
                  <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
                  >
                    Unlock Your <span className="text-gold">Potential</span> with Every Page.
                  </motion.h2>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/60 text-lg mb-8"
                  >
                    Access 25+ world-class books in {LANGUAGES.length} languages. From mindset to business, we've got you covered.
                  </motion.p>
                  
                  {!isPremium && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-wrap items-center gap-6"
                    >
                      <button 
                        onClick={toggleCreatorMode}
                        className="bg-gold text-dark-gray px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-gold/20 flex items-center gap-2"
                      >
                        Get Membership <ArrowRight className="w-5 h-5" />
                      </button>
                      <div className="flex flex-col">
                        <span className="text-white/40 line-through text-sm">${originalPrice}</span>
                        <span className="text-2xl font-bold text-gold">${discountedPrice} <span className="text-xs text-white/60 font-normal">({discountPercent}% OFF)</span></span>
                      </div>
                    </motion.div>
                  )}
                  
                  {isPremium && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-3 bg-gold/20 border border-gold/30 p-4 rounded-2xl"
                    >
                      <CheckCircle2 className="text-gold w-6 h-6" />
                      <div>
                        <p className="font-bold text-gold">Creator Access Active</p>
                        <p className="text-sm text-white/60">Everything is free for you! Enjoy reading.</p>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold rounded-full blur-[120px]"></div>
                </div>
              </section>

              {/* Book Grid */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold">Library</h3>
                  <p className="text-white/40 text-sm">{filteredBooks.length} books found</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredBooks.map((book, index) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                      className="group relative bg-medium-gray rounded-3xl border border-white/5 overflow-hidden hover:border-gold/30 transition-all"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-gold/10 transition-colors">
                            <BookOpen className="w-6 h-6 text-gold" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 bg-white/5 px-2 py-1 rounded-md">
                            {book.category}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold mb-1 line-clamp-2 group-hover:text-gold transition-colors">
                          {book.title}
                        </h4>
                        <p className="text-white/40 text-sm mb-6">{book.author}</p>
                        
                        <button 
                          onClick={() => handleReadBook(book)}
                          className="w-full bg-white/5 hover:bg-gold hover:text-dark-gray py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                          Read Now <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div 
              key="reader"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <button 
                onClick={() => setSelectedBook(null)}
                className="flex items-center gap-2 text-white/60 hover:text-gold transition-colors mb-8 group"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back to Library
              </button>

              <div className="bg-medium-gray rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                {/* Reader Header */}
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2 text-gold">{selectedBook.title}</h2>
                    <p className="text-white/60 flex items-center gap-2">
                      <User className="w-4 h-4" /> {selectedBook.author}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Language</span>
                      <span className="bg-gold/10 text-gold px-3 py-1 rounded-full text-sm font-bold">{language}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-white/5 relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${readingProgress}%` }}
                    className="absolute top-0 left-0 h-full bg-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                  />
                </div>

                {/* Content Area */}
                <div className="p-8 md:p-12 min-h-[60vh]">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
                      <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
                      <p className="text-white/40 animate-pulse">Translating to {language}...</p>
                    </div>
                  ) : (
                    <div className="markdown-body prose prose-invert max-w-none">
                      <Markdown>{bookContent || ""}</Markdown>
                    </div>
                  )}
                </div>

                {/* Reader Footer */}
                <div className="p-6 bg-dark-gray/50 border-t border-white/5 flex items-center justify-between">
                  <p className="text-xs text-white/40">Powered by Mind & Health AI Reader</p>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                      <Crown className="w-4 h-4 text-gold" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Book className="text-gold w-6 h-6" />
            <span className="text-xl font-bold">Mind <span className="text-gold">&</span> Health</span>
          </div>
          <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">
            Your personal sanctuary for growth and knowledge. Read the world's best books in any language.
          </p>
          <div className="flex justify-center gap-8 text-sm font-medium text-white/60">
            <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gold transition-colors">Contact Us</a>
          </div>
          <p className="mt-12 text-[10px] text-white/20 uppercase tracking-[0.2em]">
            © 2026 Mind & Health App. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

