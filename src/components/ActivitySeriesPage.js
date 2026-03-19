import React, { useState } from "react";

const METALS = [
  { symbol:"K",  name:"Kali",     M:39,   color:"#fb923c", react_water:true,  react_acid:true,  react_salt:false, note:"Phản ứng mãnh liệt với nước, bốc cháy" },
  { symbol:"Na", name:"Natri",    M:23,   color:"#fb923c", react_water:true,  react_acid:true,  react_salt:false, note:"Phản ứng với nước, chạy trên mặt nước" },
  { symbol:"Ca", name:"Canxi",    M:40,   color:"#fbbf24", react_water:true,  react_acid:true,  react_salt:false, note:"Tan từ từ trong nước tạo Ca(OH)₂" },
  { symbol:"Mg", name:"Magie",    M:24,   color:"#94a3b8", react_water:false, react_acid:true,  react_salt:true,  note:"Tan chậm trong nước nóng, cháy sáng trắng" },
  { symbol:"Al", name:"Nhôm",     M:27,   color:"#94a3b8", react_water:false, react_acid:true,  react_salt:true,  note:"Thụ động với H₂SO₄ đặc nguội, HNO₃ đặc nguội" },
  { symbol:"Zn", name:"Kẽm",      M:65,   color:"#94a3b8", react_water:false, react_acid:true,  react_salt:true,  note:"Tan trong axit và NaOH (lưỡng tính)" },
  { symbol:"Fe", name:"Sắt",      M:56,   color:"#94a3b8", react_water:false, react_acid:true,  react_salt:true,  note:"Fe + HCl → FeCl₂ (Fe²⁺); Fe + Cl₂ → FeCl₃ (Fe³⁺)" },
  { symbol:"Ni", name:"Niken",    M:58,   color:"#94a3b8", react_water:false, react_acid:true,  react_salt:true,  note:"Hoạt động trung bình" },
  { symbol:"Sn", name:"Thiếc",    M:119,  color:"#94a3b8", react_water:false, react_acid:true,  react_salt:true,  note:"Dùng tráng bề mặt thép (hộp thiếc)" },
  { symbol:"Pb", name:"Chì",      M:207,  color:"#94a3b8", react_water:false, react_acid:true,  react_salt:true,  note:"Độc, dùng trong ắc quy" },
  { symbol:"H",  name:"Hiđro",    M:1,    color:"#38bdf8", react_water:false, react_acid:false, react_salt:false, note:"Mốc phân chia: KL trước H đẩy được H₂ từ axit" },
  { symbol:"Cu", name:"Đồng",     M:64,   color:"#fb923c", react_water:false, react_acid:false, react_salt:true,  note:"Không tan trong axit loãng, tan trong H₂SO₄ đặc nóng" },
  { symbol:"Hg", name:"Thủy ngân",M:201,  color:"#94a3b8", react_water:false, react_acid:false, react_salt:true,  note:"Kim loại lỏng duy nhất ở nhiệt độ thường" },
  { symbol:"Ag", name:"Bạc",      M:108,  color:"#e2e8f0", react_water:false, react_acid:false, react_salt:false, note:"Dẫn điện tốt nhất, dùng trong trang sức" },
  { symbol:"Pt", name:"Platin",   M:195,  color:"#e2e8f0", react_water:false, react_acid:false, react_salt:false, note:"Xúc tác, bền hóa học cao" },
  { symbol:"Au", name:"Vàng",     M:197,  color:"#fbbf24", react_water:false, react_acid:false, react_salt:false, note:"Không tác dụng với axit thông thường, chỉ tan trong cường toan" },
];

