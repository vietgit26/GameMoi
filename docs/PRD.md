# Tài liệu Yêu cầu Sản phẩm (PRD) - Sài Gòn Rush

## 1. Tổng quan về Game
**Sài Gòn Rush** là một trò chơi web 3D thuộc thể loại endless runner lấy bối cảnh đường phố Sài Gòn (Thành phố Hồ Chí Minh) nhộn nhịp và tràn đầy sức sống. Người chơi sẽ điều khiển nhân vật chạy qua các con phố đặc trưng, né tránh chướng ngại vật và phương tiện giao thông quen thuộc của Việt Nam, đồng thời thu thập những ly cà phê sữa đá truyền thống để ghi điểm và tăng tốc độ.

### Ý tưởng cốt lõi (Core Premise):
*   **Thể loại:** 3D Endless Runner (tương tự như Subway Surfers / Temple Run).
*   **Chủ đề:** Văn hóa đường phố Sài Gòn hiện đại.
*   **Phong cách nghệ thuật (Art Style):** Thiết kế Low-poly hoạt hình, màu sắc tươi sáng, rực rỡ mang lại cảm giác vui tươi, năng động.
*   **Nền tảng:** Web (Trình duyệt trên Máy tính & Thiết bị di động).
*   **Cơ chế cốt lõi:** Di chuyển trên 3 làn đường (lane switching), nhảy (jumping), trượt (sliding), thu thập vật phẩm và cơ chế tăng tốc độ theo từng mốc (tier-based) kết hợp trạng thái "Fever Mode".
*   **Nguồn tài nguyên 3D (Asset Source):** Tải thủ công các mô hình 3D (.gltf/.glb) từ Sketchfab lưu trữ cục bộ trong thư mục `public/models`.

---

## 2. Lối chơi & Các Cơ chế (Gameplay & Mechanics)

### 2.1 Hệ thống Di chuyển & Làn đường (Lane System)
*   **3 làn đường:** Nhân vật di chuyển trên một đường chạy được chia làm 3 làn (Trái, Giữa, Phải).
*   **Điều khiển:**
    *   **Máy tính:** Phím mũi tên Trái/Phải (hoặc A/D) để chuyển làn, mũi tên Lên (W) để nhảy, mũi tên Xuống (S) để trượt.
    *   **Thiết bị di động:** Vuốt màn hình (Trái, Phải, Lên, Xuống).
*   **Chướng ngại vật (Obstacles):** Chặn 1, 2 hoặc cả 3 làn (buộc người chơi phải nhảy, trượt hoặc chuyển làn).
    *   *Lô cốt công trình (Roadblock):* Vật cản tầm thấp/trung, cần nhảy qua hoặc chuyển làn.
    *   *Xe buýt/Xe máy:* Chướng ngại vật đứng yên hoặc di chuyển ngược chiều/cùng chiều.
    *   *Xe bán hàng rong (Xe bánh mì/hủ tiếu):* Chướng ngại vật tầm trung.
    *   *Dây điện chằng chịt treo thấp:* Vật cản tầm cao, buộc phải trượt xuống để né.

### 2.2 Hệ thống Thu thập & Tiến trình (Collection & Progression)
*   **Thu thập Cà phê (Thay cho Coin):**
    *   Vật phẩm cần thu thập là các ly **Cà phê sữa đá** & **Cà phê đen đá**.
    *   Thu thập cà phê giúp tăng điểm số và tích lũy số lượng cà phê trong màn chơi.
*   **Tăng tốc độ & Trạng thái Fever Mode:**
    *   **Tăng tốc theo từng mốc (Tier-based):** Tốc độ game tăng theo các bước rõ rệt (ví dụ: mỗi khi thu thập thêm 10 ly cà phê, game sẽ tăng lên 1 cấp tốc độ mới).
    *   **Fever Mode (Trạng thái bùng nổ):** Khi người chơi tích lũy đầy thanh năng lượng (Rush Gauge) hoặc nhặt được vật phẩm đặc biệt, trạng thái **Fever Mode** sẽ được kích hoạt.
        *   *Hiệu quả:* Nhân vật chạy cực nhanh, trở nên bất tử (smash qua mọi chướng ngại vật) và tự động hút toàn bộ cà phê xung quanh (tính năng nam châm).
        *   *Hiệu ứng hình ảnh:* Camera zoom rộng ra (tăng FoV), màn hình có hiệu ứng vệt gió hoặc blur (radial blur) để thể hiện tốc độ cực hạn.

