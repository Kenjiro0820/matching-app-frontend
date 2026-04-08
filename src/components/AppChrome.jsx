import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getReceivedApplicationsApi } from "../api/applicationApi";
import { getUnreadMessageCountApi } from "../api/messageApi";
import "../styles/AppChrome.css";
import { Search, Heart, MessageCircle, PlusCircle } from "lucide-react";
import { ThumbsUp } from "lucide-react";



export function AppHeader() {
  const { logout, loginUser } = useAuth();
  const navigate = useNavigate();

  const displayName = loginUser?.nickname || loginUser?.name || "Guest";
  const initial = displayName.slice(0, 1).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="chrome-header">
      <div className="chrome-header__inner">

        <div className="brand">
          <svg
            className="brand-logo"
            viewBox="0 0 64 40"
            aria-label="MIXER logo"
            role="img"
          >
            <defs>
              <linearGradient id="mixerLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#67d5c6" />
                <stop offset="100%" stopColor="#4fc3f7" />
              </linearGradient>

              <linearGradient id="mixerRight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7dd3fc" />
                <stop offset="100%" stopColor="#5b7cff" />
              </linearGradient>
            </defs>

            {/* 左吹き出し */}
            <path
              d="M23 7
         C15 7, 9 12, 9 19
         C9 24, 12 28, 17 30
         L16 36
         L22 32
         H23
         C31 32, 37 27, 37 20
         C37 13, 31 7, 23 7 Z"
              fill="url(#mixerLeft)"
            />

            {/* 右吹き出し */}
            <path
              d="M41 7
         C49 7, 55 12, 55 19
         C55 24, 52 28, 47 30
         L48 36
         L42 32
         H41
         C33 32, 27 27, 27 20
         C27 13, 33 7, 41 7 Z"
              fill="url(#mixerRight)"
            />

            {/* 白ハート */}
            <path
              d="M32 27
         C31 26, 24 21.5, 24 16.8
         C24 14.2, 26 12.2, 28.5 12.2
         C30.3 12.2, 31.4 13.1, 32 14
         C32.6 13.1, 33.7 12.2, 35.5 12.2
         C38 12.2, 40 14.2, 40 16.8
         C40 21.5, 33 26, 32 27 Z"
              fill="#ffffff"
            />
          </svg>

          <span className="brand-text">MIXER</span>
        </div>

        <div className="chrome-header__actions">
          <div className="chrome-user-pill">
            <span className="chrome-user-pill__name">{displayName}</span>
          </div>

          <button
            type="button"
            className="chrome-logout-button"
            onClick={handleLogout}
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}

const navItems = [
  { to: "/discover", label: "さがす", icon: <Search size={20} />, badgeKey: null },
  { to: "/incoming-likes", label: "いいね！", icon: <ThumbsUp size={20} />, badgeKey: "applications"},
  { to: "/matches", label: "メッセージ", icon: <MessageCircle size={20} />, badgeKey: "messages" },
  { to: "/my-profile", label: "募集", icon: <PlusCircle size={20} />, badgeKey: null },
];

export function BottomNav() {
  const { loginUser } = useAuth();
  const [applicationCount, setApplicationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    if (!loginUser?.id) {
      setApplicationCount(0);
      setMessageCount(0);
      return;
    }

    let cancelled = false;

    const fetchCounts = async () => {
      try {
        const [receivedApplications, unreadMessages] = await Promise.all([
          getReceivedApplicationsApi(),
          getUnreadMessageCountApi(loginUser.id),
        ]);

        if (cancelled) return;

        setApplicationCount(
          Array.isArray(receivedApplications) ? receivedApplications.length : 0
        );
        setMessageCount(unreadMessages?.count ?? 0);
      } catch (error) {
        if (cancelled) return;
        setApplicationCount(0);
        setMessageCount(0);
      }
    };

    const handleRefresh = () => {
      fetchCounts();
    };

    const handleApplicationsCountChanged = (event) => {
      const nextCount = event?.detail?.count;
      if (typeof nextCount === "number") {
        setApplicationCount(nextCount);
      }
    };

    const handleApplicationsDecrement = () => {
      setApplicationCount((prev) => Math.max(0, prev - 1));
    };

    fetchCounts();

    window.addEventListener("focus", handleRefresh);
    window.addEventListener("app:badge-refresh", handleRefresh);
    window.addEventListener(
      "app:applications-count-changed",
      handleApplicationsCountChanged
    );
    window.addEventListener("app:applications-decrement", handleApplicationsDecrement);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("app:badge-refresh", handleRefresh);
      window.removeEventListener(
        "app:applications-count-changed",
        handleApplicationsCountChanged
      );
      window.removeEventListener("app:applications-decrement", handleApplicationsDecrement);
    };
  }, [loginUser?.id]);

  const getBadgeCount = (badgeKey) => {
    if (badgeKey === "applications") return applicationCount;
    if (badgeKey === "messages") return messageCount;
    return 0;
  };

  return (
    <nav className="chrome-bottom-nav">
      {navItems.map((item) => {
        const badgeCount = getBadgeCount(item.badgeKey);

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive
                ? "chrome-bottom-nav__item chrome-bottom-nav__item--active"
                : "chrome-bottom-nav__item"
            }
          >
            <span className="chrome-bottom-nav__icon">{item.icon}</span>
            <span className="chrome-bottom-nav__label">{item.label}</span>

            {badgeCount > 0 && (
              <span className="chrome-bottom-nav__badge">
                {badgeCount > 99 ? "99+" : badgeCount}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}