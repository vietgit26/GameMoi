import * as THREE from 'three';
import { GAME_CONFIG, LANE } from '../utils/Constants.js';

export class Environment {
  constructor(scene) {
    this.scene = scene;
    
    // Mảng chứa các đoạn đường chạy (tiles)
    this.segments = [];
    
    this.segmentLength = GAME_CONFIG.ROAD_SEGMENT_LENGTH;
    this.totalSegments = GAME_CONFIG.VISIBLE_ROAD_SEGMENTS;
    
    this.init();
  }

  init() {
    // Khởi tạo các đoạn đường liên kết nối tiếp nhau
    // Segment 0 ở phía sau camera (Z > 15), các segment tiếp theo kéo dài về phía trước
    // Mỗi segment có mesh nằm từ local Z = 0 đến Z = -segmentLength (40m)
    for (let i = 0; i < this.totalSegments; i++) {
      // i=0: zPos=55 (kéo dài từ +55 đến +15, hoàn toàn đằng sau camera ở Z=8)
      const zPos = 55 - (i * this.segmentLength);
      const segment = this.createSegment(zPos);
      this.scene.add(segment);
      this.segments.push(segment);
    }
  }

  createSegment(zPos) {
    const segment = new THREE.Group();
    segment.position.z = zPos;

    // 1. Mặt đường nhựa (Road) - plane nằm từ local Z=0 đến Z=-segmentLength
    // Tâm plane ở local Z = -segmentLength/2
    const roadGeo = new THREE.PlaneGeometry(9, this.segmentLength);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a24,
      roughness: 0.8,
      metalness: 0.1
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0;
    road.position.z = -this.segmentLength / 2;
    road.receiveShadow = true;
    segment.add(road);

    // 2. Vạch chia làn đường đứt quãng màu vàng ấm
    const stripeWidth = 0.15;
    const stripeLength = 4;
    const stripeGap = 3;
    const stripeCount = Math.ceil(this.segmentLength / (stripeLength + stripeGap));
    const stripeMaterial = new THREE.MeshBasicMaterial({ color: 0xffab00 }); // Màu vàng phân làn Việt Nam
    
    for (let i = 0; i < stripeCount; i++) {
      const z = - (i * (stripeLength + stripeGap)) - (stripeLength / 2);
      
      // Vạch trái phân cách làn trái và giữa (X = -1.5)
      const stripeLeft = new THREE.Mesh(new THREE.PlaneGeometry(stripeWidth, stripeLength), stripeMaterial);
      stripeLeft.rotation.x = -Math.PI / 2;
      stripeLeft.position.set(-1.5, 0.01, z);
      segment.add(stripeLeft);

      // Vạch phải phân cách làn giữa và phải (X = 1.5)
      const stripeRight = stripeLeft.clone();
      stripeRight.position.set(1.5, 0.01, z);
      segment.add(stripeRight);
    }

    // 3. Vỉa hè hai bên đường (Sidewalks) - màu gạch xám đỏ vỉa hè
    const sidewalkWidth = 4;
    const sidewalkHeight = 0.25;
    const sidewalkGeo = new THREE.BoxGeometry(sidewalkWidth, sidewalkHeight, this.segmentLength);
    const sidewalkMat = new THREE.MeshStandardMaterial({
      color: 0x424250, // Xám xi măng vỉa hè
      roughness: 0.9,
      metalness: 0.1
    });

    // Vỉa hè trái (X = -6.5)
    const sidewalkLeft = new THREE.Mesh(sidewalkGeo, sidewalkMat);
    sidewalkLeft.position.set(-6.5, sidewalkHeight / 2, -this.segmentLength / 2);
    sidewalkLeft.receiveShadow = true;
    segment.add(sidewalkLeft);

    // Vỉa hè phải (X = 6.5)
    const sidewalkRight = sidewalkLeft.clone();
    sidewalkRight.position.set(6.5, sidewalkHeight / 2, -this.segmentLength / 2);
    segment.add(sidewalkRight);

    // 4. Các tòa nhà phố Sài Gòn chân thực (Nhà ống, ban công, mái hiên & biển hiệu)
    this.buildBuildingsForSegment(segment);

    // 5. Cột đèn đường chiếu sáng (Streetlamps)
    this.buildStreetlampsForSegment(segment);

    // 6. Hàng cây xanh vỉa hè rậm rạp phong cách Sài Gòn (Street Trees)
    this.buildTreesForSegment(segment);

    return segment;
  }

