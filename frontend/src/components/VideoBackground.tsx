"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface VideoData {
    video_files: { link: string; quality: string; width: number }[];
    user: { name: string; url: string };
    url: string; // link to video page
    error?: string;
}

export function VideoBackground() {
    const [video, setVideo] = useState<VideoData | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        fetch("/api/video")
            .then((res) => res.json())
            .then((data) => {
                if (!data.error && data.video_files) {
                    setVideo(data);
                }
            })
            .catch((err) => console.error("Failed to load video background", err));
    }, []);

    if (!mounted) return null;

    // Find the best quality HD video (around 1920 width)
    const videoSrc = video?.video_files?.find(
        (v) => v.width >= 1280 && v.width <= 2560
    )?.link || video?.video_files?.[0]?.link;

    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden z-0">
            <div className="absolute inset-0 bg-black/40 z-10" /> {/* Overlay for text readability */}

            {videoSrc ? (
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 opacity-100"
                >
                    <source src={videoSrc} type="video/mp4" />
                </video>
            ) : (
                // Fallback gradient if no video
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
            )}

            {/* Credits */}
            {video && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-4 right-4 z-20 text-xs text-white/50 bg-black/20 backdrop-blur-sm px-2 py-1 rounded border border-white/10"
                >
                    Video by <a href={video.user.url} target="_blank" rel="noreferrer" className="hover:text-white underline">{video.user.name}</a> via <a href={video.url} target="_blank" rel="noreferrer" className="hover:text-white underline">Pixabay</a>
                </motion.div>
            )}
        </div>
    );
}
