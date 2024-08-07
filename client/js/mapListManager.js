function handleMapListClick() {
    const information = document.getElementById('information');
    const loginButtonBox = document.getElementById('loginButtonBox');
    setupLoginButtonBox(loginButtonBox);

    if (loginUserId) {
        fetchMapList();
    } else {
        displayLoginPrompt(information, loginButtonBox);
    }

    document.getElementById('mapListBtn').addEventListener("click", fetchMapList);
    document.getElementById('mapSearchBtn').addEventListener("click", showSearch);
    document.getElementById('createMap').addEventListener("click", displayCreateMapForm);
    document.getElementById('inviteesMapBtn').addEventListener("click", displayInviteForm);
}

function setupLoginButtonBox(loginButtonBox) {
    loginButtonBox.style.display = 'flex';
    loginButtonBox.innerHTML = '';

    const mapListBtn = createButton('mapListBtn', 'mapListBtn', '地圖清單');
    const mapSearchBtn = createButton('mapSearchBtn', 'mapSearchBtn', '搜尋地圖');
    const createMapBtn = createButton('createMap', 'createMap', '創建地圖');
    const inviteesMapBtn = createButton('inviteesMapBtn', 'inviteesMapBtn', '邀請');

    loginButtonBox.appendChild(mapListBtn);
    loginButtonBox.appendChild(mapSearchBtn);
    loginButtonBox.appendChild(createMapBtn);
    loginButtonBox.appendChild(inviteesMapBtn);
}

function createButton(id, className, text) {
    const button = document.createElement("div");
    button.id = id;
    button.className = className;
    button.innerText = text;
    return button;
}

function fetchMapList() {
    if (!loginUserId) {
        const information = document.getElementById('information');
        information.innerHTML = `
        <div class="WithoutMapId">
            <div>登入後查看地圖清單</div>
        </div>
        `;
        return;
    }
    document.querySelector('.loadingIndicator').style.display = 'flex';

    fetch(`/api/maps?loginUserId=${loginUserId}`)
        .then(response => response.json())
        .then(data => {
            const information = document.getElementById('information');
            information.innerHTML = '';

            findMap();
            data.forEach(roomInfo => {
                const roomBox = createRoomBox(roomInfo);
                information.appendChild(roomBox);
            });
            document.querySelector('.loadingIndicator').style.display = 'none';
        })
        .catch(error => console.error('Map Create Error:', error));
}

function createRoomBox(roomInfo) {
    const roomBox = document.createElement("div");
    roomBox.className = 'roomBox';
    roomBox.id = `roomBox-${roomInfo._id}`;

    createDeleteBtn(roomBox, roomInfo._id);
    const roomName = createRoomDetail('roomName', roomInfo.roomName);
    const roomOwner = createRoomDetail('roomOwner', roomInfo.loginUserName);

    roomBox.appendChild(roomName);
    roomBox.appendChild(roomOwner);

    roomBox.addEventListener("click", () => {
        mapId = roomInfo._id;
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('mapId', mapId);
        window.location.href = newUrl.href; 
    });

    return roomBox;
}

function createRoomDetail(className, text) {
    const detail = document.createElement("div");
    detail.className = className;
    detail.innerText = text;
    return detail;
}

function displayLoginPrompt(information, loginButtonBox) {
    information.innerHTML = `
                <div class="WithoutMapId">
                    <div>登入後查看地圖清單</div>
                </div>
    `;
    information.style.display = 'flex';
    loginButtonBox.style.display = 'none'; 
}

function displayCreateMapForm() {
    if (loginUserId) {
        const information = document.getElementById('information');
        information.innerHTML = '';
    
        const roomNameInput = document.createElement("input");
        roomNameInput.setAttribute("type", "text");
        roomNameInput.className = 'roomNameInput';
        roomNameInput.setAttribute("placeholder", "輸入地圖名稱");
        roomNameInput.id = 'roomNameInput';
        information.appendChild(roomNameInput);
    
        const createRoomBtn = document.createElement("button");
        createRoomBtn.innerText = '確定創建';
        createRoomBtn.onclick = createMap;
        information.appendChild(createRoomBtn);
    } else {
        const information = document.getElementById('information');
        information.innerHTML = '登入後創建地圖';
    }
}

function createMap() {
    const roomName = document.getElementById('roomNameInput').value;

    document.querySelector('.loadingIndicator').style.display = 'flex';

    fetch('/api/maps', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName, loginUserId, loginUserName })
    })
    .then(response => response.json())
    .then(data => {
        if(data.success === false){
            showAlert(data.error);
            document.querySelector('.loadingIndicator').style.display = 'none';
        } else {
        const information = document.getElementById('information');
        information.innerHTML = data.message;
        document.querySelector('.loadingIndicator').style.display = 'none';
        }
    })
    .catch(error => console.error('Map Create Error:', error));
}

function displayInviteForm() {
    const information = document.getElementById('information');
    information.innerHTML = '';

    findMap();

    const inviteesMailInput = document.createElement("input");
    inviteesMailInput.setAttribute("type", "text");
    inviteesMailInput.className = 'inviteesMailInput';
    inviteesMailInput.setAttribute("placeholder", "輸入受邀者的Email");
    inviteesMailInput.id = 'inviteesMailInput';
    information.appendChild(inviteesMailInput);

    const inviteUserBtn = document.createElement("button");
    inviteUserBtn.innerText = '確定邀請';
    inviteUserBtn.onclick = inviteUser;
    information.appendChild(inviteUserBtn);
}

