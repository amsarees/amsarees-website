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

        <img src="${p.image}" class="product-img">

        <h3>${p.name}</h3>
        <p>₹${p.price}</p>

        <!-- QUANTITY -->
        <input type="number" id="q${p.id}" value="1" min="1" class="qty">

        <!-- WHATSAPP ORDER -->
        <button class="btn" onclick="order('${p.name}','${p.price}','${p.image}',${p.id})">
          Order on WhatsApp
        </button>

        <!-- ADMIN CONTROLS -->
        ${window.location.pathname.includes("admin.html") ? `
          
          <input id="name${p.id}" value="${p.name}" class="edit-input">
          <input id="price${p.id}" value="${p.price}" class="edit-input">
          <input id="cat${p.id}" value="${p.category || ''}" class="edit-input">

          <button class="btn" onclick="edit(${p.id})">Update</button>

          <button class="btn btn-danger" onclick="del(${p.id})">
            Delete
          </button>

        ` : ""}

      </div>
    `;
  });
}

// WHATSAPP ORDER FUNCTION
function order(name, price, image, id){
  let qty = document.getElementById("q"+id).value;

  let msg = `🛍 *Order Details*
Product: ${name}
Price: ₹${price}
Quantity: ${qty}
Image: ${image}`;

  let url = "https://wa.me/919395142435?text=" + encodeURIComponent(msg);

  window.open(url, "_blank");
}

// DELETE PRODUCT
async function del(id){
  let confirmDelete = confirm("Delete this product?");
  if(!confirmDelete) return;

  await fetch("/delete-product/" + id, {
    method: "DELETE"
  });

  load();
}

// EDIT PRODUCT
async function edit(id){
  let name = document.getElementById("name"+id).value;
  let price = document.getElementById("price"+id).value;
  let category = document.getElementById("cat"+id).value;

  await fetch("/edit-product/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price, category })
  });

  alert("Updated");
  load();
}

// SEARCH
function search(v){
  display(all.filter(p =>
    p.name.toLowerCase().includes(v.toLowerCase())
  ));
}

// CATEGORY FILTER
function filterCat(c){
  if(c === "all") return display(all);
  display(all.filter(p => p.category === c));
}

// AUTO LOAD
window.onload = load;