const REACTIONS = [
  {
    title:"Kim loại + Nước → Bazơ + H₂↑",
    color:"#38bdf8",
    desc:"Chỉ các kim loại mạnh (K, Na, Ca, Ba) tác dụng được với nước ở nhiệt độ thường.",
    examples:[
      "2Na + 2H₂O → 2NaOH + H₂↑",
      "Ca + 2H₂O → Ca(OH)₂ + H₂↑",
      "2K + 2H₂O → 2KOH + H₂↑",
    ],
  },
  {
    title:"Kim loại + Axit loãng → Muối + H₂↑",
    color:"#f87171",
    desc:"Kim loại đứng trước H trong dãy hoạt động mới đẩy được H₂ ra khỏi axit loãng (HCl, H₂SO₄ loãng).",
    examples:[
      "Fe + 2HCl → FeCl₂ + H₂↑",
      "Zn + H₂SO₄ → ZnSO₄ + H₂↑",
      "2Al + 3H₂SO₄ → Al₂(SO₄)₃ + 3H₂↑",
    ],
  },
  {
    title:"Kim loại + Dung dịch muối → Muối mới + Kim loại mới",
    color:"#34d399",
    desc:"Kim loại A đứng trước kim loại B (trong dãy HĐ) thì đẩy B ra khỏi dung dịch muối của B. Điều kiện: muối B tan, kim loại A không tác dụng với nước.",
    examples:[
      "Fe + CuSO₄ → FeSO₄ + Cu↓",
      "Cu + 2AgNO₃ → Cu(NO₃)₂ + 2Ag↓",
      "Zn + FeSO₄ → ZnSO₄ + Fe↓",
    ],
  },
];

