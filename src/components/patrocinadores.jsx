"use client";
import Image from "next/image";
import patrocinadores from "../app/patrocinadores";
import styles from "./patrocinadores.module.css";

export default function Patrocinadores() {
    if (!patrocinadores || patrocinadores.length === 0) return null;

    return (
        <section className={styles.wrap}>
            <p className={styles.label}>Con el apoyo de</p>
            <h2 className={styles.title}>Patrocinadores</h2>
            <div className={styles.grid}>
                {patrocinadores.map((s) => (
                    <a
                        key={s.name}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.card}
                        title={s.name}
                    >
                        {s.logo ? (
                            /* logoBox con position:relative para que fill funcione */
                            <div className={styles.logoBox}>
                                <Image
                                    src={s.logo}
                                    alt={s.name}
                                    fill
                                    className={styles.logo}
                                    sizes="160px"
                                    unoptimized
                                />
                            </div>
                        ) : (
                            <span className={styles.name}>{s.name}</span>
                        )}
                    </a>
                ))}
            </div>
        </section>
    );
}