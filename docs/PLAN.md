# Kế hoạch Phát triển chi tiết - Sài Gòn Rush

Tài liệu này vạch ra lộ trình phát triển chi tiết từng bước cho dự án game **Sài Gòn Rush**. Kế hoạch được chia thành 6 giai đoạn (Phases) tuần tự, từ khâu thiết lập ban đầu cho đến khi hoàn thiện sản phẩm sẵn sàng ra mắt, đi kèm checklist công việc cụ thể cho lập trình viên.

---

## Phase 1: Thiết lập Dự án & Khung cảnh 3D Cơ bản
**Mục tiêu:** Thiết lập môi trường build, cấu trúc thư mục dự án và hiển thị được một scene 3D cơ bản sử dụng Three.js.

### Checklist công việc chi tiết
- [x] **Task 1.1: Khởi tạo Dự án Vite & Cấu trúc Thư mục**
  - [x] Chạy lệnh khởi tạo Vite project với mẫu Vanilla JS (`npm create vite@latest ./ -- --template vanilla`).
  - [x] Thiết lập file `package.json` và cài đặt thư viện Three.js (`npm install three`).
  - [x] Tạo cấu trúc cây thư mục mã nguồn đầy đủ:
    - Thư mục logic: `src/core/`, `src/entities/`, `src/managers/`, `src/utils/`.
    - Thư mục tài nguyên: `public/models/`, `public/textures/`, `public/audio/`.
  - [x] Tạo file cấu hình Vite (`vite.config.js`) cơ bản để xử lý tối ưu assets tĩnh.
- [x] **Task 1.2: Xãy dựng Giao diện Trang chủ (HTML & CSS)**
  - [x] Tạo file `index.html` chứa thẻ `<canvas id="game-canvas">` toàn màn hình.
  - [x] Tạo cấu trúc các thẻ `div` lớp phủ giao diện (UI Overlays) lồng ghép đè lên Canvas bao gồm:
    - Màn hình tải tài nguyên (Loading Screen).
    - Menu chính (Main Menu) với nút Chơi ngay và Chọn nhân vật.
    - Giao diện chơi game (HUD) hiển thị điểm, số cà phê sữa đá, thanh Fever.
    - Màn hình Game Over hiển thị điểm số, nút Chơi lại và nút Trang chủ.
  - [x] Viết file CSS (`src/style.css`) định dạng các UI Overlays xếp chồng bằng `position: absolute` và thiết kế giao diện thích ứng (responsive) trên cả máy tính lẫn điện thoại.
  - [x] Nhập (Import) font chữ tiếng Việt hiện đại từ Google Fonts (ví dụ: 'Outfit' hoặc 'Inter') để hiển thị chữ đẹp mắt.
- [x] **Task 1.3: Khởi tạo Engine Game & Scene 3D Ban đầu**
  - [x] Viết lớp `src/core/SceneManager.js` để khởi tạo `THREE.WebGLRenderer` (kích hoạt khử răng cưa `antialias`, hỗ trợ đổ bóng `shadowMap`, định dạng màu sắc `sRGBColorSpace`).
  - [x] Khởi tạo `THREE.PerspectiveCamera` và thiết lập vị trí camera nhìn chéo góc từ trên xuống đường chạy.
  - [x] Thiết lập hệ thống ánh sáng: `THREE.AmbientLight` chiếu sáng dịu môi trường và `THREE.DirectionalLight` định hướng tạo bóng đổ sắc nét cho nhân vật/vật cản.
  - [x] Viết hàm tự động cập nhật tỷ lệ khung hình (`onWindowResize`) khi người chơi thay đổi kích thước trình duyệt hoặc xoay màn hình điện thoại.
  - [x] Viết lớp quản lý chính `src/core/Game.js` điều phối vòng lặp `requestAnimationFrame` và tính toán lượng chênh lệch thời gian `deltaTime` giữa các khung hình để đảm bảo chuyển động mượt mà.
  - [x] Cài đặt công cụ debug camera `THREE.OrbitControls` (chỉ kích hoạt ở chế độ phát triển/debug) giúp lập trình viên dễ dàng quan sát scene.

