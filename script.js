let map, pos, user, places, foods, drinks, infoWindow, marker, lastMarker;

function initMap() {
  if (navigator.geolocation) {
    // Get coords
    navigator.geolocation.getCurrentPosition(
      (position) => {
        pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log(pos);

        // Create Google Map
        map = new google.maps.Map(document.getElementById("map"), {
          center: pos,
          zoom: 17,
        });

        // Create current location user marker
        const image = {
          url: "https://cdn-icons-png.flaticon.com/512/1057/1057488.png",
          scaledSize: new google.maps.Size(40, 40),
        };
        user = new google.maps.Marker({
          map,
          position: pos,
          icon: image,
        });
        map.setCenter(pos);
        user.addListener("click", () => { map.setCenter(pos); });

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
    button.classList.add("button");
    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(button);
    button.addEventListener("click", randomMarker);
  }
}

// Nearby search
function nearbyFoods() {
  const request = {
    location: pos,
    radius: "300",
    type: ["restaurant"],
    openNow: true,
    maxPriceLevel: 2,
  };
  foodService = new google.maps.places.PlacesService(map);
  foodService.nearbySearch(request, setFoods);
}
function nearbyDrinks() {
  const request = {
    location: pos,
    radius: "300",
    keyword: "飲料",
    openNow: true,
    maxPriceLevel: 2,
  };
  drinkService = new google.maps.places.PlacesService(map);
  drinkService.nearbySearch(request, setDrinks);
}

// Set nearby locations array
function setFoods(results, status) {
  console.log("Foods", results);
  foods = results;
  console.log("status: ", status);
}
function setDrinks(results, status) {
  console.log("Drinks", results);
  drinks = results;
  console.log("status: ", status);
}

// Create random marker
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

  console.log(places);
  if (!places.length) {
    // No result
    if (!lastMarker) {
      return alert("Nothing around you (´-ι_-｀)");
    }
    // No location left
    return alert("Fancy nothing? You'd better find it yourself (´-ι_-｀)");
  }

  let ranNum = Math.floor(Math.random() * places.length);
  let place = places[ranNum];

  // Take the random place out of places array
  places.splice(ranNum, 1);

  // Create Google marker
  marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
    title: place.name,
  });

  // Center map at a bit north of the location
  map.setCenter({ lng: place.geometry.location.lng(), lat: place.geometry.location.lat() + 0.001 });
  console.log(place.geometry.location.lng(), place.geometry.location.lat() + 0.001);

  // Delete last marker
  if (lastMarker) { lastMarker.setMap(null); }

  // Overwrite lastMarker
  lastMarker = marker;

  marker.addListener("click", () => {
    // Create infoWindow
    infoWindow = new google.maps.InfoWindow();
    console.log(place);

    // Build content div
    const content = document.createElement("div");
    // h3
    const title = document.createElement("h3");
    title.innerText = place.name;
    content.appendChild(title);
    // p
    const price_rating = document.createElement("p");
    let priceLevel = "";
    switch (place.price_level) {
      case 1:
        priceLevel = "$";
        break;
      case 2:
        priceLevel = "$$";
        break;
    }
    price_rating.innerText = `${priceLevel} ${place.rating}`;
    content.appendChild(price_rating);
    // img
    const img = document.createElement("img");
    img.src = place.photos[0].getUrl({ maxWidth: 200, maxHeight: 200 });
    content.appendChild(img);

    infoWindow.setContent(content);
    // Need parameter anchor to create marker ( anchor: marker )
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
