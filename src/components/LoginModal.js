import React, { useState } from "react";

export default function LoginModal({ onClose, onLogin }) {
  const [mode, setMode]   = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [name, setName]   = useState("");
  const [err, setErr]     = useState("");

  const submit = () => {
    if (!email || !pass) { setErr("Vui lòng điền đầy đủ thông tin."); return; }
    if (mode === "register" && !name) { setErr("Vui lòng nhập họ tên."); return; }
    setErr("");
    onLogin(mode === "register" ? name : email.split("@")[0]);
    onClose();
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="login-box">
        <button className="btn-x" onClick={onClose}>✕</button>

        <div className="login-top">
          <div className="login-hex">⚗</div>
          <span className="login-brand">ChemViz</span>
        </div>

        <div className="login-title">
          {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
        </div>
        <div className="login-sub">
          {mode === "login" ? "Chào mừng bạn trở lại!" : "Tham gia cùng ChemViz"}
        </div>

        {err && <div className="l-err">{err}</div>}

        {mode === "register" && (
          <div className="fg">
            <label className="fl">Họ tên</label>
            <input
              className="fi" placeholder="Nguyễn Văn A"
              value={name} onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div className="fg">
          <label className="fl">Email</label>
          <input
            className="fi" type="email" placeholder="email@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="fg">
          <label className="fl">Mật khẩu</label>
          <input
            className="fi" type="password" placeholder="••••••••"
            value={pass} onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>

        <button className="btn-sub" onClick={submit}>
          {mode === "login" ? "Đăng nhập →" : "Tạo tài khoản →"}
        </button>

        <div className="l-switch">
          {mode === "login" ? (
            <>Chưa có tài khoản?{" "}
              <button onClick={() => { setMode("register"); setErr(""); }}>Đăng ký</button>
            </>
          ) : (
            <>Đã có tài khoản?{" "}
              <button onClick={() => { setMode("login"); setErr(""); }}>Đăng nhập</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}