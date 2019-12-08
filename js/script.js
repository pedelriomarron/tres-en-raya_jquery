let players = [
  { id: 0, name: "O", turn: 0, img: "./imagen/imagen0.png", token: 0 },
  { id: 1, name: "X", turn: 0, img: "./imagen/imagenX.png", token: 0 }
];
let game = { currentPlayerTurn: undefined, startGame: false, time: undefined, timerTurn: 15 };

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

  let time = createElement("div", { id: "clock_game" });
  $(time).html(`<p> <i id="clock_svg" class="far fa-clock"></i> : <span id="number">....</span></p>`)
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
        over: function () {
          $(td).css({
            background: "#f9efc5",
            opacity: "0.6"
          })
        },
        out: function () {
          $(td).css({
            background: "",
            opacity: "1"
          })
        },
        drop: (e, ui) => {
          $(td).css({
            background: "",
            opacity: "1"
          })
          let player = getPlayer(game.currentPlayerTurn);
          if (
            $(td).children().length < 1 &&
            game.startGame &&
            player.token >= 3 &&
            $(ui.draggable[0]).hasClass(`player-${player.id}`)
          ) {
            let str = $($(ui.draggable[0]).parent()[0]).attr('id');
            let res = str.split("_");
            res = res[1].split("-");
            console.log(res)
            let enter = false
            algoritmoCercanos(parseInt(res[0]), parseInt(res[1])).map(v => {
              console.log(`pos1:${i} - ${v[0]}  pos2:${j} - ${v[1]} `)
              if (v[0] === i && v[1] === j) {
                console.log("mu bien")
                enter = true;
              }
            })

            if (enter) {
              let img = createImg(player);
              //$(ui.draggable[0]).draggable({ revert: false });
              $(ui.draggable[0]).remove();
              $(td).append(img);
              nextTurn();
            }

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
        `<img height="10px" src="${player.img}"> <b>Jugador ${player.name} : <span id="score_${player.id}">${player.turn}</span></b>`
      );
    } else {
      $(li).html(
        `<img height="10px" src="${player.img}"> Jugador ${player.name} : <span id="score_${player.id}">${player.turn}</span>`
      );
    }


    $(li).on("click", () => {
      createDialog("Change Name", `Desea cambiar el nombre al jugador ${player.name}: <input type="text" id="renamePlayer"> <button onclick="renamePlayer(${player.id})">Cambiar</button>`)
    })

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
  // console.log(player);
  clearInterval(game.time);

  if (checkWin()) {
    createDialog("Juego Terminado", `Enhorabuena jugador:<b> ${player[0].id}</b>, la victoria es tuya`)
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
  let timeMax = game.timerTurn
  let n = 0;
  let l = document.getElementById("number");
  let gameTime = setInterval(() => {
    if (n == timeMax) {
      clearInterval(gameTime);
      nextTurn();
    }
    l.innerHTML = timeMax - n;
    changeColorClock(timeMax - n)
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
      // console.log(c);
      if ($(`#${c}`).children()[0] != undefined) {
        // console.log($(`#${c}`).children()[0]);
        let td_ = $(`#${c}`).children()[0];
        if ($(td_).hasClass(`player-${player.id}`)) {
          //  console.log($(`#${c}`).children());
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
    height: "60vw",
    class: `img_game player-${player.id}`
  });
  $(img).draggable({
    revert: true,
    opacity: 0.5
  });
  return img;
};


const algoritmoCercanos = (p1, p2) => {
  let validas = []

  validas.push([p1, p2 + 1])
  validas.push([p1, p2 - 1])

  validas.push([p1 + 1, p2])
  validas.push([p1 - 1, p2])

  validas.push([p1 + 1, p2 - 1])
  validas.push([p1 - 1, p2 + 1])

  validas.push([p1 + 1, p2 + 1])
  validas.push([p1 - 1, p2 - 1])


  return validas
}

const algoritmoToTabla = (validas) => {
  let validasTabla = []
  validas.map(valida => {
    validasTabla.push([`td_${valida[0]}-${valida[1]}`])
  })

  return validasTabla
}

function createDialog(title, text, options) {
  return $("<div id='dialog_rename' class='dialog' title='" + title + "'><p>" + text + "</p></div>")
    .dialog(options);
}

renamePlayer = (id) => {
  let player = getPlayer(id);
  let val = $("#renamePlayer").val()
  //alert(val)
  player.name = val;
  $("#scoreBoard").empty();
  $("#scoreBoard").append(createScoreboard());
  $("#dialog_rename").remove()


}


const changeColorClock = (time) => {
  let color = "green";

  if (time < 6) {
    color = "red"
  } else if (time < 11) {
    color = "orange"
  }

  $("#clock_svg").css({
    background: color
  })
}