const supabase = require("../lib/supabase");
const { isAdmin } = require("../lib/auth");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  // GET — anyone can view products
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        return res.status(500).json({
          error: "Unable to load products"
        });
      }

      return res.status(200).json(data || []);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Server error"
      });
    }
  }

  // POST — only admin can add products
  if (req.method === "POST") {
    if (!isAdmin(req)) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }

    try {
      const {
        name,
        price,
        quantity,
        category,
        image,
        public_id
      } = req.body || {};

      if (!name || !price || quantity === undefined || !category || !image) {
        return res.status(400).json({
          error: "Please fill all required fields"
        });
      }

      const product = {
        name: String(name).trim(),
        price: Number(price),
        quantity: Number(quantity),
        category: String(category).trim(),
        image: String(image).trim(),
        public_id: public_id ? String(public_id).trim() : null
      };

      if (
        !product.name ||
        !product.category ||
        !product.image ||
        !Number.isFinite(product.price) ||
        !Number.isInteger(product.quantity) ||
        product.price < 0 ||
        product.quantity < 0
      ) {
        return res.status(400).json({
          error: "Invalid product details"
        });
      }

      const { data, error } = await supabase
        .from("products")
        .insert([product])
        .select()
        .single();

      if (error) {
        console.error(error);
        return res.status(500).json({
          error: "Unable to save product"
        });
      }

      return res.status(201).json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Server error"
      });
    }
  }

  return res.status(405).json({
    error: "Method not allowed"
  });
};