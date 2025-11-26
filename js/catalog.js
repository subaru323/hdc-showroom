console.log('カタログページ初期化');

// 家具データベース
const furnitureDatabase = {
  sofa: [
    { name: 'モダンソファ', model: 'sofa_free_version.glb', description: '洗練されたデザインのモダンソファ' },
    { name: 'ラウンジソファ', model: 'jet_set_lounge_sofa.glb', description: 'ゆったりくつろげるラウンジタイプ' }
  ],
  table: [
    { name: 'ダイニングテーブル', model: 'dining_table.glb', description: '家族で囲む温かなダイニングテーブル' },
    { name: 'ラウンドテーブル', model: 'round_dining_table.glb', description: '会話が弾む円形テーブル' }
  ],
  kitchen: [
    { name: 'キッチンキャビネット', model: 'kitchen_cabinet.glb', description: '収納力抜群のキッチンキャビネット' },
    { name: 'モダンキッチン', model: 'modern_kitchen.glb', description: '最新設備を備えたモダンキッチン' }
  ],
  cabinet: [
    { name: 'オープンシェルフ', model: 'cc0_-_shelf_3.glb', description: '見せる収納のオープンシェルフ' },
    { name: 'ストレージキャビネット', model: 'storage_cabinet_furniture.glb', description: '大容量のストレージキャビネット' }
  ],
  chair: [
    { name: 'ゲーミングチェア', model: 'gaming_chair_free_download.glb', description: '長時間座っても疲れないゲーミングチェア' },
    { name: 'ウッドチェア', model: 'wood_chair.glb', description: 'ナチュラルな木製チェア' }
  ]
};

// Three.jsビューワー作成
function createViewer(containerId, modelPath) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // シーン
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  // カメラ
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(2, 2, 4);

  // レンダラー
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // ライト
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // OrbitControls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 2;

  // GLBモデル読み込み
  const loader = new THREE.GLTFLoader();
  loader.load(
    `assets/models/${modelPath}`,
    (gltf) => {
      const model = gltf.scene;
      
      // モデルのサイズ調整
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      model.scale.multiplyScalar(scale);

      // モデルを中央に配置
      box.setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      scene.add(model);
      console.log('モデル読み込み成功:', modelPath);
    },
    undefined,
    (error) => {
      console.error('モデル読み込みエラー:', error);
    }
  );

  // アニメーションループ
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // リサイズ対応
  window.addEventListener('resize', () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
  });
}

// カテゴリカードの3Dプレビュー初期化
function initCategoryPreviews() {
  Object.keys(furnitureDatabase).forEach(category => {
    const items = furnitureDatabase[category];
    if (items.length > 0) {
      // ランダムに1つ選択
      const randomItem = items[Math.floor(Math.random() * items.length)];
      const viewerId = `viewer-${category}`;
      
      if (document.getElementById(viewerId)) {
        createViewer(viewerId, randomItem.model);
      }
    }
  });
}

// カテゴリ詳細モーダルを開く
function openCategoryDetail(category) {
  const modal = document.getElementById('category-detail-modal');
  const title = document.getElementById('detail-title');
  const grid = document.getElementById('detail-grid');

  // タイトル設定
  const categoryNames = {
    sofa: 'ソファ一覧',
    table: 'テーブル一覧',
    kitchen: 'キッチン一覧',
    cabinet: '収納棚一覧',
    chair: 'チェア一覧'
  };
  title.textContent = categoryNames[category] || '家具一覧';

  // グリッドをクリア
  grid.innerHTML = '';

  // 家具カード生成
  const items = furnitureDatabase[category] || [];
  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'detail-card';
    
    const viewerId = `detail-viewer-${category}-${index}`;
    card.innerHTML = `
      <div id="${viewerId}" class="detail-model-viewer"></div>
      <h3 class="detail-item-name">${item.name}</h3>
      <p class="detail-item-description">${item.description}</p>
    `;
    
    grid.appendChild(card);

    // 3Dビューワー作成（DOM追加後に実行）
    setTimeout(() => {
      createViewer(viewerId, item.model);
    }, 100);
  });

  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

// カテゴリ詳細モーダルを閉じる
function closeCategoryDetail() {
  const modal = document.getElementById('category-detail-modal');
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// モーダル外クリックで閉じる
window.addEventListener('click', (e) => {
  const modal = document.getElementById('category-detail-modal');
  if (e.target === modal) {
    closeCategoryDetail();
  }
});

// スムーススクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// カードホバーアニメーション
document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-10px) scale(1.02)';
  });
  
  card.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0) scale(1)';
  });
});

// スクロールアニメーション
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.querySelectorAll('.category-card').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(30px)';
  card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(card);
});

// ページ読み込み完了後に3Dプレビューを初期化
window.addEventListener('load', () => {
  console.log('ページ読み込み完了、3Dプレビュー初期化開始');
  initCategoryPreviews();
});

console.log('カタログページ準備完了');
