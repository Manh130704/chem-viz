import React, { useEffect, useRef, useState } from "react";

/* ── Animated hex grid background ── */
function HexCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let raf;
    let t = 0;

    const resize = () => {
      cv.width  = cv.offsetWidth;
      cv.height = cv.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const HEX_SIZE = 36;
    const HEX_H    = HEX_SIZE * Math.sqrt(3);

    function hexPath(cx, cy, s) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const x = cx + s * Math.cos(a);
        const y = cy + s * Math.sin(a);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
    }

    function draw() {
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      t += 0.004;

      const cols = Math.ceil(W / (HEX_SIZE * 1.5)) + 2;
      const rows = Math.ceil(H / HEX_H) + 2;

      for (let r = -1; r < rows; r++) {
        for (let c = -1; c < cols; c++) {
          const cx = c * HEX_SIZE * 1.5;
          const cy = r * HEX_H + (c % 2 === 0 ? 0 : HEX_H / 2);
          const dist = Math.sqrt((cx - W * 0.5) ** 2 + (cy - H * 0.5) ** 2);
          const wave = Math.sin(dist * 0.018 - t) * 0.5 + 0.5;
          const alpha = wave * 0.055 + 0.018;
          ctx.strokeStyle = `rgba(56,189,248,${alpha})`;
          ctx.lineWidth = 0.8;
          hexPath(cx, cy, HEX_SIZE * 0.88);
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas ref={ref} style={{
      position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none",
    }}/>
  );
}

/* ── Animated counter ── */
function Counter({ to, duration = 1400, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(ease * to));
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ── Feature card ── */
function FeatureCard({ icon, title, desc, color, delay }) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      background:"rgba(12,16,24,0.7)", border:`1px solid ${color}22`,
      borderRadius:"16px", padding:"1.6rem 1.4rem",
      backdropFilter:"blur(12px)",
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.55s ${delay}ms ease, transform 0.55s ${delay}ms ease`,
      position:"relative", overflow:"hidden",
    }}>
      {/* Top glow line */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:"1.5px",
        background:`linear-gradient(90deg,transparent,${color}80,transparent)`,
      }}/>
      <div style={{
        width:"48px", height:"48px", borderRadius:"12px",
        background:`${color}14`, border:`1px solid ${color}28`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:"1.4rem", marginBottom:"1rem",
      }}>
        {icon}
      </div>
      <div style={{ fontSize:"1rem", fontWeight:700, marginBottom:"0.5rem", color:"var(--text)" }}>
        {title}
      </div>
      <div style={{ fontSize:"0.82rem", color:"var(--text2)", lineHeight:1.7 }}>
        {desc}
      </div>
    </div>
  );
}

/* ── Molecule orbit animation ── */
function MolOrbit() {
  const atoms = [
    { symbol:"H", color:"#38bdf8", r:68,  speed:1.8,  size:28, phase:0 },
    { symbol:"O", color:"#f87171", r:68,  speed:1.8,  size:32, phase:Math.PI },
    { symbol:"C", color:"#a78bfa", r:105, speed:1.1,  size:30, phase:0.5 },
    { symbol:"N", color:"#34d399", r:105, speed:1.1,  size:28, phase:2.2 },
    { symbol:"Fe",color:"#94a3b8", r:142, speed:0.65, size:34, phase:1.0 },
    { symbol:"Na",color:"#fbbf24", r:142, speed:0.65, size:30, phase:3.5 },
  ];
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let id;
    let last = 0;
    function loop(t) {
      if (t - last > 16) { setTick(t); last = t; }
      id = requestAnimationFrame(loop);
    }
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);

  const t = tick * 0.0006;
  const SIZE = 320;
  const cx   = SIZE / 2;

  return (
    <div style={{ position:"relative", width:SIZE, height:SIZE, flexShrink:0 }}>
      <svg width={SIZE} height={SIZE} style={{ position:"absolute", inset:0 }}>
        {/* Orbit rings */}
        {[68, 105, 142].map((r, i) => (
          <circle key={i} cx={cx} cy={cx} r={r}
            fill="none" stroke="rgba(56,189,248,0.08)" strokeWidth="1"
            strokeDasharray="4 6"
          />
        ))}
        {/* Bond lines to center */}
        {atoms.map((a, i) => {
          const angle = t * a.speed + a.phase;
          const x = cx + a.r * Math.cos(angle);
          const y = cx + a.r * Math.sin(angle);
          return (
            <line key={i} x1={cx} y1={cx} x2={x} y2={y}
              stroke={a.color} strokeWidth="0.5" strokeOpacity="0.2"/>
          );
        })}
      </svg>
      {/* Center nucleus */}
      <div style={{
        position:"absolute",
        left: cx - 24, top: cx - 24,
        width:48, height:48, borderRadius:"50%",
        background:"linear-gradient(135deg,rgba(56,189,248,0.3),rgba(129,140,248,0.3))",
        border:"1.5px solid rgba(56,189,248,0.5)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"var(--mono)", fontSize:"0.7rem", fontWeight:700,
        color:"var(--accent)", boxShadow:"0 0 20px rgba(56,189,248,0.25)",
        zIndex:2,
      }}>⬡</div>
      {/* Orbiting atoms */}
      {atoms.map((a, i) => {
        const angle = t * a.speed + a.phase;
        const x = cx + a.r * Math.cos(angle) - a.size / 2;
        const y = cx + a.r * Math.sin(angle) - a.size / 2;
        return (
          <div key={i} style={{
            position:"absolute", left:x, top:y,
            width:a.size, height:a.size, borderRadius:"50%",
            background:`radial-gradient(circle at 35% 35%,${a.color}50,${a.color}15)`,
            border:`1.5px solid ${a.color}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"var(--mono)", fontSize:"0.6rem", fontWeight:700,
            color:a.color, zIndex:2,
            boxShadow:`0 0 10px ${a.color}30`,
          }}>
            {a.symbol}
          </div>
        );
      })}
    </div>
  );
}

