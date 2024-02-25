import mongoose, { connect } from "mongoose";
import readline from "readline";

await mongoose.connect("mongodb://localhost:27017/ProductAssignment");

const r1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const SupplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact: { type: String },
    email: { type: String },
  });
  
  const SupplierModel = mongoose.model("Supplier", SupplierSchema);
  
  const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
  });
  
  const CategoryModel = mongoose.model("Category", CategorySchema);
  
  const ProductSchema = new mongoose.Schema({
    name: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    price: { type: Number },
    cost: { type: Number },
    stock: { type: Number },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }, 
});

const ProductModel = mongoose.model("Product", ProductSchema);

  
  const OfferSchema = new mongoose.Schema({
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    price: { type: Number },
    active: { type: Boolean },
  });
  
  const OfferModel = mongoose.model("Offer", OfferSchema);
  
  const SalesOrderSchema = new mongoose.Schema({
    offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
    quantity: { type: Number },
    status: { type: String },
    createdAt: { type: Date, default: Date.now },
  });
  
  const SalesOrderModel = mongoose.model("SalesOrder", SalesOrderSchema);

async function prompt(question) {
    return new Promise((resolve) => {
        r1.question(question, resolve);
    });
}

async function displaymenu() {
  console.log("1. add new category");
  console.log("2. add new product");
  console.log("3. view products by category");
  console.log("4. view products by supplier");
  console.log("5. view all offer withing price range");
  console.log(
    "6. view all offers that contain a product from a specific category"
  );
  console.log(
    "7. view the number of offers based on the number of its products in stock"
  );
  console.log("8. create order for products");
  console.log("9. create order for offers");
  console.log("10. ship orders");
  console.log("11. add a new supplier");
  console.log("12. view suppliers");
  console.log("13. view all sales");
  console.log("14. view sum of all profits");
  console.log("15. Enter product name to view profits");
  console.log("16. End program");
}

async function addnewcategory() {
  try {
      console.log("Add new category");
      const categoryName = await prompt("Category: ");
      const newCategory = {
          name: categoryName,
      };
      const category = new CategoryModel(newCategory);
      await category.save();
      console.log("Category added successfully!");
      displaymenu();
  } catch (error) {
      console.log("Couldn't add new category, try again", error);
      displaymenu();
  }
}


