import React, { useState, useEffect } from "react";
import "./styles/global.css";

import LandingPage        from "./components/LandingPage";
import Navbar             from "./components/Navbar";
import LoginModal         from "./components/LoginModal";
import ReactionPage       from "./components/ReactionPage";
import MoleculesPage      from "./components/MoleculesPage";
import MolCalcPage        from "./components/MolCalcPage";
import QuizPage           from "./components/QuizPage";
import BalancePage        from "./components/BalancePage";
import TheoryPage         from "./components/TheoryPage";
import SolubilityPage     from "./components/SolubilityPage";
import ActivitySeriesPage from "./components/ActivitySeriesPage";
import NotFoundPage       from "./components/NotFoundPage";
import { useFavorites }   from "./hooks/useFavorites";

const VALID_PAGES = [
  "all","hoahop","phanhuy","chay","trunghoa","oxihoa",
  "molecules","balance","molcalc","quiz","theory",
  "solubility","activity","favorites",
];

export default function App() {
  const [showLanding,   setShowLanding]   = useState(true);
  const [page,          setPage]          = useState("all");
  const [user,          setUser]          = useState(null);
  const [showLogin,     setShowLogin]     = useState(false);
  const [toast,         setToast]         = useState("");
  const [molCalcPreset, setMolCalcPreset] = useState(null);
  const { favs, toggle, isFav }           = useFavorites();

  // Ẩn loading screen khi React đã mount
  useEffect(() => {
    if (window.__hideLoader) {
      // Đợi thêm 800ms để animation progress bar chạy xong đẹp
      const t = setTimeout(() => window.__hideLoader(), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  const handleLogin  = (name) => { setUser(name); showToast(`✓ Chào mừng, ${name}!`); };
  const handleLogout = ()     => { setUser(null);  showToast("Đã đăng xuất"); };

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
    // 404: trang không hợp lệ
    if (!VALID_PAGES.includes(page)) {
      return <NotFoundPage onGoHome={() => { setShowLanding(true); setPage("all"); }} />;
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
        <ReactionPage
          filterType={page}
          isFav={isFav}
          onFavToggle={handleFavToggle}
        />
      );
    }
  };

  // Landing page
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
        favCount={favs.length}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
        onLogoClick={() => setShowLanding(true)}
      />

      {renderPage()}

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={handleLogin}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}