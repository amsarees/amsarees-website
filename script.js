let all = [];

// LOAD PRODUCTS
async function load(){
  let res = await fetch("/products");
  all = await res.json();
  display(all);
}

// DISPLAY PRODUCTS
function display(data){
  let box = document.getElementById("products");
  if(!box) return;

  box.innerHTML = "";

  data.forEach(p=>{
    box.innerHTML += `
      <div class="card">

        <a href="product.html?id=${p.id}">
          <img src="${p.image}">
        </a>

        <h3>${p.name}</h3>
        <p>₹${p.price}</p>

        <!-- WHATSAPP ORDER -->
        <a href="https://wa.me/919395142435?text=I want ${p.name}">
          <button class="btn">Order on WhatsApp</button>
        </a>

        <!-- DELETE BUTTON ONLY FOR ADMIN PAGE -->
        ${window.location.pathname.includes("admin.html") ? `
          <button class="btn btn-danger" onclick="del(${p.id})">
            Delete
          </button>
        ` : ""}

      </div>
    `;
  });
}

// DELETE PRODUCT
async function del(id){
  await fetch("/delete-product/" + id, {
    method: "DELETE"
  });

  load(); // reload after delete
}

// SEARCH (optional)
function search(v){
  display(all.filter(p =>
    p.name.toLowerCase().includes(v.toLowerCase())
  ));
}

// CATEGORY (optional)
function cat(c){
  if(c === "all") return display(all);
  display(all.filter(p => p.category === c));
}

// AUTO LOAD
window.onload = load;
