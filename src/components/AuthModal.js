import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function AuthModal({ onClose }) {
  const { signIn, signUpStudent, signUpTeacher } = useAuth();

  const [tab,         setTab]         = useState("login");   // login | student | teacher
  const [loading,     setLoading]     = useState(false);
  const [err,         setErr]         = useState("");
  const [success,     setSuccess]     = useState("");

  // Form fields
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [fullName,    setFullName]    = useState("");
  const [className,   setClassName]   = useState("");
  const [teacherCode, setTeacherCode] = useState("");

  const reset = () => { setErr(""); setSuccess(""); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); reset();
    try {
      await signIn({ email, password });
      onClose();
    } catch (err) {
      setErr(err.message === "Invalid login credentials"
        ? "Email hoặc mật khẩu không đúng!"
        : err.message);
    } finally { setLoading(false); }
  };

  const handleStudentRegister = async (e) => {
    e.preventDefault();
    setLoading(true); reset();
    try {
      await signUpStudent({ email, password, fullName, className });
      setSuccess("Đăng ký thành công! Kiểm tra email để xác nhận tài khoản.");
    } catch (err) {
      setErr(err.message.includes("already registered")
        ? "Email này đã được đăng ký!"
        : err.message);
    } finally { setLoading(false); }
  };

  const handleTeacherRegister = async (e) => {
    e.preventDefault();
    setLoading(true); reset();
    try {
      await signUpTeacher({ email, password, fullName, teacherCode });
      setSuccess("Đăng ký giáo viên thành công! Kiểm tra email để xác nhận.");
    } catch (err) {
      setErr(err.message);
    } finally { setLoading(false); }
  };

  const TABS = [
    { key:"login",   label:"Đăng nhập" },
    { key:"student", label:"HS Đăng ký" },
    { key:"teacher", label:"GV Đăng ký" },
  ];

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="login-box" style={{ maxWidth:"400px" }}>
        {/* Header */}
        <div className="login-top">
          <div className="login-hex">⬡</div>
          <span className="login-brand">ChemViz</span>
        </div>

        {/* Tabs */}
        <div style={{
          display:"flex", background:"var(--bg3)", borderRadius:"10px",
          padding:"3px", gap:"3px", marginBottom:"1.25rem",
        }}>
          {TABS.map(t => (
            <button key={t.key}
              onClick={() => { setTab(t.key); reset(); }}
              style={{
                flex:1, padding:"7px 4px", borderRadius:"7px", border:"none", cursor:"pointer",
                fontFamily:"var(--font)", fontSize:"0.76rem",
                background: tab===t.key ? "var(--bg2)" : "transparent",
                color: tab===t.key ? "var(--accent)" : "var(--text3)",
                fontWeight: tab===t.key ? 600 : 400,
                transition:"all 0.15s",
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* ── ĐĂNG NHẬP ── */}
        {tab === "login" && (
          <form onSubmit={handleLogin}>
            <div className="login-title">Chào mừng trở lại!</div>
            <div className="login-sub">Đăng nhập để lưu tiến độ học tập</div>

            <div className="fg">
              <label className="fl">Email</label>
              <input className="fi" type="email" placeholder="email@gmail.com"
                value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div className="fg">
              <label className="fl">Mật khẩu</label>
              <input className="fi" type="password" placeholder="••••••••"
                value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>

            {err     && <div className="l-err">{err}</div>}
            {success && <div style={{ background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.3)", color:"#34d399", fontSize:"0.8rem", padding:"8px 12px", borderRadius:"7px", marginBottom:"0.85rem" }}>{success}</div>}

            <button className="btn-sub" type="submit" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="l-switch">
              Chưa có tài khoản?{" "}
              <button type="button" onClick={() => setTab("student")}>Đăng ký ngay</button>
            </div>
          </form>
        )}

        {/* ── ĐĂNG KÝ HỌC SINH ── */}
        {tab === "student" && (
          <form onSubmit={handleStudentRegister}>
            <div className="login-title">Đăng ký học sinh</div>
            <div className="login-sub">Tạo tài khoản để lưu điểm và tiến độ</div>

            <div className="fg">
              <label className="fl">Họ và tên</label>
              <input className="fi" type="text" placeholder="Nguyễn Văn A"
                value={fullName} onChange={e=>setFullName(e.target.value)} required />
            </div>

            <div className="fg">
              <label className="fl">Lớp</label>
              <select className="fi" value={className} onChange={e=>setClassName(e.target.value)} required
                style={{ cursor:"pointer" }}>
                <option value="">-- Chọn lớp --</option>
                {["8A","8B","8C","8D","8E","9A","9B","9C","9D","9E"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="fg">
              <label className="fl">Email</label>
              <input className="fi" type="email" placeholder="email@gmail.com"
                value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>

            <div className="fg">
              <label className="fl">Mật khẩu</label>
              <input className="fi" type="password" placeholder="Tối thiểu 6 ký tự"
                value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} />
            </div>

            {err     && <div className="l-err">{err}</div>}
            {success && <div style={{ background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.3)", color:"#34d399", fontSize:"0.8rem", padding:"8px 12px", borderRadius:"7px", marginBottom:"0.85rem" }}>{success}</div>}

            <button className="btn-sub" type="submit" disabled={loading}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>

            <div className="l-switch">
              Đã có tài khoản?{" "}
              <button type="button" onClick={() => setTab("login")}>Đăng nhập</button>
            </div>
          </form>
        )}

        {/* ── ĐĂNG KÝ GIÁO VIÊN ── */}
        {tab === "teacher" && (
          <form onSubmit={handleTeacherRegister}>
            <div className="login-title">Đăng ký giáo viên</div>
            <div className="login-sub">Cần mã xác nhận từ quản trị viên</div>

            <div className="fg">
              <label className="fl">Họ và tên</label>
              <input className="fi" type="text" placeholder="Thầy/Cô Nguyễn Văn A"
                value={fullName} onChange={e=>setFullName(e.target.value)} required />
            </div>

            <div className="fg">
              <label className="fl">Mã giáo viên</label>
              <input className="fi" type="text" placeholder="Nhập mã xác nhận"
                value={teacherCode} onChange={e=>setTeacherCode(e.target.value)} required />
              <div style={{ fontSize:"0.65rem", color:"var(--text3)", marginTop:"3px" }}>
                Liên hệ quản trị viên để nhận mã
              </div>
            </div>

            <div className="fg">
              <label className="fl">Email</label>
              <input className="fi" type="email" placeholder="email@gmail.com"
                value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>

            <div className="fg">
              <label className="fl">Mật khẩu</label>
              <input className="fi" type="password" placeholder="Tối thiểu 6 ký tự"
                value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} />
            </div>

            {err     && <div className="l-err">{err}</div>}
            {success && <div style={{ background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.3)", color:"#34d399", fontSize:"0.8rem", padding:"8px 12px", borderRadius:"7px", marginBottom:"0.85rem" }}>{success}</div>}

            <button className="btn-sub" type="submit" disabled={loading}>
              {loading ? "Đang đăng ký..." : "Đăng ký giáo viên"}
            </button>
          </form>
        )}

        <button className="btn-x" onClick={onClose} style={{ position:"absolute", top:"1rem", right:"1rem" }}>✕</button>
      </div>
    </div>
  );
}