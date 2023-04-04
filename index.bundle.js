(self["webpackChunkbattleship_buddies"] = self["webpackChunkbattleship_buddies"] || []).push([["index"],{

/***/ "./logic.js":
/*!******************!*\
  !*** ./logic.js ***!
  \******************/
/***/ ((module) => {

const Ship = (num, id) => {
    let length = num;
    let hits = 0;
    let sunkOrNot = false;
    let shipID = id;
    
    const getLength = () => length;
    const hit = () => hits = hits + 1;
    const getHits = () => hits;
    const isSunk = () => {
        if (hits === length) {//will need to make sure they can only get hit ONCE per coordinate span
            sunkOrNot = true;
            return true;
        } else {
            return sunkOrNot;
        }
    }
    return {
        length, sunkOrNot, shipID, hits,
        getLength,
        getHits,
        hit,
        isSunk,
    };
};

const Gameboard = () => {
    let board = {};
    let shipCount = 0;//counts # of ships total AND to gen ID
    let letterNumbArr = ['A','B','C','D','E','F','G','H','I','J'];
    let missedShots = [];
    let shotsHit = [];
    let shipsStillUp = 0;
    //ideally start with 10 -- four 1s, three 2s, two 3s, one 4

    const buildBoard = () => {
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                board[`${letterNumbArr[i]}${[j+1]}`] = "";
            }
        }
    }

    const getShipsAliveCount = () => shipsStillUp;

    const areAllSunk = () => {
        if (getShipsAliveCount() === 0) {
            return true;
        } else {
            return false;
        }
    }
    
    const makeShip = (length) => {
        let newShip = Ship(length, shipCount);
        shipCount++;
        shipsStillUp++;
        return newShip;
    }
    const findSpan = (coordinates, length, axis) => {//coord type String
        let array = [];
        let yValueStart = null;
        let xIndexStart = null;
        //change input coordinates into array; A2 to [A][2]
        let coordArr = coordinates.split('');
        //console.log("coordArr in findSpan is ", coordArr);
        xIndexStart = findXIndex(coordinates);
        if (coordArr.length === 3) {
            yValueStart = Number(coordArr[1].concat(coordArr[2]))
        } else {
            yValueStart = Number(coordArr[1]);
        }
        //console.log("yValueStart in findSpan is ", yValueStart);
        if (length === 1) {//case length === 1
            array.push([coordArr[0]+coordArr[1]]);
        } else {
            if (axis === "horizontal") {//case length > 1
                for (let i = 0; i < length; i++) {
                    let xSpanArray = null;
                    if (coordArr.length === 3) {
                        xSpanArray = [letterNumbArr[xIndexStart+i]+coordArr[1]+coordArr[2]];
                    } else {
                        xSpanArray = [letterNumbArr[xIndexStart+i]+coordArr[1]];
                    }
                    array.push(xSpanArray);
                }
            } else {
                for (let i = 0; i < length; i++) {
                    array.push([coordArr[0]+(yValueStart+i)])
                }
            }
        }
        return array;
    }
    const findXIndex = (coordStr) => {//input string
        let coordArr = coordStr.split('');//ex: 'A2' -> ['A', '2']
        let xStart = letterNumbArr.indexOf(`${coordArr[0]}`);
        return xStart;//output number
    }

    const noShipOverlap = (array) => {//ex: [["A8"],["B8"]]
        let boolean = null;
        let length = array.length - 1;
        for (let i = 0; i <= length; i++) {
            let arrToString = array[i].toString();
            if (board[`${arrToString}`] !== "") {
                boolean = false;
                break;
            } else {
                boolean = true;
            }
        }
        return boolean;
    }

    const placeShip = (position, length, axis) => {//position string
        let xIndexStart = findXIndex(position);
        let coordArr = position.split('');//ex: 'A8' -> ['A', '8']
        let yValueStart = Number(coordArr[1]);

        /* console.log("X ", (xIndexStart+1)+(length-1));
        console.log("Y ", yValueStart+(length-1)); */
        if (axis === "horizontal" && (xIndexStart+1)+(length-1) > 10) {
            console.log("Cannot place ship off gameboard");
            return false;
        } else if (axis === "vertical" && yValueStart+(length-1) > 10) {
            console.log("Cannot place ship off gameboard");
            return false;
        }
        let shipSpan = findSpan(position, length, axis);//[["A7"],["A8"]]
        if (noShipOverlap(shipSpan)) {
            let newShip = Ship(length, shipCount);
            shipSpan.forEach(array => {
                let arrToString = array.toString();
                board[`${arrToString}`] = newShip;
            })
            shipCount++;
            shipsStillUp++;
            return true;
        } else {
            console.log("Sorry, there's a ship in the way!");
            return false;
        }
    }

    const receiveAttack = (targetCoor) => {//assumes you 
        //CAN'T re-attack a position you've missed OR hit already
        let targetInArr = [[targetCoor]];
        if (noShipOverlap(targetInArr) === true) {//checks if ship is there
            //if TRUE, means nothing is there
            console.log("No ship was hit. Nice try!");
            missedShots.push(targetCoor);
        } else if (noShipOverlap(targetInArr) === false) {
            let shipFound = board[`${targetCoor}`];
            console.log("Great shot! You landed a hit.");
            shipFound.hit();
            if (shipFound.getHits() === shipFound.getLength()) {
                shipsStillUp--;
            }
        }
    }

    return {
        board,missedShots,shotsHit,shipCount,
        makeShip,
        buildBoard,
        placeShip,
        findSpan,
        findXIndex,
        noShipOverlap,
        receiveAttack,
        getShipsAliveCount,
        areAllSunk,
    };
}

const Player = (name) => {//assume names inputted are UNIQUE
    
    let id = name;
    let ownBoard = Gameboard();
    ownBoard.buildBoard();
    let letterNumbArr = ['A','B','C','D','E','F','G','H','I','J'];
    let playerBoard = ownBoard.board;
    let airBalls = ownBoard.missedShots;//by the opposing player

    let targetBoard = Gameboard();
    targetBoard.buildBoard();
    let oppoBoard = targetBoard.board;
    let myMisses = targetBoard.missedShots;
    let myHits = targetBoard.shotsHit;

    const getShipForOpp = (coord) => {
        let foundShip = playerBoard[`${coord}`];
        return foundShip;
    }
    const playerPlace = (position, length, axis) => {
        //string 'B3', number 3, string 'horizontal'/'vertical'
        ownBoard.placeShip(position, length, axis);
    }

    const playerPlaceShipSpan = (position, length, axis) => {
        return ownBoard.findSpan(position, length, axis);
    }

    const playerCheckOverlap = (arr) => {
        return ownBoard.noShipOverlap(arr);
    }

    const didAtkMiss = (coord, getAttacked) => {
        if (myHits.includes(`${coord}`)) {
            console.log("already shot here, pls stop");
            return false;
        } else if (myMisses.includes(`${coord}`)) {
            console.log("already missed here, go elsewhere");
            return false;
        } else {
            if (getAttacked(`${coord}`)) {//if it returns true, means missed
                myMisses.push(coord);
                let str = `miss_${coord}`;
                return str;
            } else {
                myHits.push(coord);
                let str = `hits_${coord}`;
                return str;
            }
        }
    }

    const getAttacked = (coord) => {
        let startingLength = airBalls.length;
        ownBoard.receiveAttack(coord);//if it's a miss, airBalls length should increase by 1
        if (airBalls.length > startingLength) {
            return true;
        } else {
            return false;
        }
    }
    const playerShipCount = () => ownBoard.shipCount;
    const shipsUp = () => ownBoard.getShipsAliveCount();
    const allShipsSunk = () => {
        if (shipsUp() === 0) {
            return true;
        } else {
            return false;
        }
    }
    //true if shipCount is 0, false if not

    //----computer logic


    const randomAtkChoice = () => {
        let boolHolder = false;
        //want to pick random X & Y; if NOT within myHits & myMisses, go ahead
        do {
            let coord = randomPosition();
            if (!myHits.includes(`${coord}`) && !myMisses.includes(`${coord}`)) {
                console.log("CPU picked ", coord);
                boolHolder = true;
                return coord;
            }
        } while (!boolHolder)        
    }
    const computerPlace = (length) => {
        //string 'B3', number 3, string 'horizontal'/'vertical'
        /* let position = randomPosition();
        let axis = randomAxis();*/
        let boolHolder = false; 
        let position = null;
        let axis = null;

        /* if (ownBoard.placeShip(position, length, axis) === false) {
            //meaning if it's placed off the board or overlapping
            //want to rerun this function again
        } */

        do {
            console.log("ran another placement by the comp");
            position = randomPosition();
            axis = randomAxis();
            boolHolder = ownBoard.placeShip(position, length, axis);
        } while (!boolHolder)
        return [position, axis];
        
    }
    const randomAxis = () => {
        let chosenAxis = Math.random() < 0.5 ? "horizontal" : "vertical";
        return chosenAxis;
    }
    const randomPosition = () => {
        let randomNumb1 = Math.floor(Math.random()*10);//0-9
        let randomNumb2 = Math.floor(Math.random()*10);
        //console.log(letterNumbArr);
        let randomX = letterNumbArr[randomNumb1];
        let randomY = randomNumb2 + 1;
        return randomX + randomY.toString();
    }

    return {
        id, playerBoard, airBalls, oppoBoard, myMisses, myHits,
        getAttacked, didAtkMiss, playerPlace, computerPlace, randomAtkChoice, shipsUp, allShipsSunk,  playerCheckOverlap, playerPlaceShipSpan, getShipForOpp, playerShipCount,
    };
};

module.exports = { 
    Ship: Ship,
    Gameboard: Gameboard,
    Player: Player,
} 

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/style.css":
/*!*************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/style.css ***!
  \*************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "html, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed, \nfigure, figcaption, footer, header, hgroup, \nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\tfont-size: 100%;\n\tfont: inherit;\n\tvertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure, \nfooter, header, hgroup, menu, nav, section {\n\tdisplay: block;\n}\nbody {\n\tline-height: 1;\n}\nol, ul {\n\tlist-style: none;\n}\nblockquote, q {\n\tquotes: none;\n}\nblockquote:before, blockquote:after,\nq:before, q:after {\n\tcontent: '';\n\tcontent: none;\n}\ntable {\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}\n\n:root {\n    --primary: #ff6fb2; \n    --secondary: #c3195d; \n    --tertiary: #680747; \n    --quaternary: #141010; \n}\n\nhtml, body, div#content {\n    height: 100%;\n    width: 100%;\n    font-size: 15px;\n}\n\ndiv#p1Seperator {\n\tbackground-color: var(--primary);\n}\ndiv#p2Seperator {\n\tbackground-color:aqua;\n}\n\ndiv#P1G, div#P2G {\n\twidth: 60%;\n\tmargin: auto;\n}\n\ndiv.gameboard {\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\tborder: 3px solid pink;\n}\n\n.descriptor {\n\tfont-family: 'Space Grotesk', sans-serif;\n\tfont-size: 1.2rem;\n\tpadding: 0.5rem;\n\ttext-align: center;\n}\n\nbutton#newGameBtn {\n\tbackground-color: #c3195d;\n\tcolor:bisque;\n\tposition: absolute;\n\ttop: 5px;\n\tright: 5px;\n\tdisplay: none;\n}\n\ndiv#doneWithShips {\n\tbackground-color: #680747;\n\tcolor:bisque;\n\tborder: 2px inset gray;\n\tfont-size: 1.0rem;\n\tposition: absolute;\n\tleft: 5px;\n\tpadding: 4px;\n\ttop: 65px;\n\t/* display: none; */\n}\n\ndiv#axisToggle {\n\tbackground-color: #c3195d;\n\tborder: 2px inset gray;\n\tfont-size: 1.0rem;\n\tcolor:bisque;\n\tposition: absolute;\n\tpadding: 4px;\n\ttop: 31px;\n\tleft: 5px;\n\t/* display: none; */\n}\n\ndiv#topBar {\n\tposition: relative;\n}\n\ndiv[class^=\"square\"] {\n\tposition: relative;\n\tflex-basis: calc(9% - 10px);\n\tmargin: 5px;\n\tborder: 1px solid;\n\tbox-sizing: border-box;\n}\n\ndiv[class^=\"square\"]::before {\n\tcontent: '';\n\tdisplay: block;\n\tpadding-top: 100%;\n}\n\ndiv[class^=\"square\"] .contentz {\n\tposition: absolute;\n\ttop: 0; left: 0;\n\theight: 100%;\n\twidth: 100%;\n  \n\tdisplay: flex;               /* added for centered text */\n\tjustify-content: center;     /* added for centered text */\n\talign-items: center;         /* added for centered text */\n}\n\n/* \ndiv#content {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(2, 40%);\n\tgrid-template-rows: repeat(2, 40%);\n}\n\ndiv.gameboard {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(11, 8%);\n\tgrid-template-rows: repeat(11, 8%);\n}\n\ndiv[class^=\"square\"] {\n\tbackground-color: rgb(184, 184, 184);\n\tborder: 1px solid black;\n\topacity: 0.5;\n\taspect-ratio: 1;\n} */\n\n/* loading/spinner stuff */\n\ndiv#lengthIndicator {\n\t/* display: none; */\n\tdisplay: flex;\n\tjustify-content: left;\n\talign-items: center;\n\tgap: 0.5rem;\n\tfont-size: 1.1rem;\n\tposition: absolute;\n\ttop: 5px;\n\tleft: 5px;\n}\n\ninput#lengthInput {\n\twidth: 25%;\n}\n\ndiv#promptPlacingP1 {\n\t/* display: none; */\n\tposition: absolute;\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\twidth: 14%;\n\ttop: 5px;\n\tright: 8px;\n}\n\ndiv#battleStart {\n\tfont-size: 1.3rem;\n\tdisplay: none;\n\tposition: absolute;\n\twidth: 14%;\n\ttop: 5px;\n\tright: 5px;\n}\n\n#loader {\n\tdisplay: none;\n\ttop: 50%;\n\tleft: 50%;\n\tposition: absolute;\n\ttransform: translate(-50%, -50%);\n}\n  \n.loading {\n\tborder: 8px solid rgb(220, 0, 0);\n\twidth: 60px;\n\theight: 60px;\n\tborder-radius: 50%;\n\tborder-top-color: #ff6320;\n\tborder-left-color: #ff7300;\n\tanimation: spin 1s infinite ease-in;\n}\n  \n@keyframes spin {\n\t0% {\n\t  transform: rotate(0deg);\n\t}\n  \n\t100% {\n\t  transform: rotate(360deg);\n\t}\n}\n\n@media screen and (min-width: 800px) {\n\thtml, body, div#content {\n\t  font-size: 15px;\n\t}\n\n\tbody {\n\t\tdisplay: flex;\n\t\tjustify-content: center;\n\t\tbackground-color: var(--tertiary);\n\t}\n\n\tdiv#content {\n\t\twidth: 60%;\n\t}\n\n\tdiv#axisToggle {\n\t\t\n\t\ttop: 37px;\n\t\t/* display: none; */\n\t}\n\n\tdiv#doneWithShips {\n\t\ttop: 75px;\n\t}\n}\n\n@media screen and (min-width: 1250px) {\n\tdiv#content {\n\t\twidth: 50%;\n\t}\n\tdiv#P1G, div#P2G {\n\t\twidth: 50%;\n\t\tmargin: auto;\n\t}\n}", "",{"version":3,"sources":["webpack://./src/style.css"],"names":[],"mappings":"AAAA;;;;;;;;;;;;;CAaC,SAAS;CACT,UAAU;CACV,SAAS;CACT,eAAe;CACf,aAAa;CACb,wBAAwB;AACzB;AACA,gDAAgD;AAChD;;CAEC,cAAc;AACf;AACA;CACC,cAAc;AACf;AACA;CACC,gBAAgB;AACjB;AACA;CACC,YAAY;AACb;AACA;;CAEC,WAAW;CACX,aAAa;AACd;AACA;CACC,yBAAyB;CACzB,iBAAiB;AAClB;;AAEA;IACI,kBAAkB;IAClB,oBAAoB;IACpB,mBAAmB;IACnB,qBAAqB;AACzB;;AAEA;IACI,YAAY;IACZ,WAAW;IACX,eAAe;AACnB;;AAEA;CACC,gCAAgC;AACjC;AACA;CACC,qBAAqB;AACtB;;AAEA;CACC,UAAU;CACV,YAAY;AACb;;AAEA;CACC,aAAa;CACb,eAAe;CACf,sBAAsB;AACvB;;AAEA;CACC,wCAAwC;CACxC,iBAAiB;CACjB,eAAe;CACf,kBAAkB;AACnB;;AAEA;CACC,yBAAyB;CACzB,YAAY;CACZ,kBAAkB;CAClB,QAAQ;CACR,UAAU;CACV,aAAa;AACd;;AAEA;CACC,yBAAyB;CACzB,YAAY;CACZ,sBAAsB;CACtB,iBAAiB;CACjB,kBAAkB;CAClB,SAAS;CACT,YAAY;CACZ,SAAS;CACT,mBAAmB;AACpB;;AAEA;CACC,yBAAyB;CACzB,sBAAsB;CACtB,iBAAiB;CACjB,YAAY;CACZ,kBAAkB;CAClB,YAAY;CACZ,SAAS;CACT,SAAS;CACT,mBAAmB;AACpB;;AAEA;CACC,kBAAkB;AACnB;;AAEA;CACC,kBAAkB;CAClB,2BAA2B;CAC3B,WAAW;CACX,iBAAiB;CACjB,sBAAsB;AACvB;;AAEA;CACC,WAAW;CACX,cAAc;CACd,iBAAiB;AAClB;;AAEA;CACC,kBAAkB;CAClB,MAAM,EAAE,OAAO;CACf,YAAY;CACZ,WAAW;;CAEX,aAAa,gBAAgB,4BAA4B;CACzD,uBAAuB,MAAM,4BAA4B;CACzD,mBAAmB,UAAU,4BAA4B;AAC1D;;AAEA;;;;;;;;;;;;;;;;;;GAkBG;;AAEH,0BAA0B;;AAE1B;CACC,mBAAmB;CACnB,aAAa;CACb,qBAAqB;CACrB,mBAAmB;CACnB,WAAW;CACX,iBAAiB;CACjB,kBAAkB;CAClB,QAAQ;CACR,SAAS;AACV;;AAEA;CACC,UAAU;AACX;;AAEA;CACC,mBAAmB;CACnB,kBAAkB;CAClB,aAAa;CACb,eAAe;CACf,UAAU;CACV,QAAQ;CACR,UAAU;AACX;;AAEA;CACC,iBAAiB;CACjB,aAAa;CACb,kBAAkB;CAClB,UAAU;CACV,QAAQ;CACR,UAAU;AACX;;AAEA;CACC,aAAa;CACb,QAAQ;CACR,SAAS;CACT,kBAAkB;CAClB,gCAAgC;AACjC;;AAEA;CACC,gCAAgC;CAChC,WAAW;CACX,YAAY;CACZ,kBAAkB;CAClB,yBAAyB;CACzB,0BAA0B;CAC1B,mCAAmC;AACpC;;AAEA;CACC;GACE,uBAAuB;CACzB;;CAEA;GACE,yBAAyB;CAC3B;AACD;;AAEA;CACC;GACE,eAAe;CACjB;;CAEA;EACC,aAAa;EACb,uBAAuB;EACvB,iCAAiC;CAClC;;CAEA;EACC,UAAU;CACX;;CAEA;;EAEC,SAAS;EACT,mBAAmB;CACpB;;CAEA;EACC,SAAS;CACV;AACD;;AAEA;CACC;EACC,UAAU;CACX;CACA;EACC,UAAU;EACV,YAAY;CACb;AACD","sourcesContent":["html, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed, \nfigure, figcaption, footer, header, hgroup, \nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\tfont-size: 100%;\n\tfont: inherit;\n\tvertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure, \nfooter, header, hgroup, menu, nav, section {\n\tdisplay: block;\n}\nbody {\n\tline-height: 1;\n}\nol, ul {\n\tlist-style: none;\n}\nblockquote, q {\n\tquotes: none;\n}\nblockquote:before, blockquote:after,\nq:before, q:after {\n\tcontent: '';\n\tcontent: none;\n}\ntable {\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}\n\n:root {\n    --primary: #ff6fb2; \n    --secondary: #c3195d; \n    --tertiary: #680747; \n    --quaternary: #141010; \n}\n\nhtml, body, div#content {\n    height: 100%;\n    width: 100%;\n    font-size: 15px;\n}\n\ndiv#p1Seperator {\n\tbackground-color: var(--primary);\n}\ndiv#p2Seperator {\n\tbackground-color:aqua;\n}\n\ndiv#P1G, div#P2G {\n\twidth: 60%;\n\tmargin: auto;\n}\n\ndiv.gameboard {\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\tborder: 3px solid pink;\n}\n\n.descriptor {\n\tfont-family: 'Space Grotesk', sans-serif;\n\tfont-size: 1.2rem;\n\tpadding: 0.5rem;\n\ttext-align: center;\n}\n\nbutton#newGameBtn {\n\tbackground-color: #c3195d;\n\tcolor:bisque;\n\tposition: absolute;\n\ttop: 5px;\n\tright: 5px;\n\tdisplay: none;\n}\n\ndiv#doneWithShips {\n\tbackground-color: #680747;\n\tcolor:bisque;\n\tborder: 2px inset gray;\n\tfont-size: 1.0rem;\n\tposition: absolute;\n\tleft: 5px;\n\tpadding: 4px;\n\ttop: 65px;\n\t/* display: none; */\n}\n\ndiv#axisToggle {\n\tbackground-color: #c3195d;\n\tborder: 2px inset gray;\n\tfont-size: 1.0rem;\n\tcolor:bisque;\n\tposition: absolute;\n\tpadding: 4px;\n\ttop: 31px;\n\tleft: 5px;\n\t/* display: none; */\n}\n\ndiv#topBar {\n\tposition: relative;\n}\n\ndiv[class^=\"square\"] {\n\tposition: relative;\n\tflex-basis: calc(9% - 10px);\n\tmargin: 5px;\n\tborder: 1px solid;\n\tbox-sizing: border-box;\n}\n\ndiv[class^=\"square\"]::before {\n\tcontent: '';\n\tdisplay: block;\n\tpadding-top: 100%;\n}\n\ndiv[class^=\"square\"] .contentz {\n\tposition: absolute;\n\ttop: 0; left: 0;\n\theight: 100%;\n\twidth: 100%;\n  \n\tdisplay: flex;               /* added for centered text */\n\tjustify-content: center;     /* added for centered text */\n\talign-items: center;         /* added for centered text */\n}\n\n/* \ndiv#content {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(2, 40%);\n\tgrid-template-rows: repeat(2, 40%);\n}\n\ndiv.gameboard {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(11, 8%);\n\tgrid-template-rows: repeat(11, 8%);\n}\n\ndiv[class^=\"square\"] {\n\tbackground-color: rgb(184, 184, 184);\n\tborder: 1px solid black;\n\topacity: 0.5;\n\taspect-ratio: 1;\n} */\n\n/* loading/spinner stuff */\n\ndiv#lengthIndicator {\n\t/* display: none; */\n\tdisplay: flex;\n\tjustify-content: left;\n\talign-items: center;\n\tgap: 0.5rem;\n\tfont-size: 1.1rem;\n\tposition: absolute;\n\ttop: 5px;\n\tleft: 5px;\n}\n\ninput#lengthInput {\n\twidth: 25%;\n}\n\ndiv#promptPlacingP1 {\n\t/* display: none; */\n\tposition: absolute;\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\twidth: 14%;\n\ttop: 5px;\n\tright: 8px;\n}\n\ndiv#battleStart {\n\tfont-size: 1.3rem;\n\tdisplay: none;\n\tposition: absolute;\n\twidth: 14%;\n\ttop: 5px;\n\tright: 5px;\n}\n\n#loader {\n\tdisplay: none;\n\ttop: 50%;\n\tleft: 50%;\n\tposition: absolute;\n\ttransform: translate(-50%, -50%);\n}\n  \n.loading {\n\tborder: 8px solid rgb(220, 0, 0);\n\twidth: 60px;\n\theight: 60px;\n\tborder-radius: 50%;\n\tborder-top-color: #ff6320;\n\tborder-left-color: #ff7300;\n\tanimation: spin 1s infinite ease-in;\n}\n  \n@keyframes spin {\n\t0% {\n\t  transform: rotate(0deg);\n\t}\n  \n\t100% {\n\t  transform: rotate(360deg);\n\t}\n}\n\n@media screen and (min-width: 800px) {\n\thtml, body, div#content {\n\t  font-size: 15px;\n\t}\n\n\tbody {\n\t\tdisplay: flex;\n\t\tjustify-content: center;\n\t\tbackground-color: var(--tertiary);\n\t}\n\n\tdiv#content {\n\t\twidth: 60%;\n\t}\n\n\tdiv#axisToggle {\n\t\t\n\t\ttop: 37px;\n\t\t/* display: none; */\n\t}\n\n\tdiv#doneWithShips {\n\t\ttop: 75px;\n\t}\n}\n\n@media screen and (min-width: 1250px) {\n\tdiv#content {\n\t\twidth: 50%;\n\t}\n\tdiv#P1G, div#P2G {\n\t\twidth: 50%;\n\t\tmargin: auto;\n\t}\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),

/***/ "./src/style.css":
/*!***********************!*\
  !*** ./src/style.css ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!./style.css */ "./node_modules/css-loader/dist/cjs.js!./src/style.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_style_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";


var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

"use strict";


var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./style.css */ "./src/style.css");
/* harmony import */ var _logictodo_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./logictodo.js */ "./src/logictodo.js");









