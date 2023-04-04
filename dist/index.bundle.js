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
___CSS_LOADER_EXPORT___.push([module.id, "html, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed, \nfigure, figcaption, footer, header, hgroup, \nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\tfont-size: 100%;\n\tfont: inherit;\n\tvertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure, \nfooter, header, hgroup, menu, nav, section {\n\tdisplay: block;\n}\nbody {\n\tline-height: 1;\n}\nol, ul {\n\tlist-style: none;\n}\nblockquote, q {\n\tquotes: none;\n}\nblockquote:before, blockquote:after,\nq:before, q:after {\n\tcontent: '';\n\tcontent: none;\n}\ntable {\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}\n\n:root {\n    --primary: #ff6fb2; \n    --secondary: #c3195d; \n    --tertiary: #680747; \n    --quaternary: #141010; \n}\n\nhtml, body, div#content {\n    height: 100%;\n    width: 100%;\n    font-size: 15px;\n}\n\ndiv#p1Seperator {\n\tbackground-color: var(--primary);\n}\ndiv#p2Seperator {\n\tbackground-color:aqua;\n}\n\ndiv#P1G, div#P2G {\n\twidth: 60%;\n\tmargin: auto;\n}\n\ndiv.gameboard {\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\tborder: 3px solid pink;\n}\n\n.descriptor {\n\tfont-family: 'Space Grotesk', sans-serif;\n\tfont-size: 1.2rem;\n\tpadding: 0.5rem;\n\ttext-align: center;\n}\n\nbutton#newGameBtn {\n\tbackground-color: #c3195d;\n\tcolor:bisque;\n\tposition: absolute;\n\ttop: 5px;\n\tright: 5px;\n\tdisplay: none;\n}\n\ndiv#aboutHolder {\n\tdisplay: none;\n\tposition: fixed;\n\ttop: 0;\n\tright: 0;\n\tbottom: 0;\n\tleft: 0;\n\tbackground: rgba(0,0,0,.8);\n\tz-index: 12;\n}\n\ndiv#aboutBtn {\n\tposition: absolute;\n\tdisplay: block;\n\ttop: 5px;\n\tleft: 5px;\n\tbackground: var(--secondary);\n    color: bisque;\n    border-radius: 50%;\n    width: 40px;\n    height: 40px;\n    line-height: 40px;\n    text-align: center;\n    font-size: 20px;\n\topacity: 0.8;\n\tz-index: 22;\n}\n\ndiv#aboutBtn:hover {\n\tbackground-color: #ff7300;\n}\n\ndiv#about {\n\tdisplay: none;\n\tpadding: 3rem;\n\twidth: 50%;\n\theight: 50%;\n\tbackground: #ffaa65;\n\tposition: absolute;\n\tborder: 5px groove gray;\n\tflex-direction: column;\n\ttop: 0;\n\tright: 0;\n\tbottom: 0;\n\tleft: 0;\n\tmargin: auto;\n\ttext-align: center;\n\tfont-size: 1.7rem;\n\talign-content: center;\n\tjustify-content: center;\n\tcolor: rgb(56, 53, 53);\n\tz-index: 15;\n}\n\ndiv.colorCode {\n\tdisplay: flex;\n\tflex-direction: row;\n\tjustify-content: center;\n}\n\nspan.colorWhite {\n\tcolor: white;\n}\nspan.colorBlack {\n\tcolor: black;\n}\nspan.colorOrange {\n\tcolor: darkorange;\n}\n\ndiv#doneWithShips {\n\tbackground-color: #680747;\n\tcolor:bisque;\n\tborder: 2px inset gray;\n\tfont-size: 1.0rem;\n\tposition: absolute;\n\tleft: 5px;\n\tpadding: 4px;\n\ttop: 65px;\n\t/* display: none; */\n}\n\ndiv#axisToggle {\n\tbackground-color: #c3195d;\n\tborder: 2px inset gray;\n\tfont-size: 1.0rem;\n\tcolor:bisque;\n\tposition: absolute;\n\tpadding: 4px;\n\ttop: 31px;\n\tleft: 5px;\n\t/* display: none; */\n}\n\ndiv#topBar {\n\tposition: relative;\n}\n\ndiv[class^=\"square\"] {\n\tposition: relative;\n\tflex-basis: calc(9% - 10px);\n\tmargin: 5px;\n\tborder: 1px solid;\n\tbox-sizing: border-box;\n}\n\ndiv[class^=\"square\"]::before {\n\tcontent: '';\n\tdisplay: block;\n\tpadding-top: 100%;\n}\n\ndiv[class^=\"square\"] .contentz {\n\tposition: absolute;\n\ttop: 0; left: 0;\n\theight: 100%;\n\twidth: 100%;\n  \n\tdisplay: flex;               /* added for centered text */\n\tjustify-content: center;     /* added for centered text */\n\talign-items: center;         /* added for centered text */\n}\n\n/* \ndiv#content {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(2, 40%);\n\tgrid-template-rows: repeat(2, 40%);\n}\n\ndiv.gameboard {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(11, 8%);\n\tgrid-template-rows: repeat(11, 8%);\n}\n\ndiv[class^=\"square\"] {\n\tbackground-color: rgb(184, 184, 184);\n\tborder: 1px solid black;\n\topacity: 0.5;\n\taspect-ratio: 1;\n} */\n\n/* loading/spinner stuff */\n\ndiv#lengthIndicator {\n\t/* display: none; */\n\tdisplay: flex;\n\tjustify-content: left;\n\talign-items: center;\n\tgap: 0.5rem;\n\tfont-size: 1.1rem;\n\tposition: absolute;\n\ttop: 5px;\n\tleft: 5px;\n}\n\ninput#lengthInput {\n\twidth: 25%;\n}\n\ndiv#promptPlacingP1 {\n\t/* display: none; */\n\tposition: absolute;\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\twidth: 14%;\n\ttop: 5px;\n\tright: 8px;\n}\n\ndiv#battleStart {\n\tfont-size: 1.3rem;\n\tdisplay: none;\n\tposition: absolute;\n\twidth: 14%;\n\ttop: 5px;\n\tright: 5px;\n}\n\n#loader {\n\tdisplay: none;\n\ttop: 50%;\n\tleft: 50%;\n\tposition: absolute;\n\ttransform: translate(-50%, -50%);\n}\n  \n.loading {\n\tborder: 8px solid rgb(220, 0, 0);\n\twidth: 60px;\n\theight: 60px;\n\tborder-radius: 50%;\n\tborder-top-color: #ff6320;\n\tborder-left-color: #ff7300;\n\tanimation: spin 1s infinite ease-in;\n}\n  \n@keyframes spin {\n\t0% {\n\t  transform: rotate(0deg);\n\t}\n  \n\t100% {\n\t  transform: rotate(360deg);\n\t}\n}\n\na:link {\n\tcolor: white;\n\ttext-decoration: none;\n}\n\na:visited {\t\n\tcolor: white;\n\ttext-decoration: none;\n}\n\na:hover {\t\n\tcolor: white;\n\ttext-decoration: none;\n\tcolor: purple;\n}\n\na:active {\t\n\tcolor: white;\n\ttext-decoration: none;\n}\n\n@media screen and (min-width: 800px) {\n\thtml, body, div#content {\n\t  font-size: 15px;\n\t}\n\n\tbody {\n\t\tdisplay: flex;\n\t\tjustify-content: center;\n\t\tbackground-color: var(--tertiary);\n\t}\n\n\tdiv#content {\n\t\twidth: 60%;\n\t\theight: 85%;\n\t}\n\tdiv#P1T, div#P2T {\n\t\twidth: 85%;\n\t\tmargin: auto;\n\t}\n\n\tdiv#axisToggle {\n\t\t\n\t\ttop: 37px;\n\t\t/* display: none; */\n\t}\n\n\tdiv#doneWithShips {\n\t\ttop: 75px;\n\t}\n}\n\n@media screen and (min-width: 1250px) {\n\tdiv#content {\n\t\twidth: 50%;\n\t\theight: 65%;\n\t}\n\tdiv#P1G, div#P2G {\n\t\twidth: 50%;\n\t\tmargin: auto;\n\t}\n\tdiv#P1T, div#P2T {\n\t\twidth: 70%;\n\t\tmargin: auto;\n\t}\n}", "",{"version":3,"sources":["webpack://./src/style.css"],"names":[],"mappings":"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","sourcesContent":["html, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed, \nfigure, figcaption, footer, header, hgroup, \nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\tfont-size: 100%;\n\tfont: inherit;\n\tvertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure, \nfooter, header, hgroup, menu, nav, section {\n\tdisplay: block;\n}\nbody {\n\tline-height: 1;\n}\nol, ul {\n\tlist-style: none;\n}\nblockquote, q {\n\tquotes: none;\n}\nblockquote:before, blockquote:after,\nq:before, q:after {\n\tcontent: '';\n\tcontent: none;\n}\ntable {\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}\n\n:root {\n    --primary: #ff6fb2; \n    --secondary: #c3195d; \n    --tertiary: #680747; \n    --quaternary: #141010; \n}\n\nhtml, body, div#content {\n    height: 100%;\n    width: 100%;\n    font-size: 15px;\n}\n\ndiv#p1Seperator {\n\tbackground-color: var(--primary);\n}\ndiv#p2Seperator {\n\tbackground-color:aqua;\n}\n\ndiv#P1G, div#P2G {\n\twidth: 60%;\n\tmargin: auto;\n}\n\ndiv.gameboard {\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\tborder: 3px solid pink;\n}\n\n.descriptor {\n\tfont-family: 'Space Grotesk', sans-serif;\n\tfont-size: 1.2rem;\n\tpadding: 0.5rem;\n\ttext-align: center;\n}\n\nbutton#newGameBtn {\n\tbackground-color: #c3195d;\n\tcolor:bisque;\n\tposition: absolute;\n\ttop: 5px;\n\tright: 5px;\n\tdisplay: none;\n}\n\ndiv#aboutHolder {\n\tdisplay: none;\n\tposition: fixed;\n\ttop: 0;\n\tright: 0;\n\tbottom: 0;\n\tleft: 0;\n\tbackground: rgba(0,0,0,.8);\n\tz-index: 12;\n}\n\ndiv#aboutBtn {\n\tposition: absolute;\n\tdisplay: block;\n\ttop: 5px;\n\tleft: 5px;\n\tbackground: var(--secondary);\n    color: bisque;\n    border-radius: 50%;\n    width: 40px;\n    height: 40px;\n    line-height: 40px;\n    text-align: center;\n    font-size: 20px;\n\topacity: 0.8;\n\tz-index: 22;\n}\n\ndiv#aboutBtn:hover {\n\tbackground-color: #ff7300;\n}\n\ndiv#about {\n\tdisplay: none;\n\tpadding: 3rem;\n\twidth: 50%;\n\theight: 50%;\n\tbackground: #ffaa65;\n\tposition: absolute;\n\tborder: 5px groove gray;\n\tflex-direction: column;\n\ttop: 0;\n\tright: 0;\n\tbottom: 0;\n\tleft: 0;\n\tmargin: auto;\n\ttext-align: center;\n\tfont-size: 1.7rem;\n\talign-content: center;\n\tjustify-content: center;\n\tcolor: rgb(56, 53, 53);\n\tz-index: 15;\n}\n\ndiv.colorCode {\n\tdisplay: flex;\n\tflex-direction: row;\n\tjustify-content: center;\n}\n\nspan.colorWhite {\n\tcolor: white;\n}\nspan.colorBlack {\n\tcolor: black;\n}\nspan.colorOrange {\n\tcolor: darkorange;\n}\n\ndiv#doneWithShips {\n\tbackground-color: #680747;\n\tcolor:bisque;\n\tborder: 2px inset gray;\n\tfont-size: 1.0rem;\n\tposition: absolute;\n\tleft: 5px;\n\tpadding: 4px;\n\ttop: 65px;\n\t/* display: none; */\n}\n\ndiv#axisToggle {\n\tbackground-color: #c3195d;\n\tborder: 2px inset gray;\n\tfont-size: 1.0rem;\n\tcolor:bisque;\n\tposition: absolute;\n\tpadding: 4px;\n\ttop: 31px;\n\tleft: 5px;\n\t/* display: none; */\n}\n\ndiv#topBar {\n\tposition: relative;\n}\n\ndiv[class^=\"square\"] {\n\tposition: relative;\n\tflex-basis: calc(9% - 10px);\n\tmargin: 5px;\n\tborder: 1px solid;\n\tbox-sizing: border-box;\n}\n\ndiv[class^=\"square\"]::before {\n\tcontent: '';\n\tdisplay: block;\n\tpadding-top: 100%;\n}\n\ndiv[class^=\"square\"] .contentz {\n\tposition: absolute;\n\ttop: 0; left: 0;\n\theight: 100%;\n\twidth: 100%;\n  \n\tdisplay: flex;               /* added for centered text */\n\tjustify-content: center;     /* added for centered text */\n\talign-items: center;         /* added for centered text */\n}\n\n/* \ndiv#content {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(2, 40%);\n\tgrid-template-rows: repeat(2, 40%);\n}\n\ndiv.gameboard {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(11, 8%);\n\tgrid-template-rows: repeat(11, 8%);\n}\n\ndiv[class^=\"square\"] {\n\tbackground-color: rgb(184, 184, 184);\n\tborder: 1px solid black;\n\topacity: 0.5;\n\taspect-ratio: 1;\n} */\n\n/* loading/spinner stuff */\n\ndiv#lengthIndicator {\n\t/* display: none; */\n\tdisplay: flex;\n\tjustify-content: left;\n\talign-items: center;\n\tgap: 0.5rem;\n\tfont-size: 1.1rem;\n\tposition: absolute;\n\ttop: 5px;\n\tleft: 5px;\n}\n\ninput#lengthInput {\n\twidth: 25%;\n}\n\ndiv#promptPlacingP1 {\n\t/* display: none; */\n\tposition: absolute;\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\twidth: 14%;\n\ttop: 5px;\n\tright: 8px;\n}\n\ndiv#battleStart {\n\tfont-size: 1.3rem;\n\tdisplay: none;\n\tposition: absolute;\n\twidth: 14%;\n\ttop: 5px;\n\tright: 5px;\n}\n\n#loader {\n\tdisplay: none;\n\ttop: 50%;\n\tleft: 50%;\n\tposition: absolute;\n\ttransform: translate(-50%, -50%);\n}\n  \n.loading {\n\tborder: 8px solid rgb(220, 0, 0);\n\twidth: 60px;\n\theight: 60px;\n\tborder-radius: 50%;\n\tborder-top-color: #ff6320;\n\tborder-left-color: #ff7300;\n\tanimation: spin 1s infinite ease-in;\n}\n  \n@keyframes spin {\n\t0% {\n\t  transform: rotate(0deg);\n\t}\n  \n\t100% {\n\t  transform: rotate(360deg);\n\t}\n}\n\na:link {\n\tcolor: white;\n\ttext-decoration: none;\n}\n\na:visited {\t\n\tcolor: white;\n\ttext-decoration: none;\n}\n\na:hover {\t\n\tcolor: white;\n\ttext-decoration: none;\n\tcolor: purple;\n}\n\na:active {\t\n\tcolor: white;\n\ttext-decoration: none;\n}\n\n@media screen and (min-width: 800px) {\n\thtml, body, div#content {\n\t  font-size: 15px;\n\t}\n\n\tbody {\n\t\tdisplay: flex;\n\t\tjustify-content: center;\n\t\tbackground-color: var(--tertiary);\n\t}\n\n\tdiv#content {\n\t\twidth: 60%;\n\t\theight: 85%;\n\t}\n\tdiv#P1T, div#P2T {\n\t\twidth: 85%;\n\t\tmargin: auto;\n\t}\n\n\tdiv#axisToggle {\n\t\t\n\t\ttop: 37px;\n\t\t/* display: none; */\n\t}\n\n\tdiv#doneWithShips {\n\t\ttop: 75px;\n\t}\n}\n\n@media screen and (min-width: 1250px) {\n\tdiv#content {\n\t\twidth: 50%;\n\t\theight: 65%;\n\t}\n\tdiv#P1G, div#P2G {\n\t\twidth: 50%;\n\t\tmargin: auto;\n\t}\n\tdiv#P1T, div#P2T {\n\t\twidth: 70%;\n\t\tmargin: auto;\n\t}\n}"],"sourceRoot":""}]);
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
const aboutButton = document.getElementById("aboutBtn");
const aboutContent = document.getElementById("about");
const aboutBackground = document.getElementById("aboutHolder");

