let selectedFurniture = null;
let selectedVariant = null;
let furnitureCounter = 0;
let deleteMode = false;
let rotateMode = false;
let targetFurniture = null;

console.log('スクリプト開始');

// 家具設定（GLBモデル対応）
const furnitureConfig = {
  sofa: {
    name: 'ソファ',
    variants: [
      { 
        id: 'sofa-modern', 
        name: 'モダンソファ', 
        model: 'assets/models/sofa_free_version.glb',
        scale: '1 1 1',
        yOffset: 0
      },
      { 
        id: 'sofa-lounge', 
        name: 'ラウンジソファ', 
        model: 'assets/models/jet_set_lounge_sofa.glb',
        scale: '1 1 1',
        yOffset: 0
      }
    ]
  },
  table: {
    name: 'テーブル',
    variants: [
      { 
        id: 'table-dining', 
        name: 'ダイニングテーブル', 
        model: 'assets/models/dining_table.glb',
        scale: '1 1 1',
        yOffset: 0
      },
      { 
        id: 'table-round', 
        name: '円形テーブル', 
        model: 'assets/models/round_dining_table.glb',
        scale: '1 1 1',
        yOffset: 0
      }
    ]
  },
  kitchen: {
    name: 'キッチン',
    variants: [
      { 
        id: 'kitchen-cabinet', 
        name: 'キッチンキャビネット', 
        model: 'assets/models/kitchen_cabinet.glb',
        scale: '1 1 1',
        yOffset: 0
      },
      { 
        id: 'kitchen-modern', 
        name: 'モダンキッチン', 
        model: 'assets/models/modern_kitchen.glb',
        scale: '1 1 1',
        yOffset: 0
      }
    ]
  },
  cabinet: {
    name: '棚',
    variants: [
      { id: 'cabinet-tall', name: '高棚', width: 1, height: 2, depth: 0.5, color: '#A0522D' },
      { id: 'cabinet-wide', name: '横長棚', width: 2, height: 1, depth: 0.4, color: '#8B7355' }
    ]
  },
  chair: {
    name: '椅子',
    variants: [
      { id: 'chair-dining', name: 'ダイニングチェア', width: 0.5, height: 1, depth: 0.5, color: '#8B7355' },
      { id: 'chair-office', name: 'オフィスチェア', width: 0.6, height: 1.2, depth: 0.6, color: '#696969' }
    ]
  }
};

// ギャラリーモーダルを開く
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
    
    // プレースホルダー画像（後でサムネイルに差し替え可能）
    const color = variant.color ? variant.color.slice(1) : '8B4513';
    item.innerHTML = `
      <img src="https://via.placeholder.com/180x150/${color}/ffffff?text=${encodeURIComponent(variant.name)}" alt="${variant.name}">
      <p>${variant.name}</p>
    `;
    
    grid.appendChild(item);
  });
  
  modal.classList.add('active');
  console.log('ギャラリー表示:', category);
}

