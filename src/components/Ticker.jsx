"use client";
import styles from "./Ticker.module.css";

const ITEMS = [
  { text: "⚽ MUNDIAL 2026" },
  { text: "USA · MÉXICO · CANADÁ", sep: true },
  { text: "KEVSFC — FÚTBOL PARA TODOS", sep: true },
  { text: "48 SELECCIONES · 104 PARTIDOS", sep: true },
  { text: "11 JUN – 19 JUL 2026", sep: true },
  { text: "16 SEDES · NORTEAMÉRICA", sep: true },
];

export default function Ticker() {
  // Renderizamos el bloque una vez, y en CSS lo duplicamos con ::after
  // Para garantizar loop perfecto: 2 copias idénticas, animación al -50%
  return (
    <div className={styles.ticker} aria-hidden="true">
      <div className={styles.track}>
        {/* Copia 1 */}
        <div className={styles.block}>
          {ITEMS.map((item, i) => (
            <span key={`a-${i}`} className={styles.item}>
              {item.sep && <span className={styles.sep}>◆</span>}
              {item.text}
            </span>
          ))}
        </div>
        {/* Copia 2 — idéntica, asegura loop sin vacío */}
        <div className={styles.block} aria-hidden="true">
          {ITEMS.map((item, i) => (
            <span key={`b-${i}`} className={styles.item}>
              {item.sep && <span className={styles.sep}>◆</span>}
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
