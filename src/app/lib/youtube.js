// /lib/youtube.js
export async function getLatestVideoIdFromChannel(channelId, fallback = "") {
    try {
        const res = await fetch(
            `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
            { next: { revalidate: 60 * 15 } } // revalida cada 15 min
        );
        if (!res.ok) return fallback;
        const xml = await res.text();
        const match = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
        return match ? match[1] : fallback;
    } catch {
        return fallback;
    }
}
