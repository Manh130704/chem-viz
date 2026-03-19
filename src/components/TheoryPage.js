import React, { useState } from "react";

const CHAPTERS = [
  // ── HÓA 8 ──
  {
    id:"h8_1", grade:8, title:"Chất – Nguyên tử – Phân tử",
    color:"#38bdf8", icon:"⚛️",
    summary:"Vật chất cấu tạo từ nguyên tử. Phân tử là hạt đại diện cho chất, mang tính chất hóa học của chất đó.",
    sections:[
      {
        title:"1. Chất và hỗn hợp",
        content:"Chất tinh khiết có thành phần xác định, tính chất nhất định (nước cất, muối ăn, nhôm...). Hỗn hợp gồm nhiều chất trộn lẫn, tính chất thay đổi theo tỉ lệ (nước muối, không khí...). Tách hỗn hợp bằng lọc, chưng cất, bay hơi, chiết.",
      },
      {
        title:"2. Nguyên tử",
        content:"Nguyên tử gồm hạt nhân (proton mang điện +, neutron trung hòa) và vỏ electron (mang điện −). Số proton = số electron = số hiệu nguyên tử Z. Khối lượng nguyên tử tập trung ở hạt nhân. Nguyên tử trung hòa điện.",
      },
      {
        title:"3. Nguyên tố hóa học",
        content:"Nguyên tố hóa học là tập hợp các nguyên tử có cùng số proton. Ký hiệu hóa học gồm 1-2 chữ cái. Nguyên tử khối là khối lượng nguyên tử tính theo đơn vị cacbon (đvC). Ví dụ: H=1, O=16, Fe=56, Ca=40.",
      },
      {
        title:"4. Phân tử và đơn chất, hợp chất",
        content:"Phân tử là hạt vi mô đại diện cho chất. Đơn chất: chỉ 1 nguyên tố (H₂, O₂, Fe, Cu). Hợp chất: từ 2 nguyên tố trở lên (H₂O, NaCl, H₂SO₄). Phân tử khối = tổng nguyên tử khối các nguyên tố.",
      },
    ],
    formulas:[
      { label:"Phân tử khối", formula:"M = Σ(n × M_nguyên_tử)", note:"n là số nguyên tử mỗi loại" },
    ],
    examples:[
      { q:"Tính phân tử khối của H₂SO₄", a:"M = 2×1 + 32 + 4×16 = 2 + 32 + 64 = 98 đvC" },
      { q:"Tính phân tử khối của Ca(OH)₂", a:"M = 40 + 2×(16+1) = 40 + 34 = 74 đvC" },
    ],
  },
  {
    id:"h8_2", grade:8, title:"Phản ứng hóa học",
    color:"#fb923c", icon:"🔥",
    summary:"Phản ứng hóa học là quá trình biến đổi chất này thành chất khác. Tổng khối lượng các chất tham gia bằng tổng khối lượng sản phẩm (bảo toàn khối lượng).",
    sections:[
      {
        title:"1. Hiện tượng vật lý và hóa học",
        content:"Hiện tượng vật lý: chất không đổi về thành phần hóa học (băng tan, nước bay hơi, hòa tan đường). Hiện tượng hóa học (phản ứng): tạo chất mới (đốt cháy, rỉ sét, lên men). Dấu hiệu: xuất hiện kết tủa, khí, thay đổi màu sắc, tỏa nhiệt/phát sáng.",
      },
      {
        title:"2. Điều kiện và dấu hiệu phản ứng",
        content:"Điều kiện: nhiệt độ, xúc tác, ánh sáng, áp suất... Phản ứng xảy ra khi có đủ điều kiện. Dấu hiệu phản ứng: tạo chất kết tủa (↓), khí bay ra (↑), đổi màu, tỏa nhiệt hoặc phát sáng.",
      },
      {
        title:"3. Phương trình hóa học",
        content:"Phương trình hóa học biểu diễn ngắn gọn phản ứng bằng công thức. Cách lập: viết sơ đồ → cân bằng số nguyên tử mỗi nguyên tố (không thay đổi chỉ số, chỉ thêm hệ số). Ý nghĩa: cho biết tỉ lệ mol các chất tham gia và sản phẩm.",
      },
      {
        title:"4. Định luật bảo toàn khối lượng",
        content:"Trong phản ứng hóa học, tổng khối lượng các chất tham gia bằng tổng khối lượng các sản phẩm. m(A) + m(B) = m(C) + m(D). Nguyên nhân: số nguyên tử mỗi nguyên tố được bảo toàn, chỉ sắp xếp lại liên kết.",
      },
    ],
    formulas:[
      { label:"Bảo toàn khối lượng", formula:"Σm(chất TG) = Σm(sản phẩm)", note:"Luôn đúng trong mọi phản ứng" },
      { label:"Tính khối lượng", formula:"m = n × M", note:"m(g), n(mol), M(g/mol)" },
    ],
    examples:[
      { q:"Đốt 4g S trong O₂ thu được SO₂. Tính khối lượng O₂ cần dùng.", a:"S + O₂ → SO₂ | n(S) = 4/32 = 0,125 mol → n(O₂) = 0,125 mol → m(O₂) = 0,125 × 32 = 4g" },
    ],
  },
  {
    id:"h8_3", grade:8, title:"Mol và tính toán hóa học",
    color:"#a78bfa", icon:"🧮",
    summary:"Mol là đơn vị đo lường lượng chất. 1 mol chứa 6,022×10²³ hạt (số Avogadro). Mol liên kết giữa khối lượng, thể tích khí và nồng độ dung dịch.",
    sections:[
      {
        title:"1. Mol là gì?",
        content:"1 mol là lượng chất chứa 6,022×10²³ hạt (nguyên tử/phân tử/ion...). Số Avogadro N = 6,022×10²³. Khối lượng mol (M) là khối lượng của 1 mol chất, đơn vị g/mol, bằng phân tử khối về trị số. Ví dụ: M(H₂O) = 18 g/mol.",
      },
      {
        title:"2. Chuyển đổi mol – khối lượng – thể tích",
        content:"n = m/M (tính mol từ khối lượng). m = n×M (tính khối lượng từ mol). Ở đktc (0°C, 1atm): 1 mol khí = 22,4 lít. V = n×22,4 (thể tích khí ở đktc). n = V/22,4.",
      },
      {
        title:"3. Tỉ khối chất khí",
        content:"Tỉ khối của khí A so với khí B: d(A/B) = M(A)/M(B). Tỉ khối so với không khí: d(A/kk) = M(A)/29. M(A) > 29: nặng hơn không khí, M(A) < 29: nhẹ hơn không khí.",
      },
      {
        title:"4. Nồng độ dung dịch",
        content:"Nồng độ phần trăm: C% = m(ct)/m(dd) × 100%. Nồng độ mol: CM = n/V (mol/lít). Pha loãng: CM1×V1 = CM2×V2. Pha trộn: C%1×m1 + C%2×m2 = C%×(m1+m2).",
      },
    ],
    formulas:[
      { label:"Mol – khối lượng", formula:"n = m / M", note:"n(mol), m(g), M(g/mol)" },
      { label:"Mol – thể tích (đktc)", formula:"n = V / 22,4", note:"V tính bằng lít, ở 0°C 1atm" },
      { label:"Nồng độ mol", formula:"CM = n / V", note:"V tính bằng lít" },
      { label:"Nồng độ %", formula:"C% = m(ct) / m(dd) × 100%", note:"" },
    ],
    examples:[
      { q:"Tính thể tích của 0,25 mol CO₂ ở đktc", a:"V = 0,25 × 22,4 = 5,6 lít" },
      { q:"Hòa tan 10g NaOH vào 240g nước. Tính C%", a:"C% = 10/(10+240) × 100% = 4%" },
    ],
  },
  {
    id:"h8_4", grade:8, title:"Oxi – Không khí",
    color:"#f87171", icon:"💨",
    summary:"Oxi là nguyên tố phổ biến nhất trên Trái Đất, chiếm 21% thể tích không khí. Oxi tác dụng được với hầu hết kim loại, phi kim và hợp chất.",
    sections:[
      {
        title:"1. Tính chất của Oxi",
        content:"Tính chất vật lý: khí không màu, không mùi, không vị, nặng hơn không khí (d=32/29≈1,1), tan ít trong nước. Tính chất hóa học: oxi là phi kim hoạt động mạnh, có tính oxi hóa. Tác dụng với kim loại (trừ Au, Pt): 3Fe + 2O₂ → Fe₃O₄. Tác dụng phi kim: S + O₂ → SO₂; C + O₂ → CO₂. Tác dụng hợp chất: CH₄ + 2O₂ → CO₂ + 2H₂O.",
      },
      {
        title:"2. Điều chế Oxi",
        content:"Trong PTN: nhiệt phân KClO₃ (xúc tác MnO₂): 2KClO₃ → 2KCl + 3O₂↑; nhiệt phân KMnO₄: 2KMnO₄ → K₂MnO₄ + MnO₂ + O₂↑. Trong CN: chưng cất phân đoạn không khí lỏng; điện phân nước: 2H₂O → 2H₂ + O₂.",
      },
      {
        title:"3. Oxit – Phân loại",
        content:"Oxit là hợp chất của 2 nguyên tố, trong đó có oxi. Oxit axit: SO₂, CO₂, P₂O₅ → tác dụng nước tạo axit. Oxit bazơ: CaO, Na₂O, Fe₂O₃ → tác dụng nước tạo bazơ (hoặc bị axit phân hủy). Oxit lưỡng tính: Al₂O₃, ZnO → tác dụng cả axit lẫn bazơ.",
      },
      {
        title:"4. Không khí và sự cháy",
        content:"Không khí: 78% N₂, 21% O₂, 1% khí khác. Sự cháy: phản ứng của chất với O₂, tỏa nhiệt, phát sáng. Điều kiện bốc cháy: đạt nhiệt độ cháy, đủ O₂. Dập tắt: hạ nhiệt dưới nhiệt độ cháy HOẶC cách ly với O₂.",
      },
    ],
    formulas:[
      { label:"Hiệu suất điều chế", formula:"H% = V(thực tế) / V(lý thuyết) × 100%", note:"" },
    ],
    examples:[
      { q:"Đốt 6,4g S trong O₂. Tính thể tích O₂ cần (đktc)", a:"S + O₂ → SO₂ | n(S)=6,4/32=0,2mol → n(O₂)=0,2mol → V=0,2×22,4=4,48 lít" },
    ],
  },
  {
    id:"h8_5", grade:8, title:"Hiđro – Nước",
    color:"#38bdf8", icon:"💧",
    summary:"Hiđro là nguyên tố nhẹ nhất, có tính khử mạnh. Nước là dung môi phổ biến, có vai trò sống còn trong tự nhiên và hóa học.",
    sections:[
      {
        title:"1. Tính chất của Hiđro",
        content:"Tính chất vật lý: khí không màu, không mùi, nhẹ nhất (M=2). Tính khử: H₂ + CuO → Cu + H₂O (khử CuO). H₂ + Fe₂O₃ → Fe + H₂O. Phản ứng với phi kim: H₂ + Cl₂ → 2HCl; N₂ + 3H₂ ⇌ 2NH₃ (xúc tác). H₂ cháy trong O₂: 2H₂ + O₂ → 2H₂O (hỗn hợp nổ!).",
      },
      {
        title:"2. Điều chế Hiđro",
        content:"Trong PTN: Zn + H₂SO₄ loãng → ZnSO₄ + H₂↑; Fe + 2HCl → FeCl₂ + H₂↑. Trong CN: điện phân nước, điện phân dung dịch NaCl, reforming khí tự nhiên (CH₄ + H₂O → CO + 3H₂).",
      },
      {
        title:"3. Tính chất của Nước",
        content:"Nước tác dụng kim loại mạnh (Na, K, Ca): 2Na + 2H₂O → 2NaOH + H₂↑. Nước tác dụng oxit bazơ: Na₂O + H₂O → 2NaOH; CaO + H₂O → Ca(OH)₂. Nước tác dụng oxit axit: CO₂ + H₂O → H₂CO₃; SO₃ + H₂O → H₂SO₄; P₂O₅ + 3H₂O → 2H₃PO₄.",
      },
    ],
    formulas:[
      { label:"Hiđro khử oxit", formula:"H₂ + CuO → Cu + H₂O", note:"Nhiệt độ cao" },
    ],
    examples:[
      { q:"Cho 2,24 lít H₂ (đktc) khử CuO. Tính khối lượng Cu thu được", a:"n(H₂)=2,24/22,4=0,1mol → n(Cu)=0,1mol → m(Cu)=0,1×64=6,4g" },
    ],
  },
  {
    id:"h8_6", grade:8, title:"Dung dịch – Axit – Bazơ – Muối",
    color:"#34d399", icon:"🧪",
    summary:"Axit cho H⁺, bazơ cho OH⁻. Phản ứng trung hòa tạo muối và nước. Đây là nền tảng của hóa học vô cơ.",
    sections:[
      {
        title:"1. Dung dịch",
        content:"Dung dịch: hỗn hợp đồng nhất gồm dung môi + chất tan. Độ tan (S): số gam chất tan tối đa trong 100g dung môi ở nhiệt độ nhất định. Dung dịch bão hòa: đã hòa tan tối đa. Dung dịch chưa bão hòa: có thể hòa tan thêm.",
      },
      {
        title:"2. Axit",
        content:"Axit là chất khi tan trong nước phân li ra ion H⁺. Công thức: HₙA (n là hóa trị của gốc axit). Axit mạnh: HCl, H₂SO₄, HNO₃ (phân li hoàn toàn). Axit yếu: H₂CO₃, H₂S, CH₃COOH. Tính chất: làm quỳ tím hóa đỏ, tác dụng kim loại → muối + H₂, tác dụng oxit bazơ → muối + nước, tác dụng bazơ → muối + nước, tác dụng muối.",
      },
      {
        title:"3. Bazơ (Kiềm)",
        content:"Bazơ là chất khi tan trong nước phân li ra ion OH⁻. Kiềm: NaOH, KOH, Ca(OH)₂, Ba(OH)₂ (tan trong nước). Bazơ không tan: Fe(OH)₂, Cu(OH)₂, Al(OH)₃. Tính chất: làm quỳ tím hóa xanh, phenolphthalein hóa hồng, tác dụng axit → muối + nước, bazơ không tan bị nhiệt phân.",
      },
      {
        title:"4. Muối",
        content:"Muối là hợp chất gồm cation kim loại (hoặc NH₄⁺) và anion gốc axit. Muối axit: còn H có thể phân li (NaHCO₃, NaHSO₄). Muối trung hòa: Na₂CO₃, NaCl, CuSO₄. Tính chất: tác dụng axit, bazơ, muối khác, kim loại; nhiệt phân muối không bền (CaCO₃, NaHCO₃).",
      },
    ],
    formulas:[
      { label:"Trung hòa", formula:"Axit + Bazơ → Muối + H₂O", note:"Phản ứng trao đổi" },
      { label:"Axit + KL", formula:"Axit + Kim loại → Muối + H₂↑", note:"KL đứng trước H trong dãy hoạt động" },
      { label:"Axit + Oxit bazơ", formula:"Axit + Oxit bazơ → Muối + H₂O", note:"" },
    ],
    examples:[
      { q:"Cho 5,6g Fe tác dụng HCl dư. Tính V(H₂) ở đktc", a:"Fe + 2HCl → FeCl₂ + H₂ | n(Fe)=5,6/56=0,1mol → n(H₂)=0,1mol → V=2,24 lít" },
    ],
  },

  // ── HÓA 9 ──
  {
    id:"h9_1", grade:9, title:"Oxit – Axit – Bazơ – Muối (nâng cao)",
    color:"#fbbf24", icon:"⚗️",
    summary:"Hóa 9 hệ thống và mở rộng tính chất hóa học của 4 loại hợp chất vô cơ, với nhiều phản ứng và ứng dụng thực tế hơn.",
    sections:[
      {
        title:"1. Tính chất hóa học của Oxit",
        content:"Oxit bazơ: + H₂O → bazơ (nếu tan được); + axit → muối + H₂O; + oxit axit → muối. Oxit axit: + H₂O → axit; + bazơ → muối + H₂O; + oxit bazơ → muối. Ví dụ: CaO + CO₂ → CaCO₃; SO₃ + 2NaOH → Na₂SO₄ + H₂O.",
      },
      {
        title:"2. Tính chất hóa học của Axit",
        content:"Axit + quỳ tím → đỏ. Axit + kim loại (trước H) → muối + H₂↑. Axit + oxit bazơ → muối + H₂O. Axit + bazơ → muối + H₂O (trung hòa). Axit + muối → muối mới + axit mới (axit tạo thành yếu hơn hoặc kết tủa/bay hơi).",
      },
      {
        title:"3. Tính chất hóa học của Bazơ",
        content:"Kiềm + quỳ tím → xanh. Kiềm + axit → muối + H₂O. Kiềm + oxit axit → muối + H₂O. Kiềm + muối → muối mới + bazơ mới (nếu tạo kết tủa hoặc khí). Bazơ không tan: Fe(OH)₂, Cu(OH)₂ bị nhiệt phân → oxit + H₂O.",
      },
      {
        title:"4. Tính chất hóa học của Muối",
        content:"Muối + axit → muối mới + axit mới. Muối + bazơ → muối mới + bazơ mới (kết tủa). Muối + kim loại → muối mới + kim loại mới (đứng trước đẩy sau). Muối + muối → 2 muối mới (cả 2 kết tủa hoặc 1 kết tủa). Nhiệt phân muối: CaCO₃ → CaO + CO₂↑.",
      },
    ],
    formulas:[
      { label:"Muối + KL", formula:"CuSO₄ + Fe → FeSO₄ + Cu", note:"Fe đứng trước Cu trong dãy HĐ" },
      { label:"Muối + Muối", formula:"BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl", note:"Tạo kết tủa BaSO₄" },
    ],
    examples:[
      { q:"Cho Na₂CO₃ tác dụng HCl. Viết PTHH và tính V(CO₂) nếu dùng 10,6g Na₂CO₃", a:"Na₂CO₃ + 2HCl → 2NaCl + H₂O + CO₂↑ | n(Na₂CO₃)=10,6/106=0,1mol → n(CO₂)=0,1mol → V=2,24 lít" },
    ],
  },
  {
    id:"h9_2", grade:9, title:"Kim loại",
    color:"#94a3b8", icon:"⚙️",
    summary:"Kim loại chiếm 80% nguyên tố hóa học. Tính chất đặc trưng: dẫn điện, dẫn nhiệt, dẻo, ánh kim. Trong phản ứng, kim loại nhường electron (bị oxi hóa).",
    sections:[
      {
        title:"1. Tính chất vật lý của kim loại",
        content:"Tính dẻo (dát mỏng, kéo sợi), dẫn điện, dẫn nhiệt, ánh kim. Khác nhau về: nhiệt độ nóng chảy (Hg: −39°C, W: 3410°C), độ cứng (K mềm, Cr cứng nhất), khối lượng riêng (Li nhẹ nhất 0,5g/cm³, Os nặng nhất 22,6g/cm³).",
      },
      {
        title:"2. Tính chất hóa học của kim loại",
        content:"Tác dụng với phi kim: 2Fe + 3Cl₂ → 2FeCl₃; 2Al + 3S → Al₂S₃. Tác dụng với axit: Fe + H₂SO₄ loãng → FeSO₄ + H₂↑; Cu + H₂SO₄ đặc nóng → CuSO₄ + SO₂ + H₂O. Tác dụng với dung dịch muối: Fe + CuSO₄ → FeSO₄ + Cu↓. Tác dụng với nước: Na + H₂O → NaOH + H₂↑.",
      },
      {
        title:"3. Nhôm (Al)",
        content:"Nhôm nhẹ (D=2,7g/cm³), dẫn điện tốt. Tác dụng oxi: 4Al + 3O₂ → 2Al₂O₃ (lớp Al₂O₃ bảo vệ). Tác dụng axit: 2Al + 3H₂SO₄ → Al₂(SO₄)₃ + 3H₂↑. Al thụ động trong H₂SO₄ đặc nguội và HNO₃ đặc nguội. Tính lưỡng tính: tác dụng cả axit lẫn NaOH: 2Al + 2NaOH + 2H₂O → 2NaAlO₂ + 3H₂↑.",
      },
      {
        title:"4. Sắt (Fe)",
        content:"Fe có 2 hóa trị: +2 (với HCl, H₂SO₄ loãng) và +3 (với Cl₂, H₂SO₄ đặc, HNO₃). Tác dụng O₂: 3Fe + 2O₂ → Fe₃O₄ (cháy); 4Fe + 3O₂ + 6H₂O → 4Fe(OH)₃ (gỉ). Gang (2-5% C): cứng, giòn. Thép (<2% C): dẻo, bền hơn. Chống gỉ: sơn, mạ, hợp kim.",
      },
    ],
    formulas:[
      { label:"Al + NaOH", formula:"2Al + 2NaOH + 2H₂O → 2NaAlO₂ + 3H₂↑", note:"Tính lưỡng tính của Al" },
      { label:"Nhiệt nhôm", formula:"2Al + Fe₂O₃ → Al₂O₃ + 2Fe", note:"t° cao, phản ứng Thermite" },
    ],
    examples:[
      { q:"Cho 5,4g Al tác dụng NaOH dư. Tính V(H₂) đktc", a:"2Al + 2NaOH + 2H₂O → 2NaAlO₂ + 3H₂↑ | n(Al)=5,4/27=0,2mol → n(H₂)=0,3mol → V=6,72 lít" },
    ],
  },
  {
    id:"h9_3", grade:9, title:"Phi kim – Halogen",
    color:"#34d399", icon:"🌿",
    summary:"Phi kim chiếm 20% nguyên tố, nhận electron trong phản ứng (tính oxi hóa). Các halogen (F, Cl, Br, I) hoạt động mạnh, tính oxi hóa giảm dần từ F đến I.",
    sections:[
      {
        title:"1. Tính chất của phi kim",
        content:"Phi kim: không dẫn điện (trừ graphite), không dẫn nhiệt, không có ánh kim. Tác dụng với kim loại: Fe + S → FeS; 2Fe + 3Cl₂ → 2FeCl₃. Tác dụng với H₂: H₂ + Cl₂ → 2HCl; N₂ + 3H₂ ⇌ 2NH₃. Tác dụng với O₂: S + O₂ → SO₂; C + O₂ → CO₂ (đủ O₂).",
      },
      {
        title:"2. Clo (Cl₂)",
        content:"Khí vàng lục, mùi hắc, độc. Tác dụng kim loại: 2Fe + 3Cl₂ → 2FeCl₃. Tác dụng H₂: H₂ + Cl₂ → 2HCl (ánh sáng). Tác dụng nước: Cl₂ + H₂O ⇌ HCl + HClO (nước clo). Tác dụng NaOH: Cl₂ + 2NaOH → NaCl + NaClO + H₂O (nước Javel). Điều chế: MnO₂ + 4HCl → MnCl₂ + Cl₂↑ + 2H₂O.",
      },
      {
        title:"3. Cacbon (C) và hợp chất",
        content:"C có 3 dạng thù hình: kim cương (cứng nhất), than chì (graphite), fullerene. C có tính khử: C + O₂ → CO₂; 2C + O₂ thiếu → 2CO; CO₂ + C → 2CO (lò cao). CO là chất khử: CO + CuO → Cu + CO₂. CO₂: oxit axit, tác dụng nước → H₂CO₃, tác dụng NaOH → Na₂CO₃ hoặc NaHCO₃.",
      },
      {
        title:"4. Silic (Si) và CN Silicat",
        content:"Si: á kim, bán dẫn, vật liệu điện tử. SiO₂: oxit axit, không tác dụng nước, tác dụng HF. CN Silicat: sản xuất gốm, sứ, thủy tinh, xi măng. Xi măng: nung CaCO₃ + SiO₂ + Al₂O₃ → Clinker → nghiền → xi măng.",
      },
    ],
    formulas:[
      { label:"Clo + nước", formula:"Cl₂ + H₂O ⇌ HCl + HClO", note:"Nước clo có tính tẩy màu" },
      { label:"CO khử oxit", formula:"CO + CuO → Cu + CO₂", note:"t° cao" },
    ],
    examples:[
      { q:"Dẫn 4,48L Cl₂ (đktc) vào NaOH dư. Tính khối lượng NaCl tạo thành", a:"Cl₂ + 2NaOH → NaCl + NaClO + H₂O | n(Cl₂)=0,2mol → n(NaCl)=0,2mol → m=0,2×58,5=11,7g" },
    ],
  },
  {
    id:"h9_4", grade:9, title:"Hóa học hữu cơ cơ bản",
    color:"#fb923c", icon:"🧬",
    summary:"Hợp chất hữu cơ là hợp chất của cacbon (trừ CO, CO₂, muối cacbonat). Có hàng triệu hợp chất hữu cơ, là nền tảng của sự sống.",
    sections:[
      {
        title:"1. Metan (CH₄)",
        content:"Khí không màu, không mùi, nhẹ hơn không khí. Phản ứng cháy: CH₄ + 2O₂ → CO₂ + 2H₂O (tỏa nhiều nhiệt). Phản ứng thế với Cl₂ (ánh sáng): CH₄ + Cl₂ → CH₃Cl + HCl. Có trong khí tự nhiên, khí biogas, khí mỏ dầu.",
      },
      {
        title:"2. Etilen (C₂H₄) và Axetilen (C₂H₂)",
        content:"Etilen: CH₂=CH₂ (liên kết đôi). Phản ứng cộng: C₂H₄ + Br₂ → C₂H₄Br₂ (mất màu nước brom). Trùng hợp: nCH₂=CH₂ → (-CH₂-CH₂-)ₙ (polyethylene PE). Axetilen: CH≡CH (liên kết ba). Cháy: 2C₂H₂ + 5O₂ → 4CO₂ + 2H₂O (ngọn lửa hàn cắt kim loại).",
      },
      {
        title:"3. Benzen (C₆H₆)",
        content:"Vòng 6 cacbon, cấu trúc phẳng. Là dung môi hữu cơ. Phản ứng thế với Br₂ (xúc tác Fe): C₆H₆ + Br₂ → C₆H₅Br + HCl. Cháy: 2C₆H₆ + 15O₂ → 12CO₂ + 6H₂O (ngọn lửa muội). Dễ thế, khó cộng (khác với etilen).",
      },
      {
        title:"4. Rượu etylic, Axit axetic, Chất béo, Glucozơ",
        content:"Rượu etylic C₂H₅OH: lên men glucozơ, cháy tỏa nhiệt, tác dụng Na → H₂. Axit axetic CH₃COOH: giấm ăn, tính axit yếu, tác dụng rượu → este (phản ứng este hóa). Glucozơ C₆H₁₂O₆: lên men → rượu + CO₂; phản ứng tráng gương với AgNO₃/NH₃. Chất béo: trieste của glixerol với axit béo; xà phòng hóa bằng NaOH.",
      },
    ],
    formulas:[
      { label:"Lên men glucozơ", formula:"C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂", note:"Men rượu, 30-32°C" },
      { label:"Este hóa", formula:"CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O", note:"H₂SO₄ đặc, t°" },
      { label:"Tráng gương", formula:"CH₂OH(CHOH)₄CHO + 2[Ag(NH₃)₂]OH → ...+ 2Ag↓", note:"Nhận biết glucozơ/andehit" },
    ],
    examples:[
      { q:"Lên men 180g glucozơ. Tính thể tích C₂H₅OH (D=0,8g/ml) thu được", a:"n(C₆H₁₂O₆)=180/180=1mol → n(C₂H₅OH)=2mol → m=2×46=92g → V=92/0,8=115ml" },
    ],
  },
];

