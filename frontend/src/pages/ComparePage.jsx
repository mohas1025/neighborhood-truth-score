import { useState } from "react";
import axios from "axios";

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
        axios.get(
          `http://localhost:8000/api/search?q=${encodeURIComponent(queryA)}`,
        ),
        axios.get(
          `http://localhost:8000/api/search?q=${encodeURIComponent(queryB)}`,
        ),
      ]);
      setResultA(resA.data);
      setResultB(resB.data);
    } catch (err) {
      setError("One or both locations not found. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const ResultCard = ({ result }) => {
    const badge = getScoreBadge(result.score);
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <p className="text-gray-400 text-xs mb-3">{result.display_name}</p>
        <div className="flex items-center justify-between mb-4">
          <p className={`text-6xl font-bold ${getScoreColor(result.score)}`}>
            {result.score}
          </p>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${badge.color}`}
          >
            {badge.label}
          </span>
        </div>
        <p className="text-gray-400 text-sm mb-4">{result.summary}</p>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(result.categories).map(([key, value]) => (
            <div key={key} className="bg-gray-800 rounded-lg p-3">
              <p className="text-gray-400 capitalize text-xs mb-1 uppercase tracking-wide">
                {key}
              </p>
              <p className={`text-xl font-bold ${getScoreColor(value)}`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

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

      <main className="flex flex-col items-center px-6 py-16">
        <h2 className="text-4xl font-bold text-center mb-4">
          Compare Two Neighborhoods
        </h2>
        <p className="text-gray-400 text-center text-lg mb-10 max-w-xl">
          Enter two locations to see a side-by-side safety and livability
          comparison.
        </p>

        {/* Search Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mb-6">
          <input
            type="text"
            value={queryA}
            onChange={(e) => setQueryA(e.target.value)}
            placeholder="First location..."
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />
          <input
            type="text"
            value={queryB}
            onChange={(e) => setQueryB(e.target.value)}
            placeholder="Second location..."
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition"
          />
        </div>

        <button
          onClick={handleCompare}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-8 py-3 rounded-lg transition mb-10"
        >
          {loading ? "Comparing..." : "Compare"}
        </button>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 text-sm">
              Analyzing both neighborhoods...
            </p>
          </div>
        )}

        {/* Error */}
        {error && <p className="text-red-400 mb-6">{error}</p>}

        {/* Results */}
        {resultA && resultB && (
          <div className="w-full max-w-4xl">
            {/* Winner Banner */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-6 text-center">
              {resultA.score > resultB.score ? (
                <p className="text-green-400 font-semibold">
                  🏆 {resultA.query} scores higher ({resultA.score} vs{" "}
                  {resultB.score})
                </p>
              ) : resultB.score > resultA.score ? (
                <p className="text-green-400 font-semibold">
                  🏆 {resultB.query} scores higher ({resultB.score} vs{" "}
                  {resultA.score})
                </p>
              ) : (
                <p className="text-yellow-400 font-semibold">
                  🤝 It's a tie! Both score {resultA.score}
                </p>
              )}
            </div>

            {/* Side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResultCard result={resultA} />
              <ResultCard result={resultB} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ComparePage;
