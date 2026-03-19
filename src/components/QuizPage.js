import React, { useState, useCallback } from "react";
import { REACTIONS, TYPES } from "../data/reactions";

// Tạo ngân hàng câu hỏi từ REACTIONS
function buildQuestions() {
  const qs = [];

  REACTIONS.forEach(rxn => {
    const tc = TYPES[rxn.type];

    // Q1: Phân loại phản ứng
    const typeOpts = Object.values(TYPES).map(t => t.label);
    qs.push({
      id: `${rxn.id}_type`,
      rxn,
      question: `Phản ứng "${rxn.name}" thuộc loại nào?`,
      equation: rxn.equation,
      correct: tc.label,
      options: shuffle([tc.label, ...typeOpts.filter(l => l !== tc.label).slice(0,3)]),
      explanation: `${rxn.name} là phản ứng ${tc.label}: ${tc.desc}`,
    });

    // Q2: Sản phẩm
    const correctProd = [...new Set(rxn.products.map(m => m.label))].join(" + ");
    const wrongProds = REACTIONS
      .filter(r => r.id !== rxn.id)
      .map(r => [...new Set(r.products.map(m => m.label))].join(" + "))
      .filter(p => p !== correctProd);
    const uniqueWrong = [...new Set(wrongProds)].slice(0, 3);
    if (uniqueWrong.length >= 2) {
      qs.push({
        id: `${rxn.id}_prod`,
        rxn,
        question: `Sản phẩm của phản ứng sau là gì?`,
        equation: rxn.equation.split("→")[0] + "→ ?",
        correct: correctProd,
        options: shuffle([correctProd, ...uniqueWrong]),
        explanation: `Sản phẩm: ${correctProd}. ${rxn.desc}`,
      });
    }

    // Q3: Điều kiện
    const condOpts = [
      "Điều kiện thường", "t° cao", "Ánh sáng / t°",
      "Điện phân", "Fe xúc tác, 400-500°C", "MnO₂ xúc tác",
      "Tia lửa điện", "t° > 840°C", "V₂O₅ xúc tác, 450°C",
    ].filter(c => c !== rxn.condition);
    qs.push({
      id: `${rxn.id}_cond`,
      rxn,
      question: `Điều kiện xảy ra của phản ứng "${rxn.name}" là gì?`,
      equation: rxn.equation,
      correct: rxn.condition,
      options: shuffle([rxn.condition, ...condOpts.slice(0,3)]),
      explanation: `Điều kiện: ${rxn.condition}. ${rxn.desc}`,
    });
  });

  return shuffle(qs);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const QUIZ_LENGTH = 10;

export default function QuizPage() {
  const [phase,    setPhase]    = useState("start"); // start | playing | done
  const [questions,setQuestions]= useState([]);
  const [qIndex,   setQIndex]   = useState(0);
  const [chosen,   setChosen]   = useState(null);
  const [score,    setScore]    = useState(0);
  const [answers,  setAnswers]  = useState([]); // {q, chosen, correct}
  const [streak,   setStreak]   = useState(0);
  const [maxStreak,setMaxStreak]= useState(0);

  const startQuiz = useCallback(() => {
    const qs = buildQuestions().slice(0, QUIZ_LENGTH);
    setQuestions(qs);
    setQIndex(0);
    setChosen(null);
    setScore(0);
    setAnswers([]);
    setStreak(0);
    setMaxStreak(0);
    setPhase("playing");
  }, []);

  const handleChoose = (opt) => {
    if (chosen) return;
    setChosen(opt);
    const q = questions[qIndex];
    const correct = opt === q.correct;
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => {
        const ns = s + 1;
        setMaxStreak(m => Math.max(m, ns));
        return ns;
      });
    } else {
      setStreak(0);
    }
    setAnswers(prev => [...prev, { q, chosen: opt, correct }]);
  };

  const handleNext = () => {
    if (qIndex + 1 >= QUIZ_LENGTH) {
      setPhase("done");
    } else {
      setQIndex(i => i + 1);
      setChosen(null);
    }
  };

  const pct = Math.round((score / QUIZ_LENGTH) * 100);
  const grade =
    pct >= 90 ? { label:"Xuất sắc! 🏆", color:"#fbbf24" } :
    pct >= 70 ? { label:"Giỏi! 🎉",     color:"#34d399" } :
    pct >= 50 ? { label:"Khá 👍",        color:"#38bdf8" } :
                { label:"Cần cố gắng 💪", color:"#f87171" };

  // ── START SCREEN ──
  if (phase === "start") return (
    <div style={{ maxWidth:"560px", margin:"0 auto", padding:"0 2rem 4rem", textAlign:"center" }}>
      <div className="hero">
        <div className="hero-tag">🎯 Kiểm tra kiến thức</div>
        <h1>Quiz Hóa học</h1>
        <p>Trả lời {QUIZ_LENGTH} câu hỏi về phân loại, sản phẩm và điều kiện phản ứng</p>
      </div>

      <div style={{
        display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"0.75rem",
        marginBottom:"2rem",
      }}>
        {[
          { icon:"📝", label:"10 câu hỏi", sub:"Ngẫu nhiên mỗi lần" },
          { icon:"🎯", label:"3 dạng câu", sub:"Loại · Sản phẩm · Điều kiện" },
          { icon:"🏆", label:"Xếp hạng", sub:"Xuất sắc / Giỏi / Khá" },
        ].map((c, i) => (
          <div key={i} style={{
            background:"var(--bg2)", border:"1px solid var(--border)",
            borderRadius:"12px", padding:"1rem 0.75rem", textAlign:"center",
          }}>
            <div style={{ fontSize:"1.5rem", marginBottom:"5px" }}>{c.icon}</div>
            <div style={{ fontSize:"0.82rem", fontWeight:600, marginBottom:"3px" }}>{c.label}</div>
            <div style={{ fontSize:"0.7rem", color:"var(--text3)" }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <button
        onClick={startQuiz}
        style={{
          background:"linear-gradient(135deg,var(--accent),var(--accent2))",
          border:"none", color:"white", fontFamily:"var(--font)",
          fontSize:"1rem", fontWeight:700, padding:"13px 40px",
          borderRadius:"12px", cursor:"pointer", letterSpacing:"0.3px",
        }}
      >
        🚀 Bắt đầu Quiz
      </button>
    </div>
  );

  // ── DONE SCREEN ──
  if (phase === "done") return (
    <div style={{ maxWidth:"680px", margin:"0 auto", padding:"0 2rem 4rem" }}>
      <div className="hero" style={{ marginBottom:"1.5rem" }}>
        <div className="hero-tag" style={{ color: grade.color }}>{grade.label}</div>
        <h1>Kết quả Quiz</h1>
      </div>

      {/* Score board */}
      <div style={{
        display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.75rem",
        marginBottom:"1.5rem",
      }}>
        {[
          { label:"Điểm số",    val:`${score}/${QUIZ_LENGTH}`, color:"var(--accent)" },
          { label:"Tỉ lệ đúng", val:`${pct}%`,                color: grade.color },
          { label:"Streak cao", val:`${maxStreak} 🔥`,          color:"#fb923c" },
        ].map((s, i) => (
          <div key={i} style={{
            background:"var(--bg2)", border:`1px solid ${s.color}30`,
            borderRadius:"12px", padding:"1.1rem", textAlign:"center",
          }}>
            <div style={{ fontFamily:"var(--mono)", fontSize:"1.6rem", fontWeight:700, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:"0.72rem", color:"var(--text3)", marginTop:"4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Review answers */}
      <div style={{
        background:"var(--bg2)", border:"1px solid var(--border2)",
        borderRadius:"14px", overflow:"hidden", marginBottom:"1.5rem",
      }}>
        <div style={{ padding:"0.9rem 1.1rem", borderBottom:"1px solid var(--border)", fontSize:"0.72rem", color:"var(--text3)", fontFamily:"var(--mono)" }}>
          XEMXÉT LẠI CÁC CÂU HỎI
        </div>
        {answers.map((a, i) => {
          const tc = TYPES[a.q.rxn.type];
          return (
            <div key={i} style={{
              padding:"0.9rem 1.1rem",
              borderBottom: i < answers.length-1 ? "1px solid var(--border)" : "none",
              display:"flex", gap:"0.75rem", alignItems:"flex-start",
            }}>
              <div style={{
                width:"26px", height:"26px", borderRadius:"50%", flexShrink:0,
                background: a.correct ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
                border: `1px solid ${a.correct ? "#34d399" : "#f87171"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"0.8rem",
              }}>
                {a.correct ? "✓" : "✗"}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"0.8rem", fontWeight:500, marginBottom:"3px" }}>{a.q.question}</div>
                <div style={{ fontFamily:"var(--mono)", fontSize:"0.68rem", color:tc.color, marginBottom:"4px" }}>{a.q.rxn.equation}</div>
                {!a.correct && (
                  <div style={{ fontSize:"0.74rem", display:"flex", gap:"8px", flexWrap:"wrap" }}>
                    <span style={{ color:"#f87171" }}>✗ {a.chosen}</span>
                    <span style={{ color:"#34d399" }}>✓ {a.q.correct}</span>
                  </div>
                )}
                <div style={{ fontSize:"0.72rem", color:"var(--text3)", marginTop:"3px" }}>{a.q.explanation}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display:"flex", gap:"0.75rem", justifyContent:"center" }}>
        <button onClick={startQuiz} style={{
          background:"linear-gradient(135deg,var(--accent),var(--accent2))",
          border:"none", color:"white", fontFamily:"var(--font)",
          fontSize:"0.9rem", fontWeight:600, padding:"10px 28px",
          borderRadius:"10px", cursor:"pointer",
        }}>
          🔄 Làm lại
        </button>
        <button onClick={() => setPhase("start")} style={{
          background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text2)",
          fontFamily:"var(--font)", fontSize:"0.9rem",
          padding:"10px 20px", borderRadius:"10px", cursor:"pointer",
        }}>
          ← Trang chủ Quiz
        </button>
      </div>
    </div>
  );

  // ── PLAYING SCREEN ──
  const q  = questions[qIndex];
  const tc = TYPES[q.rxn.type];
  const progress = ((qIndex + (chosen ? 1 : 0)) / QUIZ_LENGTH) * 100;

  return (
    <div style={{ maxWidth:"600px", margin:"0 auto", padding:"2rem 2rem 4rem" }}>

      {/* Progress */}
      <div style={{ marginBottom:"1.5rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
          <span style={{ fontSize:"0.75rem", color:"var(--text3)", fontFamily:"var(--mono)" }}>
            Câu {qIndex + 1} / {QUIZ_LENGTH}
          </span>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            {streak >= 2 && (
              <span style={{
                fontSize:"0.72rem", color:"#fb923c", fontFamily:"var(--mono)",
                background:"rgba(251,146,60,0.1)", border:"1px solid rgba(251,146,60,0.3)",
                padding:"2px 8px", borderRadius:"10px",
              }}>
                🔥 {streak} liên tiếp
              </span>
            )}
            <span style={{ fontSize:"0.75rem", color:"var(--accent)", fontFamily:"var(--mono)" }}>
              {score} ✓
            </span>
          </div>
        </div>
        <div style={{ height:"5px", background:"var(--bg3)", borderRadius:"3px", overflow:"hidden" }}>
          <div style={{
            height:"100%", borderRadius:"3px",
            background:`linear-gradient(90deg,var(--accent),var(--accent2))`,
            width:`${progress}%`, transition:"width 0.4s ease",
          }} />
        </div>
      </div>

      {/* Question card */}
      <div style={{
        background:"var(--bg2)", border:`1px solid ${tc.color}30`,
        borderRadius:"18px", padding:"1.6rem",
        marginBottom:"1.1rem", animation:"slideUp 0.2s ease",
        boxShadow:`0 0 24px ${tc.color}10`,
      }}>
        {/* Type badge */}
        <div style={{ marginBottom:"0.9rem", display:"flex", alignItems:"center", gap:"7px" }}>
          <span style={{
            background:`${tc.color}14`, border:`1px solid ${tc.color}30`,
            color:tc.color, fontSize:"0.68rem", fontFamily:"var(--mono)",
            padding:"3px 9px", borderRadius:"5px",
          }}>
            {tc.icon} {tc.label}
          </span>
          <span style={{ fontSize:"0.68rem", color:"var(--text3)", fontFamily:"var(--mono)" }}>
            {q.id.endsWith("type") ? "PHÂN LOẠI" : q.id.endsWith("prod") ? "SẢN PHẨM" : "ĐIỀU KIỆN"}
          </span>
        </div>

        {/* Question */}
        <div style={{ fontSize:"0.97rem", fontWeight:600, lineHeight:1.55, marginBottom:"0.85rem" }}>
          {q.question}
        </div>

        {/* Equation */}
        <div style={{
          fontFamily:"var(--mono)", fontSize:"0.82rem", color:tc.color,
          background:`${tc.color}08`, border:`1px solid ${tc.color}20`,
          padding:"8px 12px", borderRadius:"8px",
        }}>
          {q.equation}
        </div>
      </div>

      {/* Options */}
      <div style={{ display:"flex", flexDirection:"column", gap:"0.55rem", marginBottom:"1.1rem" }}>
        {q.options.map((opt, i) => {
          const isChosen  = chosen === opt;
          const isCorrect = opt === q.correct;
          let bg = "var(--bg2)", border = "1px solid var(--border)", color = "var(--text)";
          if (chosen) {
            if (isCorrect) { bg = "rgba(52,211,153,0.12)"; border = "1px solid #34d399"; color = "#34d399"; }
            else if (isChosen) { bg = "rgba(248,113,113,0.12)"; border = "1px solid #f87171"; color = "#f87171"; }
          }

          return (
            <button key={i}
              onClick={() => handleChoose(opt)}
              disabled={!!chosen}
              style={{
                background: bg, border, color,
                fontFamily:"var(--font)", fontSize:"0.88rem", fontWeight: isChosen || (chosen && isCorrect) ? 600 : 400,
                padding:"13px 16px", borderRadius:"11px", cursor: chosen ? "default" : "pointer",
                textAlign:"left", transition:"all 0.18s", display:"flex", alignItems:"center", gap:"10px",
              }}
            >
              <span style={{
                width:"26px", height:"26px", borderRadius:"50%", flexShrink:0,
                background: chosen
                  ? (isCorrect ? "rgba(52,211,153,0.2)" : isChosen ? "rgba(248,113,113,0.2)" : "var(--bg3)")
                  : "var(--bg3)",
                border: chosen
                  ? (isCorrect ? "1px solid #34d399" : isChosen ? "1px solid #f87171" : "1px solid var(--border)")
                  : "1px solid var(--border)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"0.75rem", fontFamily:"var(--mono)",
              }}>
                {chosen
                  ? (isCorrect ? "✓" : isChosen ? "✗" : String.fromCharCode(65+i))
                  : String.fromCharCode(65+i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation + Next */}
      {chosen && (
        <div style={{ animation:"slideUp 0.18s ease" }}>
          <div style={{
            background: chosen===q.correct ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
            border: `1px solid ${chosen===q.correct ? "#34d399" : "#f87171"}40`,
            borderRadius:"10px", padding:"0.85rem 1rem", marginBottom:"0.85rem",
          }}>
            <div style={{
              fontSize:"0.8rem", fontWeight:600,
              color: chosen===q.correct ? "#34d399" : "#f87171",
              marginBottom:"4px",
            }}>
              {chosen===q.correct ? "✓ Chính xác!" : "✗ Chưa đúng"}
            </div>
            <div style={{ fontSize:"0.78rem", color:"var(--text2)", lineHeight:1.6 }}>
              {q.explanation}
            </div>
          </div>

          <button
            onClick={handleNext}
            style={{
              width:"100%",
              background:`linear-gradient(135deg,${tc.color},${tc.color}aa)`,
              border:"none", color:"white", fontFamily:"var(--font)",
              fontSize:"0.9rem", fontWeight:600, padding:"12px",
              borderRadius:"11px", cursor:"pointer",
            }}
          >
            {qIndex + 1 >= QUIZ_LENGTH ? "🏁 Xem kết quả" : "Câu tiếp theo →"}
          </button>
        </div>
      )}
    </div>
  );
}