// 家具デザインを選択
function selectVariant(category, variantId) {
  selectedFurniture = category;
  selectedVariant = variantId;
  
  closeGallery();
  
  deleteMode = false;
  rotateMode = false;
  
  document.querySelectorAll('.furniture-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById('delete-btn').classList.remove('active');
  document.getElementById('rotate-btn').classList.remove('active');
  
  updateInfo();
  console.log('選択:', category, variantId);
}

// モーダルを閉じる
function closeGallery() {
  const modal = document.getElementById('gallery-modal');
  modal.classList.remove('active');
}

// 閉じるボタンのイベント
document.addEventListener('DOMContentLoaded', function() {
  const closeBtn = document.querySelector('.close');
  const modal = document.getElementById('gallery-modal');
  
  closeBtn.onclick = closeGallery;
  
  window.onclick = function(event) {
    if (event.target === modal) {
      closeGallery();
    }
  };
});

// 回転モード切替
function toggleRotateMode() {
  rotateMode = !rotateMode;
  deleteMode = false;
  selectedFurniture = null;
  selectedVariant = null;
  
  if (rotateMode) {
    document.querySelectorAll('.furniture-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.getElementById('delete-btn').classList.remove('active');
    document.getElementById('rotate-btn').classList.add('active');
  } else {
    document.getElementById('rotate-btn').classList.remove('active');
  }
  
  updateInfo();
  console.log('回転モード:', rotateMode);
}

// 削除モード切替
function toggleDeleteMode() {
  deleteMode = !deleteMode;
  rotateMode = false;
  selectedFurniture = null;
  selectedVariant = null;
  
  if (deleteMode) {
    document.querySelectorAll('.furniture-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.getElementById('rotate-btn').classList.remove('active');
    document.getElementById('delete-btn').classList.add('active');
  } else {
    document.getElementById('delete-btn').classList.remove('active');
  }
  
  updateInfo();
  console.log('削除モード:', deleteMode);
}

// 情報表示更新
function updateInfo() {
  let info = document.getElementById('info');
  if (deleteMode) {
    info.textContent = 'モード: 削除（家具に照準を合わせて📍ボタン）';
  } else if (rotateMode) {
    info.textContent = 'モード: 回転（家具に照準を合わせてQ/Eキー）';
  } else if (selectedFurniture && selectedVariant) {
    const variant = getVariantById(selectedFurniture, selectedVariant);
    info.textContent = `モード: 配置（${variant.name}）`;
  } else {
    info.textContent = 'モード: 配置';
  }
}

// バリアントIDから設定を取得
function getVariantById(category, variantId) {
  return furnitureConfig[category].variants.find(v => v.id === variantId);
}

// 配置実行
function placeFurniture() {
  if (deleteMode) {
    deleteFurnitureAtCenter();
  } else if (rotateMode) {
    alert('回転モードではQ/Eキーを使用してください');
  } else {
    if (!selectedFurniture || !selectedVariant) {
      alert('家具を選択してください');
      return;
    }

    let pointer = document.getElementById('pointer');
    let pos = pointer.getAttribute('position');
    
    createFurniture(selectedFurniture, selectedVariant, pos);
  }
}

// 家具生成
function createFurniture(category, variantId, position) {
  let scene = document.querySelector('a-scene');
  let furniture = document.createElement('a-entity');
  furnitureCounter++;
  
  let settings = getVariantById(category, variantId);
  
  // GLBモデルがある場合
  if (settings.model) {
    furniture.setAttribute('gltf-model', settings.model);
    furniture.setAttribute('scale', settings.scale || '1 1 1');
    furniture.setAttribute('position', {
      x: position.x,
      y: settings.yOffset || 0,
      z: position.z
    });
  } 
  // 旧式のbox（椅子と棚）
  else {
    furniture.setAttribute('geometry', {
      primitive: 'box',
      width: settings.width,
      height: settings.height,
      depth: settings.depth
    });
    furniture.setAttribute('material', { color: settings.color });
    furniture.setAttribute('position', {
      x: position.x,
      y: settings.height / 2,
      z: position.z
    });
  }
  
  furniture.setAttribute('rotation', {x: 0, y: 0, z: 0});
  furniture.setAttribute('id', `furniture-${variantId}-${furnitureCounter}`);
  furniture.classList.add('furniture');
  
  scene.appendChild(furniture);
  console.log(`${settings.name} 配置完了 at (${position.x.toFixed(2)}, ${position.z.toFixed(2)})`);
}

// 画面中央の家具を削除
function deleteFurnitureAtCenter() {
  const camera = document.getElementById('camera');
  const raycaster = new THREE.Raycaster();
  
  const direction = new THREE.Vector3(0, 0, -1);
  camera.object3D.getWorldDirection(direction);
  
  const origin = new THREE.Vector3();
  camera.object3D.getWorldPosition(origin);
  
  raycaster.set(origin, direction);
  
  const scene = document.querySelector('a-scene').object3D;
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  if (intersects.length > 0) {
    for (let intersect of intersects) {
      let obj = intersect.object;
      
      while (obj && !obj.el) {
        obj = obj.parent;
      }
      
      if (obj && obj.el && obj.el.id.startsWith('furniture-')) {
        obj.el.parentNode.removeChild(obj.el);
        console.log('削除:', obj.el.id);
        updateInfo();
        return;
      }
    }
    
    alert('照準に家具がありません');
  } else {
    alert('照準に家具がありません');
  }
}

// 画面中央の家具を回転
function rotateFurnitureAtCenter(angle) {
  const camera = document.getElementById('camera');
  const raycaster = new THREE.Raycaster();
  
  const direction = new THREE.Vector3(0, 0, -1);
  camera.object3D.getWorldDirection(direction);
  
  const origin = new THREE.Vector3();
  camera.object3D.getWorldPosition(origin);
  
  raycaster.set(origin, direction);
  
  const scene = document.querySelector('a-scene').object3D;
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  if (intersects.length > 0) {
    for (let intersect of intersects) {
      let obj = intersect.object;
      
      while (obj && !obj.el) {
        obj = obj.parent;
      }
      
      if (obj && obj.el && obj.el.id.startsWith('furniture-')) {
        let currentRot = obj.el.getAttribute('rotation');
        obj.el.setAttribute('rotation', {
          x: currentRot.x,
          y: currentRot.y + angle,
          z: currentRot.z
        });
        console.log('回転:', angle + '度', obj.el.id);
        return;
      }
    }
  }
}

// キーボード入力
document.addEventListener('keydown', function(e) {
  if (rotateMode) {
    if (e.key === 'q' || e.key === 'Q') {
      rotateFurnitureAtCenter(-45);
    } else if (e.key === 'e' || e.key === 'E') {
      rotateFurnitureAtCenter(45);
    }
  }
});

// メインループ
setInterval(function() {
  let camera = document.querySelector('#camera');
  let pointer = document.querySelector('#pointer');
  
  if (!camera || !pointer) return;
  
  // 壁の境界チェック
  let cameraPos = camera.getAttribute('position');
  let changed = false;
  
  if (cameraPos.x < -9.5) { cameraPos.x = -9.5; changed = true; }
  if (cameraPos.x > 9.5) { cameraPos.x = 9.5; changed = true; }
  if (cameraPos.z < -9.5) { cameraPos.z = -9.5; changed = true; }
  if (cameraPos.z > 9.5) { cameraPos.z = 9.5; changed = true; }
  
  if (changed) camera.setAttribute('position', cameraPos);
  
  // ポインター表示/非表示の切り替え
  if (deleteMode || rotateMode) {
    pointer.setAttribute('visible', 'false');
  } else {
    pointer.setAttribute('visible', 'true');
    
    let cameraRot = camera.object3D.rotation;
    let distance = 3;
    let x = cameraPos.x - Math.sin(cameraRot.y) * distance;
    let z = cameraPos.z - Math.cos(cameraRot.y) * distance;
    
    pointer.setAttribute('position', {x: x, y: 0.02, z: z});
    pointer.setAttribute('color', '#00FF00');
    pointer.setAttribute('opacity', '0.8');
  }
}, 50);

console.log('初期化完了');
