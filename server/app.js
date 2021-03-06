var express = require('express');
var uuid = require('node-uuid');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/**
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

var pendingPlayers = [];

app.use(function (req, res, next) {
  console.log("New request to ", req.path);
  next();
});

app.use(express.static('build'));

io.on('connection', function (socket) {
  console.log('connection established', socket.id);
  socket.emit("connected", {});

  socket.on('disconnect', function () {
    console.log(socket.id, 'connection lost');
  });

  socket.on('i_want_to_play_right_meow', function handleLobby() {
    console.log(socket.id, "wants to play");
    console.log("Pending Players", pendingPlayers);
    pendingPlayers.push(socket);

    if (pendingPlayers.length >= 2) {
      var playersForGame = pendingPlayers.splice(0,2);
      shuffle(playersForGame);
      var game = new Game(playersForGame);

      playersForGame.forEach(function bindGameUpdate(playerSocket) {
        playerSocket.join(game.id);
        playerSocket.on('game_update', function (move) {
          console.log(move);
          game.saveMove(move);
          io.to(game.id).emit('game_update', game);
        });
      });

      io.to(game.id).emit("game_start", game );
    }
  });
});

function Game(players) {
  return {
    id: uuid.v4(),
    currentPlayer: "X",
    nextBoard: false,
    players: [
      { id: players[0].id, symbol: "X" },
      { id: players[1].id, symbol: "O" }
    ],
    boardState: {
      'topLeft': {},
      'topCenter': {},
      'topRight': {},
      'middleLeft': {},
      'middleCenter': {},
      'middleRight': {},
      'bottomLeft': {},
      'bottomCenter': {},
      'bottomRight': {},
      'catsCount': 0,
      'completeGameCount': 0
    },
    winner: null,
    saveMove: function saveMove(move) {
        var innerPosition = move.innerPosition;
        var outerPosition = move.outerPosition;

        this.boardState[outerPosition][innerPosition] = this.currentPlayer;
        this.boardWon(this.boardState[outerPosition], outerPosition);

        this.whatBoardNext(innerPosition);
        this.togglePlayer();
      },
    //'bo' is a Board Object
    //'boPosition' is the outer position of bo
    boardWon: function boardWon(bo, boPosition) {
      var boardState = this.boardState;

      if ((bo.topLeft) && (bo.topLeft === bo.topCenter) && (bo.topLeft === bo.topRight)) {
        bo.winner = bo.topLeft;
        bo.boardComplete = true;
        boardState.completeGameCount++;
        this.gameOver(boardState);
      }
      else if ((bo.middleLeft) && (bo.middleLeft === bo.middleCenter) && (bo.middleLeft === bo.middleRight)) {
        bo.winner = bo.middleLeft;
        bo.boardComplete = true;
        boardState.completeGameCount++;
        this.gameOver(boardState);
      }
      else if ((bo.bottomLeft) && (bo.bottomLeft === bo.bottomCenter) && (bo.bottomLeft === bo.bottomRight)) {
        bo.winner = bo.bottomLeft;
        bo.boardComplete = true;
        boardState.completeGameCount++;
        this.gameOver(boardState);
      }
      else if ((bo.topLeft) && (bo.topLeft === bo.middleLeft) && (bo.topLeft === bo.bottomLeft)) {
        bo.winner = bo.topLeft;
        bo.boardComplete = true;
        boardState.completeGameCount++;
        this.gameOver(boardState);
      }
      else if ((bo.topCenter) && (bo.topCenter === bo.middleCenter) && (bo.topCenter === bo.bottomCenter)) {
        bo.winner = bo.topCenter;
        bo.boardComplete = true;
        boardState.completeGameCount++;
        this.gameOver(boardState);
      }
      else if ((bo.topRight) && (bo.topRight === bo.middleRight) && (bo.topRight === bo.bottomRight)) {
        bo.winner = bo.topRight;
        bo.boardComplete = true;
        boardState.completeGameCount++;
        this.gameOver(boardState);
      }
      else if ((bo.topLeft) && (bo.topLeft === bo.middleCenter) && (bo.topLeft === bo.bottomRight)) {
        bo.winner = bo.topLeft;
        bo.boardComplete = true;
        boardState.completeGameCount++;
        this.gameOver(boardState);
      }
      else if ((bo.topRight) && (bo.topRight === bo.middleCenter) && (bo.topRight === bo.bottomLeft)) {
        bo.winner = bo.topRight;
        bo.boardComplete = true;
        boardState.completeGameCount++;
        this.gameOver(boardState);
      }
      else if (Object.keys(boardState[boPosition]).length === 9) {
        bo.winner = 'C';
        bo.boardComplete = true;
        boardState.completeGameCount++;
        boardState.catsCount++;
      }
    },
    togglePlayer: function togglePlayer() {
      if(this.currentPlayer === 'X'){
        this.currentPlayer = 'O';
      } else {
        this.currentPlayer = 'X';
      }
    },
    // 'innerPosition' is the section of the smaller board that was just clicked on
    whatBoardNext: function whatBoardNext(innerPosition) {
      var boardState = this.boardState;
      if (boardState[innerPosition].boardComplete) {
        this.nextBoard = false;
      } else {
        this.nextBoard = innerPosition;
      }
    },
    gameOver: function gameOver(boardState) {
      if ((boardState.topLeft.winner) && (boardState.topLeft.winner === boardState.topCenter.winner) && (boardState.topLeft.winner === boardState.topRight.winner)) {
        this.winner = boardState.topLeft.winner;
      }
      else if ((boardState.middleLeft.winner) && (boardState.middleLeft.winner === boardState.middleCenter.winner) && (boardState.middleLeft.winner === boardState.middleRight.winner)) {
        this.winner = boardState.middleLeft.winner;
      }
      else if ((boardState.bottomLeft.winner) && (boardState.bottomLeft === boardState.bottomCenter.winner) && (boardState.bottomLeft === boardState.bottomRight.winner)) {
        this.winner = boardState.bottomLeft.winner;
      }
      else if ((boardState.topLeft.winner) && (boardState.topLeft.winner === boardState.middleLeft.winner) && (boardState.topLeft.winner === boardState.bottomLeft.winner)) {
        this.winner = boardState.topLeft.winner;
      }
      else if ((boardState.topCenter.winner) && (boardState.topCenter.winner === boardState.middleCenter.winner) && (boardState.topCenter.winner === boardState.bottomCenter.winner)) {
        this.winner = boardState.topCenter.winner;
      }
      else if ((boardState.topRight.winner) && (boardState.topRight.winner === boardState.middleRight.winner) && (boardState.topRight.winner === boardState.bottomRight.winner)) {
        this.winner = boardState.topRight.winner;
      }
      else if ((boardState.topLeft.winner) && (boardState.topLeft.winner === boardState.middleCenter.winner) && (boardState.topLeft.winner === boardState.bottomRight.winner)) {
        this.winner = boardState.topLeft.winner;
      }
      else if ((boardState.topRight.winner) && (boardState.topRight.winner === boardState.middleCenter.winner) && (boardState.topRight.winner === boardState.bottomLeft.winner)) {
        this.winner = boardState.topRight.winner;
      }
      else if (boardState.completeGameCount === 9) {
        this.winner = 'C';
      }
    }
  };
}


http.listen(process.env.PORT || 3000, function () {
  console.log('Example app running on port 3000!');
});