const pkg = __webpack_require__(/*! ../logic.js */ "./logic.js");
const btn = document.getElementById("newGameBtn");
const lengthForShip = document.getElementById("lengthIndicator");
const placeShipInstruct = document.getElementById("promptPlacingP1");
const startBattle = document.getElementById("battleStart");
const readyBtn = document.getElementById("doneWithShips");
const axisToggler = document.getElementById("axisToggle");

function toggleButton() {
    if (btn.style.display === "none" || btn.style.display === "") {
        btn.style.display = "block";
    } else if (btn.style.display = "block") {
        btn.style.display = "none";
    }
}

function startGame() {
    (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__["default"])();//DOM stuff
    //-----game loop start
    let P1 = pkg.Player('Player 1');
    let P2 = pkg.Player('Computer');
    let currentPlayer = null;
    let waitingPlayer = null;

    //currently just player vs CPU
    //add in later - choice of PvP or vs CPU
    //name input for player(s)

    //decide who goes first
    function turnSwitchHideBoards(player) {//insert currentPlayer
        let p1Stuffs = document.getElementById("p1Seperator");
        let p2Stuffs = document.getElementById("p2Seperator");
        if (player === P1) {
            p1Stuffs.style.display = "block";
            p2Stuffs.style.display = "none";
        } else if (player === P2) {
            p1Stuffs.style.display = "none";
            p2Stuffs.style.display = "block";
        }
    }
    function pickStarter() {
        let goFirst = Math.random() < 0.5 ? "P1" : "P2";
        if (goFirst === "P1") {
            currentPlayer = P1;
            waitingPlayer = P2;
        } else {
            currentPlayer = P2;
            waitingPlayer = P1;
        }
        turnSwitchHideBoards(currentPlayer);
    }
    
    function checkForWin() {
        //check for win first
        if (P1.allShipsSunk()) {
            console.log("P2 is the winner. Whoo!!");
            startBattle.style.display = "none";
            toggleButton();
            return true;
        } else if (P2.allShipsSunk()) {
            console.log("P1 is the winner. Whoo!!");
            startBattle.style.display = "none";
            toggleButton();
            return true;
        } else {
            return false;
        }
    }
    function playerTurnSwitch() {
        /* //check for win first
        if (P1.allShipsSunk()) {
            console.log("P2 is the winner. Whoo!!");
            return;
        } else if (P2.allShipsSunk()) {
            console.log("P1 is the winner. Whoo!!");
            return;
        }  else*/ {
            if (currentPlayer === P2) {
                currentPlayer = P1;
                waitingPlayer = P2;
            } else {
                currentPlayer = P2;
                waitingPlayer = P1;
            }
            turnSwitchHideBoards(currentPlayer);
        }
    }
    //pickStarter();
    currentPlayer = P1;
    waitingPlayer = P2;
    turnSwitchHideBoards(currentPlayer);
    console.log("currentPlayer is ", currentPlayer);

    //start with UP TO 10 -- four 1s, three 2s, two 3s, one 4
    currentPlayer = "pausePlace";
    waitingPlayer = "pausePlace"; 
    //to keep target boards from firing

    //code here to toggle the "instructions" for placement on

    axisToggler.addEventListener('click', e => {
        if (axisToggler.innerHTML === "vertical") {
            axisToggler.innerHTML = "horizontal";
        } else if (axisToggler.innerHTML === "horizontal") {
            axisToggler.innerHTML = "vertical";
        }
    })

    let allCopySpansP1 = [];
    let allCopySpansP2 = [];

    const P1SelfBoard = document.querySelector("#P1G");


    P1SelfBoard.addEventListener('click', e => {
        let testArray = [];
        let lengthInputted = document.getElementById("lengthInput").value;
        console.log("lengthInputted is ", lengthInputted);
        let axisInputted = axisToggler.innerHTML;
        console.log("axisInputted is ", axisInputted);
        if (currentPlayer !== "pausePlace" && waitingPlayer !== "pausePlace") {
            return;
        } else if (lengthInputted < 0 || lengthInputted > 4 || lengthInputted === "") {
            console.log("nothing added, whew");
            return;
        }
        else {
            console.log(P1.playerShipCount());
            if (e.target.id === "P1G") {
                return;
            } else if ((e.target.closest(".square").className.slice(0,6) === "square" && e.target.closest(".square").id.slice(1,2) === "0")) {
                return;
            } else if ((e.target.closest(".square").className.slice(0,6) === "square" && e.target.closest(".square").id.slice(0,5) === "empty")) {
                return;
            } else {
                if (P1.playerShipCount() < 10) {
                    let coordPicked = e.target.closest(".square").id.split('_')[0];
                    console.log("coordPicked is ", coordPicked);
                    let shipSpanTestP1 = P1.playerPlaceShipSpan(coordPicked, lengthInputted, axisInputted);
                    console.log("shipSpanTestP1 is ", shipSpanTestP1);
                    let copySpan = shipSpanTestP1.slice();
                    if (P1.playerCheckOverlap(copySpan)) {

                        let copySpan1P1 = shipSpanTestP1.slice();
                        allCopySpansP1.push(copySpan1P1);

                        P1.playerPlace(coordPicked, lengthInputted, axisInputted);
                        testArray.push(copySpan);
                        (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.placeShipsDOM)(shipSpanTestP1, P1, P1, P2);
                        console.log(P1.playerBoard);
                    }
                }
            }
        }
    })

    readyBtn.addEventListener('click', e => {
        //adds an equal # of ships to what P1 has (different lengths)
        let numShipsNeeded = P1.shipsUp();
        for (let k = 0; k < numShipsNeeded; k++) {
            let lengthOfShip = (k%4)+1;
            let compGenPosAxis = P2.computerPlace(lengthOfShip);
            console.log(compGenPosAxis);
            let shipSpan1P2 = P2.playerPlaceShipSpan(compGenPosAxis[0], lengthOfShip, compGenPosAxis[1]);
            let copySpan1P2 = shipSpan1P2.slice();
            allCopySpansP2.push(copySpan1P2);
            (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.placeShipsDOM)(shipSpan1P2, waitingPlayer, P1, P2);
        }
        console.log(P2.playerBoard);
        //once enemy ships have been set, change instructions on right
        //& remove "ship adding" buttons on the left
        readyBtn.style.display = "none";
        axisToggler.style.display = "none";
        lengthForShip.style.display = "none";
        placeShipInstruct.style.display = "none";
        startBattle.style.display = "block";
        currentPlayer = P1;
        waitingPlayer = P2;
    })

    //add in later - choosing where to place ships!
    //DOM/UI selection > firing playerPlace code > setting new DOM
    //or the random CPU ship placement below for vs CPU
    //will also need to put code to HIDE 
    //CPU (or other person's) boards
    
    /* P2.computerPlace(4);
    P2.computerPlace(3);
    P2.computerPlace(2);
    P2.computerPlace(1); */ //randomly places for computer

    /* P1.playerPlace('A2', 3, 'vertical');
    P1.playerPlace('D2', 2, 'horizontal');
    P1.playerPlace('H4', 1, 'vertical');
    P1.playerPlace('J1', 4, 'vertical');
    let shipSpan1P1 = P1.playerPlaceShipSpan('A2', 3, 'vertical');
    let shipSpan2P1 = P1.playerPlaceShipSpan('D2', 2, 'horizontal');
    let shipSpan3P1 = P1.playerPlaceShipSpan('H4', 1, 'vertical');
    let shipSpan4P1 = P1.playerPlaceShipSpan('J1', 4, 'vertical');

    let copySpan1P1 = shipSpan1P1.slice();
    let copySpan2P1 = shipSpan2P1.slice();
    let copySpan3P1 = shipSpan3P1.slice();
    let copySpan4P1 = shipSpan4P1.slice();
    let allCopySpansP1 = [];
    allCopySpansP1.push(copySpan1P1);
    allCopySpansP1.push(copySpan2P1);
    allCopySpansP1.push(copySpan3P1);
    allCopySpansP1.push(copySpan4P1); */

    /* P2.playerPlace('A2', 3, 'vertical');
    P2.playerPlace('D2', 2, 'horizontal');
    P2.playerPlace('H4', 1, 'vertical');
    P2.playerPlace('J1', 4, 'vertical'); */

    /* let shipSpan1P2 = P2.playerPlaceShipSpan('A2', 3, 'vertical');
    let shipSpan2P2 = P2.playerPlaceShipSpan('D2', 2, 'horizontal');
    let shipSpan3P2 = P2.playerPlaceShipSpan('H4', 1, 'vertical');
    let shipSpan4P2 = P2.playerPlaceShipSpan('J1', 4, 'vertical'); */
    //testing using these spans to find if a ship's coordinates 
    //are within it, and then using that to "block" out a sunk ship
    //on the DOM
    /* let copySpan1P2 = shipSpan1P2.slice();
    let copySpan2P2 = shipSpan2P2.slice();
    let copySpan3P2 = shipSpan3P2.slice();
    let copySpan4P2 = shipSpan4P2.slice();
    let allCopySpansP2 = [];
    allCopySpansP2.push(copySpan1P2);
    allCopySpansP2.push(copySpan2P2);
    allCopySpansP2.push(copySpan3P2);
    allCopySpansP2.push(copySpan4P2); */

    /* placeShipsDOM(shipSpan1P1, currentPlayer, P1, P2);
    placeShipsDOM(shipSpan2P1, currentPlayer, P1, P2);
    placeShipsDOM(shipSpan3P1, currentPlayer, P1, P2);
    placeShipsDOM(shipSpan4P1, currentPlayer, P1, P2); 

    placeShipsDOM(shipSpan1P2, waitingPlayer, P1, P2);
    placeShipsDOM(shipSpan2P2, waitingPlayer, P1, P2);
    placeShipsDOM(shipSpan3P2, waitingPlayer, P1, P2);
    placeShipsDOM(shipSpan4P2, waitingPlayer, P1, P2);*/

    //after ships placed, shrink gameboard so it's less in the way
    /* shrinkOwnBoard(currentPlayer, P1, P2);
    shrinkOwnBoard(waitingPlayer, P1, P2); */


    function spinnerOn() {
        document.getElementById("loader").style.display = "block";
    }
    function spinnerOff() {
        document.getElementById("loader").style.display = "none";
    }
    //P1 (me) first, need addEventListener for my 
    //enemy board
    //one click will have to get the first two char of sq ID
    //and do function (ex: P1.didAtkMiss('A2', P2.getAttacked))
    const P1EnemyBoard = document.querySelector("#P1T");
    P1EnemyBoard.addEventListener('click', e => {
        if (currentPlayer !== P1) {
            return;
        } else {
            if (e.target.id === "P1T") {
                return;
            } else if ((e.target.closest(".square").className.slice(0,6) === "square" && e.target.closest(".square").id.slice(1,2) === "0")) {
                return;
            } else if ((e.target.closest(".square").className.slice(0,6) === "square" && e.target.closest(".square").id.slice(0,5) === "empty")) {
                return;
            } else {
                let coordPicked = e.target.closest(".square").id.split('_')[0];
                console.log("coordPicked was ", coordPicked);
                let result = P1.didAtkMiss(coordPicked, P2.getAttacked);
                let didISinkAShip = P2.getShipForOpp(coordPicked);
                if (result !== false) {

                    //excludes false when coord is already hit/missed
                    let sqHolderCoord = result.slice(5);
                    let hitMiss = result.slice(0,4);
                    console.log("sqHolderCoord: ", sqHolderCoord);
                    console.log("hitMiss: ", hitMiss);
                    (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.fillSquareDOM)(sqHolderCoord, hitMiss, currentPlayer, P1, P2);
                    if (didISinkAShip !== "") {
                        console.log(didISinkAShip.getHits());
                        console.log(didISinkAShip.isSunk());
                        //------------make this so it'll display
                        //that a ship has SUNK 
                        if (didISinkAShip.isSunk()) {
                            let arrayOfDOM = [];
                            allCopySpansP2.forEach(array => {
                                let arrLength = array.length;
                                for (let k = 0; k < arrLength; k++) {
                                    if (array[k].includes(`${coordPicked}`)) {
                                        arrayOfDOM = array;
                                        break;
                                    }
                                }
                                
                            })
                            console.log(arrayOfDOM);
                            arrayOfDOM.forEach(ez => {
                                let arrString = ez[0];
                                (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.shipSunkDOM)(arrString, currentPlayer, P1, P2);
                            })
                        }
                    }
                    console.log("P1 myHits: ", P1.myHits);
                    console.log("P1 myMisses: ", P1.myMisses);
                    
                    //playerTurnSwitch();
                    if (checkForWin() === false) {
                        setTimeout(playerTurnSwitch, 500);//give it time

                        (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.hideCompBoard)();//hide CPU's placements
                        
                        //setTimeout(computerTurn, 2400);

                        setTimeout(function() {
                            // after 1000ms, call the `setTimeout` callback
                            // In the meantime, continue executing code below
                            setTimeout(function() {
                                computerTurn() //runs second after 1100ms
                            },2200)
                        
                            spinnerOn() //runs first, after 1000ms
                        },500)
                    }//computer "thinking"
                    //computerTurn();
                }
                
            }
        }
    })
    
    const P2EnemyBoard = document.querySelector("#P2T");
    P2EnemyBoard.addEventListener('click', e => {
        if (currentPlayer !== P2) {
            return;
        } else {
            if (e.target.id === "P2T") {
                return;
            } else if ((e.target.closest(".square").className.slice(0,6) === "square" && e.target.closest(".square").id.slice(1,2) === "0")) {
                return;
            } else if ((e.target.closest(".square").className.slice(0,6) === "square" && e.target.closest(".square").id.slice(0,5) === "empty")) {
                return;
            } else {
                let coordPicked = e.target.closest(".square").id.slice(0,2);
                console.log("coordPicked was ", coordPicked);
                let result = P2.didAtkMiss(coordPicked, P1.getAttacked);
                if (result !== false) {
                    //excludes false when coord is already hit/missed
                    let sqHolderCoord = result.slice(5);
                    let hitMiss = result.slice(0,4);
                    console.log("sqHolderCoord: ", sqHolderCoord);
                    console.log("hitMiss: ", hitMiss);
                    (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.fillSquareDOM)(sqHolderCoord, hitMiss, currentPlayer, P1, P2);
                    console.log("P2 myHits: ", P2.myHits);
                    console.log("P2 myMisses: ", P2.myMisses);
                    if (checkForWin() === false) { 
                        setTimeout(playerTurnSwitch, 1500);//give it time
                    }
                    //playerTurnSwitch();
                }
            }
        }
    })

    function computerTurn() {
        //current player just switched to P2, aka Computer
        let result = P2.didAtkMiss(P2.randomAtkChoice(), P1.getAttacked);
        let sqHolderCoord = result.slice(5);
        let hitMiss = result.slice(0,4);

        
        console.log("result: ", result);
        console.log("sqHolderCoord: ", sqHolderCoord);
        console.log("hitMiss: ", hitMiss);
        (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.fillSquareDOM)(sqHolderCoord, hitMiss, currentPlayer, P1, P2);
        console.log("P2 myHits: ", P2.myHits);
        console.log("P2 myMisses: ", P2.myMisses);
        if (checkForWin() === false) {
            setTimeout(playerTurnSwitch, 1500);//give it time
        }
        spinnerOff();
    }

    /* P1.didAtkMiss('A2', P2.getAttacked);
    P2.didAtkMiss(P2.randomAtkChoice(), P1.getAttacked);
    console.log(P1.playerBoard);
    console.log(P2.playerBoard);
    console.log(P1.myHits);
    console.log(P2.myHits);
    console.log(P2.myMisses); */
}


btn.addEventListener('click', e => {
    toggleButton();
    btn.style.display = "block";
    readyBtn.style.display = "block";
    axisToggler.style.display = "block";
    lengthForShip.style.display = "block";
    placeShipInstruct.style.display = "block";
    toggleButton();
    (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.resetDOM)();
    startGame();
    
})

startGame();


/***/ }),

