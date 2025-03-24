// // 初始化地图并设置米兰为中心
// var map = L.map('map').setView([45.4642, 9.19], 12);

// // 使用 OpenStreetMap 图层
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
//     attribution: '© OpenStreetMap'
// }).addTo(map);

//修改为mapbox 可付费地图
mapboxgl.accessToken = 'pk.eyJ1Ijoic2VkcmZ0eXVpbyIsImEiOiJjbThuNjZsZWQxMTFwMmtxdXluZHFwMXJpIn0.KgvJVMSnEl7l3SL89yRkRQ'; // ← 替换成你自己的 token

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/standard',  // 使用 Mapbox 标准样式
    center: [9.19, 45.4642],
    zoom: 12
});

map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-left');


// 存储所有的标记
var restaurantMarkers = [];

// 预定义的图标
var restaurantIcons = {
    "中餐": 'https://cdn-icons-png.flaticon.com/128/9237/9237589.png',
    "甜品": 'https://cdn-icons-png.flaticon.com/128/992/992717.png',
    "西餐": 'https://cdn-icons-png.flaticon.com/128/2872/2872222.png',
    "烤肉": 'https://cdn-icons-png.flaticon.com/128/450/450098.png',
    "火锅": 'https://cdn-icons-png.flaticon.com/128/890/890076.png',
    "日料": 'https://cdn-icons-png.flaticon.com/128/2252/2252075.png',
    "汤面": 'https://cdn-icons-png.flaticon.com/128/3084/3084875.png',
    "炸物": 'https://cdn-icons-png.flaticon.com/128/837/837606.png',
};

// 创建图例元素
var legend = document.createElement('div');
legend.className = 'legend';
legend.style.cssText = 'position: absolute; top: 13px; right: 13px; background: white; padding: 7px; font-size: 11px; max-height: 300px; overflow: auto; z-index: 1; border-radius: 6px; box-shadow: 0 0 5px rgba(0,0,0,0.3);';

// legend.innerHTML += '<strong>图标注释</strong><br>';

Object.keys(restaurantIcons).forEach(type => {
    let checkedAttr = (type === "烤肉" || type === "日料") ? "" : "checked";
    legend.innerHTML += `
        <input type="checkbox" id="filter-${type}" ${checkedAttr} onchange="updateMarkers()">
        <img src="${restaurantIcons[type]}" > ${type}<br>
    `;
});

legend.innerHTML += `<hr>
    <input type="checkbox" id="filter-all" checked onchange="toggleAllMarkers()">
    <strong>显示全部</strong><br>`;

// 把图例添加到 map 容器
map.getContainer().appendChild(legend);

// 加载 JSON 数据
fetch('static/data.json')
    .then(response => response.json())
    .then(data => {
        restaurantMarkers = [];

        data.restaurants.forEach(restaurant => {
            const type = restaurant.type;
            const iconUrl = restaurantIcons[type] || restaurantIcons["默认"];
        
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundImage = `url(${iconUrl})`;
            el.style.width = '23px';
            el.style.height = '23px';
            el.style.backgroundSize = 'contain';
        
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
                <b>${restaurant.name}</b><br>
                地址：${restaurant.address}<br>
                特色：${restaurant.description}<br>
                价格：${restaurant.price}
            `);
        
            // 修正坐标顺序
            const [lat, lng] = restaurant.location;
            const lngLat = [lng, lat];
        
            const marker = new mapboxgl.Marker(el)
                .setLngLat(lngLat)
                .setPopup(popup);
        
            restaurantMarkers.push({ marker: marker, type: type });
        
            if (type !== "烤肉" && type !== "日料") {
                marker.addTo(map);
            }
        });

        updateMarkers(); // 初次更新
    })
    .catch(error => {
        console.error('数据加载失败:', error);
    });

// 更新显示的标记
window.updateMarkers = function () {
    let allChecked = true;

    restaurantMarkers.forEach(entry => {
        const checkbox = document.getElementById(`filter-${entry.type}`);

        if (checkbox && checkbox.checked) {
            entry.marker.addTo(map);
        } else {
            entry.marker.remove();  // Mapbox 的删除方式
            allChecked = false;
        }
    });
    document.getElementById("filter-all").checked = allChecked;
};

// 控制全部显示/隐藏
window.toggleAllMarkers = function () {
    const allChecked = document.getElementById("filter-all").checked;
    Object.keys(restaurantIcons).forEach(type => {
        document.getElementById(`filter-${type}`).checked = allChecked;
    });

    updateMarkers();
};