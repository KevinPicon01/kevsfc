// app/page.jsx
import Image from "next/image";
import Link from "next/link";
import { getLatestVideoIdFromChannel } from "./lib/youtube";

const RED = "#e11d48"; // red-600
const CHANNEL_ID = "UCUIjrgbNZn8rmUeAEguB_kQ";

const SOCIALS = [
    { label: "YouTube", href: "https://www.youtube.com/channel/UCUIjrgbNZn8rmUeAEguB_kQ", icon: YouTubeIcon },
    { label: "X (Twitter)", href: "https://x.com/kevs_fc", icon: XIcon },
    { label: "Instagram", href: "https://www.instagram.com/kevs.fc/", icon: InstagramIcon },
];

export default async function Page() {
    const latest = await getLatestVideoIdFromChannel(CHANNEL_ID);
    const embedSrc = latest ? `https://www.youtube.com/embed/${latest}?rel=0` : "";

    return (
        <main className="relative min-h-screen bg-neutral-950 text-neutral-100 overflow-hidden">
            {/* Rails laterales (desktop) */}
            <SideRails />

            {/* Dock de redes (sticky en desktop, centrado en mobile) */}
            <SocialDock socials={SOCIALS} />

            {/* HERO */}
            <section className="relative mx-auto max-w-6xl px-4 pt-16 pb-10">
                <PitchPattern />

                <div className="relative flex flex-col items-center text-center gap-6">
                    <div className="h-20 w-20 relative rounded-full ring-2" style={{ ringColor: RED }}>
                        <Image src="/profile.png" alt="kevsfc" fill sizes="80px" className="object-cover rounded-full" />
                    </div>

                    <h1
                        className="text-4xl sm:text-5xl font-extrabold tracking-tight"
                        style={{ color: RED, textShadow: "0 0 12px rgba(225,29,72,.35)" }}
                    >
                        kevsfc.club
                    </h1>

                    <p className="text-lg sm:text-xl text-neutral-300 font-medium">
                        Jugamos bonito, <span className="font-semibold" style={{ color: RED }}>creamos mejor.</span>
                    </p>

                    {latest && (
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <a
                                href={`https://youtu.be/${latest}`}
                                target="_blank"
                                className="inline-flex items-center rounded-lg border px-5 py-2.5 transition"
                                style={{ borderColor: RED, backgroundColor: "rgba(225,29,72,.08)" }}
                            >
                                Ver último video
                            </a>
                            <a
                                href="#now"
                                className="inline-flex items-center rounded-lg border border-neutral-700 px-5 py-2.5 hover:bg-neutral-800 transition"
                            >
                                Reproducir aquí
                            </a>
                        </div>
                    )}
                </div>

                <SoccerAnim />
            </section>

            {/* Video */}
            <section id="now" className="mx-auto max-w-5xl px-4 pb-10">
                <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900/40">
                    <div className="aspect-video">
                        {embedSrc ? (
                            <iframe
                                className="h-full w-full"
                                src={embedSrc}
                                title="Último video de kevsfc"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                loading="lazy"
                            />
                        ) : (
                            <div className="h-full w-full grid place-items-center text-neutral-400 text-sm">
                                No se pudo cargar el último video.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Redes (sección extra para móvil, visible debajo del video) */}
            <section className="mx-auto max-w-5xl px-4 pb-20 lg:hidden">
                <h2 className="text-lg font-semibold mb-4" style={{ color: RED }}>Conéctate conmigo</h2>
                <div className="flex flex-wrap gap-4">
                    {SOCIALS.map((s) => {
                        const Icon = s.icon;
                        return (
                            <Link
                                key={s.href}
                                href={s.href}
                                target="_blank"
                                className="flex items-center gap-2 rounded-xl border px-3 py-2 transition"
                                style={{ borderColor: "rgba(255,255,255,.15)" }}
                            >
                                <Icon size={22} color="currentColor" />
                                <span className="text-sm">{s.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </section>

            <footer className="mx-auto max-w-5xl px-4 pb-10 text-xs text-neutral-500">
                © {new Date().getFullYear()} kevsfc — hecho en vivo.
            </footer>
        </main>
    );
}

/* ====== Laterales tipo estadio (solo desktop) ====== */
function SideRails() {
    return (
        <>
            <div className="pointer-events-none hidden lg:block fixed left-0 top-0 h-full w-20">
                {/* Glow rojo */}
                <div className="absolute inset-0 blur-2xl" style={{ background: "radial-gradient(60% 40% at 80% 50%, rgba(225,29,72,.22), transparent 60%)" }} />
                {/* “malla” diagonal */}
                <div
                    className="absolute inset-0 opacity-25"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(45deg, rgba(255,255,255,.08) 0 2px, transparent 2px 10px)",
                    }}
                />
            </div>

            <div className="pointer-events-none hidden lg:block fixed right-0 top-0 h-full w-20">
                <div className="absolute inset-0 blur-2xl" style={{ background: "radial-gradient(60% 40% at 20% 50%, rgba(225,29,72,.22), transparent 60%)" }} />
                <div
                    className="absolute inset-0 opacity-25"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(-45deg, rgba(255,255,255,.08) 0 2px, transparent 2px 10px)",
                    }}
                />
            </div>
        </>
    );
}

/* ====== Dock de redes (protagónico) ====== */
function SocialDock({ socials }) {
    return (
        <>
            {/* Desktop: dock fijo lateral derecho, centrado vertical */}
            <aside className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-3">
                {socials.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <Link
                            key={i}
                            href={s.href}
                            target="_blank"
                            aria-label={s.label}
                            className="group relative grid place-items-center h-12 w-12 rounded-2xl border transition"
                            style={{
                                borderColor: "rgba(255,255,255,.15)",
                                background: "rgba(255,255,255,.03)",
                            }}
                        >
                            <Icon size={22} color="currentColor" />
                            {/* aura roja */}
                            <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-md transition"
                                  style={{ backgroundColor: "rgba(225,29,72,.25)" }} />
                            {/* tooltip */}
                            <span
                                className="pointer-events-none absolute right-full mr-3 rounded-md px-2 py-1 text-xs bg-neutral-900/90 border border-neutral-700 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition"
                            >
                {s.label}
              </span>
                        </Link>
                    );
                })}
                {/* Línea roja decorativa */}
                <div className="w-px h-10 mt-1" style={{ background: RED }} />
            </aside>

            {/* Mobile: barra centrada arriba del Hero */}
            <div className="lg:hidden sticky top-0 z-20 mx-auto w-full bg-neutral-950/80 backdrop-blur border-b border-neutral-900">
                <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-center gap-4">
                    {socials.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <Link
                                key={i}
                                href={s.href}
                                target="_blank"
                                aria-label={s.label}
                                className="grid place-items-center h-11 w-11 rounded-xl border transition active:scale-95"
                                style={{
                                    borderColor: "rgba(255,255,255,.15)",
                                    background: "rgba(225,29,72,.08)",
                                }}
                            >
                                <Icon size={20} color="currentColor" />
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

/* ====== Fondo “cancha” suave ====== */
function PitchPattern() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
                backgroundImage:
                    "radial-gradient(circle at 50% 50%, rgba(255,255,255,.05) 0 2px, transparent 3px), linear-gradient(to right, rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.04) 1px, transparent 1px)",
                backgroundSize: "14px 14px, 72px 72px, 72px 72px",
            }}
        />
    );
}

