"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./Equipos.module.css";

const API_KEY  = "3498325f77msh312831fcbf871c3p19b432jsn7b4b14f704ae";
const API_HOST = "world-cup-2026.p.rapidapi.com";

const CONFEDERATIONS = [
    { key: "UEFA",     label: "UEFA",     n: 16, color: "#3b82f6", region: "Europa" },
    { key: "CONMEBOL", label: "CONMEBOL", n: 6,  color: "#f59e0b", region: "Sudamérica" },
    { key: "CONCACAF", label: "CONCACAF", n: 6,  color: "#10b981", region: "N/C América" },
    { key: "CAF",      label: "CAF",      n: 9,  color: "#ef4444", region: "África" },
    { key: "AFC",      label: "AFC",      n: 8,  color: "#8b5cf6", region: "Asia" },
    { key: "OFC",      label: "OFC",      n: 1,  color: "#06b6d4", region: "Oceanía" },
];

// Mapa completo y correcto
const CONF_BY_ID = {
    // UEFA
    "164":"UEFA",  // Spain
    "448":"UEFA",  // England
    "478":"UEFA",  // France
    "481":"UEFA",  // Germany
    "482":"UEFA",  // Portugal
    "449":"UEFA",  // Netherlands
    "477":"UEFA",  // Croatia
    "459":"UEFA",  // Belgium
    "474":"UEFA",  // Austria
    "464":"UEFA",  // Norway
    "475":"UEFA",  // Switzerland
    "580":"UEFA",  // Scotland
    // CONMEBOL
    "202":"CONMEBOL", // Argentina
    "205":"CONMEBOL", // Brazil
    "208":"CONMEBOL", // Colombia
    "212":"CONMEBOL", // Uruguay
    "209":"CONMEBOL", // Ecuador
    "210":"CONMEBOL", // Paraguay
    // CONCACAF
    "203":"CONCACAF", // Mexico
    "206":"CONCACAF", // Canada
    "660":"CONCACAF", // USA
    "2659":"CONCACAF",// Panama
    "2654":"CONCACAF",// Haiti
    "11678":"CONCACAF",// Curacao
    // CAF (África)
    "624":"CAF",   // Algeria
    "2869":"CAF",  // Morocco
    "654":"CAF",   // Senegal
    "2620":"CAF",  // Egypt
    "4789":"CAF",  // Ivory Coast
    "4469":"CAF",  // Ghana
    "659":"CAF",   // Tunisia
    "467":"CAF",   // South Africa
    "2597":"CAF",  // Cape Verde
    // AFC (Asia)
    "627":"AFC",   // Japan
    "451":"AFC",   // South Korea
    "469":"AFC",   // IR Iran
    "655":"AFC",   // Saudi Arabia
    "4398":"AFC",  // Qatar
    "2917":"AFC",  // Jordan
    "2570":"AFC",  // Uzbekistan
    "628":"AFC",   // Australia (AFC since 2006)
    // OFC
    "2666":"OFC",  // New Zealand
};

