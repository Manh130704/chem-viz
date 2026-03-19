import React, { useEffect, useRef, useState } from "react";

export default function Viewer3D({ moleculeName, molFile, color, onClose }) {
  const containerRef = useRef(null);
  const viewerRef    = useRef(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!molFile) { setStatus("error"); return; }

    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/molecules/${molFile}`);
        if (!res.ok) throw new Error("404");
        const molData = await res.text();
        if (cancelled || !containerRef.current) return;

        const $3Dmol = await import("3dmol");
        if (cancelled || !containerRef.current) return;

        const el = containerRef.current;

        const viewer = $3Dmol.createViewer(el, {
          backgroundColor: "0x07090f",
          antialias: true,
        });
        viewerRef.current = viewer;

        // Parse thủ công từ V2000 để đếm atoms/bonds
        const lines = molData.split("\n");
        // Dòng 4 (index 3) là counts line: aaabbblll...
        const countsLine = lines[3] || "";
        const numAtoms = parseInt(countsLine.substring(0, 3).trim()) || 0;

        // Thêm model với format sdf (V2000 tương thích sdf)
        viewer.addModel(molData, "sdf");

        if (numAtoms <= 1) {
          // Nguyên tử đơn: chỉ dùng sphere to
          viewer.setStyle({}, {
            sphere: { color: color, radius: 1.2 },
          });
        } else {
          // Phân tử nhiều nguyên tử: sphere + stick
          viewer.setStyle({}, {
            sphere: { colorscheme: "Jmol", scale: 0.35 },
            stick:  { colorscheme: "Jmol", radius: 0.14 },
          });
        }

        viewer.zoomTo();
        // Zoom thêm một chút để thấy rõ hơn
        viewer.zoom(numAtoms <= 1 ? 0.6 : 0.8);
        viewer.render();
        viewer.spin("y", 1);
        setStatus("ok");

      } catch (e) {
        console.error("Viewer3D error:", e);
        if (!cancelled) setStatus("error");
      }
    };

    const timer = setTimeout(load, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (viewerRef.current) {
        try { viewerRef.current.spin(false); } catch (_) {}
      }
    };
  }, [molFile, moleculeName, color]);

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(7,9,15,0.92)",
        backdropFilter: "blur(14px)",
        zIndex: 400,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
        animation: "fadeIn 0.18s ease",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#0c1018",
        border: `1px solid ${color}40`,
        borderRadius: "18px",
        overflow: "hidden",
        animation: "slideUp 0.22s ease",
        boxShadow: `0 0 50px ${color}15`,
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1rem 1.25rem", width: "460px",
          borderBottom: "1px solid rgba(56,189,248,0.08)",
        }}>
          <div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color, fontFamily: "var(--mono)" }}>
              {moleculeName}
            </div>
            <div style={{ fontSize: "0.74rem", color: "var(--text3)", marginTop: "2px" }}>
              Cấu trúc phân tử 3D · Kéo chuột để xoay
            </div>
          </div>
          <button className="btn-x" onClick={onClose}>✕</button>
        </div>

        {/* Viewer */}
        <div style={{ position: "relative", width: "460px", height: "320px", background: "#07090f" }}>
          <div
            ref={containerRef}
            style={{ width: "460px", height: "320px", position: "relative" }}
          />

          {status === "loading" && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 10,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "0.75rem",
              background: "#07090f",
            }}>
              <div style={{
                width: "38px", height: "38px",
                border: `3px solid ${color}25`,
                borderTop: `3px solid ${color}`,
                borderRadius: "50%",
                animation: "spin3d 0.75s linear infinite",
              }} />
              <span style={{ fontSize: "0.82rem", color: "var(--text3)" }}>
                Đang tải mô hình 3D...
              </span>
            </div>
          )}

          {status === "error" && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 10,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "0.5rem",
              background: "#07090f",
            }}>
              <div style={{ fontSize: "2.5rem" }}>⚗️</div>
              <div style={{ fontSize: "0.88rem", color: "var(--text2)", fontWeight: 500 }}>
                Không thể hiển thị mô hình 3D
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text3)" }}>{molFile}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "0.8rem 1.25rem", width: "460px",
          borderTop: "1px solid rgba(56,189,248,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: "0.73rem", color: "var(--text3)" }}>
            🖱 Kéo xoay · Cuộn zoom · Click phải dịch chuyển
          </span>
          {status === "ok" && (
            <span style={{
              fontSize: "0.68rem", fontFamily: "var(--mono)",
              color: "#34d399", background: "rgba(52,211,153,0.1)",
              border: "1px solid rgba(52,211,153,0.2)",
              padding: "3px 8px", borderRadius: "5px",
            }}>
              ✓ 3D LIVE
            </span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin3d { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}