/* ====== Animación del balón ====== */
function SoccerAnim() {
    return (
        <div className="relative mx-auto mt-10 h-40 max-w-5xl">
            <svg viewBox="0 0 800 180" className="absolute inset-0 w-full h-full">
                <path
                    id="path"
                    d="M 40 150 C 220 10, 580 10, 760 150"
                    fill="none"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="2"
                    strokeDasharray="8 10"
                />
                <g>
                    <circle r="12" fill="#ffffff" stroke={RED} strokeWidth="2">
                        <animateMotion dur="4s" repeatCount="indefinite">
                            <mpath xlinkHref="#path" />
                        </animateMotion>
                    </circle>
                    <polygon points="0,-5 4,-1 2,5 -2,5 -4,-1" fill={RED} opacity="0.85">
                        <animateMotion dur="4s" repeatCount="indefinite" rotate="auto">
                            <mpath xlinkHref="#path" />
                        </animateMotion>
                    </polygon>
                </g>
            </svg>
        </div>
    );
}

/* ====== Íconos SVG livianos ====== */
function YouTubeIcon({ size = 24, color = "currentColor" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
            <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.6 9.4.6 9.4.6s7.6 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.8 15.3V8.7L15.8 12l-6 3.3z" />
        </svg>
    );
}
function XIcon({ size = 24, color = "currentColor" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
            <path d="M18.1 2H21l-6.5 7.4L22 22h-6.9l-4.5-5.9L5.2 22H3l7.1-8.1L2 2h7l4 5.3L18.1 2zM16.9 20h1.9L9.2 4H7.2l9.7 16z"/>
        </svg>
    );
}
function InstagramIcon({ size = 24, color = "currentColor" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
            <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zM18 6.8a1.2 1.2 0 1 1-1.2 1.2A1.2 1.2 0 0 1 18 6.8z"/>
        </svg>
    );
}
