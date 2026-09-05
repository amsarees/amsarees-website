const supabase = require("../../lib/supabase");
const { isAdmin } = require("../../lib/auth");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const id = req.query.id;

  if (!id) {
    return res.status(400).json({
      error: "Product ID is required"
    });
  }

  // DELETE — only admin
  if (req.method === "DELETE") {
    if (!isAdmin(req)) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }

    try {
      // First get the product
      const { data: product, error: findError } = await supabase
        .from("products")
        .select("id, public_id")
        .eq("id", id)
        .single();

      if (findError || !product) {
        return res.status(404).json({
          error: "Product not found"
        });
      }

      // Delete product from Supabase
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error(deleteError);

        return res.status(500).json({
          error: "Unable to delete product"
        });
      }

      return res.status(200).json({
        success: true,
        public_id: product.public_id || null
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: "Server error"
      });
    }
  }

  // PUT — only admin
  if (req.method === "PUT") {
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

      const updates = {};

      if (name !== undefined) {
        updates.name = String(name).trim();
      }

      if (price !== undefined) {
        updates.price = Number(price);
      }

      if (quantity !== undefined) {
        updates.quantity = Number(quantity);
      }

      if (category !== undefined) {
        updates.category = String(category).trim();
      }

      if (image !== undefined) {
        updates.image = String(image).trim();
      }

      if (public_id !== undefined) {
        updates.public_id = public_id
          ? String(public_id).trim()
          : null;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          error: "No changes provided"
        });
      }

      if (
        updates.price !== undefined &&
        (!Number.isFinite(updates.price) || updates.price < 0)
      ) {
        return res.status(400).json({
          error: "Invalid price"
        });
      }

      if (
        updates.quantity !== undefined &&
        (!Number.isInteger(updates.quantity) || updates.quantity < 0)
      ) {
        return res.status(400).json({
          error: "Invalid quantity"
        });
      }

      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(error);

        return res.status(500).json({
          error: "Unable to update product"
        });
      }

      return res.status(200).json(data);

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