  buildBuildingsForSegment(segment) {
    const buildingColors = [
      0xfbc02d, // Vàng kem kiến trúc Pháp cổ
      0x00acc1, // Xanh lam ngọc
      0xe57373, // Hồng gạch ấm
      0x546e7a, // Xám xanh chung cư
      0x43a047, // Xanh lá mạ
      0xd81b60  // Hồng thẫm
    ];

    const brandSigns = [
      { text: 'BÁNH MÌ SÀI GÒN 24/7', bg: '#c62828', textCol: '#ffff00' },
      { text: 'CÀ PHÊ SỮA ĐÁ 1975', bg: '#e65100', textCol: '#ffffff' },
      { text: 'PHỞ THÌN SÀI GÒN', bg: '#4e342e', textCol: '#fff8e1' },
      { text: 'HIGHLANDS COFFEE', bg: '#b71c1c', textCol: '#ffffff' },
      { text: 'TRÀ SỮA PHÚC LONG', bg: '#1b5e20', textCol: '#ffffff' },
      { text: 'VIETCOMBANK', bg: '#004d40', textCol: '#76ff03' },
      { text: 'SAIGON CENTRE', bg: '#d50000', textCol: '#ffea00' },
      { text: 'REX HOTEL SAIGON', bg: '#ff6f00', textCol: '#ffffff' },
      { text: 'BIDV TOWER', bg: '#0d47a1', textCol: '#ffffff' },
      { text: 'LANDMARK 81', bg: '#1a237e', textCol: '#ffd600' }
    ];

    const awningColors = [0xff9800, 0x00e676, 0x29b6f6, 0xe91e63];
    
    const zOffset = 9;
    const numBuildings = Math.floor(this.segmentLength / zOffset);
    
    for (let i = 0; i < numBuildings; i++) {
      const z = - (i * zOffset) - (zOffset / 2);
      
      // --- NHÀ BÊN TRÁI ---
      const wL = 3.6 + Math.random() * 1.2;
      const hL = 9 + Math.random() * 8; // Cao 9m - 17m
      const dL = 7.5;
      const brandL = brandSigns[i % brandSigns.length];
      
      const houseGroupL = this.createRealisticBuilding(wL, hL, dL, buildingColors[i % buildingColors.length], awningColors[i % awningColors.length], false, brandL);
      houseGroupL.position.set(-10 - wL/2, 0, z);
      segment.add(houseGroupL);

      // --- NHÀ BÊN PHẢI ---
      const wR = 3.6 + Math.random() * 1.2;
      const hR = 9 + Math.random() * 8;
      const dR = 7.5;
      const brandR = brandSigns[(i + 4) % brandSigns.length];
      
      const houseGroupR = this.createRealisticBuilding(wR, hR, dR, buildingColors[(i + 3) % buildingColors.length], awningColors[(i + 2) % awningColors.length], true, brandR);
      houseGroupR.position.set(10 + wR/2, 0, z);
      segment.add(houseGroupR);
    }
  }

  _createBuildingTextTexture(text, bgColor = '#c62828', textColor = '#ffffff') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Nền biển hiệu với viền LED
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

    // Chữ thương hiệu Sài Gòn in hoa phát sáng LED
    ctx.fillStyle = textColor;
    ctx.font = 'bold 38px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 10;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  createRealisticBuilding(w, h, d, mainColor, awningColor, isRightSide, brandInfo) {
    const group = new THREE.Group();

    // 1. Khối nhà chính
    const mainGeo = new THREE.BoxGeometry(w, h, d);
    const mainMat = new THREE.MeshStandardMaterial({ color: mainColor, roughness: 0.7, metalness: 0.1 });
    const mainMesh = new THREE.Mesh(mainGeo, mainMat);
    mainMesh.position.y = h / 2;
    mainMesh.castShadow = true;
    mainMesh.receiveShadow = true;
    group.add(mainMesh);