const FALLBACK_TEAMS = [
    { id:"202",  name:"Argentina",    abbreviation:"ARG", logo:"https://a.espncdn.com/i/teamlogos/countries/500/arg.png",  color:"#74acdf" },
    { id:"164",  name:"Spain",        abbreviation:"ESP", logo:"https://a.espncdn.com/i/teamlogos/countries/500/esp.png",  color:"#c60b1e" },
    { id:"205",  name:"Brazil",       abbreviation:"BRA", logo:"https://a.espncdn.com/i/teamlogos/countries/500/bra.png",  color:"#009c3b" },
    { id:"478",  name:"France",       abbreviation:"FRA", logo:"https://a.espncdn.com/i/teamlogos/countries/500/fra.png",  color:"#0c2fff" },
    { id:"481",  name:"Germany",      abbreviation:"GER", logo:"https://a.espncdn.com/i/teamlogos/countries/500/ger.png",  color:"#888888" },
    { id:"448",  name:"England",      abbreviation:"ENG", logo:"https://a.espncdn.com/i/teamlogos/countries/500/eng.png",  color:"#cf142b" },
    { id:"482",  name:"Portugal",     abbreviation:"POR", logo:"https://a.espncdn.com/i/teamlogos/countries/500/por.png",  color:"#da291c" },
    { id:"449",  name:"Netherlands",  abbreviation:"NED", logo:"https://a.espncdn.com/i/teamlogos/countries/500/ned.png",  color:"#fb5d00" },
    { id:"208",  name:"Colombia",     abbreviation:"COL", logo:"https://a.espncdn.com/i/teamlogos/countries/500/col.png",  color:"#fbd632" },
    { id:"203",  name:"Mexico",       abbreviation:"MEX", logo:"https://a.espncdn.com/i/teamlogos/countries/500/mex.png",  color:"#006847" },
    { id:"206",  name:"Canada",       abbreviation:"CAN", logo:"https://a.espncdn.com/i/teamlogos/countries/500/can.png",  color:"#ed2224" },
    { id:"660",  name:"USA",          abbreviation:"USA", logo:"https://a.espncdn.com/i/teamlogos/countries/500/usa.png",  color:"#213065" },
    { id:"477",  name:"Croatia",      abbreviation:"CRO", logo:"https://a.espncdn.com/i/teamlogos/countries/500/cro.png",  color:"#ff0000" },
    { id:"459",  name:"Belgium",      abbreviation:"BEL", logo:"https://a.espncdn.com/i/teamlogos/countries/500/bel.png",  color:"#ef3340" },
    { id:"212",  name:"Uruguay",      abbreviation:"URU", logo:"https://a.espncdn.com/i/teamlogos/countries/500/uru.png",  color:"#003da5" },
    { id:"627",  name:"Japan",        abbreviation:"JPN", logo:"https://a.espncdn.com/i/teamlogos/countries/500/jpn.png",  color:"#ed1c24" },
    { id:"451",  name:"South Korea",  abbreviation:"KOR", logo:"https://a.espncdn.com/i/teamlogos/countries/500/kors.png", color:"#ce2028" },
    { id:"474",  name:"Austria",      abbreviation:"AUT", logo:"https://a.espncdn.com/i/teamlogos/countries/500/aut.png",  color:"#d72b2c" },
    { id:"464",  name:"Norway",       abbreviation:"NOR", logo:"https://a.espncdn.com/i/teamlogos/countries/500/nor.png",  color:"#ef2b2d" },
    { id:"2869", name:"Morocco",      abbreviation:"MAR", logo:"https://a.espncdn.com/i/teamlogos/countries/500/mar.png",  color:"#009060" },
    { id:"654",  name:"Senegal",      abbreviation:"SEN", logo:"https://a.espncdn.com/i/teamlogos/countries/500/sen.png",  color:"#00853f" },
    { id:"624",  name:"Algeria",      abbreviation:"ALG", logo:"https://a.espncdn.com/i/teamlogos/countries/500/alg.png",  color:"#5bbd19" },
    { id:"475",  name:"Switzerland",  abbreviation:"SUI", logo:"https://a.espncdn.com/i/teamlogos/countries/500/sui.png",  color:"#d72b2c" },
    { id:"209",  name:"Ecuador",      abbreviation:"ECU", logo:"https://a.espncdn.com/i/teamlogos/countries/500/ecu.png",  color:"#ffdd00" },
    { id:"210",  name:"Paraguay",     abbreviation:"PAR", logo:"https://a.espncdn.com/i/teamlogos/countries/500/par.png",  color:"#ea2300" },
    { id:"628",  name:"Australia",    abbreviation:"AUS", logo:"https://a.espncdn.com/i/teamlogos/countries/500/aus.png",  color:"#2a2d7c" },
    { id:"469",  name:"IR Iran",      abbreviation:"IRN", logo:"https://a.espncdn.com/i/teamlogos/countries/500/irn.png",  color:"#da0000" },
    { id:"655",  name:"Saudi Arabia", abbreviation:"KSA", logo:"https://a.espncdn.com/i/teamlogos/countries/500/ksa.png",  color:"#007a3d" },
    { id:"2620", name:"Egypt",        abbreviation:"EGY", logo:"https://a.espncdn.com/i/teamlogos/countries/500/egy.png",  color:"#D20300" },
    { id:"4789", name:"Ivory Coast",  abbreviation:"CIV", logo:"https://a.espncdn.com/i/teamlogos/countries/500/civ.png",  color:"#d48c00" },
    { id:"4469", name:"Ghana",        abbreviation:"GHA", logo:"https://a.espncdn.com/i/teamlogos/countries/500/gha.png",  color:"#ce2931" },
    { id:"659",  name:"Tunisia",      abbreviation:"TUN", logo:"https://a.espncdn.com/i/teamlogos/countries/500/tun.png",  color:"#D20300" },
    { id:"467",  name:"South Africa", abbreviation:"RSA", logo:"https://a.espncdn.com/i/teamlogos/countries/500/rsa.png",  color:"#087d5a" },
    { id:"4398", name:"Qatar",        abbreviation:"QAT", logo:"https://a.espncdn.com/i/teamlogos/countries/500/qat.png",  color:"#691a40" },
    { id:"2917", name:"Jordan",       abbreviation:"JOR", logo:"https://a.espncdn.com/i/teamlogos/countries/500/jor.png",  color:"#E70000" },
    { id:"2570", name:"Uzbekistan",   abbreviation:"UZB", logo:"https://a.espncdn.com/i/teamlogos/countries/500/uzb.png",  color:"#0081d6" },
    { id:"580",  name:"Scotland",     abbreviation:"SCO", logo:"https://a.espncdn.com/i/teamlogos/countries/500/sco.png",  color:"#1a2d69" },
    { id:"2659", name:"Panama",       abbreviation:"PAN", logo:"https://a.espncdn.com/i/teamlogos/countries/500/pan.png",  color:"#d21034" },
    { id:"2654", name:"Haiti",        abbreviation:"HAI", logo:"https://a.espncdn.com/i/teamlogos/countries/500/hai.png",  color:"#0033a0" },
    { id:"2666", name:"New Zealand",  abbreviation:"NZL", logo:"https://a.espncdn.com/i/teamlogos/countries/500/nzl.png",  color:"#273476" },
    { id:"11678",name:"Curacao",      abbreviation:"CUR", logo:"https://a.espncdn.com/i/teamlogos/soccer/500/11678.png",   color:"#0537e4" },
    { id:"2597", name:"Cape Verde",   abbreviation:"CPV", logo:"https://a.espncdn.com/i/teamlogos/countries/500/cpv.png",  color:"#003893" },
];

