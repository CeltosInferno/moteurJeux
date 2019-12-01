import * as path from "path";
import * as Messages from "../../common/messages";
import { FileProvider } from "./fileprovider";
import { HttpServer } from "./httpserver";
import { Deserializer, Serializer } from "./serializer";
import { Socket, WebSocket } from "./websocket";

const PORT = 8080;

const server = new HttpServer();
// tslint:disable-next-line:no-unused-expression
new FileProvider(path.resolve("../client"), server);
const ws = new WebSocket(server);

var leaderScoreArray : number[] = [0,0,0,0,0,0,0,0,0,0];
var leaderNameArray : string[] = ["","","","","","","","","",""];

interface ISocketData {
  otherPlayer?: Socket;
  name?: string;
}

const socketData = new Map<Socket, ISocketData>();
function getSocketData(socket: Socket): ISocketData {
  
  let data = socketData.get(socket);
  if (!data) {
    data = {};
    socketData.set(socket, data);
  }
  return data;
}

const pendingPlayers = new Set<Socket>();

// Cette méthode permet d'envoyer un message à un client.
// Elle s'occupe d'exécuter la sérialisation et l'envoi
// en binaire sur le réseau.
function sendMessage(socket: Socket, message: Messages.NetworkMessage) {
  const serializer = new Serializer();
  message.serialize(serializer);
  socket.send(serializer.toBinary());
}

// Cette méthode est appelée lorsqu'un bloc de données
// binaires est reçu. On y décode alors le message qui y
// est stocké, et on exécute le traitement pertinent en
// réaction à ce message.
function processData(socket: Socket, data: Buffer) {
  const deserializer = new Deserializer(data);
  const message = Messages.NetworkMessage.create(deserializer);
  onMessage(socket, message);
}

// Lorsqu'un message est reçu, cette méthode est appelée
// et, selon le message reçu, une action est exécutée.
function onMessage(socket: Socket, message: Messages.NetworkMessage | null) {
  if (message instanceof Messages.NetworkLogin) {
    onNetworkLogin(socket, message);
    var i;
    var msg = new Messages.NetworkScore();
    for(i=0;i<10;i++){
      msg.build2(leaderNameArray[0], leaderScoreArray[0]);
      sendMessage(getSocketData(socket).otherPlayer!,msg )
    }
  }
  if (message instanceof Messages.NetworkInputChanged) {
    sendMessage(getSocketData(socket).otherPlayer!, message);
  }
  if(message instanceof Messages.NetworkScore){
    //sendMessage(getSocketData(socket).otherPlayer!, message);
    //On enregistre le score du joueur sur le serveur
    saveScore(message.name,message.score);
  }
}

function saveScore(playerName: string, playerScore:number){
  if(leaderScoreArray.length <10 || playerScore > leaderScoreArray[0]){
    let old_rank = leaderNameArray.indexOf(playerName);
    //Dans le cas où le joueur n'est pas déjà dans le tableau de score
    if(old_rank ==  -1){
      addScore(playerName,playerScore);
    }
    //Dans le cas où le joueur est déjà dans le tableau de score
    else{
      percoleUp(playerName,playerScore, old_rank);
    }
  }
}

function addScore(playerName : string, playerScore : number){
  var rank = 0;
  var rankIsGood = false;
  //On cherche à quel rang doit être placé le score
  while(!rankIsGood && rank < 9){
    if( (playerScore > leaderScoreArray[rank+1])){
      rank++;
    }
    else{
      rankIsGood = true;
    }
  }
  //On enregistre et on décale tous les suivant
  var i:number;
  var NametoRecord = playerName;
  var ScoretoRecord = playerScore;

  for(i = rank; i>=0; i--){
    var NametoDecal = leaderNameArray[i];
    var ScoretoDecal = leaderScoreArray[i];

    leaderNameArray[i] =NametoRecord;
    leaderScoreArray[i] = ScoretoRecord;

    NametoRecord = NametoDecal;
    ScoretoRecord = ScoretoDecal;
  }
}

function percoleUp(playerName : string, playerScore : number, old_rank : number){
  
  var rank = old_rank;
  var rankIsGood = false;
  //On cherche à quel rang doit être placé le score
  while(!rankIsGood && rank < 9){
    if( (playerScore > leaderScoreArray[rank+1])){
      rank++;
    }
    else{
      rankIsGood = true;
    }
  }

  //On décale vers le bas tous les scores battus
  var i:number;
  var NametoRecord = playerName;
  var ScoretoRecord = playerScore;

  for(i = rank; i>=0; i--){
    var NametoDecal = leaderNameArray[i];
    var ScoretoDecal = leaderScoreArray[i];

    leaderNameArray[i] =NametoRecord;
    leaderScoreArray[i] = ScoretoRecord;

    NametoRecord = NametoDecal;
    ScoretoRecord = ScoretoDecal;
  }

  //On décale vers le haut les autres scores
  
  var NametoRecord = leaderNameArray[0];
  var ScoretoRecord = leaderScoreArray[0];

  for(i=1; i<=old_rank; i++){
    
    var NametoDecal = leaderNameArray[i];
    var ScoretoDecal = leaderScoreArray[i];

    leaderNameArray[i] =NametoRecord;
    leaderScoreArray[i] = ScoretoRecord;

    NametoRecord = NametoDecal;
    ScoretoRecord = ScoretoDecal;
  }
  leaderNameArray[0] = "";
  leaderScoreArray[0] = 0;
}

// Quand un joueur établit sa connection, il envoie un
// message l'identifiant.
function onNetworkLogin(socket: Socket, message: Messages.NetworkLogin) {
  getSocketData(socket).name = message.name;

  // Si aucun joueur n'est en attente, on place le nouveau
  // joueur en attente.
  if (pendingPlayers.size === 0) {
    pendingPlayers.add(socket);
    return;
  }

  // Si il y a des joueurs en attente, on associe un de
  // ces joueurs à celui-ci.
  const pendingArray = Array.from(pendingPlayers);
  const otherPlayer = pendingArray.shift()!;
  pendingPlayers.delete(otherPlayer);

  const data = getSocketData(socket);
  const otherData = getSocketData(otherPlayer);
  data.otherPlayer = otherPlayer;
  otherData.otherPlayer = socket;

  // On envoie alors la liste des joueurs de la partie
  // à chacun des participants.
  const names = [
    otherData.name!,
    data.name!,
  ];

  const p1 = new Messages.NetworkStart();
  const p2 = new Messages.NetworkStart();
  p1.build({playerIndex: 0, names});
  p2.build({playerIndex: 1, names});

  sendMessage(otherPlayer, p1);
  sendMessage(socket, p2);
}

ws.onConnection = (id) => {
  console.log("Nouvelle connexion de " + id);
};

ws.onMessage = (id, socket, data) => {
  console.log("Message de " + id);
  processData(socket, data);
};

ws.onClose = (id, socket) => {
  console.log("Fermeture de " + id);

  const data = getSocketData(socket);
  if (data.otherPlayer) {
    socketData.delete(data.otherPlayer);
    data.otherPlayer.close();
  }

  socketData.delete(socket);
  pendingPlayers.delete(socket);
};

server.listen(PORT)
  .then(() => {
    console.log("HTTP server ready on port " + PORT);
  });