### 2.3 Vật phẩm hỗ trợ (Power-ups mang đậm chất Việt Nam)
*   **Giáp Nón Lá:** Lá chắn bảo vệ tạm thời, giúp người chơi đỡ được 1 lần va chạm mà không bị Game Over.
*   **Nhân đôi Bánh Mì (X2 Score):** Nhân đôi điểm số nhận được từ quãng đường chạy và số ly cà phê thu thập được trong 10 giây.
*   **Xe Ôm Siêu Tốc (Xe Ôm Boost):** Nhân vật nhảy lên một chiếc xe máy classic, phóng nhanh qua tất cả các làn đường, tự động hút cà phê sữa đá trong 8 giây (tương tự Jetpack trong Subway Surfers).

---

## 3. Bản sắc Văn hóa Việt Nam & Tài nguyên 3D (Assets)

### 3.1 Hình ảnh & Môi trường
Để tái hiện chân thực không khí Sài Gòn, môi trường game sẽ bao gồm:
*   **Bối cảnh kiến trúc:** Các công trình biểu tượng (Nhà thờ Đức Bà, Chợ Bến Thành), đan xen với nhà ống đặc trưng, chung cư cũ, quán cà phê cóc với ghế nhựa vỉa hè.
*   **Chi tiết đường phố:** Cột điện chằng chịt dây cáp, biển hiệu quảng cáo tiếng Việt rực rỡ, hàng quán vỉa hè.
*   **Ánh sáng:** Tông màu hoàng hôn ấm áp (golden hour) hoặc phố đêm Sài Gòn rực rỡ ánh đèn neon.

### 3.2 Nhân vật (Skins)
*   **Anh shipper (Mặc định):** Trang phục áo khoác công nghệ màu xanh, chở thùng hàng phía sau lưng.
*   **Nữ sinh:** Mặc áo dài trắng truyền thống kết hợp giày sneaker năng động để chạy.
*   **Anh chàng Barista:** Trang phục tạp dề năng động của các quán cà phê hiện đại.

### 3.3 Âm thanh (Audio)
*   **Nhạc nền (BGM):** Sự kết hợp giữa các nhạc cụ truyền thống Việt Nam (Đàn Bầu, Đàn Tranh) phối lại trên nền nhạc điện tử hiện đại sôi động (EDM/V-Pop Remix) nhằm giữ nhịp độ dồn dập cho game.
*   **Hiệu ứng âm thanh (SFX):**
    *   Tiếng còi xe máy (còi xe).
    *   Tiếng rao vỉa hè đặc trưng (*"Ai bánh mì nóng giòn đây..."*).
    *   Âm thanh "Slurp" (húp nước) khi thu thập được ly cà phê.
    *   Âm thanh đổ vỡ, va chạm dứt khoát khi bị Game Over.

---

## 4. Giao diện Người dùng (UI/UX)
*   **Màn hình chính (Start Screen):** Tiêu đề chữ nghệ thuật "Sài Gòn Rush", nút "Chơi ngay", khu vực chọn nhân vật và bảng xếp hạng điểm cao.
*   **HUD trong màn chơi:**
    *   Điểm hiện tại (Góc trên bên phải).
    *   Số ly cà phê đã thu thập (Góc trên bên trái, đi kèm icon ly cafe).
    *   Thanh đo Fever Mode / Hiển thị cấp độ tốc độ hiện tại.
    *   Thời gian hiệu lực của các Power-up đang dùng.
*   **Màn hình Game Over:** Hiển thị điểm số đạt được, số ly cafe thu thập được, so sánh kỷ lục cá nhân (High Score), nút "Chơi lại" (Replay) và "Trang chủ" (Home).

---

## 5. Giới hạn Kỹ thuật & Mục tiêu Hiệu năng
*   **Engine:** Sử dụng Three.js cho kết xuất đồ họa 3D WebGL.
*   **Tối ưu hóa:** Ưu tiên các model Low-poly để đảm bảo game chạy mượt mà ở mức 60 FPS trên các trình duyệt di động tầm trung.
*   **Tải tài nguyên:** Tối ưu hóa dung lượng mô hình 3D (nén dạng GLTF/GLB) để đảm bảo tốc độ tải trang ban đầu nhanh.
*   **Lưu trữ:** Dùng LocalStorage để lưu trữ điểm số cao nhất và các nhân vật đã mở khóa.
