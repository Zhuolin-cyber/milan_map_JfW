// 初始化地图并设置米兰为中心
var map = L.map('map').setView([45.4642, 9.19], 12);

// 使用 OpenStreetMap 图层
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// 存储所有的标记
var restaurantMarkers = [];

// 预定义的图标
var restaurantIcons = {
  "中餐": L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/128/9237/9237589.png', iconSize: [25, 25] }),
  "甜品": L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/128/992/992717.png', iconSize: [25, 25] }),
  "西餐": L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/128/2872/2872222.png', iconSize: [25, 25] }),
  "烤肉": L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/128/450/450098.png', iconSize: [25, 25] }),
  "火锅": L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/128/890/890076.png', iconSize: [25, 25] }),
  "日料": L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/128/2252/2252075.png', iconSize: [25, 25] }),
  "汤面": L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/128/3084/3084875.png', iconSize: [25, 25] }),
  "炸物": L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/128/837/837606.png', iconSize: [25, 25] }),
};

// 创建图标注释控制层
var legend = L.control({ position: 'topright' });

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<h6 class="legend-title">图标注释</h6>';
    
    Object.keys(restaurantIcons).forEach(type => {
        let checkedAttr = (type === "烤肉" || type === "日料") ? "" : "checked";  // 默认不勾选烤肉和日料
        
        div.innerHTML += `
            <input type="checkbox" id="filter-${type}" ${checkedAttr} onchange="updateMarkers()">
            <img src="${restaurantIcons[type].options.iconUrl}" style="width: 20px; height: 20px;"> ${type}<br>
        `;
    });

    // 这里才是“选择全部”按钮，放在最后
    div.innerHTML += `<hr>
        <input type="checkbox" id="filter-all" checked onchange="toggleAllMarkers()">
        <strong>显示全部</strong><br>`;

    return div;
};


legend.addTo(map);

// 读取 JSON 数据并添加标记
fetch('static/data.json')
  .then(response => response.json())
  .then(data => {
    // 先清空数组，防止重复加载
    restaurantMarkers = [];
    
    data.restaurants.forEach(restaurant => {
      var type = restaurant.type;
      var icon = restaurantIcons[type] || restaurantIcons["默认"];

      var marker = L.marker(restaurant.location, { icon: icon })
        .bindPopup(`<b>${restaurant.name}</b><br>地址：${restaurant.address}<br>特色：${restaurant.description}`);

      restaurantMarkers.push({ marker: marker, type: type });
      
      // **默认不显示"烤肉"和"日料"**
      if (type !== "烤肉" && type !== "日料") {
        marker.addTo(map);
        }
    });

    // 确保默认执行 `updateMarkers()`，同步显示状态
    updateMarkers();
  })
  .catch(error => {
    console.error('数据加载失败:', error);
  });

  window.updateMarkers = function () {
    let allChecked = true; // 假设所有类别都被选中

    restaurantMarkers.forEach(entry => {
        var checkbox = document.getElementById(`filter-${entry.type}`);

        if (checkbox && checkbox.checked) {
            if (!map.hasLayer(entry.marker)) {
                map.addLayer(entry.marker);  // 重新添加标记
            }
        } else {
            if (map.hasLayer(entry.marker)) {
                map.removeLayer(entry.marker);  // 隐藏标记
            }
            allChecked = false; // 如果有至少一个未选中，allChecked 设为 false
        }
    });

    // 更新“选择全部”按钮状态
    document.getElementById("filter-all").checked = allChecked;
};


window.toggleAllMarkers = function () {
    var allChecked = document.getElementById("filter-all").checked;
    
    // 更新所有类别的复选框状态
    Object.keys(restaurantIcons).forEach(type => {
        document.getElementById(`filter-${type}`).checked = allChecked;
    });

    updateMarkers();  // 重新更新地图上的标记
};

