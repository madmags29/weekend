"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SearchBarProps {
    onSearch: (query: string) => void;
    isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length < 2) {
                setSuggestions([]);
                return;
            }
            try {
                const res = await fetch(`http://localhost:8000/suggestions?q=${query}`);
                const data = await res.json();
                setSuggestions(data.suggestions || []);
            } catch (err) {
                console.error("Failed to fetch suggestions", err);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300); // Debounce
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        onSearch(suggestion);
        setShowSuggestions(false);
    };

    return (
        <div className="w-full max-w-2xl relative group z-50">
            <form onSubmit={handleSubmit} className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                <div className="relative flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-2 shadow-2xl transition-all duration-300 focus-within:bg-white/15 focus-within:border-white/30">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setShowSuggestions(true);
                        }}
                        placeholder="Search matching destinations..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/50 px-6 py-3 text-lg font-medium"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className={cn(
                            "p-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                            isLoading && "cursor-wait"
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <Search className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </form>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute w-full mt-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl z-50"
                    >
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full text-left px-6 py-3 text-slate-300 hover:bg-white/10 hover:text-white transition-colors border-b border-white/5 last:border-none"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
