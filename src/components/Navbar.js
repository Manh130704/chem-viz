import React, { useState, useRef, useEffect } from "react";
import { TYPES } from "../data/reactions";

const GROUPS = [
  {
    key:"reactions", label:"Phản ứng", icon:"⚗️", color:"#38bdf8",
    items:[
      { key:"all",      label:"Tất cả",         icon:"⚗️", desc:"40 phản ứng hóa học" },
      { key:"hoahop",   label:"Hóa hợp",        icon:"🔗", desc:"A + B → AB" },
      { key:"phanhuy",  label:"Phân hủy",        icon:"💥", desc:"AB → A + B" },
      { key:"chay",     label:"Cháy",            icon:"🔥", desc:"Phản ứng với O₂" },
      { key:"trunghoa", label:"Trung hòa",       icon:"⚖️", desc:"Axit + Bazơ" },
      { key:"oxihoa",   label:"Oxi hóa – Khử",  icon:"⚡", desc:"Chuyển electron" },
    ],
  },
  {
    key:"tools", label:"Công cụ", icon:"🧮", color:"#818cf8",
    items:[
      { key:"balance",  label:"Cân bằng PT", icon:"⚖️", desc:"Tự động cân bằng" },
      { key:"molcalc",  label:"Tính mol",    icon:"🧮", desc:"Tính khối lượng, số mol" },
      { key:"quiz",     label:"Quiz",        icon:"🎯", desc:"Kiểm tra kiến thức" },
    ],
  },
  {
    key:"reference", label:"Tra cứu", icon:"📚", color:"#34d399",
    items:[
      { key:"molecules",  label:"Bảng nguyên tố",  icon:"⬡",  desc:"57 nguyên tố + 3D" },
      { key:"theory",     label:"Lý thuyết",        icon:"📚", desc:"Hóa 8 + Hóa 9" },
      { key:"solubility", label:"Bảng tính tan",    icon:"🧪", desc:"14 cation × 10 anion" },
      { key:"activity",   label:"Dãy HĐ kim loại",  icon:"⚙️", desc:"16 kim loại" },
    ],
  },
  {
    key:"favorites", label:"Yêu thích", icon:"❤️", color:"#f87171",
    items:[
      { key:"favorites", label:"Yêu thích", icon:"❤️", desc:"Phản ứng đã lưu" },
    ],
  },
];

// Desktop dropdown
function Dropdown({ group, page, setPage, onClose }) {
  return (
    <div style={{
      position:"fixed", top:"60px", zIndex:9999,
      background:"var(--bg2)", border:"1px solid var(--border2)",
      borderRadius:"14px", padding:"6px", minWidth:"230px",
      boxShadow:"0 8px 32px rgba(0,0,0,0.5)",
    }}>
      <div style={{
        padding:"6px 10px 5px", fontSize:"0.58rem", color:group.color,
        fontFamily:"var(--mono)", letterSpacing:"0.6px", textTransform:"uppercase",
        borderBottom:"1px solid var(--border)", marginBottom:"4px",
      }}>
        {group.icon} {group.label}
      </div>
      {group.items.map(item => {
        const tc  = TYPES[item.key];
        const col = tc ? tc.color : group.color;
        const sel = page === item.key;
        return (
          <button key={item.key} onClick={() => { setPage(item.key); onClose(); }}
            style={{
              width:"100%", border:"none", cursor:"pointer",
              display:"flex", alignItems:"center", gap:"10px",
              padding:"8px 10px", borderRadius:"8px",
              background: sel ? `${col}15` : "transparent",
              outline: sel ? `1px solid ${col}30` : "none",
              textAlign:"left", transition:"background 0.12s", marginBottom:"2px",
            }}
            onMouseEnter={e => { if (!sel) e.currentTarget.style.background="var(--bg3)"; }}
            onMouseLeave={e => { if (!sel) e.currentTarget.style.background= sel ? `${col}15` : "transparent"; }}
          >
            <div style={{
              width:"28px", height:"28px", borderRadius:"7px",
              background:`${col}18`, border:`1px solid ${col}25`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"0.8rem", flexShrink:0,
            }}>{item.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"0.82rem", fontWeight:sel?600:400, color:sel?col:"var(--text)", fontFamily:"var(--font)" }}>
                {item.label}
              </div>
              <div style={{ fontSize:"0.64rem", color:"var(--text3)", marginTop:"1px" }}>{item.desc}</div>
            </div>
            {sel && <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:col, flexShrink:0 }}/>}
          </button>
        );
      })}
    </div>
  );
}

