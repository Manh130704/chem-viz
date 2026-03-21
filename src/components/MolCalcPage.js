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
  "H₂":2.016,"O₂":32.00,"H₂O":18.015,"N₂":28.014,"NH₃":17.031,
  "Cl₂":70.906,"SO₂":64.066,"SO₃":80.066,"H₂SO₄":98.079,
  "Na₂O":61.979,"Al₂O₃":101.961,"H₂O₂":34.015,
  "NaHCO₃":84.007,"KClO₃":122.549,"NH₄Cl":53.491,"Na₂CO₃":105.988,
  "Na₂SO₄":142.043,"HNO₃":63.013,"CaCl₂":110.984,"Fe₃O₄":231.533,
  "Ca(OH)₂":74.093,"Ca(OH)2":74.093,
};

function getMolarMass(f) { return MOLAR_MASS[f] || null; }
function fmt(n) {
  if (n === null || n === undefined) return "—";
  if (n < 0.0001) return n.toExponential(3);
  return parseFloat(n.toFixed(4)).toString();
}
function toSubscript(s) {
  return s.replace(/0/g,"₀").replace(/1/g,"₁").replace(/2/g,"₂").replace(/3/g,"₃")
          .replace(/4/g,"₄").replace(/5/g,"₅").replace(/6/g,"₆").replace(/7/g,"₇")
          .replace(/8/g,"₈").replace(/9/g,"₉");
}

function presetToSubstances(preset) {
  if (!preset) return null;
  return [
    ...preset.reactants.map(c => ({ lbl:toSubscript(c.formula), formula:c.formula, coeff:c.coeff, side:"reactant" })),
    ...preset.products.map(c  => ({ lbl:toSubscript(c.formula), formula:c.formula, coeff:c.coeff, side:"product"  })),
  ];
}

function reactionToSubstances(rxn) {
  const count = arr => { const m={}; arr.forEach(x=>{m[x.label]=(m[x.label]||0)+1;}); return m; };
  const rc = count(rxn.reactants), pc = count(rxn.products);
  return [
    ...Object.entries(rc).map(([lbl,coeff]) => ({ lbl, formula:lbl, coeff, side:"reactant" })),
    ...Object.entries(pc).map(([lbl,coeff]) => ({ lbl, formula:lbl, coeff, side:"product"  })),
  ];
}

