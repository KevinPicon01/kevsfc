// app/page.jsx
import Image from "next/image";
import Link from "next/link";

const RED = "#e11d48";

const SOCIALS = [
    { label: "YouTube", href: "https://www.youtube.com/channel/UCUIjrgbNZn8rmUeAEguB_kQ", icon: YouTubeIcon },
    { label: "X (Twitter)", href: "https://x.com/kevs_fc", icon: XIcon },
    { label: "Instagram", href: "https://www.instagram.com/kevs.fc/", icon: InstagramIcon },
];

const benefits = [
    "Videos exclusivos detrás de cámaras",
    "Notificaciones al instante de nuevos goles",
    "Q&A en vivo solo para suscriptores",
    "Sorteos y merch exclusivo (próximamente)",
    "Forma parte del equipo kevsfc",
];

export default async function Page() {
    const channelUrl = "https://www.youtube.com/channel/UCUIjrgbNZn8rmUeAEguB_kQ";
    const latestVideoId = "DqlYk830Yf4";
    const channelId = "UCUIjrgbNZn8rmUeAEguB_kQ";
    const apiKey = process.env.YOUTUBE_API_KEY;
    // Contador de suscriptores (ya existente)
    let subscriberCount = 'N/A';
    if (apiKey) {
        try {
            const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;
            const response = await fetch(url, { cache: 'no-store' });
            if (response.ok) {
                const data = await response.json();
                subscriberCount = data.items?.[0]?.statistics?.subscriberCount ?? 'N/A';
            }
        } catch (error) {
            console.error('Error fetching subscriber count:', error);
        }
    }

    // NUEVO: Obtener el Short más visto
    let mostViewedShort = null;
    if (apiKey) {
        try {
            // Paso 1: Obtener playlist de uploads
            const uploadsUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
            const uploadsRes = await fetch(uploadsUrl);
            if (uploadsRes.ok) {
                const uploadsData = await uploadsRes.json();
                const uploadsPlaylistId = uploadsData.items[0]?.contentDetails?.relatedPlaylists?.uploads;

                if (uploadsPlaylistId) {
                    // Paso 2: Listar items de la playlist, ordenados por viewCount
                    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&order=viewCount&key=${apiKey}`;
                    const playlistRes = await fetch(playlistUrl);
                    if (playlistRes.ok) {
                        const playlistData = await playlistRes.json();
                        const videoIds = playlistData.items.map(item => item.snippet.resourceId.videoId);

                        if (videoIds.length > 0) {
                            // Paso 3: Obtener detalles (duración y vistas) para filtrar Shorts
                            const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds.join(',')}&key=${apiKey}`;
                            const detailsRes = await fetch(detailsUrl);
                            if (detailsRes.ok) {
                                const detailsData = await detailsRes.json();
                                let candidates = detailsData.items
                                    .filter(video => {
                                        const duration = video.contentDetails.duration; // e.g., "PT0M45S"
                                        const seconds = parseDurationToSeconds(duration);
                                        const views = parseInt(video.statistics.viewCount) || 0;
                                        return seconds <= 60 && seconds > 0 && views > 0; // Es Short y tiene vistas
                                    })
                                    .sort((a, b) => (parseInt(b.statistics.viewCount) || 0) - (parseInt(a.statistics.viewCount) || 0));

                                if (candidates.length > 0) {
                                    const topShort = candidates[0];
                                    const snippetRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${topShort.id}&key=${apiKey}`);
                                    if (snippetRes.ok) {
                                        const snippetData = await snippetRes.json();
                                        const snippet = snippetData.items[0]?.snippet;
                                        mostViewedShort = {
                                            id: topShort.id,
                                            title: snippet?.title || 'Short sin título',
                                            views: topShort.statistics.viewCount || '0',
                                            thumbnail: snippet?.thumbnails?.medium?.url || '',
                                            duration: parseDurationToSeconds(topShort.contentDetails.duration),
                                        };
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching most viewed short:', error);
        }
    }

// Función segura para convertir duración ISO 8601 → segundos
    function parseDurationToSeconds(duration) {
        if (!duration || typeof duration !== 'string') return 999; // fallback: asumir que no es short

        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return 999; // formato raro → no es short

        const hours = parseInt(match[1] || 0);
        const minutes = parseInt(match[2] || 0);
        const seconds = parseInt(match[3] || 0);

        return hours * 3600 + minutes * 60 + seconds;
    }

    return (
        <main className="relative min-h-screen bg-neutral-950 text-neutral-100 overflow-hidden">
            {/* Rails laterales tipo estadio */}
            <SideRails />

            {/* Dock redes */}
            <SocialDock socials={SOCIALS} />

            {/* HERO – Invitación potente a suscribirse */}
            <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-16 text-center">
                <PitchPattern />

                <div className="relative z-10">
                    <div className="mx-auto w-32 h-32 mb-8 relative ring-4 ring-red-600 rounded-full overflow-hidden shadow-2xl">
                        <Image
                            src="/profile.png"
                            alt="kevsfc"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4" style={{ color: RED }}>
                        kevsfc.club
                    </h1>

                    <p className="text-2xl md:text-3xl font-bold text-neutral-200 mb-4">
                        ¡Únete al equipo que juega bonito!
                    </p>

                    <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-6">
                        Suscríbete gratis y entra a la comunidad más creativa del fútbol en YouTube
                    </p>

                    <p className="text-4xl font-bold mb-8" style={{ color: RED }}>
                        {subscriberCount} Suscriptores
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                        <a
                            href={`${channelUrl}?sub_confirmation=1`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-10 py-5 text-xl font-bold text-white rounded-2xl shadow-2xl transform transition hover:scale-105 active:scale-95"
                            style={{
                                background: RED,
                                boxShadow: "0 0 40px rgba(225, 29, 72, 0.6)",
                            }}
                        >
                            SUSCRÍBETE GRATIS
                        </a>

                        <a
                            href={`https://youtu.be/${latestVideoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-5 text-lg font-semibold rounded-2xl border-2 border-red-600 bg-red-600/10 backdrop-blur transition hover:bg-red-600/20"
                        >
                            Ver último video
                        </a>
                    </div>
                </div>

                <SoccerAnim />
            </section>

            {/* Último video */}
            <section className="mx-auto max-w-5xl px-6 pb-16">
                <h2 className="text-3xl font-bold text-center mb-8" style={{ color: RED }}>
                    Último video del canal
                </h2>
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-neutral-800">
                    <div className="aspect-video">
                        <iframe
                            src={`https://www.youtube.com/embed/${latestVideoId}?rel=0`}
                            title="Último video de kevsfc"
                            allowFullScreen
                            className="w-full h-full"
                            loading="lazy"
                        />
                    </div>
                </div>
            </section>

            {/* NUEVA SECCIÓN: Short Más Visto – Formato vertical perfecto */}
            <section className="mx-auto max-w-5xl px-6 pb-16">
                <h2 className="text-3xl font-bold text-center mb-8" style={{ color: RED }}>
                    Short Más Visto
                </h2>

                {mostViewedShort ? (
                    <div className="flex justify-center">
                        {/* Contenedor centrado que fuerza 9:16 */}
                        <div className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl border border-neutral-800">
                            {/* Ratio exacto 9:16 */}
                            <div className="aspect-[9/16] relative">
                                <iframe
                                    src={`https://www.youtube.com/embed/${mostViewedShort.id}?rel=0&modestbranding=1`}
                                    title={mostViewedShort.title}
                                    allowFullScreen
                                    className="absolute inset-0 w-full h-full"
                                    loading="lazy"
                                />
                            </div>

                            {/* Info debajo del video (como en móvil, bonito en desktop) */}
                            <div className="bg-neutral-900/80 backdrop-blur p-4 border-t border-neutral-800">
                                <p className="font-semibold line-clamp-2 text-sm leading-tight">
                                    {mostViewedShort.title}
                                </p>
                                <p className="text-xs text-neutral-400 mt-1">
                                    {mostViewedShort.views} vistas
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-neutral-500">
                        <p>Cargando el golazo más visto del canal...</p>
                    </div>
                )}
            </section>

            {/* Beneficios – tarjetas con hover brutal */}
            <section className="mx-auto max-w-6xl px-6 pb-20">
                <h2 className="text-3xl font-bold text-center mb-12" style={{ color: RED }}>
                    ¿Por qué suscribirte?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {benefits.map((text, i) => (
                        <div
                            key={i}
                            className="group relative p-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur transition-all duration-500 hover:border-red-600 hover:bg-red-600/10 hover:scale-105 hover:shadow-2xl hover:shadow-red-600/20"
                        >
                            <div className="text-4xl mb-4">Goal {i + 1}</div>
                            <p className="text-lg font-medium">{text}</p>
                            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                                 style={{
                                     background: "radial-gradient(circle at 30% 30%, rgba(225,29,72,.15), transparent 70%)",
                                 }}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* Redes sociales grandes y bonitas */}
            <section className="mx-auto max-w-5xl px-6 pb-20 text-center">
                <h2 className="text-3xl font-bold mb-10" style={{ color: RED }}>
                    Sígueme en todas partes
                </h2>
                <div className="flex justify-center gap-8 flex-wrap">
                    {SOCIALS.map((s) => {
                        const Icon = s.icon;
                        return (
                            <Link
                                key={s.label}
                                href={s.href}
                                target="_blank"
                                className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-neutral-800 bg-neutral-900/30 backdrop-blur transition hover:border-red-600 hover:bg-red-600/10 hover:scale-110"
                            >
                                <Icon size={48} color={RED} />
                                <span className="font-semibold text-lg">{s.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </section>

            <footer className="text-center text-neutral-500 pb-10 text-sm">
                © {new Date().getFullYear()} kevsfc — Jugamos bonito, creamos mejor
            </footer>
        </main>
    );
}

/* ====== Componentes reutilizables (sin cambios) ====== */
function SideRails() {
    return (
        <>
            <div className="hidden lg:block fixed inset-y-0 left-0 w-32 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent blur-3xl" />
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)",
                }} />
            </div>
            <div className="hidden lg:block fixed inset-y-0 right-0 w-32 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-l from-red-600/10 to-transparent blur-3xl" />
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)",
                }} />
            </div>
        </>
    );
}

function SocialDock({ socials }) {
    return (
        <>
            {/* Desktop – dock lateral */}
            <aside className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 z-50 flex-col gap-4">
                {socials.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <Link
                            key={i}
                            href={s.href}
                            target="_blank"
                            className="group relative p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur transition-all hover:border-red-600 hover:bg-red-600/20"
                        >
                            <Icon size={28} color="white" />
                            <span className="absolute -left-28 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none bg-black/90 text-white text-sm px-3 py-1 rounded-lg whitespace-nowrap transition">
                {s.label}
              </span>
                        </Link>
                    );
                })}
            </aside>

            {/* Mobile – barra superior */}
            <div className="lg:hidden sticky top-0 z-50 bg-neutral-950/90 backdrop-blur border-b border-neutral-800">
                <div className="flex justify-center gap-6 py-3">
                    {socials.map((s) => {
                        const Icon = s.icon;
                        return (
                            <Link key={s.label} href={s.href} target="_blank" className="p-3 rounded-xl bg-red-600/10">
                                <Icon size={24} color={RED} />
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

function PitchPattern() {
    return (
        <div className="pointer-events-none absolute inset-0 opacity-10" style={{
            backgroundImage: `
        radial-gradient(circle at center, white 1px, transparent 1px),
        linear-gradient(90deg, transparent 71px, rgba(255,255,255,.03) 71px, rgba(255,255,255,.03) 73px, transparent 73px),
        linear-gradient(0deg, transparent 71px, rgba(255,255,255,.03) 71px, rgba(255,255,255,.03) 73px, transparent 73px)
      `,
            backgroundSize: "100px 100px, 72px 72px, 72px 72px",
        }} />
    );
}

function SoccerAnim() {
    return (
        <div className="absolute inset-x-0 -bottom-20 h-64 pointer-events-none overflow-hidden">
            <svg viewBox="0 0 1200 200" className="w-full h-full">
                <path
                    id="ballPath"
                    d="M 100 180 Q 600 20, 1100 180"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="3"
                    strokeDasharray="10 15"
                />
                <g>
                    <circle r="16" fill="white" stroke={RED} strokeWidth="4">
                        <animateMotion dur="5s" repeatCount="indefinite" path="M 100 180 Q 600 20, 1100 180" />
                    </circle>
                </g>
            </svg>
        </div>
    );
}

/* Íconos (sin cambios) */
function YouTubeIcon({ size = 24, color = "currentColor" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.6 9.4.6 9.4.6s7.6 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.8 15.3V8.7L15.8 12l-6 3.3z"/>
        </svg>
    );
}

function XIcon({ size = 24, color = "currentColor" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <path d="M18.1 2H21l-6.5 7.4L22 22h-6.9l-4.5-5.9L5.2 22H3l7.1-8.1L2 2h7l4 5.3L18.1 2zM16.9 20h1.9L9.2 4H7.2l9.7 16z"/>
        </svg>
    );
}

function InstagramIcon({ size = 24, color = "currentColor" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zM18 6.8a1.2 1.2 0 1 1-1.2 1.2A1.2 1.2 0 0 1 18 6.8z"/>
        </svg>
    );
}