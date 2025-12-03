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
  
  const oldFloor = document.getElementById('floor');
  const walls = document.querySelectorAll('a-plane[color="#F5F5F0"]');
  
  if (oldFloor) oldFloor.remove();
  walls.forEach(wall => wall.remove());
  
  let roomConfig;
  if (roomName === 'standard') {
    roomConfig = { size: 10, wallColor: '#F5F5F0', floorColor: '#3A3A3A', cameraHeight: 1.6, bounds: { x: 10, z: 10 } };
  } else if (roomName === 'wide') {
    roomConfig = { size: 15, wallColor: '#F0E6D2', floorColor: '#8B6F47', cameraHeight: 1.6, bounds: { x: 15, z: 15 } };
  } else if (roomName === 'compact') {
    roomConfig = { size: 8, wallColor: '#FFF8E7', floorColor: '#8B7355', cameraHeight: 1.6, bounds: { x: 8, z: 8 } };
  }
  
  const halfSize = roomConfig.size / 2;
  const wallHeight = 3;
  
  const newFloor = document.createElement('a-plane');
  newFloor.setAttribute('rotation', '-90 0 0');
  newFloor.setAttribute('width', roomConfig.size);
  newFloor.setAttribute('height', roomConfig.size);
  newFloor.setAttribute('color', roomConfig.floorColor);
  newFloor.setAttribute('position', '0 0 0');
  newFloor.id = 'floor';
  scene.appendChild(newFloor);
  
  const wallFront = document.createElement('a-plane');
  wallFront.setAttribute('position', `0 ${wallHeight/2} -${halfSize}`);
  wallFront.setAttribute('rotation', '0 0 0');
  wallFront.setAttribute('width', roomConfig.size);
  wallFront.setAttribute('height', wallHeight);
  wallFront.setAttribute('color', roomConfig.wallColor);
  scene.appendChild(wallFront);
  
  const wallBack = document.createElement('a-plane');
  wallBack.setAttribute('position', `0 ${wallHeight/2} ${halfSize}`);
  wallBack.setAttribute('rotation', '0 180 0');
  wallBack.setAttribute('width', roomConfig.size);
  wallBack.setAttribute('height', wallHeight);
  wallBack.setAttribute('color', roomConfig.wallColor);
  scene.appendChild(wallBack);
  
  const wallLeft = document.createElement('a-plane');
  wallLeft.setAttribute('position', `-${halfSize} ${wallHeight/2} 0`);
  wallLeft.setAttribute('rotation', '0 90 0');
  wallLeft.setAttribute('width', roomConfig.size);
  wallLeft.setAttribute('height', wallHeight);
  wallLeft.setAttribute('color', roomConfig.wallColor);
  scene.appendChild(wallLeft);
  
  const wallRight = document.createElement('a-plane');
  wallRight.setAttribute('position', `${halfSize} ${wallHeight/2} 0`);
  wallRight.setAttribute('rotation', '0 -90 0');
  wallRight.setAttribute('width', roomConfig.size);
  wallRight.setAttribute('height', wallHeight);
  wallRight.setAttribute('color', roomConfig.wallColor);
  scene.appendChild(wallRight);
  
  const camera = document.getElementById('camera');
  const cameraPos = camera.getAttribute('position');
  camera.setAttribute('position', `${cameraPos.x} ${roomConfig.cameraHeight} ${cameraPos.z}`);
  camera.setAttribute('rotation', '0 0 0');
  
  currentRoomBounds = roomConfig.bounds;
  
  console.log('部屋構築完了:', roomName, roomConfig);
}

console.log('初期化完了');
