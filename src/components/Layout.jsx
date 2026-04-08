import { NavLink, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const location = useLocation();

  const hideBottomNav =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="app-shell">
      <main className="app-main">{children}</main>

      {!hideBottomNav && (
        <nav className="bottom-nav">
          <NavLink
            to="/discover"
            className={({ isActive }) =>
              isActive ? "bottom-nav-item active" : "bottom-nav-item"
            }
          >
            探す
          </NavLink>

          <NavLink
            to="/create-post"
            className={({ isActive }) =>
              isActive ? "bottom-nav-item active" : "bottom-nav-item"
            }
          >
            募集作成
          </NavLink>

          <NavLink
            to="/my-posts"
            className={({ isActive }) =>
              isActive ? "bottom-nav-item active" : "bottom-nav-item"
            }
          >
            自分の募集
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive ? "bottom-nav-item active" : "bottom-nav-item"
            }
          >
            設定
          </NavLink>
        </nav>
      )}
    </div>
  );
}