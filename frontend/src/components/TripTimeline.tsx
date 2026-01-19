"use client";

import { motion } from "framer-motion";
import { Clock, Coffee, Mountain, Camera, ArrowRight, CheckCircle2 } from "lucide-react";

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
    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mb-12"
            >
                <span className="px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium border border-accent/20">
                    Weekend Plan
                </span>
                <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Trip to {destination}
                </h2>
                <p className="text-slate-400">Estimated Cost: <span className="text-green-400 font-semibold">{estimatedCost}</span></p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 relative">
                {/* Central Line for Desktop */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent transform -translate-x-1/2" />

                {days.map((day, dayIndex) => (
                    <motion.div
                        key={day.day}
                        initial={{ opacity: 0, x: dayIndex % 2 === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: dayIndex * 0.2 }}
                        className={`relative ${dayIndex % 2 !== 0 ? "md:mt-24" : ""}`}
                    >
                        <div className="glass rounded-3xl p-6 border-l-4 border-l-primary/50 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="text-6xl font-black text-white">{dayIndex + 1}</span>
                            </div>

                            <h3 className="text-2xl font-semibold mb-6 text-white flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold border border-primary/20">
                                    {dayIndex + 1}
                                </span>
                                {day.day}
                            </h3>

                            <div className="space-y-6">
                                {day.activities.map((item, index) => (
                                    <div key={index} className="flex gap-4 group">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-2 h-2 rounded-full bg-slate-500 group-hover:bg-accent transition-colors mt-2" />
                                            <div className="w-px h-full bg-slate-800 group-last:hidden" />
                                        </div>
                                        <div>
                                            <span className="text-xs font-mono text-accent/80 block mb-1">{item.time}</span>
                                            <p className="text-slate-300 group-hover:text-white transition-colors">{item.activity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