/* ── Reaction preview card ── */
function ReactionPreview() {
  const rxns = [
    { eq:"2H₂ + O₂ → 2H₂O",      label:"Tổng hợp Nước",    color:"#38bdf8" },
    { eq:"N₂ + 3H₂ → 2NH₃",       label:"Tổng hợp Amoniac", color:"#a78bfa" },
    { eq:"Fe + S → FeS",           label:"Hóa hợp",          color:"#fbbf24" },
    { eq:"2H₂O → 2H₂ + O₂",       label:"Điện phân Nước",   color:"#f87171" },
    { eq:"HCl + NaOH → NaCl + H₂O",label:"Trung hòa",        color:"#818cf8" },
    { eq:"2Al + Fe₂O₃ → Al₂O₃ + 2Fe",label:"Thermite",       color:"#34d399" },
  ];
  const [cur, setCur] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCur(c => (c + 1) % rxns.length), 2200);
    return () => clearInterval(id);
  }, []);
  const r = rxns[cur];
  return (
    <div style={{
      background:"rgba(12,16,24,0.85)", border:`1px solid ${r.color}30`,
      borderRadius:"12px", padding:"1rem 1.25rem",
      backdropFilter:"blur(12px)", minWidth:"260px",
      transition:"border-color 0.4s",
    }}>
      <div style={{ fontSize:"0.58rem", color:r.color, fontFamily:"var(--mono)", marginBottom:"5px", letterSpacing:"0.5px" }}>
        PHẢN ỨNG HÓA HỌC
      </div>
      <div style={{
        fontFamily:"var(--mono)", fontSize:"0.92rem", fontWeight:700,
        color:"var(--text)", lineHeight:1.5,
        transition:"color 0.3s",
        minHeight:"2.5em",
      }}>
        {r.eq}
      </div>
      <div style={{ marginTop:"6px", fontSize:"0.7rem", color:r.color, transition:"color 0.4s" }}>
        {r.label}
      </div>
      {/* Progress bar */}
      <div style={{ marginTop:"10px", height:"2px", background:"var(--bg4)", borderRadius:"2px", overflow:"hidden" }}>
        <div style={{
          height:"100%", background:r.color, borderRadius:"2px",
          animation:"progress-bar 2.2s linear infinite",
        }}/>
      </div>
    </div>
  );
}