---

## Phase 2: Hệ thống Di chuyển Nhân vật (Bản thử nghiệm Prototype)
**Mục tiêu:** Hiện thực hóa cơ chế di chuyển theo làn của game endless runner bằng các hình khối giả định (cube/sphere placeholder).

### Checklist công việc chi tiết
- [x] **Task 2.1: Tạo Đối tượng Nhân vật & Render Cơ bản**
  - [x] Tạo file `src/entities/Player.js` chứa class `Player` đóng gói nhóm đối tượng `THREE.Group`.
  - [x] Tạo một hình hộp lập phương tạm thời bằng `THREE.BoxGeometry` và `THREE.MeshBasicMaterial` để làm đại diện cho nhân vật chạy.
  - [x] Viết hàm đưa Mesh của nhân vật vào trong Scene chính và định vị nhân vật nằm trên mặt đất.
- [x] **Task 2.2: Lập trình Điều khiển Bàn phím & Chuyển làn**
  - [x] Khai báo các hằng số tọa độ làn đường trong `src/utils/Constants.js` (ví dụ: `LANE_LEFT = -3`, `LANE_CENTER = 0`, `LANE_RIGHT = 3`).
  - [x] Lắng nghe sự kiện bàn phím `keydown` để bắt các phím di chuyển: phím A/D hoặc các mũi tên Trái/Phải.
  - [x] Lập trình logic chuyển làn: Khi bấm chuyển làn, thay đổi làn mục tiêu của nhân vật (giới hạn từ làn Trái ngoài cùng đến làn Phải ngoài cùng).
  - [x] Trong hàm `update(deltaTime)`, sử dụng hàm nội suy `THREE.MathUtils.lerp` để di chuyển tọa độ X của nhân vật từ vị trí hiện tại đến tọa độ X của làn mục tiêu một cách mượt mà.
- [x] **Task 2.3: Xử lý cơ chế Nhảy và Trượt**
  - [x] Thiết lập các biến trạng thái cho nhân vật: `isJumping` (đang nhảy), `isSliding` (đang trượt), `velocityY` (vận tốc trục đứng).
  - [x] Bắt các phím điều khiển Nhảy (phím W / Mũi tên Lên) và Trượt (phím S / Mũi tên Xuống).
  - [x] **Logic Nhảy:** Khi kích hoạt nhảy và nhân vật đang ở trên mặt đất (`isJumping === false`), gán vận tốc nhảy `velocityY = jumpForce`. Trong hàm update, liên tục giảm `velocityY` bởi trọng lực `gravity * deltaTime`, cộng dồn vào tọa độ Y của nhân vật. Khi nhân vật rơi chạm đất (tọa độ Y <= 0), gán lại Y = 0 và kết thúc trạng thái nhảy.
  - [x] **Logic Trượt:** Khi kích hoạt trượt (và nhân vật không ở trạng thái nhảy), đặt `isSliding = true`. Thu nhỏ chiều cao của Mesh nhân vật đi một nửa (ví dụ chỉnh `scale.y = 0.5`) và hạ tọa độ Y xuống một chút để mô phỏng động tác khom người. Sử dụng đếm thời gian (timer) để sau khoảng 0.8 giây sẽ khôi phục lại tỷ lệ chiều cao nhân vật ban đầu và gán lại `isSliding = false`.

---

## Phase 3: Đường chạy Vô tận & Tạo Chướng ngại vật
**Mục tiêu:** Xây dựng hệ thống đường chạy tự động lặp lại và phân bổ ngẫu nhiên chướng ngại vật trên các làn.