async function addnewproduct() {
  try {
      console.log("Enter details for the new product");

      const allCategories = await CategoryModel.find();
      console.log("Available Categories:");
      allCategories.forEach((category, index) => {
          console.log(`${index + 1}. ${category.name}`);
      });

      const selectedCategoryIndex = parseInt(await prompt("Select a category (enter index): "), 10);
      if (isNaN(selectedCategoryIndex) || selectedCategoryIndex < 1 || selectedCategoryIndex > allCategories.length) {
          console.log("Invalid category index. Please try again.");
          displaymenu();
          return;
      }

      const selectedCategory = allCategories[selectedCategoryIndex - 1];

      const allSuppliers = await SupplierModel.find();
      console.log("Available Suppliers:");
      allSuppliers.forEach((supplier, index) => {
          console.log(`${index + 1}. ${supplier.name}`);
      });

      const selectedSupplierIndex = parseInt(await prompt("Select a supplier (enter index): "), 10);
      if (isNaN(selectedSupplierIndex) || selectedSupplierIndex < 1 || selectedSupplierIndex > allSuppliers.length) {
          console.log("Invalid supplier index. Please try again.");
          displaymenu();
          return;
      }

      const selectedSupplier = allSuppliers[selectedSupplierIndex - 1];

      const newProduct = {
          name: await prompt("Name: "),
          category: selectedCategory._id, 
          price: parseInt(await prompt("Price: "), 10),
          cost: parseInt(await prompt("Cost: "), 10),
          stock: parseInt(await prompt("Stock: "), 10),
          supplier: selectedSupplier._id, 
      };

      const product = new ProductModel(newProduct);
      await product.save();
      console.log("Product added successfully!");
      displaymenu();
  } catch (error) {
      console.log("Couldn't add new product, try again", error);
      displaymenu();
  }
}


 
   async function createOrderForProduct() {
    try {
        console.log("Create Sales Order for Individual Product");

        const allProducts = await ProductModel.find();
        console.log("Available Products:");
        allProducts.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name}`);
        });

        const selectedProductIndex = parseInt(await prompt("Select a product (enter index): "), 10);
        if (isNaN(selectedProductIndex) || selectedProductIndex < 1 || selectedProductIndex > allProducts.length) {
            console.log("Invalid product index. Please try again.");
            displaymenu();
            return;
        }

        const selectedProduct = allProducts[selectedProductIndex - 1];

        const promptForOrderDetails = async () => {
            const quantity = parseInt(await prompt("Enter the quantity: "), 10);
            const additionalDetails = await prompt("Enter additional details: ");

            const totalCost = selectedProduct.price * quantity;

            const newOrder = new SalesOrderModel({
                offer: null, 
                products: [selectedProduct._id],
                quantity,
                status: "pending", 
                additionalDetails
            });
            await newOrder.save();

            console.log("Sales order created successfully:");
            console.log("Product:", selectedProduct);
            console.log("Quantity:", quantity);
            console.log("Additional Details:", additionalDetails);
            console.log("Total Cost:", totalCost);

            displaymenu();
        };
        
        await promptForOrderDetails();
    } catch (error) {
        console.log("Error occurred while creating sales order:", error);
        displaymenu();
    }
}


  async function createOrderForOffer() {
    try {
        console.log("Create Sales Order for Entire Offer");

        const allOffers = await OfferModel.find();
        console.log("Available Offers:");
        allOffers.forEach((offer, index) => {
            console.log(`${index + 1}. Offer ID: ${offer._id}`);
        });

        const selectedOfferIndex = parseInt(await prompt("Select an offer (enter index): "), 10);
        if (isNaN(selectedOfferIndex) || selectedOfferIndex < 1 || selectedOfferIndex > allOffers.length) {
            console.log("Invalid offer index. Please try again.");
            displaymenu();
            return;
        }

        const selectedOffer = allOffers[selectedOfferIndex - 1];

        const quantity = parseInt(await prompt("Enter the quantity: "), 10);
        const additionalDetails = await prompt("Enter additional details: ");

        let totalCost = 0;
        selectedOffer.products.forEach(product => {
            totalCost += product.price * quantity;
        });

        const newOrder = new SalesOrderModel({
            offer: selectedOffer._id,
            quantity,
            status: "pending", 
            additionalDetails
        });
        await newOrder.save();

        console.log("Sales order created successfully:");
        console.log("Offer:", selectedOffer);
        console.log("Quantity:", quantity);
        console.log("Additional Details:", additionalDetails);
        console.log("Total Cost:", totalCost);

        displaymenu();
    } catch (error) {
        console.log("Error occurred while creating sales order:", error);
        displaymenu();
    }
}


  async function shipOrders() {
    try {
        console.log("Ship Orders");

        const pendingOrders = await SalesOrderModel.find({ status: "pending" }).populate('offer');

        if (pendingOrders.length === 0) {
            console.log("No pending orders found.");
            displaymenu();
            return;
        }

        console.log("Pending Orders:");
        pendingOrders.forEach((order, index) => {
            console.log(`${index + 1}. Order ID: ${order._id}`);
        });

        const selectedOrderIndex = parseInt(await prompt("Select an order to ship (enter index): "), 10);

        if (isNaN(selectedOrderIndex) || selectedOrderIndex < 1 || selectedOrderIndex > pendingOrders.length) {
            console.log("Invalid order index. Please try again.");
            displaymenu();
            return;
        }

        const selectedOrder = pendingOrders[selectedOrderIndex - 1];

        if (!selectedOrder.offer || !selectedOrder.offer.products) {
            console.log(`Invalid offer or products in order ID: ${selectedOrder._id}`);
            displaymenu();
            return;
        }

        selectedOrder.status = "shipped";
        await selectedOrder.save();

        for (const product of selectedOrder.offer.products) {
            const updatedProduct = await ProductModel.findById(product._id);
            updatedProduct.stock -= selectedOrder.quantity;
            await updatedProduct.save();
        }

        console.log(`Order ID: ${selectedOrder._id} has been successfully shipped.`);
        displaymenu();

    } catch (error) {
        console.log("Error occurred while shipping orders:", error);
        displaymenu();
    }
}



  async function addNewSupplier() {
    try {
        console.log("Add a New Supplier");
        const newName = await prompt("Supplier Name: ");
        const newContact = await prompt("Contact Person: ");
        const newEmail = await prompt("Email Address: ");

        const newSupplier = new SupplierModel({
            name: newName,
            contactPerson: newContact,
            email: newEmail
        });

        await newSupplier.save();
        console.log("New supplier added successfully!");
        displaymenu();
    } catch (error) {
        console.log("Couldn't add new supplier, try again", error);
        displaymenu();
    }
}



  async function viewAllSuppliers() {
    try {
        const allSuppliers = await SupplierModel.find();
        console.log("All Suppliers:");
        allSuppliers.forEach((supplier, index) => {
            const supplierNumber = index + 1;
            const { name, contact, email } = supplier;
            console.log(`Supplier Number: ${supplierNumber}`);
            console.log(`Name: ${name}`);
            console.log(`Contact Person: ${contact}`);
            console.log(`Email: ${email}`);
            console.log("----------------------------");
        });
    } catch (error) {
        console.log("Error occurred while fetching suppliers:", error);
    }
}


  async function viewallSales() {
    try {
        const allSalesOrders = await SalesOrderModel.find().populate('offer');
        console.log("All Sales Orders:");
        allSalesOrders.forEach((order, index) => {
            const orderNumber = index + 1;
            const orderDate = order.createdAt; 
            const orderStatus = order.status;
            let totalCost = 0;

            order.offer.products.forEach(product => {
                totalCost += product.price * order.quantity;
            });

            console.log(`Order Number: ${orderNumber}`);
            console.log(`Date: ${orderDate}`);
            console.log(`Status: ${orderStatus}`);
            console.log(`Total Cost: ${totalCost}`);
            console.log("----------------------------");
        });
    } catch (error) {
        console.log("Error occurred while fetching sales orders:", error);
    }
}




  async function viewsumProfit() {
    try {
        const salesOrders = await SalesOrderModel.find().populate({
            path: 'offer',
            populate: {
                path: 'products',
                model: 'Product'
            }
        });

        let totalProfit = 0;

        for (const order of salesOrders) {
            let orderProfit = 0;

            for (const product of order.offer.products) {
                const revenue = product.price * order.quantity;
                const cost = product.cost * order.quantity;
                orderProfit += revenue - cost;
            }

            totalProfit += orderProfit;
        }

        console.log(`Total profit generated from all sales orders: $${totalProfit}`);
    } catch (error) {
        console.log("Error occurred while calculating total profit:", error);
    }
}

async function viewProfitForProduct(productName) {
    try {
        const product = await ProductModel.findOne({ name: productName });
        if (!product) {
            console.log(`Product '${productName}' not found.`);
            return;
        }

        const salesOrders = await SalesOrderModel.find({}).populate({
            path: 'offer',
            populate: {
                path: 'products',
                model: 'Product'
            }
        });

        let totalProfitForProduct = 0;

        for (const order of salesOrders) {
            const productInOffer = order.offer.products.find(p => p.name === productName);
            if (productInOffer) {
                const revenue = productInOffer.price * order.quantity;
                const cost = productInOffer.cost * order.quantity;
                const productProfit = revenue - cost;
                totalProfitForProduct += productProfit;
            }
        }

        console.log(`Total profit generated from sales orders containing '${productName}': $${totalProfitForProduct}`);
    } catch (error) {
        console.log("Error occurred while calculating profit for product:", error);
    }
}


async function viewproductsCategory() {
  try {
      console.log("View Products by Category");

      const allCategories = await CategoryModel.find();
      console.log("Available Categories:");
      allCategories.forEach((category, index) => {
          console.log(`${index + 1}. Category: ${category.name}`);
      });

      const selectedCategoryIndex = parseInt(await prompt("Select a category (enter index): "), 10);
      if (isNaN(selectedCategoryIndex) || selectedCategoryIndex < 1 || selectedCategoryIndex > allCategories.length) {
          console.log("Invalid category index. Please try again.");
          displaymenu();
          return;
      }

      const selectedCategory = allCategories[selectedCategoryIndex - 1];
      const productsInCategory = await ProductModel.find({ category: selectedCategory._id });

      console.log(`Products in Category '${selectedCategory.name}':`);
      productsInCategory.forEach(product => {
          console.log(`- Product ID: ${product._id}, Name: ${product.name}`);
      });

      displaymenu();
  } catch (error) {
      console.log("Error occurred while fetching products by category:", error);
      displaymenu();
  }
}
async function viewproductsSupplier() {
  try {
      console.log("View Products by Supplier");

      const allSuppliers = await SupplierModel.find();
      console.log("Available Suppliers:");
      allSuppliers.forEach((supplier, index) => {
          console.log(`${index + 1}. Supplier: ${supplier.name}`);
      });

      const selectedSupplierIndex = parseInt(await prompt("Select a supplier (enter index): "), 10);
      if (isNaN(selectedSupplierIndex) || selectedSupplierIndex < 1 || selectedSupplierIndex > allSuppliers.length) {
          console.log("Invalid supplier index. Please try again.");
          displaymenu();
          return;
      }

      const selectedSupplier = allSuppliers[selectedSupplierIndex - 1];
      const productsBySupplier = await ProductModel.find({ supplier: selectedSupplier._id });

      console.log(`Products by Supplier '${selectedSupplier.name}':`);
      productsBySupplier.forEach(product => {
          console.log(`- Product ID: ${product._id}, Name: ${product.name}`);
      });

      displaymenu();
  } catch (error) {
      console.log("Error occurred while fetching products by supplier:", error);
      displaymenu();
  }
}

async function viewalloffersPriceRange() {
  try {
      const minPrice = parseFloat(await prompt("Enter the minimum price: "));
      const maxPrice = parseFloat(await prompt("Enter the maximum price: "));

      if (isNaN(minPrice) || isNaN(maxPrice) || minPrice < 0 || maxPrice < 0 || minPrice > maxPrice) {
          console.log("Invalid price range. Please try again.");
          displaymenu();
          return;
      }

      const offersInRange = await OfferModel.find({
          price: { $gte: minPrice, $lte: maxPrice },
      }).populate('products');

      console.log(`Offers within the price range $${minPrice} - $${maxPrice}:`);
      offersInRange.forEach((offer, index) => {
          const offerNumber = index + 1;
          const offerPrice = offer.price;
          const offerProducts = offer.products.map(product => product.name).join(', ');

          console.log(`Offer Number: ${offerNumber}`);
          console.log(`Price: $${offerPrice}`);
          console.log(`Products: ${offerProducts}`);
          console.log("----------------------------");
      });
10
      displaymenu();
  } catch (error) {
      console.log("Error occurred while fetching offers:", error);
      displaymenu();
  }
}
async function viewalloffersSpecCategory() {}
async function viewnumberOfOffersStock() {
  try {
      console.log("View Number of Offers based on Stock");

    const allOffers = await OfferModel.find().populate('products');

      const stockCount = {};

      allOffers.forEach((offer) => {
          const totalStock = offer.products.reduce((acc, product) => acc + product.stock, 0);

          if (!stockCount[totalStock]) {
              stockCount[totalStock] = 1;
          } else {
              stockCount[totalStock]++;
          }
      });

      console.log("Number of Offers based on Stock:");
      for (const stockLevel in stockCount) {
          console.log(`Stock Level: ${stockLevel}, Number of Offers: ${stockCount[stockLevel]}`);
      }

      displaymenu();
  } catch (error) {
      console.log("Error occurred while viewing offers based on stock:", error);
      displaymenu();
  }
}

displaymenu();
r1.on("line", async (input) => {
  switch (input) {
    case "1":
      addnewcategory();
      break;


    case "2":
      addnewproduct();
      break;


    case "3":
      viewproductsCategory();
      break;


    case "4":
      viewproductsSupplier();
      break;


    case "5":
      viewalloffersPriceRange();
      break;


    case "6":
      viewalloffersSpecCategory();
      break;


    case "7":
      viewnumberOfOffersStock();
      break;


    case "8":
      createOrderForProduct();
      break;


    case "9":
      createOrderForOffer();
      break;


    case "10":
      shipOrders();
      break;


    case "11":
      addNewSupplier();
      break;


    case "12":
      viewAllSuppliers();
      break;


    case "13":
      viewallSales();
      break;


    case "14":
      viewsumProfit();
      break;

 case "15": 
            const productName = await prompt("Enter product name to view profits: ");
            viewProfitForProduct(productName);
            break;

    case "16":
      mongoose.disconnect();
      r1.close();
      break;


    default:
      console.log("Wrong input");
      break;

      
  }
});