export default function Navbar({ page, setPage, user, favCount, onLoginClick, onLogout, onLogoClick }) {
  const [open,        setOpen]        = useState(null);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSetPage = (key) => {
    setPage(key);
    setOpen(null);
    setMobileOpen(false);
  };

  const isGroupActive = (group) => group.items.some(i => i.key === page);

  return (
    <nav className="navbar" ref={ref} style={{ padding:"0 1rem" }}>
      {/* Logo */}
      <div className="logo" onClick={() => { setOpen(null); setMobileOpen(false); onLogoClick ? onLogoClick() : setPage("all"); }}>
        <div className="logo-hex">⬡</div>
        <span>ChemViz</span>
      </div>

      {/* Desktop nav */}
      <div className="nav-center nav-desktop" style={{ gap:"2px", overflow:"visible" }}>
        {GROUPS.filter(g => g.key !== "favorites").map(group => {
          const active = isGroupActive(group);
          const isOpen = open === group.key;
          return (
            <div key={group.key} style={{ position:"relative" }}>
              <button
                className={`nav-item ${active ? "active" : ""}`}
                style={{ display:"flex", alignItems:"center", gap:"5px", color:active?group.color:undefined }}
                onClick={() => setOpen(isOpen ? null : group.key)}
              >
                {group.icon} {group.label}
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  style={{ opacity:0.5, transform:isOpen?"rotate(180deg)":"none", transition:"transform 0.2s" }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {isOpen && <Dropdown group={group} page={page} setPage={handleSetPage} onClose={() => setOpen(null)} />}
            </div>
          );
        })}
        <div style={{ width:"1px", height:"16px", background:"var(--border)", alignSelf:"center", margin:"0 4px" }}/>
        <button
          className={`nav-item ${page==="favorites"?"active":""}`}
          onClick={() => handleSetPage("favorites")}
          style={{ display:"flex", alignItems:"center", gap:"4px" }}
        >
          ❤️
          {favCount > 0 && (
            <span style={{ background:"#f87171", color:"white", fontSize:"0.52rem", fontFamily:"var(--mono)", fontWeight:700, padding:"1px 5px", borderRadius:"10px" }}>
              {favCount}
            </span>
          )}
        </button>
      </div>

      {/* Desktop auth */}
      <div className="nav-right nav-desktop">
        {user ? (
          <div className="user-pill">
            <div className="avatar">{user[0].toUpperCase()}</div>
            <span className="user-name">{user}</span>
            <button className="btn-logout" onClick={onLogout}>Đăng xuất</button>
          </div>
        ) : (
          <button className="btn-login" onClick={onLoginClick}>👤 Đăng nhập</button>
        )}
      </div>

      {/* Mobile right: fav + hamburger */}
      <div className="nav-mobile-right">
        {favCount > 0 && (
          <button onClick={() => handleSetPage("favorites")} style={{
            background:"rgba(248,113,113,0.15)", border:"1px solid rgba(248,113,113,0.3)",
            borderRadius:"8px", padding:"6px 10px", cursor:"pointer",
            display:"flex", alignItems:"center", gap:"4px",
            fontSize:"0.75rem", color:"#f87171",
          }}>
            ❤️ <span style={{ fontFamily:"var(--mono)", fontWeight:700, fontSize:"0.7rem" }}>{favCount}</span>
          </button>
        )}
        <button
          onClick={() => setMobileOpen(v => !v)}
          style={{
            background: mobileOpen ? "rgba(56,189,248,0.1)" : "var(--bg3)",
            border:`1px solid ${mobileOpen ? "var(--accent)" : "var(--border)"}`,
            borderRadius:"9px", padding:"8px 10px", cursor:"pointer",
            display:"flex", flexDirection:"column", gap:"4px",
            alignItems:"center", justifyContent:"center",
          }}
        >
          <div style={{ width:"18px", height:"2px", background: mobileOpen ? "var(--accent)" : "var(--text2)", borderRadius:"2px", transition:"all 0.2s", transform: mobileOpen ? "rotate(45deg) translate(3px, 3px)" : "none" }}/>
          <div style={{ width:"18px", height:"2px", background: mobileOpen ? "transparent" : "var(--text2)", borderRadius:"2px", transition:"all 0.2s" }}/>
          <div style={{ width:"18px", height:"2px", background: mobileOpen ? "var(--accent)" : "var(--text2)", borderRadius:"2px", transition:"all 0.2s", transform: mobileOpen ? "rotate(-45deg) translate(3px, -3px)" : "none" }}/>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div style={{
          position:"fixed", top:"60px", left:0, right:0, bottom:0,
          background:"rgba(7,9,15,0.97)", backdropFilter:"blur(12px)",
          zIndex:9998, overflowY:"auto", padding:"1rem",
        }}>
          {GROUPS.map(group => (
            <div key={group.key} style={{ marginBottom:"1.25rem" }}>
              <div style={{
                fontSize:"0.6rem", color:group.color, fontFamily:"var(--mono)",
                letterSpacing:"0.6px", textTransform:"uppercase",
                padding:"0 0.5rem 0.5rem",
                borderBottom:"1px solid var(--border)", marginBottom:"0.5rem",
              }}>
                {group.icon} {group.label}
              </div>
              {group.items.map(item => {
                const tc  = TYPES[item.key];
                const col = tc ? tc.color : group.color;
                const sel = page === item.key;
                return (
                  <button key={item.key} onClick={() => handleSetPage(item.key)}
                    style={{
                      width:"100%", border:"none", cursor:"pointer",
                      display:"flex", alignItems:"center", gap:"12px",
                      padding:"12px 10px", borderRadius:"10px",
                      background: sel ? `${col}15` : "transparent",
                      outline: sel ? `1px solid ${col}30` : "none",
                      textAlign:"left", marginBottom:"4px",
                    }}
                  >
                    <div style={{
                      width:"36px", height:"36px", borderRadius:"9px", flexShrink:0,
                      background:`${col}18`, border:`1px solid ${col}25`,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem",
                    }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize:"0.9rem", fontWeight:sel?600:400, color:sel?col:"var(--text)", fontFamily:"var(--font)" }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize:"0.72rem", color:"var(--text3)", marginTop:"2px" }}>{item.desc}</div>
                    </div>
                    {sel && <div style={{ marginLeft:"auto", width:"7px", height:"7px", borderRadius:"50%", background:col }}/>}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Auth mobile */}
          <div style={{ borderTop:"1px solid var(--border)", paddingTop:"1rem", marginTop:"0.5rem" }}>
            {user ? (
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div className="avatar">{user[0].toUpperCase()}</div>
                <span style={{ color:"var(--text)", fontSize:"0.9rem" }}>{user}</span>
                <button className="btn-logout" onClick={() => { onLogout(); setMobileOpen(false); }} style={{ marginLeft:"auto" }}>
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button className="btn-login" onClick={() => { onLoginClick(); setMobileOpen(false); }} style={{ width:"100%", justifyContent:"center" }}>
                👤 Đăng nhập
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        .nav-desktop { display: flex; }
        .nav-mobile-right { display: none; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-right { display: flex; align-items: center; gap: 8px; margin-left: auto; }
        }
      `}</style>
    </nav>
  );
}