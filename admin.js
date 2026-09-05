let adminLoggedIn = false;


/* ================================
   CHECK LOGIN
================================ */

async function checkLogin() {

  try {

    const response = await fetch("/api/login", {
      method: "GET"
    });

    if (response.ok) {

      const data = await response.json();

      if (data.loggedIn) {
        showAdminPanel();
      }

    }

  } catch (error) {

    console.log(error);

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

      body: JSON.stringify({
        username,
        password
      })

    });


    const data = await response.json();


    if (data.success) {

      message.textContent = "";

      showAdminPanel();

      loadAdminProducts();

    } else {

      message.textContent =
        "Invalid username or password.";

    }


  } catch (error) {

    console.log(error);

    message.textContent =
      "Login error. Please try again.";

  }

}


/* ================================
   SHOW ADMIN PANEL
================================ */

function showAdminPanel() {

  adminLoggedIn = true;

  document.getElementById(
    "loginSection"
  ).style.display = "none";


  document.getElementById(
    "adminPanel"
  ).style.display = "block";

}


/* ================================
   ADD PRODUCT
================================ */

async function addProduct() {

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

    /*
      STEP 1:
      Ask our Vercel API for a secure
      Cloudinary upload signature.
    */

    const signatureResponse =
      await fetch("/api/upload-signature");


    if (!signatureResponse.ok) {

      throw new Error(
        "Could not create upload signature."
      );

    }


    const signatureData =
      await signatureResponse.json();


    /*
      STEP 2:
      Upload image directly to Cloudinary.
    */

    const formData =
      new FormData();


    formData.append(
      "file",
      image
    );

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
      "amsarees"
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
        "Cloudinary upload failed."
      );

    }


    /*
      STEP 3:
      Save product information
      in Supabase through our API.
    */

    const productResponse =
      await fetch("/api/products", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          name: name,

          price: price,

          quantity: quantity,

          category: category,

          image: cloudinaryData.secure_url,

          public_id: cloudinaryData.public_id

        })

      });


    const productData =
      await productResponse.json();


    if (!productResponse.ok || !productData.success) {

      throw new Error(
        productData.message ||
        "Could not save product."
      );

    }


    message.textContent =
      "Product uploaded successfully!";


    /*
      Clear form
    */

    document.getElementById(
      "image"
    ).value = "";

    document.getElementById(
      "name"
    ).value = "";

    document.getElementById(
      "price"
    ).value = "";

    document.getElementById(
      "quantity"
    ).value = "";

    document.getElementById(
      "category"
    ).value = "";


    loadAdminProducts();


  } catch (error) {

    console.log(error);

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
    document.getElementById(
      "adminProducts"
    );


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
      await fetch("/api/products");


    if (!response.ok) {

      throw new Error(
        "Could not load products."
      );

    }


    const products =
      await response.json();


    box.innerHTML = "";


    if (!products.length) {

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
          ${escapeHTML(product.category)}
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

    console.log(error);

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
          method: "DELETE"
        }
      );


    const data =
      await response.json();


    if (!response.ok || !data.success) {

      alert(
        data.message ||
        "Could not delete product."
      );

      return;

    }


    alert(
      "Product deleted successfully."
    );


    loadAdminProducts();


  } catch (error) {

    console.log(error);

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
        method: "POST"
      }
    );

  } catch (error) {

    console.log(error);

  }


  adminLoggedIn = false;


  document.getElementById(
    "adminPanel"
  ).style.display = "none";


  document.getElementById(
    "loginSection"
  ).style.display = "block";


  document.getElementById(
    "username"
  ).value = "";


  document.getElementById(
    "password"
  ).value = "";


  document.getElementById(
    "loginMessage"
  ).textContent = "";

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
);let adminLoggedIn = false;


/* ================================
   CHECK LOGIN
================================ */

async function checkLogin() {

  try {

    const response = await fetch("/api/login", {
      method: "GET"
    });

    if (response.ok) {

      const data = await response.json();

      if (data.loggedIn) {
        showAdminPanel();
      }

    }

  } catch (error) {

    console.log(error);

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

      body: JSON.stringify({
        username,
        password
      })

    });


    const data = await response.json();


    if (data.success) {

      message.textContent = "";

      showAdminPanel();

      loadAdminProducts();

    } else {

      message.textContent =
        "Invalid username or password.";

    }


  } catch (error) {

    console.log(error);

    message.textContent =
      "Login error. Please try again.";

  }

}


/* ================================
   SHOW ADMIN PANEL
================================ */

function showAdminPanel() {

  adminLoggedIn = true;

  document.getElementById(
    "loginSection"
  ).style.display = "none";


  document.getElementById(
    "adminPanel"
  ).style.display = "block";

}


/* ================================
   ADD PRODUCT
================================ */

async function addProduct() {

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

    /*
      STEP 1:
      Ask our Vercel API for a secure
      Cloudinary upload signature.
    */

    const signatureResponse =
      await fetch("/api/upload-signature");


    if (!signatureResponse.ok) {

      throw new Error(
        "Could not create upload signature."
      );

    }


    const signatureData =
      await signatureResponse.json();


    /*
      STEP 2:
      Upload image directly to Cloudinary.
    */

    const formData =
      new FormData();


    formData.append(
      "file",
      image
    );

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
      "amsarees"
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
        "Cloudinary upload failed."
      );

    }


    /*
      STEP 3:
      Save product information
      in Supabase through our API.
    */

    const productResponse =
      await fetch("/api/products", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          name: name,

          price: price,

          quantity: quantity,

          category: category,

          image: cloudinaryData.secure_url,

          public_id: cloudinaryData.public_id

        })

      });


    const productData =
      await productResponse.json();


    if (!productResponse.ok || !productData.success) {

      throw new Error(
        productData.message ||
        "Could not save product."
      );

    }


    message.textContent =
      "Product uploaded successfully!";


    /*
      Clear form
    */

    document.getElementById(
      "image"
    ).value = "";

    document.getElementById(
      "name"
    ).value = "";

    document.getElementById(
      "price"
    ).value = "";

    document.getElementById(
      "quantity"
    ).value = "";

    document.getElementById(
      "category"
    ).value = "";


    loadAdminProducts();


  } catch (error) {

    console.log(error);

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
    document.getElementById(
      "adminProducts"
    );


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
      await fetch("/api/products");


    if (!response.ok) {

      throw new Error(
        "Could not load products."
      );

    }


    const products =
      await response.json();


    box.innerHTML = "";


    if (!products.length) {

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
          ${escapeHTML(product.category)}
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

    console.log(error);

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
          method: "DELETE"
        }
      );


    const data =
      await response.json();


    if (!response.ok || !data.success) {

      alert(
        data.message ||
        "Could not delete product."
      );

      return;

    }


    alert(
      "Product deleted successfully."
    );


    loadAdminProducts();


  } catch (error) {

    console.log(error);

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
        method: "POST"
      }
    );

  } catch (error) {

    console.log(error);

  }


  adminLoggedIn = false;


  document.getElementById(
    "adminPanel"
  ).style.display = "none";


  document.getElementById(
    "loginSection"
  ).style.display = "block";


  document.getElementById(
    "username"
  ).value = "";


  document.getElementById(
    "password"
  ).value = "";


  document.getElementById(
    "loginMessage"
  ).textContent = "";

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