let selectedFurniture = null;
let selectedVariant = null;
let furnitureCounter = 0;
let selectedFurnitureEntity = null;
let selectionBox = null;
let currentRoomBounds = { x: 20, z: 20 };
let joystickActive = false;
let joystickDirection = { x: 0, z: 0 };

console.log('スクリプト開始');

// 横画面固定
if (screen.orientation && screen.orientation.lock) {
  screen.orientation.lock('landscape').catch(err => {
    console.log('画面固定失敗:', err);
  });
}

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

const furnitureConfig = {
  sofa: {
    name: 'ソファ',
    variants: [
      { id: 'sofa-modern', name: 'モダンソファ', model: 'assets/models/sofa_free_version.glb', scale: '1 1 1', yOffset: 0 },
      { id: 'sofa-lounge', name: 'ラウンジソファ', model: 'assets/models/jet_set_lounge_sofa.glb', scale: '1 1 1', yOffset: 0 }
    ]
  },
  table: {
    name: 'テーブル',
    variants: [
      { id: 'table-dining', name: 'ダイニングテーブル', model: 'assets/models/dining_table.glb', scale: '1 1 1', yOffset: 0 },
      { id: 'table-round', name: '円形テーブル', model: 'assets/models/round_dining_table.glb', scale: '1 1 1', yOffset: 0 }
    ]
  },
  kitchen: {
    name: 'キッチン',
    variants: [
      { id: 'kitchen-cabinet', name: 'キッチンキャビネット', model: 'assets/models/kitchen_cabinet.glb', scale: '1 1 1', yOffset: 0 },
      { id: 'kitchen-modern', name: 'モダンキッチン', model: 'assets/models/modern_kitchen.glb', scale: '1 1 1', yOffset: 0 }
    ]
  },
  cabinet: {
    name: '棚',
    variants: [
      { id: 'cabinet-shelf', name: 'オープンシェルフ', model: 'assets/models/cc0_-_shelf_3.glb', scale: '1 1 1', yOffset: 0 },
      { id: 'cabinet-storage', name: 'ストレージキャビネット', model: 'assets/models/storage_cabinet_furniture.glb', scale: '1 1 1', yOffset: 0 }
    ]
  },
  chair: {
    name: '椅子',
    variants: [
      { id: 'chair-gaming', name: 'ゲーミングチェア', model: 'assets/models/gaming_chair_free_download.glb', scale: '1 1 1', yOffset: 0 },
      { id: 'chair-wood', name: 'ウッドチェア', model: 'assets/models/wood_chair.glb', scale: '1 1 1', yOffset: 0 }
    ]
  }
};

function selectFurnitureByClick(event) {
  const camera = document.getElementById('camera');
  const scene = document.querySelector('a-scene');
  
  if (!camera || !scene) return;
  
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;
  
  const rect = scene.canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((clientY - rect.top) / rect.height) * 2 + 1;
  
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera.components.camera.camera);
  
  const furnitureElements = document.querySelectorAll('.furniture');
  const intersectableObjects = [];
  
  furnitureElements.forEach(el => {
    if (el.object3D) {
      el.object3D.traverse(child => {
        if (child.isMesh) {
          if (!child.el || !child.el.classList.contains('selection-box')) {
            intersectableObjects.push({ mesh: child, element: el });
          }
        }
      });
    }
  });
  
  const intersects = raycaster.intersectObjects(intersectableObjects.map(o => o.mesh));
  
  if (intersects.length > 0) {
    const clickedMesh = intersects[0].object;
    const clickedFurniture = intersectableObjects.find(o => o.mesh === clickedMesh)?.element;
    
    if (clickedFurniture) {
      if (selectedFurnitureEntity === clickedFurniture) {
        deselectFurniture();
      } else {
        selectFurniture(clickedFurniture);
      }
    }
  }
}