### Checklist công việc chi tiết
- [x] **Task 3.1: Hệ thống đường chạy lặp vô tận (Repeating Road)**
  - [x] Tạo file `src/entities/Environment.js` để quản lý các đoạn đường chạy vỉa hè.
  - [x] Định nghĩa kích thước tiêu chuẩn cho một đoạn đường chạy (ví dụ độ dài dọc trục Z là `TILE_LENGTH = 40`).
  - [x] Tạo một mảng lưu trữ 3-4 Mesh đoạn đường và xếp liền kề nối đuôi nhau dọc theo trục âm Z phía trước camera.
  - [x] Trong hàm `update`, di chuyển toàn bộ các đoạn đường này lùi về phía sau camera (cộng tọa độ Z của các đoạn đường) dựa theo tốc độ chạy của game.
  - [x] Khi một đoạn đường trôi ra hoàn toàn phía sau camera (vượt quá khoảng cách quy định), dịch chuyển đoạn đường đó lên đầu hàng đợi phía xa nhất phía trước camera để tạo vòng lặp đường vô tận.
- [x] **Task 3.2: Thiết kế & Quản lý Chướng ngại vật (Obstacle Manager)**
  - [x] Tạo lớp cơ sở `src/entities/Obstacle.js` quản lý vị trí làn đường, Mesh đại diện và thông số hộp va chạm.
  - [x] Tạo các lớp chướng ngại vật cụ thể kế thừa từ lớp cơ sở:
    - `Roadblock` (lô cốt công trình tầm thấp, người chơi phải nhảy qua).
    - `Barrier` (dây cáp/rào cản tầm cao, người chơi phải trượt dưới).
    - `VendorCart` (xe bán bánh mì/hủ tiếu chặn làn đường thường).
  - [x] Lập trình thuật toán sinh chướng ngại vật ngẫu nhiên ở khoảng cách xa phía trước camera (Z âm). Đảm bảo mỗi lượt sinh vật cản luôn tồn tại ít nhất 1 làn đường trống để người chơi tránh được (không tạo chướng ngại vật chặn kín cả 3 làn đồng thời).
  - [x] Hiện thực hóa cơ chế giải phóng bộ nhớ (Garbage Collection): Khi chướng ngại vật trôi qua hoàn toàn phía sau camera, xóa chúng khỏi Scene và giải phóng tài nguyên.
- [x] **Task 3.3: Chướng ngại vật di động (Phương tiện giao thông)**
  - [x] Thiết kế chướng ngại vật dạng xe máy hoặc xe buýt di động di chuyển ngược chiều hoặc cùng chiều với nhân vật.
  - [x] Trong hàm `update` của chướng ngại vật di động, cộng dồn thêm vận tốc chạy riêng của xe đó vào vị trí Z của nó để xe di chuyển trên làn đường một cách sinh động.

---

## Phase 4: Tích hợp Tài nguyên Đồ họa Low-Poly
**Mục tiêu:** Import các mô hình 3D thực tế và gán hoạt ảnh (animations) để tạo không khí đường phố Sài Gòn sinh động.

### Checklist công việc chi tiết
- [x] **Task 4.1: Hệ thống Quản lý Tải Tài nguyên (Asset Loader)**
  - [x] Tạo file `src/managers/AssetManager.js` sử dụng đối tượng `THREE.LoadingManager` của Three.js.
  - [x] Lập trình sự kiện `onProgress` để lấy phần trăm tải tài nguyên và cập nhật tiến trình trên giao diện Loading Screen.
  - [x] Lập trình sự kiện `onLoad` để tắt Loading Screen và tự động mở Menu chính của game.
  - [x] Viết hàm lưu trữ đệm (Caching) các model 3D sau khi load để nhân bản (clone) nhanh chóng, tránh nạp trùng lặp mô hình nhiều lần.
