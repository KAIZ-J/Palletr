//       window.addEventListener("scroll",()=>{
//         if(window.screenTop<300){
//  document.querySelector("nav").style.background="transparent"
//         }
//        else{
//         document.querySelector("nav").style.background="var(--secondary)"
//        }
//       })
 function openDialog(){
        document.getElementById("dialog-outer").style.display="flex";
        setTimeout(()=>{
document.getElementById("dialog").classList.add("active");
        },100)    
        document.body.style.overflowY="hidden"
    }
     function closeDialog(){
        document.getElementById("dialog").classList.remove("active");
        setTimeout(()=>{
             document.getElementById("dialog-outer").style.display="none";
        },100)
        document.body.style.overflowY="auto"
      }
const palletesHolder = document.getElementById("palletes-holder");
const modelSelect =  document.getElementById("model");
const baseColor = document.getElementById("base-color")
const createdPalette =document.getElementById("createdPalette");
const dialogBtn = document.getElementById("dialog-btn")
      const hexvalues = "0123456789ABCDEF".split("");
      function toggleTheme(elem){
        document.body.classList.toggle("light")
        elem.querySelector("i").classList.toggle("fa-moon");
        elem.querySelector("i").classList.toggle("fa-sun");
      }
      function hex(str) {
        let arr = str.split("").map((el) => hexvalues.indexOf(el));
        arr.shift();
        let resultarr = [
          arr[0] * 16 + arr[1],
          arr[2] * 16 + arr[3],
          arr[4] * 16 + arr[5],
        ];
        return resultarr;
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
      const generateRandomBtn = document.getElementById("generate-random-btn");
      const quickPalette = document.getElementById("quickPalette");
       const loadMoreBtn = document.getElementById("load-more-btn");
      function randomColor() {
        let hexColor = "";
        for (let i = 0; i < 6; i++) {
          hexColor += hexvalues[Math.floor(Math.random() * hexvalues.length)];
        }
        return "#" + hexColor;
      }
      function updatePalette(arr,element,cls) {
        element.innerHTML = "";
        arr.forEach((el) => {
          element.innerHTML += ` <span class="${cls}" onclick="copyText(this)" style="background-color:${rgb(
            el
          )};color:${rgb(el)}">${rgb(el)}</span>`;
        });
        document.querySelectorAll(`.${cls}`).forEach((el) => {
          el.addEventListener("mouseenter", () => {
            el.style.color = "white";
          });
          el.addEventListener("mouseleave", () => {
            el.style.color = el.style.backgroundColor;
          });
        });
      }
      function updateExpPalletes(arr){
         let str = ""
         arr.forEach((el) => {
          str += ` <span class="explore-palette-color" onclick="copyText(this)" onmouseover="showtext(this)" onmouseleave="hidetext(this)" style="background-color:${rgb(
            el
          )};color:${rgb(el)}">${rgb(el)}</span>`;
        });
       
        palletesHolder.innerHTML+=`<div class="pallete-explores pallete">${str}</div>`
      }
      function showtext(el){
   el.style.color = "white";
      }
      function hidetext(el){
 el.style.color = el.style.backgroundColor;
      }
      function randomModel() {
        let models = ["ui", "default"];
        return models[Math.floor(Math.random() * models.length)];
      }

      const randomPrompt = {
        model: `${randomModel()}`,
        input: ["N", "N", "N", "N", "N"],
      };
      async function getQuickPallete(elem) {
        try {
          elem.querySelector("i").classList.add("fa-spin");
          elem.setAttribute("disabled", true);
          const response = await fetch(`https://colormind-proxy.onrender.com/colormind`, {
            method: "POST",
            body: JSON.stringify({
        model: `${randomModel()}`,
        input: ["N", "N", "N", "N", "N"],
      }),
          });
          const data = await response.json();
          updatePalette(data.result,quickPalette,"quick-pallete");
          elem.removeAttribute("disabled");
          elem.querySelector("i").classList.remove("fa-spin");
        } catch (err) {
          console.log("cound't fecth", err);
        }
      }
      function copyText(elem) {
        navigator.clipboard.writeText(elem.textContent);
      }
      getQuickPallete(generateRandomBtn);
// other sectiion
    async function loadExpPalletes(elem){
   let array = [];
   elem.innerHTML=`<i class="fa-solid fa-spinner fa-spin" style="color:var(--background)"></i>`;
          elem.setAttribute("disabled", true);
      for(let i=0;i<10;i++){   
       try {
          const response = await fetch(`https://colormind-proxy.onrender.com/colormind`, {
            method: "POST",
            body: JSON.stringify({
        model: `${randomModel()}`,
        input: ["N", "N", "N", "N", "N"],
      }),
          });
          const data = await response.json();
          array.push(data.result)
        } catch (err) {
          console.log("cound't fecth", err);
        }
        };
        palletesHolder.innerHTML=""
        array.forEach(el=>{
          updateExpPalletes(el)
        })
          elem.removeAttribute("disabled");
          elem.innerHTML=``
          elem.textContent="Generate new set"
      }
      loadExpPalletes(loadMoreBtn)

    async function createPalette(){
         closeDialog()
 try {
         dialogBtn.innerHTML=`<i class="fa-solid fa-spinner fa-spin" style="color:var(--background)"></i>`;
          dialogBtn.setAttribute("disabled", true);
          const response = await fetch(`https://colormind-proxy.onrender.com/colormind`, {
            method: "POST",
            body: JSON.stringify({ 
        model: `${model.value}`,
        input: [hex(baseColor.value), "N", "N", "N", "N"],
      }),
          });
          const data = await response.json();
          updatePalette(data.result,createdPalette,"created-color-pallete");
         
        dialogBtn.removeAttribute("disabled");
          dialogBtn.innerHTML=` <i class="fa-solid fa-wand-magic-sparkles"></i> Create`
        } catch (err) {
          console.log("cound't fecth", err);
        }
    }