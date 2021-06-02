const express = require("express"); // pour creer l'application
const http = require("http"); //pour creer le serveur
const path = require("path");
const socketio = require("socket.io");

const app = express(); //creation de l'application

const server = http.createServer(app); //creation du serveur / on "path" l'application

app.use(express.static(path.join(__dirname, "public"))); //pour utiliser le dossier "public"

const io = socketio(server); // pour checker la connexion

const {userConnected, connectedUsers, initializeChoices, moves, makeMove, choices} = require("./util/users"); // on importe ici
const {createRoom, joinRoom, exitRoom, rooms} = require("./util/rooms"); // on importe ici
const e = require("express");
const { exitCode } = require("process");

io.on("connection", socket => { //sa lis à chaque fois la connexion et chaque fois que la connexion s'effectue on a un "socket"
    socket.on("create-room", (roomId) => { //sa lis la creation de la salle "le room"
        if(rooms[roomId]){ // si la salle existe on peut pas en recrer une avec le meme id
            const error = "La salle existe deja"; // c'est pour cela que sa affichera une erreur
            socket.emit("display-error", error); //du coup sa envoie au client
        }else{
            userConnected(socket.client.id); //mais si la salle n'existe pas on peut connecter nos utilisateurs / on le retrouve dans user.js a la ligne 13
            createRoom(roomId, socket.client.id); //on peut alors creer la salle / on lui met l'id
            socket.emit("room-created", roomId);// creer l'evenement pour creer la salle / on met roomId en parametre pour sauvegarder 
            socket.emit("player-1-connected");// cela va donc creer l'evenement / pour savoir quel joueur on est
            socket.join(roomId);//et finalement l'id pour rejoindre la salle
        }
    })
    //La méthode on() attache un ou plusieurs gestionnaires d'événements pour les éléments sélectionnés
    socket.on("join-random", () => { //pour rejoindre la salle en random
        let roomId = ""; //on initialise

        for(let id in rooms){ //on check tout les salles jusqu a en trouver une libre
            if(rooms[id][1] === ""){ // pour checker si l'id du 2 eme joueur est vide/libre
                roomId = id;
                break;
            }
        }

        if(roomId === ""){ //on veut check si l'id de la salle est null
            const error = "La game est full ou elle n'existe pas "; //si elle est null on envoie une erreur
            socket.emit("display-error", error);
        }else{
            userConnected(socket.client.id); //mais si la salle n'existe pas on peut connecter nos utilisateurs / on le retrouve dans user.js a la ligne 13
            joinRoom(roomId, socket.client.id);// on peut alors rejoindre la salle / on lui met l'id
            socket.join(roomId); //et finalement l'id pour rejoindre la salle

            socket.emit("room-joined", roomId); //creer l'evenement pour rejoindre la salle / on met roomId en parametre pour sauvegarder
            socket.emit("player-2-connected");// cela va donc creer l'evenement / pour savoir quel joueur on est
            socket.broadcast.to(roomId).emit("player-2-connected");
            initializeChoices(roomId);
        }
    });

    socket.on("make-move", ({playerId, myChoice, roomId}) => { //on va faire un, make-move event /* met en paremetres ces 3 la
        makeMove(roomId, playerId, myChoice);

        if(choices[roomId][0] !== "" && choices[roomId][1] !== ""){ //on veut voir les 2 joueurs font des choix
            let playerOneChoice = choices[roomId][0]; //on fais correspondre les joueurs a leurs choix
            let playerTwoChoice = choices[roomId][1];

            if(playerOneChoice === playerTwoChoice){
                let message = "Vous avez tout les deux choisit " + playerOneChoice + " . C'est une égalité";
                io.to(roomId).emit("draw", message); //pour que les 2 joueurs voient le message
                
            }else if(moves[playerOneChoice] === playerTwoChoice){
                let enemyChoice = "";

                if(playerId === 1){
                    enemyChoice = playerTwoChoice;
                }else{
                    enemyChoice = playerOneChoice;
                }

                io.to(roomId).emit("player-1-wins", {myChoice, enemyChoice}); // si le joueur 1 gagne
            }else{
                let enemyChoice = "";

                if(playerId === 1){ //si on est le joueur 1 le choix de "l'ennemi revient a celui du joueur 2"
                    enemyChoice = playerTwoChoice;
                }else{
                    enemyChoice = playerOneChoice;
                }

                io.to(roomId).emit("player-2-wins", {myChoice, enemyChoice}); //si le joueur 2 gagne
            }

            choices[roomId] = ["", ""];
        }
    });

    socket.on("disconnect", () => { //la deconnexion
        if(connectedUsers[socket.client.id]){
            let player; //on initialise les variables
            let roomId;

            for(let id in rooms){ //on veut savoir quel joueur on est et dans quel salle
                if(rooms[id][0] === socket.client.id || 
                    rooms[id][1] === socket.client.id){
                    if(rooms[id][0] === socket.client.id){
                        player = 1; //dans ce cas on est le joueur 1
                    }else{
                        player = 2; //sinon on est le joueur 2
                    }

                    roomId = id;
                    break;
                }
            }

            exitRoom(roomId, player);

            if(player === 1){
                io.to(roomId).emit("player-1-disconnected"); //l'evenement pour la deconnexion du joueur 1
            }else{
                io.to(roomId).emit("player-2-disconnected"); // l'evenement pour la deconnexion du joueur 2
            }
        }
    })
})

server.listen(5000, () => console.log("Le serveur c'est lancé avec le port 5000...")); //pour faire tourner le serveur sur port 5000