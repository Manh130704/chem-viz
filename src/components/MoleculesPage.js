import React, { useState } from "react";
import Viewer3D from "./Viewer3D";

// Map symbol → tên file .mol chính xác theo danh sách thư mục
const MOL_MAP = {
  "H":  "H.mol",
  "He": "He.mol",
  "Li": "Li.mol",
  "Be": "Be.mol",
  "B":  "B.mol",
  "C":  "C.mol",
  "N":  "N2.mol",
  "O":  "O.mol",
  "F":  "F2.mol",
  "Ne": "Ne.mol",
  "Na": "Na.mol",
  "Mg": "Mg.mol",
  "Al": "Al.mol",
  "Si": "Si.mol",
  "P":  "P.mol",
  "S":  "S.mol",
  "Cl": "Cl2.mol",
  "Ar": "Ar.mol",
  "K":  "K.mol",
  "Ca": "Ca.mol",
  "Ti": "Ti.mol",
  "V":  "V.mol",
  "Cr": "Cr.mol",
  "Mn": "Mn.mol",
  "Fe": "Fe.mol",
  "Ni": "Ni.mol",
  "Cu": "Cu.mol",
  "Zn": "Zn.mol",
  "Ga": "Ga.mol",
  "Ge": "Ge.mol",
  "As": "As.mol",
  "Se": "Se.mol",
  "Br": "Br2.mol",
  "Kr": "Kr.mol",
  "Rb": "Rb.mol",
  "Sr": "Sr.mol",
  "Pd": "Pd.mol",
  "Ag": "Ag.mol",
  "In": "In.mol",
  "Sn": "Sn.mol",
  "Sb": "Sb.mol",
  "Te": "Te.mol",
  "I":  "I.mol",
  "Xe": "Xe.mol",
  "Cs": "Cs.mol",
  "Ba": "Ba.mol",
  "Pt": "Pt.mol",
  "Au": "Au.mol",
  "Hg": "Hg.mol",
  "Tl": "TL.mol",
  "Pb": "Pb.mol",
  "Bi": "Bi.mol",
  "At": "At2.mol",
  "Ra": "Ra.mol",
  "Fr": "Fr.mol",
  "W":  "W.mol",
};