- [x] **Task 4.2: Chuẩn bị Kho Tài nguyên Cục bộ (Local Assets)**
  - [x] Sưu tầm các mô hình 3D phong cách low-poly gọn nhẹ, phù hợp cho game web dạng `.glb` lưu vào thư mục `public/models/` (AssetManager có fallback sang procedural model nếu thiếu file GLB).
- [x] **Task 4.3: Tích hợp & Gán hoạt ảnh cho Nhân vật**
  - [x] Nạp mô hình nhân vật GLB đã load vào lớp `Player.js` thay thế cho hình hộp tạm thời của Phase 2 (có fallback procedural).
  - [x] Khởi tạo AssetManager với GLTFLoader hỗ trợ tải GLTF/GLB async.
- [x] **Task 4.4: Trang trí Cảnh quan Đường phố Sài Gòn**
  - [x] Đặt ngẫu nhiên các mô hình nhà ống cổ kính, cột đèn đường lên lề đường hai bên của từng đoạn đường tile chạy vô tận.

---

## Phase 5: Logic Game, Điểm số & Chế độ Fever Mode
**Mục tiêu:** Lập trình chi tiết các cơ chế va chạm, tính điểm và bộ tăng tốc Fever Mode độc đáo dựa trên lượng cafe nhặt được.

### Checklist công việc chi tiết
- [x] **Task 5.1: Tạo & Rải Ly Cà phê sữa đá**
  - [x] Tạo lớp `src/entities/Collectible.js` quản lý mô hình ly cà phê sữa đá xoay quanh trục Y trong màn chơi.
  - [x] Thiết lập thuật toán rải cà phê tự động: Sinh các cụm 1-2 ly cà phê liên tiếp trên cùng làn đường.
- [x] **Task 5.2: Phát hiện Va chạm (Collision Detection)**
  - [x] Viết lớp quản lý va chạm `src/managers/CollisionManager.js`.
  - [x] Gán các hộp bao va chạm `THREE.Box3` (AABB) ôm khít quanh mô hình Player và chướng ngại vật.
  - [x] **Logic va chạm nhặt cà phê:** Kiểm tra sphere collision, khi nhân vật trong bán kính thu thập sẽ tự động nhặt ly cà phê.
  - [x] **Logic va chạm chướng ngại vật:** Nếu giao cắt AABB với chướng ngại vật thường → Game Over; nếu Fever Mode → đâm văng vật cản cộng 300 điểm.
- [x] **Task 5.3: Hệ thống Tăng tốc theo Từng mốc**
  - [x] Thiết lập công thức tăng tốc độ game trong Game.js: Cứ mỗi 10 ly cà phê tăng 1 bậc tốc độ.
- [x] **Task 5.4: Kịch bản Fever Mode**
  - [x] Thanh năng lượng Fever Gauge: Mỗi ly cà phê sạc 10%, đủ 100% tự động kích hoạt Fever Mode.
  - [x] Trong trạng thái `FEVER`: tốc độ gấp 1.5x, bất tử đâm văng chướng ngại vật, nam châm hút ly cà phê.
  - [x] Bộ đếm thời gian Fever Mode 7 giây, sau đó trả về trạng thái PLAYING.
  - [x] Phản hồi trực quan: Zoom camera FOV + hệ thống hạt bụi gió Fever particles.

---

## Phase 6: Giao diện UI, Âm thanh & Tối ưu hóa Hoàn thiện
**Mục tiêu:** Thiết lập các màn hình UI hoàn chỉnh, nhạc nền, tích hợp thiết bị di động và tối ưu hiệu năng chạy thực tế.

### Checklist công việc chi tiết
- [x] **Task 6.1: Khung UI Giao diện & Quản lý Trạng thái Game**
  - [x] Hiện thực hóa máy quản lý trạng thái `src/managers/StateMachine.js` quản lý vòng đời game: `MENU`, `PLAYING`, `FEVER`, `GAMEOVER`.
  - [x] Liên kết các sự kiện thay đổi trạng thái với việc ẩn/hiển thị các khung UI HTML tương ứng.
  - [x] Đồng bộ hiển thị HUD: Điểm số, thanh năng lượng Fever Gauge và số lượng ly cafe nhặt được cập nhật real-time.
  - [x] Sử dụng `window.localStorage` để lưu trữ và hiển thị điểm kỷ lục.
