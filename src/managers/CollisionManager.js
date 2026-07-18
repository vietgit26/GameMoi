import * as THREE from 'three';

/**
 * CollisionManager - Xử lý toàn bộ logic phát hiện va chạm AABB
 * Tách biệt khỏi Game.js để dễ bảo trì và mở rộng
 */
export class CollisionManager {
  constructor() {
    // Box dùng để kiểm tra va chạm tạm thời (tránh tạo object mới mỗi frame)
    this._tempBox = new THREE.Box3();
  }
  
  /**
   * Kiểm tra va chạm giữa nhân vật và danh sách chướng ngại vật (AABB)
   * @param {Player} player - Đối tượng nhân vật
   * @param {Obstacle[]} obstacles - Mảng chướng ngại vật
   * @returns {{ hit: boolean, obstacle: Obstacle|null }}
   */
  checkPlayerObstacles(player, obstacles) {
    if (!player || !player.boundingBox) {
      return { hit: false, obstacle: null };
    }
    
    const playerX = player.meshGroup.position.x;
    
    for (const obs of obstacles) {
      if (!obs || !obs.boundingBox || !obs.isAlive) continue;
      
      // KIỂM TRA LÀN ĐƯỜNG: Nếu khoảng cách giữa nhân vật và chướng ngại vật trên trục X > 1.4m
      // (tức người chơi ở làn khác), BỎ QUA không bao giờ gây Game Over nhầm làn!
      const obsX = obs.meshGroup.position.x;
      if (Math.abs(playerX - obsX) > 1.4) {
        continue;
      }
      
      this._tempBox.copy(obs.boundingBox);
      // Thu nhỏ nhẹ theo chiều dọc & sâu để trải nghiệm nhảy/trượt mượt mà
      this._tempBox.expandByScalar(-0.1);
      
      if (player.boundingBox.intersectsBox(this._tempBox)) {
        return { hit: true, obstacle: obs };
      }
    }
    
    return { hit: false, obstacle: null };
  }
  
  /**
   * Kiểm tra nhân vật có thu thập được ly cà phê không (sphere check)
   * @param {Player} player - Đối tượng nhân vật
   * @param {Collectible[]} collectibles - Mảng ly cà phê
   * @returns {Collectible[]} - Danh sách các ly đã được thu thập
   */
  checkPlayerCollectibles(player, collectibles) {
    if (!player || !player.visualGroup) return [];
    
    const playerPos = new THREE.Vector3();
    player.visualGroup.getWorldPosition(playerPos);
    
    const collected = [];
    for (const col of collectibles) {
      if (!col || !col.isAlive || col.isCollected) continue;
      if (col.checkCollection(playerPos)) {
        collected.push(col);
      }
    }
    
    return collected;
  }
  
  /**
   * Lọc và dọn dẹp các thực thể đã đi qua camera
   * @param {Array} entities - Mảng thực thể (obstacles hoặc collectibles)
   * @param {number} threshold - Ngưỡng Z để xóa (mặc định 15)
   * @returns {Array} - Mảng các thực thể còn sống
   */
  filterOutOfBounds(entities, threshold = 15) {
    return entities.filter(entity => {
      if (!entity.isAlive) {
        entity.dispose();
        return false;
      }
      
      const zPos = entity.meshGroup ? entity.meshGroup.position.z : 0;
      if (zPos > threshold) {
        entity.dispose();
        return false;
      }
      
      return true;
    });
  }
}
