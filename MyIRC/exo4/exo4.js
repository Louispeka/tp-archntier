const net = require("net");

// Port IRC par défaut
const PORT = 6667;

// Liste des clients connectés
const clients = [];

// Fonction pour diffuser un message à tous les clients sauf l'expéditeur
function broadcast(message, sender) {
  clients.forEach((client) => {
    if (client.socket !== sender) {
      client.socket.write(message + "\n" + "\r");
    }
  });
}

// Fonction pour envoyer un message privé (whisper)
function sendWhisper(sender, recipientNickname, message) {
  const recipient = clients.find((client) => client.nickname === recipientNickname);
  if (recipient) {
    recipient.socket.write(`[Whisper][${sender}]: ${message}\n\r`);
    return true;
  }
  return false;
}

// Création du serveur TCP
const server = net.createServer((socket) => {
  console.log("Un utilisateur s'est connecté.");
  socket.write("Bienvenue sur MyIRC ! Quel est votre pseudo ?\n\r");

  let nickname = null; // Stocke le pseudo de l'utilisateur
  let buffer = ""; // Tampon pour accumuler les données reçues

  // Ajouter le client à la liste des clients
  clients.push({ socket, nickname: null });

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
            const client = clients.find((c) => c.socket === socket);
            client.nickname = nickname; // Mettre à jour le pseudo du client
            socket.write(`Bienvenue ${nickname} ! Vous pouvez commencer à discuter.\n\r`);
            broadcast(`--- ${nickname} a rejoint le chat ---`, socket);
          }
          return;
        }

        // Commande /list pour afficher les pseudos des utilisateurs connectés
        if (message === "/list") {
          const nicknames = clients
            .filter((client) => client.nickname)
            .map((client) => client.nickname)
            .join(", ");
          socket.write(`Utilisateurs connectés : ${nicknames}\n\r`);
          return;
        }

        // Commande /whisper pour envoyer un message privé
        if (message.startsWith("/whisper")) {
          const parts = message.split(" ");
          if (parts.length < 3) {
            socket.write("Usage : /whisper <pseudo> <message>\n\r");
            return;
          }

          const recipientNickname = parts[1];
          const whisperMessage = message.split(" ").slice(2).join(" ");
          const success = sendWhisper(nickname, recipientNickname, whisperMessage);
          if (success) {
            socket.write(`[Whisper][To ${recipientNickname}]: ${whisperMessage}\n\r`);
          } else {
            socket.write(`Utilisateur ${recipientNickname} introuvable.\n\r`);
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
    const index = clients.findIndex((client) => client.socket === socket);
    if (index !== -1) {
      const disconnectedNickname = clients[index].nickname;
      clients.splice(index, 1); // Retirer le client de la liste
      if (disconnectedNickname) {
        console.log(`${disconnectedNickname} s'est déconnecté.`);
        broadcast(`--- ${disconnectedNickname} a quitté le chat ---`, socket);
      }
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
