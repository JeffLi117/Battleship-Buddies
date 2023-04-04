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
___CSS_LOADER_EXPORT___.push([module.id, "html, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed, \nfigure, figcaption, footer, header, hgroup, \nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\tfont-size: 100%;\n\tfont: inherit;\n\tvertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure, \nfooter, header, hgroup, menu, nav, section {\n\tdisplay: block;\n}\nbody {\n\tline-height: 1;\n}\nol, ul {\n\tlist-style: none;\n}\nblockquote, q {\n\tquotes: none;\n}\nblockquote:before, blockquote:after,\nq:before, q:after {\n\tcontent: '';\n\tcontent: none;\n}\ntable {\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}\n\n:root {\n    --primary: #ff6fb2; \n    --secondary: #c3195d; \n    --tertiary: #680747; \n    --quaternary: #141010; \n}\n\nhtml, body, div#content {\n    height: 100%;\n    width: 100%;\n    font-size: 15px;\n}\n\ndiv#p1Seperator {\n\tbackground-color: var(--primary);\n}\ndiv#p2Seperator {\n\tbackground-color:aqua;\n}\n\ndiv#P1G, div#P2G {\n\twidth: 60%;\n\tmargin: auto;\n}\n\ndiv.gameboard {\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\tborder: 3px solid pink;\n}\n\n.descriptor {\n\tfont-family: 'Space Grotesk', sans-serif;\n\tfont-size: 1.2rem;\n\tpadding: 0.5rem;\n\ttext-align: center;\n}\n\nbutton#newGameBtn {\n\tbackground-color: #c3195d;\n\tcolor:bisque;\n\tposition: absolute;\n\ttop: 5px;\n\tright: 5px;\n\tdisplay: none;\n}\n\ndiv#doneWithShips {\n\tbackground-color: #680747;\n\tcolor:bisque;\n\tborder: 2px inset gray;\n\tfont-size: 1.0rem;\n\tposition: absolute;\n\tleft: 5px;\n\tpadding: 4px;\n\ttop: 65px;\n\t/* display: none; */\n}\n\ndiv#axisToggle {\n\tbackground-color: #c3195d;\n\tborder: 2px inset gray;\n\tfont-size: 1.0rem;\n\tcolor:bisque;\n\tposition: absolute;\n\tpadding: 4px;\n\ttop: 31px;\n\tleft: 5px;\n\t/* display: none; */\n}\n\ndiv#topBar {\n\tposition: relative;\n}\n\ndiv[class^=\"square\"] {\n\tposition: relative;\n\tflex-basis: calc(9% - 10px);\n\tmargin: 5px;\n\tborder: 1px solid;\n\tbox-sizing: border-box;\n}\n\ndiv[class^=\"square\"]::before {\n\tcontent: '';\n\tdisplay: block;\n\tpadding-top: 100%;\n}\n\ndiv[class^=\"square\"] .contentz {\n\tposition: absolute;\n\ttop: 0; left: 0;\n\theight: 100%;\n\twidth: 100%;\n  \n\tdisplay: flex;               /* added for centered text */\n\tjustify-content: center;     /* added for centered text */\n\talign-items: center;         /* added for centered text */\n}\n\n/* \ndiv#content {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(2, 40%);\n\tgrid-template-rows: repeat(2, 40%);\n}\n\ndiv.gameboard {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(11, 8%);\n\tgrid-template-rows: repeat(11, 8%);\n}\n\ndiv[class^=\"square\"] {\n\tbackground-color: rgb(184, 184, 184);\n\tborder: 1px solid black;\n\topacity: 0.5;\n\taspect-ratio: 1;\n} */\n\n/* loading/spinner stuff */\n\ndiv#lengthIndicator {\n\t/* display: none; */\n\tdisplay: flex;\n\tjustify-content: left;\n\talign-items: center;\n\tgap: 0.5rem;\n\tfont-size: 1.1rem;\n\tposition: absolute;\n\ttop: 5px;\n\tleft: 5px;\n}\n\ninput#lengthInput {\n\twidth: 25%;\n}\n\ndiv#promptPlacingP1 {\n\t/* display: none; */\n\tposition: absolute;\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\twidth: 14%;\n\ttop: 5px;\n\tright: 8px;\n}\n\ndiv#battleStart {\n\tfont-size: 1.3rem;\n\tdisplay: none;\n\tposition: absolute;\n\twidth: 14%;\n\ttop: 5px;\n\tright: 5px;\n}\n\n#loader {\n\tdisplay: none;\n\ttop: 50%;\n\tleft: 50%;\n\tposition: absolute;\n\ttransform: translate(-50%, -50%);\n}\n  \n.loading {\n\tborder: 8px solid rgb(220, 0, 0);\n\twidth: 60px;\n\theight: 60px;\n\tborder-radius: 50%;\n\tborder-top-color: #ff6320;\n\tborder-left-color: #ff7300;\n\tanimation: spin 1s infinite ease-in;\n}\n  \n@keyframes spin {\n\t0% {\n\t  transform: rotate(0deg);\n\t}\n  \n\t100% {\n\t  transform: rotate(360deg);\n\t}\n}\n\n@media screen and (min-width: 800px) {\n\thtml, body, div#content {\n\t  font-size: 15px;\n\t}\n\n\tbody {\n\t\tdisplay: flex;\n\t\tjustify-content: center;\n\t\tbackground-color: var(--tertiary);\n\t}\n\n\tdiv#content {\n\t\twidth: 60%;\n\t}\n\n\tdiv#axisToggle {\n\t\t\n\t\ttop: 37px;\n\t\t/* display: none; */\n\t}\n\n\tdiv#doneWithShips {\n\t\ttop: 75px;\n\t}\n}", "",{"version":3,"sources":["webpack://./src/style.css"],"names":[],"mappings":"AAAA;;;;;;;;;;;;;CAaC,SAAS;CACT,UAAU;CACV,SAAS;CACT,eAAe;CACf,aAAa;CACb,wBAAwB;AACzB;AACA,gDAAgD;AAChD;;CAEC,cAAc;AACf;AACA;CACC,cAAc;AACf;AACA;CACC,gBAAgB;AACjB;AACA;CACC,YAAY;AACb;AACA;;CAEC,WAAW;CACX,aAAa;AACd;AACA;CACC,yBAAyB;CACzB,iBAAiB;AAClB;;AAEA;IACI,kBAAkB;IAClB,oBAAoB;IACpB,mBAAmB;IACnB,qBAAqB;AACzB;;AAEA;IACI,YAAY;IACZ,WAAW;IACX,eAAe;AACnB;;AAEA;CACC,gCAAgC;AACjC;AACA;CACC,qBAAqB;AACtB;;AAEA;CACC,UAAU;CACV,YAAY;AACb;;AAEA;CACC,aAAa;CACb,eAAe;CACf,sBAAsB;AACvB;;AAEA;CACC,wCAAwC;CACxC,iBAAiB;CACjB,eAAe;CACf,kBAAkB;AACnB;;AAEA;CACC,yBAAyB;CACzB,YAAY;CACZ,kBAAkB;CAClB,QAAQ;CACR,UAAU;CACV,aAAa;AACd;;AAEA;CACC,yBAAyB;CACzB,YAAY;CACZ,sBAAsB;CACtB,iBAAiB;CACjB,kBAAkB;CAClB,SAAS;CACT,YAAY;CACZ,SAAS;CACT,mBAAmB;AACpB;;AAEA;CACC,yBAAyB;CACzB,sBAAsB;CACtB,iBAAiB;CACjB,YAAY;CACZ,kBAAkB;CAClB,YAAY;CACZ,SAAS;CACT,SAAS;CACT,mBAAmB;AACpB;;AAEA;CACC,kBAAkB;AACnB;;AAEA;CACC,kBAAkB;CAClB,2BAA2B;CAC3B,WAAW;CACX,iBAAiB;CACjB,sBAAsB;AACvB;;AAEA;CACC,WAAW;CACX,cAAc;CACd,iBAAiB;AAClB;;AAEA;CACC,kBAAkB;CAClB,MAAM,EAAE,OAAO;CACf,YAAY;CACZ,WAAW;;CAEX,aAAa,gBAAgB,4BAA4B;CACzD,uBAAuB,MAAM,4BAA4B;CACzD,mBAAmB,UAAU,4BAA4B;AAC1D;;AAEA;;;;;;;;;;;;;;;;;;GAkBG;;AAEH,0BAA0B;;AAE1B;CACC,mBAAmB;CACnB,aAAa;CACb,qBAAqB;CACrB,mBAAmB;CACnB,WAAW;CACX,iBAAiB;CACjB,kBAAkB;CAClB,QAAQ;CACR,SAAS;AACV;;AAEA;CACC,UAAU;AACX;;AAEA;CACC,mBAAmB;CACnB,kBAAkB;CAClB,aAAa;CACb,eAAe;CACf,UAAU;CACV,QAAQ;CACR,UAAU;AACX;;AAEA;CACC,iBAAiB;CACjB,aAAa;CACb,kBAAkB;CAClB,UAAU;CACV,QAAQ;CACR,UAAU;AACX;;AAEA;CACC,aAAa;CACb,QAAQ;CACR,SAAS;CACT,kBAAkB;CAClB,gCAAgC;AACjC;;AAEA;CACC,gCAAgC;CAChC,WAAW;CACX,YAAY;CACZ,kBAAkB;CAClB,yBAAyB;CACzB,0BAA0B;CAC1B,mCAAmC;AACpC;;AAEA;CACC;GACE,uBAAuB;CACzB;;CAEA;GACE,yBAAyB;CAC3B;AACD;;AAEA;CACC;GACE,eAAe;CACjB;;CAEA;EACC,aAAa;EACb,uBAAuB;EACvB,iCAAiC;CAClC;;CAEA;EACC,UAAU;CACX;;CAEA;;EAEC,SAAS;EACT,mBAAmB;CACpB;;CAEA;EACC,SAAS;CACV;AACD","sourcesContent":["html, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed, \nfigure, figcaption, footer, header, hgroup, \nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\tfont-size: 100%;\n\tfont: inherit;\n\tvertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure, \nfooter, header, hgroup, menu, nav, section {\n\tdisplay: block;\n}\nbody {\n\tline-height: 1;\n}\nol, ul {\n\tlist-style: none;\n}\nblockquote, q {\n\tquotes: none;\n}\nblockquote:before, blockquote:after,\nq:before, q:after {\n\tcontent: '';\n\tcontent: none;\n}\ntable {\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}\n\n:root {\n    --primary: #ff6fb2; \n    --secondary: #c3195d; \n    --tertiary: #680747; \n    --quaternary: #141010; \n}\n\nhtml, body, div#content {\n    height: 100%;\n    width: 100%;\n    font-size: 15px;\n}\n\ndiv#p1Seperator {\n\tbackground-color: var(--primary);\n}\ndiv#p2Seperator {\n\tbackground-color:aqua;\n}\n\ndiv#P1G, div#P2G {\n\twidth: 60%;\n\tmargin: auto;\n}\n\ndiv.gameboard {\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\tborder: 3px solid pink;\n}\n\n.descriptor {\n\tfont-family: 'Space Grotesk', sans-serif;\n\tfont-size: 1.2rem;\n\tpadding: 0.5rem;\n\ttext-align: center;\n}\n\nbutton#newGameBtn {\n\tbackground-color: #c3195d;\n\tcolor:bisque;\n\tposition: absolute;\n\ttop: 5px;\n\tright: 5px;\n\tdisplay: none;\n}\n\ndiv#doneWithShips {\n\tbackground-color: #680747;\n\tcolor:bisque;\n\tborder: 2px inset gray;\n\tfont-size: 1.0rem;\n\tposition: absolute;\n\tleft: 5px;\n\tpadding: 4px;\n\ttop: 65px;\n\t/* display: none; */\n}\n\ndiv#axisToggle {\n\tbackground-color: #c3195d;\n\tborder: 2px inset gray;\n\tfont-size: 1.0rem;\n\tcolor:bisque;\n\tposition: absolute;\n\tpadding: 4px;\n\ttop: 31px;\n\tleft: 5px;\n\t/* display: none; */\n}\n\ndiv#topBar {\n\tposition: relative;\n}\n\ndiv[class^=\"square\"] {\n\tposition: relative;\n\tflex-basis: calc(9% - 10px);\n\tmargin: 5px;\n\tborder: 1px solid;\n\tbox-sizing: border-box;\n}\n\ndiv[class^=\"square\"]::before {\n\tcontent: '';\n\tdisplay: block;\n\tpadding-top: 100%;\n}\n\ndiv[class^=\"square\"] .contentz {\n\tposition: absolute;\n\ttop: 0; left: 0;\n\theight: 100%;\n\twidth: 100%;\n  \n\tdisplay: flex;               /* added for centered text */\n\tjustify-content: center;     /* added for centered text */\n\talign-items: center;         /* added for centered text */\n}\n\n/* \ndiv#content {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(2, 40%);\n\tgrid-template-rows: repeat(2, 40%);\n}\n\ndiv.gameboard {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(11, 8%);\n\tgrid-template-rows: repeat(11, 8%);\n}\n\ndiv[class^=\"square\"] {\n\tbackground-color: rgb(184, 184, 184);\n\tborder: 1px solid black;\n\topacity: 0.5;\n\taspect-ratio: 1;\n} */\n\n/* loading/spinner stuff */\n\ndiv#lengthIndicator {\n\t/* display: none; */\n\tdisplay: flex;\n\tjustify-content: left;\n\talign-items: center;\n\tgap: 0.5rem;\n\tfont-size: 1.1rem;\n\tposition: absolute;\n\ttop: 5px;\n\tleft: 5px;\n}\n\ninput#lengthInput {\n\twidth: 25%;\n}\n\ndiv#promptPlacingP1 {\n\t/* display: none; */\n\tposition: absolute;\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\twidth: 14%;\n\ttop: 5px;\n\tright: 8px;\n}\n\ndiv#battleStart {\n\tfont-size: 1.3rem;\n\tdisplay: none;\n\tposition: absolute;\n\twidth: 14%;\n\ttop: 5px;\n\tright: 5px;\n}\n\n#loader {\n\tdisplay: none;\n\ttop: 50%;\n\tleft: 50%;\n\tposition: absolute;\n\ttransform: translate(-50%, -50%);\n}\n  \n.loading {\n\tborder: 8px solid rgb(220, 0, 0);\n\twidth: 60px;\n\theight: 60px;\n\tborder-radius: 50%;\n\tborder-top-color: #ff6320;\n\tborder-left-color: #ff7300;\n\tanimation: spin 1s infinite ease-in;\n}\n  \n@keyframes spin {\n\t0% {\n\t  transform: rotate(0deg);\n\t}\n  \n\t100% {\n\t  transform: rotate(360deg);\n\t}\n}\n\n@media screen and (min-width: 800px) {\n\thtml, body, div#content {\n\t  font-size: 15px;\n\t}\n\n\tbody {\n\t\tdisplay: flex;\n\t\tjustify-content: center;\n\t\tbackground-color: var(--tertiary);\n\t}\n\n\tdiv#content {\n\t\twidth: 60%;\n\t}\n\n\tdiv#axisToggle {\n\t\t\n\t\ttop: 37px;\n\t\t/* display: none; */\n\t}\n\n\tdiv#doneWithShips {\n\t\ttop: 75px;\n\t}\n}"],"sourceRoot":""}]);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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NkQsSUFBSTtBQUNqRTtBQUNBLFNBQVM7QUFDVCxNQUFNO0FBQ047QUFDQTtBQUNBLDZEQUE2RCxJQUFJO0FBQ2pFO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZEQUE2RCxJQUFJO0FBQ2pFO0FBQ0EsU0FBUztBQUNULE1BQU07QUFDTjtBQUNBO0FBQ0EsNkRBQTZELElBQUk7QUFDakU7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQSxzREFBc0Q7QUFDdEQ7QUFDQTtBQUNBO0FBQ0EsNkRBQTZELElBQUk7QUFDakU7QUFDQTtBQUNBLFNBQVM7QUFDVCxNQUFNO0FBQ047QUFDQTtBQUNBLDZEQUE2RCxJQUFJO0FBQ2pFO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxJQUFJOztBQUVHLHdEQUF3RDtBQUMvRDtBQUNBLG9EQUFvRCxJQUFJO0FBQ3hEO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBLE1BQU07QUFDTixvREFBb0QsSUFBSTtBQUN4RDtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVPLDJDQUEyQztBQUNsRDtBQUNBLGtEQUFrRCxJQUFJO0FBQ3REO0FBQ0EsTUFBTTs7QUFFTixrREFBa0QsSUFBSTtBQUN0RDtBQUNBO0FBQ0E7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7O0FBRU87O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0MsU0FBUztBQUNqRCxLQUFLO0FBQ0w7O0FBRU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vbG9naWMuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vc3JjL3N0eWxlLmNzcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL3NyYy9zdHlsZS5jc3M/NzE2MyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL3NyYy9pbmRleC5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9zcmMvbG9naWN0b2RvLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IFNoaXAgPSAobnVtLCBpZCkgPT4ge1xuICAgIGxldCBsZW5ndGggPSBudW07XG4gICAgbGV0IGhpdHMgPSAwO1xuICAgIGxldCBzdW5rT3JOb3QgPSBmYWxzZTtcbiAgICBsZXQgc2hpcElEID0gaWQ7XG4gICAgXG4gICAgY29uc3QgZ2V0TGVuZ3RoID0gKCkgPT4gbGVuZ3RoO1xuICAgIGNvbnN0IGhpdCA9ICgpID0+IGhpdHMgPSBoaXRzICsgMTtcbiAgICBjb25zdCBnZXRIaXRzID0gKCkgPT4gaGl0cztcbiAgICBjb25zdCBpc1N1bmsgPSAoKSA9PiB7XG4gICAgICAgIGlmIChoaXRzID09PSBsZW5ndGgpIHsvL3dpbGwgbmVlZCB0byBtYWtlIHN1cmUgdGhleSBjYW4gb25seSBnZXQgaGl0IE9OQ0UgcGVyIGNvb3JkaW5hdGUgc3BhblxuICAgICAgICAgICAgc3Vua09yTm90ID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHN1bmtPck5vdDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBsZW5ndGgsIHN1bmtPck5vdCwgc2hpcElELCBoaXRzLFxuICAgICAgICBnZXRMZW5ndGgsXG4gICAgICAgIGdldEhpdHMsXG4gICAgICAgIGhpdCxcbiAgICAgICAgaXNTdW5rLFxuICAgIH07XG59O1xuXG5jb25zdCBHYW1lYm9hcmQgPSAoKSA9PiB7XG4gICAgbGV0IGJvYXJkID0ge307XG4gICAgbGV0IHNoaXBDb3VudCA9IDA7Ly9jb3VudHMgIyBvZiBzaGlwcyB0b3RhbCBBTkQgdG8gZ2VuIElEXG4gICAgbGV0IGxldHRlck51bWJBcnIgPSBbJ0EnLCdCJywnQycsJ0QnLCdFJywnRicsJ0cnLCdIJywnSScsJ0onXTtcbiAgICBsZXQgbWlzc2VkU2hvdHMgPSBbXTtcbiAgICBsZXQgc2hvdHNIaXQgPSBbXTtcbiAgICBsZXQgc2hpcHNTdGlsbFVwID0gMDtcbiAgICAvL2lkZWFsbHkgc3RhcnQgd2l0aCAxMCAtLSBmb3VyIDFzLCB0aHJlZSAycywgdHdvIDNzLCBvbmUgNFxuXG4gICAgY29uc3QgYnVpbGRCb2FyZCA9ICgpID0+IHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDEwOyBqKyspIHtcbiAgICAgICAgICAgICAgICBib2FyZFtgJHtsZXR0ZXJOdW1iQXJyW2ldfSR7W2orMV19YF0gPSBcIlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZ2V0U2hpcHNBbGl2ZUNvdW50ID0gKCkgPT4gc2hpcHNTdGlsbFVwO1xuXG4gICAgY29uc3QgYXJlQWxsU3VuayA9ICgpID0+IHtcbiAgICAgICAgaWYgKGdldFNoaXBzQWxpdmVDb3VudCgpID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjb25zdCBtYWtlU2hpcCA9IChsZW5ndGgpID0+IHtcbiAgICAgICAgbGV0IG5ld1NoaXAgPSBTaGlwKGxlbmd0aCwgc2hpcENvdW50KTtcbiAgICAgICAgc2hpcENvdW50Kys7XG4gICAgICAgIHNoaXBzU3RpbGxVcCsrO1xuICAgICAgICByZXR1cm4gbmV3U2hpcDtcbiAgICB9XG4gICAgY29uc3QgZmluZFNwYW4gPSAoY29vcmRpbmF0ZXMsIGxlbmd0aCwgYXhpcykgPT4gey8vY29vcmQgdHlwZSBTdHJpbmdcbiAgICAgICAgbGV0IGFycmF5ID0gW107XG4gICAgICAgIGxldCB5VmFsdWVTdGFydCA9IG51bGw7XG4gICAgICAgIGxldCB4SW5kZXhTdGFydCA9IG51bGw7XG4gICAgICAgIC8vY2hhbmdlIGlucHV0IGNvb3JkaW5hdGVzIGludG8gYXJyYXk7IEEyIHRvIFtBXVsyXVxuICAgICAgICBsZXQgY29vcmRBcnIgPSBjb29yZGluYXRlcy5zcGxpdCgnJyk7XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJjb29yZEFyciBpbiBmaW5kU3BhbiBpcyBcIiwgY29vcmRBcnIpO1xuICAgICAgICB4SW5kZXhTdGFydCA9IGZpbmRYSW5kZXgoY29vcmRpbmF0ZXMpO1xuICAgICAgICBpZiAoY29vcmRBcnIubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICB5VmFsdWVTdGFydCA9IE51bWJlcihjb29yZEFyclsxXS5jb25jYXQoY29vcmRBcnJbMl0pKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgeVZhbHVlU3RhcnQgPSBOdW1iZXIoY29vcmRBcnJbMV0pO1xuICAgICAgICB9XG4gICAgICAgIC8vY29uc29sZS5sb2coXCJ5VmFsdWVTdGFydCBpbiBmaW5kU3BhbiBpcyBcIiwgeVZhbHVlU3RhcnQpO1xuICAgICAgICBpZiAobGVuZ3RoID09PSAxKSB7Ly9jYXNlIGxlbmd0aCA9PT0gMVxuICAgICAgICAgICAgYXJyYXkucHVzaChbY29vcmRBcnJbMF0rY29vcmRBcnJbMV1dKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChheGlzID09PSBcImhvcml6b250YWxcIikgey8vY2FzZSBsZW5ndGggPiAxXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgeFNwYW5BcnJheSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb29yZEFyci5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHhTcGFuQXJyYXkgPSBbbGV0dGVyTnVtYkFyclt4SW5kZXhTdGFydCtpXStjb29yZEFyclsxXStjb29yZEFyclsyXV07XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4U3BhbkFycmF5ID0gW2xldHRlck51bWJBcnJbeEluZGV4U3RhcnQraV0rY29vcmRBcnJbMV1dO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGFycmF5LnB1c2goeFNwYW5BcnJheSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGFycmF5LnB1c2goW2Nvb3JkQXJyWzBdKyh5VmFsdWVTdGFydCtpKV0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9XG4gICAgY29uc3QgZmluZFhJbmRleCA9IChjb29yZFN0cikgPT4gey8vaW5wdXQgc3RyaW5nXG4gICAgICAgIGxldCBjb29yZEFyciA9IGNvb3JkU3RyLnNwbGl0KCcnKTsvL2V4OiAnQTInIC0+IFsnQScsICcyJ11cbiAgICAgICAgbGV0IHhTdGFydCA9IGxldHRlck51bWJBcnIuaW5kZXhPZihgJHtjb29yZEFyclswXX1gKTtcbiAgICAgICAgcmV0dXJuIHhTdGFydDsvL291dHB1dCBudW1iZXJcbiAgICB9XG5cbiAgICBjb25zdCBub1NoaXBPdmVybGFwID0gKGFycmF5KSA9PiB7Ly9leDogW1tcIkE4XCJdLFtcIkI4XCJdXVxuICAgICAgICBsZXQgYm9vbGVhbiA9IG51bGw7XG4gICAgICAgIGxldCBsZW5ndGggPSBhcnJheS5sZW5ndGggLSAxO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGFyclRvU3RyaW5nID0gYXJyYXlbaV0udG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGlmIChib2FyZFtgJHthcnJUb1N0cmluZ31gXSAhPT0gXCJcIikge1xuICAgICAgICAgICAgICAgIGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYm9vbGVhbiA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJvb2xlYW47XG4gICAgfVxuXG4gICAgY29uc3QgcGxhY2VTaGlwID0gKHBvc2l0aW9uLCBsZW5ndGgsIGF4aXMpID0+IHsvL3Bvc2l0aW9uIHN0cmluZ1xuICAgICAgICBsZXQgeEluZGV4U3RhcnQgPSBmaW5kWEluZGV4KHBvc2l0aW9uKTtcbiAgICAgICAgbGV0IGNvb3JkQXJyID0gcG9zaXRpb24uc3BsaXQoJycpOy8vZXg6ICdBOCcgLT4gWydBJywgJzgnXVxuICAgICAgICBsZXQgeVZhbHVlU3RhcnQgPSBOdW1iZXIoY29vcmRBcnJbMV0pO1xuXG4gICAgICAgIC8qIGNvbnNvbGUubG9nKFwiWCBcIiwgKHhJbmRleFN0YXJ0KzEpKyhsZW5ndGgtMSkpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIlkgXCIsIHlWYWx1ZVN0YXJ0KyhsZW5ndGgtMSkpOyAqL1xuICAgICAgICBpZiAoYXhpcyA9PT0gXCJob3Jpem9udGFsXCIgJiYgKHhJbmRleFN0YXJ0KzEpKyhsZW5ndGgtMSkgPiAxMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJDYW5ub3QgcGxhY2Ugc2hpcCBvZmYgZ2FtZWJvYXJkXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGF4aXMgPT09IFwidmVydGljYWxcIiAmJiB5VmFsdWVTdGFydCsobGVuZ3RoLTEpID4gMTApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2Fubm90IHBsYWNlIHNoaXAgb2ZmIGdhbWVib2FyZFwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgc2hpcFNwYW4gPSBmaW5kU3Bhbihwb3NpdGlvbiwgbGVuZ3RoLCBheGlzKTsvL1tbXCJBN1wiXSxbXCJBOFwiXV1cbiAgICAgICAgaWYgKG5vU2hpcE92ZXJsYXAoc2hpcFNwYW4pKSB7XG4gICAgICAgICAgICBsZXQgbmV3U2hpcCA9IFNoaXAobGVuZ3RoLCBzaGlwQ291bnQpO1xuICAgICAgICAgICAgc2hpcFNwYW4uZm9yRWFjaChhcnJheSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGFyclRvU3RyaW5nID0gYXJyYXkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBib2FyZFtgJHthcnJUb1N0cmluZ31gXSA9IG5ld1NoaXA7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgc2hpcENvdW50Kys7XG4gICAgICAgICAgICBzaGlwc1N0aWxsVXArKztcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJTb3JyeSwgdGhlcmUncyBhIHNoaXAgaW4gdGhlIHdheSFcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCByZWNlaXZlQXR0YWNrID0gKHRhcmdldENvb3IpID0+IHsvL2Fzc3VtZXMgeW91IFxuICAgICAgICAvL0NBTidUIHJlLWF0dGFjayBhIHBvc2l0aW9uIHlvdSd2ZSBtaXNzZWQgT1IgaGl0IGFscmVhZHlcbiAgICAgICAgbGV0IHRhcmdldEluQXJyID0gW1t0YXJnZXRDb29yXV07XG4gICAgICAgIGlmIChub1NoaXBPdmVybGFwKHRhcmdldEluQXJyKSA9PT0gdHJ1ZSkgey8vY2hlY2tzIGlmIHNoaXAgaXMgdGhlcmVcbiAgICAgICAgICAgIC8vaWYgVFJVRSwgbWVhbnMgbm90aGluZyBpcyB0aGVyZVxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJObyBzaGlwIHdhcyBoaXQuIE5pY2UgdHJ5IVwiKTtcbiAgICAgICAgICAgIG1pc3NlZFNob3RzLnB1c2godGFyZ2V0Q29vcik7XG4gICAgICAgIH0gZWxzZSBpZiAobm9TaGlwT3ZlcmxhcCh0YXJnZXRJbkFycikgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBsZXQgc2hpcEZvdW5kID0gYm9hcmRbYCR7dGFyZ2V0Q29vcn1gXTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiR3JlYXQgc2hvdCEgWW91IGxhbmRlZCBhIGhpdC5cIik7XG4gICAgICAgICAgICBzaGlwRm91bmQuaGl0KCk7XG4gICAgICAgICAgICBpZiAoc2hpcEZvdW5kLmdldEhpdHMoKSA9PT0gc2hpcEZvdW5kLmdldExlbmd0aCgpKSB7XG4gICAgICAgICAgICAgICAgc2hpcHNTdGlsbFVwLS07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBib2FyZCxtaXNzZWRTaG90cyxzaG90c0hpdCxzaGlwQ291bnQsXG4gICAgICAgIG1ha2VTaGlwLFxuICAgICAgICBidWlsZEJvYXJkLFxuICAgICAgICBwbGFjZVNoaXAsXG4gICAgICAgIGZpbmRTcGFuLFxuICAgICAgICBmaW5kWEluZGV4LFxuICAgICAgICBub1NoaXBPdmVybGFwLFxuICAgICAgICByZWNlaXZlQXR0YWNrLFxuICAgICAgICBnZXRTaGlwc0FsaXZlQ291bnQsXG4gICAgICAgIGFyZUFsbFN1bmssXG4gICAgfTtcbn1cblxuY29uc3QgUGxheWVyID0gKG5hbWUpID0+IHsvL2Fzc3VtZSBuYW1lcyBpbnB1dHRlZCBhcmUgVU5JUVVFXG4gICAgXG4gICAgbGV0IGlkID0gbmFtZTtcbiAgICBsZXQgb3duQm9hcmQgPSBHYW1lYm9hcmQoKTtcbiAgICBvd25Cb2FyZC5idWlsZEJvYXJkKCk7XG4gICAgbGV0IGxldHRlck51bWJBcnIgPSBbJ0EnLCdCJywnQycsJ0QnLCdFJywnRicsJ0cnLCdIJywnSScsJ0onXTtcbiAgICBsZXQgcGxheWVyQm9hcmQgPSBvd25Cb2FyZC5ib2FyZDtcbiAgICBsZXQgYWlyQmFsbHMgPSBvd25Cb2FyZC5taXNzZWRTaG90czsvL2J5IHRoZSBvcHBvc2luZyBwbGF5ZXJcblxuICAgIGxldCB0YXJnZXRCb2FyZCA9IEdhbWVib2FyZCgpO1xuICAgIHRhcmdldEJvYXJkLmJ1aWxkQm9hcmQoKTtcbiAgICBsZXQgb3Bwb0JvYXJkID0gdGFyZ2V0Qm9hcmQuYm9hcmQ7XG4gICAgbGV0IG15TWlzc2VzID0gdGFyZ2V0Qm9hcmQubWlzc2VkU2hvdHM7XG4gICAgbGV0IG15SGl0cyA9IHRhcmdldEJvYXJkLnNob3RzSGl0O1xuXG4gICAgY29uc3QgZ2V0U2hpcEZvck9wcCA9IChjb29yZCkgPT4ge1xuICAgICAgICBsZXQgZm91bmRTaGlwID0gcGxheWVyQm9hcmRbYCR7Y29vcmR9YF07XG4gICAgICAgIHJldHVybiBmb3VuZFNoaXA7XG4gICAgfVxuICAgIGNvbnN0IHBsYXllclBsYWNlID0gKHBvc2l0aW9uLCBsZW5ndGgsIGF4aXMpID0+IHtcbiAgICAgICAgLy9zdHJpbmcgJ0IzJywgbnVtYmVyIDMsIHN0cmluZyAnaG9yaXpvbnRhbCcvJ3ZlcnRpY2FsJ1xuICAgICAgICBvd25Cb2FyZC5wbGFjZVNoaXAocG9zaXRpb24sIGxlbmd0aCwgYXhpcyk7XG4gICAgfVxuXG4gICAgY29uc3QgcGxheWVyUGxhY2VTaGlwU3BhbiA9IChwb3NpdGlvbiwgbGVuZ3RoLCBheGlzKSA9PiB7XG4gICAgICAgIHJldHVybiBvd25Cb2FyZC5maW5kU3Bhbihwb3NpdGlvbiwgbGVuZ3RoLCBheGlzKTtcbiAgICB9XG5cbiAgICBjb25zdCBwbGF5ZXJDaGVja092ZXJsYXAgPSAoYXJyKSA9PiB7XG4gICAgICAgIHJldHVybiBvd25Cb2FyZC5ub1NoaXBPdmVybGFwKGFycik7XG4gICAgfVxuXG4gICAgY29uc3QgZGlkQXRrTWlzcyA9IChjb29yZCwgZ2V0QXR0YWNrZWQpID0+IHtcbiAgICAgICAgaWYgKG15SGl0cy5pbmNsdWRlcyhgJHtjb29yZH1gKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJhbHJlYWR5IHNob3QgaGVyZSwgcGxzIHN0b3BcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAobXlNaXNzZXMuaW5jbHVkZXMoYCR7Y29vcmR9YCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYWxyZWFkeSBtaXNzZWQgaGVyZSwgZ28gZWxzZXdoZXJlXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGdldEF0dGFja2VkKGAke2Nvb3JkfWApKSB7Ly9pZiBpdCByZXR1cm5zIHRydWUsIG1lYW5zIG1pc3NlZFxuICAgICAgICAgICAgICAgIG15TWlzc2VzLnB1c2goY29vcmQpO1xuICAgICAgICAgICAgICAgIGxldCBzdHIgPSBgbWlzc18ke2Nvb3JkfWA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbXlIaXRzLnB1c2goY29vcmQpO1xuICAgICAgICAgICAgICAgIGxldCBzdHIgPSBgaGl0c18ke2Nvb3JkfWA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGdldEF0dGFja2VkID0gKGNvb3JkKSA9PiB7XG4gICAgICAgIGxldCBzdGFydGluZ0xlbmd0aCA9IGFpckJhbGxzLmxlbmd0aDtcbiAgICAgICAgb3duQm9hcmQucmVjZWl2ZUF0dGFjayhjb29yZCk7Ly9pZiBpdCdzIGEgbWlzcywgYWlyQmFsbHMgbGVuZ3RoIHNob3VsZCBpbmNyZWFzZSBieSAxXG4gICAgICAgIGlmIChhaXJCYWxscy5sZW5ndGggPiBzdGFydGluZ0xlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcGxheWVyU2hpcENvdW50ID0gKCkgPT4gb3duQm9hcmQuc2hpcENvdW50O1xuICAgIGNvbnN0IHNoaXBzVXAgPSAoKSA9PiBvd25Cb2FyZC5nZXRTaGlwc0FsaXZlQ291bnQoKTtcbiAgICBjb25zdCBhbGxTaGlwc1N1bmsgPSAoKSA9PiB7XG4gICAgICAgIGlmIChzaGlwc1VwKCkgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vdHJ1ZSBpZiBzaGlwQ291bnQgaXMgMCwgZmFsc2UgaWYgbm90XG5cbiAgICAvLy0tLS1jb21wdXRlciBsb2dpY1xuXG5cbiAgICBjb25zdCByYW5kb21BdGtDaG9pY2UgPSAoKSA9PiB7XG4gICAgICAgIGxldCBib29sSG9sZGVyID0gZmFsc2U7XG4gICAgICAgIC8vd2FudCB0byBwaWNrIHJhbmRvbSBYICYgWTsgaWYgTk9UIHdpdGhpbiBteUhpdHMgJiBteU1pc3NlcywgZ28gYWhlYWRcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgbGV0IGNvb3JkID0gcmFuZG9tUG9zaXRpb24oKTtcbiAgICAgICAgICAgIGlmICghbXlIaXRzLmluY2x1ZGVzKGAke2Nvb3JkfWApICYmICFteU1pc3Nlcy5pbmNsdWRlcyhgJHtjb29yZH1gKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ1BVIHBpY2tlZCBcIiwgY29vcmQpO1xuICAgICAgICAgICAgICAgIGJvb2xIb2xkZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb29yZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSB3aGlsZSAoIWJvb2xIb2xkZXIpICAgICAgICBcbiAgICB9XG4gICAgY29uc3QgY29tcHV0ZXJQbGFjZSA9IChsZW5ndGgpID0+IHtcbiAgICAgICAgLy9zdHJpbmcgJ0IzJywgbnVtYmVyIDMsIHN0cmluZyAnaG9yaXpvbnRhbCcvJ3ZlcnRpY2FsJ1xuICAgICAgICAvKiBsZXQgcG9zaXRpb24gPSByYW5kb21Qb3NpdGlvbigpO1xuICAgICAgICBsZXQgYXhpcyA9IHJhbmRvbUF4aXMoKTsqL1xuICAgICAgICBsZXQgYm9vbEhvbGRlciA9IGZhbHNlOyBcbiAgICAgICAgbGV0IHBvc2l0aW9uID0gbnVsbDtcbiAgICAgICAgbGV0IGF4aXMgPSBudWxsO1xuXG4gICAgICAgIC8qIGlmIChvd25Cb2FyZC5wbGFjZVNoaXAocG9zaXRpb24sIGxlbmd0aCwgYXhpcykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAvL21lYW5pbmcgaWYgaXQncyBwbGFjZWQgb2ZmIHRoZSBib2FyZCBvciBvdmVybGFwcGluZ1xuICAgICAgICAgICAgLy93YW50IHRvIHJlcnVuIHRoaXMgZnVuY3Rpb24gYWdhaW5cbiAgICAgICAgfSAqL1xuXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmFuIGFub3RoZXIgcGxhY2VtZW50IGJ5IHRoZSBjb21wXCIpO1xuICAgICAgICAgICAgcG9zaXRpb24gPSByYW5kb21Qb3NpdGlvbigpO1xuICAgICAgICAgICAgYXhpcyA9IHJhbmRvbUF4aXMoKTtcbiAgICAgICAgICAgIGJvb2xIb2xkZXIgPSBvd25Cb2FyZC5wbGFjZVNoaXAocG9zaXRpb24sIGxlbmd0aCwgYXhpcyk7XG4gICAgICAgIH0gd2hpbGUgKCFib29sSG9sZGVyKVxuICAgICAgICByZXR1cm4gW3Bvc2l0aW9uLCBheGlzXTtcbiAgICAgICAgXG4gICAgfVxuICAgIGNvbnN0IHJhbmRvbUF4aXMgPSAoKSA9PiB7XG4gICAgICAgIGxldCBjaG9zZW5BeGlzID0gTWF0aC5yYW5kb20oKSA8IDAuNSA/IFwiaG9yaXpvbnRhbFwiIDogXCJ2ZXJ0aWNhbFwiO1xuICAgICAgICByZXR1cm4gY2hvc2VuQXhpcztcbiAgICB9XG4gICAgY29uc3QgcmFuZG9tUG9zaXRpb24gPSAoKSA9PiB7XG4gICAgICAgIGxldCByYW5kb21OdW1iMSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSoxMCk7Ly8wLTlcbiAgICAgICAgbGV0IHJhbmRvbU51bWIyID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjEwKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhsZXR0ZXJOdW1iQXJyKTtcbiAgICAgICAgbGV0IHJhbmRvbVggPSBsZXR0ZXJOdW1iQXJyW3JhbmRvbU51bWIxXTtcbiAgICAgICAgbGV0IHJhbmRvbVkgPSByYW5kb21OdW1iMiArIDE7XG4gICAgICAgIHJldHVybiByYW5kb21YICsgcmFuZG9tWS50b1N0cmluZygpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGlkLCBwbGF5ZXJCb2FyZCwgYWlyQmFsbHMsIG9wcG9Cb2FyZCwgbXlNaXNzZXMsIG15SGl0cyxcbiAgICAgICAgZ2V0QXR0YWNrZWQsIGRpZEF0a01pc3MsIHBsYXllclBsYWNlLCBjb21wdXRlclBsYWNlLCByYW5kb21BdGtDaG9pY2UsIHNoaXBzVXAsIGFsbFNoaXBzU3VuaywgIHBsYXllckNoZWNrT3ZlcmxhcCwgcGxheWVyUGxhY2VTaGlwU3BhbiwgZ2V0U2hpcEZvck9wcCwgcGxheWVyU2hpcENvdW50LFxuICAgIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHsgXG4gICAgU2hpcDogU2hpcCxcbiAgICBHYW1lYm9hcmQ6IEdhbWVib2FyZCxcbiAgICBQbGF5ZXI6IFBsYXllcixcbn0gIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCJodG1sLCBib2R5LCBkaXYsIHNwYW4sIGFwcGxldCwgb2JqZWN0LCBpZnJhbWUsXFxuaDEsIGgyLCBoMywgaDQsIGg1LCBoNiwgcCwgYmxvY2txdW90ZSwgcHJlLFxcbmEsIGFiYnIsIGFjcm9ueW0sIGFkZHJlc3MsIGJpZywgY2l0ZSwgY29kZSxcXG5kZWwsIGRmbiwgZW0sIGltZywgaW5zLCBrYmQsIHEsIHMsIHNhbXAsXFxuc21hbGwsIHN0cmlrZSwgc3Ryb25nLCBzdWIsIHN1cCwgdHQsIHZhcixcXG5iLCB1LCBpLCBjZW50ZXIsXFxuZGwsIGR0LCBkZCwgb2wsIHVsLCBsaSxcXG5maWVsZHNldCwgZm9ybSwgbGFiZWwsIGxlZ2VuZCxcXG50YWJsZSwgY2FwdGlvbiwgdGJvZHksIHRmb290LCB0aGVhZCwgdHIsIHRoLCB0ZCxcXG5hcnRpY2xlLCBhc2lkZSwgY2FudmFzLCBkZXRhaWxzLCBlbWJlZCwgXFxuZmlndXJlLCBmaWdjYXB0aW9uLCBmb290ZXIsIGhlYWRlciwgaGdyb3VwLCBcXG5tZW51LCBuYXYsIG91dHB1dCwgcnVieSwgc2VjdGlvbiwgc3VtbWFyeSxcXG50aW1lLCBtYXJrLCBhdWRpbywgdmlkZW8ge1xcblxcdG1hcmdpbjogMDtcXG5cXHRwYWRkaW5nOiAwO1xcblxcdGJvcmRlcjogMDtcXG5cXHRmb250LXNpemU6IDEwMCU7XFxuXFx0Zm9udDogaW5oZXJpdDtcXG5cXHR2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XFxufVxcbi8qIEhUTUw1IGRpc3BsYXktcm9sZSByZXNldCBmb3Igb2xkZXIgYnJvd3NlcnMgKi9cXG5hcnRpY2xlLCBhc2lkZSwgZGV0YWlscywgZmlnY2FwdGlvbiwgZmlndXJlLCBcXG5mb290ZXIsIGhlYWRlciwgaGdyb3VwLCBtZW51LCBuYXYsIHNlY3Rpb24ge1xcblxcdGRpc3BsYXk6IGJsb2NrO1xcbn1cXG5ib2R5IHtcXG5cXHRsaW5lLWhlaWdodDogMTtcXG59XFxub2wsIHVsIHtcXG5cXHRsaXN0LXN0eWxlOiBub25lO1xcbn1cXG5ibG9ja3F1b3RlLCBxIHtcXG5cXHRxdW90ZXM6IG5vbmU7XFxufVxcbmJsb2NrcXVvdGU6YmVmb3JlLCBibG9ja3F1b3RlOmFmdGVyLFxcbnE6YmVmb3JlLCBxOmFmdGVyIHtcXG5cXHRjb250ZW50OiAnJztcXG5cXHRjb250ZW50OiBub25lO1xcbn1cXG50YWJsZSB7XFxuXFx0Ym9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTtcXG5cXHRib3JkZXItc3BhY2luZzogMDtcXG59XFxuXFxuOnJvb3Qge1xcbiAgICAtLXByaW1hcnk6ICNmZjZmYjI7IFxcbiAgICAtLXNlY29uZGFyeTogI2MzMTk1ZDsgXFxuICAgIC0tdGVydGlhcnk6ICM2ODA3NDc7IFxcbiAgICAtLXF1YXRlcm5hcnk6ICMxNDEwMTA7IFxcbn1cXG5cXG5odG1sLCBib2R5LCBkaXYjY29udGVudCB7XFxuICAgIGhlaWdodDogMTAwJTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGZvbnQtc2l6ZTogMTVweDtcXG59XFxuXFxuZGl2I3AxU2VwZXJhdG9yIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1wcmltYXJ5KTtcXG59XFxuZGl2I3AyU2VwZXJhdG9yIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOmFxdWE7XFxufVxcblxcbmRpdiNQMUcsIGRpdiNQMkcge1xcblxcdHdpZHRoOiA2MCU7XFxuXFx0bWFyZ2luOiBhdXRvO1xcbn1cXG5cXG5kaXYuZ2FtZWJvYXJkIHtcXG5cXHRkaXNwbGF5OiBmbGV4O1xcblxcdGZsZXgtd3JhcDogd3JhcDtcXG5cXHRib3JkZXI6IDNweCBzb2xpZCBwaW5rO1xcbn1cXG5cXG4uZGVzY3JpcHRvciB7XFxuXFx0Zm9udC1mYW1pbHk6ICdTcGFjZSBHcm90ZXNrJywgc2Fucy1zZXJpZjtcXG5cXHRmb250LXNpemU6IDEuMnJlbTtcXG5cXHRwYWRkaW5nOiAwLjVyZW07XFxuXFx0dGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG5cXG5idXR0b24jbmV3R2FtZUJ0biB7XFxuXFx0YmFja2dyb3VuZC1jb2xvcjogI2MzMTk1ZDtcXG5cXHRjb2xvcjpiaXNxdWU7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHRvcDogNXB4O1xcblxcdHJpZ2h0OiA1cHg7XFxuXFx0ZGlzcGxheTogbm9uZTtcXG59XFxuXFxuZGl2I2RvbmVXaXRoU2hpcHMge1xcblxcdGJhY2tncm91bmQtY29sb3I6ICM2ODA3NDc7XFxuXFx0Y29sb3I6YmlzcXVlO1xcblxcdGJvcmRlcjogMnB4IGluc2V0IGdyYXk7XFxuXFx0Zm9udC1zaXplOiAxLjByZW07XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdGxlZnQ6IDVweDtcXG5cXHRwYWRkaW5nOiA0cHg7XFxuXFx0dG9wOiA2NXB4O1xcblxcdC8qIGRpc3BsYXk6IG5vbmU7ICovXFxufVxcblxcbmRpdiNheGlzVG9nZ2xlIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiAjYzMxOTVkO1xcblxcdGJvcmRlcjogMnB4IGluc2V0IGdyYXk7XFxuXFx0Zm9udC1zaXplOiAxLjByZW07XFxuXFx0Y29sb3I6YmlzcXVlO1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHRwYWRkaW5nOiA0cHg7XFxuXFx0dG9wOiAzMXB4O1xcblxcdGxlZnQ6IDVweDtcXG5cXHQvKiBkaXNwbGF5OiBub25lOyAqL1xcbn1cXG5cXG5kaXYjdG9wQmFyIHtcXG5cXHRwb3NpdGlvbjogcmVsYXRpdmU7XFxufVxcblxcbmRpdltjbGFzc149XFxcInNxdWFyZVxcXCJdIHtcXG5cXHRwb3NpdGlvbjogcmVsYXRpdmU7XFxuXFx0ZmxleC1iYXNpczogY2FsYyg5JSAtIDEwcHgpO1xcblxcdG1hcmdpbjogNXB4O1xcblxcdGJvcmRlcjogMXB4IHNvbGlkO1xcblxcdGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxufVxcblxcbmRpdltjbGFzc149XFxcInNxdWFyZVxcXCJdOjpiZWZvcmUge1xcblxcdGNvbnRlbnQ6ICcnO1xcblxcdGRpc3BsYXk6IGJsb2NrO1xcblxcdHBhZGRpbmctdG9wOiAxMDAlO1xcbn1cXG5cXG5kaXZbY2xhc3NePVxcXCJzcXVhcmVcXFwiXSAuY29udGVudHoge1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHR0b3A6IDA7IGxlZnQ6IDA7XFxuXFx0aGVpZ2h0OiAxMDAlO1xcblxcdHdpZHRoOiAxMDAlO1xcbiAgXFxuXFx0ZGlzcGxheTogZmxleDsgICAgICAgICAgICAgICAvKiBhZGRlZCBmb3IgY2VudGVyZWQgdGV4dCAqL1xcblxcdGp1c3RpZnktY29udGVudDogY2VudGVyOyAgICAgLyogYWRkZWQgZm9yIGNlbnRlcmVkIHRleHQgKi9cXG5cXHRhbGlnbi1pdGVtczogY2VudGVyOyAgICAgICAgIC8qIGFkZGVkIGZvciBjZW50ZXJlZCB0ZXh0ICovXFxufVxcblxcbi8qIFxcbmRpdiNjb250ZW50IHtcXG5cXHRkaXNwbGF5OiBncmlkO1xcblxcdGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDIsIDQwJSk7XFxuXFx0Z3JpZC10ZW1wbGF0ZS1yb3dzOiByZXBlYXQoMiwgNDAlKTtcXG59XFxuXFxuZGl2LmdhbWVib2FyZCB7XFxuXFx0ZGlzcGxheTogZ3JpZDtcXG5cXHRncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgxMSwgOCUpO1xcblxcdGdyaWQtdGVtcGxhdGUtcm93czogcmVwZWF0KDExLCA4JSk7XFxufVxcblxcbmRpdltjbGFzc149XFxcInNxdWFyZVxcXCJdIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTg0LCAxODQsIDE4NCk7XFxuXFx0Ym9yZGVyOiAxcHggc29saWQgYmxhY2s7XFxuXFx0b3BhY2l0eTogMC41O1xcblxcdGFzcGVjdC1yYXRpbzogMTtcXG59ICovXFxuXFxuLyogbG9hZGluZy9zcGlubmVyIHN0dWZmICovXFxuXFxuZGl2I2xlbmd0aEluZGljYXRvciB7XFxuXFx0LyogZGlzcGxheTogbm9uZTsgKi9cXG5cXHRkaXNwbGF5OiBmbGV4O1xcblxcdGp1c3RpZnktY29udGVudDogbGVmdDtcXG5cXHRhbGlnbi1pdGVtczogY2VudGVyO1xcblxcdGdhcDogMC41cmVtO1xcblxcdGZvbnQtc2l6ZTogMS4xcmVtO1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHR0b3A6IDVweDtcXG5cXHRsZWZ0OiA1cHg7XFxufVxcblxcbmlucHV0I2xlbmd0aElucHV0IHtcXG5cXHR3aWR0aDogMjUlO1xcbn1cXG5cXG5kaXYjcHJvbXB0UGxhY2luZ1AxIHtcXG5cXHQvKiBkaXNwbGF5OiBub25lOyAqL1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHRkaXNwbGF5OiBmbGV4O1xcblxcdGZsZXgtd3JhcDogd3JhcDtcXG5cXHR3aWR0aDogMTQlO1xcblxcdHRvcDogNXB4O1xcblxcdHJpZ2h0OiA4cHg7XFxufVxcblxcbmRpdiNiYXR0bGVTdGFydCB7XFxuXFx0Zm9udC1zaXplOiAxLjNyZW07XFxuXFx0ZGlzcGxheTogbm9uZTtcXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0d2lkdGg6IDE0JTtcXG5cXHR0b3A6IDVweDtcXG5cXHRyaWdodDogNXB4O1xcbn1cXG5cXG4jbG9hZGVyIHtcXG5cXHRkaXNwbGF5OiBub25lO1xcblxcdHRvcDogNTAlO1xcblxcdGxlZnQ6IDUwJTtcXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0dHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSk7XFxufVxcbiAgXFxuLmxvYWRpbmcge1xcblxcdGJvcmRlcjogOHB4IHNvbGlkIHJnYigyMjAsIDAsIDApO1xcblxcdHdpZHRoOiA2MHB4O1xcblxcdGhlaWdodDogNjBweDtcXG5cXHRib3JkZXItcmFkaXVzOiA1MCU7XFxuXFx0Ym9yZGVyLXRvcC1jb2xvcjogI2ZmNjMyMDtcXG5cXHRib3JkZXItbGVmdC1jb2xvcjogI2ZmNzMwMDtcXG5cXHRhbmltYXRpb246IHNwaW4gMXMgaW5maW5pdGUgZWFzZS1pbjtcXG59XFxuICBcXG5Aa2V5ZnJhbWVzIHNwaW4ge1xcblxcdDAlIHtcXG5cXHQgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpO1xcblxcdH1cXG4gIFxcblxcdDEwMCUge1xcblxcdCAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTtcXG5cXHR9XFxufVxcblxcbkBtZWRpYSBzY3JlZW4gYW5kIChtaW4td2lkdGg6IDgwMHB4KSB7XFxuXFx0aHRtbCwgYm9keSwgZGl2I2NvbnRlbnQge1xcblxcdCAgZm9udC1zaXplOiAxNXB4O1xcblxcdH1cXG5cXG5cXHRib2R5IHtcXG5cXHRcXHRkaXNwbGF5OiBmbGV4O1xcblxcdFxcdGp1c3RpZnktY29udGVudDogY2VudGVyO1xcblxcdFxcdGJhY2tncm91bmQtY29sb3I6IHZhcigtLXRlcnRpYXJ5KTtcXG5cXHR9XFxuXFxuXFx0ZGl2I2NvbnRlbnQge1xcblxcdFxcdHdpZHRoOiA2MCU7XFxuXFx0fVxcblxcblxcdGRpdiNheGlzVG9nZ2xlIHtcXG5cXHRcXHRcXG5cXHRcXHR0b3A6IDM3cHg7XFxuXFx0XFx0LyogZGlzcGxheTogbm9uZTsgKi9cXG5cXHR9XFxuXFxuXFx0ZGl2I2RvbmVXaXRoU2hpcHMge1xcblxcdFxcdHRvcDogNzVweDtcXG5cXHR9XFxufVwiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9zdHlsZS5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUE7Ozs7Ozs7Ozs7Ozs7Q0FhQyxTQUFTO0NBQ1QsVUFBVTtDQUNWLFNBQVM7Q0FDVCxlQUFlO0NBQ2YsYUFBYTtDQUNiLHdCQUF3QjtBQUN6QjtBQUNBLGdEQUFnRDtBQUNoRDs7Q0FFQyxjQUFjO0FBQ2Y7QUFDQTtDQUNDLGNBQWM7QUFDZjtBQUNBO0NBQ0MsZ0JBQWdCO0FBQ2pCO0FBQ0E7Q0FDQyxZQUFZO0FBQ2I7QUFDQTs7Q0FFQyxXQUFXO0NBQ1gsYUFBYTtBQUNkO0FBQ0E7Q0FDQyx5QkFBeUI7Q0FDekIsaUJBQWlCO0FBQ2xCOztBQUVBO0lBQ0ksa0JBQWtCO0lBQ2xCLG9CQUFvQjtJQUNwQixtQkFBbUI7SUFDbkIscUJBQXFCO0FBQ3pCOztBQUVBO0lBQ0ksWUFBWTtJQUNaLFdBQVc7SUFDWCxlQUFlO0FBQ25COztBQUVBO0NBQ0MsZ0NBQWdDO0FBQ2pDO0FBQ0E7Q0FDQyxxQkFBcUI7QUFDdEI7O0FBRUE7Q0FDQyxVQUFVO0NBQ1YsWUFBWTtBQUNiOztBQUVBO0NBQ0MsYUFBYTtDQUNiLGVBQWU7Q0FDZixzQkFBc0I7QUFDdkI7O0FBRUE7Q0FDQyx3Q0FBd0M7Q0FDeEMsaUJBQWlCO0NBQ2pCLGVBQWU7Q0FDZixrQkFBa0I7QUFDbkI7O0FBRUE7Q0FDQyx5QkFBeUI7Q0FDekIsWUFBWTtDQUNaLGtCQUFrQjtDQUNsQixRQUFRO0NBQ1IsVUFBVTtDQUNWLGFBQWE7QUFDZDs7QUFFQTtDQUNDLHlCQUF5QjtDQUN6QixZQUFZO0NBQ1osc0JBQXNCO0NBQ3RCLGlCQUFpQjtDQUNqQixrQkFBa0I7Q0FDbEIsU0FBUztDQUNULFlBQVk7Q0FDWixTQUFTO0NBQ1QsbUJBQW1CO0FBQ3BCOztBQUVBO0NBQ0MseUJBQXlCO0NBQ3pCLHNCQUFzQjtDQUN0QixpQkFBaUI7Q0FDakIsWUFBWTtDQUNaLGtCQUFrQjtDQUNsQixZQUFZO0NBQ1osU0FBUztDQUNULFNBQVM7Q0FDVCxtQkFBbUI7QUFDcEI7O0FBRUE7Q0FDQyxrQkFBa0I7QUFDbkI7O0FBRUE7Q0FDQyxrQkFBa0I7Q0FDbEIsMkJBQTJCO0NBQzNCLFdBQVc7Q0FDWCxpQkFBaUI7Q0FDakIsc0JBQXNCO0FBQ3ZCOztBQUVBO0NBQ0MsV0FBVztDQUNYLGNBQWM7Q0FDZCxpQkFBaUI7QUFDbEI7O0FBRUE7Q0FDQyxrQkFBa0I7Q0FDbEIsTUFBTSxFQUFFLE9BQU87Q0FDZixZQUFZO0NBQ1osV0FBVzs7Q0FFWCxhQUFhLGdCQUFnQiw0QkFBNEI7Q0FDekQsdUJBQXVCLE1BQU0sNEJBQTRCO0NBQ3pELG1CQUFtQixVQUFVLDRCQUE0QjtBQUMxRDs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0JHOztBQUVILDBCQUEwQjs7QUFFMUI7Q0FDQyxtQkFBbUI7Q0FDbkIsYUFBYTtDQUNiLHFCQUFxQjtDQUNyQixtQkFBbUI7Q0FDbkIsV0FBVztDQUNYLGlCQUFpQjtDQUNqQixrQkFBa0I7Q0FDbEIsUUFBUTtDQUNSLFNBQVM7QUFDVjs7QUFFQTtDQUNDLFVBQVU7QUFDWDs7QUFFQTtDQUNDLG1CQUFtQjtDQUNuQixrQkFBa0I7Q0FDbEIsYUFBYTtDQUNiLGVBQWU7Q0FDZixVQUFVO0NBQ1YsUUFBUTtDQUNSLFVBQVU7QUFDWDs7QUFFQTtDQUNDLGlCQUFpQjtDQUNqQixhQUFhO0NBQ2Isa0JBQWtCO0NBQ2xCLFVBQVU7Q0FDVixRQUFRO0NBQ1IsVUFBVTtBQUNYOztBQUVBO0NBQ0MsYUFBYTtDQUNiLFFBQVE7Q0FDUixTQUFTO0NBQ1Qsa0JBQWtCO0NBQ2xCLGdDQUFnQztBQUNqQzs7QUFFQTtDQUNDLGdDQUFnQztDQUNoQyxXQUFXO0NBQ1gsWUFBWTtDQUNaLGtCQUFrQjtDQUNsQix5QkFBeUI7Q0FDekIsMEJBQTBCO0NBQzFCLG1DQUFtQztBQUNwQzs7QUFFQTtDQUNDO0dBQ0UsdUJBQXVCO0NBQ3pCOztDQUVBO0dBQ0UseUJBQXlCO0NBQzNCO0FBQ0Q7O0FBRUE7Q0FDQztHQUNFLGVBQWU7Q0FDakI7O0NBRUE7RUFDQyxhQUFhO0VBQ2IsdUJBQXVCO0VBQ3ZCLGlDQUFpQztDQUNsQzs7Q0FFQTtFQUNDLFVBQVU7Q0FDWDs7Q0FFQTs7RUFFQyxTQUFTO0VBQ1QsbUJBQW1CO0NBQ3BCOztDQUVBO0VBQ0MsU0FBUztDQUNWO0FBQ0RcIixcInNvdXJjZXNDb250ZW50XCI6W1wiaHRtbCwgYm9keSwgZGl2LCBzcGFuLCBhcHBsZXQsIG9iamVjdCwgaWZyYW1lLFxcbmgxLCBoMiwgaDMsIGg0LCBoNSwgaDYsIHAsIGJsb2NrcXVvdGUsIHByZSxcXG5hLCBhYmJyLCBhY3JvbnltLCBhZGRyZXNzLCBiaWcsIGNpdGUsIGNvZGUsXFxuZGVsLCBkZm4sIGVtLCBpbWcsIGlucywga2JkLCBxLCBzLCBzYW1wLFxcbnNtYWxsLCBzdHJpa2UsIHN0cm9uZywgc3ViLCBzdXAsIHR0LCB2YXIsXFxuYiwgdSwgaSwgY2VudGVyLFxcbmRsLCBkdCwgZGQsIG9sLCB1bCwgbGksXFxuZmllbGRzZXQsIGZvcm0sIGxhYmVsLCBsZWdlbmQsXFxudGFibGUsIGNhcHRpb24sIHRib2R5LCB0Zm9vdCwgdGhlYWQsIHRyLCB0aCwgdGQsXFxuYXJ0aWNsZSwgYXNpZGUsIGNhbnZhcywgZGV0YWlscywgZW1iZWQsIFxcbmZpZ3VyZSwgZmlnY2FwdGlvbiwgZm9vdGVyLCBoZWFkZXIsIGhncm91cCwgXFxubWVudSwgbmF2LCBvdXRwdXQsIHJ1YnksIHNlY3Rpb24sIHN1bW1hcnksXFxudGltZSwgbWFyaywgYXVkaW8sIHZpZGVvIHtcXG5cXHRtYXJnaW46IDA7XFxuXFx0cGFkZGluZzogMDtcXG5cXHRib3JkZXI6IDA7XFxuXFx0Zm9udC1zaXplOiAxMDAlO1xcblxcdGZvbnQ6IGluaGVyaXQ7XFxuXFx0dmVydGljYWwtYWxpZ246IGJhc2VsaW5lO1xcbn1cXG4vKiBIVE1MNSBkaXNwbGF5LXJvbGUgcmVzZXQgZm9yIG9sZGVyIGJyb3dzZXJzICovXFxuYXJ0aWNsZSwgYXNpZGUsIGRldGFpbHMsIGZpZ2NhcHRpb24sIGZpZ3VyZSwgXFxuZm9vdGVyLCBoZWFkZXIsIGhncm91cCwgbWVudSwgbmF2LCBzZWN0aW9uIHtcXG5cXHRkaXNwbGF5OiBibG9jaztcXG59XFxuYm9keSB7XFxuXFx0bGluZS1oZWlnaHQ6IDE7XFxufVxcbm9sLCB1bCB7XFxuXFx0bGlzdC1zdHlsZTogbm9uZTtcXG59XFxuYmxvY2txdW90ZSwgcSB7XFxuXFx0cXVvdGVzOiBub25lO1xcbn1cXG5ibG9ja3F1b3RlOmJlZm9yZSwgYmxvY2txdW90ZTphZnRlcixcXG5xOmJlZm9yZSwgcTphZnRlciB7XFxuXFx0Y29udGVudDogJyc7XFxuXFx0Y29udGVudDogbm9uZTtcXG59XFxudGFibGUge1xcblxcdGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7XFxuXFx0Ym9yZGVyLXNwYWNpbmc6IDA7XFxufVxcblxcbjpyb290IHtcXG4gICAgLS1wcmltYXJ5OiAjZmY2ZmIyOyBcXG4gICAgLS1zZWNvbmRhcnk6ICNjMzE5NWQ7IFxcbiAgICAtLXRlcnRpYXJ5OiAjNjgwNzQ3OyBcXG4gICAgLS1xdWF0ZXJuYXJ5OiAjMTQxMDEwOyBcXG59XFxuXFxuaHRtbCwgYm9keSwgZGl2I2NvbnRlbnQge1xcbiAgICBoZWlnaHQ6IDEwMCU7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBmb250LXNpemU6IDE1cHg7XFxufVxcblxcbmRpdiNwMVNlcGVyYXRvciB7XFxuXFx0YmFja2dyb3VuZC1jb2xvcjogdmFyKC0tcHJpbWFyeSk7XFxufVxcbmRpdiNwMlNlcGVyYXRvciB7XFxuXFx0YmFja2dyb3VuZC1jb2xvcjphcXVhO1xcbn1cXG5cXG5kaXYjUDFHLCBkaXYjUDJHIHtcXG5cXHR3aWR0aDogNjAlO1xcblxcdG1hcmdpbjogYXV0bztcXG59XFxuXFxuZGl2LmdhbWVib2FyZCB7XFxuXFx0ZGlzcGxheTogZmxleDtcXG5cXHRmbGV4LXdyYXA6IHdyYXA7XFxuXFx0Ym9yZGVyOiAzcHggc29saWQgcGluaztcXG59XFxuXFxuLmRlc2NyaXB0b3Ige1xcblxcdGZvbnQtZmFtaWx5OiAnU3BhY2UgR3JvdGVzaycsIHNhbnMtc2VyaWY7XFxuXFx0Zm9udC1zaXplOiAxLjJyZW07XFxuXFx0cGFkZGluZzogMC41cmVtO1xcblxcdHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuXFxuYnV0dG9uI25ld0dhbWVCdG4ge1xcblxcdGJhY2tncm91bmQtY29sb3I6ICNjMzE5NWQ7XFxuXFx0Y29sb3I6YmlzcXVlO1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHR0b3A6IDVweDtcXG5cXHRyaWdodDogNXB4O1xcblxcdGRpc3BsYXk6IG5vbmU7XFxufVxcblxcbmRpdiNkb25lV2l0aFNoaXBzIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiAjNjgwNzQ3O1xcblxcdGNvbG9yOmJpc3F1ZTtcXG5cXHRib3JkZXI6IDJweCBpbnNldCBncmF5O1xcblxcdGZvbnQtc2l6ZTogMS4wcmVtO1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHRsZWZ0OiA1cHg7XFxuXFx0cGFkZGluZzogNHB4O1xcblxcdHRvcDogNjVweDtcXG5cXHQvKiBkaXNwbGF5OiBub25lOyAqL1xcbn1cXG5cXG5kaXYjYXhpc1RvZ2dsZSB7XFxuXFx0YmFja2dyb3VuZC1jb2xvcjogI2MzMTk1ZDtcXG5cXHRib3JkZXI6IDJweCBpbnNldCBncmF5O1xcblxcdGZvbnQtc2l6ZTogMS4wcmVtO1xcblxcdGNvbG9yOmJpc3F1ZTtcXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0cGFkZGluZzogNHB4O1xcblxcdHRvcDogMzFweDtcXG5cXHRsZWZ0OiA1cHg7XFxuXFx0LyogZGlzcGxheTogbm9uZTsgKi9cXG59XFxuXFxuZGl2I3RvcEJhciB7XFxuXFx0cG9zaXRpb246IHJlbGF0aXZlO1xcbn1cXG5cXG5kaXZbY2xhc3NePVxcXCJzcXVhcmVcXFwiXSB7XFxuXFx0cG9zaXRpb246IHJlbGF0aXZlO1xcblxcdGZsZXgtYmFzaXM6IGNhbGMoOSUgLSAxMHB4KTtcXG5cXHRtYXJnaW46IDVweDtcXG5cXHRib3JkZXI6IDFweCBzb2xpZDtcXG5cXHRib3gtc2l6aW5nOiBib3JkZXItYm94O1xcbn1cXG5cXG5kaXZbY2xhc3NePVxcXCJzcXVhcmVcXFwiXTo6YmVmb3JlIHtcXG5cXHRjb250ZW50OiAnJztcXG5cXHRkaXNwbGF5OiBibG9jaztcXG5cXHRwYWRkaW5nLXRvcDogMTAwJTtcXG59XFxuXFxuZGl2W2NsYXNzXj1cXFwic3F1YXJlXFxcIl0gLmNvbnRlbnR6IHtcXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0dG9wOiAwOyBsZWZ0OiAwO1xcblxcdGhlaWdodDogMTAwJTtcXG5cXHR3aWR0aDogMTAwJTtcXG4gIFxcblxcdGRpc3BsYXk6IGZsZXg7ICAgICAgICAgICAgICAgLyogYWRkZWQgZm9yIGNlbnRlcmVkIHRleHQgKi9cXG5cXHRqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsgICAgIC8qIGFkZGVkIGZvciBjZW50ZXJlZCB0ZXh0ICovXFxuXFx0YWxpZ24taXRlbXM6IGNlbnRlcjsgICAgICAgICAvKiBhZGRlZCBmb3IgY2VudGVyZWQgdGV4dCAqL1xcbn1cXG5cXG4vKiBcXG5kaXYjY29udGVudCB7XFxuXFx0ZGlzcGxheTogZ3JpZDtcXG5cXHRncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgyLCA0MCUpO1xcblxcdGdyaWQtdGVtcGxhdGUtcm93czogcmVwZWF0KDIsIDQwJSk7XFxufVxcblxcbmRpdi5nYW1lYm9hcmQge1xcblxcdGRpc3BsYXk6IGdyaWQ7XFxuXFx0Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMTEsIDglKTtcXG5cXHRncmlkLXRlbXBsYXRlLXJvd3M6IHJlcGVhdCgxMSwgOCUpO1xcbn1cXG5cXG5kaXZbY2xhc3NePVxcXCJzcXVhcmVcXFwiXSB7XFxuXFx0YmFja2dyb3VuZC1jb2xvcjogcmdiKDE4NCwgMTg0LCAxODQpO1xcblxcdGJvcmRlcjogMXB4IHNvbGlkIGJsYWNrO1xcblxcdG9wYWNpdHk6IDAuNTtcXG5cXHRhc3BlY3QtcmF0aW86IDE7XFxufSAqL1xcblxcbi8qIGxvYWRpbmcvc3Bpbm5lciBzdHVmZiAqL1xcblxcbmRpdiNsZW5ndGhJbmRpY2F0b3Ige1xcblxcdC8qIGRpc3BsYXk6IG5vbmU7ICovXFxuXFx0ZGlzcGxheTogZmxleDtcXG5cXHRqdXN0aWZ5LWNvbnRlbnQ6IGxlZnQ7XFxuXFx0YWxpZ24taXRlbXM6IGNlbnRlcjtcXG5cXHRnYXA6IDAuNXJlbTtcXG5cXHRmb250LXNpemU6IDEuMXJlbTtcXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0dG9wOiA1cHg7XFxuXFx0bGVmdDogNXB4O1xcbn1cXG5cXG5pbnB1dCNsZW5ndGhJbnB1dCB7XFxuXFx0d2lkdGg6IDI1JTtcXG59XFxuXFxuZGl2I3Byb21wdFBsYWNpbmdQMSB7XFxuXFx0LyogZGlzcGxheTogbm9uZTsgKi9cXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0ZGlzcGxheTogZmxleDtcXG5cXHRmbGV4LXdyYXA6IHdyYXA7XFxuXFx0d2lkdGg6IDE0JTtcXG5cXHR0b3A6IDVweDtcXG5cXHRyaWdodDogOHB4O1xcbn1cXG5cXG5kaXYjYmF0dGxlU3RhcnQge1xcblxcdGZvbnQtc2l6ZTogMS4zcmVtO1xcblxcdGRpc3BsYXk6IG5vbmU7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHdpZHRoOiAxNCU7XFxuXFx0dG9wOiA1cHg7XFxuXFx0cmlnaHQ6IDVweDtcXG59XFxuXFxuI2xvYWRlciB7XFxuXFx0ZGlzcGxheTogbm9uZTtcXG5cXHR0b3A6IDUwJTtcXG5cXHRsZWZ0OiA1MCU7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpO1xcbn1cXG4gIFxcbi5sb2FkaW5nIHtcXG5cXHRib3JkZXI6IDhweCBzb2xpZCByZ2IoMjIwLCAwLCAwKTtcXG5cXHR3aWR0aDogNjBweDtcXG5cXHRoZWlnaHQ6IDYwcHg7XFxuXFx0Ym9yZGVyLXJhZGl1czogNTAlO1xcblxcdGJvcmRlci10b3AtY29sb3I6ICNmZjYzMjA7XFxuXFx0Ym9yZGVyLWxlZnQtY29sb3I6ICNmZjczMDA7XFxuXFx0YW5pbWF0aW9uOiBzcGluIDFzIGluZmluaXRlIGVhc2UtaW47XFxufVxcbiAgXFxuQGtleWZyYW1lcyBzcGluIHtcXG5cXHQwJSB7XFxuXFx0ICB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTtcXG5cXHR9XFxuICBcXG5cXHQxMDAlIHtcXG5cXHQgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XFxuXFx0fVxcbn1cXG5cXG5AbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOiA4MDBweCkge1xcblxcdGh0bWwsIGJvZHksIGRpdiNjb250ZW50IHtcXG5cXHQgIGZvbnQtc2l6ZTogMTVweDtcXG5cXHR9XFxuXFxuXFx0Ym9keSB7XFxuXFx0XFx0ZGlzcGxheTogZmxleDtcXG5cXHRcXHRqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG5cXHRcXHRiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS10ZXJ0aWFyeSk7XFxuXFx0fVxcblxcblxcdGRpdiNjb250ZW50IHtcXG5cXHRcXHR3aWR0aDogNjAlO1xcblxcdH1cXG5cXG5cXHRkaXYjYXhpc1RvZ2dsZSB7XFxuXFx0XFx0XFxuXFx0XFx0dG9wOiAzN3B4O1xcblxcdFxcdC8qIGRpc3BsYXk6IG5vbmU7ICovXFxuXFx0fVxcblxcblxcdGRpdiNkb25lV2l0aFNoaXBzIHtcXG5cXHRcXHR0b3A6IDc1cHg7XFxuXFx0fVxcbn1cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107XG5cbiAgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IFwiXCI7XG4gICAgICB2YXIgbmVlZExheWVyID0gdHlwZW9mIGl0ZW1bNV0gIT09IFwidW5kZWZpbmVkXCI7XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpO1xuICAgICAgfVxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBjb250ZW50ICs9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSk7XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0pLmpvaW4oXCJcIik7XG4gIH07XG5cbiAgLy8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3RcbiAgbGlzdC5pID0gZnVuY3Rpb24gaShtb2R1bGVzLCBtZWRpYSwgZGVkdXBlLCBzdXBwb3J0cywgbGF5ZXIpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIHVuZGVmaW5lZF1dO1xuICAgIH1cbiAgICB2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuICAgIGlmIChkZWR1cGUpIHtcbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdGhpcy5sZW5ndGg7IGsrKykge1xuICAgICAgICB2YXIgaWQgPSB0aGlzW2tdWzBdO1xuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciBfayA9IDA7IF9rIDwgbW9kdWxlcy5sZW5ndGg7IF9rKyspIHtcbiAgICAgIHZhciBpdGVtID0gW10uY29uY2F0KG1vZHVsZXNbX2tdKTtcbiAgICAgIGlmIChkZWR1cGUgJiYgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtWzVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobWVkaWEpIHtcbiAgICAgICAgaWYgKCFpdGVtWzJdKSB7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHN1cHBvcnRzKSB7XG4gICAgICAgIGlmICghaXRlbVs0XSkge1xuICAgICAgICAgIGl0ZW1bNF0gPSBcIlwiLmNvbmNhdChzdXBwb3J0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzRdID0gc3VwcG9ydHM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBsaXN0O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlbSkge1xuICB2YXIgY29udGVudCA9IGl0ZW1bMV07XG4gIHZhciBjc3NNYXBwaW5nID0gaXRlbVszXTtcbiAgaWYgKCFjc3NNYXBwaW5nKSB7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cbiAgaWYgKHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHJldHVybiBbY29udGVudF0uY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbihcIlxcblwiKTtcbiAgfVxuICByZXR1cm4gW2NvbnRlbnRdLmpvaW4oXCJcXG5cIik7XG59OyIsIlxuICAgICAgaW1wb3J0IEFQSSBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgaW1wb3J0IGRvbUFQSSBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0Rm4gZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzXCI7XG4gICAgICBpbXBvcnQgc2V0QXR0cmlidXRlcyBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydFN0eWxlRWxlbWVudCBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qc1wiO1xuICAgICAgaW1wb3J0IHN0eWxlVGFnVHJhbnNmb3JtRm4gZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qc1wiO1xuICAgICAgaW1wb3J0IGNvbnRlbnQsICogYXMgbmFtZWRFeHBvcnQgZnJvbSBcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZS5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlLmNzc1wiO1xuICAgICAgIGV4cG9ydCBkZWZhdWx0IGNvbnRlbnQgJiYgY29udGVudC5sb2NhbHMgPyBjb250ZW50LmxvY2FscyA6IHVuZGVmaW5lZDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgc3R5bGVzSW5ET00gPSBbXTtcbmZ1bmN0aW9uIGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgdmFyIHJlc3VsdCA9IC0xO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRE9NLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRE9NW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKSB7XG4gIHZhciBpZENvdW50TWFwID0ge307XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXhCeUlkZW50aWZpZXIgPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM10sXG4gICAgICBzdXBwb3J0czogaXRlbVs0XSxcbiAgICAgIGxheWVyOiBpdGVtWzVdXG4gICAgfTtcbiAgICBpZiAoaW5kZXhCeUlkZW50aWZpZXIgIT09IC0xKSB7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0ucmVmZXJlbmNlcysrO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnVwZGF0ZXIob2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHVwZGF0ZXIgPSBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKTtcbiAgICAgIG9wdGlvbnMuYnlJbmRleCA9IGk7XG4gICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoaSwgMCwge1xuICAgICAgICBpZGVudGlmaWVyOiBpZGVudGlmaWVyLFxuICAgICAgICB1cGRhdGVyOiB1cGRhdGVyLFxuICAgICAgICByZWZlcmVuY2VzOiAxXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTtcbiAgfVxuICByZXR1cm4gaWRlbnRpZmllcnM7XG59XG5mdW5jdGlvbiBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKSB7XG4gIHZhciBhcGkgPSBvcHRpb25zLmRvbUFQSShvcHRpb25zKTtcbiAgYXBpLnVwZGF0ZShvYmopO1xuICB2YXIgdXBkYXRlciA9IGZ1bmN0aW9uIHVwZGF0ZXIobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCAmJiBuZXdPYmouc3VwcG9ydHMgPT09IG9iai5zdXBwb3J0cyAmJiBuZXdPYmoubGF5ZXIgPT09IG9iai5sYXllcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBhcGkudXBkYXRlKG9iaiA9IG5ld09iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwaS5yZW1vdmUoKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiB1cGRhdGVyO1xufVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tpXTtcbiAgICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhdLnJlZmVyZW5jZXMtLTtcbiAgICB9XG4gICAgdmFyIG5ld0xhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShuZXdMaXN0LCBvcHRpb25zKTtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcbiAgICAgIHZhciBfaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihfaWRlbnRpZmllcik7XG4gICAgICBpZiAoc3R5bGVzSW5ET01bX2luZGV4XS5yZWZlcmVuY2VzID09PSAwKSB7XG4gICAgICAgIHN0eWxlc0luRE9NW19pbmRleF0udXBkYXRlcigpO1xuICAgICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGFzdElkZW50aWZpZXJzID0gbmV3TGFzdElkZW50aWZpZXJzO1xuICB9O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIG1lbW8gPSB7fTtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBnZXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICh0eXBlb2YgbWVtb1t0YXJnZXRdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgdmFyIHN0eWxlVGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpO1xuXG4gICAgLy8gU3BlY2lhbCBjYXNlIHRvIHJldHVybiBoZWFkIG9mIGlmcmFtZSBpbnN0ZWFkIG9mIGlmcmFtZSBpdHNlbGZcbiAgICBpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuICAgICAgICBzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICBzdHlsZVRhcmdldCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICB9XG4gIHJldHVybiBtZW1vW3RhcmdldF07XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0QnlTZWxlY3RvcihpbnNlcnQsIHN0eWxlKSB7XG4gIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQoaW5zZXJ0KTtcbiAgaWYgKCF0YXJnZXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydCcgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuICB9XG4gIHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEJ5U2VsZWN0b3I7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIG9wdGlvbnMuc2V0QXR0cmlidXRlcyhlbGVtZW50LCBvcHRpb25zLmF0dHJpYnV0ZXMpO1xuICBvcHRpb25zLmluc2VydChlbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xuICByZXR1cm4gZWxlbWVudDtcbn1cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0U3R5bGVFbGVtZW50OyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcyhzdHlsZUVsZW1lbnQpIHtcbiAgdmFyIG5vbmNlID0gdHlwZW9mIF9fd2VicGFja19ub25jZV9fICE9PSBcInVuZGVmaW5lZFwiID8gX193ZWJwYWNrX25vbmNlX18gOiBudWxsO1xuICBpZiAobm9uY2UpIHtcbiAgICBzdHlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKFwibm9uY2VcIiwgbm9uY2UpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlczsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaikge1xuICB2YXIgY3NzID0gXCJcIjtcbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KG9iai5zdXBwb3J0cywgXCIpIHtcIik7XG4gIH1cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIkBtZWRpYSBcIi5jb25jYXQob2JqLm1lZGlhLCBcIiB7XCIpO1xuICB9XG4gIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2Ygb2JqLmxheWVyICE9PSBcInVuZGVmaW5lZFwiO1xuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwiQGxheWVyXCIuY29uY2F0KG9iai5sYXllci5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KG9iai5sYXllcikgOiBcIlwiLCBcIiB7XCIpO1xuICB9XG4gIGNzcyArPSBvYmouY3NzO1xuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICB2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcbiAgaWYgKHNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIuY29uY2F0KGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSksIFwiICovXCIpO1xuICB9XG5cbiAgLy8gRm9yIG9sZCBJRVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG4gIG9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG59XG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGVFbGVtZW50LnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgc3R5bGVFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50KTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBkb21BUEkob3B0aW9ucykge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKCkge30sXG4gICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgfTtcbiAgfVxuICB2YXIgc3R5bGVFbGVtZW50ID0gb3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gIHJldHVybiB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUob2JqKSB7XG4gICAgICBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaik7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuICAgIH1cbiAgfTtcbn1cbm1vZHVsZS5leHBvcnRzID0gZG9tQVBJOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50KSB7XG4gIGlmIChzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICBzdHlsZUVsZW1lbnQucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgIH1cbiAgICBzdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gc3R5bGVUYWdUcmFuc2Zvcm07IiwiaW1wb3J0ICcuL3N0eWxlLmNzcyc7XG5pbXBvcnQgbG9naWN0b2RvIGZyb20gJy4vbG9naWN0b2RvLmpzJztcbmltcG9ydCB7IHBsYWNlU2hpcHNET00gfSBmcm9tICcuL2xvZ2ljdG9kby5qcyc7XG5pbXBvcnQgeyBmaWxsU3F1YXJlRE9NIH0gZnJvbSAnLi9sb2dpY3RvZG8uanMnO1xuaW1wb3J0IHsgc2hpcFN1bmtET00gfSBmcm9tICcuL2xvZ2ljdG9kby5qcyc7XG5pbXBvcnQgeyBzaHJpbmtPd25Cb2FyZCB9IGZyb20gJy4vbG9naWN0b2RvLmpzJztcbmltcG9ydCB7IHJlc2V0RE9NIH0gZnJvbSAnLi9sb2dpY3RvZG8uanMnO1xuaW1wb3J0IHsgaGlkZUNvbXBCb2FyZCB9IGZyb20gJy4vbG9naWN0b2RvLmpzJztcblxuY29uc3QgcGtnID0gcmVxdWlyZSgnLi4vbG9naWMuanMnKTtcbmNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV3R2FtZUJ0blwiKTtcbmNvbnN0IGxlbmd0aEZvclNoaXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxlbmd0aEluZGljYXRvclwiKTtcbmNvbnN0IHBsYWNlU2hpcEluc3RydWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcm9tcHRQbGFjaW5nUDFcIik7XG5jb25zdCBzdGFydEJhdHRsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYmF0dGxlU3RhcnRcIik7XG5jb25zdCByZWFkeUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZG9uZVdpdGhTaGlwc1wiKTtcbmNvbnN0IGF4aXNUb2dnbGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJheGlzVG9nZ2xlXCIpO1xuXG5mdW5jdGlvbiB0b2dnbGVCdXR0b24oKSB7XG4gICAgaWYgKGJ0bi5zdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIiB8fCBidG4uc3R5bGUuZGlzcGxheSA9PT0gXCJcIikge1xuICAgICAgICBidG4uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICB9IGVsc2UgaWYgKGJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiKSB7XG4gICAgICAgIGJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzdGFydEdhbWUoKSB7XG4gICAgbG9naWN0b2RvKCk7Ly9ET00gc3R1ZmZcbiAgICAvLy0tLS0tZ2FtZSBsb29wIHN0YXJ0XG4gICAgbGV0IFAxID0gcGtnLlBsYXllcignUGxheWVyIDEnKTtcbiAgICBsZXQgUDIgPSBwa2cuUGxheWVyKCdDb21wdXRlcicpO1xuICAgIGxldCBjdXJyZW50UGxheWVyID0gbnVsbDtcbiAgICBsZXQgd2FpdGluZ1BsYXllciA9IG51bGw7XG5cbiAgICAvL2N1cnJlbnRseSBqdXN0IHBsYXllciB2cyBDUFVcbiAgICAvL2FkZCBpbiBsYXRlciAtIGNob2ljZSBvZiBQdlAgb3IgdnMgQ1BVXG4gICAgLy9uYW1lIGlucHV0IGZvciBwbGF5ZXIocylcblxuICAgIC8vZGVjaWRlIHdobyBnb2VzIGZpcnN0XG4gICAgZnVuY3Rpb24gdHVyblN3aXRjaEhpZGVCb2FyZHMocGxheWVyKSB7Ly9pbnNlcnQgY3VycmVudFBsYXllclxuICAgICAgICBsZXQgcDFTdHVmZnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInAxU2VwZXJhdG9yXCIpO1xuICAgICAgICBsZXQgcDJTdHVmZnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInAyU2VwZXJhdG9yXCIpO1xuICAgICAgICBpZiAocGxheWVyID09PSBQMSkge1xuICAgICAgICAgICAgcDFTdHVmZnMuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgICAgIHAyU3R1ZmZzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgfSBlbHNlIGlmIChwbGF5ZXIgPT09IFAyKSB7XG4gICAgICAgICAgICBwMVN0dWZmcy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICBwMlN0dWZmcy5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHBpY2tTdGFydGVyKCkge1xuICAgICAgICBsZXQgZ29GaXJzdCA9IE1hdGgucmFuZG9tKCkgPCAwLjUgPyBcIlAxXCIgOiBcIlAyXCI7XG4gICAgICAgIGlmIChnb0ZpcnN0ID09PSBcIlAxXCIpIHtcbiAgICAgICAgICAgIGN1cnJlbnRQbGF5ZXIgPSBQMTtcbiAgICAgICAgICAgIHdhaXRpbmdQbGF5ZXIgPSBQMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGN1cnJlbnRQbGF5ZXIgPSBQMjtcbiAgICAgICAgICAgIHdhaXRpbmdQbGF5ZXIgPSBQMTtcbiAgICAgICAgfVxuICAgICAgICB0dXJuU3dpdGNoSGlkZUJvYXJkcyhjdXJyZW50UGxheWVyKTtcbiAgICB9XG4gICAgXG4gICAgZnVuY3Rpb24gY2hlY2tGb3JXaW4oKSB7XG4gICAgICAgIC8vY2hlY2sgZm9yIHdpbiBmaXJzdFxuICAgICAgICBpZiAoUDEuYWxsU2hpcHNTdW5rKCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUDIgaXMgdGhlIHdpbm5lci4gV2hvbyEhXCIpO1xuICAgICAgICAgICAgc3RhcnRCYXR0bGUuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgICAgdG9nZ2xlQnV0dG9uKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChQMi5hbGxTaGlwc1N1bmsoKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJQMSBpcyB0aGUgd2lubmVyLiBXaG9vISFcIik7XG4gICAgICAgICAgICBzdGFydEJhdHRsZS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICB0b2dnbGVCdXR0b24oKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHBsYXllclR1cm5Td2l0Y2goKSB7XG4gICAgICAgIC8qIC8vY2hlY2sgZm9yIHdpbiBmaXJzdFxuICAgICAgICBpZiAoUDEuYWxsU2hpcHNTdW5rKCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUDIgaXMgdGhlIHdpbm5lci4gV2hvbyEhXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKFAyLmFsbFNoaXBzU3VuaygpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlAxIGlzIHRoZSB3aW5uZXIuIFdob28hIVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSAgZWxzZSovIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UGxheWVyID09PSBQMikge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRQbGF5ZXIgPSBQMTtcbiAgICAgICAgICAgICAgICB3YWl0aW5nUGxheWVyID0gUDI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRQbGF5ZXIgPSBQMjtcbiAgICAgICAgICAgICAgICB3YWl0aW5nUGxheWVyID0gUDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0dXJuU3dpdGNoSGlkZUJvYXJkcyhjdXJyZW50UGxheWVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL3BpY2tTdGFydGVyKCk7XG4gICAgY3VycmVudFBsYXllciA9IFAxO1xuICAgIHdhaXRpbmdQbGF5ZXIgPSBQMjtcbiAgICB0dXJuU3dpdGNoSGlkZUJvYXJkcyhjdXJyZW50UGxheWVyKTtcbiAgICBjb25zb2xlLmxvZyhcImN1cnJlbnRQbGF5ZXIgaXMgXCIsIGN1cnJlbnRQbGF5ZXIpO1xuXG4gICAgLy9zdGFydCB3aXRoIFVQIFRPIDEwIC0tIGZvdXIgMXMsIHRocmVlIDJzLCB0d28gM3MsIG9uZSA0XG4gICAgY3VycmVudFBsYXllciA9IFwicGF1c2VQbGFjZVwiO1xuICAgIHdhaXRpbmdQbGF5ZXIgPSBcInBhdXNlUGxhY2VcIjsgXG4gICAgLy90byBrZWVwIHRhcmdldCBib2FyZHMgZnJvbSBmaXJpbmdcblxuICAgIC8vY29kZSBoZXJlIHRvIHRvZ2dsZSB0aGUgXCJpbnN0cnVjdGlvbnNcIiBmb3IgcGxhY2VtZW50IG9uXG5cbiAgICBheGlzVG9nZ2xlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICBpZiAoYXhpc1RvZ2dsZXIuaW5uZXJIVE1MID09PSBcInZlcnRpY2FsXCIpIHtcbiAgICAgICAgICAgIGF4aXNUb2dnbGVyLmlubmVySFRNTCA9IFwiaG9yaXpvbnRhbFwiO1xuICAgICAgICB9IGVsc2UgaWYgKGF4aXNUb2dnbGVyLmlubmVySFRNTCA9PT0gXCJob3Jpem9udGFsXCIpIHtcbiAgICAgICAgICAgIGF4aXNUb2dnbGVyLmlubmVySFRNTCA9IFwidmVydGljYWxcIjtcbiAgICAgICAgfVxuICAgIH0pXG5cbiAgICBsZXQgYWxsQ29weVNwYW5zUDEgPSBbXTtcbiAgICBsZXQgYWxsQ29weVNwYW5zUDIgPSBbXTtcblxuICAgIGNvbnN0IFAxU2VsZkJvYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNQMUdcIik7XG5cblxuICAgIFAxU2VsZkJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgIGxldCB0ZXN0QXJyYXkgPSBbXTtcbiAgICAgICAgbGV0IGxlbmd0aElucHV0dGVkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZW5ndGhJbnB1dFwiKS52YWx1ZTtcbiAgICAgICAgY29uc29sZS5sb2coXCJsZW5ndGhJbnB1dHRlZCBpcyBcIiwgbGVuZ3RoSW5wdXR0ZWQpO1xuICAgICAgICBsZXQgYXhpc0lucHV0dGVkID0gYXhpc1RvZ2dsZXIuaW5uZXJIVE1MO1xuICAgICAgICBjb25zb2xlLmxvZyhcImF4aXNJbnB1dHRlZCBpcyBcIiwgYXhpc0lucHV0dGVkKTtcbiAgICAgICAgaWYgKGN1cnJlbnRQbGF5ZXIgIT09IFwicGF1c2VQbGFjZVwiICYmIHdhaXRpbmdQbGF5ZXIgIT09IFwicGF1c2VQbGFjZVwiKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAobGVuZ3RoSW5wdXR0ZWQgPCAwIHx8IGxlbmd0aElucHV0dGVkID4gNCB8fCBsZW5ndGhJbnB1dHRlZCA9PT0gXCJcIikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJub3RoaW5nIGFkZGVkLCB3aGV3XCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coUDEucGxheWVyU2hpcENvdW50KCkpO1xuICAgICAgICAgICAgaWYgKGUudGFyZ2V0LmlkID09PSBcIlAxR1wiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuY2xhc3NOYW1lLnNsaWNlKDAsNikgPT09IFwic3F1YXJlXCIgJiYgZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuaWQuc2xpY2UoMSwyKSA9PT0gXCIwXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuY2xhc3NOYW1lLnNsaWNlKDAsNikgPT09IFwic3F1YXJlXCIgJiYgZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuaWQuc2xpY2UoMCw1KSA9PT0gXCJlbXB0eVwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKFAxLnBsYXllclNoaXBDb3VudCgpIDwgMTApIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvb3JkUGlja2VkID0gZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuaWQuc3BsaXQoJ18nKVswXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJjb29yZFBpY2tlZCBpcyBcIiwgY29vcmRQaWNrZWQpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgc2hpcFNwYW5UZXN0UDEgPSBQMS5wbGF5ZXJQbGFjZVNoaXBTcGFuKGNvb3JkUGlja2VkLCBsZW5ndGhJbnB1dHRlZCwgYXhpc0lucHV0dGVkKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJzaGlwU3BhblRlc3RQMSBpcyBcIiwgc2hpcFNwYW5UZXN0UDEpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgY29weVNwYW4gPSBzaGlwU3BhblRlc3RQMS5zbGljZSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoUDEucGxheWVyQ2hlY2tPdmVybGFwKGNvcHlTcGFuKSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgY29weVNwYW4xUDEgPSBzaGlwU3BhblRlc3RQMS5zbGljZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxsQ29weVNwYW5zUDEucHVzaChjb3B5U3BhbjFQMSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIFAxLnBsYXllclBsYWNlKGNvb3JkUGlja2VkLCBsZW5ndGhJbnB1dHRlZCwgYXhpc0lucHV0dGVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlc3RBcnJheS5wdXNoKGNvcHlTcGFuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlU2hpcHNET00oc2hpcFNwYW5UZXN0UDEsIFAxLCBQMSwgUDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coUDEucGxheWVyQm9hcmQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcblxuICAgIHJlYWR5QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgIC8vYWRkcyBhbiBlcXVhbCAjIG9mIHNoaXBzIHRvIHdoYXQgUDEgaGFzIChkaWZmZXJlbnQgbGVuZ3RocylcbiAgICAgICAgbGV0IG51bVNoaXBzTmVlZGVkID0gUDEuc2hpcHNVcCgpO1xuICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IG51bVNoaXBzTmVlZGVkOyBrKyspIHtcbiAgICAgICAgICAgIGxldCBsZW5ndGhPZlNoaXAgPSAoayU0KSsxO1xuICAgICAgICAgICAgbGV0IGNvbXBHZW5Qb3NBeGlzID0gUDIuY29tcHV0ZXJQbGFjZShsZW5ndGhPZlNoaXApO1xuICAgICAgICAgICAgY29uc29sZS5sb2coY29tcEdlblBvc0F4aXMpO1xuICAgICAgICAgICAgbGV0IHNoaXBTcGFuMVAyID0gUDIucGxheWVyUGxhY2VTaGlwU3Bhbihjb21wR2VuUG9zQXhpc1swXSwgbGVuZ3RoT2ZTaGlwLCBjb21wR2VuUG9zQXhpc1sxXSk7XG4gICAgICAgICAgICBsZXQgY29weVNwYW4xUDIgPSBzaGlwU3BhbjFQMi5zbGljZSgpO1xuICAgICAgICAgICAgYWxsQ29weVNwYW5zUDIucHVzaChjb3B5U3BhbjFQMik7XG4gICAgICAgICAgICBwbGFjZVNoaXBzRE9NKHNoaXBTcGFuMVAyLCB3YWl0aW5nUGxheWVyLCBQMSwgUDIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKFAyLnBsYXllckJvYXJkKTtcbiAgICAgICAgLy9vbmNlIGVuZW15IHNoaXBzIGhhdmUgYmVlbiBzZXQsIGNoYW5nZSBpbnN0cnVjdGlvbnMgb24gcmlnaHRcbiAgICAgICAgLy8mIHJlbW92ZSBcInNoaXAgYWRkaW5nXCIgYnV0dG9ucyBvbiB0aGUgbGVmdFxuICAgICAgICByZWFkeUJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIGF4aXNUb2dnbGVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgbGVuZ3RoRm9yU2hpcC5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIHBsYWNlU2hpcEluc3RydWN0LnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgc3RhcnRCYXR0bGUuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgY3VycmVudFBsYXllciA9IFAxO1xuICAgICAgICB3YWl0aW5nUGxheWVyID0gUDI7XG4gICAgfSlcblxuICAgIC8vYWRkIGluIGxhdGVyIC0gY2hvb3Npbmcgd2hlcmUgdG8gcGxhY2Ugc2hpcHMhXG4gICAgLy9ET00vVUkgc2VsZWN0aW9uID4gZmlyaW5nIHBsYXllclBsYWNlIGNvZGUgPiBzZXR0aW5nIG5ldyBET01cbiAgICAvL29yIHRoZSByYW5kb20gQ1BVIHNoaXAgcGxhY2VtZW50IGJlbG93IGZvciB2cyBDUFVcbiAgICAvL3dpbGwgYWxzbyBuZWVkIHRvIHB1dCBjb2RlIHRvIEhJREUgXG4gICAgLy9DUFUgKG9yIG90aGVyIHBlcnNvbidzKSBib2FyZHNcbiAgICBcbiAgICAvKiBQMi5jb21wdXRlclBsYWNlKDQpO1xuICAgIFAyLmNvbXB1dGVyUGxhY2UoMyk7XG4gICAgUDIuY29tcHV0ZXJQbGFjZSgyKTtcbiAgICBQMi5jb21wdXRlclBsYWNlKDEpOyAqLyAvL3JhbmRvbWx5IHBsYWNlcyBmb3IgY29tcHV0ZXJcblxuICAgIC8qIFAxLnBsYXllclBsYWNlKCdBMicsIDMsICd2ZXJ0aWNhbCcpO1xuICAgIFAxLnBsYXllclBsYWNlKCdEMicsIDIsICdob3Jpem9udGFsJyk7XG4gICAgUDEucGxheWVyUGxhY2UoJ0g0JywgMSwgJ3ZlcnRpY2FsJyk7XG4gICAgUDEucGxheWVyUGxhY2UoJ0oxJywgNCwgJ3ZlcnRpY2FsJyk7XG4gICAgbGV0IHNoaXBTcGFuMVAxID0gUDEucGxheWVyUGxhY2VTaGlwU3BhbignQTInLCAzLCAndmVydGljYWwnKTtcbiAgICBsZXQgc2hpcFNwYW4yUDEgPSBQMS5wbGF5ZXJQbGFjZVNoaXBTcGFuKCdEMicsIDIsICdob3Jpem9udGFsJyk7XG4gICAgbGV0IHNoaXBTcGFuM1AxID0gUDEucGxheWVyUGxhY2VTaGlwU3BhbignSDQnLCAxLCAndmVydGljYWwnKTtcbiAgICBsZXQgc2hpcFNwYW40UDEgPSBQMS5wbGF5ZXJQbGFjZVNoaXBTcGFuKCdKMScsIDQsICd2ZXJ0aWNhbCcpO1xuXG4gICAgbGV0IGNvcHlTcGFuMVAxID0gc2hpcFNwYW4xUDEuc2xpY2UoKTtcbiAgICBsZXQgY29weVNwYW4yUDEgPSBzaGlwU3BhbjJQMS5zbGljZSgpO1xuICAgIGxldCBjb3B5U3BhbjNQMSA9IHNoaXBTcGFuM1AxLnNsaWNlKCk7XG4gICAgbGV0IGNvcHlTcGFuNFAxID0gc2hpcFNwYW40UDEuc2xpY2UoKTtcbiAgICBsZXQgYWxsQ29weVNwYW5zUDEgPSBbXTtcbiAgICBhbGxDb3B5U3BhbnNQMS5wdXNoKGNvcHlTcGFuMVAxKTtcbiAgICBhbGxDb3B5U3BhbnNQMS5wdXNoKGNvcHlTcGFuMlAxKTtcbiAgICBhbGxDb3B5U3BhbnNQMS5wdXNoKGNvcHlTcGFuM1AxKTtcbiAgICBhbGxDb3B5U3BhbnNQMS5wdXNoKGNvcHlTcGFuNFAxKTsgKi9cblxuICAgIC8qIFAyLnBsYXllclBsYWNlKCdBMicsIDMsICd2ZXJ0aWNhbCcpO1xuICAgIFAyLnBsYXllclBsYWNlKCdEMicsIDIsICdob3Jpem9udGFsJyk7XG4gICAgUDIucGxheWVyUGxhY2UoJ0g0JywgMSwgJ3ZlcnRpY2FsJyk7XG4gICAgUDIucGxheWVyUGxhY2UoJ0oxJywgNCwgJ3ZlcnRpY2FsJyk7ICovXG5cbiAgICAvKiBsZXQgc2hpcFNwYW4xUDIgPSBQMi5wbGF5ZXJQbGFjZVNoaXBTcGFuKCdBMicsIDMsICd2ZXJ0aWNhbCcpO1xuICAgIGxldCBzaGlwU3BhbjJQMiA9IFAyLnBsYXllclBsYWNlU2hpcFNwYW4oJ0QyJywgMiwgJ2hvcml6b250YWwnKTtcbiAgICBsZXQgc2hpcFNwYW4zUDIgPSBQMi5wbGF5ZXJQbGFjZVNoaXBTcGFuKCdINCcsIDEsICd2ZXJ0aWNhbCcpO1xuICAgIGxldCBzaGlwU3BhbjRQMiA9IFAyLnBsYXllclBsYWNlU2hpcFNwYW4oJ0oxJywgNCwgJ3ZlcnRpY2FsJyk7ICovXG4gICAgLy90ZXN0aW5nIHVzaW5nIHRoZXNlIHNwYW5zIHRvIGZpbmQgaWYgYSBzaGlwJ3MgY29vcmRpbmF0ZXMgXG4gICAgLy9hcmUgd2l0aGluIGl0LCBhbmQgdGhlbiB1c2luZyB0aGF0IHRvIFwiYmxvY2tcIiBvdXQgYSBzdW5rIHNoaXBcbiAgICAvL29uIHRoZSBET01cbiAgICAvKiBsZXQgY29weVNwYW4xUDIgPSBzaGlwU3BhbjFQMi5zbGljZSgpO1xuICAgIGxldCBjb3B5U3BhbjJQMiA9IHNoaXBTcGFuMlAyLnNsaWNlKCk7XG4gICAgbGV0IGNvcHlTcGFuM1AyID0gc2hpcFNwYW4zUDIuc2xpY2UoKTtcbiAgICBsZXQgY29weVNwYW40UDIgPSBzaGlwU3BhbjRQMi5zbGljZSgpO1xuICAgIGxldCBhbGxDb3B5U3BhbnNQMiA9IFtdO1xuICAgIGFsbENvcHlTcGFuc1AyLnB1c2goY29weVNwYW4xUDIpO1xuICAgIGFsbENvcHlTcGFuc1AyLnB1c2goY29weVNwYW4yUDIpO1xuICAgIGFsbENvcHlTcGFuc1AyLnB1c2goY29weVNwYW4zUDIpO1xuICAgIGFsbENvcHlTcGFuc1AyLnB1c2goY29weVNwYW40UDIpOyAqL1xuXG4gICAgLyogcGxhY2VTaGlwc0RPTShzaGlwU3BhbjFQMSwgY3VycmVudFBsYXllciwgUDEsIFAyKTtcbiAgICBwbGFjZVNoaXBzRE9NKHNoaXBTcGFuMlAxLCBjdXJyZW50UGxheWVyLCBQMSwgUDIpO1xuICAgIHBsYWNlU2hpcHNET00oc2hpcFNwYW4zUDEsIGN1cnJlbnRQbGF5ZXIsIFAxLCBQMik7XG4gICAgcGxhY2VTaGlwc0RPTShzaGlwU3BhbjRQMSwgY3VycmVudFBsYXllciwgUDEsIFAyKTsgXG5cbiAgICBwbGFjZVNoaXBzRE9NKHNoaXBTcGFuMVAyLCB3YWl0aW5nUGxheWVyLCBQMSwgUDIpO1xuICAgIHBsYWNlU2hpcHNET00oc2hpcFNwYW4yUDIsIHdhaXRpbmdQbGF5ZXIsIFAxLCBQMik7XG4gICAgcGxhY2VTaGlwc0RPTShzaGlwU3BhbjNQMiwgd2FpdGluZ1BsYXllciwgUDEsIFAyKTtcbiAgICBwbGFjZVNoaXBzRE9NKHNoaXBTcGFuNFAyLCB3YWl0aW5nUGxheWVyLCBQMSwgUDIpOyovXG5cbiAgICAvL2FmdGVyIHNoaXBzIHBsYWNlZCwgc2hyaW5rIGdhbWVib2FyZCBzbyBpdCdzIGxlc3MgaW4gdGhlIHdheVxuICAgIC8qIHNocmlua093bkJvYXJkKGN1cnJlbnRQbGF5ZXIsIFAxLCBQMik7XG4gICAgc2hyaW5rT3duQm9hcmQod2FpdGluZ1BsYXllciwgUDEsIFAyKTsgKi9cblxuXG4gICAgZnVuY3Rpb24gc3Bpbm5lck9uKCkge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRlclwiKS5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzcGlubmVyT2ZmKCkge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRlclwiKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgfVxuICAgIC8vUDEgKG1lKSBmaXJzdCwgbmVlZCBhZGRFdmVudExpc3RlbmVyIGZvciBteSBcbiAgICAvL2VuZW15IGJvYXJkXG4gICAgLy9vbmUgY2xpY2sgd2lsbCBoYXZlIHRvIGdldCB0aGUgZmlyc3QgdHdvIGNoYXIgb2Ygc3EgSURcbiAgICAvL2FuZCBkbyBmdW5jdGlvbiAoZXg6IFAxLmRpZEF0a01pc3MoJ0EyJywgUDIuZ2V0QXR0YWNrZWQpKVxuICAgIGNvbnN0IFAxRW5lbXlCb2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjUDFUXCIpO1xuICAgIFAxRW5lbXlCb2FyZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICBpZiAoY3VycmVudFBsYXllciAhPT0gUDEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChlLnRhcmdldC5pZCA9PT0gXCJQMVRcIikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmNsYXNzTmFtZS5zbGljZSgwLDYpID09PSBcInNxdWFyZVwiICYmIGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmlkLnNsaWNlKDEsMikgPT09IFwiMFwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmNsYXNzTmFtZS5zbGljZSgwLDYpID09PSBcInNxdWFyZVwiICYmIGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmlkLnNsaWNlKDAsNSkgPT09IFwiZW1wdHlcIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBjb29yZFBpY2tlZCA9IGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmlkLnNwbGl0KCdfJylbMF07XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJjb29yZFBpY2tlZCB3YXMgXCIsIGNvb3JkUGlja2VkKTtcbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0gUDEuZGlkQXRrTWlzcyhjb29yZFBpY2tlZCwgUDIuZ2V0QXR0YWNrZWQpO1xuICAgICAgICAgICAgICAgIGxldCBkaWRJU2lua0FTaGlwID0gUDIuZ2V0U2hpcEZvck9wcChjb29yZFBpY2tlZCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAhPT0gZmFsc2UpIHtcblxuICAgICAgICAgICAgICAgICAgICAvL2V4Y2x1ZGVzIGZhbHNlIHdoZW4gY29vcmQgaXMgYWxyZWFkeSBoaXQvbWlzc2VkXG4gICAgICAgICAgICAgICAgICAgIGxldCBzcUhvbGRlckNvb3JkID0gcmVzdWx0LnNsaWNlKDUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgaGl0TWlzcyA9IHJlc3VsdC5zbGljZSgwLDQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInNxSG9sZGVyQ29vcmQ6IFwiLCBzcUhvbGRlckNvb3JkKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJoaXRNaXNzOiBcIiwgaGl0TWlzcyk7XG4gICAgICAgICAgICAgICAgICAgIGZpbGxTcXVhcmVET00oc3FIb2xkZXJDb29yZCwgaGl0TWlzcywgY3VycmVudFBsYXllciwgUDEsIFAyKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpZElTaW5rQVNoaXAgIT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRpZElTaW5rQVNoaXAuZ2V0SGl0cygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRpZElTaW5rQVNoaXAuaXNTdW5rKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8tLS0tLS0tLS0tLS1tYWtlIHRoaXMgc28gaXQnbGwgZGlzcGxheVxuICAgICAgICAgICAgICAgICAgICAgICAgLy90aGF0IGEgc2hpcCBoYXMgU1VOSyBcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkaWRJU2lua0FTaGlwLmlzU3VuaygpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGFycmF5T2ZET00gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxDb3B5U3BhbnNQMi5mb3JFYWNoKGFycmF5ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGFyckxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBhcnJMZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFycmF5W2tdLmluY2x1ZGVzKGAke2Nvb3JkUGlja2VkfWApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyYXlPZkRPTSA9IGFycmF5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYXJyYXlPZkRPTSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyYXlPZkRPTS5mb3JFYWNoKGV6ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGFyclN0cmluZyA9IGV6WzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaGlwU3Vua0RPTShhcnJTdHJpbmcsIGN1cnJlbnRQbGF5ZXIsIFAxLCBQMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlAxIG15SGl0czogXCIsIFAxLm15SGl0cyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUDEgbXlNaXNzZXM6IFwiLCBQMS5teU1pc3Nlcyk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAvL3BsYXllclR1cm5Td2l0Y2goKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoZWNrRm9yV2luKCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHBsYXllclR1cm5Td2l0Y2gsIDUwMCk7Ly9naXZlIGl0IHRpbWVcblxuICAgICAgICAgICAgICAgICAgICAgICAgaGlkZUNvbXBCb2FyZCgpOy8vaGlkZSBDUFUncyBwbGFjZW1lbnRzXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc2V0VGltZW91dChjb21wdXRlclR1cm4sIDI0MDApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFmdGVyIDEwMDBtcywgY2FsbCB0aGUgYHNldFRpbWVvdXRgIGNhbGxiYWNrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW4gdGhlIG1lYW50aW1lLCBjb250aW51ZSBleGVjdXRpbmcgY29kZSBiZWxvd1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXB1dGVyVHVybigpIC8vcnVucyBzZWNvbmQgYWZ0ZXIgMTEwMG1zXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwyMjAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3Bpbm5lck9uKCkgLy9ydW5zIGZpcnN0LCBhZnRlciAxMDAwbXNcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sNTAwKVxuICAgICAgICAgICAgICAgICAgICB9Ly9jb21wdXRlciBcInRoaW5raW5nXCJcbiAgICAgICAgICAgICAgICAgICAgLy9jb21wdXRlclR1cm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxuICAgIFxuICAgIGNvbnN0IFAyRW5lbXlCb2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjUDJUXCIpO1xuICAgIFAyRW5lbXlCb2FyZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICBpZiAoY3VycmVudFBsYXllciAhPT0gUDIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChlLnRhcmdldC5pZCA9PT0gXCJQMlRcIikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmNsYXNzTmFtZS5zbGljZSgwLDYpID09PSBcInNxdWFyZVwiICYmIGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmlkLnNsaWNlKDEsMikgPT09IFwiMFwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmNsYXNzTmFtZS5zbGljZSgwLDYpID09PSBcInNxdWFyZVwiICYmIGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmlkLnNsaWNlKDAsNSkgPT09IFwiZW1wdHlcIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBjb29yZFBpY2tlZCA9IGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmlkLnNsaWNlKDAsMik7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJjb29yZFBpY2tlZCB3YXMgXCIsIGNvb3JkUGlja2VkKTtcbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0gUDIuZGlkQXRrTWlzcyhjb29yZFBpY2tlZCwgUDEuZ2V0QXR0YWNrZWQpO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vZXhjbHVkZXMgZmFsc2Ugd2hlbiBjb29yZCBpcyBhbHJlYWR5IGhpdC9taXNzZWRcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNxSG9sZGVyQ29vcmQgPSByZXN1bHQuc2xpY2UoNSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBoaXRNaXNzID0gcmVzdWx0LnNsaWNlKDAsNCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic3FIb2xkZXJDb29yZDogXCIsIHNxSG9sZGVyQ29vcmQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImhpdE1pc3M6IFwiLCBoaXRNaXNzKTtcbiAgICAgICAgICAgICAgICAgICAgZmlsbFNxdWFyZURPTShzcUhvbGRlckNvb3JkLCBoaXRNaXNzLCBjdXJyZW50UGxheWVyLCBQMSwgUDIpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlAyIG15SGl0czogXCIsIFAyLm15SGl0cyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUDIgbXlNaXNzZXM6IFwiLCBQMi5teU1pc3Nlcyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGVja0ZvcldpbigpID09PSBmYWxzZSkgeyBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQocGxheWVyVHVyblN3aXRjaCwgMTUwMCk7Ly9naXZlIGl0IHRpbWVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvL3BsYXllclR1cm5Td2l0Y2goKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxuXG4gICAgZnVuY3Rpb24gY29tcHV0ZXJUdXJuKCkge1xuICAgICAgICAvL2N1cnJlbnQgcGxheWVyIGp1c3Qgc3dpdGNoZWQgdG8gUDIsIGFrYSBDb21wdXRlclxuICAgICAgICBsZXQgcmVzdWx0ID0gUDIuZGlkQXRrTWlzcyhQMi5yYW5kb21BdGtDaG9pY2UoKSwgUDEuZ2V0QXR0YWNrZWQpO1xuICAgICAgICBsZXQgc3FIb2xkZXJDb29yZCA9IHJlc3VsdC5zbGljZSg1KTtcbiAgICAgICAgbGV0IGhpdE1pc3MgPSByZXN1bHQuc2xpY2UoMCw0KTtcblxuICAgICAgICBcbiAgICAgICAgY29uc29sZS5sb2coXCJyZXN1bHQ6IFwiLCByZXN1bHQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInNxSG9sZGVyQ29vcmQ6IFwiLCBzcUhvbGRlckNvb3JkKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJoaXRNaXNzOiBcIiwgaGl0TWlzcyk7XG4gICAgICAgIGZpbGxTcXVhcmVET00oc3FIb2xkZXJDb29yZCwgaGl0TWlzcywgY3VycmVudFBsYXllciwgUDEsIFAyKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJQMiBteUhpdHM6IFwiLCBQMi5teUhpdHMpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIlAyIG15TWlzc2VzOiBcIiwgUDIubXlNaXNzZXMpO1xuICAgICAgICBpZiAoY2hlY2tGb3JXaW4oKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQocGxheWVyVHVyblN3aXRjaCwgMTUwMCk7Ly9naXZlIGl0IHRpbWVcbiAgICAgICAgfVxuICAgICAgICBzcGlubmVyT2ZmKCk7XG4gICAgfVxuXG4gICAgLyogUDEuZGlkQXRrTWlzcygnQTInLCBQMi5nZXRBdHRhY2tlZCk7XG4gICAgUDIuZGlkQXRrTWlzcyhQMi5yYW5kb21BdGtDaG9pY2UoKSwgUDEuZ2V0QXR0YWNrZWQpO1xuICAgIGNvbnNvbGUubG9nKFAxLnBsYXllckJvYXJkKTtcbiAgICBjb25zb2xlLmxvZyhQMi5wbGF5ZXJCb2FyZCk7XG4gICAgY29uc29sZS5sb2coUDEubXlIaXRzKTtcbiAgICBjb25zb2xlLmxvZyhQMi5teUhpdHMpO1xuICAgIGNvbnNvbGUubG9nKFAyLm15TWlzc2VzKTsgKi9cbn1cblxuXG5idG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICB0b2dnbGVCdXR0b24oKTtcbiAgICBidG4uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICByZWFkeUJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIGF4aXNUb2dnbGVyLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgbGVuZ3RoRm9yU2hpcC5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIHBsYWNlU2hpcEluc3RydWN0LnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgdG9nZ2xlQnV0dG9uKCk7XG4gICAgcmVzZXRET00oKTtcbiAgICBzdGFydEdhbWUoKTtcbiAgICBcbn0pXG5cbnN0YXJ0R2FtZSgpO1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbG9naWN0b2RvKCkge1xuXG4gICAgbGV0IGdhbWVib2FyZHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiZ2FtZWJvYXJkXCIpO1xuICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoZ2FtZWJvYXJkcywgZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgbGV0IGxldHRlck51bWJBcnIgPSBbJ2VtcHR5JywnQScsJ0InLCdDJywnRCcsJ0UnLCdGJywnRycsJ0gnLCdJJywnSiddO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDExOyBpKyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgMTE7IGorKykge1xuICAgICAgICAgICAgICAgIGxldCBuZXdTcSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgbmV3U3EuY2xhc3NOYW1lID0gYHNxdWFyZWA7XG4gICAgICAgICAgICAgICAgbGV0IHNvbWVDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgICAgICBzb21lQ29udGVudC5jbGFzc05hbWUgPSBcImNvbnRlbnR6XCI7XG4gICAgICAgICAgICAgICAgaWYgKGogPT09IDAgJiYgaSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBzb21lQ29udGVudC5pbm5lckhUTUwgPSBgJHtpfWA7XG4gICAgICAgICAgICAgICAgfSBcbiAgICAgICAgICAgICAgICBpZiAoaSA9PT0gMCAmJiBqICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNvbWVDb250ZW50LmlubmVySFRNTCA9IGAke2xldHRlck51bWJBcnJbal19YFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZXdTcS5hcHBlbmRDaGlsZChzb21lQ29udGVudCk7XG4gICAgICAgICAgICAgICAgZWwuYXBwZW5kQ2hpbGQobmV3U3EpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgZmlyc3RTZWN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMUdcIik7XG4gICAgbGV0IHNldFNxdWFyZXMgPSBmaXJzdFNlY3Rpb24uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInNxdWFyZVwiKTtcbiAgICBsZXQgc2V0U3FBcnJheSA9IEFycmF5LmZyb20oc2V0U3F1YXJlcyk7Ly9jb252ZXJ0IHRvIGFycmF5XG5cbiAgICBsZXQgc2Vjb25kU2VjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDFUXCIpO1xuICAgIGxldCBzZXRTZWNvbmRTcXVhcmVzID0gc2Vjb25kU2VjdGlvbi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic3F1YXJlXCIpO1xuICAgIGxldCBzZXRTZWNvbmRTcUFycmF5ID0gQXJyYXkuZnJvbShzZXRTZWNvbmRTcXVhcmVzKTsvL2NvbnZlcnQgdG8gYXJyYXlcblxuICAgIGxldCB0aGlyZFNlY3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAyR1wiKTtcbiAgICBsZXQgc2V0VGhpcmRTcXVhcmVzID0gdGhpcmRTZWN0aW9uLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJzcXVhcmVcIik7XG4gICAgbGV0IHNldFRoaXJkU3FBcnJheSA9IEFycmF5LmZyb20oc2V0VGhpcmRTcXVhcmVzKTsvL2NvbnZlcnQgdG8gYXJyYXlcblxuICAgIGxldCBmb3VydGhTZWN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMlRcIik7XG4gICAgbGV0IHNldEZvdXJ0aFNxdWFyZXMgPSBmb3VydGhTZWN0aW9uLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJzcXVhcmVcIik7XG4gICAgbGV0IHNldEZvdXJ0aFNxQXJyYXkgPSBBcnJheS5mcm9tKHNldEZvdXJ0aFNxdWFyZXMpOy8vY29udmVydCB0byBhcnJheVxuXG4gICAgZnVuY3Rpb24gc2V0Q29sdW1ucyhzb21lQXJyYXksIG5hbWUpIHtcblxuICAgICAgICBsZXQgbGV0dGVyTnVtYkFyciA9IFsnZW1wdHknLCdBJywnQicsJ0MnLCdEJywnRScsJ0YnLCdHJywnSCcsJ0knLCdKJ107XG4gICAgICAgIGxldCBqMCA9IDA7XG4gICAgICAgIGxldCBqMSA9IDA7XG4gICAgICAgIGxldCBqMiA9IDA7XG4gICAgICAgIGxldCBqMyA9IDA7XG4gICAgICAgIGxldCBqNCA9IDA7XG4gICAgICAgIGxldCBqNSA9IDA7XG4gICAgICAgIGxldCBqNiA9IDA7XG4gICAgICAgIGxldCBqNyA9IDA7XG4gICAgICAgIGxldCBqOCA9IDA7XG4gICAgICAgIGxldCBqOSA9IDA7XG4gICAgICAgIGxldCBqMTAgPSAwO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNvbWVBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGklMTEgPT09IDApIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbMF19YDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzBdfSR7W2owXX1fYCtuYW1lKTtcbiAgICAgICAgICAgICAgICBqMCsrO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpJTExID09PSAxKSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzFdfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzFdfSR7W2oxXX1fYCtuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgajErKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gMikge1xuICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5jbGFzc05hbWUgPSBgc3F1YXJlICR7bGV0dGVyTnVtYkFyclsyXX1gO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFyclsyXX0ke1tqMl19X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGoyKys7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGklMTEgPT09IDMpIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbM119YDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLnNldEF0dHJpYnV0ZShcImlkXCIsIGAke2xldHRlck51bWJBcnJbM119JHtbajNdfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqMysrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmIChpJTExID09PSA0KSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzRdfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzRdfSR7W2o0XX1fYCtuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgajQrKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gNSkge1xuICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5jbGFzc05hbWUgPSBgc3F1YXJlICR7bGV0dGVyTnVtYkFycls1XX1gO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFycls1XX0ke1tqNV19X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGo1Kys7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGklMTEgPT09IDYpIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbNl19YDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLnNldEF0dHJpYnV0ZShcImlkXCIsIGAke2xldHRlck51bWJBcnJbNl19JHtbajZdfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqNisrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmIChpJTExID09PSA3KSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzddfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzddfSR7W2o3XX1fYCtuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgajcrKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gOCkge1xuICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5jbGFzc05hbWUgPSBgc3F1YXJlICR7bGV0dGVyTnVtYkFycls4XX1gO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFycls4XX0ke1tqOF19X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGo4Kys7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGklMTEgPT09IDkpIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbOV19YDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLnNldEF0dHJpYnV0ZShcImlkXCIsIGAke2xldHRlck51bWJBcnJbOV19JHtbajldfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqOSsrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmIChpJTExID09PSAxMCkge1xuICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5jbGFzc05hbWUgPSBgc3F1YXJlICR7bGV0dGVyTnVtYkFyclsxMF19YDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLnNldEF0dHJpYnV0ZShcImlkXCIsIGAke2xldHRlck51bWJBcnJbMTBdfSR7W2oxMF19X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGoxMCsrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldENvbHVtbnMoc2V0U3FBcnJheSwgXCJmaXJzdE9uZVwiKTtcbiAgICBzZXRDb2x1bW5zKHNldFNlY29uZFNxQXJyYXksIFwic2Vjb25kT25lXCIpO1xuICAgIHNldENvbHVtbnMoc2V0VGhpcmRTcUFycmF5LCBcInRoaXJkT25lXCIpO1xuICAgIHNldENvbHVtbnMoc2V0Rm91cnRoU3FBcnJheSwgXCJmb3VydGhPbmVcIik7XG5cbiAgICBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsYWNlU2hpcHNET00oYXJyYXksIHBsYXllciwgUDEsIFAyKSB7Ly9hcnJheSBmcm9tIHBsYXllclBsYWNlU2hpcFNwYW5cbiAgICBpZiAocGxheWVyID09PSBQMSkge1xuICAgICAgICBhcnJheS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGxldCBzdHIgPSBlbFswXTtcbiAgICAgICAgICAgIGxldCBzcGVjaWZpY1NxRm91bmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtzdHJ9X2ZpcnN0T25lYCk7XG4gICAgICAgICAgICBzcGVjaWZpY1NxRm91bmQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJibHVlXCI7XG4gICAgICAgIH0pXG4gICAgfSBlbHNlIGlmIChwbGF5ZXIgPT09IFAyKSB7XG4gICAgICAgIGFycmF5LmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgbGV0IHN0ciA9IGVsWzBdO1xuICAgICAgICAgICAgbGV0IHNwZWNpZmljU3FGb3VuZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGAke3N0cn1fdGhpcmRPbmVgKTtcbiAgICAgICAgICAgIHNwZWNpZmljU3FGb3VuZC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcImdyZWVuXCI7XG4gICAgICAgIH0pXG4gICAgfVxuICAgIFxufSAgXG5cbi8qIGV4cG9ydCBmdW5jdGlvbiB1bmRvSG92ZXJET00oYXJyYXksIHBsYXllciwgUDEsIFAyKSB7XG4gICAgaWYgKHBsYXllciA9PT0gUDEpIHtcbiAgICAgICAgYXJyYXkuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBsZXQgc3RyID0gZWxbMF07XG4gICAgICAgICAgICBsZXQgc3BlY2lmaWNTcUZvdW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7c3RyfV9maXJzdE9uZWApO1xuICAgICAgICAgICAgc3BlY2lmaWNTcUZvdW5kLnN0eWxlLm9wYWNpdHkgPSBcIjAuOFwiO1xuICAgICAgICB9KVxuICAgIH0gZWxzZSBpZiAocGxheWVyID09PSBQMikge1xuICAgICAgICBhcnJheS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGxldCBzdHIgPSBlbFswXTtcbiAgICAgICAgICAgIGxldCBzcGVjaWZpY1NxRm91bmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtzdHJ9X3RoaXJkT25lYCk7XG4gICAgICAgICAgICBzcGVjaWZpY1NxRm91bmQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJncmVlblwiO1xuICAgICAgICB9KVxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhvdmVyU2hpcHNET00oYXJyYXksIHBsYXllciwgUDEsIFAyKSB7Ly9hcnJheSBmcm9tIHBsYXllclBsYWNlU2hpcFNwYW5cbiAgICBpZiAocGxheWVyID09PSBQMSkge1xuICAgICAgICBhcnJheS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGxldCBzdHIgPSBlbFswXTtcbiAgICAgICAgICAgIGxldCBzcGVjaWZpY1NxRm91bmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtzdHJ9X2ZpcnN0T25lYCk7XG4gICAgICAgICAgICBzcGVjaWZpY1NxRm91bmQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJsaWdodGJsdWVcIjtcbiAgICAgICAgICAgIHNwZWNpZmljU3FGb3VuZC5zdHlsZS5vcGFjaXR5ID0gXCIxXCI7XG4gICAgICAgIH0pXG4gICAgfSBlbHNlIGlmIChwbGF5ZXIgPT09IFAyKSB7XG4gICAgICAgIGFycmF5LmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgbGV0IHN0ciA9IGVsWzBdO1xuICAgICAgICAgICAgbGV0IHNwZWNpZmljU3FGb3VuZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGAke3N0cn1fdGhpcmRPbmVgKTtcbiAgICAgICAgICAgIHNwZWNpZmljU3FGb3VuZC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcImdyZWVuXCI7XG4gICAgICAgIH0pXG4gICAgfVxuICAgIFxufSAgICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmaWxsU3F1YXJlRE9NKHN0ciwgaGl0T3JNaXNzLCBwbGF5ZXIsIFAxLCBQMikgey8vaW5wdXQgc3RyaW5nIG9mIGNvb3JkXG4gICAgaWYgKHBsYXllciA9PT0gUDEpIHtcbiAgICAgICAgbGV0IHNxVG9DaGFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtzdHJ9X3NlY29uZE9uZWApO1xuICAgICAgICBpZiAoaGl0T3JNaXNzID09PSBcIm1pc3NcIikge1xuICAgICAgICAgICAgc3FUb0NoYW5nZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIndoaXRlXCI7XG4gICAgICAgIH0gZWxzZSBpZiAoaGl0T3JNaXNzID09PSBcImhpdHNcIikge1xuICAgICAgICAgICAgc3FUb0NoYW5nZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcImRhcmtvcmFuZ2VcIjtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAocGxheWVyID09PSBQMikge1xuICAgICAgICBsZXQgc3FUb0NoYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGAke3N0cn1fZm91cnRoT25lYCk7XG4gICAgICAgIGlmIChoaXRPck1pc3MgPT09IFwibWlzc1wiKSB7XG4gICAgICAgICAgICBzcVRvQ2hhbmdlLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwid2hpdGVcIjtcbiAgICAgICAgfSBlbHNlIGlmIChoaXRPck1pc3MgPT09IFwiaGl0c1wiKSB7XG4gICAgICAgICAgICBzcVRvQ2hhbmdlLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiZGFya29yYW5nZVwiO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hpcFN1bmtET00oc3RyLCBwbGF5ZXIsIFAxLCBQMikgey8vaW5wdXQgc3RyaW5nIGNvb3JkXG4gICAgaWYgKHBsYXllciA9PT0gUDEpIHsgXG4gICAgICAgIGxldCBzcVRvU2luayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGAke3N0cn1fc2Vjb25kT25lYCk7XG4gICAgICAgIHNxVG9TaW5rLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiYmxhY2tcIjtcbiAgICB9IGVsc2UgaWYgKHBsYXllciA9PT0gUDIpIHtcblxuICAgICAgICBsZXQgc3FUb1NpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtzdHJ9X2ZvdXJ0aE9uZWApO1xuICAgICAgICBzcVRvU2luay5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcImJsYWNrXCI7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hyaW5rT3duQm9hcmQocGxheWVyLCBQMSwgUDIpIHtcbiAgICBpZiAocGxheWVyID09PSBQMSkge1xuICAgICAgICBsZXQgYm9hcmRUb1NocmluayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDFHXCIpO1xuICAgICAgICBib2FyZFRvU2hyaW5rLnN0eWxlLndpZHRoID0gXCI2MCVcIjtcbiAgICB9IGVsc2UgaWYgKHBsYXllciA9PT0gUDIpIHtcbiAgICAgICAgbGV0IGJvYXJkVG9TaHJpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAyR1wiKTtcbiAgICAgICAgYm9hcmRUb1Nocmluay5zdHlsZS53aWR0aCA9IFwiNjAlXCI7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGlkZUNvbXBCb2FyZCgpIHtcblxuICAgIGZ1bmN0aW9uIHJhbmRvbUNvbG9yKGJyaWdodG5lc3Mpe1xuICAgICAgICBmdW5jdGlvbiByYW5kb21DaGFubmVsKGJyaWdodG5lc3Mpe1xuICAgICAgICAgIHZhciByID0gMjU1LWJyaWdodG5lc3M7XG4gICAgICAgICAgdmFyIG4gPSAwfCgoTWF0aC5yYW5kb20oKSAqIHIpICsgYnJpZ2h0bmVzcyk7XG4gICAgICAgICAgdmFyIHMgPSBuLnRvU3RyaW5nKDE2KTtcbiAgICAgICAgICByZXR1cm4gKHMubGVuZ3RoPT0xKSA/ICcwJytzIDogcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJyMnICsgcmFuZG9tQ2hhbm5lbChicmlnaHRuZXNzKSArIHJhbmRvbUNoYW5uZWwoYnJpZ2h0bmVzcykgKyByYW5kb21DaGFubmVsKGJyaWdodG5lc3MpO1xuICAgIH1cblxuICAgIGxldCBjb21wR2FtZUJvYXJkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMkdcIik7XG4gICAgbGV0IGNoaWxkTm9kZXMgPSBjb21wR2FtZUJvYXJkLmNoaWxkTm9kZXM7XG4gICAgbGV0IGFycmF5ID0gQXJyYXkuZnJvbShjaGlsZE5vZGVzKTtcbiAgICBhcnJheS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBsZXQgbmV3Q29sb3IgPSByYW5kb21Db2xvcigxMjUpO1xuICAgICAgICBub2RlLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGAke25ld0NvbG9yfWA7XG4gICAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0RE9NKCkge1xuICAgIGxldCBmaXJzdE5vZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAxR1wiKTtcbiAgICBsZXQgc2Vjb25kTm9kZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDFUXCIpO1xuICAgIGxldCB0aGlyZE5vZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAyR1wiKTtcbiAgICBsZXQgZm91cnRoTm9kZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDJUXCIpO1xuICAgIHdoaWxlIChmaXJzdE5vZGUuZmlyc3RDaGlsZCkge1xuICAgICAgICBmaXJzdE5vZGUucmVtb3ZlQ2hpbGQoZmlyc3ROb2RlLmxhc3RDaGlsZCk7XG4gICAgfVxuICAgIHdoaWxlIChzZWNvbmROb2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgc2Vjb25kTm9kZS5yZW1vdmVDaGlsZChzZWNvbmROb2RlLmxhc3RDaGlsZCk7XG4gICAgfVxuICAgIHdoaWxlICh0aGlyZE5vZGUuZmlyc3RDaGlsZCkge1xuICAgICAgICB0aGlyZE5vZGUucmVtb3ZlQ2hpbGQodGhpcmROb2RlLmxhc3RDaGlsZCk7XG4gICAgfVxuICAgIHdoaWxlIChmb3VydGhOb2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgZm91cnRoTm9kZS5yZW1vdmVDaGlsZChmb3VydGhOb2RlLmxhc3RDaGlsZCk7XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9