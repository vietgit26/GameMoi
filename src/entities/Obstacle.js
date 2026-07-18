import * as THREE from 'three';
import { LANE, PHYSICS } from '../utils/Constants.js';
import { AssetManager } from '../managers/AssetManager.js';

export const OBSTACLE_TYPES = {
  ROADBLOCK: 'ROADBLOCK',             // Rào chắn thấp (Nhảy qua)
  BARRIER: 'BARRIER',                 // Rào chắn cao (Trượt dưới)
  VENDOR_CART: 'VENDOR_CART',         // Xe bán hàng rong (Chuyển làn)
  VEHICLE_BUS: 'VEHICLE_BUS',         // Xe buýt di động 1 tầng (Chuyển làn)
  VEHICLE_BIKE: 'VEHICLE_BIKE',       // Xe máy di động (Chuyển làn)
  VEHICLE_DOUBLE_DECKER: 'VEHICLE_DOUBLE_DECKER' // Xe buýt 2 tầng Sài Gòn mui trần (Chuyển làn)
};

// ----------------------------------------------------
// 1. LỚP CƠ SỞ CHƯỚNG NGẠI VẬT (Base Obstacle)
// ----------------------------------------------------
export class Obstacle {
  constructor(scene, type, laneIndex, startZ) {
    this.scene = scene;
    this.type = type;
    this.laneIndex = laneIndex; // 0: Trái, 1: Giữa, 2: Phải
    
    const lanesX = [LANE.LEFT, LANE.CENTER, LANE.RIGHT];
    this.xPos = lanesX[this.laneIndex];
    this.zPos = startZ;
    
    this.meshGroup = new THREE.Group();
    this.meshGroup.position.set(this.xPos, 0, this.zPos);
    
    this.boundingBox = new THREE.Box3();
    
    // Tốc độ di chuyển riêng của chướng ngại vật (chỉ dùng cho phương tiện giao thông)
    this.ownSpeed = 0; 
    
    this.scene.add(this.meshGroup);
  }

  updateBoundingBox() {
    this.boundingBox.setFromObject(this.meshGroup);
    // Kẹp chặt bề rộng X của chướng ngại vật theo tâm làn đường xPos (bề rộng tối đa 2.0m)
    // Đảm bảo kính chiếu hậu hay chi tiết hông xe không tràn sang làn bên cạnh gây va chạm sai!
    const laneX = this.xPos;
    if (this.boundingBox.min.x < laneX - 1.0) this.boundingBox.min.x = laneX - 1.0;
    if (this.boundingBox.max.x > laneX + 1.0) this.boundingBox.max.x = laneX + 1.0;
  }

