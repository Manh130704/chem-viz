import React, { useState, useEffect } from "react";
import "./styles/global.css";

import LandingPage        from "./components/LandingPage";
import Navbar             from "./components/Navbar";
import AuthModal          from "./components/AuthModal";
import ReactionPage       from "./components/ReactionPage";
import MoleculesPage      from "./components/MoleculesPage";
import MolCalcPage        from "./components/MolCalcPage";
import QuizPage           from "./components/QuizPage";
import BalancePage        from "./components/BalancePage";
import TheoryPage         from "./components/TheoryPage";
import SolubilityPage     from "./components/SolubilityPage";
import ActivitySeriesPage from "./components/ActivitySeriesPage";
import NotFoundPage       from "./components/NotFoundPage";
import TeacherDashboard   from "./components/TeacherDashboard";
import { useFavorites }   from "./hooks/useFavorites";
import { useAuth }        from "./hooks/useAuth";

const VALID_PAGES = [
  "all","hoahop","phanhuy","chay","trunghoa","oxihoa",
  "molecules","balance","molcalc","quiz","theory",
  "solubility","activity","favorites","dashboard",
];

export default function App() {
  const { user, profile, loading: authLoading, signOut } = useAuth();

  const [showLanding,   setShowLanding]   = useState(true);
  const [page,          setPage]          = useState("all");
  const [showAuth,      setShowAuth]      = useState(false);
  const [toast,         setToast]         = useState("");
  const [molCalcPreset, setMolCalcPreset] = useState(null);
  const { favs, toggle, isFav }           = useFavorites();

  // Ẩn loading screen
  useEffect(() => {
    if (!authLoading && window.__hideLoader) {
      const t = setTimeout(() => window.__hideLoader(), 600);
      return () => clearTimeout(t);
    }
  }, [authLoading]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const handleLogout = async () => {
    await signOut();
    showToast("Đã đăng xuất");
    setPage("all");
  };

  const handleFavToggle = (reaction) => {
    const wasFav = isFav(reaction.id);
    toggle(reaction.id);
    showToast(wasFav ? `Đã bỏ yêu thích: ${reaction.name}` : `❤️ Đã lưu: ${reaction.name}`);
  };

  const handleGoMolCalc = (balancedData) => {
    setMolCalcPreset(balancedData);
    setPage("molcalc");
    showToast("🧮 Đã chuyển phương trình sang trang tính mol!");
  };

  const handleSetPage = (p) => {
    if (p !== "molcalc") setMolCalcPreset(null);
    setPage(p);
  };

  const renderPage = () => {
    if (!VALID_PAGES.includes(page)) {
      return <NotFoundPage onGoHome={() => { setShowLanding(true); setPage("all"); }} />;
    }
    if (page === "dashboard") {
      if (!user || profile?.role !== "teacher") {
        return <NotFoundPage onGoHome={() => setPage("all")} />;
      }
      return <TeacherDashboard />;
    }
    switch (page) {
      case "molecules":  return <MoleculesPage />;
      case "quiz":       return <QuizPage />;
      case "balance":    return <BalancePage onGoMolCalc={handleGoMolCalc} />;
      case "molcalc":    return <MolCalcPage preset={molCalcPreset} onClearPreset={() => setMolCalcPreset(null)} />;
      case "theory":     return <TheoryPage />;
      case "solubility": return <SolubilityPage />;
      case "activity":   return <ActivitySeriesPage />;
      default:           return (
        <ReactionPage filterType={page} isFav={isFav} onFavToggle={handleFavToggle} />
      );
    }
  };

  if (showLanding) {
    return (
      <>
        <LandingPage onEnter={() => setShowLanding(false)} />
        {toast && <div className="toast">{toast}</div>}
      </>
    );
  }

  return (
    <>
      <Navbar
        page={page}
        setPage={handleSetPage}
        user={user}
        profile={profile}
        favCount={favs.length}
        onLoginClick={() => setShowAuth(true)}
        onLogout={handleLogout}
        onLogoClick={() => setShowLanding(true)}
      />

      {renderPage()}

      {showAuth && (
        <AuthModal onClose={() => {
          setShowAuth(false);
          if (user) showToast(`✓ Chào mừng!`);
        }} />
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}