    // 2. Gờ mái & viền tường tầng trệt
    const ledgeGeo = new THREE.BoxGeometry(w + 0.3, 0.3, d + 0.3);
    const ledgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const ledge = new THREE.Mesh(ledgeGeo, ledgeMat);
    ledge.position.y = 3.2; // Trên tầng trệt
    group.add(ledge);

    const roofLedge = ledge.clone();
    roofLedge.position.y = h + 0.15;
    group.add(roofLedge);

    // 3. Mái hiên di động cửa hàng (Awnings) ở tầng trệt
    const awningGeo = new THREE.BoxGeometry(0.8, 0.15, d - 1.0);
    const awningMat = new THREE.MeshStandardMaterial({ color: awningColor, roughness: 0.6 });
    const awning = new THREE.Mesh(awningGeo, awningMat);
    const xAwning = isRightSide ? -w/2 - 0.3 : w/2 + 0.3;
    awning.position.set(xAwning, 2.8, 0);
    awning.rotation.z = isRightSide ? 0.2 : -0.2;
    group.add(awning);

    // 4. Biển hiệu cửa hàng mặt tiền có chữ thương hiệu Sài Gòn (Storefront Signboard)
    if (brandInfo) {
      const signTex = this._createBuildingTextTexture(brandInfo.text, brandInfo.bg, brandInfo.textCol);
      const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
      const signGeo = new THREE.PlaneGeometry(d - 1.8, 0.85);
      const sign = new THREE.Mesh(signGeo, signMat);
      
      // Xoay và gắn biển hiệu lên mặt tường quay ra đường
      sign.rotation.y = isRightSide ? -Math.PI / 2 : Math.PI / 2;
      sign.position.set(isRightSide ? -w/2 - 0.05 : w/2 + 0.05, 3.8, 0);
      group.add(sign);

      // Biển hiệu Neon LED trên mái nhà (dành cho tòa nhà cao h >= 13m)
      if (h >= 13) {
        const roofSignTex = this._createBuildingTextTexture(brandInfo.text, brandInfo.bg, brandInfo.textCol);
        const roofSignMat = new THREE.MeshBasicMaterial({ map: roofSignTex, side: THREE.DoubleSide });
        const roofSignGeo = new THREE.PlaneGeometry(d - 2.5, 1.2);
        const roofSign = new THREE.Mesh(roofSignGeo, roofSignMat);
        roofSign.rotation.y = isRightSide ? -Math.PI / 2 : Math.PI / 2;
        roofSign.position.set(isRightSide ? -w/2 - 0.08 : w/2 + 0.08, h + 0.9, 0);
        group.add(roofSign);
      }
    }

    // 5. Cửa sổ phát sáng & Ban công (Windows & Balconies)
    const windowMat = new THREE.MeshBasicMaterial({ color: 0xfff59d });
    const balconyMat = new THREE.MeshStandardMaterial({ color: 0x424242, metalness: 0.8 });

    const numFloors = Math.floor((h - 3.5) / 2.5);
    for (let f = 0; f < numFloors; f++) {
      const y = 5.0 + f * 2.5;

      // Cửa sổ
      const winGeo = new THREE.PlaneGeometry(0.8, 1.2);
      const win = new THREE.Mesh(winGeo, windowMat);
      win.position.set(isRightSide ? -w/2 - 0.02 : w/2 + 0.02, y, 0);
      win.rotation.y = isRightSide ? -Math.PI / 2 : Math.PI / 2;
      group.add(win);

      // Ban công lan can sắt
      const balconyGeo = new THREE.BoxGeometry(0.5, 0.4, 1.6);
      const balcony = new THREE.Mesh(balconyGeo, balconyMat);
      balcony.position.set(isRightSide ? -w/2 - 0.25 : w/2 + 0.25, y - 0.5, 0);
      group.add(balcony);
    }

