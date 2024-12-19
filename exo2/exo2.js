const net = require("net");

// Port IRC par défaut
const PORT = 6667;

// Liste des clients connectés
const clients = [];

// Fonction pour diffuser un message à tous les clients sauf l'expéditeur
function broadcast(message, sender) {
  clients.forEach((client) => {
    if (client !== sender) {
      client.write(message + "\n" + "\r");
    }
  });
}

// Création du serveur TCP
const server = net.createServer((socket) => {
  console.log("Un utilisateur s'est connecté.");
  socket.write("Bienvenue sur MyIRC ! Quel est votre pseudo ?\n\r");

  let nickname = null; // Stocke le pseudo de l'utilisateur
  let buffer = ""; // Tampon pour accumuler les données reçues

  // Ajouter le client à la liste des clients
  clients.push(socket);

  // Gérer les données reçues
  socket.on("data", (data) => {
    buffer += data.toString(); // Accumuler les données dans le tampon

    // Vérifier si une ligne complète a été envoyée (finissant par \n)
    if (buffer.includes("\n")) {
      const messages = buffer.split("\n"); // Découper les messages complets
      buffer = messages.pop(); // Garder les données incomplètes dans le tampon

      messages.forEach((message) => {
        message = message.trim(); // Supprimer les espaces inutiles

        // Si le pseudo n'est pas encore défini, le configurer
        if (!nickname) {
          if (message.length < 2) {
            socket.write("Votre pseudo doit contenir au moins 2 caractères.\n\r");
          } else {
            nickname = message;
            socket.write(`Bienvenue ${nickname} ! Vous pouvez commencer à discuter.\n\r`);
            broadcast(`--- ${nickname} a rejoint le chat ---`, socket);
          }
          return;
        }

        // Sinon, diffuser le message aux autres clients
        if (message.length > 0) {
          broadcast(`${nickname}: ${message}`, socket);
        }
      });
    }
  });

  // Gérer la déconnexion d'un client
  socket.on("end", () => {
    clients.splice(clients.indexOf(socket), 1); // Retirer le client de la liste
    console.log(`${nickname} s'est déconnecté.`);
    if (nickname) {
      broadcast(`--- ${nickname} a quitté le chat ---`, socket);
    }
  });

  // Gérer les erreurs
  socket.on("error", (err) => {
    console.error(`Erreur avec ${nickname || "un utilisateur"}: ${err.message}`);
  });
});

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`Serveur IRC en écoute sur le port ${PORT}`);
});
