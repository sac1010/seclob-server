// app.js

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://sachingirish101:sac101@cluster0.6v8i1ux.mongodb.net/seclob",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Create MongoDB Schemas
const productSchema = new mongoose.Schema({
  name: String,
  image: String,
});

const categorySchema = new mongoose.Schema({
  category: String,
  color: String,
  products: [productSchema],
});

// Create MongoDB Models
const Product = mongoose.model("Product", productSchema);
const Category = mongoose.model("Category", categorySchema);

// Middleware
app.use(bodyParser.json());

// Routes

// Get all categories and products
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new category
app.post("/api/categories", async (req, res) => {
  const { category, color } = req.body;

  try {
    const newCategory = new Category({ category, color });
    await newCategory.save();
    res.json(newCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new product to a category
app.post("/api/categories/:categoryId/products", async (req, res) => {
  const { name, image } = req.body;
  const categoryId = req.params.categoryId;

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const newProduct = new Product({ name, image });
    category.products.push(newProduct);
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove a product from a category
app.delete(
  "/api/categories/:categoryId/products/:productId",
  async (req, res) => {
    const categoryId = req.params.categoryId;
    const productId = req.params.productId;

    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      category.products.id(productId).remove();
      await category.save();
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Remove a category
app.delete("/api/categories/:categoryId", async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    const category = await Category.findByIdAndRemove(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
