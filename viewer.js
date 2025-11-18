// viewer.js  - 杉並高校25期 同期会アルバム（三画面方式）

console.log("viewer.js loaded");
console.log("PHOTOS_INDEX:", window.PHOTOS_INDEX);

document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------
  // PHOTOS_INDEX チェック
  // -----------------------------
  if (!window.PHOTOS_INDEX || !window.PHOTOS_INDEX.categories) {
    console.error("PHOTOS_INDEX.categories が見つかりません");
    return;
  }
  const categories = window.PHOTOS_INDEX.categories;

  // -----------------------------
  // 要素取得
  // -----------------------------
  const screenCategories = document.getElementById("screen-categories");
  const screenThumbnails = document.getElementById("screen-thumbnails");
  const screenViewer = document.getElementById("screen-viewer");

  const homeButton = document.getElementById("home-button");

  // 画面①
  const categoryList = document.getElementById("category-list");

  // 画面②
  const backToCategories = document.getElementById("back-to-categories");
  const categoryTitle = document.getElementById("category-title");
  const categoryPhotoCount = document.getElementById("category-photo-count");
  const thumbnailContainer = document.getElementById("thumbnail-container");

  // 画面③
  const backToThumbnails = document.getElementById("back-to-thumbnails");
  const viewerBreadcrumb = document.getElementById("viewer-breadcrumb");
  const viewerImage = document.getElementById("viewer-image");
  const viewerFilename = document.getElementById("viewer-filename");

  // 状態
  let currentCategoryKey = null;
  let currentGroupIndex = null;
  let currentPhotoIndex = null;

  // -----------------------------
  // ユーティリティ
  // -----------------------------

  function showScreen(id) {
    [screenCategories, screenThumbnails, screenViewer].forEach((sec) => {
      if (!sec) return;
      if (sec.id === id) {
        sec.classList.add("active");
      } else {
        sec.classList.remove("active");
      }
    });
  }

  function countCategoryPhotos(category) {
    if (!category || !Array.isArray(category.groups)) return 0;
    return category.groups.reduce((sum, g) => {
      if (!g || !Array.isArray(g.photos)) return sum;
      return sum + g.photos.length;
    }, 0);
  }

  function extractFilename(path) {
    if (!path) return "";
    const parts = path.split(/[\\/]/);
    return parts[parts.length - 1] || "";
  }

  function getPhotoSrc(photo) {
    if (!photo) return "";
    return photo.url || photo.src || photo.path || photo.file || "";
  }

  function getPhotoName(photo) {
    const src = getPhotoSrc(photo);
    return (
      (photo && (photo.filename || photo.name || photo.caption)) ||
      extractFilename(src)
    );
  }

  // -----------------------------
  // 画面①：カテゴリ一覧
  // -----------------------------

  function initCategoryList() {
    if (!categoryList) return;
    categoryList.innerHTML = "";

    Object.entries(categories).forEach(([key, category]) => {
      const total = countCategoryPhotos(category);

      const card = document.createElement("button");
      card.type = "button";
      card.className = "category-card";
      card.dataset.key = key;

      const titleEl = document.createElement("div");
      titleEl.className = "category-card-title";
      titleEl.textContent = key; // 例: "1次会_2次会"

      const countEl = document.createElement("div");
      countEl.className = "category-card-count";
      countEl.textContent = total ? `${total}枚` : "";

      card.appendChild(titleEl);
      card.appendChild(countEl);

      card.addEventListener("click", () => {
        currentCategoryKey = key;
        showCategoryThumbnails(key);
      });

      categoryList.appendChild(card);
    });
  }

  // -----------------------------
  // 画面②：サムネイル一覧
  // -----------------------------

  function showCategoryThumbnails(categoryKey) {
    const category = categories[categoryKey];
    if (!category) {
      console.warn("カテゴリが見つかりません:", categoryKey);
      return;
    }

    // タイトル・枚数
    if (categoryTitle) {
      categoryTitle.textContent = category.title || categoryKey;
    }
    if (categoryPhotoCount) {
      categoryPhotoCount.textContent = `${countCategoryPhotos(category)}枚`;
    }

    // 一覧クリア
    if (thumbnailContainer) {
      thumbnailContainer.innerHTML = "";
    }

    if (!Array.isArray(category.groups)) {
      console.warn("category.groups が配列ではありません:", categoryKey);
      showScreen("screen-thumbnails");
      return;
    }

    category.groups.forEach((group, gIndex) => {
      if (!group || !Array.isArray(group.photos) || group.photos.length === 0) {
        return;
      }

      // 区分名（グループ名）
      const groupSection = document.createElement("section");
      groupSection.className = "group-section";

      const groupTitle = document.createElement("h3");
      groupTitle.className = "group-title";
      groupTitle.textContent = group.name || `グループ ${gIndex + 1}`;
      groupSection.appendChild(groupTitle);

      // サムネイルグリッド
      const grid = document.createElement("div");
      grid.className = "thumbnail-grid"; // CSS側でPC9列・スマホ3列にする

      group.photos.forEach((photo, pIndex) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "thumbnail-item";

        const img = document.createElement("img");
        img.className = "thumbnail-image";
        const src = getPhotoSrc(photo);
        img.src = src;
        img.alt = getPhotoName(photo);

        const nameEl = document.createElement("div");
        nameEl.className = "thumbnail-filename";
        nameEl.textContent = getPhotoName(photo);

        item.appendChild(img);
        item.appendChild(nameEl);

        item.addEventListener("click", () => {
          openViewer(categoryKey, gIndex, pIndex);
        });

        grid.appendChild(item);
      });

      groupSection.appendChild(grid);
      thumbnailContainer.appendChild(groupSection);
    });

    showScreen("screen-thumbnails");
  }

  // -----------------------------
  // 画面③：拡大表示
  // -----------------------------

  function openViewer(categoryKey, groupIndex, photoIndex) {
    const category = categories[categoryKey];
    if (!category || !Array.isArray(category.groups)) return;

    const group = category.groups[groupIndex];
    if (!group || !Array.isArray(group.photos)) return;

    const photo = group.photos[photoIndex];
    if (!photo) return;

    currentCategoryKey = categoryKey;
    currentGroupIndex = groupIndex;
    currentPhotoIndex = photoIndex;

    const src = getPhotoSrc(photo);
    const name = getPhotoName(photo);

    if (viewerImage) {
      viewerImage.src = src;
      viewerImage.alt = name;
    }
    if (viewerFilename) {
      viewerFilename.textContent = name;
    }

    if (viewerBreadcrumb) {
      const gName = group.name || `グループ ${groupIndex + 1}`;
      viewerBreadcrumb.textContent = `${categoryKey} / ${gName}`;
    }

    showScreen("screen-viewer");
  }

  // -----------------------------
  // ボタン類のイベント
  // -----------------------------

  if (homeButton) {
    homeButton.addEventListener("click", () => {
      currentCategoryKey = null;
      currentGroupIndex = null;
      currentPhotoIndex = null;
      showScreen("screen-categories");
    });
  }

  if (backToCategories) {
    backToCategories.addEventListener("click", () => {
      currentGroupIndex = null;
      currentPhotoIndex = null;
      showScreen("screen-categories");
    });
  }

  if (backToThumbnails) {
    backToThumbnails.addEventListener("click", () => {
      if (currentCategoryKey) {
        showCategoryThumbnails(currentCategoryKey);
      } else {
        showScreen("screen-categories");
      }
    });
  }

  // -----------------------------
  // 初期化
  // -----------------------------
  initCategoryList();
  showScreen("screen-categories");
});