const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = './todo.proto';

// Chargement du fichier .proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

// Création du client pour ProductService
const productClient = new todoProto.ProductService('localhost:50051', grpc.credentials.createInsecure());

// Ajout d'un produit
productClient.addProduct({ id: '1', name: 'Product A', description: 'A sample product' }, (err, response) => {
  if (err) {
    console.error('Error adding product:', err);
    return;
  }
  console.log('Add Product Response:', response.message);

  // Mettre à jour un produit
  productClient.updateProduct({ id: '1', name: 'Product A Updated', description: 'Updated description' }, (err, response) => {
    if (err) {
      console.error('Error updating product:', err);
      return;
    }
    console.log('Update Product Response:', response.message);

    // Supprimer un produit
    productClient.deleteProduct({ id: '1' }, (err, response) => {
      if (err) {
        console.error('Error deleting product:', err);
        return;
      }
      console.log('Delete Product Response:', response.message);

      // Récupérer les produits
      productClient.getProducts({}, (err, response) => {
        if (err) {
          console.error('Error fetching products:', err);
        } else {
          if (response && response.products) {
            console.log('Products:', response.products);
          } else {
            console.log('No products found or incorrect format');
          }
        }
      });
    });
  });
});
