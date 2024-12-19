const net = require("net");

// Port de la socket pour le serveur
const PORT = 5001;

// Création du serveur, la socket ouverte par le client est en paramètre.
const server = net.createServer((socket) => {
  console.log("--- Client connecté.");
  // Écouter les requêtes RPC du client
  socket.on("data", (data) => {
    const name = data.toString();

    socket.write(`Hello world ${name}!`);
  });
  socket.on("end", () => {
    console.log("--- Client déconnecté.");
  });
});

// Démarre le serveur sur le port 5001
server.listen(PORT, () => {
  console.log(`Serveur RPC en écoute sur le port ${PORT}`);
});
