const firebaseConfig = {
    apiKey: "AIzaSyCk9Nbg3MIOUZdKcaMKfqorhMcqYPqRnDQ",
    authDomain: "huztiers.firebaseapp.com",
    projectId: "huztiers",
    storageBucket: "huztiers.firebasestorage.app",
    messagingSenderId: "25698955036",
    appId: "1:25698955036:web:805b518696bca0d829d4d9",
    measurementId: "G-WJ5BG12P4X"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Hashed version of "Huztiers)(1" (Hidden securely)
const CORRECT_PASSWORD_HASH = "8d3e18a9391a62d057aef4a54c9c1b3ee6f199e712a5db38927429188d8db262";

let isAdmin = false;
let currentGamemode = "home";
let currentSubView = "tiers";
let testerName = "";

const gamemodes = [
    { id: "crystal", name: "Crystal", icon: "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/end_crystal.png" },
    { id: "sword", name: "Sword", icon: "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/diamond_sword.png" },
    { id: "spearmace", name: "Spearmace", icon: "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/trident.png" },
    { id: "mace", name: "Mace", icon: "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.21/assets/minecraft/textures/item/mace.png" },
    { id: "cart", name: "Cart", icon: "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/tnt_minecart.png" },
    { id: "diamondsmp", name: "Diamond SMP", icon: "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/diamond_chestplate.png" },
    { id: "elytraspear", name: "Elytra Spear", icon: "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/elytra.png" },
    { id: "smp", name: "SMP", icon: "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/netherite_pickaxe.png" },
    { id: "uhc", name: "UHC", icon: "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/golden_apple.png" },
    { id: "shieldlessuhc", name: "Shieldless UHC", icon: "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/block/cobblestone.png" },
    { id: "diamondpot", name: "Diamond Pot", icon: "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/splash_potion.png" },
    { id: "nethpot", name: "Neth-Pot", icon: "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/lingering_potion.png" },
    { id: "overall", name: "Overall Leaderboard", icon: "🏆" }
];

const tierPoints = {
    "HT1": 60, "LT1": 45, "HT2": 30, "LT2": 20,
    "HT3": 10, "LT3": 6, "HT4": 4, "LT4": 3,
    "HT5": 2, "LT5": 1
};

const tiers = [
    { id: "HT1", label: "HT1", bg: "bg-red-950/40 border-red-800/60", badge: "bg-red-600 text-white shadow-red-900/50" },
    { id: "LT1", label: "LT1", bg: "bg-rose-950/30 border-rose-800/50", badge: "bg-rose-600 text-white shadow-rose-900/50" },
    { id: "HT2", label: "HT2", bg: "bg-orange-950/40 border-orange-800/60", badge: "bg-orange-600 text-white shadow-orange-900/50" },
    { id: "LT2", label: "LT2", bg: "bg-amber-950/30 border-amber-800/50", badge: "bg-amber-600 text-white shadow-amber-900/50" },
    { id: "HT3", label: "HT3", bg: "bg-yellow-950/30 border-yellow-800/50", badge: "bg-yellow-600 text-white shadow-yellow-900/50" },
    { id: "LT3", label: "LT3", bg: "bg-lime-950/30 border-lime-800/50", badge: "bg-lime-600 text-white shadow-lime-900/50" },
    { id: "HT4", label: "HT4", bg: "bg-emerald-950/40 border-emerald-800/60", badge: "bg-emerald-600 text-white shadow-emerald-900/50" },
    { id: "LT4", label: "LT4", bg: "bg-teal-950/30 border-teal-800/50", badge: "bg-teal-600 text-white shadow-teal-900/50" },
    { id: "HT5", label: "HT5", bg: "bg-sky-950/40 border-sky-800/60", badge: "bg-sky-600 text-white shadow-sky-900/50" },
    { id: "LT5", label: "LT5", bg: "bg-blue-950/30 border-blue-800/50", badge: "bg-blue-600 text-white shadow-blue-900/50" }
];

let tierData = {};
let playerRegions = {};
let onlineTesters = [];

function initTierData() {
    gamemodes.forEach(gm => {
        if (gm.id === "overall") return;
        tierData[gm.id] = {};
        tiers.forEach(t => { tierData[gm.id][t.id] = []; });
    });
}

async function loadFromCloud() {
    try {
        const docRef = db.collection("huztiers").doc("main_data");
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            const data = docSnap.data();
            tierData = data.tierData || {};
            playerRegions = data.playerRegions || {};
            onlineTesters = data.onlineTesters || [];
            gamemodes.forEach(gm => {
                if (gm.id === "overall") return;
                if (!tierData[gm.id]) tierData[gm.id] = {};
                tiers.forEach(t => { if (!tierData[gm.id][t.id]) tierData[gm.id][t.id] = []; });
            });
        } else {
            initTierData();
        }
    } catch (e) {
        initTierData();
    }
    renderGamemodeTabs();
    renderMainView();
}

