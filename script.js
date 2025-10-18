// ---------- DOM refs ----------
const palletesHolder = document.getElementById("palletes-holder");
const modelSelect =  document.getElementById("model");
const baseColor = document.getElementById("base-color");
const createdPalette = document.getElementById("createdPalette");
const dialogBtn = document.getElementById("dialog-btn");
const generateRandomBtn = document.getElementById("generate-random-btn");
const quickPalette = document.getElementById("quickPalette");
const loadMoreBtn = document.getElementById("load-more-btn");

const hexvalues = "0123456789ABCDEF".split("");

// ---------- small helpers ----------
function toggleTheme(elem){
  document.body.classList.toggle("light");
  const icon = elem.querySelector("i");
  if(!icon) return;
  icon.classList.toggle("fa-moon");
  icon.classList.toggle("fa-sun");
}

function hex(str) {
  // expects #RRGGBB => returns [r,g,b] as numbers
  let arr = str.replace("#","").split("").map((el) => hexvalues.indexOf(el));
  return [
    arr[0] * 16 + arr[1],
    arr[2] * 16 + arr[3],
    arr[4] * 16 + arr[5],
  ];
}

function rgb(arr) {
  let str = "";
  for (let i = 0; i < 3; i++) {
    let q = Math.floor(arr[i] / 16);
    let reminder = arr[i] - q * 16;
    str += `${hexvalues[q]}${hexvalues[reminder]}`;
  }
  return "#" + str;
}

function randomColor() {
  let hexColor = "";
  for (let i = 0; i < 6; i++) {
    hexColor += hexvalues[Math.floor(Math.random() * hexvalues.length)];
  }
  return "#" + hexColor;
}

// ---------- UI helpers ----------
function openDialog(){
  document.getElementById("dialog-outer").style.display = "flex";
  setTimeout(()=>{
    document.getElementById("dialog").classList.add("dialog-enter-active");
  }, 60);
}
function closeDialog(){
  document.getElementById("dialog").classList.remove("dialog-enter-active");
  setTimeout(()=>{
    document.getElementById("dialog-outer").style.display = "none";
  }, 180);
}

function copyText(elem) {
  if(!elem) return;
  navigator.clipboard.writeText(elem.textContent).then(()=>{
    // hint: small transient visual feedback
    elem.style.transform = "scale(1.03)";
    setTimeout(()=> elem.style.transform = "", 160);
  }).catch(()=>{ /* ignore */});
}

function showtext(el){
  if(!el) return;
  el.style.color = "white";
}
function hidetext(el){
  if(!el) return;
  el.style.color = el.style.backgroundColor;
}

function goPage(elem){
  document.querySelectorAll(".nav-link").forEach(el=>el.classList.remove("active"));
  elem.classList.add("active");
  // smooth scroll to section (if anchor)
  const target = elem.getAttribute("href");
  if(target && target.startsWith("#")){
    const node = document.querySelector(target);
    if(node) node.scrollIntoView({behavior:"smooth", block:"start"});
  }
}

// ---------- palette rendering ----------
function updatePalette(arr, element, cls){
  element.innerHTML = "";
  arr.forEach((el, idx) => {
    const color = rgb(el);
    const span = document.createElement("span");
    span.className = `${cls} palette-swatch`;
    // flex basis so swatches share area and animate nicely
    span.style.flex = "1 1 0%";
    span.style.backgroundColor = color;
    span.style.color = color;
    span.style.height = "100%";
    span.textContent = color;
    span.setAttribute("role","button");
    span.setAttribute("tabindex","0");
    span.addEventListener("click", ()=> copyText(span));
    span.addEventListener("mouseenter", ()=> { span.style.color = "#fff"; });
    span.addEventListener("mouseleave", ()=> { span.style.color = span.style.backgroundColor; });
    element.appendChild(span);
  });
}

function updateExpPalletes(arr){
  let container = document.createElement("div");
  container.className = "pallete-explores pallete palette-card flex gap-0";
  container.style.height = "64px";
  arr.forEach((el) => {
    const color = rgb(el);
    const span = document.createElement("span");
    span.className = "explore-palette-color palette-swatch";
    span.style.flex = "0 0 50px";
    span.style.backgroundColor = color;
    span.style.color = color;
    span.textContent = color;
    span.addEventListener("click", ()=> copyText(span));
    span.addEventListener("mouseenter", ()=> showtext(span));
    span.addEventListener("mouseleave", ()=> hidetext(span));
    container.appendChild(span);
  });
  palletesHolder.appendChild(container);
}

// ---------- API helpers ----------
function randomModel() {
  let models = ["ui", "default"];
  return models[Math.floor(Math.random() * models.length)];
}

// ---------- Async actions (network) ----------
async function getQuickPallete(elem) {
  try {
    elem.querySelector("i").classList.add("fa-spin");
    elem.setAttribute("disabled", true);
    const response = await fetch(`https://colormind-proxy.onrender.com/colormind`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: `${randomModel()}`,
        input: ["N","N","N","N","N"],
      }),
    });
    const data = await response.json();
    if(data && data.result) updatePalette(data.result, quickPalette, "quick-pallete");
  } catch (err) {
    console.warn("couldn't fetch quick palette", err);
  } finally {
    elem.removeAttribute("disabled");
    elem.querySelector("i").classList.remove("fa-spin");
  }
}

async function loadExpPalletes(elem){
  let array = [];
  elem.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="color:var(--background)"></i>`;
  elem.setAttribute("disabled", true);
  for(let i=0;i<8;i++){   // load 8 to keep UI snappy
    try {
      const response = await fetch(`https://colormind-proxy.onrender.com/colormind`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: `${randomModel()}`,
          input: ["N","N","N","N","N"],
        }),
      });
      const data = await response.json();
      if(data && data.result) array.push(data.result);
    } catch (err) {
      console.log("couldn't fetch explore", err);
    }
  }
  palletesHolder.innerHTML = "";
  array.forEach(el => updateExpPalletes(el));
  elem.removeAttribute("disabled");
  elem.innerText = "Generate new set";
}

async function createPalette(){
  closeDialog();
  try {
    dialogBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="color:var(--background)"></i>`;
    dialogBtn.setAttribute("disabled", true);
    const response = await fetch(`https://colormind-proxy.onrender.com/colormind`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: `${modelSelect.value}`,
        input: [ hex(baseColor.value), "N","N","N","N" ],
      }),
    });
    const data = await response.json();
    if(data && data.result) updatePalette(data.result, createdPalette, "created-color-pallete");
  } catch (err) {
    console.warn("couldn't create palette", err);
  } finally {
    dialogBtn.removeAttribute("disabled");
    dialogBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> Create`;
  }
}

// kick off initial requests
getQuickPallete(generateRandomBtn);
loadExpPalletes(loadMoreBtn);

// ---------- small extras ----------
// simple vanta init, guards if library loaded later
if(window.VANTA && VANTA.DOTS){
  VANTA.DOTS({
    el: "#hero",
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    scale: 1.0,
    scaleMobile: 1.0,
    color: 0x207fff,
    color2: 0x2099ff,
    showLines: false,
  });
} else {
  // attempt to init after a moment if libs finish loading
  setTimeout(()=> {
    if(window.VANTA && VANTA.DOTS){
      VANTA.DOTS({
        el: "#hero",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x207fff,
        color2: 0x2099ff,
        showLines: false,
      });
    }
  }, 600);
}
