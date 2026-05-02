let allProducts = [];

async function loadProducts(){
  let res = await fetch('/products');
  allProducts = await res.json();
  display(allProducts);
}

function display(data){
  let box = document.getElementById('products');
  if(!box) return;

  box.innerHTML = "";

  data.forEach(p=>{
    box.innerHTML += `
      <div class="card">
        <img src="${p.image}" width="100%">
        <h3>${p.name}</h3>
        <p>₹${p.price}</p>

        <a href="https://wa.me/919395142435?text=I want ${p.name}">
          <button class="btn">Order</button>
        </a>
      </div>
    `;
  });
}

function searchProducts(value){
  let filtered = allProducts.filter(p =>
    p.name.toLowerCase().includes(value.toLowerCase())
  );
  display(filtered);
}

window.onload = loadProducts;