function selectFurniture(furnitureEl) {
  deselectFurniture();
  
  selectedFurnitureEntity = furnitureEl;
  
  const box = new THREE.Box3().setFromObject(furnitureEl.object3D);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  
  selectionBox = document.createElement('a-box');
  selectionBox.setAttribute('position', center);
  selectionBox.setAttribute('width', size.x + 0.2);
  selectionBox.setAttribute('height', size.y + 0.2);
  selectionBox.setAttribute('depth', size.z + 0.2);
  selectionBox.setAttribute('material', { color: '#00FF00', opacity: 0.3, transparent: true, wireframe: true });
  selectionBox.classList.add('selection-box');
  
  furnitureEl.appendChild(selectionBox);
  
  const furnitureId = furnitureEl.id;
  const furnitureName = getFurnitureName(furnitureId);
  
  const infoDiv = document.getElementById('selected-furniture-info');
  infoDiv.textContent = `選択中: ${furnitureName}`;
  infoDiv.style.display = 'block';
  
  console.log('家具選択:', furnitureName);
}

function deselectFurniture() {
  if (selectionBox) {
    selectionBox.parentNode.removeChild(selectionBox);
    selectionBox = null;
  }
  
  selectedFurnitureEntity = null;
  
  const infoDiv = document.getElementById('selected-furniture-info');
  infoDiv.style.display = 'none';
  
  console.log('家具選択解除');
}

function getFurnitureName(furnitureId) {
  for (const category in furnitureConfig) {
    const variants = furnitureConfig[category].variants;
    for (const variant of variants) {
      if (furnitureId.includes(variant.id)) {
        return variant.name;
      }
    }
  }
  return '不明な家具';
}

window.addEventListener('load', () => {
  const scene = document.querySelector('a-scene');
  if (scene) {
    scene.addEventListener('click', selectFurnitureByClick);
    scene.addEventListener('touchstart', selectFurnitureByClick);
  }
  
  initJoystick();
  console.log('ジョイスティック初期化完了');
  
  showRoomSelection();
});

function openCategorySelect() {
  const modal = document.getElementById('category-modal');
  const grid = document.getElementById('category-grid');
  
  grid.innerHTML = '';
  
  const categories = [
    { id: 'sofa', name: 'ソファ', icon: '🛋️' },
    { id: 'table', name: 'テーブル', icon: '🪑' },
    { id: 'kitchen', name: 'キッチン', icon: '🔪' },
    { id: 'cabinet', name: '棚', icon: '📦' },
    { id: 'chair', name: '椅子', icon: '🪑' }
  ];
  
  categories.forEach(cat => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.onclick = () => {
      closeCategorySelect();
      openGallery(cat.id);
    };
    
    item.innerHTML = `<div style="font-size: 60px; margin: 20px 0;">${cat.icon}</div><p style="font-size: 18px; font-weight: bold;">${cat.name}</p>`;
    grid.appendChild(item);
  });
  
  modal.classList.add('active');
  console.log('カテゴリ選択表示');
}

function closeCategorySelect() {
  const modal = document.getElementById('category-modal');
  modal.classList.remove('active');
}

function openGallery(category) {
  const modal = document.getElementById('gallery-modal');
  const title = document.getElementById('modal-title');
  const grid = document.getElementById('gallery-grid');
  
  title.textContent = furnitureConfig[category].name + 'を選択';
  grid.innerHTML = '';
  
  furnitureConfig[category].variants.forEach(variant => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.onclick = () => selectVariant(category, variant.id);
    
    const color = variant.color ? variant.color.slice(1) : '8B4513';
    item.innerHTML = `<img src="https://via.placeholder.com/180x150/${color}/ffffff?text=${encodeURIComponent(variant.name)}" alt="${variant.name}"><p>${variant.name}</p>`;
    grid.appendChild(item);
  });
  
  modal.classList.add('active');
  console.log('ギャラリー表示:', category);
}

function selectVariant(category, variantId) {
  selectedFurniture = category;
  selectedVariant = variantId;
  
  closeGallery();
  
  document.querySelectorAll('.furniture-btn').forEach(btn => btn.classList.remove('active'));
  
  updateInfo();
  console.log('選択:', category, variantId);
}

function closeGallery() {
  const modal = document.getElementById('gallery-modal');
  modal.classList.remove('active');
}

window.onclick = function(event) {
  const categoryModal = document.getElementById('category-modal');
  const galleryModal = document.getElementById('gallery-modal');
  
  if (event.target === categoryModal) closeCategorySelect();
  if (event.target === galleryModal) closeGallery();
};

function updateInfo() {
  let info = document.getElementById('info');
  if (selectedFurniture && selectedVariant) {
    const variant = getVariantById(selectedFurniture, selectedVariant);
    info.textContent = `モード: 配置（${variant.name}）`;
  } else {
    info.textContent = 'モード: 配置';
  }
}

