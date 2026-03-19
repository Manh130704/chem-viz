import React, { useState } from "react";
import { TYPES } from "../data/reactions";

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        <div className="skeleton-line short" />
        <div className="skeleton-line" style={{ width:"22%", height:11 }} />
      </div>
      <div className="skeleton-line medium" style={{ height:16 }} />
      <div className="skeleton-line eq" />
      <div className="skeleton-line desc" />
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        <div className="skeleton-line" style={{ width:"30%", height:11 }} />
        <div className="skeleton-line" style={{ width:"22%", height:32, borderRadius:8 }} />
      </div>
    </div>
  );
}

export default function ReactionCard({ reaction, onClick, isFav, onFavToggle, onCompare, compareMode }) {
  const [hov, setHov] = useState(false);
  const tc  = TYPES[reaction.type];
  const fav = isFav(reaction.id);
  const mol3D = reaction.reactants.filter(m => m.mol).length
              + reaction.products.filter(m => m.mol).length;

  return (
    <div
      className="rcard"
      style={{
        borderColor: hov ? `${tc.color}55` : `${tc.color}20`,
        boxShadow: hov ? `0 12px 32px rgba(0,0,0,0.35), 0 0 22px ${tc.color}18` : "none",
        transition: "all 0.22s",
      }}
      onClick={() => onClick(reaction)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Top color bar */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:"2px",
        background:`linear-gradient(90deg,${tc.color},${tc.color}00)`,
        opacity: hov ? 1 : 0, transition:"opacity 0.22s",
        borderRadius:"13px 13px 0 0",
      }}/>

      {/* Top row: type badge + energy + ❤️ */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.5rem" }}>
        <span className="rtype" style={{
          background:`${tc.color}14`, color:tc.color, border:`1px solid ${tc.color}28`,
        }}>
          {tc.icon} {tc.label}
        </span>
        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          <span style={{ fontSize:"0.72rem", color: reaction.energy==="toa" ? "#fb923c" : "#38bdf8" }}>
            {reaction.energy==="toa" ? "🔥" : "❄️"} {reaction.energyLabel}
          </span>
          {/* Nút yêu thích */}
          <button
            title={fav ? "Bỏ yêu thích" : "Lưu yêu thích"}
            onClick={(e) => { e.stopPropagation(); onFavToggle(reaction); }}
            style={{
              background: fav ? "rgba(248,113,113,0.15)" : "rgba(255,255,255,0.05)",
              border: fav ? "1px solid rgba(248,113,113,0.4)" : "1px solid var(--border)",
              borderRadius:"6px", width:"28px", height:"28px",
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor:"pointer", fontSize:"0.85rem", transition:"all 0.18s",
              flexShrink:0,
            }}
          >
            {fav ? "❤️" : "🤍"}
          </button>
        </div>
      </div>

      {/* Tên */}
      <div className="rname">{reaction.name}</div>

      {/* Phương trình */}
      <div className="req" style={{ color: tc.color }}>{reaction.equation}</div>

      {/* Pill phân tử */}
      <div style={{ display:"flex", gap:"4px", flexWrap:"wrap", marginBottom:"0.55rem" }}>
        {reaction.reactants.map((m, i) => (
          <span key={i} style={{
            fontSize:"0.63rem", fontFamily:"var(--mono)",
            color:m.color, background:`${m.color}10`,
            border:`1px solid ${m.color}22`,
            padding:"2px 6px", borderRadius:"4px",
            display:"flex", alignItems:"center", gap:"3px",
          }}>
            {m.mol && <span style={{ color:"#34d399", fontSize:"0.5rem" }}>⬡</span>}
            {m.label}
          </span>
        ))}
        <span style={{ color:"var(--text3)", fontSize:"0.82rem" }}>→</span>
        {reaction.products.map((m, i) => (
          <span key={i} style={{
            fontSize:"0.63rem", fontFamily:"var(--mono)",
            color:m.color, background:`${m.color}10`,
            border:`1px solid ${m.color}22`,
            padding:"2px 6px", borderRadius:"4px",
            display:"flex", alignItems:"center", gap:"3px",
          }}>
            {m.mol && <span style={{ color:"#34d399", fontSize:"0.5rem" }}>⬡</span>}
            {m.label}
          </span>
        ))}
      </div>

      {/* Mô tả */}
      <div className="rdesc">{reaction.desc}</div>

      {/* Timeline chip nếu có */}
      {reaction.year && (
        <div style={{
          display:"flex", alignItems:"center", gap:"6px", marginBottom:"0.6rem",
          fontSize:"0.68rem", color:"var(--text3)", fontFamily:"var(--mono)",
        }}>
          <span style={{
            background:"rgba(56,189,248,0.08)", border:"1px solid rgba(56,189,248,0.2)",
            color:"var(--accent)", padding:"2px 7px", borderRadius:"4px",
          }}>
            📅 {reaction.year}
          </span>
          {reaction.scientist && <span>{reaction.scientist}</span>}
        </div>
      )}

      {/* Footer */}
      <div className="rfoot">
        <span className="rcond">⚡ {reaction.condition}</span>
        <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
          {mol3D > 0 && (
            <span style={{
              fontSize:"0.6rem", fontFamily:"var(--mono)",
              color:"#34d399", background:"rgba(52,211,153,0.1)",
              border:"1px solid rgba(52,211,153,0.22)",
              padding:"3px 6px", borderRadius:"4px",
            }}>⬡ {mol3D}</span>
          )}
          {/* Nút so sánh */}
          {onCompare && (
            <button
              title={compareMode ? "Đang so sánh..." : "So sánh phản ứng này"}
              onClick={(e) => { e.stopPropagation(); onCompare(reaction); }}
              style={{
                background: compareMode ? "rgba(129,140,248,0.15)" : "rgba(0,0,0,0.2)",
                border: compareMode ? "1px solid rgba(129,140,248,0.5)" : "1px solid var(--border)",
                color: compareMode ? "#818cf8" : "var(--text3)",
                borderRadius:"7px", padding:"6px 10px", fontSize:"0.75rem",
                cursor:"pointer", transition:"all 0.18s", minHeight:"32px",
              }}
            >
              ⇄
            </button>
          )}
          <button
            className="btn-view"
            style={{
              color:tc.color, borderColor:`${tc.color}40`,
              background: hov ? `${tc.color}12` : "rgba(0,0,0,0.22)",
            }}
            onClick={(e) => { e.stopPropagation(); onClick(reaction); }}
          >
            ▶ Xem
          </button>
        </div>
      </div>
    </div>
  );
}