export default function TheoryPage() {
  const [grade,    setGrade]    = useState("all");
  const [selected, setSelected] = useState(null);
  const [section,  setSection]  = useState(null);

  const filtered = grade === "all" ? CHAPTERS : CHAPTERS.filter(c => c.grade === parseInt(grade));

  if (selected) {
    const ch = CHAPTERS.find(c => c.id === selected);
    return (
      <div style={{ maxWidth:"820px", margin:"0 auto", padding:"0 1.5rem 4rem" }}>
        {/* Back */}
        <button onClick={() => { setSelected(null); setSection(null); }}
          style={{
            background:"none", border:"none", color:"var(--text3)", cursor:"pointer",
            fontFamily:"var(--font)", fontSize:"0.82rem", padding:"1.5rem 0 1rem",
            display:"flex", alignItems:"center", gap:"6px", transition:"color 0.18s",
          }}
          onMouseEnter={e => e.currentTarget.style.color="var(--accent)"}
          onMouseLeave={e => e.currentTarget.style.color="var(--text3)"}
        >
          ← Quay lại danh sách
        </button>

        {/* Chapter header */}
        <div style={{
          background:`${ch.color}08`, border:`1px solid ${ch.color}25`,
          borderRadius:"16px", padding:"1.5rem", marginBottom:"1.5rem",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"0.75rem" }}>
            <div style={{
              width:"48px", height:"48px", borderRadius:"12px", flexShrink:0,
              background:`${ch.color}18`, border:`1px solid ${ch.color}30`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem",
            }}>{ch.icon}</div>
            <div>
              <div style={{ fontSize:"0.62rem", color:ch.color, fontFamily:"var(--mono)", marginBottom:"3px" }}>
                HÓA {ch.grade} — LÝ THUYẾT
              </div>
              <h2 style={{ fontSize:"1.25rem", fontWeight:700 }}>{ch.title}</h2>
            </div>
          </div>
          <p style={{ color:"var(--text2)", fontSize:"0.88rem", lineHeight:1.7 }}>{ch.summary}</p>
        </div>

        {/* Sections */}
        <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem", marginBottom:"1.5rem" }}>
          {ch.sections.map((s, i) => {
            const open = section === i;
            return (
              <div key={i} style={{
                background:"var(--bg2)", border:`1px solid ${open ? ch.color+"40" : "var(--border)"}`,
                borderRadius:"12px", overflow:"hidden", transition:"border-color 0.2s",
              }}>
                <button
                  onClick={() => setSection(open ? null : i)}
                  style={{
                    width:"100%", background:"none", border:"none", cursor:"pointer",
                    padding:"1rem 1.1rem", display:"flex", alignItems:"center", justifyContent:"space-between",
                    fontFamily:"var(--font)", textAlign:"left",
                  }}
                >
                  <span style={{ fontSize:"0.9rem", fontWeight:600, color: open ? ch.color : "var(--text)" }}>
                    {s.title}
                  </span>
                  <span style={{ color:ch.color, fontSize:"1rem", transition:"transform 0.2s",
                    transform: open ? "rotate(180deg)" : "none" }}>
                    ⌄
                  </span>
                </button>
                {open && (
                  <div style={{
                    padding:"0 1.1rem 1.1rem",
                    fontSize:"0.85rem", color:"var(--text2)", lineHeight:1.8,
                    borderTop:`1px solid ${ch.color}20`,
                    paddingTop:"0.85rem",
                    animation:"slideUp 0.18s ease",
                  }}>
                    {s.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Formulas */}
        {ch.formulas.length > 0 && (
          <div style={{ marginBottom:"1.25rem" }}>
            <div style={{ fontSize:"0.65rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"0.6rem", textTransform:"uppercase", letterSpacing:"0.5px" }}>
              CÔNG THỨC QUAN TRỌNG
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
              {ch.formulas.map((f, i) => (
                <div key={i} style={{
                  background:"var(--bg3)", border:`1px solid ${ch.color}20`,
                  borderRadius:"10px", padding:"0.8rem 1rem",
                  display:"flex", alignItems:"center", gap:"1rem", flexWrap:"wrap",
                }}>
                  <div style={{ fontSize:"0.65rem", color:"var(--text3)", fontFamily:"var(--mono)", minWidth:"120px" }}>{f.label}</div>
                  <div style={{ fontFamily:"var(--mono)", fontSize:"0.88rem", fontWeight:700, color:ch.color, flex:1 }}>{f.formula}</div>
                  {f.note && <div style={{ fontSize:"0.68rem", color:"var(--text3)", fontStyle:"italic" }}>{f.note}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Examples */}
        {ch.examples.length > 0 && (
          <div>
            <div style={{ fontSize:"0.65rem", color:"var(--text3)", fontFamily:"var(--mono)", marginBottom:"0.6rem", textTransform:"uppercase", letterSpacing:"0.5px" }}>
              BÀI TẬP VÍ DỤ
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
              {ch.examples.map((ex, i) => (
                <div key={i} style={{
                  background:"var(--bg2)", border:"1px solid var(--border2)",
                  borderRadius:"12px", overflow:"hidden",
                }}>
                  <div style={{ padding:"0.85rem 1rem", borderBottom:"1px solid var(--border)" }}>
                    <div style={{ fontSize:"0.62rem", color:ch.color, fontFamily:"var(--mono)", marginBottom:"4px" }}>BÀI {i+1}</div>
                    <div style={{ fontSize:"0.85rem", fontWeight:500 }}>{ex.q}</div>
                  </div>
                  <div style={{
                    padding:"0.85rem 1rem",
                    fontSize:"0.82rem", color:"var(--text2)", lineHeight:1.7,
                    fontFamily:"var(--mono)",
                    background:`${ch.color}05`,
                  }}>
                    <span style={{ color:ch.color, fontWeight:600 }}>Giải: </span>{ex.a}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"0 1.5rem 4rem" }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"2rem 1rem 1.75rem" }}>
        <div className="hero-tag">📚 Lý thuyết</div>
        <h1 style={{
          fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:700, marginTop:"0.5rem",
          background:"linear-gradient(135deg,#fff,#fbbf24)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
        }}>
          Lý thuyết Hóa học THCS
        </h1>
        <p style={{ color:"var(--text2)", fontSize:"0.88rem", marginTop:"0.4rem" }}>
          Tổng hợp kiến thức Hóa 8 + Hóa 9 — có công thức và bài tập mẫu
        </p>
      </div>

      {/* Grade filter */}
      <div style={{ display:"flex", gap:"0.5rem", justifyContent:"center", marginBottom:"2rem" }}>
        {[{v:"all",l:"Tất cả"},{v:"8",l:"Hóa 8"},{v:"9",l:"Hóa 9"}].map(g => (
          <button key={g.v} onClick={() => setGrade(g.v)} style={{
            padding:"7px 20px", borderRadius:"20px", cursor:"pointer",
            fontFamily:"var(--font)", fontSize:"0.82rem", transition:"all 0.18s",
            background: grade===g.v ? "rgba(251,191,36,0.15)" : "var(--bg3)",
            border: grade===g.v ? "1px solid #fbbf24" : "1px solid var(--border)",
            color: grade===g.v ? "#fbbf24" : "var(--text2)",
            fontWeight: grade===g.v ? 600 : 400,
          }}>{g.l}</button>
        ))}
      </div>

      {/* Grid */}
      <div style={{
        display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:"0.9rem",
      }}>
        {filtered.map(ch => (
          <div key={ch.id}
            onClick={() => { setSelected(ch.id); setSection(null); }}
            style={{
              background:"var(--card)", border:`1px solid ${ch.color}20`,
              borderRadius:"14px", padding:"1.2rem", cursor:"pointer",
              transition:"all 0.22s", position:"relative", overflow:"hidden",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform="translateY(-3px)";
              e.currentTarget.style.boxShadow=`0 10px 28px ${ch.color}18`;
              e.currentTarget.style.borderColor=`${ch.color}50`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform="none";
              e.currentTarget.style.boxShadow="none";
              e.currentTarget.style.borderColor=`${ch.color}20`;
            }}
          >
            <div style={{
              position:"absolute", top:0, left:0, right:0, height:"2px",
              background:`linear-gradient(90deg,${ch.color},${ch.color}00)`,
            }}/>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"0.75rem" }}>
              <div style={{
                width:"40px", height:"40px", borderRadius:"10px", flexShrink:0,
                background:`${ch.color}14`, border:`1px solid ${ch.color}25`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem",
              }}>{ch.icon}</div>
              <div>
                <div style={{ fontSize:"0.58rem", color:ch.color, fontFamily:"var(--mono)", marginBottom:"2px" }}>
                  HÓA {ch.grade}
                </div>
                <div style={{ fontSize:"0.88rem", fontWeight:600, lineHeight:1.3 }}>{ch.title}</div>
              </div>
            </div>
            <p style={{ fontSize:"0.78rem", color:"var(--text2)", lineHeight:1.65, marginBottom:"0.85rem" }}>
              {ch.summary}
            </p>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", gap:"5px" }}>
                <span style={{
                  fontSize:"0.6rem", fontFamily:"var(--mono)", color:"var(--text3)",
                  background:"var(--bg3)", border:"1px solid var(--border)",
                  padding:"2px 7px", borderRadius:"4px",
                }}>
                  {ch.sections.length} phần
                </span>
                <span style={{
                  fontSize:"0.6rem", fontFamily:"var(--mono)", color:"#34d399",
                  background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.2)",
                  padding:"2px 7px", borderRadius:"4px",
                }}>
                  {ch.examples.length} bài mẫu
                </span>
              </div>
              <span style={{ fontSize:"0.75rem", color:ch.color }}>Xem →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}