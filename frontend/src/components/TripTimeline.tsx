"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface Activity {
    time: string;
    activity: string;
}

interface DayPlan {
    day: string;
    activities: Activity[];
}

interface TripTimelineProps {
    destination: string;
    days: DayPlan[];
    estimatedCost: string;
}

export function TripTimeline({ destination, days, estimatedCost }: TripTimelineProps) {
    // State to track expanded day indices. Default first day expanded.
    const [expandedDay, setExpandedDay] = useState<number | null>(0);

    const toggleDay = (index: number) => {
        setExpandedDay(expandedDay === index ? null : index);
    };

    return (
        <div className="w-full max-w-full p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-8"
            >
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Trip to {destination}
                </h2>
                <p className="text-sm text-slate-400 mt-1">Est. Cost: <span className="text-green-400 font-semibold">{estimatedCost}</span></p>
            </motion.div>

            <div className="space-y-4">
                {days.map((day, index) => (
                    <motion.div
                        key={day.day}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="rounded-2xl overflow-hidden glass border border-white/10"
                    >
                        <button
                            onClick={() => toggleDay(index)}
                            className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold border border-primary/20">
                                    {index + 1}
                                </span>
                                <span className="text-lg font-semibold text-white">{day.day}</span>
                            </div>
                            <div className={`p-1 rounded-full bg-white/10 transition-transform ${expandedDay === index ? "rotate-90" : ""}`}>
                                <ArrowRight className="w-4 h-4 text-slate-300" />
                            </div>
                        </button>

                        <AnimatePresence>
                            {expandedDay === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 pt-0 space-y-4 border-t border-white/10 bg-black/20">
                                        <div className="h-4" /> {/* Spacer */}
                                        {day.activities.map((item, actIndex) => (
                                            <div key={actIndex} className="flex gap-4 group">
                                                <div className="flex flex-col items-center gap-1 min-w-[40px]">
                                                    <span className="text-xs font-mono text-accent/80">{item.time}</span>
                                                    <div className="w-px h-full bg-slate-800/50 mt-1 group-last:hidden" />
                                                </div>
                                                <div className="pb-4">
                                                    <p className="text-sm text-slate-300 group-hover:text-white transition-colors leading-snug">
                                                        {item.activity}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
