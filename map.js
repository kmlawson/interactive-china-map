document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map-container');
    const provinceNameDisplay = document.getElementById('province-name');
    const cityNameDisplay = document.getElementById('city-name');
    const showCitiesCheckbox = document.getElementById('show-cities');
    const showYellowRiverCheckbox = document.getElementById('show-yellow-river');
    const showYangziRiverCheckbox = document.getElementById('show-yangzi-river');
    const showChineseNamesCheckbox = document.getElementById('show-chinese-names');
    
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

    const provinceNamesZH = {
        HJ: "黑龙江", JL: "吉林", LN: "辽宁", NM: "内蒙古",
        BJ: "北京", TJ: "天津", HE: "河北", SX: "山西", SD: "山东",
        HA: "河南", JS: "江苏", AH: "安徽", HB: "湖北", HN: "湖南",
        JX: "江西", ZJ: "浙江", FJ: "福建", GD: "广东", GX: "广西",
        SC: "四川", CQ: "重庆", GZ: "贵州", YN: "云南", XZ: "西藏",
        SN: "陕西", GS: "甘肃", NX: "宁夏", QH: "青海", XJ: "新疆",
        HI: "海南", TW: "台湾", HK: "香港", MO: "澳门",
        LN_1: '辽宁', LN_2: '辽宁',
        HE_1: '河北', HE_2: '河北',
        SH_1: '上海', 'SH_2': '上海', 'SH_3': '上海',
        FJ_1: '福建', 'FJ_2': '福建', 'FJ_3': '福建',
        GD_1: '广东', GD_2: '广东', GD_3: '广东', GD_4: '广东', GD_6: '广东', GD_5: '广东',
        MO_1: '澳门', MO_2: '澳门',
        HK_1: '香港', HK_2: '香港',
        TW_1: '台湾', TW_2: "台湾", TW_3: "台湾",
        XJd: '新疆 (争议领土)',
        XZd2: '西藏 (争议领土)', XZd1: '西藏 (争议领土)'
    };
    

    let currentProvinceNames = provinceNames;
    let currentLanguage = 'en';

    function toggleLanguage() {
        currentLanguage = showChineseNamesCheckbox.checked ? 'zh' : 'en';
        currentProvinceNames = showChineseNamesCheckbox.checked ? provinceNamesZH : provinceNames;
        updateProvinceLabels();
        updateCityLabels();
    }

    function updateProvinceLabels() {
        const provinces = document.querySelectorAll('g.province path, g.province g');
        provinces.forEach(province => {
            let id = province.id.substring(1);
            const name = currentProvinceNames[id] || id;
            
            if (province.tagName === 'g') {
                province = province.querySelector('path');
            }
    
            // Update event listeners
            if (isMobile) {
                province.onclick = (e) => toggleLabelMobile(e, name, provinceNameDisplay);
            } else {
                province.onmousemove = (e) => showLabel(e, name, provinceNameDisplay);
            }
        });
    }

    function updateCityLabels() {
        const cities = document.querySelectorAll('g.city circle');
        cities.forEach(city => {
            const name = currentLanguage === 'zh' ? city.getAttribute('zh') : city.id;
            
            if (isMobile) {
                city.onclick = (e) => toggleLabelMobile(e, name, cityNameDisplay);
            } else {
                city.onmousemove = (e) => showLabel(e, name, cityNameDisplay);
            }
        });
    }

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    let labelTimeout;

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

        let lastClickedProvince = null;

        provinces.forEach(province => {
            let id = province.id.substring(1);
            const name = provinceNames[id] || id;
            
            if (province.tagName === 'g') {
                province = province.querySelector('path');
            }

            if (isMobile) {
                province.addEventListener('click', (e) => {
                    if (lastClickedProvince) {
                        lastClickedProvince.style.fill = '#99CC99'; // Reset previous province color
                    }
                    province.style.fill = '#ffffd1'; // Set clicked province to pale pastel yellow
                    lastClickedProvince = province;
                    toggleLabelMobile(e, name, provinceNameDisplay);
                });
            } else {
                province.addEventListener('mousemove', (e) => showLabel(e, name, provinceNameDisplay));
                province.addEventListener('mouseout', () => hideLabel(provinceNameDisplay));
            }
        });

        cities.forEach(city => {
            const name = city.id;
            
            if (isMobile) {
                city.addEventListener('click', (e) => toggleLabelMobile(e, name, cityNameDisplay));
            } else {
                city.addEventListener('mousemove', (e) => showLabel(e, name, cityNameDisplay));
                city.addEventListener('mouseout', () => hideLabel(cityNameDisplay));
            }
        });

        enablePanZoom();
        setInitialScrollPosition();
        showCitiesCheckbox.addEventListener('change', toggleVisibility);
        showYellowRiverCheckbox.addEventListener('change', toggleVisibility);
        showYangziRiverCheckbox.addEventListener('change', toggleVisibility);
        showChineseNamesCheckbox.addEventListener('change', toggleLanguage);

        toggleVisibility();
        updateProvinceLabels();
        updateCityLabels();

        if (isMobile) {
            hideLabel(provinceNameDisplay);
            hideLabel(cityNameDisplay);
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
        if (labelElement.style.display === 'none' || labelElement.textContent !== name) {
            showLabel(e, name, labelElement);
        } else {
            hideLabel(labelElement);
        }
    }

    function toggleLabelMobile(e, name, labelElement) {
        clearTimeout(labelTimeout);
        showLabel(e, name, labelElement);
        labelTimeout = setTimeout(() => hideLabel(labelElement), 2000);
    }

    function positionLabel(e, labelElement) {
        const mapContainer = document.getElementById('map-container');
        const rect = mapContainer.getBoundingClientRect();
        const offsetX = e.clientX + rect.left - 20;
        const offsetY = e.clientY - rect.top - 28;
        
        labelElement.style.left = `${offsetX}px`;
        labelElement.style.top = `${offsetY}px`;
    }

    function toggleVisibility() {
        const cityGroup = document.querySelector('g.city');
        const yellowRiver = document.querySelector('#Yellow\\ River');
        const yangziRiver = document.querySelector('#Yangzi\\ River');

        cityGroup.style.display = showCitiesCheckbox.checked ? 'block' : 'none';
        yellowRiver.style.display = showYellowRiverCheckbox.checked ? 'block' : 'none';
        yangziRiver.style.display = showYangziRiverCheckbox.checked ? 'block' : 'none';

        if (!showCitiesCheckbox.checked) {
            hideLabel(cityNameDisplay);
        }
    }

    function enablePanZoom() {
        const svg = document.querySelector('svg');
        if (!svg) {
            console.error('SVG element not found');
            return;
        }

        let isPanning = false;
        let startPoint = { x: 0, y: 0 };
        let endPoint = { x: 0, y: 0 };
        let scale = 1;

        if (isMobile) {
            // Set initial viewBox for mobile
            const setInitialViewBox = () => {
                const { width, height } = svg.getBoundingClientRect();
                svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
            };

            if (svg.getBoundingClientRect().width > 0) {
                setInitialViewBox();
            } else {
                svg.addEventListener('load', setInitialViewBox);
            }

            // Enable zooming for mobile
            mapContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
            mapContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
            mapContainer.addEventListener('touchend', handleTouchEnd);
        }

        // Enable panning for both desktop and mobile
        if (isMobile) {
            svg.addEventListener('touchstart', startPan);
            svg.addEventListener('touchmove', pan);
            svg.addEventListener('touchend', endPan);
        } else {
            svg.addEventListener('mousedown', startPan);
            svg.addEventListener('mousemove', pan);
            svg.addEventListener('mouseup', endPan);
            svg.addEventListener('mouseleave', endPan);
        }

        function startPan(e) {
            isPanning = true;
            startPoint = getPointFromEvent(e);
        }

        function pan(e) {
            if (!isPanning) return;
            endPoint = getPointFromEvent(e);
            const dx = endPoint.x - startPoint.x;
            const dy = endPoint.y - startPoint.y;

            mapContainer.scrollLeft -= dx;
            mapContainer.scrollTop -= dy;

            startPoint = endPoint;
            if (isMobile) {
                hideLabel(provinceNameDisplay);
                hideLabel(cityNameDisplay);
            }
        }

        function endPan() {
            isPanning = false;
        }

        function getPointFromEvent(e) {
            return {
                x: e.clientX || (e.touches && e.touches[0].clientX),
                y: e.clientY || (e.touches && e.touches[0].clientY)
            };
        }

        // Mobile-specific touch handling for zooming
        let initialDistance = 0;

        function handleTouchStart(e) {
            if (e.touches.length === 2) {
                initialDistance = getDistance(e.touches[0], e.touches[1]);
            }
        }

        function handleTouchMove(e) {
            if (e.touches.length === 2) {
                e.preventDefault(); // Prevent default pinch-zoom behavior
                const currentDistance = getDistance(e.touches[0], e.touches[1]);
                const delta = currentDistance - initialDistance;
                const newScale = scale * (1 + delta * 0.01);
                
                scale = Math.min(Math.max(0.5, newScale), 4);
                svg.style.transform = `scale(${scale})`;
                
                initialDistance = currentDistance;
            }
        }

        function handleTouchEnd() {
            initialDistance = 0;
        }

        function getDistance(touch1, touch2) {
            const dx = touch1.clientX - touch2.clientX;
            const dy = touch1.clientY - touch2.clientY;
            return Math.sqrt(dx * dx + dy * dy);
        }
    }
    
    function setInitialScrollPosition() {
        const mapContainer = document.getElementById('map-container');
        const svg = mapContainer.querySelector('svg');
        
        // Set the scroll position to the top right
        mapContainer.scrollLeft = svg.clientWidth - mapContainer.clientWidth;
        mapContainer.scrollTop = 0;
    }
});