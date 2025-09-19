let map;
let restaurantMarkers = [];
let userLocation = null; // ⬅️ 放在全局作用域中
let infoWindow = null; //显示详情页

// 定义图标
const restaurantIcons = {
    "中餐": 'https://cdn-icons-png.flaticon.com/128/9237/9237589.png',
    "甜品": 'https://cdn-icons-png.flaticon.com/128/992/992717.png',
    "西餐": 'https://cdn-icons-png.flaticon.com/128/2872/2872222.png',
    "烤肉": 'https://cdn-icons-png.flaticon.com/128/450/450098.png',
    "火锅": 'https://cdn-icons-png.flaticon.com/128/890/890076.png',
    "日料": 'https://cdn-icons-png.flaticon.com/128/2252/2252075.png',
    "汤面": 'https://cdn-icons-png.flaticon.com/128/3084/3084875.png',
    "炸物": 'https://cdn-icons-png.flaticon.com/128/837/837606.png',
    "小吃": 'https://cdn-icons-png.flaticon.com/128/646/646573.png',
    "酒吧": 'https://cdn-icons-png.flaticon.com/128/3086/3086535.png',
};

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 45.4642, lng: 9.19 },
        zoom: 12,
        mapTypeControl: false,  // ← 移除左上角切换按钮
    });

    // 创建图例
    const legend = document.createElement('div');
    legend.className = 'legend';
    legend.style.cssText = 'position: absolute; top: 13px; right: 13px; background: white; padding: 7px; font-size: 11px; max-height: 300px; overflow: auto; z-index: 5; border-radius: 6px; box-shadow: 0 0 5px rgba(0,0,0,0.3);';

    Object.keys(restaurantIcons).forEach(type => {
        const checked = (type === "烤肉" || type === "日料") ? "" : "checked";
        legend.innerHTML += `
            <input type="checkbox" id="filter-${type}" ${checked} onchange="updateMarkers()">
            <img src="${restaurantIcons[type]}" width="16"> ${type}<br>
        `;
    });

    legend.innerHTML += `<hr>
        <input type="checkbox" id="filter-all" checked onchange="toggleAllMarkers()">
        <strong>显示全部</strong><br>`;

    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(legend);

    // 加载数据
    fetch('static/data.json')
        .then(response => response.json())
        .then(data => {
            restaurantMarkers = [];

            data.restaurants.forEach(restaurant => {
                const type = restaurant.type;
                const iconUrl = restaurantIcons[type] || restaurantIcons["默认"];

                const [lat, lng] = restaurant.location;

                // 构建图文弹窗
                let contentHtml =  `
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: bold; font-size: 15px;">${restaurant.name}</div>
                    <span onclick="infoWindow.close()" style="cursor: pointer; font-size: 18px; font-weight: bold;">×</span>
                  </div>
                  <div style="margin-top: 5px; font-size: 13px; line-height: 1.6;">
                    <div><span style="font-weight: bold;">地址：</span>${restaurant.address}</div>
                    <div><span style="font-weight: bold;">特色：</span>${restaurant.description}</div>
                    <div><span style="font-weight: bold;">价格：</span>${restaurant.price}</div>
                    ${''}

                  </div>
                `;

                // 添加图片放大预览函数（在 JS 中插入 <script> 元素）
                if (!document.getElementById('full-image-style')) {
                    const style = document.createElement('style');
                    style.id = 'full-image-style';
                    style.textContent = `
                      #imageModal {
                        position: fixed;
                        z-index: 9999;
                        left: 0; top: 0; width: 100%; height: 100%;
                        background: rgba(0,0,0,0.8);
                        display: flex; align-items: center; justify-content: center;
                      }
                      #imageModal img {
                        max-width: 90%; max-height: 90%;
                        border-radius: 8px;
                        box-shadow: 0 0 20px rgba(255,255,255,0.3);
                      }
                    `;
                    document.head.appendChild(style);
                }


                if (restaurant.image) {
                    restaurant.image.forEach(src => {
                        contentHtml += `
                            <img src="${src}"
                            style="width:80px; height:80px; object-fit:cover; margin:5px; border-radius:6px;"
                            onclick="showFullImage('${src}')">
                        `;
                    });
                }
                // 加入导航按钮（在定位成功的前提下才能点击）
                contentHtml += `
                    <br><button onclick="navigateTo('${restaurant.name} Milano')" style="margin-top:5px;">📍 从当前位置导航</button>
                `;

//                const infoWindow = new google.maps.InfoWindow({
//                    content: contentHtml
//                });

                const marker = new google.maps.Marker({
                    position: { lat: lat, lng: lng },
                    map: (type !== "烤肉" && type !== "日料") ? map : null,
                    icon: {
                        url: iconUrl,
                        scaledSize: new google.maps.Size(23, 23),
                    }
                });

                marker.addListener("click", () => {
                    if (infoWindow) {
                        infoWindow.close();  // 关闭旧的
                    }

                    infoWindow = new google.maps.InfoWindow({
                        content: contentHtml
//                        disableAutoPan: true,
                    });
                    infoWindow.open(map, marker);
                });

                // 点击地图空白处时关闭 infoWindow
                map.addListener('click', () => {
                    infoWindow.close();
                });

                restaurantMarkers.push({ marker: marker, type: type });
            });

//            updateMarkers();
        })
        .catch(error => {
            console.error("数据加载失败:", error);
        });

    // 尝试获取用户当前地理位置
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                // 打印位置
                console.log("📍 用户位置:", userLat, userLng);


                // 在成功获取位置后赋值：
                userLocation = { lat: userLat, lng: userLng };

                // 地图移动到用户位置
                map.setCenter({ lat: userLat, lng: userLng });
                map.setZoom(15);

                // 添加蓝色 marker 标注
                new google.maps.Marker({
                    position: { lat: userLat, lng: userLng },
                    map: map,
                    title: "你的位置",
                    icon: {
                        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    }
                });

                // 后续可以在这里调用路线规划函数
            },
            error => {
                console.warn("⚠️ 获取位置失败:", error.message);
                alert("未能获取当前位置，某些功能可能无法使用。");
            }
        );
    } else {
        alert("❌ 当前浏览器不支持定位功能。");
    }
    updateMarkers();
}

// 显示当前选中类型的标记
window.updateMarkers = function () {
    let allChecked = true;
    restaurantMarkers.forEach(entry => {
        const checkbox = document.getElementById(`filter-${entry.type}`);
        if (checkbox && checkbox.checked) {
            entry.marker.setMap(map);
        } else {
            entry.marker.setMap(null);
            allChecked = false;
        }
    });
    document.getElementById("filter-all").checked = allChecked;
};

// 全选/取消全选
window.toggleAllMarkers = function () {
    const allChecked = document.getElementById("filter-all").checked;
    Object.keys(restaurantIcons).forEach(type => {
        document.getElementById(`filter-${type}`).checked = allChecked;
    });
    updateMarkers();
};

// 导航函数
window.navigateTo = function(destinationName) {
    if (!userLocation) {
        alert("未获取当前位置，无法导航！");
        return;
    }

    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destination = encodeURIComponent(destinationName);  // 转义空格、标点

    // 使用 Google 地图导航
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
    window.open(url, '_blank');
};

//图片放大函数
window.showFullImage = function(src) {
    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.innerHTML = `<img src="${src}" onclick="this.parentNode.remove()">`;
    document.body.appendChild(modal);
};