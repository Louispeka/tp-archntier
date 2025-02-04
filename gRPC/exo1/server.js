const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const axios = require('axios');
const PROTO_PATH = './todo.proto';

// Chargement du fichier .proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

// Liste des tâches en mémoire
const tasks = [];

// Fonction pour appeler l'API FreeToGame
const getGamesFromAPI = async () => {
  try {
    const response = await axios.get('https://freetogame.com/api/games');
    console.log('Response from API:', response.data); // Ajoute ce log
    
    // Vérifie que la réponse est bien un tableau avant de tenter d'utiliser .map()
    if (Array.isArray(response.data)) {
      return response.data.map(game => ({
        id: game.id.toString(),
        title: game.title,
        genre: game.genre
      }));
    } else {
      console.error('La réponse n\'est pas un tableau:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
};


// Implémentation des méthodes du service TodoService
const addTask = (call, callback) => {
  const task = call.request;
  tasks.push(task);
  callback(null, { message: 'Task added successfully!' });
};

const getTasks = (call, callback) => {
  callback(null, { tasks });
};

// Création du serveur
const server = new grpc.Server();

// Ajout du service TodoService
server.addService(todoProto.TodoService.service, { addTask, getTasks });

// Service GameService
server.addService(todoProto.GameService.service, {
  GetGames: async (call, callback) => {
    console.log('Fetching games...');
    const games = await getGamesFromAPI();
    // Vérifier si les jeux sont correctement formatés
    if (Array.isArray(games)) {
      console.log('Games to be sent to client:', games);
      callback(null, { games });
    } else {
      console.error('Invalid game data received');
      callback({
        code: grpc.status.INVALID_ARGUMENT,
        details: 'Invalid game data'
      });
    }
  }
});

// Démarrage du serveur
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Server running on http://0.0.0.0:50051');
  server.start();
});
