"use client";

import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { DestinationCard } from "@/components/DestinationCard";
import { TripMap } from "@/components/TripMap";
import { ChatInterface } from "@/components/ChatInterface";
import { motion, AnimatePresence } from "framer-motion";
import { BookingForm } from "@/components/BookingForm";

// Types matching Backend API
import { useGeolocation } from "@/hooks/useGeolocation";

interface SearchResult {
  id: number;
  name: string;
  description: string;
  tags: string[];
  distance?: string;
  drive_time?: string;
  estimated_cost?: string;
  best_time_visit?: string;
  famous_for?: string;
  ideal_for?: string;
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
  const [currentQuery, setCurrentQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"booking" | "map">("booking");
  const [showMap, setShowMap] = useState(false); // Mobile only map toggle

  // Get User Location
  const { coords } = useGeolocation();

  // ... (handlers remain the same) ...
  const handleSearch = async (query: string) => {
    setCurrentQuery(query);
    if (!query.trim()) {
      resetSearch();
      return;
    }
    setLoading(true);
    try {
      const payload = {
        query,
        user_location: coords ? `${coords.latitude},${coords.longitude}` : undefined
      };

      const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:8000");
      const res = await fetch(`${API_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:8000");
      const res = await fetch(`${API_URL}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: name,
          user_query: currentQuery
        }),
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

  const POPULAR_DESTINATIONS = [
    { name: "Goa", emoji: "🌴", color: "from-blue-500 to-cyan-400" },
    { name: "Munnar", emoji: "🍵", color: "from-green-500 to-emerald-400" },
    { name: "Jaipur", emoji: "🏰", color: "from-pink-500 to-rose-400" },
    { name: "Manali", emoji: "🏔️", color: "from-indigo-500 to-purple-400" },
    { name: "Rishikesh", emoji: "🧘", color: "from-orange-500 to-amber-400" }
  ];

  return (
    <main
      onClick={resetSearch}
      className={`min-h-screen flex flex-col items-center ${view === "plan" ? "p-0 justify-start" : "justify-center p-4 md:p-8"} relative transition-all duration-500`}
    >
      <VideoBackground />

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px]" />
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className={`z-10 w-full mx-auto flex flex-col items-center transition-all duration-500 ${view === "plan" ? "max-w-none h-screen" : "max-w-6xl"}`}
      >

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
                Just tell us what you&apos;re in the mood for.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Bar Area */}
        {(view === "search" || view === "results") && (
          <motion.div
            layout
            className={`w-full flex flex-col items-center justify-center ${view === "results" ? "mb-12" : "mb-8"}`}
          >
            <SearchBar onSearch={handleSearch} isLoading={loading} />

            {/* Horizontal Popular List */}
            {view === "search" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-12 w-full max-w-4xl overflow-x-auto pb-4 scrollbar-hide flex items-center justify-center gap-4"
              >
                {POPULAR_DESTINATIONS.map((dest) => (
                  <button
                    key={dest.name}
                    onClick={() => handleSearch(dest.name)}
                    className="flex-shrink-0 group relative overflow-hidden rounded-2xl w-32 h-32 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all duration-300"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${dest.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                    <span className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">{dest.emoji}</span>
                    <span className="text-sm font-medium text-slate-200 group-hover:text-white">{dest.name}</span>
                  </button>
                ))}
              </motion.div>
            )}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-screen grid md:grid-cols-2 gap-0"
            >
              {/* Left Panel: Chat Interface */}
              <div className="h-full bg-black/40 backdrop-blur-xl border-r border-white/10 relative z-20">
                <ChatInterface
                  destination={selectedItinerary.destination}
                  itineraryData={selectedItinerary}
                  onBack={() => setView("results")}
                  onToggleMap={() => setShowMap(true)}
                />
              </div>

              {/* Right Panel: Tabs (Desktop) */}
              <div className="hidden md:flex h-full flex-col relative z-10 bg-slate-950/50 border-l border-white/10">
                {/* Tab Switcher */}
                <div className="flex items-center p-2 gap-2 border-b border-white/10 bg-black/20">
                  <button
                    onClick={() => setActiveTab("booking")}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === "booking"
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    Booking Code
                  </button>
                  <button
                    onClick={() => setActiveTab("map")}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === "map"
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                  >
                    Map View
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden relative">
                  {activeTab === "booking" ? (
                    <BookingForm
                      destination={selectedItinerary.destination}
                      estimatedCost={selectedItinerary.estimated_cost}
                    />
                  ) : (
                    <div className="absolute inset-0">
                      <TripMap
                        destination={selectedItinerary.destination}
                        userLocation={coords ? [coords.latitude, coords.longitude] : undefined}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Map Modal (Global) */}
              <AnimatePresence>
                {showMap && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-4 md:inset-10 z-[100] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
                  >
                    <div className="absolute top-4 right-4 z-[110]">
                      <button
                        onClick={() => setShowMap(false)}
                        className="px-4 py-2 bg-black/60 backdrop-blur text-white rounded-full border border-white/10 text-sm font-medium hover:bg-black/80 transition-colors"
                      >
                        Close Map
                      </button>
                    </div>
                    <TripMap
                      destination={selectedItinerary.destination}
                      userLocation={coords ? [coords.latitude, coords.longitude] : undefined}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Overlay for map background */}
              {showMap && <div className="fixed inset-0 bg-black/80 z-[90] backdrop-blur-sm" onClick={() => setShowMap(false)} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
