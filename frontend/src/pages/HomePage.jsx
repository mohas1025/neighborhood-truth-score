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

// Fix leaflet marker icon bug
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Helper: score to color
const getScoreColor = (score) => {
  if (score >= 75) return "text-green-400";
  if (score >= 55) return "text-yellow-400";
  return "text-red-400";
};

const getScoreBadge = (score) => {
  if (score >= 75)
    return { label: "Good", color: "bg-green-900 text-green-300" };
  if (score >= 55)
    return { label: "Moderate", color: "bg-yellow-900 text-yellow-300" };
  return { label: "Concerning", color: "bg-red-900 text-red-300" };
};

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
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold text-blue-400">
          🏘️ Neighborhood Truth Score
        </h1>
        <p className="text-gray-400 text-sm">
          Real public safety & livability data
        </p>
      </header>

      {/* Main */}
      <main className="flex flex-col items-center px-6 py-16">
        {/* Hero */}
        <h2 className="text-4xl font-bold text-center mb-4">
          Know the truth about any neighborhood
        </h2>
        <p className="text-gray-400 text-center text-lg mb-10 max-w-xl">
          Enter any address, city, or ZIP code to get a real safety and
          livability score.
        </p>

        {/* Search */}
        <div className="flex w-full max-w-xl gap-3 mb-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter address, city, or ZIP code..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Error */}
        {error && <p className="text-red-400 mb-6">{error}</p>}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 text-sm">
              Analyzing neighborhood data...
            </p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="w-full max-w-4xl">
            {/* Location name */}
            <p className="text-gray-400 text-sm mb-4">{result.display_name}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Score Card */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-300">
                    Truth Score
                  </h3>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <p
                  className={`text-7xl font-bold mb-2 ${getScoreColor(result.score)}`}
                >
                  {result.score}
                </p>
                <p className="text-gray-400 text-sm mb-6">{result.summary}</p>

                {/* Category grid */}
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(result.categories).map(([key, value]) => (
                    <div key={key} className="bg-gray-800 rounded-lg p-3">
                      <p className="text-gray-400 capitalize text-xs mb-1 uppercase tracking-wide">
                        {key}
                      </p>
                      <p
                        className={`text-2xl font-bold ${getScoreColor(value)}`}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Radar Chart */}
                <div className="mt-6">
                  <h4 className="text-sm text-gray-400 mb-3 uppercase tracking-wide">
                    Score Breakdown
                  </h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={chartData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis
                        dataKey="category"
                        tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      />
                      <Radar
                        dataKey="score"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.3}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Map */}
              <div className="rounded-xl overflow-hidden border border-gray-800 h-80">
                <MapContainer
                  center={[result.lat, result.lon]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
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
      </main>
    </div>
  );
}

export default HomePage;
