(function () {
    $(document).ready(function () {
        var FieledCreated = false;
        $(".header > h1").fadeIn(2000);
        $(".field > button").click(function () {
            $("button").hide(700, function () {
                if (FieledCreated) {
                    return;
                }
                CreateGameField();
                $(".field div").toggleClass("d-flex");
            });
        });
        $(".field div").toggleClass("d-flex").hide();

        function CreateGameField() {
            let N = 10;
            for (let i = 0; i < N; ++i) {
                $(".table-bordered").append("<tr></tr>");
            }
            for (let i = 0; i < N; ++i) {
                $(".table-bordered tr").append("<td></td>");
            }
            FieledCreated = true;
            var Game = InitGame(N);
            $(".game-buttons").append("<button class='btn btn-lg btn-primary m-3 place-random'>Случайная расстановка</button>")
            $(".game-buttons").append("<button class='btn btn-lg btn-dark m-3 start-game'>Начать игру</button>");
            $(".game-buttons").append("<button class='btn btn-lg btn-primary m-3 place-own'>Расставить самому</button>");
            $(".place-random").click(function () {
                Game = InitGame(N);
            });
            $(".start-game").click(function () {
                $(".place-random").hide(700);
                $(".place-own").hide(700);
                $(".start-game").hide(700, function () {
                    $(".game-buttons").append("<h3 class='messages shadow p-4 bg-light'>Игра началась</h3>");
                    $(".footer").append("<button class='btn btn-lg btn-primary m-3 restart'>Начать сначала</button>");
                    $(".restart").click(function () {
                        $(".table-bordered").html("");
                        $(".game-buttons").html("");
                        $(".restart").remove();
                        $(".game-buttons").append("<div class='progress'>" +
                            "<div class='progress-bar progress-bar-striped progress-bar-animated' role='progressbar' aria-valuenow='10' aria-valuemin='0' aria-valuemax='100' style='width: 0vh;'></div>" +
                            "</div>");
                        $(".progress-bar").animate({
                            width: "100vh"
                        }, 100);
                        setTimeout(function () {
                            $(".progress").remove();
                            CreateGameField();
                        }, 1000);
                    });
                    setTimeout(function () {
                        Game.StartGame();
                    }, 1000);
                });
            });
        }
    });

function InitGame(size) {

    var Game = {};
    //var size = 10;
    var PlayerField = [], CompField = [];
    var PlayerCells = 0, EnemyCells = 0;
    var IsEnemyTurn = false;
    for (let i = 0; i < size; ++i) {
        let temp1 = new Array(size), temp2 = new Array(size);
        PlayerField.push(temp1);
        CompField.push(temp2);
    }

    for (let i = 0; i < size; ++i) {
        for (let j = 0; j < size; ++j) {
            PlayerField[i][j] = 0;
            CompField[i][j] = 0;
        }
    }

    var ships = [[4, 1], [3, 2], [2, 3], [1, 4]];   //первый параметр - кол-во палуб, второй - кол-во кораблей такого типа
    RandomPlace(PlayerField, ".game-field-1 table");
    RandomPlace(CompField);

    function getRandom(from, to) {
        return Math.floor(Math.random() * (to - from) + from);
    }

    /**
     * @return {boolean}
     */
    function CheckPosition(start, to, Field) {
        if (start.y === to.y) {
            let y = start.y;
            if (to.x >= size || to.x < 0) {
                return false;
            }
            let sign = (start.x > to.x) ? -1 : 1;
            for (let i = start.x - sign; i !== to.x + 2 * sign; i += sign) {
                if (i >= 0 && i < size && (Field[i][y] === 1 || y + 1 < size && Field[i][y + 1] === 1 || y - 1 >= 0 && Field[i][y - 1] === 1)) {
                    return false;
                }
            }
        } else {
            let x = start.x;
            if (to.y >= size || to.y < 0) {
                return false;
            }
            let sign = (start.y > to.y) ? -1 : 1;
            for (let i = start.y - sign; i !== to.y + 2 * sign; i += sign) {
                if (i >= 0 && i < size && (Field[x][i] === 1 || x + 1 < size && Field[x + 1][i] === 1 || x - 1 >= 0 && Field[x - 1][i] === 1)) {
                    return false;
                }
            }
        }
        return true;
    }

    function RandomPlace(Field, selector) {
        for (let i = 0; i < size; ++i) {
            for (let j = 0; j < size; ++j) {
                Field[i][j] = 0;
                $(selector + " .bg-info").removeClass("bg-info");
            }
        }
        for (let i = 0; i < ships.length; i++) {
            let number_of_ceils = ships[i][0] - 1;
            for (let j = 0; j < ships[i][1]; j++) {
                while (true) {
                    let x = getRandom(0, size);
                    let y = getRandom(0, size);
                    let direction = getRandom(0, 2);
                    let sign = (Math.random() >= 0.5) ? -1 : 1;
                    if (direction === 1) {  //вертикальное расположение
                        if (CheckPosition({x: x, y: y}, {x: x + number_of_ceils * sign, y: y}, Field)) {
                            for (let k = x; k !== x + (number_of_ceils + 1) * sign; k += sign) {
                                Field[k][y] = 1;
                                if (selector !== undefined) {
                                    let table = document.querySelector(selector);
                                    table.rows[k].cells[y].classList.add("bg-info");
                                }
                            }
                            break;
                        }
                    } else {
                        if (CheckPosition({x: x, y: y}, {x: x, y: y + number_of_ceils * sign}, Field)) {
                            for (let k = y; k !== y + (number_of_ceils + 1) * sign; k += sign) {
                                Field[x][k] = 1;
                                if (selector !== undefined) {
                                    let table = document.querySelector(selector);
                                    table.rows[x].cells[k].classList.add("bg-info");
                                }
                            }
                            break;
                        }
                    }
                }
            }
        }
    }

    function ShowMessage(text) {
        $(".messages").html(text);
    }

    Game.StartGame = function() {
        for (let i = 0; i < ships.length; ++i) {
            EnemyCells += ships[i][0] * ships[i][1];
        }
        PlayerCells = EnemyCells;
        let order = (Math.random() > 0.5) ? 1 : 0; // 1 - первый ходит игрок
        //let order = 1;
        if (order) {
            ShowMessage("Вы ходите первым");
            PlayerTurn();
        } else {
            EnemyTurn();
        }

        (function () {
            $(".game-field-2 td").mousedown(function (event) {
                if (IsEnemyTurn) {
                    return false;
                }
                let col = $(this).index();   //получаем индекс столбца клетки
                let $tr = $(this).closest("tr");
                let row = $tr.index(); //строку где находится клетка
                if (event.which === 1) {
                    if ($(this).hasClass("marked")) {
                        ShowMessage("Это поле помечено. Снимите метку, чтобы снова бить по нему.");
                        return false;
                    }
                    switch (CompField[row][col]) {
                        case -1:
                            ShowMessage("По этому полю вы уже стреляли");
                            break;

                        case 1:
                            ShowMessage("Отличный выстрел! Вы попали.");
                            CompField[row][col] = -1;
                            $(this).css("background-color", "red");
                            EnemyCells--;
                            if (EnemyCells === 0) {
                                ShowMessage("Ура! Вы победили");
                                IsEnemyTurn = true;
                            } else {
                                setTimeout(function () {
                                    ShowMessage("Вы снова ходите");
                                }, 1000);
                            }
                            break;

                        case 0:
                            ShowMessage("Увы, но вы промахнулись.");
                            $(this).css("background-color", "grey");
                            CompField[row][col] = -1;
                            EnemyTurn();
                            break;
                    }
                } else {
                    $(this).toggleClass("marked");
                }
            });
            $(".field").contextmenu(function (event) {
                return false;
            })

        })();
    };

    function PlayerTurn() {
        IsEnemyTurn = false;
        $(".game-field-2 td").css("cursor", "pointer");
        $(".game-field-2 table").addClass("shadow");
        $(".game-field-1 table").removeClass("shadow");
    }

    function EnemyTurn() {
        IsEnemyTurn = true;
        $(".game-field-2 table").removeClass("shadow");
        $(".game-field-1 table").addClass("shadow");
        ShowMessage("Ход ИИ");
        setTimeout(function () {
            let col = getRandom(0, size);
            let row = getRandom(0, size);
            while (PlayerField[row][col] === -1) {
                col = getRandom(0, size);
                row = getRandom(0, size);
            }
            let table = document.querySelector(".game-field-1 table");
            if (PlayerField[row][col] === 0) {
                table.rows[row].cells[col].style.backgroundColor = "grey";
                PlayerField[row][col] = -1;
                PlayerTurn();
                ShowMessage("Ваш ход");
            }
            if (PlayerField[row][col] === 1) {
                table.rows[row].cells[col].classList.remove("bg-info");
                table.rows[row].cells[col].style.backgroundColor = "red";
                PlayerCells--;
                PlayerField[row][col] = -1;
                if (PlayerCells === 0) {
                    ShowMessage("Вы проиграли");
                } else {
                    EnemyTurn();
                }
            }
        }, 1000);
    }

    return Game;
}
})();
