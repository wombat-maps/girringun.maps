// TO MAKE THE MAP APPEAR YOU MUST ADD YOUR ACCESS TOKEN FROM YOUR MAPBOX ACCOUNT
mapboxgl.accessToken = 'pk.eyJ1Ijoid29tYmF0LW1hcHMiLCJhIjoiY212cDd4bnd3MHp5YjJ6cHJlenZsaWh6ayJ9.nuXdAqcp24mHqKtyP80aTQ';

const map = new mapboxgl.Map({
    container: 'map', // Matches the ID of the div in index.html
    style: 'mapbox://styles/wombat-maps/cmvmeig1600ep01so1yyt0mpt', // Map style to use
    center: [146.282,-18.306], // Starting position [longitude, latitude]
    zoom: 8 // Starting zoom level (0 is global view, higher numbers zoom in)
});

// Optional: Add default zoom and rotation controls to the map
map.addControl(new mapboxgl.NavigationControl());