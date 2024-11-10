let map;
let sourceMarker;
let destinationMarker;
let distanceInfoWindow;

function initMap() {
    // Set up the map centered at a default location
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 16.4971, lng: 80.4992 }, // Default center (could be empty initially)
        zoom: 8,
        mapTypeId: "terrain",
    });

    // Example destination coordinates (already marked in your code)
    const destinationLatLng = { lat: 16.4573, lng: 80.5730 };
    destinationMarker = new google.maps.Marker({
        position: destinationLatLng,
        map: map,
        label: "A",
        title: "Destination",
        draggable: false,
        animation: google.maps.Animation.DROP,
        icon: {
            url: "icon.jpg", // Use your own icon
            scaledSize: new google.maps.Size(32, 32),
        }
    });

    const infoWindow = new google.maps.InfoWindow({
        content: "<p>This is an info Window for the destination</p>",
    });
    infoWindow.open(map, destinationMarker);

    // Now, track the user's location
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            function(position) {
                const userLatLng = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Center the map to the user's location
                map.setCenter(userLatLng);

                // Add or update the source marker
                if (!sourceMarker) {
                    sourceMarker = new google.maps.Marker({
                        position: userLatLng,
                        map: map,
                        label: "You",
                        title: "Your Location",
                        draggable: true,
                        animation: google.maps.Animation.BOUNCE,
                        icon: {
                            url: "icon.jpg", // Use your own icon
                            scaledSize: new google.maps.Size(32, 32),
                        }
                    });
                } else {
                    sourceMarker.setPosition(userLatLng); // Update position if marker already exists
                }

                // Calculate distance between source and destination
                calculateDistance(userLatLng, destinationLatLng);

                // Optionally, you can add a route from your location to the destination
                const directionsService = new google.maps.DirectionsService();
                const directionsRenderer = new google.maps.DirectionsRenderer();
                directionsRenderer.setMap(map);

                const request = {
                    origin: userLatLng,
                    destination: destinationLatLng,
                    travelMode: google.maps.TravelMode.DRIVING,
                };

                directionsService.route(request, function(result, status) {
                    if (status === google.maps.DirectionsStatus.OK) {
                        directionsRenderer.setDirections(result);
                    } else {
                        console.error("Directions request failed due to " + status);
                    }
                });
            },
            function(error) {
                console.error("Error getting location: " + error.message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}

// Function to calculate distance between two points
function calculateDistance(source, destination) {
    const distanceService = new google.maps.DistanceMatrixService();

    distanceService.getDistanceMatrix(
        {
            origins: [source],
            destinations: [destination],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC, // Use METRIC or IMPERIAL
        },
        function(response, status) {
            if (status === google.maps.DistanceMatrixStatus.OK) {
                const distance = response.rows[0].elements[0].distance.text;
                const duration = response.rows[0].elements[0].duration.text;

                // Display distance and duration in the console
                console.log("Distance: " + distance);
                console.log("Duration: " + duration);

                // Show distance and duration in the info window
                if (!distanceInfoWindow) {
                    distanceInfoWindow = new google.maps.InfoWindow();
                }
                distanceInfoWindow.setContent(
                    `<p>Distance: ${distance}</p><p>Duration: ${duration}</p>`
                );
                distanceInfoWindow.setPosition(source);
                distanceInfoWindow.open(map);
            } else {
                console.error("Distance Matrix request failed due to " + status);
            }
        }
    );
}
