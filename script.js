let map, pos, service, places, infoWindow, marker, lastMarker;

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

        // 產生按鈕
        const locationButton = document.createElement("button");
        locationButton.textContent = "Lunch Time !";
        locationButton.classList.add("custom-map-control-button");

        // 按鈕位置
        map.controls[google.maps.ControlPosition.CENTER].push(locationButton);
        locationButton.addEventListener("click", randomMarker);

        // 搜尋附近事件
        let request = {
          location: pos,
          radius: "300",
          type: ["restaurant"],
          openNow: true,
          maxPrice: 2,
        };
        service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, setPlaces);
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

  // 儲存附近地點
  function setPlaces(results) {
    console.log(results);
    places = results;
  }

  // 訊息視窗
  infoWindow = new google.maps.InfoWindow();

  // 產生隨機地標
  function randomMarker() {
    console.log("randomMarker");
    // if (!place.geometry || !place.geometry.location) return;
    let ranNum = Math.floor(Math.random() * places.length);
    let place = places[ranNum];
    console.log(place);

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

    // marker.setMap(map);
    // 複寫上個標記
    lastMarker = marker;

    marker.addListener("click", () => {
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
}

window.initMap = initMap;
