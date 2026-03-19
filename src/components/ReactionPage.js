import React, { useState, useEffect } from "react";
import { REACTIONS, TYPES } from "../data/reactions";
import ReactionCard, { SkeletonCard } from "./ReactionCard";
import ReactionModal from "./ReactionModal";
import CompareModal  from "./CompareModal";

const ENERGY_OPTS  = [
  { val:"all", label:"Tất cả" },
  { val:"toa", label:"🔥 Tỏa nhiệt" },
  { val:"thu", label:"❄️ Thu nhiệt" },
];

const MOL3D_OPTS = [
  { val:"all",  label:"Tất cả" },
  { val:"yes",  label:"⬡ Có mô hình 3D" },
  { val:"no",   label:"✕ Chưa có 3D" },
];

export default function ReactionPage({ filterType, isFav, onFavToggle }) {
  const [search,    setSearch]    = useState("");
  const [selected,  setSelected]  = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [energyF,   setEnergyF]   = useState("all");
  const [mol3DF,    setMol3DF]    = useState("all");
  const [showAdv,   setShowAdv]   = useState(false);
  const [compare,   setCompare]   = useState([]); // max 2 reactions
  const [showComp,  setShowComp]  = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [filterType]);

  // ── Filter logic ──
  const base = filterType === "favorites"
    ? REACTIONS.filter(r => isFav(r.id))
    : REACTIONS;

  const filtered = base.filter((r) => {
    if (filterType && filterType !== "all" && filterType !== "favorites" && r.type !== filterType) return false;
    if (energyF !== "all" && r.energy !== energyF) return false;
    if (mol3DF === "yes") {
      const has = [...r.reactants, ...r.products].some(m => m.mol);
      if (!has) return false;
    }
    if (mol3DF === "no") {
      const has = [...r.reactants, ...r.products].some(m => m.mol);
      if (has) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      if (!r.name.toLowerCase().includes(q) &&
          !r.equation.toLowerCase().includes(q) &&
          !r.desc.toLowerCase().includes(q) &&
          !(r.scientist || "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const showGroups = !filterType || filterType === "all";
  const grouped = showGroups
    ? Object.keys(TYPES).map(key => ({
        type: TYPES[key],
        items: filtered.filter(r => r.type === key),
      })).filter(g => g.items.length > 0)
    : [{ type: filterType && TYPES[filterType] ? TYPES[filterType] : null, items: filtered }];

  // ── Compare logic ──
  const handleCompare = (reaction) => {
    setCompare(prev => {
      if (prev.find(r => r.id === reaction.id)) return prev.filter(r => r.id !== reaction.id);
      if (prev.length >= 2) return [prev[1], reaction];
      return [...prev, reaction];
    });
  };
  const isInCompare = (id) => compare.some(r => r.id === id);

  const activeFilters = (energyF !== "all" ? 1 : 0) + (mol3DF !== "all" ? 1 : 0);

  return (
    <>
      {/* ── Hero ── */}
      <div className="hero">
        {filterType === "favorites" ? (
          <>
            <div className="hero-tag" style={{ color:"#f87171" }}>❤️ Danh sách yêu thích</div>
            <h1>Phản ứng đã lưu</h1>
          </>
        ) : (!filterType || filterType === "all") ? (
          <>
            <div className="hero-tag">⚗️ Thư viện phản ứng</div>
            <h1>Khám phá hóa học</h1>
          </>
        ) : TYPES[filterType] ? (
          <>
            <div className="hero-tag" style={{ color: TYPES[filterType].color }}>
              {TYPES[filterType].icon} {TYPES[filterType].label}
            </div>
            <h1>{TYPES[filterType].desc}</h1>
          </>
        ) : null}

        <p style={{ marginTop:"0.4rem", color:"var(--text2)", fontSize:"0.88rem" }}>
          {filtered.length} phản ứng
          {filterType === "favorites" && filtered.length === 0 && " — Chưa có phản ứng yêu thích"}
        </p>

        {/* Search */}
        <div className="search-wrap" style={{ marginTop:"1.1rem" }}>
          <span className="search-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            className="search-input"
            placeholder="Tìm tên phản ứng, phương trình, nhà khoa học..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Bộ lọc nâng cao toggle */}
        <button
          onClick={() => setShowAdv(v => !v)}
          style={{
            marginTop:"0.75rem",
            background: showAdv ? "rgba(56,189,248,0.12)" : "var(--bg3)",
            border: showAdv ? "1px solid rgba(56,189,248,0.35)" : "1px solid var(--border)",
            color: showAdv ? "var(--accent)" : "var(--text3)",
            fontFamily:"var(--font)", fontSize:"0.8rem",
            padding:"6px 14px", borderRadius:"20px", cursor:"pointer",
            transition:"all 0.18s", display:"inline-flex", alignItems:"center", gap:"6px",
          }}
        >
          ⚙️ Bộ lọc nâng cao
          {activeFilters > 0 && (
            <span style={{
              background:"var(--accent)", color:"var(--bg)",
              fontSize:"0.58rem", fontWeight:700, fontFamily:"var(--mono)",
              padding:"1px 5px", borderRadius:"10px",
            }}>
              {activeFilters}
            </span>
          )}
        </button>

        {/* Advanced filters panel */}
        {showAdv && (
          <div style={{
            marginTop:"0.85rem", padding:"1rem 1.25rem",
            background:"var(--bg2)", border:"1px solid var(--border2)",
            borderRadius:"12px", display:"flex", gap:"1.5rem",
            flexWrap:"wrap", maxWidth:"520px", margin:"0.85rem auto 0",
            animation:"slideUp 0.18s ease",
          }}>
            <div>
              <div style={{ fontSize:"0.65rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"6px", textTransform:"uppercase" }}>
                Năng lượng
              </div>
              <div style={{ display:"flex", gap:"5px" }}>
                {ENERGY_OPTS.map(o => (
                  <button key={o.val}
                    onClick={() => setEnergyF(o.val)}
                    style={{
                      background: energyF===o.val ? "rgba(56,189,248,0.15)" : "var(--bg3)",
                      border: energyF===o.val ? "1px solid var(--accent)" : "1px solid var(--border)",
                      color: energyF===o.val ? "var(--accent)" : "var(--text2)",
                      fontFamily:"var(--font)", fontSize:"0.76rem",
                      padding:"5px 11px", borderRadius:"7px", cursor:"pointer", transition:"all 0.15s",
                    }}
                  >{o.label}</button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize:"0.65rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"6px", textTransform:"uppercase" }}>
                Mô hình 3D
              </div>
              <div style={{ display:"flex", gap:"5px" }}>
                {MOL3D_OPTS.map(o => (
                  <button key={o.val}
                    onClick={() => setMol3DF(o.val)}
                    style={{
                      background: mol3DF===o.val ? "rgba(52,211,153,0.12)" : "var(--bg3)",
                      border: mol3DF===o.val ? "1px solid #34d399" : "1px solid var(--border)",
                      color: mol3DF===o.val ? "#34d399" : "var(--text2)",
                      fontFamily:"var(--font)", fontSize:"0.76rem",
                      padding:"5px 11px", borderRadius:"7px", cursor:"pointer", transition:"all 0.15s",
                    }}
                  >{o.label}</button>
                ))}
              </div>
            </div>

            {activeFilters > 0 && (
              <button
                onClick={() => { setEnergyF("all"); setMol3DF("all"); }}
                style={{
                  alignSelf:"flex-end",
                  background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)",
                  color:"#f87171", fontFamily:"var(--font)", fontSize:"0.76rem",
                  padding:"5px 12px", borderRadius:"7px", cursor:"pointer",
                }}
              >
                ✕ Xóa bộ lọc
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Compare bar ── */}
      {compare.length > 0 && (
        <div style={{
          position:"sticky", top:"60px", zIndex:100,
          background:"rgba(7,9,15,0.95)", backdropFilter:"blur(12px)",
          borderBottom:"1px solid var(--border2)",
          padding:"0.55rem 2rem",
          display:"flex", alignItems:"center", gap:"0.75rem", flexWrap:"wrap",
        }}>
          <span style={{ fontSize:"0.75rem", color:"var(--accent)", fontFamily:"var(--mono)" }}>
            ⇄ SO SÁNH:
          </span>
          {compare.map(r => {
            const tc = TYPES[r.type];
            return (
              <span key={r.id} style={{
                background:`${tc.color}14`, border:`1px solid ${tc.color}35`,
                color:tc.color, fontSize:"0.76rem", fontFamily:"var(--mono)",
                padding:"3px 10px", borderRadius:"6px",
                display:"flex", alignItems:"center", gap:"5px",
              }}>
                {r.name}
                <span style={{ cursor:"pointer", opacity:0.6 }}
                  onClick={() => setCompare(p => p.filter(x => x.id !== r.id))}>✕</span>
              </span>
            );
          })}
          {compare.length === 2 && (
            <button
              onClick={() => setShowComp(true)}
              style={{
                background:"linear-gradient(135deg,var(--accent),var(--accent2))",
                border:"none", color:"white", fontFamily:"var(--font)",
                fontSize:"0.8rem", fontWeight:600, padding:"6px 14px",
                borderRadius:"8px", cursor:"pointer",
              }}
            >
              ⇄ So sánh ngay
            </button>
          )}
          {compare.length < 2 && (
            <span style={{ fontSize:"0.72rem", color:"var(--text3)" }}>
              Chọn thêm {2 - compare.length} phản ứng nữa
            </span>
          )}
          <button
            onClick={() => setCompare([])}
            style={{
              marginLeft:"auto", background:"none",
              border:"1px solid var(--border)", color:"var(--text3)",
              fontFamily:"var(--font)", fontSize:"0.75rem",
              padding:"4px 10px", borderRadius:"6px", cursor:"pointer",
            }}
          >
            Hủy
          </button>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="main">

        {/* Skeleton */}
        {loading && (
          <div className="rgrid-equal">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"4rem 2rem", color:"var(--text3)" }}>
            <div style={{ fontSize:"2.5rem", marginBottom:"0.75rem" }}>
              {filterType === "favorites" ? "❤️" : "🔍"}
            </div>
            <div style={{ fontSize:"1rem", fontWeight:600, color:"var(--text2)", marginBottom:"0.4rem" }}>
              {filterType === "favorites" ? "Chưa có phản ứng yêu thích" : "Không tìm thấy kết quả"}
            </div>
            <div style={{ fontSize:"0.85rem" }}>
              {filterType === "favorites"
                ? "Nhấn ❤️ trên bất kỳ phản ứng nào để lưu vào đây"
                : "Thử từ khóa khác hoặc xóa bộ lọc"}
            </div>
          </div>
        )}

        {/* Cards */}
        {!loading && grouped.map((group, gi) => (
          <div key={gi} className={showGroups ? "type-group" : ""}>
            {showGroups && group.type && (
              <div className="type-group-hd" style={{ borderColor:group.type.color, color:group.type.color }}>
                <span className="tgh-icon">{group.type.icon}</span>
                <span className="tgh-name">{group.type.label}</span>
                <span className="tgh-desc">— {group.type.desc}</span>
                <span className="tgh-count">{group.items.length} phản ứng</span>
              </div>
            )}
            <div className="rgrid-equal">
              {group.items.map(r => (
                <ReactionCard
                  key={r.id}
                  reaction={r}
                  onClick={setSelected}
                  isFav={isFav}
                  onFavToggle={onFavToggle}
                  onCompare={handleCompare}
                  compareMode={isInCompare(r.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ReactionModal */}
      {selected && (
        <ReactionModal reaction={selected} onClose={() => setSelected(null)} />
      )}

      {/* CompareModal */}
      {showComp && compare.length === 2 && (
        <CompareModal
          reactions={compare}
          onClose={() => setShowComp(false)}
          onView={(r) => { setShowComp(false); setSelected(r); }}
        />
      )}
    </>
  );
}