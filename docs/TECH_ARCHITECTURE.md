# Tài liệu Kiến trúc Kỹ thuật - Sài Gòn Rush

Tài liệu này trình bày chi tiết về thiết kế kỹ thuật, cấu trúc thư mục và các cơ chế lập trình cốt lõi của trò chơi 3D Web **Sài Gòn Rush**.

---

## 1. Công nghệ & Thư viện sử dụng (Tech Stack)

*   **Công cụ xây dựng & Máy chủ phát triển (Build Tool & Dev Server):** [Vite](https://vitejs.dev/) - Giúp đóng gói nhanh, hỗ trợ Hot Module Replacement (HMR) và Javascript hiện đại.
*   **Engine 3D:** [Three.js](https://threejs.org/) - Xử lý kết xuất WebGL, ánh sáng, camera, chất liệu (materials) và tải các đối tượng 3D.
*   **Định dạng mô hình 3D:** Sử dụng các mô hình Low-poly định dạng **GLTF/GLB** được tải thủ công từ Sketchfab và lưu trữ cục bộ tại thư mục `/public/models/`.
*   **Hệ thống hoạt ảnh (Animation Engine):** Three.js `AnimationMixer` - Quản lý các hoạt ảnh xương (skeletal animations) của nhân vật như chạy, nhảy, trượt và ngã.
*   **Giao diện người dùng (UI):** Sử dụng các thẻ HTML5 và CSS3 xếp chồng tuyệt đối (absolute overlays) để hiển thị Menu, HUD và màn hình Game Over.
*   **Quản lý trạng thái (State Management):** Sử dụng Event Emitter kết hợp State Pattern thuần trong JavaScript.

---

## 2. Cấu trúc Thư mục Dự án

Cấu trúc dự án được thiết kế modular giúp phân tách các thành phần độc lập và dễ quản lý:

```
gametulam/
├── index.html                  # File HTML chính chứa canvas và các khung UI lớp phủ
├── package.json                # Quản lý các thư viện phụ thuộc (three, vite, v.v.)
├── vite.config.js              # Cấu hình Vite
├── docs/                       # Thư mục tài liệu dự án
│   ├── PRD.md
│   ├── TECH_ARCHITECTURE.md
│   └── PLAN.md
├── public/                     # Tài sản tĩnh (không bị Vite xử lý khi build)
│   ├── models/                 # Quản lý thủ công các mô hình GLB/GLTF low-poly
│   ├── textures/               # Texture môi trường, bầu trời, hiệu ứng đường chạy
│   └── audio/                  # Nhạc nền điện tử kết hợp nhạc cụ truyền thống và SFX
└── src/                        # Mã nguồn dự án
    ├── main.js                 # Điểm khởi chạy ứng dụng (Entry point), import CSS chính
    ├── core/                   # Các thành phần cốt lõi của Engine
    │   ├── Game.js             # Bộ điều phối chính toàn bộ vòng lặp (loop) và hệ thống game
    │   ├── SceneManager.js     # Khởi tạo camera, renderer, ánh sáng, đổ bóng, hậu kỳ
    │   └── StateMachine.js     # Quản lý các trạng thái game: MENU, PLAYING, FEVER, PAUSED, GAMEOVER
    ├── entities/               # Các đối tượng 3D trong game
    │   ├── Player.js           # Xử lý mô hình nhân vật, hoạt ảnh và logic chuyển làn
    │   ├── Obstacle.js         # Lớp cơ sở & các lớp cụ thể cho xe máy, lô cốt, xe bán hàng
    │   ├── Collectible.js      # Ly cà phê sữa đá, các vật phẩm hỗ trợ (Power-ups)
    │   └── Environment.js      # Mặt đất, đường chạy cuộn vô tận, tòa nhà hai bên phố
    ├── managers/               # Các lớp quản lý logic phụ trợ
    │   ├── AssetManager.js     # Quản lý tải bất đồng bộ (Async loading) cho GLTF, Audio, Textures
    │   ├── CollisionManager.js # Xử lý phát hiện va chạm dựa trên thuật toán AABB
    │   ├── ScoreManager.js     # Quản lý điểm số, kỷ lục điểm cao, số ly cà phê thu thập được
    │   └── AudioManager.js     # Quản lý phát nhạc nền, hiệu ứng âm thanh SFX
    └── utils/                  # Thư viện tiện ích phụ trợ
        └── Constants.js        # Chứa cấu hình toàn cục, giá trị tọa độ làn đường, tốc độ, màu sắc
```

---

## 3. Các Module Kiến trúc Cốt lõi

### 3.1 Vòng lặp Game (Game Loop) & Time Delta
Để đảm bảo chuyển động và hoạt ảnh chạy mượt mà độc lập với tốc độ khung hình (frame-rate independent), game sử dụng vòng lặp chuẩn dựa trên `requestAnimationFrame`:
```javascript
let lastTime = 0;
function animate(currentTime) {
    requestAnimationFrame(animate);
    const deltaTime = (currentTime - lastTime) / 1000; // Đổi sang giây
    lastTime = currentTime;
    
    game.update(deltaTime);
    game.render();
}
```

### 3.2 Di chuyển theo làn đường (Player.js)
Hệ thống giới hạn vị trí trục ngang (X) của nhân vật theo 3 làn cố định.
*   **Tọa độ các làn:** Định nghĩa trong `Constants.js` (ví dụ: `LANE_LEFT = -3`, `LANE_CENTER = 0`, `LANE_RIGHT = 3`).
*   **Phép nội suy (Lerp):** Khi người chơi chuyển làn, vị trí X của nhân vật sẽ được nội suy mượt mà về làn mục tiêu:
    ```javascript
    player.position.x = THREE.MathUtils.lerp(player.position.x, targetLaneX, deltaTime * LANE_SWITCH_SPEED);
    ```
*   **Di chuyển theo chiều dọc - Nhảy (Jumping):** Được tính toán bằng các công thức trọng lực và vận tốc tự xây dựng:
    ```javascript
    if (isJumping) {
        player.velocityY -= gravity * deltaTime;
        player.position.y += player.velocityY * deltaTime;
        if (player.position.y <= groundY) {
            player.position.y = groundY;
            isJumping = false;
        }
    }
    ```

### 3.3 Đường chạy vô tận & Tái sử dụng đối tượng (Environment.js)
To simulate continuous running, the road is made of repeating segments (tiles):
1.  **Khởi tạo:** Tạo sẵn và nối liền 3-4 đoạn đường thành hàng dọc.
2.  **Cuộn màn hình:** Di chuyển các đoạn đường lùi về phía sau (theo trục âm Z) tương ứng với tốc độ hiện tại của game.
3.  **Tái sử dụng (Recycling):** Khi một đoạn đường trôi ra phía sau camera (ví dụ: `position.z > camera.z`), nó sẽ được di dời lên đầu danh sách (`position.z = furthestTileZ - tileLength`).
4.  **Tòa nhà & Chi tiết hai bên phố:** Được gắn trực tiếp vào từng đoạn đường để tự động trôi theo và tái sử dụng.

### 3.4 Logic Tăng tốc độ & Trạng thái Fever Mode
*   **Tăng tốc theo mốc:** Tốc độ game tăng lên theo số lượng cà phê thu thập được:
    ```javascript
    const speedTier = Math.floor(coffeeCollected / 10);
    currentSpeed = baseSpeed + speedTier * SPEED_INCREMENT;
    ```
*   **Cơ chế Fever Mode:** Trạng thái đặc biệt khi đầy thanh năng lượng.
    *   *Chuyển trạng thái:* StateMachine chuyển sang trạng thái `FEVER`.
    *   *Ảnh hưởng gameplay:* Tốc độ đạt mức `FEVER_SPEED` (cực nhanh), người chơi bất tử (đâm xuyên chướng ngại vật), tự động kích hoạt lực hút cà phê sữa đá.
    *   *Hiệu ứng hình ảnh:* Tăng góc nhìn FOV của Camera (ví dụ từ 60 lên 80) kết hợp với các hạt (particle) đường gió kéo dài để tạo cảm giác tốc độ chóng mặt mà không cần đến bộ lọc hậu kỳ phức tạp.

### 3.5 Phát hiện Va chạm (CollisionManager.js)
Để đảm bảo hiệu năng tối đa trên trình duyệt web di động, chúng ta sử dụng phương pháp va chạm hộp bao **AABB (Axis-Aligned Bounding Box)** thay vì dùng các engine vật lý nặng nề:
*   Mỗi nhân vật, chướng ngại vật và ly cà phê sẽ được gán một hộp bao vô hình bao quanh.
*   `CollisionManager` kiểm tra sự giao nhau giữa các hộp bao ở mỗi khung hình:
    ```javascript
    playerBox.setFromObject(playerMesh);
    obstacleBox.setFromObject(obstacleMesh);
    if (playerBox.intersectsBox(obstacleBox)) {
        if (game.state === States.FEVER) {
            // Đâm vỡ vật cản khi ở trạng thái Fever Mode
            obstacle.destroyWithExplosion();
        } else {
            // Kết thúc game khi đâm phải vật cản ở trạng thái thường
            game.triggerGameOver();
        }
    }
    ```

---

## 4. Quản lý Tài nguyên & Tối ưu hiệu năng

### 4.1 Quản lý tải Asset cục bộ (`AssetManager.js`)
*   Sử dụng `THREE.LoadingManager` để theo dõi tiến độ tải của toàn bộ tài nguyên game.
*   Sử dụng `GLTFLoader` để tải các file `.glb` lưu cục bộ.
*   Lưu cache các hình khối (geometry) và chất liệu (materials) sau lần tải đầu tiên để nhân bản (clone) đối tượng một cách nhanh chóng, tránh việc tải hoặc biên dịch lại tài nguyên nhiều lần.

### 4.2 Các chiến lược tối ưu hóa đồ họa
*   **Tối ưu đa giác (Low-Poly):** Các mesh nhân vật nên giới hạn dưới 5000 polygon và các vật thể môi trường dưới 2000 polygon.
*   **Texture Atlas (Bản đồ vân bề mặt ghép):** Gom nhiều texture của các tòa nhà và vật cản vào chung một file ảnh lớn để giảm số lượng draw calls của GPU.
*   **InstancedMesh:** Sử dụng lớp `THREE.InstancedMesh` cho các đối tượng lặp lại nhiều lần như ly cà phê hoặc cột đèn để render chúng chỉ trong một draw call duy nhất.