async function saveToCloud() {
    try {
        await db.collection("huztiers").doc("main_data").set({
            tierData: tierData,
            playerRegions: playerRegions,
            onlineTesters: onlineTesters
        }, { merge: true });
    } catch (e) { console.error(e); }
}

function renderGamemodeTabs() {
    const container = document.getElementById("gamemodesTabs");
    if (!container) return;
    container.innerHTML = gamemodes.map(gm => {
        const isActive = gm.id === currentGamemode;
        let iconHtml = gm.icon.startsWith("http") ? `<img src="${gm.icon}" class="w-5 h-5 object-contain" style="image-rendering: pixelated;" onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/minecart.png';">` : `<span class="text-base">${gm.icon}</span>`;
        return `
            <button onclick="switchGamemode('${gm.id}')" class="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80'}">
                ${iconHtml}
                <span>${gm.name}</span>
            </button>
        `;
    }).join('');
}

function switchGamemode(id) {
    currentGamemode = id;
    currentSubView = "tiers";
    
    const homeBtn = document.getElementById("homeHeaderBtn");
    if (homeBtn) {
        if (id === "home") {
            homeBtn.className = "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition-all";
        } else {
            homeBtn.className = "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 text-slate-300 transition-all";
        }
    }

    const subViewToolbar = document.getElementById("subViewToolbar");
    if (id === "overall" || id === "home") {
        if (subViewToolbar) subViewToolbar.classList.add("hidden");
    } else {
        if (subViewToolbar) subViewToolbar.classList.remove("hidden");
        updateSubViewButtons();
    }

    const headerIcon = document.getElementById("currentGamemodeIcon");
    const titleEl = document.getElementById("currentGamemodeTitle");

    if (id === "home") {
        if (headerIcon) headerIcon.innerText = "🏠";
        if (titleEl) titleEl.innerText = "Home";
    } else {
        const gm = gamemodes.find(g => g.id === id);
        if (headerIcon) {
            if (gm.icon.startsWith("http")) {
                headerIcon.innerHTML = `<img src="${gm.icon}" class="w-7 h-7 object-contain" style="image-rendering: pixelated;" onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/minecart.png';">`;
            } else {
                headerIcon.innerText = gm.icon;
            }
        }
        if (titleEl) titleEl.innerText = gm.name;
    }
    
    renderGamemodeTabs();
    renderMainView();
}

function switchSubView(view) {
    currentSubView = view;
    updateSubViewButtons();
    renderMainView();
}

function updateSubViewButtons() {
    const btnTiers = document.getElementById("btnTierView");
    const btnTop10 = document.getElementById("btnTop10View");
    if (!btnTiers || !btnTop10) return;
    if (currentSubView === "tiers") {
        btnTiers.className = "px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white transition-all shadow";
        btnTop10.className = "px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all";
    } else {
        btnTop10.className = "px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white transition-all shadow";
        btnTiers.className = "px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all";
    }
}

function renderMainView() {
    if (currentGamemode === "home") {
        renderHomeView();
    } else if (currentGamemode === "overall") {
        renderOverallLeaderboard();
    } else if (currentSubView === "top10") {
        renderGamemodeTop10();
    } else {
        renderTierBoard();
    }
}

