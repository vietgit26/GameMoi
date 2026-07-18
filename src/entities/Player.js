import * as THREE from 'three';
import { LANE, PHYSICS } from '../utils/Constants.js';
import { AssetManager } from '../managers/AssetManager.js';

export class Player {
  constructor(scene, skinId = 'shipper') {
    this.scene = scene;
    this.skinId = skinId;
    
    // Quản lý vị trí làn đường
    this.currentLaneIndex = 1; // 0: Trái, 1: Giữa, 2: Phải
    this.targetLaneX = LANE.CENTER;
    
    // Trạng thái vật lý
    this.isJumping = false;
    this.isSliding = false;
    this.velocityY = 0;
    this.slideTimer = 0;
    
    // Giáp Nón Lá
    this.hasShield = false;
    this.shieldMeshGroup = null;
    this.shieldRotation = 0;
    
    // Các biến lưu trữ kích thước hình học gốc
    this.originalHeight = 1.6;
    
    // Nhóm đối tượng chứa toàn bộ Mesh nhân vật
    this.meshGroup = new THREE.Group();
    // Nhóm con chứa phần hiển thị trực quan (để dễ dàng xoay và scale độc lập)
    this.visualGroup = new THREE.Group();
    this.meshGroup.add(this.visualGroup);
    
    // Hộp bao va chạm (AABB Bounding Box)
    this.boundingBox = new THREE.Box3();
    
    this.init();
  }

  init() {
    this.buildCharacterSkin(this.skinId);
    this.buildShieldMesh();

    // Căn chỉnh vị trí ban đầu của group
    this.meshGroup.position.set(LANE.CENTER, PHYSICS.PLAYER_GROUND_Y, 0);
    
    // Thêm nhân vật vào scene chính
    this.scene.add(this.meshGroup);
    
    // Cập nhật bounding box ban đầu
    this.updateBoundingBox();
  }

  setSkin(skinId) {
    this.skinId = skinId;
    // Dọn dẹp visualGroup cũ
    while (this.visualGroup.children.length > 0) {
      const child = this.visualGroup.children[0];
      this.visualGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    }
    this.buildCharacterSkin(skinId);
  }

  buildCharacterSkin(skinId) {
    if (skinId === 'ao_dai' || skinId === 'student') {
      const glbStudentModel = AssetManager.getModel('student');
      if (glbStudentModel) {
        const studentClone = glbStudentModel.clone();
        
        // Tự động căn chỉnh chiều cao 1.6m và đặt chân chạm đúng mặt đất (Y = 0)
        const bbox = new THREE.Box3().setFromObject(studentClone);
        const size = bbox.getSize(new THREE.Vector3());
        if (size.y > 0) {
          const targetHeight = 1.6;
          const scaleFactor = targetHeight / size.y;
          studentClone.scale.set(scaleFactor, scaleFactor, scaleFactor);
          
          const scaledBbox = new THREE.Box3().setFromObject(studentClone);
          studentClone.position.y = -scaledBbox.min.y;
        }

        this.visualGroup.add(studentClone);
        return;
      }
      this._buildAoDaiSkin();
      return;
    }

    const glbPlayerModel = AssetManager.getModel('player');
    if (glbPlayerModel && skinId === 'shipper') {
      const playerClone = glbPlayerModel.clone();
      playerClone.position.set(0, 0, 0);
      playerClone.scale.set(1, 1, 1);
      this.visualGroup.add(playerClone);
      return;
    }

    if (skinId === 'barista') {
      this._buildBaristaSkin();
    } else {
      this._buildShipperSkin();
    }
  }

