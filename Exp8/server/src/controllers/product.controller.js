import { Product } from '../models/Product.js';

export async function createProduct(req, res) {
  try {
    const { title, description, price, images = [], category, location } = req.body;
    if (!title || price == null) return res.status(400).json({ error: 'Missing fields' });

    const product = await Product.create({
      title,
      description,
      price,
      images,
      category,
      location,
      seller: req.user.id,
    });
    res.status(201).json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function listProducts(req, res) {
  try {
    const { q, category, location, status, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (location) filter.location = location;
    if (status) filter.status = status;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('seller', 'name avatarUrl'),
      Product.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name avatarUrl');
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function updateProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    if (product.seller.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const allowed = ['title', 'description', 'price', 'images', 'category', 'location', 'status'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) product[key] = req.body[key];
    }
    await product.save();
    res.json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    if (product.seller.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    await product.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function listMyProducts(req, res) {
  try {
    const items = await Product.find({ seller: req.user.id }).sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
