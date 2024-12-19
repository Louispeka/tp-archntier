const net = require("net");

const client = net.createConnection({ port: 5001 }, () => {
  console.log("--- Connecté au serveur.");

  // Objet JSON à envoyer
  const request = {
    request: "echo",
    params: {
      text: "This is a test.",
    },
  };

  // Envoi du message JSON correctement formaté
  client.write(JSON.stringify(request) + "\n"); // Ajouter un saut de ligne pour bien délimiter la fin du message
});

client.on("data", (data) => {
  try {
    const response = JSON.parse(data.toString());
    console.log("Réponse du serveur :", response);
  } catch (error) {
    console.log("Erreur de parsing côté client :", error.message);
  }
  client.end();
});

client.on("end", () => {
  console.log("--- Déconnecté du serveur.");
});
