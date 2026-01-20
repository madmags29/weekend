import { NextResponse } from 'next/server';

export async function GET() {
    const apiKey = process.env.PIXABAY_API_KEY;

    if (!apiKey || apiKey === 'your_pixabay_api_key_here') {
        return NextResponse.json({
            video_files: [],
            user: { name: "Pixabay", url: "https://pixabay.com" },
            error: "API Key missing"
        }, { status: 200 });
    }

    try {
        const query = "India cinematic travel landscape";
        const url = `https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=15&safesearch=true`;

        const res = await fetch(url);

        if (!res.ok) {
            throw new Error("Failed to fetch from Pixabay");
        }

        const data = await res.json();

        if (data.hits && data.hits.length > 0) {
            // Pick a random video
            const randomIndex = Math.floor(Math.random() * data.hits.length);
            const video = data.hits[randomIndex];

            // Map Pixabay structure to match our VideoData interface
            return NextResponse.json({
                video_files: [
                    {
                        link: video.videos.large.url || video.videos.medium.url,
                        quality: "hd",
                        width: video.videos.large.width
                    },
                    {
                        link: video.videos.medium.url,
                        quality: "sd",
                        width: video.videos.medium.width
                    }
                ],
                user: {
                    name: video.user,
                    url: `https://pixabay.com/users/${video.user}-${video.user_id}/`
                },
                url: video.pageURL
            });
        }

        return NextResponse.json({ error: "No videos found" }, { status: 404 });

    } catch (error) {
        console.error("Pixabay API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
