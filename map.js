mapboxgl.accessToken = 'pk.eyJ1Ijoid29tYmF0LW1hcHMiLCJhIjoiY212bHpnYng4MDFuOTMwb2Y1MW12b200dyJ9.TMR7I4sA-miKE9dGtGPgEw';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/wombat-maps/cmvmeig1600ep01so1yyt0mpt',
    center: [146.282, -18.306],
    zoom: 8
    failIfMajorPerformanceCaveat: false
});

map.addControl(new mapboxgl.NavigationControl(), 'top-left');

map.on('load', function () {
    const visibilityLayers = [
        { id: 'girringun-ipa fill', label: 'Girringun IPA' },
        { id: 'girringun-nativetitle-claims', label: 'Native title claims' },
        { id: 'girringun-nativetitle', label: 'Native title' }
    ];

    const classLayerIds = [
        'girringun-nativetitle',
        'girringun-nativetitle-claims'
    ];

    const classValues = [
        'Bar Barrum',
        'Ngadjon-Jii',
        'Girramay',
        'Dulabed / Malanbarra Yidinji',
        'Malanbarra',
        'Jirrbal',
        'Wanyurr',
        'Djiru',
        'Gugu Badhun',
        'Warungnu',
        'Mamu',
        'Ewamian',
        'Gudjala',
        'Nywaigi',
        'Gulngay',
        'Wargamay',
        'Wakaman',
        'Gurambilbara',
        'Manbarra',
        'Bindal',
        'Bandjin'
    ];

    // Save existing style filters so "All classes" can restore them.
    const originalFilters = {};

    classLayerIds.forEach(function (layerId) {
        if (map.getLayer(layerId)) {
            originalFilters[layerId] = map.getFilter(layerId);
        } else {
            console.warn('Map layer not found:', layerId);
        }
    });

    function createControlContainer() {
        const container = document.createElement('div');
        container.className = 'mapboxgl-ctrl';
        container.style.cssText =
            'background:#fff;padding:8px 12px;border-radius:4px;' +
            'box-shadow:0 1px 4px rgba(0,0,0,.3);font:13px sans-serif;';
        return container;
    }

    // Checkbox control for showing and hiding style layers.
    const visibilityControl = {
        onAdd: function () {
            const container = createControlContainer();

            visibilityLayers.forEach(function (layer) {
                if (!map.getLayer(layer.id)) {
                    console.warn('Map layer not found:', layer.id);
                    return;
                }

                const label = document.createElement('label');
                label.style.cssText =
                    'display:block;white-space:nowrap;margin:4px 0;';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked =
                    map.getLayoutProperty(layer.id, 'visibility') !== 'none';

                checkbox.addEventListener('change', function () {
                    map.setLayoutProperty(
                        layer.id,
                        'visibility',
                        checkbox.checked ? 'visible' : 'none'
                    );
                });

                label.appendChild(checkbox);
                label.appendChild(
                    document.createTextNode(' ' + layer.label)
                );
                container.appendChild(label);
            });

            return container;
        },

        onRemove: function () {}
    };

    map.addControl(visibilityControl, 'top-right');

    // Zoom to matching features that are currently rendered on the map.
    function zoomToSelectedClass(classValue) {
        const availableLayerIds = classLayerIds.filter(function (layerId) {
            return Boolean(map.getLayer(layerId));
        });

        if (!classValue || availableLayerIds.length === 0) return;

        // Wait for the filters to be applied before querying visible features.
        map.once('idle', function () {
            const features = map
                .queryRenderedFeatures({
                    layers: availableLayerIds
                })
                .filter(function (feature) {
                    return feature.properties &&
                        feature.properties.class === classValue;
                });

            if (features.length === 0) {
                console.warn(
                    'No matching features are currently rendered for:',
                    classValue,
                    'Zoom to the data area or provide class bounds to zoom there automatically.'
                );
                return;
            }

            const bounds = new mapboxgl.LngLatBounds();

            function addCoordinates(coordinates) {
                if (
                    Array.isArray(coordinates) &&
                    typeof coordinates[0] === 'number' &&
                    typeof coordinates[1] === 'number'
                ) {
                    bounds.extend(coordinates);
                    return;
                }

                if (Array.isArray(coordinates)) {
                    coordinates.forEach(addCoordinates);
                }
            }

            features.forEach(function (feature) {
                if (feature.geometry && feature.geometry.coordinates) {
                    addCoordinates(feature.geometry.coordinates);
                }
            });

            if (!bounds.isEmpty()) {
                map.fitBounds(bounds, {
                    padding: 50,
                    maxZoom: 13,
                    duration: 700
                });
            }
        });
    }

    // Dropdown control to filter both native-title layers by `class`.
    const classControl = {
        onAdd: function () {
            const container = createControlContainer();

            const label = document.createElement('label');
            label.textContent = 'Native Title Holder: ';
            label.style.cssText = 'display:block;margin-bottom:4px;';

            const select = document.createElement('select');
            select.style.cssText = 'max-width:200px;';

            const allOption = document.createElement('option');
            allOption.value = '';
            allOption.textContent = 'All classes';
            select.appendChild(allOption);

            classValues.forEach(function (classValue) {
                const option = document.createElement('option');
                option.value = classValue;
                option.textContent = classValue;
                select.appendChild(option);
            });

            select.addEventListener('change', function () {
                classLayerIds.forEach(function (layerId) {
                    if (!map.getLayer(layerId)) return;

                    const originalFilter = originalFilters[layerId];

                    if (select.value === '') {
                        map.setFilter(
                            layerId,
                            originalFilter === undefined
                                ? null
                                : originalFilter
                        );
                        return;
                    }

                    const classFilter = [
                        '==',
                        ['get', 'class'],
                        select.value
                    ];

                    map.setFilter(
                        layerId,
                        originalFilter
                            ? ['all', originalFilter, classFilter]
                            : classFilter
                    );
                });

                if (select.value) {
                    zoomToSelectedClass(select.value);
                }
            });

            label.appendChild(select);
            container.appendChild(label);
            return container;
        },

        onRemove: function () {}
    };

    map.addControl(classControl, 'top-right');

const legendLayers = [
    { id: 'girringun-ipa fill', label: 'Girringun IPA' },
    { id: 'girringun-nativetitle-claims', label: 'Native title claims' },
    { id: 'girringun-nativetitle', label: 'Native title' },
    { id: 'national-park', label: 'National park' }
];

const legendControl = {
    onAdd: function () {
        const container = document.createElement('div');
        container.className = 'mapboxgl-ctrl';
        container.style.cssText =
            'background:#fff;padding:10px 12px;border-radius:4px;' +
            'box-shadow:0 1px 4px rgba(0,0,0,.3);' +
            'font:13px sans-serif;max-width:240px;';

        const title = document.createElement('div');
        title.textContent = 'Legend';
        title.style.cssText = 'font-weight:bold;margin-bottom:8px;';
        container.appendChild(title);

        legendLayers.forEach(function (item) {
            const layer = map.getLayer(item.id);

            if (!layer) {
                console.warn('Legend layer not found in map style:', item.id);
                return;
            }

            const row = document.createElement('div');
            row.style.cssText =
                'display:flex;align-items:center;margin:5px 0;';

            const swatch = document.createElement('span');
            swatch.style.cssText =
                'display:inline-block;width:18px;height:14px;' +
                'margin-right:8px;flex:none;box-sizing:border-box;';

            let colorProperty;

            if (layer.type === 'fill') {
                colorProperty = 'fill-color';
                swatch.style.border =
                    '2px solid ' +
                    (map.getPaintProperty(item.id, 'fill-outline-color') ||
                        '#333');
            } else if (layer.type === 'line') {
                colorProperty = 'line-color';
                swatch.style.height = '4px';
            } else if (layer.type === 'circle') {
                colorProperty = 'circle-color';
                swatch.style.width = '14px';
                swatch.style.height = '14px';
                swatch.style.borderRadius = '50%';
            } else {
                // Symbol layers may not have a single representative color.
                colorProperty = 'text-color';
            }

            const color = colorProperty
                ? map.getPaintProperty(item.id, colorProperty)
                : null;

            if (typeof color === 'string') {
                swatch.style.backgroundColor = color;
            } else {
                swatch.style.backgroundColor = '#ccc';
                swatch.title = 'This layer uses a data-driven or expression style';
            }

            const text = document.createElement('span');
            text.textContent = item.label;

            row.appendChild(swatch);
            row.appendChild(text);
            container.appendChild(row);
        });

        return container;
    },

    onRemove: function () {}
};

map.addControl(legendControl, 'bottom-left');
map.addSource('cadastre-direct-source', {
    type: 'vector',
    url: 'mapbox://wombat-maps.zukeyi'
});

map.addLayer({
    id: 'cadastre-popup-target',
    type: 'fill',
    source: 'cadastre-direct-source',
    'source-layer': 'girringun_cadastre',
    paint: {
        // Nearly transparent so the layer is clickable without obscuring the map.
        'fill-color': 'rgba(0, 0, 0, 0.01)'
    }
});

map.on('click', 'cadastre-popup-target', function (event) {
    const feature = event.features && event.features[0];
    if (!feature) return;

    const properties = feature.properties || {};
    const content = document.createElement('div');

    ['LOT', 'PLAN'].forEach(function (key) {
        const row = document.createElement('div');
        row.textContent = key + ': ' + (properties[key] ?? 'Not available');
        content.appendChild(row);
    });

    new mapboxgl.Popup()
        .setLngLat(event.lngLat)
        .setDOMContent(content)
        .addTo(map);
});

map.on('mouseenter', 'cadastre-popup-target', function () {
    map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'cadastre-popup-target', function () {
    map.getCanvas().style.cursor = '';
});
});