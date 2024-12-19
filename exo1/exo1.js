const net = require("net");

// Port du serveur
const PORT = 5001;

// Création du serveur
const server = net.createServer((socket) => {
  console.log("--- Client connecté.");

  // Écoute des données envoyées par le client
  socket.on("data", (data) => {
    try {
      // Conversion des données reçues en objet JSON
      const requestData = JSON.parse(data.toString());

      // Vérification de la requête
      if (requestData.request === "echo") {
        const text = requestData.params?.text;

        if (text) {
          // Envoie de la réponse au client
          const response = {
            status: "success",
            message: text,
          };
          socket.write(JSON.stringify(response));
        } else {
          // Paramètre manquant
          const errorResponse = {
            status: "error",
            message: "Missing 'text' parameter in 'params'.",
          };
          socket.write(JSON.stringify(errorResponse));
        }
      } else {
        // Requête inconnue
        const unknownResponse = {
          status: "error",
          message: "Unknown request type.",
        };
        socket.write(JSON.stringify(unknownResponse));
      }
    } catch (error) {
      // Gestion des erreurs de parsing JSON
      const parseError = {
        status: "error",
        message: "Invalid JSON format.",
      };
      socket.write(JSON.stringify(parseError));
    }
  });

  // Gestion de la déconnexion
  socket.on("end", () => {
    console.log("--- Client déconnecté.");
  });
});

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`Serveur RPC en écoute sur le port ${PORT}`);
});
