import React, { useState, useEffect } from "react";
import { REACTIONS, TYPES } from "../data/reactions";

const MOLAR_MASS = {
  "H2":2.016,"O2":32.00,"H2O":18.015,"N2":28.014,"NH3":17.031,
  "HCl":36.461,"Cl2":70.906,"SO2":64.066,"SO3":80.066,"H2SO4":98.079,
  "Na":22.990,"NaCl":58.443,"Fe":55.845,"S":32.06,"FeS":87.91,
  "CaO":56.077,"CO2":44.010,"CaCO3":100.086,"BaO":153.326,
  "Na2O":61.979,"NaOH":39.997,"NO":30.006,"NO2":46.006,
  "Al":26.982,"Al2O3":101.961,"H2O2":34.015,"NaHCO3":84.007,
  "KClO3":122.549,"KCl":74.551,"HgO":216.589,"Hg":200.592,
  "NH4Cl":53.491,"C":12.011,"Mg":24.305,"MgO":40.304,"CO":28.010,
  "Ca":40.078,"CaOH2":74.093,"Zn":65.38,"Cu":63.546,"Ag":107.868,
  "Fe3O4":231.533,"K":39.098,"Na2CO3":105.988,"Na2SO4":142.043,
  "HNO3":63.013,"KOH":56.105,"CaCl2":110.984,
  // Unicode subscript versions
  "H₂":2.016,"O₂":32.00,"H₂O":18.015,"N₂":28.014,"NH₃":17.031,
  "Cl₂":70.906,"SO₂":64.066,"SO₃":80.066,"H₂SO₄":98.079,
  "Na₂O":61.979,"NO":30.006,"Al₂O₃":101.961,"H₂O₂":34.015,
  "NaHCO₃":84.007,"KClO₃":122.549,"NH₄Cl":53.491,"Na₂CO₃":105.988,
  "Na₂SO₄":142.043,"HNO₃":63.013,"CaCl₂":110.984,"Fe₃O₄":231.533,
  "Ca(OH)₂":74.093,"Ca(OH)2":74.093,
};

function getMolarMass(formula) {
  return MOLAR_MASS[formula] || null;
}

function fmt(n) {
  if (n === null || n === undefined) return "—";
  if (n < 0.0001) return n.toExponential(3);
  return parseFloat(n.toFixed(4)).toString();
}

function toSubscript(s) {
  return s
    .replace(/0/g,"₀").replace(/1/g,"₁").replace(/2/g,"₂").replace(/3/g,"₃")
    .replace(/4/g,"₄").replace(/5/g,"₅").replace(/6/g,"₆").replace(/7/g,"₇")
    .replace(/8/g,"₈").replace(/9/g,"₉");
}

// Chuyển preset từ BalancePage (có .formula, .coeff) sang format substances
function presetToSubstances(preset) {
  if (!preset) return null;
  return [
    ...preset.reactants.map(c => ({
      lbl: toSubscript(c.formula),
      formula: c.formula,
      coeff: c.coeff,
      side: "reactant",
    })),
    ...preset.products.map(c => ({
      lbl: toSubscript(c.formula),
      formula: c.formula,
      coeff: c.coeff,
      side: "product",
    })),
  ];
}

// Chuyển REACTIONS sang format substances
function reactionToSubstances(rxn) {
  const countLabels = (arr) => {
    const map = {};
    arr.forEach(m => { map[m.label] = (map[m.label] || 0) + 1; });
    return map;
  };
  const rc = countLabels(rxn.reactants);
  const pc = countLabels(rxn.products);
  return [
    ...Object.entries(rc).map(([lbl, coeff]) => ({ lbl, formula: lbl, coeff, side:"reactant" })),
    ...Object.entries(pc).map(([lbl, coeff]) => ({ lbl, formula: lbl, coeff, side:"product" })),
  ];
}