const ELEMENTS = [
  { z:1,  symbol:"H",  name:"Hydro",        mass:"1.008",   group:"pk",   period:1, color:"#38bdf8" },
  { z:2,  symbol:"He", name:"Heli",          mass:"4.003",   group:"kh",   period:1, color:"#f87171" },
  { z:3,  symbol:"Li", name:"Liti",          mass:"6.941",   group:"kkm",  period:2, color:"#fb923c" },
  { z:4,  symbol:"Be", name:"Beri",          mass:"9.012",   group:"kkmt", period:2, color:"#fbbf24" },
  { z:5,  symbol:"B",  name:"Bo",            mass:"10.811",  group:"bk",   period:2, color:"#a78bfa" },
  { z:6,  symbol:"C",  name:"Carbon",        mass:"12.011",  group:"bk",   period:2, color:"#a78bfa" },
  { z:7,  symbol:"N",  name:"Nitơ",          mass:"14.007",  group:"pk",   period:2, color:"#38bdf8" },
  { z:8,  symbol:"O",  name:"Oxy",           mass:"15.999",  group:"pk",   period:2, color:"#38bdf8" },
  { z:9,  symbol:"F",  name:"Flo",           mass:"18.998",  group:"hal",  period:2, color:"#34d399" },
  { z:10, symbol:"Ne", name:"Neon",          mass:"20.180",  group:"kh",   period:2, color:"#f87171" },
  { z:11, symbol:"Na", name:"Natri",         mass:"22.990",  group:"kkm",  period:3, color:"#fb923c" },
  { z:12, symbol:"Mg", name:"Magie",         mass:"24.305",  group:"kkmt", period:3, color:"#fbbf24" },
  { z:13, symbol:"Al", name:"Nhôm",          mass:"26.982",  group:"klk",  period:3, color:"#94a3b8" },
  { z:14, symbol:"Si", name:"Silic",         mass:"28.086",  group:"bk",   period:3, color:"#a78bfa" },
  { z:15, symbol:"P",  name:"Phốt pho",      mass:"30.974",  group:"pk",   period:3, color:"#38bdf8" },
  { z:16, symbol:"S",  name:"Lưu huỳnh",     mass:"32.06",   group:"pk",   period:3, color:"#38bdf8" },
  { z:17, symbol:"Cl", name:"Clo",           mass:"35.45",   group:"hal",  period:3, color:"#34d399" },
  { z:18, symbol:"Ar", name:"Argon",         mass:"39.948",  group:"kh",   period:3, color:"#f87171" },
  { z:19, symbol:"K",  name:"Kali",          mass:"39.098",  group:"kkm",  period:4, color:"#fb923c" },
  { z:20, symbol:"Ca", name:"Canxi",         mass:"40.078",  group:"kkmt", period:4, color:"#fbbf24" },
  { z:22, symbol:"Ti", name:"Titan",         mass:"47.867",  group:"kctt", period:4, color:"#94a3b8" },
  { z:23, symbol:"V",  name:"Vanadi",        mass:"50.942",  group:"kctt", period:4, color:"#94a3b8" },
  { z:24, symbol:"Cr", name:"Crom",          mass:"51.996",  group:"kctt", period:4, color:"#94a3b8" },
  { z:25, symbol:"Mn", name:"Mangan",        mass:"54.938",  group:"kctt", period:4, color:"#94a3b8" },
  { z:26, symbol:"Fe", name:"Sắt",           mass:"55.845",  group:"kctt", period:4, color:"#94a3b8" },
  { z:28, symbol:"Ni", name:"Niken",         mass:"58.693",  group:"kctt", period:4, color:"#94a3b8" },
  { z:29, symbol:"Cu", name:"Đồng",          mass:"63.546",  group:"kctt", period:4, color:"#fb923c" },
  { z:30, symbol:"Zn", name:"Kẽm",           mass:"65.38",   group:"kctt", period:4, color:"#94a3b8" },
  { z:31, symbol:"Ga", name:"Gali",          mass:"69.723",  group:"klk",  period:4, color:"#94a3b8" },
  { z:32, symbol:"Ge", name:"Gemani",        mass:"72.630",  group:"bk",   period:4, color:"#a78bfa" },
  { z:33, symbol:"As", name:"Asen",          mass:"74.922",  group:"bk",   period:4, color:"#a78bfa" },
  { z:34, symbol:"Se", name:"Selen",         mass:"78.971",  group:"pk",   period:4, color:"#38bdf8" },
  { z:35, symbol:"Br", name:"Brom",          mass:"79.904",  group:"hal",  period:4, color:"#34d399" },
  { z:36, symbol:"Kr", name:"Kripton",       mass:"83.798",  group:"kh",   period:4, color:"#f87171" },
  { z:37, symbol:"Rb", name:"Rubidi",        mass:"85.468",  group:"kkm",  period:5, color:"#fb923c" },
  { z:38, symbol:"Sr", name:"Stronti",       mass:"87.62",   group:"kkmt", period:5, color:"#fbbf24" },
  { z:46, symbol:"Pd", name:"Paladi",        mass:"106.42",  group:"kctt", period:5, color:"#94a3b8" },
  { z:47, symbol:"Ag", name:"Bạc",           mass:"107.868", group:"kctt", period:5, color:"#e2e8f0" },
  { z:49, symbol:"In", name:"Indi",          mass:"114.818", group:"klk",  period:5, color:"#94a3b8" },
  { z:50, symbol:"Sn", name:"Thiếc",         mass:"118.710", group:"klk",  period:5, color:"#94a3b8" },
  { z:51, symbol:"Sb", name:"Antimon",       mass:"121.760", group:"bk",   period:5, color:"#a78bfa" },
  { z:52, symbol:"Te", name:"Telua",         mass:"127.60",  group:"bk",   period:5, color:"#a78bfa" },
  { z:53, symbol:"I",  name:"Iot",           mass:"126.904", group:"hal",  period:5, color:"#34d399" },
  { z:54, symbol:"Xe", name:"Xenon",         mass:"131.293", group:"kh",   period:5, color:"#f87171" },
  { z:55, symbol:"Cs", name:"Xesi",          mass:"132.905", group:"kkm",  period:6, color:"#fb923c" },
  { z:56, symbol:"Ba", name:"Bari",          mass:"137.327", group:"kkmt", period:6, color:"#fbbf24" },
  { z:74, symbol:"W",  name:"Vonfram",       mass:"183.84",  group:"kctt", period:6, color:"#94a3b8" },
  { z:78, symbol:"Pt", name:"Platin",        mass:"195.084", group:"kctt", period:6, color:"#e2e8f0" },
  { z:79, symbol:"Au", name:"Vàng",          mass:"196.967", group:"kctt", period:6, color:"#fbbf24" },
  { z:80, symbol:"Hg", name:"Thủy ngân",     mass:"200.592", group:"kctt", period:6, color:"#94a3b8" },
  { z:81, symbol:"Tl", name:"Tali",          mass:"204.383", group:"klk",  period:6, color:"#94a3b8" },
  { z:82, symbol:"Pb", name:"Chì",           mass:"207.2",   group:"klk",  period:6, color:"#94a3b8" },
  { z:83, symbol:"Bi", name:"Bitmut",        mass:"208.980", group:"klk",  period:6, color:"#94a3b8" },
  { z:85, symbol:"At", name:"Astatin",       mass:"210",     group:"hal",  period:6, color:"#34d399" },
  { z:86, symbol:"Rn", name:"Radon",         mass:"222",     group:"kh",   period:6, color:"#f87171" },
  { z:87, symbol:"Fr", name:"Franxi",        mass:"223",     group:"kkm",  period:7, color:"#fb923c" },
  { z:88, symbol:"Ra", name:"Radi",          mass:"226",     group:"kkmt", period:7, color:"#fbbf24" },
];

