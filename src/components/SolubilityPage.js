import React, { useState } from "react";

// Bảng tính tan: [cation][anion] → "T"=tan, "K"=không tan, "I"=ít tan, "-"=không tồn tại/phân hủy
const CATIONS = [
  { id:"H",   label:"H⁺",    color:"#38bdf8" },
  { id:"Na",  label:"Na⁺",   color:"#fb923c" },
  { id:"K",   label:"K⁺",    color:"#fb923c" },
  { id:"NH4", label:"NH₄⁺",  color:"#a78bfa" },
  { id:"Ba",  label:"Ba²⁺",  color:"#fbbf24" },
  { id:"Ca",  label:"Ca²⁺",  color:"#fbbf24" },
  { id:"Mg",  label:"Mg²⁺",  color:"#94a3b8" },
  { id:"Al",  label:"Al³⁺",  color:"#94a3b8" },
  { id:"Fe2", label:"Fe²⁺",  color:"#fb923c" },
  { id:"Fe3", label:"Fe³⁺",  color:"#fb923c" },
  { id:"Cu",  label:"Cu²⁺",  color:"#fb923c" },
  { id:"Zn",  label:"Zn²⁺",  color:"#94a3b8" },
  { id:"Ag",  label:"Ag⁺",   color:"#e2e8f0" },
  { id:"Pb",  label:"Pb²⁺",  color:"#94a3b8" },
];

const ANIONS = [
  { id:"OH",   label:"OH⁻",   color:"#34d399" },
  { id:"Cl",   label:"Cl⁻",   color:"#a78bfa" },
  { id:"Br",   label:"Br⁻",   color:"#a78bfa" },
  { id:"I",    label:"I⁻",    color:"#a78bfa" },
  { id:"SO4",  label:"SO₄²⁻", color:"#f87171" },
  { id:"NO3",  label:"NO₃⁻",  color:"#38bdf8" },
  { id:"CO3",  label:"CO₃²⁻", color:"#fbbf24" },
  { id:"PO4",  label:"PO₄³⁻", color:"#fbbf24" },
  { id:"S",    label:"S²⁻",   color:"#fbbf24" },
  { id:"SO3",  label:"SO₃²⁻", color:"#fb923c" },
];

// Dữ liệu tính tan
const DATA = {
  H:   { OH:"-", Cl:"T", Br:"T", I:"T", SO4:"T", NO3:"T", CO3:"-", PO4:"-",   S:"-",  SO3:"-"  },
  Na:  { OH:"T", Cl:"T", Br:"T", I:"T", SO4:"T", NO3:"T", CO3:"T", PO4:"T",   S:"T",  SO3:"T"  },
  K:   { OH:"T", Cl:"T", Br:"T", I:"T", SO4:"T", NO3:"T", CO3:"T", PO4:"T",   S:"T",  SO3:"T"  },
  NH4: { OH:"T", Cl:"T", Br:"T", I:"T", SO4:"T", NO3:"T", CO3:"T", PO4:"T",   S:"T",  SO3:"T"  },
  Ba:  { OH:"T", Cl:"T", Br:"T", I:"T", SO4:"K", NO3:"T", CO3:"K", PO4:"K",   S:"-",  SO3:"K"  },
  Ca:  { OH:"I", Cl:"T", Br:"T", I:"T", SO4:"I", NO3:"T", CO3:"K", PO4:"K",   S:"-",  SO3:"K"  },
  Mg:  { OH:"K", Cl:"T", Br:"T", I:"T", SO4:"T", NO3:"T", CO3:"K", PO4:"K",   S:"-",  SO3:"K"  },
  Al:  { OH:"K", Cl:"T", Br:"T", I:"T", SO4:"T", NO3:"T", CO3:"-", PO4:"K",   S:"-",  SO3:"-"  },
  Fe2: { OH:"K", Cl:"T", Br:"T", I:"T", SO4:"T", NO3:"T", CO3:"K", PO4:"K",   S:"K",  SO3:"K"  },
  Fe3: { OH:"K", Cl:"T", Br:"T", I:"-", SO4:"T", NO3:"T", CO3:"-", PO4:"K",   S:"-",  SO3:"-"  },
  Cu:  { OH:"K", Cl:"T", Br:"T", I:"-", SO4:"T", NO3:"T", CO3:"K", PO4:"K",   S:"K",  SO3:"K"  },
  Zn:  { OH:"K", Cl:"T", Br:"T", I:"T", SO4:"T", NO3:"T", CO3:"K", PO4:"K",   S:"K",  SO3:"K"  },
  Ag:  { OH:"-", Cl:"K", Br:"K", I:"K", SO4:"I", NO3:"T", CO3:"K", PO4:"K",   S:"K",  SO3:"K"  },
  Pb:  { OH:"K", Cl:"I", Br:"K", I:"K", SO4:"K", NO3:"T", CO3:"K", PO4:"K",   S:"K",  SO3:"K"  },
};

