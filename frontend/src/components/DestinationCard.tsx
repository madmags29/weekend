"use client";

import { motion } from "framer-motion";
import { MapPin, Tag, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DestinationCardProps {
    id: number;
    name: string;
    description: string;
    tags: string[];
    onPlanTrip: (id: number, name: string) => void;
}

export function DestinationCard({ id, name, description, tags, onPlanTrip }: DestinationCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass rounded-3xl p-6 hover:bg-white/10 transition-colors duration-300 flex flex-col h-full border border-white/10"
        >
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent" />
                    {name}
                </h3>
            </div>

            <p className="text-slate-300 mb-6 flex-grow">{description}</p>

            <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-primary border border-white/5"
                    >
                        #{tag}
                    </span>
                ))}
            </div>

            <button
                onClick={() => onPlanTrip(id, name)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-white font-medium transition-all group"
            >
                Plan Trip
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
        </motion.div>
    );
}
