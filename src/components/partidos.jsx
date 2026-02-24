"use client";
import { useState, useEffect, useCallback } from "react";
import styles from "./partidos.module.css";

// ─────────────────────────────────────────────
// CONFIGURACIÓN
// Obtén tu API key gratis en: https://rapidapi.com/api-sports/api/api-football
// Luego agrégala en .env.local como: NEXT_PUBLIC_APIFOOTBALL_KEY=tu_key_aqui
// El Mundial 2026 tiene league_id=1 en API-Football (se autodetecta abajo)
// ─────────────────────────────────────────────
const API_KEY = process.env.NEXT_PUBLIC_APIFOOTBALL_KEY || "";
const WC_LEAGUE_ID = 1;   // FIFA World Cup en API-Football
const WC_SEASON   = 2026;
const POLL_MS     = 30000; // refresco cada 30s cuando hay partidos en vivo

// Traducciones de estado
const STATUS_LABELS = {
    NS:   { label: "Por jugar",    color: "upcoming" },
    TBD:  { label: "Por definir",  color: "upcoming" },
    "1H": { label: "1ª Parte",     color: "live"     },
    HT:   { label: "Descanso",     color: "live"     },
    "2H": { label: "2ª Parte",     color: "live"     },
    ET:   { label: "Prórroga",     color: "live"     },
    BT:   { label: "Penales",      color: "live"     },
    P:    { label: "Penales",      color: "live"     },
    SUSP: { label: "Suspendido",   color: "suspended"},
    INT:  { label: "Interrumpido", color: "suspended"},
    FT:   { label: "Finalizado",   color: "finished" },
    AET:  { label: "Prórroga FT",  color: "finished" },
    PEN:  { label: "Penales FT",   color: "finished" },
    PST:  { label: "Aplazado",     color: "suspended"},
    CANC: { label: "Cancelado",    color: "suspended"},
    ABD:  { label: "Abandonado",   color: "suspended"},
    AWD:  { label: "W.O.",         color: "finished" },
    WO:   { label: "W.O.",         color: "finished" },
    LIVE: { label: "En vivo",      color: "live"     },
};

const LIVE_STATUSES = ["1H","HT","2H","ET","BT","P","LIVE"];

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-CO", {
        weekday: "short", day: "numeric", month: "short",
    });
}

function formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

function groupByDate(fixtures) {
    return fixtures.reduce((acc, f) => {
        const key = f.fixture.date.split("T")[0];
        if (!acc[key]) acc[key] = [];
        acc[key].push(f);
        return acc;
    }, {});
}

// ── Tarjeta de un partido ──
function MatchCard({ match }) {
    const { fixture, teams, goals, score, league } = match;
    const st = STATUS_LABELS[fixture.status.short] || { label: fixture.status.short, color: "upcoming" };
    const isLive = LIVE_STATUSES.includes(fixture.status.short);
    const isDone = ["FT","AET","PEN","AWD","WO"].includes(fixture.status.short);

    return (
        <div className={`${styles.card} ${styles[st.color]}`}>
            {/* Status badge */}
            <div className={styles.statusRow}>
                {isLive && <span className={styles.liveDot} />}
                <span className={`${styles.statusBadge} ${styles[st.color + "Badge"]}`}>
          {isLive && fixture.status.elapsed ? `${fixture.status.elapsed}'` : st.label}
        </span>
                {fixture.venue?.name && (
                    <span className={styles.venue}>📍 {fixture.venue.name}</span>
                )}
            </div>

            {/* Equipos y marcador */}
            <div className={styles.matchRow}>
                {/* Local */}
                <div className={styles.team}>
                    {teams.home.logo && (
                        <img src={teams.home.logo} alt={teams.home.name} className={styles.teamLogo} />
                    )}
                    <span className={`${styles.teamName} ${isDone && goals.home > goals.away ? styles.winner : ""}`}>
            {teams.home.name}
          </span>
                </div>

                {/* Marcador / Hora */}
                <div className={styles.score}>
                    {(isLive || isDone) ? (
                        <>
                            <span className={styles.scoreNum}>{goals.home ?? 0}</span>
                            <span className={styles.scoreSep}>—</span>
                            <span className={styles.scoreNum}>{goals.away ?? 0}</span>
                            {score?.penalty?.home !== null && score?.penalty?.home !== undefined && (
                                <div className={styles.penScore}>
                                    ({score.penalty.home} — {score.penalty.away}) pen
                                </div>
                            )}
                        </>
                    ) : (
                        <span className={styles.kickoff}>
              <span className={styles.kickoffDate}>{formatDate(fixture.date)}</span>
              <span className={styles.kickoffTime}>{formatTime(fixture.date)}</span>
            </span>
                    )}
                </div>

                {/* Visitante */}
                <div className={`${styles.team} ${styles.teamAway}`}>
          <span className={`${styles.teamName} ${isDone && goals.away > goals.home ? styles.winner : ""}`}>
            {teams.away.name}
          </span>
                    {teams.away.logo && (
                        <img src={teams.away.logo} alt={teams.away.name} className={styles.teamLogo} />
                    )}
                </div>
            </div>

            {/* Ronda/fase */}
            {league?.round && (
                <div className={styles.round}>{league.round}</div>
            )}
        </div>
    );
}

// ── Esqueleto de carga ──
function Skeleton() {
    return (
        <div className={styles.skeletonWrap}>
            {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.skeleton} style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
        </div>
    );
}

