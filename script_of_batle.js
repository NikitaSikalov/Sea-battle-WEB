window.onload = function () {

    'use strict';
    
    function Field(field) {
        // размер стороны игрового поля
        this.fieldSide = 330;
        // размер палубы корабля
        this.shipSide = 33;
        //массив кораблей
        this.shipsData = [
            '',
            [4, 'fourdeck'],
            [3,'tripledeck'],
            [2, 'doubledeck'],
            [1, 'singledeck']
        ];
        // игровое поле полученное в качестве аргумента
        this.field = field;
        this.fieldX = field.getBoundingClientRect().top + window.pageYOffset;
        this.fieldY = field.getBoundingClientRect().left + window.pageXOffset;
        this.squadron = [];
    }

    function getElement(id) {
        return document.getElementById(id);
    }

    var userfield = getElement('field_user'), compfield = getElement('field_comp'), comp;

    var user = new Field(getElement('field_user'));

    // здесь безымянная функция привязана к обработчику событию, поэтому первым аргументом она
    // она получит собтиые
    getElement('type_placement').addEventListener('click', function (event) {
        var el = event.target;
        if (el.tagName != 'SPAN') return;
        user.cleanField();
        getElement('play').setAttribute('data-hidden', false);
        user.randomLocationShips();
    });

    // Создаем матрицу координат первых палуб кораблей и зануляем её
    function createMatrix() {
        var x = 10, y = 10, arr = [10];
        for (var i = 0; i < 10; i++) {
            arr[i] = [10];
            for (var j = 0; j < y; j++) {
                arr[i][j] = 0;
            }
        }
        return arr;
    }

    function getRandom(n) {
        return Math.floor(Math.random() * (n + 1))
    }

    Field.prototype.randomLocationShips = function () {
        this.matrix = createMatrix();
        for (var i = 1, length = this.shipsData.length; i < length; i++) {
            // кол-во палуб
            var decks = this.shipsData[i][0];
            for (var j = 0; j < i; ++j) {
                // координаты первой палубы
                var fc = this.getCoordinatesDecks(decks);
                fc.decks = decks;
                // имя корабля и его номер
                fc.shipname = this.shipsData[i][1] + String(j + 1);
                var ship = new Ships(this, fc);
                ship.createShip();
            }
        }
    };

    Field.prototype.getCoordinatesDecks = function (decks) {
        var kx = getRandom(1);
        var ky = (kx == 0) ? 1 : 0, x, y;
        if (kx == 0) {
            x = getRandom(9);
            y = getRandom(10 - decks);
        } else {
            x = getRandom(10 - decks);
            y = getRandom(9);
        }
        // проверяем валидность координат
        if(!this.checkLocationShip(x, y, kx, ky,  decks)) return this.getCoordinatesDecks(decks);

        var obj = {
            x: x, y: y, kx: kx, ky: ky
        };
        return obj;
    };

    Field.prototype.checkLocationShip = function (x, y, kx, ky, decks) {
        var fromX = (x == 0) ? x : x - 1, toX;
        if (x + kx * decks == 10 && kx == 1) {
            toX = 10;
        } else if (x + kx * decks < 10 && kx == 1) {
            toX = x + kx * decks + 1;
        } else if (x == 9 && kx == 0) {
            toX = 10;
        } else {
            toX = x + 2;
        }

        var fromY = (y == 0) ? y : y - 1, toY;
        if (y + ky * decks == 10 && ky == 1) {
            toY = 10;
        } else if (y + ky * decks < 10 && ky == 1) {
            toY = y + ky * decks + 1;
        } else if (y == 9 && ky == 0) {
            toY = 10;
        } else {
            toY = y + 2;
        }

        for (var i = fromX; i < toX; i++) {
            for (var j = fromY; j < toY; j++) {
                if (this.matrix[i][j] == 1) return false;

            }
        }
        return true;
    };
    
    Field.prototype.cleanField = function () {
        var parent = this.field,
            id = parent.getAttribute('id'),
            // селектор по id + дочерние процессы
            divs = document.querySelectorAll('#' + id + '> div');
        [].forEach.call(divs, function (el) {
            parent.removeChild(el);
        });
        this.squadron.length = 0;
    };
    
    function Ships(player, fc) {
        // поле на котором создается корабль
        this.player = player;
        this.shipname = fc.shipname;
        this.decks = fc.decks;
        this.x0 = fc.x;
        this.y0 = fc.y;
        this.kx = fc.kx;
        this.ky = fc.ky;
        this.hits = 0;
        // массив координат палуб корабля
        this.matrix = [];
    }

    Ships.prototype.createShip = function () {
        for (var k = 0; k < this.decks; k++) {
            this.player.matrix[this.x0 + this.kx * k][this.y0 + this.ky * k] = 1;
            this.matrix.push([this.x0 + k * this.kx, this.y0 + this.ky * k]);
        }
        this.player.squadron.push(this);
        if (this.player == user) this.showShip();
        if (user.squadron.length == 10) {
            getElement('play').setAttribute('data-hidden', 'false');
        }
    };

    Ships.prototype.showShip = function () {
        var div = document.createElement('div'),
            dir = (this.kx == 1) ? ' vertical' : '',
            classname = this.shipname.slice(0, - 1),
            player = this.player;
        div.setAttribute('id', this.shipname);
        div.className = 'ship ' + classname + dir;
        div.style.cssText = 'left: ' + (this.y0 * player.shipSide) + 'px; top: ' + (this.x0  * player.shipSide) + 'px;';
        player.field.appendChild(div);
    };
    //comp.randomLocationShips();

    getElement('play').addEventListener('click', function (e) {
        var el = e.target;
        if (el.tagName != 'SPAN') return;
        document.querySelector('.field-comp').setAttribute('data-hidden', 'false');
        comp = new Field(getElement('field_comp'));
        comp.randomLocationShips();
        getElement('type_placement').setAttribute('data-hidden', true);
        getElement('play').setAttribute('data-hidden', true);
        Controller.battle.init();
    });

    var Controller = (function () {
       var player, enemy, self, coords, text,
           srvText = getElement('text_btm'),
           tm = 0;

       var battle = {
           init: function () {
               self = this;
               var rnd = getRandom(1);
               player = (rnd == 0) ? user : comp;
               enemy = (rnd == 0) ? comp : user;

               /////////////////////////////////////////////////////////////
               // координаты которые не входят в shootMatrixAI и где потенциально может быть корабль
               comp.shootMatrix = [];
               // диагнональные клетки с которых мы начнем обстрел
               comp.shootMatrixAI = [];
               // массив в влектами вокруг клетки с попаданием
               comp.shootMatrixAround = [];
               // массив начала побочных диаганалей
               comp.startPoints = [
                   [ [6, 0], [2, 0], [0, 2], [0, 6] ],
                   [ [3, 0], [7, 0], [9, 2], [9, 6] ]
               ];
               // информация по обстреленному кораблю
               comp.tempShip = {
                   // кол-во попаданий в корабль
                   totalHits: 0,
                   // первое и второе попадание
                   firstHit: {},
                   nextHit: {},
                   kx: 0,
                   ky: 0
               };

               self.setShootMatrix();
                /////////////////////////////////////////////////////////

               if (player == user) {
                   compfield.addEventListener('click', self.shoot);
                   compfield.addEventListener('contextmenu', self.setEmptyCell);
                   self.showServiseText('Вы стреляете первым');
               } else {
                   self.showServiseText('Компьютер ходит первым');
                   setTimeout(function () {
                      return self.shoot();
                   }, 1300);
               }
           },

           showServiseText: function (text) {
               srvText.innerHTML = '';
               srvText.innerHTML = text;
           },

           setEmptyCell: function (e) {
               // проверяем что кликнули именно правой кнопкой мыши
               if (e.which != 3) return false;
               // убираем событие браузера на клик прав кнопки мыши
               e.preventDefault();
               coords = self.transformCoordinates(e, comp);
               if (comp.matrix[coords.x][coords.y] == 0 || comp.matrix[coords.x][coords.y] == 1) {
                    self.showIcons(enemy, coords, 'shaded-cell');
                    comp.matrix[coords.x][coords.y] = 2;
               } else {
                   if (comp.matrix[coords.x][coords.y] == 2) {
                       var icons = enemy.field.querySelectorAll('.shaded-cell');
                       [].forEach.call(icons, function (el) {
                           var x = el.style.top.slice(0, -2) / enemy.shipSide,
                               y = el.style.left.slice(0, -2) / enemy.shipSide;
                           if (coords.x == x && coords.y == y) {
                               enemy.field.removeChild(el);
                           }
                       });
                       comp.matrix[coords.x][coords.y] = 0;
                   }
               }
           },

           shoot: function(e) {
               if (e != undefined) {
                   if (e.which != 1) return false;
                   coords = self.transformCoordinates(e, enemy);
               } else {
                   coords = self.getCoordinatesShot();
               }

               var val = enemy.matrix[coords.x][coords.y];
               switch (val) {
                   // промах
                   case 0:
                       enemy.matrix[coords.x][coords.y] = 3;
                       self.showIcons(enemy, coords, 'dot');
                       text = (player == user) ? "Вы промохнулись. Стреляет компьютер" : "Компьютер промохнулся. Теперь стреляете Вы";
                       self.showServiseText(text);
                       player = (player == user) ? comp : user;
                       enemy = (enemy == comp) ? user : comp;
                       if (player == comp) {
                           // удаляем обработчики собтий для пользователя
                           compfield.removeEventListener('click', self.shoot);
                           compfield.removeEventListener('contextmenu', self.setEmptyCell);
                           if (comp.shootMatrixAround.length == 0) {
                               self.resetTempShip();
                           }

                           setTimeout(function () {
                               return self.shoot();
                           }, 1300);
                       } else {
                           // устанавливаем обработчики событий для пользователя
                           compfield.addEventListener('click', self.shoot);
                           compfield.addEventListener('contextmenu', self.setEmptyCell);
                       }
                       break;

                   // попадание
                   case 1:
                       self.showIcons(enemy, coords, 'red-cross');
                       text = (player == user) ? "Вы попали! Снова Ваш выстрел" : "Компьютер попал. Он снова ходит";
                       enemy.matrix[coords.x][coords.y] = 4;
                       self.showServiseText(text);

                       for (var i = enemy.squadron.length - 1; i >= 0; i--) {
                           var warship = enemy.squadron[i],
                               arrayDescks = enemy.squadron[i].matrix;
                           for (var j = 0; j < arrayDescks.length; j++) {
                               if (arrayDescks[j][0] == coords.x && arrayDescks[j][1] == coords.y) {
                                   warship.hits++;
                                   if (warship.hits == warship.decks) {
                                       if (player == comp) {
                                           comp.tempShip.x0 = warship.x0;
                                           comp.tempShip.y0 = warship.y0;
                                       }
                                       enemy.squadron.splice(i, 1);
                                   }
                               }
                           }
                       }

                       if (enemy.squadron.length == 0) {
                           text = (player == user) ? "Поздравляем, Вы победили!" : "К сожалению, Вы проиграли ;(";
                           self.showServiseText(text);
                           if (player == user) {
                               compfield.removeEventListener('click', self.shoot);
                               compfield.removeEventListener('contextmenu', self.setEmptyCell);
                           } else {
                               for (var i = 0; i < comp.squadron.length; i++) {
                                   comp.squadron[i].showShip();
                               }
                           }
                       } else {
                           if (player == comp) {
                               comp.tempShip.totalHits++;
                               var points = [
                                   [coords.x - 1, coords.y - 1],
                                   [coords.x + 1, coords.y + 1],
                                   [coords.x - 1, coords.y + 1],
                                   [coords.x + 1, coords.y - 1]
                               ];
                               self.markEmptyCell(points);
                               var max = self.checkMaxDecks();
                               if (comp.tempShip.totalHits >= max) {
                                   // однопалубный корабль
                                   if (comp.totalHits == 1) {
                                       points = [
                                           [comp.tempShip.x0 - 1, comp.tempShip.y0],
                                           [comp.tempShip.x0 + 1, comp.tempShip.y0],
                                           [comp.tempShip.x0, comp.tempShip.y0 - 1],
                                           [comp.tempShip.x0, comp.tempShip.y0 + 1]
                                       ];
                                   } else {
                                       // многопалубный корабль
                                       var x1 = comp.tempShip.x0 - comp.tempShip.kx,
                                           y1 = comp.tempShip.y0 - comp.tempShip.ky,
                                           x2 = comp.tempShip.x0 + comp.tempShip.kx * comp.tempShip.totalHits,
                                           y2 = comp.tempShip.y0 + comp.tempShip.ky * comp.tempShip.totalHits;
                                       points = [
                                           [x1, y1],
                                           [x2, y2]
                                       ];

                                   }
                                   self.markEmptyCell(points);
                                   self.resetTempShip();
                               } else {
                                   self.setShootMatrixAround();
                               }
                               setTimeout(function () {
                                   return self.shoot();
                               }, 1300);
                           }
                       }
                       break;

                   // отмеченная координата
                   case 2:
                       text = "Сначала снимите блокировку с этих координат!";
                       self.showServiseText(text);
                       var icons = enemy.field.querySelectorAll('.shaded-cell');
                       [].forEach.call(icons, function (el) {
                          var x = el.style.top.slice(0, -2) / enemy.shipSide,
                              y = el.style.left.slice(0, -2) / enemy.shipSide;
                          if (coords.x == x && coords.y == y) {
                              el.classList.add('shaded-cell_red');
                              setTimeout(function () {
                                  el.classList.remove('shaded-cell_red');
                              }, 500);
                          }
                       });
                       break;
                       // обстреленные координаты
                   case 3:
                   case 4:
                       text = "По этим координатам Вы уже стреляли";
                       self.showServiseText(text);
                       break;
               }
           },

           transformCoordinates: function (e, enemy) {
               // полифил для IE
               if (!Math.trunc) {
                   Math.trunc = function(v) {
                       v = +v;
                       return (v - v % 1) || (!isFinite(v) || v === 0 ? v : v < 0 ? -0 : 0);
                   };
               }
               var obj = {};
               // отбрасывание дробной части
               obj.x = Math.trunc((e.pageY - enemy.fieldX) / enemy.shipSide);
               obj.y = Math.trunc((e.pageX - enemy.fieldY) / enemy.shipSide);
               return obj;
           },
           
           showIcons: function (enemy, coords, iconClass) {
               var div = document.createElement('div');
               div.className = 'icon-field ' + iconClass;
               div.style.cssText = 'left: ' + (coords.y * enemy.shipSide) + 'px; top: ' + (coords.x * enemy.shipSide) + 'px;';
               enemy.field.appendChild(div);

           },

           setShootMatrix: function () {
               for (var i = 0; i < 2; ++i) {
                   for (var j = 0; j < comp.startPoints[i].length; ++j) {
                       var x = comp.startPoints[i][j][0],
                           y = comp.startPoints[i][j][1];
                       switch (i) {
                           // побочные диаганали с направлением вниз
                           case 0:
                               while(x <= 9 && y <= 9) {
                                   comp.shootMatrixAI.push([x, y]);
                                   x++; y++;
                               }
                               break;
                           case 1:
                               while (x >= 0 && y <= 9) {
                                   comp.shootMatrixAI.push([x, y]);
                                   x--; y++;
                               }
                               break;
                       }
                   }
               }
               for (var i = 0; i < 10; ++i) {
                   for (var j = 0; j < 10; ++j) {
                       comp.shootMatrix.push([i, j]);
                   }
               }
               function compareRandom (a, b) {
                    return Math.random() - 0.5;
               }
               comp.shootMatrixAI.sort(compareRandom);
               comp.shootMatrix.sort(compareRandom);
           },

           getCoordinatesShot: function () {
               var temp_coords = (comp.shootMatrixAround.length > 0) ? comp.shootMatrixAround.pop() :
                   (comp.shootMatrixAI.length > 0) ? comp.shootMatrixAI.pop() : comp.shootMatrix.pop();
               var obj = {
                   x: temp_coords[0],
                   y: temp_coords[1]
               };
               if (comp.shootMatrixAI.length != 0) {
                   self.deleteElementMatrix(comp.shootMatrixAI, obj);
               }
               self.deleteElementMatrix(comp.shootMatrix, obj);
               return obj;
           },

           deleteElementMatrix: function (array, obj) {
               for(var i = 0; i < array.length; ++i) {
                   if (array[i][0] == obj.x && array[i][1] == obj.y) {
                       array.splice(i, 1);
                       break;
                   }
               }
           },

           resetTempShip: function () {
               comp.shootMatrixAround = [];
               comp.tempShip = {
                   totalHits: 0,
                   firstHit: {},
                   nextHit: {},
                   kx: 0,
                   ky: 0
               };
           },

           markEmptyCell: function (points) {
               for (var i = 0; i < points.length; i++) {
                   var obj = {
                       x: points[i][0],
                       y: points[i][1]
                   };
                   if (obj.x < 0 || obj.x > 9 || obj.y < 0 || obj.y > 9) continue;
                   if (user.matrix[obj.x][obj.y] != 0) continue;
                   user.matrix[obj.x][obj.y] = 2;
                   self.showIcons(user, obj, 'shaded-cell');
                   self.deleteElementMatrix(comp.shootMatrix, obj);
                   self.deleteElementMatrix(comp.shootMatrixAround, obj);
                   self.deleteElementMatrix(comp.shootMatrixAI, obj);
               }
           },

           checkMaxDecks: function () {
               var arr = [];
               for (var i = 0; i < user.squadron.length; i++) {
                   arr.push(user.squadron[i].decks);
               }
               return Math.max.apply(null, arr);
           },

           setShootMatrixAround: function () {
               if (comp.tempShip.kx == 0 && comp.tempShip.ky == 0) {
                   if (Object.keys(comp.tempShip.firstHit).length == 0) {
                       comp.tempShip.firstHit = coords;
                   } else {
                       comp.tempShip.nextHit = coords;
                       comp.tempShip.kx = (comp.tempShip.firstHit.x != comp.tempShip.nextHit.x);
                       comp.tempShip.ky = (comp.tempShip.firstHit.y != comp.tempShip.nextHit.y);

                   }
               }

               if (coords.x > 0 && comp.tempShip.ky == 0) {
                   if (user.matrix[coords.x - 1][coords.y] <= 1) {
                       comp.shootMatrixAround.push([coords.x - 1, coords.y]);
                   }
               }
               if (coords.x < 9 && comp.tempShip.ky == 0) {
                   if (user.matrix[coords.x + 1][coords.y] <= 1) {
                       comp.shootMatrixAround.push([coords.x + 1, coords.y]);
                   }
               }
               if (coords.y > 0 && comp.tempShip.kx == 0) {
                   if (user.matrix[coords.x][coords.y - 1] <= 1) {
                       comp.shootMatrixAround.push([coords.x, coords.y - 1]);
                   }
               }
               if (coords.y < 9 && comp.tempShip.kx == 0) {
                   if (user.matrix[coords.x][coords.y + 1] <= 1) {
                       comp.shootMatrixAround.push([coords.x, coords.y + 1]);
                   }
               }

               if (comp.shootMatrixAround.length == 0) {
                   self.resetTempShip();
               }
           }

       };

       return ({
           battle: battle,
           init: battle.init
       });
    })();
};