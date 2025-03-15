// 初始化地图并设置米兰为中心
var map = L.map('map').setView([45.4642, 9.19], 12);
            
// 使用 OpenStreetMap 图层
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// 创建图标注释控制层
var legend = L.control({ position: 'topright' });

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<h6 class="legend-title">图标注释</h6>';
    div.innerHTML += '<img src="https://cdn-icons-png.flaticon.com/128/2702/2702604.png" alt="classmate"> 同学住址<br>';
    div.innerHTML += '<img src="https://cdn-icons-png.flaticon.com/128/9237/9237589.png" alt="restaurant"> 中餐<br>';
    div.innerHTML += '<img src="https://cdn-icons-png.flaticon.com/128/992/992717.png" alt="cake"> 甜品<br>';
    div.innerHTML += '<img src="https://cdn-icons-png.flaticon.com/128/2872/2872222.png" alt="pizza"> 西餐<br>';
    div.innerHTML += '<img src="https://cdn-icons-png.flaticon.com/128/450/450098.png" alt="cake"> 烧烤<br>';
    div.innerHTML += '<img src="https://cdn-icons-png.flaticon.com/128/890/890076.png" alt="pizza"> 火锅<br>';
    div.innerHTML += '<img src="https://cdn-icons-png.flaticon.com/128/2252/2252075.png" alt="cake"> 日料<br>';
    div.innerHTML += '<img src="https://cdn-icons-png.flaticon.com/128/3084/3084875.png" alt="cake"> 汤面<br>';
    div.innerHTML += '<img src="https://cdn-icons-png.flaticon.com/128/837/837606.png" alt="cake"> 炸物<br>';
    return div;
};

legend.addTo(map);

// 预定义的图标
var restaurantIcons = {
  "中餐": L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/9237/9237589.png',
      iconSize: [25, 25],
      iconAnchor: [12, 41],
      popupAnchor: [0, -41]
  }),
  "汤面": L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/3084/3084875.png',
      iconSize: [25, 25],
      iconAnchor: [12, 41],
      popupAnchor: [0, -41]
  }),
  "火锅": L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/890/890076.png',
      iconSize: [25, 25],
      iconAnchor: [12, 41],
      popupAnchor: [0, -41]
  }),
  "烤肉": L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/450/450098.png',
      iconSize: [25, 25],
      iconAnchor: [12, 41],
      popupAnchor: [0, -41]
  }),
  "日料": L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/2252/2252075.png',
      iconSize: [25, 25],
      iconAnchor: [12, 41],
      popupAnchor: [0, -41]
  }),
  "甜品": L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/992/992717.png',
      iconSize: [20, 20],
      iconAnchor: [12, 41],
      popupAnchor: [0, -41]
  }),
  "西餐": L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/2872/2872222.png',
      iconSize: [25, 25],
      iconAnchor: [12, 41],
      popupAnchor: [0, -41]
  }),
  "炸物": L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/837/837606.png',
      iconSize: [25, 25],
      iconAnchor: [12, 41],
      popupAnchor: [0, -41]
  }),
  "默认": L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/167/167707.png',
      iconSize: [25, 30],
      iconAnchor: [12, 41],
      popupAnchor: [0, -41]
  })
};

// 加载 JSON 数据并添加餐厅标记
fetch('/static/data.json')
  .then(response => response.json())
  .then(data => {
    data.restaurants.forEach(restaurant => {
      var cate = restaurant.type;
      var icon = restaurantIcons[cate] || restaurantIcons["默认"];

      L.marker(restaurant.location, { icon: icon })
        .addTo(map)
        .bindPopup(`店名：${restaurant.name}<br>地址：${restaurant.address}<br>特色：${restaurant.description}<br>价格：${restaurant.price}`);
    });
  })
  .catch(error => {
    console.error('加载数据失败:', error);
  });