  _buildShipperSkin() {
    // 1. Thân xe máy (Motorbike Body) - màu xanh công nghệ thanh lịch
    const bikeGeo = new THREE.BoxGeometry(0.5, 0.6, 1.6);
    const bikeMat = new THREE.MeshStandardMaterial({ color: 0x00b0ff, roughness: 0.3, metalness: 0.7 });
    const bike = new THREE.Mesh(bikeGeo, bikeMat);
    bike.position.set(0, 0.4, 0);
    bike.castShadow = true;
    bike.receiveShadow = true;
    this.visualGroup.add(bike);

    // 2. Bánh xe trước & sau
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1f1f2e, roughness: 0.9 });
    
    const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0, 0.3, -0.6);
    frontWheel.castShadow = true;
    this.visualGroup.add(frontWheel);

    const backWheel = frontWheel.clone();
    backWheel.position.set(0, 0.3, 0.6);
    this.visualGroup.add(backWheel);

    // 3. Thùng hàng shipper phía sau (Delivery Box)
    const boxGeo = new THREE.BoxGeometry(0.65, 0.65, 0.65);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x00e676, roughness: 0.5, metalness: 0.1 });
    const deliveryBox = new THREE.Mesh(boxGeo, boxMat);
    deliveryBox.position.set(0, 0.9, 0.4);
    deliveryBox.castShadow = true;
    this.visualGroup.add(deliveryBox);

    // 4. Thân người lái (Torso)
    const torsoGeo = new THREE.BoxGeometry(0.4, 0.5, 0.4);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x00b0ff });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.set(0, 0.85, -0.15);
    torso.rotation.x = -Math.PI / 12;
    torso.castShadow = true;
    this.visualGroup.add(torso);

    // 5. Đầu & Mũ bảo hiểm vàng
    const headGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffd600 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 1.2, -0.25);
    head.castShadow = true;
    this.visualGroup.add(head);

    // 6. Đèn pha
    const lightGeo = new THREE.BoxGeometry(0.2, 0.15, 0.1);
    const lightMat = new THREE.MeshStandardMaterial({ color: 0xffeb3b, emissive: 0xffeb3b, emissiveIntensity: 1.0 });
    const headlight = new THREE.Mesh(lightGeo, lightMat);
    headlight.position.set(0, 0.6, -0.82);
    this.visualGroup.add(headlight);
  }

  _buildAoDaiSkin() {
    // 1. Thân Scooter trắng ngọc trai
    const bikeGeo = new THREE.BoxGeometry(0.48, 0.58, 1.5);
    const bikeMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.1, metalness: 0.3 });
    const bike = new THREE.Mesh(bikeGeo, bikeMat);
    bike.position.set(0, 0.38, 0);
    bike.castShadow = true;
    this.visualGroup.add(bike);

    // 2. Yên xe màu nâu đậm
    const seatGeo = new THREE.BoxGeometry(0.42, 0.15, 0.7);
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.8 });
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(0, 0.7, 0.1);
    this.visualGroup.add(seat);

    // 3. Bánh xe
    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.2, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0, 0.28, -0.55);
    this.visualGroup.add(frontWheel);

    const backWheel = frontWheel.clone();
    backWheel.position.set(0, 0.28, 0.55);
    this.visualGroup.add(backWheel);

    // 4. Áo Dài trắng
    const aoDaiGeo = new THREE.CylinderGeometry(0.18, 0.28, 0.65, 10);
    const aoDaiMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const aoDai = new THREE.Mesh(aoDaiGeo, aoDaiMat);
    aoDai.position.set(0, 0.95, -0.1);
    aoDai.rotation.x = -Math.PI / 16;
    aoDai.castShadow = true;
    this.visualGroup.add(aoDai);

    // 5. Đầu & Nón lá
    const headGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffe0b2 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 1.3, -0.2);
    this.visualGroup.add(head);

    const nonLaGeo = new THREE.ConeGeometry(0.35, 0.2, 16);
    const nonLaMat = new THREE.MeshStandardMaterial({ color: 0xfff59d, roughness: 0.6 });
    const nonLa = new THREE.Mesh(nonLaGeo, nonLaMat);
    nonLa.position.set(0, 1.45, -0.2);
    this.visualGroup.add(nonLa);

    const lightGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 12);
    const lightMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.0 });
    const light = new THREE.Mesh(lightGeo, lightMat);
    light.rotation.x = Math.PI / 2;
    light.position.set(0, 0.65, -0.76);
    this.visualGroup.add(light);
  }

  _buildBaristaSkin() {
    // 1. Scooter nâu cà phê
    const bikeGeo = new THREE.BoxGeometry(0.5, 0.6, 1.55);
    const bikeMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.4, metalness: 0.4 });
    const bike = new THREE.Mesh(bikeGeo, bikeMat);
    bike.position.set(0, 0.4, 0);
    bike.castShadow = true;
    this.visualGroup.add(bike);

    const trimGeo = new THREE.BoxGeometry(0.52, 0.08, 1.57);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.2, metalness: 0.8 });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(0, 0.35, 0);
    this.visualGroup.add(trim);

    const wheelGeo = new THREE.CylinderGeometry(0.29, 0.29, 0.22, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x212121 });
    const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0, 0.29, -0.58);
    this.visualGroup.add(frontWheel);

    const backWheel = frontWheel.clone();
    backWheel.position.set(0, 0.29, 0.58);
    this.visualGroup.add(backWheel);

    // 2. Torso Barista
    const torsoGeo = new THREE.BoxGeometry(0.42, 0.52, 0.42);
    const torsoMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.6 });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.set(0, 0.88, -0.15);
    torso.castShadow = true;
    this.visualGroup.add(torso);

    // 3. Đầu & Beret cap
    const headGeo = new THREE.SphereGeometry(0.19, 12, 12);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffd180 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 1.25, -0.22);
    this.visualGroup.add(head);

    const capGeo = new THREE.CylinderGeometry(0.25, 0.22, 0.1, 12);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x271c19 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(0, 1.38, -0.22);
    cap.rotation.z = -0.1;
    this.visualGroup.add(cap);

    const lightGeo = new THREE.BoxGeometry(0.2, 0.2, 0.08);
    const lightMat = new THREE.MeshStandardMaterial({ color: 0xffecb3, emissive: 0xffecb3, emissiveIntensity: 1.0 });
    const light = new THREE.Mesh(lightGeo, lightMat);
    light.position.set(0, 0.65, -0.79);
    this.visualGroup.add(light);
  }

  buildShieldMesh() {
    this.shieldMeshGroup = new THREE.Group();

    // 1. Nón Lá 3D khổng lồ phát sáng
    const nonLaGeo = new THREE.ConeGeometry(0.8, 0.45, 20);
    const nonLaMat = new THREE.MeshStandardMaterial({
      color: 0xffd600,
      emissive: 0xffab00,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.75,
      roughness: 0.2
    });
    const nonLa = new THREE.Mesh(nonLaGeo, nonLaMat);
    nonLa.position.set(0, 1.8, 0);
    this.shieldMeshGroup.add(nonLa);

    // 2. Vòng hào quang
    const auraGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xffd600,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide,
      depthWrite: false
    });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    aura.position.set(0, 0.8, 0);
    this.shieldMeshGroup.add(aura);

    this.shieldMeshGroup.visible = false;
    this.meshGroup.add(this.shieldMeshGroup);
  }

  enableShield() {
    this.hasShield = true;
    if (this.shieldMeshGroup) {
      this.shieldMeshGroup.visible = true;
    }
  }

  consumeShield() {
    this.hasShield = false;
    if (this.shieldMeshGroup) {
      this.shieldMeshGroup.visible = false;
    }
  }

  moveLeft() {
    if (this.currentLaneIndex > 0) {
      this.currentLaneIndex--;
      this.updateTargetLane();
    }
  }

  moveRight() {
    if (this.currentLaneIndex < 2) {
      this.currentLaneIndex++;
      this.updateTargetLane();
    }
  }

  updateTargetLane() {
    const lanes = [LANE.LEFT, LANE.CENTER, LANE.RIGHT];
    this.targetLaneX = lanes[this.currentLaneIndex];
  }

  jump() {
    if (!this.isJumping && !this.isSliding) {
      this.isJumping = true;
      this.velocityY = PHYSICS.JUMP_FORCE;
      this.visualGroup.rotation.x = -Math.PI / 10;
      return true;
    }
    return false;
  }

  slide() {
    if (!this.isJumping && !this.isSliding) {
      this.isSliding = true;
      this.slideTimer = PHYSICS.SLIDE_DURATION;
      this.visualGroup.scale.y = 0.5;
      this.visualGroup.rotation.x = Math.PI / 15;
    }
  }

  stopSliding() {
    this.isSliding = false;
    this.slideTimer = 0;
    this.visualGroup.scale.y = 1.0;
    this.visualGroup.rotation.x = 0;
  }

  updateBoundingBox() {
    this.boundingBox.setFromObject(this.meshGroup);
    // Giới hạn bề rộng X của BoundingBox nhân vật tối đa 0.7m quanh tâm vị trí X
    // Đảm bảo sải tay hoặc mesh 3D xòe ngang không bao giờ chạm sang làn bên cạnh!
    const centerX = this.meshGroup.position.x;
    this.boundingBox.min.x = centerX - 0.35;
    this.boundingBox.max.x = centerX + 0.35;
  }

  update(deltaTime) {
    // 1. Chuyển làn mượt mà (Lerp vị trí X)
    this.meshGroup.position.x = THREE.MathUtils.lerp(
      this.meshGroup.position.x,
      this.targetLaneX,
      deltaTime * LANE.SWITCH_SPEED
    );

    // 2. Xử lý logic Nhảy vật lý
    if (this.isJumping) {
      this.velocityY -= PHYSICS.GRAVITY * deltaTime;
      this.meshGroup.position.y += this.velocityY * deltaTime;
      
      if (this.meshGroup.position.y <= PHYSICS.PLAYER_GROUND_Y) {
        this.meshGroup.position.y = PHYSICS.PLAYER_GROUND_Y;
        this.isJumping = false;
        this.velocityY = 0;
        this.visualGroup.rotation.x = 0;
      }
    }

    // 3. Xử lý logic Trượt
    if (this.isSliding) {
      this.slideTimer -= deltaTime * 1000;
      if (this.slideTimer <= 0) {
        this.stopSliding();
      }
    }

    // 4. Xoay giáp nón lá
    if (this.hasShield && this.shieldMeshGroup) {
      this.shieldRotation += deltaTime * 2.5;
      this.shieldMeshGroup.rotation.y = this.shieldRotation;
    }

    // 5. Cập nhật Hộp bao va chạm ở vị trí mới
    this.updateBoundingBox();
  }

  dispose() {
    this.scene.remove(this.meshGroup);
    this.meshGroup.traverse((child) => {
      if (child.isMesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}
