const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = './todo.proto';

// Chargement du fichier .proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

// Création du client pour TodoService
const todoClient = new todoProto.TodoService('localhost:50051', grpc.credentials.createInsecure());

// Création du client pour GameService
const gameClient = new todoProto.GameService('localhost:50051', grpc.credentials.createInsecure());

// Ajouter une tâche
todoClient.addTask({ id: '1', description: 'Learn gRPC' }, (err, response) => {
  if (err) {
    console.error('Error adding task:', err);
    return;
  }
  console.log('Add Task Response:', response.message);

  // Récupérer les tâches
  todoClient.getTasks({}, (err, response) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return;
    }
    console.log('Tasks:');
    response.tasks.forEach((task) => {
      console.log(`- [${task.id}] ${task.description}`);
    });

    // Récupérer les jeux
    gameClient.GetGames({}, (err, response) => {
      if (err) {
        console.error('Error fetching games:', err);
        return;
      }
      if (response && response.games) {
        console.log('Games:');
        response.games.forEach((game) => {
          console.log(`- [${game.id}] ${game.title} (${game.genre})`);
        });
      } else {
        console.error('No games found in the response.');
      }
    });
  });
});
