let map, pos, places, foods, drinks, infoWindow, marker, lastMarker;

function initMap() {
  if (navigator.geolocation) {
    // 取得座標
    navigator.geolocation.getCurrentPosition(
      (position) => {
        pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log(pos);

        // Google 地圖
        map = new google.maps.Map(document.getElementById("map"), {
          center: pos,
          zoom: 17,
        });
        map.setCenter(pos);

        nearbyFoods();
        nearbyDrinks();

        createButton("Food");
        createButton("Drink");
      },
      // API error
      () => {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  function createButton(buttonText) {
    const button = document.createElement("button");
    button.textContent = buttonText;
    button.classList.add("custom-map-control-button");
    map.controls[google.maps.ControlPosition.CENTER].push(button);
    button.addEventListener("click", randomMarker);
  }
}

// 搜尋周圍地點
function nearbyFoods() {
  const request = {
    location: pos,
    radius: "300",
    type: ["restaurant"],
    openNow: true,
    maxPrice: 2,
  };
  foodService = new google.maps.places.PlacesService(map);
  foodService.nearbySearch(request, setFoods);
}
function nearbyDrinks() {
  const request = {
    location: pos,
    radius: "300",
    type: ["cafe"],
    openNow: true,
    maxPrice: 2,
  };
  drinkService = new google.maps.places.PlacesService(map);
  drinkService.nearbySearch(request, setDrinks);
}

// 儲存附近地點
function setFoods(results) {
  console.log("Foods", results);
  foods = results;
}
function setDrinks(results) {
  console.log("Drinks", results);
  drinks = results;
}

// 產生隨機地標
function randomMarker(event) {
  // 從 event 判斷不同按鈕拿不同的地點清單
  console.log(event.target.innerText);
  switch (event.target.innerText) {
    case "Food":
      places = foods;
      break;
    case "Drink":
      places = drinks;
  }
  
  // 已無地點開嗆
  console.log(places);
  if (!places.length) { return alert("這些都不要！？我看你還是自己想辦法好了 (´-ι_-｀)"); }

  let ranNum = Math.floor(Math.random() * places.length);
  let place = places[ranNum];
  // if (!place.geometry || !place.geometry.location) return;

  // 顯示過的地點從 places 拿掉
  places.splice(ranNum, 1);

  // 建立 Google 標記
  marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
    title: place.name,
  });

  // 將上個標記消除
  if (lastMarker) {
    lastMarker.setMap(null);
  }

  // 複寫上個標記
  lastMarker = marker;

  marker.addListener("click", () => {
    // 訊息視窗
    infoWindow = new google.maps.InfoWindow();
    console.log(place);
    infoWindow.setContent(place.name);
    // 要加參數 anchor 才能開 ( anchor: marker )
    infoWindow.open(map, marker);
  });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

window.initMap = initMap;