// ── Badge individual ──
function TeamBadge({ team, dimmed, filtered }) {
    const [hovered, setHovered] = useState(false);
    const [imgError, setImgError] = useState(false);
    const conf = CONFEDERATIONS.find(c => c.key === CONF_BY_ID[team.id]);

    return (
        <div
            className={`${styles.badge} ${dimmed ? styles.dimmed : ""} ${filtered ? styles.filtered : ""}`}
            style={{ "--team-color": team.color, "--conf-color": conf?.color || "var(--gold)" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className={styles.badgeGlow} />
            {/* Indicador de confederación en esquina */}
            {conf && (
                <div className={styles.confDotBadge} title={conf.key} />
            )}
            <div className={styles.logoWrap}>
                {!imgError ? (
                    <img
                        src={team.logo}
                        alt={team.name}
                        className={styles.logo}
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                ) : (
                    <span className={styles.abbr}>{team.abbreviation}</span>
                )}
            </div>
            <div className={`${styles.tooltip} ${hovered ? styles.tooltipVisible : ""}`}>
                <span className={styles.tooltipName}>{team.name}</span>
                <div className={styles.tooltipMeta}>
                    <span className={styles.tooltipAbbr}>{team.abbreviation}</span>
                    {conf && <span className={styles.tooltipConf} style={{ color: conf.color }}>{conf.key}</span>}
                </div>
            </div>
        </div>
    );
}

// ── Componente principal ──
export default function Equipos() {
    const [teams, setTeams]           = useState(FALLBACK_TEAMS);
    const [activeConfs, setActiveConfs] = useState(new Set()); // Set vacío = todos

    useEffect(() => {
        const fetch_ = async () => {
            try {
                const res = await fetch("https://world-cup-2026.p.rapidapi.com/world-cup-2026/teams", {
                    headers: { "x-rapidapi-key": API_KEY, "x-rapidapi-host": API_HOST },
                });
                if (!res.ok) throw new Error();
                const data = await res.json();
                const list = data.teams || data;
                if (Array.isArray(list) && list.length > 0) setTeams(list);
            } catch { /* usa fallback */ }
        };
        fetch_();
    }, []);

    const toggleConf = (key) => {
        setActiveConfs(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const clearFilters = () => setActiveConfs(new Set());

    const isFiltering   = activeConfs.size > 0;
    const filteredTeams = isFiltering
        ? teams.filter(t => activeConfs.has(CONF_BY_ID[t.id]))
        : teams;

    // Carrusel: duplicar 3 veces
    const row1  = [...teams, ...teams, ...teams];
    const row2x = [...[...teams].reverse(), ...[...teams].reverse(), ...[...teams].reverse()];

    return (
        <section className={styles.section}>
            {/* ── Header ── */}
            <div className={styles.header}>
                <p className={styles.label}>FIFA World Cup 2026™</p>
                <h2 className={styles.title}>
                    Las <span className={styles.gold}>48 Selecciones</span>
                </h2>
                <p className={styles.sub}>
                    {isFiltering
                        ? `${filteredTeams.length} equipo${filteredTeams.length !== 1 ? "s" : ""} seleccionado${filteredTeams.length !== 1 ? "s" : ""}`
                        : `${teams.length} clasificados hasta ahora`}
                </p>
            </div>



            {/* ── Carrusel (sin filtro) ── */}
            {!isFiltering && (
                <div className={styles.carouselWrap}>
                    <div className={styles.fadeLeft} />
                    <div className={styles.fadeRight} />
                    <div className={styles.track} style={{ "--duration": "55s", "--direction": "normal" }}>
                        {row1.map((team, i) => (
                            <TeamBadge key={`r1-${team.id}-${i}`} team={team} />
                        ))}
                    </div>
                    <div className={styles.track} style={{ "--duration": "65s", "--direction": "reverse" }}>
                        {row2x.map((team, i) => (
                            <TeamBadge key={`r2-${team.id}-${i}`} team={team} />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Grid filtrado ── */}
            {isFiltering && (
                <div className={styles.grid}>
                    {filteredTeams.length === 0 ? (
                        <p className={styles.empty}>No hay equipos en esta selección.</p>
                    ) : (
                        filteredTeams.map((team, i) => (
                            <TeamBadge
                                key={team.id}
                                team={team}
                                filtered
                                style={{ animationDelay: `${i * 0.04}s` }}
                            />
                        ))
                    )}
                </div>
            )}

            {/* ── Filtros de confederación ── */}
            <div className={styles.confRow}>
                {CONFEDERATIONS.map(c => {
                    const active = activeConfs.has(c.key);
                    return (
                        <button
                            key={c.key}
                            className={`${styles.confItem} ${active ? styles.confActive : ""}`}
                            style={{ "--conf-color": c.color }}
                            onClick={() => toggleConf(c.key)}
                            title={c.region}
                        >
                            <span className={styles.confDot} />
                            <span className={styles.confName}>{c.label}</span>
                            <span className={styles.confN}>{c.n}</span>
                            {active && <span className={styles.confCheck}>✓</span>}
                        </button>
                    );
                })}
                {isFiltering && (
                    <button className={styles.clearBtn} onClick={clearFilters}>
                        ✕ Limpiar
                    </button>
                )}
            </div>
        </section>
    );
}