function getCalculatedOverallPlayers() {
    let playerStats = {};
    gamemodes.forEach(gm => {
        if (gm.id === "overall") return;
        const gmData = tierData[gm.id] || {};
        tiers.forEach(tier => {
            const players = gmData[tier.id] || [];
            const pts = tierPoints[tier.id] || 0;
            players.forEach(player => {
                if (!playerStats[player]) {
                    playerStats[player] = { name: player, totalPoints: 0, region: playerRegions[player] || "US", ranks: {} };
                }
                playerStats[player].totalPoints += pts;
                playerStats[player].ranks[gm.id] = tier.id;
            });
        });
    });
    return Object.values(playerStats).sort((a, b) => b.totalPoints - a.totalPoints);
}

function renderHomeView() {
    const container = document.getElementById("mainViewContainer");
    if (!container) return;
    const sortedPlayers = getCalculatedOverallPlayers();
    const top3 = sortedPlayers.slice(0, 3);

    let top3Html = "";
    if (top3.length === 0) {
        top3Html = `<div class="p-8 text-center text-slate-500 text-xs italic bg-slate-900/40 rounded-2xl border border-slate-800">No ranked players yet. Add players to gamemode tiers to populate the Top 3 champions!</div>`;
    } else {
        top3Html = top3.map((p, idx) => {
            let rankRibbon = idx === 0 ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20" : idx === 1 ? "bg-slate-300 text-slate-950 font-black shadow-lg shadow-slate-300/20" : "bg-amber-700 text-white font-black shadow-lg shadow-amber-700/20";
            let placeLabel = idx === 0 ? "1st Place 🏆" : idx === 1 ? "2nd Place 🥈" : "3rd Place 🥉";

            return `
                <div class="flex items-center justify-between p-4 bg-slate-900/70 border border-slate-800 rounded-2xl gap-4 hover:border-slate-700 transition-all">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-12 flex items-center justify-center rounded-xl ${rankRibbon} text-base font-black shrink-0">#${idx + 1}</div>
                        <div class="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                            <img src="https://skinrender.dev/render/${encodeURIComponent(p.name)}/face?size=100" class="w-full h-full object-cover" style="image-rendering: pixelated;" onerror="this.onerror=null; this.src='https://skinrender.dev/render/MHF_Steve/face?size=100';">
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h4 class="text-sm font-extrabold text-white tracking-wide">${p.name}</h4>
                                <span class="text-xs font-bold text-slate-400">${p.region}</span>
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">${placeLabel}</span>
                            </div>
                            <p class="text-xs text-slate-400 font-medium">Score: ${p.totalPoints} pts</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    let adminPanelHtml = "";
    if (isAdmin) {
        let gamemodeOptionsHtml = gamemodes.filter(g => g.id !== "overall").map(g => `<option value="${g.id}">${g.name}</option>`).join('');
        let tierOptionsHtml = tiers.map(t => `<option value="${t.id}">${t.label}</option>`).join('');

        adminPanelHtml = `
            <div class="p-6 bg-slate-900/90 border border-indigo-500/30 rounded-3xl space-y-4 shadow-xl">
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 class="text-sm font-black text-white flex items-center gap-2"><span>⚡</span> Quick Admin Management Panel</h3>
                    <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">Active Manager</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div class="space-y-1.5">
                        <label class="text-[10px] font-bold text-slate-400 uppercase">Minecraft IGN</label>
                        <input type="text" id="adminPanelUsername" placeholder="e.g. ThatROck" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500">
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-[10px] font-bold text-slate-400 uppercase">Gamemode</label>
                        <select id="adminPanelGamemode" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500">
                            ${gamemodeOptionsHtml}
                        </select>
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-[10px] font-bold text-slate-400 uppercase">Previous Tier (Optional)</label>
                        <select id="adminPanelPrevTier" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500">
                            <option value="">-- None / Direct Add --</option>
                            ${tierOptionsHtml}
                        </select>
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-[10px] font-bold text-slate-400 uppercase">New Tier</label>
                        <select id="adminPanelNewTier" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500">
                            ${tierOptionsHtml}
                        </select>
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-[10px] font-bold text-slate-400 uppercase">Region</label>
                        <select id="adminPanelRegion" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500">
                            <option value="US">US</option>
                            <option value="EU">EU</option>
                            <option value="AS">AS</option>
                            <option value="OCE">OCE</option>
                            <option value="SA">SA</option>
                        </select>
                    </div>
                </div>
                <div class="flex justify-end pt-2">
                    <button onclick="handleAdminPanelUpdate()" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all">Update / Move Player Rank</button>
                </div>
            </div>
        `;
    }

    let testersHtml = onlineTesters.length === 0 ? `<p class="text-xs text-slate-500 italic">No testers are currently online.</p>` : onlineTesters.map(tName => `
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div class="flex items-center gap-2.5">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-xs font-bold text-slate-200">${tName}</span>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Ready to test</span>
        </div>
    `).join('');

    let testerActionHtml = isAdmin ? (testerName ? `
        <div class="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between">
            <div class="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <span>🟢 Testing Status Active as:</span> <strong>${testerName}</strong>
            </div>
            <button onclick="toggleTesterStatus(false)" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all">Go Offline</button>
        </div>
    ` : `
        <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <input type="text" id="testerInputName" placeholder="Enter your tester Minecraft IGN..." class="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500">
            <button onclick="toggleTesterStatus(true)" class="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all">Set Online</button>
        </div>
    `) : `<p class="text-[11px] text-slate-500 italic">Unlock Admin Mode using the bottom-left lock button to declare yourself online as a tester.</p>`;

    container.className = "space-y-6";
    container.innerHTML = `
        <div class="space-y-6">
            ${adminPanelHtml}
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 space-y-6">
                    <div class="bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-950 border border-indigo-500/20 rounded-3xl p-8 space-y-4">
                        <h2 class="text-3xl font-black tracking-tight text-white">Welcome to Huztiers</h2>
                        <p class="text-sm text-slate-400 max-w-xl">Competitive Minecraft rankings, gamemode tier lists, and cloud-synced leaderboards.</p>
                        <div class="pt-2 flex flex-wrap gap-3">
                            <button onclick="switchGamemode('crystal')" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all">Explore Gamemodes</button>
                            <button onclick="switchGamemode('overall')" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center gap-2"><span>🏆</span> View Leaderboard</button>
                        </div>
                    </div>
                    <div class="space-y-4">
                        <h3 class="text-lg font-extrabold text-white px-2 flex items-center gap-2"><span>🔥</span> Current Top 3 Champions</h3>
                        <div class="space-y-3">
                            ${top3Html}
                        </div>
                    </div>
                </div>
                <div class="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                    <div class="space-y-4">
                        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                            <h3 class="text-sm font-extrabold text-white flex items-center gap-2"><span>🟢</span> Active Testers Online</h3>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400">${onlineTesters.length} online</span>
                        </div>
                        <div class="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                            ${testersHtml}
                        </div>
                    </div>
                    <div class="pt-4 border-t border-slate-800/80 space-y-2">
                        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tester Status Control</p>
                        ${testerActionHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function handleAdminPanelUpdate() {
    if (!isAdmin) return;
    const usernameInput = document.getElementById("adminPanelUsername");
    const gmSelect = document.getElementById("adminPanelGamemode");
    const prevTierSelect = document.getElementById("adminPanelPrevTier");
    const newTierSelect = document.getElementById("adminPanelNewTier");
    const regionSelect = document.getElementById("adminPanelRegion");

    if (!usernameInput || !gmSelect || !newTierSelect || !regionSelect) return;

    const username = usernameInput.value.trim();
    const gmId = gmSelect.value;
    const prevTier = prevTierSelect ? prevTierSelect.value : "";
    const newTier = newTierSelect.value;
    const region = regionSelect.value;

    if (!username) {
        alert("Please enter a valid Minecraft username!");
        return;
    }

    if (!tierData[gmId]) tierData[gmId] = {};
    tiers.forEach(t => {
        if (!tierData[gmId][t.id]) tierData[gmId][t.id] = [];
    });

    if (prevTier && tierData[gmId][prevTier]) {
        tierData[gmId][prevTier] = tierData[gmId][prevTier].filter(p => p.toLowerCase() !== username.toLowerCase());
    } else {
        tiers.forEach(t => {
            tierData[gmId][t.id] = tierData[gmId][t.id].filter(p => p.toLowerCase() !== username.toLowerCase());
        });
    }

    if (!tierData[gmId][newTier].includes(username)) {
        tierData[gmId][newTier].push(username);
    }

    playerRegions[username] = region;

    await saveToCloud();
    renderMainView();
    usernameInput.value = "";
    alert(`Successfully updated ${username} to ${newTier} in ${gmId}!`);
}

async function toggleTesterStatus(goingOnline) {
    if (!isAdmin) return;
    if (goingOnline) {
        const nameInput = document.getElementById("testerInputName");
        const name = nameInput ? nameInput.value.trim() : "";
        if (!name) { alert("Please enter your tester Minecraft IGN!"); return; }
        testerName = name;
        if (!onlineTesters.includes(testerName)) onlineTesters.push(testerName);
    } else {
        if (testerName) {
            onlineTesters = onlineTesters.filter(n => n !== testerName);
            testerName = "";
        }
    }
    await saveToCloud();
    renderMainView();
}

function renderTierBoard() {
    const container = document.getElementById("mainViewContainer");
    if (!container) return;
    const currentGmObj = tierData[currentGamemode] || {};

    container.className = "space-y-3";
    container.innerHTML = tiers.map(tier => {
        const players = currentGmObj[tier.id] || [];
        const verticalChars = tier.label.split('').map(c => `<span class="block leading-none">${c}</span>`).join('');
        const playerChipsHtml = players.map(player => {
            const draggableAttr = isAdmin ? `draggable="true" ondragstart="dragStart(event, '${player}', '${tier.id}')"` : '';
            const removeBtnHtml = isAdmin ? `<button onclick="removePlayer('${tier.id}', '${player}')" class="ml-2 text-slate-500 hover:text-rose-400 font-normal px-1">×</button>` : '';
            return `
                <div class="player-chip flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/60 text-slate-200 text-xs font-bold shadow" ${draggableAttr}>
                    <span class="tracking-wide">${player}</span>
                    ${removeBtnHtml}
                </div>
            `;
        }).join('');
        const emptyMessageHtml = (players.length === 0 && isAdmin) ? `<span class="text-xs text-slate-600 italic select-none pointer-events-none">Drop players here...</span>` : '';

        return `
            <div class="flex rounded-2xl border ${tier.bg} overflow-hidden shadow-md transition-all">
                <div class="w-16 flex flex-col items-center justify-center py-4 ${tier.badge} font-black text-sm tracking-widest shrink-0 shadow-inner text-center">
                    <div class="flex flex-col items-center gap-1">${verticalChars}</div>
                </div>
                <div class="flex-1 p-3 flex flex-wrap items-center gap-2 min-h-[85px] drop-zone" ondragover="allowDrop(event)" ondragleave="dragLeave(event)" ondrop="dropPlayer(event, '${tier.id}')">
                    ${playerChipsHtml}
                    ${emptyMessageHtml}
                </div>
            </div>
        `;
    }).join('');
}

function renderGamemodeTop10() {
    const container = document.getElementById("mainViewContainer");
    if (!container) return;
    const currentGmObj = tierData[currentGamemode] || {};
    let playersList = [];

    tiers.forEach(tier => {
        const players = currentGmObj[tier.id] || [];
        const pts = tierPoints[tier.id] || 0;
        players.forEach(name => {
            playersList.push({ name, tierId: tier.id, score: pts, region: playerRegions[name] || "US" });
        });
    });

    playersList.sort((a, b) => b.score - a.score);
    let top10 = playersList.slice(0, 10);

    if (top10.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-slate-500 text-xs italic bg-slate-900/40 rounded-2xl border border-slate-800">No players ranked in this gamemode yet!</div>`;
        return;
    }

    container.className = "space-y-3";
    container.innerHTML = top10.map((p, idx) => {
        let rankRibbon = idx === 0 ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20" : idx === 1 ? "bg-slate-300 text-slate-950 font-black shadow-lg shadow-slate-300/20" : idx === 2 ? "bg-amber-700 text-white font-black shadow-lg shadow-amber-700/20" : "bg-slate-800 text-slate-300 border-slate-700";
        return `
            <div class="flex items-center justify-between p-4 bg-slate-900/70 border border-slate-800 rounded-2xl gap-4 hover:border-slate-700 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-12 flex items-center justify-center rounded-xl ${rankRibbon} text-base font-black shrink-0">#${idx + 1}</div>
                    <div>
                        <div class="flex items-center gap-2">
                            <h4 class="text-sm font-extrabold text-white tracking-wide">${p.name}</h4>
                            <span class="text-xs font-bold text-slate-400">${p.region}</span>
                        </div>
                        <p class="text-xs text-slate-400 font-medium">Score: ${p.score} pts</p>
                    </div>
                </div>
                <span class="px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-black text-xs">Tier: ${p.tierId}</span>
            </div>
        `;
    }).join('');
}

function renderOverallLeaderboard() {
    const container = document.getElementById("mainViewContainer");
    if (!container) return;
    let sortedPlayers = getCalculatedOverallPlayers();
    let top100 = sortedPlayers.slice(0, 100);

    if (top100.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-slate-500 text-xs italic bg-slate-900/40 rounded-2xl border border-slate-800">No player rankings recorded yet. Add players to gamemode tiers to populate the overall leaderboard!</div>`;
        return;
    }

    container.className = "space-y-3";
    container.innerHTML = top100.map((p, idx) => {
        let rankRibbon = idx === 0 ? "bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20" : idx === 1 ? "bg-slate-300 text-slate-950 font-black shadow-lg shadow-slate-300/20" : idx === 2 ? "bg-amber-700 text-white font-black shadow-lg shadow-amber-700/20" : "bg-slate-800 text-slate-300 border-slate-700";
        let gamemodesBadgesHtml = gamemodes.filter(g => g.id !== "overall").map(gm => {
            const playerTier = p.ranks[gm.id];
            if (!playerTier) return '';
            let iconHtml = gm.icon.startsWith("http") ? `<img src="${gm.icon}" class="w-5 h-5 object-contain mb-0.5" style="image-rendering: pixelated;" onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/minecart.png';">` : `<span class="text-sm mb-0.5">${gm.icon}</span>`;
            return `
                <div class="flex flex-col items-center justify-center p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] min-w-[38px]">
                    ${iconHtml}
                    <span class="font-black text-indigo-300 text-[9px] mt-0.5">${playerTier}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="flex flex-col md:flex-row items-center justify-between p-4 bg-slate-900/70 border border-slate-800 rounded-2xl gap-4 hover:border-slate-700 transition-all">
                <div class="flex items-center gap-4 w-full md:w-auto">
                    <div class="w-14 h-12 flex items-center justify-center rounded-xl ${rankRibbon} text-base font-black shrink-0">#${idx + 1}</div>
                    <div>
                        <div class="flex items-center gap-2">
                            <h4 class="text-sm font-extrabold text-white tracking-wide">${p.name}</h4>
                            <span class="text-xs font-bold text-slate-400">${p.region}</span>
                        </div>
                        <p class="text-xs text-slate-400 font-medium">Score: ${p.totalPoints} pts</p>
                    </div>
                </div>
                <div class="flex items-center gap-1.5 flex-wrap justify-end">
                    ${gamemodesBadgesHtml || '<span class="text-xs text-slate-500 italic">No rankings yet</span>'}
                </div>
            </div>
        `;
    }).join('');
}

let draggedPlayer = null;
let sourceTier = null;

function dragStart(event, playerName, tId) {
    if (!isAdmin) return;
    draggedPlayer = playerName;
    sourceTier = tId;
}

function allowDrop(event) {
    if (!isAdmin || currentGamemode === "overall" || currentGamemode === "home") return;
    event.preventDefault();
}

function dragLeave(event) {}

async function dropPlayer(event, targetTierId) {
    if (!isAdmin || currentGamemode === "overall" || currentGamemode === "home") return;
    event.preventDefault();
    if (!draggedPlayer || !sourceTier) return;

    const sourceList = tierData[currentGamemode][sourceTier];
    const index = sourceList.indexOf(draggedPlayer);
    if (index > -1) sourceList.splice(index, 1);

    const targetList = tierData[currentGamemode][targetTierId];
    if (!targetList.includes(draggedPlayer)) targetList.push(draggedPlayer);

    await saveToCloud();
    renderMainView();
    draggedPlayer = null;
    sourceTier = null;
}

function openSearchModal() {
    const modal = document.getElementById("searchModal");
    const input = document.getElementById("searchPlayerInput");
    const results = document.getElementById("searchResultsContainer");
    if (modal) modal.classList.remove("hidden");
    if (input) { input.value = ""; input.focus(); }
    if (results) results.innerHTML = '<p class="text-xs text-slate-500 text-center py-6">Type a player\'s username above to view their tiers across all gamemodes.</p>';
}

function closeSearchModal() {
    const modal = document.getElementById("searchModal");
    if (modal) modal.classList.add("hidden");
}

function performPlayerSearch() {
    const input = document.getElementById("searchPlayerInput");
    const resultsContainer = document.getElementById("searchResultsContainer");
    if (!input || !resultsContainer) return;
    const query = input.value.trim().toLowerCase();
    
    if (!query) {
        resultsContainer.innerHTML = '<p class="text-xs text-rose-400 text-center py-4">Please enter a valid username.</p>';
        return;
    }

    let foundRanks = [];
    let totalPlayerPoints = 0;
    let actualPlayerName = "";

    gamemodes.forEach(gm => {
        if (gm.id === "overall") return;
        const gmData = tierData[gm.id] || {};
        tiers.forEach(tier => {
            const players = gmData[tier.id] || [];
            if (players.some(p => p.toLowerCase() === query)) {
                if (!actualPlayerName) actualPlayerName = players.find(p => p.toLowerCase() === query);
                const pts = tierPoints[tier.id] || 0;
                totalPlayerPoints += pts;
                foundRanks.push({ gamemodeName: gm.name, gamemodeIcon: gm.icon, tierId: tier.id, points: pts });
            }
        });
    });

    if (foundRanks.length === 0) {
        resultsContainer.innerHTML = `<p class="text-xs text-slate-400 text-center py-6">No rankings found for player <strong class="text-white">"${query}"</strong>.</p>`;
        return;
    }

    const allSorted = getCalculatedOverallPlayers();
    const overallRankIndex = allSorted.findIndex(p => p.name.toLowerCase() === actualPlayerName.toLowerCase());
    const rankDisplay = overallRankIndex > -1 ? `#${overallRankIndex + 1}` : "Unranked";

    const playerReg = playerRegions[actualPlayerName] || "US";
    let rankItemsHtml = foundRanks.map(rank => {
        let iconHtml = rank.gamemodeIcon.startsWith("http") ? `<img src="${rank.gamemodeIcon}" class="w-6 h-6 object-contain" style="image-rendering: pixelated;" onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/item/minecart.png';">` : `<span class="text-lg">${rank.gamemodeIcon}</span>`;
        return `
            <div class="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">${iconHtml}</div>
                    <span class="text-xs font-bold text-slate-200">${rank.gamemodeName}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-black text-xs">Tier: ${rank.tierId}</span>
                    <span class="text-xs text-slate-400 font-semibold">(+${rank.points} pts)</span>
                </div>
            </div>
        `;
    }).join('');

    resultsContainer.innerHTML = `
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                    <img src="https://skinrender.dev/render/${encodeURIComponent(actualPlayerName)}/face?size=100" class="w-full h-full object-cover" style="image-rendering: pixelated;" onerror="this.onerror=null; this.src='https://skinrender.dev/render/MHF_Steve/face?size=100';">
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <h4 class="text-sm font-extrabold text-white">${actualPlayerName}</h4>
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">${rankDisplay} Overall</span>
                    </div>
                    <span class="text-xs font-bold text-slate-400">Region: ${playerReg}</span>
                </div>
            </div>
            <p class="text-xs text-slate-400">Total Score: <strong class="text-indigo-400">${totalPlayerPoints} pts</strong></p>
        </div>
        <div class="space-y-2 pt-2">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tested Gamemodes (${foundRanks.length})</p>
            ${rankItemsHtml}
        </div>
    `;
}

function handleAuthClick() {
    if (isAdmin) {
        isAdmin = false;
        if (testerName) toggleTesterStatus(false);
        updateAuthUI();
        renderMainView();
    } else {
        const modal = document.getElementById("passwordModal");
        const input = document.getElementById("adminPasswordInput");
        if (modal) modal.classList.remove("hidden");
        if (input) { input.value = ""; input.focus(); }
    }
}

async function hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(event) {
    event.preventDefault();
    const input = document.getElementById("adminPasswordInput");
    if (input) {
        const typedHash = await hashString(input.value);
        if (typedHash === CORRECT_PASSWORD_HASH) {
            isAdmin = true;
            closePasswordModal();
            updateAuthUI();
            renderMainView();
        } else {
            alert("Incorrect password!");
        }
    }
}

function closePasswordModal() {
    const modal = document.getElementById("passwordModal");
    if (modal) modal.classList.add("hidden");
}

function updateAuthUI() {
    const btnText = document.getElementById("authBtnText");
    const authIcon = document.getElementById("authIcon");
    const adminToolbar = document.getElementById("adminToolbar");
    if (isAdmin) {
        if (btnText) btnText.innerText = "Admin Mode";
        if (authIcon) authIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/>';
        if (adminToolbar) adminToolbar.classList.remove("hidden");
    } else {
        if (btnText) btnText.innerText = "Viewer Mode";
        if (authIcon) authIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>';
        if (adminToolbar) adminToolbar.classList.add("hidden");
    }
}

function openAddPlayerModal() {
    if (!isAdmin || currentGamemode === "overall" || currentGamemode === "home") return;
    const modal = document.getElementById("addPlayerModal");
    const nameInput = document.getElementById("newPlayerName");
    if (modal) modal.classList.remove("hidden");
    if (nameInput) { nameInput.value = ""; nameInput.focus(); }
}

function closeAddPlayerModal() {
    const modal = document.getElementById("addPlayerModal");
    if (modal) modal.classList.add("hidden");
}

async function handleAddPlayerSubmit(event) {
    event.preventDefault();
    const nameEl = document.getElementById("newPlayerName");
    const regEl = document.getElementById("newPlayerRegion");
    const tierEl = document.getElementById("newPlayerTier");
    if (!nameEl || !regEl || !tierEl) return;

    const name = nameEl.value.trim();
    const region = regEl.value;
    const tier = tierEl.value;
    if (!name) return;

    playerRegions[name] = region;
    if (!tierData[currentGamemode][tier].includes(name)) {
        tierData[currentGamemode][tier].push(name);
        await saveToCloud();
        renderMainView();
    }
    closeAddPlayerModal();
}

async function removePlayer(tierId, playerName) {
    if (!isAdmin) return;
    const list = tierData[currentGamemode][tierId];
    const idx = list.indexOf(playerName);
    if (idx > -1) {
        list.splice(idx, 1);
        await saveToCloud();
        renderMainView();
    }
}

async function resetCurrentTierlist() {
    if (!isAdmin || currentGamemode === "overall" || currentGamemode === "home") return;
    if (confirm("Are you sure you want to reset this gamemode's tier list?")) {
        tiers.forEach(t => { tierData[currentGamemode][t.id] = []; });
        await saveToCloud();
        renderMainView();
    }
}

loadFromCloud();