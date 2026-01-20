"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

interface TripMapProps {
    destination: string;
    userLocation?: [number, number];
}

export function TripMap({ destination, userLocation }: TripMapProps) {
    const Map = useMemo(() => dynamic(
        () => import("@/components/LeafletMap"),
        {
            loading: () => <div className="w-full h-full flex items-center justify-center bg-white/5 text-slate-400">Loading Map...</div>,
            ssr: false
        }
    ), []);

    return (
        <div className="w-full h-full min-h-[500px] overflow-hidden relative">
            <div className="absolute top-4 left-4 z-[1000] px-4 py-2 rounded-full bg-black/50 backdrop-blur-md text-white text-sm font-medium border border-white/10">
                Route to {destination}
            </div>

            <Map destination={destination} userLocation={userLocation} />
        </div>
    );
}
