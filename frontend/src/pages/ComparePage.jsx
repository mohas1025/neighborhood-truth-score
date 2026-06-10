import { useState } from "react";
import axios from "axios";

const API_BASE = "https://neighborhood-truth-score-production.up.railway.app";

const getScoreColor = (score) => {
  if (score >= 75) return "var(--accent)";
  if (score >= 55) return "var(--warn)";
  return "var(--danger)";
};

const getScoreBadge = (score) => {
  if (score >= 75)
    return {
      label: "Good",
      bg: "var(--accent-light)",
      color: "var(--accent)",
      border: "#C5E8D5",
    };
  if (score >= 55)
    return {
      label: "Moderate",
      bg: "var(--warn-light)",
      color: "var(--warn)",
      border: "#FDE68A",
    };
  return {
    label: "Concerning",
    bg: "var(--danger-light)",
    color: "var(--danger)",
    border: "#FECACA",
  };
};

function ScoreBar({ value }) {
  return (
    <div
      style={{
        height: "6px",
        backgroundColor: "var(--bg-subtle)",
        borderRadius: "99px",
        overflow: "hidden",
      }}
    >
      <div
        className="score-bar"
        style={{
          height: "100%",
          borderRadius: "99px",
          backgroundColor: getScoreColor(value),
          "--target-width": `${value}%`,
          width: `${value}%`,
        }}
      />
    </div>
  );
}