const GROUP_MAP = {
  all:  { label:"Tất cả",               color:"#38bdf8", border:"rgba(56,189,248,.2)",  bg:"rgba(56,189,248,.08)",  badge:"TẤT CẢ"       },
  kkm:  { label:"Kim loại kiềm",        color:"#fb923c", border:"rgba(251,146,60,.2)",  bg:"rgba(251,146,60,.08)",  badge:"KIM KIỀM"     },
  kkmt: { label:"Kim loại kiềm thổ",    color:"#fbbf24", border:"rgba(251,191,36,.2)",  bg:"rgba(251,191,36,.08)",  badge:"KIỀM THỔ"     },
  kctt: { label:"Kim loại chuyển tiếp", color:"#94a3b8", border:"rgba(148,163,184,.2)", bg:"rgba(148,163,184,.08)", badge:"CHUYỂN TIẾP"  },
  klk:  { label:"Kim loại khác",        color:"#94a3b8", border:"rgba(148,163,184,.2)", bg:"rgba(148,163,184,.08)", badge:"KL KHÁC"      },
  bk:   { label:"Á kim",                color:"#a78bfa", border:"rgba(167,139,250,.2)", bg:"rgba(167,139,250,.08)", badge:"Á KIM"        },
  pk:   { label:"Phi kim",              color:"#38bdf8", border:"rgba(56,189,248,.2)",  bg:"rgba(56,189,248,.08)",  badge:"PHI KIM"      },
  hal:  { label:"Halogen",              color:"#34d399", border:"rgba(52,211,153,.2)",  bg:"rgba(52,211,153,.08)",  badge:"HALOGEN"      },
  kh:   { label:"Khí hiếm",             color:"#f87171", border:"rgba(248,113,113,.2)", bg:"rgba(248,113,113,.08)", badge:"KHÍ HIẾM"     },
};

