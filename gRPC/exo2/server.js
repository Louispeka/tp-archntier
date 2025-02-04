const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { MongoClient } = require('mongodb');
const PROTO_PATH = './todo.proto';

// Chargement du fichier .proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

const client = new MongoClient('mongodb://localhost:27017');
const dbName = 'productDB';
const collectionName = 'products';

// Connexion à MongoDB
let db;
let productsCollection;

const connectToDatabase = async () => {
  try {
    await client.connect();
    db = client.db(dbName);
    productsCollection = db.collection(collectionName);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
  }
};

// Ajouter un produit
const addProduct = async (call, callback) => {
  const product = call.request;
  try {
    const result = await productsCollection.insertOne(product);
    callback(null, { message: `Product added with ID: ${result.insertedId}` });
  } catch (err) {
    console.error('Error adding product:', err);
    callback(err);
  }
};

// Mettre à jour un produit
const updateProduct = async (call, callback) => {
  const product = call.request;
  try {
    const result = await productsCollection.updateOne(
      { id: product.id },
      { $set: product }
    );
    if (result.modifiedCount > 0) {
      callback(null, { message: 'Product updated successfully' });
    } else {
      callback(null, { message: 'Product not found' });
    }
  } catch (err) {
    console.error('Error updating product:', err);
    callback(err);
  }
};

// Supprimer un produit
const deleteProduct = async (call, callback) => {
  const { id } = call.request;
  try {
    const result = await productsCollection.deleteOne({ id });
    if (result.deletedCount > 0) {
      callback(null, { message: 'Product deleted successfully' });
    } else {
      callback(null, { message: 'Product not found' });
    }
  } catch (err) {
    console.error('Error deleting product:', err);
    callback(err);
  }
};

// Récupérer tous les produits
const getProducts = async (call, callback) => {
  try {
    const products = await productsCollection.find().toArray();
    callback(null, { products });
  } catch (err) {
    console.error('Error fetching products:', err);
    callback(err);
  }
};

// Création du serveur gRPC
const server = new grpc.Server();

// Ajout des services
server.addService(todoProto.ProductService.service, {
  AddProduct: addProduct,
  UpdateProduct: updateProduct,
  DeleteProduct: deleteProduct,
  GetProducts: getProducts,
});

// Connexion à MongoDB et démarrage du serveur
connectToDatabase().then(() => {
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Server running on http://0.0.0.0:50051');
    server.start();
  });
});
