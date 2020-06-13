const record = document.getElementById('record'),
      globalRecord = document.getElementById('globalRecord'),
      shot = document.getElementById('shot'),
      hit = document.getElementById('hit'),
      dead = document.getElementById('dead'),
      enemy = document.getElementById('enemy'),
      again = document.getElementById('again'),
      header = document.querySelector('.header'),
      td = document.querySelectorAll('td'),
      recordsContainer = document.querySelector('.recordTable');
let maxRecord = 100;

const firebaseConfig = {
apiKey: "AIzaSyAbctuhBK-xZxCWqU0kRIrr8z3v9dVkaTw",
authDomain: "seabatle-3ec39.firebaseapp.com",
databaseURL: "https://seabatle-3ec39.firebaseio.com",
projectId: "seabatle-3ec39",
storageBucket: "seabatle-3ec39.appspot.com",
messagingSenderId: "667285416837",
appId: "1:667285416837:web:998404136bdbddbff372ec"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const getData = () => {
    firebase.database().ref().child('seaBattleRecord').once('value')
        .then(snap => snap.val() ? getRecords(Object.values(snap.val())) : 0).catch(err => console.error(err))
};
const getRecords = (obj) => {
   recordsContainer.innerHTML = '';
    obj.forEach(el => {
        el.record < maxRecord ? maxRecord = el.record : 0;
        recordsContainer.insertAdjacentHTML('beforeend', `
            <div class="recordItem">
                <span>Рекорд: </span>
                <span class="recordValue">${el.record}</span>
                <span>Поставил</span>
                <span class="recordName">${el.name}</span>
                <span class="recordDate">${el.dataRecord}</span>
            </div>
        `)
    });
    globalRecord.textContent = maxRecord;
}

getData();

const game = {
    ships: [],
    shipCount: 0,
    optionShip: {
        conut: [1, 2, 3, 4],
        size: [4, 3, 2, 1]
    },

    collision: new Set(),

    generateShip() {
        for (let i = 0; i < this.optionShip.conut.length; i++) {
            for (let j = 0; j < this.optionShip.conut[i]; j++) {
               const size = this.optionShip.size[i];
               const ship = this.generateOptionShip(size);
               this.ships.push(ship);
               this.shipCount++;
            }
        }
    },
    generateOptionShip(shipSize) {
        const ship = {
            hit: [],
            location: [],
        };

        const direction = Math.random() < 0.5;
        let x, y;

        if (direction) {
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * (10 - shipSize));
        } else {
            x = Math.floor(Math.random() * (10 - shipSize));
            y = Math.floor(Math.random() * 10);
        }
        
        for (let i = 0; i < shipSize; i++) {
            if (direction) {
                ship.location.push(x + '' + (y + i))
            } else {
                ship.location.push((x + i) + '' + y)
            }
            ship.hit.push('');
        }

        if (this.checkCollision(ship.location)) {
            return this.generateOptionShip(shipSize)
        }

        this.addCollision(ship.location);

        return ship;
    },
    checkCollision(location) {
        for (const cord of location) {
            if (this.collision.has(cord)) {
                return true;
            }
        }
    },
    addCollision(location) {
        for (let i = 0; i < location.length; i++) {
            const startCordX = location[i][0] - 1;

            for (let j = startCordX; j < startCordX + 3; j++) {
                const startCordY = location[i][1] - 1;

                for (let z = startCordY; z < startCordY + 3; z++) {

                    if (j >= 0 && j < 10 && z >= 0 && z < 10) {
                        const cord = j + '' + z;
                        this.collision.add(cord);
  
                    }
                    
                }
            }
        }
    }
};

const play = {
    record: 0,
    shot: 0,
    hit: 0,
    dead: 0,

    set updateData(data) {
        this[data] += 1;
        this.render();
    },

    clearData() {
        this.shot = 0;
        this.hit= 0;
        this.dead= 0;
        this.render();
    },

    render() {
        record.textContent = this.record;
        shot.textContent = this.shot;
        hit.textContent = this.hit;
        dead.textContent = this.dead;
    }
};

const show = {
    hit(elem) {
        this.changeClass(elem, 'hit')
    },

    miss(elem) {
        this.changeClass(elem, 'miss')
    },

    dead(elem) {
        this.changeClass(elem, 'dead')
    },

    deadMiss(elem) {
        this.changeClass(elem, 'out-dead')
    },

    changeClass(elem, value) {
        elem.className = value;
    }
};

const fire = (event) => {
    const target = event.target;
    if(target.classList.length > 0 || target.tagName !== 'TD' || game.shipCount < 1) return;
    show.miss(target);
    play.updateData = 'shot';

    for (let i = 0; i < game.ships.length; i++) {
        const ship = game.ships[i];
        const index = ship.location.indexOf(target.id);
        if (index >= 0) {
            show.hit(target);
            play.updateData = 'hit';
            ship.hit[index] = 'x';
            const life = ship.hit.indexOf('');

            if (life < 0) {

                play.updateData = 'dead';
                for (const id of ship.location) {
                    show.dead(document.getElementById(id));
                }

                for (let k = 0; k < ship.location.length; k++) {
                    const startCordX = ship.location[k][0] - 1;
        
                    for (let j = startCordX; j < startCordX + 3; j++) {
                        const startCordY = ship.location[k][1] - 1;
        
                        for (let z = startCordY; z < startCordY + 3; z++) {
        
                            if (j >= 0 && j < 10 && z >= 0 && z < 10) {
                                const cord = j + '' + z;
                                
                                if(!document.getElementById(cord).classList.length) {
                                show.deadMiss(document.getElementById(cord));
                                }
          
                            }
                            
                        }
                    }
                }

                game.shipCount -= 1;

                if (game.shipCount < 1) {
                    header.textContent = 'Игра Окончена';
                    header.style.color = 'red';

                    enemy.classList.add('td-hover');
                    for (let f = 0; f < td.length; f++) {
                        td[f].classList.add('td-hover');
                    }
                    
                    getData();

                    if (play.shot < play.record || play.record === 0) {
                        play.record = play.shot;
                        play.render();

                        if (play.record < maxRecord) {
                            const name = prompt('Вы побили глобальный рекорд! Запишите свой ник для таблицы рекордов:');
                            const time = new Date();
                            const obj = {'name': name ? name : 'NoName', 'record': play.shot, 'dataRecord': `${time.getDate()}/${time.getMonth()}/${time.getUTCFullYear()} ${time.getHours()}:${
                                String(time.getMinutes()).length < 2 ? '0' + String(time.getMinutes()) : time.getMinutes()
                            }`};
                            firebase.database().ref().child('seaBattleRecord').push(obj);
                        }
                    }
                }
            }
        }
    }
};

const init = () => {
    enemy.addEventListener('click', fire);
    play.render();
    game.generateShip();

    again.addEventListener('click', (evt) => {
        evt.preventDefault();
        for (let h = 0; h < td.length; h++) {
            td[h].className = '';
        };
        header.textContent = 'SEA BATTLE';
        header.style.color = 'black';

        enemy.classList.remove('td-hover');
        for (let f = 0; f < td.length; f++) {
            td[f].classList.remove('td-hover');
        }

        game.shipCount = 0;
        game.ships = [];
        game.collision = new Set;
        play.clearData();
        game.generateShip();
        getData();
    });
    
    record.addEventListener('dblclick', () => {
        localStorage.clear();
        play.record = 0;
        play.render();
    });
};

init();


