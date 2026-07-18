// Hằng số cấu hình cho Sài Gòn Rush

export const GAME_STATES = {
  LOADING: 'LOADING',
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  FEVER: 'FEVER',
  PAUSED: 'PAUSED',
  GAMEOVER: 'GAMEOVER'
};

export const LANE = {
  LEFT: -3,
  CENTER: 0,
  RIGHT: 3,
  WIDTH: 3,
  COUNT: 3,
  SWITCH_SPEED: 15 // Tốc độ nội suy chuyển làn (lerp factor)
};

export const PHYSICS = {
  GRAVITY: 32,          // Gia tốc trọng trường (m/s^2)
  JUMP_FORCE: 12,       // Lực nhảy ban đầu
  SLIDE_DURATION: 800,  // Thời gian trượt (ms)
  PLAYER_GROUND_Y: 0    // Độ cao mặt đất mặc định của nhân vật
};

export const GAME_CONFIG = {
  BASE_SPEED: 15,       // Tốc độ di chuyển ban đầu (m/s)
  SPEED_INCREMENT: 1.5, // Mỗi mốc tăng bao nhiêu tốc độ
  COFFEES_PER_TIER: 10, // Số cà phê cần nhặt để tăng 1 cấp tốc độ
  MAX_SPEED: 35,        // Tốc độ giới hạn tối đa
  FEVER_SPEED_MULTIPLIER: 1.5, // Hệ số nhân tốc độ khi Fever Mode
  FEVER_DURATION: 7000,  // Thời gian Fever Mode (ms)
  
  // Tầm nhìn camera và môi trường
  CAMERA_FOV: 60,
  CAMERA_FEVER_FOV: 75,
  CAMERA_LERP_SPEED: 5,
  
  ROAD_SEGMENT_LENGTH: 40, // Độ dài mỗi block đường chạy (Z)
  VISIBLE_ROAD_SEGMENTS: 6 // Số lượng block đường chạy kết xuất đồng thời (phủ đủ 240m)
};

export const POWERUP_TYPES = {
  SHIELD: 'SHIELD',          // Giáp Nón Lá (đỡ 1 va chạm)
  DOUBLE_SCORE: 'DOUBLE_SCORE', // Bánh Mì X2 Score (10s)
  BOOST: 'BOOST'             // Xe Ôm Boost Siêu Tốc (6s)
};

export const POWERUP_CONFIG = {
  DOUBLE_SCORE_DURATION: 10000, // 10 giây
  BOOST_DURATION: 6000          // 6 giây
};

export const CHARACTERS = {
  SHIPPER: {
    id: 'shipper',
    name: 'Anh Shipper Công Nghệ',
    desc: '+10% tốc độ sạc Fever Mode',
    feverChargeBonus: 1.1,
    scoreMultBonus: 1.0,
    coffeeBonus: 1.0
  },
  AO_DAI: {
    id: 'ao_dai',
    name: 'Nữ Sinh Áo Dài',
    desc: '+15% hệ số điểm số tổng',
    feverChargeBonus: 1.0,
    scoreMultBonus: 1.15,
    coffeeBonus: 1.0
  },
  BARISTA: {
    id: 'barista',
    name: 'Anh Chàng Barista',
    desc: '+25% điểm bonus khi nhặt cà phê',
    feverChargeBonus: 1.0,
    scoreMultBonus: 1.0,
    coffeeBonus: 1.25
  }
};