function ResultCard({ result, isWinner }) {
  const badge = getScoreBadge(result.score);
  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        border: isWinner
          ? "2px solid var(--accent)"
          : "1px solid var(--border)",
        borderRadius: "16px",
        padding: "28px",
        boxShadow: isWinner ? "var(--shadow-lg)" : "var(--shadow-md)",
        position: "relative",
      }}
    >
      {isWinner && (
        <div
          style={{
            position: "absolute",
            top: "-13px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "var(--accent)",
            color: "white",
            fontSize: "0.7rem",
            fontWeight: "700",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "3px 14px",
            borderRadius: "99px",
            whiteSpace: "nowrap",
          }}
        >
          🏆 Winner
        </div>
      )}

      <p
        style={{
          color: "var(--text-tertiary)",
          fontSize: "0.75rem",
          marginBottom: "16px",
          lineHeight: "1.4",
        }}
      >
        {result.display_name}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "4.5rem",
              lineHeight: "1",
              color: getScoreColor(result.score),
              letterSpacing: "-0.03em",
            }}
          >
            {result.score}
          </span>
          <span
            style={{
              color: "var(--text-tertiary)",
              fontSize: "1rem",
              marginBottom: "10px",
            }}
          >
            /100
          </span>
        </div>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: "600",
            padding: "3px 10px",
            borderRadius: "99px",
            backgroundColor: badge.bg,
            color: badge.color,
            border: `1px solid ${badge.border}`,
          }}
        >
          {badge.label}
        </span>
      </div>

      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.875rem",
          lineHeight: "1.5",
          marginBottom: "24px",
        }}
      >
        {result.summary}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {Object.entries(result.categories).map(([key, value]) => (
          <div key={key}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  textTransform: "capitalize",
                }}
              >
                {key}
              </span>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: getScoreColor(value),
                }}
              >
                {value}
              </span>
            </div>
            <ScoreBar value={value} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparePage() {
  const [queryA, setQueryA] = useState("");
  const [queryB, setQueryB] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultA, setResultA] = useState(null);
  const [resultB, setResultB] = useState(null);
  const [error, setError] = useState(null);

  const handleCompare = async () => {
    if (!queryA.trim() || !queryB.trim()) return;
    setLoading(true);
    setError(null);
    setResultA(null);
    setResultB(null);
    try {
      const [resA, resB] = await Promise.all([
        axios.get(`${API_BASE}/api/search?q=${encodeURIComponent(queryA)}`),
        axios.get(`${API_BASE}/api/search?q=${encodeURIComponent(queryB)}`),
      ]);
      setResultA(resA.data);
      setResultB(resB.data);
    } catch (err) {
      setError("One or both locations not found. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const aWins = resultA && resultB && resultA.score > resultB.score;
  const bWins = resultA && resultB && resultB.score > resultA.score;
  const tie = resultA && resultB && resultA.score === resultB.score;

  const inputStyle = {
    flex: "1",
    padding: "13px 18px",
    fontSize: "0.95rem",
    border: "1.5px solid var(--border)",
    borderRadius: "10px",
    backgroundColor: "var(--bg)",
    color: "var(--text-primary)",
    outline: "none",
    fontFamily: "var(--font-body)",
    boxShadow: "var(--shadow-sm)",
    transition: "border-color 0.15s",
    minWidth: "0",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderBottom: "1px solid var(--border)",
          padding: "48px 24px 40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            backgroundColor: "var(--accent-light)",
            color: "var(--accent)",
            fontSize: "0.75rem",
            fontWeight: "600",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "4px 12px",
            borderRadius: "99px",
            marginBottom: "20px",
            border: "1px solid #C5E8D5",
          }}
        >
          Side-by-Side Comparison
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 4vw, 2.75rem)",
            color: "var(--text-primary)",
            lineHeight: "1.2",
            marginBottom: "12px",
            letterSpacing: "-0.02em",
          }}
        >
          Compare Two Neighborhoods
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "1rem",
            marginBottom: "36px",
            maxWidth: "440px",
            margin: "0 auto 36px",
            lineHeight: "1.6",
          }}
        >
          Enter two locations to see a detailed safety and livability
          comparison.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            maxWidth: "680px",
            margin: "0 auto 16px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            value={queryA}
            onChange={(e) => setQueryA(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCompare()}
            placeholder="First location…"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          <div
            style={{
              width: "32px",
              height: "32px",
              flexShrink: 0,
              backgroundColor: "var(--bg-subtle)",
              border: "1px solid var(--border)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-tertiary)",
              fontSize: "0.8rem",
              fontWeight: "700",
            }}
          >
            vs
          </div>
          <input
            type="text"
            value={queryB}
            onChange={(e) => setQueryB(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCompare()}
            placeholder="Second location…"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        <button
          onClick={handleCompare}
          disabled={loading}
          style={{
            padding: "13px 36px",
            backgroundColor: loading ? "var(--border-strong)" : "var(--accent)",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "0.95rem",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)",
            boxShadow: "var(--shadow-sm)",
            transition: "background-color 0.15s",
          }}
        >
          {loading ? "Comparing…" : "Compare Neighborhoods"}
        </button>

        {error && (
          <p
            style={{
              color: "var(--danger)",
              marginTop: "16px",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </p>
        )}
      </div>

      {loading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "80px 24px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid var(--border)",
              borderTopColor: "var(--accent)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              marginBottom: "16px",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Analyzing both neighborhoods…
          </p>
        </div>
      )}

      {resultA && resultB && (
        <div
          className="fade-up"
          style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px" }}
        >
          <div
            style={{
              backgroundColor: tie
                ? "var(--warn-light)"
                : "var(--accent-light)",
              border: `1px solid ${tie ? "#FDE68A" : "#C5E8D5"}`,
              borderRadius: "12px",
              padding: "16px 24px",
              textAlign: "center",
              marginBottom: "32px",
            }}
          >
            <p
              style={{
                color: tie ? "var(--warn)" : "var(--accent)",
                fontWeight: "600",
                fontSize: "0.95rem",
              }}
            >
              {tie
                ? `🤝 It's a tie — both neighborhoods score ${resultA.score}`
                : `🏆 ${aWins ? resultA.query : resultB.query} comes out ahead — ${aWins ? resultA.score : resultB.score} vs ${aWins ? resultB.score : resultA.score}`}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            <ResultCard result={resultA} isWinner={aWins} />
            <ResultCard result={resultB} isWinner={bWins} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ComparePage;
