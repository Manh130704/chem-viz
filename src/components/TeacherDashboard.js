import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

export default function TeacherDashboard() {
  const { profile } = useAuth();
  const [students,  setStudents]  = useState([]);
  const [scores,    setScores]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [classFilter, setClassFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Lấy tất cả học sinh
    const { data: studentsData } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "student")
      .order("class_name");

    // Lấy điểm quiz
    const { data: scoresData } = await supabase
      .from("quiz_scores")
      .select("*")
      .order("played_at", { ascending: false });

    setStudents(studentsData || []);
    setScores(scoresData || []);
    setLoading(false);
  };

  // Tìm điểm cao nhất của từng học sinh
  const getBestScore = (userId) => {
    const userScores = scores.filter(s => s.user_id === userId);
    if (!userScores.length) return null;
    return Math.max(...userScores.map(s => s.score));
  };

  const getPlayCount = (userId) => scores.filter(s => s.user_id === userId).length;

  // Danh sách lớp
  const classes = ["all", ...new Set(students.map(s => s.class_name))].sort();

  const filtered = classFilter === "all"
    ? students
    : students.filter(s => s.class_name === classFilter);

  // Thống kê
  const stats = {
    total:    students.length,
    played:   students.filter(s => getPlayCount(s.id) > 0).length,
    avgBest:  students.length
      ? Math.round(students.reduce((sum, s) => sum + (getBestScore(s.id) || 0), 0) / students.length * 10) / 10
      : 0,
  };

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", padding:"4rem", color:"var(--text3)" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>⏳</div>
        Đang tải dữ liệu...
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:"1000px", margin:"0 auto", padding:"0 1.5rem 4rem" }}>
      {/* Header */}
      <div style={{ padding:"2rem 0 1.5rem" }}>
        <div className="hero-tag">👨‍🏫 Giáo viên</div>
        <h1 style={{
          fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:700, marginTop:"0.5rem",
          background:"linear-gradient(135deg,#fff,#818cf8)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        }}>
          Dashboard quản lý
        </h1>
        <p style={{ color:"var(--text2)", fontSize:"0.85rem", marginTop:"0.3rem" }}>
          Xin chào, {profile?.full_name}!
        </p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"0.75rem", marginBottom:"1.5rem" }}>
        {[
          { label:"Tổng học sinh",    val:stats.total,   color:"#38bdf8", icon:"👥" },
          { label:"Đã làm Quiz",      val:stats.played,  color:"#34d399", icon:"🎯" },
          { label:"Điểm TB cao nhất", val:`${stats.avgBest}/10`, color:"#fbbf24", icon:"⭐" },
        ].map((s, i) => (
          <div key={i} style={{
            background:"var(--bg2)", border:`1px solid ${s.color}25`,
            borderRadius:"12px", padding:"1rem",
          }}>
            <div style={{ fontSize:"1.3rem", marginBottom:"5px" }}>{s.icon}</div>
            <div style={{ fontFamily:"var(--mono)", fontSize:"1.5rem", fontWeight:700, color:s.color }}>
              {s.val}
            </div>
            <div style={{ fontSize:"0.72rem", color:"var(--text3)", marginTop:"3px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter theo lớp */}
      <div style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap", marginBottom:"1.1rem" }}>
        {classes.map(c => (
          <button key={c}
            onClick={() => setClassFilter(c)}
            style={{
              padding:"6px 16px", borderRadius:"20px", cursor:"pointer",
              fontFamily:"var(--font)", fontSize:"0.8rem", transition:"all 0.15s",
              background: classFilter===c ? "rgba(129,140,248,0.15)" : "var(--bg3)",
              border: classFilter===c ? "1px solid #818cf8" : "1px solid var(--border)",
              color: classFilter===c ? "#818cf8" : "var(--text2)",
              fontWeight: classFilter===c ? 600 : 400,
            }}
          >
            {c === "all" ? "Tất cả lớp" : `Lớp ${c}`}
            {c !== "all" && (
              <span style={{ marginLeft:"5px", fontSize:"0.65rem", opacity:0.7 }}>
                ({students.filter(s=>s.class_name===c).length})
              </span>
            )}
          </button>
        ))}
        <button onClick={fetchData} style={{
          marginLeft:"auto", padding:"6px 14px", borderRadius:"20px",
          background:"var(--bg3)", border:"1px solid var(--border)",
          color:"var(--text3)", fontSize:"0.78rem", cursor:"pointer",
          fontFamily:"var(--font)",
        }}>
          🔄 Làm mới
        </button>
      </div>

      {/* Bảng học sinh */}
      <div style={{
        background:"var(--bg2)", border:"1px solid var(--border2)",
        borderRadius:"14px", overflow:"hidden",
      }}>
        {/* Table header */}
        <div style={{
          display:"grid", gridTemplateColumns:"1fr 80px 100px 100px",
          padding:"0.75rem 1rem", borderBottom:"1px solid var(--border)",
          fontSize:"0.62rem", color:"var(--text3)", fontFamily:"var(--mono)",
          textTransform:"uppercase", letterSpacing:"0.4px",
        }}>
          <div>Học sinh</div>
          <div style={{ textAlign:"center" }}>Lớp</div>
          <div style={{ textAlign:"center" }}>Điểm cao</div>
          <div style={{ textAlign:"center" }}>Số lần</div>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div style={{ padding:"3rem", textAlign:"center", color:"var(--text3)" }}>
            <div style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>👥</div>
            <div>Chưa có học sinh trong lớp này</div>
          </div>
        ) : (
          filtered.map((student, i) => {
            const best  = getBestScore(student.id);
            const plays = getPlayCount(student.id);
            return (
              <div key={student.id}
                style={{
                  display:"grid", gridTemplateColumns:"1fr 80px 100px 100px",
                  padding:"0.75rem 1rem", alignItems:"center",
                  borderBottom: i < filtered.length-1 ? "1px solid var(--border)" : "none",
                  transition:"background 0.15s",
                }}
                onMouseEnter={e=>e.currentTarget.style.background="var(--bg3)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              >
                {/* Tên */}
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <div style={{
                    width:"32px", height:"32px", borderRadius:"50%", flexShrink:0,
                    background:"linear-gradient(135deg,var(--accent),var(--accent2))",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"0.78rem", fontWeight:700, color:"white",
                  }}>
                    {student.full_name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize:"0.85rem", fontWeight:500 }}>{student.full_name}</div>
                    <div style={{ fontSize:"0.65rem", color:"var(--text3)" }}>
                      {new Date(student.created_at).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </div>

                {/* Lớp */}
                <div style={{ textAlign:"center" }}>
                  <span style={{
                    fontSize:"0.72rem", fontFamily:"var(--mono)", fontWeight:600,
                    color:"#818cf8", background:"rgba(129,140,248,0.12)",
                    border:"1px solid rgba(129,140,248,0.25)",
                    padding:"3px 8px", borderRadius:"5px",
                  }}>
                    {student.class_name}
                  </span>
                </div>

                {/* Điểm cao */}
                <div style={{ textAlign:"center" }}>
                  {best !== null ? (
                    <span style={{
                      fontFamily:"var(--mono)", fontSize:"0.88rem", fontWeight:700,
                      color: best >= 8 ? "#34d399" : best >= 5 ? "#fbbf24" : "#f87171",
                    }}>
                      {best}/10
                    </span>
                  ) : (
                    <span style={{ fontSize:"0.75rem", color:"var(--text3)" }}>—</span>
                  )}
                </div>

                {/* Số lần */}
                <div style={{ textAlign:"center" }}>
                  <span style={{ fontSize:"0.82rem", color:"var(--text2)", fontFamily:"var(--mono)" }}>
                    {plays > 0 ? `${plays} lần` : "—"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer note */}
      <div style={{
        marginTop:"1rem", fontSize:"0.72rem", color:"var(--text3)",
        textAlign:"center", lineHeight:1.6,
      }}>
        💡 Mã giáo viên để đăng ký tài khoản GV: <strong style={{ color:"var(--accent)", fontFamily:"var(--mono)" }}>CHEMVIZ2025</strong>
        <br/>Thay đổi mã này trong file <code style={{ fontFamily:"var(--mono)" }}>useAuth.js</code>
      </div>
    </div>
  );
}