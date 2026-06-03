import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function HomePage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`http://localhost:8000/api/search?q=${query}`)
      setResult(response.data)
    } catch (err) {
      setError('Something went wrong. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold text-blue-400">
          🏘️ Neighborhood Truth Score
        </h1>
        <p className="text-gray-400 text-sm">Real public safety & livability data</p>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">
          Know the truth about any neighborhood
        </h2>
        <p className="text-gray-400 text-center text-lg mb-10 max-w-xl">
          Enter any address, city, or ZIP code to get a real safety and livability score.
        </p>

        {/* Search Box */}
        <div className="flex w-full max-w-xl gap-3 mb-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter address, city, or ZIP code..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-400 mb-6">{error}</div>
        )}

        {/* Results */}
        {result && (
          <div className="w-full max-w-xl bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold mb-2">Results for: {result.query}</h3>
            <div className="text-5xl font-bold text-blue-400 mb-2">{result.score}</div>
            <p className="text-gray-400 mb-4">{result.summary}</p>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(result.categories).map(([key, value]) => (
                <div key={key} className="bg-gray-800 rounded-lg p-3">
                  <div className="text-gray-400 capitalize text-sm">{key}</div>
                  <div className="text-2xl font-bold text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default HomePage