document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // === 1. INICIALIZACIÓN Y REFERENCIAS GLOBALES ============================
    // =========================================================================

    if (typeof firebase === 'undefined') {
        console.error('Firebase no está cargado. Revisa tus scripts.');
        alert('Error: No se pudo conectar con los servicios de la aplicación. Por favor, recarga la página.');
        return;
    }

    const auth = firebase.auth();
    const db = firebase.database();

    let currentUserData = null; // Almacenará los datos del usuario actual { uid, username, avatar,... }

    // =========================================================================
    // === 2. GESTIÓN DE PRESENCIA (ONLINE/OFFLINE) ============================
    // =========================================================================

    const setupPresence = (user) => {
        if (!user) return;
        const userStatusDatabaseRef = db.ref('/status/' + user.uid);
        const isOfflineForDatabase = { state: 'offline', last_changed: firebase.database.ServerValue.TIMESTAMP };
        const isOnlineForDatabase = { state: 'online', last_changed: firebase.database.ServerValue.TIMESTAMP };

        db.ref('.info/connected').on('value', (snapshot) => {
            if (snapshot.val() === false) return;

            userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(() => {
                userStatusDatabaseRef.set(isOnlineForDatabase);
            });
        });
    };

    // =========================================================================
    // === 3. GESTIÓN DEL ESTADO DE AUTENTICACIÓN (CEREBRO DE LA APP) =========
    // =========================================================================

    auth.onAuthStateChanged(user => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        if (user) {
            setupPresence(user);
            document.getElementById('guest-menu')?.classList.add('hidden');
            document.getElementById('user-menu')?.classList.remove('hidden');

            db.ref('users/' + user.uid).on('value', snapshot => {
                if (snapshot.exists()) {
                    currentUserData = { uid: user.uid, ...snapshot.val() };
                    populateUIWithUserData(currentUserData);
                } else {
                    const fallbackUsername = user.displayName || (user.email ? user.email.split('@')[0] : 'usuario');
                    const fallbackAvatarURL = `https://api.dicebear.com/8.x/adventurer/svg?seed=${fallbackUsername}`;
                    db.ref('users/' + user.uid).set({ username: fallbackUsername, email: user.email || '', createdAt: firebase.database.ServerValue.TIMESTAMP, avatar: fallbackAvatarURL });
                }
            });

            if (currentPage === 'auth.html') window.location.href = 'profile.html';

        } else {
            currentUserData = null;
            document.getElementById('guest-menu')?.classList.remove('hidden');
            document.getElementById('user-menu')?.classList.add('hidden');
            const protectedPages = ['profile.html', 'settings.html', 'community.html'];
            if (protectedPages.includes(currentPage)) {
                window.location.href = 'index.html';
            }
        }
    });

    function populateUIWithUserData(userData) {
        // La línea del avatar de navegación ha sido eliminada
        document.getElementById('profileAvatar')?.setAttribute('src', userData.avatar);
        const profileUsername = document.getElementById('profileUsername');
        if (profileUsername) profileUsername.textContent = userData.username;

        if (document.querySelector('.avatar-gallery-layout')) {
            initializeAvatarCreator(userData.avatar);
        }
    }

    // =========================================================================
    // === 4. LÓGICA DE PÁGINAS ESPECÍFICAS ====================================
    // =========================================================================

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (currentPage === 'auth.html') {
        setupAuthPage();
    } else if (currentPage === 'community.html') {
        const interval = setInterval(() => {
            if (currentUserData) {
                clearInterval(interval);
                loadCommunityPage();
            }
        }, 100);
    }

    // =========================================================================
    // === 5. FUNCIONES DE CADA PÁGINA (AUTH, SETTINGS, COMMUNITY) =============
    // =========================================================================

    function setupAuthPage() {
        const loginView = document.getElementById('login-view'), registerView = document.getElementById('register-view'), loginForm = document.getElementById('login-form'), registerForm = document.getElementById('register-form');
        if (!loginView || !registerView) return;
        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'register') { loginView.classList.add('hidden'); registerView.classList.remove('hidden'); } else { loginView.classList.remove('hidden'); registerView.classList.add('hidden'); }
        if (registerForm) { registerForm.addEventListener('submit', (e) => { e.preventDefault(); auth.createUserWithEmailAndPassword(document.getElementById('register-email').value, document.getElementById('register-password').value).catch(error => { console.error('Error en registro:', error); alert(error.message); }); }); }
        if (loginForm) { loginForm.addEventListener('submit', (e) => { e.preventDefault(); auth.signInWithEmailAndPassword(document.getElementById('login-email').value, document.getElementById('login-password').value).catch(error => { console.error('Error de login:', error); alert(error.message); }); }); }
    }

    function initializeAvatarCreator(savedAvatarUrl) {
        const galleryLayout = document.querySelector('.avatar-gallery-layout');
        if (!galleryLayout) return;
        const avatarList = ['https://api.dicebear.com/8.x/adventurer/svg?hair=short01&hairColor=4a312c', 'https://api.dicebear.com/8.x/adventurer/svg?hair=short02&hairColor=4a312c', 'https://api.dicebear.com/8.x/adventurer/svg?hair=short03&hairColor=4a312c', 'https://api.dicebear.com/8.x/adventurer/svg?hair=short04&hairColor=4a312c', 'https://api.dicebear.com/8.x/adventurer/svg?hair=short05&hairColor=2c1b18', 'https://api.dicebear.com/8.x/adventurer/svg?hair=short06&hairColor=2c1b18', 'https://api.dicebear.com/8.x/adventurer/svg?hair=short07&hairColor=2c1b18', 'https://api.dicebear.com/8.x/adventurer/svg?hair=short08&hairColor=2c1b18', 'https://api.dicebear.com/8.x/adventurer/svg?hair=short09&hairColor=d4a12a', 'https://api.dicebear.com/8.x/adventurer/svg?hair=short10&hairColor=d4a12a', 'https://api.dicebear.com/8.x/adventurer/svg?hair=short11&hairColor=d4a12a', 'https://api.dicebear.com/8.x/adventurer/svg?hair=short12&hairColor=d4a12a', 'https://api.dicebear.com/8.x/adventurer/svg?hair=short13&hairColor=cb6820', 'https://api.dicebear.com/8.x/adventurer/svg?hair=short14&hairColor=cb6820', 'https://api.dicebear.com/8.x/adventurer/svg?hair=short15&hairColor=cb6820', 'https://api.dicebear.com/8.x/adventurer/svg?hair=long01&hairColor=4a312c', 'https://api.dicebear.com/8.x/adventurer/svg?hair=long02&hairColor=4a312c', 'https://api.dicebear.com/8.x/adventurer/svg?hair=long07&hairColor=4a312c', 'https://api.dicebear.com/8.x/adventurer/svg?hair=long08&hairColor=4a312c', 'https://api.dicebear.com/8.x/adventurer/svg?hair=long03&hairColor=2c1b18', 'https://api.dicebear.com/8.x/adventurer/svg?hair=long04&hairColor=2c1b18', 'https://api.dicebear.com/8.x/adventurer/svg?hair=long09&hairColor=2c1b18', 'https://api.dicebear.com/8.x/adventurer/svg?hair=long10&hairColor=2c1b18', 'https://api.dicebear.com/8.x/adventurer/svg?hair=long05&hairColor=d4a12a', 'https://api.dicebear.com/8.x/adventurer/svg?hair=long06&hairColor=d4a12a', 'https://api.dicebear.com/8.x/adventurer/svg?hair=long11&hairColor=d4a12a', 'https://api.dicebear.com/8.x/adventurer/svg?hair=long12&hairColor=d4a12a', 'https://api.dicebear.com/8.x/adventurer/svg?hair=long13&hairColor=cb6820', 'https://api.dicebear.com/8.x/adventurer/svg?hair=long14&hairColor=cb6820', 'https://api.dicebear.com/8.x/adventurer/svg?hair=long15&hairColor=cb6820', 'https://api.dicebear.com/8.x/adventurer/svg?hair=long16&hairColor=cb6820', 'https://api.dicebear.com/8.x/adventurer/svg?hair=fonze&hairColor=2c1b18', 'https://api.dicebear.com/8.x/adventurer/svg?hair=mohawk01&hairColor=d4a12a', 'https://api.dicebear.com/8.x/adventurer/svg?hair=justjim&hairColor=4a312c', 'https://api.dicebear.com/8.x/adventurer/svg?hair=doug&hairColor=cb6820', 'https://api.dicebear.com/8.x/adventurer/svg?hair=mrT&hairColor=2c1b18', 'https://api.dicebear.com/8.x/adventurer/svg?hair=pigtails&hairColor=e8e1e1', 'https://api.dicebear.com/8.x/adventurer/svg?hair=shaven&hairColor=4a312c', 'https://api.dicebear.com/avataaars/svg?seed=angel', 'https://api.dicebear.com/big-smile/svg?seed=daisy', 'https://api.dicebear.com/miniavs/svg?seed=minnie', 'https://api.dicebear.com/pixel-art/svg?seed=pixie', 'https://api.dicebear.com/bottts/svg?seed=botty-bot', 'https://api.dicebear.com/croodles/svg?seed=croodle-friend', 'https://api.dicebear.com/notionists/svg?seed=nina', 'https://api.dicebear.com/rings/svg?seed=ring-master', 'https://api.dicebear.com/lorelei/svg?seed=lorel'];
        const galleryGrid = document.getElementById('avatar-gallery'); const previewImage = document.getElementById('avatar-preview-image'); const saveButton = document.getElementById('save-avatar-button'); const hairFilter = document.getElementById('filter-hair'); const hairColorFilter = document.getElementById('filter-hair-color');
        let selectedAvatarUrl = savedAvatarUrl;
        const renderGallery = () => { galleryGrid.innerHTML = ''; const currentHairColor = hairColorFilter.value; const currentHairStyle = hairFilter.value; const filteredList = avatarList.filter(url => { if (!url.includes('adventurer')) return currentHairStyle === 'all' && currentHairColor === 'all'; const params = new URLSearchParams(url.split('?')[1]); const hairColorMatch = (currentHairColor === 'all') || (params.get('hairColor') === currentHairColor); let hairStyleMatch = true; if (currentHairStyle !== 'all') { const hairParam = params.get('hair'); if (hairParam) hairStyleMatch = hairParam.split(',').some(opt => opt.startsWith(currentHairStyle)); else hairStyleMatch = false; } return hairColorMatch && hairStyleMatch; }); filteredList.forEach(url => { const img = document.createElement('img'); img.src = url; img.alt = 'Avatar de la galería'; img.className = 'gallery-avatar-item'; if (url === selectedAvatarUrl) img.classList.add('selected'); img.addEventListener('click', () => { galleryGrid.querySelector('.selected')?.classList.remove('selected'); img.classList.add('selected'); selectedAvatarUrl = url; previewImage.src = selectedAvatarUrl; }); galleryGrid.appendChild(img); }); if (filteredList.length === 0) galleryGrid.innerHTML = '<p>No se encontraron avatares con estos filtros.</p>'; };
        renderGallery(); hairFilter.addEventListener('change', renderGallery); hairColorFilter.addEventListener('change', renderGallery);
        saveButton.addEventListener('click', () => { if (auth.currentUser && selectedAvatarUrl) { const originalButtonText = saveButton.textContent; saveButton.disabled = true; saveButton.textContent = 'Guardando...'; db.ref('users/' + auth.currentUser.uid + '/avatar').set(selectedAvatarUrl).then(() => { saveButton.textContent = '¡Guardado!'; setTimeout(() => { saveButton.textContent = originalButtonText; saveButton.disabled = false; }, 2000); }).catch(error => { console.error('Error al guardar el avatar:', error); alert('Hubo un error al guardar.'); saveButton.textContent = originalButtonText; saveButton.disabled = false; }); } });
        previewImage.src = savedAvatarUrl;
    }

    // BORRA TODA LA FUNCIÓN loadCommunityPage Y REEMPLÁZALA CON ESTA VERSIÓN COMPLETA

    async function loadCommunityPage() {
        // --- 1. REFERENCIAS A ELEMENTOS ---
        const elements = {
            chatNavList: document.getElementById('chat-nav-list'),
            sidebarTitle: document.getElementById('sidebar-title'),
            findFriendsBtn: document.getElementById('find-friends-btn'),
            sidebarContent: document.getElementById('sidebar-content'),
            friendsList: document.getElementById('friends-list'),
            requestsList: document.getElementById('requests-list'),
            allUsersList: document.getElementById('all-users-list'),
            generalChatUserList: document.getElementById('general-chat-user-list'),
            groupsList: document.getElementById('groups-list'),
            chatView: document.getElementById('chat-view'),
            noChatSelectedView: document.getElementById('no-chat-selected-view'),
            chatTitle: document.getElementById('chat-title'),
            chatMessagesContainer: document.getElementById('chat-messages-container'),
            chatForm: document.getElementById('chat-form'),
            chatMessageInput: document.getElementById('chatMessageInput'),
            createGroupBtn: document.getElementById('create-group-btn'),
            createGroupModal: document.getElementById('create-group-modal'),
            createGroupForm: document.getElementById('create-group-form'),
            groupNameInput: document.getElementById('group-name-input'),
            groupFriendSelector: document.getElementById('group-friend-selector'),
            cancelGroupCreationBtn: document.getElementById('cancel-group-creation-btn'),
            groupSettingsModal: document.getElementById('group-settings-modal'),
            settingsGroupName: document.getElementById('settings-group-name'),
            groupMembersList: document.getElementById('group-members-list'),
            leaveGroupBtn: document.getElementById('leave-group-btn'),
            deleteGroupBtn: document.getElementById('delete-group-btn'),
            closeSettingsModalBtn: document.getElementById('close-settings-modal-btn'),
            addMembersBtn: document.getElementById('add-members-btn'),
            addMembersModal: document.getElementById('add-members-modal'),
            addFriendSelector: document.getElementById('add-friend-selector'),
            cancelAddMembersBtn: document.getElementById('cancel-add-members-btn'),
            confirmAddMembersBtn: document.getElementById('confirm-add-members-btn')
        };
        let allUsers = {}, userStatuses = {}, userGroups = {}, activeChat = { type: 'general', id: 'general' }, currentChatListener = null, activeSettingsGroupId = null;

        // --- 2. FUNCIONES DE LÓGICA Y RENDERIZADO (COMPLETAS) ---

        const renderChatNav = () => {
            elements.chatNavList.innerHTML = `
            <li class="chat-nav-item ${activeChat.id === 'general' ? 'active' : ''}" data-type="general" data-id="general"><div class="avatar-emoji">💬</div><span>General</span></li>
            <li class="chat-nav-item" data-type="groups"><div class="avatar-emoji">🏠</div><span>Grupos</span></li>
            <li class="chat-nav-item" data-type="friends"><div class="avatar-emoji">👥</div><span>Amigos</span></li>
            <li class="chat-nav-item" data-type="requests"><div class="avatar-emoji">📥</div><span>Solicitudes</span></li>
            <hr class="nav-separator">
        `;
            if (currentUserData.friends) {
                Object.keys(currentUserData.friends).forEach(friendId => {
                    const friend = allUsers[friendId];
                    if (friend) {
                        const isActive = activeChat.type === 'private' && activeChat.id === friendId;
                        const li = document.createElement('li');
                        li.className = `chat-nav-item ${isActive ? 'active' : ''}`;
                        li.dataset.type = 'private';
                        li.dataset.id = friendId;
                        li.innerHTML = `<img src="${friend.avatar}" class="avatar-image size-small"><span>${friend.username}</span>`;
                        elements.chatNavList.appendChild(li);
                    }
                });
            }
        };

        const renderUserListItem = (uid, userData, type) => {
            const user = { ...userData, uid };
            const li = document.createElement('li');
            li.className = 'user-list-item';
            li.dataset.uid = uid;
            const isOnline = userStatuses[uid]?.state === 'online';
            const statusClass = isOnline ? 'online' : '';
            const isFriend = currentUserData.friends?.[uid];
            const requestSent = currentUserData.friendRequests?.sent?.[uid];
            const requestReceived = currentUserData.friendRequests?.received?.[uid];
            let buttons = '';
            if (type === 'friends') { buttons = `<div class="action-buttons"><button class="friend-options-btn" data-uid="${uid}">⋮</button></div>`; }
            else if (type === 'requests') { buttons = `<div class="action-buttons"><button class="accept-btn" data-uid="${uid}">✔️</button><button class="reject-btn" data-uid="${uid}">❌</button></div>`; }
            else if (type === 'all' && uid !== currentUserData.uid && !isFriend && !requestSent && !requestReceived) { buttons = `<div class="action-buttons"><button class="add-friend-btn" data-uid="${uid}">➕</button></div>`; }
            li.innerHTML = `<div class="user-info"><div class="user-status ${statusClass}"></div><img src="${user.avatar}" class="avatar-image size-small"><span>${user.username}</span></div>${buttons}`;
            if (type === 'friends') { li.querySelector('.user-info').addEventListener('click', () => switchChat('private', uid)); }
            return li;
        };

        const renderSidebar = (view) => {
            elements.friendsList.classList.add('hidden');
            elements.requestsList.classList.add('hidden');
            elements.allUsersList.classList.add('hidden');
            elements.generalChatUserList.classList.add('hidden');
            elements.groupsList.classList.add('hidden');
            switch (view) {
                case 'groups':
                    elements.sidebarTitle.textContent = 'Grupos';
                    elements.groupsList.innerHTML = '';
                    elements.groupsList.classList.remove('hidden');
                    if (userGroups && Object.keys(userGroups).length > 0) {
                        Object.entries(userGroups).forEach(([groupId, group]) => {
                            const groupAvatar = group.name.substring(0, 2).toUpperCase();
                            const li = document.createElement('li');
                            li.className = 'user-list-item';
                            li.innerHTML = `<div class="user-info"><div class="avatar-emoji">${groupAvatar}</div><span>${group.name}</span></div><div class="action-buttons"><button class="group-settings-btn" data-groupid="${groupId}">⚙️</button></div>`;
                            li.querySelector('.user-info').addEventListener('click', () => switchChat('group', groupId));
                            elements.groupsList.appendChild(li);
                        });
                    } else { elements.groupsList.innerHTML = '<li>No perteneces a ningún grupo.</li>'; }
                    break;
                case 'friends':
                    elements.sidebarTitle.textContent = 'Amigos';
                    elements.friendsList.innerHTML = '';
                    elements.friendsList.classList.remove('hidden');
                    if (currentUserData.friends && Object.keys(currentUserData.friends).length > 0) { Object.keys(currentUserData.friends).forEach(friendId => { if (allUsers[friendId]) elements.friendsList.appendChild(renderUserListItem(friendId, allUsers[friendId], 'friends')); }); }
                    else { elements.friendsList.innerHTML = '<li>Aún no tienes amigos.</li>'; }
                    break;
                case 'requests':
                    elements.sidebarTitle.textContent = 'Solicitudes';
                    elements.requestsList.innerHTML = '';
                    elements.requestsList.classList.remove('hidden');
                    if (currentUserData.friendRequests?.received && Object.keys(currentUserData.friendRequests.received).length > 0) { Object.keys(currentUserData.friendRequests.received).forEach(senderId => { if (allUsers[senderId]) elements.requestsList.appendChild(renderUserListItem(senderId, allUsers[senderId], 'requests')); }); }
                    else { elements.requestsList.innerHTML = '<li>No tienes solicitudes pendientes.</li>'; }
                    break;
                case 'all':
                    elements.sidebarTitle.textContent = 'Buscar Amigos';
                    elements.allUsersList.innerHTML = '';
                    elements.allUsersList.classList.remove('hidden');
                    Object.entries(allUsers).forEach(([uid, user]) => elements.allUsersList.appendChild(renderUserListItem(uid, user, 'all')));
                    break;
                default:
                    elements.sidebarTitle.textContent = 'Chat General';
                    elements.generalChatUserList.innerHTML = '';
                    elements.generalChatUserList.classList.remove('hidden');
                    Object.entries(allUsers).forEach(([uid, user]) => {
                        const li = document.createElement('li');
                        const isOnline = userStatuses[uid]?.state === 'online';
                        li.innerHTML = `<div class="user-status ${isOnline ? 'online' : ''}"></div> <img src="${user.avatar}" class="avatar-image size-small"> <span>${user.username}</span>`;
                        elements.generalChatUserList.appendChild(li);
                    });
                    break;
            }
        };

        const switchChat = (type, id) => {
            if (currentChatListener) currentChatListener.off();
            elements.chatMessagesContainer.innerHTML = '';
            activeChat = { type, id };
            elements.chatView.classList.remove('hidden');
            elements.noChatSelectedView.classList.add('hidden');
            elements.findFriendsBtn.classList.add('hidden');
            let chatRef;
            if (type === 'general') { elements.chatTitle.textContent = '#general'; elements.chatMessageInput.placeholder = 'Escribe en #general...'; chatRef = db.ref('chats/general'); renderSidebar('general'); }
            else if (type === 'private' && allUsers[id]) { const friendData = allUsers[id]; elements.chatTitle.textContent = friendData.username; elements.chatMessageInput.placeholder = `Escribe a ${friendData.username}...`; const chatId = currentUserData.uid < id ? `${currentUserData.uid}_${id}` : `${id}_${currentUserData.uid}`; chatRef = db.ref(`privateChats/${chatId}`); renderSidebar('friends'); }
            else if (type === 'group' && userGroups[id]) { const groupData = userGroups[id]; elements.chatTitle.textContent = groupData.name; elements.chatMessageInput.placeholder = `Escribe en ${groupData.name}...`; chatRef = db.ref(`groupChats/${id}`); renderSidebar('groups'); }
            else { elements.chatView.classList.add('hidden'); elements.noChatSelectedView.classList.remove('hidden'); return; }
            if (chatRef) { currentChatListener = chatRef.limitToLast(100); currentChatListener.on('child_added', snapshot => renderMessage(snapshot)); }
            renderChatNav();
        };

        const renderMessage = (snapshot) => {
            const msg = snapshot.val();
            if (!msg || !allUsers[msg.userId]) return;
            const sender = allUsers[msg.userId];
            const div = document.createElement('div');
            div.className = 'chat-message';
            if (msg.userId === currentUserData.uid) div.classList.add('own-message');
            const time = new Date(msg.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            div.innerHTML = `<img class="avatar-image size-small" src="${sender.avatar}" alt="${sender.username}"><div class="message-content"><p><strong class="message-author">${sender.username}</strong> <span class="message-time">${time}</span></p><p class="message-text">${msg.text}</p></div>`;
            elements.chatMessagesContainer.appendChild(div);
            elements.chatMessagesContainer.scrollTop = elements.chatMessagesContainer.scrollHeight;
        };

        const handleFriendRequest = (targetUid, action) => {
            const myUid = currentUserData.uid;
            const updates = {};
            if (action === 'send') { updates[`users/${myUid}/friendRequests/sent/${targetUid}`] = true; updates[`users/${targetUid}/friendRequests/received/${myUid}`] = true; }
            else if (action === 'accept') { updates[`users/${myUid}/friends/${targetUid}`] = true; updates[`users/${targetUid}/friends/${myUid}`] = true; updates[`users/${myUid}/friendRequests/received/${targetUid}`] = null; updates[`users/${targetUid}/friendRequests/sent/${myUid}`] = null; }
            else if (action === 'reject') { updates[`users/${myUid}/friendRequests/received/${targetUid}`] = null; updates[`users/${targetUid}/friendRequests/sent/${myUid}`] = null; }
            db.ref().update(updates);
        };

        const deleteFriend = (friendUid) => {
            if (!confirm(`¿Estás seguro de que quieres eliminar a ${allUsers[friendUid].username} de tus amigos?`)) return;
            const updates = {};
            updates[`users/${currentUserData.uid}/friends/${friendUid}`] = null;
            updates[`users/${friendUid}/friends/${currentUserData.uid}`] = null;
            db.ref().update(updates).then(() => { if (activeChat.type === 'private' && activeChat.id === friendUid) { switchChat('general', 'general'); } });
        };

        const openGroupSettingsModal = (groupId) => {
            activeSettingsGroupId = groupId;
            const group = userGroups[groupId];
            if (!group) return;
            elements.settingsGroupName.textContent = `Ajustes de "${group.name}"`;
            elements.groupMembersList.innerHTML = '';
            const amICreator = group.createdBy === currentUserData.uid;
            Object.keys(group.members).forEach(memberId => {
                const member = allUsers[memberId];
                if (member) {
                    const li = document.createElement('li');
                    li.className = 'user-list-item';
                    let removeBtn = '';
                    if (amICreator && memberId !== currentUserData.uid) { removeBtn = `<button class="remove-member-btn" data-uid="${memberId}">Eliminar</button>`; }
                    li.innerHTML = `<div class="user-info"><img src="${member.avatar}" class="avatar-image size-small"><span>${member.username} ${group.createdBy === memberId ? '(Creador)' : ''}</span></div>${removeBtn}`;
                    elements.groupMembersList.appendChild(li);
                }
            });
            elements.addMembersBtn.classList.toggle('hidden', !amICreator);
            elements.deleteGroupBtn.classList.toggle('hidden', !amICreator);
            elements.groupSettingsModal.classList.remove('hidden');
        };

        // --- 3. EVENT LISTENERS ---
        elements.chatNavList.addEventListener('click', (e) => {
            const navItem = e.target.closest('.chat-nav-item');
            if (!navItem) return;
            const { type, id } = navItem.dataset;
            if (document.querySelector('.chat-nav-item.active')) { document.querySelector('.chat-nav-item.active').classList.remove('active'); }
            navItem.classList.add('active');
            if (type === 'general' || type === 'private') { switchChat(type, id); }
            else if (type === 'groups') { elements.chatView.classList.add('hidden'); elements.noChatSelectedView.classList.remove('hidden'); elements.findFriendsBtn.classList.add('hidden'); renderSidebar('groups'); }
            else if (type === 'friends') { elements.chatView.classList.add('hidden'); elements.noChatSelectedView.classList.remove('hidden'); elements.findFriendsBtn.classList.remove('hidden'); renderSidebar('friends'); }
            else if (type === 'requests') { elements.chatView.classList.add('hidden'); elements.noChatSelectedView.classList.remove('hidden'); elements.findFriendsBtn.classList.add('hidden'); renderSidebar('requests'); }
        });

        elements.sidebarContent.addEventListener('click', (e) => {
            const target = e.target;
            if (target.matches('.group-settings-btn')) { openGroupSettingsModal(target.dataset.groupid); return; }
            if (!target.closest('.friend-options-menu') && !target.matches('.friend-options-btn')) { document.querySelectorAll('.friend-options-menu').forEach(menu => menu.remove()); }
            const uid = target.dataset.uid;
            if (!uid) return;
            if (target.matches('.add-friend-btn')) handleFriendRequest(uid, 'send');
            else if (target.matches('.accept-btn')) handleFriendRequest(uid, 'accept');
            else if (target.matches('.reject-btn')) handleFriendRequest(uid, 'reject');
            else if (target.matches('.friend-options-btn')) {
                document.querySelectorAll('.friend-options-menu').forEach(menu => menu.remove());
                const menu = document.createElement('div');
                menu.className = 'friend-options-menu';
                menu.innerHTML = `<button class="delete-friend-btn" data-uid="${uid}">Eliminar Amigo</button>`;
                target.closest('.user-list-item').appendChild(menu);
            } else if (target.matches('.delete-friend-btn')) { deleteFriend(uid); }
        });

        elements.findFriendsBtn.addEventListener('click', () => renderSidebar('all'));
        elements.chatForm.addEventListener('submit', (e) => { e.preventDefault(); const text = elements.chatMessageInput.value.trim(); if (!text) return; const message = { userId: currentUserData.uid, text: text, timestamp: firebase.database.ServerValue.TIMESTAMP }; let messageRef; if (activeChat.type === 'general') messageRef = db.ref('chats/general').push(); else if (activeChat.type === 'private') { const chatId = currentUserData.uid < activeChat.id ? `${currentUserData.uid}_${activeChat.id}` : `${activeChat.id}_${currentUserData.uid}`; messageRef = db.ref(`privateChats/${chatId}`).push(); } else if (activeChat.type === 'group') messageRef = db.ref(`groupChats/${activeChat.id}`).push(); if (messageRef) messageRef.set(message); elements.chatMessageInput.value = ''; });
        elements.createGroupBtn.addEventListener('click', () => {
            elements.groupFriendSelector.innerHTML = '';
            if (currentUserData.friends) {
                Object.keys(currentUserData.friends).forEach(friendId => {
                    const friend = allUsers[friendId];
                    if (friend) { const li = document.createElement('li'); li.className = 'user-list-item'; li.innerHTML = `<label><input type="checkbox" data-uid="${friendId}"><img src="${friend.avatar}" class="avatar-image size-small"><span>${friend.username}</span></label>`; elements.groupFriendSelector.appendChild(li); }
                });
            } else { elements.groupFriendSelector.innerHTML = '<li>No tienes amigos para añadir.</li>'; }
            elements.createGroupModal.classList.remove('hidden');
        });
        elements.cancelGroupCreationBtn.addEventListener('click', () => { elements.createGroupModal.classList.add('hidden'); elements.createGroupForm.reset(); });
        elements.createGroupForm.addEventListener('submit', async (e) => {
            e.preventDefault(); const groupName = elements.groupNameInput.value.trim(); if (!groupName) return;
            const selectedFriends = elements.groupFriendSelector.querySelectorAll('input[type="checkbox"]:checked');
            const memberIds = { [currentUserData.uid]: true }; selectedFriends.forEach(checkbox => memberIds[checkbox.dataset.uid] = true);
            const newGroupData = { name: groupName, createdAt: firebase.database.ServerValue.TIMESTAMP, createdBy: currentUserData.uid, members: memberIds };
            try {
                const newGroupRef = await db.ref('groups').push(newGroupData);
                const newGroupId = newGroupRef.key;
                const userUpdatePromises = Object.keys(memberIds).map(uid => db.ref(`users/${uid}/groups/${newGroupId}`).set(true));
                await Promise.all(userUpdatePromises);
                elements.createGroupModal.classList.add('hidden');
                elements.createGroupForm.reset();
            } catch (error) { console.error("Error creando el grupo:", error); alert("No se pudo crear el grupo."); }
        });
        elements.closeSettingsModalBtn.addEventListener('click', () => { elements.groupSettingsModal.classList.add('hidden'); activeSettingsGroupId = null; });
        elements.leaveGroupBtn.addEventListener('click', () => {
            if (!activeSettingsGroupId || !confirm("¿Estás seguro de que quieres abandonar este grupo?")) return;
            db.ref(`users/${currentUserData.uid}/groups/${activeSettingsGroupId}`).set(null).then(() => {
                db.ref(`/groups/${activeSettingsGroupId}/members/${currentUserData.uid}`).set(null);
                elements.groupSettingsModal.classList.add('hidden');
            });
        });
        elements.deleteGroupBtn.addEventListener('click', async () => {
            if (!activeSettingsGroupId || !userGroups[activeSettingsGroupId] || userGroups[activeSettingsGroupId].createdBy !== currentUserData.uid || !confirm("¿ESTÁS COMPLETAMENTE SEGURO? Esta acción es irreversible.")) return;
            const groupToDelete = userGroups[activeSettingsGroupId]; const updates = {}; updates[`/groups/${activeSettingsGroupId}`] = null; updates[`/groupChats/${activeSettingsGroupId}`] = null;
            const memberRemovalPromises = Object.keys(groupToDelete.members).map(uid => db.ref(`users/${uid}/groups/${activeSettingsGroupId}`).set(null));
            try { await Promise.all(memberRemovalPromises); await db.ref().update(updates); elements.groupSettingsModal.classList.add('hidden'); } catch (error) { console.error("Error al eliminar el grupo:", error); }
        });
        elements.groupMembersList.addEventListener('click', (e) => {
            if (e.target.matches('.remove-member-btn')) {
                const memberIdToRemove = e.target.dataset.uid; if (!activeSettingsGroupId || !memberIdToRemove || !confirm(`¿Seguro que quieres eliminar a este miembro del grupo?`)) return;
                db.ref(`users/${memberIdToRemove}/groups/${activeSettingsGroupId}`).set(null).then(() => {
                    db.ref(`/groups/${activeSettingsGroupId}/members/${memberIdToRemove}`).set(null);
                    openGroupSettingsModal(activeSettingsGroupId);
                });
            }
        });
        elements.addMembersBtn.addEventListener('click', () => {
            const group = userGroups[activeSettingsGroupId]; if (!group) return; elements.addFriendSelector.innerHTML = '';
            Object.keys(currentUserData.friends || {}).forEach(friendId => {
                if (!group.members[friendId]) { const friend = allUsers[friendId]; if (friend) { const li = document.createElement('li'); li.className = 'user-list-item'; li.innerHTML = `<label><input type="checkbox" data-uid="${friendId}"><img src="${friend.avatar}" class="avatar-image size-small"><span>${friend.username}</span></label>`; elements.addFriendSelector.appendChild(li); } }
            });
            if (elements.addFriendSelector.innerHTML === '') { elements.addFriendSelector.innerHTML = '<li>No tienes más amigos para añadir.</li>'; }
            elements.addMembersModal.classList.remove('hidden');
        });
        elements.cancelAddMembersBtn.addEventListener('click', () => elements.addMembersModal.classList.add('hidden'));
        elements.confirmAddMembersBtn.addEventListener('click', async () => {
            const selectedFriends = elements.addFriendSelector.querySelectorAll('input[type="checkbox"]:checked'); if (selectedFriends.length === 0) return;
            const updates = {}; const userUpdatePromises = [];
            selectedFriends.forEach(checkbox => { const uid = checkbox.dataset.uid; updates[`/groups/${activeSettingsGroupId}/members/${uid}`] = true; userUpdatePromises.push(db.ref(`users/${uid}/groups/${activeSettingsGroupId}`).set(true)); });
            try { await Promise.all(userUpdatePromises); await db.ref().update(updates); elements.addMembersModal.classList.add('hidden'); openGroupSettingsModal(activeSettingsGroupId); } catch (error) { console.error("Error añadiendo miembros:", error); }
        });

        // --- 4. CARGA INICIAL Y LISTENERS DE ACTUALIZACIÓN EN TIEMPO REAL ---
        const initialUserDataSnapshot = await db.ref(`users/${currentUserData.uid}`).once('value');
        currentUserData = { uid: currentUserData.uid, ...initialUserDataSnapshot.val() };
        const [usersSnapshot, statusSnapshot] = await Promise.all([db.ref('users').once('value'), db.ref('status').once('value')]);
        allUsers = usersSnapshot.val() || {}; userStatuses = statusSnapshot.val() || {};
        db.ref('users').on('value', snapshot => { allUsers = snapshot.val() || {}; });
        db.ref('status').on('value', snapshot => { userStatuses = snapshot.val() || {}; if (activeChat.type === 'general') { renderSidebar('general'); } });
        db.ref(`users/${currentUserData.uid}`).on('value', async (userSnapshot) => {
            if (!userSnapshot.exists()) return;
            currentUserData = { uid: currentUserData.uid, ...userSnapshot.val() };
            const groupRefs = currentUserData.groups ? Object.keys(currentUserData.groups) : [];
            const groupPromises = groupRefs.map(id => db.ref(`groups/${id}`).once('value'));
            const groupSnapshots = await Promise.all(groupPromises);
            const oldActiveGroup = activeChat.type === 'group' ? activeChat.id : null;
            userGroups = {};
            groupSnapshots.forEach(snap => { if (snap.exists()) { userGroups[snap.key] = snap.val(); } else { db.ref(`users/${currentUserData.uid}/groups/${snap.key}`).remove(); } });
            if (oldActiveGroup && !userGroups[oldActiveGroup]) { switchChat('general', 'general'); }
            renderChatNav();
            const activeSidebar = document.querySelector('#sidebar-content > ul:not(.hidden)');
            if (activeSidebar) { renderSidebar(activeSidebar.id.replace('-list', '')); }
        });
        switchChat('general', 'general');
    }

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentUserData) { db.ref('/status/' + currentUserData.uid).set({ state: 'offline', last_changed: firebase.database.ServerValue.TIMESTAMP }).then(() => auth.signOut()); }
            else { auth.signOut(); }
        });
    }
});