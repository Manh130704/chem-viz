import React, { useState, useEffect } from "react";
import { TYPES } from "../data/reactions";
import AnimCanvas from "./AnimCanvas";
import Viewer3D from "./Viewer3D";

// Steps mặc định nếu reaction không có
const DEFAULT_STEPS = [
  "Các chất tham gia ở trạng thái ban đầu",
  "Các phân tử tiếp cận nhau",
  "Liên kết bị phá vỡ và tái tạo",
  "Sản phẩm được tạo thành",
];

function MolBubble({ mol, onClick }) {
  const [hov, setHov] = useState(false);
  const has3D = !!mol.mol;

  return (
    <div
      style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"5px", cursor: has3D ? "pointer" : "default" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => has3D && onClick(mol)}
      title={has3D ? `Xem ${mol.label} 3D` : mol.label}
    >
      <div style={{
        width:"68px", height:"68px", borderRadius:"50%",
        background: `radial-gradient(circle at 35% 35%, ${mol.color}35, ${mol.color}08)`,
        border: `2px solid ${hov && has3D ? mol.color : mol.color+"45"}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow: hov && has3D ? `0 0 16px ${mol.color}50` : `0 0 6px ${mol.color}18`,
        transition:"all 0.18s", position:"relative",
        transform: hov && has3D ? "translateY(-2px) scale(1.05)" : "none",
      }}>
        <span style={{
          fontFamily:"var(--mono)", fontSize:"0.7rem", fontWeight:700,
          color: mol.color, textAlign:"center", lineHeight:1.2, padding:"0 4px",
        }}>
          {mol.label}
        </span>
        {has3D && (
          <div style={{
            position:"absolute", bottom:"-3px", right:"-3px",
            fontSize:"0.45rem", fontFamily:"var(--mono)", fontWeight:700,
            color:"#34d399", background:"#07090f",
            border:"1px solid rgba(52,211,153,0.5)",
            padding:"1px 4px", borderRadius:"3px",
          }}>
            3D
          </div>
        )}
      </div>
      <div style={{ fontSize:"0.58rem", color: has3D ? "#34d399" : "var(--text3)", fontFamily:"var(--mono)" }}>
        {has3D ? "⬡ 3D" : mol.label}
      </div>
    </div>
  );
}

export default function ReactionModal({ reaction, onClose }) {
  const [playing,  setPlaying]  = useState(false);
  const [step,     setStep]     = useState(0);
  const [tab,      setTab]      = useState("canvas"); // "canvas" | "3d"
  const [viewer3D, setViewer3D] = useState(null);

  const tc     = TYPES[reaction.type];
  const steps  = reaction.steps || DEFAULT_STEPS;
  const T      = steps.length;
  const mol3Ds = [...reaction.reactants, ...reaction.products].filter(m => m.mol);

  useEffect(() => {
    if (step >= T - 1) setPlaying(false);
  }, [step, T]);

  const handlePlay = () => {
    if (step >= T - 1) setStep(0);
    setPlaying(true);
  };

  const handleReset = () => { setPlaying(false); setStep(0); };

  return (
    <>
      <div className="rxn-ov" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="rxn-box" style={{ maxWidth:"680px" }}>

          {/* ── Header ── */}
          <div className="rxn-hd">
            <div>
              <div className="rxn-htitle">{reaction.name}</div>
              <div className="rxn-hsub" style={{ color: tc.color }}>
                {tc.icon} {tc.label} · {reaction.energyLabel} · {reaction.condition}
              </div>
            </div>
            <button className="btn-x" onClick={onClose}>✕</button>
          </div>

          {/* ── Body ── */}
          <div className="rxn-body">

            {/* Phương trình */}
            <div className="eq-box" style={{ marginBottom:"1rem", fontSize:"0.92rem" }}>
              {reaction.equation}
            </div>

            {/* ── Tab switch ── */}
            <div style={{
              display:"flex", gap:"0.4rem", marginBottom:"0.9rem",
              background:"var(--bg)", borderRadius:"9px", padding:"4px",
              border:"1px solid var(--border)",
            }}>
              {[
                { key:"canvas", icon:"🎬", label:"Hoạt họa" },
                { key:"3d",     icon:"⬡",  label:"Mô hình 3D" },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setPlaying(false); }}
                  style={{
                    flex:1, border:"none", borderRadius:"6px", cursor:"pointer",
                    padding:"7px 12px", fontFamily:"var(--font)", fontSize:"0.82rem",
                    fontWeight: tab === t.key ? 600 : 400,
                    background: tab === t.key ? tc.color + "18" : "transparent",
                    color: tab === t.key ? tc.color : "var(--text3)",
                    borderBottom: tab === t.key ? `2px solid ${tc.color}` : "2px solid transparent",
                    transition:"all 0.18s",
                  }}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* ── TAB: Canvas Animation ── */}
            {tab === "canvas" && (
              <>
                <div className="stage" style={{ marginBottom:"0.75rem" }}>
                  <AnimCanvas
                    reaction={reaction}
                    playing={playing}
                    step={step}
                    onStepChange={setStep}
                  />
                </div>

                {/* Step dots */}
                <div className="sdots">
                  {steps.map((_, i) => (
                    <div key={i} className={`sdot ${i < step ? "done" : i === step ? "active" : ""}`} />
                  ))}
                </div>

                {/* Controls */}
                <div className="anim-ctrl">
                  <button className="btn-play" onClick={handlePlay}
                    style={{ background: `linear-gradient(135deg, ${tc.color}, ${tc.color}aa)` }}
                  >
                    {playing ? "⏸ Dừng" : "▶ Phát"}
                  </button>
                  <button className="btn-rst" onClick={handleReset}>↺ Reset</button>
                  <span className="step-lbl">
                    Bước {step + 1}/{T}: {steps[step]}
                  </span>
                </div>
              </>
            )}

            {/* ── TAB: 3D Models ── */}
            {tab === "3d" && (
              <div style={{
                background:"var(--bg)", border:"1px solid var(--border)",
                borderRadius:"12px", padding:"1.25rem", marginBottom:"0.5rem",
              }}>
                {mol3Ds.length === 0 ? (
                  <div style={{ textAlign:"center", padding:"2rem", color:"var(--text3)" }}>
                    <div style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>⚗️</div>
                    <div>Chưa có mô hình 3D cho phản ứng này</div>
                  </div>
                ) : (
                  <>
                    <div style={{
                      fontSize:"0.65rem", color:"var(--text3)", fontFamily:"var(--mono)",
                      letterSpacing:"0.4px", marginBottom:"1rem", textTransform:"uppercase",
                    }}>
                      Click vào phân tử để xem cấu trúc 3D · {mol3Ds.length} mô hình có sẵn
                    </div>

                    {/* Layout: Reactants → Products */}
                    <div style={{
                      display:"flex", alignItems:"center",
                      gap:"0.75rem", flexWrap:"wrap",
                    }}>
                      {/* Reactants */}
                      <div style={{ display:"flex", gap:"0.6rem", flexWrap:"wrap", alignItems:"center" }}>
                        <div style={{ fontSize:"0.6rem", color:"var(--text3)", fontFamily:"var(--mono)", marginRight:"2px" }}>
                          CHẤT TG
                        </div>
                        {reaction.reactants.map((mol, i) => (
                          <MolBubble key={i} mol={mol} onClick={setViewer3D} />
                        ))}
                      </div>

                      {/* Arrow */}
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"3px" }}>
                        <div style={{ fontSize:"0.55rem", color: tc.color, fontFamily:"var(--mono)", whiteSpace:"nowrap" }}>
                          {reaction.condition}
                        </div>
                        <div style={{ fontSize:"1.6rem", color: tc.color, lineHeight:1 }}>→</div>
                        <div style={{ fontSize:"0.55rem", color: reaction.energy==="toa" ? "#fb923c" : "#38bdf8", fontFamily:"var(--mono)" }}>
                          {reaction.energy==="toa" ? "🔥 Tỏa nhiệt" : "❄️ Thu nhiệt"}
                        </div>
                      </div>

                      {/* Products */}
                      <div style={{ display:"flex", gap:"0.6rem", flexWrap:"wrap", alignItems:"center" }}>
                        <div style={{ fontSize:"0.6rem", color:"var(--text3)", fontFamily:"var(--mono)", marginRight:"2px" }}>
                          SẢN PHẨM
                        </div>
                        {reaction.products.map((mol, i) => (
                          <MolBubble key={i} mol={mol} onClick={setViewer3D} />
                        ))}
                      </div>
                    </div>

                    <div style={{
                      marginTop:"1rem", fontSize:"0.7rem", color:"var(--text3)",
                      display:"flex", alignItems:"center", gap:"6px",
                    }}>
                      <span style={{
                        fontSize:"0.62rem", color:"#34d399",
                        background:"rgba(52,211,153,0.1)",
                        border:"1px solid rgba(52,211,153,0.25)",
                        padding:"2px 7px", borderRadius:"4px", fontFamily:"var(--mono)",
                      }}>
                        ⬡ 3D
                      </span>
                      = có mô hình 3D · nhấn để mở viewer
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Info grid ── */}
            <div className="igrid" style={{ marginTop:"0.85rem" }}>
              <div className="iitem">
                <div className="ilbl">Loại phản ứng</div>
                <div className="ival" style={{ color: tc.color }}>{tc.icon} {tc.label}</div>
              </div>
              <div className="iitem">
                <div className="ilbl">Năng lượng</div>
                <div className="ival">{reaction.energyLabel}</div>
              </div>
              <div className="iitem">
                <div className="ilbl">Điều kiện</div>
                <div className="ival">{reaction.condition}</div>
              </div>
              <div className="iitem">
                <div className="ilbl">Mô tả</div>
                <div className="ival" style={{ fontSize:"0.77rem", color:"var(--text2)" }}>
                  {reaction.desc}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── 3D Viewer popup ── */}
      {viewer3D && (
        <Viewer3D
          moleculeName={viewer3D.label}
          molFile={viewer3D.mol}
          color={viewer3D.color}
          onClose={() => setViewer3D(null)}
        />
      )}
    </>
  );
}