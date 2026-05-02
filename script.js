let all = [];

async function load(){
let res = await fetch("/products");
all = await res.json();
show(all);
}

function show(data){
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

<a href="https://wa.me/919395142435?text=I want ${p.name}">
<button class="btn">Order</button>
</a>

</div>
`;
});
}

window.onload = load;
