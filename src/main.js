import { Game } from './core/Game.js';

// Khởi tạo và chạy game sau khi trang được tải hoàn tất
window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  
  // Xuất đối tượng game ra đối tượng window toàn cục để hỗ trợ kiểm thử từ Console của trình duyệt
  window.game = game;
  
  console.log('Sài Gòn Rush: Phase 1 khởi chạy thành công!');
});