export default function MolCalcPage({ preset, onClearPreset }) {
  const [step,      setStep]      = useState(1); // 1=chọn, 2=nhập, 3=kết quả
  const [rxn,       setRxn]       = useState(null);
  const [substances,setSubstances]= useState([]);
  const [givenSub,  setGivenSub]  = useState(null);
  const [mode,      setMode]      = useState("mass");
  const [val,       setVal]       = useState("");
  const [results,   setResults]   = useState(null);
  const [err,       setErr]       = useState("");
  const [search,    setSearch]    = useState("");

  useEffect(() => {
    if (preset) {
      setRxn({ name:"Phương trình từ trang cân bằng", type:"hoahop", preset:true, preset_data:preset });
      setSubstances(presetToSubstances(preset));
      setGivenSub(null); setVal(""); setResults(null); setErr("");
      setStep(2);
    }
  }, [preset]);

  const filteredRxns = REACTIONS.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.equation.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectRxn = (r) => {
    setRxn(r); setSubstances(reactionToSubstances(r));
    setGivenSub(null); setVal(""); setResults(null); setErr("");
    if (onClearPreset) onClearPreset();
    setStep(2);
  };

  const handleCalc = () => {
    setErr(""); setResults(null);
    if (!rxn || !givenSub || !val) { setErr("Vui lòng điền đầy đủ!"); return; }
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) { setErr("Giá trị phải là số dương!"); return; }
    const given = substances.find(s => s.lbl === givenSub);
    if (!given) return;
    const M_given = getMolarMass(given.lbl) || getMolarMass(given.formula);
    let mol_given;
    if (mode === "mass") {
      if (!M_given) { setErr(`Chưa có M của ${given.lbl}. Dùng chế độ "Số mol".`); return; }
      mol_given = num / M_given;
    } else { mol_given = num; }
    const res = substances.map(s => {
      const mol_s = mol_given * (s.coeff / given.coeff);
      const M_s   = getMolarMass(s.lbl) || getMolarMass(s.formula);
      return { ...s, mol:mol_s, mass:M_s?mol_s*M_s:null, M:M_s, isGiven:s.lbl===givenSub };
    });
    setResults(res);
    setStep(3);
  };

  const tc = rxn ? (rxn.preset ? {color:"#818cf8",icon:"⚖️"} : TYPES[rxn.type]) : null;

  const eqLabel = rxn?.preset
    ? preset.reactants.map(c=>`${c.coeff>1?c.coeff:""}${toSubscript(c.formula)}`).join(" + ")
      + " → "
      + preset.products.map(c=>`${c.coeff>1?c.coeff:""}${toSubscript(c.formula)}`).join(" + ")
    : rxn?.equation || "";

  const STEPS = [
    { n:1, label:"Chọn phản ứng", done:!!rxn },
    { n:2, label:"Nhập dữ liệu",  done:!!results },
    { n:3, label:"Kết quả",        done:!!results },
  ];

  return (
    <div style={{ maxWidth:"700px", margin:"0 auto", padding:"0 1rem 3rem" }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"1.5rem 0 1rem" }}>
        <div className="hero-tag">🧮 Công cụ tính toán</div>
        <h1 style={{
          fontSize:"clamp(1.3rem,3vw,1.8rem)", fontWeight:700, marginTop:"0.5rem",
          background:"linear-gradient(135deg,#fff,var(--accent))",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        }}>Tính toán mol & khối lượng</h1>
      </div>

      {/* Step indicator */}
      <div style={{ display:"flex", gap:"0", marginBottom:"1.25rem" }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s.n}>
            <button
              onClick={() => { if (s.n <= (rxn?2:1) || results) setStep(s.n); }}
              style={{
                flex:1, padding:"10px 4px", border:"none", cursor:"pointer",
                background: step===s.n ? (tc?`${tc.color}15`:"rgba(56,189,248,0.1)") : "var(--bg2)",
                borderBottom: step===s.n ? `2px solid ${tc?.color||"var(--accent)"}` : "2px solid var(--border)",
                color: step===s.n ? (tc?.color||"var(--accent)") : "var(--text3)",
                fontFamily:"var(--font)", fontSize:"0.75rem",
                display:"flex", alignItems:"center", justifyContent:"center", gap:"5px",
                transition:"all 0.15s",
              }}
            >
              <div style={{
                width:"20px", height:"20px", borderRadius:"50%", flexShrink:0,
                background: s.done ? "#34d399" : step===s.n ? (tc?.color||"var(--accent)") : "var(--bg4)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"0.58rem", fontWeight:700, color: (s.done||step===s.n) ? "var(--bg)" : "var(--text3)",
              }}>
                {s.done ? "✓" : s.n}
              </div>
              <span style={{ display:"none" }} className="step-label">{s.label}</span>
              <span style={{ fontSize:"0.7rem" }}>{s.label}</span>
            </button>
            {i < STEPS.length-1 && <div style={{ width:"1px", background:"var(--border)", flexShrink:0 }}/>}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 1: Chọn phản ứng */}
      {step === 1 && (
        <div style={{ background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:"14px", overflow:"hidden" }}>
          <div style={{ padding:"0.75rem 1rem 0.5rem", borderBottom:"1px solid var(--border)" }}>
            <div style={{ position:"relative" }}>
              <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text3)", pointerEvents:"none" }}
                width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input placeholder="Tìm phản ứng..." value={search} onChange={e=>setSearch(e.target.value)}
                style={{ width:"100%", background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text)", fontFamily:"var(--font)", fontSize:"0.82rem", padding:"8px 10px 8px 30px", borderRadius:"8px", outline:"none" }}
              />
            </div>
          </div>
          <div style={{ maxHeight:"400px", overflowY:"auto" }}>
            {filteredRxns.map(r => {
              const t = TYPES[r.type];
              return (
                <div key={r.id} onClick={() => handleSelectRxn(r)}
                  style={{ padding:"0.75rem 1rem", cursor:"pointer", borderBottom:"1px solid var(--border)", transition:"background 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--bg3)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                >
                  <div style={{ fontSize:"0.62rem", color:t.color, fontFamily:"var(--mono)", marginBottom:"2px" }}>{t.icon} {t.label}</div>
                  <div style={{ fontSize:"0.85rem", fontWeight:500, marginBottom:"2px" }}>{r.name}</div>
                  <div style={{ fontSize:"0.65rem", color:"var(--text3)", fontFamily:"var(--mono)" }}>{r.equation}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Nhập dữ liệu */}
      {step === 2 && rxn && (
        <div style={{ background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:"14px", padding:"1rem", display:"flex", flexDirection:"column", gap:"0.85rem" }}>
          {/* Phương trình */}
          <div style={{ background:`${tc.color}0d`, border:`1px solid ${tc.color}25`, borderRadius:"10px", padding:"0.75rem" }}>
            <div style={{ fontSize:"0.6rem", color:tc.color, fontFamily:"var(--mono)", marginBottom:"3px" }}>{tc.icon} {rxn.name}</div>
            <div style={{ fontFamily:"var(--mono)", fontSize:"0.85rem", fontWeight:600, color:tc.color }}>{eqLabel}</div>
          </div>

          {/* Chọn chất */}
          <div>
            <div style={{ fontSize:"0.7rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"6px", textTransform:"uppercase" }}>Chọn chất đã biết:</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
              {substances.map((s,i) => {
                const M = getMolarMass(s.lbl)||getMolarMass(s.formula);
                const sel = givenSub===s.lbl;
                return (
                  <button key={i} onClick={()=>{setGivenSub(s.lbl);setVal("");setResults(null);}}
                    style={{
                      padding:"7px 12px", borderRadius:"8px", cursor:"pointer",
                      fontFamily:"var(--mono)", fontSize:"0.82rem", transition:"all 0.15s",
                      background:sel?`${tc.color}18`:"var(--bg3)",
                      border:sel?`1px solid ${tc.color}`:"1px solid var(--border)",
                      color:sel?tc.color:"var(--text2)",
                      display:"flex", flexDirection:"column", alignItems:"center", gap:"1px",
                    }}
                  >
                    <span style={{ fontWeight:700 }}>{s.lbl}</span>
                    <span style={{ fontSize:"0.56rem", opacity:0.65 }}>
                      {s.side==="reactant"?"Chất TG":"Sản phẩm"} ×{s.coeff}{M?` · M=${M}`:""}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {givenSub && (
            <>
              {/* Mode */}
              <div style={{ display:"flex", gap:"6px" }}>
                {[{v:"mass",l:"Khối lượng (g)"},{v:"mol",l:"Số mol (mol)"}].map(o => (
                  <button key={o.v} onClick={()=>{setMode(o.v);setVal("");setResults(null);}}
                    style={{
                      flex:1, padding:"9px", borderRadius:"9px", cursor:"pointer",
                      fontFamily:"var(--font)", fontSize:"0.82rem", transition:"all 0.15s",
                      background:mode===o.v?`${tc.color}18`:"var(--bg3)",
                      border:mode===o.v?`1px solid ${tc.color}`:"1px solid var(--border)",
                      color:mode===o.v?tc.color:"var(--text2)",
                      fontWeight:mode===o.v?600:400,
                    }}
                  >{o.l}</button>
                ))}
              </div>

              {/* Input + button */}
              <div>
                <div style={{ fontSize:"0.7rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"6px", textTransform:"uppercase" }}>
                  {mode==="mass"?`Khối lượng ${givenSub} (g):`:`Số mol ${givenSub} (mol):`}
                </div>
                <div style={{ display:"flex", gap:"8px" }}>
                  <input type="number" min="0" step="any"
                    placeholder={mode==="mass"?"Nhập gam...":"Nhập mol..."}
                    value={val}
                    onChange={e=>{setVal(e.target.value);setResults(null);setErr("");}}
                    onKeyDown={e=>e.key==="Enter"&&handleCalc()}
                    style={{
                      flex:1, background:"var(--bg3)", border:"1px solid var(--border)",
                      color:"var(--text)", fontFamily:"var(--mono)", fontSize:"1.1rem",
                      padding:"11px 14px", borderRadius:"10px", outline:"none",
                    }}
                    onFocus={e=>e.target.style.borderColor=tc.color}
                    onBlur={e=>e.target.style.borderColor="var(--border)"}
                  />
                  <button onClick={handleCalc} style={{
                    background:`linear-gradient(135deg,${tc.color},${tc.color}99)`,
                    border:"none", color:"white", fontFamily:"var(--font)",
                    fontSize:"0.9rem", fontWeight:700, padding:"11px 20px",
                    borderRadius:"10px", cursor:"pointer", whiteSpace:"nowrap",
                  }}>= Tính</button>
                </div>
              </div>

              <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:"8px", padding:"8px 12px", fontSize:"0.7rem", color:"var(--text3)", fontFamily:"var(--mono)" }}>
                n = m / M &nbsp;·&nbsp; m = n × M &nbsp;·&nbsp; tỉ lệ hệ số pt
              </div>
            </>
          )}

          {err && (
            <div style={{ background:"rgba(251,146,60,0.1)", border:"1px solid rgba(251,146,60,0.3)", color:"var(--warn)", fontSize:"0.82rem", padding:"8px 12px", borderRadius:"8px" }}>{err}</div>
          )}
        </div>
      )}

      {/* STEP 3: Kết quả */}
      {step === 3 && results && (
        <div style={{ background:"var(--bg2)", border:`1px solid ${tc.color}30`, borderRadius:"14px", padding:"1rem", animation:"slideUp 0.22s ease" }}>
          <div style={{ fontSize:"0.65rem", color:tc.color, fontFamily:"var(--mono)", marginBottom:"1rem", textTransform:"uppercase", letterSpacing:"0.4px" }}>
            ✓ Kết quả tính toán — {eqLabel}
          </div>

          <div style={{ fontSize:"0.65rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"0.5rem", textTransform:"uppercase" }}>Chất tham gia</div>
          {results.filter(r=>r.side==="reactant").map((r,i) => <ResultRow key={i} r={r} tc={tc}/>)}

          <div style={{ textAlign:"center", color:tc.color, fontSize:"1.2rem", margin:"0.6rem 0", fontFamily:"var(--mono)" }}>↓ phản ứng ↓</div>

          <div style={{ fontSize:"0.65rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"0.5rem", textTransform:"uppercase" }}>Sản phẩm</div>
          {results.filter(r=>r.side==="product").map((r,i) => <ResultRow key={i} r={r} tc={tc}/>)}

          <div style={{ display:"flex", gap:"8px", marginTop:"1rem" }}>
            <button onClick={()=>{setVal("");setResults(null);setErr("");setStep(2);}}
              style={{ flex:1, background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text3)", fontFamily:"var(--font)", fontSize:"0.82rem", padding:"9px", borderRadius:"9px", cursor:"pointer" }}>
              ↺ Tính lại
            </button>
            <button onClick={()=>{setRxn(null);setSubstances([]);setGivenSub(null);setResults(null);setStep(1);if(onClearPreset)onClearPreset();}}
              style={{ flex:1, background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text3)", fontFamily:"var(--font)", fontSize:"0.82rem", padding:"9px", borderRadius:"9px", cursor:"pointer" }}>
              Chọn PT khác
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultRow({ r, tc }) {
  return (
    <div style={{
      background:r.isGiven?`${tc.color}0e`:"var(--bg3)",
      border:r.isGiven?`1px solid ${tc.color}40`:"1px solid var(--border)",
      borderRadius:"10px", padding:"0.7rem 0.85rem", marginBottom:"0.45rem",
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"6px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          {r.isGiven && <span style={{ fontSize:"0.5rem", color:tc.color, background:`${tc.color}15`, border:`1px solid ${tc.color}30`, padding:"1px 5px", borderRadius:"3px", fontFamily:"var(--mono)", fontWeight:700 }}>ĐÃ BIẾT</span>}
          <span style={{ fontFamily:"var(--mono)", fontSize:"0.92rem", fontWeight:700, color:r.isGiven?tc.color:"var(--text)" }}>{r.lbl}</span>
          <span style={{ fontSize:"0.62rem", color:"var(--text3)", fontFamily:"var(--mono)" }}>(hệ số {r.coeff})</span>
        </div>
        {r.M && <span style={{ fontSize:"0.6rem", color:"var(--text3)", fontFamily:"var(--mono)" }}>M={r.M}</span>}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px" }}>
        <div style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"8px", padding:"6px 8px", textAlign:"center" }}>
          <div style={{ fontSize:"0.56rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"2px" }}>SỐ MOL</div>
          <div style={{ fontFamily:"var(--mono)", fontSize:"1rem", fontWeight:700, color:"var(--accent)" }}>{fmt(r.mol)}</div>
          <div style={{ fontSize:"0.56rem", color:"var(--text3)" }}>mol</div>
        </div>
        <div style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"8px", padding:"6px 8px", textAlign:"center" }}>
          <div style={{ fontSize:"0.56rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"2px" }}>KHỐI LƯỢNG</div>
          <div style={{ fontFamily:"var(--mono)", fontSize:"1rem", fontWeight:700, color:"#34d399" }}>{r.mass!==null?fmt(r.mass):"—"}</div>
          <div style={{ fontSize:"0.56rem", color:"var(--text3)" }}>gam</div>
        </div>
      </div>
    </div>
  );
}