aboutButton.addEventListener('click', e => {
    if (aboutButton.innerHTML === "?") {
        aboutBackground.style.display = "block";
        aboutContent.style.display = "flex";
        aboutButton.innerHTML = "X";
    } else {
        aboutBackground.style.display = "none";
        aboutContent.style.display = "none";
        aboutButton.innerHTML = "?";
    }
})

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LFVBQVUsWUFBWSxhQUFhLFdBQVcsV0FBVyxVQUFVLE1BQU0sS0FBSyxZQUFZLE9BQU8sS0FBSyxVQUFVLFVBQVUsVUFBVSxVQUFVLFlBQVksYUFBYSxhQUFhLGFBQWEsV0FBVyxVQUFVLFVBQVUsVUFBVSxVQUFVLFlBQVksYUFBYSxhQUFhLGFBQWEsYUFBYSxXQUFXLE1BQU0sS0FBSyxVQUFVLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxLQUFLLEtBQUssVUFBVSxLQUFLLEtBQUssWUFBWSxPQUFPLEtBQUssWUFBWSxXQUFXLFlBQVksYUFBYSxhQUFhLFdBQVcsVUFBVSxVQUFVLFlBQVksT0FBTyxLQUFLLFlBQVksYUFBYSxhQUFhLFdBQVcsWUFBWSxXQUFXLFVBQVUsVUFBVSxZQUFZLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxZQUFZLGFBQWEsV0FBVyxZQUFZLGFBQWEsT0FBTyxLQUFLLFVBQVUsVUFBVSxZQUFZLE9BQU8sS0FBSyxZQUFZLHFCQUFxQixVQUFVLFdBQVcsd0JBQXdCLHlCQUF5Qix5QkFBeUIsT0FBTyxzQkFBc0IsT0FBTyxhQUFhLE1BQU0sWUFBWSxXQUFXLFlBQVksYUFBYSxXQUFXLFlBQVksYUFBYSxXQUFXLFVBQVUsTUFBTSxLQUFLLFVBQVUsTUFBTSxLQUFLLFlBQVksYUFBYSxXQUFXLFVBQVUsVUFBVSxVQUFVLFVBQVUsTUFBTSxLQUFLLFlBQVksV0FBVyxZQUFZLFdBQVcsVUFBVSxVQUFVLE1BQU0sS0FBSyxVQUFVLFVBQVUsVUFBVSxZQUFZLGFBQWEsT0FBTyxLQUFLLFlBQVksV0FBVyxVQUFVLFlBQVksYUFBYSxhQUFhLGFBQWEsT0FBTyxLQUFLLEtBQUssWUFBWSxPQUFPLEtBQUssWUFBWSxNQUFNLE1BQU0sS0FBSyxVQUFVLFlBQVksT0FBTyxLQUFLLFVBQVUsWUFBWSxPQUFPLEtBQUssVUFBVSxZQUFZLFdBQVcsTUFBTSxLQUFLLFVBQVUsWUFBWSxPQUFPLEtBQUssS0FBSyxVQUFVLE9BQU8sS0FBSyxVQUFVLFlBQVksYUFBYSxPQUFPLEtBQUssVUFBVSxVQUFVLEtBQUssS0FBSyxVQUFVLFVBQVUsTUFBTSxNQUFNLFVBQVUsWUFBWSxPQUFPLEtBQUssVUFBVSxLQUFLLE1BQU0sS0FBSyxLQUFLLFVBQVUsVUFBVSxLQUFLLEtBQUssVUFBVSxVQUFVLEtBQUssS0FBSyxVQUFVLFVBQVUsS0FBSyxtaEJBQW1oQixjQUFjLGVBQWUsY0FBYyxvQkFBb0Isa0JBQWtCLDZCQUE2QixHQUFHLGdKQUFnSixtQkFBbUIsR0FBRyxRQUFRLG1CQUFtQixHQUFHLFVBQVUscUJBQXFCLEdBQUcsaUJBQWlCLGlCQUFpQixHQUFHLDJEQUEyRCxnQkFBZ0Isa0JBQWtCLEdBQUcsU0FBUyw4QkFBOEIsc0JBQXNCLEdBQUcsV0FBVywwQkFBMEIsNEJBQTRCLDJCQUEyQiw2QkFBNkIsR0FBRyw2QkFBNkIsbUJBQW1CLGtCQUFrQixzQkFBc0IsR0FBRyxxQkFBcUIscUNBQXFDLEdBQUcsbUJBQW1CLDBCQUEwQixHQUFHLHNCQUFzQixlQUFlLGlCQUFpQixHQUFHLG1CQUFtQixrQkFBa0Isb0JBQW9CLDJCQUEyQixHQUFHLGlCQUFpQiw2Q0FBNkMsc0JBQXNCLG9CQUFvQix1QkFBdUIsR0FBRyx1QkFBdUIsOEJBQThCLGlCQUFpQix1QkFBdUIsYUFBYSxlQUFlLGtCQUFrQixHQUFHLHFCQUFxQixrQkFBa0Isb0JBQW9CLFdBQVcsYUFBYSxjQUFjLFlBQVksK0JBQStCLGdCQUFnQixHQUFHLGtCQUFrQix1QkFBdUIsbUJBQW1CLGFBQWEsY0FBYyxpQ0FBaUMsb0JBQW9CLHlCQUF5QixrQkFBa0IsbUJBQW1CLHdCQUF3Qix5QkFBeUIsc0JBQXNCLGlCQUFpQixnQkFBZ0IsR0FBRyx3QkFBd0IsOEJBQThCLEdBQUcsZUFBZSxrQkFBa0Isa0JBQWtCLGVBQWUsZ0JBQWdCLHdCQUF3Qix1QkFBdUIsNEJBQTRCLDJCQUEyQixXQUFXLGFBQWEsY0FBYyxZQUFZLGlCQUFpQix1QkFBdUIsc0JBQXNCLDBCQUEwQiw0QkFBNEIsMkJBQTJCLGdCQUFnQixHQUFHLG1CQUFtQixrQkFBa0Isd0JBQXdCLDRCQUE0QixHQUFHLHFCQUFxQixpQkFBaUIsR0FBRyxtQkFBbUIsaUJBQWlCLEdBQUcsb0JBQW9CLHNCQUFzQixHQUFHLHVCQUF1Qiw4QkFBOEIsaUJBQWlCLDJCQUEyQixzQkFBc0IsdUJBQXVCLGNBQWMsaUJBQWlCLGNBQWMsc0JBQXNCLEtBQUssb0JBQW9CLDhCQUE4QiwyQkFBMkIsc0JBQXNCLGlCQUFpQix1QkFBdUIsaUJBQWlCLGNBQWMsY0FBYyxzQkFBc0IsS0FBSyxnQkFBZ0IsdUJBQXVCLEdBQUcsNEJBQTRCLHVCQUF1QixnQ0FBZ0MsZ0JBQWdCLHNCQUFzQiwyQkFBMkIsR0FBRyxvQ0FBb0MsZ0JBQWdCLG1CQUFtQixzQkFBc0IsR0FBRyxzQ0FBc0MsdUJBQXVCLFlBQVksUUFBUSxpQkFBaUIsZ0JBQWdCLHFDQUFxQyw4REFBOEQsOERBQThELGdDQUFnQyxzQkFBc0Isa0JBQWtCLDBDQUEwQyx1Q0FBdUMsR0FBRyxtQkFBbUIsa0JBQWtCLDBDQUEwQyx1Q0FBdUMsR0FBRyw0QkFBNEIseUNBQXlDLDRCQUE0QixpQkFBaUIsb0JBQW9CLElBQUksMERBQTBELHNCQUFzQixvQkFBb0IsMEJBQTBCLHdCQUF3QixnQkFBZ0Isc0JBQXNCLHVCQUF1QixhQUFhLGNBQWMsR0FBRyx1QkFBdUIsZUFBZSxHQUFHLHlCQUF5QixzQkFBc0IseUJBQXlCLGtCQUFrQixvQkFBb0IsZUFBZSxhQUFhLGVBQWUsR0FBRyxxQkFBcUIsc0JBQXNCLGtCQUFrQix1QkFBdUIsZUFBZSxhQUFhLGVBQWUsR0FBRyxhQUFhLGtCQUFrQixhQUFhLGNBQWMsdUJBQXVCLHFDQUFxQyxHQUFHLGdCQUFnQixxQ0FBcUMsZ0JBQWdCLGlCQUFpQix1QkFBdUIsOEJBQThCLCtCQUErQix3Q0FBd0MsR0FBRyx1QkFBdUIsUUFBUSw4QkFBOEIsS0FBSyxjQUFjLGdDQUFnQyxLQUFLLEdBQUcsWUFBWSxpQkFBaUIsMEJBQTBCLEdBQUcsZUFBZSxtQkFBbUIsMEJBQTBCLEdBQUcsYUFBYSxtQkFBbUIsMEJBQTBCLGtCQUFrQixHQUFHLGNBQWMsbUJBQW1CLDBCQUEwQixHQUFHLDBDQUEwQyw2QkFBNkIsc0JBQXNCLEtBQUssWUFBWSxvQkFBb0IsOEJBQThCLHdDQUF3QyxLQUFLLG1CQUFtQixpQkFBaUIsa0JBQWtCLEtBQUssc0JBQXNCLGlCQUFpQixtQkFBbUIsS0FBSyxzQkFBc0Isc0JBQXNCLHdCQUF3QixPQUFPLHlCQUF5QixnQkFBZ0IsS0FBSyxHQUFHLDJDQUEyQyxpQkFBaUIsaUJBQWlCLGtCQUFrQixLQUFLLHNCQUFzQixpQkFBaUIsbUJBQW1CLEtBQUssc0JBQXNCLGlCQUFpQixtQkFBbUIsS0FBSyxHQUFHLG1CQUFtQjtBQUNqcGU7QUFDQSxpRUFBZSx1QkFBdUIsRUFBQzs7Ozs7Ozs7Ozs7O0FDUDFCOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxREFBcUQ7QUFDckQ7QUFDQTtBQUNBLGdEQUFnRDtBQUNoRDtBQUNBO0FBQ0EscUZBQXFGO0FBQ3JGO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixpQkFBaUI7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLHFCQUFxQjtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVixzRkFBc0YscUJBQXFCO0FBQzNHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVixpREFBaUQscUJBQXFCO0FBQ3RFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVixzREFBc0QscUJBQXFCO0FBQzNFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDcEZhOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1REFBdUQsY0FBYztBQUNyRTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2RBLE1BQStGO0FBQy9GLE1BQXFGO0FBQ3JGLE1BQTRGO0FBQzVGLE1BQStHO0FBQy9HLE1BQXdHO0FBQ3hHLE1BQXdHO0FBQ3hHLE1BQW1HO0FBQ25HO0FBQ0E7O0FBRUE7O0FBRUEsNEJBQTRCLHFHQUFtQjtBQUMvQyx3QkFBd0Isa0hBQWE7O0FBRXJDLHVCQUF1Qix1R0FBYTtBQUNwQztBQUNBLGlCQUFpQiwrRkFBTTtBQUN2Qiw2QkFBNkIsc0dBQWtCOztBQUUvQyxhQUFhLDBHQUFHLENBQUMsc0ZBQU87Ozs7QUFJNkM7QUFDckUsT0FBTyxpRUFBZSxzRkFBTyxJQUFJLDZGQUFjLEdBQUcsNkZBQWMsWUFBWSxFQUFDOzs7Ozs7Ozs7Ozs7QUMxQmhFOztBQUViO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQix3QkFBd0I7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsaUJBQWlCO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsNEJBQTRCO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsNkJBQTZCO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQ25GYTs7QUFFYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDakNhOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDVGE7O0FBRWI7QUFDQTtBQUNBLGNBQWMsS0FBd0MsR0FBRyxzQkFBaUIsR0FBRyxDQUFJO0FBQ2pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDVGE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrREFBa0Q7QUFDbEQ7QUFDQTtBQUNBLDBDQUEwQztBQUMxQztBQUNBO0FBQ0E7QUFDQSxpRkFBaUY7QUFDakY7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSx5REFBeUQ7QUFDekQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDNURhOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7OztBQ2JxQjtBQUNrQjtBQUNRO0FBQ0E7QUFDRjtBQUNHO0FBQ047QUFDSzs7QUFFL0MsWUFBWSxtQkFBTyxDQUFDLCtCQUFhO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBOztBQUVBO0FBQ0EsSUFBSSx5REFBUyxHQUFHO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsMkNBQTJDO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBLGNBQWM7QUFDZDtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx3QkFBd0IsNERBQWE7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLG9CQUFvQjtBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLDREQUFhO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5Qjs7QUFFekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDOztBQUV0QztBQUNBO0FBQ0E7QUFDQSx5Q0FBeUM7O0FBRXpDO0FBQ0E7QUFDQTtBQUNBLG1FQUFtRTtBQUNuRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDOztBQUV0QztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxzREFBc0Q7O0FBRXREO0FBQ0E7QUFDQSwyQ0FBMkM7OztBQUczQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQSxjQUFjO0FBQ2Q7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLDREQUFhO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRCxlQUFlO0FBQy9ELDZEQUE2RCxZQUFZO0FBQ3pFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDLDBEQUFXO0FBQzNDLDZCQUE2QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBEQUEwRDs7QUFFMUQsd0JBQXdCLDREQUFhLEdBQUc7QUFDeEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekIscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0EsY0FBYztBQUNkO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQiw0REFBYTtBQUNqQztBQUNBO0FBQ0E7QUFDQSwyREFBMkQ7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsNERBQWE7QUFDckI7QUFDQTtBQUNBO0FBQ0EsK0NBQStDO0FBQy9DO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEI7QUFDOUI7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLHVEQUFRO0FBQ1o7QUFDQTtBQUNBLENBQUM7O0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoYmU7O0FBRWY7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLFFBQVE7QUFDaEMsNEJBQTRCLFFBQVE7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtDQUErQyxFQUFFO0FBQ2pEO0FBQ0E7QUFDQSwrQ0FBK0MsaUJBQWlCO0FBQ2hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSw0Q0FBNEM7O0FBRTVDO0FBQ0E7QUFDQSx3REFBd0Q7O0FBRXhEO0FBQ0E7QUFDQSxzREFBc0Q7O0FBRXREO0FBQ0E7QUFDQSx3REFBd0Q7O0FBRXhEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixzQkFBc0I7QUFDOUM7QUFDQSxtREFBbUQsaUJBQWlCO0FBQ3BFO0FBQ0EsbURBQW1ELGlCQUFpQixFQUFFLEtBQUs7QUFDM0U7QUFDQSxjQUFjO0FBQ2QsbURBQW1ELGlCQUFpQjtBQUNwRTtBQUNBLHVEQUF1RCxpQkFBaUIsRUFBRSxLQUFLO0FBQy9FO0FBQ0E7QUFDQSxjQUFjO0FBQ2QsbURBQW1ELGlCQUFpQjtBQUNwRTtBQUNBLHVEQUF1RCxpQkFBaUIsRUFBRSxLQUFLO0FBQy9FO0FBQ0E7QUFDQSxjQUFjO0FBQ2QsbURBQW1ELGlCQUFpQjtBQUNwRTtBQUNBLHVEQUF1RCxpQkFBaUIsRUFBRSxLQUFLO0FBQy9FO0FBQ0E7QUFDQSxjQUFjO0FBQ2QsbURBQW1ELGlCQUFpQjtBQUNwRTtBQUNBLHVEQUF1RCxpQkFBaUIsRUFBRSxLQUFLO0FBQy9FO0FBQ0E7QUFDQSxjQUFjO0FBQ2QsbURBQW1ELGlCQUFpQjtBQUNwRTtBQUNBLHVEQUF1RCxpQkFBaUIsRUFBRSxLQUFLO0FBQy9FO0FBQ0E7QUFDQSxjQUFjO0FBQ2QsbURBQW1ELGlCQUFpQjtBQUNwRTtBQUNBLHVEQUF1RCxpQkFBaUIsRUFBRSxLQUFLO0FBQy9FO0FBQ0E7QUFDQSxjQUFjO0FBQ2QsbURBQW1ELGlCQUFpQjtBQUNwRTtBQUNBLHVEQUF1RCxpQkFBaUIsRUFBRSxLQUFLO0FBQy9FO0FBQ0E7QUFDQSxjQUFjO0FBQ2QsbURBQW1ELGlCQUFpQjtBQUNwRTtBQUNBLHVEQUF1RCxpQkFBaUIsRUFBRSxLQUFLO0FBQy9FO0FBQ0E7QUFDQSxjQUFjO0FBQ2QsbURBQW1ELGlCQUFpQjtBQUNwRTtBQUNBLHVEQUF1RCxpQkFBaUIsRUFBRSxLQUFLO0FBQy9FO0FBQ0E7QUFDQSxjQUFjO0FBQ2QsbURBQW1ELGtCQUFrQjtBQUNyRTtBQUNBLHVEQUF1RCxrQkFBa0IsRUFBRSxNQUFNO0FBQ2pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFTywrQ0FBK0M7QUFDdEQ7QUFDQTtBQUNBO0FBQ0EsNkRBQTZELElBQUk7QUFDakU7QUFDQSxTQUFTO0FBQ1QsTUFBTTtBQUNOO0FBQ0E7QUFDQSw2REFBNkQsSUFBSTtBQUNqRTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2REFBNkQsSUFBSTtBQUNqRTtBQUNBLFNBQVM7QUFDVCxNQUFNO0FBQ047QUFDQTtBQUNBLDZEQUE2RCxJQUFJO0FBQ2pFO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUEsc0RBQXNEO0FBQ3REO0FBQ0E7QUFDQTtBQUNBLDZEQUE2RCxJQUFJO0FBQ2pFO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsTUFBTTtBQUNOO0FBQ0E7QUFDQSw2REFBNkQsSUFBSTtBQUNqRTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsSUFBSTs7QUFFRyx3REFBd0Q7QUFDL0Q7QUFDQSxvREFBb0QsSUFBSTtBQUN4RDtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxNQUFNO0FBQ04sb0RBQW9ELElBQUk7QUFDeEQ7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFTywyQ0FBMkM7QUFDbEQ7QUFDQSxrREFBa0QsSUFBSTtBQUN0RDtBQUNBLE1BQU07O0FBRU4sa0RBQWtELElBQUk7QUFDdEQ7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBOztBQUVPOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLFNBQVM7QUFDakQsS0FBSztBQUNMOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL2xvZ2ljLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL3NyYy9zdHlsZS5jc3MiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9zcmMvc3R5bGUuY3NzPzcxNjMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vc3JjL2xvZ2ljdG9kby5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBTaGlwID0gKG51bSwgaWQpID0+IHtcbiAgICBsZXQgbGVuZ3RoID0gbnVtO1xuICAgIGxldCBoaXRzID0gMDtcbiAgICBsZXQgc3Vua09yTm90ID0gZmFsc2U7XG4gICAgbGV0IHNoaXBJRCA9IGlkO1xuICAgIFxuICAgIGNvbnN0IGdldExlbmd0aCA9ICgpID0+IGxlbmd0aDtcbiAgICBjb25zdCBoaXQgPSAoKSA9PiBoaXRzID0gaGl0cyArIDE7XG4gICAgY29uc3QgZ2V0SGl0cyA9ICgpID0+IGhpdHM7XG4gICAgY29uc3QgaXNTdW5rID0gKCkgPT4ge1xuICAgICAgICBpZiAoaGl0cyA9PT0gbGVuZ3RoKSB7Ly93aWxsIG5lZWQgdG8gbWFrZSBzdXJlIHRoZXkgY2FuIG9ubHkgZ2V0IGhpdCBPTkNFIHBlciBjb29yZGluYXRlIHNwYW5cbiAgICAgICAgICAgIHN1bmtPck5vdCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzdW5rT3JOb3Q7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbGVuZ3RoLCBzdW5rT3JOb3QsIHNoaXBJRCwgaGl0cyxcbiAgICAgICAgZ2V0TGVuZ3RoLFxuICAgICAgICBnZXRIaXRzLFxuICAgICAgICBoaXQsXG4gICAgICAgIGlzU3VuayxcbiAgICB9O1xufTtcblxuY29uc3QgR2FtZWJvYXJkID0gKCkgPT4ge1xuICAgIGxldCBib2FyZCA9IHt9O1xuICAgIGxldCBzaGlwQ291bnQgPSAwOy8vY291bnRzICMgb2Ygc2hpcHMgdG90YWwgQU5EIHRvIGdlbiBJRFxuICAgIGxldCBsZXR0ZXJOdW1iQXJyID0gWydBJywnQicsJ0MnLCdEJywnRScsJ0YnLCdHJywnSCcsJ0knLCdKJ107XG4gICAgbGV0IG1pc3NlZFNob3RzID0gW107XG4gICAgbGV0IHNob3RzSGl0ID0gW107XG4gICAgbGV0IHNoaXBzU3RpbGxVcCA9IDA7XG4gICAgLy9pZGVhbGx5IHN0YXJ0IHdpdGggMTAgLS0gZm91ciAxcywgdGhyZWUgMnMsIHR3byAzcywgb25lIDRcblxuICAgIGNvbnN0IGJ1aWxkQm9hcmQgPSAoKSA9PiB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCAxMDsgaisrKSB7XG4gICAgICAgICAgICAgICAgYm9hcmRbYCR7bGV0dGVyTnVtYkFycltpXX0ke1tqKzFdfWBdID0gXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGdldFNoaXBzQWxpdmVDb3VudCA9ICgpID0+IHNoaXBzU3RpbGxVcDtcblxuICAgIGNvbnN0IGFyZUFsbFN1bmsgPSAoKSA9PiB7XG4gICAgICAgIGlmIChnZXRTaGlwc0FsaXZlQ291bnQoKSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY29uc3QgbWFrZVNoaXAgPSAobGVuZ3RoKSA9PiB7XG4gICAgICAgIGxldCBuZXdTaGlwID0gU2hpcChsZW5ndGgsIHNoaXBDb3VudCk7XG4gICAgICAgIHNoaXBDb3VudCsrO1xuICAgICAgICBzaGlwc1N0aWxsVXArKztcbiAgICAgICAgcmV0dXJuIG5ld1NoaXA7XG4gICAgfVxuICAgIGNvbnN0IGZpbmRTcGFuID0gKGNvb3JkaW5hdGVzLCBsZW5ndGgsIGF4aXMpID0+IHsvL2Nvb3JkIHR5cGUgU3RyaW5nXG4gICAgICAgIGxldCBhcnJheSA9IFtdO1xuICAgICAgICBsZXQgeVZhbHVlU3RhcnQgPSBudWxsO1xuICAgICAgICBsZXQgeEluZGV4U3RhcnQgPSBudWxsO1xuICAgICAgICAvL2NoYW5nZSBpbnB1dCBjb29yZGluYXRlcyBpbnRvIGFycmF5OyBBMiB0byBbQV1bMl1cbiAgICAgICAgbGV0IGNvb3JkQXJyID0gY29vcmRpbmF0ZXMuc3BsaXQoJycpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiY29vcmRBcnIgaW4gZmluZFNwYW4gaXMgXCIsIGNvb3JkQXJyKTtcbiAgICAgICAgeEluZGV4U3RhcnQgPSBmaW5kWEluZGV4KGNvb3JkaW5hdGVzKTtcbiAgICAgICAgaWYgKGNvb3JkQXJyLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgeVZhbHVlU3RhcnQgPSBOdW1iZXIoY29vcmRBcnJbMV0uY29uY2F0KGNvb3JkQXJyWzJdKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHlWYWx1ZVN0YXJ0ID0gTnVtYmVyKGNvb3JkQXJyWzFdKTtcbiAgICAgICAgfVxuICAgICAgICAvL2NvbnNvbGUubG9nKFwieVZhbHVlU3RhcnQgaW4gZmluZFNwYW4gaXMgXCIsIHlWYWx1ZVN0YXJ0KTtcbiAgICAgICAgaWYgKGxlbmd0aCA9PT0gMSkgey8vY2FzZSBsZW5ndGggPT09IDFcbiAgICAgICAgICAgIGFycmF5LnB1c2goW2Nvb3JkQXJyWzBdK2Nvb3JkQXJyWzFdXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoYXhpcyA9PT0gXCJob3Jpem9udGFsXCIpIHsvL2Nhc2UgbGVuZ3RoID4gMVxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHhTcGFuQXJyYXkgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29vcmRBcnIubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4U3BhbkFycmF5ID0gW2xldHRlck51bWJBcnJbeEluZGV4U3RhcnQraV0rY29vcmRBcnJbMV0rY29vcmRBcnJbMl1dO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgeFNwYW5BcnJheSA9IFtsZXR0ZXJOdW1iQXJyW3hJbmRleFN0YXJ0K2ldK2Nvb3JkQXJyWzFdXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBhcnJheS5wdXNoKHhTcGFuQXJyYXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBhcnJheS5wdXNoKFtjb29yZEFyclswXSsoeVZhbHVlU3RhcnQraSldKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgfVxuICAgIGNvbnN0IGZpbmRYSW5kZXggPSAoY29vcmRTdHIpID0+IHsvL2lucHV0IHN0cmluZ1xuICAgICAgICBsZXQgY29vcmRBcnIgPSBjb29yZFN0ci5zcGxpdCgnJyk7Ly9leDogJ0EyJyAtPiBbJ0EnLCAnMiddXG4gICAgICAgIGxldCB4U3RhcnQgPSBsZXR0ZXJOdW1iQXJyLmluZGV4T2YoYCR7Y29vcmRBcnJbMF19YCk7XG4gICAgICAgIHJldHVybiB4U3RhcnQ7Ly9vdXRwdXQgbnVtYmVyXG4gICAgfVxuXG4gICAgY29uc3Qgbm9TaGlwT3ZlcmxhcCA9IChhcnJheSkgPT4gey8vZXg6IFtbXCJBOFwiXSxbXCJCOFwiXV1cbiAgICAgICAgbGV0IGJvb2xlYW4gPSBudWxsO1xuICAgICAgICBsZXQgbGVuZ3RoID0gYXJyYXkubGVuZ3RoIC0gMTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBhcnJUb1N0cmluZyA9IGFycmF5W2ldLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBpZiAoYm9hcmRbYCR7YXJyVG9TdHJpbmd9YF0gIT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICBib29sZWFuID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJvb2xlYW4gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBib29sZWFuO1xuICAgIH1cblxuICAgIGNvbnN0IHBsYWNlU2hpcCA9IChwb3NpdGlvbiwgbGVuZ3RoLCBheGlzKSA9PiB7Ly9wb3NpdGlvbiBzdHJpbmdcbiAgICAgICAgbGV0IHhJbmRleFN0YXJ0ID0gZmluZFhJbmRleChwb3NpdGlvbik7XG4gICAgICAgIGxldCBjb29yZEFyciA9IHBvc2l0aW9uLnNwbGl0KCcnKTsvL2V4OiAnQTgnIC0+IFsnQScsICc4J11cbiAgICAgICAgbGV0IHlWYWx1ZVN0YXJ0ID0gTnVtYmVyKGNvb3JkQXJyWzFdKTtcblxuICAgICAgICAvKiBjb25zb2xlLmxvZyhcIlggXCIsICh4SW5kZXhTdGFydCsxKSsobGVuZ3RoLTEpKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJZIFwiLCB5VmFsdWVTdGFydCsobGVuZ3RoLTEpKTsgKi9cbiAgICAgICAgaWYgKGF4aXMgPT09IFwiaG9yaXpvbnRhbFwiICYmICh4SW5kZXhTdGFydCsxKSsobGVuZ3RoLTEpID4gMTApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2Fubm90IHBsYWNlIHNoaXAgb2ZmIGdhbWVib2FyZFwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChheGlzID09PSBcInZlcnRpY2FsXCIgJiYgeVZhbHVlU3RhcnQrKGxlbmd0aC0xKSA+IDEwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNhbm5vdCBwbGFjZSBzaGlwIG9mZiBnYW1lYm9hcmRcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHNoaXBTcGFuID0gZmluZFNwYW4ocG9zaXRpb24sIGxlbmd0aCwgYXhpcyk7Ly9bW1wiQTdcIl0sW1wiQThcIl1dXG4gICAgICAgIGlmIChub1NoaXBPdmVybGFwKHNoaXBTcGFuKSkge1xuICAgICAgICAgICAgbGV0IG5ld1NoaXAgPSBTaGlwKGxlbmd0aCwgc2hpcENvdW50KTtcbiAgICAgICAgICAgIHNoaXBTcGFuLmZvckVhY2goYXJyYXkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBhcnJUb1N0cmluZyA9IGFycmF5LnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgYm9hcmRbYCR7YXJyVG9TdHJpbmd9YF0gPSBuZXdTaGlwO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHNoaXBDb3VudCsrO1xuICAgICAgICAgICAgc2hpcHNTdGlsbFVwKys7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU29ycnksIHRoZXJlJ3MgYSBzaGlwIGluIHRoZSB3YXkhXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcmVjZWl2ZUF0dGFjayA9ICh0YXJnZXRDb29yKSA9PiB7Ly9hc3N1bWVzIHlvdSBcbiAgICAgICAgLy9DQU4nVCByZS1hdHRhY2sgYSBwb3NpdGlvbiB5b3UndmUgbWlzc2VkIE9SIGhpdCBhbHJlYWR5XG4gICAgICAgIGxldCB0YXJnZXRJbkFyciA9IFtbdGFyZ2V0Q29vcl1dO1xuICAgICAgICBpZiAobm9TaGlwT3ZlcmxhcCh0YXJnZXRJbkFycikgPT09IHRydWUpIHsvL2NoZWNrcyBpZiBzaGlwIGlzIHRoZXJlXG4gICAgICAgICAgICAvL2lmIFRSVUUsIG1lYW5zIG5vdGhpbmcgaXMgdGhlcmVcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTm8gc2hpcCB3YXMgaGl0LiBOaWNlIHRyeSFcIik7XG4gICAgICAgICAgICBtaXNzZWRTaG90cy5wdXNoKHRhcmdldENvb3IpO1xuICAgICAgICB9IGVsc2UgaWYgKG5vU2hpcE92ZXJsYXAodGFyZ2V0SW5BcnIpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgbGV0IHNoaXBGb3VuZCA9IGJvYXJkW2Ake3RhcmdldENvb3J9YF07XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkdyZWF0IHNob3QhIFlvdSBsYW5kZWQgYSBoaXQuXCIpO1xuICAgICAgICAgICAgc2hpcEZvdW5kLmhpdCgpO1xuICAgICAgICAgICAgaWYgKHNoaXBGb3VuZC5nZXRIaXRzKCkgPT09IHNoaXBGb3VuZC5nZXRMZW5ndGgoKSkge1xuICAgICAgICAgICAgICAgIHNoaXBzU3RpbGxVcC0tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgYm9hcmQsbWlzc2VkU2hvdHMsc2hvdHNIaXQsc2hpcENvdW50LFxuICAgICAgICBtYWtlU2hpcCxcbiAgICAgICAgYnVpbGRCb2FyZCxcbiAgICAgICAgcGxhY2VTaGlwLFxuICAgICAgICBmaW5kU3BhbixcbiAgICAgICAgZmluZFhJbmRleCxcbiAgICAgICAgbm9TaGlwT3ZlcmxhcCxcbiAgICAgICAgcmVjZWl2ZUF0dGFjayxcbiAgICAgICAgZ2V0U2hpcHNBbGl2ZUNvdW50LFxuICAgICAgICBhcmVBbGxTdW5rLFxuICAgIH07XG59XG5cbmNvbnN0IFBsYXllciA9IChuYW1lKSA9PiB7Ly9hc3N1bWUgbmFtZXMgaW5wdXR0ZWQgYXJlIFVOSVFVRVxuICAgIFxuICAgIGxldCBpZCA9IG5hbWU7XG4gICAgbGV0IG93bkJvYXJkID0gR2FtZWJvYXJkKCk7XG4gICAgb3duQm9hcmQuYnVpbGRCb2FyZCgpO1xuICAgIGxldCBsZXR0ZXJOdW1iQXJyID0gWydBJywnQicsJ0MnLCdEJywnRScsJ0YnLCdHJywnSCcsJ0knLCdKJ107XG4gICAgbGV0IHBsYXllckJvYXJkID0gb3duQm9hcmQuYm9hcmQ7XG4gICAgbGV0IGFpckJhbGxzID0gb3duQm9hcmQubWlzc2VkU2hvdHM7Ly9ieSB0aGUgb3Bwb3NpbmcgcGxheWVyXG5cbiAgICBsZXQgdGFyZ2V0Qm9hcmQgPSBHYW1lYm9hcmQoKTtcbiAgICB0YXJnZXRCb2FyZC5idWlsZEJvYXJkKCk7XG4gICAgbGV0IG9wcG9Cb2FyZCA9IHRhcmdldEJvYXJkLmJvYXJkO1xuICAgIGxldCBteU1pc3NlcyA9IHRhcmdldEJvYXJkLm1pc3NlZFNob3RzO1xuICAgIGxldCBteUhpdHMgPSB0YXJnZXRCb2FyZC5zaG90c0hpdDtcblxuICAgIGNvbnN0IGdldFNoaXBGb3JPcHAgPSAoY29vcmQpID0+IHtcbiAgICAgICAgbGV0IGZvdW5kU2hpcCA9IHBsYXllckJvYXJkW2Ake2Nvb3JkfWBdO1xuICAgICAgICByZXR1cm4gZm91bmRTaGlwO1xuICAgIH1cbiAgICBjb25zdCBwbGF5ZXJQbGFjZSA9IChwb3NpdGlvbiwgbGVuZ3RoLCBheGlzKSA9PiB7XG4gICAgICAgIC8vc3RyaW5nICdCMycsIG51bWJlciAzLCBzdHJpbmcgJ2hvcml6b250YWwnLyd2ZXJ0aWNhbCdcbiAgICAgICAgb3duQm9hcmQucGxhY2VTaGlwKHBvc2l0aW9uLCBsZW5ndGgsIGF4aXMpO1xuICAgIH1cblxuICAgIGNvbnN0IHBsYXllclBsYWNlU2hpcFNwYW4gPSAocG9zaXRpb24sIGxlbmd0aCwgYXhpcykgPT4ge1xuICAgICAgICByZXR1cm4gb3duQm9hcmQuZmluZFNwYW4ocG9zaXRpb24sIGxlbmd0aCwgYXhpcyk7XG4gICAgfVxuXG4gICAgY29uc3QgcGxheWVyQ2hlY2tPdmVybGFwID0gKGFycikgPT4ge1xuICAgICAgICByZXR1cm4gb3duQm9hcmQubm9TaGlwT3ZlcmxhcChhcnIpO1xuICAgIH1cblxuICAgIGNvbnN0IGRpZEF0a01pc3MgPSAoY29vcmQsIGdldEF0dGFja2VkKSA9PiB7XG4gICAgICAgIGlmIChteUhpdHMuaW5jbHVkZXMoYCR7Y29vcmR9YCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYWxyZWFkeSBzaG90IGhlcmUsIHBscyBzdG9wXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKG15TWlzc2VzLmluY2x1ZGVzKGAke2Nvb3JkfWApKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImFscmVhZHkgbWlzc2VkIGhlcmUsIGdvIGVsc2V3aGVyZVwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChnZXRBdHRhY2tlZChgJHtjb29yZH1gKSkgey8vaWYgaXQgcmV0dXJucyB0cnVlLCBtZWFucyBtaXNzZWRcbiAgICAgICAgICAgICAgICBteU1pc3Nlcy5wdXNoKGNvb3JkKTtcbiAgICAgICAgICAgICAgICBsZXQgc3RyID0gYG1pc3NfJHtjb29yZH1gO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG15SGl0cy5wdXNoKGNvb3JkKTtcbiAgICAgICAgICAgICAgICBsZXQgc3RyID0gYGhpdHNfJHtjb29yZH1gO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBnZXRBdHRhY2tlZCA9IChjb29yZCkgPT4ge1xuICAgICAgICBsZXQgc3RhcnRpbmdMZW5ndGggPSBhaXJCYWxscy5sZW5ndGg7XG4gICAgICAgIG93bkJvYXJkLnJlY2VpdmVBdHRhY2soY29vcmQpOy8vaWYgaXQncyBhIG1pc3MsIGFpckJhbGxzIGxlbmd0aCBzaG91bGQgaW5jcmVhc2UgYnkgMVxuICAgICAgICBpZiAoYWlyQmFsbHMubGVuZ3RoID4gc3RhcnRpbmdMZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHBsYXllclNoaXBDb3VudCA9ICgpID0+IG93bkJvYXJkLnNoaXBDb3VudDtcbiAgICBjb25zdCBzaGlwc1VwID0gKCkgPT4gb3duQm9hcmQuZ2V0U2hpcHNBbGl2ZUNvdW50KCk7XG4gICAgY29uc3QgYWxsU2hpcHNTdW5rID0gKCkgPT4ge1xuICAgICAgICBpZiAoc2hpcHNVcCgpID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL3RydWUgaWYgc2hpcENvdW50IGlzIDAsIGZhbHNlIGlmIG5vdFxuXG4gICAgLy8tLS0tY29tcHV0ZXIgbG9naWNcblxuXG4gICAgY29uc3QgcmFuZG9tQXRrQ2hvaWNlID0gKCkgPT4ge1xuICAgICAgICBsZXQgYm9vbEhvbGRlciA9IGZhbHNlO1xuICAgICAgICAvL3dhbnQgdG8gcGljayByYW5kb20gWCAmIFk7IGlmIE5PVCB3aXRoaW4gbXlIaXRzICYgbXlNaXNzZXMsIGdvIGFoZWFkXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGxldCBjb29yZCA9IHJhbmRvbVBvc2l0aW9uKCk7XG4gICAgICAgICAgICBpZiAoIW15SGl0cy5pbmNsdWRlcyhgJHtjb29yZH1gKSAmJiAhbXlNaXNzZXMuaW5jbHVkZXMoYCR7Y29vcmR9YCkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNQVSBwaWNrZWQgXCIsIGNvb3JkKTtcbiAgICAgICAgICAgICAgICBib29sSG9sZGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29vcmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gd2hpbGUgKCFib29sSG9sZGVyKSAgICAgICAgXG4gICAgfVxuICAgIGNvbnN0IGNvbXB1dGVyUGxhY2UgPSAobGVuZ3RoKSA9PiB7XG4gICAgICAgIC8vc3RyaW5nICdCMycsIG51bWJlciAzLCBzdHJpbmcgJ2hvcml6b250YWwnLyd2ZXJ0aWNhbCdcbiAgICAgICAgLyogbGV0IHBvc2l0aW9uID0gcmFuZG9tUG9zaXRpb24oKTtcbiAgICAgICAgbGV0IGF4aXMgPSByYW5kb21BeGlzKCk7Ki9cbiAgICAgICAgbGV0IGJvb2xIb2xkZXIgPSBmYWxzZTsgXG4gICAgICAgIGxldCBwb3NpdGlvbiA9IG51bGw7XG4gICAgICAgIGxldCBheGlzID0gbnVsbDtcblxuICAgICAgICAvKiBpZiAob3duQm9hcmQucGxhY2VTaGlwKHBvc2l0aW9uLCBsZW5ndGgsIGF4aXMpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgLy9tZWFuaW5nIGlmIGl0J3MgcGxhY2VkIG9mZiB0aGUgYm9hcmQgb3Igb3ZlcmxhcHBpbmdcbiAgICAgICAgICAgIC8vd2FudCB0byByZXJ1biB0aGlzIGZ1bmN0aW9uIGFnYWluXG4gICAgICAgIH0gKi9cblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInJhbiBhbm90aGVyIHBsYWNlbWVudCBieSB0aGUgY29tcFwiKTtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gcmFuZG9tUG9zaXRpb24oKTtcbiAgICAgICAgICAgIGF4aXMgPSByYW5kb21BeGlzKCk7XG4gICAgICAgICAgICBib29sSG9sZGVyID0gb3duQm9hcmQucGxhY2VTaGlwKHBvc2l0aW9uLCBsZW5ndGgsIGF4aXMpO1xuICAgICAgICB9IHdoaWxlICghYm9vbEhvbGRlcilcbiAgICAgICAgcmV0dXJuIFtwb3NpdGlvbiwgYXhpc107XG4gICAgICAgIFxuICAgIH1cbiAgICBjb25zdCByYW5kb21BeGlzID0gKCkgPT4ge1xuICAgICAgICBsZXQgY2hvc2VuQXhpcyA9IE1hdGgucmFuZG9tKCkgPCAwLjUgPyBcImhvcml6b250YWxcIiA6IFwidmVydGljYWxcIjtcbiAgICAgICAgcmV0dXJuIGNob3NlbkF4aXM7XG4gICAgfVxuICAgIGNvbnN0IHJhbmRvbVBvc2l0aW9uID0gKCkgPT4ge1xuICAgICAgICBsZXQgcmFuZG9tTnVtYjEgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMTApOy8vMC05XG4gICAgICAgIGxldCByYW5kb21OdW1iMiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSoxMCk7XG4gICAgICAgIC8vY29uc29sZS5sb2cobGV0dGVyTnVtYkFycik7XG4gICAgICAgIGxldCByYW5kb21YID0gbGV0dGVyTnVtYkFycltyYW5kb21OdW1iMV07XG4gICAgICAgIGxldCByYW5kb21ZID0gcmFuZG9tTnVtYjIgKyAxO1xuICAgICAgICByZXR1cm4gcmFuZG9tWCArIHJhbmRvbVkudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBpZCwgcGxheWVyQm9hcmQsIGFpckJhbGxzLCBvcHBvQm9hcmQsIG15TWlzc2VzLCBteUhpdHMsXG4gICAgICAgIGdldEF0dGFja2VkLCBkaWRBdGtNaXNzLCBwbGF5ZXJQbGFjZSwgY29tcHV0ZXJQbGFjZSwgcmFuZG9tQXRrQ2hvaWNlLCBzaGlwc1VwLCBhbGxTaGlwc1N1bmssICBwbGF5ZXJDaGVja092ZXJsYXAsIHBsYXllclBsYWNlU2hpcFNwYW4sIGdldFNoaXBGb3JPcHAsIHBsYXllclNoaXBDb3VudCxcbiAgICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7IFxuICAgIFNoaXA6IFNoaXAsXG4gICAgR2FtZWJvYXJkOiBHYW1lYm9hcmQsXG4gICAgUGxheWVyOiBQbGF5ZXIsXG59ICIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiaHRtbCwgYm9keSwgZGl2LCBzcGFuLCBhcHBsZXQsIG9iamVjdCwgaWZyYW1lLFxcbmgxLCBoMiwgaDMsIGg0LCBoNSwgaDYsIHAsIGJsb2NrcXVvdGUsIHByZSxcXG5hLCBhYmJyLCBhY3JvbnltLCBhZGRyZXNzLCBiaWcsIGNpdGUsIGNvZGUsXFxuZGVsLCBkZm4sIGVtLCBpbWcsIGlucywga2JkLCBxLCBzLCBzYW1wLFxcbnNtYWxsLCBzdHJpa2UsIHN0cm9uZywgc3ViLCBzdXAsIHR0LCB2YXIsXFxuYiwgdSwgaSwgY2VudGVyLFxcbmRsLCBkdCwgZGQsIG9sLCB1bCwgbGksXFxuZmllbGRzZXQsIGZvcm0sIGxhYmVsLCBsZWdlbmQsXFxudGFibGUsIGNhcHRpb24sIHRib2R5LCB0Zm9vdCwgdGhlYWQsIHRyLCB0aCwgdGQsXFxuYXJ0aWNsZSwgYXNpZGUsIGNhbnZhcywgZGV0YWlscywgZW1iZWQsIFxcbmZpZ3VyZSwgZmlnY2FwdGlvbiwgZm9vdGVyLCBoZWFkZXIsIGhncm91cCwgXFxubWVudSwgbmF2LCBvdXRwdXQsIHJ1YnksIHNlY3Rpb24sIHN1bW1hcnksXFxudGltZSwgbWFyaywgYXVkaW8sIHZpZGVvIHtcXG5cXHRtYXJnaW46IDA7XFxuXFx0cGFkZGluZzogMDtcXG5cXHRib3JkZXI6IDA7XFxuXFx0Zm9udC1zaXplOiAxMDAlO1xcblxcdGZvbnQ6IGluaGVyaXQ7XFxuXFx0dmVydGljYWwtYWxpZ246IGJhc2VsaW5lO1xcbn1cXG4vKiBIVE1MNSBkaXNwbGF5LXJvbGUgcmVzZXQgZm9yIG9sZGVyIGJyb3dzZXJzICovXFxuYXJ0aWNsZSwgYXNpZGUsIGRldGFpbHMsIGZpZ2NhcHRpb24sIGZpZ3VyZSwgXFxuZm9vdGVyLCBoZWFkZXIsIGhncm91cCwgbWVudSwgbmF2LCBzZWN0aW9uIHtcXG5cXHRkaXNwbGF5OiBibG9jaztcXG59XFxuYm9keSB7XFxuXFx0bGluZS1oZWlnaHQ6IDE7XFxufVxcbm9sLCB1bCB7XFxuXFx0bGlzdC1zdHlsZTogbm9uZTtcXG59XFxuYmxvY2txdW90ZSwgcSB7XFxuXFx0cXVvdGVzOiBub25lO1xcbn1cXG5ibG9ja3F1b3RlOmJlZm9yZSwgYmxvY2txdW90ZTphZnRlcixcXG5xOmJlZm9yZSwgcTphZnRlciB7XFxuXFx0Y29udGVudDogJyc7XFxuXFx0Y29udGVudDogbm9uZTtcXG59XFxudGFibGUge1xcblxcdGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7XFxuXFx0Ym9yZGVyLXNwYWNpbmc6IDA7XFxufVxcblxcbjpyb290IHtcXG4gICAgLS1wcmltYXJ5OiAjZmY2ZmIyOyBcXG4gICAgLS1zZWNvbmRhcnk6ICNjMzE5NWQ7IFxcbiAgICAtLXRlcnRpYXJ5OiAjNjgwNzQ3OyBcXG4gICAgLS1xdWF0ZXJuYXJ5OiAjMTQxMDEwOyBcXG59XFxuXFxuaHRtbCwgYm9keSwgZGl2I2NvbnRlbnQge1xcbiAgICBoZWlnaHQ6IDEwMCU7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBmb250LXNpemU6IDE1cHg7XFxufVxcblxcbmRpdiNwMVNlcGVyYXRvciB7XFxuXFx0YmFja2dyb3VuZC1jb2xvcjogdmFyKC0tcHJpbWFyeSk7XFxufVxcbmRpdiNwMlNlcGVyYXRvciB7XFxuXFx0YmFja2dyb3VuZC1jb2xvcjphcXVhO1xcbn1cXG5cXG5kaXYjUDFHLCBkaXYjUDJHIHtcXG5cXHR3aWR0aDogNjAlO1xcblxcdG1hcmdpbjogYXV0bztcXG59XFxuXFxuZGl2LmdhbWVib2FyZCB7XFxuXFx0ZGlzcGxheTogZmxleDtcXG5cXHRmbGV4LXdyYXA6IHdyYXA7XFxuXFx0Ym9yZGVyOiAzcHggc29saWQgcGluaztcXG59XFxuXFxuLmRlc2NyaXB0b3Ige1xcblxcdGZvbnQtZmFtaWx5OiAnU3BhY2UgR3JvdGVzaycsIHNhbnMtc2VyaWY7XFxuXFx0Zm9udC1zaXplOiAxLjJyZW07XFxuXFx0cGFkZGluZzogMC41cmVtO1xcblxcdHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuXFxuYnV0dG9uI25ld0dhbWVCdG4ge1xcblxcdGJhY2tncm91bmQtY29sb3I6ICNjMzE5NWQ7XFxuXFx0Y29sb3I6YmlzcXVlO1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHR0b3A6IDVweDtcXG5cXHRyaWdodDogNXB4O1xcblxcdGRpc3BsYXk6IG5vbmU7XFxufVxcblxcbmRpdiNhYm91dEhvbGRlciB7XFxuXFx0ZGlzcGxheTogbm9uZTtcXG5cXHRwb3NpdGlvbjogZml4ZWQ7XFxuXFx0dG9wOiAwO1xcblxcdHJpZ2h0OiAwO1xcblxcdGJvdHRvbTogMDtcXG5cXHRsZWZ0OiAwO1xcblxcdGJhY2tncm91bmQ6IHJnYmEoMCwwLDAsLjgpO1xcblxcdHotaW5kZXg6IDEyO1xcbn1cXG5cXG5kaXYjYWJvdXRCdG4ge1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHRkaXNwbGF5OiBibG9jaztcXG5cXHR0b3A6IDVweDtcXG5cXHRsZWZ0OiA1cHg7XFxuXFx0YmFja2dyb3VuZDogdmFyKC0tc2Vjb25kYXJ5KTtcXG4gICAgY29sb3I6IGJpc3F1ZTtcXG4gICAgYm9yZGVyLXJhZGl1czogNTAlO1xcbiAgICB3aWR0aDogNDBweDtcXG4gICAgaGVpZ2h0OiA0MHB4O1xcbiAgICBsaW5lLWhlaWdodDogNDBweDtcXG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xcbiAgICBmb250LXNpemU6IDIwcHg7XFxuXFx0b3BhY2l0eTogMC44O1xcblxcdHotaW5kZXg6IDIyO1xcbn1cXG5cXG5kaXYjYWJvdXRCdG46aG92ZXIge1xcblxcdGJhY2tncm91bmQtY29sb3I6ICNmZjczMDA7XFxufVxcblxcbmRpdiNhYm91dCB7XFxuXFx0ZGlzcGxheTogbm9uZTtcXG5cXHRwYWRkaW5nOiAzcmVtO1xcblxcdHdpZHRoOiA1MCU7XFxuXFx0aGVpZ2h0OiA1MCU7XFxuXFx0YmFja2dyb3VuZDogI2ZmYWE2NTtcXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0Ym9yZGVyOiA1cHggZ3Jvb3ZlIGdyYXk7XFxuXFx0ZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG5cXHR0b3A6IDA7XFxuXFx0cmlnaHQ6IDA7XFxuXFx0Ym90dG9tOiAwO1xcblxcdGxlZnQ6IDA7XFxuXFx0bWFyZ2luOiBhdXRvO1xcblxcdHRleHQtYWxpZ246IGNlbnRlcjtcXG5cXHRmb250LXNpemU6IDEuN3JlbTtcXG5cXHRhbGlnbi1jb250ZW50OiBjZW50ZXI7XFxuXFx0anVzdGlmeS1jb250ZW50OiBjZW50ZXI7XFxuXFx0Y29sb3I6IHJnYig1NiwgNTMsIDUzKTtcXG5cXHR6LWluZGV4OiAxNTtcXG59XFxuXFxuZGl2LmNvbG9yQ29kZSB7XFxuXFx0ZGlzcGxheTogZmxleDtcXG5cXHRmbGV4LWRpcmVjdGlvbjogcm93O1xcblxcdGp1c3RpZnktY29udGVudDogY2VudGVyO1xcbn1cXG5cXG5zcGFuLmNvbG9yV2hpdGUge1xcblxcdGNvbG9yOiB3aGl0ZTtcXG59XFxuc3Bhbi5jb2xvckJsYWNrIHtcXG5cXHRjb2xvcjogYmxhY2s7XFxufVxcbnNwYW4uY29sb3JPcmFuZ2Uge1xcblxcdGNvbG9yOiBkYXJrb3JhbmdlO1xcbn1cXG5cXG5kaXYjZG9uZVdpdGhTaGlwcyB7XFxuXFx0YmFja2dyb3VuZC1jb2xvcjogIzY4MDc0NztcXG5cXHRjb2xvcjpiaXNxdWU7XFxuXFx0Ym9yZGVyOiAycHggaW5zZXQgZ3JheTtcXG5cXHRmb250LXNpemU6IDEuMHJlbTtcXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0bGVmdDogNXB4O1xcblxcdHBhZGRpbmc6IDRweDtcXG5cXHR0b3A6IDY1cHg7XFxuXFx0LyogZGlzcGxheTogbm9uZTsgKi9cXG59XFxuXFxuZGl2I2F4aXNUb2dnbGUge1xcblxcdGJhY2tncm91bmQtY29sb3I6ICNjMzE5NWQ7XFxuXFx0Ym9yZGVyOiAycHggaW5zZXQgZ3JheTtcXG5cXHRmb250LXNpemU6IDEuMHJlbTtcXG5cXHRjb2xvcjpiaXNxdWU7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHBhZGRpbmc6IDRweDtcXG5cXHR0b3A6IDMxcHg7XFxuXFx0bGVmdDogNXB4O1xcblxcdC8qIGRpc3BsYXk6IG5vbmU7ICovXFxufVxcblxcbmRpdiN0b3BCYXIge1xcblxcdHBvc2l0aW9uOiByZWxhdGl2ZTtcXG59XFxuXFxuZGl2W2NsYXNzXj1cXFwic3F1YXJlXFxcIl0ge1xcblxcdHBvc2l0aW9uOiByZWxhdGl2ZTtcXG5cXHRmbGV4LWJhc2lzOiBjYWxjKDklIC0gMTBweCk7XFxuXFx0bWFyZ2luOiA1cHg7XFxuXFx0Ym9yZGVyOiAxcHggc29saWQ7XFxuXFx0Ym94LXNpemluZzogYm9yZGVyLWJveDtcXG59XFxuXFxuZGl2W2NsYXNzXj1cXFwic3F1YXJlXFxcIl06OmJlZm9yZSB7XFxuXFx0Y29udGVudDogJyc7XFxuXFx0ZGlzcGxheTogYmxvY2s7XFxuXFx0cGFkZGluZy10b3A6IDEwMCU7XFxufVxcblxcbmRpdltjbGFzc149XFxcInNxdWFyZVxcXCJdIC5jb250ZW50eiB7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHRvcDogMDsgbGVmdDogMDtcXG5cXHRoZWlnaHQ6IDEwMCU7XFxuXFx0d2lkdGg6IDEwMCU7XFxuICBcXG5cXHRkaXNwbGF5OiBmbGV4OyAgICAgICAgICAgICAgIC8qIGFkZGVkIGZvciBjZW50ZXJlZCB0ZXh0ICovXFxuXFx0anVzdGlmeS1jb250ZW50OiBjZW50ZXI7ICAgICAvKiBhZGRlZCBmb3IgY2VudGVyZWQgdGV4dCAqL1xcblxcdGFsaWduLWl0ZW1zOiBjZW50ZXI7ICAgICAgICAgLyogYWRkZWQgZm9yIGNlbnRlcmVkIHRleHQgKi9cXG59XFxuXFxuLyogXFxuZGl2I2NvbnRlbnQge1xcblxcdGRpc3BsYXk6IGdyaWQ7XFxuXFx0Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMiwgNDAlKTtcXG5cXHRncmlkLXRlbXBsYXRlLXJvd3M6IHJlcGVhdCgyLCA0MCUpO1xcbn1cXG5cXG5kaXYuZ2FtZWJvYXJkIHtcXG5cXHRkaXNwbGF5OiBncmlkO1xcblxcdGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDExLCA4JSk7XFxuXFx0Z3JpZC10ZW1wbGF0ZS1yb3dzOiByZXBlYXQoMTEsIDglKTtcXG59XFxuXFxuZGl2W2NsYXNzXj1cXFwic3F1YXJlXFxcIl0ge1xcblxcdGJhY2tncm91bmQtY29sb3I6IHJnYigxODQsIDE4NCwgMTg0KTtcXG5cXHRib3JkZXI6IDFweCBzb2xpZCBibGFjaztcXG5cXHRvcGFjaXR5OiAwLjU7XFxuXFx0YXNwZWN0LXJhdGlvOiAxO1xcbn0gKi9cXG5cXG4vKiBsb2FkaW5nL3NwaW5uZXIgc3R1ZmYgKi9cXG5cXG5kaXYjbGVuZ3RoSW5kaWNhdG9yIHtcXG5cXHQvKiBkaXNwbGF5OiBub25lOyAqL1xcblxcdGRpc3BsYXk6IGZsZXg7XFxuXFx0anVzdGlmeS1jb250ZW50OiBsZWZ0O1xcblxcdGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuXFx0Z2FwOiAwLjVyZW07XFxuXFx0Zm9udC1zaXplOiAxLjFyZW07XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHRvcDogNXB4O1xcblxcdGxlZnQ6IDVweDtcXG59XFxuXFxuaW5wdXQjbGVuZ3RoSW5wdXQge1xcblxcdHdpZHRoOiAyNSU7XFxufVxcblxcbmRpdiNwcm9tcHRQbGFjaW5nUDEge1xcblxcdC8qIGRpc3BsYXk6IG5vbmU7ICovXFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdGRpc3BsYXk6IGZsZXg7XFxuXFx0ZmxleC13cmFwOiB3cmFwO1xcblxcdHdpZHRoOiAxNCU7XFxuXFx0dG9wOiA1cHg7XFxuXFx0cmlnaHQ6IDhweDtcXG59XFxuXFxuZGl2I2JhdHRsZVN0YXJ0IHtcXG5cXHRmb250LXNpemU6IDEuM3JlbTtcXG5cXHRkaXNwbGF5OiBub25lO1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHR3aWR0aDogMTQlO1xcblxcdHRvcDogNXB4O1xcblxcdHJpZ2h0OiA1cHg7XFxufVxcblxcbiNsb2FkZXIge1xcblxcdGRpc3BsYXk6IG5vbmU7XFxuXFx0dG9wOiA1MCU7XFxuXFx0bGVmdDogNTAlO1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHR0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTtcXG59XFxuICBcXG4ubG9hZGluZyB7XFxuXFx0Ym9yZGVyOiA4cHggc29saWQgcmdiKDIyMCwgMCwgMCk7XFxuXFx0d2lkdGg6IDYwcHg7XFxuXFx0aGVpZ2h0OiA2MHB4O1xcblxcdGJvcmRlci1yYWRpdXM6IDUwJTtcXG5cXHRib3JkZXItdG9wLWNvbG9yOiAjZmY2MzIwO1xcblxcdGJvcmRlci1sZWZ0LWNvbG9yOiAjZmY3MzAwO1xcblxcdGFuaW1hdGlvbjogc3BpbiAxcyBpbmZpbml0ZSBlYXNlLWluO1xcbn1cXG4gIFxcbkBrZXlmcmFtZXMgc3BpbiB7XFxuXFx0MCUge1xcblxcdCAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XFxuXFx0fVxcbiAgXFxuXFx0MTAwJSB7XFxuXFx0ICB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpO1xcblxcdH1cXG59XFxuXFxuYTpsaW5rIHtcXG5cXHRjb2xvcjogd2hpdGU7XFxuXFx0dGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbn1cXG5cXG5hOnZpc2l0ZWQge1xcdFxcblxcdGNvbG9yOiB3aGl0ZTtcXG5cXHR0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxufVxcblxcbmE6aG92ZXIge1xcdFxcblxcdGNvbG9yOiB3aGl0ZTtcXG5cXHR0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxuXFx0Y29sb3I6IHB1cnBsZTtcXG59XFxuXFxuYTphY3RpdmUge1xcdFxcblxcdGNvbG9yOiB3aGl0ZTtcXG5cXHR0ZXh0LWRlY29yYXRpb246IG5vbmU7XFxufVxcblxcbkBtZWRpYSBzY3JlZW4gYW5kIChtaW4td2lkdGg6IDgwMHB4KSB7XFxuXFx0aHRtbCwgYm9keSwgZGl2I2NvbnRlbnQge1xcblxcdCAgZm9udC1zaXplOiAxNXB4O1xcblxcdH1cXG5cXG5cXHRib2R5IHtcXG5cXHRcXHRkaXNwbGF5OiBmbGV4O1xcblxcdFxcdGp1c3RpZnktY29udGVudDogY2VudGVyO1xcblxcdFxcdGJhY2tncm91bmQtY29sb3I6IHZhcigtLXRlcnRpYXJ5KTtcXG5cXHR9XFxuXFxuXFx0ZGl2I2NvbnRlbnQge1xcblxcdFxcdHdpZHRoOiA2MCU7XFxuXFx0XFx0aGVpZ2h0OiA4NSU7XFxuXFx0fVxcblxcdGRpdiNQMVQsIGRpdiNQMlQge1xcblxcdFxcdHdpZHRoOiA4NSU7XFxuXFx0XFx0bWFyZ2luOiBhdXRvO1xcblxcdH1cXG5cXG5cXHRkaXYjYXhpc1RvZ2dsZSB7XFxuXFx0XFx0XFxuXFx0XFx0dG9wOiAzN3B4O1xcblxcdFxcdC8qIGRpc3BsYXk6IG5vbmU7ICovXFxuXFx0fVxcblxcblxcdGRpdiNkb25lV2l0aFNoaXBzIHtcXG5cXHRcXHR0b3A6IDc1cHg7XFxuXFx0fVxcbn1cXG5cXG5AbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOiAxMjUwcHgpIHtcXG5cXHRkaXYjY29udGVudCB7XFxuXFx0XFx0d2lkdGg6IDUwJTtcXG5cXHRcXHRoZWlnaHQ6IDY1JTtcXG5cXHR9XFxuXFx0ZGl2I1AxRywgZGl2I1AyRyB7XFxuXFx0XFx0d2lkdGg6IDUwJTtcXG5cXHRcXHRtYXJnaW46IGF1dG87XFxuXFx0fVxcblxcdGRpdiNQMVQsIGRpdiNQMlQge1xcblxcdFxcdHdpZHRoOiA3MCU7XFxuXFx0XFx0bWFyZ2luOiBhdXRvO1xcblxcdH1cXG59XCIsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL3N0eWxlLmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQTs7Ozs7Ozs7Ozs7OztDQWFDLFNBQVM7Q0FDVCxVQUFVO0NBQ1YsU0FBUztDQUNULGVBQWU7Q0FDZixhQUFhO0NBQ2Isd0JBQXdCO0FBQ3pCO0FBQ0Es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ZHksIGRpdiwgc3BhbiwgYXBwbGV0LCBvYmplY3QsIGlmcmFtZSxcXG5oMSwgaDIsIGgzLCBoNCwgaDUsIGg2LCBwLCBibG9ja3F1b3RlLCBwcmUsXFxuYSwgYWJiciwgYWNyb255bSwgYWRkcmVzcywgYmlnLCBjaXRlLCBjb2RlLFxcbmRlbCwgZGZuLCBlbSwgaW1nLCBpbnMsIGtiZCwgcSwgcywgc2FtcCxcXG5zbWFsbCwgc3RyaWtlLCBzdHJvbmcsIHN1Yiwgc3VwLCB0dCwgdmFyLFxcbmIsIHUsIGksIGNlbnRlcixcXG5kbCwgZHQsIGRkLCBvbCwgdWwsIGxpLFxcbmZpZWxkc2V0LCBmb3JtLCBsYWJlbCwgbGVnZW5kLFxcbnRhYmxlLCBjYXB0aW9uLCB0Ym9keSwgdGZvb3QsIHRoZWFkLCB0ciwgdGgsIHRkLFxcbmFydGljbGUsIGFzaWRlLCBjYW52YXMsIGRldGFpbHMsIGVtYmVkLCBcXG5maWd1cmUsIGZpZ2NhcHRpb24sIGZvb3RlciwgaGVhZGVyLCBoZ3JvdXAsIFxcbm1lbnUsIG5hdiwgb3V0cHV0LCBydWJ5LCBzZWN0aW9uLCBzdW1tYXJ5LFxcbnRpbWUsIG1hcmssIGF1ZGlvLCB2aWRlbyB7XFxuXFx0bWFyZ2luOiAwO1xcblxcdHBhZGRpbmc6IDA7XFxuXFx0Ym9yZGVyOiAwO1xcblxcdGZvbnQtc2l6ZTogMTAwJTtcXG5cXHRmb250OiBpbmhlcml0O1xcblxcdHZlcnRpY2FsLWFsaWduOiBiYXNlbGluZTtcXG59XFxuLyogSFRNTDUgZGlzcGxheS1yb2xlIHJlc2V0IGZvciBvbGRlciBicm93c2VycyAqL1xcbmFydGljbGUsIGFzaWRlLCBkZXRhaWxzLCBmaWdjYXB0aW9uLCBmaWd1cmUsIFxcbmZvb3RlciwgaGVhZGVyLCBoZ3JvdXAsIG1lbnUsIG5hdiwgc2VjdGlvbiB7XFxuXFx0ZGlzcGxheTogYmxvY2s7XFxufVxcbmJvZHkge1xcblxcdGxpbmUtaGVpZ2h0OiAxO1xcbn1cXG5vbCwgdWwge1xcblxcdGxpc3Qtc3R5bGU6IG5vbmU7XFxufVxcbmJsb2NrcXVvdGUsIHEge1xcblxcdHF1b3Rlczogbm9uZTtcXG59XFxuYmxvY2txdW90ZTpiZWZvcmUsIGJsb2NrcXVvdGU6YWZ0ZXIsXFxucTpiZWZvcmUsIHE6YWZ0ZXIge1xcblxcdGNvbnRlbnQ6ICcnO1xcblxcdGNvbnRlbnQ6IG5vbmU7XFxufVxcbnRhYmxlIHtcXG5cXHRib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlO1xcblxcdGJvcmRlci1zcGFjaW5nOiAwO1xcbn1cXG5cXG46cm9vdCB7XFxuICAgIC0tcHJpbWFyeTogI2ZmNmZiMjsgXFxuICAgIC0tc2Vjb25kYXJ5OiAjYzMxOTVkOyBcXG4gICAgLS10ZXJ0aWFyeTogIzY4MDc0NzsgXFxuICAgIC0tcXVhdGVybmFyeTogIzE0MTAxMDsgXFxufVxcblxcbmh0bWwsIGJvZHksIGRpdiNjb250ZW50IHtcXG4gICAgaGVpZ2h0OiAxMDAlO1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgZm9udC1zaXplOiAxNXB4O1xcbn1cXG5cXG5kaXYjcDFTZXBlcmF0b3Ige1xcblxcdGJhY2tncm91bmQtY29sb3I6IHZhcigtLXByaW1hcnkpO1xcbn1cXG5kaXYjcDJTZXBlcmF0b3Ige1xcblxcdGJhY2tncm91bmQtY29sb3I6YXF1YTtcXG59XFxuXFxuZGl2I1AxRywgZGl2I1AyRyB7XFxuXFx0d2lkdGg6IDYwJTtcXG5cXHRtYXJnaW46IGF1dG87XFxufVxcblxcbmRpdi5nYW1lYm9hcmQge1xcblxcdGRpc3BsYXk6IGZsZXg7XFxuXFx0ZmxleC13cmFwOiB3cmFwO1xcblxcdGJvcmRlcjogM3B4IHNvbGlkIHBpbms7XFxufVxcblxcbi5kZXNjcmlwdG9yIHtcXG5cXHRmb250LWZhbWlseTogJ1NwYWNlIEdyb3Rlc2snLCBzYW5zLXNlcmlmO1xcblxcdGZvbnQtc2l6ZTogMS4ycmVtO1xcblxcdHBhZGRpbmc6IDAuNXJlbTtcXG5cXHR0ZXh0LWFsaWduOiBjZW50ZXI7XFxufVxcblxcbmJ1dHRvbiNuZXdHYW1lQnRuIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiAjYzMxOTVkO1xcblxcdGNvbG9yOmJpc3F1ZTtcXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0dG9wOiA1cHg7XFxuXFx0cmlnaHQ6IDVweDtcXG5cXHRkaXNwbGF5OiBub25lO1xcbn1cXG5cXG5kaXYjYWJvdXRIb2xkZXIge1xcblxcdGRpc3BsYXk6IG5vbmU7XFxuXFx0cG9zaXRpb246IGZpeGVkO1xcblxcdHRvcDogMDtcXG5cXHRyaWdodDogMDtcXG5cXHRib3R0b206IDA7XFxuXFx0bGVmdDogMDtcXG5cXHRiYWNrZ3JvdW5kOiByZ2JhKDAsMCwwLC44KTtcXG5cXHR6LWluZGV4OiAxMjtcXG59XFxuXFxuZGl2I2Fib3V0QnRuIHtcXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0ZGlzcGxheTogYmxvY2s7XFxuXFx0dG9wOiA1cHg7XFxuXFx0bGVmdDogNXB4O1xcblxcdGJhY2tncm91bmQ6IHZhcigtLXNlY29uZGFyeSk7XFxuICAgIGNvbG9yOiBiaXNxdWU7XFxuICAgIGJvcmRlci1yYWRpdXM6IDUwJTtcXG4gICAgd2lkdGg6IDQwcHg7XFxuICAgIGhlaWdodDogNDBweDtcXG4gICAgbGluZS1oZWlnaHQ6IDQwcHg7XFxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcXG4gICAgZm9udC1zaXplOiAyMHB4O1xcblxcdG9wYWNpdHk6IDAuODtcXG5cXHR6LWluZGV4OiAyMjtcXG59XFxuXFxuZGl2I2Fib3V0QnRuOmhvdmVyIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiAjZmY3MzAwO1xcbn1cXG5cXG5kaXYjYWJvdXQge1xcblxcdGRpc3BsYXk6IG5vbmU7XFxuXFx0cGFkZGluZzogM3JlbTtcXG5cXHR3aWR0aDogNTAlO1xcblxcdGhlaWdodDogNTAlO1xcblxcdGJhY2tncm91bmQ6ICNmZmFhNjU7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdGJvcmRlcjogNXB4IGdyb292ZSBncmF5O1xcblxcdGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuXFx0dG9wOiAwO1xcblxcdHJpZ2h0OiAwO1xcblxcdGJvdHRvbTogMDtcXG5cXHRsZWZ0OiAwO1xcblxcdG1hcmdpbjogYXV0bztcXG5cXHR0ZXh0LWFsaWduOiBjZW50ZXI7XFxuXFx0Zm9udC1zaXplOiAxLjdyZW07XFxuXFx0YWxpZ24tY29udGVudDogY2VudGVyO1xcblxcdGp1c3RpZnktY29udGVudDogY2VudGVyO1xcblxcdGNvbG9yOiByZ2IoNTYsIDUzLCA1Myk7XFxuXFx0ei1pbmRleDogMTU7XFxufVxcblxcbmRpdi5jb2xvckNvZGUge1xcblxcdGRpc3BsYXk6IGZsZXg7XFxuXFx0ZmxleC1kaXJlY3Rpb246IHJvdztcXG5cXHRqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG59XFxuXFxuc3Bhbi5jb2xvcldoaXRlIHtcXG5cXHRjb2xvcjogd2hpdGU7XFxufVxcbnNwYW4uY29sb3JCbGFjayB7XFxuXFx0Y29sb3I6IGJsYWNrO1xcbn1cXG5zcGFuLmNvbG9yT3JhbmdlIHtcXG5cXHRjb2xvcjogZGFya29yYW5nZTtcXG59XFxuXFxuZGl2I2RvbmVXaXRoU2hpcHMge1xcblxcdGJhY2tncm91bmQtY29sb3I6ICM2ODA3NDc7XFxuXFx0Y29sb3I6YmlzcXVlO1xcblxcdGJvcmRlcjogMnB4IGluc2V0IGdyYXk7XFxuXFx0Zm9udC1zaXplOiAxLjByZW07XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdGxlZnQ6IDVweDtcXG5cXHRwYWRkaW5nOiA0cHg7XFxuXFx0dG9wOiA2NXB4O1xcblxcdC8qIGRpc3BsYXk6IG5vbmU7ICovXFxufVxcblxcbmRpdiNheGlzVG9nZ2xlIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiAjYzMxOTVkO1xcblxcdGJvcmRlcjogMnB4IGluc2V0IGdyYXk7XFxuXFx0Zm9udC1zaXplOiAxLjByZW07XFxuXFx0Y29sb3I6YmlzcXVlO1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHRwYWRkaW5nOiA0cHg7XFxuXFx0dG9wOiAzMXB4O1xcblxcdGxlZnQ6IDVweDtcXG5cXHQvKiBkaXNwbGF5OiBub25lOyAqL1xcbn1cXG5cXG5kaXYjdG9wQmFyIHtcXG5cXHRwb3NpdGlvbjogcmVsYXRpdmU7XFxufVxcblxcbmRpdltjbGFzc149XFxcInNxdWFyZVxcXCJdIHtcXG5cXHRwb3NpdGlvbjogcmVsYXRpdmU7XFxuXFx0ZmxleC1iYXNpczogY2FsYyg5JSAtIDEwcHgpO1xcblxcdG1hcmdpbjogNXB4O1xcblxcdGJvcmRlcjogMXB4IHNvbGlkO1xcblxcdGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxufVxcblxcbmRpdltjbGFzc149XFxcInNxdWFyZVxcXCJdOjpiZWZvcmUge1xcblxcdGNvbnRlbnQ6ICcnO1xcblxcdGRpc3BsYXk6IGJsb2NrO1xcblxcdHBhZGRpbmctdG9wOiAxMDAlO1xcbn1cXG5cXG5kaXZbY2xhc3NePVxcXCJzcXVhcmVcXFwiXSAuY29udGVudHoge1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHR0b3A6IDA7IGxlZnQ6IDA7XFxuXFx0aGVpZ2h0OiAxMDAlO1xcblxcdHdpZHRoOiAxMDAlO1xcbiAgXFxuXFx0ZGlzcGxheTogZmxleDsgICAgICAgICAgICAgICAvKiBhZGRlZCBmb3IgY2VudGVyZWQgdGV4dCAqL1xcblxcdGp1c3RpZnktY29udGVudDogY2VudGVyOyAgICAgLyogYWRkZWQgZm9yIGNlbnRlcmVkIHRleHQgKi9cXG5cXHRhbGlnbi1pdGVtczogY2VudGVyOyAgICAgICAgIC8qIGFkZGVkIGZvciBjZW50ZXJlZCB0ZXh0ICovXFxufVxcblxcbi8qIFxcbmRpdiNjb250ZW50IHtcXG5cXHRkaXNwbGF5OiBncmlkO1xcblxcdGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDIsIDQwJSk7XFxuXFx0Z3JpZC10ZW1wbGF0ZS1yb3dzOiByZXBlYXQoMiwgNDAlKTtcXG59XFxuXFxuZGl2LmdhbWVib2FyZCB7XFxuXFx0ZGlzcGxheTogZ3JpZDtcXG5cXHRncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgxMSwgOCUpO1xcblxcdGdyaWQtdGVtcGxhdGUtcm93czogcmVwZWF0KDExLCA4JSk7XFxufVxcblxcbmRpdltjbGFzc149XFxcInNxdWFyZVxcXCJdIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTg0LCAxODQsIDE4NCk7XFxuXFx0Ym9yZGVyOiAxcHggc29saWQgYmxhY2s7XFxuXFx0b3BhY2l0eTogMC41O1xcblxcdGFzcGVjdC1yYXRpbzogMTtcXG59ICovXFxuXFxuLyogbG9hZGluZy9zcGlubmVyIHN0dWZmICovXFxuXFxuZGl2I2xlbmd0aEluZGljYXRvciB7XFxuXFx0LyogZGlzcGxheTogbm9uZTsgKi9cXG5cXHRkaXNwbGF5OiBmbGV4O1xcblxcdGp1c3RpZnktY29udGVudDogbGVmdDtcXG5cXHRhbGlnbi1pdGVtczogY2VudGVyO1xcblxcdGdhcDogMC41cmVtO1xcblxcdGZvbnQtc2l6ZTogMS4xcmVtO1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHR0b3A6IDVweDtcXG5cXHRsZWZ0OiA1cHg7XFxufVxcblxcbmlucHV0I2xlbmd0aElucHV0IHtcXG5cXHR3aWR0aDogMjUlO1xcbn1cXG5cXG5kaXYjcHJvbXB0UGxhY2luZ1AxIHtcXG5cXHQvKiBkaXNwbGF5OiBub25lOyAqL1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHRkaXNwbGF5OiBmbGV4O1xcblxcdGZsZXgtd3JhcDogd3JhcDtcXG5cXHR3aWR0aDogMTQlO1xcblxcdHRvcDogNXB4O1xcblxcdHJpZ2h0OiA4cHg7XFxufVxcblxcbmRpdiNiYXR0bGVTdGFydCB7XFxuXFx0Zm9udC1zaXplOiAxLjNyZW07XFxuXFx0ZGlzcGxheTogbm9uZTtcXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0d2lkdGg6IDE0JTtcXG5cXHR0b3A6IDVweDtcXG5cXHRyaWdodDogNXB4O1xcbn1cXG5cXG4jbG9hZGVyIHtcXG5cXHRkaXNwbGF5OiBub25lO1xcblxcdHRvcDogNTAlO1xcblxcdGxlZnQ6IDUwJTtcXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0dHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XFxufVxcbiAgXFxuLmxvYWRpbmcge1xcblxcdGJvcmRlcjogOHB4IHNvbGlkIHJnYigyMjAsIDAsIDApO1xcblxcdHdpZHRoOiA2MHB4O1xcblxcdGhlaWdodDogNjBweDtcXG5cXHRib3JkZXItcmFkaXVzOiA1MCU7XFxuXFx0Ym9yZGVyLXRvcC1jb2xvcjogI2ZmNjMyMDtcXG5cXHRib3JkZXItbGVmdC1jb2xvcjogI2ZmNzMwMDtcXG5cXHRhbmltYXRpb246IHNwaW4gMXMgaW5maW5pdGUgZWFzZS1pbjtcXG59XFxuICBcXG5Aa2V5ZnJhbWVzIHNwaW4ge1xcblxcdDAlIHtcXG5cXHQgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xcblxcdH1cXG4gIFxcblxcdDEwMCUge1xcblxcdCAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcXG5cXHR9XFxufVxcblxcbmE6bGluayB7XFxuXFx0Y29sb3I6IHdoaXRlO1xcblxcdHRleHQtZGVjb3JhdGlvbjogbm9uZTtcXG59XFxuXFxuYTp2aXNpdGVkIHtcXHRcXG5cXHRjb2xvcjogd2hpdGU7XFxuXFx0dGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbn1cXG5cXG5hOmhvdmVyIHtcXHRcXG5cXHRjb2xvcjogd2hpdGU7XFxuXFx0dGV4dC1kZWNvcmF0aW9uOiBub25lO1xcblxcdGNvbG9yOiBwdXJwbGU7XFxufVxcblxcbmE6YWN0aXZlIHtcXHRcXG5cXHRjb2xvcjogd2hpdGU7XFxuXFx0dGV4dC1kZWNvcmF0aW9uOiBub25lO1xcbn1cXG5cXG5AbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOiA4MDBweCkge1xcblxcdGh0bWwsIGJvZHksIGRpdiNjb250ZW50IHtcXG5cXHQgIGZvbnQtc2l6ZTogMTVweDtcXG5cXHR9XFxuXFxuXFx0Ym9keSB7XFxuXFx0XFx0ZGlzcGxheTogZmxleDtcXG5cXHRcXHRqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG5cXHRcXHRiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS10ZXJ0aWFyeSk7XFxuXFx0fVxcblxcblxcdGRpdiNjb250ZW50IHtcXG5cXHRcXHR3aWR0aDogNjAlO1xcblxcdFxcdGhlaWdodDogODUlO1xcblxcdH1cXG5cXHRkaXYjUDFULCBkaXYjUDJUIHtcXG5cXHRcXHR3aWR0aDogODUlO1xcblxcdFxcdG1hcmdpbjogYXV0bztcXG5cXHR9XFxuXFxuXFx0ZGl2I2F4aXNUb2dnbGUge1xcblxcdFxcdFxcblxcdFxcdHRvcDogMzdweDtcXG5cXHRcXHQvKiBkaXNwbGF5OiBub25lOyAqL1xcblxcdH1cXG5cXG5cXHRkaXYjZG9uZVdpdGhTaGlwcyB7XFxuXFx0XFx0dG9wOiA3NXB4O1xcblxcdH1cXG59XFxuXFxuQG1lZGlhIHNjcmVlbiBhbmQgKG1pbi13aWR0aDogMTI1MHB4KSB7XFxuXFx0ZGl2I2NvbnRlbnQge1xcblxcdFxcdHdpZHRoOiA1MCU7XFxuXFx0XFx0aGVpZ2h0OiA2NSU7XFxuXFx0fVxcblxcdGRpdiNQMUcsIGRpdiNQMkcge1xcblxcdFxcdHdpZHRoOiA1MCU7XFxuXFx0XFx0bWFyZ2luOiBhdXRvO1xcblxcdH1cXG5cXHRkaXYjUDFULCBkaXYjUDJUIHtcXG5cXHRcXHR3aWR0aDogNzAlO1xcblxcdFxcdG1hcmdpbjogYXV0bztcXG5cXHR9XFxufVwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTtcblxuICAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbihcIlwiKTtcbiAgfTtcblxuICAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG4gICAgaWYgKGRlZHVwZSkge1xuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCB0aGlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHZhciBpZCA9IHRoaXNba11bMF07XG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBsYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bNV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc3VwcG9ydHMpIHtcbiAgICAgICAgaWYgKCFpdGVtWzRdKSB7XG4gICAgICAgICAgaXRlbVs0XSA9IFwiXCIuY29uY2F0KHN1cHBvcnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNF0gPSBzdXBwb3J0cztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuICBpZiAoIWNzc01hcHBpbmcpIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuICBpZiAodHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKFwiXFxuXCIpO1xuICB9XG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzdHlsZXNJbkRPTSA9IFtdO1xuZnVuY3Rpb24gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuICB2YXIgcmVzdWx0ID0gLTE7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5ET00ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5ET01baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpIHtcbiAgdmFyIGlkQ291bnRNYXAgPSB7fTtcbiAgdmFyIGlkZW50aWZpZXJzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleEJ5SWRlbnRpZmllciA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXSxcbiAgICAgIHN1cHBvcnRzOiBpdGVtWzRdLFxuICAgICAgbGF5ZXI6IGl0ZW1bNV1cbiAgICB9O1xuICAgIGlmIChpbmRleEJ5SWRlbnRpZmllciAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdXBkYXRlciA9IGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5ieUluZGV4ID0gaTtcbiAgICAgIHN0eWxlc0luRE9NLnNwbGljZShpLCAwLCB7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IHVwZGF0ZXIsXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cbmZ1bmN0aW9uIGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIGFwaSA9IG9wdGlvbnMuZG9tQVBJKG9wdGlvbnMpO1xuICBhcGkudXBkYXRlKG9iaik7XG4gIHZhciB1cGRhdGVyID0gZnVuY3Rpb24gdXBkYXRlcihuZXdPYmopIHtcbiAgICBpZiAobmV3T2JqKSB7XG4gICAgICBpZiAobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwICYmIG5ld09iai5zdXBwb3J0cyA9PT0gb2JqLnN1cHBvcnRzICYmIG5ld09iai5sYXllciA9PT0gb2JqLmxheWVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGFwaS51cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHVwZGF0ZXI7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaXN0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBsaXN0ID0gbGlzdCB8fCBbXTtcbiAgdmFyIGxhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XG4gICAgbmV3TGlzdCA9IG5ld0xpc3QgfHwgW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgX2lkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbX2ldO1xuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcbiAgICAgIGlmIChzdHlsZXNJbkRPTVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5ET01bX2luZGV4XS51cGRhdGVyKCk7XG4gICAgICAgIHN0eWxlc0luRE9NLnNwbGljZShfaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVtbyA9IHt9O1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7XG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuICAgIGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG4gICAgICAgIC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gc3R5bGVUYXJnZXQuY29udGVudERvY3VtZW50LmhlYWQ7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gIH1cbiAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRCeVNlbGVjdG9yKGluc2VydCwgc3R5bGUpIHtcbiAgdmFyIHRhcmdldCA9IGdldFRhcmdldChpbnNlcnQpO1xuICBpZiAoIXRhcmdldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gIH1cbiAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0QnlTZWxlY3RvcjsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgb3B0aW9ucy5zZXRBdHRyaWJ1dGVzKGVsZW1lbnQsIG9wdGlvbnMuYXR0cmlidXRlcyk7XG4gIG9wdGlvbnMuaW5zZXJ0KGVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG4gIHJldHVybiBlbGVtZW50O1xufVxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzKHN0eWxlRWxlbWVudCkge1xuICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09IFwidW5kZWZpbmVkXCIgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG4gIGlmIChub25jZSkge1xuICAgIHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLCBub25jZSk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKSB7XG4gIHZhciBjc3MgPSBcIlwiO1xuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQob2JqLnN1cHBvcnRzLCBcIikge1wiKTtcbiAgfVxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIik7XG4gIH1cbiAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBvYmoubGF5ZXIgIT09IFwidW5kZWZpbmVkXCI7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJAbGF5ZXJcIi5jb25jYXQob2JqLmxheWVyLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQob2JqLmxheWVyKSA6IFwiXCIsIFwiIHtcIik7XG4gIH1cbiAgY3NzICs9IG9iai5jc3M7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH1cblxuICAvLyBGb3Igb2xkIElFXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cbiAgb3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGRvbUFQSShvcHRpb25zKSB7XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoKSB7fSxcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICB9O1xuICB9XG4gIHZhciBzdHlsZUVsZW1lbnQgPSBvcHRpb25zLmluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKTtcbiAgcmV0dXJuIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShvYmopIHtcbiAgICAgIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCk7XG4gICAgfVxuICB9O1xufVxubW9kdWxlLmV4cG9ydHMgPSBkb21BUEk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQpIHtcbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzdHlsZVRhZ1RyYW5zZm9ybTsiLCJpbXBvcnQgJy4vc3R5bGUuY3NzJztcbmltcG9ydCBsb2dpY3RvZG8gZnJvbSAnLi9sb2dpY3RvZG8uanMnO1xuaW1wb3J0IHsgcGxhY2VTaGlwc0RPTSB9IGZyb20gJy4vbG9naWN0b2RvLmpzJztcbmltcG9ydCB7IGZpbGxTcXVhcmVET00gfSBmcm9tICcuL2xvZ2ljdG9kby5qcyc7XG5pbXBvcnQgeyBzaGlwU3Vua0RPTSB9IGZyb20gJy4vbG9naWN0b2RvLmpzJztcbmltcG9ydCB7IHNocmlua093bkJvYXJkIH0gZnJvbSAnLi9sb2dpY3RvZG8uanMnO1xuaW1wb3J0IHsgcmVzZXRET00gfSBmcm9tICcuL2xvZ2ljdG9kby5qcyc7XG5pbXBvcnQgeyBoaWRlQ29tcEJvYXJkIH0gZnJvbSAnLi9sb2dpY3RvZG8uanMnO1xuXG5jb25zdCBwa2cgPSByZXF1aXJlKCcuLi9sb2dpYy5qcycpO1xuY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXdHYW1lQnRuXCIpO1xuY29uc3QgbGVuZ3RoRm9yU2hpcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGVuZ3RoSW5kaWNhdG9yXCIpO1xuY29uc3QgcGxhY2VTaGlwSW5zdHJ1Y3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByb21wdFBsYWNpbmdQMVwiKTtcbmNvbnN0IHN0YXJ0QmF0dGxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJiYXR0bGVTdGFydFwiKTtcbmNvbnN0IHJlYWR5QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkb25lV2l0aFNoaXBzXCIpO1xuY29uc3QgYXhpc1RvZ2dsZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF4aXNUb2dnbGVcIik7XG5jb25zdCBhYm91dEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWJvdXRCdG5cIik7XG5jb25zdCBhYm91dENvbnRlbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFib3V0XCIpO1xuY29uc3QgYWJvdXRCYWNrZ3JvdW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhYm91dEhvbGRlclwiKTtcblxuYWJvdXRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICBpZiAoYWJvdXRCdXR0b24uaW5uZXJIVE1MID09PSBcIj9cIikge1xuICAgICAgICBhYm91dEJhY2tncm91bmQuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgYWJvdXRDb250ZW50LnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgICAgYWJvdXRCdXR0b24uaW5uZXJIVE1MID0gXCJYXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYWJvdXRCYWNrZ3JvdW5kLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgYWJvdXRDb250ZW50LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgYWJvdXRCdXR0b24uaW5uZXJIVE1MID0gXCI/XCI7XG4gICAgfVxufSlcblxuZnVuY3Rpb24gdG9nZ2xlQnV0dG9uKCkge1xuICAgIGlmIChidG4uc3R5bGUuZGlzcGxheSA9PT0gXCJub25lXCIgfHwgYnRuLnN0eWxlLmRpc3BsYXkgPT09IFwiXCIpIHtcbiAgICAgICAgYnRuLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgfSBlbHNlIGlmIChidG4uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIikge1xuICAgICAgICBidG4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc3RhcnRHYW1lKCkge1xuICAgIGxvZ2ljdG9kbygpOy8vRE9NIHN0dWZmXG4gICAgLy8tLS0tLWdhbWUgbG9vcCBzdGFydFxuICAgIGxldCBQMSA9IHBrZy5QbGF5ZXIoJ1BsYXllciAxJyk7XG4gICAgbGV0IFAyID0gcGtnLlBsYXllcignQ29tcHV0ZXInKTtcbiAgICBsZXQgY3VycmVudFBsYXllciA9IG51bGw7XG4gICAgbGV0IHdhaXRpbmdQbGF5ZXIgPSBudWxsO1xuXG4gICAgLy9jdXJyZW50bHkganVzdCBwbGF5ZXIgdnMgQ1BVXG4gICAgLy9hZGQgaW4gbGF0ZXIgLSBjaG9pY2Ugb2YgUHZQIG9yIHZzIENQVVxuICAgIC8vbmFtZSBpbnB1dCBmb3IgcGxheWVyKHMpXG5cbiAgICAvL2RlY2lkZSB3aG8gZ29lcyBmaXJzdFxuICAgIGZ1bmN0aW9uIHR1cm5Td2l0Y2hIaWRlQm9hcmRzKHBsYXllcikgey8vaW5zZXJ0IGN1cnJlbnRQbGF5ZXJcbiAgICAgICAgbGV0IHAxU3R1ZmZzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwMVNlcGVyYXRvclwiKTtcbiAgICAgICAgbGV0IHAyU3R1ZmZzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwMlNlcGVyYXRvclwiKTtcbiAgICAgICAgaWYgKHBsYXllciA9PT0gUDEpIHtcbiAgICAgICAgICAgIHAxU3R1ZmZzLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgICAgICBwMlN0dWZmcy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIH0gZWxzZSBpZiAocGxheWVyID09PSBQMikge1xuICAgICAgICAgICAgcDFTdHVmZnMuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgcDJTdHVmZnMuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBwaWNrU3RhcnRlcigpIHtcbiAgICAgICAgbGV0IGdvRmlyc3QgPSBNYXRoLnJhbmRvbSgpIDwgMC41ID8gXCJQMVwiIDogXCJQMlwiO1xuICAgICAgICBpZiAoZ29GaXJzdCA9PT0gXCJQMVwiKSB7XG4gICAgICAgICAgICBjdXJyZW50UGxheWVyID0gUDE7XG4gICAgICAgICAgICB3YWl0aW5nUGxheWVyID0gUDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjdXJyZW50UGxheWVyID0gUDI7XG4gICAgICAgICAgICB3YWl0aW5nUGxheWVyID0gUDE7XG4gICAgICAgIH1cbiAgICAgICAgdHVyblN3aXRjaEhpZGVCb2FyZHMoY3VycmVudFBsYXllcik7XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIGNoZWNrRm9yV2luKCkge1xuICAgICAgICAvL2NoZWNrIGZvciB3aW4gZmlyc3RcbiAgICAgICAgaWYgKFAxLmFsbFNoaXBzU3VuaygpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlAyIGlzIHRoZSB3aW5uZXIuIFdob28hIVwiKTtcbiAgICAgICAgICAgIHN0YXJ0QmF0dGxlLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIHRvZ2dsZUJ1dHRvbigpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoUDIuYWxsU2hpcHNTdW5rKCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUDEgaXMgdGhlIHdpbm5lci4gV2hvbyEhXCIpO1xuICAgICAgICAgICAgc3RhcnRCYXR0bGUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgdG9nZ2xlQnV0dG9uKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBwbGF5ZXJUdXJuU3dpdGNoKCkge1xuICAgICAgICAvKiAvL2NoZWNrIGZvciB3aW4gZmlyc3RcbiAgICAgICAgaWYgKFAxLmFsbFNoaXBzU3VuaygpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlAyIGlzIHRoZSB3aW5uZXIuIFdob28hIVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChQMi5hbGxTaGlwc1N1bmsoKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJQMSBpcyB0aGUgd2lubmVyLiBXaG9vISFcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gIGVsc2UqLyB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFBsYXllciA9PT0gUDIpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UGxheWVyID0gUDE7XG4gICAgICAgICAgICAgICAgd2FpdGluZ1BsYXllciA9IFAyO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UGxheWVyID0gUDI7XG4gICAgICAgICAgICAgICAgd2FpdGluZ1BsYXllciA9IFAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHVyblN3aXRjaEhpZGVCb2FyZHMoY3VycmVudFBsYXllcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy9waWNrU3RhcnRlcigpO1xuICAgIGN1cnJlbnRQbGF5ZXIgPSBQMTtcbiAgICB3YWl0aW5nUGxheWVyID0gUDI7XG4gICAgdHVyblN3aXRjaEhpZGVCb2FyZHMoY3VycmVudFBsYXllcik7XG4gICAgY29uc29sZS5sb2coXCJjdXJyZW50UGxheWVyIGlzIFwiLCBjdXJyZW50UGxheWVyKTtcblxuICAgIC8vc3RhcnQgd2l0aCBVUCBUTyAxMCAtLSBmb3VyIDFzLCB0aHJlZSAycywgdHdvIDNzLCBvbmUgNFxuICAgIGN1cnJlbnRQbGF5ZXIgPSBcInBhdXNlUGxhY2VcIjtcbiAgICB3YWl0aW5nUGxheWVyID0gXCJwYXVzZVBsYWNlXCI7IFxuICAgIC8vdG8ga2VlcCB0YXJnZXQgYm9hcmRzIGZyb20gZmlyaW5nXG5cbiAgICAvL2NvZGUgaGVyZSB0byB0b2dnbGUgdGhlIFwiaW5zdHJ1Y3Rpb25zXCIgZm9yIHBsYWNlbWVudCBvblxuXG4gICAgYXhpc1RvZ2dsZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgaWYgKGF4aXNUb2dnbGVyLmlubmVySFRNTCA9PT0gXCJ2ZXJ0aWNhbFwiKSB7XG4gICAgICAgICAgICBheGlzVG9nZ2xlci5pbm5lckhUTUwgPSBcImhvcml6b250YWxcIjtcbiAgICAgICAgfSBlbHNlIGlmIChheGlzVG9nZ2xlci5pbm5lckhUTUwgPT09IFwiaG9yaXpvbnRhbFwiKSB7XG4gICAgICAgICAgICBheGlzVG9nZ2xlci5pbm5lckhUTUwgPSBcInZlcnRpY2FsXCI7XG4gICAgICAgIH1cbiAgICB9KVxuXG4gICAgbGV0IGFsbENvcHlTcGFuc1AxID0gW107XG4gICAgbGV0IGFsbENvcHlTcGFuc1AyID0gW107XG5cbiAgICBjb25zdCBQMVNlbGZCb2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjUDFHXCIpO1xuXG5cbiAgICBQMVNlbGZCb2FyZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICBsZXQgdGVzdEFycmF5ID0gW107XG4gICAgICAgIGxldCBsZW5ndGhJbnB1dHRlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGVuZ3RoSW5wdXRcIikudmFsdWU7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibGVuZ3RoSW5wdXR0ZWQgaXMgXCIsIGxlbmd0aElucHV0dGVkKTtcbiAgICAgICAgbGV0IGF4aXNJbnB1dHRlZCA9IGF4aXNUb2dnbGVyLmlubmVySFRNTDtcbiAgICAgICAgY29uc29sZS5sb2coXCJheGlzSW5wdXR0ZWQgaXMgXCIsIGF4aXNJbnB1dHRlZCk7XG4gICAgICAgIGlmIChjdXJyZW50UGxheWVyICE9PSBcInBhdXNlUGxhY2VcIiAmJiB3YWl0aW5nUGxheWVyICE9PSBcInBhdXNlUGxhY2VcIikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKGxlbmd0aElucHV0dGVkIDwgMCB8fCBsZW5ndGhJbnB1dHRlZCA+IDQgfHwgbGVuZ3RoSW5wdXR0ZWQgPT09IFwiXCIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibm90aGluZyBhZGRlZCwgd2hld1wiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFAxLnBsYXllclNoaXBDb3VudCgpKTtcbiAgICAgICAgICAgIGlmIChlLnRhcmdldC5pZCA9PT0gXCJQMUdcIikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmNsYXNzTmFtZS5zbGljZSgwLDYpID09PSBcInNxdWFyZVwiICYmIGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmlkLnNsaWNlKDEsMikgPT09IFwiMFwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmNsYXNzTmFtZS5zbGljZSgwLDYpID09PSBcInNxdWFyZVwiICYmIGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmlkLnNsaWNlKDAsNSkgPT09IFwiZW1wdHlcIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChQMS5wbGF5ZXJTaGlwQ291bnQoKSA8IDEwKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb29yZFBpY2tlZCA9IGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmlkLnNwbGl0KCdfJylbMF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY29vcmRQaWNrZWQgaXMgXCIsIGNvb3JkUGlja2VkKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNoaXBTcGFuVGVzdFAxID0gUDEucGxheWVyUGxhY2VTaGlwU3Bhbihjb29yZFBpY2tlZCwgbGVuZ3RoSW5wdXR0ZWQsIGF4aXNJbnB1dHRlZCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic2hpcFNwYW5UZXN0UDEgaXMgXCIsIHNoaXBTcGFuVGVzdFAxKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvcHlTcGFuID0gc2hpcFNwYW5UZXN0UDEuc2xpY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFAxLnBsYXllckNoZWNrT3ZlcmxhcChjb3B5U3BhbikpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvcHlTcGFuMVAxID0gc2hpcFNwYW5UZXN0UDEuc2xpY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbENvcHlTcGFuc1AxLnB1c2goY29weVNwYW4xUDEpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBQMS5wbGF5ZXJQbGFjZShjb29yZFBpY2tlZCwgbGVuZ3RoSW5wdXR0ZWQsIGF4aXNJbnB1dHRlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QXJyYXkucHVzaChjb3B5U3Bhbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZVNoaXBzRE9NKHNoaXBTcGFuVGVzdFAxLCBQMSwgUDEsIFAyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFAxLnBsYXllckJvYXJkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pXG5cbiAgICByZWFkeUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAvL2FkZHMgYW4gZXF1YWwgIyBvZiBzaGlwcyB0byB3aGF0IFAxIGhhcyAoZGlmZmVyZW50IGxlbmd0aHMpXG4gICAgICAgIGxldCBudW1TaGlwc05lZWRlZCA9IFAxLnNoaXBzVXAoKTtcbiAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBudW1TaGlwc05lZWRlZDsgaysrKSB7XG4gICAgICAgICAgICBsZXQgbGVuZ3RoT2ZTaGlwID0gKGslNCkrMTtcbiAgICAgICAgICAgIGxldCBjb21wR2VuUG9zQXhpcyA9IFAyLmNvbXB1dGVyUGxhY2UobGVuZ3RoT2ZTaGlwKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNvbXBHZW5Qb3NBeGlzKTtcbiAgICAgICAgICAgIGxldCBzaGlwU3BhbjFQMiA9IFAyLnBsYXllclBsYWNlU2hpcFNwYW4oY29tcEdlblBvc0F4aXNbMF0sIGxlbmd0aE9mU2hpcCwgY29tcEdlblBvc0F4aXNbMV0pO1xuICAgICAgICAgICAgbGV0IGNvcHlTcGFuMVAyID0gc2hpcFNwYW4xUDIuc2xpY2UoKTtcbiAgICAgICAgICAgIGFsbENvcHlTcGFuc1AyLnB1c2goY29weVNwYW4xUDIpO1xuICAgICAgICAgICAgcGxhY2VTaGlwc0RPTShzaGlwU3BhbjFQMiwgd2FpdGluZ1BsYXllciwgUDEsIFAyKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhQMi5wbGF5ZXJCb2FyZCk7XG4gICAgICAgIC8vb25jZSBlbmVteSBzaGlwcyBoYXZlIGJlZW4gc2V0LCBjaGFuZ2UgaW5zdHJ1Y3Rpb25zIG9uIHJpZ2h0XG4gICAgICAgIC8vJiByZW1vdmUgXCJzaGlwIGFkZGluZ1wiIGJ1dHRvbnMgb24gdGhlIGxlZnRcbiAgICAgICAgcmVhZHlCdG4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICBheGlzVG9nZ2xlci5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIGxlbmd0aEZvclNoaXAuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICBwbGFjZVNoaXBJbnN0cnVjdC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIHN0YXJ0QmF0dGxlLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgIGN1cnJlbnRQbGF5ZXIgPSBQMTtcbiAgICAgICAgd2FpdGluZ1BsYXllciA9IFAyO1xuICAgIH0pXG5cbiAgICAvL2FkZCBpbiBsYXRlciAtIGNob29zaW5nIHdoZXJlIHRvIHBsYWNlIHNoaXBzIVxuICAgIC8vRE9NL1VJIHNlbGVjdGlvbiA+IGZpcmluZyBwbGF5ZXJQbGFjZSBjb2RlID4gc2V0dGluZyBuZXcgRE9NXG4gICAgLy9vciB0aGUgcmFuZG9tIENQVSBzaGlwIHBsYWNlbWVudCBiZWxvdyBmb3IgdnMgQ1BVXG4gICAgLy93aWxsIGFsc28gbmVlZCB0byBwdXQgY29kZSB0byBISURFIFxuICAgIC8vQ1BVIChvciBvdGhlciBwZXJzb24ncykgYm9hcmRzXG4gICAgXG4gICAgLyogUDIuY29tcHV0ZXJQbGFjZSg0KTtcbiAgICBQMi5jb21wdXRlclBsYWNlKDMpO1xuICAgIFAyLmNvbXB1dGVyUGxhY2UoMik7XG4gICAgUDIuY29tcHV0ZXJQbGFjZSgxKTsgKi8gLy9yYW5kb21seSBwbGFjZXMgZm9yIGNvbXB1dGVyXG5cbiAgICAvKiBQMS5wbGF5ZXJQbGFjZSgnQTInLCAzLCAndmVydGljYWwnKTtcbiAgICBQMS5wbGF5ZXJQbGFjZSgnRDInLCAyLCAnaG9yaXpvbnRhbCcpO1xuICAgIFAxLnBsYXllclBsYWNlKCdINCcsIDEsICd2ZXJ0aWNhbCcpO1xuICAgIFAxLnBsYXllclBsYWNlKCdKMScsIDQsICd2ZXJ0aWNhbCcpO1xuICAgIGxldCBzaGlwU3BhbjFQMSA9IFAxLnBsYXllclBsYWNlU2hpcFNwYW4oJ0EyJywgMywgJ3ZlcnRpY2FsJyk7XG4gICAgbGV0IHNoaXBTcGFuMlAxID0gUDEucGxheWVyUGxhY2VTaGlwU3BhbignRDInLCAyLCAnaG9yaXpvbnRhbCcpO1xuICAgIGxldCBzaGlwU3BhbjNQMSA9IFAxLnBsYXllclBsYWNlU2hpcFNwYW4oJ0g0JywgMSwgJ3ZlcnRpY2FsJyk7XG4gICAgbGV0IHNoaXBTcGFuNFAxID0gUDEucGxheWVyUGxhY2VTaGlwU3BhbignSjEnLCA0LCAndmVydGljYWwnKTtcblxuICAgIGxldCBjb3B5U3BhbjFQMSA9IHNoaXBTcGFuMVAxLnNsaWNlKCk7XG4gICAgbGV0IGNvcHlTcGFuMlAxID0gc2hpcFNwYW4yUDEuc2xpY2UoKTtcbiAgICBsZXQgY29weVNwYW4zUDEgPSBzaGlwU3BhbjNQMS5zbGljZSgpO1xuICAgIGxldCBjb3B5U3BhbjRQMSA9IHNoaXBTcGFuNFAxLnNsaWNlKCk7XG4gICAgbGV0IGFsbENvcHlTcGFuc1AxID0gW107XG4gICAgYWxsQ29weVNwYW5zUDEucHVzaChjb3B5U3BhbjFQMSk7XG4gICAgYWxsQ29weVNwYW5zUDEucHVzaChjb3B5U3BhbjJQMSk7XG4gICAgYWxsQ29weVNwYW5zUDEucHVzaChjb3B5U3BhbjNQMSk7XG4gICAgYWxsQ29weVNwYW5zUDEucHVzaChjb3B5U3BhbjRQMSk7ICovXG5cbiAgICAvKiBQMi5wbGF5ZXJQbGFjZSgnQTInLCAzLCAndmVydGljYWwnKTtcbiAgICBQMi5wbGF5ZXJQbGFjZSgnRDInLCAyLCAnaG9yaXpvbnRhbCcpO1xuICAgIFAyLnBsYXllclBsYWNlKCdINCcsIDEsICd2ZXJ0aWNhbCcpO1xuICAgIFAyLnBsYXllclBsYWNlKCdKMScsIDQsICd2ZXJ0aWNhbCcpOyAqL1xuXG4gICAgLyogbGV0IHNoaXBTcGFuMVAyID0gUDIucGxheWVyUGxhY2VTaGlwU3BhbignQTInLCAzLCAndmVydGljYWwnKTtcbiAgICBsZXQgc2hpcFNwYW4yUDIgPSBQMi5wbGF5ZXJQbGFjZVNoaXBTcGFuKCdEMicsIDIsICdob3Jpem9udGFsJyk7XG4gICAgbGV0IHNoaXBTcGFuM1AyID0gUDIucGxheWVyUGxhY2VTaGlwU3BhbignSDQnLCAxLCAndmVydGljYWwnKTtcbiAgICBsZXQgc2hpcFNwYW40UDIgPSBQMi5wbGF5ZXJQbGFjZVNoaXBTcGFuKCdKMScsIDQsICd2ZXJ0aWNhbCcpOyAqL1xuICAgIC8vdGVzdGluZyB1c2luZyB0aGVzZSBzcGFucyB0byBmaW5kIGlmIGEgc2hpcCdzIGNvb3JkaW5hdGVzIFxuICAgIC8vYXJlIHdpdGhpbiBpdCwgYW5kIHRoZW4gdXNpbmcgdGhhdCB0byBcImJsb2NrXCIgb3V0IGEgc3VuayBzaGlwXG4gICAgLy9vbiB0aGUgRE9NXG4gICAgLyogbGV0IGNvcHlTcGFuMVAyID0gc2hpcFNwYW4xUDIuc2xpY2UoKTtcbiAgICBsZXQgY29weVNwYW4yUDIgPSBzaGlwU3BhbjJQMi5zbGljZSgpO1xuICAgIGxldCBjb3B5U3BhbjNQMiA9IHNoaXBTcGFuM1AyLnNsaWNlKCk7XG4gICAgbGV0IGNvcHlTcGFuNFAyID0gc2hpcFNwYW40UDIuc2xpY2UoKTtcbiAgICBsZXQgYWxsQ29weVNwYW5zUDIgPSBbXTtcbiAgICBhbGxDb3B5U3BhbnNQMi5wdXNoKGNvcHlTcGFuMVAyKTtcbiAgICBhbGxDb3B5U3BhbnNQMi5wdXNoKGNvcHlTcGFuMlAyKTtcbiAgICBhbGxDb3B5U3BhbnNQMi5wdXNoKGNvcHlTcGFuM1AyKTtcbiAgICBhbGxDb3B5U3BhbnNQMi5wdXNoKGNvcHlTcGFuNFAyKTsgKi9cblxuICAgIC8qIHBsYWNlU2hpcHNET00oc2hpcFNwYW4xUDEsIGN1cnJlbnRQbGF5ZXIsIFAxLCBQMik7XG4gICAgcGxhY2VTaGlwc0RPTShzaGlwU3BhbjJQMSwgY3VycmVudFBsYXllciwgUDEsIFAyKTtcbiAgICBwbGFjZVNoaXBzRE9NKHNoaXBTcGFuM1AxLCBjdXJyZW50UGxheWVyLCBQMSwgUDIpO1xuICAgIHBsYWNlU2hpcHNET00oc2hpcFNwYW40UDEsIGN1cnJlbnRQbGF5ZXIsIFAxLCBQMik7IFxuXG4gICAgcGxhY2VTaGlwc0RPTShzaGlwU3BhbjFQMiwgd2FpdGluZ1BsYXllciwgUDEsIFAyKTtcbiAgICBwbGFjZVNoaXBzRE9NKHNoaXBTcGFuMlAyLCB3YWl0aW5nUGxheWVyLCBQMSwgUDIpO1xuICAgIHBsYWNlU2hpcHNET00oc2hpcFNwYW4zUDIsIHdhaXRpbmdQbGF5ZXIsIFAxLCBQMik7XG4gICAgcGxhY2VTaGlwc0RPTShzaGlwU3BhbjRQMiwgd2FpdGluZ1BsYXllciwgUDEsIFAyKTsqL1xuXG4gICAgLy9hZnRlciBzaGlwcyBwbGFjZWQsIHNocmluayBnYW1lYm9hcmQgc28gaXQncyBsZXNzIGluIHRoZSB3YXlcbiAgICAvKiBzaHJpbmtPd25Cb2FyZChjdXJyZW50UGxheWVyLCBQMSwgUDIpO1xuICAgIHNocmlua093bkJvYXJkKHdhaXRpbmdQbGF5ZXIsIFAxLCBQMik7ICovXG5cblxuICAgIGZ1bmN0aW9uIHNwaW5uZXJPbigpIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkZXJcIikuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICB9XG4gICAgZnVuY3Rpb24gc3Bpbm5lck9mZigpIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkZXJcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIH1cbiAgICAvL1AxIChtZSkgZmlyc3QsIG5lZWQgYWRkRXZlbnRMaXN0ZW5lciBmb3IgbXkgXG4gICAgLy9lbmVteSBib2FyZFxuICAgIC8vb25lIGNsaWNrIHdpbGwgaGF2ZSB0byBnZXQgdGhlIGZpcnN0IHR3byBjaGFyIG9mIHNxIElEXG4gICAgLy9hbmQgZG8gZnVuY3Rpb24gKGV4OiBQMS5kaWRBdGtNaXNzKCdBMicsIFAyLmdldEF0dGFja2VkKSlcbiAgICBjb25zdCBQMUVuZW15Qm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1AxVFwiKTtcbiAgICBQMUVuZW15Qm9hcmQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgaWYgKGN1cnJlbnRQbGF5ZXIgIT09IFAxKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZS50YXJnZXQuaWQgPT09IFwiUDFUXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKChlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5jbGFzc05hbWUuc2xpY2UoMCw2KSA9PT0gXCJzcXVhcmVcIiAmJiBlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5pZC5zbGljZSgxLDIpID09PSBcIjBcIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKChlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5jbGFzc05hbWUuc2xpY2UoMCw2KSA9PT0gXCJzcXVhcmVcIiAmJiBlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5pZC5zbGljZSgwLDUpID09PSBcImVtcHR5XCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgY29vcmRQaWNrZWQgPSBlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5pZC5zcGxpdCgnXycpWzBdO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY29vcmRQaWNrZWQgd2FzIFwiLCBjb29yZFBpY2tlZCk7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IFAxLmRpZEF0a01pc3MoY29vcmRQaWNrZWQsIFAyLmdldEF0dGFja2VkKTtcbiAgICAgICAgICAgICAgICBsZXQgZGlkSVNpbmtBU2hpcCA9IFAyLmdldFNoaXBGb3JPcHAoY29vcmRQaWNrZWQpO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgIT09IGZhbHNlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy9leGNsdWRlcyBmYWxzZSB3aGVuIGNvb3JkIGlzIGFscmVhZHkgaGl0L21pc3NlZFxuICAgICAgICAgICAgICAgICAgICBsZXQgc3FIb2xkZXJDb29yZCA9IHJlc3VsdC5zbGljZSg1KTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGhpdE1pc3MgPSByZXN1bHQuc2xpY2UoMCw0KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJzcUhvbGRlckNvb3JkOiBcIiwgc3FIb2xkZXJDb29yZCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaGl0TWlzczogXCIsIGhpdE1pc3MpO1xuICAgICAgICAgICAgICAgICAgICBmaWxsU3F1YXJlRE9NKHNxSG9sZGVyQ29vcmQsIGhpdE1pc3MsIGN1cnJlbnRQbGF5ZXIsIFAxLCBQMik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkaWRJU2lua0FTaGlwICE9PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkaWRJU2lua0FTaGlwLmdldEhpdHMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkaWRJU2lua0FTaGlwLmlzU3VuaygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vLS0tLS0tLS0tLS0tbWFrZSB0aGlzIHNvIGl0J2xsIGRpc3BsYXlcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhhdCBhIHNoaXAgaGFzIFNVTksgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlkSVNpbmtBU2hpcC5pc1N1bmsoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhcnJheU9mRE9NID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsQ29weVNwYW5zUDIuZm9yRWFjaChhcnJheSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhcnJMZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgYXJyTGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcnJheVtrXS5pbmNsdWRlcyhgJHtjb29yZFBpY2tlZH1gKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5T2ZET00gPSBhcnJheTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGFycmF5T2ZET00pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5T2ZET00uZm9yRWFjaChleiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhcnJTdHJpbmcgPSBlelswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hpcFN1bmtET00oYXJyU3RyaW5nLCBjdXJyZW50UGxheWVyLCBQMSwgUDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJQMSBteUhpdHM6IFwiLCBQMS5teUhpdHMpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlAxIG15TWlzc2VzOiBcIiwgUDEubXlNaXNzZXMpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9wbGF5ZXJUdXJuU3dpdGNoKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGVja0ZvcldpbigpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChwbGF5ZXJUdXJuU3dpdGNoLCA1MDApOy8vZ2l2ZSBpdCB0aW1lXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGhpZGVDb21wQm9hcmQoKTsvL2hpZGUgQ1BVJ3MgcGxhY2VtZW50c1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3NldFRpbWVvdXQoY29tcHV0ZXJUdXJuLCAyNDAwKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZnRlciAxMDAwbXMsIGNhbGwgdGhlIGBzZXRUaW1lb3V0YCBjYWxsYmFja1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEluIHRoZSBtZWFudGltZSwgY29udGludWUgZXhlY3V0aW5nIGNvZGUgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wdXRlclR1cm4oKSAvL3J1bnMgc2Vjb25kIGFmdGVyIDExMDBtc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sMjIwMClcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwaW5uZXJPbigpIC8vcnVucyBmaXJzdCwgYWZ0ZXIgMTAwMG1zXG4gICAgICAgICAgICAgICAgICAgICAgICB9LDUwMClcbiAgICAgICAgICAgICAgICAgICAgfS8vY29tcHV0ZXIgXCJ0aGlua2luZ1wiXG4gICAgICAgICAgICAgICAgICAgIC8vY29tcHV0ZXJUdXJuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbiAgICBcbiAgICBjb25zdCBQMkVuZW15Qm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1AyVFwiKTtcbiAgICBQMkVuZW15Qm9hcmQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgaWYgKGN1cnJlbnRQbGF5ZXIgIT09IFAyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZS50YXJnZXQuaWQgPT09IFwiUDJUXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKChlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5jbGFzc05hbWUuc2xpY2UoMCw2KSA9PT0gXCJzcXVhcmVcIiAmJiBlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5pZC5zbGljZSgxLDIpID09PSBcIjBcIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKChlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5jbGFzc05hbWUuc2xpY2UoMCw2KSA9PT0gXCJzcXVhcmVcIiAmJiBlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5pZC5zbGljZSgwLDUpID09PSBcImVtcHR5XCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgY29vcmRQaWNrZWQgPSBlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5pZC5zbGljZSgwLDIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY29vcmRQaWNrZWQgd2FzIFwiLCBjb29yZFBpY2tlZCk7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IFAyLmRpZEF0a01pc3MoY29vcmRQaWNrZWQsIFAxLmdldEF0dGFja2VkKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAvL2V4Y2x1ZGVzIGZhbHNlIHdoZW4gY29vcmQgaXMgYWxyZWFkeSBoaXQvbWlzc2VkXG4gICAgICAgICAgICAgICAgICAgIGxldCBzcUhvbGRlckNvb3JkID0gcmVzdWx0LnNsaWNlKDUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgaGl0TWlzcyA9IHJlc3VsdC5zbGljZSgwLDQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInNxSG9sZGVyQ29vcmQ6IFwiLCBzcUhvbGRlckNvb3JkKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJoaXRNaXNzOiBcIiwgaGl0TWlzcyk7XG4gICAgICAgICAgICAgICAgICAgIGZpbGxTcXVhcmVET00oc3FIb2xkZXJDb29yZCwgaGl0TWlzcywgY3VycmVudFBsYXllciwgUDEsIFAyKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJQMiBteUhpdHM6IFwiLCBQMi5teUhpdHMpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlAyIG15TWlzc2VzOiBcIiwgUDIubXlNaXNzZXMpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hlY2tGb3JXaW4oKSA9PT0gZmFsc2UpIHsgXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHBsYXllclR1cm5Td2l0Y2gsIDE1MDApOy8vZ2l2ZSBpdCB0aW1lXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy9wbGF5ZXJUdXJuU3dpdGNoKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcblxuICAgIGZ1bmN0aW9uIGNvbXB1dGVyVHVybigpIHtcbiAgICAgICAgLy9jdXJyZW50IHBsYXllciBqdXN0IHN3aXRjaGVkIHRvIFAyLCBha2EgQ29tcHV0ZXJcbiAgICAgICAgbGV0IHJlc3VsdCA9IFAyLmRpZEF0a01pc3MoUDIucmFuZG9tQXRrQ2hvaWNlKCksIFAxLmdldEF0dGFja2VkKTtcbiAgICAgICAgbGV0IHNxSG9sZGVyQ29vcmQgPSByZXN1bHQuc2xpY2UoNSk7XG4gICAgICAgIGxldCBoaXRNaXNzID0gcmVzdWx0LnNsaWNlKDAsNCk7XG5cbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKFwicmVzdWx0OiBcIiwgcmVzdWx0KTtcbiAgICAgICAgY29uc29sZS5sb2coXCJzcUhvbGRlckNvb3JkOiBcIiwgc3FIb2xkZXJDb29yZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiaGl0TWlzczogXCIsIGhpdE1pc3MpO1xuICAgICAgICBmaWxsU3F1YXJlRE9NKHNxSG9sZGVyQ29vcmQsIGhpdE1pc3MsIGN1cnJlbnRQbGF5ZXIsIFAxLCBQMik7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiUDIgbXlIaXRzOiBcIiwgUDIubXlIaXRzKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJQMiBteU1pc3NlczogXCIsIFAyLm15TWlzc2VzKTtcbiAgICAgICAgaWYgKGNoZWNrRm9yV2luKCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KHBsYXllclR1cm5Td2l0Y2gsIDE1MDApOy8vZ2l2ZSBpdCB0aW1lXG4gICAgICAgIH1cbiAgICAgICAgc3Bpbm5lck9mZigpO1xuICAgIH1cblxuICAgIC8qIFAxLmRpZEF0a01pc3MoJ0EyJywgUDIuZ2V0QXR0YWNrZWQpO1xuICAgIFAyLmRpZEF0a01pc3MoUDIucmFuZG9tQXRrQ2hvaWNlKCksIFAxLmdldEF0dGFja2VkKTtcbiAgICBjb25zb2xlLmxvZyhQMS5wbGF5ZXJCb2FyZCk7XG4gICAgY29uc29sZS5sb2coUDIucGxheWVyQm9hcmQpO1xuICAgIGNvbnNvbGUubG9nKFAxLm15SGl0cyk7XG4gICAgY29uc29sZS5sb2coUDIubXlIaXRzKTtcbiAgICBjb25zb2xlLmxvZyhQMi5teU1pc3Nlcyk7ICovXG59XG5cblxuYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgdG9nZ2xlQnV0dG9uKCk7XG4gICAgYnRuLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgcmVhZHlCdG4uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICBheGlzVG9nZ2xlci5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIGxlbmd0aEZvclNoaXAuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICBwbGFjZVNoaXBJbnN0cnVjdC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIHRvZ2dsZUJ1dHRvbigpO1xuICAgIHJlc2V0RE9NKCk7XG4gICAgc3RhcnRHYW1lKCk7XG4gICAgXG59KVxuXG5zdGFydEdhbWUoKTtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxvZ2ljdG9kbygpIHtcblxuICAgIGxldCBnYW1lYm9hcmRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImdhbWVib2FyZFwiKTtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGdhbWVib2FyZHMsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIGxldCBsZXR0ZXJOdW1iQXJyID0gWydlbXB0eScsJ0EnLCdCJywnQycsJ0QnLCdFJywnRicsJ0cnLCdIJywnSScsJ0onXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMTsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDExOyBqKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgbmV3U3EgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgICAgIG5ld1NxLmNsYXNzTmFtZSA9IGBzcXVhcmVgO1xuICAgICAgICAgICAgICAgIGxldCBzb21lQ29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgc29tZUNvbnRlbnQuY2xhc3NOYW1lID0gXCJjb250ZW50elwiO1xuICAgICAgICAgICAgICAgIGlmIChqID09PSAwICYmIGkgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc29tZUNvbnRlbnQuaW5uZXJIVE1MID0gYCR7aX1gO1xuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICAgICAgaWYgKGkgPT09IDAgJiYgaiAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBzb21lQ29udGVudC5pbm5lckhUTUwgPSBgJHtsZXR0ZXJOdW1iQXJyW2pdfWBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3U3EuYXBwZW5kQ2hpbGQoc29tZUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIGVsLmFwcGVuZENoaWxkKG5ld1NxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGV0IGZpcnN0U2VjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDFHXCIpO1xuICAgIGxldCBzZXRTcXVhcmVzID0gZmlyc3RTZWN0aW9uLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJzcXVhcmVcIik7XG4gICAgbGV0IHNldFNxQXJyYXkgPSBBcnJheS5mcm9tKHNldFNxdWFyZXMpOy8vY29udmVydCB0byBhcnJheVxuXG4gICAgbGV0IHNlY29uZFNlY3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAxVFwiKTtcbiAgICBsZXQgc2V0U2Vjb25kU3F1YXJlcyA9IHNlY29uZFNlY3Rpb24uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInNxdWFyZVwiKTtcbiAgICBsZXQgc2V0U2Vjb25kU3FBcnJheSA9IEFycmF5LmZyb20oc2V0U2Vjb25kU3F1YXJlcyk7Ly9jb252ZXJ0IHRvIGFycmF5XG5cbiAgICBsZXQgdGhpcmRTZWN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMkdcIik7XG4gICAgbGV0IHNldFRoaXJkU3F1YXJlcyA9IHRoaXJkU2VjdGlvbi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic3F1YXJlXCIpO1xuICAgIGxldCBzZXRUaGlyZFNxQXJyYXkgPSBBcnJheS5mcm9tKHNldFRoaXJkU3F1YXJlcyk7Ly9jb252ZXJ0IHRvIGFycmF5XG5cbiAgICBsZXQgZm91cnRoU2VjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDJUXCIpO1xuICAgIGxldCBzZXRGb3VydGhTcXVhcmVzID0gZm91cnRoU2VjdGlvbi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic3F1YXJlXCIpO1xuICAgIGxldCBzZXRGb3VydGhTcUFycmF5ID0gQXJyYXkuZnJvbShzZXRGb3VydGhTcXVhcmVzKTsvL2NvbnZlcnQgdG8gYXJyYXlcblxuICAgIGZ1bmN0aW9uIHNldENvbHVtbnMoc29tZUFycmF5LCBuYW1lKSB7XG5cbiAgICAgICAgbGV0IGxldHRlck51bWJBcnIgPSBbJ2VtcHR5JywnQScsJ0InLCdDJywnRCcsJ0UnLCdGJywnRycsJ0gnLCdJJywnSiddO1xuICAgICAgICBsZXQgajAgPSAwO1xuICAgICAgICBsZXQgajEgPSAwO1xuICAgICAgICBsZXQgajIgPSAwO1xuICAgICAgICBsZXQgajMgPSAwO1xuICAgICAgICBsZXQgajQgPSAwO1xuICAgICAgICBsZXQgajUgPSAwO1xuICAgICAgICBsZXQgajYgPSAwO1xuICAgICAgICBsZXQgajcgPSAwO1xuICAgICAgICBsZXQgajggPSAwO1xuICAgICAgICBsZXQgajkgPSAwO1xuICAgICAgICBsZXQgajEwID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzb21lQXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpJTExID09PSAwKSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzBdfWA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFyclswXX0ke1tqMF19X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgajArKztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5jbGFzc05hbWUgPSBgc3F1YXJlICR7bGV0dGVyTnVtYkFyclsxXX1gO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFyclsxXX0ke1tqMV19X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGoxKys7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGklMTEgPT09IDIpIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbMl19YDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLnNldEF0dHJpYnV0ZShcImlkXCIsIGAke2xldHRlck51bWJBcnJbMl19JHtbajJdfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqMisrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmIChpJTExID09PSAzKSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzNdfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzNdfSR7W2ozXX1fYCtuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgajMrKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gNCkge1xuICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5jbGFzc05hbWUgPSBgc3F1YXJlICR7bGV0dGVyTnVtYkFycls0XX1gO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFycls0XX0ke1tqNF19X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGo0Kys7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGklMTEgPT09IDUpIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbNV19YDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLnNldEF0dHJpYnV0ZShcImlkXCIsIGAke2xldHRlck51bWJBcnJbNV19JHtbajVdfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqNSsrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmIChpJTExID09PSA2KSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzZdfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzZdfSR7W2o2XX1fYCtuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgajYrKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gNykge1xuICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5jbGFzc05hbWUgPSBgc3F1YXJlICR7bGV0dGVyTnVtYkFycls3XX1gO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFycls3XX0ke1tqN119X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGo3Kys7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGklMTEgPT09IDgpIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbOF19YDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLnNldEF0dHJpYnV0ZShcImlkXCIsIGAke2xldHRlck51bWJBcnJbOF19JHtbajhdfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqOCsrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmIChpJTExID09PSA5KSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzldfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzldfSR7W2o5XX1fYCtuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgajkrKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gMTApIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbMTBdfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzEwXX0ke1tqMTBdfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqMTArKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRDb2x1bW5zKHNldFNxQXJyYXksIFwiZmlyc3RPbmVcIik7XG4gICAgc2V0Q29sdW1ucyhzZXRTZWNvbmRTcUFycmF5LCBcInNlY29uZE9uZVwiKTtcbiAgICBzZXRDb2x1bW5zKHNldFRoaXJkU3FBcnJheSwgXCJ0aGlyZE9uZVwiKTtcbiAgICBzZXRDb2x1bW5zKHNldEZvdXJ0aFNxQXJyYXksIFwiZm91cnRoT25lXCIpO1xuXG4gICAgXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwbGFjZVNoaXBzRE9NKGFycmF5LCBwbGF5ZXIsIFAxLCBQMikgey8vYXJyYXkgZnJvbSBwbGF5ZXJQbGFjZVNoaXBTcGFuXG4gICAgaWYgKHBsYXllciA9PT0gUDEpIHtcbiAgICAgICAgYXJyYXkuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBsZXQgc3RyID0gZWxbMF07XG4gICAgICAgICAgICBsZXQgc3BlY2lmaWNTcUZvdW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7c3RyfV9maXJzdE9uZWApO1xuICAgICAgICAgICAgc3BlY2lmaWNTcUZvdW5kLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiYmx1ZVwiO1xuICAgICAgICB9KVxuICAgIH0gZWxzZSBpZiAocGxheWVyID09PSBQMikge1xuICAgICAgICBhcnJheS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGxldCBzdHIgPSBlbFswXTtcbiAgICAgICAgICAgIGxldCBzcGVjaWZpY1NxRm91bmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtzdHJ9X3RoaXJkT25lYCk7XG4gICAgICAgICAgICBzcGVjaWZpY1NxRm91bmQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJncmVlblwiO1xuICAgICAgICB9KVxuICAgIH1cbiAgICBcbn0gIFxuXG4vKiBleHBvcnQgZnVuY3Rpb24gdW5kb0hvdmVyRE9NKGFycmF5LCBwbGF5ZXIsIFAxLCBQMikge1xuICAgIGlmIChwbGF5ZXIgPT09IFAxKSB7XG4gICAgICAgIGFycmF5LmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgbGV0IHN0ciA9IGVsWzBdO1xuICAgICAgICAgICAgbGV0IHNwZWNpZmljU3FGb3VuZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGAke3N0cn1fZmlyc3RPbmVgKTtcbiAgICAgICAgICAgIHNwZWNpZmljU3FGb3VuZC5zdHlsZS5vcGFjaXR5ID0gXCIwLjhcIjtcbiAgICAgICAgfSlcbiAgICB9IGVsc2UgaWYgKHBsYXllciA9PT0gUDIpIHtcbiAgICAgICAgYXJyYXkuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBsZXQgc3RyID0gZWxbMF07XG4gICAgICAgICAgICBsZXQgc3BlY2lmaWNTcUZvdW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7c3RyfV90aGlyZE9uZWApO1xuICAgICAgICAgICAgc3BlY2lmaWNTcUZvdW5kLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiZ3JlZW5cIjtcbiAgICAgICAgfSlcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBob3ZlclNoaXBzRE9NKGFycmF5LCBwbGF5ZXIsIFAxLCBQMikgey8vYXJyYXkgZnJvbSBwbGF5ZXJQbGFjZVNoaXBTcGFuXG4gICAgaWYgKHBsYXllciA9PT0gUDEpIHtcbiAgICAgICAgYXJyYXkuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBsZXQgc3RyID0gZWxbMF07XG4gICAgICAgICAgICBsZXQgc3BlY2lmaWNTcUZvdW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7c3RyfV9maXJzdE9uZWApO1xuICAgICAgICAgICAgc3BlY2lmaWNTcUZvdW5kLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwibGlnaHRibHVlXCI7XG4gICAgICAgICAgICBzcGVjaWZpY1NxRm91bmQuc3R5bGUub3BhY2l0eSA9IFwiMVwiO1xuICAgICAgICB9KVxuICAgIH0gZWxzZSBpZiAocGxheWVyID09PSBQMikge1xuICAgICAgICBhcnJheS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGxldCBzdHIgPSBlbFswXTtcbiAgICAgICAgICAgIGxldCBzcGVjaWZpY1NxRm91bmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtzdHJ9X3RoaXJkT25lYCk7XG4gICAgICAgICAgICBzcGVjaWZpY1NxRm91bmQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJncmVlblwiO1xuICAgICAgICB9KVxuICAgIH1cbiAgICBcbn0gICAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZmlsbFNxdWFyZURPTShzdHIsIGhpdE9yTWlzcywgcGxheWVyLCBQMSwgUDIpIHsvL2lucHV0IHN0cmluZyBvZiBjb29yZFxuICAgIGlmIChwbGF5ZXIgPT09IFAxKSB7XG4gICAgICAgIGxldCBzcVRvQ2hhbmdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7c3RyfV9zZWNvbmRPbmVgKTtcbiAgICAgICAgaWYgKGhpdE9yTWlzcyA9PT0gXCJtaXNzXCIpIHtcbiAgICAgICAgICAgIHNxVG9DaGFuZ2Uuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJ3aGl0ZVwiO1xuICAgICAgICB9IGVsc2UgaWYgKGhpdE9yTWlzcyA9PT0gXCJoaXRzXCIpIHtcbiAgICAgICAgICAgIHNxVG9DaGFuZ2Uuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJkYXJrb3JhbmdlXCI7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHBsYXllciA9PT0gUDIpIHtcbiAgICAgICAgbGV0IHNxVG9DaGFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtzdHJ9X2ZvdXJ0aE9uZWApO1xuICAgICAgICBpZiAoaGl0T3JNaXNzID09PSBcIm1pc3NcIikge1xuICAgICAgICAgICAgc3FUb0NoYW5nZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIndoaXRlXCI7XG4gICAgICAgIH0gZWxzZSBpZiAoaGl0T3JNaXNzID09PSBcImhpdHNcIikge1xuICAgICAgICAgICAgc3FUb0NoYW5nZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcImRhcmtvcmFuZ2VcIjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNoaXBTdW5rRE9NKHN0ciwgcGxheWVyLCBQMSwgUDIpIHsvL2lucHV0IHN0cmluZyBjb29yZFxuICAgIGlmIChwbGF5ZXIgPT09IFAxKSB7IFxuICAgICAgICBsZXQgc3FUb1NpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtzdHJ9X3NlY29uZE9uZWApO1xuICAgICAgICBzcVRvU2luay5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcImJsYWNrXCI7XG4gICAgfSBlbHNlIGlmIChwbGF5ZXIgPT09IFAyKSB7XG5cbiAgICAgICAgbGV0IHNxVG9TaW5rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7c3RyfV9mb3VydGhPbmVgKTtcbiAgICAgICAgc3FUb1Npbmsuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJibGFja1wiO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNocmlua093bkJvYXJkKHBsYXllciwgUDEsIFAyKSB7XG4gICAgaWYgKHBsYXllciA9PT0gUDEpIHtcbiAgICAgICAgbGV0IGJvYXJkVG9TaHJpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAxR1wiKTtcbiAgICAgICAgYm9hcmRUb1Nocmluay5zdHlsZS53aWR0aCA9IFwiNjAlXCI7XG4gICAgfSBlbHNlIGlmIChwbGF5ZXIgPT09IFAyKSB7XG4gICAgICAgIGxldCBib2FyZFRvU2hyaW5rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMkdcIik7XG4gICAgICAgIGJvYXJkVG9TaHJpbmsuc3R5bGUud2lkdGggPSBcIjYwJVwiO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhpZGVDb21wQm9hcmQoKSB7XG5cbiAgICBmdW5jdGlvbiByYW5kb21Db2xvcihicmlnaHRuZXNzKXtcbiAgICAgICAgZnVuY3Rpb24gcmFuZG9tQ2hhbm5lbChicmlnaHRuZXNzKXtcbiAgICAgICAgICB2YXIgciA9IDI1NS1icmlnaHRuZXNzO1xuICAgICAgICAgIHZhciBuID0gMHwoKE1hdGgucmFuZG9tKCkgKiByKSArIGJyaWdodG5lc3MpO1xuICAgICAgICAgIHZhciBzID0gbi50b1N0cmluZygxNik7XG4gICAgICAgICAgcmV0dXJuIChzLmxlbmd0aD09MSkgPyAnMCcrcyA6IHM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcjJyArIHJhbmRvbUNoYW5uZWwoYnJpZ2h0bmVzcykgKyByYW5kb21DaGFubmVsKGJyaWdodG5lc3MpICsgcmFuZG9tQ2hhbm5lbChicmlnaHRuZXNzKTtcbiAgICB9XG5cbiAgICBsZXQgY29tcEdhbWVCb2FyZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDJHXCIpO1xuICAgIGxldCBjaGlsZE5vZGVzID0gY29tcEdhbWVCb2FyZC5jaGlsZE5vZGVzO1xuICAgIGxldCBhcnJheSA9IEFycmF5LmZyb20oY2hpbGROb2Rlcyk7XG4gICAgYXJyYXkuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgbGV0IG5ld0NvbG9yID0gcmFuZG9tQ29sb3IoMTI1KTtcbiAgICAgICAgbm9kZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBgJHtuZXdDb2xvcn1gO1xuICAgIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldERPTSgpIHtcbiAgICBsZXQgZmlyc3ROb2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMUdcIik7XG4gICAgbGV0IHNlY29uZE5vZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAxVFwiKTtcbiAgICBsZXQgdGhpcmROb2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMkdcIik7XG4gICAgbGV0IGZvdXJ0aE5vZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAyVFwiKTtcbiAgICB3aGlsZSAoZmlyc3ROb2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgZmlyc3ROb2RlLnJlbW92ZUNoaWxkKGZpcnN0Tm9kZS5sYXN0Q2hpbGQpO1xuICAgIH1cbiAgICB3aGlsZSAoc2Vjb25kTm9kZS5maXJzdENoaWxkKSB7XG4gICAgICAgIHNlY29uZE5vZGUucmVtb3ZlQ2hpbGQoc2Vjb25kTm9kZS5sYXN0Q2hpbGQpO1xuICAgIH1cbiAgICB3aGlsZSAodGhpcmROb2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgdGhpcmROb2RlLnJlbW92ZUNoaWxkKHRoaXJkTm9kZS5sYXN0Q2hpbGQpO1xuICAgIH1cbiAgICB3aGlsZSAoZm91cnRoTm9kZS5maXJzdENoaWxkKSB7XG4gICAgICAgIGZvdXJ0aE5vZGUucmVtb3ZlQ2hpbGQoZm91cnRoTm9kZS5sYXN0Q2hpbGQpO1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==