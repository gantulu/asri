import { NavLink, Outlet } from "react-router-dom";
import SiteFooter from "./SiteFooter";

const items = [
  ["/", "Home"],
  ["/clothes", "Clothes"],
  ["/bag", "Bag"],
  ["/shoes", "Shoes"],
  ["/profile", "Profile"],
] as const;

export default function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="font-semibold">Asri Collection</span>
      </header>

      <main className="app-main">
        <Outlet />
        <SiteFooter />
      </main>

      <nav className="bottom-nav" aria-label="Primary navigation">
        {items.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
