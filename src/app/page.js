import Image from "next/image";
import styles from "./page.module.css";
import Patrocinadores from "../components/patrocinadores";
import Equipos from "../components/Equipos";
import Ticker from "../components/Ticker";
import SocialBar from "../components/SocialBar";

export const metadata = {
    title: "KevsFc — Fútbol para todos | Mundial 2026",
    description:
        "La comunidad más creativa del fútbol en YouTube. Únete al equipo que juega bonito.",
};

const channelUrl = "https://www.youtube.com/channel/UCUIjrgbNZn8rmUeAEguB_kQ";
const channelId = "UCUIjrgbNZn8rmUeAEguB_kQ";
const apiKey = process.env.YOUTUBE_API_KEY;

let latestVideoId = "";
let latestVideoUrl = "";

// Channel card data
let channelThumbnail = "/profile.png"; // fallback local
let channelTitle = "KevsFC2";
let subscriberCount = "N/A";

// Función segura para convertir duración ISO 8601 → segundos
function parseDurationToSeconds(duration) {
    if (!duration || typeof duration !== "string") return 999;

    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 999;

    const hours = parseInt(match[1] || 0, 10);
    const minutes = parseInt(match[2] || 0, 10);
    const seconds = parseInt(match[3] || 0, 10);

    return hours * 3600 + minutes * 60 + seconds;
}

