let currentRoomBounds = { x: 20, z: 20 };
let joystickActive = false;
let joystickDirection = { x: 0, z: 0 };

console.log('スクリプト開始');

window.showRoomSelection = function() {
  const modal = document.getElementById('room-selection-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    const scene = document.getElementById('vr-scene');
    if (scene) {
      scene.style.pointerEvents = 'none';
    }
  }
};

window.addEventListener('DOMContentLoaded', () => {
  const roomCards = document.querySelectorAll('.room-card');
  roomCards.forEach(card => {
    let roomName = null;
    
    card.addEventListener('touchstart', function(e) {
      roomName = this.getAttribute('data-room');
      console.log('タッチ開始:', roomName);
    }, { passive: true });
    
    card.addEventListener('touchend', function(e) {
      e.preventDefault();
      if (roomName) {
        console.log('タッチ終了:', roomName);
        selectRoomHandler(roomName);
      }
    });
    
    card.addEventListener('click', function(e) {
      e.preventDefault();
      const name = this.getAttribute('data-room');
      console.log('クリック:', name);
      selectRoomHandler(name);
    });
  });
});

function selectRoomHandler(roomName) {
  console.log('部屋選択:', roomName);
  
  const modal = document.getElementById('room-selection-modal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
  
  const scene = document.getElementById('vr-scene');
  scene.style.display = 'block';
  scene.style.pointerEvents = 'auto';
  
  if (scene.hasLoaded) {
    loadRoomToScene(roomName);
  } else {
    scene.addEventListener('loaded', () => {
      loadRoomToScene(roomName);
    });
  }
}

window.addEventListener('load', () => {
  const scene = document.querySelector('a-scene');
  if (scene) {
    // A-Frame読み込み完了でローディング画面を非表示
    scene.addEventListener('loaded', () => {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.display = 'none';
      }
      console.log('A-Frame読み込み完了');
    });
  }
  
  initJoystick();
  console.log('ジョイスティック初期化完了');
  
  showRoomSelection();
});

function initJoystick() {
  const container = document.getElementById('joystick-container');
  const stick = document.getElementById('joystick-stick');
  const base = document.getElementById('joystick-base');
  
  if (!container || !stick || !base) return;
  
  const maxDistance = 35;
  
  function handleStart(e) {
    joystickActive = true;
  }
  
  function handleMove(e) {
    if (!joystickActive) return;
    
    e.preventDefault();
    
    const touch = e.touches ? e.touches[0] : e;
    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let deltaX = touch.clientX - centerX;
    let deltaY = touch.clientY - centerY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > maxDistance) {
      const angle = Math.atan2(deltaY, deltaX);
      deltaX = Math.cos(angle) * maxDistance;
      deltaY = Math.sin(angle) * maxDistance;
    }
    
    stick.style.left = (35 + deltaX) + 'px';
    stick.style.top = (35 + deltaY) + 'px';
    
    joystickDirection.x = deltaX / maxDistance;
    joystickDirection.z = deltaY / maxDistance;
  }
  
  function handleEnd() {
    joystickActive = false;
    stick.style.left = '35px';
    stick.style.top = '35px';
    joystickDirection.x = 0;
    joystickDirection.z = 0;
  }
  
  stick.addEventListener('touchstart', handleStart);
  document.addEventListener('touchmove', handleMove);
  document.addEventListener('touchend', handleEnd);
  
  stick.addEventListener('mousedown', handleStart);
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup', handleEnd);
}

function updateCameraFromJoystick() {
  if (!joystickActive) return;
  
  const camera = document.getElementById('camera');
  if (!camera) return;
  
  const pos = camera.getAttribute('position');
  const rot = camera.object3D.rotation;
  
  const moveSpeed = 0.1;
  
  const forward = {
    x: Math.sin(rot.y) * joystickDirection.z * moveSpeed,
    z: Math.cos(rot.y) * joystickDirection.z * moveSpeed
  };
  
  const strafe = {
    x: Math.cos(rot.y) * joystickDirection.x * moveSpeed,
    z: -Math.sin(rot.y) * joystickDirection.x * moveSpeed
  };
  
  pos.x += forward.x + strafe.x;
  pos.z += forward.z + strafe.z;
  
  const halfX = currentRoomBounds.x / 2;
  const halfZ = currentRoomBounds.z / 2;
  
  pos.x = Math.max(-halfX, Math.min(halfX, pos.x));
  pos.z = Math.max(-halfZ, Math.min(halfZ, pos.z));
  
  camera.setAttribute('position', pos);
}

setInterval(function() {
  let camera = document.querySelector('#camera');
  
  if (!camera) return;
  
  updateCameraFromJoystick();
  
  let cameraPos = camera.getAttribute('position');
  let changed = false;
  
  const halfX = currentRoomBounds.x / 2;
  const halfZ = currentRoomBounds.z / 2;
  
  if (cameraPos.x < -halfX) { cameraPos.x = -halfX; changed = true; }
  if (cameraPos.x > halfX) { cameraPos.x = halfX; changed = true; }
  if (cameraPos.z < -halfZ) { cameraPos.z = -halfZ; changed = true; }
  if (cameraPos.z > halfZ) { cameraPos.z = halfZ; changed = true; }
  
  if (changed) camera.setAttribute('position', cameraPos);
}, 50);

function loadRoomToScene(roomName) {
  const scene = document.querySelector('a-scene');
  
  // 旧いモデルを削除
  const oldRoom = document.getElementById('room-model');
  if (oldRoom) oldRoom.remove();
  
  let roomConfig;
  if (roomName === 'cgulia') {
    roomConfig = { 
      model: 'assets/models/room_cgulia.glb', 
      scale: '1 1 1', 
      position: '0 0 0',
      cameraPos: '0 1.6 3',
      bounds: { x: 10, z: 10 } 
    };
  } else if (roomName === 'cozy') {
    roomConfig = { 
      model: 'assets/models/cozy_living_room.glb', 
      scale: '1 1 1', 
      position: '0 0 0',
      cameraPos: '0 1.6 3',
      bounds: { x: 12, z: 12 } 
    };
  } else if (roomName === 'room3') {
    roomConfig = { 
      model: 'assets/models/room3.glb', 
      scale: '1 1 1', 
      position: '0 0 0',
      cameraPos: '0 1.6 3',
      bounds: { x: 10, z: 10 } 
    };
  } else if (roomName === 'room4') {
    roomConfig = { 
      model: 'assets/models/room4.glb', 
      scale: '1 1 1', 
      position: '0 0 0',
      cameraPos: '0 1.6 3',
      bounds: { x: 10, z: 10 } 
    };
  }
  
  // GLBモデルをロード
  const roomModel = document.createElement('a-entity');
  roomModel.setAttribute('id', 'room-model');
  roomModel.setAttribute('gltf-model', roomConfig.model);
  roomModel.setAttribute('scale', roomConfig.scale);
  roomModel.setAttribute('position', roomConfig.position);
  scene.appendChild(roomModel);
  
  // カメラ位置設定
  const camera = document.getElementById('camera');
  const camPos = roomConfig.cameraPos.split(' ');
  camera.setAttribute('position', `${camPos[0]} ${camPos[1]} ${camPos[2]}`);
  camera.setAttribute('rotation', '0 0 0');
  
  currentRoomBounds = roomConfig.bounds;
  
  console.log('部屋構築完了:', roomName, roomConfig);
}

console.log('初期化完了');