function inviteUser() {
    const inviteesMailInput = document.getElementById('inviteesMailInput');
    const inviteesMail = inviteesMailInput.value.trim();

    const urlParams = new URLSearchParams(window.location.search);
    const mapId = urlParams.get('mapId');

    document.querySelector('.loadingIndicator').style.display = 'flex';

    fetch('/api/maps', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mapId, loginUserId, inviteesMail })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success=== false) {
            showAlert(data.error);
            document.querySelector('.loadingIndicator').style.display = 'none';
        } else {
            const information = document.getElementById('information');
            information.innerHTML = data.message;
            document.querySelector('.loadingIndicator').style.display = 'none';
        }
    })
    .catch(error => alert(error));
}

function showSearch() {
    const information = document.getElementById('information');
    information.innerHTML='';

    let searchContainer = document.getElementById('searchContainer');
    if (!searchContainer) {
        searchContainer = document.createElement('nav');
        searchContainer.id = 'searchContainer';
        searchContainer.className = 'searchContainer';
        information.prepend(searchContainer);

        const mapListSearchInput = document.createElement('input');
        mapListSearchInput.setAttribute("placeholder", "搜尋地圖");
        mapListSearchInput.className = 'mapListSearchInput';
        mapListSearchInput.id = 'mapListSearchInput';
        searchContainer.appendChild(mapListSearchInput);

        const mapSearchDisplayButton = document.createElement('button');
        mapSearchDisplayButton.textContent = '搜尋';
        mapSearchDisplayButton.className = 'mapSearchDisplayButton';
        mapSearchDisplayButton.id = 'mapSearchDisplayButton';
        searchContainer.appendChild(mapSearchDisplayButton);

        mapSearchDisplayButton.addEventListener('click', () => {
            const mapListContainer = document.getElementById('information');
            mapListContainer.innerHTML = '';
            const keyword = mapListSearchInput.value;
            if (keyword) {
                document.querySelector('.loadingIndicator').style.display = 'flex';

                fetch(`/api/maps/search?keyword=${encodeURIComponent(keyword)}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success === false){
                            showAlert(data.error);
                            document.querySelector('.loadingIndicator').style.display = 'none';
                        }else{
                            data.forEach(map => {
                                const mapElement = createRoomBox(map);
                                mapListContainer.appendChild(mapElement);
                            document.querySelector('.loadingIndicator').style.display = 'none';
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching data:', error);
                        document.getElementById('results').textContent = '搜索失敗';
                    });
            } else {
                alert('請輸入搜索關鍵字');
            }

            mapListSearchInput.value = '';
            searchContainer.classList.remove('expanded');
        });

        mapListSearchInput.addEventListener('blur', () => {
            if (mapListSearchInput.value === '') {
                searchContainer.classList.remove('expanded');
            }
        });
    }

    if (searchContainer.classList.contains('expanded')) {
        searchContainer.classList.remove('expanded');
    } else {
        searchContainer.classList.add('expanded');
        document.getElementById('mapListSearchInput').focus();
    }
}

function createDeleteBtn (content, id) {
    const deleteBtn = document.createElement("span");
    deleteBtn.innerHTML = '&times;';
    deleteBtn.className = 'alertClosure';
    deleteBtn.onclick = function(event) {
        deleteMap(id);
        event.stopPropagation();
      }

    content.appendChild(deleteBtn);
}

async function deleteMap(mapId) {
    document.querySelector('.loadingIndicator').style.display = 'flex';
    const response = await fetch("/api/maps", {
        method: "delete",
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        _id: mapId,
        }),
    })
    .then(response => response.json())
    .then(data => {
        showAlert(data.message);
        document.querySelector('.loadingIndicator').style.display = 'none';
        window.location.href = '/';
    })
}

function findMap(){
    const urlParams = new URLSearchParams(window.location.search);
    const mapId = urlParams.get('mapId');

    const mapListContainer = document.getElementById('information');
    if (!mapId){
        const currentMap = document.createElement('div');
        currentMap.className = 'currentMap';

        const currentMapTitle = document.createElement('div');
        currentMapTitle.className = 'currentMapTitle';
        currentMapTitle.innerText = '目前尚未選擇任何地圖'
        currentMap.appendChild(currentMapTitle);

        mapListContainer.prepend(currentMap);
    } else {
        document.querySelector('.loadingIndicator').style.display = 'flex';
        fetch(`/api/maps/map?mapId=${mapId}`)
        .then(response => response.json())
        .then(data => {
            const currentMap = document.createElement('div');
            currentMap.className = 'currentMap';

            const currentMapTitle = document.createElement('div');
            currentMapTitle.className = 'currentMapContent';
            currentMapTitle.innerText = '當前地圖：'
            currentMap.appendChild(currentMapTitle);

            const currentMapContent = document.createElement('p');
            currentMapContent.className = 'currentMapTitle';
            currentMapContent.innerText = `${data.roomName}`
            currentMap.appendChild(currentMapContent);

            mapListContainer.prepend(currentMap);
            document.querySelector('.loadingIndicator').style.display = 'none';
        })
    }
}

async function afterLoginUserIdInitialized(loginUserId, mapId) {
    await fetch(`/api/maps/match?loginUserId=${loginUserId}&mapId=${mapId}`)
      .then(response => response.json())
      .then(data => {
        if(data.length === 0){
          showAlert("尚未選擇地圖，或您無權使用此地圖");
          const element = document.querySelector('.alertClosure').style.display = 'none';
        }
      })
      .catch(error => showAlert(error));
}
  