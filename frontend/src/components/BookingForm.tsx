"use client";

import { useState } from "react";
import { Calendar, User, Mail, Phone, CheckCircle, ArrowRight } from "lucide-react";

interface BookingFormProps {
    destination: string;
    estimatedCost: string;
}

export function BookingForm({ destination, estimatedCost }: BookingFormProps) {
    const [agreed, setAgreed] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        // Mock API call would go here
    };

    if (submitted) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-black/40 backdrop-blur-xl border-l border-white/10">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h2>
                <p className="text-slate-400 max-w-md">
                    Your trip to <span className="text-primary font-semibold">{destination}</span> has been booked.
                    We've sent a confirmation email with all details.
                </p>
                <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-sm text-slate-500 uppercase tracking-wider mb-1">Total Estimated Cost</p>
                    <p className="text-2xl font-mono text-primary">{estimatedCost}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-8 bg-black/40 backdrop-blur-xl border-l border-white/10 overflow-y-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Book Your Trip</h2>
                <p className="text-slate-400">Complete your details to finalize the trip to <span className="text-white font-medium">{destination}</span>.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            required
                            placeholder="John Doe"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="tel"
                                required
                                placeholder="+91 98765..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="date"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="email"
                            required
                            placeholder="john@example.com"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                </div>

                <div className="pt-4 pb-2">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                required
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-600 bg-white/5 transition-all checked:border-primary checked:bg-primary"
                            />
                            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                        <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors pt-0.5">
                            I agree to the <a href="#" className="underline decoration-slate-600 hover:text-white">Terms & Conditions</a> and processing of my personal data.
                        </span>
                    </label>
                </div>

                <button
                    type="submit"
                    className="w-full py-4 bg-primary hover:bg-primary/90 text-black rounded-xl font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    Book My Trip
                    <ArrowRight className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}
