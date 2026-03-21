import React, { useState } from "react";
import { REACTIONS, TYPES } from "../data/reactions";

function parseFormula(formula) {
  const f = formula.trim()
    .replace(/₀/g,"0").replace(/₁/g,"1").replace(/₂/g,"2").replace(/₃/g,"3")
    .replace(/₄/g,"4").replace(/₅/g,"5").replace(/₆/g,"6").replace(/₇/g,"7")
    .replace(/₈/g,"8").replace(/₉/g,"9");
  const map = {};
  const re = /([A-Z][a-z]?)(\d*)/g;
  let m;
  while ((m = re.exec(f)) !== null) {
    if (!m[1]) continue;
    map[m[1]] = (map[m[1]] || 0) + (m[2] ? parseInt(m[2]) : 1);
  }
  return map;
}

function parseSide(side) {
  return side.split("+").map(token => {
    const t = token.trim();
    const m = t.match(/^(\d+)?\s*([A-Za-z0-9()]+)$/);
    if (!m) return null;
    return { coeff: m[1] ? parseInt(m[1]) : 1, formula: m[2] };
  }).filter(Boolean);
}

function gcd(a, b) { return b === 0 ? Math.abs(a) : gcd(b, a % b); }
function lcm(a, b) { return (a * b) / gcd(a, b); }

