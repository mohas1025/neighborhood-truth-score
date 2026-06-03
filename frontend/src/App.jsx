import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import ComparePage from "./pages/ComparePage";

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.875rem",
        fontWeight: isActive ? "600" : "400",
        color: isActive ? "var(--accent)" : "var(--text-secondary)",
        textDecoration: "none",
        padding: "6px 14px",
        borderRadius: "8px",
        backgroundColor: isActive ? "var(--accent-light)" : "transparent",
        transition: "all 0.15s ease",
        border: isActive ? "1px solid #C5E8D5" : "1px solid transparent",
      }}
    >
      {children}
    </Link>
  );
}

function App() {
  return (
    <BrowserRouter>
      <nav
        style={{
          backgroundColor: "var(--bg-card)",
          borderBottom: "1px solid var(--border)",
          padding: "0 32px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "var(--shadow-sm)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              backgroundColor: "var(--accent)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" fill="white" />
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke="white"
                strokeWidth="1.5"
                fill="none"
                opacity="0.5"
              />
            </svg>
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.05rem",
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            Truth Score
          </span>
        </Link>

        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <NavLink to="/">Search</NavLink>
          <NavLink to="/compare">Compare</NavLink>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/compare" element={<ComparePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
