import React, { useEffect, useRef } from "react";

export default function AnimCanvas({ reaction, playing, step, onStepChange }) {
  const cvRef   = useRef(null);
  const animRef = useRef(null);
  const progRef = useRef(0);
  const stepRef = useRef(step);
  const playRef = useRef(playing);

  useEffect(() => { stepRef.current = step; },    [step]);
  useEffect(() => { playRef.current = playing; }, [playing]);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    cv.width  = cv.offsetWidth  * dpr;
    cv.height = cv.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const W = cv.offsetWidth;
    const H = cv.offsetHeight;
    const R = reaction.reactants;
    const P = reaction.products;
    const T = reaction.steps ? reaction.steps.length : 4;

    // Tạo danh sách molecules cho canvas từ reactants/products
    const reactantMols = R.map(m => ({ label: m.label, color: m.color, r: 26 }));
    const productMols  = P.map(m => ({ label: m.label, color: m.color, r: 26 }));

    function drawMol(x, y, mol, alpha = 1, scale = 1) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      // Glow
      const g = ctx.createRadialGradient(0, 0, mol.r * 0.2, 0, 0, mol.r * 1.8);
      g.addColorStop(0, mol.color + "28");
      g.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(0, 0, mol.r * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();

      // Circle
      ctx.beginPath(); ctx.arc(0, 0, mol.r, 0, Math.PI * 2);
      ctx.fillStyle = mol.color + "1e"; ctx.fill();
      ctx.strokeStyle = mol.color; ctx.lineWidth = 1.8; ctx.stroke();

      // Label
      const fs = Math.max(7, mol.r * 0.52);
      ctx.fillStyle = mol.color;
      ctx.font = `bold ${fs}px 'Space Mono', monospace`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(mol.label, 0, 0);
      ctx.restore();
    }

    function burst(x, y, color) {
      ctx.save(); ctx.globalAlpha = 0.45;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * 18, y + Math.sin(a) * 18);
        ctx.strokeStyle = color || "#fb923c"; ctx.lineWidth = 2; ctx.stroke();
      }
      ctx.restore();
    }

    function getPositions(mols, areaStart, areaWidth) {
      const n = mols.length;
      return mols.map((_, i) => ({
        x: areaStart + (areaWidth / (n + 1)) * (i + 1),
        y: H * 0.5,
      }));
    }

    let last = 0;

    function loop(t) {
      ctx.clearRect(0, 0, W, H);
      const s = stepRef.current;
      const p = progRef.current;
      const n = reactantMols.length;

      const reactPos = getPositions(reactantMols, 0, W * 0.55);
      const prodPos  = getPositions(productMols,  W * 0.48, W * 0.52);
      const centerX  = W * 0.5;

      if (s === 0) {
        // Trạng thái ban đầu - reactants
        reactantMols.forEach((mol, i) => drawMol(reactPos[i].x, reactPos[i].y, mol));
      } else if (s === 1) {
        // Di chuyển về trung tâm
        reactantMols.forEach((mol, i) => {
          const sx = reactPos[i].x;
          const ex = centerX + (i - (n - 1) / 2) * 14;
          drawMol(sx + (ex - sx) * p, H * 0.5, mol);
        });
      } else if (s === 2) {
        // Va chạm + burst
        const tc = TYPES_COLOR[reaction.type] || "#fb923c";
        burst(centerX, H * 0.5, tc);
        reactantMols.forEach((mol, i) => {
          const ex = centerX + (i - (n - 1) / 2) * 14;
          drawMol(ex, H * 0.5, mol, 1 - p * 0.85, 1 - p * 0.3);
        });
      } else if (s === 3) {
        // Products xuất hiện
        productMols.forEach((mol, i) => {
          drawMol(prodPos[i].x, prodPos[i].y, mol, p, 0.3 + p * 0.7);
        });
      }

      if (playRef.current) {
        const dt = (t - last) / 1000;
        last = t;
        progRef.current = Math.min(1, progRef.current + dt * 0.7);
        if (progRef.current >= 1) {
          progRef.current = 0;
          onStepChange(Math.min(stepRef.current + 1, T - 1));
        }
      } else {
        last = t;
      }

      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [reaction]);

  return (
    <canvas
      ref={cvRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

const TYPES_COLOR = {
  hoahop:   "#38bdf8",
  phanhuy:  "#f87171",
  chay:     "#fb923c",
  trunghoa: "#818cf8",
  oxihoa:   "#34d399",
};