// 1) Datos del canal (título, avatar, subs)
if (apiKey) {
    try {
        const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${apiKey}`;
        const response = await fetch(url, { cache: "no-store" });

        if (response.ok) {
            const data = await response.json();
            const ch = data.items?.[0];

            channelTitle = ch?.snippet?.title || channelTitle;

            channelThumbnail =
                ch?.snippet?.thumbnails?.high?.url ||
                ch?.snippet?.thumbnails?.medium?.url ||
                ch?.snippet?.thumbnails?.default?.url ||
                channelThumbnail;

            subscriberCount = ch?.statistics?.subscriberCount
                ? Number(ch.statistics.subscriberCount).toLocaleString("es-CO")
                : subscriberCount;
        }
    } catch (e) {
        console.error("Error fetching channel data:", e);
    }
}

// 2) Short más visto + Último video largo (>200s) desde los últimos 20 uploads
let mostViewedShort = null;

if (apiKey) {
    try {
        // Paso 1: Obtener playlist de uploads
        const uploadsUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
        const uploadsRes = await fetch(uploadsUrl, { cache: "no-store" });

        if (uploadsRes.ok) {
            const uploadsData = await uploadsRes.json();
            const uploadsPlaylistId =
                uploadsData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

            if (uploadsPlaylistId) {
                // Paso 2: Listar últimos 20 uploads (más recientes primero)
                const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=20&key=${apiKey}`;
                const playlistRes = await fetch(playlistUrl, { cache: "no-store" });

                if (playlistRes.ok) {
                    const playlistData = await playlistRes.json();

                    const orderedVideoIds = (playlistData.items || [])
                        .map((item) => item?.contentDetails?.videoId)
                        .filter(Boolean);

                    if (orderedVideoIds.length > 0) {
                        // Paso 3: Traer detalles + snippet en una sola llamada
                        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${orderedVideoIds.join(
                            ","
                        )}&key=${apiKey}`;
                        const detailsRes = await fetch(detailsUrl, { cache: "no-store" });

                        if (detailsRes.ok) {
                            const detailsData = await detailsRes.json();

                            const byId = new Map(
                                (detailsData.items || []).map((v) => {
                                    const seconds = parseDurationToSeconds(
                                        v?.contentDetails?.duration
                                    );
                                    const views = parseInt(v?.statistics?.viewCount, 10) || 0;
                                    return [v.id, { video: v, seconds, views }];
                                })
                            );

                            // ✅ ÚLTIMO VIDEO LARGO (más reciente con duración > 200s)
                            const latestLongId = orderedVideoIds.find((id) => {
                                const meta = byId.get(id);
                                return meta && meta.seconds > 200;
                            });

                            if (latestLongId) {
                                latestVideoId = latestLongId;
                                latestVideoUrl = `https://youtu.be/${latestLongId}`;
                            }

                            // ✅ SHORT MÁS VISTO (de esos últimos 20)
                            const candidates = orderedVideoIds
                                .map((id) => byId.get(id))
                                .filter(Boolean)
                                .filter(({ seconds, views }) => seconds > 0 && seconds <= 60 && views > 0)
                                .sort((a, b) => b.views - a.views);

                            if (candidates.length > 0) {
                                const topShort = candidates[0].video;

                                mostViewedShort = {
                                    id: topShort.id,
                                    title: topShort.snippet?.title || "Short sin título",
                                    views: topShort.statistics?.viewCount || "0",
                                    thumbnail: topShort.snippet?.thumbnails?.medium?.url || "",
                                    duration: parseDurationToSeconds(topShort.contentDetails?.duration),
                                };
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error fetching most viewed short / latest long video:", error);
    }
}

export default function Home() {
    return (
        <main className={styles.main}>
            {/* ── TICKER ── */}
            <Ticker />
            <SocialBar />

            {/* ── HERO ── */}
            <section className={styles.hero}>
                <div className={styles.heroBg} />
                <div className={styles.heroGlowRed} />
                <div className={styles.heroGlowGold} />
                <div className={styles.heroGrid} />

                <div className={styles.badge}>
                    <span className={styles.badgeDot} />
                    Canal activo · Mundial 2026
                </div>

                <div className={styles.avatarWrap}>
                    <div className={styles.avatarRing}>
                        <div className={styles.avatarInner}>
                            <Image
                                src="/profile.png"
                                alt="KevsFc"
                                width={96}
                                height={96}
                                className={styles.avatarImg}
                                priority
                                unoptimized
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.logoWrap}>
                    <Image
                        src="/logo2.png"
                        alt="KEVS.FC"
                        width={480}
                        height={120}
                        className={styles.logoImg}
                        priority
                        unoptimized
                    />
                </div>

                <p className={styles.heroSub}>Fútbol para todos · Jugamos bonito, creamos mejor</p>

                <div className={styles.divider}>
                    <span className={styles.dividerLine} />
                    <span className={styles.dividerBall}>⚽</span>
                    <span className={styles.dividerLine} />
                </div>

                <div className={styles.sedesRow}>
          <span className={styles.sedeItem}>
            <span>🇺🇸</span> USA
          </span>
                    <span className={styles.sedeSep}>·</span>
                    <span className={styles.sedeItem}>
            <span>🇲🇽</span> México
          </span>
                    <span className={styles.sedeSep}>·</span>
                    <span className={styles.sedeItem}>
            <span>🇨🇦</span> Canadá
          </span>
                </div>

                <div className={styles.statPill}>
                    <strong>{subscriberCount}+</strong>&nbsp;suscriptores y creciendo
                </div>

                <div className={styles.ctas}>
                    <a
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        href="https://www.youtube.com/channel/UCUIjrgbNZn8rmUeAEguB_kQ?sub_confirmation=1"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        ▶ Suscríbete gratis
                    </a>

                    <a
                        className={`${styles.btn} ${styles.btnOutline}`}
                        href={latestVideoUrl || channelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Ver último video
                    </a>
                </div>
            </section>

            {/* ── WC BANNER ── */}
            <div className={styles.wcBanner}>
                <span className={styles.wcTitle}>🏆 FIFA World Cup 2026™</span>
                <span className={styles.wcSedes}>
          New York · Dallas · Los Angeles · Ciudad de México · Toronto · Vancouver + más
        </span>
            </div>

            {/* ── PATROCINADORES — primero al bajar ── */}
            <Patrocinadores />

            {/* ── CARRUSEL DE SELECCIONES ── */}
            <Equipos />

            {/* ── VIDEOS ── */}
            <section className={styles.section}>
                <p className={styles.sectionLabel}>Contenido reciente</p>
                <h2 className={styles.sectionTitle}>Últimos videos</h2>

                <div className={styles.videoStack}>
                    {/* ÚLTIMO VIDEO LARGO (16:9) */}
                    <div className={`${styles.videoCard} ${styles.embedCard} ${styles.featuredStack}`}>
                        <div className={styles.embedFrame}>
                            <iframe
                                src={`https://www.youtube.com/embed/${
                                    latestVideoId || "l75rJt0cXwk"
                                }?rel=0&modestbranding=1`}
                                title="Último video de KevsFC"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                loading="lazy"
                                className={styles.iframe}
                            />
                        </div>

                        <div className={styles.videoOverlay}>
                            <div className={styles.playBtn}>▶</div>
                            <div className={styles.videoLabel}>
                                Último video del canal
                                <span className={styles.videoViews}>▶ Ver ahora en YouTube</span>
                            </div>
                        </div>

                        <a
                            className={styles.cardLink}
                            href={latestVideoUrl || channelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Abrir último video en YouTube"
                        />
                    </div>

                    {/* SHORT MÁS VISTO (9:16 centrado) */}
                    {mostViewedShort ? (
                        <div className={`${styles.videoCard} ${styles.embedCard} ${styles.shortWrapCard}`}>
                            <div className={styles.shortCentered}>
                                <div className={styles.embedFrameVertical}>
                                    <iframe
                                        src={`https://www.youtube.com/embed/${mostViewedShort.id}?rel=0&modestbranding=1`}
                                        title={mostViewedShort.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        loading="lazy"
                                        className={styles.iframe}
                                    />
                                </div>
                            </div>

                            <div className={styles.shortInfo}>
                                <p className={styles.shortTitle}>{mostViewedShort.title}</p>
                                <p className={styles.shortMeta}>{mostViewedShort.views} vistas</p>
                            </div>

                            <a
                                className={styles.cardLink}
                                href={`https://youtu.be/${mostViewedShort.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Abrir short más visto en YouTube"
                            />
                        </div>
                    ) : (
                        <div className={`${styles.videoCard} ${styles.loadingCard}`}>
                            <div className={styles.loadingInner}>
                                <div className={styles.loadingSpinner} />
                                <p>Cargando el golazo más visto del canal...</p>
                            </div>
                        </div>
                    )}

                    {/* CHANNEL CARD */}
                    <a
                        href={channelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.videoCard} ${styles.channelCard}`}
                    >
                        <div className={styles.channelContent}>
                            <div className={styles.channelAvatarWrap}>
                                <img
                                    src={channelThumbnail || "/profile.png"}
                                    alt={channelTitle}
                                    className={styles.channelAvatar}
                                />
                            </div>

                            <div className={styles.channelInfo}>
                                <p className={styles.channelName}>{channelTitle}</p>
                                <p className={styles.channelMeta}>{subscriberCount} suscriptores</p>
                                <span className={styles.channelCTA}>Entrar al canal →</span>
                            </div>
                        </div>
                    </a>
                </div>
            </section>

            {/* ── WHY ── */}
            <section className={styles.section}>
                <div className={styles.goalsSection}>
                    <p className={styles.sectionLabel}>Por qué unirte</p>
                    <h2 className={styles.sectionTitle}>
                        El equipo que <span className={styles.red}>juega bonito</span>
                    </h2>

                    <div className={styles.goalsGrid}>
                        {[
                            { icon: "🎬", title: "Detrás de cámaras", desc: "Videos exclusivos que no verás en ningún otro lado." },
                            { icon: "🔔", title: "Al instante", desc: "Notificaciones inmediatas de nuevos videos y goles." },
                            { icon: "🎙️", title: "Q&A en vivo", desc: "Sesiones exclusivas para suscriptores." },
                            { icon: "🏆", title: "Sorteos y merch", desc: "Próximamente: merch exclusivo y sorteos del equipo." },
                            { icon: "⚽", title: "El equipo KevsFc", desc: "Sé parte de la comunidad más creativa del fútbol en YouTube." },
                        ].map((g) => (
                            <div key={g.title} className={styles.goalCard}>
                                <div className={styles.goalIcon}>{g.icon}</div>
                                <div className={styles.goalTitle}>{g.title}</div>
                                <div className={styles.goalDesc}>{g.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SOCIAL ── */}
            <section className={`${styles.section} ${styles.socialsSection}`}>
                <p className={styles.sectionLabel}>Redes sociales</p>
                <h2 className={styles.sectionTitle}>Sígueme en todas partes</h2>
                <div className={styles.socialLinks}>
                    <a className={styles.socialBtn} href={channelUrl} target="_blank" rel="noopener noreferrer">
                        ▶ YouTube
                    </a>
                    <a className={styles.socialBtn} href="https://x.com/kevs_fc" target="_blank" rel="noopener noreferrer">
                        𝕏 Twitter / X
                    </a>
                    <a className={styles.socialBtn} href="https://www.instagram.com/kevs.fc/" target="_blank" rel="noopener noreferrer">
                        ◉ Instagram
                    </a>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className={styles.footer}>
                <span className={styles.footerFlags}>🇺🇸 🏆 🇲🇽 🇨🇦</span>
                © 2026 KevsFc · Jugamos bonito, creamos mejor · Mundial 2026
            </footer>
        </main>
    );
}