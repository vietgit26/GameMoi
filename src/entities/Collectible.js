import * as THREE from 'three';
import { LANE, POWERUP_TYPES } from '../utils/Constants.js';

export class Collectible {
  constructor(scene, laneIndex, spawnZ, type = 'COFFEE') {
    this.scene = scene;
    this.type = type;
    this.isCollected = false;
    this.isAlive = true;
    
    // Vị trí làn đường (0=Trái, 1=Giữa, 2=Phải)
    const lanePositions = [LANE.LEFT, LANE.CENTER, LANE.RIGHT];
    this.laneX = lanePositions[laneIndex] || LANE.CENTER;
    
    // Thời gian lượn sóng
    this.bobTime = Math.random() * Math.PI * 2;
    this.bobSpeed = 2.5;
    this.bobAmplitude = 0.2;
    this.baseY = 1.2;
    
    // Bán kính thu thập
    this.collectRadius = 1.8;
    // Lực nam châm Fever Mode / Boost
    this.magnetStrength = 18;
    
    this.meshGroup = new THREE.Group();
    this.buildMesh();
    
    this.meshGroup.position.set(this.laneX, this.baseY, spawnZ);
    this.scene.add(this.meshGroup);
    
    // Bounding sphere
    this.position = this.meshGroup.position;
  }
  
  buildMesh() {
    if (this.type === POWERUP_TYPES.SHIELD) {
      this._buildShieldMesh();
    } else if (this.type === POWERUP_TYPES.DOUBLE_SCORE) {
      this._buildDoubleScoreMesh();
    } else if (this.type === POWERUP_TYPES.BOOST) {
      this._buildBoostMesh();
    } else {
      this._buildCoffeeMesh();
    }
  }

