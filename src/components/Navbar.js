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
      { key:"balance",  label:"Cân bằng PT", icon:"⚖️", desc:"Tự động cân bằng phương trình" },
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
];

export default function Navbar({ page, setPage, user, favCount, onLoginClick, onLogout, onLogoClick }) {
  const [open, setOpen] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSetPage = (key) => {
    setOpen(null);
    setPage(key);
  };

  const isGroupActive = (group) => group.items.some(i => i.key === page);

  return (
    <nav className="navbar" ref={ref}>
      {/* Logo */}
      <div
        className="logo"
        onClick={() => { setOpen(null); onLogoClick ? onLogoClick() : setPage("all"); }}
      >
        <div className="logo-hex">⬡</div>
        ChemViz
      </div>

      {/* Center nav */}
      <div className="nav-center" style={{ gap:"2px", overflow:"visible" }}>

        {GROUPS.map(group => {
          const active = isGroupActive(group);
          const isOpen = open === group.key;

          return (
            <div key={group.key} style={{ position:"relative" }}>

              {/* Trigger button */}
              <button
                className={`nav-item ${active ? "active" : ""}`}
                style={{
                  display:"flex", alignItems:"center", gap:"5px",
                  color: active ? group.color : undefined,
                }}
                onClick={() => setOpen(isOpen ? null : group.key)}
              >
                {group.icon} {group.label}
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  style={{ opacity:0.5, transform: isOpen ? "rotate(180deg)" : "none", transition:"transform 0.2s" }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {/* Dropdown */}
              {isOpen && (
                <div style={{
                  position:"fixed",
                  top:"60px",
                  left:"auto",
                  zIndex:9999,
                  background:"var(--bg2)",
                  border:"1px solid var(--border2)",
                  borderRadius:"14px",
                  padding:"6px",
                  minWidth:"230px",
                  boxShadow:"0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
                }}>
                  {/* Label */}
                  <div style={{
                    padding:"6px 10px 5px",
                    fontSize:"0.58rem", color:group.color,
                    fontFamily:"var(--mono)", letterSpacing:"0.6px",
                    textTransform:"uppercase",
                    borderBottom:"1px solid var(--border)",
                    marginBottom:"4px",
                  }}>
                    {group.icon} {group.label}
                  </div>

                  {/* Items */}
                  {group.items.map(item => {
                    const tc  = TYPES[item.key];
                    const col = tc ? tc.color : group.color;
                    const sel = page === item.key;

                    return (
                      <button
                        key={item.key}
                        onClick={() => handleSetPage(item.key)}
                        style={{
                          width:"100%", border:"none", cursor:"pointer",
                          display:"flex", alignItems:"center", gap:"10px",
                          padding:"8px 10px", borderRadius:"8px",
                          background: sel ? `${col}15` : "transparent",
                          outline: sel ? `1px solid ${col}30` : "none",
                          textAlign:"left", transition:"background 0.12s",
                          marginBottom:"2px",
                        }}
                        onMouseEnter={e => { if (!sel) e.currentTarget.style.background = "var(--bg3)"; }}
                        onMouseLeave={e => { if (!sel) e.currentTarget.style.background = "transparent"; }}
                      >
                        <div style={{
                          width:"28px", height:"28px", borderRadius:"7px",
                          background:`${col}18`, border:`1px solid ${col}25`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:"0.8rem", flexShrink:0,
                        }}>
                          {item.icon}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{
                            fontSize:"0.82rem",
                            fontWeight: sel ? 600 : 400,
                            color: sel ? col : "var(--text)",
                            fontFamily:"var(--font)",
                          }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize:"0.64rem", color:"var(--text3)", marginTop:"1px" }}>
                            {item.desc}
                          </div>
                        </div>
                        {sel && (
                          <div style={{
                            width:"6px", height:"6px", borderRadius:"50%",
                            background:col, flexShrink:0,
                          }}/>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Divider */}
        <div style={{
          width:"1px", height:"16px",
          background:"var(--border)",
          alignSelf:"center", margin:"0 4px", flexShrink:0,
        }}/>

        {/* Yêu thích */}
        <button
          className={`nav-item ${page === "favorites" ? "active" : ""}`}
          onClick={() => handleSetPage("favorites")}
          style={{ display:"flex", alignItems:"center", gap:"4px" }}
        >
          ❤️ Yêu thích
          {favCount > 0 && (
            <span style={{
              background:"#f87171", color:"white",
              fontSize:"0.52rem", fontFamily:"var(--mono)", fontWeight:700,
              padding:"1px 5px", borderRadius:"10px", lineHeight:1.4,
            }}>
              {favCount}
            </span>
          )}
        </button>
      </div>

      {/* Right */}
      <div className="nav-right">
        {user ? (
          <div className="user-pill">
            <div className="avatar">{user[0].toUpperCase()}</div>
            <span className="user-name">{user}</span>
            <button className="btn-logout" onClick={onLogout}>Đăng xuất</button>
          </div>
        ) : (
          <button className="btn-login" onClick={onLoginClick}>
            👤 Đăng nhập
          </button>
        )}
      </div>
    </nav>
  );
}