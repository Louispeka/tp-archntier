let canStop = true; // Indique si l'arrêt est autorisé ou non

// Fonction générique pour gérer les signaux
async function handleSignal(signal) {
  if (canStop) {
    console.log(`Signal ${signal} reçu.`);
    console.log("Nettoyage en cours...");
    
    // Attendez 5 secondes avant d'arrêter le processus
    setTimeout(() => {
      console.log("Nettoyage terminé. Arrêt du processus.");
      process.exit(0); // Quittez proprement le processus
    }, 5000);
  } else {
    console.log("Arrêt impossible pour le moment. Veuillez réessayer plus tard.");
  }
}

// Écoute du signal SIGINT
process.on("SIGINT", () => handleSignal("SIGINT"));

// Simulation d'une application qui reste active
console.log("Application en cours d'exécution.");
console.log("Appuyez sur CTRL+C pour envoyer un signal.");

// Exécute une fonction toutes les 5 secondes
setInterval(() => {
  // Alterne entre un état où l'arrêt est autorisé ou non
  canStop = !canStop;
  
  if (canStop) {
    console.log("Le processus est maintenant dans un état où il peut être arrêté.");
  } else {
    console.log("Le processus est maintenant dans un état critique. Arrêt impossible.");
  }
}, 5000);

// Exécute une fonction toutes les 5 secondes pour afficher que le processus est actif
setInterval(() => {
  console.log("Le processus est toujours actif...");
}, 5000);
