const mongoose = require('mongoose');

// 1. Define the Nested Variant Schema
const variantSchema = new mongoose.Schema({
  color: {
    type: String,
    required: [true, 'Variant color is required'],
    trim: true
  },
  size: {
    type: String,
    required: [true, 'Variant size is required'],
    enum: ['S', 'M', 'L', 'XL', 'XXL', 'One Size']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  }
}, { _id: false }); // Prevents auto _id for subdocs

// 2. Define the Main Product Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    unique: true // Optional: enforce unique product names
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price must be positive']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['Electronics', 'Apparel', 'Books', 'Home Goods', 'Accessories'],
    index: true // For faster filtering
  },
  description: {
    type: String,
    trim: true,
    default: 'No description provided yet.'
  },
  // 3. Implement the Nested Document Array
  variants: {
    type: [variantSchema],
    required: [true, 'At least one variant is required'],
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'Product must have at least one variant'
    }
  }
}, { timestamps: true });

// 4. Create and Export the Model
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
