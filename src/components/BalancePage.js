import React, { useState } from "react";
import { REACTIONS, TYPES } from "../data/reactions";

// ══════════════════════════════════════════════
// PARSER: "H2 + O2" → { H:2, O:2 }
// ══════════════════════════════════════════════
function parseFormula(formula) {
  const f = formula.trim()
    .replace(/₀/g,"0").replace(/₁/g,"1").replace(/₂/g,"2").replace(/₃/g,"3")
    .replace(/₄/g,"4").replace(/₅/g,"5").replace(/₆/g,"6").replace(/₇/g,"7")
    .replace(/₈/g,"8").replace(/₉/g,"9");

  const map = {};
  // Regex: element symbol + optional number
  const re = /([A-Z][a-z]?)(\d*)/g;
  let m;
  while ((m = re.exec(f)) !== null) {
    if (!m[1]) continue;
    const el = m[1];
    const n  = m[2] ? parseInt(m[2]) : 1;
    map[el] = (map[el] || 0) + n;
  }
  return map;
}

// Split "2H2 + O2" → [{coeff:2, formula:"H2"}, {coeff:1, formula:"O2"}]
function parseSide(side) {
  return side.split("+").map(token => {
    const t = token.trim();
    const m = t.match(/^(\d+)?\s*([A-Za-z0-9()]+)$/);
    if (!m) return null;
    return { coeff: m[1] ? parseInt(m[1]) : 1, formula: m[2] };
  }).filter(Boolean);
}

// ══════════════════════════════════════════════
// BALANCER: Gaussian elimination over rationals
// ══════════════════════════════════════════════
function gcd(a, b) { return b === 0 ? Math.abs(a) : gcd(b, a % b); }
function lcm(a, b) { return (a * b) / gcd(a, b); }

function balance(reactantStr, productStr) {
  try {
    const reactants = parseSide(reactantStr);
    const products  = parseSide(productStr);
    if (!reactants.length || !products.length) return null;

    const allFormulas = [...reactants.map(r => r.formula), ...products.map(p => p.formula)];
    const nComp = allFormulas.length;

    // Collect all elements
    const elementSet = new Set();
    allFormulas.forEach(f => Object.keys(parseFormula(f)).forEach(e => elementSet.add(e)));
    const elements = [...elementSet];
    const nElem = elements.length;

    if (nElem === 0) return null;

    // Build matrix: rows = elements, cols = compounds + 1 (augmented)
    // reactants positive, products negative
    const matrix = [];
    for (let i = 0; i < nElem; i++) {
      const row = new Array(nComp + 1).fill(0);
      reactants.forEach((r, j) => {
        const fm = parseFormula(r.formula);
        row[j] = fm[elements[i]] || 0;
      });
      products.forEach((p, j) => {
        const fm = parseFormula(p.formula);
        row[reactants.length + j] = -(fm[elements[i]] || 0);
      });
      matrix.push(row);
    }

    // Gaussian elimination with fractions (multiply to avoid floats)
    // Use integer arithmetic: represent each cell as numerator (denominator tracked per row)
    // Simpler: use floating point then round to nearest fraction
    const mat = matrix.map(r => [...r]);
    const n = mat.length;
    const cols = nComp;

    let pivotRow = 0;
    for (let col = 0; col < cols && pivotRow < n; col++) {
      let pivot = -1;
      for (let row = pivotRow; row < n; row++) {
        if (Math.abs(mat[row][col]) > 1e-9) { pivot = row; break; }
      }
      if (pivot === -1) continue;
      [mat[pivotRow], mat[pivot]] = [mat[pivot], mat[pivotRow]];
      const pv = mat[pivotRow][col];
      for (let j = col; j <= cols; j++) mat[pivotRow][j] /= pv;
      for (let row = 0; row < n; row++) {
        if (row === pivotRow) continue;
        const factor = mat[row][col];
        for (let j = col; j <= cols; j++) mat[row][j] -= factor * mat[pivotRow][j];
      }
      pivotRow++;
    }

    // Free variable = last compound, set to 1
    // Back-substitute to find coefficients
    const coeffs = new Array(nComp).fill(0);
    coeffs[nComp - 1] = 1;

    for (let row = pivotRow - 1; row >= 0; row--) {
      let pivotCol = -1;
      for (let col = 0; col < nComp; col++) {
        if (Math.abs(mat[row][col]) > 1e-9) { pivotCol = col; break; }
      }
      if (pivotCol === -1) continue;
      let sum = 0;
      for (let col = pivotCol + 1; col < nComp; col++) {
        sum += mat[row][col] * coeffs[col];
      }
      coeffs[pivotCol] = -sum;
    }

    // Convert to integers: find LCM of denominators
    // Approximate each as fraction p/q
    const fracs = coeffs.map(c => {
      const denom = 12; // multiply by 12 to catch halves, thirds, quarters
      const num = Math.round(c * denom);
      const g = gcd(Math.abs(num), denom);
      return { num: num / g, den: denom / g };
    });
    const denLCM = fracs.reduce((acc, f) => lcm(acc, f.den), 1);
    const intCoeffs = fracs.map(f => Math.round(f.num * denLCM / f.den));

    // All must be positive
    if (intCoeffs.some(c => c <= 0)) return null;

    // Reduce by GCD
    const g = intCoeffs.reduce((a, b) => gcd(a, b));
    const finalCoeffs = intCoeffs.map(c => c / g);

    // Verify
    for (const el of elements) {
      let left = 0, right = 0;
      reactants.forEach((r, i) => {
        left += finalCoeffs[i] * (parseFormula(r.formula)[el] || 0);
      });
      products.forEach((p, i) => {
        right += finalCoeffs[reactants.length + i] * (parseFormula(p.formula)[el] || 0);
      });
      if (Math.abs(left - right) > 0.01) return null;
    }

    return {
      reactants: reactants.map((r, i) => ({ ...r, coeff: finalCoeffs[i] })),
      products:  products.map((p, i)  => ({ ...p, coeff: finalCoeffs[reactants.length + i] })),
      elements,
    };
  } catch (e) {
    return null;
  }
}

