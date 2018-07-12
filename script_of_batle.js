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

    var userfield = getElement('field_user'), compfield = getElement('field_comp');
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
    }
    

};