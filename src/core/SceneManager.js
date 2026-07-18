import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GAME_CONFIG } from '../utils/Constants.js';

export class SceneManager {
  constructor(canvasId, debugMode = false) {
    this.canvas = document.getElementById(canvasId);
    this.debugMode = debugMode;
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    
    // Lưu các nguồn sáng để tiện điều chỉnh nếu cần
    this.ambientLight = null;
    this.dirLight = null;
    
    this.init();
  }

  init() {
    // 1. Khởi tạo Scene
    this.scene = new THREE.Scene();
    
    // Thêm sương mù (fog) nhẹ để che giấu điểm kết thúc đường chạy ở phía xa
    this.scene.fog = new THREE.FogExp2(0x1a1a24, 0.015);
    this.scene.background = new THREE.Color(0x1a1a24); // Phông nền tối huyền ảo đêm Sài Gòn

    // 2. Khởi tạo Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(
      GAME_CONFIG.CAMERA_FOV,
      aspect,
      0.1,
      1000
    );
    // Vị trí camera nhìn từ sau lưng nhân vật chếch lên trên và hướng về phía xa lộ
    this.camera.position.set(0, 5, 8);
    this.camera.lookAt(0, 1, -10);

    // 3. Khởi tạo WebGLRenderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Cấu hình hiển thị màu và chất lượng bóng đổ chuyên nghiệp
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Tone mapping giúp ánh sáng tự nhiên, hạn chế cháy sáng
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // 4. Thiết lập ánh sáng (Lighting)
    this.setupLighting();

    // 5. Cài đặt OrbitControls nếu ở chế độ Debug
    if (this.debugMode) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Không cho camera đi xuống dưới mặt đất
      this.controls.minDistance = 2;
      this.controls.maxDistance = 100;
    }

    // 6. Lắng nghe sự kiện thay đổi kích thước trình duyệt
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setupLighting() {
    // Ánh sáng môi trường dịu nhẹ (Ambient Light)
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);

    // Ánh sáng định hướng chính (Directional Light) mô phỏng ánh trăng / đèn đường
    this.dirLight = new THREE.DirectionalLight(0xfff5eb, 1.25);
    this.dirLight.position.set(12, 28, 12);
    
    // Kích hoạt đổ bóng mịn màng
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 80;
    
    // Mở rộng phạm vi camera đổ bóng (d = 35) bao phủ toàn bộ vỉa hè & tòa nhà
    // Triệt tiêu hoàn toàn vết cắt/sọc đen vệt bóng đổ ở 2 bên lề đường!
    const d = 35;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0001;

    this.scene.add(this.dirLight);
    
    // Thêm một luồng ánh sáng bổ trợ nhẹ ngược hướng để làm nổi bật viền nhân vật (Rim Light)
    const fillLight = new THREE.DirectionalLight(0x00e5ff, 0.4); // Neon xanh nhạt
    fillLight.position.set(-5, 5, -10);
    this.scene.add(fillLight);
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  update(deltaTime) {
    if (this.debugMode && this.controls) {
      this.controls.update();
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  // Tiện ích dọn dẹp bộ nhớ khi cần hủy cảnh
  dispose() {
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    
    if (this.controls) {
      this.controls.dispose();
    }
    
    this.scene.traverse((object) => {
      if (!object.isMesh) return;
      
      object.geometry.dispose();
      
      if (Array.isArray(object.material)) {
        object.material.forEach((material) => material.dispose());
      } else {
        object.material.dispose();
      }
    });
    
    this.renderer.dispose();
  }
}
