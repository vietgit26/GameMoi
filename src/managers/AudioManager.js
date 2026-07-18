/**
 * AudioManager - Quản lý âm thanh game qua Web Audio API
 * Hoạt động hoàn toàn KHÔNG phụ thuộc vào file .mp3 bên ngoài
 * Tổng hợp âm thanh procedural bằng oscillator
 */
export class AudioManager {
  constructor() {
    this.enabled = true;
    this.ctx = null; // AudioContext (lazy init)
    this.masterGain = null;
    this.bgmNode = null;      // BGM oscillator node
    this.bgmGain = null;
    this.bgmInterval = null;  // setInterval cho nhịp BGM
    
    // Volume settings
    this.masterVolume = 0.6;
    this.sfxVolume = 0.5;
    this.bgmVolume = 0.3;
  }
  
  /**
   * Khởi tạo AudioContext (lazy - gọi sau user gesture đầu tiên)
   */
  _ensureContext() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.masterVolume;
        this.masterGain.connect(this.ctx.destination);
      } catch (e) {
        console.warn('[AudioManager] Web Audio API không khả dụng:', e);
        this.enabled = false;
      }
    }
    
    // Resume context nếu bị trình duyệt tạm dừng
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    return this.ctx;
  }
  
  /**
   * Phát một âm thanh procedural ngắn
   * @param {string} type - loại oscillator: 'sine', 'square', 'sawtooth', 'triangle'
   * @param {number} frequency - Tần số (Hz)
   * @param {number} duration - Thời gian (giây)
   * @param {number} volume - Âm lượng 0-1
   * @param {number} [freqEnd] - Tần số kết thúc (cho hiệu ứng sweep)
   */
  _playTone(type, frequency, duration, volume = 0.5, freqEnd = null) {
    if (!this.enabled) return;
    const ctx = this._ensureContext();
    if (!ctx) return;
    
    try {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      if (freqEnd !== null) {
        osc.frequency.exponentialRampToValueAtTime(
          freqEnd,
          ctx.currentTime + duration
        );
      }
      
      gainNode.gain.setValueAtTime(volume * this.sfxVolume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Silent fail nếu AudioContext lỗi
    }
  }
  
  // === Âm thanh hiệu ứng (SFX) ===
  
  /**
   * Tiếng nhặt ly cà phê - âm thanh "ding" vui vẻ
   */
  playCoffeeCollect() {
    this._playTone('sine', 880, 0.12, 0.7);
    setTimeout(() => this._playTone('sine', 1320, 0.15, 0.5), 80);
    setTimeout(() => this._playTone('sine', 1760, 0.2, 0.4), 160);
  }
  
  /**
   * Tiếng nhảy - âm swoosh lên
   */
  playJump() {
    this._playTone('sine', 300, 0.25, 0.4, 600);
  }
  
  /**
   * Tiếng trượt - âm swoosh xuống nhẹ
   */
  playSlide() {
    this._playTone('sawtooth', 400, 0.2, 0.2, 180);
  }
  
  /**
   * Tiếng chuyển làn - click nhẹ
   */
  playLaneSwitch() {
    this._playTone('triangle', 500, 0.08, 0.3, 450);
  }
  
  /**
   * Kích hoạt Fever Mode - âm thanh rực lửa
   */
  playFeverActivate() {
    this._playTone('sawtooth', 200, 0.15, 0.6, 800);
    setTimeout(() => this._playTone('square', 600, 0.2, 0.4, 1200), 150);
    setTimeout(() => this._playTone('sine', 900, 0.3, 0.5, 1800), 280);
  }
  
  /**
   * Nhặt Power-Up chung - âm thanh ngân vang rực rỡ
   */
  playPowerUp() {
    this._playTone('sine', 523, 0.1, 0.7); // Do
    setTimeout(() => this._playTone('sine', 659, 0.1, 0.7), 80); // Mi
    setTimeout(() => this._playTone('sine', 784, 0.12, 0.7), 160); // Sol
    setTimeout(() => this._playTone('sine', 1046, 0.25, 0.8), 240); // Do cao
  }

  /**
   * Giáp Nón Lá đỡ đạn / vỡ khiên
   */
  playShieldBreak() {
    this._playTone('square', 600, 0.1, 0.8, 200);
    setTimeout(() => this._playTone('sawtooth', 300, 0.2, 0.6, 100), 70);
  }

  
  /**
   * Va chạm phá hủy chướng ngại (khi Fever) - âm bùng nổ
   */
  playSmash() {
    this._playTone('sawtooth', 150, 0.2, 0.8, 50);
    this._playTone('square', 250, 0.15, 0.5);
  }
  
  /**
   * Game Over - âm trầm buồn
   */
  playGameOver() {
    this._playTone('sine', 440, 0.3, 0.6);
    setTimeout(() => this._playTone('sine', 350, 0.4, 0.5), 250);
    setTimeout(() => this._playTone('sine', 220, 0.6, 0.7), 500);
  }
  
  /**
   * Đếm ngược 3-2-1 bắt đầu game
   */
  playCountdown() {
    this._playTone('sine', 660, 0.15, 0.5);
  }
  
  // === Nhạc nền (BGM) ===
  
  /**
   * Bắt đầu nhạc nền game - nhịp 4/4 đơn giản với giai điệu điện tử
   */
  startBGM() {
    if (!this.enabled) return;
    this.stopBGM();
    
    const ctx = this._ensureContext();
    if (!ctx) return;
    
    // Nhịp 120 BPM (mỗi nhịp = 0.5 giây)
    const tempo = 500; // ms
    let beat = 0;
    
    // Giai điệu cơ bản - nốt nhạc theo thang Pentatonic Việt Nam
    const melody = [523, 659, 784, 659, 523, 440, 523, 659]; // Do-Mi-Sol-Mi-Do-La-Do-Mi
    const bassLine = [130, 0, 165, 0, 130, 0, 146, 0];       // Low notes
    
    const playBeat = () => {
      if (!this.enabled) return;
      const idx = beat % melody.length;
      
      // Melody (sine wave nhẹ)
      if (melody[idx] > 0) {
        this._playTone('sine', melody[idx], 0.35, this.bgmVolume * 0.7);
      }
      
      // Bass line
      if (bassLine[idx] > 0) {
        this._playTone('triangle', bassLine[idx], 0.4, this.bgmVolume * 0.5);
      }
      
      // Hiệu ứng percussive nhẹ ở beat 1 và 3
      if (idx % 4 === 0) {
        this._playTone('square', 80, 0.08, this.bgmVolume * 0.3, 40);
      }
      
      beat++;
    };
    
    playBeat(); // Phát ngay lập tức
    this.bgmInterval = setInterval(playBeat, tempo);
  }
  
  /**
   * BGM Fever Mode - tốc độ nhanh hơn, âm thanh sôi động hơn
   */
  startFeverBGM() {
    if (!this.enabled) return;
    this.stopBGM();
    
    const ctx = this._ensureContext();
    if (!ctx) return;
    
    const tempo = 300; // 200 BPM - nhanh hơn
    let beat = 0;
    const feverMelody = [880, 1046, 784, 1046, 880, 698, 880, 1046];
    
    const playBeat = () => {
      if (!this.enabled) return;
      const idx = beat % feverMelody.length;
      
      if (feverMelody[idx] > 0) {
        this._playTone('sawtooth', feverMelody[idx], 0.25, this.bgmVolume * 0.6);
        this._playTone('sine', feverMelody[idx] * 0.5, 0.3, this.bgmVolume * 0.4);
      }
      
      // Kick mạnh mỗi 2 beat
      if (idx % 2 === 0) {
        this._playTone('square', 60, 0.1, this.bgmVolume * 0.5, 30);
      }
      
      beat++;
    };
    
    playBeat();
    this.bgmInterval = setInterval(playBeat, tempo);
  }
  
  /**
   * Dừng nhạc nền
   */
  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
  
  /**
   * Bật/Tắt âm thanh
   * @returns {boolean} - Trạng thái mới
   */
  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopBGM();
    }
    return this.enabled;
  }
  
  /**
   * Dừng tất cả âm thanh và dọn dẹp
   */
  dispose() {
    this.stopBGM();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
