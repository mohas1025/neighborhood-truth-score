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
      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
        isActive
          ? "bg-blue-600 text-white"
          : "text-gray-400 hover:text-white hover:bg-gray-800"
      }`}
    >
      {children}
    </Link>
  );
}

function App() {
  return (
    <BrowserRouter>
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex gap-3">
        <NavLink to="/">🔍 Search</NavLink>
        <NavLink to="/compare">⚖️ Compare</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/compare" element={<ComparePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