/* ══ MAIN LANDING PAGE ══ */
export default function LandingPage({ onEnter }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const features = [
    {
      icon:"⬡", color:"#34d399", delay:0,
      title:"Mô hình 3D phân tử",
      desc:"Xem cấu trúc không gian của hơn 70 phân tử và nguyên tố. Xoay, zoom tương tác thời gian thực.",
    },
    {
      icon:"🎬", color:"#38bdf8", delay:80,
      title:"Hoạt họa phản ứng",
      desc:"40 phản ứng hóa học được minh họa bằng animation canvas và mô hình 3D trực quan.",
    },
    {
      icon:"⚖️", color:"#818cf8", delay:160,
      title:"Cân bằng phương trình",
      desc:"Nhập bất kỳ phương trình hóa học nào, hệ thống tự động tìm hệ số cân bằng chính xác.",
    },
    {
      icon:"🧮", color:"#fbbf24", delay:240,
      title:"Tính toán mol",
      desc:"Nhập khối lượng hoặc số mol một chất, tự động tính tất cả chất còn lại theo tỉ lệ.",
    },
    {
      icon:"🎯", color:"#fb923c", delay:320,
      title:"Quiz tương tác",
      desc:"Kiểm tra kiến thức với 10 câu hỏi ngẫu nhiên về phân loại, sản phẩm và điều kiện phản ứng.",
    },
    {
      icon:"⚗️", color:"#f87171", delay:400,
      title:"Bảng tuần hoàn",
      desc:"57 nguyên tố hóa học với đầy đủ thông tin, phân loại nhóm và mô hình 3D tương tác.",
    },
  ];

  return (
    <div style={{ position:"relative", overflowX:"hidden" }}>
      <style>{`
        @keyframes progress-bar {
          from { width:0%; }
          to   { width:100%; }
        }
        @keyframes float-y {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes pulse-ring {
          0%   { transform:scale(1);   opacity:0.6; }
          100% { transform:scale(1.5); opacity:0;   }
        }
        @keyframes badge-in {
          from { opacity:0; transform:translateY(-12px) scale(0.9); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
      `}</style>

      {/* ══ HERO SECTION ══ */}
      <section style={{
        position:"relative", minHeight:"100vh",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"6rem 2rem 4rem", overflow:"hidden",
      }}>
        <HexCanvas />

        {/* Radial glow center */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none",
          background:"radial-gradient(ellipse 70% 60% at 50% 50%, rgba(56,189,248,0.06) 0%, transparent 70%)",
        }}/>

        <div style={{
          maxWidth:"1100px", width:"100%", margin:"0 auto",
          display:"flex", alignItems:"center", gap:"4rem",
          flexWrap:"wrap", justifyContent:"center",
        }}>
          {/* Left: Text */}
          <div style={{ flex:"1 1 420px", maxWidth:"520px" }}>
            {/* Title */}
            <h1 style={{
              fontSize:"clamp(2rem,5vw,3.2rem)", fontWeight:800,
              lineHeight:1.15, marginBottom:"1.25rem",
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(20px)",
              transition:"opacity 0.6s 0.2s, transform 0.6s 0.2s",
            }}>
              <span style={{ color:"var(--text)" }}>Hóa học </span>
              <span style={{
                background:"linear-gradient(135deg, var(--accent) 0%, #818cf8 50%, #34d399 100%)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              }}>
                trực quan
              </span>
              <br/>
              <span style={{ color:"var(--text)" }}>cho học sinh THCS</span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize:"1rem", color:"var(--text2)", lineHeight:1.8,
              marginBottom:"2rem", maxWidth:"420px",
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(16px)",
              transition:"opacity 0.6s 0.35s, transform 0.6s 0.35s",
            }}>
              Khám phá phản ứng hóa học qua mô hình 3D, hoạt họa tương tác và
              công cụ tính toán — học hiệu quả hơn, hiểu sâu hơn.
            </p>

            {/* CTAs */}
            <div style={{
              display:"flex", gap:"0.85rem", flexWrap:"wrap",
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(14px)",
              transition:"opacity 0.6s 0.5s, transform 0.6s 0.5s",
            }}>
              <button
                onClick={onEnter}
                style={{
                  background:"linear-gradient(135deg, var(--accent), #818cf8)",
                  border:"none", color:"white", fontFamily:"var(--font)",
                  fontSize:"0.95rem", fontWeight:700,
                  padding:"13px 30px", borderRadius:"12px", cursor:"pointer",
                  display:"flex", alignItems:"center", gap:"8px",
                  boxShadow:"0 4px 20px rgba(56,189,248,0.3)",
                  transition:"transform 0.18s, box-shadow 0.18s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(56,189,248,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 20px rgba(56,189,248,0.3)"; }}
              >
                🚀 Bắt đầu khám phá
                <span style={{ fontSize:"0.8rem", opacity:0.8 }}>→</span>
              </button>

              <button
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior:"smooth" })}
                style={{
                  background:"rgba(56,189,248,0.06)", border:"1px solid rgba(56,189,248,0.25)",
                  color:"var(--accent)", fontFamily:"var(--font)",
                  fontSize:"0.9rem", fontWeight:500,
                  padding:"13px 24px", borderRadius:"12px", cursor:"pointer",
                  transition:"all 0.18s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background="rgba(56,189,248,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="rgba(56,189,248,0.06)"; }}
              >
                Xem tính năng ↓
              </button>
            </div>

            {/* Stats row */}
            <div style={{
              display:"flex", gap:"1.75rem", marginTop:"2.5rem", flexWrap:"wrap",
              opacity: visible ? 1 : 0,
              transition:"opacity 0.6s 0.7s",
            }}>
              {[
                { n:40, suf:"+", label:"Phản ứng" },
                { n:57, suf:"",  label:"Nguyên tố" },
                { n:70, suf:"+", label:"Mô hình 3D" },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily:"var(--mono)", fontSize:"1.5rem", fontWeight:800, color:"var(--accent)" }}>
                    <Counter to={s.n} />{s.suf}
                  </div>
                  <div style={{ fontSize:"0.72rem", color:"var(--text3)", marginTop:"2px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <div style={{
            flex:"0 0 auto", display:"flex", flexDirection:"column",
            alignItems:"center", gap:"1.5rem",
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateX(30px)",
            transition:"opacity 0.7s 0.4s, transform 0.7s 0.4s",
          }}>
            <div style={{ animation:"float-y 4s ease-in-out infinite" }}>
              <MolOrbit />
            </div>
            <div style={{ animation:"float-y 4s ease-in-out infinite 1.1s" }}>
              <ReactionPreview />
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{
          position:"absolute", bottom:"2rem", left:"50%", transform:"translateX(-50%)",
          display:"flex", flexDirection:"column", alignItems:"center", gap:"6px",
          opacity:0.4, animation:"float-y 2s ease-in-out infinite",
        }}>
          <span style={{ fontSize:"0.6rem", color:"var(--text3)", fontFamily:"var(--mono)", letterSpacing:"1px" }}>CUỘN XUỐNG</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </section>

      {/* ══ FEATURES SECTION ══ */}
      <section id="features" style={{
        padding:"5rem 2rem", maxWidth:"1100px", margin:"0 auto",
      }}>
        {/* Section label */}
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <div style={{
            display:"inline-block",
            fontSize:"0.65rem", color:"var(--accent)", fontFamily:"var(--mono)",
            letterSpacing:"2px", textTransform:"uppercase",
            borderBottom:"1px solid rgba(56,189,248,0.3)", paddingBottom:"6px", marginBottom:"1rem",
          }}>
            TÍNH NĂNG
          </div>
          <h2 style={{
            fontSize:"clamp(1.5rem,3vw,2.2rem)", fontWeight:700,
            color:"var(--text)", marginBottom:"0.75rem",
          }}>
            Công cụ học hóa học toàn diện
          </h2>
          <p style={{ color:"var(--text2)", fontSize:"0.92rem", maxWidth:"480px", margin:"0 auto", lineHeight:1.7 }}>
            Từ trực quan hóa 3D đến tính toán tự động — tất cả trong một nền tảng
          </p>
        </div>

        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))",
          gap:"1rem",
        }}>
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{
        padding:"4rem 2rem 5rem", maxWidth:"860px", margin:"0 auto",
      }}>
        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <div style={{
            display:"inline-block",
            fontSize:"0.65rem", color:"#34d399", fontFamily:"var(--mono)",
            letterSpacing:"2px", textTransform:"uppercase",
            borderBottom:"1px solid rgba(52,211,153,0.3)", paddingBottom:"6px", marginBottom:"1rem",
          }}>
            LUỒNG SỬ DỤNG
          </div>
          <h2 style={{ fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:700, color:"var(--text)" }}>
            Học theo quy trình khoa học
          </h2>
        </div>

        <div style={{
          display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
          gap:"0", position:"relative",
        }}>
          {[
            { step:"01", icon:"👁️", label:"Quan sát",     desc:"Xem hoạt họa và mô hình 3D phản ứng",   color:"#38bdf8" },
            { step:"02", icon:"⚖️", label:"Cân bằng",     desc:"Tự nhập và cân bằng phương trình",       color:"#818cf8" },
            { step:"03", icon:"🧮", label:"Tính toán",    desc:"Tính mol, khối lượng các chất",           color:"#34d399" },
            { step:"04", icon:"🎯", label:"Kiểm tra",     desc:"Quiz để củng cố kiến thức vừa học",       color:"#fb923c" },
          ].map((s, i) => (
            <div key={i} style={{
              padding:"1.5rem 1.25rem", textAlign:"center", position:"relative",
            }}>
              {/* Connector arrow */}
              {i < 3 && (
                <div style={{
                  position:"absolute", right:"-8px", top:"50%", transform:"translateY(-50%)",
                  color:"var(--border)", fontSize:"1.2rem", zIndex:1,
                  display:"flex", alignItems:"center",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(56,189,248,0.2)" strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              )}
              <div style={{
                width:"52px", height:"52px", borderRadius:"14px", margin:"0 auto 0.85rem",
                background:`${s.color}12`, border:`1px solid ${s.color}30`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem",
              }}>
                {s.icon}
              </div>
              <div style={{
                fontSize:"0.55rem", fontFamily:"var(--mono)", color:s.color,
                letterSpacing:"1px", marginBottom:"4px",
              }}>
                BƯỚC {s.step}
              </div>
              <div style={{ fontSize:"0.9rem", fontWeight:600, marginBottom:"5px" }}>{s.label}</div>
              <div style={{ fontSize:"0.75rem", color:"var(--text2)", lineHeight:1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section style={{ padding:"3rem 2rem 6rem" }}>
        <div style={{
          maxWidth:"680px", margin:"0 auto", textAlign:"center",
          background:"linear-gradient(135deg,rgba(56,189,248,0.06),rgba(129,140,248,0.06))",
          border:"1px solid rgba(56,189,248,0.15)",
          borderRadius:"24px", padding:"3rem 2.5rem",
          position:"relative", overflow:"hidden",
        }}>
          {/* Background decoration */}
          <div style={{
            position:"absolute", top:"-60px", right:"-60px",
            width:"200px", height:"200px", borderRadius:"50%",
            background:"radial-gradient(circle,rgba(56,189,248,0.08),transparent 70%)",
            pointerEvents:"none",
          }}/>
          <div style={{
            position:"absolute", bottom:"-40px", left:"-40px",
            width:"160px", height:"160px", borderRadius:"50%",
            background:"radial-gradient(circle,rgba(129,140,248,0.08),transparent 70%)",
            pointerEvents:"none",
          }}/>

          <div style={{
            fontSize:"0.65rem", color:"var(--accent)", fontFamily:"var(--mono)",
            letterSpacing:"2px", textTransform:"uppercase", marginBottom:"1rem",
          }}>
            SẴN SÀNG CHƯA?
          </div>

          <h2 style={{
            fontSize:"clamp(1.5rem,3vw,2.2rem)", fontWeight:800,
            marginBottom:"0.85rem", lineHeight:1.3,
          }}>
            Bắt đầu học hóa học<br/>
            <span style={{
              background:"linear-gradient(135deg,var(--accent),#818cf8)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            }}>
              theo cách mới
            </span>
          </h2>

          <p style={{ color:"var(--text2)", fontSize:"0.9rem", lineHeight:1.7, marginBottom:"2rem" }}>
            Không cần đăng ký. Không cần cài đặt.<br/>Truy cập miễn phí ngay trong trình duyệt.
          </p>

          <button
            onClick={onEnter}
            style={{
              background:"linear-gradient(135deg, var(--accent), #818cf8)",
              border:"none", color:"white", fontFamily:"var(--font)",
              fontSize:"1rem", fontWeight:700, padding:"14px 36px",
              borderRadius:"13px", cursor:"pointer",
              boxShadow:"0 6px 24px rgba(56,189,248,0.35)",
              transition:"transform 0.18s, box-shadow 0.18s",
              display:"inline-flex", alignItems:"center", gap:"10px",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 10px 32px rgba(56,189,248,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 6px 24px rgba(56,189,248,0.35)"; }}
          >
            ⚗️ Vào ChemViz ngay
          </button>

          <div style={{
            display:"flex", justifyContent:"center", gap:"1.5rem",
            marginTop:"1.5rem", flexWrap:"wrap",
          }}>
            {["✓ Miễn phí 100%", "✓ Không cần đăng ký", "✓ Hoạt động offline"].map((t, i) => (
              <span key={i} style={{ fontSize:"0.75rem", color:"var(--text3)" }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop:"1px solid var(--border)",
        padding:"1.5rem 2rem",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        flexWrap:"wrap", gap:"0.5rem",
        maxWidth:"1100px", margin:"0 auto",
        opacity:0.5,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px", fontFamily:"var(--mono)", fontSize:"0.78rem", color:"var(--accent)" }}>
          <div style={{
            width:"20px", height:"20px",
            background:"linear-gradient(135deg,var(--accent),var(--accent2))",
            clipPath:"polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:"9px",
          }}>⬡</div>
          ChemViz
        </div>
        <div style={{ fontSize:"0.72rem", color:"var(--text3)", fontFamily:"var(--mono)" }}>
          Công cụ học hóa học trực quan · THCS Việt Nam
        </div>
      </footer>
    </div>
  );
}