// ── Componente principal ──
export default function Partidos() {
    const [fixtures, setFixtures] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [filter, setFilter]     = useState("proximos"); // proximos | en_vivo | resultados
    const [lastUpdate, setLastUpdate] = useState(null);
    const [noKey, setNoKey]       = useState(false);

    const fetchFixtures = useCallback(async () => {
        if (!API_KEY) {
            setNoKey(true);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(
                `https://v3.football.api-sports.io/fixtures?league=${WC_LEAGUE_ID}&season=${WC_SEASON}`,
                {
                    headers: {
                        "x-rapidapi-key": API_KEY,
                        "x-rapidapi-host": "v3.football.api-sports.io",
                    },
                }
            );

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            if (data.errors && Object.keys(data.errors).length > 0) {
                throw new Error(Object.values(data.errors)[0]);
            }

            setFixtures(data.response || []);
            setLastUpdate(new Date());
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Carga inicial
    useEffect(() => { fetchFixtures(); }, [fetchFixtures]);

    // Polling: cada 30s cuando hay partidos en vivo
    useEffect(() => {
        const hasLive = fixtures.some(f => LIVE_STATUSES.includes(f.fixture.status.short));
        if (!hasLive) return;
        const interval = setInterval(fetchFixtures, POLL_MS);
        return () => clearInterval(interval);
    }, [fixtures, fetchFixtures]);

    // Filtrar partidos
    const filtered = fixtures.filter(f => {
        const st = f.fixture.status.short;
        if (filter === "en_vivo")   return LIVE_STATUSES.includes(st);
        if (filter === "resultados") return ["FT","AET","PEN","AWD","WO"].includes(st);
        // proximos: los siguientes 10 días
        const match_date = new Date(f.fixture.date);
        const now = new Date();
        const in10 = new Date(); in10.setDate(now.getDate() + 10);
        return st === "NS" && match_date >= now && match_date <= in10;
    }).sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date));

    const liveCount = fixtures.filter(f => LIVE_STATUSES.includes(f.fixture.status.short)).length;
    const grouped   = groupByDate(filtered);

    // ── Render de estado vacío sin API key ──
    if (noKey) {
        return (
            <section className={styles.section} id="partidos">
                <div className={styles.header}>
                    <p className={styles.sectionLabel}>FIFA World Cup 2026™</p>
                    <h2 className={styles.sectionTitle}>Partidos</h2>
                </div>
                <div className={styles.noKey}>
                    <div className={styles.noKeyIcon}>🔑</div>
                    <p className={styles.noKeyTitle}>Configura tu API key</p>
                    <p className={styles.noKeyDesc}>
                        Para ver partidos en vivo y fixtures del Mundial 2026, necesitas una API key gratuita de{" "}
                        <a href="https://rapidapi.com/api-sports/api/api-football" target="_blank" rel="noopener noreferrer">
                            API-Football en RapidAPI
                        </a>
                        .
                    </p>
                    <div className={styles.noKeySteps}>
                        <p>1. Regístrate gratis en RapidAPI</p>
                        <p>2. Suscríbete al plan FREE de API-Football (100 req/día)</p>
                        <p>3. Copia tu API key</p>
                        <p>4. Agrégala en <code>.env.local</code>:</p>
                        <pre>NEXT_PUBLIC_APIFOOTBALL_KEY=tu_key_aqui</pre>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.section} id="partidos">
            {/* Header */}
            <div className={styles.header}>
                <p className={styles.sectionLabel}>FIFA World Cup 2026™</p>
                <h2 className={styles.sectionTitle}>
                    Partidos
                    {liveCount > 0 && (
                        <span className={styles.liveCount}>
              <span className={styles.liveDotBig} />
                            {liveCount} en vivo
            </span>
                    )}
                </h2>
                {lastUpdate && (
                    <p className={styles.lastUpdate}>
                        Actualizado: {lastUpdate.toLocaleTimeString("es-CO")}
                    </p>
                )}
            </div>

            {/* Filtros */}
            <div className={styles.filters}>
                {[
                    { key: "proximos",   label: "Próximos" },
                    { key: "en_vivo",    label: `En Vivo ${liveCount > 0 ? `(${liveCount})` : ""}` },
                    { key: "resultados", label: "Resultados" },
                ].map(f => (
                    <button
                        key={f.key}
                        className={`${styles.filterBtn} ${filter === f.key ? styles.active : ""} ${f.key === "en_vivo" && liveCount > 0 ? styles.filterLive : ""}`}
                        onClick={() => setFilter(f.key)}
                    >
                        {f.key === "en_vivo" && liveCount > 0 && <span className={styles.liveDotSmall} />}
                        {f.label}
                    </button>
                ))}
                <button className={styles.refreshBtn} onClick={fetchFixtures} title="Actualizar">
                    ↻
                </button>
            </div>

            {/* Contenido */}
            {loading ? (
                <Skeleton />
            ) : error ? (
                <div className={styles.errorBox}>
                    <p>⚠️ {error}</p>
                    <button onClick={fetchFixtures} className={styles.retryBtn}>Reintentar</button>
                </div>
            ) : Object.keys(grouped).length === 0 ? (
                <div className={styles.empty}>
                    {filter === "en_vivo"
                        ? "No hay partidos en vivo en este momento."
                        : filter === "resultados"
                            ? "Aún no hay resultados disponibles."
                            : "No hay próximos partidos en los próximos 10 días."}
                </div>
            ) : (
                <div className={styles.list}>
                    {Object.entries(grouped).map(([dateKey, matches]) => (
                        <div key={dateKey} className={styles.dateGroup}>
                            <div className={styles.dateHeader}>
                                {formatDate(dateKey + "T12:00:00")}
                            </div>
                            {matches.map(m => (
                                <MatchCard key={m.fixture.id} match={m} />
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}