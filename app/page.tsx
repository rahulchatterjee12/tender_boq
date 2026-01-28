"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Tender = {
  id: string;
  organisation: string;
  title: string;
  description: string;
  value_in_rs: string;
  state: string;
  location: string;
  bid_submission_end_date: string;
};

type ApiResponse = {
  count: number;
  results: Tender[];
};

const LIMIT = 10;

export default function Page() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [offset, setOffset] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchTenders() {
      setLoading(true);

      try {
        const url = `https://staging.runway.org.in/api/tender/active?has_extracted_boq=true&limit=${LIMIT}&offset=${offset}`;
        const res = await fetch(url);
        const data: ApiResponse = await res.json();

        if (!active) return;

        setTenders(data.results);
        setCount(data.count);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchTenders();
    return () => {
      active = false;
    };
  }, [offset]);

  const hasNext = offset + LIMIT < count;
  const hasPrev = offset > 0;

  return (
    <main style={styles.page}>
      <h1 style={styles.heading}>Active Tenders</h1>

      <div style={styles.list}>
        {loading
          ? Array.from({ length: LIMIT }).map((_, i) => <Skeleton key={i} />)
          : tenders.map((t) => <TenderCard key={t.id} t={t} />)}
      </div>

      <div style={styles.pagination}>
        <button
          style={{
            ...styles.btn,
            ...(loading || !hasPrev ? styles.btnDisabled : {}),
          }}
          disabled={loading || !hasPrev}
          onClick={() => setOffset((o) => Math.max(o - LIMIT, 0))}
        >
          {loading ? "Loading..." : "← Previous"}
        </button>

        <span style={styles.pageInfo}>
          {offset + 1} – {Math.min(offset + LIMIT, count)} of {count}
        </span>

        <button
          style={{
            ...styles.btn,
            ...(loading || !hasNext ? styles.btnDisabled : {}),
          }}
          disabled={loading || !hasNext}
          onClick={() => setOffset((o) => o + LIMIT)}
        >
          {loading ? "Loading..." : "Next →"}
        </button>
      </div>
    </main>
  );
}

/* ------------------ Components ------------------ */

function TenderCard({ t }: { t: any }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/tender/${t.id}`)}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 18,
        background: "#fff",
        boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
        cursor: "pointer",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.04)";
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/tender/${t.id}`);
      }}
    >
      <h2 style={{ fontSize: 18, fontWeight: 600 }}>{t.title}</h2>

      <p style={{ color: "#6b7280", marginTop: 4 }}>{t.organisation}</p>

      <p style={{ marginTop: 10 }}>{t.description}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 8,
          marginTop: 14,
          fontSize: 13,
        }}
      >
        <span>{t.state}</span>
        <span>{t.location}</span>
        <span>₹{Number(t.value_in_rs).toLocaleString()}</span>
        <span>{new Date(t.bid_submission_end_date).toDateString()}</span>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={styles.skeleton}>
      <div style={styles.shimmer} />
    </div>
  );
}

/* ------------------ Styles ------------------ */

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 960,
    margin: "0 auto",
    padding: 24,
    fontFamily: "system-ui, sans-serif",
  },
  heading: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 20,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 18,
    background: "#fff",
    boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 600,
  },
  org: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 4,
  },
  desc: {
    marginTop: 10,
    lineHeight: 1.5,
  },
  meta: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 8,
    marginTop: 14,
    fontSize: 13,
    color: "#374151",
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
  },
  btn: {
    padding: "10px 16px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 500,
  },
  btnDisabled: {
    background: "#9ca3af",
    cursor: "not-allowed",
  },
  pageInfo: {
    fontSize: 14,
    color: "#374151",
  },
  skeleton: {
    height: 140,
    borderRadius: 14,
    background: "#e5e7eb",
    position: "relative",
    overflow: "hidden",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
    animation: "shimmer 1.2s infinite",
  },
};

/* CSS animation injection */
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes shimmer {
      100% { transform: translateX(200%); }
    }
  `;
  document.head.appendChild(style);
}
