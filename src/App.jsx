import { AppHeader, BottomNav } from "./components/AppChrome";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SwipePage from "./pages/SwipePage";
import CandidateProfilePage from "./pages/CandidateProfilePage";
import MatchesPage from "./pages/MatchesPage";
import ChatPage from "./pages/ChatPage";
import MyProfilePage from "./pages/MyProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import EditGroupProfilePage from "./pages/EditGroupProfilePage";
import IncomingLikesPage from "./pages/IncomingLikesPage";
import DiscoverPage from "./pages/DiscoverPage";
import CreatePostPage from "./pages/CreatePostPage";
import MyPostsPage from "./pages/MyPostsPage";
import PostApplicationsPage from "./pages/PostApplicationsPage";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Navigate to="/discover" replace /> : children;
}

export default function App() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="app-shell">
      <ScrollToTop />
      {isLoggedIn ? <AppHeader /> : null}
      

      <main className={isLoggedIn ? "app-main" : "app-main app-main--auth"}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <SignupPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/swipe"
            element={
              <PrivateRoute>
                <SwipePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/incoming-likes"
            element={
              <PrivateRoute>
                <IncomingLikesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/candidates/:targetUserId"
            element={
              <PrivateRoute>
                <CandidateProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <PrivateRoute>
                <MatchesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat/:matchId"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-profile"
            element={
              <PrivateRoute>
                <MyProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <PrivateRoute>
                <EditProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-group-profile"
            element={
              <PrivateRoute>
                <EditGroupProfilePage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to={isLoggedIn ? "/discover" : "/login"} replace />} />

          <Route
            path="/discover"
            element={
              <PrivateRoute>
                <DiscoverPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/create-post"
            element={
              <PrivateRoute>
                <CreatePostPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/my-posts"
            element={
              <PrivateRoute>
                <MyPostsPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/posts/:postId/applications"
            element={
              <PrivateRoute>
                <PostApplicationsPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>

      {isLoggedIn ? <BottomNav /> : null}
    </div>
  );
}