/***/ "./src/logictodo.js":
/*!**************************!*\
  !*** ./src/logictodo.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ logictodo),
/* harmony export */   "fillSquareDOM": () => (/* binding */ fillSquareDOM),
/* harmony export */   "hideCompBoard": () => (/* binding */ hideCompBoard),
/* harmony export */   "placeShipsDOM": () => (/* binding */ placeShipsDOM),
/* harmony export */   "resetDOM": () => (/* binding */ resetDOM),
/* harmony export */   "shipSunkDOM": () => (/* binding */ shipSunkDOM),
/* harmony export */   "shrinkOwnBoard": () => (/* binding */ shrinkOwnBoard)
/* harmony export */ });
function logictodo() {

    let gameboards = document.getElementsByClassName("gameboard");
    Array.prototype.forEach.call(gameboards, function(el) {
        let letterNumbArr = ['empty','A','B','C','D','E','F','G','H','I','J'];
        for (let i = 0; i < 11; i++) {
            for (let j = 0; j < 11; j++) {
                let newSq = document.createElement("div");
                newSq.className = `square`;
                let someContent = document.createElement("div");
                someContent.className = "contentz";
                if (j === 0 && i !== 0) {
                    someContent.innerHTML = `${i}`;
                } 
                if (i === 0 && j !== 0) {
                    someContent.innerHTML = `${letterNumbArr[j]}`
                }
                newSq.appendChild(someContent);
                el.appendChild(newSq);
            }
        }
    });

    let firstSection = document.getElementById("P1G");
    let setSquares = firstSection.getElementsByClassName("square");
    let setSqArray = Array.from(setSquares);//convert to array

    let secondSection = document.getElementById("P1T");
    let setSecondSquares = secondSection.getElementsByClassName("square");
    let setSecondSqArray = Array.from(setSecondSquares);//convert to array

    let thirdSection = document.getElementById("P2G");
    let setThirdSquares = thirdSection.getElementsByClassName("square");
    let setThirdSqArray = Array.from(setThirdSquares);//convert to array

    let fourthSection = document.getElementById("P2T");
    let setFourthSquares = fourthSection.getElementsByClassName("square");
    let setFourthSqArray = Array.from(setFourthSquares);//convert to array

    function setColumns(someArray, name) {

        let letterNumbArr = ['empty','A','B','C','D','E','F','G','H','I','J'];
        let j0 = 0;
        let j1 = 0;
        let j2 = 0;
        let j3 = 0;
        let j4 = 0;
        let j5 = 0;
        let j6 = 0;
        let j7 = 0;
        let j8 = 0;
        let j9 = 0;
        let j10 = 0;
        for (let i = 0; i < someArray.length; i++) {
            if (i%11 === 0) {
                someArray[i].className = `square ${letterNumbArr[0]}`;
            
                someArray[i].setAttribute("id", `${letterNumbArr[0]}${[j0]}_`+name);
                j0++;
            } else if (i%11 === 1) {
                someArray[i].className = `square ${letterNumbArr[1]}`;
                
                    someArray[i].setAttribute("id", `${letterNumbArr[1]}${[j1]}_`+name);
                    j1++;
                
            } else if (i%11 === 2) {
                someArray[i].className = `square ${letterNumbArr[2]}`;
                
                    someArray[i].setAttribute("id", `${letterNumbArr[2]}${[j2]}_`+name);
                    j2++;
                
            } else if (i%11 === 3) {
                someArray[i].className = `square ${letterNumbArr[3]}`;
                
                    someArray[i].setAttribute("id", `${letterNumbArr[3]}${[j3]}_`+name);
                    j3++;
                
            } else if (i%11 === 4) {
                someArray[i].className = `square ${letterNumbArr[4]}`;
                
                    someArray[i].setAttribute("id", `${letterNumbArr[4]}${[j4]}_`+name);
                    j4++;
                
            } else if (i%11 === 5) {
                someArray[i].className = `square ${letterNumbArr[5]}`;
                
                    someArray[i].setAttribute("id", `${letterNumbArr[5]}${[j5]}_`+name);
                    j5++;
                
            } else if (i%11 === 6) {
                someArray[i].className = `square ${letterNumbArr[6]}`;
                
                    someArray[i].setAttribute("id", `${letterNumbArr[6]}${[j6]}_`+name);
                    j6++;
                
            } else if (i%11 === 7) {
                someArray[i].className = `square ${letterNumbArr[7]}`;
                
                    someArray[i].setAttribute("id", `${letterNumbArr[7]}${[j7]}_`+name);
                    j7++;
                
            } else if (i%11 === 8) {
                someArray[i].className = `square ${letterNumbArr[8]}`;
                
                    someArray[i].setAttribute("id", `${letterNumbArr[8]}${[j8]}_`+name);
                    j8++;
                
            } else if (i%11 === 9) {
                someArray[i].className = `square ${letterNumbArr[9]}`;
                
                    someArray[i].setAttribute("id", `${letterNumbArr[9]}${[j9]}_`+name);
                    j9++;
                
            } else if (i%11 === 10) {
                someArray[i].className = `square ${letterNumbArr[10]}`;
                
                    someArray[i].setAttribute("id", `${letterNumbArr[10]}${[j10]}_`+name);
                    j10++;
                
            } 
        }
    }

    setColumns(setSqArray, "firstOne");
    setColumns(setSecondSqArray, "secondOne");
    setColumns(setThirdSqArray, "thirdOne");
    setColumns(setFourthSqArray, "fourthOne");

    
}

function placeShipsDOM(array, player, P1, P2) {//array from playerPlaceShipSpan
    if (player === P1) {
        array.forEach(el => {
            let str = el[0];
            let specificSqFound = document.getElementById(`${str}_firstOne`);
            specificSqFound.style.backgroundColor = "blue";
        })
    } else if (player === P2) {
        array.forEach(el => {
            let str = el[0];
            let specificSqFound = document.getElementById(`${str}_thirdOne`);
            specificSqFound.style.backgroundColor = "green";
        })
    }
    
}  

/* export function undoHoverDOM(array, player, P1, P2) {
    if (player === P1) {
        array.forEach(el => {
            let str = el[0];
            let specificSqFound = document.getElementById(`${str}_firstOne`);
            specificSqFound.style.opacity = "0.8";
        })
    } else if (player === P2) {
        array.forEach(el => {
            let str = el[0];
            let specificSqFound = document.getElementById(`${str}_thirdOne`);
            specificSqFound.style.backgroundColor = "green";
        })
    }
}

export function hoverShipsDOM(array, player, P1, P2) {//array from playerPlaceShipSpan
    if (player === P1) {
        array.forEach(el => {
            let str = el[0];
            let specificSqFound = document.getElementById(`${str}_firstOne`);
            specificSqFound.style.backgroundColor = "lightblue";
            specificSqFound.style.opacity = "1";
        })
    } else if (player === P2) {
        array.forEach(el => {
            let str = el[0];
            let specificSqFound = document.getElementById(`${str}_thirdOne`);
            specificSqFound.style.backgroundColor = "green";
        })
    }
    
}   */

function fillSquareDOM(str, hitOrMiss, player, P1, P2) {//input string of coord
    if (player === P1) {
        let sqToChange = document.getElementById(`${str}_secondOne`);
        if (hitOrMiss === "miss") {
            sqToChange.style.backgroundColor = "white";
        } else if (hitOrMiss === "hits") {
            sqToChange.style.backgroundColor = "darkorange";
        }
    } else if (player === P2) {
        let sqToChange = document.getElementById(`${str}_fourthOne`);
        if (hitOrMiss === "miss") {
            sqToChange.style.backgroundColor = "white";
        } else if (hitOrMiss === "hits") {
            sqToChange.style.backgroundColor = "darkorange";
        }
    }
}

function shipSunkDOM(str, player, P1, P2) {//input string coord
    if (player === P1) { 
        let sqToSink = document.getElementById(`${str}_secondOne`);
        sqToSink.style.backgroundColor = "black";
    } else if (player === P2) {

        let sqToSink = document.getElementById(`${str}_fourthOne`);
        sqToSink.style.backgroundColor = "black";
    }
}

function shrinkOwnBoard(player, P1, P2) {
    if (player === P1) {
        let boardToShrink = document.getElementById("P1G");
        boardToShrink.style.width = "60%";
    } else if (player === P2) {
        let boardToShrink = document.getElementById("P2G");
        boardToShrink.style.width = "60%";
    }
}

function hideCompBoard() {

    function randomColor(brightness){
        function randomChannel(brightness){
          var r = 255-brightness;
          var n = 0|((Math.random() * r) + brightness);
          var s = n.toString(16);
          return (s.length==1) ? '0'+s : s;
        }
        return '#' + randomChannel(brightness) + randomChannel(brightness) + randomChannel(brightness);
    }

    let compGameBoard = document.getElementById("P2G");
    let childNodes = compGameBoard.childNodes;
    let array = Array.from(childNodes);
    array.forEach(node => {
        let newColor = randomColor(125);
        node.style.backgroundColor = `${newColor}`;
    })
}

function resetDOM() {
    let firstNode = document.getElementById("P1G");
    let secondNode = document.getElementById("P1T");
    let thirdNode = document.getElementById("P2G");
    let fourthNode = document.getElementById("P2T");
    while (firstNode.firstChild) {
        firstNode.removeChild(firstNode.lastChild);
    }
    while (secondNode.firstChild) {
        secondNode.removeChild(secondNode.lastChild);
    }
    while (thirdNode.firstChild) {
        thirdNode.removeChild(thirdNode.lastChild);
    }
    while (fourthNode.firstChild) {
        fourthNode.removeChild(fourthNode.lastChild);
    }
}


