/* ================= FIREBASE SETUP =================
  1. Copy firebase-config.example.js to firebase-config.js.
  2. Paste your Firebase web app config into that file.
  3. Set window.VOTE_CONFIG in firebase-config.js.
  Without Firebase config, this app runs in local demo mode on this device only.
===================================================== */
const COLORS = {
  hitam: { label: "Hitam", hex: "#24262c", description: "Klasik · netral · tegas" },
  navy: { label: "Navy", hex: "#142b50", description: "Senada · kompak · elegan" },
  cream: { label: "Cream / Biskuit", hex: "#e8d7b8", description: "Hangat · kontras · manis" }
};
const $ = (id) => document.getElementById(id);
let selectedColor = "";
let firebaseReady = false, auth = null, db = null, currentUser = null, isAdmin = false;
let localVotes = JSON.parse(localStorage.getItem("vote39-votes") || "{}");
let localClosed = localStorage.getItem("vote39-closed") === "true";
let chosenLocal = localStorage.getItem("vote39-choice") || "";
let firebaseConfig = null;

function notify(message, target = "notice") { $(target).textContent = message; }
function setSelected(color) {
  selectedColor = color;
  document.querySelectorAll(".color-card").forEach(card => {
    const active = card.dataset.color === color;
    card.classList.toggle("selected", active);
    card.setAttribute("aria-pressed", String(active));
  });
  const c = COLORS[color];
  $("selectedName").textContent = c ? c.label : "Belum memilih";
  $("selectedDot").style.background = c ? c.hex : "#555";
  $("hijabShape").style.background = c ? c.hex : "#333";
  $("voteStatus").textContent = c ? `Pilihanmu: ${c.label}` : "Belum ada pilihan";
  $("voteHint").textContent = c ? "Pastikan pilihanmu sudah tepat sebelum dikirim." : "Ketuk salah satu warna untuk memilih.";
  $("submitVote").disabled = !c;
}
function updateLock(closed) {
  $("lockedResults").classList.toggle("hidden", closed);
  $("resultsCard").classList.toggle("hidden", !closed);
  $("publicStatus").innerHTML = closed ? "<i></i> Hasil sudah dibuka" : "<i></i> Hasil dirahasiakan";
}
function drawResults(votes) {
  const counts = { hitam: 0, navy: 0, cream: 0 };
  Object.values(votes || {}).forEach(v => { if (v && counts[v.color] !== undefined) counts[v.color]++; });
  const total = Object.values(counts).reduce((a,b)=>a+b,0);
  $("totalVotes").textContent = total;
  $("adminTotal").textContent = total;
  $("resultBars").innerHTML = "";
  Object.entries(COLORS).forEach(([key, c]) => {
    const pct = total ? Math.round(counts[key] / total * 100) : 0;
    const row = document.createElement("div");
    row.className = "result-row";
    row.innerHTML = `<div class="bar-label"><span>${c.label}</span><b>${counts[key]} suara · ${pct}%</b></div><div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${c.hex}"></div></div>`;
    $("resultBars").appendChild(row);
  });
  const max = Math.max(...Object.values(counts));
  const winners = Object.keys(counts).filter(k => counts[k] === max);
  $("winnerBanner").textContent = total === 0 ? "Belum ada suara yang masuk." : winners.length > 1 ? `Hasil seri: ${winners.map(k=>COLORS[k].label).join(" dan ")}.` : `Pilihan terbanyak: ${COLORS[winners[0]].label} — ${max} suara (${Math.round(max/total*100)}%).`;
  $("adminState").textContent = (firebaseReady ? window.voteClosed : localClosed) ? "Ditutup" : "Dibuka";
}
function currentVotes() { return firebaseReady ? {} : localVotes; }
function refreshLocal() {
  updateLock(localClosed);
  drawResults(localVotes);
  $("submitVote").disabled = !selectedColor || localClosed || !!chosenLocal;
  if (chosenLocal) {
    setSelected(chosenLocal);
    $("voteStatus").textContent = `Kamu sudah memilih: ${COLORS[chosenLocal].label}`;
    $("voteHint").textContent = "Terima kasih! Pilihan di perangkat ini sudah tercatat.";
    document.querySelectorAll(".color-card").forEach(c=>c.disabled=true);
  }
}
function applyRemoteSettings(settings) {
  window.voteClosed = !!(settings && settings.closed);
  updateLock(window.voteClosed);
  $("adminState").textContent = window.voteClosed ? "Ditutup" : "Dibuka";
  $("submitVote").disabled = !selectedColor || window.voteClosed || !!(currentUser && false);
}
function initializeFirebase() {
  firebaseConfig = window.VOTE_CONFIG || null;
  if (!firebaseConfig || !firebaseConfig.apiKey || firebaseConfig.apiKey.includes("PASTE_")) {
    refreshLocal();
    notify("Mode demo lokal aktif. Untuk voting online, sambungkan Firebase sesuai README.");
    return;
  }
  try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth(); db = firebase.database(); firebaseReady = true;
    auth.signInAnonymously().catch(e => notify("Login peserta gagal: " + e.message));
    auth.onAuthStateChanged(user => {
      currentUser = user;
      if (user && !isAdmin) {
        db.ref("votes/" + user.uid).once("value").then(snap => {
          if (snap.exists()) {
            chosenLocal = snap.val().color;
            document.querySelectorAll(".color-card").forEach(c=>c.disabled=true);
            setSelected(chosenLocal);
            $("voteStatus").textContent = `Kamu sudah memilih: ${COLORS[chosenLocal].label}`;
            $("voteHint").textContent = "Terima kasih! Pilihanmu sudah tercatat.";
            $("submitVote").disabled = true;
          }
        }).catch(e => notify("Belum bisa mengecek status suara: " + e.message));
      }
    });
    db.ref("settings").on("value", snap => applyRemoteSettings(snap.val() || {closed:false}), e => notify("Gagal membaca status voting. Periksa aturan database."));
    db.ref("votes").on("value", snap => {
      const votes = snap.val() || {};
      drawResults(votes);
      if (isAdmin) $("adminTotal").textContent = Object.keys(votes).length;
    }, e => { if (window.voteClosed || isAdmin) notify("Hasil belum bisa dibaca. Periksa Firebase Database Rules."); });
    notify("Terhubung ke Firebase. Suara akan tersimpan online.");
  } catch (e) {
    firebaseReady = false;
    refreshLocal();
    notify("Firebase belum siap: " + e.message);
  }
}
document.querySelectorAll(".color-card").forEach(card => card.addEventListener("click", () => {
  if ((firebaseReady && window.voteClosed) || (!firebaseReady && localClosed)) { notify("Voting sedang ditutup oleh panitia."); return; }
  if (chosenLocal) { notify("Suara dari browser ini sudah tercatat."); return; }
  setSelected(card.dataset.color);
}));
$("submitVote").addEventListener("click", async () => {
  if (!selectedColor) return;
  if (firebaseReady) {
    if (!currentUser) { notify("Sedang menghubungkan akun peserta, coba lagi sebentar."); return; }
    if (window.voteClosed) { notify("Voting sudah ditutup."); return; }
    try {
      await db.ref("votes/" + currentUser.uid).set({ color: selectedColor, createdAt: firebase.database.ServerValue.TIMESTAMP });
      chosenLocal = selectedColor;
      document.querySelectorAll(".color-card").forEach(c=>c.disabled=true);
      $("submitVote").disabled = true;
      $("voteStatus").textContent = `Suaramu untuk ${COLORS[selectedColor].label} berhasil dikirim`;
      $("voteHint").textContent = "Terima kasih sudah ikut menentukan pilihan angkatan!";
      notify("Suara berhasil disimpan online. Hasil tetap dirahasiakan sampai voting ditutup.");
    } catch (e) { notify("Suara belum tersimpan: " + e.message + ". Cek koneksi atau aturan database."); }
  } else {
    if (localClosed) return notify("Voting sudah ditutup.");
    const id = "demo-" + (localStorage.getItem("vote39-demo-id") || crypto.randomUUID?.() || String(Date.now()));
    localStorage.setItem("vote39-demo-id", id);
    if (chosenLocal) return notify("Browser ini sudah memberikan suara.");
    localVotes[id] = { color: selectedColor, createdAt: Date.now() };
    localStorage.setItem("vote39-votes", JSON.stringify(localVotes));
    localStorage.setItem("vote39-choice", selectedColor);
    chosenLocal = selectedColor;
    refreshLocal();
    notify("Suara demo tersimpan di perangkat ini. Ini belum masuk ke voting online.");
  }
});
function openAdmin() { $("adminModal").classList.remove("hidden"); }
function closeAdmin() { $("adminModal").classList.add("hidden"); }
$("openAdmin").addEventListener("click", openAdmin);
$("openAdminFooter").addEventListener("click", openAdmin);
$("closeAdmin").addEventListener("click", closeAdmin);
$("adminModal").addEventListener("click", e => { if (e.target === $("adminModal")) closeAdmin(); });
$("adminLoginForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!firebaseReady) { notify("Login admin membutuhkan Firebase online. Demo lokal hanya untuk melihat tampilan.", "adminNotice"); return; }
  try {
    const cred = await auth.signInWithEmailAndPassword($("adminEmail").value.trim(), $("adminPassword").value);
    isAdmin = true; currentUser = cred.user;
    $("adminDashboard").classList.remove("hidden");
    $("adminLoginForm").classList.add("hidden");
    $("adminNotice").textContent = "Berhasil masuk. Jika data tidak tampil, pastikan UID akun ini sudah dipasang di database.rules.json.";
    db.ref("votes").once("value").then(s => $("adminTotal").textContent = Object.keys(s.val() || {}).length);
  } catch (err) { notify("Login gagal: email/password salah atau akun admin belum dibuat.", "adminNotice"); }
});
$("toggleVoting").addEventListener("click", async () => {
  if (!isAdmin) return;
  try { await db.ref("settings/closed").set(true); notify("Voting ditutup. Hasil final dibuka untuk semua pengunjung.", "adminNotice"); }
  catch(e) { notify("Gagal menutup voting. Pastikan UID admin sesuai database rules.", "adminNotice"); }
});
$("reopenVoting").addEventListener("click", async () => {
  if (!isAdmin) return;
  try { await db.ref("settings/closed").set(false); notify("Voting dibuka lagi. Hasil kembali dirahasiakan.", "adminNotice"); }
  catch(e) { notify("Gagal membuka voting. Pastikan UID admin sesuai database rules.", "adminNotice"); }
});
$("adminLogout").addEventListener("click", async () => {
  isAdmin = false;
  if (auth) { try { await auth.signOut(); await auth.signInAnonymously(); } catch(e) {} }
  $("adminDashboard").classList.add("hidden"); $("adminLoginForm").classList.remove("hidden");
  $("adminPassword").value = ""; notify("Kamu sudah keluar dari panel admin.", "adminNotice");
});
initializeFirebase();
