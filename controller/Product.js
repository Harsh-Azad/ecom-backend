const { Product } = require('../model/Product');

exports.createProduct = async (req, res) => {
  // this product we have to get from API body
  
  const product = new Product(req.body);
  try {
    const doc = await product.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.fetchAllProducts = async (req, res) => {
  // filter = {"category":["smartphone","laptops"]}
  // sort = {_sort:"price",_order="desc"}
  // pagination = {_page:1,_limit=10}
  // TODO : we have to try with multiple category and brands after change in front-end
  let condition = {}
  if(!req.query.admin){
      condition.deleted = {$ne:true}
  }

  let query = Product.find(condition);
  let totalProductsQuery = Product.find(condition);

  if (req.query.category) {
    query = query.find({ category: req.query.category });
    totalProductsQuery = totalProductsQuery.find({
      category: req.query.category,
    });
  }
  if (req.query.brand) {
    query = query.find({ brand: req.query.brand });
    totalProductsQuery = totalProductsQuery.find({ brand: req.query.brand });
  }
  //TODO : How to get sort on discounted Price not on Actual price
  // if (req.query._sort && req.query._order) {
  //   query = query.sort({ [req.query._sort]: req.query._order });
  // }
  console.log(req.query);

  // if (req.query._sort && req.query._order) {
  //   if (['asc', 'desc'].includes(req.query._order.toLowerCase())) {
  //     query = query.sort({ [req.query._sort]: req.query._order });
  //   } else {
  //     console.error('Invalid _order value. Must be "asc" or "desc".');
  //   }
  // } else {
  //   console.error('Missing _sort or _order parameter.');
  // }

  if (req.query._sort) {
    // If _sort is provided, sort by it. Default to ascending order if _order is not provided.
    query = query.sort({ [req.query._sort]: 'asc' });
  } else {
    console.error('Missing _sort parameter.');
  }
  
  if (req.query._order) {
    if (['asc', 'desc'].includes(req.query._order.toLowerCase())) {
      // Apply the sort order to the last field added to the sort criteria
      let sortObj = query.options.sort;
      let lastSortField = Object.keys(sortObj)[Object.keys(sortObj).length - 1];
      sortObj[lastSortField] = req.query._order.toLowerCase() === 'asc' ? 1 : -1;
    } else {
      console.error('Invalid _order value. Must be "asc" or "desc".');
    }
  } else {
    console.error('Missing _order parameter.');
  }

  const totalDocs = await totalProductsQuery.count().exec();
  console.log({ totalDocs });

  if (req.query._page && req.query._limit) {
    const pageSize = req.query._limit;
    const page = req.query._page;
    query = query.skip(pageSize * (page - 1)).limit(pageSize);
  }

  try {
    // const docs = await query.exec();
    // res.set('X-Total-Count', totalDocs);
    // res.status(200).json(docs);
    const docs = await query.exec();
const response = {
  totalDocs: totalDocs,
  docs: docs
};
// res.status(200).send(JSON.stringify(response));
res.status(200).json(response);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.fetchProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndUpdate(id, req.body, {new:true});
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json(err);
  }
};