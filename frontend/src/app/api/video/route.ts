import { NextResponse } from 'next/server';

export async function GET() {
    const apiKey = process.env.PEXELS_API_KEY;

    if (!apiKey || apiKey === 'your_pexels_api_key_here') {
        // Return a fallback or error if no key
        // Using a sample fallback response structure
        return NextResponse.json({
            video_files: [],
            user: { name: "Pexels", url: "https://www.pexels.com" },
            error: "API Key missing"
        }, { status: 200 });
    }

    try {
        // Search for "India cinematic travel landscape"
        // orientation=landscape, size=medium or large
        const query = "India cinematic travel landscape";
        const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape&size=medium`;

        const res = await fetch(url, {
            headers: {
                Authorization: apiKey
            }
        });

        if (!res.ok) {
            throw new Error("Failed to fetch from Pexels");
        }

        const data = await res.json();

        if (data.videos && data.videos.length > 0) {
            // Pick a random video from the top 15
            const randomIndex = Math.floor(Math.random() * data.videos.length);
            const video = data.videos[randomIndex];
            return NextResponse.json(video);
        }

        return NextResponse.json({ error: "No videos found" }, { status: 404 });

    } catch (error) {
        console.error("Pexels API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
