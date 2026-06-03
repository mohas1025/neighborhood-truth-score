import { useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import MapUpdater from "../components/MapUpdater";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

function HomePage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/search?q=${encodeURIComponent(query)}`,
      );
      setResult(response.data);
    } catch (err) {
      setError("Location not found. Try a different address or ZIP code.");
    } finally {
      setLoading(false);
    }
  };

  const badge = result ? getScoreBadge(result.score) : null;
  const chartData = result
    ? Object.entries(result.categories).map(([key, value]) => ({
        category: key,
        score: value,
      }))
    : [];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      {/* Hero */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          borderBottom: "1px solid var(--border)",
          padding: "56px 24px 48px",
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
          Public Safety & Livability Data
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            color: "var(--text-primary)",
            lineHeight: "1.15",
            marginBottom: "16px",
            letterSpacing: "-0.02em",
          }}
        >
          Know the truth about
          <br />
          any neighborhood
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "1.05rem",
            marginBottom: "36px",
            maxWidth: "480px",
            margin: "0 auto 36px",
            lineHeight: "1.6",
          }}
        >
          Enter any address, city, or ZIP code to get a real safety and
          livability score.
        </p>

        {/* Search bar */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            maxWidth: "560px",
            margin: "0 auto",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter address, city, or ZIP code..."
            style={{
              flex: "1",
              minWidth: "200px",
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
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: "13px 28px",
              backgroundColor: loading
                ? "var(--border-strong)"
                : "var(--accent)",
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
            {loading ? "Searching…" : "Search"}
          </button>
        </div>

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

      {/* Loading */}
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
            Analyzing neighborhood data…
          </p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div
          className="fade-up"
          style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}
        >
          {/* Location label */}
          <p
            style={{
              color: "var(--text-tertiary)",
              fontSize: "0.8rem",
              marginBottom: "24px",
              letterSpacing: "0.02em",
            }}
          >
            {result.display_name}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Score Card */}
            <div
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "28px",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    color: "var(--text-secondary)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Truth Score
                </span>
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

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "12px",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "5rem",
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
                    fontSize: "1.2rem",
                    marginBottom: "12px",
                  }}
                >
                  /100
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

              {/* Category bars */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
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

              {/* Radar Chart */}
              <div style={{ marginTop: "28px" }}>
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: "var(--text-tertiary)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: "12px",
                  }}
                >
                  Score Breakdown
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={chartData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{
                        fill: "var(--text-secondary)",
                        fontSize: 11,
                        fontFamily: "var(--font-body)",
                      }}
                    />
                    <Radar
                      dataKey="score"
                      stroke="var(--accent)"
                      fill="var(--accent)"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.8rem",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Map */}
            <div
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-md)",
                minHeight: "400px",
              }}
            >
              <MapContainer
                center={[result.lat, result.lon]}
                zoom={13}
                style={{ height: "100%", minHeight: "400px", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="© OpenStreetMap contributors"
                />
                <MapUpdater lat={result.lat} lon={result.lon} />
                <Marker position={[result.lat, result.lon]}>
                  <Popup>{result.display_name}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
