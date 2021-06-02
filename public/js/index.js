const socket = io();

// Déclaration des constantes 
const openCreateRoomBox = document.getElementById("open-create-room-box");
const openJoinRoomBox = document.getElementById("open-join-room-box");
const createRoomBox = document.getElementById("create-room-box");
const roomIdInput = document.getElementById("room-id");
const cancelCreateActionBtn = document.getElementById("cancel-create-action");
const gameplayChoices = document.getElementById("gameplay-choices");
const createRoomBtn = document.getElementById("create-room-btn");
const gameplayScreen = document.querySelector(".gameplay-screen");
const startScreen = document.querySelector(".start-screen");
const cancelJoinActionBtn = document.getElementById("cancel-join-action");
const joinBoxRoom = document.getElementById("join-room-box");
const joinRoomBtn = document.getElementById("join-room-btn");
const joinRoomInput = document.getElementById("join-room-input");
const joinRandomBtn = document.getElementById("join-random");
const errorMessage = document.getElementById("error-message");
const playerOne = document.getElementById("player-1");
const playerTwo = document.getElementById("player-2");
const waitMessage = document.getElementById("wait-message");
const rock = document.getElementById("pierre");
const paper = document.getElementById("feuille");
const scissor = document.getElementById("ciseaux");
const myScore = document.getElementById('my-score');
const enemyScore = document.getElementById('enemy-score');
const playerOneTag = document.getElementById("player-1-tag");
const playerTwoTag = document.getElementById("player-2-tag");
const winMessage = document.getElementById("win-message");

// variables
let canChoose = false; // Pour que le 1er et 2eme joueurs puissent rejoindre la game
let playerOneConnected = false; // le player 1 est deconnecter de base 
let playerTwoIsConnected = false; // le player 2 est deconnecter de base 
let playerId = 0; // l'id des joueurs
let myChoice = ""; // Le choix du joueur 1 (Pierre / feuille / ciseaux)
let enemyChoice = ""; // Le choix du joueur 1 (Pierre / feuille / ciseaux)
let roomId = ""; // l'id de la salle
let myScorePoints = 0; // score du joueur 1 
let enemyScorePoints = 0; // score du joueur 2 

// Apelle la fonction openCreateRoomBox lorqu'on clique sur le bouton et modifie gameplayChoices et createRoomBox
openCreateRoomBox.addEventListener("click", function(){
    gameplayChoices.style.display = "none";
    createRoomBox.style.display = "block";
})

// L'inverse de la fonction openCreateRoomBox (elle permet de quitter la page de création d'un salle)
cancelCreateActionBtn.addEventListener("click", function(){
    gameplayChoices.style.display = "block";
    createRoomBox.style.display = "none";
})

// Permet de mettre un ID a la room lorsqu'on appuie sur le bouton creer (envoie un message au server)
createRoomBtn.addEventListener("click", function(){
    let id = roomIdInput.value;
    socket.emit("create-room", id);
})

// Apelle la fonction openJoinRoomBox lorqu'on clique sur le bouton et modifie gameplayChoices et joinBoxRoom
openJoinRoomBox.addEventListener("click", function(){
    gameplayChoices.style.display = "none";
    joinBoxRoom.style.display = "block";
})

// met un message d'erreur lorsqu'il y a un probleme pour rejoindre la game (game is full)
joinRoomBtn.addEventListener("click", function(){
    let id = joinRoomInput.value;

    errorMessage.innerHTML = "";
    errorMessage.style.display = "none";

    socket.emit("join-room", id);
})

//rejoins une salle deja existante
joinRandomBtn.addEventListener("click", function(){
    errorMessage.innerHTML = "";
    errorMessage.style.display = "none";
    socket.emit("join-random");
})

// lorsqu'on clique sur l'image de la pierre la variable mychoice prend la valeur de "pierre"
rock.addEventListener("click", function(){
    if(canChoose && myChoice === "" && playerOneConnected && playerTwoIsConnected){
        myChoice = "pierre";
        choose(myChoice);
        socket.emit("make-move", {playerId, myChoice, roomId});
    }
})

// lorsqu'on clique sur l'image de la feuille la variable mychoice prend la valeur de "feuille"
paper.addEventListener("click", function(){
    if(canChoose && myChoice === "" && playerOneConnected && playerTwoIsConnected){
        myChoice = "feuille";
        choose(myChoice);
        socket.emit("make-move", {playerId, myChoice, roomId});
    }
})

// lorsqu'on clique sur l'image de la ciseaux la variable mychoice prend la valeur de "ciseaux"
scissor.addEventListener("click", function(){
    if(canChoose && myChoice === "" && playerOneConnected && playerTwoIsConnected){
        myChoice = "ciseaux";
        choose(myChoice);
        socket.emit("make-move", {playerId, myChoice, roomId});
    }
})

// Socket
// creation du message d'erreur (si la game est full)
socket.on("display-error", error => {
    errorMessage.style.display = "block";
    let p = document.createElement("p");
    p.innerHTML = error;
    errorMessage.appendChild(p);
})

// Création de la salle en donnant un id a la room avec le joueur 1 et en changeant le style du startScreen et du gameplayScreen
socket.on("room-created", id => {
    playerId = 1;
    roomId = id;

    setPlayerTag(1);

    startScreen.style.display = "none";
    gameplayScreen.style.display = "block";
})

// La meme chose que celle au dessus juste que c'est avec le joueur 2 et on enleve le setWaitMessage (le message d'attente qu'il y a sur l'ecran du joueur 1)
socket.on("room-joined", id => {
    playerId = 2;
    roomId = id;

    playerOneConnected = true;
    playerJoinTheGame(1)
    setPlayerTag(2);
    setWaitMessage(false);

    startScreen.style.display = "none";
    gameplayScreen.style.display = "block";
})