export default function MoleculesPage() {
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");
  const [viewer3D, setViewer3D] = useState(null);

  const list = ELEMENTS.filter((el) => {
    const matchGroup  = filter === "all" || el.group === filter;
    const matchSearch = !search ||
      el.name.toLowerCase().includes(search.toLowerCase()) ||
      el.symbol.toLowerCase().includes(search.toLowerCase());
    return matchGroup && matchSearch;
  });

  const open3D = (el, e) => {
    e.stopPropagation();
    setViewer3D({ symbol: el.symbol, molFile: MOL_MAP[el.symbol], color: el.color });
  };

  return (
    <>
      {/* Hero */}
      <div className="mol-hero">
        <div className="hero-tag">⚛️ Bảng tuần hoàn</div>
        <h2>Các nguyên tố hóa học</h2>
        <p style={{ marginTop: "0.5rem" }}>
          {ELEMENTS.length} nguyên tố · {Object.keys(MOL_MAP).length} mô hình 3D · Click ô để xem chi tiết
        </p>
        <div className="search-wrap" style={{ marginTop: "1rem" }}>
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Tìm theo tên hoặc ký hiệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="ftabs">
        {Object.entries(GROUP_MAP).map(([k, v]) => (
          <button
            key={k}
            className={`ftab ${filter === k ? "active" : ""}`}
            onClick={() => setFilter(k)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
        gap: "0.65rem",
        maxWidth: "1200px", margin: "0 auto", padding: "0 2rem 4rem",
      }}>
        {list.map((el) => {
          const gm     = GROUP_MAP[el.group] || GROUP_MAP.pk;
          const hasMol = !!MOL_MAP[el.symbol];

          return (
            <div
              key={el.z}
              onClick={(e) => hasMol && open3D(el, e)}
              style={{
                background: "rgba(12,16,24,0.85)",
                border: `1px solid ${el.color}25`,
                borderRadius: "11px",
                padding: "0.75rem 0.6rem 0.65rem",
                cursor: hasMol ? "pointer" : "default",
                transition: "all 0.18s",
                backdropFilter: "blur(8px)",
                position: "relative",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                if (hasMol) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = `${el.color}60`;
                  e.currentTarget.style.boxShadow = `0 6px 20px ${el.color}15`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.borderColor = `${el.color}25`;
                e.currentTarget.style.boxShadow = "";
              }}
            >
              {/* Số nguyên tử */}
              <div style={{
                position: "absolute", top: "5px", left: "7px",
                fontSize: "0.58rem", color: "var(--text3)",
                fontFamily: "var(--mono)",
              }}>
                {el.z}
              </div>

              {/* Badge 3D */}
              {hasMol && (
                <div style={{
                  position: "absolute", top: "4px", right: "6px",
                  fontSize: "0.5rem", fontFamily: "var(--mono)", fontWeight: 700,
                  color: "#34d399", background: "rgba(52,211,153,0.12)",
                  border: "1px solid rgba(52,211,153,0.28)",
                  padding: "1px 4px", borderRadius: "3px",
                }}>
                  3D
                </div>
              )}

              {/* Ký hiệu */}
              <div style={{
                fontSize: "1.55rem", fontWeight: 700,
                color: el.color, fontFamily: "var(--mono)",
                lineHeight: 1, marginTop: "6px", marginBottom: "3px",
              }}>
                {el.symbol}
              </div>

              {/* Tên */}
              <div style={{
                fontSize: "0.68rem", color: "var(--text2)",
                marginBottom: "2px", lineHeight: 1.2,
              }}>
                {el.name}
              </div>

              {/* Khối lượng */}
              <div style={{
                fontSize: "0.6rem", color: "var(--text3)",
                fontFamily: "var(--mono)", marginBottom: "6px",
              }}>
                {el.mass}
              </div>

              {/* Badge nhóm */}
              <span style={{
                fontSize: "0.55rem", fontFamily: "var(--mono)", fontWeight: 700,
                color: gm.color, background: gm.bg,
                border: `1px solid ${gm.border}`,
                padding: "2px 5px", borderRadius: "3px",
              }}>
                {gm.badge}
              </span>

              {/* Hint xem 3D */}
              {hasMol && (
                <div style={{
                  marginTop: "6px",
                  fontSize: "0.6rem", color: el.color,
                  opacity: 0.6,
                }}>
                  ⬡ nhấn để xem 3D
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Chú thích */}
      <div style={{
        maxWidth: "1200px", margin: "0 auto",
        padding: "0 2rem 4rem",
        display: "flex", flexWrap: "wrap", gap: "0.45rem",
      }}>
        <div style={{
          width: "100%", fontSize: "0.7rem",
          color: "var(--text3)", marginBottom: "0.35rem",
          fontFamily: "var(--mono)",
        }}>
          CHÚ THÍCH NHÓM NGUYÊN TỐ:
        </div>
        {Object.entries(GROUP_MAP).filter(([k]) => k !== "all").map(([k, v]) => (
          <div key={k} style={{
            display: "flex", alignItems: "center", gap: "5px",
            background: v.bg, border: `1px solid ${v.border}`,
            borderRadius: "6px", padding: "4px 9px",
            fontSize: "0.72rem", color: v.color,
          }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: v.color }} />
            {v.label}
          </div>
        ))}
      </div>

      {/* 3D Viewer */}
      {viewer3D && (
        <Viewer3D
          moleculeName={viewer3D.symbol}
          molFile={viewer3D.molFile}
          color={viewer3D.color}
          onClose={() => setViewer3D(null)}
        />
      )}
    </>
  );
}