function getVariantById(category, variantId) {
  return furnitureConfig[category].variants.find(v => v.id === variantId);
}

function placeFurniture() {
  if (!selectedFurniture || !selectedVariant) {
    alert('家具を選択してください');
    return;
  }

  let pointer = document.getElementById('pointer');
  let pos = pointer.getAttribute('position');
  
  createFurniture(selectedFurniture, selectedVariant, pos);
}

function createFurniture(category, variantId, position) {
  let scene = document.querySelector('a-scene');
  let furniture = document.createElement('a-entity');
  furnitureCounter++;
  
  let settings = getVariantById(category, variantId);
  
  if (settings.model) {
    furniture.setAttribute('gltf-model', settings.model);
    furniture.setAttribute('scale', settings.scale || '1 1 1');
    furniture.setAttribute('position', { x: position.x, y: settings.yOffset || 0, z: position.z });
  } else {
    furniture.setAttribute('geometry', { primitive: 'box', width: settings.width, height: settings.height, depth: settings.depth });
    furniture.setAttribute('material', { color: settings.color });
    furniture.setAttribute('position', { x: position.x, y: settings.height / 2, z: position.z });
  }
  
  furniture.setAttribute('rotation', {x: 0, y: 0, z: 0});
  furniture.setAttribute('id', `furniture-${variantId}-${furnitureCounter}`);
  furniture.classList.add('furniture');
  
  scene.appendChild(furniture);
  console.log(`${settings.name} 配置完了 at (${position.x.toFixed(2)}, ${position.z.toFixed(2)})`);
}

function deleteFurnitureAtCenter() {
  if (!selectedFurnitureEntity) {
    alert('削除する家具をクリックして選択してください');
    return;
  }
  
  console.log('削除:', selectedFurnitureEntity.id);
  selectedFurnitureEntity.parentNode.removeChild(selectedFurnitureEntity);
  deselectFurniture();
}

function rotateFurnitureAtCenter(angle) {
  if (!selectedFurnitureEntity) {
    alert('回転する家具をクリックして選択してください');
    return;
  }
  
  let currentRot = selectedFurnitureEntity.getAttribute('rotation');
  selectedFurnitureEntity.setAttribute('rotation', { x: currentRot.x, y: currentRot.y + angle, z: currentRot.z });
  
  if (selectionBox) {
    selectionBox.parentNode.removeChild(selectionBox);
    
    const box = new THREE.Box3().setFromObject(selectedFurnitureEntity.object3D);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    selectionBox = document.createElement('a-box');
    selectionBox.setAttribute('position', center);
    selectionBox.setAttribute('width', size.x + 0.2);
    selectionBox.setAttribute('height', size.y + 0.2);
    selectionBox.setAttribute('depth', size.z + 0.2);
    selectionBox.setAttribute('material', { color: '#00FF00', opacity: 0.3, transparent: true, wireframe: true });
    selectionBox.classList.add('selection-box');
    
    selectedFurnitureEntity.appendChild(selectionBox);
  }
  
  console.log('回転:', angle + '度', selectedFurnitureEntity.id);
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'q' || e.key === 'Q') rotateFurnitureAtCenter(-45);
  else if (e.key === 'e' || e.key === 'E') rotateFurnitureAtCenter(45);
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
  let pointer = document.querySelector('#pointer');
  
  if (!camera || !pointer) return;
  
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
  
  pointer.setAttribute('visible', 'true');
  
  let cameraRot = camera.object3D.rotation;
  let distance = 3;
  let x = cameraPos.x - Math.sin(cameraRot.y) * distance;
  let z = cameraPos.z - Math.cos(cameraRot.y) * distance;
  
  pointer.setAttribute('position', {x: x, y: 0.02, z: z});
  pointer.setAttribute('color', '#00FF00');
  pointer.setAttribute('opacity', '0.8');
}, 50);

function loadRoomToScene(roomName) {
  const scene = document.querySelector('a-scene');
  
  const oldFloor = document.getElementById('floor');
  const walls = document.querySelectorAll('a-plane[color="#F5F5F0"]');
  const oldRoomModel = document.getElementById('room-model');
  
  if (oldFloor) oldFloor.remove();
  walls.forEach(wall => wall.remove());
  if (oldRoomModel) oldRoomModel.remove();
  
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