//Permet de savoir si un joueur est connecté et permet de bien mettre l icone en vert
socket.on("player-1-connected", () => {
    playerJoinTheGame(1);
    playerOneConnected = true;
})

//connect le joueur 2 comme la fontion au dessus avec le joueur 1 (enleve le message d'attente avec setWaitMessage(false); )
socket.on("player-2-connected", () => {
    playerJoinTheGame(2)
    playerTwoIsConnected = true
    canChoose = true;
    setWaitMessage(false);
});

// apelle la fonction reset qui remet tout a 0 
socket.on("player-1-disconnected", () => {
    reset()
})

// met la fonction canchoose en false pour ne plus faire de choix / remet le message d'attente / remet les score a 0 
socket.on("player-2-disconnected", () => {
    canChoose = false;
    playerTwoLeftTheGame()
    setWaitMessage(true);
    enemyScorePoints = 0
    myScorePoints = 0
    displayScore()
})

// message d'égalité 
socket.on("draw", message => {
    setWinningMessage(message);
})

// Permet de mettre un message en avant pour savoir qui a gagné ou perdu avec le setWinningMessage(message); et ajoute des points si besoin avec myScorePoints++;
socket.on("player-1-wins", ({myChoice, enemyChoice}) => {
    if(playerId === 1){
        let message = "Tu as choisis " + myChoice + " et l'adversaire a choisi " + enemyChoice + " . Tu as gagné!";
        setWinningMessage(message);
        myScorePoints++;
    }else{
        let message = "Tu as choisis " + myChoice + " et l'adversaire a choisi " + enemyChoice + " . Tu as perdu!";
        setWinningMessage(message);
        enemyScorePoints++;
    }

    displayScore()
})

// la meme chose que la qu'au dessus mais c'est avec le joueur 2 
socket.on("player-2-wins", ({myChoice, enemyChoice}) => {
    if(playerId === 2){
        let message = "Tu as choisis " + myChoice + " et l'adversaire a choisi " + enemyChoice + " . Tu as gagné!";
        setWinningMessage(message);
        myScorePoints++;
    }else{
        let message = "Tu as choisis " + myChoice + " et l'adversaire a choisi " + enemyChoice + " . Tu as perdu!";
        setWinningMessage(message);
        enemyScorePoints++;
    }

    displayScore()
})

// Fonctions

// Sert a savoir qui est le joueur 1 et qui est le joueur 2  
function setPlayerTag(playerId){
    if(playerId === 1){
        playerOneTag.innerText = "Toi (Joueur 1)";
        playerTwoTag.innerText = "Adversaire (Joueur 2)";
    }else{
        playerOneTag.innerText = "Adversaire (Joueur 2)";
        playerTwoTag.innerText = "Toi (Joueur 1)";
    }
}

// Lorsque un joueur rejoind la game sa classe css est modifier pour faire passer le point rouge en vert 
function playerJoinTheGame(playerId){
    if(playerId === 1){
        playerOne.classList.add("connected");
    }else{
        playerTwo.classList.add("connected");
    }
}

// permet de mettre en avant le message d'attente avec la création d'une balise p et un ajout de text dedans 
function setWaitMessage(display){
    if(display){
        let p = document.createElement("p");
        p.innerText = "En attente d'un joueur...";
        waitMessage.appendChild(p)
    }else{
        waitMessage.innerHTML = "";
    }
}

// la fonction reset permet de tout mettre a 0 (remettre les variable de base comme a la ligne 31)
function reset(){
    canChoose = false;
    playerOneConnected = false;
    playerTwoIsConnected = false;
    startScreen.style.display = "block";
    gameplayChoices.style.display = "block";
    gameplayScreen.style.display = "none";
    joinBoxRoom.style.display = "none";
    createRoomBox.style.display = "none";
    playerTwo.classList.remove("connected");
    playerOne.classList.remove("connected");
    myScorePoints = 0
    enemyScorePoints = 0
    displayScore()
    setWaitMessage(true);
}

// permet de remettre le voyant vert au rouge lorsque le joueur 2 leave la game avec le remove de la classe connected 
function playerTwoLeftTheGame(){
    playerTwoIsConnected = false;
    playerTwo.classList.remove("connected");
}

// la fonction qui permet l'affichage des scores les scores de chaques joueurs
function displayScore(){
    myScore.innerText = myScorePoints;
    enemyScore.innerText = enemyScorePoints;
}

//la fonction choix permet de choisir pierre feuille ou ciseaux lorsqu'on choisit on ne peux pas changer avec le canChoose
function choose(choice){
    if(choice === "pierre"){
        rock.classList.add("my-choice");
    }else if(choice === "feuille"){
        paper.classList.add("my-choice");
    }else{
        scissor.classList.add("my-choice");
    }

    canChoose = false;
}

// Cette fonction permet de refaire les choix de remettre a 0 
function removeChoice(choice){
    if(choice === "pierre"){
        rock.classList.remove("my-choice");
    }else if(choice === "feuille"){
        paper.classList.remove("my-choice");
    }else{
        scissor.classList.remove("my-choice");
    }

    canChoose = true;
    myChoice = "";
}

// cette fonction permet de mettre de message de victoire en ajoutant la balise p puis en mettant le text dedans, le temps de l'affichage du message se fait dans le setTimeout
function setWinningMessage(message){
    let p  = document.createElement("p");
    p.innerText = message;

    winMessage.appendChild(p);

    setTimeout(() => {
        removeChoice(myChoice)
        winMessage.innerHTML = "";
    }, 7000)
}