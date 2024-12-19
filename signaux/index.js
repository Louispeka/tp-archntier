// Fonction générique pour gérer les signaux
async function handleSignal(signal) {
    console.log(`Signal ${signal} reçu.`);
  }
  
  // Ecoute du signal SIGINT.
  process.on("SIGINT", () => handleSignal("SIGINT"));
  
  // Simulation d'une application qui reste active
  console.log("Application en cours d'exécution.");
  console.log(
    "Appuyez sur CTRL+C pour envoyer un signal."
  );
  
  // Execute la fonction toutes les 5 secondes.
  setInterval(() => {
    console.log("Le processus est toujours actif...");
  }, 5000);
  