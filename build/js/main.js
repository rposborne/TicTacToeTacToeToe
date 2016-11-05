(function() {
  'use strict';

  var currentPlayer = 'X';
  var nextBoard = false;
  var boardState = {
    'topLeft': {},
    'topCenter': {},
    'topRight': {},
    'middleLeft': {},
    'middleCenter': {},
    'middleRight': {},
    'bottomLeft': {},
    'bottomCenter': {},
    'bottomRight': {}
  };

  $('div')
    .on('click', function markASquare() {
      var outerPosition = $(this).parent()[0].classList[1];
      var innerPosition = $(this)[0].classList[1];

      if (nextBoard && (outerPosition !== nextBoard)) {
        message('You need to play on a different board.');
      } else if (boardState[outerPosition].boardComplete) {
        message('That game is complete. Try a different board.');
      } else if (boardState[outerPosition][innerPosition]) {
        message('Someone else already went there.');
      } else {
        var myTurn = whosTurn();
        message(currentPlayer + " plays now.");
        boardState[outerPosition][innerPosition] = myTurn;
        $('.outer.' + outerPosition).children('.' + innerPosition)[0].innerText = myTurn;

        boardWon(boardState[outerPosition], outerPosition);

        whatBoardNext(innerPosition);
      }

    });

  function message(messageString) {
    $('.message').text(messageString);
  }
  //'bo' is a Board Object
  //'boPosition' is the outer position of bo
  function boardWon(bo, boPosition) {
    if ((bo.topLeft) && (bo.topLeft === bo.topCenter) && (bo.topLeft === bo.topRight)) {
      bo.winner = bo.topLeft;
      bo.boardComplete = true;
      $('.outer.' + boPosition).addClass(bo.winner + 'Winner');
    }
    else if ((bo.middleLeft) && (bo.middleLeft === bo.middleCenter) && (bo.middleLeft === bo.middleRight)) {
      bo.winner = bo.middleLeft;
      bo.boardComplete = true;
      $('.outer.' + boPosition).addClass(bo.winner + 'Winner');
    }
    else if ((bo.bottomLeft) && (bo.bottomLeft === bo.bottomCenter) && (bo.bottomLeft === bo.bottomRight)) {
      bo.winner = bo.bottomLeft;
      bo.boardComplete = true;
      $('.outer.' + boPosition).addClass(bo.winner + 'Winner');
    }
    else if ((bo.topLeft) && (bo.topLeft === bo.middleLeft) && (bo.topLeft === bo.bottomLeft)) {
      bo.winner = bo.topLeft;
      bo.boardComplete = true;
      $('.outer.' + boPosition).addClass(bo.winner + 'Winner');
    }
    else if ((bo.topCenter) && (bo.topCenter === bo.middleCenter) && (bo.topCenter === bo.bottomCenter)) {
      bo.winner = bo.topCenter;
      bo.boardComplete = true;
      $('.outer.' + boPosition).addClass(bo.winner + 'Winner');
    }
    else if ((bo.topRight) && (bo.topRight === bo.middleRight) && (bo.topRight === bo.bottomRight)) {
      bo.winner = bo.topRight;
      bo.boardComplete = true;
      $('.outer.' + boPosition).addClass(bo.winner + 'Winner');
    }
    else if ((bo.topLeft) && (bo.topLeft === bo.middleCenter) && (bo.topLeft === bo.bottomRight)) {
      bo.winner = bo.topLeft;
      bo.boardComplete = true;
      $('.outer.' + boPosition).addClass(bo.winner + 'Winner');
    }
    else if ((bo.topRight) && (bo.topRight === bo.middleCenter) && (bo.topRight === bo.bottomLeft)) {
      bo.winner = bo.topRight;
      bo.boardComplete = true;
      $('.outer.' + boPosition).addClass(bo.winner + 'Winner');
    }
  }

  function whosTurn() {
    if(currentPlayer === 'X'){
      currentPlayer = 'O';
      return 'X';
    } else {
      currentPlayer = 'X';
      return 'O';
    }
  }

  // 'innerPosition' is the section of the smaller board that was just clicked on
  function whatBoardNext(innerPosition) {
    if (boardState[innerPosition].boardComplete) {
      nextBoard = false;
    } else {
      nextBoard = innerPosition;
    }
  }


})();