// Format balanced side for display
function formatSide(compounds) {
  return compounds.map(c => `${c.coeff > 1 ? c.coeff : ""}${c.formula}`).join(" + ");
}

// Convert formula to subscript display
function toSubscript(formula) {
  return formula
    .replace(/0/g,"₀").replace(/1/g,"₁").replace(/2/g,"₂").replace(/3/g,"₃")
    .replace(/4/g,"₄").replace(/5/g,"₅").replace(/6/g,"₆").replace(/7/g,"₇")
    .replace(/8/g,"₈").replace(/9/g,"₉");
}

// ══════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════
const PRESETS = REACTIONS.slice(0, 20).map(r => ({
  id: r.id,
  name: r.name,
  type: r.type,
  // Convert unicode subscripts back to plain for input
  left:  r.reactants.map(m => m.label.replace(/[₀-₉]/g, d => "₀₁₂₃₄₅₆₇₈₉".indexOf(d))).join(" + "),
  right: r.products.map(m => m.label.replace(/[₀-₉]/g, d => "₀₁₂₃₄₅₆₇₈₉".indexOf(d))).join(" + "),
  raw: r,
}));

// Normalize subscript unicode to ascii numbers for parser
function normInput(s) {
  return s
    .replace(/₀/g,"0").replace(/₁/g,"1").replace(/₂/g,"2").replace(/₃/g,"3")
    .replace(/₄/g,"4").replace(/₅/g,"5").replace(/₆/g,"6").replace(/₇/g,"7")
    .replace(/₈/g,"8").replace(/₉/g,"9");
}