  update(deltaTime, currentSpeed) {
    // Di chuyển chướng ngại vật về phía người chơi (+Z)
    // Tổng vận tốc = tốc độ cuộn đường + tốc độ riêng của xe (nếu chạy ngược chiều)
    const totalSpeed = currentSpeed + this.ownSpeed;
    this.meshGroup.position.z += totalSpeed * deltaTime;
    
    // Cập nhật bounding box
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

// ----------------------------------------------------
// 2. LỚP RÀO CHẮN THẤP (Roadblock - Nhảy qua)
// ----------------------------------------------------
export class Roadblock extends Obstacle {
  constructor(scene, laneIndex, startZ) {
    super(scene, OBSTACLE_TYPES.ROADBLOCK, laneIndex, startZ);
    this.initMesh();
  }

  initMesh() {
    const glbModel = AssetManager.getModel('roadblock');
    if (glbModel) {
      this.meshGroup.add(glbModel);
    } else {
      const group = new THREE.Group();

      const orangeMat = new THREE.MeshStandardMaterial({ color: 0xff3d00, roughness: 0.3, metalness: 0.2 });
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
      const concreteMat = new THREE.MeshStandardMaterial({ color: 0x757575, roughness: 0.9 });
      const blackMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.8 });

      // 1. Chân đế bê tông nặng giữ rào chắn
      const footGeo = new THREE.BoxGeometry(0.35, 0.18, 0.6);
      const footL = new THREE.Mesh(footGeo, concreteMat);
      footL.position.set(-0.95, 0.09, 0);
      footL.castShadow = true;
      group.add(footL);

      const footR = footL.clone();
      footR.position.x = 0.95;
      group.add(footR);

      // 2. Trụ A-Frame rào chắn công trình
      const legGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.85, 8);
      const leg1 = new THREE.Mesh(legGeo, orangeMat);
      leg1.position.set(-0.95, 0.45, 0);
      leg1.castShadow = true;
      group.add(leg1);

      const leg2 = leg1.clone();
      leg2.position.x = 0.95;
      group.add(leg2);

      // 3. Thanh chắn ngang chính sọc đỏ-trắng phản quang
      const barFrameGeo = new THREE.BoxGeometry(2.0, 0.32, 0.08);
      const barFrame = new THREE.Mesh(barFrameGeo, orangeMat);
      barFrame.position.set(0, 0.65, 0);
      barFrame.castShadow = true;
      group.add(barFrame);

      // Sọc trắng phản quang đè lên
      for (let s = -0.7; s <= 0.7; s += 0.45) {
        const stripeGeo = new THREE.BoxGeometry(0.2, 0.33, 0.09);
        const stripe = new THREE.Mesh(stripeGeo, whiteMat);
        stripe.position.set(s, 0.65, 0);
        group.add(stripe);
      }

      // 4. Biển báo hình thoi "CÔNG TRƯỜNG" màu vàng ở giữa
      const signGeo = new THREE.BoxGeometry(0.38, 0.38, 0.1);
      const signMat = new THREE.MeshStandardMaterial({ color: 0xffea00, emissive: 0xffd600, emissiveIntensity: 0.2 });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.set(0, 0.65, 0.06);
      sign.rotation.z = Math.PI / 4;
      group.add(sign);

      // 5. Đèn xoay cảnh báo công trình màu cam phát sáng trên đỉnh
      const beaconBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.1, 8), blackMat);
      beaconBase.position.set(0, 0.86, 0);
      group.add(beaconBase);

      const beaconLight = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffab00 }));
      beaconLight.position.set(0, 0.94, 0);
      group.add(beaconLight);

      this.meshGroup.add(group);
    }

    this.updateBoundingBox();
  }
}

// ----------------------------------------------------
// 3. LỚP RÀO CHẮN CAO (Barrier - Trượt qua)
// ----------------------------------------------------
export class Barrier extends Obstacle {
  constructor(scene, laneIndex, startZ) {
    super(scene, OBSTACLE_TYPES.BARRIER, laneIndex, startZ);
    this.initMesh();
  }

  initMesh() {
    const glbModel = AssetManager.getModel('barrier');
    if (glbModel) {
      this.meshGroup.add(glbModel);
    } else {
      const group = new THREE.Group();

      const metalMat = new THREE.MeshStandardMaterial({ color: 0x546e7a, metalness: 0.8, roughness: 0.3 });
      const yellowMat = new THREE.MeshStandardMaterial({ color: 0xffeb3b, roughness: 0.3 });
      const blackMat = new THREE.MeshStandardMaterial({ color: 0x212121, roughness: 0.7 });
      const redLightMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });

      // 1. Khung thép trụ đôi hai bên (Height 2.3m)
      const poleGeo = new THREE.CylinderGeometry(0.06, 0.08, 2.3, 8);
      const poleL = new THREE.Mesh(poleGeo, metalMat);
      poleL.position.set(-1.15, 1.15, 0);
      poleL.castShadow = true;
      group.add(poleL);

      const poleR = poleL.clone();
      poleR.position.x = 1.15;
      group.add(poleR);