/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__("./src/index.js"));
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFVLEtBQUssS0FBSyxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksYUFBYSxhQUFhLGFBQWEsT0FBTyxLQUFLLFVBQVUsVUFBVSxVQUFVLE9BQU8sS0FBSyxZQUFZLE1BQU0sS0FBSyxZQUFZLE9BQU8sS0FBSyxVQUFVLFVBQVUsTUFBTSxLQUFLLFVBQVUsVUFBVSxZQUFZLE9BQU8sS0FBSyxZQUFZLGFBQWEsV0FBVyxZQUFZLE9BQU8sS0FBSyxZQUFZLFdBQVcsWUFBWSxXQUFXLFVBQVUsVUFBVSxNQUFNLEtBQUssWUFBWSxXQUFXLFlBQVksYUFBYSxhQUFhLFdBQVcsVUFBVSxVQUFVLFlBQVksT0FBTyxLQUFLLFlBQVksYUFBYSxhQUFhLFdBQVcsWUFBWSxXQUFXLFVBQVUsVUFBVSxZQUFZLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxZQUFZLGFBQWEsV0FBVyxZQUFZLGFBQWEsT0FBTyxLQUFLLFVBQVUsVUFBVSxZQUFZLE9BQU8sS0FBSyxZQUFZLHFCQUFxQixVQUFVLFdBQVcsd0JBQXdCLHlCQUF5Qix5QkFBeUIsT0FBTyxzQkFBc0IsT0FBTyxhQUFhLE1BQU0sWUFBWSxXQUFXLFlBQVksYUFBYSxXQUFXLFlBQVksYUFBYSxXQUFXLFVBQVUsTUFBTSxLQUFLLFVBQVUsTUFBTSxLQUFLLFlBQVksYUFBYSxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsTUFBTSxLQUFLLFlBQVksV0FBVyxZQUFZLFdBQVcsVUFBVSxVQUFVLE1BQU0sS0FBSyxVQUFVLFVBQVUsVUFBVSxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksV0FBVyxVQUFVLFlBQVksYUFBYSxhQUFhLGFBQWEsT0FBTyxLQUFLLEtBQUssWUFBWSxPQUFPLEtBQUssWUFBWSxNQUFNLE1BQU0sS0FBSyxLQUFLLFVBQVUsT0FBTyxLQUFLLFVBQVUsWUFBWSxhQUFhLE9BQU8sS0FBSyxVQUFVLE1BQU0sTUFBTSxVQUFVLFlBQVksT0FBTyxLQUFLLFVBQVUsS0FBSyxNQUFNLEtBQUssS0FBSyxVQUFVLEtBQUssS0FBSyxVQUFVLFVBQVUsS0FBSyxt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UDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vbG9naWMuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vc3JjL3N0eWxlLmNzcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL3NyYy9zdHlsZS5jc3M/NzE2MyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9zcmMvbG9naWN0b2RvLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFNoaXAgPSAobnVtLCBpZCkgPT4ge1xuICAgIGxldCBsZW5ndGggPSBudW07XG4gICAgbGV0IGhpdHMgPSAwO1xuICAgIGxldCBzdW5rT3JOb3QgPSBmYWxzZTtcbiAgICBsZXQgc2hpcElEID0gaWQ7XG4gICAgXG4gICAgY29uc3QgZ2V0TGVuZ3RoID0gKCkgPT4gbGVuZ3RoO1xuICAgIGNvbnN0IGhpdCA9ICgpID0+IGhpdHMgPSBoaXRzICsgMTtcbiAgICBjb25zdCBnZXRIaXRzID0gKCkgPT4gaGl0cztcbiAgICBjb25zdCBpc1N1bmsgPSAoKSA9PiB7XG4gICAgICAgIGlmIChoaXRzID09PSBsZW5ndGgpIHsvL3dpbGwgbmVlZCB0byBtYWtlIHN1cmUgdGhleSBjYW4gb25seSBnZXQgaGl0IE9OQ0UgcGVyIGNvb3JkaW5hdGUgc3BhblxuICAgICAgICAgICAgc3Vua09yTm90ID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHN1bmtPck5vdDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBsZW5ndGgsIHN1bmtPck5vdCwgc2hpcElELCBoaXRzLFxuICAgICAgICBnZXRMZW5ndGgsXG4gICAgICAgIGdldEhpdHMsXG4gICAgICAgIGhpdCxcbiAgICAgICAgaXNTdW5rLFxuICAgIH07XG59O1xuXG5jb25zdCBHYW1lYm9hcmQgPSAoKSA9PiB7XG4gICAgbGV0IGJvYXJkID0ge307XG4gICAgbGV0IHNoaXBDb3VudCA9IDA7Ly9jb3VudHMgIyBvZiBzaGlwcyB0b3RhbCBBTkQgdG8gZ2VuIElEXG4gICAgbGV0IGxldHRlck51bWJBcnIgPSBbJ0EnLCdCJywnQycsJ0QnLCdFJywnRicsJ0cnLCdIJywnSScsJ0onXTtcbiAgICBsZXQgbWlzc2VkU2hvdHMgPSBbXTtcbiAgICBsZXQgc2hvdHNIaXQgPSBbXTtcbiAgICBsZXQgc2hpcHNTdGlsbFVwID0gMDtcbiAgICAvL2lkZWFsbHkgc3RhcnQgd2l0aCAxMCAtLSBmb3VyIDFzLCB0aHJlZSAycywgdHdvIDNzLCBvbmUgNFxuXG4gICAgY29uc3QgYnVpbGRCb2FyZCA9ICgpID0+IHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDEwOyBqKyspIHtcbiAgICAgICAgICAgICAgICBib2FyZFtgJHtsZXR0ZXJOdW1iQXJyW2ldfSR7W2orMV19YF0gPSBcIlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZ2V0U2hpcHNBbGl2ZUNvdW50ID0gKCkgPT4gc2hpcHNTdGlsbFVwO1xuXG4gICAgY29uc3QgYXJlQWxsU3VuayA9ICgpID0+IHtcbiAgICAgICAgaWYgKGdldFNoaXBzQWxpdmVDb3VudCgpID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjb25zdCBtYWtlU2hpcCA9IChsZW5ndGgpID0+IHtcbiAgICAgICAgbGV0IG5ld1NoaXAgPSBTaGlwKGxlbmd0aCwgc2hpcENvdW50KTtcbiAgICAgICAgc2hpcENvdW50Kys7XG4gICAgICAgIHNoaXBzU3RpbGxVcCsrO1xuICAgICAgICByZXR1cm4gbmV3U2hpcDtcbiAgICB9XG4gICAgY29uc3QgZmluZFNwYW4gPSAoY29vcmRpbmF0ZXMsIGxlbmd0aCwgYXhpcykgPT4gey8vY29vcmQgdHlwZSBTdHJpbmdcbiAgICAgICAgbGV0IGFycmF5ID0gW107XG4gICAgICAgIGxldCB5VmFsdWVTdGFydCA9IG51bGw7XG4gICAgICAgIGxldCB4SW5kZXhTdGFydCA9IG51bGw7XG4gICAgICAgIC8vY2hhbmdlIGlucHV0IGNvb3JkaW5hdGVzIGludG8gYXJyYXk7IEEyIHRvIFtBXVsyXVxuICAgICAgICBsZXQgY29vcmRBcnIgPSBjb29yZGluYXRlcy5zcGxpdCgnJyk7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJjb29yZEFyciBpbiBmaW5kU3BhbiBpcyBcIiwgY29vcmRBcnIpO1xuICAgICAgICB4SW5kZXhTdGFydCA9IGZpbmRYSW5kZXgoY29vcmRpbmF0ZXMpO1xuICAgICAgICBpZiAoY29vcmRBcnIubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICB5VmFsdWVTdGFydCA9IE51bWJlcihjb29yZEFyclsxXS5jb25jYXQoY29vcmRBcnJbMl0pKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgeVZhbHVlU3RhcnQgPSBOdW1iZXIoY29vcmRBcnJbMV0pO1xuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJ5VmFsdWVTdGFydCBpbiBmaW5kU3BhbiBpcyBcIiwgeVZhbHVlU3RhcnQpO1xuICAgICAgICBpZiAobGVuZ3RoID09PSAxKSB7Ly9jYXNlIGxlbmd0aCA9PT0gMVxuICAgICAgICAgICAgYXJyYXkucHVzaChbY29vcmRBcnJbMF0rY29vcmRBcnJbMV1dKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChheGlzID09PSBcImhvcml6b250YWxcIikgey8vY2FzZSBsZW5ndGggPiAxXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgeFNwYW5BcnJheSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb29yZEFyci5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHhTcGFuQXJyYXkgPSBbbGV0dGVyTnVtYkFyclt4SW5kZXhTdGFydCtpXStjb29yZEFyclsxXStjb29yZEFyclsyXV07XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4U3BhbkFycmF5ID0gW2xldHRlck51bWJBcnJbeEluZGV4U3RhcnQraV0rY29vcmRBcnJbMV1dO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGFycmF5LnB1c2goeFNwYW5BcnJheSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGFycmF5LnB1c2goW2Nvb3JkQXJyWzBdKyh5VmFsdWVTdGFydCtpKV0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9XG4gICAgY29uc3QgZmluZFhJbmRleCA9IChjb29yZFN0cikgPT4gey8vaW5wdXQgc3RyaW5nXG4gICAgICAgIGxldCBjb29yZEFyciA9IGNvb3JkU3RyLnNwbGl0KCcnKTsvL2V4OiAnQTInIC0+IFsnQScsICcyJ11cbiAgICAgICAgbGV0IHhTdGFydCA9IGxldHRlck51bWJBcnIuaW5kZXhPZihgJHtjb29yZEFyclswXX1gKTtcbiAgICAgICAgcmV0dXJuIHhTdGFydDsvL291dHB1dCBudW1iZXJcbiAgICB9XG5cbiAgICBjb25zdCBub1NoaXBPdmVybGFwID0gKGFycmF5KSA9PiB7Ly9leDogW1tcIkE4XCJdLFtcIkI4XCJdXVxuICAgICAgICBsZXQgYm9vbGVhbiA9IG51bGw7XG4gICAgICAgIGxldCBsZW5ndGggPSBhcnJheS5sZW5ndGggLSAxO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGFyclRvU3RyaW5nID0gYXJyYXlbaV0udG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGlmIChib2FyZFtgJHthcnJUb1N0cmluZ31gXSAhPT0gXCJcIikge1xuICAgICAgICAgICAgICAgIGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYm9vbGVhbiA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJvb2xlYW47XG4gICAgfVxuXG4gICAgY29uc3QgcGxhY2VTaGlwID0gKHBvc2l0aW9uLCBsZW5ndGgsIGF4aXMpID0+IHsvL3Bvc2l0aW9uIHN0cmluZ1xuICAgICAgICBsZXQgeEluZGV4U3RhcnQgPSBmaW5kWEluZGV4KHBvc2l0aW9uKTtcbiAgICAgICAgbGV0IGNvb3JkQXJyID0gcG9zaXRpb24uc3BsaXQoJycpOy8vZXg6ICdBOCcgLT4gWydBJywgJzgnXVxuICAgICAgICBsZXQgeVZhbHVlU3RhcnQgPSBOdW1iZXIoY29vcmRBcnJbMV0pO1xuXG4gICAgICAgIC8qIGNvbnNvbGUubG9nKFwiWCBcIiwgKHhJbmRleFN0YXJ0KzEpKyhsZW5ndGgtMSkpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIlkgXCIsIHlWYWx1ZVN0YXJ0KyhsZW5ndGgtMSkpOyAqL1xuICAgICAgICBpZiAoYXhpcyA9PT0gXCJob3Jpem9udGFsXCIgJiYgKHhJbmRleFN0YXJ0KzEpKyhsZW5ndGgtMSkgPiAxMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJDYW5ub3QgcGxhY2Ugc2hpcCBvZmYgZ2FtZWJvYXJkXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGF4aXMgPT09IFwidmVydGljYWxcIiAmJiB5VmFsdWVTdGFydCsobGVuZ3RoLTEpID4gMTApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2Fubm90IHBsYWNlIHNoaXAgb2ZmIGdhbWVib2FyZFwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgc2hpcFNwYW4gPSBmaW5kU3Bhbihwb3NpdGlvbiwgbGVuZ3RoLCBheGlzKTsvL1tbXCJBN1wiXSxbXCJBOFwiXV1cbiAgICAgICAgaWYgKG5vU2hpcE92ZXJsYXAoc2hpcFNwYW4pKSB7XG4gICAgICAgICAgICBsZXQgbmV3U2hpcCA9IFNoaXAobGVuZ3RoLCBzaGlwQ291bnQpO1xuICAgICAgICAgICAgc2hpcFNwYW4uZm9yRWFjaChhcnJheSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGFyclRvU3RyaW5nID0gYXJyYXkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBib2FyZFtgJHthcnJUb1N0cmluZ31gXSA9IG5ld1NoaXA7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgc2hpcENvdW50Kys7XG4gICAgICAgICAgICBzaGlwc1N0aWxsVXArKztcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJTb3JyeSwgdGhlcmUncyBhIHNoaXAgaW4gdGhlIHdheSFcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCByZWNlaXZlQXR0YWNrID0gKHRhcmdldENvb3IpID0+IHsvL2Fzc3VtZXMgeW91IFxuICAgICAgICAvL0NBTidUIHJlLWF0dGFjayBhIHBvc2l0aW9uIHlvdSd2ZSBtaXNzZWQgT1IgaGl0IGFscmVhZHlcbiAgICAgICAgbGV0IHRhcmdldEluQXJyID0gW1t0YXJnZXRDb29yXV07XG4gICAgICAgIGlmIChub1NoaXBPdmVybGFwKHRhcmdldEluQXJyKSA9PT0gdHJ1ZSkgey8vY2hlY2tzIGlmIHNoaXAgaXMgdGhlcmVcbiAgICAgICAgICAgIC8vaWYgVFJVRSwgbWVhbnMgbm90aGluZyBpcyB0aGVyZVxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJObyBzaGlwIHdhcyBoaXQuIE5pY2UgdHJ5IVwiKTtcbiAgICAgICAgICAgIG1pc3NlZFNob3RzLnB1c2godGFyZ2V0Q29vcik7XG4gICAgICAgIH0gZWxzZSBpZiAobm9TaGlwT3ZlcmxhcCh0YXJnZXRJbkFycikgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBsZXQgc2hpcEZvdW5kID0gYm9hcmRbYCR7dGFyZ2V0Q29vcn1gXTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiR3JlYXQgc2hvdCEgWW91IGxhbmRlZCBhIGhpdC5cIik7XG4gICAgICAgICAgICBzaGlwRm91bmQuaGl0KCk7XG4gICAgICAgICAgICBpZiAoc2hpcEZvdW5kLmdldEhpdHMoKSA9PT0gc2hpcEZvdW5kLmdldExlbmd0aCgpKSB7XG4gICAgICAgICAgICAgICAgc2hpcHNTdGlsbFVwLS07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBib2FyZCxtaXNzZWRTaG90cyxzaG90c0hpdCxzaGlwQ291bnQsXG4gICAgICAgIG1ha2VTaGlwLFxuICAgICAgICBidWlsZEJvYXJkLFxuICAgICAgICBwbGFjZVNoaXAsXG4gICAgICAgIGZpbmRTcGFuLFxuICAgICAgICBmaW5kWEluZGV4LFxuICAgICAgICBub1NoaXBPdmVybGFwLFxuICAgICAgICByZWNlaXZlQXR0YWNrLFxuICAgICAgICBnZXRTaGlwc0FsaXZlQ291bnQsXG4gICAgICAgIGFyZUFsbFN1bmssXG4gICAgfTtcbn1cblxuY29uc3QgUGxheWVyID0gKG5hbWUpID0+IHsvL2Fzc3VtZSBuYW1lcyBpbnB1dHRlZCBhcmUgVU5JUVVFXG4gICAgXG4gICAgbGV0IGlkID0gbmFtZTtcbiAgICBsZXQgb3duQm9hcmQgPSBHYW1lYm9hcmQoKTtcbiAgICBvd25Cb2FyZC5idWlsZEJvYXJkKCk7XG4gICAgbGV0IGxldHRlck51bWJBcnIgPSBbJ0EnLCdCJywnQycsJ0QnLCdFJywnRicsJ0cnLCdIJywnSScsJ0onXTtcbiAgICBsZXQgcGxheWVyQm9hcmQgPSBvd25Cb2FyZC5ib2FyZDtcbiAgICBsZXQgYWlyQmFsbHMgPSBvd25Cb2FyZC5taXNzZWRTaG90czsvL2J5IHRoZSBvcHBvc2luZyBwbGF5ZXJcblxuICAgIGxldCB0YXJnZXRCb2FyZCA9IEdhbWVib2FyZCgpO1xuICAgIHRhcmdldEJvYXJkLmJ1aWxkQm9hcmQoKTtcbiAgICBsZXQgb3Bwb0JvYXJkID0gdGFyZ2V0Qm9hcmQuYm9hcmQ7XG4gICAgbGV0IG15TWlzc2VzID0gdGFyZ2V0Qm9hcmQubWlzc2VkU2hvdHM7XG4gICAgbGV0IG15SGl0cyA9IHRhcmdldEJvYXJkLnNob3RzSGl0O1xuXG4gICAgY29uc3QgZ2V0U2hpcEZvck9wcCA9IChjb29yZCkgPT4ge1xuICAgICAgICBsZXQgZm91bmRTaGlwID0gcGxheWVyQm9hcmRbYCR7Y29vcmR9YF07XG4gICAgICAgIHJldHVybiBmb3VuZFNoaXA7XG4gICAgfVxuICAgIGNvbnN0IHBsYXllclBsYWNlID0gKHBvc2l0aW9uLCBsZW5ndGgsIGF4aXMpID0+IHtcbiAgICAgICAgLy9zdHJpbmcgJ0IzJywgbnVtYmVyIDMsIHN0cmluZyAnaG9yaXpvbnRhbCcvJ3ZlcnRpY2FsJ1xuICAgICAgICBvd25Cb2FyZC5wbGFjZVNoaXAocG9zaXRpb24sIGxlbmd0aCwgYXhpcyk7XG4gICAgfVxuXG4gICAgY29uc3QgcGxheWVyUGxhY2VTaGlwU3BhbiA9IChwb3NpdGlvbiwgbGVuZ3RoLCBheGlzKSA9PiB7XG4gICAgICAgIHJldHVybiBvd25Cb2FyZC5maW5kU3Bhbihwb3NpdGlvbiwgbGVuZ3RoLCBheGlzKTtcbiAgICB9XG5cbiAgICBjb25zdCBwbGF5ZXJDaGVja092ZXJsYXAgPSAoYXJyKSA9PiB7XG4gICAgICAgIHJldHVybiBvd25Cb2FyZC5ub1NoaXBPdmVybGFwKGFycik7XG4gICAgfVxuXG4gICAgY29uc3QgZGlkQXRrTWlzcyA9IChjb29yZCwgZ2V0QXR0YWNrZWQpID0+IHtcbiAgICAgICAgaWYgKG15SGl0cy5pbmNsdWRlcyhgJHtjb29yZH1gKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJhbHJlYWR5IHNob3QgaGVyZSwgcGxzIHN0b3BcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAobXlNaXNzZXMuaW5jbHVkZXMoYCR7Y29vcmR9YCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYWxyZWFkeSBtaXNzZWQgaGVyZSwgZ28gZWxzZXdoZXJlXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGdldEF0dGFja2VkKGAke2Nvb3JkfWApKSB7Ly9pZiBpdCByZXR1cm5zIHRydWUsIG1lYW5zIG1pc3NlZFxuICAgICAgICAgICAgICAgIG15TWlzc2VzLnB1c2goY29vcmQpO1xuICAgICAgICAgICAgICAgIGxldCBzdHIgPSBgbWlzc18ke2Nvb3JkfWA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbXlIaXRzLnB1c2goY29vcmQpO1xuICAgICAgICAgICAgICAgIGxldCBzdHIgPSBgaGl0c18ke2Nvb3JkfWA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGdldEF0dGFja2VkID0gKGNvb3JkKSA9PiB7XG4gICAgICAgIGxldCBzdGFydGluZ0xlbmd0aCA9IGFpckJhbGxzLmxlbmd0aDtcbiAgICAgICAgb3duQm9hcmQucmVjZWl2ZUF0dGFjayhjb29yZCk7Ly9pZiBpdCdzIGEgbWlzcywgYWlyQmFsbHMgbGVuZ3RoIHNob3VsZCBpbmNyZWFzZSBieSAxXG4gICAgICAgIGlmIChhaXJCYWxscy5sZW5ndGggPiBzdGFydGluZ0xlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcGxheWVyU2hpcENvdW50ID0gKCkgPT4gb3duQm9hcmQuc2hpcENvdW50O1xuICAgIGNvbnN0IHNoaXBzVXAgPSAoKSA9PiBvd25Cb2FyZC5nZXRTaGlwc0FsaXZlQ291bnQoKTtcbiAgICBjb25zdCBhbGxTaGlwc1N1bmsgPSAoKSA9PiB7XG4gICAgICAgIGlmIChzaGlwc1VwKCkgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vdHJ1ZSBpZiBzaGlwQ291bnQgaXMgMCwgZmFsc2UgaWYgbm90XG5cbiAgICAvLy0tLS1jb21wdXRlciBsb2dpY1xuXG5cbiAgICBjb25zdCByYW5kb21BdGtDaG9pY2UgPSAoKSA9PiB7XG4gICAgICAgIGxldCBib29sSG9sZGVyID0gZmFsc2U7XG4gICAgICAgIC8vd2FudCB0byBwaWNrIHJhbmRvbSBYICYgWTsgaWYgTk9UIHdpdGhpbiBteUhpdHMgJiBteU1pc3NlcywgZ28gYWhlYWRcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgbGV0IGNvb3JkID0gcmFuZG9tUG9zaXRpb24oKTtcbiAgICAgICAgICAgIGlmICghbXlIaXRzLmluY2x1ZGVzKGAke2Nvb3JkfWApICYmICFteU1pc3Nlcy5pbmNsdWRlcyhgJHtjb29yZH1gKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ1BVIHBpY2tlZCBcIiwgY29vcmQpO1xuICAgICAgICAgICAgICAgIGJvb2xIb2xkZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb29yZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSB3aGlsZSAoIWJvb2xIb2xkZXIpICAgICAgICBcbiAgICB9XG4gICAgY29uc3QgY29tcHV0ZXJQbGFjZSA9IChsZW5ndGgpID0+IHtcbiAgICAgICAgLy9zdHJpbmcgJ0IzJywgbnVtYmVyIDMsIHN0cmluZyAnaG9yaXpvbnRhbCcvJ3ZlcnRpY2FsJ1xuICAgICAgICAvKiBsZXQgcG9zaXRpb24gPSByYW5kb21Qb3NpdGlvbigpO1xuICAgICAgICBsZXQgYXhpcyA9IHJhbmRvbUF4aXMoKTsqL1xuICAgICAgICBsZXQgYm9vbEhvbGRlciA9IGZhbHNlOyBcbiAgICAgICAgbGV0IHBvc2l0aW9uID0gbnVsbDtcbiAgICAgICAgbGV0IGF4aXMgPSBudWxsO1xuXG4gICAgICAgIC8qIGlmIChvd25Cb2FyZC5wbGFjZVNoaXAocG9zaXRpb24sIGxlbmd0aCwgYXhpcykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAvL21lYW5pbmcgaWYgaXQncyBwbGFjZWQgb2ZmIHRoZSBib2FyZCBvciBvdmVybGFwcGluZ1xuICAgICAgICAgICAgLy93YW50IHRvIHJlcnVuIHRoaXMgZnVuY3Rpb24gYWdhaW5cbiAgICAgICAgfSAqL1xuXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmFuIGFub3RoZXIgcGxhY2VtZW50IGJ5IHRoZSBjb21wXCIpO1xuICAgICAgICAgICAgcG9zaXRpb24gPSByYW5kb21Qb3NpdGlvbigpO1xuICAgICAgICAgICAgYXhpcyA9IHJhbmRvbUF4aXMoKTtcbiAgICAgICAgICAgIGJvb2xIb2xkZXIgPSBvd25Cb2FyZC5wbGFjZVNoaXAocG9zaXRpb24sIGxlbmd0aCwgYXhpcyk7XG4gICAgICAgIH0gd2hpbGUgKCFib29sSG9sZGVyKVxuICAgICAgICByZXR1cm4gW3Bvc2l0aW9uLCBheGlzXTtcbiAgICAgICAgXG4gICAgfVxuICAgIGNvbnN0IHJhbmRvbUF4aXMgPSAoKSA9PiB7XG4gICAgICAgIGxldCBjaG9zZW5BeGlzID0gTWF0aC5yYW5kb20oKSA8IDAuNSA/IFwiaG9yaXpvbnRhbFwiIDogXCJ2ZXJ0aWNhbFwiO1xuICAgICAgICByZXR1cm4gY2hvc2VuQXhpcztcbiAgICB9XG4gICAgY29uc3QgcmFuZG9tUG9zaXRpb24gPSAoKSA9PiB7XG4gICAgICAgIGxldCByYW5kb21OdW1iMSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSoxMCk7Ly8wLTlcbiAgICAgICAgbGV0IHJhbmRvbU51bWIyID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjEwKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhsZXR0ZXJOdW1iQXJyKTtcbiAgICAgICAgbGV0IHJhbmRvbVggPSBsZXR0ZXJOdW1iQXJyW3JhbmRvbU51bWIxXTtcbiAgICAgICAgbGV0IHJhbmRvbVkgPSByYW5kb21OdW1iMiArIDE7XG4gICAgICAgIHJldHVybiByYW5kb21YICsgcmFuZG9tWS50b1N0cmluZygpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGlkLCBwbGF5ZXJCb2FyZCwgYWlyQmFsbHMsIG9wcG9Cb2FyZCwgbXlNaXNzZXMsIG15SGl0cyxcbiAgICAgICAgZ2V0QXR0YWNrZWQsIGRpZEF0a01pc3MsIHBsYXllclBsYWNlLCBjb21wdXRlclBsYWNlLCByYW5kb21BdGtDaG9pY2UsIHNoaXBzVXAsIGFsbFNoaXBzU3VuaywgIHBsYXllckNoZWNrT3ZlcmxhcCwgcGxheWVyUGxhY2VTaGlwU3BhbiwgZ2V0U2hpcEZvck9wcCwgcGxheWVyU2hpcENvdW50LFxuICAgIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHsgXG4gICAgU2hpcDogU2hpcCxcbiAgICBHYW1lYm9hcmQ6IEdhbWVib2FyZCxcbiAgICBQbGF5ZXI6IFBsYXllcixcbn0gIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCJodG1sLCBib2R5LCBkaXYsIHNwYW4sIGFwcGxldCwgb2JqZWN0LCBpZnJhbWUsXFxuaDEsIGgyLCBoMywgaDQsIGg1LCBoNiwgcCwgYmxvY2txdW90ZSwgcHJlLFxcbmEsIGFiYnIsIGFjcm9ueW0sIGFkZHJlc3MsIGJpZywgY2l0ZSwgY29kZSxcXG5kZWwsIGRmbiwgZW0sIGltZywgaW5zLCBrYmQsIHEsIHMsIHNhbXAsXFxuc21hbGwsIHN0cmlrZSwgc3Ryb25nLCBzdWIsIHN1cCwgdHQsIHZhcixcXG5iLCB1LCBpLCBjZW50ZXIsXFxuZGwsIGR0LCBkZCwgb2wsIHVsLCBsaSxcXG5maWVsZHNldCwgZm9ybSwgbGFiZWwsIGxlZ2VuZCxcXG50YWJsZSwgY2FwdGlvbiwgdGJvZHksIHRmb290LCB0aGVhZCwgdHIsIHRoLCB0ZCxcXG5hcnRpY2xlLCBhc2lkZSwgY2FudmFzLCBkZXRhaWxzLCBlbWJlZCwgXFxuZmlndXJlLCBmaWdjYXB0aW9uLCBmb290ZXIsIGhlYWRlciwgaGdyb3VwLCBcXG5tZW51LCBuYXYsIG91dHB1dCwgcnVieSwgc2VjdGlvbiwgc3VtbWFyeSxcXG50aW1lLCBtYXJrLCBhdWRpbywgdmlkZW8ge1xcblxcdG1hcmdpbjogMDtcXG5cXHRwYWRkaW5nOiAwO1xcblxcdGJvcmRlcjogMDtcXG5cXHRmb250LXNpemU6IDEwMCU7XFxuXFx0Zm9udDogaW5oZXJpdDtcXG5cXHR2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XFxufVxcbi8qIEhUTUw1IGRpc3BsYXktcm9sZSByZXNldCBmb3Igb2xkZXIgYnJvd3NlcnMgKi9cXG5hcnRpY2xlLCBhc2lkZSwgZGV0YWlscywgZmlnY2FwdGlvbiwgZmlndXJlLCBcXG5mb290ZXIsIGhlYWRlciwgaGdyb3VwLCBtZW51LCBuYXYsIHNlY3Rpb24ge1xcblxcdGRpc3BsYXk6IGJsb2NrO1xcbn1cXG5ib2R5IHtcXG5cXHRsaW5lLWhlaWdodDogMTtcXG59XFxub2wsIHVsIHtcXG5cXHRsaXN0LXN0eWxlOiBub25lO1xcbn1cXG5ibG9ja3F1b3RlLCBxIHtcXG5cXHRxdW90ZXM6IG5vbmU7XFxufVxcbmJsb2NrcXVvdGU6YmVmb3JlLCBibG9ja3F1b3RlOmFmdGVyLFxcbnE6YmVmb3JlLCBxOmFmdGVyIHtcXG5cXHRjb250ZW50OiAnJztcXG5cXHRjb250ZW50OiBub25lO1xcbn1cXG50YWJsZSB7XFxuXFx0Ym9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTtcXG5cXHRib3JkZXItc3BhY2luZzogMDtcXG59XFxuXFxuOnJvb3Qge1xcbiAgICAtLXByaW1hcnk6ICNmZjZmYjI7IFxcbiAgICAtLXNlY29uZGFyeTogI2MzMTk1ZDsgXFxuICAgIC0tdGVydGlhcnk6ICM2ODA3NDc7IFxcbiAgICAtLXF1YXRlcm5hcnk6ICMxNDEwMTA7IFxcbn1cXG5cXG5odG1sLCBib2R5LCBkaXYjY29udGVudCB7XFxuICAgIGhlaWdodDogMTAwJTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGZvbnQtc2l6ZTogMTVweDtcXG59XFxuXFxuZGl2I3AxU2VwZXJhdG9yIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1wcmltYXJ5KTtcXG59XFxuZGl2I3AyU2VwZXJhdG9yIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOmFxdWE7XFxufVxcblxcbmRpdiNQMUcsIGRpdiNQMkcge1xcblxcdHdpZHRoOiA2MCU7XFxuXFx0bWFyZ2luOiBhdXRvO1xcbn1cXG5cXG5kaXYuZ2FtZWJvYXJkIHtcXG5cXHRkaXNwbGF5OiBmbGV4O1xcblxcdGZsZXgtd3JhcDogd3JhcDtcXG5cXHRib3JkZXI6IDNweCBzb2xpZCBwaW5rO1xcbn1cXG5cXG4uZGVzY3JpcHRvciB7XFxuXFx0Zm9udC1mYW1pbHk6ICdTcGFjZSBHcm90ZXNrJywgc2Fucy1zZXJpZjtcXG5cXHRmb250LXNpemU6IDEuMnJlbTtcXG5cXHRwYWRkaW5nOiAwLjVyZW07XFxuXFx0dGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG5cXG5idXR0b24jbmV3R2FtZUJ0biB7XFxuXFx0YmFja2dyb3VuZC1jb2xvcjogI2MzMTk1ZDtcXG5cXHRjb2xvcjpiaXNxdWU7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHRvcDogNXB4O1xcblxcdHJpZ2h0OiA1cHg7XFxuXFx0ZGlzcGxheTogbm9uZTtcXG59XFxuXFxuZGl2I2RvbmVXaXRoU2hpcHMge1xcblxcdGJhY2tncm91bmQtY29sb3I6ICM2ODA3NDc7XFxuXFx0Y29sb3I6YmlzcXVlO1xcblxcdGJvcmRlcjogMnB4IGluc2V0IGdyYXk7XFxuXFx0Zm9udC1zaXplOiAxLjByZW07XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdGxlZnQ6IDVweDtcXG5cXHRwYWRkaW5nOiA0cHg7XFxuXFx0dG9wOiA2NXB4O1xcblxcdC8qIGRpc3BsYXk6IG5vbmU7ICovXFxufVxcblxcbmRpdiNheGlzVG9nZ2xlIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiAjYzMxOTVkO1xcblxcdGJvcmRlcjogMnB4IGluc2V0IGdyYXk7XFxuXFx0Zm9udC1zaXplOiAxLjByZW07XFxuXFx0Y29sb3I6YmlzcXVlO1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHRwYWRkaW5nOiA0cHg7XFxuXFx0dG9wOiAzMXB4O1xcblxcdGxlZnQ6IDVweDtcXG5cXHQvKiBkaXNwbGF5OiBub25lOyAqL1xcbn1cXG5cXG5kaXYjdG9wQmFyIHtcXG5cXHRwb3NpdGlvbjogcmVsYXRpdmU7XFxufVxcblxcbmRpdltjbGFzc149XFxcInNxdWFyZVxcXCJdIHtcXG5cXHRwb3NpdGlvbjogcmVsYXRpdmU7XFxuXFx0ZmxleC1iYXNpczogY2FsYyg5JSAtIDEwcHgpO1xcblxcdG1hcmdpbjogNXB4O1xcblxcdGJvcmRlcjogMXB4IHNvbGlkO1xcblxcdGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxufVxcblxcbmRpdltjbGFzc149XFxcInNxdWFyZVxcXCJdOjpiZWZvcmUge1xcblxcdGNvbnRlbnQ6ICcnO1xcblxcdGRpc3BsYXk6IGJsb2NrO1xcblxcdHBhZGRpbmctdG9wOiAxMDAlO1xcbn1cXG5cXG5kaXZbY2xhc3NePVxcXCJzcXVhcmVcXFwiXSAuY29udGVudHoge1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHR0b3A6IDA7IGxlZnQ6IDA7XFxuXFx0aGVpZ2h0OiAxMDAlO1xcblxcdHdpZHRoOiAxMDAlO1xcbiAgXFxuXFx0ZGlzcGxheTogZmxleDsgICAgICAgICAgICAgICAvKiBhZGRlZCBmb3IgY2VudGVyZWQgdGV4dCAqL1xcblxcdGp1c3RpZnktY29udGVudDogY2VudGVyOyAgICAgLyogYWRkZWQgZm9yIGNlbnRlcmVkIHRleHQgKi9cXG5cXHRhbGlnbi1pdGVtczogY2VudGVyOyAgICAgICAgIC8qIGFkZGVkIGZvciBjZW50ZXJlZCB0ZXh0ICovXFxufVxcblxcbi8qIFxcbmRpdiNjb250ZW50IHtcXG5cXHRkaXNwbGF5OiBncmlkO1xcblxcdGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDIsIDQwJSk7XFxuXFx0Z3JpZC10ZW1wbGF0ZS1yb3dzOiByZXBlYXQoMiwgNDAlKTtcXG59XFxuXFxuZGl2LmdhbWVib2FyZCB7XFxuXFx0ZGlzcGxheTogZ3JpZDtcXG5cXHRncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgxMSwgOCUpO1xcblxcdGdyaWQtdGVtcGxhdGUtcm93czogcmVwZWF0KDExLCA4JSk7XFxufVxcblxcbmRpdltjbGFzc149XFxcInNxdWFyZVxcXCJdIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTg0LCAxODQsIDE4NCk7XFxuXFx0Ym9yZGVyOiAxcHggc29saWQgYmxhY2s7XFxuXFx0b3BhY2l0eTogMC41O1xcblxcdGFzcGVjdC1yYXRpbzogMTtcXG59ICovXFxuXFxuLyogbG9hZGluZy9zcGlubmVyIHN0dWZmICovXFxuXFxuZGl2I2xlbmd0aEluZGljYXRvciB7XFxuXFx0LyogZGlzcGxheTogbm9uZTsgKi9cXG5cXHRkaXNwbGF5OiBmbGV4O1xcblxcdGp1c3RpZnktY29udGVudDogbGVmdDtcXG5cXHRhbGlnbi1pdGVtczogY2VudGVyO1xcblxcdGdhcDogMC41cmVtO1xcblxcdGZvbnQtc2l6ZTogMS4xcmVtO1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHR0b3A6IDVweDtcXG5cXHRsZWZ0OiA1cHg7XFxufVxcblxcbmlucHV0I2xlbmd0aElucHV0IHtcXG5cXHR3aWR0aDogMjUlO1xcbn1cXG5cXG5kaXYjcHJvbXB0UGxhY2luZ1AxIHtcXG5cXHQvKiBkaXNwbGF5OiBub25lOyAqL1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHRkaXNwbGF5OiBmbGV4O1xcblxcdGZsZXgtd3JhcDogd3JhcDtcXG5cXHR3aWR0aDogMTQlO1xcblxcdHRvcDogNXB4O1xcblxcdHJpZ2h0OiA4cHg7XFxufVxcblxcbmRpdiNiYXR0bGVTdGFydCB7XFxuXFx0Zm9udC1zaXplOiAxLjNyZW07XFxuXFx0ZGlzcGxheTogbm9uZTtcXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0d2lkdGg6IDE0JTtcXG5cXHR0b3A6IDVweDtcXG5cXHRyaWdodDogNXB4O1xcbn1cXG5cXG4jbG9hZGVyIHtcXG5cXHRkaXNwbGF5OiBub25lO1xcblxcdHRvcDogNTAlO1xcblxcdGxlZnQ6IDUwJTtcXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0dHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XFxufVxcbiAgXFxuLmxvYWRpbmcge1xcblxcdGJvcmRlcjogOHB4IHNvbGlkIHJnYigyMjAsIDAsIDApO1xcblxcdHdpZHRoOiA2MHB4O1xcblxcdGhlaWdodDogNjBweDtcXG5cXHRib3JkZXItcmFkaXVzOiA1MCU7XFxuXFx0Ym9yZGVyLXRvcC1jb2xvcjogI2ZmNjMyMDtcXG5cXHRib3JkZXItbGVmdC1jb2xvcjogI2ZmNzMwMDtcXG5cXHRhbmltYXRpb246IHNwaW4gMXMgaW5maW5pdGUgZWFzZS1pbjtcXG59XFxuICBcXG5Aa2V5ZnJhbWVzIHNwaW4ge1xcblxcdDAlIHtcXG5cXHQgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xcblxcdH1cXG4gIFxcblxcdDEwMCUge1xcblxcdCAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcXG5cXHR9XFxufVxcblxcbkBtZWRpYSBzY3JlZW4gYW5kIChtaW4td2lkdGg6IDgwMHB4KSB7XFxuXFx0aHRtbCwgYm9keSwgZGl2I2NvbnRlbnQge1xcblxcdCAgZm9udC1zaXplOiAxNXB4O1xcblxcdH1cXG5cXG5cXHRib2R5IHtcXG5cXHRcXHRkaXNwbGF5OiBmbGV4O1xcblxcdFxcdGp1c3RpZnktY29udGVudDogY2VudGVyO1xcblxcdFxcdGJhY2tncm91bmQtY29sb3I6IHZhcigtLXRlcnRpYXJ5KTtcXG5cXHR9XFxuXFxuXFx0ZGl2I2NvbnRlbnQge1xcblxcdFxcdHdpZHRoOiA2MCU7XFxuXFx0fVxcblxcblxcdGRpdiNheGlzVG9nZ2xlIHtcXG5cXHRcXHRcXG5cXHRcXHR0b3A6IDM3cHg7XFxuXFx0XFx0LyogZGlzcGxheTogbm9uZTsgKi9cXG5cXHR9XFxuXFxuXFx0ZGl2I2RvbmVXaXRoU2hpcHMge1xcblxcdFxcdHRvcDogNzVweDtcXG5cXHR9XFxufVxcblxcbkBtZWRpYSBzY3JlZW4gYW5kIChtaW4td2lkdGg6IDEyNTBweCkge1xcblxcdGRpdiNjb250ZW50IHtcXG5cXHRcXHR3aWR0aDogNTAlO1xcblxcdH1cXG5cXHRkaXYjUDFHLCBkaXYjUDJHIHtcXG5cXHRcXHR3aWR0aDogNTAlO1xcblxcdFxcdG1hcmdpbjogYXV0bztcXG5cXHR9XFxufVwiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9zdHlsZS5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUE7Ozs7Ozs7Ozs7Ozs7Q0FhQyxTQUFTO0NBQ1QsVUFBVTtDQUNWLFNBQVM7Q0FDVCxlQUFlO0NBQ2YsYUFBYTtDQUNiLHdCQUF3QjtBQUN6QjtBQUNBLGdEQUFnRDtBQUNoRDs7Q0FFQyxjQUFjO0FBQ2Y7QUFDQTtDQUNDLGNBQWM7QUFDZjtBQUNBO0NBQ0MsZ0JBQWdCO0FBQ2pCO0FBQ0E7Q0FDQyxZQUFZO0FBQ2I7QUFDQTs7Q0FFQyxXQUFXO0NBQ1gsYUFBYTtBQUNkO0FBQ0E7Q0FDQyx5QkFBeUI7Q0FDekIsaUJBQWlCO0FBQ2xCOztBQUVBO0lBQ0ksa0JBQWtCO0lBQ2xCLG9CQUFvQjtJQUNwQixtQkFBbUI7SUFDbkIscUJBQXFCO0FBQ3pCOztBQUVBO0lBQ0ksWUFBWTtJQUNaLFdBQVc7SUFDWCxlQUFlO0FBQ25COztBQUVBO0NBQ0MsZ0NBQWdDO0FBQ2pDO0FBQ0E7Q0FDQyxxQkFBcUI7QUFDdEI7O0FBRUE7Q0FDQyxVQUFVO0NBQ1YsWUFBWTtBQUNiOztBQUVBO0NBQ0MsYUFBYTtDQUNiLGVBQWU7Q0FDZixzQkFBc0I7QUFDdkI7O0FBRUE7Q0FDQyx3Q0FBd0M7Q0FDeEMsaUJBQWlCO0NBQ2pCLGVBQWU7Q0FDZixrQkFBa0I7QUFDbkI7O0FBRUE7Q0FDQyx5QkFBeUI7Q0FDekIsWUFBWTtDQUNaLGtCQUFrQjtDQUNsQixRQUFRO0NBQ1IsVUFBVTtDQUNWLGFBQWE7QUFDZDs7QUFFQTtDQUNDLHlCQUF5QjtDQUN6QixZQUFZO0NBQ1osc0JBQXNCO0NBQ3RCLGlCQUFpQjtDQUNqQixrQkFBa0I7Q0FDbEIsU0FBUztDQUNULFlBQVk7Q0FDWixTQUFTO0NBQ1QsbUJBQW1CO0FBQ3BCOztBQUVBO0NBQ0MseUJBQXlCO0NBQ3pCLHNCQUFzQjtDQUN0QixpQkFBaUI7Q0FDakIsWUFBWTtDQUNaLGtCQUFrQjtDQUNsQixZQUFZO0NBQ1osU0FBUztDQUNULFNBQVM7Q0FDVCxtQkFBbUI7QUFDcEI7O0FBRUE7Q0FDQyxrQkFBa0I7QUFDbkI7O0FBRUE7Q0FDQyxrQkFBa0I7Q0FDbEIsMkJBQTJCO0NBQzNCLFdBQVc7Q0FDWCxpQkFBaUI7Q0FDakIsc0JBQXNCO0FBQ3ZCOztBQUVBO0NBQ0MsV0FBVztDQUNYLGNBQWM7Q0FDZCxpQkFBaUI7QUFDbEI7O0FBRUE7Q0FDQyxrQkFBa0I7Q0FDbEIsTUFBTSxFQUFFLE9BQU87Q0FDZixZQUFZO0NBQ1osV0FBVzs7Q0FFWCxhQUFhLGdCQUFnQiw0QkFBNEI7Q0FDekQsdUJBQXVCLE1BQU0sNEJBQTRCO0NBQ3pELG1CQUFtQixVQUFVLDRCQUE0QjtBQUMxRDs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0JHOztBQUVILDBCQUEwQjs7QUFFMUI7Q0FDQyxtQkFBbUI7Q0FDbkIsYUFBYTtDQUNiLHFCQUFxQjtDQUNyQixtQkFBbUI7Q0FDbkIsV0FBVztDQUNYLGlCQUFpQjtDQUNqQixrQkFBa0I7Q0FDbEIsUUFBUTtDQUNSLFNBQVM7QUFDVjs7QUFFQTtDQUNDLFVBQVU7QUFDWDs7QUFFQTtDQUNDLG1CQUFtQjtDQUNuQixrQkFBa0I7Q0FDbEIsYUFBYTtDQUNiLGVBQWU7Q0FDZixVQUFVO0NBQ1YsUUFBUTtDQUNSLFVBQVU7QUFDWDs7QUFFQTtDQUNDLGlCQUFpQjtDQUNqQixhQUFhO0NBQ2Isa0JBQWtCO0NBQ2xCLFVBQVU7Q0FDVixRQUFRO0NBQ1IsVUFBVTtBQUNYOztBQUVBO0NBQ0MsYUFBYTtDQUNiLFFBQVE7Q0FDUixTQUFTO0NBQ1Qsa0JBQWtCO0NBQ2xCLGdDQUFnQztBQUNqQzs7QUFFQTtDQUNDLGdDQUFnQztDQUNoQyxXQUFXO0NBQ1gsWUFBWTtDQUNaLGtCQUFrQjtDQUNsQix5QkFBeUI7Q0FDekIsMEJBQTBCO0NBQzFCLG1DQUFtQztBQUNwQzs7QUFFQTtDQUNDO0dBQ0UsdUJBQXVCO0NBQ3pCOztDQUVBO0dBQ0UseUJBQXlCO0NBQzNCO0FBQ0Q7O0FBRUE7Q0FDQztHQUNFLGVBQWU7Q0FDakI7O0NBRUE7RUFDQyxhQUFhO0VBQ2IsdUJBQXVCO0VBQ3ZCLGlDQUFpQztDQUNsQzs7Q0FFQTtFQUNDLFVBQVU7Q0FDWDs7Q0FFQTs7RUFFQyxTQUFTO0VBQ1QsbUJBQW1CO0NBQ3BCOztDQUVBO0VBQ0MsU0FBUztDQUNWO0FBQ0Q7O0FBRUE7Q0FDQztFQUNDLFVBQVU7Q0FDWDtDQUNBO0VBQ0MsVUFBVTtFQUNWLFlBQVk7Q0FDYjtBQUNEXCIsXCJzb3VyY2VzQ29udGVudFwiOltcImh0bWwsIGJvZHksIGRpdiwgc3BhbiwgYXBwbGV0LCBvYmplY3QsIGlmcmFtZSxcXG5oMSwgaDIsIGgzLCBoNCwgaDUsIGg2LCBwLCBibG9ja3F1b3RlLCBwcmUsXFxuYSwgYWJiciwgYWNyb255bSwgYWRkcmVzcywgYmlnLCBjaXRlLCBjb2RlLFxcbmRlbCwgZGZuLCBlbSwgaW1nLCBpbnMsIGtiZCwgcSwgcywgc2FtcCxcXG5zbWFsbCwgc3RyaWtlLCBzdHJvbmcsIHN1Yiwgc3VwLCB0dCwgdmFyLFxcbmIsIHUsIGksIGNlbnRlcixcXG5kbCwgZHQsIGRkLCBvbCwgdWwsIGxpLFxcbmZpZWxkc2V0LCBmb3JtLCBsYWJlbCwgbGVnZW5kLFxcbnRhYmxlLCBjYXB0aW9uLCB0Ym9keSwgdGZvb3QsIHRoZWFkLCB0ciwgdGgsIHRkLFxcbmFydGljbGUsIGFzaWRlLCBjYW52YXMsIGRldGFpbHMsIGVtYmVkLCBcXG5maWd1cmUsIGZpZ2NhcHRpb24sIGZvb3RlciwgaGVhZGVyLCBoZ3JvdXAsIFxcbm1lbnUsIG5hdiwgb3V0cHV0LCBydWJ5LCBzZWN0aW9uLCBzdW1tYXJ5LFxcbnRpbWUsIG1hcmssIGF1ZGlvLCB2aWRlbyB7XFxuXFx0bWFyZ2luOiAwO1xcblxcdHBhZGRpbmc6IDA7XFxuXFx0Ym9yZGVyOiAwO1xcblxcdGZvbnQtc2l6ZTogMTAwJTtcXG5cXHRmb250OiBpbmhlcml0O1xcblxcdHZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTtcXG59XFxuLyogSFRNTDUgZGlzcGxheS1yb2xlIHJlc2V0IGZvciBvbGRlciBicm93c2VycyAqL1xcbmFydGljbGUsIGFzaWRlLCBkZXRhaWxzLCBmaWdjYXB0aW9uLCBmaWd1cmUsIFxcbmZvb3RlciwgaGVhZGVyLCBoZ3JvdXAsIG1lbnUsIG5hdiwgc2VjdGlvbiB7XFxuXFx0ZGlzcGxheTogYmxvY2s7XFxufVxcbmJvZHkge1xcblxcdGxpbmUtaGVpZ2h0OiAxO1xcbn1cXG5vbCwgdWwge1xcblxcdGxpc3Qtc3R5bGU6IG5vbmU7XFxufVxcbmJsb2NrcXVvdGUsIHEge1xcblxcdHF1b3Rlczogbm9uZTtcXG59XFxuYmxvY2txdW90ZTpiZWZvcmUsIGJsb2NrcXVvdGU6YWZ0ZXIsXFxucTpiZWZvcmUsIHE6YWZ0ZXIge1xcblxcdGNvbnRlbnQ6ICcnO1xcblxcdGNvbnRlbnQ6IG5vbmU7XFxufVxcbnRhYmxlIHtcXG5cXHRib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlO1xcblxcdGJvcmRlci1zcGFjaW5nOiAwO1xcbn1cXG5cXG46cm9vdCB7XFxuICAgIC0tcHJpbWFyeTogI2ZmNmZiMjsgXFxuICAgIC0tc2Vjb25kYXJ5OiAjYzMxOTVkOyBcXG4gICAgLS10ZXJ0aWFyeTogIzY4MDc0NzsgXFxuICAgIC0tcXVhdGVybmFyeTogIzE0MTAxMDsgXFxufVxcblxcbmh0bWwsIGJvZHksIGRpdiNjb250ZW50IHtcXG4gICAgaGVpZ2h0OiAxMDAlO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgZm9udC1zaXplOiAxNXB4O1xcbn1cXG5cXG5kaXYjcDFTZXBlcmF0b3Ige1xcblxcdGJhY2tncm91bmQtY29sb3I6IHZhcigtLXByaW1hcnkpO1xcbn1cXG5kaXYjcDJTZXBlcmF0b3Ige1xcblxcdGJhY2tncm91bmQtY29sb3I6YXF1YTtcXG59XFxuXFxuZGl2I1AxRywgZGl2I1AyRyB7XFxuXFx0d2lkdGg6IDYwJTtcXG5cXHRtYXJnaW46IGF1dG87XFxufVxcblxcbmRpdi5nYW1lYm9hcmQge1xcblxcdGRpc3BsYXk6IGZsZXg7XFxuXFx0ZmxleC13cmFwOiB3cmFwO1xcblxcdGJvcmRlcjogM3B4IHNvbGlkIHBpbms7XFxufVxcblxcbi5kZXNjcmlwdG9yIHtcXG5cXHRmb250LWZhbWlseTogJ1NwYWNlIEdyb3Rlc2snLCBzYW5zLXNlcmlmO1xcblxcdGZvbnQtc2l6ZTogMS4ycmVtO1xcblxcdHBhZGRpbmc6IDAuNXJlbTtcXG5cXHR0ZXh0LWFsaWduOiBjZW50ZXI7XFxufVxcblxcbmJ1dHRvbiNuZXdHYW1lQnRuIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiAjYzMxOTVkO1xcblxcdGNvbG9yOmJpc3F1ZTtcXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0dG9wOiA1cHg7XFxuXFx0cmlnaHQ6IDVweDtcXG5cXHRkaXNwbGF5OiBub25lO1xcbn1cXG5cXG5kaXYjZG9uZVdpdGhTaGlwcyB7XFxuXFx0YmFja2dyb3VuZC1jb2xvcjogIzY4MDc0NztcXG5cXHRjb2xvcjpiaXNxdWU7XFxuXFx0Ym9yZGVyOiAycHggaW5zZXQgZ3JheTtcXG5cXHRmb250LXNpemU6IDEuMHJlbTtcXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0bGVmdDogNXB4O1xcblxcdHBhZGRpbmc6IDRweDtcXG5cXHR0b3A6IDY1cHg7XFxuXFx0LyogZGlzcGxheTogbm9uZTsgKi9cXG59XFxuXFxuZGl2I2F4aXNUb2dnbGUge1xcblxcdGJhY2tncm91bmQtY29sb3I6ICNjMzE5NWQ7XFxuXFx0Ym9yZGVyOiAycHggaW5zZXQgZ3JheTtcXG5cXHRmb250LXNpemU6IDEuMHJlbTtcXG5cXHRjb2xvcjpiaXNxdWU7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHBhZGRpbmc6IDRweDtcXG5cXHR0b3A6IDMxcHg7XFxuXFx0bGVmdDogNXB4O1xcblxcdC8qIGRpc3BsYXk6IG5vbmU7ICovXFxufVxcblxcbmRpdiN0b3BCYXIge1xcblxcdHBvc2l0aW9uOiByZWxhdGl2ZTtcXG59XFxuXFxuZGl2W2NsYXNzXj1cXFwic3F1YXJlXFxcIl0ge1xcblxcdHBvc2l0aW9uOiByZWxhdGl2ZTtcXG5cXHRmbGV4LWJhc2lzOiBjYWxjKDklIC0gMTBweCk7XFxuXFx0bWFyZ2luOiA1cHg7XFxuXFx0Ym9yZGVyOiAxcHggc29saWQ7XFxuXFx0Ym94LXNpemluZzogYm9yZGVyLWJveDtcXG59XFxuXFxuZGl2W2NsYXNzXj1cXFwic3F1YXJlXFxcIl06OmJlZm9yZSB7XFxuXFx0Y29udGVudDogJyc7XFxuXFx0ZGlzcGxheTogYmxvY2s7XFxuXFx0cGFkZGluZy10b3A6IDEwMCU7XFxufVxcblxcbmRpdltjbGFzc149XFxcInNxdWFyZVxcXCJdIC5jb250ZW50eiB7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHRvcDogMDsgbGVmdDogMDtcXG5cXHRoZWlnaHQ6IDEwMCU7XFxuXFx0d2lkdGg6IDEwMCU7XFxuICBcXG5cXHRkaXNwbGF5OiBmbGV4OyAgICAgICAgICAgICAgIC8qIGFkZGVkIGZvciBjZW50ZXJlZCB0ZXh0ICovXFxuXFx0anVzdGlmeS1jb250ZW50OiBjZW50ZXI7ICAgICAvKiBhZGRlZCBmb3IgY2VudGVyZWQgdGV4dCAqL1xcblxcdGFsaWduLWl0ZW1zOiBjZW50ZXI7ICAgICAgICAgLyogYWRkZWQgZm9yIGNlbnRlcmVkIHRleHQgKi9cXG59XFxuXFxuLyogXFxuZGl2I2NvbnRlbnQge1xcblxcdGRpc3BsYXk6IGdyaWQ7XFxuXFx0Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMiwgNDAlKTtcXG5cXHRncmlkLXRlbXBsYXRlLXJvd3M6IHJlcGVhdCgyLCA0MCUpO1xcbn1cXG5cXG5kaXYuZ2FtZWJvYXJkIHtcXG5cXHRkaXNwbGF5OiBncmlkO1xcblxcdGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDExLCA4JSk7XFxuXFx0Z3JpZC10ZW1wbGF0ZS1yb3dzOiByZXBlYXQoMTEsIDglKTtcXG59XFxuXFxuZGl2W2NsYXNzXj1cXFwic3F1YXJlXFxcIl0ge1xcblxcdGJhY2tncm91bmQtY29sb3I6IHJnYigxODQsIDE4NCwgMTg0KTtcXG5cXHRib3JkZXI6IDFweCBzb2xpZCBibGFjaztcXG5cXHRvcGFjaXR5OiAwLjU7XFxuXFx0YXNwZWN0LXJhdGlvOiAxO1xcbn0gKi9cXG5cXG4vKiBsb2FkaW5nL3NwaW5uZXIgc3R1ZmYgKi9cXG5cXG5kaXYjbGVuZ3RoSW5kaWNhdG9yIHtcXG5cXHQvKiBkaXNwbGF5OiBub25lOyAqL1xcblxcdGRpc3BsYXk6IGZsZXg7XFxuXFx0anVzdGlmeS1jb250ZW50OiBsZWZ0O1xcblxcdGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuXFx0Z2FwOiAwLjVyZW07XFxuXFx0Zm9udC1zaXplOiAxLjFyZW07XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHRvcDogNXB4O1xcblxcdGxlZnQ6IDVweDtcXG59XFxuXFxuaW5wdXQjbGVuZ3RoSW5wdXQge1xcblxcdHdpZHRoOiAyNSU7XFxufVxcblxcbmRpdiNwcm9tcHRQbGFjaW5nUDEge1xcblxcdC8qIGRpc3BsYXk6IG5vbmU7ICovXFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdGRpc3BsYXk6IGZsZXg7XFxuXFx0ZmxleC13cmFwOiB3cmFwO1xcblxcdHdpZHRoOiAxNCU7XFxuXFx0dG9wOiA1cHg7XFxuXFx0cmlnaHQ6IDhweDtcXG59XFxuXFxuZGl2I2JhdHRsZVN0YXJ0IHtcXG5cXHRmb250LXNpemU6IDEuM3JlbTtcXG5cXHRkaXNwbGF5OiBub25lO1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHR3aWR0aDogMTQlO1xcblxcdHRvcDogNXB4O1xcblxcdHJpZ2h0OiA1cHg7XFxufVxcblxcbiNsb2FkZXIge1xcblxcdGRpc3BsYXk6IG5vbmU7XFxuXFx0dG9wOiA1MCU7XFxuXFx0bGVmdDogNTAlO1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHR0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTtcXG59XFxuICBcXG4ubG9hZGluZyB7XFxuXFx0Ym9yZGVyOiA4cHggc29saWQgcmdiKDIyMCwgMCwgMCk7XFxuXFx0d2lkdGg6IDYwcHg7XFxuXFx0aGVpZ2h0OiA2MHB4O1xcblxcdGJvcmRlci1yYWRpdXM6IDUwJTtcXG5cXHRib3JkZXItdG9wLWNvbG9yOiAjZmY2MzIwO1xcblxcdGJvcmRlci1sZWZ0LWNvbG9yOiAjZmY3MzAwO1xcblxcdGFuaW1hdGlvbjogc3BpbiAxcyBpbmZpbml0ZSBlYXNlLWluO1xcbn1cXG4gIFxcbkBrZXlmcmFtZXMgc3BpbiB7XFxuXFx0MCUge1xcblxcdCAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XFxuXFx0fVxcbiAgXFxuXFx0MTAwJSB7XFxuXFx0ICB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpO1xcblxcdH1cXG59XFxuXFxuQG1lZGlhIHNjcmVlbiBhbmQgKG1pbi13aWR0aDogODAwcHgpIHtcXG5cXHRodG1sLCBib2R5LCBkaXYjY29udGVudCB7XFxuXFx0ICBmb250LXNpemU6IDE1cHg7XFxuXFx0fVxcblxcblxcdGJvZHkge1xcblxcdFxcdGRpc3BsYXk6IGZsZXg7XFxuXFx0XFx0anVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuXFx0XFx0YmFja2dyb3VuZC1jb2xvcjogdmFyKC0tdGVydGlhcnkpO1xcblxcdH1cXG5cXG5cXHRkaXYjY29udGVudCB7XFxuXFx0XFx0d2lkdGg6IDYwJTtcXG5cXHR9XFxuXFxuXFx0ZGl2I2F4aXNUb2dnbGUge1xcblxcdFxcdFxcblxcdFxcdHRvcDogMzdweDtcXG5cXHRcXHQvKiBkaXNwbGF5OiBub25lOyAqL1xcblxcdH1cXG5cXG5cXHRkaXYjZG9uZVdpdGhTaGlwcyB7XFxuXFx0XFx0dG9wOiA3NXB4O1xcblxcdH1cXG59XFxuXFxuQG1lZGlhIHNjcmVlbiBhbmQgKG1pbi13aWR0aDogMTI1MHB4KSB7XFxuXFx0ZGl2I2NvbnRlbnQge1xcblxcdFxcdHdpZHRoOiA1MCU7XFxuXFx0fVxcblxcdGRpdiNQMUcsIGRpdiNQMkcge1xcblxcdFxcdHdpZHRoOiA1MCU7XFxuXFx0XFx0bWFyZ2luOiBhdXRvO1xcblxcdH1cXG59XCJdLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG4vLyBFeHBvcnRzXG5leHBvcnQgZGVmYXVsdCBfX19DU1NfTE9BREVSX0VYUE9SVF9fXztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICBBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzV2l0aE1hcHBpbmdUb1N0cmluZykge1xuICB2YXIgbGlzdCA9IFtdO1xuXG4gIC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcbiAgbGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIGNvbnRlbnQgPSBcIlwiO1xuICAgICAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBpdGVtWzVdICE9PSBcInVuZGVmaW5lZFwiO1xuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpO1xuICAgICAgfVxuICAgICAgY29udGVudCArPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pO1xuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29udGVudDtcbiAgICB9KS5qb2luKFwiXCIpO1xuICB9O1xuXG4gIC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG4gIGxpc3QuaSA9IGZ1bmN0aW9uIGkobW9kdWxlcywgbWVkaWEsIGRlZHVwZSwgc3VwcG9ydHMsIGxheWVyKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGVzID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCB1bmRlZmluZWRdXTtcbiAgICB9XG4gICAgdmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHRoaXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgdmFyIGlkID0gdGhpc1trXVswXTtcbiAgICAgICAgaWYgKGlkICE9IG51bGwpIHtcbiAgICAgICAgICBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2lkXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgX2sgPSAwOyBfayA8IG1vZHVsZXMubGVuZ3RoOyBfaysrKSB7XG4gICAgICB2YXIgaXRlbSA9IFtdLmNvbmNhdChtb2R1bGVzW19rXSk7XG4gICAgICBpZiAoZGVkdXBlICYmIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGxheWVyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbVs1XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGl0ZW1bNV0gPSBsYXllcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNV0gPSBsYXllcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG1lZGlhKSB7XG4gICAgICAgIGlmICghaXRlbVsyXSkge1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzdXBwb3J0cykge1xuICAgICAgICBpZiAoIWl0ZW1bNF0pIHtcbiAgICAgICAgICBpdGVtWzRdID0gXCJcIi5jb25jYXQoc3VwcG9ydHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs0XSA9IHN1cHBvcnRzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsaXN0LnB1c2goaXRlbSk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gbGlzdDtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgdmFyIGNvbnRlbnQgPSBpdGVtWzFdO1xuICB2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG4gIGlmICghY3NzTWFwcGluZykge1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG4gIGlmICh0eXBlb2YgYnRvYSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KGNzc01hcHBpbmcpKSkpO1xuICAgIHZhciBkYXRhID0gXCJzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxcIi5jb25jYXQoYmFzZTY0KTtcbiAgICB2YXIgc291cmNlTWFwcGluZyA9IFwiLyojIFwiLmNvbmNhdChkYXRhLCBcIiAqL1wiKTtcbiAgICByZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oXCJcXG5cIik7XG4gIH1cbiAgcmV0dXJuIFtjb250ZW50XS5qb2luKFwiXFxuXCIpO1xufTsiLCJcbiAgICAgIGltcG9ydCBBUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgIGltcG9ydCBkb21BUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydEZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qc1wiO1xuICAgICAgaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRTdHlsZUVsZW1lbnQgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanNcIjtcbiAgICAgIGltcG9ydCBzdHlsZVRhZ1RyYW5zZm9ybUZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanNcIjtcbiAgICAgIGltcG9ydCBjb250ZW50LCAqIGFzIG5hbWVkRXhwb3J0IGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuY3NzXCI7XG4gICAgICBcbiAgICAgIFxuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtID0gc3R5bGVUYWdUcmFuc2Zvcm1Gbjtcbm9wdGlvbnMuc2V0QXR0cmlidXRlcyA9IHNldEF0dHJpYnV0ZXM7XG5cbiAgICAgIG9wdGlvbnMuaW5zZXJ0ID0gaW5zZXJ0Rm4uYmluZChudWxsLCBcImhlYWRcIik7XG4gICAgXG5vcHRpb25zLmRvbUFQSSA9IGRvbUFQSTtcbm9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50ID0gaW5zZXJ0U3R5bGVFbGVtZW50O1xuXG52YXIgdXBkYXRlID0gQVBJKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0ICogZnJvbSBcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZS5jc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHN0eWxlc0luRE9NID0gW107XG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXNJbkRPTS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChzdHlsZXNJbkRPTVtpXS5pZGVudGlmaWVyID09PSBpZGVudGlmaWVyKSB7XG4gICAgICByZXN1bHQgPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldO1xuICAgIHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuICAgIHZhciBjb3VudCA9IGlkQ291bnRNYXBbaWRdIHx8IDA7XG4gICAgdmFyIGlkZW50aWZpZXIgPSBcIlwiLmNvbmNhdChpZCwgXCIgXCIpLmNvbmNhdChjb3VudCk7XG4gICAgaWRDb3VudE1hcFtpZF0gPSBjb3VudCArIDE7XG4gICAgdmFyIGluZGV4QnlJZGVudGlmaWVyID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIGNzczogaXRlbVsxXSxcbiAgICAgIG1lZGlhOiBpdGVtWzJdLFxuICAgICAgc291cmNlTWFwOiBpdGVtWzNdLFxuICAgICAgc3VwcG9ydHM6IGl0ZW1bNF0sXG4gICAgICBsYXllcjogaXRlbVs1XVxuICAgIH07XG4gICAgaWYgKGluZGV4QnlJZGVudGlmaWVyICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB1cGRhdGVyID0gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucyk7XG4gICAgICBvcHRpb25zLmJ5SW5kZXggPSBpO1xuICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKGksIDAsIHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogdXBkYXRlcixcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cbiAgcmV0dXJuIGlkZW50aWZpZXJzO1xufVxuZnVuY3Rpb24gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgYXBpID0gb3B0aW9ucy5kb21BUEkob3B0aW9ucyk7XG4gIGFwaS51cGRhdGUob2JqKTtcbiAgdmFyIHVwZGF0ZXIgPSBmdW5jdGlvbiB1cGRhdGVyKG5ld09iaikge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXAgJiYgbmV3T2JqLnN1cHBvcnRzID09PSBvYmouc3VwcG9ydHMgJiYgbmV3T2JqLmxheWVyID09PSBvYmoubGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXBpLnVwZGF0ZShvYmogPSBuZXdPYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcGkucmVtb3ZlKCk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gdXBkYXRlcjtcbn1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGxpc3QgPSBsaXN0IHx8IFtdO1xuICB2YXIgbGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcbiAgICBuZXdMaXN0ID0gbmV3TGlzdCB8fCBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGlkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbaV07XG4gICAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4XS5yZWZlcmVuY2VzLS07XG4gICAgfVxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG4gICAgICB2YXIgX2luZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoX2lkZW50aWZpZXIpO1xuICAgICAgaWYgKHN0eWxlc0luRE9NW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRPTVtfaW5kZXhdLnVwZGF0ZXIoKTtcbiAgICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxhc3RJZGVudGlmaWVycyA9IG5ld0xhc3RJZGVudGlmaWVycztcbiAgfTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBtZW1vID0ge307XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gZ2V0VGFyZ2V0KHRhcmdldCkge1xuICBpZiAodHlwZW9mIG1lbW9bdGFyZ2V0XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHZhciBzdHlsZVRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTtcblxuICAgIC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG4gICAgaWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcbiAgICAgICAgLy8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBtZW1vW3RhcmdldF0gPSBzdHlsZVRhcmdldDtcbiAgfVxuICByZXR1cm4gbWVtb1t0YXJnZXRdO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydEJ5U2VsZWN0b3IoaW5zZXJ0LCBzdHlsZSkge1xuICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KGluc2VydCk7XG4gIGlmICghdGFyZ2V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIHN0eWxlIHRhcmdldC4gVGhpcyBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBmb3IgdGhlICdpbnNlcnQnIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcbiAgfVxuICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRCeVNlbGVjdG9yOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBvcHRpb25zLnNldEF0dHJpYnV0ZXMoZWxlbWVudCwgb3B0aW9ucy5hdHRyaWJ1dGVzKTtcbiAgb3B0aW9ucy5pbnNlcnQoZWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydFN0eWxlRWxlbWVudDsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMoc3R5bGVFbGVtZW50KSB7XG4gIHZhciBub25jZSA9IHR5cGVvZiBfX3dlYnBhY2tfbm9uY2VfXyAhPT0gXCJ1bmRlZmluZWRcIiA/IF9fd2VicGFja19ub25jZV9fIDogbnVsbDtcbiAgaWYgKG5vbmNlKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIG5vbmNlKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IFwiXCI7XG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChvYmouc3VwcG9ydHMsIFwiKSB7XCIpO1xuICB9XG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKTtcbiAgfVxuICB2YXIgbmVlZExheWVyID0gdHlwZW9mIG9iai5sYXllciAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIkBsYXllclwiLmNvbmNhdChvYmoubGF5ZXIubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChvYmoubGF5ZXIpIDogXCJcIiwgXCIge1wiKTtcbiAgfVxuICBjc3MgKz0gb2JqLmNzcztcbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG4gIGlmIChzb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiLmNvbmNhdChidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpLCBcIiAqL1wiKTtcbiAgfVxuXG4gIC8vIEZvciBvbGQgSUVcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICAqL1xuICBvcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xufVxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCkge1xuICAvLyBpc3RhbmJ1bCBpZ25vcmUgaWZcbiAgaWYgKHN0eWxlRWxlbWVudC5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gZG9tQVBJKG9wdGlvbnMpIHtcbiAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHJldHVybiB7XG4gICAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHt9LFxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgIH07XG4gIH1cbiAgdmFyIHN0eWxlRWxlbWVudCA9IG9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuICByZXR1cm4ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKG9iaikge1xuICAgICAgYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcbiAgICB9XG4gIH07XG59XG5tb2R1bGUuZXhwb3J0cyA9IGRvbUFQSTsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCkge1xuICBpZiAoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZUVsZW1lbnQuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgc3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICB9XG4gICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlVGFnVHJhbnNmb3JtOyIsImltcG9ydCAnLi9zdHlsZS5jc3MnO1xuaW1wb3J0IGxvZ2ljdG9kbyBmcm9tICcuL2xvZ2ljdG9kby5qcyc7XG5pbXBvcnQgeyBwbGFjZVNoaXBzRE9NIH0gZnJvbSAnLi9sb2dpY3RvZG8uanMnO1xuaW1wb3J0IHsgZmlsbFNxdWFyZURPTSB9IGZyb20gJy4vbG9naWN0b2RvLmpzJztcbmltcG9ydCB7IHNoaXBTdW5rRE9NIH0gZnJvbSAnLi9sb2dpY3RvZG8uanMnO1xuaW1wb3J0IHsgc2hyaW5rT3duQm9hcmQgfSBmcm9tICcuL2xvZ2ljdG9kby5qcyc7XG5pbXBvcnQgeyByZXNldERPTSB9IGZyb20gJy4vbG9naWN0b2RvLmpzJztcbmltcG9ydCB7IGhpZGVDb21wQm9hcmQgfSBmcm9tICcuL2xvZ2ljdG9kby5qcyc7XG5cbmNvbnN0IHBrZyA9IHJlcXVpcmUoJy4uL2xvZ2ljLmpzJyk7XG5jb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ld0dhbWVCdG5cIik7XG5jb25zdCBsZW5ndGhGb3JTaGlwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZW5ndGhJbmRpY2F0b3JcIik7XG5jb25zdCBwbGFjZVNoaXBJbnN0cnVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJvbXB0UGxhY2luZ1AxXCIpO1xuY29uc3Qgc3RhcnRCYXR0bGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJhdHRsZVN0YXJ0XCIpO1xuY29uc3QgcmVhZHlCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRvbmVXaXRoU2hpcHNcIik7XG5jb25zdCBheGlzVG9nZ2xlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXhpc1RvZ2dsZVwiKTtcblxuZnVuY3Rpb24gdG9nZ2xlQnV0dG9uKCkge1xuICAgIGlmIChidG4uc3R5bGUuZGlzcGxheSA9PT0gXCJub25lXCIgfHwgYnRuLnN0eWxlLmRpc3BsYXkgPT09IFwiXCIpIHtcbiAgICAgICAgYnRuLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgfSBlbHNlIGlmIChidG4uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIikge1xuICAgICAgICBidG4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc3RhcnRHYW1lKCkge1xuICAgIGxvZ2ljdG9kbygpOy8vRE9NIHN0dWZmXG4gICAgLy8tLS0tLWdhbWUgbG9vcCBzdGFydFxuICAgIGxldCBQMSA9IHBrZy5QbGF5ZXIoJ1BsYXllciAxJyk7XG4gICAgbGV0IFAyID0gcGtnLlBsYXllcignQ29tcHV0ZXInKTtcbiAgICBsZXQgY3VycmVudFBsYXllciA9IG51bGw7XG4gICAgbGV0IHdhaXRpbmdQbGF5ZXIgPSBudWxsO1xuXG4gICAgLy9jdXJyZW50bHkganVzdCBwbGF5ZXIgdnMgQ1BVXG4gICAgLy9hZGQgaW4gbGF0ZXIgLSBjaG9pY2Ugb2YgUHZQIG9yIHZzIENQVVxuICAgIC8vbmFtZSBpbnB1dCBmb3IgcGxheWVyKHMpXG5cbiAgICAvL2RlY2lkZSB3aG8gZ29lcyBmaXJzdFxuICAgIGZ1bmN0aW9uIHR1cm5Td2l0Y2hIaWRlQm9hcmRzKHBsYXllcikgey8vaW5zZXJ0IGN1cnJlbnRQbGF5ZXJcbiAgICAgICAgbGV0IHAxU3R1ZmZzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwMVNlcGVyYXRvclwiKTtcbiAgICAgICAgbGV0IHAyU3R1ZmZzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwMlNlcGVyYXRvclwiKTtcbiAgICAgICAgaWYgKHBsYXllciA9PT0gUDEpIHtcbiAgICAgICAgICAgIHAxU3R1ZmZzLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgICAgICBwMlN0dWZmcy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIH0gZWxzZSBpZiAocGxheWVyID09PSBQMikge1xuICAgICAgICAgICAgcDFTdHVmZnMuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgcDJTdHVmZnMuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBwaWNrU3RhcnRlcigpIHtcbiAgICAgICAgbGV0IGdvRmlyc3QgPSBNYXRoLnJhbmRvbSgpIDwgMC41ID8gXCJQMVwiIDogXCJQMlwiO1xuICAgICAgICBpZiAoZ29GaXJzdCA9PT0gXCJQMVwiKSB7XG4gICAgICAgICAgICBjdXJyZW50UGxheWVyID0gUDE7XG4gICAgICAgICAgICB3YWl0aW5nUGxheWVyID0gUDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjdXJyZW50UGxheWVyID0gUDI7XG4gICAgICAgICAgICB3YWl0aW5nUGxheWVyID0gUDE7XG4gICAgICAgIH1cbiAgICAgICAgdHVyblN3aXRjaEhpZGVCb2FyZHMoY3VycmVudFBsYXllcik7XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIGNoZWNrRm9yV2luKCkge1xuICAgICAgICAvL2NoZWNrIGZvciB3aW4gZmlyc3RcbiAgICAgICAgaWYgKFAxLmFsbFNoaXBzU3VuaygpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlAyIGlzIHRoZSB3aW5uZXIuIFdob28hIVwiKTtcbiAgICAgICAgICAgIHN0YXJ0QmF0dGxlLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIHRvZ2dsZUJ1dHRvbigpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoUDIuYWxsU2hpcHNTdW5rKCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUDEgaXMgdGhlIHdpbm5lci4gV2hvbyEhXCIpO1xuICAgICAgICAgICAgc3RhcnRCYXR0bGUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgdG9nZ2xlQnV0dG9uKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBwbGF5ZXJUdXJuU3dpdGNoKCkge1xuICAgICAgICAvKiAvL2NoZWNrIGZvciB3aW4gZmlyc3RcbiAgICAgICAgaWYgKFAxLmFsbFNoaXBzU3VuaygpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlAyIGlzIHRoZSB3aW5uZXIuIFdob28hIVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChQMi5hbGxTaGlwc1N1bmsoKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJQMSBpcyB0aGUgd2lubmVyLiBXaG9vISFcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gIGVsc2UqLyB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFBsYXllciA9PT0gUDIpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UGxheWVyID0gUDE7XG4gICAgICAgICAgICAgICAgd2FpdGluZ1BsYXllciA9IFAyO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UGxheWVyID0gUDI7XG4gICAgICAgICAgICAgICAgd2FpdGluZ1BsYXllciA9IFAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHVyblN3aXRjaEhpZGVCb2FyZHMoY3VycmVudFBsYXllcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy9waWNrU3RhcnRlcigpO1xuICAgIGN1cnJlbnRQbGF5ZXIgPSBQMTtcbiAgICB3YWl0aW5nUGxheWVyID0gUDI7XG4gICAgdHVyblN3aXRjaEhpZGVCb2FyZHMoY3VycmVudFBsYXllcik7XG4gICAgY29uc29sZS5sb2coXCJjdXJyZW50UGxheWVyIGlzIFwiLCBjdXJyZW50UGxheWVyKTtcblxuICAgIC8vc3RhcnQgd2l0aCBVUCBUTyAxMCAtLSBmb3VyIDFzLCB0aHJlZSAycywgdHdvIDNzLCBvbmUgNFxuICAgIGN1cnJlbnRQbGF5ZXIgPSBcInBhdXNlUGxhY2VcIjtcbiAgICB3YWl0aW5nUGxheWVyID0gXCJwYXVzZVBsYWNlXCI7IFxuICAgIC8vdG8ga2VlcCB0YXJnZXQgYm9hcmRzIGZyb20gZmlyaW5nXG5cbiAgICAvL2NvZGUgaGVyZSB0byB0b2dnbGUgdGhlIFwiaW5zdHJ1Y3Rpb25zXCIgZm9yIHBsYWNlbWVudCBvblxuXG4gICAgYXhpc1RvZ2dsZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgaWYgKGF4aXNUb2dnbGVyLmlubmVySFRNTCA9PT0gXCJ2ZXJ0aWNhbFwiKSB7XG4gICAgICAgICAgICBheGlzVG9nZ2xlci5pbm5lckhUTUwgPSBcImhvcml6b250YWxcIjtcbiAgICAgICAgfSBlbHNlIGlmIChheGlzVG9nZ2xlci5pbm5lckhUTUwgPT09IFwiaG9yaXpvbnRhbFwiKSB7XG4gICAgICAgICAgICBheGlzVG9nZ2xlci5pbm5lckhUTUwgPSBcInZlcnRpY2FsXCI7XG4gICAgICAgIH1cbiAgICB9KVxuXG4gICAgbGV0IGFsbENvcHlTcGFuc1AxID0gW107XG4gICAgbGV0IGFsbENvcHlTcGFuc1AyID0gW107XG5cbiAgICBjb25zdCBQMVNlbGZCb2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjUDFHXCIpO1xuXG5cbiAgICBQMVNlbGZCb2FyZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICBsZXQgdGVzdEFycmF5ID0gW107XG4gICAgICAgIGxldCBsZW5ndGhJbnB1dHRlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGVuZ3RoSW5wdXRcIikudmFsdWU7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibGVuZ3RoSW5wdXR0ZWQgaXMgXCIsIGxlbmd0aElucHV0dGVkKTtcbiAgICAgICAgbGV0IGF4aXNJbnB1dHRlZCA9IGF4aXNUb2dnbGVyLmlubmVySFRNTDtcbiAgICAgICAgY29uc29sZS5sb2coXCJheGlzSW5wdXR0ZWQgaXMgXCIsIGF4aXNJbnB1dHRlZCk7XG4gICAgICAgIGlmIChjdXJyZW50UGxheWVyICE9PSBcInBhdXNlUGxhY2VcIiAmJiB3YWl0aW5nUGxheWVyICE9PSBcInBhdXNlUGxhY2VcIikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKGxlbmd0aElucHV0dGVkIDwgMCB8fCBsZW5ndGhJbnB1dHRlZCA+IDQgfHwgbGVuZ3RoSW5wdXR0ZWQgPT09IFwiXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibm90aGluZyBhZGRlZCwgd2hld1wiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFAxLnBsYXllclNoaXBDb3VudCgpKTtcbiAgICAgICAgICAgIGlmIChlLnRhcmdldC5pZCA9PT0gXCJQMUdcIikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmNsYXNzTmFtZS5zbGljZSgwLDYpID09PSBcInNxdWFyZVwiICYmIGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmlkLnNsaWNlKDEsMikgPT09IFwiMFwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmNsYXNzTmFtZS5zbGljZSgwLDYpID09PSBcInNxdWFyZVwiICYmIGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmlkLnNsaWNlKDAsNSkgPT09IFwiZW1wdHlcIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChQMS5wbGF5ZXJTaGlwQ291bnQoKSA8IDEwKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb29yZFBpY2tlZCA9IGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmlkLnNwbGl0KCdfJylbMF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY29vcmRQaWNrZWQgaXMgXCIsIGNvb3JkUGlja2VkKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNoaXBTcGFuVGVzdFAxID0gUDEucGxheWVyUGxhY2VTaGlwU3Bhbihjb29yZFBpY2tlZCwgbGVuZ3RoSW5wdXR0ZWQsIGF4aXNJbnB1dHRlZCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic2hpcFNwYW5UZXN0UDEgaXMgXCIsIHNoaXBTcGFuVGVzdFAxKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvcHlTcGFuID0gc2hpcFNwYW5UZXN0UDEuc2xpY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFAxLnBsYXllckNoZWNrT3ZlcmxhcChjb3B5U3BhbikpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvcHlTcGFuMVAxID0gc2hpcFNwYW5UZXN0UDEuc2xpY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbENvcHlTcGFuc1AxLnB1c2goY29weVNwYW4xUDEpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBQMS5wbGF5ZXJQbGFjZShjb29yZFBpY2tlZCwgbGVuZ3RoSW5wdXR0ZWQsIGF4aXNJbnB1dHRlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QXJyYXkucHVzaChjb3B5U3Bhbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZVNoaXBzRE9NKHNoaXBTcGFuVGVzdFAxLCBQMSwgUDEsIFAyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFAxLnBsYXllckJvYXJkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pXG5cbiAgICByZWFkeUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAvL2FkZHMgYW4gZXF1YWwgIyBvZiBzaGlwcyB0byB3aGF0IFAxIGhhcyAoZGlmZmVyZW50IGxlbmd0aHMpXG4gICAgICAgIGxldCBudW1TaGlwc05lZWRlZCA9IFAxLnNoaXBzVXAoKTtcbiAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBudW1TaGlwc05lZWRlZDsgaysrKSB7XG4gICAgICAgICAgICBsZXQgbGVuZ3RoT2ZTaGlwID0gKGslNCkrMTtcbiAgICAgICAgICAgIGxldCBjb21wR2VuUG9zQXhpcyA9IFAyLmNvbXB1dGVyUGxhY2UobGVuZ3RoT2ZTaGlwKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNvbXBHZW5Qb3NBeGlzKTtcbiAgICAgICAgICAgIGxldCBzaGlwU3BhbjFQMiA9IFAyLnBsYXllclBsYWNlU2hpcFNwYW4oY29tcEdlblBvc0F4aXNbMF0sIGxlbmd0aE9mU2hpcCwgY29tcEdlblBvc0F4aXNbMV0pO1xuICAgICAgICAgICAgbGV0IGNvcHlTcGFuMVAyID0gc2hpcFNwYW4xUDIuc2xpY2UoKTtcbiAgICAgICAgICAgIGFsbENvcHlTcGFuc1AyLnB1c2goY29weVNwYW4xUDIpO1xuICAgICAgICAgICAgcGxhY2VTaGlwc0RPTShzaGlwU3BhbjFQMiwgd2FpdGluZ1BsYXllciwgUDEsIFAyKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhQMi5wbGF5ZXJCb2FyZCk7XG4gICAgICAgIC8vb25jZSBlbmVteSBzaGlwcyBoYXZlIGJlZW4gc2V0LCBjaGFuZ2UgaW5zdHJ1Y3Rpb25zIG9uIHJpZ2h0XG4gICAgICAgIC8vJiByZW1vdmUgXCJzaGlwIGFkZGluZ1wiIGJ1dHRvbnMgb24gdGhlIGxlZnRcbiAgICAgICAgcmVhZHlCdG4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICBheGlzVG9nZ2xlci5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIGxlbmd0aEZvclNoaXAuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICBwbGFjZVNoaXBJbnN0cnVjdC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIHN0YXJ0QmF0dGxlLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgIGN1cnJlbnRQbGF5ZXIgPSBQMTtcbiAgICAgICAgd2FpdGluZ1BsYXllciA9IFAyO1xuICAgIH0pXG5cbiAgICAvL2FkZCBpbiBsYXRlciAtIGNob29zaW5nIHdoZXJlIHRvIHBsYWNlIHNoaXBzIVxuICAgIC8vRE9NL1VJIHNlbGVjdGlvbiA+IGZpcmluZyBwbGF5ZXJQbGFjZSBjb2RlID4gc2V0dGluZyBuZXcgRE9NXG4gICAgLy9vciB0aGUgcmFuZG9tIENQVSBzaGlwIHBsYWNlbWVudCBiZWxvdyBmb3IgdnMgQ1BVXG4gICAgLy93aWxsIGFsc28gbmVlZCB0byBwdXQgY29kZSB0byBISURFIFxuICAgIC8vQ1BVIChvciBvdGhlciBwZXJzb24ncykgYm9hcmRzXG4gICAgXG4gICAgLyogUDIuY29tcHV0ZXJQbGFjZSg0KTtcbiAgICBQMi5jb21wdXRlclBsYWNlKDMpO1xuICAgIFAyLmNvbXB1dGVyUGxhY2UoMik7XG4gICAgUDIuY29tcHV0ZXJQbGFjZSgxKTsgKi8gLy9yYW5kb21seSBwbGFjZXMgZm9yIGNvbXB1dGVyXG5cbiAgICAvKiBQMS5wbGF5ZXJQbGFjZSgnQTInLCAzLCAndmVydGljYWwnKTtcbiAgICBQMS5wbGF5ZXJQbGFjZSgnRDInLCAyLCAnaG9yaXpvbnRhbCcpO1xuICAgIFAxLnBsYXllclBsYWNlKCdINCcsIDEsICd2ZXJ0aWNhbCcpO1xuICAgIFAxLnBsYXllclBsYWNlKCdKMScsIDQsICd2ZXJ0aWNhbCcpO1xuICAgIGxldCBzaGlwU3BhbjFQMSA9IFAxLnBsYXllclBsYWNlU2hpcFNwYW4oJ0EyJywgMywgJ3ZlcnRpY2FsJyk7XG4gICAgbGV0IHNoaXBTcGFuMlAxID0gUDEucGxheWVyUGxhY2VTaGlwU3BhbignRDInLCAyLCAnaG9yaXpvbnRhbCcpO1xuICAgIGxldCBzaGlwU3BhbjNQMSA9IFAxLnBsYXllclBsYWNlU2hpcFNwYW4oJ0g0JywgMSwgJ3ZlcnRpY2FsJyk7XG4gICAgbGV0IHNoaXBTcGFuNFAxID0gUDEucGxheWVyUGxhY2VTaGlwU3BhbignSjEnLCA0LCAndmVydGljYWwnKTtcblxuICAgIGxldCBjb3B5U3BhbjFQMSA9IHNoaXBTcGFuMVAxLnNsaWNlKCk7XG4gICAgbGV0IGNvcHlTcGFuMlAxID0gc2hpcFNwYW4yUDEuc2xpY2UoKTtcbiAgICBsZXQgY29weVNwYW4zUDEgPSBzaGlwU3BhbjNQMS5zbGljZSgpO1xuICAgIGxldCBjb3B5U3BhbjRQMSA9IHNoaXBTcGFuNFAxLnNsaWNlKCk7XG4gICAgbGV0IGFsbENvcHlTcGFuc1AxID0gW107XG4gICAgYWxsQ29weVNwYW5zUDEucHVzaChjb3B5U3BhbjFQMSk7XG4gICAgYWxsQ29weVNwYW5zUDEucHVzaChjb3B5U3BhbjJQMSk7XG4gICAgYWxsQ29weVNwYW5zUDEucHVzaChjb3B5U3BhbjNQMSk7XG4gICAgYWxsQ29weVNwYW5zUDEucHVzaChjb3B5U3BhbjRQMSk7ICovXG5cbiAgICAvKiBQMi5wbGF5ZXJQbGFjZSgnQTInLCAzLCAndmVydGljYWwnKTtcbiAgICBQMi5wbGF5ZXJQbGFjZSgnRDInLCAyLCAnaG9yaXpvbnRhbCcpO1xuICAgIFAyLnBsYXllclBsYWNlKCdINCcsIDEsICd2ZXJ0aWNhbCcpO1xuICAgIFAyLnBsYXllclBsYWNlKCdKMScsIDQsICd2ZXJ0aWNhbCcpOyAqL1xuXG4gICAgLyogbGV0IHNoaXBTcGFuMVAyID0gUDIucGxheWVyUGxhY2VTaGlwU3BhbignQTInLCAzLCAndmVydGljYWwnKTtcbiAgICBsZXQgc2hpcFNwYW4yUDIgPSBQMi5wbGF5ZXJQbGFjZVNoaXBTcGFuKCdEMicsIDIsICdob3Jpem9udGFsJyk7XG4gICAgbGV0IHNoaXBTcGFuM1AyID0gUDIucGxheWVyUGxhY2VTaGlwU3BhbignSDQnLCAxLCAndmVydGljYWwnKTtcbiAgICBsZXQgc2hpcFNwYW40UDIgPSBQMi5wbGF5ZXJQbGFjZVNoaXBTcGFuKCdKMScsIDQsICd2ZXJ0aWNhbCcpOyAqL1xuICAgIC8vdGVzdGluZyB1c2luZyB0aGVzZSBzcGFucyB0byBmaW5kIGlmIGEgc2hpcCdzIGNvb3JkaW5hdGVzIFxuICAgIC8vYXJlIHdpdGhpbiBpdCwgYW5kIHRoZW4gdXNpbmcgdGhhdCB0byBcImJsb2NrXCIgb3V0IGEgc3VuayBzaGlwXG4gICAgLy9vbiB0aGUgRE9NXG4gICAgLyogbGV0IGNvcHlTcGFuMVAyID0gc2hpcFNwYW4xUDIuc2xpY2UoKTtcbiAgICBsZXQgY29weVNwYW4yUDIgPSBzaGlwU3BhbjJQMi5zbGljZSgpO1xuICAgIGxldCBjb3B5U3BhbjNQMiA9IHNoaXBTcGFuM1AyLnNsaWNlKCk7XG4gICAgbGV0IGNvcHlTcGFuNFAyID0gc2hpcFNwYW40UDIuc2xpY2UoKTtcbiAgICBsZXQgYWxsQ29weVNwYW5zUDIgPSBbXTtcbiAgICBhbGxDb3B5U3BhbnNQMi5wdXNoKGNvcHlTcGFuMVAyKTtcbiAgICBhbGxDb3B5U3BhbnNQMi5wdXNoKGNvcHlTcGFuMlAyKTtcbiAgICBhbGxDb3B5U3BhbnNQMi5wdXNoKGNvcHlTcGFuM1AyKTtcbiAgICBhbGxDb3B5U3BhbnNQMi5wdXNoKGNvcHlTcGFuNFAyKTsgKi9cblxuICAgIC8qIHBsYWNlU2hpcHNET00oc2hpcFNwYW4xUDEsIGN1cnJlbnRQbGF5ZXIsIFAxLCBQMik7XG4gICAgcGxhY2VTaGlwc0RPTShzaGlwU3BhbjJQMSwgY3VycmVudFBsYXllciwgUDEsIFAyKTtcbiAgICBwbGFjZVNoaXBzRE9NKHNoaXBTcGFuM1AxLCBjdXJyZW50UGxheWVyLCBQMSwgUDIpO1xuICAgIHBsYWNlU2hpcHNET00oc2hpcFNwYW40UDEsIGN1cnJlbnRQbGF5ZXIsIFAxLCBQMik7IFxuXG4gICAgcGxhY2VTaGlwc0RPTShzaGlwU3BhbjFQMiwgd2FpdGluZ1BsYXllciwgUDEsIFAyKTtcbiAgICBwbGFjZVNoaXBzRE9NKHNoaXBTcGFuMlAyLCB3YWl0aW5nUGxheWVyLCBQMSwgUDIpO1xuICAgIHBsYWNlU2hpcHNET00oc2hpcFNwYW4zUDIsIHdhaXRpbmdQbGF5ZXIsIFAxLCBQMik7XG4gICAgcGxhY2VTaGlwc0RPTShzaGlwU3BhbjRQMiwgd2FpdGluZ1BsYXllciwgUDEsIFAyKTsqL1xuXG4gICAgLy9hZnRlciBzaGlwcyBwbGFjZWQsIHNocmluayBnYW1lYm9hcmQgc28gaXQncyBsZXNzIGluIHRoZSB3YXlcbiAgICAvKiBzaHJpbmtPd25Cb2FyZChjdXJyZW50UGxheWVyLCBQMSwgUDIpO1xuICAgIHNocmlua093bkJvYXJkKHdhaXRpbmdQbGF5ZXIsIFAxLCBQMik7ICovXG5cblxuICAgIGZ1bmN0aW9uIHNwaW5uZXJPbigpIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkZXJcIikuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICB9XG4gICAgZnVuY3Rpb24gc3Bpbm5lck9mZigpIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkZXJcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIH1cbiAgICAvL1AxIChtZSkgZmlyc3QsIG5lZWQgYWRkRXZlbnRMaXN0ZW5lciBmb3IgbXkgXG4gICAgLy9lbmVteSBib2FyZFxuICAgIC8vb25lIGNsaWNrIHdpbGwgaGF2ZSB0byBnZXQgdGhlIGZpcnN0IHR3byBjaGFyIG9mIHNxIElEXG4gICAgLy9hbmQgZG8gZnVuY3Rpb24gKGV4OiBQMS5kaWRBdGtNaXNzKCdBMicsIFAyLmdldEF0dGFja2VkKSlcbiAgICBjb25zdCBQMUVuZW15Qm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1AxVFwiKTtcbiAgICBQMUVuZW15Qm9hcmQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgaWYgKGN1cnJlbnRQbGF5ZXIgIT09IFAxKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZS50YXJnZXQuaWQgPT09IFwiUDFUXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKChlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5jbGFzc05hbWUuc2xpY2UoMCw2KSA9PT0gXCJzcXVhcmVcIiAmJiBlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5pZC5zbGljZSgxLDIpID09PSBcIjBcIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKChlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5jbGFzc05hbWUuc2xpY2UoMCw2KSA9PT0gXCJzcXVhcmVcIiAmJiBlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5pZC5zbGljZSgwLDUpID09PSBcImVtcHR5XCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgY29vcmRQaWNrZWQgPSBlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5pZC5zcGxpdCgnXycpWzBdO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY29vcmRQaWNrZWQgd2FzIFwiLCBjb29yZFBpY2tlZCk7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IFAxLmRpZEF0a01pc3MoY29vcmRQaWNrZWQsIFAyLmdldEF0dGFja2VkKTtcbiAgICAgICAgICAgICAgICBsZXQgZGlkSVNpbmtBU2hpcCA9IFAyLmdldFNoaXBGb3JPcHAoY29vcmRQaWNrZWQpO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgIT09IGZhbHNlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy9leGNsdWRlcyBmYWxzZSB3aGVuIGNvb3JkIGlzIGFscmVhZHkgaGl0L21pc3NlZFxuICAgICAgICAgICAgICAgICAgICBsZXQgc3FIb2xkZXJDb29yZCA9IHJlc3VsdC5zbGljZSg1KTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGhpdE1pc3MgPSByZXN1bHQuc2xpY2UoMCw0KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJzcUhvbGRlckNvb3JkOiBcIiwgc3FIb2xkZXJDb29yZCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaGl0TWlzczogXCIsIGhpdE1pc3MpO1xuICAgICAgICAgICAgICAgICAgICBmaWxsU3F1YXJlRE9NKHNxSG9sZGVyQ29vcmQsIGhpdE1pc3MsIGN1cnJlbnRQbGF5ZXIsIFAxLCBQMik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkaWRJU2lua0FTaGlwICE9PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkaWRJU2lua0FTaGlwLmdldEhpdHMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkaWRJU2lua0FTaGlwLmlzU3VuaygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vLS0tLS0tLS0tLS0tbWFrZSB0aGlzIHNvIGl0J2xsIGRpc3BsYXlcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhhdCBhIHNoaXAgaGFzIFNVTksgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlkSVNpbmtBU2hpcC5pc1N1bmsoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhcnJheU9mRE9NID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsQ29weVNwYW5zUDIuZm9yRWFjaChhcnJheSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhcnJMZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgYXJyTGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcnJheVtrXS5pbmNsdWRlcyhgJHtjb29yZFBpY2tlZH1gKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5T2ZET00gPSBhcnJheTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGFycmF5T2ZET00pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5T2ZET00uZm9yRWFjaChleiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhcnJTdHJpbmcgPSBlelswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hpcFN1bmtET00oYXJyU3RyaW5nLCBjdXJyZW50UGxheWVyLCBQMSwgUDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJQMSBteUhpdHM6IFwiLCBQMS5teUhpdHMpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlAxIG15TWlzc2VzOiBcIiwgUDEubXlNaXNzZXMpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9wbGF5ZXJUdXJuU3dpdGNoKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGVja0ZvcldpbigpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChwbGF5ZXJUdXJuU3dpdGNoLCA1MDApOy8vZ2l2ZSBpdCB0aW1lXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGhpZGVDb21wQm9hcmQoKTsvL2hpZGUgQ1BVJ3MgcGxhY2VtZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3NldFRpbWVvdXQoY29tcHV0ZXJUdXJuLCAyNDAwKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZnRlciAxMDAwbXMsIGNhbGwgdGhlIGBzZXRUaW1lb3V0YCBjYWxsYmFja1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEluIHRoZSBtZWFudGltZSwgY29udGludWUgZXhlY3V0aW5nIGNvZGUgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wdXRlclR1cm4oKSAvL3J1bnMgc2Vjb25kIGFmdGVyIDExMDBtc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sMjIwMClcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwaW5uZXJPbigpIC8vcnVucyBmaXJzdCwgYWZ0ZXIgMTAwMG1zXG4gICAgICAgICAgICAgICAgICAgICAgICB9LDUwMClcbiAgICAgICAgICAgICAgICAgICAgfS8vY29tcHV0ZXIgXCJ0aGlua2luZ1wiXG4gICAgICAgICAgICAgICAgICAgIC8vY29tcHV0ZXJUdXJuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbiAgICBcbiAgICBjb25zdCBQMkVuZW15Qm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1AyVFwiKTtcbiAgICBQMkVuZW15Qm9hcmQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgaWYgKGN1cnJlbnRQbGF5ZXIgIT09IFAyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZS50YXJnZXQuaWQgPT09IFwiUDJUXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKChlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5jbGFzc05hbWUuc2xpY2UoMCw2KSA9PT0gXCJzcXVhcmVcIiAmJiBlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5pZC5zbGljZSgxLDIpID09PSBcIjBcIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKChlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5jbGFzc05hbWUuc2xpY2UoMCw2KSA9PT0gXCJzcXVhcmVcIiAmJiBlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5pZC5zbGljZSgwLDUpID09PSBcImVtcHR5XCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgY29vcmRQaWNrZWQgPSBlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5pZC5zbGljZSgwLDIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY29vcmRQaWNrZWQgd2FzIFwiLCBjb29yZFBpY2tlZCk7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IFAyLmRpZEF0a01pc3MoY29vcmRQaWNrZWQsIFAxLmdldEF0dGFja2VkKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAvL2V4Y2x1ZGVzIGZhbHNlIHdoZW4gY29vcmQgaXMgYWxyZWFkeSBoaXQvbWlzc2VkXG4gICAgICAgICAgICAgICAgICAgIGxldCBzcUhvbGRlckNvb3JkID0gcmVzdWx0LnNsaWNlKDUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgaGl0TWlzcyA9IHJlc3VsdC5zbGljZSgwLDQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInNxSG9sZGVyQ29vcmQ6IFwiLCBzcUhvbGRlckNvb3JkKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJoaXRNaXNzOiBcIiwgaGl0TWlzcyk7XG4gICAgICAgICAgICAgICAgICAgIGZpbGxTcXVhcmVET00oc3FIb2xkZXJDb29yZCwgaGl0TWlzcywgY3VycmVudFBsYXllciwgUDEsIFAyKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJQMiBteUhpdHM6IFwiLCBQMi5teUhpdHMpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlAyIG15TWlzc2VzOiBcIiwgUDIubXlNaXNzZXMpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hlY2tGb3JXaW4oKSA9PT0gZmFsc2UpIHsgXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHBsYXllclR1cm5Td2l0Y2gsIDE1MDApOy8vZ2l2ZSBpdCB0aW1lXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy9wbGF5ZXJUdXJuU3dpdGNoKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcblxuICAgIGZ1bmN0aW9uIGNvbXB1dGVyVHVybigpIHtcbiAgICAgICAgLy9jdXJyZW50IHBsYXllciBqdXN0IHN3aXRjaGVkIHRvIFAyLCBha2EgQ29tcHV0ZXJcbiAgICAgICAgbGV0IHJlc3VsdCA9IFAyLmRpZEF0a01pc3MoUDIucmFuZG9tQXRrQ2hvaWNlKCksIFAxLmdldEF0dGFja2VkKTtcbiAgICAgICAgbGV0IHNxSG9sZGVyQ29vcmQgPSByZXN1bHQuc2xpY2UoNSk7XG4gICAgICAgIGxldCBoaXRNaXNzID0gcmVzdWx0LnNsaWNlKDAsNCk7XG5cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKFwicmVzdWx0OiBcIiwgcmVzdWx0KTtcbiAgICAgICAgY29uc29sZS5sb2coXCJzcUhvbGRlckNvb3JkOiBcIiwgc3FIb2xkZXJDb29yZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiaGl0TWlzczogXCIsIGhpdE1pc3MpO1xuICAgICAgICBmaWxsU3F1YXJlRE9NKHNxSG9sZGVyQ29vcmQsIGhpdE1pc3MsIGN1cnJlbnRQbGF5ZXIsIFAxLCBQMik7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiUDIgbXlIaXRzOiBcIiwgUDIubXlIaXRzKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJQMiBteU1pc3NlczogXCIsIFAyLm15TWlzc2VzKTtcbiAgICAgICAgaWYgKGNoZWNrRm9yV2luKCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KHBsYXllclR1cm5Td2l0Y2gsIDE1MDApOy8vZ2l2ZSBpdCB0aW1lXG4gICAgICAgIH1cbiAgICAgICAgc3Bpbm5lck9mZigpO1xuICAgIH1cblxuICAgIC8qIFAxLmRpZEF0a01pc3MoJ0EyJywgUDIuZ2V0QXR0YWNrZWQpO1xuICAgIFAyLmRpZEF0a01pc3MoUDIucmFuZG9tQXRrQ2hvaWNlKCksIFAxLmdldEF0dGFja2VkKTtcbiAgICBjb25zb2xlLmxvZyhQMS5wbGF5ZXJCb2FyZCk7XG4gICAgY29uc29sZS5sb2coUDIucGxheWVyQm9hcmQpO1xuICAgIGNvbnNvbGUubG9nKFAxLm15SGl0cyk7XG4gICAgY29uc29sZS5sb2coUDIubXlIaXRzKTtcbiAgICBjb25zb2xlLmxvZyhQMi5teU1pc3Nlcyk7ICovXG59XG5cblxuYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgdG9nZ2xlQnV0dG9uKCk7XG4gICAgYnRuLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgcmVhZHlCdG4uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICBheGlzVG9nZ2xlci5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIGxlbmd0aEZvclNoaXAuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICBwbGFjZVNoaXBJbnN0cnVjdC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIHRvZ2dsZUJ1dHRvbigpO1xuICAgIHJlc2V0RE9NKCk7XG4gICAgc3RhcnRHYW1lKCk7XG4gICAgXG59KVxuXG5zdGFydEdhbWUoKTtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxvZ2ljdG9kbygpIHtcblxuICAgIGxldCBnYW1lYm9hcmRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImdhbWVib2FyZFwiKTtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGdhbWVib2FyZHMsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIGxldCBsZXR0ZXJOdW1iQXJyID0gWydlbXB0eScsJ0EnLCdCJywnQycsJ0QnLCdFJywnRicsJ0cnLCdIJywnSScsJ0onXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMTsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDExOyBqKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgbmV3U3EgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgICAgIG5ld1NxLmNsYXNzTmFtZSA9IGBzcXVhcmVgO1xuICAgICAgICAgICAgICAgIGxldCBzb21lQ29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgc29tZUNvbnRlbnQuY2xhc3NOYW1lID0gXCJjb250ZW50elwiO1xuICAgICAgICAgICAgICAgIGlmIChqID09PSAwICYmIGkgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc29tZUNvbnRlbnQuaW5uZXJIVE1MID0gYCR7aX1gO1xuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICAgICAgaWYgKGkgPT09IDAgJiYgaiAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBzb21lQ29udGVudC5pbm5lckhUTUwgPSBgJHtsZXR0ZXJOdW1iQXJyW2pdfWBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3U3EuYXBwZW5kQ2hpbGQoc29tZUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIGVsLmFwcGVuZENoaWxkKG5ld1NxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGV0IGZpcnN0U2VjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDFHXCIpO1xuICAgIGxldCBzZXRTcXVhcmVzID0gZmlyc3RTZWN0aW9uLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJzcXVhcmVcIik7XG4gICAgbGV0IHNldFNxQXJyYXkgPSBBcnJheS5mcm9tKHNldFNxdWFyZXMpOy8vY29udmVydCB0byBhcnJheVxuXG4gICAgbGV0IHNlY29uZFNlY3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAxVFwiKTtcbiAgICBsZXQgc2V0U2Vjb25kU3F1YXJlcyA9IHNlY29uZFNlY3Rpb24uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInNxdWFyZVwiKTtcbiAgICBsZXQgc2V0U2Vjb25kU3FBcnJheSA9IEFycmF5LmZyb20oc2V0U2Vjb25kU3F1YXJlcyk7Ly9jb252ZXJ0IHRvIGFycmF5XG5cbiAgICBsZXQgdGhpcmRTZWN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMkdcIik7XG4gICAgbGV0IHNldFRoaXJkU3F1YXJlcyA9IHRoaXJkU2VjdGlvbi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic3F1YXJlXCIpO1xuICAgIGxldCBzZXRUaGlyZFNxQXJyYXkgPSBBcnJheS5mcm9tKHNldFRoaXJkU3F1YXJlcyk7Ly9jb252ZXJ0IHRvIGFycmF5XG5cbiAgICBsZXQgZm91cnRoU2VjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDJUXCIpO1xuICAgIGxldCBzZXRGb3VydGhTcXVhcmVzID0gZm91cnRoU2VjdGlvbi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic3F1YXJlXCIpO1xuICAgIGxldCBzZXRGb3VydGhTcUFycmF5ID0gQXJyYXkuZnJvbShzZXRGb3VydGhTcXVhcmVzKTsvL2NvbnZlcnQgdG8gYXJyYXlcblxuICAgIGZ1bmN0aW9uIHNldENvbHVtbnMoc29tZUFycmF5LCBuYW1lKSB7XG5cbiAgICAgICAgbGV0IGxldHRlck51bWJBcnIgPSBbJ2VtcHR5JywnQScsJ0InLCdDJywnRCcsJ0UnLCdGJywnRycsJ0gnLCdJJywnSiddO1xuICAgICAgICBsZXQgajAgPSAwO1xuICAgICAgICBsZXQgajEgPSAwO1xuICAgICAgICBsZXQgajIgPSAwO1xuICAgICAgICBsZXQgajMgPSAwO1xuICAgICAgICBsZXQgajQgPSAwO1xuICAgICAgICBsZXQgajUgPSAwO1xuICAgICAgICBsZXQgajYgPSAwO1xuICAgICAgICBsZXQgajcgPSAwO1xuICAgICAgICBsZXQgajggPSAwO1xuICAgICAgICBsZXQgajkgPSAwO1xuICAgICAgICBsZXQgajEwID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzb21lQXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpJTExID09PSAwKSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzBdfWA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFyclswXX0ke1tqMF19X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgajArKztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5jbGFzc05hbWUgPSBgc3F1YXJlICR7bGV0dGVyTnVtYkFyclsxXX1gO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFyclsxXX0ke1tqMV19X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGoxKys7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGklMTEgPT09IDIpIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbMl19YDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLnNldEF0dHJpYnV0ZShcImlkXCIsIGAke2xldHRlck51bWJBcnJbMl19JHtbajJdfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqMisrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmIChpJTExID09PSAzKSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzNdfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzNdfSR7W2ozXX1fYCtuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgajMrKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gNCkge1xuICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5jbGFzc05hbWUgPSBgc3F1YXJlICR7bGV0dGVyTnVtYkFycls0XX1gO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFycls0XX0ke1tqNF19X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGo0Kys7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGklMTEgPT09IDUpIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbNV19YDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLnNldEF0dHJpYnV0ZShcImlkXCIsIGAke2xldHRlck51bWJBcnJbNV19JHtbajVdfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqNSsrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmIChpJTExID09PSA2KSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzZdfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzZdfSR7W2o2XX1fYCtuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgajYrKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gNykge1xuICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5jbGFzc05hbWUgPSBgc3F1YXJlICR7bGV0dGVyTnVtYkFycls3XX1gO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFycls3XX0ke1tqN119X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGo3Kys7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGklMTEgPT09IDgpIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbOF19YDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLnNldEF0dHJpYnV0ZShcImlkXCIsIGAke2xldHRlck51bWJBcnJbOF19JHtbajhdfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqOCsrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmIChpJTExID09PSA5KSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzldfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzldfSR7W2o5XX1fYCtuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgajkrKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gMTApIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbMTBdfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzEwXX0ke1tqMTBdfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqMTArKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRDb2x1bW5zKHNldFNxQXJyYXksIFwiZmlyc3RPbmVcIik7XG4gICAgc2V0Q29sdW1ucyhzZXRTZWNvbmRTcUFycmF5LCBcInNlY29uZE9uZVwiKTtcbiAgICBzZXRDb2x1bW5zKHNldFRoaXJkU3FBcnJheSwgXCJ0aGlyZE9uZVwiKTtcbiAgICBzZXRDb2x1bW5zKHNldEZvdXJ0aFNxQXJyYXksIFwiZm91cnRoT25lXCIpO1xuXG4gICAgXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwbGFjZVNoaXBzRE9NKGFycmF5LCBwbGF5ZXIsIFAxLCBQMikgey8vYXJyYXkgZnJvbSBwbGF5ZXJQbGFjZVNoaXBTcGFuXG4gICAgaWYgKHBsYXllciA9PT0gUDEpIHtcbiAgICAgICAgYXJyYXkuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBsZXQgc3RyID0gZWxbMF07XG4gICAgICAgICAgICBsZXQgc3BlY2lmaWNTcUZvdW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7c3RyfV9maXJzdE9uZWApO1xuICAgICAgICAgICAgc3BlY2lmaWNTcUZvdW5kLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiYmx1ZVwiO1xuICAgICAgICB9KVxuICAgIH0gZWxzZSBpZiAocGxheWVyID09PSBQMikge1xuICAgICAgICBhcnJheS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGxldCBzdHIgPSBlbFswXTtcbiAgICAgICAgICAgIGxldCBzcGVjaWZpY1NxRm91bmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtzdHJ9X3RoaXJkT25lYCk7XG4gICAgICAgICAgICBzcGVjaWZpY1NxRm91bmQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJncmVlblwiO1xuICAgICAgICB9KVxuICAgIH1cbiAgICBcbn0gIFxuXG4vKiBleHBvcnQgZnVuY3Rpb24gdW5kb0hvdmVyRE9NKGFycmF5LCBwbGF5ZXIsIFAxLCBQMikge1xuICAgIGlmIChwbGF5ZXIgPT09IFAxKSB7XG4gICAgICAgIGFycmF5LmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgbGV0IHN0ciA9IGVsWzBdO1xuICAgICAgICAgICAgbGV0IHNwZWNpZmljU3FGb3VuZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGAke3N0cn1fZmlyc3RPbmVgKTtcbiAgICAgICAgICAgIHNwZWNpZmljU3FGb3VuZC5zdHlsZS5vcGFjaXR5ID0gXCIwLjhcIjtcbiAgICAgICAgfSlcbiAgICB9IGVsc2UgaWYgKHBsYXllciA9PT0gUDIpIHtcbiAgICAgICAgYXJyYXkuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBsZXQgc3RyID0gZWxbMF07XG4gICAgICAgICAgICBsZXQgc3BlY2lmaWNTcUZvdW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7c3RyfV90aGlyZE9uZWApO1xuICAgICAgICAgICAgc3BlY2lmaWNTcUZvdW5kLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiZ3JlZW5cIjtcbiAgICAgICAgfSlcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBob3ZlclNoaXBzRE9NKGFycmF5LCBwbGF5ZXIsIFAxLCBQMikgey8vYXJyYXkgZnJvbSBwbGF5ZXJQbGFjZVNoaXBTcGFuXG4gICAgaWYgKHBsYXllciA9PT0gUDEpIHtcbiAgICAgICAgYXJyYXkuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBsZXQgc3RyID0gZWxbMF07XG4gICAgICAgICAgICBsZXQgc3BlY2lmaWNTcUZvdW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7c3RyfV9maXJzdE9uZWApO1xuICAgICAgICAgICAgc3BlY2lmaWNTcUZvdW5kLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwibGlnaHRibHVlXCI7XG4gICAgICAgICAgICBzcGVjaWZpY1NxRm91bmQuc3R5bGUub3BhY2l0eSA9IFwiMVwiO1xuICAgICAgICB9KVxuICAgIH0gZWxzZSBpZiAocGxheWVyID09PSBQMikge1xuICAgICAgICBhcnJheS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGxldCBzdHIgPSBlbFswXTtcbiAgICAgICAgICAgIGxldCBzcGVjaWZpY1NxRm91bmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtzdHJ9X3RoaXJkT25lYCk7XG4gICAgICAgICAgICBzcGVjaWZpY1NxRm91bmQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJncmVlblwiO1xuICAgICAgICB9KVxuICAgIH1cbiAgICBcbn0gICAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZmlsbFNxdWFyZURPTShzdHIsIGhpdE9yTWlzcywgcGxheWVyLCBQMSwgUDIpIHsvL2lucHV0IHN0cmluZyBvZiBjb29yZFxuICAgIGlmIChwbGF5ZXIgPT09IFAxKSB7XG4gICAgICAgIGxldCBzcVRvQ2hhbmdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7c3RyfV9zZWNvbmRPbmVgKTtcbiAgICAgICAgaWYgKGhpdE9yTWlzcyA9PT0gXCJtaXNzXCIpIHtcbiAgICAgICAgICAgIHNxVG9DaGFuZ2Uuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJ3aGl0ZVwiO1xuICAgICAgICB9IGVsc2UgaWYgKGhpdE9yTWlzcyA9PT0gXCJoaXRzXCIpIHtcbiAgICAgICAgICAgIHNxVG9DaGFuZ2Uuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJkYXJrb3JhbmdlXCI7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHBsYXllciA9PT0gUDIpIHtcbiAgICAgICAgbGV0IHNxVG9DaGFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtzdHJ9X2ZvdXJ0aE9uZWApO1xuICAgICAgICBpZiAoaGl0T3JNaXNzID09PSBcIm1pc3NcIikge1xuICAgICAgICAgICAgc3FUb0NoYW5nZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIndoaXRlXCI7XG4gICAgICAgIH0gZWxzZSBpZiAoaGl0T3JNaXNzID09PSBcImhpdHNcIikge1xuICAgICAgICAgICAgc3FUb0NoYW5nZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcImRhcmtvcmFuZ2VcIjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNoaXBTdW5rRE9NKHN0ciwgcGxheWVyLCBQMSwgUDIpIHsvL2lucHV0IHN0cmluZyBjb29yZFxuICAgIGlmIChwbGF5ZXIgPT09IFAxKSB7IFxuICAgICAgICBsZXQgc3FUb1NpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtzdHJ9X3NlY29uZE9uZWApO1xuICAgICAgICBzcVRvU2luay5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcImJsYWNrXCI7XG4gICAgfSBlbHNlIGlmIChwbGF5ZXIgPT09IFAyKSB7XG5cbiAgICAgICAgbGV0IHNxVG9TaW5rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7c3RyfV9mb3VydGhPbmVgKTtcbiAgICAgICAgc3FUb1Npbmsuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJibGFja1wiO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNocmlua093bkJvYXJkKHBsYXllciwgUDEsIFAyKSB7XG4gICAgaWYgKHBsYXllciA9PT0gUDEpIHtcbiAgICAgICAgbGV0IGJvYXJkVG9TaHJpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAxR1wiKTtcbiAgICAgICAgYm9hcmRUb1Nocmluay5zdHlsZS53aWR0aCA9IFwiNjAlXCI7XG4gICAgfSBlbHNlIGlmIChwbGF5ZXIgPT09IFAyKSB7XG4gICAgICAgIGxldCBib2FyZFRvU2hyaW5rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMkdcIik7XG4gICAgICAgIGJvYXJkVG9TaHJpbmsuc3R5bGUud2lkdGggPSBcIjYwJVwiO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhpZGVDb21wQm9hcmQoKSB7XG5cbiAgICBmdW5jdGlvbiByYW5kb21Db2xvcihicmlnaHRuZXNzKXtcbiAgICAgICAgZnVuY3Rpb24gcmFuZG9tQ2hhbm5lbChicmlnaHRuZXNzKXtcbiAgICAgICAgICB2YXIgciA9IDI1NS1icmlnaHRuZXNzO1xuICAgICAgICAgIHZhciBuID0gMHwoKE1hdGgucmFuZG9tKCkgKiByKSArIGJyaWdodG5lc3MpO1xuICAgICAgICAgIHZhciBzID0gbi50b1N0cmluZygxNik7XG4gICAgICAgICAgcmV0dXJuIChzLmxlbmd0aD09MSkgPyAnMCcrcyA6IHM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcjJyArIHJhbmRvbUNoYW5uZWwoYnJpZ2h0bmVzcykgKyByYW5kb21DaGFubmVsKGJyaWdodG5lc3MpICsgcmFuZG9tQ2hhbm5lbChicmlnaHRuZXNzKTtcbiAgICB9XG5cbiAgICBsZXQgY29tcEdhbWVCb2FyZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDJHXCIpO1xuICAgIGxldCBjaGlsZE5vZGVzID0gY29tcEdhbWVCb2FyZC5jaGlsZE5vZGVzO1xuICAgIGxldCBhcnJheSA9IEFycmF5LmZyb20oY2hpbGROb2Rlcyk7XG4gICAgYXJyYXkuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgbGV0IG5ld0NvbG9yID0gcmFuZG9tQ29sb3IoMTI1KTtcbiAgICAgICAgbm9kZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBgJHtuZXdDb2xvcn1gO1xuICAgIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldERPTSgpIHtcbiAgICBsZXQgZmlyc3ROb2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMUdcIik7XG4gICAgbGV0IHNlY29uZE5vZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAxVFwiKTtcbiAgICBsZXQgdGhpcmROb2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMkdcIik7XG4gICAgbGV0IGZvdXJ0aE5vZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAyVFwiKTtcbiAgICB3aGlsZSAoZmlyc3ROb2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgZmlyc3ROb2RlLnJlbW92ZUNoaWxkKGZpcnN0Tm9kZS5sYXN0Q2hpbGQpO1xuICAgIH1cbiAgICB3aGlsZSAoc2Vjb25kTm9kZS5maXJzdENoaWxkKSB7XG4gICAgICAgIHNlY29uZE5vZGUucmVtb3ZlQ2hpbGQoc2Vjb25kTm9kZS5sYXN0Q2hpbGQpO1xuICAgIH1cbiAgICB3aGlsZSAodGhpcmROb2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgdGhpcmROb2RlLnJlbW92ZUNoaWxkKHRoaXJkTm9kZS5sYXN0Q2hpbGQpO1xuICAgIH1cbiAgICB3aGlsZSAoZm91cnRoTm9kZS5maXJzdENoaWxkKSB7XG4gICAgICAgIGZvdXJ0aE5vZGUucmVtb3ZlQ2hpbGQoZm91cnRoTm9kZS5sYXN0Q2hpbGQpO1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==