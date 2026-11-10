# CLAUDE.md

本檔案提供 Claude Code (claude.ai/code) 在此 repository 中工作時的指引。

## 專案簡介

Luncher 是一個「午餐決定器」：一個靜態的單頁網頁應用程式，會在使用者所在位置顯示 Google 地圖，按下按鈕後隨機挑一間附近的餐廳或飲料店，在地圖上放置標記並顯示資訊視窗（店名、價位、評分、照片）。

## 執行方式

沒有建置步驟、套件管理工具、linter 或測試。全部都是純 HTML/CSS/JS。

- 用 HTTP 伺服器提供這個資料夾，再開啟 `index.html`，例如 `npx serve .` 或 `python -m http.server`。建議用本機伺服器而不要用 `file://` 開啟，因為瀏覽器的 Geolocation API 需要安全環境（localhost 也算）。
- 正式站部署在 GitHub Pages：https://t29512.github.io/luncher/ （push 到 repo 即部署，repo 是公開的）。
- 有兩把 Google Maps API key：
  - 正式用：寫在 `config.js`（會進 git）。正式站的 key 本來就會隨網頁公開，靠 Google Cloud 的網址限制（只允許 GitHub Pages 網址）和 API 限制保護。
  - 開發用：寫在 `config.local.js`（已列在 `.gitignore`，不可 commit）。第一次執行前，把 `config.local.example.js` 複製成 `config.local.js` 並填入 dev key。不要把 dev key 寫進任何會進 git 的檔案。
- Google Maps JS API（含 `places` library）由 `script.js` 結尾的 `loadGoogleMaps` 動態載入：只有 hostname 是 `t29512.github.io`（`PROD_HOST`）時才用 `config.js` 的 key；其他任何網址（`npx serve`、Live Server、區網 IP…）都會先清掉 `window.LUNCHER_CONFIG`，再載入 `config.local.js`，所以 `config.local.js` 有錯時不會悄悄改用正式 key。之後插入帶 `loading=async&callback=initMap` 的 `<script>`。`index.html` 的載入順序是 `config.js` → `script.js`。
- 載入失敗（找不到 `config.local.js`、key 沒設或還是範例值、Google 驗證 key 失敗觸發 `gm_authFailure`）時，`showError` 會在畫面上方顯示紅色錯誤訊息（樣式是 `style.css` 的 `.error`），同時印到 console。
- 兩把 key 在 Google Cloud 都設有網站（HTTP referrer）限制，網址不在名單內時 console 會出現 `RefererNotAllowedMapError`。換 port 或網址時，要先到 Google Cloud Console 的「API 和服務」→「憑證」把新網址加進名單。注意 `npx serve` 會把 `/index.html` 轉到 `/`，所以名單裡要用 `/*` 結尾的網址。key 只需要開放 Maps JavaScript API 和 Places API（舊版）。

## 架構

所有邏輯都在 `script.js`，使用模組層級的全域變數（`map`、`pos`、`foods`、`drinks`、`lastMarker` 等），沒有用模組。Maps API 是由 `script.js` 自己在最後插入的，所以 API 呼叫 `window.initMap` 時它一定已經存在。

流程：
1. `initMap` 透過 `navigator.geolocation` 取得使用者位置，建立地圖和使用者標記，接著執行兩次 Places `nearbySearch`，並把「Food」和「Drink」按鈕加為地圖控制項（`BOTTOM_CENTER`）。
2. `nearbyFoods` 以 `type: restaurant` 搜尋；`nearbyDrinks` 以 `keyword: "飲料"` 搜尋。兩者都使用 300 公尺半徑、`openNow: true` 和 `maxPriceLevel: 2`。結果存在 `foods` / `drinks`。
3. `randomMarker` 依據被點擊按鈕的**文字**（`"Food"` / `"Drink"`）決定使用哪個清單，所以改按鈕名稱時，`switch` 和圖示的三元運算式也要一起改。被選中的地點會從陣列中 splice 移除，因此不會重複出現。上一個標記會被移除；找不到地點或清單用完時會跳出 alert。
4. 資訊視窗的內容在 `setInfoWindow` 中用 DOM 組成。它假設 `place.photos[0]` 一定存在。

標記圖示是 flaticon.com 的遠端網址。`style.css` 讓 `#map` 填滿整個頁面，並設定 `.button` 地圖控制項的樣式。

`place.js`（已列在 `.gitignore`）是一份 Places `nearbySearch` 的範例結果陣列，以前用來在測試時節省 API 額度。它使用 `export default`，`index.html` 沒有引用它。

`TODO.md`（已列在 `.gitignore`）是本機的待修清單，記錄 code review 找到但還沒修的問題。修完一項就從清單移除。

## Code Review

- 只要有修改程式碼（`.js`、`.html`、`.css` 等），改完後都**必須**用 subagent `code-improver` 對這次變更做 code review，再回報結果給使用者。
- 修改範圍包含使用者要求的改動，以及根據 review 建議再做的修正（修正後要再 review 一次）。
- 只改文件（例如本檔、README）不需要 review。

## 維護本檔案

- 修改程式時，若影響本檔描述的內容（執行方式、架構、key 設定、注意事項等），請在**同一個 commit** 一併更新本檔，讓程式和說明保持一致，退回時也會一起退回。
- 不影響本檔內容的小改動不需要更新本檔。
- 和程式無關的說明調整（補充知識、新增規則、修正錯字）可以單獨 commit。
