document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map-container');
    const provinceNameDisplay = document.getElementById('province-name');
    const cityNameDisplay = document.createElement('div');
    cityNameDisplay.id = 'city-name';
    document.body.appendChild(cityNameDisplay);
    
    const provinceNames = {
        HJ: "Heilongjiang", JL: "Jilin", LN: "Liaoning", NM: "Inner Mongolia",
        BJ: "Beijing", TJ: "Tianjin", HE: "Hebei", SX: "Shanxi", SD: "Shandong",
        HA: "Henan", JS: "Jiangsu", AH: "Anhui", HB: "Hubei", HN: "Hunan",
        JX: "Jiangxi", ZJ: "Zhejiang", FJ: "Fujian", GD: "Guangdong", GX: "Guangxi",
        SC: "Sichuan", CQ: "Chongqing", GZ: "Guizhou", YN: "Yunnan", XZ: "Tibet",
        SN: "Shaanxi", GS: "Gansu", NX: "Ningxia", QH: "Qinghai", XJ: "Xinjiang",
        HI: "Hainan", TW: "Taiwan", HK: "Hong Kong", MO: "Macau", LN_1: 'Liaoning', LN_2: 'Liaoning',
        HE_1: 'Hebei', HE_2: 'Hebei',
        SH_1: 'Shanghai', 'SH_2': 'Shanghai', 'SH_3': 'Shanghai',
        FJ_1: 'Fujian', 'FJ_2': 'Fujian', 'FJ_3': 'Fujian',
        GD_1: 'Guangdong', GD_2: 'Guangdong', GD_3: 'Guangdong', GD_4: 'Guangdong', GD_6: 'Guangdong', GD_5: 'Guangdong',
        MO_1: 'Macao', MO_2: 'Macao',
        HK_1: 'Hong Kong', HK_2: 'Hong Kong',
        TW_1: 'Taiwan', TW_2: "Taiwan", TW_3: "Taiwan",
        XJd: 'Xinjiang (Disputed)',
        XZd2: 'Tibet (Disputed)', XZd1: 'Tibet (Disputed)'
    };

    fetch('china-provinces-map.svg')
        .then(response => response.text())
        .then(svgContent => {
            mapContainer.innerHTML = svgContent;
            initializeMap();
        });

    function initializeMap() {
        const provinceGroup = document.querySelector('g.province');
        const provinces = provinceGroup.querySelectorAll('path, g');
        const cityGroup = document.querySelector('g.city');
        const cities = cityGroup.querySelectorAll('circle');
        const isMobile = window.matchMedia('(max-width: 768px)').matches;

        provinces.forEach(province => {
            let id = province.id.substring(1); // Remove the 'p' prefix
            const name = provinceNames[id] || id; // Use the full name if available, otherwise use the abbreviation
            
            if (province.tagName === 'g') {
                province = province.querySelector('path'); // For grouped provinces, use the first path
            }

            if (!isMobile) {
                province.addEventListener('mousemove', (e) => showLabel(e, name, provinceNameDisplay));
                province.addEventListener('mouseout', () => hideLabel(provinceNameDisplay));
            } else {
                province.addEventListener('click', (e) => toggleLabel(e, name, provinceNameDisplay));
            }
        });

        cities.forEach(city => {
            const name = city.id;
            
            if (!isMobile) {
                city.addEventListener('mousemove', (e) => showLabel(e, name, cityNameDisplay));
                city.addEventListener('mouseout', () => hideLabel(cityNameDisplay));
            } else {
                city.addEventListener('click', (e) => toggleLabel(e, name, cityNameDisplay));
            }
        });

        if (isMobile) {
            enablePanZoom();
        }
    }

    function showLabel(e, name, labelElement) {
        labelElement.textContent = name;
        labelElement.style.display = 'block';
        positionLabel(e, labelElement);
    }

    function hideLabel(labelElement) {
        labelElement.style.display = 'none';
    }

    function toggleLabel(e, name, labelElement) {
        if (labelElement.style.display === 'none') {
            showLabel(e, name, labelElement);
        } else {
            hideLabel(labelElement);
        }
    }

    function positionLabel(e, labelElement) {
        const offset = 15;
        labelElement.style.left = `${e.clientX + offset}px`;
        labelElement.style.top = `${e.clientY - offset}px`;
    }

    function enablePanZoom() {
        const svg = document.querySelector('svg');
        let isPanning = false;
        let startPoint = { x: 0, y: 0 };
        let endPoint = { x: 0, y: 0 };
        let scale = 1;

        svg.addEventListener('touchstart', startPan);
        svg.addEventListener('touchmove', pan);
        svg.addEventListener('touchend', endPan);

        svg.addEventListener('wheel', zoom);

        function startPan(e) {
            isPanning = true;
            startPoint = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }

        function pan(e) {
            if (!isPanning) return;
            endPoint = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            const dx = (endPoint.x - startPoint.x) / scale;
            const dy = (endPoint.y - startPoint.y) / scale;

            const viewBox = svg.viewBox.baseVal;
            viewBox.x -= dx;
            viewBox.y -= dy;

            startPoint = endPoint;
        }

        function endPan() {
            isPanning = false;
        }

        function zoom(e) {
            e.preventDefault();
            scale += e.deltaY * -0.01;
            scale = Math.min(Math.max(0.5, scale), 4);
            svg.style.transform = `scale(${scale})`;
        }
    }
});