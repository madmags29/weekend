"use client";

import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { DestinationCard } from "@/components/DestinationCard";
import { TripTimeline } from "@/components/TripTimeline";
import { motion, AnimatePresence } from "framer-motion";

// Types matching Backend API
interface SearchResult {
  id: number;
  name: string;
  description: string;
  tags: string[];
}

interface Itinerary {
  destination: string;
  itinerary: {
    day: string;
    activities: { time: string; activity: string }[];
  }[];
  estimated_cost: string;
}

import { VideoBackground } from "@/components/VideoBackground";

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"search" | "results" | "plan">("search");

  // ... (handlers remain the same) ...
  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setSearchResults(data.results || []);
      setView("results");
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanTrip = async (id: number, name: string) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: name }),
      });
      const data = await res.json();
      setSelectedItinerary(data);
      setView("plan");
    } catch (error) {
      console.error("Planning failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchResults([]);
    setSelectedItinerary(null);
    setView("search");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative">
      <VideoBackground />

      {/* Background Ambience - kept for fallback or extra layering */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px]" />
      </div>

      <div className="z-10 w-full max-w-6xl mx-auto flex flex-col items-center">

        {/* Header / Logo Area */}
        <AnimatePresence mode="wait">
          {view === "search" && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/50">
                Weekend Travellers
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Your personal AI concierge for perfect weekend getaways.
                Just tell us what you're in the mood for.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Bar Area */}
        {(view === "search" || view === "results") && (
          <motion.div
            layout
            className={`w-full flex justify-center ${view === "results" ? "mb-12" : "mb-0"}`}
          >
            <SearchBar onSearch={handleSearch} isLoading={loading} />
          </motion.div>
        )}

        {/* Results Grid */}
        <AnimatePresence>
          {view === "results" && searchResults.length > 0 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {searchResults.map((result) => (
                <DestinationCard
                  key={result.id}
                  {...result}
                  onPlanTrip={handlePlanTrip}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Itinerary View */}
        <AnimatePresence>
          {view === "plan" && selectedItinerary && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full"
            >
              <button
                onClick={() => setView("results")}
                className="mb-8 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-sm text-slate-300 transition-colors"
              >
                ← Back to Results
              </button>
              <TripTimeline
                destination={selectedItinerary.destination}
                days={selectedItinerary.itinerary}
                estimatedCost={selectedItinerary.estimated_cost}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
