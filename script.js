let allProducts = [];


/* ================================
   LOAD PRODUCTS
================================ */

async function loadProducts() {

  try {

    const response = await fetch("/api/products");

    if (!response.ok) {
      throw new Error("Unable to load products");
    }

    allProducts = await response.json();

    displayProducts(allProducts);
    createCategories();

  } catch (error) {

    console.log(error);

    const box = document.getElementById("products");

    if (box) {
      box.innerHTML = `
        <p style="color:#aaa;text-align:center;">
          Products will appear here soon.
        </p>
      `;
    }

  }

}


/* ================================
   DISPLAY PRODUCTS
================================ */

function displayProducts(products) {

  const box = document.getElementById("products");

  if (!box) return;

  box.innerHTML = "";

  if (!products || products.length === 0) {

    box.innerHTML = `
      <p style="
        color:#aaa;
        text-align:center;
        grid-column:1/-1;
        padding:50px;
      ">
        No products available yet.
      </p>
    `;

    return;
  }


  products.forEach(product => {

    const card = document.createElement("div");

    card.className = "card";


    card.innerHTML = `

      <img
        src="${escapeHTML(product.image)}"
        class="product-img"
        alt="${escapeHTML(product.name)}"
      >


      <h3>
        ${escapeHTML(product.name)}
      </h3>


      <p>
        ₹${escapeHTML(product.price)}
      </p>


      <p style="
        color:#aaa;
        font-size:13px;
        margin-bottom:12px;
      ">
        Category: ${escapeHTML(product.category || "Sarees")}
      </p>


      <input
        type="number"
        id="qty-${product.id}"
        value="1"
        min="1"
        class="qty"
      >


      <button
        class="btn"
        onclick="orderWhatsApp(
          '${escapeJS(product.name)}',
          '${escapeJS(product.price)}',
          '${escapeJS(product.image)}',
          '${escapeJS(product.id)}'
        )"
      >
        ORDER ON WHATSAPP
      </button>


      <button
        class="btn"
        style="margin-top:10px;"
        onclick="openProduct('${escapeJS(product.id)}')"
      >
        VIEW DETAILS
      </button>

    `;


    box.appendChild(card);

  });

}


/* ================================
   PRODUCT DETAILS
================================ */

function openProduct(id) {

  window.location.href =
    "product.html?id=" + encodeURIComponent(id);

}


/* ================================
   WHATSAPP ORDER
================================ */

function orderWhatsApp(name, price, image, id) {

  const quantityInput =
    document.getElementById("qty-" + id);

  const quantity =
    quantityInput ? quantityInput.value : 1;


  const message =
`🛍️ A M SAREES CENTRE

Product: ${name}
Price: ₹${price}
Quantity: ${quantity}

Product Image:
${image}

I want to order this saree.`;


  const whatsappNumber = "919395142435";

  const url =
    "https://wa.me/" +
    whatsappNumber +
    "?text=" +
    encodeURIComponent(message);


  window.open(url, "_blank");

}


/* ================================
   SEARCH
================================ */

function searchProducts() {

  const input =
    document.getElementById("search");

  if (!input) return;


  const value =
    input.value.toLowerCase().trim();


  const filtered =
    allProducts.filter(product => {

      const name =
        String(product.name || "")
          .toLowerCase();

      const category =
        String(product.category || "")
          .toLowerCase();


      return (
        name.includes(value) ||
        category.includes(value)
      );

    });


  displayProducts(filtered);

}


/* ================================
   CATEGORIES
================================ */

function createCategories() {

  const categoryBox =
    document.getElementById("categories");

  if (!categoryBox) return;


  const categories = [
    ...new Set(
      allProducts
        .map(product => product.category)
        .filter(Boolean)
    )
  ];


  categoryBox.innerHTML = "";


  const allButton =
    document.createElement("button");

  allButton.className = "btn";

  allButton.style.width = "auto";

  allButton.textContent = "ALL";

  allButton.onclick = () => {

    displayProducts(allProducts);

  };


  categoryBox.appendChild(allButton);


  categories.forEach(category => {

    const button =
      document.createElement("button");

    button.className = "btn";

    button.style.width = "auto";

    button.textContent = category;


    button.onclick = () => {

      const filtered =
        allProducts.filter(
          product =>
            product.category === category
        );


      displayProducts(filtered);

    };


    categoryBox.appendChild(button);

  });

}


/* ================================
   SECURITY HELPERS
================================ */

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function escapeJS(value) {

  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");

}


/* ================================
   START
================================ */

document.addEventListener(
  "DOMContentLoaded",
  loadProducts
);