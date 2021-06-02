const rooms = {}; //Pour permettre de garder une trace de "rooms" dans le jeu

const createRoom = (roomId, player1Id) => { //creation de salle avec le joueur
    rooms[roomId] = [player1Id, ""];
}

const joinRoom = (roomId, player2Id) => { // rejoindre la salle avec le joueur 2
    rooms[roomId][1] = player2Id;
}

const exitRoom = (roomId, player) => { //quitter la salle
    if(player === 1){                   // si le premier joueur quitte la salle se ferme
        delete rooms[roomId];
    }else{
        rooms[roomId][1] = ""; //sinon sa va fermer pour lui seulement 
    }
}

module.exports = {rooms, createRoom, joinRoom, exitRoom}; // on exporte les modules creers