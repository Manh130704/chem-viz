import React from "react";
import { TYPES } from "../data/reactions";

function Col({ reaction, onClose, onView }) {
  const tc = TYPES[reaction.type];
  const mol3D = [...reaction.reactants, ...reaction.products].filter(m => m.mol).length;

  return (
    <div style={{
      flex:1, background:"var(--bg2)",
      border:`1px solid ${tc.color}30`,
      borderRadius:"14px", overflow:"hidden",
      display:"flex", flexDirection:"column",
    }}>
      {/* Header */}
      <div style={{
        padding:"1rem 1.1rem 0.8rem",
        borderBottom:"1px solid var(--border)",
        background:`linear-gradient(135deg,${tc.color}08,transparent)`,
      }}>
        <div style={{ fontSize:"0.65rem", color:tc.color, fontFamily:"var(--mono)", marginBottom:"4px" }}>
          {tc.icon} {tc.label}
        </div>
        <div style={{ fontSize:"1rem", fontWeight:700, marginBottom:"4px" }}>{reaction.name}</div>
        <div style={{
          fontFamily:"var(--mono)", fontSize:"0.75rem", color:tc.color,
          background:`${tc.color}10`, border:`1px solid ${tc.color}20`,
          padding:"5px 9px", borderRadius:"6px",
        }}>
          {reaction.equation}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:"1rem 1.1rem", flex:1, display:"flex", flexDirection:"column", gap:"0.65rem" }}>

        {/* Chất tham gia */}
        <div>
          <div style={{ fontSize:"0.6rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"5px", textTransform:"uppercase" }}>
            Chất tham gia
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
            {reaction.reactants.map((m, i) => (
              <span key={i} style={{
                fontSize:"0.7rem", fontFamily:"var(--mono)",
                color:m.color, background:`${m.color}12`,
                border:`1px solid ${m.color}25`,
                padding:"3px 8px", borderRadius:"5px",
              }}>{m.label}</span>
            ))}
          </div>
        </div>

        {/* Sản phẩm */}
        <div>
          <div style={{ fontSize:"0.6rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"5px", textTransform:"uppercase" }}>
            Sản phẩm
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
            {reaction.products.map((m, i) => (
              <span key={i} style={{
                fontSize:"0.7rem", fontFamily:"var(--mono)",
                color:m.color, background:`${m.color}12`,
                border:`1px solid ${m.color}25`,
                padding:"3px 8px", borderRadius:"5px",
              }}>{m.label}</span>
            ))}
          </div>
        </div>

        {/* Chi tiết */}
        {[
          ["Điều kiện",   reaction.condition],
          ["Năng lượng",  reaction.energyLabel],
          ["Loại p.ứng",  tc.label],
          ...(reaction.year ? [["Năm phát hiện", reaction.year]] : []),
          ...(reaction.scientist ? [["Nhà KH", reaction.scientist]] : []),
          ...(reaction.application ? [["Ứng dụng", reaction.application]] : []),
        ].map(([lbl, val]) => (
          <div key={lbl} style={{
            display:"flex", gap:"8px",
            background:"var(--bg3)", border:"1px solid var(--border)",
            borderRadius:"7px", padding:"7px 10px",
          }}>
            <span style={{ fontSize:"0.62rem", color:"var(--text3)", fontFamily:"var(--mono)", minWidth:"80px", textTransform:"uppercase", paddingTop:"1px" }}>
              {lbl}
            </span>
            <span style={{ fontSize:"0.78rem", color:"var(--text)", fontWeight:500 }}>{val}</span>
          </div>
        ))}

        {/* Mô tả */}
        <div style={{ fontSize:"0.78rem", color:"var(--text2)", lineHeight:1.65 }}>
          {reaction.desc}
        </div>

        {/* Mô hình 3D */}
        {mol3D > 0 && (
          <div style={{
            fontSize:"0.7rem", color:"#34d399",
            background:"rgba(52,211,153,0.08)",
            border:"1px solid rgba(52,211,153,0.2)",
            borderRadius:"7px", padding:"6px 10px",
          }}>
            ⬡ {mol3D} mô hình 3D có sẵn
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding:"0.8rem 1.1rem", borderTop:"1px solid var(--border)" }}>
        <button
          onClick={() => onView(reaction)}
          style={{
            width:"100%", background:`linear-gradient(135deg,${tc.color},${tc.color}aa)`,
            border:"none", color:"white", fontFamily:"var(--font)",
            fontSize:"0.84rem", fontWeight:600, padding:"9px",
            borderRadius:"9px", cursor:"pointer",
          }}
        >
          ▶ Mở chi tiết
        </button>
      </div>
    </div>
  );
}

export default function CompareModal({ reactions, onClose, onView }) {
  const [a, b] = reactions;

  return (
    <div
      style={{
        position:"fixed", inset:0,
        background:"rgba(7,9,15,0.92)",
        backdropFilter:"blur(12px)",
        zIndex:350,
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"1rem",
        animation:"fadeIn 0.18s ease",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width:"100%", maxWidth:"780px", maxHeight:"90vh",
        display:"flex", flexDirection:"column", gap:"0",
        animation:"slideUp 0.22s ease",
      }}>
        {/* Header */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0.9rem 1rem", background:"var(--bg2)",
          borderRadius:"14px 14px 0 0",
          border:"1px solid var(--border2)", borderBottom:"none",
        }}>
          <div style={{ fontFamily:"var(--mono)", fontSize:"0.78rem", color:"var(--accent)" }}>
            ⇄ SO SÁNH PHẢN ỨNG
          </div>
          <button className="btn-x" style={{ position:"static" }} onClick={onClose}>✕</button>
        </div>

        {/* Two columns */}
        <div style={{
          display:"flex", gap:"0.75rem",
          background:"var(--bg)", padding:"1rem",
          borderRadius:"0 0 14px 14px",
          border:"1px solid var(--border2)", borderTop:"none",
          overflowY:"auto", maxHeight:"80vh",
        }}>
          <Col reaction={a} onClose={onClose} onView={(r) => { onClose(); onView(r); }} />

          {/* VS divider */}
          <div style={{
            display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", gap:"8px", flexShrink:0,
          }}>
            <div style={{
              fontFamily:"var(--mono)", fontSize:"0.75rem", fontWeight:700,
              color:"var(--text3)", background:"var(--bg3)",
              border:"1px solid var(--border)", borderRadius:"20px",
              padding:"6px 10px",
            }}>VS</div>
          </div>

          <Col reaction={b} onClose={onClose} onView={(r) => { onClose(); onView(r); }} />
        </div>
      </div>
    </div>
  );
}