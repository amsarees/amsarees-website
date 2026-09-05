let adminLoggedIn = false;


/* ================================
   CHECK LOGIN
================================ */

async function checkLogin() {

  try {

    const response = await fetch("/api/login", {
      method: "GET",
      credentials: "include"
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    if (data.authenticated === true) {

      showAdminPanel();

      loadAdminProducts();

    }

  } catch (error) {

    console.log("Login check error:", error);

  }

}


/* ================================
   LOGIN
================================ */

async function login() {

  const username =
    document.getElementById("username").value.trim();

  const password =
    document.getElementById("password").value;

  const message =
    document.getElementById("loginMessage");


  if (!username || !password) {

    message.textContent =
      "Please enter username and password.";

    return;

  }


  message.textContent = "Logging in...";


  try {

    const response = await fetch("/api/login", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      credentials: "include",

      body: JSON.stringify({
        username: username,
        password: password
      })

    });


    const data = await response.json();


    if (response.ok && data.success === true) {

      message.textContent = "Login successful!";

      showAdminPanel();

      loadAdminProducts();

    } else {

      message.textContent =
        data.error ||
        "Invalid username or password.";

    }


  } catch (error) {

    console.log("Login error:", error);

    message.textContent =
      "Login error. Please try again.";

  }

}


/* ================================
   SHOW ADMIN PANEL
================================ */

function showAdminPanel() {

  adminLoggedIn = true;

  const loginSection =
    document.getElementById("loginSection");

  const adminPanel =
    document.getElementById("adminPanel");


  if (loginSection) {
    loginSection.style.display = "none";
  }


  if (adminPanel) {
    adminPanel.style.display = "block";
  }

}


/* ================================
   ADD PRODUCT
================================ */

async function addProduct() {

  if (!adminLoggedIn) {

    alert("Please login first.");

    return;

  }


  const image =
    document.getElementById("image").files[0];

  const name =
    document.getElementById("name").value.trim();

  const price =
    document.getElementById("price").value.trim();

  const quantity =
    document.getElementById("quantity").value.trim();

  const category =
    document.getElementById("category").value.trim();

  const message =
    document.getElementById("uploadMessage");


  if (!image) {

    message.textContent =
      "Please select a product image.";

    return;

  }


  if (!name || !price || !quantity || !category) {

    message.textContent =
      "Please fill all product details.";

    return;

  }


  message.textContent =
    "Uploading product...";


  try {

    /* ================================
       STEP 1 — CLOUDINARY SIGNATURE
    ================================ */

    const signatureResponse =
      await fetch("/api/upload-signature", {
        method: "GET",
        credentials: "include"
      });


    const signatureData =
      await signatureResponse.json();


    if (!signatureResponse.ok) {

      throw new Error(
        signatureData.error ||
        "Could not create upload signature."
      );

    }


    /* ================================
       STEP 2 — CLOUDINARY UPLOAD
    ================================ */

    const formData =
      new FormData();


    formData.append("file", image);

    formData.append(
      "api_key",
      signatureData.api_key
    );

    formData.append(
      "timestamp",
      signatureData.timestamp
    );

    formData.append(
      "signature",
      signatureData.signature
    );

    formData.append(
      "folder",
      signatureData.folder
    );


    const cloudinaryResponse =
      await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`,
        {
          method: "POST",
          body: formData
        }
      );


    const cloudinaryData =
      await cloudinaryResponse.json();


    if (!cloudinaryResponse.ok) {

      throw new Error(
        cloudinaryData.error?.message ||
        "Cloudinary upload failed."
      );

    }


    /* ================================
       STEP 3 — SAVE TO SUPABASE
    ================================ */

    const productResponse =
      await fetch("/api/products", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        credentials: "include",

        body: JSON.stringify({

          name: name,

          price: Number(price),

          quantity: Number(quantity),

          category: category,

          image: cloudinaryData.secure_url,

          public_id: cloudinaryData.public_id

        })

      });


    const productData =
      await productResponse.json();


    if (!productResponse.ok) {

      throw new Error(
        productData.error ||
        "Could not save product."
      );

    }


    /* ================================
       SUCCESS
    ================================ */

    message.textContent =
      "Product uploaded successfully!";


    document.getElementById("image").value = "";

    document.getElementById("name").value = "";

    document.getElementById("price").value = "";

    document.getElementById("quantity").value = "";

    document.getElementById("category").value = "";


    loadAdminProducts();


  } catch (error) {

    console.log("Upload error:", error);

    message.textContent =
      error.message ||
      "Upload failed. Please try again.";

  }

}


/* ================================
   LOAD ADMIN PRODUCTS
================================ */

async function loadAdminProducts() {

  const box =
    document.getElementById("adminProducts");


  if (!box) return;


  box.innerHTML = `
    <p style="
      color:#aaa;
      text-align:center;
      grid-column:1/-1;
    ">
      Loading products...
    </p>
  `;


  try {

    const response =
      await fetch("/api/products", {
        method: "GET"
      });


    const products =
      await response.json();


    if (!response.ok) {

      throw new Error(
        products.error ||
        "Could not load products."
      );

    }


    box.innerHTML = "";


    if (!Array.isArray(products) || products.length === 0) {

      box.innerHTML = `
        <p style="
          color:#aaa;
          text-align:center;
          grid-column:1/-1;
          padding:40px;
        ">
          No products added yet.
        </p>
      `;

      return;

    }


    products.forEach(product => {

      const card =
        document.createElement("div");


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
        ">
          Quantity: ${escapeHTML(product.quantity)}
        </p>

        <p style="
          color:#aaa;
          font-size:13px;
          margin-bottom:15px;
        ">
          Category: ${escapeHTML(product.category)}
        </p>

        <button
          class="btn btn-danger"
          onclick="deleteProduct('${escapeJS(product.id)}')"
        >
          DELETE PRODUCT
        </button>

      `;


      box.appendChild(card);

    });


  } catch (error) {

    console.log("Products error:", error);

    box.innerHTML = `
      <p style="
        color:#aaa;
        text-align:center;
        grid-column:1/-1;
      ">
        Could not load products.
      </p>
    `;

  }

}


/* ================================
   DELETE PRODUCT
================================ */

async function deleteProduct(id) {

  const confirmed =
    confirm(
      "Are you sure you want to delete this product?"
    );


  if (!confirmed) return;


  try {

    const response =
      await fetch(
        "/api/products/" +
        encodeURIComponent(id),
        {
          method: "DELETE",
          credentials: "include"
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      alert(
        data.error ||
        "Could not delete product."
      );

      return;

    }


    alert(
      "Product deleted successfully."
    );


    loadAdminProducts();


  } catch (error) {

    console.log("Delete error:", error);

    alert(
      "Delete failed. Please try again."
    );

  }

}


/* ================================
   LOGOUT
================================ */

async function logout() {

  try {

    await fetch(
      "/api/logout",
      {
        method: "POST",
        credentials: "include"
      }
    );

  } catch (error) {

    console.log("Logout error:", error);

  }


  adminLoggedIn = false;


  const adminPanel =
    document.getElementById("adminPanel");

  const loginSection =
    document.getElementById("loginSection");


  if (adminPanel) {
    adminPanel.style.display = "none";
  }


  if (loginSection) {
    loginSection.style.display = "block";
  }


  document.getElementById("username").value = "";

  document.getElementById("password").value = "";

  document.getElementById("loginMessage").textContent = "";

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
  checkLogin
);