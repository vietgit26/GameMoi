import { GAME_STATES } from '../utils/Constants.js';

/**
 * StateMachine - Quản lý chuyển trạng thái game một cách có kiểm soát
 * Các trạng thái: LOADING → MENU → PLAYING ↔ FEVER → GAMEOVER
 */
export class StateMachine {
  constructor() {
    this.currentState = GAME_STATES.LOADING;
    this.previousState = null;
    
    // Map chứa các transitions hợp lệ
    // key: trạng thái hiện tại, value: danh sách trạng thái có thể chuyển sang
    this.transitions = {
      [GAME_STATES.LOADING]: [GAME_STATES.MENU],
      [GAME_STATES.MENU]: [GAME_STATES.PLAYING],
      [GAME_STATES.PLAYING]: [GAME_STATES.FEVER, GAME_STATES.GAMEOVER, GAME_STATES.MENU],
      [GAME_STATES.FEVER]: [GAME_STATES.PLAYING, GAME_STATES.GAMEOVER],
      [GAME_STATES.GAMEOVER]: [GAME_STATES.MENU, GAME_STATES.PLAYING],
    };
    
    // Callbacks khi vào và thoát khỏi trạng thái
    this.onEnterCallbacks = {};
    this.onExitCallbacks = {};
    this.onTransitionCallbacks = []; // gọi mỗi khi có bất kỳ transition nào
  }
  
  /**
   * Đăng ký callback khi vào trạng thái
   * @param {string} state - GAME_STATES value
   * @param {Function} callback - Hàm callback(previousState)
   */
  onEnter(state, callback) {
    this.onEnterCallbacks[state] = callback;
    return this;
  }
  
  /**
   * Đăng ký callback khi thoát trạng thái
   * @param {string} state - GAME_STATES value
   * @param {Function} callback - Hàm callback(nextState)
   */
  onExit(state, callback) {
    this.onExitCallbacks[state] = callback;
    return this;
  }
  
  /**
   * Đăng ký callback chung cho mọi transition
   * @param {Function} callback - Hàm callback(fromState, toState)
   */
  onAnyTransition(callback) {
    this.onTransitionCallbacks.push(callback);
    return this;
  }
  
  /**
   * Chuyển sang trạng thái mới
   * @param {string} newState - Trạng thái đích (GAME_STATES value)
   * @returns {boolean} - true nếu chuyển thành công, false nếu transition không hợp lệ
   */
  transition(newState) {
    const validNextStates = this.transitions[this.currentState];
    
    if (!validNextStates || !validNextStates.includes(newState)) {
      console.warn(
        `[StateMachine] Transition không hợp lệ: ${this.currentState} → ${newState}`
      );
      return false;
    }
    
    const fromState = this.currentState;
    
    // Gọi callback thoát trạng thái cũ
    if (this.onExitCallbacks[fromState]) {
      this.onExitCallbacks[fromState](newState);
    }
    
    // Cập nhật trạng thái
    this.previousState = fromState;
    this.currentState = newState;
    
    // Gọi callback vào trạng thái mới
    if (this.onEnterCallbacks[newState]) {
      this.onEnterCallbacks[newState](fromState);
    }
    
    // Gọi tất cả transition callbacks chung
    this.onTransitionCallbacks.forEach(cb => cb(fromState, newState));
    
    console.log(`[StateMachine] ${fromState} → ${newState}`);
    return true;
  }
  
  /**
   * Kiểm tra trạng thái hiện tại
   * @param {...string} states - Một hoặc nhiều trạng thái cần kiểm tra
   * @returns {boolean}
   */
  is(...states) {
    return states.includes(this.currentState);
  }
  
  /**
   * Buộc chuyển trạng thái (bỏ qua validation - dùng cho reset/debug)
   * @param {string} state
   */
  forceState(state) {
    this.previousState = this.currentState;
    this.currentState = state;
    
    if (this.onEnterCallbacks[state]) {
      this.onEnterCallbacks[state](this.previousState);
    }
    
    this.onTransitionCallbacks.forEach(cb => cb(this.previousState, state));
  }
  
  get state() {
    return this.currentState;
  }
}
