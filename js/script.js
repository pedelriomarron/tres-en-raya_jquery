let players = [
  { id: 0, name: "O", turn: 0, img: "./imagen/imagen0.png", token: 0 },
  { id: 1, name: "X", turn: 0, img: "./imagen/imagenX.png", token: 0 }
];
let game = { currentPlayerTurn: undefined, startGame: false, time: undefined };

let winCombos = [
  ["td_0-0", "td_1-0", "td_2-0"],
  ["td_0-1", "td_1-1", "td_2-1"],
  ["td_0-2", "td_1-2", "td_2-2"],
  ["td_0-0", "td_0-1", "td_0-2"],
  ["td_1-0", "td_1-1", "td_1-2"],
  ["td_2-0", "td_2-1", "td_2-2"],
  ["td_0-2", "td_1-1", "td_2-0"],
  ["td_0-0", "td_1-1", "td_2-2"]
];

$(() => {
  console.log("Se carga la pagina");
  let game = createElement("div", { id: "gameMain" });

  let time = createElement("div", { id: "number" });
  $(game).append(time);

  let board = createElement("div", { id: "board" });
  $(board).append(createBoard());
  $(game).append(board);

  let scoreBoard = createElement("div", { id: "scoreBoard" });
  $(scoreBoard).append(createScoreboard());
  $(game).append(scoreBoard);

  $(game).append(createButton());

  let result = createElement("div", { id: "result_game" });
  $(game).append(result);

  $("body").append(game);
});

const createBoard = () => {
  console.log("Creando la tabla");
  let table = createElement("table", { class: "table_game", border: "0" });
  let caption = createElement("caption");
  $(caption).html("<h1>Tres en Raya</h1>");
  $(table).append(caption);
  for (let i = 0; i < 3; i++) {
    let tr = createElement("tr");
    for (let j = 0; j < 3; j++) {
      let td = createElement("td", { id: `td_${i}-${j}`, class: "td_game" });
      $(td).on("click", () => {
        let player = getPlayer(game.currentPlayerTurn);
        if ($(td).children().length < 1 && game.startGame && player.token < 3) {
          //clearInterval(game.time);
          player.token++;
          player = getPlayer(game.currentPlayerTurn);
          let img = createImg(player);
          $(td).empty();
          $(td).append(img);
          nextTurn();
        }
      });

      $(td).droppable({
        accept: ".img_game",
        drop: (e, ui) => {
          let player = getPlayer(game.currentPlayerTurn);
          if (
            $(td).children().length < 1 &&
            game.startGame &&
            player.token >= 3 &&
            $(ui.draggable[0]).hasClass(`player-${player.id}`)
          ) {
            let img = createImg(player);

            //$(ui.draggable[0]).draggable({ revert: false });
            $(ui.draggable[0]).remove();
            $(td).append(img);
            nextTurn();
          }
        }
      });

      $(tr).append(td);
    }
    $(table).append(tr);
  }
  return table;
};

const createButton = () => {
  let btn = createElement("button", { class: "btn_game" });
  $(btn).html("Start Game");
  $(btn).on("click", () => {
    resetGame();
    game.startGame = true;
    console.log("Juego Empieza");
    let player = randomPlayerStart();
    console.log(`Empieza el jugador: `, player.name);
    turn_of(player.id);
  });
  return btn;
};

const randomPlayerStart = () => {
  let random = getRandomInteger(0, players.length - 1);
  return players[random];
};

const createScoreboard = () => {
  console.log("Creando Marcador");
  let ul = createElement("ul", { class: "ulScore_game" });

  players.map(player => {
    let li = createElement("li");
    if (game.currentPlayerTurn == player.id) {
      $(li).html(
        `<b>Jugador ${player.name} : <span id="score_${player.id}">${player.turn}</span></b>`
      );
    } else {
      $(li).html(
        `Jugador ${player.name} : <span id="score_${player.id}">${player.turn}</span>`
      );
    }

    $(ul).append(li);
  });

  return ul;
};

const turn_of = id => {
  let player = players.filter(player => {
    return player.id === id;
  });
  game.currentPlayerTurn = id;

  player = player[0];
  player.turn += 1;
  $("#scoreBoard").empty();
  $("#scoreBoard").append(createScoreboard());

  console.log(`Turno de ${player.id}__ ${game.currentPlayerTurn}`);
  $(`#score_${player.id}`).text();
  clearInterval(game.time);
  game.time = time();
};

const nextTurn = () => {
  let player = players.filter(player => {
    return player.id !== game.currentPlayerTurn;
  });
  console.log(player);
  clearInterval(game.time);

  if (checkWin()) {
    alert("GANADOR");
    changeResult();
  } else {
    turn_of(player[0].id);
  }
  return player[0];
};

const getPlayer = id => {
  let player = players.filter(player => {
    return player.id == id;
  });

  return player[0];
};

const resetGame = () => {
  players.map(player => {
    player.turn = 0;
    player.token = 0;
  });
  $("#result_game").empty();
  $("#board").empty();
  $("#board").append(createBoard());

  $("#scoreBoard").empty();
  $("#scoreBoard").append(createScoreboard());
};

const time = () => {
  var n = 0;
  var l = document.getElementById("number");
  let gameTime = setInterval(() => {
    if (n == 15) {
      clearInterval(gameTime);
      nextTurn();
    }
    l.innerHTML = n;
    n++;
  }, 1000);

  return gameTime;
};

const checkWin = () => {
  let win = false;
  let player = getPlayer(game.currentPlayerTurn);

  winCombos.map(cw => {
    let co = 0;
    cw.map(c => {
      console.log(c);
      if ($(`#${c}`).children()[0] != undefined) {
        console.log($(`#${c}`).children()[0]);
        let td_ = $(`#${c}`).children()[0];
        if ($(td_).hasClass(`player-${player.id}`)) {
          console.log($(`#${c}`).children());
          co++;
        }
      }
    });
    if (co == 3) {
      win = true;
      cw.map(c => {
        $(`#${c}`).addClass("win");
      });
    }
  });

  return win;
};

let changeResult = () => {
  let player = getPlayer(game.currentPlayerTurn);

  $("#result_game").html(`El Ganador es el jugador ${player.name}`);
};

const createImg = player => {
  let img = createElement("img", {
    src: `${player.img}`,
    height: "55vh",
    class: `img_game player-${player.id}`
  });
  $(img).draggable({
    revert: true,
    opacity: 0.5
  });
  return img;
};