- [x] **Task 6.2: Tích hợp Hệ thống Âm thanh**
  - [x] Viết lớp `src/managers/AudioManager.js` tổng hợp âm thanh procedural qua Web Audio API (không cần file .mp3).
  - [x] BGM nhạc nền với melody pentatonic Việt Nam, thay đổi tempo khi vào Fever Mode.
  - [x] SFX đầy đủ: tiếng chuyển làn, nhảy, trượt, nhặt cà phê, kích hoạt Fever, đâm vỡ, Game Over.
  - [x] Nút tắt/bật âm thanh trên Menu và HUD.
- [x] **Task 6.3: Tương thích Di động & Tối ưu hóa Hiệu năng**
  - [x] Lập trình bộ lắng nghe sự kiện cảm ứng `touchstart`/`touchend` để nhận diện vuốt Trái/Phải/Lên/Xuống.
  - [x] Cơ chế dọn dẹp bộ nhớ: Giải phóng Mesh, Geometry, Material khi xóa obstacle/collectible.
  - [x] Cap `deltaTime` ở 50ms để tránh physics bug khi tab bị unfocus.

---

## Phase 7: Power-ups Việt Nam & Hệ thống Chọn Nhân vật (Skins)
**Mục tiêu:** Hoàn thiện các tính năng Power-ups độc đáo và Carousel chọn nhân vật theo yêu cầu trong tài liệu PRD.md.

### Checklist công việc chi tiết
- [x] **Task 7.1: Định nghĩa cấu hình hằng số cho Power-ups & Character Skins**
  - [x] Bổ sung `POWERUP_TYPES` (`SHIELD`, `DOUBLE_SCORE`, `BOOST`), `POWERUP_CONFIG` và `CHARACTERS` (`SHIPPER`, `AO_DAI`, `BARISTA`) trong `src/utils/Constants.js`.
- [x] **Task 7.2: Hệ thống Chọn Nhân vật & Skin Models**
  - [x] Xây dựng 3 mô hình 3D xe & trang phục low-poly độc đáo trong `Player.js`: Anh Shipper Công Nghệ (Scooter xanh), Nữ Sinh Áo Dài (Vespa trắng), Anh Chàng Barista (Scooter nâu hoài cổ).
  - [x] Tích hợp hiệu ứng Giáp Nón Lá 3D xoay mượt mà với hào quang vàng kim bao quanh nhân vật.
- [x] **Task 7.3: Mở rộng Collectibles cho 3D Power-ups**
  - [x] Xây dựng 3D Mesh cho Giáp Nón Lá (Cone 3D), Bánh Mì X2 (Bánh mì vàng giòn) và Xe Ôm Boost (Xe máy đỏ phóng tốc) trong `src/entities/Collectible.js`.
- [x] **Task 7.4: Tích hợp SFX cho Power-ups**
  - [x] Thêm âm thanh nhặt Power-up ngân vang, vỡ giáp Nón Lá giòn tan trong `src/managers/AudioManager.js`.
- [x] **Task 7.5: Quản lý Logic Power-ups & Carousel UI**
  - [x] Lập trình Carousel nút Prev/Next chọn nhân vật tại Menu chính, tự động lưu lựa chọn vào `localStorage`.
  - [x] Lập trình đỡ đạn bằng Giáp Nón Lá (nếu có giáp thì đâm chướng ngại vật sẽ vỡ giáp thay vì Game Over).
  - [x] Hiển thị Power-up status badges đếm ngược trên HUD (`#active-powerups`).