export default function BalancePage({ onGoMolCalc }) {
  const [leftInput,  setLeftInput]  = useState("");
  const [rightInput, setRightInput] = useState("");
  const [result,     setResult]     = useState(null);
  const [err,        setErr]        = useState("");
  const [tab,        setTab]        = useState("free"); // "free" | "preset"
  const [search,     setSearch]     = useState("");

  const handleBalance = () => {
    setErr(""); setResult(null);
    const L = normInput(leftInput.trim());
    const R = normInput(rightInput.trim());
    if (!L || !R) { setErr("Vui lòng nhập cả 2 vế!"); return; }
    const res = balance(L, R);
    if (!res) {
      setErr("Không thể cân bằng phương trình này. Kiểm tra lại công thức hóa học!");
      return;
    }
    setResult(res);
  };

  const handlePreset = (p) => {
    setLeftInput(p.left);
    setRightInput(p.right);
    setResult(null);
    setErr("");
    setTab("free");
  };

  const handleReset = () => {
    setLeftInput(""); setRightInput("");
    setResult(null); setErr("");
  };

  const balancedLeft  = result ? formatSide(result.reactants) : "";
  const balancedRight = result ? formatSide(result.products)  : "";
  const balancedEq    = result ? `${balancedLeft} → ${balancedRight}` : "";

  const filteredPresets = PRESETS.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.left.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth:"960px", margin:"0 auto", padding:"0 1.5rem 4rem" }}>

      {/* Hero */}
      <div style={{ textAlign:"center", padding:"2rem 1rem 1.75rem" }}>
        <div className="hero-tag">⚖️ Công cụ cân bằng</div>
        <h1 style={{
          fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:700, marginTop:"0.5rem",
          background:"linear-gradient(135deg,#fff,#818cf8)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        }}>
          Cân bằng phương trình hóa học
        </h1>
        <p style={{ color:"var(--text2)", fontSize:"0.88rem", marginTop:"0.4rem" }}>
          Nhập công thức → hệ thống tự động tìm hệ số cân bằng
        </p>
      </div>

      {/* ── Main layout ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:"1rem" }}>

        {/* LEFT: Input */}
        <div style={{ display:"flex", flexDirection:"column", gap:"0.85rem" }}>

          {/* Tab switch */}
          <div style={{
            display:"flex", background:"var(--bg2)",
            border:"1px solid var(--border)", borderRadius:"10px", padding:"3px", gap:"3px",
          }}>
            {[
              { k:"free",   l:"✏️ Nhập tự do" },
              { k:"preset", l:"📋 Chọn sẵn" },
            ].map(t => (
              <button key={t.k} onClick={() => setTab(t.k)} style={{
                flex:1, padding:"7px 10px", borderRadius:"7px", cursor:"pointer",
                fontFamily:"var(--font)", fontSize:"0.8rem", border:"none",
                background: tab===t.k ? "rgba(129,140,248,0.18)" : "transparent",
                color: tab===t.k ? "#818cf8" : "var(--text3)",
                fontWeight: tab===t.k ? 600 : 400,
                borderBottom: tab===t.k ? "2px solid #818cf8" : "2px solid transparent",
                transition:"all 0.18s",
              }}>{t.l}</button>
            ))}
          </div>

          {/* Free input */}
          {tab === "free" && (
            <div style={{
              background:"var(--bg2)", border:"1px solid var(--border2)",
              borderRadius:"14px", padding:"1.1rem", display:"flex", flexDirection:"column", gap:"0.75rem",
            }}>
              <InputField
                label="Vế trái (chất tham gia)"
                placeholder="Ví dụ: H2 + O2"
                value={leftInput}
                onChange={v => { setLeftInput(v); setResult(null); setErr(""); }}
                hint="Dùng ký hiệu thường: H2, O2, Fe, NaCl..."
                color="#38bdf8"
              />
              <div style={{ textAlign:"center", color:"var(--text3)", fontSize:"1.2rem" }}>↕</div>
              <InputField
                label="Vế phải (sản phẩm)"
                placeholder="Ví dụ: H2O"
                value={rightInput}
                onChange={v => { setRightInput(v); setResult(null); setErr(""); }}
                hint="Nhiều chất ngăn cách bằng dấu +"
                color="#818cf8"
              />

              {/* Examples */}
              <div>
                <div style={{ fontSize:"0.62rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"5px" }}>
                  VÍ DỤ NHANH:
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
                  {[
                    { l:"H2 + O2", r:"H2O" },
                    { l:"Fe + O2", r:"Fe3O4" },
                    { l:"Al + O2", r:"Al2O3" },
                    { l:"Na + H2O", r:"NaOH + H2" },
                    { l:"Fe + HCl", r:"FeCl2 + H2" },
                    { l:"Ca + H2O", r:"CaOH2 + H2" },
                  ].map((ex, i) => (
                    <button key={i}
                      onClick={() => { setLeftInput(ex.l); setRightInput(ex.r); setResult(null); setErr(""); }}
                      style={{
                        fontSize:"0.62rem", fontFamily:"var(--mono)", cursor:"pointer",
                        background:"var(--bg3)", border:"1px solid var(--border)",
                        color:"var(--text3)", padding:"3px 8px", borderRadius:"5px",
                        transition:"all 0.15s",
                      }}
                      onMouseEnter={e => { e.target.style.borderColor="#818cf8"; e.target.style.color="#818cf8"; }}
                      onMouseLeave={e => { e.target.style.borderColor="var(--border)"; e.target.style.color="var(--text3)"; }}
                    >
                      {ex.l} = {ex.r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display:"flex", gap:"7px" }}>
                <button onClick={handleBalance} style={{
                  flex:1, background:"linear-gradient(135deg,#818cf8,#38bdf8)",
                  border:"none", color:"white", fontFamily:"var(--font)",
                  fontSize:"0.9rem", fontWeight:700, padding:"11px",
                  borderRadius:"10px", cursor:"pointer", transition:"opacity 0.2s",
                }}
                  onMouseEnter={e => e.target.style.opacity="0.88"}
                  onMouseLeave={e => e.target.style.opacity="1"}
                >
                  ⚖️ Cân bằng ngay
                </button>
                {(leftInput || rightInput) && (
                  <button onClick={handleReset} style={{
                    background:"var(--bg3)", border:"1px solid var(--border)",
                    color:"var(--text3)", fontFamily:"var(--font)", fontSize:"0.85rem",
                    padding:"11px 14px", borderRadius:"10px", cursor:"pointer",
                  }}>↺</button>
                )}
              </div>

              {err && (
                <div style={{
                  background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)",
                  color:"#f87171", fontSize:"0.8rem", padding:"8px 12px", borderRadius:"8px",
                }}>{err}</div>
              )}
            </div>
          )}

          {/* Preset picker */}
          {tab === "preset" && (
            <div style={{
              background:"var(--bg2)", border:"1px solid var(--border2)",
              borderRadius:"14px", overflow:"hidden",
            }}>
              <div style={{ padding:"0.75rem 1rem 0.5rem", borderBottom:"1px solid var(--border)" }}>
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
                      padding:"7px 10px 7px 30px", borderRadius:"7px", outline:"none",
                    }}
                  />
                </div>
              </div>
              <div style={{ maxHeight:"320px", overflowY:"auto", padding:"0.5rem" }}>
                {filteredPresets.map(p => {
                  const tc = TYPES[p.type];
                  return (
                    <div key={p.id} onClick={() => handlePreset(p)}
                      style={{
                        padding:"0.65rem 0.8rem", borderRadius:"8px", cursor:"pointer",
                        marginBottom:"3px", transition:"all 0.15s",
                        border:"1px solid transparent",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background="var(--bg3)"; e.currentTarget.style.borderColor=`${tc.color}30`; }}
                      onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="transparent"; }}
                    >
                      <div style={{ fontSize:"0.6rem", color:tc.color, fontFamily:"var(--mono)", marginBottom:"2px" }}>
                        {tc.icon} {tc.label}
                      </div>
                      <div style={{ fontSize:"0.82rem", fontWeight:500 }}>{p.name}</div>
                      <div style={{ fontSize:"0.62rem", color:"var(--text3)", fontFamily:"var(--mono)", marginTop:"2px" }}>
                        {p.left} → {p.right}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Result */}
        <div style={{
          background:"var(--bg2)", border:"1px solid var(--border2)",
          borderRadius:"14px", overflow:"hidden", display:"flex", flexDirection:"column",
          minHeight:"400px",
        }}>
          {/* Result header */}
          <div style={{
            padding:"0.85rem 1.1rem", borderBottom:"1px solid var(--border)",
            display:"flex", alignItems:"center", gap:"8px",
            background: result ? "rgba(52,211,153,0.05)" : "transparent",
          }}>
            <div style={{
              width:"22px", height:"22px", borderRadius:"50%",
              background: result ? "#34d399" : "var(--bg4)",
              border:`1.5px solid ${result ? "#34d399" : "var(--border)"}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"0.65rem", color: result ? "var(--bg)" : "var(--text3)",
              fontFamily:"var(--mono)", fontWeight:700, transition:"all 0.25s",
            }}>
              {result ? "✓" : "="}
            </div>
            <span style={{
              fontSize:"0.72rem", fontFamily:"var(--mono)", fontWeight:700,
              color: result ? "#34d399" : "var(--text3)", textTransform:"uppercase", letterSpacing:"0.5px",
            }}>
              {result ? "Đã cân bằng thành công!" : "Kết quả cân bằng"}
            </span>
          </div>

          <div style={{ flex:1, padding:"1.1rem", overflowY:"auto" }}>
            {!result ? (
              /* Empty state */
              <div style={{
                display:"flex", flexDirection:"column", alignItems:"center",
                justifyContent:"center", height:"100%", gap:"0.75rem",
                color:"var(--text3)", paddingTop:"3rem",
              }}>
                <div style={{ fontSize:"3rem", opacity:0.25 }}>⚖️</div>
                <div style={{ fontSize:"0.88rem", textAlign:"center", lineHeight:1.6 }}>
                  Nhập phương trình bên trái<br/>rồi nhấn <strong style={{ color:"#818cf8" }}>Cân bằng ngay</strong>
                </div>
                <div style={{
                  background:"var(--bg3)", border:"1px solid var(--border)",
                  borderRadius:"10px", padding:"0.85rem 1.1rem", marginTop:"0.5rem",
                  fontSize:"0.78rem", color:"var(--text2)", lineHeight:1.8,
                }}>
                  <strong style={{ color:"var(--accent)", display:"block", marginBottom:"4px" }}>
                    📌 Cách nhập:
                  </strong>
                  • Dùng chữ thường cho số: H<strong>2</strong>, O<strong>2</strong>, Fe<strong>3</strong>O<strong>4</strong><br/>
                  • Ngăn cách chất bằng dấu <strong>+</strong><br/>
                  • Ví dụ: <span style={{ fontFamily:"var(--mono)", color:"#818cf8" }}>Fe + O2</span> → <span style={{ fontFamily:"var(--mono)", color:"#818cf8" }}>Fe3O4</span>
                </div>
              </div>
            ) : (
              <div style={{ animation:"slideUp 0.22s ease" }}>

                {/* Phương trình đã cân bằng — BIG display */}
                <div style={{
                  background:"rgba(52,211,153,0.06)", border:"2px solid rgba(52,211,153,0.25)",
                  borderRadius:"14px", padding:"1.25rem 1.1rem", marginBottom:"1.25rem",
                  textAlign:"center",
                }}>
                  <div style={{ fontSize:"0.65rem", color:"#34d399", fontFamily:"var(--mono)", marginBottom:"8px", letterSpacing:"0.5px" }}>
                    ✓ PHƯƠNG TRÌNH ĐÃ CÂN BẰNG
                  </div>
                  <div style={{
                    fontFamily:"var(--mono)", fontSize:"clamp(0.9rem,2vw,1.15rem)",
                    fontWeight:700, color:"var(--text)", lineHeight:1.8, wordBreak:"break-all",
                  }}>
                    <span style={{ color:"#38bdf8" }}>
                      {result.reactants.map((c,i) => (
                        <span key={i}>
                          {i>0 && <span style={{ color:"var(--text3)", margin:"0 6px" }}>+</span>}
                          {c.coeff > 1 && <span style={{ color:"#fbbf24" }}>{c.coeff}</span>}
                          {toSubscript(c.formula)}
                        </span>
                      ))}
                    </span>
                    <span style={{ color:"var(--text3)", margin:"0 10px" }}>→</span>
                    <span style={{ color:"#34d399" }}>
                      {result.products.map((c,i) => (
                        <span key={i}>
                          {i>0 && <span style={{ color:"var(--text3)", margin:"0 6px" }}>+</span>}
                          {c.coeff > 1 && <span style={{ color:"#fbbf24" }}>{c.coeff}</span>}
                          {toSubscript(c.formula)}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>

                {/* Bảng kiểm tra nguyên tố */}
                <div style={{ marginBottom:"1.1rem" }}>
                  <div style={{ fontSize:"0.65rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"7px", textTransform:"uppercase", letterSpacing:"0.4px" }}>
                    Kiểm tra bảo toàn nguyên tố:
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
                    {result.elements.map(el => {
                      const left  = result.reactants.reduce((s,c) => s + c.coeff*(parseFormula(c.formula)[el]||0), 0);
                      const right = result.products.reduce((s,c)  => s + c.coeff*(parseFormula(c.formula)[el]||0), 0);
                      const ok    = left === right;
                      return (
                        <div key={el} style={{
                          background: ok ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                          border:`1px solid ${ok ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
                          borderRadius:"7px", padding:"5px 10px", textAlign:"center", minWidth:"56px",
                        }}>
                          <div style={{ fontFamily:"var(--mono)", fontSize:"0.85rem", fontWeight:700, color: ok ? "#34d399" : "#f87171" }}>
                            {el}
                          </div>
                          <div style={{ fontSize:"0.58rem", color:"var(--text3)", fontFamily:"var(--mono)" }}>
                            {left} = {right} {ok ? "✓" : "✗"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Hệ số từng chất */}
                <div style={{ marginBottom:"1.1rem" }}>
                  <div style={{ fontSize:"0.65rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"7px", textTransform:"uppercase", letterSpacing:"0.4px" }}>
                    Hệ số cân bằng:
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))", gap:"5px" }}>
                    {[...result.reactants.map(c=>({...c,side:"reactant"})), ...result.products.map(c=>({...c,side:"product"}))].map((c,i) => (
                      <div key={i} style={{
                        background:"var(--bg3)", border:`1px solid ${c.side==="reactant" ? "rgba(56,189,248,0.2)" : "rgba(52,211,153,0.2)"}`,
                        borderRadius:"8px", padding:"7px 9px", textAlign:"center",
                      }}>
                        <div style={{
                          fontFamily:"var(--mono)", fontSize:"0.82rem", fontWeight:700,
                          color: c.side==="reactant" ? "#38bdf8" : "#34d399",
                        }}>
                          {toSubscript(c.formula)}
                        </div>
                        <div style={{
                          fontFamily:"var(--mono)", fontSize:"1.1rem", fontWeight:700,
                          color:"#fbbf24", marginTop:"2px",
                        }}>
                          ×{c.coeff}
                        </div>
                        <div style={{ fontSize:"0.58rem", color:"var(--text3)", marginTop:"1px" }}>
                          {c.side==="reactant" ? "Chất TG" : "Sản phẩm"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA: Tính mol */}
                <div style={{
                  background:"linear-gradient(135deg,rgba(56,189,248,0.08),rgba(129,140,248,0.08))",
                  border:"1px solid rgba(56,189,248,0.2)",
                  borderRadius:"12px", padding:"0.9rem 1.1rem",
                  display:"flex", alignItems:"center", justifyContent:"space-between", gap:"1rem",
                  flexWrap:"wrap",
                }}>
                  <div>
                    <div style={{ fontSize:"0.82rem", fontWeight:600, marginBottom:"3px" }}>
                      Muốn tính khối lượng các chất?
                    </div>
                    <div style={{ fontSize:"0.72rem", color:"var(--text3)" }}>
                      Dùng công cụ tính mol với phương trình này
                    </div>
                  </div>
                  <button
                    onClick={() => onGoMolCalc && onGoMolCalc(result)}
                    style={{
                      background:"linear-gradient(135deg,var(--accent),#818cf8)",
                      border:"none", color:"white", fontFamily:"var(--font)",
                      fontSize:"0.82rem", fontWeight:600, padding:"9px 18px",
                      borderRadius:"9px", cursor:"pointer", whiteSpace:"nowrap",
                      display:"flex", alignItems:"center", gap:"6px",
                    }}
                  >
                    🧮 Tính mol ngay →
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, placeholder, value, onChange, hint, color }) {
  return (
    <div>
      <div style={{ fontSize:"0.7rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"5px", textTransform:"uppercase", letterSpacing:"0.3px" }}>
        {label}
      </div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width:"100%", background:"var(--bg3)", border:"1px solid var(--border)",
          color:"var(--text)", fontFamily:"var(--mono)", fontSize:"0.95rem",
          padding:"10px 13px", borderRadius:"9px", outline:"none", transition:"border 0.2s",
        }}
        onFocus={e => e.target.style.borderColor = color}
        onBlur={e => e.target.style.borderColor = "var(--border)"}
      />
      {hint && <div style={{ fontSize:"0.62rem", color:"var(--text3)", marginTop:"4px" }}>{hint}</div>}
    </div>
  );
}