      // 2. Thanh rào ngang nguy hiểm ở độ cao 1.6m (người chơi phải trượt bên dưới)
      const barGeo = new THREE.BoxGeometry(2.35, 0.28, 0.1);
      const bar = new THREE.Mesh(barGeo, yellowMat);
      bar.position.set(0, 1.65, 0);
      bar.castShadow = true;
      group.add(bar);

      // Sọc đen cảnh báo nghiêng trên thanh ngang
      for (let s = -0.9; s <= 0.9; s += 0.45) {
        const stripeGeo = new THREE.BoxGeometry(0.2, 0.29, 0.11);
        const stripe = new THREE.Mesh(stripeGeo, blackMat);
        stripe.position.set(s, 1.65, 0);
        group.add(stripe);
      }

      // 3. Dây điện chằng chịt treo lơ lửng bên dưới
      const cableMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
      for (let c = -0.7; c <= 0.7; c += 0.7) {
        const cableGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6);
        const cable = new THREE.Mesh(cableGeo, cableMat);
        cable.position.set(c, 1.35, 0);
        group.add(cable);
      }

      // 4. Đèn LED đỏ tín hiệu tĩnh không ở 2 đỉnh trụ
      const lightL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), redLightMat);
      lightL.position.set(-1.15, 2.35, 0);
      group.add(lightL);

      const lightR = lightL.clone();
      lightR.position.x = 1.15;
      group.add(lightR);

      this.meshGroup.add(group);
    }

    this.updateBoundingBox();
  }
}

// ----------------------------------------------------
// 4. LỚP XE BÁN HÀNG RONG (VendorCart)
// ----------------------------------------------------
export class VendorCart extends Obstacle {
  constructor(scene, laneIndex, startZ) {
    super(scene, OBSTACLE_TYPES.VENDOR_CART, laneIndex, startZ);
    this.initMesh();
  }

  initMesh() {
    const glbModel = AssetManager.getModel('vendor_cart');
    if (glbModel) {
      this.meshGroup.add(glbModel);
    } else {
      // Thân xe bọc inox/kính
      const bodyGeo = new THREE.BoxGeometry(1.2, 0.9, 1.4);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.8, roughness: 0.2 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.set(0, 0.65, 0);
      body.castShadow = true;
      body.receiveShadow = true;
      this.meshGroup.add(body);

      // Bánh xe
      const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 8);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x212121 });
      
      const wheelFrontLeft = new THREE.Mesh(wheelGeo, wheelMat);
      wheelFrontLeft.rotation.z = Math.PI / 2;
      wheelFrontLeft.position.set(-0.55, 0.18, -0.5);
      wheelFrontLeft.castShadow = true;
      this.meshGroup.add(wheelFrontLeft);

      const wheelFrontRight = wheelFrontLeft.clone();
      wheelFrontRight.position.x = 0.55;
      this.meshGroup.add(wheelFrontRight);

      const wheelBackLeft = wheelFrontLeft.clone();
      wheelBackLeft.position.z = 0.5;
      this.meshGroup.add(wheelBackLeft);

      const wheelBackRight = wheelFrontRight.clone();
      wheelBackRight.position.z = 0.5;
      this.meshGroup.add(wheelBackRight);

      // Trụ mái che
      const pGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8);
      const pMat = new THREE.MeshStandardMaterial({ color: 0x9e9e9e });
      for (let x = -0.55; x <= 0.55; x += 1.1) {
        for (let z = -0.6; z <= 0.6; z += 1.2) {
          const pole = new THREE.Mesh(pGeo, pMat);
          pole.position.set(x, 1.4, z);
          pole.castShadow = true;
          this.meshGroup.add(pole);
        }
      }

      // Mái bạt sọc đỏ cam
      const roofGeo = new THREE.BoxGeometry(1.35, 0.15, 1.6);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0xff3d00, roughness: 0.7 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.set(0, 1.8, 0);
      roof.castShadow = true;
      this.meshGroup.add(roof);
    }

    this.updateBoundingBox();
  }
}

