function HomePage() {
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

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">
          Know the truth about any neighborhood
        </h2>
        <p className="text-gray-400 text-center text-lg mb-10 max-w-xl">
          Enter any address, city, or ZIP code to get a real safety and
          livability score based on public data.
        </p>

        {/* Search Box */}
        <div className="flex w-full max-w-xl gap-3">
          <input
            type="text"
            placeholder="Enter address, city, or ZIP code..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition">
            Search
          </button>
        </div>
      </main>
    </div>
  )
}

export default HomePage