export default function MolCalcPage({ preset, onClearPreset }) {
  const [rxn,       setRxn]       = useState(null);
  const [substances,setSubstances]= useState([]);
  const [givenSub,  setGivenSub]  = useState(null);
  const [mode,      setMode]      = useState("mass");
  const [val,       setVal]       = useState("");
  const [results,   setResults]   = useState(null);
  const [err,       setErr]       = useState("");
  const [search,    setSearch]    = useState("");

  // Khi nhận preset từ BalancePage → tự động load
  useEffect(() => {
    if (preset) {
      setRxn({ name:"Phương trình từ trang cân bằng", type:"hoahop", preset:true, preset_data:preset });
      setSubstances(presetToSubstances(preset));
      setGivenSub(null); setVal(""); setResults(null); setErr("");
    }
  }, [preset]);

  const filteredRxns = REACTIONS.filter(r =>
    !search ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.equation.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectRxn = (r) => {
    setRxn(r);
    setSubstances(reactionToSubstances(r));
    setGivenSub(null); setVal(""); setResults(null); setErr("");
    if (onClearPreset) onClearPreset();
  };

  const handleCalc = () => {
    setErr(""); setResults(null);
    if (!rxn || !givenSub || !val) { setErr("Vui lòng điền đầy đủ!"); return; }
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) { setErr("Giá trị phải là số dương!"); return; }
    const given = substances.find(s => s.lbl === givenSub);
    if (!given) return;

    // Thử lấy M theo cả lbl lẫn formula
    const M_given = getMolarMass(given.lbl) || getMolarMass(given.formula);
    let mol_given;
    if (mode === "mass") {
      if (!M_given) { setErr(`Chưa có khối lượng mol của ${given.lbl}. Hãy dùng chế độ "Số mol".`); return; }
      mol_given = num / M_given;
    } else {
      mol_given = num;
    }

    setResults(substances.map(s => {
      const mol_s = mol_given * (s.coeff / given.coeff);
      const M_s   = getMolarMass(s.lbl) || getMolarMass(s.formula);
      return {
        ...s,
        mol:     mol_s,
        mass:    M_s ? mol_s * M_s : null,
        M:       M_s,
        isGiven: s.lbl === givenSub,
      };
    }));
  };

  const tc = rxn
    ? (rxn.preset ? { color:"#818cf8", icon:"⚖️" } : TYPES[rxn.type])
    : null;

  // Tạo label phương trình hiển thị
  const eqLabel = rxn?.preset
    ? [
        ...preset.reactants.map((c,i) => `${c.coeff>1?c.coeff:""}${toSubscript(c.formula)}`).join(" + "),
        "→",
        ...preset.products.map((c,i) => `${c.coeff>1?c.coeff:""}${toSubscript(c.formula)}`).join(" + "),
      ].join(" ")
    : rxn?.equation || "";

  return (
    <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"0 1.5rem 3rem" }}>

      {/* Hero */}
      <div style={{ textAlign:"center", padding:"2rem 1rem 1.5rem" }}>
        <div className="hero-tag">🧮 Công cụ tính toán</div>
        <h1 style={{
          fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:700, marginTop:"0.5rem",
          background:"linear-gradient(135deg,#fff,var(--accent))",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        }}>
          Tính toán mol & khối lượng
        </h1>
      </div>

      {/* Banner preset nếu có */}
      {preset && rxn?.preset && (
        <div style={{
          background:"linear-gradient(135deg,rgba(129,140,248,0.12),rgba(56,189,248,0.08))",
          border:"1px solid rgba(129,140,248,0.35)",
          borderRadius:"12px", padding:"0.85rem 1.1rem",
          marginBottom:"1rem",
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:"1rem",
          animation:"slideUp 0.22s ease",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <span style={{ fontSize:"1.2rem" }}>⚖️</span>
            <div>
              <div style={{ fontSize:"0.72rem", color:"#818cf8", fontFamily:"var(--mono)", marginBottom:"2px" }}>
                PHƯƠNG TRÌNH TỪ TRANG CÂN BẰNG
              </div>
              <div style={{ fontFamily:"var(--mono)", fontSize:"0.88rem", fontWeight:600, color:"var(--text)" }}>
                {eqLabel}
              </div>
            </div>
          </div>
          <button
            onClick={() => { setRxn(null); setSubstances([]); setGivenSub(null); setResults(null); if(onClearPreset) onClearPreset(); }}
            style={{
              background:"none", border:"1px solid var(--border)", color:"var(--text3)",
              fontFamily:"var(--font)", fontSize:"0.75rem", padding:"5px 11px",
              borderRadius:"7px", cursor:"pointer", whiteSpace:"nowrap",
            }}
          >
            ✕ Dùng phản ứng khác
          </button>
        </div>
      )}

      {/* ── 3-panel frame ── */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"1fr 1px 1fr 1px 1fr",
        background:"var(--bg2)",
        border:"1px solid var(--border2)",
        borderRadius:"18px",
        overflow:"hidden",
        minHeight:"520px",
      }}>

        {/* ══ PANEL 1: Chọn phản ứng ══ */}
        <div style={{ display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <PanelHeader number="1" label="Chọn phản ứng" done={!!rxn} color="var(--accent)" />

          {/* Nếu đang dùng preset thì hiện info, không cần list */}
          {rxn?.preset ? (
            <div style={{ padding:"1rem", flex:1, display:"flex", flexDirection:"column", gap:"0.75rem" }}>
              <div style={{
                background:"rgba(129,140,248,0.1)", border:"1px solid rgba(129,140,248,0.3)",
                borderRadius:"10px", padding:"0.85rem",
              }}>
                <div style={{ fontSize:"0.6rem", color:"#818cf8", fontFamily:"var(--mono)", marginBottom:"5px" }}>
                  ⚖️ TỪ TRANG CÂN BẰNG
                </div>
                <div style={{ fontFamily:"var(--mono)", fontSize:"0.82rem", color:"var(--text)", lineHeight:1.7 }}>
                  {eqLabel}
                </div>
              </div>
              <div style={{ fontSize:"0.72rem", color:"var(--text3)", lineHeight:1.6 }}>
                Chất tham gia và sản phẩm đã được tải từ phương trình đã cân bằng.
              </div>
              <button
                onClick={() => { setRxn(null); setSubstances([]); setGivenSub(null); setResults(null); if(onClearPreset) onClearPreset(); }}
                style={{
                  background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text3)",
                  fontFamily:"var(--font)", fontSize:"0.78rem", padding:"7px 12px",
                  borderRadius:"8px", cursor:"pointer", textAlign:"center",
                }}
              >
                ← Chọn phản ứng khác
              </button>
            </div>
          ) : (
            <>
              <div style={{ padding:"0.75rem 1rem 0.5rem" }}>
                <div style={{ position:"relative" }}>
                  <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text3)", pointerEvents:"none" }}
                    width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input placeholder="Tìm phản ứng..." value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                      width:"100%", background:"var(--bg3)", border:"1px solid var(--border)",
                      color:"var(--text)", fontFamily:"var(--font)", fontSize:"0.78rem",
                      padding:"7px 10px 7px 30px", borderRadius:"8px", outline:"none",
                    }}
                  />
                </div>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:"0 0.75rem 0.75rem" }}>
                {filteredRxns.map(r => {
                  const t = TYPES[r.type];
                  const sel = rxn?.id === r.id;
                  return (
                    <div key={r.id} onClick={() => handleSelectRxn(r)}
                      style={{
                        padding:"0.6rem 0.75rem", borderRadius:"9px", cursor:"pointer",
                        marginBottom:"4px", transition:"all 0.15s",
                        border:`1px solid ${sel ? t.color+"70" : "transparent"}`,
                        background: sel ? `${t.color}12` : "transparent",
                      }}
                      onMouseEnter={e => { if(!sel) e.currentTarget.style.background="var(--bg3)"; }}
                      onMouseLeave={e => { if(!sel) e.currentTarget.style.background="transparent"; }}
                    >
                      <div style={{ fontSize:"0.6rem", color:t.color, fontFamily:"var(--mono)", marginBottom:"2px" }}>
                        {t.icon} {t.label}
                      </div>
                      <div style={{ fontSize:"0.8rem", fontWeight:sel?600:400, color:sel?"var(--text)":"var(--text2)" }}>
                        {r.name}
                      </div>
                      <div style={{ fontSize:"0.62rem", color:"var(--text3)", fontFamily:"var(--mono)", marginTop:"2px" }}>
                        {r.equation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div style={{ background:"var(--border)", alignSelf:"stretch" }} />

        {/* ══ PANEL 2: Nhập dữ liệu ══ */}
        <div style={{ display:"flex", flexDirection:"column" }}>
          <PanelHeader number="2" label="Nhập dữ liệu" done={!!results} color="#818cf8" />

          <div style={{ flex:1, padding:"0.75rem 1rem", overflowY:"auto" }}>
            {!rxn ? (
              <EmptyState icon="👈" text="Chọn phản ứng ở bên trái" />
            ) : (
              <>
                {/* Phương trình */}
                <div style={{
                  background:`${tc.color}0d`, border:`1px solid ${tc.color}25`,
                  borderRadius:"10px", padding:"0.7rem 0.9rem", marginBottom:"1rem",
                }}>
                  <div style={{ fontSize:"0.6rem", color:tc.color, fontFamily:"var(--mono)", marginBottom:"3px" }}>
                    {tc.icon} {rxn.preset ? "Phương trình đã cân bằng" : rxn.name}
                  </div>
                  <div style={{ fontFamily:"var(--mono)", fontSize:"0.82rem", color:tc.color, fontWeight:600 }}>
                    {eqLabel}
                  </div>
                </div>

                {/* Chọn chất */}
                <div style={{ marginBottom:"0.9rem" }}>
                  <Label>Chất đã biết:</Label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"5px", marginTop:"6px" }}>
                    {substances.map((s, i) => {
                      const M   = getMolarMass(s.lbl) || getMolarMass(s.formula);
                      const sel = givenSub === s.lbl;
                      return (
                        <button key={i}
                          onClick={() => { setGivenSub(s.lbl); setVal(""); setResults(null); }}
                          style={{
                            padding:"5px 10px", borderRadius:"7px", cursor:"pointer",
                            fontFamily:"var(--mono)", fontSize:"0.78rem", transition:"all 0.15s",
                            background: sel ? `${tc.color}18` : "var(--bg3)",
                            border: sel ? `1px solid ${tc.color}` : "1px solid var(--border)",
                            color: sel ? tc.color : "var(--text2)",
                            display:"flex", flexDirection:"column", alignItems:"center", gap:"1px",
                          }}
                        >
                          <span style={{ fontWeight:700 }}>{s.lbl}</span>
                          <span style={{ fontSize:"0.52rem", opacity:0.65 }}>
                            {s.side==="reactant" ? "Chất TG" : "Sản phẩm"} ×{s.coeff}
                            {M ? ` · M=${M}` : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {givenSub && (
                  <>
                    {/* Toggle mass/mol */}
                    <div style={{ marginBottom:"0.75rem" }}>
                      <Label>Loại dữ liệu:</Label>
                      <div style={{ display:"flex", gap:"5px", marginTop:"6px" }}>
                        {[{v:"mass",l:"Khối lượng (g)"},{v:"mol",l:"Số mol (mol)"}].map(o => (
                          <button key={o.v}
                            onClick={() => { setMode(o.v); setVal(""); setResults(null); }}
                            style={{
                              flex:1, padding:"7px 8px", borderRadius:"8px", cursor:"pointer",
                              fontFamily:"var(--font)", fontSize:"0.76rem", transition:"all 0.15s",
                              background: mode===o.v ? `${tc.color}18` : "var(--bg3)",
                              border: mode===o.v ? `1px solid ${tc.color}` : "1px solid var(--border)",
                              color: mode===o.v ? tc.color : "var(--text2)",
                              fontWeight: mode===o.v ? 600 : 400,
                            }}
                          >{o.l}</button>
                        ))}
                      </div>
                    </div>

                    {/* Input */}
                    <div style={{ marginBottom:"0.9rem" }}>
                      <Label>{mode==="mass" ? `Khối lượng ${givenSub} (g):` : `Số mol ${givenSub} (mol):`}</Label>
                      <div style={{ display:"flex", gap:"7px", marginTop:"6px" }}>
                        <input
                          type="number" min="0" step="any"
                          placeholder={mode==="mass" ? "Nhập gam..." : "Nhập mol..."}
                          value={val}
                          onChange={e => { setVal(e.target.value); setResults(null); setErr(""); }}
                          onKeyDown={e => e.key==="Enter" && handleCalc()}
                          style={{
                            flex:1, background:"var(--bg3)", border:"1px solid var(--border)",
                            color:"var(--text)", fontFamily:"var(--mono)", fontSize:"0.95rem",
                            padding:"9px 12px", borderRadius:"9px", outline:"none", transition:"border 0.2s",
                          }}
                          onFocus={e => e.target.style.borderColor = tc.color}
                          onBlur={e => e.target.style.borderColor = "var(--border)"}
                        />
                        <button onClick={handleCalc} style={{
                          background:`linear-gradient(135deg,${tc.color},${tc.color}99)`,
                          border:"none", color:"white", fontFamily:"var(--font)",
                          fontSize:"0.85rem", fontWeight:600, padding:"9px 16px",
                          borderRadius:"9px", cursor:"pointer", whiteSpace:"nowrap",
                        }}>= Tính</button>
                      </div>
                    </div>

                    <div style={{
                      background:"var(--bg3)", border:"1px solid var(--border)",
                      borderRadius:"8px", padding:"8px 12px",
                      fontSize:"0.7rem", color:"var(--text3)", fontFamily:"var(--mono)",
                    }}>
                      n = m / M &nbsp;·&nbsp; m = n × M &nbsp;·&nbsp; tỉ lệ hệ số pt
                    </div>
                  </>
                )}

                {err && (
                  <div style={{
                    marginTop:"0.75rem",
                    background:"rgba(251,146,60,0.1)", border:"1px solid rgba(251,146,60,0.3)",
                    color:"var(--warn)", fontSize:"0.78rem", padding:"7px 11px", borderRadius:"7px",
                  }}>{err}</div>
                )}
              </>
            )}
          </div>
        </div>

        <div style={{ background:"var(--border)", alignSelf:"stretch" }} />

        {/* ══ PANEL 3: Kết quả ══ */}
        <div style={{ display:"flex", flexDirection:"column" }}>
          <PanelHeader number="3" label="Kết quả" done={!!results} color="#34d399" />

          <div style={{ flex:1, padding:"0.75rem 1rem", overflowY:"auto" }}>
            {!results ? (
              <EmptyState
                icon={!rxn ? "⬡" : !givenSub ? "☝️" : "🧮"}
                text={
                  !rxn      ? "Chờ chọn phản ứng..." :
                  !givenSub ? "Chờ chọn chất..." :
                  "Nhập giá trị và nhấn Tính"
                }
              />
            ) : (
              <div style={{ animation:"slideUp 0.22s ease" }}>
                <SectionTitle label="Chất tham gia" color="var(--accent)" />
                {results.filter(r => r.side==="reactant").map((r,i) => (
                  <ResultRow key={i} r={r} tc={tc} />
                ))}
                <div style={{ textAlign:"center", color:tc.color, fontSize:"1.2rem", margin:"0.6rem 0", fontFamily:"var(--mono)" }}>
                  ↓ phản ứng ↓
                </div>
                <SectionTitle label="Sản phẩm" color="#34d399" />
                {results.filter(r => r.side==="product").map((r,i) => (
                  <ResultRow key={i} r={r} tc={tc} />
                ))}
                <button
                  onClick={() => { setVal(""); setResults(null); setErr(""); }}
                  style={{
                    marginTop:"1rem", width:"100%",
                    background:"var(--bg3)", border:"1px solid var(--border)",
                    color:"var(--text3)", fontFamily:"var(--font)", fontSize:"0.78rem",
                    padding:"7px", borderRadius:"8px", cursor:"pointer", transition:"all 0.18s",
                  }}
                  onMouseEnter={e => { e.target.style.borderColor=tc.color; e.target.style.color=tc.color; }}
                  onMouseLeave={e => { e.target.style.borderColor="var(--border)"; e.target.style.color="var(--text3)"; }}
                >↺ Tính lại</button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function PanelHeader({ number, label, done, color }) {
  return (
    <div style={{
      padding:"0.85rem 1rem", borderBottom:"1px solid var(--border)",
      display:"flex", alignItems:"center", gap:"8px",
      background: done ? `${color}06` : "transparent", flexShrink:0,
    }}>
      <div style={{
        width:"22px", height:"22px", borderRadius:"50%", flexShrink:0,
        background: done ? color : "var(--bg4)",
        border:`1.5px solid ${done ? color : "var(--border)"}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:"0.62rem", fontFamily:"var(--mono)", fontWeight:700,
        color: done ? "var(--bg)" : "var(--text3)", transition:"all 0.25s",
      }}>
        {done ? "✓" : number}
      </div>
      <span style={{
        fontSize:"0.72rem", fontFamily:"var(--mono)", fontWeight:700,
        color: done ? color : "var(--text3)", textTransform:"uppercase", letterSpacing:"0.5px",
      }}>
        {label}
      </span>
    </div>
  );
}

function Label({ children }) {
  return (
    <div style={{ fontSize:"0.7rem", color:"var(--text3)", fontFamily:"var(--mono)", textTransform:"uppercase", letterSpacing:"0.3px" }}>
      {children}
    </div>
  );
}

function SectionTitle({ label, color }) {
  return (
    <div style={{
      fontSize:"0.6rem", color, fontFamily:"var(--mono)",
      textTransform:"uppercase", letterSpacing:"0.5px",
      marginBottom:"0.4rem", display:"flex", alignItems:"center", gap:"5px",
    }}>
      <div style={{ flex:1, height:"1px", background:`${color}30` }} />
      {label}
      <div style={{ flex:1, height:"1px", background:`${color}30` }} />
    </div>
  );
}

function ResultRow({ r, tc }) {
  return (
    <div style={{
      background: r.isGiven ? `${tc.color}0e` : "var(--bg3)",
      border: r.isGiven ? `1px solid ${tc.color}40` : "1px solid var(--border)",
      borderRadius:"9px", padding:"0.6rem 0.75rem", marginBottom:"0.45rem",
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"4px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          {r.isGiven && (
            <span style={{
              fontSize:"0.48rem", color:tc.color, background:`${tc.color}15`,
              border:`1px solid ${tc.color}30`, padding:"1px 5px", borderRadius:"3px",
              fontFamily:"var(--mono)", fontWeight:700,
            }}>ĐÃ BIẾT</span>
          )}
          <span style={{ fontFamily:"var(--mono)", fontSize:"0.88rem", fontWeight:700, color:r.isGiven ? tc.color : "var(--text)" }}>
            {r.lbl}
          </span>
          <span style={{ fontSize:"0.6rem", color:"var(--text3)", fontFamily:"var(--mono)" }}>×{r.coeff}</span>
        </div>
        {r.M && <span style={{ fontSize:"0.58rem", color:"var(--text3)", fontFamily:"var(--mono)" }}>M={r.M}</span>}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5px" }}>
        <ValueBox label="Số mol" value={fmt(r.mol)} unit="mol" color="var(--accent)" />
        <ValueBox label="Khối lượng" value={r.mass !== null ? fmt(r.mass) : "—"} unit="g" color="#34d399" />
      </div>
    </div>
  );
}

function ValueBox({ label, value, unit, color }) {
  return (
    <div style={{
      background:"var(--bg)", border:"1px solid var(--border)",
      borderRadius:"7px", padding:"5px 8px", textAlign:"center",
    }}>
      <div style={{ fontSize:"0.55rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"2px" }}>{label}</div>
      <div style={{ fontFamily:"var(--mono)", fontSize:"0.9rem", fontWeight:700, color }}>{value}</div>
      <div style={{ fontSize:"0.55rem", color:"var(--text3)" }}>{unit}</div>
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", height:"200px", gap:"0.6rem", color:"var(--text3)",
    }}>
      <div style={{ fontSize:"2rem", opacity:0.4 }}>{icon}</div>
      <div style={{ fontSize:"0.8rem", textAlign:"center", lineHeight:1.5 }}>{text}</div>
    </div>
  );
}