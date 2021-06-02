const connectedUsers = {}; // Pour permettre de garder une trace de "connectedUsers" dans le jeu
const choices = {}; // sa save les choix entre pierre feuille et ciseaux ici
const moves = { // Pour savoir quel objet gagne par rapport a l'autre
    "pierre": "ciseaux",
    "feuille": "pierre",
    "ciseaux": "feuille"
};

// permet d'initialiser les choix pour les recuperer apres dans notre index
const initializeChoices = (roomId) => {
    choices[roomId] = ["", ""]
}

//pour savoir si joueur est connecté et le renvoyer ensuite dans l'index
const userConnected = (userId) => {
    connectedUsers[userId] = true;
}

const makeMove = (roomId, player, choice) => {
    if(choices[roomId]){
        choices[roomId][player - 1] = choice; // -1 parce que si le joueur gagne il va prendre la premiere position du tableau (array) qui est 0
    }
}

module.exports = {connectedUsers, initializeChoices, userConnected, makeMove, moves, choices}; //pour exporter les modules 