const CELL_CONFIG = {
  "T": { bg:"rgba(52,211,153,0.15)", border:"rgba(52,211,153,0.4)",  color:"#34d399", label:"Tan"          },
  "K": { bg:"rgba(248,113,113,0.15)",border:"rgba(248,113,113,0.4)", color:"#f87171", label:"Không tan"     },
  "I": { bg:"rgba(251,191,36,0.15)", border:"rgba(251,191,36,0.4)",  color:"#fbbf24", label:"Ít tan"        },
  "-": { bg:"rgba(100,116,139,0.08)",border:"rgba(100,116,139,0.15)",color:"#64748b", label:"Không tồn tại" },
};

export default function SolubilityPage() {
  const [hover, setHover] = useState({ row:null, col:null });
  const [filter, setFilter] = useState("all");

  const isHovered = (ri, ci) => hover.row === ri || hover.col === ci;
  const isActive  = (ri, ci) => hover.row === ri && hover.col === ci;

  const filteredCols = filter === "all"
    ? ANIONS
    : ANIONS.filter(a => {
        return CATIONS.some(c => DATA[c.id]?.[a.id] === filter);
      });

  return (
    <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"0 1rem 4rem" }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"2rem 1rem 1.5rem" }}>
        <div className="hero-tag">🧪 Tra cứu</div>
        <h1 style={{
          fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:700, marginTop:"0.5rem",
          background:"linear-gradient(135deg,#fff,#34d399)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        }}>
          Bảng tính tan
        </h1>
        <p style={{ color:"var(--text2)", fontSize:"0.85rem", marginTop:"0.4rem" }}>
          Di chuột vào ô để xem tên chất · Lọc theo trạng thái tan
        </p>
      </div>

      {/* Legend + Filter */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        flexWrap:"wrap", gap:"0.75rem", marginBottom:"1.25rem",
        padding:"0 0.5rem",
      }}>
        {/* Legend */}
        <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
          {Object.entries(CELL_CONFIG).map(([k, v]) => (
            <div key={k} style={{
              display:"flex", alignItems:"center", gap:"5px",
              fontSize:"0.72rem", color:v.color,
            }}>
              <div style={{
                width:"16px", height:"16px", borderRadius:"4px",
                background:v.bg, border:`1px solid ${v.border}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"0.55rem", fontWeight:700,
              }}>{k}</div>
              {v.label}
            </div>
          ))}
        </div>
        {/* Filter */}
        <div style={{ display:"flex", gap:"5px" }}>
          {[{v:"all",l:"Tất cả"},{v:"T",l:"Chỉ tan"},{v:"K",l:"Chỉ không tan"},{v:"I",l:"Ít tan"}].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v)} style={{
              padding:"5px 12px", borderRadius:"6px", cursor:"pointer",
              fontFamily:"var(--font)", fontSize:"0.74rem", transition:"all 0.15s",
              background: filter===f.v ? "rgba(56,189,248,0.15)" : "var(--bg3)",
              border: filter===f.v ? "1px solid var(--accent)" : "1px solid var(--border)",
              color: filter===f.v ? "var(--accent)" : "var(--text3)",
            }}>{f.l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX:"auto", borderRadius:"14px", border:"1px solid var(--border2)" }}>
        <table style={{ borderCollapse:"collapse", width:"100%", minWidth:"680px" }}>
          <thead>
            <tr>
              {/* Corner */}
              <th style={{
                padding:"0.7rem 0.9rem", background:"var(--bg2)",
                borderBottom:"1px solid var(--border)", borderRight:"1px solid var(--border)",
                fontSize:"0.6rem", color:"var(--text3)", fontFamily:"var(--mono)",
                textAlign:"center", position:"sticky", left:0, zIndex:2,
              }}>
                Cation ↓<br/>Anion →
              </th>
              {filteredCols.map((a, ci) => (
                <th key={a.id} style={{
                  padding:"0.6rem 0.5rem", background:"var(--bg2)",
                  borderBottom:"1px solid var(--border)",
                  borderRight:"1px solid var(--border)",
                  fontSize:"0.72rem", fontFamily:"var(--mono)", fontWeight:700,
                  color: hover.col===ci ? a.color : "var(--text2)",
                  textAlign:"center", whiteSpace:"nowrap", transition:"color 0.15s",
                  minWidth:"60px",
                }}>
                  {a.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CATIONS.map((c, ri) => (
              <tr key={c.id}>
                {/* Row header */}
                <td style={{
                  padding:"0.55rem 0.9rem",
                  background: hover.row===ri ? "var(--bg3)" : "var(--bg2)",
                  borderBottom:"1px solid var(--border)", borderRight:"1px solid var(--border)",
                  fontSize:"0.72rem", fontFamily:"var(--mono)", fontWeight:700,
                  color: hover.row===ri ? c.color : "var(--text2)",
                  textAlign:"center", whiteSpace:"nowrap",
                  transition:"all 0.15s", position:"sticky", left:0, zIndex:1,
                }}>
                  {c.label}
                </td>
                {filteredCols.map((a, ci) => {
                  const val = DATA[c.id]?.[a.id] || "-";
                  const cfg = CELL_CONFIG[val];
                  const active = isActive(ri, ci);
                  const hl = isHovered(ri, ci);
                  return (
                    <td key={a.id}
                      onMouseEnter={() => setHover({ row:ri, col:ci })}
                      onMouseLeave={() => setHover({ row:null, col:null })}
                      style={{
                        padding:"0.45rem 0.35rem", textAlign:"center",
                        borderBottom:"1px solid var(--border)", borderRight:"1px solid var(--border)",
                        background: active ? cfg.bg : hl ? `${cfg.bg}` : "var(--bg)",
                        cursor:"default", transition:"background 0.12s",
                        position:"relative",
                      }}
                    >
                      <div style={{
                        display:"inline-flex", alignItems:"center", justifyContent:"center",
                        width:"32px", height:"32px", borderRadius:"7px",
                        background: hl ? cfg.bg : "transparent",
                        border: hl ? `1px solid ${cfg.border}` : "1px solid transparent",
                        fontSize:"0.75rem", fontWeight:700, color:cfg.color,
                        transition:"all 0.12s",
                        transform: active ? "scale(1.15)" : "scale(1)",
                      }}>
                        {val}
                      </div>
                      {/* Tooltip khi hover chính xác ô đó */}
                      {active && (
                        <div style={{
                          position:"absolute", bottom:"calc(100% + 5px)", left:"50%",
                          transform:"translateX(-50%)",
                          background:"var(--bg2)", border:`1px solid ${cfg.border}`,
                          borderRadius:"8px", padding:"5px 10px",
                          fontSize:"0.68rem", color:cfg.color, whiteSpace:"nowrap",
                          zIndex:10, boxShadow:"0 4px 12px rgba(0,0,0,0.4)",
                          fontFamily:"var(--mono)",
                          pointerEvents:"none",
                        }}>
                          {c.label.replace("⁺","").replace("²⁺","").replace("³⁺","").replace("⁻","")}{a.id === "OH" ? "(OH)" : a.id === "SO4" ? "SO₄" : a.label.replace("²⁻","").replace("³⁻","").replace("⁻","")} — {cfg.label}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note */}
      <div style={{
        marginTop:"1rem", padding:"0.85rem 1.1rem",
        background:"var(--bg2)", border:"1px solid var(--border)",
        borderRadius:"10px", fontSize:"0.75rem", color:"var(--text3)", lineHeight:1.7,
        display:"flex", gap:"1.5rem", flexWrap:"wrap",
      }}>
        <span>💡 <strong style={{ color:"var(--text2)" }}>Mẹo:</strong> Di chuột vào ô để xem tên muối</span>
        <span>📌 Muối của Na⁺, K⁺, NH₄⁺, NO₃⁻ đều <strong style={{ color:"#34d399" }}>tan</strong></span>
        <span>📌 Muối sunfat (SO₄²⁻) đa số tan, trừ BaSO₄, PbSO₄ <strong style={{ color:"#f87171" }}>không tan</strong></span>
        <span>📌 Muối cacbonat (CO₃²⁻) đa số <strong style={{ color:"#f87171" }}>không tan</strong></span>
      </div>
    </div>
  );
}