    // 6. Bồn nước Inox trên mái nhà (Roof Water Tank)
    const tankGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.0, 10);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.9, roughness: 0.1 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.rotation.z = Math.PI / 2;
    tank.position.set(0, h + 0.8, (Math.random() - 0.5) * 2);
    group.add(tank);

    return group;
  }

  buildStreetlampsForSegment(segment) {
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x757575, metalness: 0.8, roughness: 0.2 });
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
    const lampHeight = 4.5;
    
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, lampHeight, 8);
    const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 8);
    const bulbGeo = new THREE.SphereGeometry(0.18, 8, 8);
    
    const zPositions = [-5, -this.segmentLength + 10];
    
    zPositions.forEach(z => {
      const poleL = new THREE.Mesh(poleGeo, lampMat);
      poleL.position.set(-4.6, lampHeight / 2, z);
      poleL.castShadow = true;
      segment.add(poleL);
      
      const armL = new THREE.Mesh(armGeo, lampMat);
      armL.rotation.z = Math.PI / 2;
      armL.position.set(-4.2, lampHeight - 0.1, z);
      segment.add(armL);
      
      const bulbL = new THREE.Mesh(bulbGeo, bulbMat);
      bulbL.position.set(-3.8, lampHeight - 0.2, z);
      segment.add(bulbL);

      const poleR = poleL.clone();
      poleR.position.x = 4.6;
      segment.add(poleR);
      
      const armR = armL.clone();
      armR.position.x = 4.2;
      segment.add(armR);
      
      const bulbR = bulbL.clone();
      bulbR.position.x = 3.8;
      segment.add(bulbR);
    });
  }

  buildTreesForSegment(segment) {
    // Rải hàng Cây Xanh Đường Phố Sài Gòn Chân Thực 100% Như Ngoài Đời (X = -4.8 và X = 4.8)
    const zPositions = [-10, -28];

    zPositions.forEach(z => {
      // Cây bên trái
      const treeL = this.createRealLifeStreetTree();
      treeL.position.set(-4.8, 0, z);
      segment.add(treeL);

      // Cây bên phải
      const treeR = this.createRealLifeStreetTree();
      treeR.rotation.y = Math.PI * 0.75; // Xoay góc tự nhiên
      treeR.position.set(4.8, 0, z);
      segment.add(treeR);
    });
  }

  createRealLifeStreetTree() {
    const tree = new THREE.Group();

    // 1. Gốc rễ xòe ôm vỉa hè & Thân cây xù xì chân thực (Root Buttresses & Bark Trunk)
    const barkMat = new THREE.MeshStandardMaterial({ color: 0x3a2318, roughness: 0.95, metalness: 0.05 });

    // Gốc cây 4 chấu xòe rộng bám lề đường
    for (let r = 0; r < 4; r++) {
      const rootAngle = (r / 4) * Math.PI * 2;
      const rootPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.32, 0.9, 8), barkMat);
      rootPillar.position.set(Math.cos(rootAngle) * 0.28, 0.45, Math.sin(rootAngle) * 0.28);
      rootPillar.rotation.z = Math.cos(rootAngle) * 0.3;
      rootPillar.rotation.x = Math.sin(rootAngle) * 0.3;
      rootPillar.castShadow = true;
      tree.add(rootPillar);
    }

    // Thân chính thon uốn 3D chân thực
    const trunkGeo = new THREE.CylinderGeometry(0.22, 0.42, 3.6, 16);
    const trunk = new THREE.Mesh(trunkGeo, barkMat);
    trunk.position.set(0.02, 2.0, -0.02);
    trunk.rotation.z = -0.04;
    trunk.castShadow = true;
    tree.add(trunk);

    // 2. 4 Cành chính phân nhánh vươn tỏa ra 4 hướng
    const branchPositions = [
      { rx: 0.45, ry: 0, rz: 0.45, x: 0.32, y: 3.3, z: 0.2 },
      { rx: -0.35, ry: 1.8, rz: -0.45, x: -0.32, y: 3.4, z: 0.3 },
      { rx: 0.25, ry: 3.6, rz: 0.38, x: 0.15, y: 3.5, z: -0.35 },
      { rx: -0.4, ry: 5.2, rz: -0.25, x: -0.2, y: 3.6, z: -0.25 }
    ];

    branchPositions.forEach(bp => {
      const branchGeo = new THREE.CylinderGeometry(0.09, 0.18, 1.5, 10);
      const branch = new THREE.Mesh(branchGeo, barkMat);
      branch.position.set(bp.x, bp.y, bp.z);
      branch.rotation.set(bp.rx, bp.ry, bp.rz);
      branch.castShadow = true;
      tree.add(branch);
    });

    // 3. 12 Cụm tán lá lồng ghép đa tầng mượt mà như ngoài đời (Organic Multi-Tone Canopy)
    const leafMat1 = new THREE.MeshStandardMaterial({ color: 0x1b4332, roughness: 0.65 }); // Xanh lục sẫm lõi
    const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.55 }); // Xanh mướt ở giữa
    const leafMat3 = new THREE.MeshStandardMaterial({ color: 0x40916c, roughness: 0.5 });  // Xanh lá tươi
    const leafMat4 = new THREE.MeshStandardMaterial({ color: 0x52b788, roughness: 0.45 }); // Xanh ngọn rực rỡ
    const leafMat5 = new THREE.MeshStandardMaterial({ color: 0x74c69d, roughness: 0.4 });  // Xanh chóp nắng

    const leafClusters = [
      { x: 0, y: 4.3, z: 0, sx: 1.6, sy: 1.5, sz: 1.6, mat: leafMat1 },
      { x: 1.05, y: 4.5, z: 0.65, sx: 1.35, sy: 1.15, sz: 1.35, mat: leafMat2 },
      { x: -1.05, y: 4.6, z: 0.55, sx: 1.3, sy: 1.2, sz: 1.3, mat: leafMat3 },
      { x: 0.7, y: 4.7, z: -0.95, sx: 1.3, sy: 1.1, sz: 1.3, mat: leafMat2 },
      { x: -0.7, y: 4.8, z: -0.9, sx: 1.25, sy: 1.15, sz: 1.25, mat: leafMat3 },
      { x: 0, y: 5.4, z: 0.25, sx: 1.2, sy: 1.25, sz: 1.2, mat: leafMat4 },
      { x: 0.45, y: 5.7, z: -0.35, sx: 0.95, sy: 0.95, sz: 0.95, mat: leafMat5 },
      { x: -0.45, y: 5.1, z: 0.75, sx: 0.9, sy: 0.9, sz: 0.9, mat: leafMat4 },
      { x: 0.8, y: 4.0, z: -0.45, sx: 0.85, sy: 0.85, sz: 0.85, mat: leafMat2 },
      { x: -0.8, y: 4.1, z: -0.4, sx: 0.85, sy: 0.85, sz: 0.85, mat: leafMat3 },
      { x: 0.3, y: 4.9, z: 0.9, sx: 0.8, sy: 0.8, sz: 0.8, mat: leafMat4 },
      { x: -0.3, y: 5.8, z: 0.1, sx: 0.75, sy: 0.75, sz: 0.75, mat: leafMat5 }
    ];

    leafClusters.forEach(lc => {
      const clusterGeo = new THREE.IcosahedronGeometry(1.0, 2);
      const cluster = new THREE.Mesh(clusterGeo, lc.mat);
      cluster.position.set(lc.x, lc.y, lc.z);
      cluster.scale.set(lc.sx, lc.sy, lc.sz);
      cluster.castShadow = true;
      tree.add(cluster);
    });

    tree.scale.set(1.28, 1.28, 1.28); // Kích thước to rợp bóng mát chuẩn ngoài đời
    return tree;
  }

  update(deltaTime, currentSpeed) {
    // Di chuyển các đoạn đường lùi lại (theo trục +Z) tương ứng với tốc độ game
    this.segments.forEach(segment => {
      segment.position.z += currentSpeed * deltaTime;
      
      // Mỗi segment có chiều dài 40m (từ local Z=0 đến Z=-40).
      // Chỉ tái chế segment khi ĐUÔI CỦA NÓ (z - 40) đã vượt hoàn toàn qua camera (Z > 15).
      // Tức là segment.position.z > 55.
      if (segment.position.z > 55) {
        segment.position.z -= this.segmentLength * this.totalSegments;
      }
    });
  }

  dispose() {
    this.segments.forEach(segment => {
      this.scene.remove(segment);
      segment.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
    this.segments = [];
  }
}