export default function ActivitySeriesPage() {
  const [selected, setSelected]  = useState(null);
  const [compare,  setCompare]   = useState(null);
  const [showInfo, setShowInfo]  = useState("series");

  const sel  = selected ? METALS.find(m => m.symbol === selected)  : null;
  const comp = compare  ? METALS.find(m => m.symbol === compare)   : null;

  const canDisplace = (a, b) => {
    if (!a || !b || a.symbol === b.symbol) return null;
    const iA = METALS.findIndex(m => m.symbol === a.symbol);
    const iB = METALS.findIndex(m => m.symbol === b.symbol);
    if (b.symbol === "H") return { result: iA < 11, desc: iA < 11 ? `${a.symbol} đẩy được H₂ từ axit` : `${a.symbol} không đẩy được H₂` };
    if (iA < iB) return { result: true,  desc:`${a.symbol} đứng trước ${b.symbol} → ${a.symbol} đẩy được ${b.symbol} khỏi dung dịch muối` };
    return { result: false, desc:`${a.symbol} đứng sau ${b.symbol} → không đẩy được` };
  };

  const displacement = selected && compare ? canDisplace(sel, comp) : null;

  return (
    <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"0 1.5rem 4rem" }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"2rem 1rem 1.5rem" }}>
        <div className="hero-tag">⚙️ Tra cứu</div>
        <h1 style={{
          fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:700, marginTop:"0.5rem",
          background:"linear-gradient(135deg,#fff,#94a3b8)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        }}>
          Dãy hoạt động hóa học kim loại
        </h1>
        <p style={{ color:"var(--text2)", fontSize:"0.85rem", marginTop:"0.4rem" }}>
          Click một kim loại để xem chi tiết · Chọn 2 kim loại để so sánh khả năng đẩy nhau
        </p>
      </div>

      {/* Tab */}
      <div style={{ display:"flex", gap:"5px", justifyContent:"center", marginBottom:"1.5rem" }}>
        {[
          { k:"series",   l:"📊 Dãy hoạt động" },
          { k:"reactions",l:"⚗️ Các phản ứng" },
          { k:"rules",    l:"📌 Quy tắc" },
        ].map(t => (
          <button key={t.k} onClick={() => setShowInfo(t.k)} style={{
            padding:"7px 16px", borderRadius:"8px", cursor:"pointer",
            fontFamily:"var(--font)", fontSize:"0.8rem", transition:"all 0.18s",
            background: showInfo===t.k ? "rgba(148,163,184,0.15)" : "var(--bg3)",
            border: showInfo===t.k ? "1px solid #94a3b8" : "1px solid var(--border)",
            color: showInfo===t.k ? "#94a3b8" : "var(--text3)",
            fontWeight: showInfo===t.k ? 600 : 400,
          }}>{t.l}</button>
        ))}
      </div>

      {/* ── SERIES VIEW ── */}
      {showInfo === "series" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:"1.25rem", alignItems:"start" }}>

          {/* Left: Dãy */}
          <div style={{
            background:"var(--bg2)", border:"1px solid var(--border2)",
            borderRadius:"16px", overflow:"hidden",
          }}>
            <div style={{
              padding:"0.75rem 1.1rem", borderBottom:"1px solid var(--border)",
              fontSize:"0.62rem", color:"var(--text3)", fontFamily:"var(--mono)",
              letterSpacing:"0.5px",
            }}>
              ← HOẠT ĐỘNG MẠNH HƠN &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; HOẠT ĐỘNG YẾU HƠN →
            </div>
            <div style={{ padding:"0.75rem" }}>
              {METALS.map((m, i) => {
                const isH    = m.symbol === "H";
                const isSel  = selected === m.symbol;
                const isComp = compare  === m.symbol;
                const pct    = ((METALS.length - 1 - i) / (METALS.length - 1)) * 100;

                return (
                  <div key={m.symbol}
                    onClick={() => {
                      if (isH) return;
                      if (!selected) { setSelected(m.symbol); return; }
                      if (selected === m.symbol) { setSelected(null); setCompare(null); return; }
                      if (!compare) { setCompare(m.symbol); return; }
                      setSelected(m.symbol); setCompare(null);
                    }}
                    style={{
                      display:"flex", alignItems:"center", gap:"0.75rem",
                      padding:"0.55rem 0.75rem", borderRadius:"9px",
                      marginBottom:"3px", cursor: isH ? "default" : "pointer",
                      background: isSel ? `${m.color}14` : isComp ? "rgba(129,140,248,0.12)" : "transparent",
                      border: isSel ? `1px solid ${m.color}50` : isComp ? "1px solid rgba(129,140,248,0.4)" : "1px solid transparent",
                      borderLeft: isH ? "2px solid #38bdf8" : isSel ? `2px solid ${m.color}` : "2px solid transparent",
                      transition:"all 0.15s",
                      opacity: isH ? 0.7 : 1,
                    }}
                    onMouseEnter={e => { if (!isH && !isSel && !isComp) e.currentTarget.style.background="var(--bg3)"; }}
                    onMouseLeave={e => { if (!isSel && !isComp) e.currentTarget.style.background="transparent"; }}
                  >
                    {/* Activity bar */}
                    <div style={{ width:"80px", flexShrink:0 }}>
                      <div style={{ height:"5px", background:"var(--bg4)", borderRadius:"3px", overflow:"hidden" }}>
                        <div style={{
                          height:"100%", borderRadius:"3px",
                          width:`${pct}%`,
                          background: isH
                            ? "#38bdf8"
                            : `linear-gradient(90deg,${m.color},${m.color}80)`,
                          transition:"width 0.3s",
                        }}/>
                      </div>
                    </div>

                    {/* Symbol */}
                    <div style={{
                      width:"36px", height:"36px", borderRadius:"8px", flexShrink:0,
                      background: isSel ? `${m.color}20` : isComp ? "rgba(129,140,248,0.15)" : "var(--bg3)",
                      border:`1px solid ${isSel ? m.color+"50" : isComp ? "rgba(129,140,248,0.4)" : "var(--border)"}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily:"var(--mono)", fontSize:"0.82rem", fontWeight:700,
                      color: isSel ? m.color : isComp ? "#818cf8" : "var(--text2)",
                    }}>
                      {m.symbol}
                    </div>

                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:"0.82rem", fontWeight: isSel ? 600 : 400, color:"var(--text)" }}>
                        {m.name}
                        {isH && <span style={{ fontSize:"0.65rem", color:"#38bdf8", marginLeft:"6px" }}>— Mốc H</span>}
                      </div>
                    </div>

                    {/* Reaction icons */}
                    <div style={{ display:"flex", gap:"4px", flexShrink:0 }}>
                      {[
                        { ok:m.react_water, tip:"Tác dụng nước", icon:"💧" },
                        { ok:m.react_acid,  tip:"Đẩy H₂ từ axit", icon:"⚗️" },
                        { ok:m.react_salt,  tip:"Đẩy KL từ muối", icon:"⚙️" },
                      ].map((r, ri) => (
                        <div key={ri} title={r.tip} style={{
                          width:"20px", height:"20px", borderRadius:"4px", fontSize:"0.6rem",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          background: r.ok ? "rgba(52,211,153,0.12)" : "rgba(100,116,139,0.08)",
                          opacity: r.ok ? 1 : 0.3,
                        }}>
                          {r.icon}
                        </div>
                      ))}
                    </div>

                    {/* Badges */}
                    {(isSel || isComp) && (
                      <div style={{
                        fontSize:"0.55rem", fontFamily:"var(--mono)", fontWeight:700, flexShrink:0,
                        color: isSel ? m.color : "#818cf8",
                        background: isSel ? `${m.color}15` : "rgba(129,140,248,0.12)",
                        border:`1px solid ${isSel ? m.color+"30" : "rgba(129,140,248,0.3)"}`,
                        padding:"2px 6px", borderRadius:"4px",
                      }}>
                        {isSel ? "A" : "B"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Instruction */}
            <div style={{
              padding:"0.75rem 1.1rem", borderTop:"1px solid var(--border)",
              fontSize:"0.68rem", color:"var(--text3)", display:"flex", gap:"1rem", flexWrap:"wrap",
            }}>
              <span>💡 Click 1 kim loại → xem chi tiết</span>
              <span>💡 Click 2 kim loại (A+B) → so sánh khả năng đẩy</span>
              {(selected || compare) && (
                <button onClick={() => { setSelected(null); setCompare(null); }} style={{
                  background:"none", border:"1px solid var(--border)", color:"var(--text3)",
                  fontFamily:"var(--font)", fontSize:"0.68rem", padding:"2px 9px",
                  borderRadius:"5px", cursor:"pointer", marginLeft:"auto",
                }}>
                  ✕ Bỏ chọn
                </button>
              )}
            </div>
          </div>

          {/* Right: Detail panel */}
          <div style={{ display:"flex", flexDirection:"column", gap:"0.85rem" }}>

            {/* Single metal detail */}
            {sel && (
              <div style={{
                background:"var(--bg2)", border:`1px solid ${sel.color}30`,
                borderRadius:"14px", padding:"1.1rem",
                animation:"slideUp 0.18s ease",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"0.85rem" }}>
                  <div style={{
                    width:"48px", height:"48px", borderRadius:"12px",
                    background:`${sel.color}18`, border:`1px solid ${sel.color}35`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"var(--mono)", fontSize:"1.3rem", fontWeight:700, color:sel.color,
                  }}>{sel.symbol}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:"1rem" }}>{sel.name}</div>
                    <div style={{ fontSize:"0.7rem", color:"var(--text3)", fontFamily:"var(--mono)" }}>
                      M = {sel.M} g/mol
                    </div>
                  </div>
                </div>
                <div style={{ fontSize:"0.78rem", color:"var(--text2)", lineHeight:1.7, marginBottom:"0.75rem" }}>
                  {sel.note}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
                  {[
                    { label:"Tác dụng nước", ok:sel.react_water },
                    { label:"Đẩy H₂ từ axit loãng", ok:sel.react_acid },
                    { label:"Đẩy KL khỏi dung dịch muối", ok:sel.react_salt },
                  ].map((r, i) => (
                    <div key={i} style={{
                      display:"flex", alignItems:"center", gap:"8px",
                      fontSize:"0.76rem",
                      color: r.ok ? "#34d399" : "var(--text3)",
                    }}>
                      <span>{r.ok ? "✓" : "✗"}</span>
                      {r.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compare result */}
            {sel && comp && displacement && (
              <div style={{
                background: displacement.result ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
                border:`1px solid ${displacement.result ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
                borderRadius:"14px", padding:"1.1rem",
                animation:"slideUp 0.18s ease",
              }}>
                <div style={{
                  fontSize:"0.65rem", fontFamily:"var(--mono)", letterSpacing:"0.5px",
                  color: displacement.result ? "#34d399" : "#f87171", marginBottom:"0.6rem",
                }}>
                  KẾT QUẢ SO SÁNH
                </div>
                <div style={{
                  display:"flex", alignItems:"center", gap:"10px",
                  marginBottom:"0.75rem",
                }}>
                  <div style={{
                    padding:"5px 12px", borderRadius:"7px", fontFamily:"var(--mono)",
                    fontSize:"0.9rem", fontWeight:700, color:sel.color,
                    background:`${sel.color}15`, border:`1px solid ${sel.color}30`,
                  }}>{sel.symbol}</div>
                  <div style={{ fontSize:"1rem", color: displacement.result ? "#34d399" : "#f87171" }}>
                    {displacement.result ? ">" : "<"}
                  </div>
                  <div style={{
                    padding:"5px 12px", borderRadius:"7px", fontFamily:"var(--mono)",
                    fontSize:"0.9rem", fontWeight:700, color:comp.color,
                    background:`${comp.color}15`, border:`1px solid ${comp.color}30`,
                  }}>{comp.symbol}</div>
                </div>
                <div style={{ fontSize:"0.8rem", color:"var(--text2)", lineHeight:1.6 }}>
                  {displacement.desc}
                </div>
              </div>
            )}

            {!sel && (
              <div style={{
                background:"var(--bg2)", border:"1px solid var(--border)",
                borderRadius:"14px", padding:"2rem", textAlign:"center",
                color:"var(--text3)",
              }}>
                <div style={{ fontSize:"2rem", marginBottom:"0.5rem", opacity:0.3 }}>⚙️</div>
                <div style={{ fontSize:"0.8rem" }}>Click vào kim loại<br/>để xem chi tiết</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── REACTIONS VIEW ── */}
      {showInfo === "reactions" && (
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          {REACTIONS.map((r, i) => (
            <div key={i} style={{
              background:"var(--bg2)", border:`1px solid ${r.color}25`,
              borderRadius:"14px", padding:"1.25rem",
            }}>
              <div style={{ fontSize:"0.7rem", color:r.color, fontFamily:"var(--mono)", marginBottom:"5px" }}>
                DẠNG {i+1}
              </div>
              <div style={{ fontSize:"1rem", fontWeight:700, marginBottom:"0.6rem" }}>{r.title}</div>
              <div style={{ fontSize:"0.83rem", color:"var(--text2)", lineHeight:1.7, marginBottom:"1rem" }}>{r.desc}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
                {r.examples.map((ex, j) => (
                  <div key={j} style={{
                    fontFamily:"var(--mono)", fontSize:"0.82rem", color:r.color,
                    background:`${r.color}08`, border:`1px solid ${r.color}18`,
                    borderRadius:"7px", padding:"7px 12px",
                  }}>{ex}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── RULES VIEW ── */}
      {showInfo === "rules" && (
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"0.85rem",
        }}>
          {[
            { icon:"🥇", title:"Quy tắc cơ bản", color:"#fbbf24", rules:[
              "Kim loại đứng trước đẩy kim loại đứng sau ra khỏi dung dịch muối",
              "Kim loại đứng trước H đẩy H₂ ra khỏi dung dịch axit loãng",
              "Tính khử giảm dần từ trái sang phải trong dãy",
            ]},
            { icon:"⚠️", title:"Ngoại lệ cần nhớ", color:"#f87171", rules:[
              "K, Na, Ca, Ba tác dụng nước trước, không dùng để đẩy kim loại khỏi muối trực tiếp",
              "Al, Fe thụ động trong H₂SO₄ đặc nguội và HNO₃ đặc nguội",
              "Al tan trong NaOH (tính lưỡng tính) — đặc biệt trong chương trình",
              "Fe + HCl → Fe²⁺; Fe + Cl₂ → Fe³⁺ (oxi hóa mạnh hơn)",
            ]},
            { icon:"📌", title:"Điều kiện phản ứng đẩy muối", color:"#34d399", rules:[
              "Kim loại A đứng trước kim loại B trong dãy HĐ",
              "Muối của B phải tan trong nước",
              "Kim loại A không tác dụng với nước (không dùng K, Na, Ca, Ba)",
              "Sản phẩm: muối của A + kim loại B bám kết tủa",
            ]},
            { icon:"🔢", title:"Học thuộc lòng", color:"#818cf8", rules:[
              "K – Na – Ca – Mg – Al – Zn – Fe – Ni – Sn – Pb – H – Cu – Hg – Ag – Pt – Au",
              "Mẹo: Khi Nào Cần May Áo Záp Fải Nhờ Sơn Phục Hồi Cũ Hãy Sang Phố Âu",
            ]},
          ].map((card, i) => (
            <div key={i} style={{
              background:"var(--bg2)", border:`1px solid ${card.color}22`,
              borderRadius:"14px", padding:"1.15rem",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"0.85rem" }}>
                <span style={{ fontSize:"1.2rem" }}>{card.icon}</span>
                <span style={{ fontSize:"0.9rem", fontWeight:700, color:card.color }}>{card.title}</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
                {card.rules.map((rule, j) => (
                  <div key={j} style={{
                    display:"flex", gap:"8px",
                    fontSize:"0.78rem", color:"var(--text2)", lineHeight:1.6,
                  }}>
                    <span style={{ color:card.color, flexShrink:0, marginTop:"2px" }}>•</span>
                    {rule}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}