  _buildCoffeeMesh() {
    // 1. Thân ly nhựa mang đi trong suốt cao cấp (Premium Takeaway Cup)
    const cupGeo = new THREE.CylinderGeometry(0.34, 0.24, 0.75, 16);
    const cupMat = new THREE.MeshStandardMaterial({
      color: 0xecfeff,
      transparent: true,
      opacity: 0.65,
      roughness: 0.05,
      metalness: 0.1,
    });
    const cup = new THREE.Mesh(cupGeo, cupMat);
    cup.position.y = 0.35;
    cup.castShadow = true;
    this.meshGroup.add(cup);

    // Vành mép ly nhựa dầy dặn mạ nhựa trong
    const rimGeo = new THREE.TorusGeometry(0.345, 0.025, 8, 20);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.72;
    this.meshGroup.add(rim);

    // 2. TẦNG SỮA ĐẶC ĐÁY LY (Layer 1: Sweet Condensed Milk Layer)
    const milkGeo = new THREE.CylinderGeometry(0.26, 0.22, 0.22, 16);
    const milkMat = new THREE.MeshStandardMaterial({ color: 0xfff8e1, roughness: 0.6 }); // Màu kem sữa đặc béo ngậy
    const milkLayer = new THREE.Mesh(milkGeo, milkMat);
    milkLayer.position.y = 0.11;
    this.meshGroup.add(milkLayer);

    // 3. TẦNG CÀ PHÊ NÂU ĐẬM ĐÀ BÊN TRÊN (Layer 2: Rich Espresso Layer)
    const coffeeGeo = new THREE.CylinderGeometry(0.31, 0.255, 0.48, 16);
    const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x3e1c08, roughness: 0.5 }); // Cà phê Espresso nâu thẫm
    const coffeeLayer = new THREE.Mesh(coffeeGeo, coffeeMat);
    coffeeLayer.position.y = 0.45;
    this.meshGroup.add(coffeeLayer);

    // 4. Các viên đá pha lê trong suốt nổi bên trên (Crystal Ice Cubes)
    const iceMat = new THREE.MeshStandardMaterial({ 
      color: 0xe0f7fa, 
      transparent: true, 
      opacity: 0.8, 
      roughness: 0.1,
      metalness: 0.2
    });
    for (let i = 0; i < 4; i++) {
      const iceGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
      const ice = new THREE.Mesh(iceGeo, iceMat);
      const angle = (i / 4) * Math.PI * 2;
      ice.position.set(
        Math.cos(angle) * 0.14,
        0.66,
        Math.sin(angle) * 0.14
      );
      ice.rotation.set(Math.random() * 0.5, angle, Math.random() * 0.5);
      this.meshGroup.add(ice);
    }

    // 5. Nắp vòm cầu trong suốt (Transparent Dome Lid)
    const lidGeo = new THREE.SphereGeometry(0.34, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    const lidMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1
    });
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.position.y = 0.72;
    this.meshGroup.add(lid);

    // 6. Logo Sticker "SAIGON COFFEE" tròn màu vàng chói rực rỡ mặt trước ly
    const stickerGeo = new THREE.CircleGeometry(0.15, 16);
    const stickerMat = new THREE.MeshBasicMaterial({ color: 0xffd600, side: THREE.DoubleSide });
    const sticker = new THREE.Mesh(stickerGeo, stickerMat);
    sticker.position.set(0, 0.42, 0.29);
    this.meshGroup.add(sticker);

    // 7. Ống hút cong màu xanh mạ tươi (Bent Green Straw)
    const strawGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.9, 8);
    const strawMat = new THREE.MeshStandardMaterial({ color: 0x00e676, roughness: 0.3 });
    const straw = new THREE.Mesh(strawGeo, strawMat);
    straw.position.set(0.08, 0.95, 0);
    straw.rotation.z = -0.22;
    this.meshGroup.add(straw);

    // 8. Hào quang lấp lánh rạng rỡ (Golden Orange Radiant Halo)
    const glowGeo = new THREE.SphereGeometry(0.65, 14, 14);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xff9100,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide,
      depthWrite: false
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = 0.45;
    this.meshGroup.add(glow);
    this.glowMesh = glow;
    this.glowMat = glowMat;

    this.meshGroup.scale.set(0.85, 0.85, 0.85); // Kích thước gọn gàng, tinh tế và chuẩn nét 0.85x
  }

  _buildShieldMesh() {
    // 3D Nón Lá vàng kim bảo vệ
    const hatGeo = new THREE.ConeGeometry(0.45, 0.3, 16);
    const hatMat = new THREE.MeshStandardMaterial({
      color: 0xffd600,
      emissive: 0xffab00,
      emissiveIntensity: 0.5,
      roughness: 0.3
    });
    const hat = new THREE.Mesh(hatGeo, hatMat);
    hat.position.y = 0.1;
    this.meshGroup.add(hat);

    // Hào quang xanh kim cương
    const glowGeo = new THREE.SphereGeometry(0.65, 12, 12);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xffd600,
      transparent: true,
      opacity: 0.25,
      depthWrite: false
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    this.meshGroup.add(glow);
    this.glowMat = glowMat;
  }

  _buildDoubleScoreMesh() {
    // 3D Ổ Bánh Mì vàng giòn thơm phức
    const breadGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.65, 12);
    const breadMat = new THREE.MeshStandardMaterial({
      color: 0xff9800, // Màu vàng ươm bánh mì
      roughness: 0.6,
      metalness: 0.1
    });
    const bread = new THREE.Mesh(breadGeo, breadMat);
    bread.rotation.z = Math.PI / 2;
    bread.position.y = 0.1;
    this.meshGroup.add(bread);

    // Nhân thịt đỏ & rau xanh bên trong ổ bánh mì
    const meatGeo = new THREE.BoxGeometry(0.55, 0.08, 0.18);
    const meatMat = new THREE.MeshStandardMaterial({ color: 0xd50000 });
    const meat = new THREE.Mesh(meatGeo, meatMat);
    meat.position.y = 0.1;
    this.meshGroup.add(meat);

    // Hào quang tím rực rỡ X2
    const glowGeo = new THREE.SphereGeometry(0.65, 12, 12);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xe040fb,
      transparent: true,
      opacity: 0.3,
      depthWrite: false
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    this.meshGroup.add(glow);
    this.glowMat = glowMat;
  }

  _buildBoostMesh() {
    // 3D Mô hình Xe Máy Ôm Siêu Tốc đỏ rực rỡ, thiết kế to, đẹp, nổi bật trên đường
    const bikeGroup = new THREE.Group();
    
    // 1. Thân xe máy đỏ sport
    const bodyGeo = new THREE.BoxGeometry(0.55, 0.65, 1.4);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xff1744,
      emissive: 0xd50000,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.8
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 0.45, 0);
    body.castShadow = true;
    bikeGroup.add(body);

    // 2. Yên xe đen
    const seatGeo = new THREE.BoxGeometry(0.48, 0.15, 0.65);
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.8 });
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(0, 0.8, 0.1);
    bikeGroup.add(seat);

    // 3. Bánh xe mạ crom
    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.2, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
    
    const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
    frontWheel.rotation.z = Math.PI / 2;
    frontWheel.position.set(0, 0.28, -0.5);
    bikeGroup.add(frontWheel);

    const backWheel = frontWheel.clone();
    backWheel.position.set(0, 0.28, 0.5);
    bikeGroup.add(backWheel);

    // 4. Đèn pha LED trước phát sáng siêu rực
    const lightGeo = new THREE.BoxGeometry(0.25, 0.2, 0.1);
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0xffea00,
      emissive: 0xffea00,
      emissiveIntensity: 1.5
    });
    const light = new THREE.Mesh(lightGeo, lightMat);
    light.position.set(0, 0.65, -0.72);
    bikeGroup.add(light);

    // 5. Tay lái mạ bạc
    const barGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8);
    const barMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.9, roughness: 0.1 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 0.85, -0.4);
    bikeGroup.add(bar);

    // 6. Ống bô lửa siêu tốc phía sau
    const exhaustGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
    const exhaustMat = new THREE.MeshStandardMaterial({ color: 0xffab00, emissive: 0xff6d00, emissiveIntensity: 0.8 });
    const exhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
    exhaust.rotation.x = Math.PI / 2;
    exhaust.position.set(0.25, 0.35, 0.7);
    bikeGroup.add(exhaust);

    bikeGroup.scale.set(1.3, 1.3, 1.3); // Tăng kích thước gấp 1.3 lần để người chơi nhìn rõ tuyệt đối
    this.meshGroup.add(bikeGroup);

    // Hào quang vệt lửa đỏ rực rỡ khổng lồ
    const glowGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xff3d00,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    this.meshGroup.add(glow);
    this.glowMat = glowMat;
  }
  
  update(deltaTime, currentSpeed, playerPosition, isFeverActive) {
    if (!this.isAlive) return;
    
    // Di chuyển theo tốc độ game
    this.meshGroup.position.z += currentSpeed * deltaTime;
    
    // Hiệu ứng lượn sóng lên xuống
    this.bobTime += this.bobSpeed * deltaTime;
    this.meshGroup.position.y = this.baseY + Math.sin(this.bobTime) * this.bobAmplitude;
    
    // Xoay liên tục
    this.meshGroup.rotation.y += 1.8 * deltaTime;
    
    // Nhấp nháy hào quang
    if (this.glowMat) {
      this.glowMat.opacity = 0.15 + 0.15 * Math.abs(Math.sin(this.bobTime * 2));
    }
    
    // === Nam châm Fever Mode / Boost ===
    if (isFeverActive && playerPosition) {
      const dx = playerPosition.x - this.meshGroup.position.x;
      const dy = playerPosition.y - this.meshGroup.position.y;
      const dz = playerPosition.z - this.meshGroup.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (dist < 10) {
        const force = (this.magnetStrength * deltaTime) / Math.max(dist, 0.5);
        this.meshGroup.position.x += dx * force;
        this.meshGroup.position.z += dz * force;
        this.meshGroup.position.y += dy * force * 0.5;
      }
    }
  }
  
  checkCollection(playerPos) {
    if (!this.isAlive || this.isCollected) return false;
    
    const dx = playerPos.x - this.meshGroup.position.x;
    const dy = playerPos.y - this.meshGroup.position.y;
    const dz = playerPos.z - this.meshGroup.position.z;
    const distSq = dx * dx + dy * dy + dz * dz;
    
    return distSq < this.collectRadius * this.collectRadius;
  }
  
  collect() {
    if (this.isCollected) return;
    this.isCollected = true;
    this.isAlive = false;
    this.dispose();
  }
  
  dispose() {
    this.isAlive = false;
    this.scene.remove(this.meshGroup);
    this.meshGroup.traverse(child => {
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

