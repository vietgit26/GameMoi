import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class AssetManagerClass {
  constructor() {
    this.manager = new THREE.LoadingManager();
    this.gltfLoader = new GLTFLoader(this.manager);
    this.models = {};
    this.textures = {};
    this.loaded = false;
  }

  loadAll(onProgress, onLoad) {
    if (this.loaded) {
      if (onLoad) onLoad();
      return;
    }

    // Lắng nghe tiến trình của LoadingManager toàn cục
    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = (itemsLoaded / itemsTotal) * 100;
      if (onProgress) onProgress(progress);
    };

    this.manager.onLoad = () => {
      this.loaded = true;
      console.log('Tất cả tài nguyên đã được xử lý xong.');
      if (onLoad) onLoad();
    };

    this.manager.onError = (url) => {
      console.warn(`Lỗi tải tài nguyên tại: ${url}. Hệ thống sẽ sử dụng mô hình dự phòng dựng bằng code.`);
    };

    // Danh sách các mô hình GLB cần tải (nằm trong public/models/)
    const modelsToLoad = {
      player: '/models/shipper.glb',
      student: '/models/student.glb',
      coffee: '/models/coffee_cup.glb',
      roadblock: '/models/roadblock.glb',
      barrier: '/models/barrier.glb',
      vendor_cart: '/models/vendor_cart.glb',
      bus: '/models/bus.glb',
      bike: '/models/bike.glb'
    };

    let activeLoads = 0;
    
    // Tải các mô hình bất đồng bộ
    for (const [key, path] of Object.entries(modelsToLoad)) {
      activeLoads++;
      this.gltfLoader.load(
        path,
        (gltf) => {
          this.models[key] = gltf.scene;
          // Kích hoạt đổ bóng cho các mesh con của model gltf được tải
          gltf.scene.traverse(node => {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
            }
          });
        },
        undefined,
        (error) => {
          // Bắt lỗi 404/nội dung để LoadingManager không bị kẹt
          console.warn(`Không tìm thấy mô hình '${key}' tại '${path}'. Sử dụng mô hình dựng sẵn thay thế.`);
        }
      );
    }

    // Nếu không có tài nguyên nào cần tải thì gọi ngay hàm callback
    if (activeLoads === 0) {
      if (onLoad) onLoad();
    }
  }

  /**
   * Lấy một bản sao (clone) của mô hình 3D đã được cache.
   * Trả về null nếu mô hình chưa được tải thành công.
   */
  getModel(key) {
    if (this.models[key]) {
      return this.models[key].clone();
    }
    return null;
  }
}

export const AssetManager = new AssetManagerClass();