export class Vehicle extends Obstacle {
  constructor(scene, type, laneIndex, startZ) {
    super(scene, type, laneIndex, startZ);
    this.animTime = Math.random() * 10;
    
    if (this.type === OBSTACLE_TYPES.VEHICLE_BUS) {
      this.ownSpeed = 6;
      this.initBusMesh();
    } else if (this.type === OBSTACLE_TYPES.VEHICLE_DOUBLE_DECKER) {
      this.ownSpeed = 7;
      this.initDoubleDeckerBusMesh();
    } else {
      this.ownSpeed = 12;
      this.initBikeMesh();
    }
  }

  update(deltaTime, currentSpeed) {
    super.update(deltaTime, currentSpeed);
    // Nhịp nẩy xóc động cơ và mặt đường giúp xe trông sinh động đang lao về phía trước
    this.animTime += deltaTime * 18;
    this.meshGroup.position.y = Math.sin(this.animTime) * 0.03;
  }

  initDoubleDeckerBusMesh() {
    const busGroup = new THREE.Group();

    const redMat = new THREE.MeshStandardMaterial({ color: 0xd50000, roughness: 0.2, metalness: 0.6 }); // Đỏ mui trần Sài Gòn
    const yellowMat = new THREE.MeshStandardMaterial({ color: 0xffd600, roughness: 0.3 }); // Vàng chói lọi
    const windowGlassMat = new THREE.MeshStandardMaterial({ color: 0x80deea, transparent: true, opacity: 0.7, roughness: 0.1 });
    const blackTrimMat = new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.8 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.9, roughness: 0.1 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0xff6f00, roughness: 0.5 }); // Ghế cam mui trần

    // 1. Thân tầng 1 màu đỏ (Lower Deck)
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 5.5), redMat);
    lowerBody.position.set(0, 0.7, 0);
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    busGroup.add(lowerBody);

    // 2. Tầng 2 mui trần (Upper Open Deck) với vách đỏ & lan can mạ crom
    const upperWall = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 5.5), redMat);
    upperWall.position.set(0, 1.75, 0);
    upperWall.castShadow = true;
    busGroup.add(upperWall);

    // Lan can an toàn mạ crom quanh tầng 2
    const railGeo = new THREE.BoxGeometry(2.25, 0.1, 5.55);
    const rail = new THREE.Mesh(railGeo, chromeMat);
    rail.position.set(0, 2.25, 0);
    busGroup.add(rail);

    // Hàng ghế du khách màu cam nổi bật trên tầng 2 mui trần
    for (let row = -2.0; row <= 2.0; row += 0.8) {
      const seatL = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.4), seatMat);
      seatL.position.set(-0.6, 2.2, row);
      busGroup.add(seatL);

      const seatR = seatL.clone();
      seatR.position.x = 0.6;
      busGroup.add(seatR);
    }

    // 3. Kính chắn gió tầng 1 & tầng 2 trước (Front Windshields facing +Z)
    const glass1 = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.8), windowGlassMat);
    glass1.position.set(0, 1.1, -2.76);
    glass1.rotation.y = Math.PI;
    busGroup.add(glass1);

    const glass2 = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.6), windowGlassMat);
    glass2.position.set(0, 1.9, -2.76);
    glass2.rotation.y = Math.PI;
    busGroup.add(glass2);

    // Biển hiệu LED "SAIGON CITY TOUR" phát sáng vàng rực
    const routeBox = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 0.1), new THREE.MeshBasicMaterial({ color: 0xffea00 }));
    routeBox.position.set(0, 2.45, -2.77);
    busGroup.add(routeBox);

    // 4. Biển quảng cáo hông "HOP-ON HOP-OFF"
    const sideBannerL = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.6), yellowMat);
    sideBannerL.position.set(-1.11, 0.7, 0);
    sideBannerL.rotation.y = -Math.PI / 2;
    busGroup.add(sideBannerL);

    const sideBannerR = sideBannerL.clone();
    sideBannerR.position.x = 1.11;
    sideBannerR.rotation.y = Math.PI / 2;
    busGroup.add(sideBannerR);

    // 5. Đèn pha LED trước & Bánh xe
    const lightGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 14);
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    
    const headlightL = new THREE.Mesh(lightGeo, lightMat);
    headlightL.rotation.x = Math.PI / 2;
    headlightL.position.set(-0.8, 0.55, -2.77);
    busGroup.add(headlightL);

    const headlightR = headlightL.clone();
    headlightR.position.x = 0.8;
    busGroup.add(headlightR);

    // 4 Bánh xe buýt lớn
    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.38, 14);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.6 });

    const wFL = new THREE.Mesh(wheelGeo, wheelMat);
    wFL.rotation.z = Math.PI / 2;
    wFL.position.set(-1.02, 0.5, -1.7);
    wFL.castShadow = true;
    busGroup.add(wFL);

    const wFR = wFL.clone();
    wFR.position.x = 1.02;
    busGroup.add(wFR);

    const wBL = wFL.clone();
    wBL.position.z = 1.7;
    busGroup.add(wBL);

    const wBR = wFR.clone();
    wBR.position.z = 1.7;
    busGroup.add(wBR);

    // XOAY 180 ĐỘ HƯỚNG MẶT TRƯỚC VỀ NGƯỜI CHƠI
    busGroup.rotation.y = Math.PI;

    this.meshGroup.add(busGroup);
  }

  initBusMesh() {
    const glbModel = AssetManager.getModel('bus');
    if (glbModel) {
      this.meshGroup.add(glbModel);
    } else {
      const busGroup = new THREE.Group();

      const greenMat = new THREE.MeshStandardMaterial({ color: 0x00c853, roughness: 0.2, metalness: 0.5 }); // Xanh lá xe buýt Sài Gòn rực rỡ
      const creamMat = new THREE.MeshStandardMaterial({ color: 0xfff8e1, roughness: 0.4 }); // Nắp mái kem trắng
      const darkGlassMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 }); // Kính xe đen bóng
      const windowGlassMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.7, roughness: 0.1 }); // Kính hông sáng xanh
      const blackTrimMat = new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 0.8 });
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.9, roughness: 0.1 });

      // 1. Thân dưới màu xanh lá (Bottom Green Body)
      const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.15, 1.1, 5.2), greenMat);
      lowerBody.position.set(0, 0.65, 0);
      lowerBody.castShadow = true;
      lowerBody.receiveShadow = true;
      busGroup.add(lowerBody);

      // 2. Thân trên & Mái xe buýt màu kem trắng (Upper Cream Roof)
      const upperRoof = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.9, 5.2), creamMat);
      upperRoof.position.set(0, 1.65, 0);
      upperRoof.castShadow = true;
      busGroup.add(upperRoof);

      // 3. Kính chắn gió trước cực rộng (Front Windshield facing +Z towards player)
      const frontGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.95, 0.95), windowGlassMat);
      frontGlass.position.set(0, 1.5, -2.61);
      frontGlass.rotation.y = Math.PI;
      busGroup.add(frontGlass);

      // Biển số hiệu tuyến xe buýt phát sáng "150: BẾN XE CHỢ LỚN"
      const routeBox = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 0.1), new THREE.MeshBasicMaterial({ color: 0xffea00 }));
      routeBox.position.set(0, 2.0, -2.62);
      busGroup.add(routeBox);

      // Cần gạt nước kính trước (Windshield Wipers)
      const wiper = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.05, 0.05), blackTrimMat);
      wiper.position.set(0, 1.1, -2.62);
      busGroup.add(wiper);

      // 4. CỬA LÊN XUỐNG HÀNH KHÁCH (Passenger Doors) ở phía bên phải
      const doorL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.5, 0.7), windowGlassMat);
      doorL.position.set(1.08, 1.0, -1.2);
      busGroup.add(doorL);

      const doorR = doorL.clone();
      doorR.position.z = 1.2;
      busGroup.add(doorR);

      // Viền cao su đen quanh cửa xe buýt
      const doorFrameL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.55, 0.75), blackTrimMat);
      doorFrameL.position.set(1.07, 1.0, -1.2);
      busGroup.add(doorFrameL);

      const doorFrameR = doorFrameL.clone();
      doorFrameR.position.z = 1.2;
      busGroup.add(doorFrameR);

      // 5. Dãy cửa sổ kính hai bên hông xe (Side Passenger Windows)
      for (let zWin = -1.8; zWin <= 1.8; zWin += 1.2) {
        if (Math.abs(zWin - 1.2) < 0.2 || Math.abs(zWin + 1.2) < 0.2) continue; // Nhường chỗ cho cửa

        const winL = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.7), windowGlassMat);
        winL.position.set(-1.08, 1.5, zWin);
        winL.rotation.y = -Math.PI / 2;
        busGroup.add(winL);

        const winR = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.7), windowGlassMat);
        winR.position.set(1.08, 1.5, zWin);
        winR.rotation.y = Math.PI / 2;
        busGroup.add(winR);
      }

      // 6. Cản trước, Lưới tản nhiệt & Biển số xe Sài Gòn
      const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.32, 0.2), blackTrimMat);
      bumper.position.set(0, 0.25, -2.55);
      busGroup.add(bumper);

      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.05), new THREE.MeshBasicMaterial({ color: 0xffd600 }));
      plate.position.set(0, 0.25, -2.66);
      busGroup.add(plate);

      // 7. Đèn pha LED sáng rực rỡ chiếu thẳng về người chơi
      const lightGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 14);
      const lightMat = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Đèn pha vàng sáng
      
      const headlightL = new THREE.Mesh(lightGeo, lightMat);
      headlightL.rotation.x = Math.PI / 2;
      headlightL.position.set(-0.78, 0.58, -2.62);
      busGroup.add(headlightL);

      const headlightR = headlightL.clone();
      headlightR.position.x = 0.78;
      busGroup.add(headlightR);

      // 8. Gương chiếu hậu tai thỏ 2 bên (Bus Side Mirrors)
      const mirrorArmGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.55, 8);
      const mirrorL = new THREE.Mesh(mirrorArmGeo, blackTrimMat);
      mirrorL.rotation.z = -Math.PI / 3;
      mirrorL.position.set(-1.25, 1.75, -2.4);
      busGroup.add(mirrorL);

      const mirrorR = mirrorL.clone();
      mirrorR.rotation.z = Math.PI / 3;
      mirrorR.position.x = 1.25;
      busGroup.add(mirrorR);

      // 9. 4 Bánh xe buýt bánh kép mạ mâm đúc
      const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.35, 14);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.6 });

      const wFL = new THREE.Mesh(wheelGeo, wheelMat);
      wFL.rotation.z = Math.PI / 2;
      wFL.position.set(-1.0, 0.48, -1.6);
      wFL.castShadow = true;
      busGroup.add(wFL);

      const rimL = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.36, 10), chromeMat);
      rimL.rotation.z = Math.PI / 2;
      rimL.position.set(-1.0, 0.48, -1.6);
      busGroup.add(rimL);

      const wFR = wFL.clone();
      wFR.position.x = 1.0;
      busGroup.add(wFR);

      const rimR = rimL.clone();
      rimR.position.x = 1.0;
      busGroup.add(rimR);

      const wBL = wFL.clone();
      wBL.position.z = 1.6;
      busGroup.add(wBL);

      const rimBL = rimL.clone();
      rimBL.position.z = 1.6;
      busGroup.add(rimBL);

      const wBR = wFR.clone();
      wBR.position.z = 1.6;
      busGroup.add(wBR);

      const rimBR = rimR.clone();
      rimBR.position.z = 1.6;
      busGroup.add(rimBR);

      // XOAY 180 ĐỘ ĐỂ ĐẦU XE VÀ ĐÈN PHA CHIẾU THẲNG VỀ PHÍA NGƯỜI CHƠI
      busGroup.rotation.y = Math.PI;

      this.meshGroup.add(busGroup);
    }

    this.updateBoundingBox();
  }

  initBikeMesh() {
    const glbModel = AssetManager.getModel('bike');
    if (glbModel) {
      this.meshGroup.add(glbModel);
    } else {
      const bikeGroup = new THREE.Group();

      const redMat = new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0xd50000, emissiveIntensity: 0.4, roughness: 0.2, metalness: 0.7 });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.8 });
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.9, roughness: 0.1 });
      const glassMat = new THREE.MeshStandardMaterial({ color: 0x80deea, transparent: true, opacity: 0.65, roughness: 0.1 });

      // 1. Mặt nạ xe trước (Aerodynamic Front Cowl) thon gọn kiểu xe tay ga
      const frontCowlGeo = new THREE.ConeGeometry(0.38, 0.9, 10);
      const frontCowl = new THREE.Mesh(frontCowlGeo, redMat);
      frontCowl.rotation.x = Math.PI / 4;
      frontCowl.position.set(0, 0.7, -0.65);
      frontCowl.castShadow = true;
      bikeGroup.add(frontCowl);

      // Chắn bùn trước ôm sát bánh
      const mudguardGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 12, 1, false, 0, Math.PI);
      const mudguard = new THREE.Mesh(mudguardGeo, redMat);
      mudguard.rotation.z = Math.PI / 2;
      mudguard.rotation.x = -Math.PI / 6;
      mudguard.position.set(0, 0.45, -0.7);
      bikeGroup.add(mudguard);

      // 2. Thân xe giữa & Sàn để chân (Floorboard & Chassis)
      const floorGeo = new THREE.BoxGeometry(0.55, 0.12, 0.7);
      const floor = new THREE.Mesh(floorGeo, darkMat);
      floor.position.set(0, 0.32, -0.1);
      bikeGroup.add(floor);

      const bodyGeo = new THREE.BoxGeometry(0.58, 0.55, 0.9);
      const body = new THREE.Mesh(bodyGeo, redMat);
      body.position.set(0, 0.62, 0.3);
      body.castShadow = true;
      bikeGroup.add(body);

      // 3. Yên xe tay ga uốn cong mềm mại
      const seatGeo = new THREE.BoxGeometry(0.48, 0.16, 0.75);
      const seat = new THREE.Mesh(seatGeo, darkMat);
      seat.position.set(0, 0.88, 0.25);
      bikeGroup.add(seat);

      // Tay dắt sau xe (Grab Rail)
      const railGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 8);
      const rail = new THREE.Mesh(railGeo, chromeMat);
      rail.rotation.z = Math.PI / 2;
      rail.position.set(0, 0.95, 0.65);
      bikeGroup.add(rail);

      // 4. Bánh xe mâm đúc 5 chấu mạ crom cực đẹp
      const tireGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.18, 14);
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7 });

      // Bánh trước
      const frontTire = new THREE.Mesh(tireGeo, tireMat);
      frontTire.rotation.z = Math.PI / 2;
      frontTire.position.set(0, 0.3, -0.7);
      frontTire.castShadow = true;
      bikeGroup.add(frontTire);

      const frontRim = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.19, 10), chromeMat);
      frontRim.rotation.z = Math.PI / 2;
      frontRim.position.set(0, 0.3, -0.7);
      bikeGroup.add(frontRim);

      // Bánh sau
      const backTire = frontTire.clone();
      backTire.position.set(0, 0.3, 0.6);
      bikeGroup.add(backTire);

      const backRim = frontRim.clone();
      backRim.position.set(0, 0.3, 0.6);
      bikeGroup.add(backRim);

      // 5. Tay lái ghi-đông mạ crom & 2 Kính chiếu hậu tròn
      const barGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.75, 8);
      const bar = new THREE.Mesh(barGeo, chromeMat);
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, 0.95, -0.45);
      bikeGroup.add(bar);

      // Kính chiếu hậu trái & phải
      const mirrorGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 10);
      const mirrorLeft = new THREE.Mesh(mirrorGeo, chromeMat);
      mirrorLeft.rotation.x = Math.PI / 3;
      mirrorLeft.position.set(-0.35, 1.12, -0.45);
      bikeGroup.add(mirrorLeft);

      const mirrorRight = mirrorLeft.clone();
      mirrorRight.position.x = 0.35;
      bikeGroup.add(mirrorRight);

      // Kính chắn gió sành điệu
      const windshieldGeo = new THREE.PlaneGeometry(0.4, 0.35);
      const windshield = new THREE.Mesh(windshieldGeo, glassMat);
      windshield.position.set(0, 1.15, -0.48);
      windshield.rotation.x = -Math.PI / 6;
      bikeGroup.add(windshield);

      // 6. Đèn pha LED sáng rực rỡ + Xi nhan cam
      const lightGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.08, 12);
      const lightMat = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Vàng chói
      const headlight = new THREE.Mesh(lightGeo, lightMat);
      headlight.rotation.x = Math.PI / 2;
      headlight.position.set(0, 0.85, -0.72);
      bikeGroup.add(headlight);

      // Đèn xi nhan cam 2 bên
      const signalMat = new THREE.MeshBasicMaterial({ color: 0xff6d00 });
      const signalLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), signalMat);
      signalLeft.position.set(-0.25, 0.78, -0.68);
      bikeGroup.add(signalLeft);

      const signalRight = signalLeft.clone();
      signalRight.position.x = 0.25;
      bikeGroup.add(signalRight);

      // 7. Người lái xe máy chân thực (Áo khoác đen, Mũ bảo hiểm vàng kính đen)
      const riderGroup = new THREE.Group();

      const riderTorso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.58, 0.38), darkMat);
      riderTorso.position.set(0, 1.05, 0.05);
      riderTorso.rotation.x = -Math.PI / 10;
      riderGroup.add(riderTorso);

      // Mũ bảo hiểm vàng với kính râm mạ đen
      const helmetMat = new THREE.MeshStandardMaterial({ color: 0xffd600, roughness: 0.3 });
      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.23, 14, 14), helmetMat);
      helmet.position.set(0, 1.48, -0.08);
      riderGroup.add(helmet);

      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.15), new THREE.MeshBasicMaterial({ color: 0x000000 }));
      visor.position.set(0, 1.48, -0.22);
      riderGroup.add(visor);

      // Tay lái khom ôm ghi-đông
      const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.45, 8);
      const armLeft = new THREE.Mesh(armGeo, darkMat);
      armLeft.rotation.z = Math.PI / 4;
      armLeft.rotation.x = -Math.PI / 4;
      armLeft.position.set(-0.24, 1.1, -0.2);
      riderGroup.add(armLeft);

      const armRight = armLeft.clone();
      armRight.rotation.z = -Math.PI / 4;
      armRight.position.x = 0.24;
      riderGroup.add(armRight);

      bikeGroup.add(riderGroup);

      // XOAY 180 ĐỘ ĐỂ ĐẦU XE VÀ ĐÈN PHA CHIẾU THẲNG VỀ PHÍA NGƯỜI CHƠI (BÁN XUÔI)
      bikeGroup.rotation.y = Math.PI;

      bikeGroup.scale.set(1.4, 1.4, 1.4); // Kích thước to rõ 1.4x
      this.meshGroup.add(bikeGroup);
    }

    this.updateBoundingBox();
  }
}