function balance(reactantStr, productStr) {
  try {
    const reactants = parseSide(reactantStr);
    const products  = parseSide(productStr);
    if (!reactants.length || !products.length) return null;
    const allFormulas = [...reactants.map(r=>r.formula), ...products.map(p=>p.formula)];
    const nComp = allFormulas.length;
    const elementSet = new Set();
    allFormulas.forEach(f => Object.keys(parseFormula(f)).forEach(e => elementSet.add(e)));
    const elements = [...elementSet];
    const nElem = elements.length;
    if (nElem === 0) return null;
    const matrix = [];
    for (let i = 0; i < nElem; i++) {
      const row = new Array(nComp + 1).fill(0);
      reactants.forEach((r, j) => { const fm = parseFormula(r.formula); row[j] = fm[elements[i]] || 0; });
      products.forEach((p, j)  => { const fm = parseFormula(p.formula); row[reactants.length + j] = -(fm[elements[i]] || 0); });
      matrix.push(row);
    }
    const mat = matrix.map(r => [...r]);
    const n = mat.length;
    const cols = nComp;
    let pivotRow = 0;
    for (let col = 0; col < cols && pivotRow < n; col++) {
      let pivot = -1;
      for (let row = pivotRow; row < n; row++) { if (Math.abs(mat[row][col]) > 1e-9) { pivot = row; break; } }
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
    const coeffs = new Array(nComp).fill(0);
    coeffs[nComp - 1] = 1;
    for (let row = pivotRow - 1; row >= 0; row--) {
      let pivotCol = -1;
      for (let col = 0; col < nComp; col++) { if (Math.abs(mat[row][col]) > 1e-9) { pivotCol = col; break; } }
      if (pivotCol === -1) continue;
      let sum = 0;
      for (let col = pivotCol + 1; col < nComp; col++) sum += mat[row][col] * coeffs[col];
      coeffs[pivotCol] = -sum;
    }
    const fracs = coeffs.map(c => {
      const denom = 12;
      const num = Math.round(c * denom);
      const g = gcd(Math.abs(num), denom);
      return { num: num / g, den: denom / g };
    });
    const denLCM = fracs.reduce((acc, f) => lcm(acc, f.den), 1);
    const intCoeffs = fracs.map(f => Math.round(f.num * denLCM / f.den));
    if (intCoeffs.some(c => c <= 0)) return null;
    const g = intCoeffs.reduce((a, b) => gcd(a, b));
    const finalCoeffs = intCoeffs.map(c => c / g);
    for (const el of elements) {
      let left = 0, right = 0;
      reactants.forEach((r, i) => { left  += finalCoeffs[i] * (parseFormula(r.formula)[el] || 0); });
      products.forEach((p, i)  => { right += finalCoeffs[reactants.length + i] * (parseFormula(p.formula)[el] || 0); });
      if (Math.abs(left - right) > 0.01) return null;
    }
    return {
      reactants: reactants.map((r, i) => ({ ...r, coeff: finalCoeffs[i] })),
      products:  products.map((p, i)  => ({ ...p, coeff: finalCoeffs[reactants.length + i] })),
      elements,
    };
  } catch (e) { return null; }
}

function normInput(s) {
  return s.replace(/₀/g,"0").replace(/₁/g,"1").replace(/₂/g,"2").replace(/₃/g,"3")
          .replace(/₄/g,"4").replace(/₅/g,"5").replace(/₆/g,"6").replace(/₇/g,"7")
          .replace(/₈/g,"8").replace(/₉/g,"9");
}

function toSubscript(s) {
  return s.replace(/0/g,"₀").replace(/1/g,"₁").replace(/2/g,"₂").replace(/3/g,"₃")
          .replace(/4/g,"₄").replace(/5/g,"₅").replace(/6/g,"₆").replace(/7/g,"₇")
          .replace(/8/g,"₈").replace(/9/g,"₉");
}

const PRESETS = REACTIONS.slice(0, 20).map(r => ({
  id:r.id, name:r.name, type:r.type,
  left:  r.reactants.map(m=>m.label.replace(/[₀-₉]/g,d=>"₀₁₂₃₄₅₆₇₈₉".indexOf(d))).join(" + "),
  right: r.products.map(m=>m.label.replace(/[₀-₉]/g,d=>"₀₁₂₃₄₅₆₇₈₉".indexOf(d))).join(" + "),
}));

export default function BalancePage({ onGoMolCalc }) {
  const [leftInput,  setLeftInput]  = useState("");
  const [rightInput, setRightInput] = useState("");
  const [result,     setResult]     = useState(null);
  const [err,        setErr]        = useState("");
  const [tab,        setTab]        = useState("free");
  const [search,     setSearch]     = useState("");

  const handleBalance = () => {
    setErr(""); setResult(null);
    const L = normInput(leftInput.trim());
    const R = normInput(rightInput.trim());
    if (!L || !R) { setErr("Vui lòng nhập cả 2 vế!"); return; }
    const res = balance(L, R);
    if (!res) { setErr("Không thể cân bằng. Kiểm tra lại công thức hóa học!"); return; }
    setResult(res);
  };

  const handlePreset = (p) => {
    setLeftInput(p.left); setRightInput(p.right);
    setResult(null); setErr(""); setTab("free");
  };

  const filteredPresets = PRESETS.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.left.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth:"680px", margin:"0 auto", padding:"0 1rem 4rem" }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"1.5rem 0 1.25rem" }}>
        <div className="hero-tag">⚖️ Công cụ cân bằng</div>
        <h1 style={{
          fontSize:"clamp(1.3rem,3vw,2rem)", fontWeight:700, marginTop:"0.5rem",
          background:"linear-gradient(135deg,#fff,#818cf8)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        }}>Cân bằng phương trình</h1>
        <p style={{ color:"var(--text2)", fontSize:"0.85rem", marginTop:"0.4rem" }}>
          Nhập công thức → tự động tìm hệ số
        </p>
      </div>

      {/* Tab switch */}
      <div style={{ display:"flex", background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"10px", padding:"3px", gap:"3px", marginBottom:"1rem" }}>
        {[{k:"free",l:"✏️ Nhập tự do"},{k:"preset",l:"📋 Chọn sẵn"}].map(t => (
          <button key={t.k} onClick={()=>{setTab(t.k);}} style={{
            flex:1, padding:"8px 10px", borderRadius:"7px", cursor:"pointer",
            fontFamily:"var(--font)", fontSize:"0.82rem", border:"none",
            background:tab===t.k?"rgba(129,140,248,0.18)":"transparent",
            color:tab===t.k?"#818cf8":"var(--text3)",
            fontWeight:tab===t.k?600:400,
            borderBottom:tab===t.k?"2px solid #818cf8":"2px solid transparent",
            transition:"all 0.18s",
          }}>{t.l}</button>
        ))}
      </div>

      {/* Free input */}
      {tab === "free" && (
        <div style={{ background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:"14px", padding:"1.1rem", display:"flex", flexDirection:"column", gap:"0.85rem", marginBottom:"1rem" }}>
          {/* Left */}
          <div>
            <div style={{ fontSize:"0.68rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"5px", textTransform:"uppercase" }}>Vế trái (chất tham gia)</div>
            <input value={leftInput} onChange={e=>{setLeftInput(e.target.value);setResult(null);setErr("");}}
              placeholder="Ví dụ: H2 + O2"
              style={{ width:"100%", background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text)", fontFamily:"var(--mono)", fontSize:"1rem", padding:"11px 13px", borderRadius:"9px", outline:"none" }}
              onFocus={e=>e.target.style.borderColor="#818cf8"}
              onBlur={e=>e.target.style.borderColor="var(--border)"}
            />
            <div style={{ fontSize:"0.62rem", color:"var(--text3)", marginTop:"3px" }}>Dùng ký hiệu thường: H2, O2, Fe, NaCl...</div>
          </div>

          {/* Arrow */}
          <div style={{ textAlign:"center", color:"var(--text3)", fontSize:"1.4rem" }}>↕</div>

          {/* Right */}
          <div>
            <div style={{ fontSize:"0.68rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"5px", textTransform:"uppercase" }}>Vế phải (sản phẩm)</div>
            <input value={rightInput} onChange={e=>{setRightInput(e.target.value);setResult(null);setErr("");}}
              placeholder="Ví dụ: H2O"
              onKeyDown={e=>e.key==="Enter"&&handleBalance()}
              style={{ width:"100%", background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text)", fontFamily:"var(--mono)", fontSize:"1rem", padding:"11px 13px", borderRadius:"9px", outline:"none" }}
              onFocus={e=>e.target.style.borderColor="#818cf8"}
              onBlur={e=>e.target.style.borderColor="var(--border)"}
            />
            <div style={{ fontSize:"0.62rem", color:"var(--text3)", marginTop:"3px" }}>Nhiều chất ngăn cách bằng dấu +</div>
          </div>

          {/* Examples */}
          <div>
            <div style={{ fontSize:"0.62rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"5px" }}>VÍ DỤ NHANH:</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
              {[{l:"H2 + O2",r:"H2O"},{l:"Fe + O2",r:"Fe3O4"},{l:"Al + O2",r:"Al2O3"},{l:"Na + H2O",r:"NaOH + H2"},{l:"Fe + HCl",r:"FeCl2 + H2"}].map((ex,i)=>(
                <button key={i} onClick={()=>{setLeftInput(ex.l);setRightInput(ex.r);setResult(null);setErr("");}}
                  style={{ fontSize:"0.62rem", fontFamily:"var(--mono)", cursor:"pointer", background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text3)", padding:"4px 8px", borderRadius:"5px", transition:"all 0.15s" }}
                  onMouseEnter={e=>{e.target.style.borderColor="#818cf8";e.target.style.color="#818cf8";}}
                  onMouseLeave={e=>{e.target.style.borderColor="var(--border)";e.target.style.color="var(--text3)";}}
                >{ex.l} = {ex.r}</button>
              ))}
            </div>
          </div>

          {/* Button */}
          <div style={{ display:"flex", gap:"8px" }}>
            <button onClick={handleBalance} style={{
              flex:1, background:"linear-gradient(135deg,#818cf8,#38bdf8)",
              border:"none", color:"white", fontFamily:"var(--font)",
              fontSize:"0.95rem", fontWeight:700, padding:"12px",
              borderRadius:"10px", cursor:"pointer",
            }}>⚖️ Cân bằng ngay</button>
            {(leftInput||rightInput) && (
              <button onClick={()=>{setLeftInput("");setRightInput("");setResult(null);setErr("");}}
                style={{ background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text3)", fontFamily:"var(--font)", fontSize:"0.9rem", padding:"12px 16px", borderRadius:"10px", cursor:"pointer" }}>↺</button>
            )}
          </div>

          {err && (
            <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", color:"#f87171", fontSize:"0.82rem", padding:"8px 12px", borderRadius:"8px" }}>{err}</div>
          )}
        </div>
      )}

      {/* Preset picker */}
      {tab === "preset" && (
        <div style={{ background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:"14px", overflow:"hidden", marginBottom:"1rem" }}>
          <div style={{ padding:"0.75rem 1rem 0.5rem", borderBottom:"1px solid var(--border)" }}>
            <input placeholder="Tìm phản ứng..." value={search} onChange={e=>setSearch(e.target.value)}
              style={{ width:"100%", background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text)", fontFamily:"var(--font)", fontSize:"0.82rem", padding:"8px 12px", borderRadius:"8px", outline:"none" }}
            />
          </div>
          <div style={{ maxHeight:"350px", overflowY:"auto" }}>
            {filteredPresets.map(p=>{
              const tc = TYPES[p.type];
              return (
                <div key={p.id} onClick={()=>handlePreset(p)}
                  style={{ padding:"0.75rem 1rem", cursor:"pointer", borderBottom:"1px solid var(--border)", transition:"background 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--bg3)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                >
                  <div style={{ fontSize:"0.6rem", color:tc.color, fontFamily:"var(--mono)", marginBottom:"2px" }}>{tc.icon} {tc.label}</div>
                  <div style={{ fontSize:"0.85rem", fontWeight:500, marginBottom:"2px" }}>{p.name}</div>
                  <div style={{ fontSize:"0.65rem", color:"var(--text3)", fontFamily:"var(--mono)" }}>{p.left} → {p.right}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ background:"var(--bg2)", border:"2px solid rgba(52,211,153,0.3)", borderRadius:"14px", overflow:"hidden", animation:"slideUp 0.22s ease" }}>
          {/* Result header */}
          <div style={{ padding:"0.85rem 1rem", borderBottom:"1px solid var(--border)", background:"rgba(52,211,153,0.05)", display:"flex", alignItems:"center", gap:"8px" }}>
            <div style={{ width:"22px", height:"22px", borderRadius:"50%", background:"#34d399", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.65rem", color:"var(--bg)", fontFamily:"var(--mono)", fontWeight:700 }}>✓</div>
            <span style={{ fontSize:"0.72rem", fontFamily:"var(--mono)", fontWeight:700, color:"#34d399", textTransform:"uppercase", letterSpacing:"0.5px" }}>Đã cân bằng thành công!</span>
          </div>

          <div style={{ padding:"1rem", display:"flex", flexDirection:"column", gap:"1rem" }}>
            {/* Phương trình lớn */}
            <div style={{ background:"rgba(52,211,153,0.06)", border:"2px solid rgba(52,211,153,0.2)", borderRadius:"12px", padding:"1rem", textAlign:"center" }}>
              <div style={{ fontSize:"0.62rem", color:"#34d399", fontFamily:"var(--mono)", marginBottom:"8px" }}>✓ PHƯƠNG TRÌNH ĐÃ CÂN BẰNG</div>
              <div style={{ fontFamily:"var(--mono)", fontSize:"clamp(0.85rem,3vw,1.1rem)", fontWeight:700, lineHeight:1.8, wordBreak:"break-all" }}>
                <span style={{ color:"#38bdf8" }}>
                  {result.reactants.map((c,i)=>(
                    <span key={i}>
                      {i>0&&<span style={{ color:"var(--text3)",margin:"0 5px" }}>+</span>}
                      {c.coeff>1&&<span style={{ color:"#fbbf24" }}>{c.coeff}</span>}
                      {toSubscript(c.formula)}
                    </span>
                  ))}
                </span>
                <span style={{ color:"var(--text3)", margin:"0 10px" }}>→</span>
                <span style={{ color:"#34d399" }}>
                  {result.products.map((c,i)=>(
                    <span key={i}>
                      {i>0&&<span style={{ color:"var(--text3)",margin:"0 5px" }}>+</span>}
                      {c.coeff>1&&<span style={{ color:"#fbbf24" }}>{c.coeff}</span>}
                      {toSubscript(c.formula)}
                    </span>
                  ))}
                </span>
              </div>
            </div>

            {/* Kiểm tra nguyên tố */}
            <div>
              <div style={{ fontSize:"0.62rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"6px", textTransform:"uppercase" }}>Kiểm tra bảo toàn nguyên tố:</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
                {result.elements.map(el=>{
                  const left  = result.reactants.reduce((s,c)=>s+c.coeff*(parseFormula(c.formula)[el]||0),0);
                  const right = result.products.reduce((s,c) =>s+c.coeff*(parseFormula(c.formula)[el]||0),0);
                  const ok = left===right;
                  return (
                    <div key={el} style={{ background:ok?"rgba(52,211,153,0.1)":"rgba(248,113,113,0.1)", border:`1px solid ${ok?"rgba(52,211,153,0.3)":"rgba(248,113,113,0.3)"}`, borderRadius:"7px", padding:"5px 10px", textAlign:"center", minWidth:"52px" }}>
                      <div style={{ fontFamily:"var(--mono)", fontSize:"0.85rem", fontWeight:700, color:ok?"#34d399":"#f87171" }}>{el}</div>
                      <div style={{ fontSize:"0.56rem", color:"var(--text3)", fontFamily:"var(--mono)" }}>{left}={right} {ok?"✓":"✗"}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hệ số */}
            <div>
              <div style={{ fontSize:"0.62rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"6px", textTransform:"uppercase" }}>Hệ số cân bằng:</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
                {[...result.reactants.map(c=>({...c,side:"r"})),...result.products.map(c=>({...c,side:"p"}))].map((c,i)=>(
                  <div key={i} style={{ background:"var(--bg3)", border:`1px solid ${c.side==="r"?"rgba(56,189,248,0.2)":"rgba(52,211,153,0.2)"}`, borderRadius:"8px", padding:"6px 10px", textAlign:"center", minWidth:"70px" }}>
                    <div style={{ fontFamily:"var(--mono)", fontSize:"0.78rem", fontWeight:700, color:c.side==="r"?"#38bdf8":"#34d399" }}>{toSubscript(c.formula)}</div>
                    <div style={{ fontFamily:"var(--mono)", fontSize:"1.1rem", fontWeight:700, color:"#fbbf24", marginTop:"2px" }}>×{c.coeff}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{ background:"linear-gradient(135deg,rgba(56,189,248,0.08),rgba(129,140,248,0.08))", border:"1px solid rgba(56,189,248,0.2)", borderRadius:"12px", padding:"0.9rem" }}>
              <div style={{ fontSize:"0.85rem", fontWeight:600, marginBottom:"4px" }}>Muốn tính khối lượng các chất?</div>
              <div style={{ fontSize:"0.72rem", color:"var(--text3)", marginBottom:"0.75rem" }}>Dùng công cụ tính mol với phương trình này</div>
              <button onClick={()=>onGoMolCalc&&onGoMolCalc(result)} style={{
                width:"100%", background:"linear-gradient(135deg,var(--accent),#818cf8)",
                border:"none", color:"white", fontFamily:"var(--font)",
                fontSize:"0.88rem", fontWeight:600, padding:"11px",
                borderRadius:"10px", cursor:"pointer",
              }}>🧮 Tính mol ngay →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}