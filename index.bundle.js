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
        //change input coordinates into array; A2 to [A][2]
        let coordArr = coordinates.split('');
        console.log("coordArr in findSpan is ", coordArr);
        let xIndexStart = findXIndex(coordinates);
        if (coordArr.length === 3) {
            yValueStart = Number(coordArr[1].concat(coordArr[2]))
        } else {
            yValueStart = Number(coordArr[1]);
        }
        console.log("yValueStart in findSpan is ", yValueStart);
        if (length === 1) {//case length === 1
            array.push([coordArr[0]+coordArr[1]]);
        } else {
            if (axis === "horizontal") {//case length > 1
                for (let i = 0; i < length; i++) {
                    let xSpanArray = [letterNumbArr[xIndexStart+i]+coordArr[1]];
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

        /* if (ownBoard.placeShip(position, length, axis) === false) {
            //meaning if it's placed off the board or overlapping
            //want to rerun this function again
        } */

        do {
            console.log("ran another placement by the comp");
            let position = randomPosition();
            let axis = randomAxis();
            boolHolder = ownBoard.placeShip(position, length, axis);
        } while (!boolHolder)
        
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
___CSS_LOADER_EXPORT___.push([module.id, "html, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed, \nfigure, figcaption, footer, header, hgroup, \nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\tfont-size: 100%;\n\tfont: inherit;\n\tvertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure, \nfooter, header, hgroup, menu, nav, section {\n\tdisplay: block;\n}\nbody {\n\tline-height: 1;\n}\nol, ul {\n\tlist-style: none;\n}\nblockquote, q {\n\tquotes: none;\n}\nblockquote:before, blockquote:after,\nq:before, q:after {\n\tcontent: '';\n\tcontent: none;\n}\ntable {\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}\n\n:root {\n    --primary: #ff6fb2; \n    --secondary: #c3195d; \n    --tertiary: #680747; \n    --quaternary: #141010; \n}\n\nhtml, body, div#content {\n    height: 100%;\n    width: 100%;\n    font-size: 15px;\n}\n\ndiv#p1Seperator {\n\tbackground-color: var(--primary);\n}\ndiv#p2Seperator {\n\tbackground-color:aqua;\n}\n\ndiv#P1G, div#P2G {\n\twidth: 60%;\n\tmargin: auto;\n}\n\ndiv.gameboard {\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\tborder: 3px solid pink;\n}\n\n.descriptor {\n\tfont-family: 'Space Grotesk', sans-serif;\n\tfont-size: 1.2rem;\n\tpadding: 0.5rem;\n\ttext-align: center;\n}\n\nbutton#newGameBtn {\n\tbackground-color: #c3195d;\n\tcolor:bisque;\n\tposition: absolute;\n\ttop: 5px;\n\tright: 5px;\n\tdisplay: none;\n}\n\ndiv#axisToggle {\n\tbackground-color: #c3195d;\n\tborder: 2px inset gray;\n\tfont-size: 1.0rem;\n\tcolor:bisque;\n\tposition: absolute;\n\tpadding: 4px;\n\ttop: 31px;\n\tleft: 5px;\n\t/* display: none; */\n}\n\ndiv#topBar {\n\tposition: relative;\n}\n\ndiv[class^=\"square\"] {\n\tposition: relative;\n\tflex-basis: calc(9% - 10px);\n\tmargin: 5px;\n\tborder: 1px solid;\n\tbox-sizing: border-box;\n}\n\ndiv[class^=\"square\"]::before {\n\tcontent: '';\n\tdisplay: block;\n\tpadding-top: 100%;\n}\n\ndiv[class^=\"square\"] .contentz {\n\tposition: absolute;\n\ttop: 0; left: 0;\n\theight: 100%;\n\twidth: 100%;\n  \n\tdisplay: flex;               /* added for centered text */\n\tjustify-content: center;     /* added for centered text */\n\talign-items: center;         /* added for centered text */\n}\n\n/* \ndiv#content {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(2, 40%);\n\tgrid-template-rows: repeat(2, 40%);\n}\n\ndiv.gameboard {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(11, 8%);\n\tgrid-template-rows: repeat(11, 8%);\n}\n\ndiv[class^=\"square\"] {\n\tbackground-color: rgb(184, 184, 184);\n\tborder: 1px solid black;\n\topacity: 0.5;\n\taspect-ratio: 1;\n} */\n\n/* loading/spinner stuff */\n\ndiv#lengthIndicator {\n\t/* display: none; */\n\tdisplay: flex;\n\tjustify-content: left;\n\talign-items: center;\n\tgap: 0.5rem;\n\tfont-size: 1.1rem;\n\tposition: absolute;\n\ttop: 5px;\n\tleft: 5px;\n}\n\ninput#lengthInput {\n\twidth: 25%;\n}\n\ndiv#promptPlacingP1 {\n\t/* display: none; */\n\tposition: absolute;\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\twidth: 14%;\n\ttop: 5px;\n\tright: 5px;\n}\n\n#loader {\n\tdisplay: none;\n\ttop: 50%;\n\tleft: 50%;\n\tposition: absolute;\n\ttransform: translate(-50%, -50%);\n}\n  \n.loading {\n\tborder: 8px solid rgb(220, 0, 0);\n\twidth: 60px;\n\theight: 60px;\n\tborder-radius: 50%;\n\tborder-top-color: #ff6320;\n\tborder-left-color: #ff7300;\n\tanimation: spin 1s infinite ease-in;\n}\n  \n@keyframes spin {\n\t0% {\n\t  transform: rotate(0deg);\n\t}\n  \n\t100% {\n\t  transform: rotate(360deg);\n\t}\n}\n\n@media screen and (min-width: 525px) {\n\thtml, body, div#content {\n\t  font-size: 20px;\n\t}\n\n\tdiv#axisToggle {\n\t\t\n\t\ttop: 37px;\n\t\t/* display: none; */\n\t}\n}", "",{"version":3,"sources":["webpack://./src/style.css"],"names":[],"mappings":"AAAA;;;;;;;;;;;;;CAaC,SAAS;CACT,UAAU;CACV,SAAS;CACT,eAAe;CACf,aAAa;CACb,wBAAwB;AACzB;AACA,gDAAgD;AAChD;;CAEC,cAAc;AACf;AACA;CACC,cAAc;AACf;AACA;CACC,gBAAgB;AACjB;AACA;CACC,YAAY;AACb;AACA;;CAEC,WAAW;CACX,aAAa;AACd;AACA;CACC,yBAAyB;CACzB,iBAAiB;AAClB;;AAEA;IACI,kBAAkB;IAClB,oBAAoB;IACpB,mBAAmB;IACnB,qBAAqB;AACzB;;AAEA;IACI,YAAY;IACZ,WAAW;IACX,eAAe;AACnB;;AAEA;CACC,gCAAgC;AACjC;AACA;CACC,qBAAqB;AACtB;;AAEA;CACC,UAAU;CACV,YAAY;AACb;;AAEA;CACC,aAAa;CACb,eAAe;CACf,sBAAsB;AACvB;;AAEA;CACC,wCAAwC;CACxC,iBAAiB;CACjB,eAAe;CACf,kBAAkB;AACnB;;AAEA;CACC,yBAAyB;CACzB,YAAY;CACZ,kBAAkB;CAClB,QAAQ;CACR,UAAU;CACV,aAAa;AACd;;AAEA;CACC,yBAAyB;CACzB,sBAAsB;CACtB,iBAAiB;CACjB,YAAY;CACZ,kBAAkB;CAClB,YAAY;CACZ,SAAS;CACT,SAAS;CACT,mBAAmB;AACpB;;AAEA;CACC,kBAAkB;AACnB;;AAEA;CACC,kBAAkB;CAClB,2BAA2B;CAC3B,WAAW;CACX,iBAAiB;CACjB,sBAAsB;AACvB;;AAEA;CACC,WAAW;CACX,cAAc;CACd,iBAAiB;AAClB;;AAEA;CACC,kBAAkB;CAClB,MAAM,EAAE,OAAO;CACf,YAAY;CACZ,WAAW;;CAEX,aAAa,gBAAgB,4BAA4B;CACzD,uBAAuB,MAAM,4BAA4B;CACzD,mBAAmB,UAAU,4BAA4B;AAC1D;;AAEA;;;;;;;;;;;;;;;;;;GAkBG;;AAEH,0BAA0B;;AAE1B;CACC,mBAAmB;CACnB,aAAa;CACb,qBAAqB;CACrB,mBAAmB;CACnB,WAAW;CACX,iBAAiB;CACjB,kBAAkB;CAClB,QAAQ;CACR,SAAS;AACV;;AAEA;CACC,UAAU;AACX;;AAEA;CACC,mBAAmB;CACnB,kBAAkB;CAClB,aAAa;CACb,eAAe;CACf,UAAU;CACV,QAAQ;CACR,UAAU;AACX;;AAEA;CACC,aAAa;CACb,QAAQ;CACR,SAAS;CACT,kBAAkB;CAClB,gCAAgC;AACjC;;AAEA;CACC,gCAAgC;CAChC,WAAW;CACX,YAAY;CACZ,kBAAkB;CAClB,yBAAyB;CACzB,0BAA0B;CAC1B,mCAAmC;AACpC;;AAEA;CACC;GACE,uBAAuB;CACzB;;CAEA;GACE,yBAAyB;CAC3B;AACD;;AAEA;CACC;GACE,eAAe;CACjB;;CAEA;;EAEC,SAAS;EACT,mBAAmB;CACpB;AACD","sourcesContent":["html, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed, \nfigure, figcaption, footer, header, hgroup, \nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\tfont-size: 100%;\n\tfont: inherit;\n\tvertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure, \nfooter, header, hgroup, menu, nav, section {\n\tdisplay: block;\n}\nbody {\n\tline-height: 1;\n}\nol, ul {\n\tlist-style: none;\n}\nblockquote, q {\n\tquotes: none;\n}\nblockquote:before, blockquote:after,\nq:before, q:after {\n\tcontent: '';\n\tcontent: none;\n}\ntable {\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}\n\n:root {\n    --primary: #ff6fb2; \n    --secondary: #c3195d; \n    --tertiary: #680747; \n    --quaternary: #141010; \n}\n\nhtml, body, div#content {\n    height: 100%;\n    width: 100%;\n    font-size: 15px;\n}\n\ndiv#p1Seperator {\n\tbackground-color: var(--primary);\n}\ndiv#p2Seperator {\n\tbackground-color:aqua;\n}\n\ndiv#P1G, div#P2G {\n\twidth: 60%;\n\tmargin: auto;\n}\n\ndiv.gameboard {\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\tborder: 3px solid pink;\n}\n\n.descriptor {\n\tfont-family: 'Space Grotesk', sans-serif;\n\tfont-size: 1.2rem;\n\tpadding: 0.5rem;\n\ttext-align: center;\n}\n\nbutton#newGameBtn {\n\tbackground-color: #c3195d;\n\tcolor:bisque;\n\tposition: absolute;\n\ttop: 5px;\n\tright: 5px;\n\tdisplay: none;\n}\n\ndiv#axisToggle {\n\tbackground-color: #c3195d;\n\tborder: 2px inset gray;\n\tfont-size: 1.0rem;\n\tcolor:bisque;\n\tposition: absolute;\n\tpadding: 4px;\n\ttop: 31px;\n\tleft: 5px;\n\t/* display: none; */\n}\n\ndiv#topBar {\n\tposition: relative;\n}\n\ndiv[class^=\"square\"] {\n\tposition: relative;\n\tflex-basis: calc(9% - 10px);\n\tmargin: 5px;\n\tborder: 1px solid;\n\tbox-sizing: border-box;\n}\n\ndiv[class^=\"square\"]::before {\n\tcontent: '';\n\tdisplay: block;\n\tpadding-top: 100%;\n}\n\ndiv[class^=\"square\"] .contentz {\n\tposition: absolute;\n\ttop: 0; left: 0;\n\theight: 100%;\n\twidth: 100%;\n  \n\tdisplay: flex;               /* added for centered text */\n\tjustify-content: center;     /* added for centered text */\n\talign-items: center;         /* added for centered text */\n}\n\n/* \ndiv#content {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(2, 40%);\n\tgrid-template-rows: repeat(2, 40%);\n}\n\ndiv.gameboard {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(11, 8%);\n\tgrid-template-rows: repeat(11, 8%);\n}\n\ndiv[class^=\"square\"] {\n\tbackground-color: rgb(184, 184, 184);\n\tborder: 1px solid black;\n\topacity: 0.5;\n\taspect-ratio: 1;\n} */\n\n/* loading/spinner stuff */\n\ndiv#lengthIndicator {\n\t/* display: none; */\n\tdisplay: flex;\n\tjustify-content: left;\n\talign-items: center;\n\tgap: 0.5rem;\n\tfont-size: 1.1rem;\n\tposition: absolute;\n\ttop: 5px;\n\tleft: 5px;\n}\n\ninput#lengthInput {\n\twidth: 25%;\n}\n\ndiv#promptPlacingP1 {\n\t/* display: none; */\n\tposition: absolute;\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\twidth: 14%;\n\ttop: 5px;\n\tright: 5px;\n}\n\n#loader {\n\tdisplay: none;\n\ttop: 50%;\n\tleft: 50%;\n\tposition: absolute;\n\ttransform: translate(-50%, -50%);\n}\n  \n.loading {\n\tborder: 8px solid rgb(220, 0, 0);\n\twidth: 60px;\n\theight: 60px;\n\tborder-radius: 50%;\n\tborder-top-color: #ff6320;\n\tborder-left-color: #ff7300;\n\tanimation: spin 1s infinite ease-in;\n}\n  \n@keyframes spin {\n\t0% {\n\t  transform: rotate(0deg);\n\t}\n  \n\t100% {\n\t  transform: rotate(360deg);\n\t}\n}\n\n@media screen and (min-width: 525px) {\n\thtml, body, div#content {\n\t  font-size: 20px;\n\t}\n\n\tdiv#axisToggle {\n\t\t\n\t\ttop: 37px;\n\t\t/* display: none; */\n\t}\n}"],"sourceRoot":""}]);
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
            toggleButton();
            return true;
        } else if (P2.allShipsSunk()) {
            console.log("P1 is the winner. Whoo!!");
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

    const axisToggler = document.getElementById("axisToggle");
    axisToggler.addEventListener('click', e => {
        if (axisToggler.innerHTML === "vertical") {
            axisToggler.innerHTML = "horizontal";
        } else if (axisToggler.innerHTML === "horizontal") {
            axisToggler.innerHTML = "vertical";
        }
    })

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
                        P1.playerPlace(coordPicked, lengthInputted, axisInputted);
                        testArray.push(copySpan);
                        (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.placeShipsDOM)(shipSpanTestP1, P1, P1, P2);
                        console.log(P1.playerBoard);
                    }
                }
            }
        }
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

    P2.playerPlace('A2', 3, 'vertical');
    P2.playerPlace('D2', 2, 'horizontal');
    P2.playerPlace('H4', 1, 'vertical');
    P2.playerPlace('J1', 4, 'vertical');
    let shipSpan1P2 = P2.playerPlaceShipSpan('A2', 3, 'vertical');
    let shipSpan2P2 = P2.playerPlaceShipSpan('D2', 2, 'horizontal');
    let shipSpan3P2 = P2.playerPlaceShipSpan('H4', 1, 'vertical');
    let shipSpan4P2 = P2.playerPlaceShipSpan('J1', 4, 'vertical');
    //testing using these spans to find if a ship's coordinates 
    //are within it, and then using that to "block" out a sunk ship
    //on the DOM
    let copySpan1P2 = shipSpan1P2.slice();
    let copySpan2P2 = shipSpan2P2.slice();
    let copySpan3P2 = shipSpan3P2.slice();
    let copySpan4P2 = shipSpan4P2.slice();
    let allCopySpansP2 = [];
    allCopySpansP2.push(copySpan1P2);
    allCopySpansP2.push(copySpan2P2);
    allCopySpansP2.push(copySpan3P2);
    allCopySpansP2.push(copySpan4P2);

    /* placeShipsDOM(shipSpan1P1, currentPlayer, P1, P2);
    placeShipsDOM(shipSpan2P1, currentPlayer, P1, P2);
    placeShipsDOM(shipSpan3P1, currentPlayer, P1, P2);
    placeShipsDOM(shipSpan4P1, currentPlayer, P1, P2); */

    (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.placeShipsDOM)(shipSpan1P2, waitingPlayer, P1, P2);
    (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.placeShipsDOM)(shipSpan2P2, waitingPlayer, P1, P2);
    (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.placeShipsDOM)(shipSpan3P2, waitingPlayer, P1, P2);
    (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.placeShipsDOM)(shipSpan4P2, waitingPlayer, P1, P2);

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
                let coordPicked = e.target.closest(".square").id.slice(0,2);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RUFBRSxNQUFNO0FBQ2pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFTywrQ0FBK0M7QUFDdEQ7QUFDQTtBQUNBO0FBQ0EsNkRBQTZELElBQUk7QUFDakU7QUFDQSxTQUFTO0FBQ1QsTUFBTTtBQUNOO0FBQ0E7QUFDQSw2REFBNkQsSUFBSTtBQUNqRTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRU8sd0RBQXdEO0FBQy9EO0FBQ0Esb0RBQW9ELElBQUk7QUFDeEQ7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0EsTUFBTTtBQUNOLG9EQUFvRCxJQUFJO0FBQ3hEO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRU8sMkNBQTJDO0FBQ2xEO0FBQ0Esa0RBQWtELElBQUk7QUFDdEQ7QUFDQSxNQUFNOztBQUVOLGtEQUFrRCxJQUFJO0FBQ3REO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTs7QUFFTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QyxTQUFTO0FBQ2pELEtBQUs7QUFDTDs7QUFFTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9sb2dpYy5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9zcmMvc3R5bGUuY3NzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vc3JjL3N0eWxlLmNzcz83MTYzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL3NyYy9sb2dpY3RvZG8uanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgU2hpcCA9IChudW0sIGlkKSA9PiB7XG4gICAgbGV0IGxlbmd0aCA9IG51bTtcbiAgICBsZXQgaGl0cyA9IDA7XG4gICAgbGV0IHN1bmtPck5vdCA9IGZhbHNlO1xuICAgIGxldCBzaGlwSUQgPSBpZDtcbiAgICBcbiAgICBjb25zdCBnZXRMZW5ndGggPSAoKSA9PiBsZW5ndGg7XG4gICAgY29uc3QgaGl0ID0gKCkgPT4gaGl0cyA9IGhpdHMgKyAxO1xuICAgIGNvbnN0IGdldEhpdHMgPSAoKSA9PiBoaXRzO1xuICAgIGNvbnN0IGlzU3VuayA9ICgpID0+IHtcbiAgICAgICAgaWYgKGhpdHMgPT09IGxlbmd0aCkgey8vd2lsbCBuZWVkIHRvIG1ha2Ugc3VyZSB0aGV5IGNhbiBvbmx5IGdldCBoaXQgT05DRSBwZXIgY29vcmRpbmF0ZSBzcGFuXG4gICAgICAgICAgICBzdW5rT3JOb3QgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc3Vua09yTm90O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGxlbmd0aCwgc3Vua09yTm90LCBzaGlwSUQsIGhpdHMsXG4gICAgICAgIGdldExlbmd0aCxcbiAgICAgICAgZ2V0SGl0cyxcbiAgICAgICAgaGl0LFxuICAgICAgICBpc1N1bmssXG4gICAgfTtcbn07XG5cbmNvbnN0IEdhbWVib2FyZCA9ICgpID0+IHtcbiAgICBsZXQgYm9hcmQgPSB7fTtcbiAgICBsZXQgc2hpcENvdW50ID0gMDsvL2NvdW50cyAjIG9mIHNoaXBzIHRvdGFsIEFORCB0byBnZW4gSURcbiAgICBsZXQgbGV0dGVyTnVtYkFyciA9IFsnQScsJ0InLCdDJywnRCcsJ0UnLCdGJywnRycsJ0gnLCdJJywnSiddO1xuICAgIGxldCBtaXNzZWRTaG90cyA9IFtdO1xuICAgIGxldCBzaG90c0hpdCA9IFtdO1xuICAgIGxldCBzaGlwc1N0aWxsVXAgPSAwO1xuICAgIC8vaWRlYWxseSBzdGFydCB3aXRoIDEwIC0tIGZvdXIgMXMsIHRocmVlIDJzLCB0d28gM3MsIG9uZSA0XG5cbiAgICBjb25zdCBidWlsZEJvYXJkID0gKCkgPT4ge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgMTA7IGorKykge1xuICAgICAgICAgICAgICAgIGJvYXJkW2Ake2xldHRlck51bWJBcnJbaV19JHtbaisxXX1gXSA9IFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBnZXRTaGlwc0FsaXZlQ291bnQgPSAoKSA9PiBzaGlwc1N0aWxsVXA7XG5cbiAgICBjb25zdCBhcmVBbGxTdW5rID0gKCkgPT4ge1xuICAgICAgICBpZiAoZ2V0U2hpcHNBbGl2ZUNvdW50KCkgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IG1ha2VTaGlwID0gKGxlbmd0aCkgPT4ge1xuICAgICAgICBsZXQgbmV3U2hpcCA9IFNoaXAobGVuZ3RoLCBzaGlwQ291bnQpO1xuICAgICAgICBzaGlwQ291bnQrKztcbiAgICAgICAgc2hpcHNTdGlsbFVwKys7XG4gICAgICAgIHJldHVybiBuZXdTaGlwO1xuICAgIH1cbiAgICBjb25zdCBmaW5kU3BhbiA9IChjb29yZGluYXRlcywgbGVuZ3RoLCBheGlzKSA9PiB7Ly9jb29yZCB0eXBlIFN0cmluZ1xuICAgICAgICBsZXQgYXJyYXkgPSBbXTtcbiAgICAgICAgbGV0IHlWYWx1ZVN0YXJ0ID0gbnVsbDtcbiAgICAgICAgLy9jaGFuZ2UgaW5wdXQgY29vcmRpbmF0ZXMgaW50byBhcnJheTsgQTIgdG8gW0FdWzJdXG4gICAgICAgIGxldCBjb29yZEFyciA9IGNvb3JkaW5hdGVzLnNwbGl0KCcnKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJjb29yZEFyciBpbiBmaW5kU3BhbiBpcyBcIiwgY29vcmRBcnIpO1xuICAgICAgICBsZXQgeEluZGV4U3RhcnQgPSBmaW5kWEluZGV4KGNvb3JkaW5hdGVzKTtcbiAgICAgICAgaWYgKGNvb3JkQXJyLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgeVZhbHVlU3RhcnQgPSBOdW1iZXIoY29vcmRBcnJbMV0uY29uY2F0KGNvb3JkQXJyWzJdKSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHlWYWx1ZVN0YXJ0ID0gTnVtYmVyKGNvb3JkQXJyWzFdKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhcInlWYWx1ZVN0YXJ0IGluIGZpbmRTcGFuIGlzIFwiLCB5VmFsdWVTdGFydCk7XG4gICAgICAgIGlmIChsZW5ndGggPT09IDEpIHsvL2Nhc2UgbGVuZ3RoID09PSAxXG4gICAgICAgICAgICBhcnJheS5wdXNoKFtjb29yZEFyclswXStjb29yZEFyclsxXV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGF4aXMgPT09IFwiaG9yaXpvbnRhbFwiKSB7Ly9jYXNlIGxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB4U3BhbkFycmF5ID0gW2xldHRlck51bWJBcnJbeEluZGV4U3RhcnQraV0rY29vcmRBcnJbMV1dO1xuICAgICAgICAgICAgICAgICAgICBhcnJheS5wdXNoKHhTcGFuQXJyYXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBhcnJheS5wdXNoKFtjb29yZEFyclswXSsoeVZhbHVlU3RhcnQraSldKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgfVxuICAgIGNvbnN0IGZpbmRYSW5kZXggPSAoY29vcmRTdHIpID0+IHsvL2lucHV0IHN0cmluZ1xuICAgICAgICBsZXQgY29vcmRBcnIgPSBjb29yZFN0ci5zcGxpdCgnJyk7Ly9leDogJ0EyJyAtPiBbJ0EnLCAnMiddXG4gICAgICAgIGxldCB4U3RhcnQgPSBsZXR0ZXJOdW1iQXJyLmluZGV4T2YoYCR7Y29vcmRBcnJbMF19YCk7XG4gICAgICAgIHJldHVybiB4U3RhcnQ7Ly9vdXRwdXQgbnVtYmVyXG4gICAgfVxuXG4gICAgY29uc3Qgbm9TaGlwT3ZlcmxhcCA9IChhcnJheSkgPT4gey8vZXg6IFtbXCJBOFwiXSxbXCJCOFwiXV1cbiAgICAgICAgbGV0IGJvb2xlYW4gPSBudWxsO1xuICAgICAgICBsZXQgbGVuZ3RoID0gYXJyYXkubGVuZ3RoIC0gMTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBhcnJUb1N0cmluZyA9IGFycmF5W2ldLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBpZiAoYm9hcmRbYCR7YXJyVG9TdHJpbmd9YF0gIT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICBib29sZWFuID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJvb2xlYW4gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBib29sZWFuO1xuICAgIH1cblxuICAgIGNvbnN0IHBsYWNlU2hpcCA9IChwb3NpdGlvbiwgbGVuZ3RoLCBheGlzKSA9PiB7Ly9wb3NpdGlvbiBzdHJpbmdcbiAgICAgICAgbGV0IHhJbmRleFN0YXJ0ID0gZmluZFhJbmRleChwb3NpdGlvbik7XG4gICAgICAgIGxldCBjb29yZEFyciA9IHBvc2l0aW9uLnNwbGl0KCcnKTsvL2V4OiAnQTgnIC0+IFsnQScsICc4J11cbiAgICAgICAgbGV0IHlWYWx1ZVN0YXJ0ID0gTnVtYmVyKGNvb3JkQXJyWzFdKTtcblxuICAgICAgICAvKiBjb25zb2xlLmxvZyhcIlggXCIsICh4SW5kZXhTdGFydCsxKSsobGVuZ3RoLTEpKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJZIFwiLCB5VmFsdWVTdGFydCsobGVuZ3RoLTEpKTsgKi9cbiAgICAgICAgaWYgKGF4aXMgPT09IFwiaG9yaXpvbnRhbFwiICYmICh4SW5kZXhTdGFydCsxKSsobGVuZ3RoLTEpID4gMTApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2Fubm90IHBsYWNlIHNoaXAgb2ZmIGdhbWVib2FyZFwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChheGlzID09PSBcInZlcnRpY2FsXCIgJiYgeVZhbHVlU3RhcnQrKGxlbmd0aC0xKSA+IDEwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNhbm5vdCBwbGFjZSBzaGlwIG9mZiBnYW1lYm9hcmRcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHNoaXBTcGFuID0gZmluZFNwYW4ocG9zaXRpb24sIGxlbmd0aCwgYXhpcyk7Ly9bW1wiQTdcIl0sW1wiQThcIl1dXG4gICAgICAgIGlmIChub1NoaXBPdmVybGFwKHNoaXBTcGFuKSkge1xuICAgICAgICAgICAgbGV0IG5ld1NoaXAgPSBTaGlwKGxlbmd0aCwgc2hpcENvdW50KTtcbiAgICAgICAgICAgIHNoaXBTcGFuLmZvckVhY2goYXJyYXkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBhcnJUb1N0cmluZyA9IGFycmF5LnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgYm9hcmRbYCR7YXJyVG9TdHJpbmd9YF0gPSBuZXdTaGlwO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHNoaXBDb3VudCsrO1xuICAgICAgICAgICAgc2hpcHNTdGlsbFVwKys7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU29ycnksIHRoZXJlJ3MgYSBzaGlwIGluIHRoZSB3YXkhXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcmVjZWl2ZUF0dGFjayA9ICh0YXJnZXRDb29yKSA9PiB7Ly9hc3N1bWVzIHlvdSBcbiAgICAgICAgLy9DQU4nVCByZS1hdHRhY2sgYSBwb3NpdGlvbiB5b3UndmUgbWlzc2VkIE9SIGhpdCBhbHJlYWR5XG4gICAgICAgIGxldCB0YXJnZXRJbkFyciA9IFtbdGFyZ2V0Q29vcl1dO1xuICAgICAgICBpZiAobm9TaGlwT3ZlcmxhcCh0YXJnZXRJbkFycikgPT09IHRydWUpIHsvL2NoZWNrcyBpZiBzaGlwIGlzIHRoZXJlXG4gICAgICAgICAgICAvL2lmIFRSVUUsIG1lYW5zIG5vdGhpbmcgaXMgdGhlcmVcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTm8gc2hpcCB3YXMgaGl0LiBOaWNlIHRyeSFcIik7XG4gICAgICAgICAgICBtaXNzZWRTaG90cy5wdXNoKHRhcmdldENvb3IpO1xuICAgICAgICB9IGVsc2UgaWYgKG5vU2hpcE92ZXJsYXAodGFyZ2V0SW5BcnIpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgbGV0IHNoaXBGb3VuZCA9IGJvYXJkW2Ake3RhcmdldENvb3J9YF07XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkdyZWF0IHNob3QhIFlvdSBsYW5kZWQgYSBoaXQuXCIpO1xuICAgICAgICAgICAgc2hpcEZvdW5kLmhpdCgpO1xuICAgICAgICAgICAgaWYgKHNoaXBGb3VuZC5nZXRIaXRzKCkgPT09IHNoaXBGb3VuZC5nZXRMZW5ndGgoKSkge1xuICAgICAgICAgICAgICAgIHNoaXBzU3RpbGxVcC0tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgYm9hcmQsbWlzc2VkU2hvdHMsc2hvdHNIaXQsc2hpcENvdW50LFxuICAgICAgICBtYWtlU2hpcCxcbiAgICAgICAgYnVpbGRCb2FyZCxcbiAgICAgICAgcGxhY2VTaGlwLFxuICAgICAgICBmaW5kU3BhbixcbiAgICAgICAgZmluZFhJbmRleCxcbiAgICAgICAgbm9TaGlwT3ZlcmxhcCxcbiAgICAgICAgcmVjZWl2ZUF0dGFjayxcbiAgICAgICAgZ2V0U2hpcHNBbGl2ZUNvdW50LFxuICAgICAgICBhcmVBbGxTdW5rLFxuICAgIH07XG59XG5cbmNvbnN0IFBsYXllciA9IChuYW1lKSA9PiB7Ly9hc3N1bWUgbmFtZXMgaW5wdXR0ZWQgYXJlIFVOSVFVRVxuICAgIFxuICAgIGxldCBpZCA9IG5hbWU7XG4gICAgbGV0IG93bkJvYXJkID0gR2FtZWJvYXJkKCk7XG4gICAgb3duQm9hcmQuYnVpbGRCb2FyZCgpO1xuICAgIGxldCBsZXR0ZXJOdW1iQXJyID0gWydBJywnQicsJ0MnLCdEJywnRScsJ0YnLCdHJywnSCcsJ0knLCdKJ107XG4gICAgbGV0IHBsYXllckJvYXJkID0gb3duQm9hcmQuYm9hcmQ7XG4gICAgbGV0IGFpckJhbGxzID0gb3duQm9hcmQubWlzc2VkU2hvdHM7Ly9ieSB0aGUgb3Bwb3NpbmcgcGxheWVyXG5cbiAgICBsZXQgdGFyZ2V0Qm9hcmQgPSBHYW1lYm9hcmQoKTtcbiAgICB0YXJnZXRCb2FyZC5idWlsZEJvYXJkKCk7XG4gICAgbGV0IG9wcG9Cb2FyZCA9IHRhcmdldEJvYXJkLmJvYXJkO1xuICAgIGxldCBteU1pc3NlcyA9IHRhcmdldEJvYXJkLm1pc3NlZFNob3RzO1xuICAgIGxldCBteUhpdHMgPSB0YXJnZXRCb2FyZC5zaG90c0hpdDtcblxuICAgIGNvbnN0IGdldFNoaXBGb3JPcHAgPSAoY29vcmQpID0+IHtcbiAgICAgICAgbGV0IGZvdW5kU2hpcCA9IHBsYXllckJvYXJkW2Ake2Nvb3JkfWBdO1xuICAgICAgICByZXR1cm4gZm91bmRTaGlwO1xuICAgIH1cbiAgICBjb25zdCBwbGF5ZXJQbGFjZSA9IChwb3NpdGlvbiwgbGVuZ3RoLCBheGlzKSA9PiB7XG4gICAgICAgIC8vc3RyaW5nICdCMycsIG51bWJlciAzLCBzdHJpbmcgJ2hvcml6b250YWwnLyd2ZXJ0aWNhbCdcbiAgICAgICAgb3duQm9hcmQucGxhY2VTaGlwKHBvc2l0aW9uLCBsZW5ndGgsIGF4aXMpO1xuICAgIH1cblxuICAgIGNvbnN0IHBsYXllclBsYWNlU2hpcFNwYW4gPSAocG9zaXRpb24sIGxlbmd0aCwgYXhpcykgPT4ge1xuICAgICAgICByZXR1cm4gb3duQm9hcmQuZmluZFNwYW4ocG9zaXRpb24sIGxlbmd0aCwgYXhpcyk7XG4gICAgfVxuXG4gICAgY29uc3QgcGxheWVyQ2hlY2tPdmVybGFwID0gKGFycikgPT4ge1xuICAgICAgICByZXR1cm4gb3duQm9hcmQubm9TaGlwT3ZlcmxhcChhcnIpO1xuICAgIH1cblxuICAgIGNvbnN0IGRpZEF0a01pc3MgPSAoY29vcmQsIGdldEF0dGFja2VkKSA9PiB7XG4gICAgICAgIGlmIChteUhpdHMuaW5jbHVkZXMoYCR7Y29vcmR9YCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYWxyZWFkeSBzaG90IGhlcmUsIHBscyBzdG9wXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKG15TWlzc2VzLmluY2x1ZGVzKGAke2Nvb3JkfWApKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImFscmVhZHkgbWlzc2VkIGhlcmUsIGdvIGVsc2V3aGVyZVwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChnZXRBdHRhY2tlZChgJHtjb29yZH1gKSkgey8vaWYgaXQgcmV0dXJucyB0cnVlLCBtZWFucyBtaXNzZWRcbiAgICAgICAgICAgICAgICBteU1pc3Nlcy5wdXNoKGNvb3JkKTtcbiAgICAgICAgICAgICAgICBsZXQgc3RyID0gYG1pc3NfJHtjb29yZH1gO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG15SGl0cy5wdXNoKGNvb3JkKTtcbiAgICAgICAgICAgICAgICBsZXQgc3RyID0gYGhpdHNfJHtjb29yZH1gO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBnZXRBdHRhY2tlZCA9IChjb29yZCkgPT4ge1xuICAgICAgICBsZXQgc3RhcnRpbmdMZW5ndGggPSBhaXJCYWxscy5sZW5ndGg7XG4gICAgICAgIG93bkJvYXJkLnJlY2VpdmVBdHRhY2soY29vcmQpOy8vaWYgaXQncyBhIG1pc3MsIGFpckJhbGxzIGxlbmd0aCBzaG91bGQgaW5jcmVhc2UgYnkgMVxuICAgICAgICBpZiAoYWlyQmFsbHMubGVuZ3RoID4gc3RhcnRpbmdMZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHBsYXllclNoaXBDb3VudCA9ICgpID0+IG93bkJvYXJkLnNoaXBDb3VudDtcbiAgICBjb25zdCBzaGlwc1VwID0gKCkgPT4gb3duQm9hcmQuZ2V0U2hpcHNBbGl2ZUNvdW50KCk7XG4gICAgY29uc3QgYWxsU2hpcHNTdW5rID0gKCkgPT4ge1xuICAgICAgICBpZiAoc2hpcHNVcCgpID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL3RydWUgaWYgc2hpcENvdW50IGlzIDAsIGZhbHNlIGlmIG5vdFxuXG4gICAgLy8tLS0tY29tcHV0ZXIgbG9naWNcblxuXG4gICAgY29uc3QgcmFuZG9tQXRrQ2hvaWNlID0gKCkgPT4ge1xuICAgICAgICBsZXQgYm9vbEhvbGRlciA9IGZhbHNlO1xuICAgICAgICAvL3dhbnQgdG8gcGljayByYW5kb20gWCAmIFk7IGlmIE5PVCB3aXRoaW4gbXlIaXRzICYgbXlNaXNzZXMsIGdvIGFoZWFkXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGxldCBjb29yZCA9IHJhbmRvbVBvc2l0aW9uKCk7XG4gICAgICAgICAgICBpZiAoIW15SGl0cy5pbmNsdWRlcyhgJHtjb29yZH1gKSAmJiAhbXlNaXNzZXMuaW5jbHVkZXMoYCR7Y29vcmR9YCkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNQVSBwaWNrZWQgXCIsIGNvb3JkKTtcbiAgICAgICAgICAgICAgICBib29sSG9sZGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29vcmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gd2hpbGUgKCFib29sSG9sZGVyKSAgICAgICAgXG4gICAgfVxuICAgIGNvbnN0IGNvbXB1dGVyUGxhY2UgPSAobGVuZ3RoKSA9PiB7XG4gICAgICAgIC8vc3RyaW5nICdCMycsIG51bWJlciAzLCBzdHJpbmcgJ2hvcml6b250YWwnLyd2ZXJ0aWNhbCdcbiAgICAgICAgLyogbGV0IHBvc2l0aW9uID0gcmFuZG9tUG9zaXRpb24oKTtcbiAgICAgICAgbGV0IGF4aXMgPSByYW5kb21BeGlzKCk7Ki9cbiAgICAgICAgbGV0IGJvb2xIb2xkZXIgPSBmYWxzZTsgXG5cbiAgICAgICAgLyogaWYgKG93bkJvYXJkLnBsYWNlU2hpcChwb3NpdGlvbiwgbGVuZ3RoLCBheGlzKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIC8vbWVhbmluZyBpZiBpdCdzIHBsYWNlZCBvZmYgdGhlIGJvYXJkIG9yIG92ZXJsYXBwaW5nXG4gICAgICAgICAgICAvL3dhbnQgdG8gcmVydW4gdGhpcyBmdW5jdGlvbiBhZ2FpblxuICAgICAgICB9ICovXG5cbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJyYW4gYW5vdGhlciBwbGFjZW1lbnQgYnkgdGhlIGNvbXBcIik7XG4gICAgICAgICAgICBsZXQgcG9zaXRpb24gPSByYW5kb21Qb3NpdGlvbigpO1xuICAgICAgICAgICAgbGV0IGF4aXMgPSByYW5kb21BeGlzKCk7XG4gICAgICAgICAgICBib29sSG9sZGVyID0gb3duQm9hcmQucGxhY2VTaGlwKHBvc2l0aW9uLCBsZW5ndGgsIGF4aXMpO1xuICAgICAgICB9IHdoaWxlICghYm9vbEhvbGRlcilcbiAgICAgICAgXG4gICAgfVxuICAgIGNvbnN0IHJhbmRvbUF4aXMgPSAoKSA9PiB7XG4gICAgICAgIGxldCBjaG9zZW5BeGlzID0gTWF0aC5yYW5kb20oKSA8IDAuNSA/IFwiaG9yaXpvbnRhbFwiIDogXCJ2ZXJ0aWNhbFwiO1xuICAgICAgICByZXR1cm4gY2hvc2VuQXhpcztcbiAgICB9XG4gICAgY29uc3QgcmFuZG9tUG9zaXRpb24gPSAoKSA9PiB7XG4gICAgICAgIGxldCByYW5kb21OdW1iMSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSoxMCk7Ly8wLTlcbiAgICAgICAgbGV0IHJhbmRvbU51bWIyID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjEwKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhsZXR0ZXJOdW1iQXJyKTtcbiAgICAgICAgbGV0IHJhbmRvbVggPSBsZXR0ZXJOdW1iQXJyW3JhbmRvbU51bWIxXTtcbiAgICAgICAgbGV0IHJhbmRvbVkgPSByYW5kb21OdW1iMiArIDE7XG4gICAgICAgIHJldHVybiByYW5kb21YICsgcmFuZG9tWS50b1N0cmluZygpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGlkLCBwbGF5ZXJCb2FyZCwgYWlyQmFsbHMsIG9wcG9Cb2FyZCwgbXlNaXNzZXMsIG15SGl0cyxcbiAgICAgICAgZ2V0QXR0YWNrZWQsIGRpZEF0a01pc3MsIHBsYXllclBsYWNlLCBjb21wdXRlclBsYWNlLCByYW5kb21BdGtDaG9pY2UsIHNoaXBzVXAsIGFsbFNoaXBzU3VuaywgIHBsYXllckNoZWNrT3ZlcmxhcCwgcGxheWVyUGxhY2VTaGlwU3BhbiwgZ2V0U2hpcEZvck9wcCwgcGxheWVyU2hpcENvdW50LFxuICAgIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHsgXG4gICAgU2hpcDogU2hpcCxcbiAgICBHYW1lYm9hcmQ6IEdhbWVib2FyZCxcbiAgICBQbGF5ZXI6IFBsYXllcixcbn0gIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCJodG1sLCBib2R5LCBkaXYsIHNwYW4sIGFwcGxldCwgb2JqZWN0LCBpZnJhbWUsXFxuaDEsIGgyLCBoMywgaDQsIGg1LCBoNiwgcCwgYmxvY2txdW90ZSwgcHJlLFxcbmEsIGFiYnIsIGFjcm9ueW0sIGFkZHJlc3MsIGJpZywgY2l0ZSwgY29kZSxcXG5kZWwsIGRmbiwgZW0sIGltZywgaW5zLCBrYmQsIHEsIHMsIHNhbXAsXFxuc21hbGwsIHN0cmlrZSwgc3Ryb25nLCBzdWIsIHN1cCwgdHQsIHZhcixcXG5iLCB1LCBpLCBjZW50ZXIsXFxuZGwsIGR0LCBkZCwgb2wsIHVsLCBsaSxcXG5maWVsZHNldCwgZm9ybSwgbGFiZWwsIGxlZ2VuZCxcXG50YWJsZSwgY2FwdGlvbiwgdGJvZHksIHRmb290LCB0aGVhZCwgdHIsIHRoLCB0ZCxcXG5hcnRpY2xlLCBhc2lkZSwgY2FudmFzLCBkZXRhaWxzLCBlbWJlZCwgXFxuZmlndXJlLCBmaWdjYXB0aW9uLCBmb290ZXIsIGhlYWRlciwgaGdyb3VwLCBcXG5tZW51LCBuYXYsIG91dHB1dCwgcnVieSwgc2VjdGlvbiwgc3VtbWFyeSxcXG50aW1lLCBtYXJrLCBhdWRpbywgdmlkZW8ge1xcblxcdG1hcmdpbjogMDtcXG5cXHRwYWRkaW5nOiAwO1xcblxcdGJvcmRlcjogMDtcXG5cXHRmb250LXNpemU6IDEwMCU7XFxuXFx0Zm9udDogaW5oZXJpdDtcXG5cXHR2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XFxufVxcbi8qIEhUTUw1IGRpc3BsYXktcm9sZSByZXNldCBmb3Igb2xkZXIgYnJvd3NlcnMgKi9cXG5hcnRpY2xlLCBhc2lkZSwgZGV0YWlscywgZmlnY2FwdGlvbiwgZmlndXJlLCBcXG5mb290ZXIsIGhlYWRlciwgaGdyb3VwLCBtZW51LCBuYXYsIHNlY3Rpb24ge1xcblxcdGRpc3BsYXk6IGJsb2NrO1xcbn1cXG5ib2R5IHtcXG5cXHRsaW5lLWhlaWdodDogMTtcXG59XFxub2wsIHVsIHtcXG5cXHRsaXN0LXN0eWxlOiBub25lO1xcbn1cXG5ibG9ja3F1b3RlLCBxIHtcXG5cXHRxdW90ZXM6IG5vbmU7XFxufVxcbmJsb2NrcXVvdGU6YmVmb3JlLCBibG9ja3F1b3RlOmFmdGVyLFxcbnE6YmVmb3JlLCBxOmFmdGVyIHtcXG5cXHRjb250ZW50OiAnJztcXG5cXHRjb250ZW50OiBub25lO1xcbn1cXG50YWJsZSB7XFxuXFx0Ym9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTtcXG5cXHRib3JkZXItc3BhY2luZzogMDtcXG59XFxuXFxuOnJvb3Qge1xcbiAgICAtLXByaW1hcnk6ICNmZjZmYjI7IFxcbiAgICAtLXNlY29uZGFyeTogI2MzMTk1ZDsgXFxuICAgIC0tdGVydGlhcnk6ICM2ODA3NDc7IFxcbiAgICAtLXF1YXRlcm5hcnk6ICMxNDEwMTA7IFxcbn1cXG5cXG5odG1sLCBib2R5LCBkaXYjY29udGVudCB7XFxuICAgIGhlaWdodDogMTAwJTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGZvbnQtc2l6ZTogMTVweDtcXG59XFxuXFxuZGl2I3AxU2VwZXJhdG9yIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1wcmltYXJ5KTtcXG59XFxuZGl2I3AyU2VwZXJhdG9yIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOmFxdWE7XFxufVxcblxcbmRpdiNQMUcsIGRpdiNQMkcge1xcblxcdHdpZHRoOiA2MCU7XFxuXFx0bWFyZ2luOiBhdXRvO1xcbn1cXG5cXG5kaXYuZ2FtZWJvYXJkIHtcXG5cXHRkaXNwbGF5OiBmbGV4O1xcblxcdGZsZXgtd3JhcDogd3JhcDtcXG5cXHRib3JkZXI6IDNweCBzb2xpZCBwaW5rO1xcbn1cXG5cXG4uZGVzY3JpcHRvciB7XFxuXFx0Zm9udC1mYW1pbHk6ICdTcGFjZSBHcm90ZXNrJywgc2Fucy1zZXJpZjtcXG5cXHRmb250LXNpemU6IDEuMnJlbTtcXG5cXHRwYWRkaW5nOiAwLjVyZW07XFxuXFx0dGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG5cXG5idXR0b24jbmV3R2FtZUJ0biB7XFxuXFx0YmFja2dyb3VuZC1jb2xvcjogI2MzMTk1ZDtcXG5cXHRjb2xvcjpiaXNxdWU7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHRvcDogNXB4O1xcblxcdHJpZ2h0OiA1cHg7XFxuXFx0ZGlzcGxheTogbm9uZTtcXG59XFxuXFxuZGl2I2F4aXNUb2dnbGUge1xcblxcdGJhY2tncm91bmQtY29sb3I6ICNjMzE5NWQ7XFxuXFx0Ym9yZGVyOiAycHggaW5zZXQgZ3JheTtcXG5cXHRmb250LXNpemU6IDEuMHJlbTtcXG5cXHRjb2xvcjpiaXNxdWU7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHBhZGRpbmc6IDRweDtcXG5cXHR0b3A6IDMxcHg7XFxuXFx0bGVmdDogNXB4O1xcblxcdC8qIGRpc3BsYXk6IG5vbmU7ICovXFxufVxcblxcbmRpdiN0b3BCYXIge1xcblxcdHBvc2l0aW9uOiByZWxhdGl2ZTtcXG59XFxuXFxuZGl2W2NsYXNzXj1cXFwic3F1YXJlXFxcIl0ge1xcblxcdHBvc2l0aW9uOiByZWxhdGl2ZTtcXG5cXHRmbGV4LWJhc2lzOiBjYWxjKDklIC0gMTBweCk7XFxuXFx0bWFyZ2luOiA1cHg7XFxuXFx0Ym9yZGVyOiAxcHggc29saWQ7XFxuXFx0Ym94LXNpemluZzogYm9yZGVyLWJveDtcXG59XFxuXFxuZGl2W2NsYXNzXj1cXFwic3F1YXJlXFxcIl06OmJlZm9yZSB7XFxuXFx0Y29udGVudDogJyc7XFxuXFx0ZGlzcGxheTogYmxvY2s7XFxuXFx0cGFkZGluZy10b3A6IDEwMCU7XFxufVxcblxcbmRpdltjbGFzc149XFxcInNxdWFyZVxcXCJdIC5jb250ZW50eiB7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHRvcDogMDsgbGVmdDogMDtcXG5cXHRoZWlnaHQ6IDEwMCU7XFxuXFx0d2lkdGg6IDEwMCU7XFxuICBcXG5cXHRkaXNwbGF5OiBmbGV4OyAgICAgICAgICAgICAgIC8qIGFkZGVkIGZvciBjZW50ZXJlZCB0ZXh0ICovXFxuXFx0anVzdGlmeS1jb250ZW50OiBjZW50ZXI7ICAgICAvKiBhZGRlZCBmb3IgY2VudGVyZWQgdGV4dCAqL1xcblxcdGFsaWduLWl0ZW1zOiBjZW50ZXI7ICAgICAgICAgLyogYWRkZWQgZm9yIGNlbnRlcmVkIHRleHQgKi9cXG59XFxuXFxuLyogXFxuZGl2I2NvbnRlbnQge1xcblxcdGRpc3BsYXk6IGdyaWQ7XFxuXFx0Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMiwgNDAlKTtcXG5cXHRncmlkLXRlbXBsYXRlLXJvd3M6IHJlcGVhdCgyLCA0MCUpO1xcbn1cXG5cXG5kaXYuZ2FtZWJvYXJkIHtcXG5cXHRkaXNwbGF5OiBncmlkO1xcblxcdGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDExLCA4JSk7XFxuXFx0Z3JpZC10ZW1wbGF0ZS1yb3dzOiByZXBlYXQoMTEsIDglKTtcXG59XFxuXFxuZGl2W2NsYXNzXj1cXFwic3F1YXJlXFxcIl0ge1xcblxcdGJhY2tncm91bmQtY29sb3I6IHJnYigxODQsIDE4NCwgMTg0KTtcXG5cXHRib3JkZXI6IDFweCBzb2xpZCBibGFjaztcXG5cXHRvcGFjaXR5OiAwLjU7XFxuXFx0YXNwZWN0LXJhdGlvOiAxO1xcbn0gKi9cXG5cXG4vKiBsb2FkaW5nL3NwaW5uZXIgc3R1ZmYgKi9cXG5cXG5kaXYjbGVuZ3RoSW5kaWNhdG9yIHtcXG5cXHQvKiBkaXNwbGF5OiBub25lOyAqL1xcblxcdGRpc3BsYXk6IGZsZXg7XFxuXFx0anVzdGlmeS1jb250ZW50OiBsZWZ0O1xcblxcdGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuXFx0Z2FwOiAwLjVyZW07XFxuXFx0Zm9udC1zaXplOiAxLjFyZW07XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHRvcDogNXB4O1xcblxcdGxlZnQ6IDVweDtcXG59XFxuXFxuaW5wdXQjbGVuZ3RoSW5wdXQge1xcblxcdHdpZHRoOiAyNSU7XFxufVxcblxcbmRpdiNwcm9tcHRQbGFjaW5nUDEge1xcblxcdC8qIGRpc3BsYXk6IG5vbmU7ICovXFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdGRpc3BsYXk6IGZsZXg7XFxuXFx0ZmxleC13cmFwOiB3cmFwO1xcblxcdHdpZHRoOiAxNCU7XFxuXFx0dG9wOiA1cHg7XFxuXFx0cmlnaHQ6IDVweDtcXG59XFxuXFxuI2xvYWRlciB7XFxuXFx0ZGlzcGxheTogbm9uZTtcXG5cXHR0b3A6IDUwJTtcXG5cXHRsZWZ0OiA1MCU7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpO1xcbn1cXG4gIFxcbi5sb2FkaW5nIHtcXG5cXHRib3JkZXI6IDhweCBzb2xpZCByZ2IoMjIwLCAwLCAwKTtcXG5cXHR3aWR0aDogNjBweDtcXG5cXHRoZWlnaHQ6IDYwcHg7XFxuXFx0Ym9yZGVyLXJhZGl1czogNTAlO1xcblxcdGJvcmRlci10b3AtY29sb3I6ICNmZjYzMjA7XFxuXFx0Ym9yZGVyLWxlZnQtY29sb3I6ICNmZjczMDA7XFxuXFx0YW5pbWF0aW9uOiBzcGluIDFzIGluZmluaXRlIGVhc2UtaW47XFxufVxcbiAgXFxuQGtleWZyYW1lcyBzcGluIHtcXG5cXHQwJSB7XFxuXFx0ICB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTtcXG5cXHR9XFxuICBcXG5cXHQxMDAlIHtcXG5cXHQgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XFxuXFx0fVxcbn1cXG5cXG5AbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOiA1MjVweCkge1xcblxcdGh0bWwsIGJvZHksIGRpdiNjb250ZW50IHtcXG5cXHQgIGZvbnQtc2l6ZTogMjBweDtcXG5cXHR9XFxuXFxuXFx0ZGl2I2F4aXNUb2dnbGUge1xcblxcdFxcdFxcblxcdFxcdHRvcDogMzdweDtcXG5cXHRcXHQvKiBkaXNwbGF5OiBub25lOyAqL1xcblxcdH1cXG59XCIsIFwiXCIse1widmVyc2lvblwiOjMsXCJzb3VyY2VzXCI6W1wid2VicGFjazovLy4vc3JjL3N0eWxlLmNzc1wiXSxcIm5hbWVzXCI6W10sXCJtYXBwaW5nc1wiOlwiQUFBQTs7Ozs7Ozs7Ozs7OztDQWFDLFNBQVM7Q0FDVCxVQUFVO0NBQ1YsU0FBUztDQUNULGVBQWU7Q0FDZixhQUFhO0NBQ2Isd0JBQXdCO0FBQ3pCO0FBQ0EsZ0RBQWdEO0FBQ2hEOztDQUVDLGNBQWM7QUFDZjtBQUNBO0NBQ0MsY0FBYztBQUNmO0FBQ0E7Q0FDQyxnQkFBZ0I7QUFDakI7QUFDQTtDQUNDLFlBQVk7QUFDYjtBQUNBOztDQUVDLFdBQVc7Q0FDWCxhQUFhO0FBQ2Q7QUFDQTtDQUNDLHlCQUF5QjtDQUN6QixpQkFBaUI7QUFDbEI7O0FBRUE7SUFDSSxrQkFBa0I7SUFDbEIsb0JBQW9CO0lBQ3BCLG1CQUFtQjtJQUNuQixxQkFBcUI7QUFDekI7O0FBRUE7SUFDSSxZQUFZO0lBQ1osV0FBVztJQUNYLGVBQWU7QUFDbkI7O0FBRUE7Q0FDQyxnQ0FBZ0M7QUFDakM7QUFDQTtDQUNDLHFCQUFxQjtBQUN0Qjs7QUFFQTtDQUNDLFVBQVU7Q0FDVixZQUFZO0FBQ2I7O0FBRUE7Q0FDQyxhQUFhO0NBQ2IsZUFBZTtDQUNmLHNCQUFzQjtBQUN2Qjs7QUFFQTtDQUNDLHdDQUF3QztDQUN4QyxpQkFBaUI7Q0FDakIsZUFBZTtDQUNmLGtCQUFrQjtBQUNuQjs7QUFFQTtDQUNDLHlCQUF5QjtDQUN6QixZQUFZO0NBQ1osa0JBQWtCO0NBQ2xCLFFBQVE7Q0FDUixVQUFVO0NBQ1YsYUFBYTtBQUNkOztBQUVBO0NBQ0MseUJBQXlCO0NBQ3pCLHNCQUFzQjtDQUN0QixpQkFBaUI7Q0FDakIsWUFBWTtDQUNaLGtCQUFrQjtDQUNsQixZQUFZO0NBQ1osU0FBUztDQUNULFNBQVM7Q0FDVCxtQkFBbUI7QUFDcEI7O0FBRUE7Q0FDQyxrQkFBa0I7QUFDbkI7O0FBRUE7Q0FDQyxrQkFBa0I7Q0FDbEIsMkJBQTJCO0NBQzNCLFdBQVc7Q0FDWCxpQkFBaUI7Q0FDakIsc0JBQXNCO0FBQ3ZCOztBQUVBO0NBQ0MsV0FBVztDQUNYLGNBQWM7Q0FDZCxpQkFBaUI7QUFDbEI7O0FBRUE7Q0FDQyxrQkFBa0I7Q0FDbEIsTUFBTSxFQUFFLE9BQU87Q0FDZixZQUFZO0NBQ1osV0FBVzs7Q0FFWCxhQUFhLGdCQUFnQiw0QkFBNEI7Q0FDekQsdUJBQXVCLE1BQU0sNEJBQTRCO0NBQ3pELG1CQUFtQixVQUFVLDRCQUE0QjtBQUMxRDs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0JHOztBQUVILDBCQUEwQjs7QUFFMUI7Q0FDQyxtQkFBbUI7Q0FDbkIsYUFBYTtDQUNiLHFCQUFxQjtDQUNyQixtQkFBbUI7Q0FDbkIsV0FBVztDQUNYLGlCQUFpQjtDQUNqQixrQkFBa0I7Q0FDbEIsUUFBUTtDQUNSLFNBQVM7QUFDVjs7QUFFQTtDQUNDLFVBQVU7QUFDWDs7QUFFQTtDQUNDLG1CQUFtQjtDQUNuQixrQkFBa0I7Q0FDbEIsYUFBYTtDQUNiLGVBQWU7Q0FDZixVQUFVO0NBQ1YsUUFBUTtDQUNSLFVBQVU7QUFDWDs7QUFFQTtDQUNDLGFBQWE7Q0FDYixRQUFRO0NBQ1IsU0FBUztDQUNULGtCQUFrQjtDQUNsQixnQ0FBZ0M7QUFDakM7O0FBRUE7Q0FDQyxnQ0FBZ0M7Q0FDaEMsV0FBVztDQUNYLFlBQVk7Q0FDWixrQkFBa0I7Q0FDbEIseUJBQXlCO0NBQ3pCLDBCQUEwQjtDQUMxQixtQ0FBbUM7QUFDcEM7O0FBRUE7Q0FDQztHQUNFLHVCQUF1QjtDQUN6Qjs7Q0FFQTtHQUNFLHlCQUF5QjtDQUMzQjtBQUNEOztBQUVBO0NBQ0M7R0FDRSxlQUFlO0NBQ2pCOztDQUVBOztFQUVDLFNBQVM7RUFDVCxtQkFBbUI7Q0FDcEI7QUFDRFwiLFwic291cmNlc0NvbnRlbnRcIjpbXCJodG1sLCBib2R5LCBkaXYsIHNwYW4sIGFwcGxldCwgb2JqZWN0LCBpZnJhbWUsXFxuaDEsIGgyLCBoMywgaDQsIGg1LCBoNiwgcCwgYmxvY2txdW90ZSwgcHJlLFxcbmEsIGFiYnIsIGFjcm9ueW0sIGFkZHJlc3MsIGJpZywgY2l0ZSwgY29kZSxcXG5kZWwsIGRmbiwgZW0sIGltZywgaW5zLCBrYmQsIHEsIHMsIHNhbXAsXFxuc21hbGwsIHN0cmlrZSwgc3Ryb25nLCBzdWIsIHN1cCwgdHQsIHZhcixcXG5iLCB1LCBpLCBjZW50ZXIsXFxuZGwsIGR0LCBkZCwgb2wsIHVsLCBsaSxcXG5maWVsZHNldCwgZm9ybSwgbGFiZWwsIGxlZ2VuZCxcXG50YWJsZSwgY2FwdGlvbiwgdGJvZHksIHRmb290LCB0aGVhZCwgdHIsIHRoLCB0ZCxcXG5hcnRpY2xlLCBhc2lkZSwgY2FudmFzLCBkZXRhaWxzLCBlbWJlZCwgXFxuZmlndXJlLCBmaWdjYXB0aW9uLCBmb290ZXIsIGhlYWRlciwgaGdyb3VwLCBcXG5tZW51LCBuYXYsIG91dHB1dCwgcnVieSwgc2VjdGlvbiwgc3VtbWFyeSxcXG50aW1lLCBtYXJrLCBhdWRpbywgdmlkZW8ge1xcblxcdG1hcmdpbjogMDtcXG5cXHRwYWRkaW5nOiAwO1xcblxcdGJvcmRlcjogMDtcXG5cXHRmb250LXNpemU6IDEwMCU7XFxuXFx0Zm9udDogaW5oZXJpdDtcXG5cXHR2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XFxufVxcbi8qIEhUTUw1IGRpc3BsYXktcm9sZSByZXNldCBmb3Igb2xkZXIgYnJvd3NlcnMgKi9cXG5hcnRpY2xlLCBhc2lkZSwgZGV0YWlscywgZmlnY2FwdGlvbiwgZmlndXJlLCBcXG5mb290ZXIsIGhlYWRlciwgaGdyb3VwLCBtZW51LCBuYXYsIHNlY3Rpb24ge1xcblxcdGRpc3BsYXk6IGJsb2NrO1xcbn1cXG5ib2R5IHtcXG5cXHRsaW5lLWhlaWdodDogMTtcXG59XFxub2wsIHVsIHtcXG5cXHRsaXN0LXN0eWxlOiBub25lO1xcbn1cXG5ibG9ja3F1b3RlLCBxIHtcXG5cXHRxdW90ZXM6IG5vbmU7XFxufVxcbmJsb2NrcXVvdGU6YmVmb3JlLCBibG9ja3F1b3RlOmFmdGVyLFxcbnE6YmVmb3JlLCBxOmFmdGVyIHtcXG5cXHRjb250ZW50OiAnJztcXG5cXHRjb250ZW50OiBub25lO1xcbn1cXG50YWJsZSB7XFxuXFx0Ym9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTtcXG5cXHRib3JkZXItc3BhY2luZzogMDtcXG59XFxuXFxuOnJvb3Qge1xcbiAgICAtLXByaW1hcnk6ICNmZjZmYjI7IFxcbiAgICAtLXNlY29uZGFyeTogI2MzMTk1ZDsgXFxuICAgIC0tdGVydGlhcnk6ICM2ODA3NDc7IFxcbiAgICAtLXF1YXRlcm5hcnk6ICMxNDEwMTA7IFxcbn1cXG5cXG5odG1sLCBib2R5LCBkaXYjY29udGVudCB7XFxuICAgIGhlaWdodDogMTAwJTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGZvbnQtc2l6ZTogMTVweDtcXG59XFxuXFxuZGl2I3AxU2VwZXJhdG9yIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1wcmltYXJ5KTtcXG59XFxuZGl2I3AyU2VwZXJhdG9yIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOmFxdWE7XFxufVxcblxcbmRpdiNQMUcsIGRpdiNQMkcge1xcblxcdHdpZHRoOiA2MCU7XFxuXFx0bWFyZ2luOiBhdXRvO1xcbn1cXG5cXG5kaXYuZ2FtZWJvYXJkIHtcXG5cXHRkaXNwbGF5OiBmbGV4O1xcblxcdGZsZXgtd3JhcDogd3JhcDtcXG5cXHRib3JkZXI6IDNweCBzb2xpZCBwaW5rO1xcbn1cXG5cXG4uZGVzY3JpcHRvciB7XFxuXFx0Zm9udC1mYW1pbHk6ICdTcGFjZSBHcm90ZXNrJywgc2Fucy1zZXJpZjtcXG5cXHRmb250LXNpemU6IDEuMnJlbTtcXG5cXHRwYWRkaW5nOiAwLjVyZW07XFxuXFx0dGV4dC1hbGlnbjogY2VudGVyO1xcbn1cXG5cXG5idXR0b24jbmV3R2FtZUJ0biB7XFxuXFx0YmFja2dyb3VuZC1jb2xvcjogI2MzMTk1ZDtcXG5cXHRjb2xvcjpiaXNxdWU7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHRvcDogNXB4O1xcblxcdHJpZ2h0OiA1cHg7XFxuXFx0ZGlzcGxheTogbm9uZTtcXG59XFxuXFxuZGl2I2F4aXNUb2dnbGUge1xcblxcdGJhY2tncm91bmQtY29sb3I6ICNjMzE5NWQ7XFxuXFx0Ym9yZGVyOiAycHggaW5zZXQgZ3JheTtcXG5cXHRmb250LXNpemU6IDEuMHJlbTtcXG5cXHRjb2xvcjpiaXNxdWU7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHBhZGRpbmc6IDRweDtcXG5cXHR0b3A6IDMxcHg7XFxuXFx0bGVmdDogNXB4O1xcblxcdC8qIGRpc3BsYXk6IG5vbmU7ICovXFxufVxcblxcbmRpdiN0b3BCYXIge1xcblxcdHBvc2l0aW9uOiByZWxhdGl2ZTtcXG59XFxuXFxuZGl2W2NsYXNzXj1cXFwic3F1YXJlXFxcIl0ge1xcblxcdHBvc2l0aW9uOiByZWxhdGl2ZTtcXG5cXHRmbGV4LWJhc2lzOiBjYWxjKDklIC0gMTBweCk7XFxuXFx0bWFyZ2luOiA1cHg7XFxuXFx0Ym9yZGVyOiAxcHggc29saWQ7XFxuXFx0Ym94LXNpemluZzogYm9yZGVyLWJveDtcXG59XFxuXFxuZGl2W2NsYXNzXj1cXFwic3F1YXJlXFxcIl06OmJlZm9yZSB7XFxuXFx0Y29udGVudDogJyc7XFxuXFx0ZGlzcGxheTogYmxvY2s7XFxuXFx0cGFkZGluZy10b3A6IDEwMCU7XFxufVxcblxcbmRpdltjbGFzc149XFxcInNxdWFyZVxcXCJdIC5jb250ZW50eiB7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHRvcDogMDsgbGVmdDogMDtcXG5cXHRoZWlnaHQ6IDEwMCU7XFxuXFx0d2lkdGg6IDEwMCU7XFxuICBcXG5cXHRkaXNwbGF5OiBmbGV4OyAgICAgICAgICAgICAgIC8qIGFkZGVkIGZvciBjZW50ZXJlZCB0ZXh0ICovXFxuXFx0anVzdGlmeS1jb250ZW50OiBjZW50ZXI7ICAgICAvKiBhZGRlZCBmb3IgY2VudGVyZWQgdGV4dCAqL1xcblxcdGFsaWduLWl0ZW1zOiBjZW50ZXI7ICAgICAgICAgLyogYWRkZWQgZm9yIGNlbnRlcmVkIHRleHQgKi9cXG59XFxuXFxuLyogXFxuZGl2I2NvbnRlbnQge1xcblxcdGRpc3BsYXk6IGdyaWQ7XFxuXFx0Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMiwgNDAlKTtcXG5cXHRncmlkLXRlbXBsYXRlLXJvd3M6IHJlcGVhdCgyLCA0MCUpO1xcbn1cXG5cXG5kaXYuZ2FtZWJvYXJkIHtcXG5cXHRkaXNwbGF5OiBncmlkO1xcblxcdGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDExLCA4JSk7XFxuXFx0Z3JpZC10ZW1wbGF0ZS1yb3dzOiByZXBlYXQoMTEsIDglKTtcXG59XFxuXFxuZGl2W2NsYXNzXj1cXFwic3F1YXJlXFxcIl0ge1xcblxcdGJhY2tncm91bmQtY29sb3I6IHJnYigxODQsIDE4NCwgMTg0KTtcXG5cXHRib3JkZXI6IDFweCBzb2xpZCBibGFjaztcXG5cXHRvcGFjaXR5OiAwLjU7XFxuXFx0YXNwZWN0LXJhdGlvOiAxO1xcbn0gKi9cXG5cXG4vKiBsb2FkaW5nL3NwaW5uZXIgc3R1ZmYgKi9cXG5cXG5kaXYjbGVuZ3RoSW5kaWNhdG9yIHtcXG5cXHQvKiBkaXNwbGF5OiBub25lOyAqL1xcblxcdGRpc3BsYXk6IGZsZXg7XFxuXFx0anVzdGlmeS1jb250ZW50OiBsZWZ0O1xcblxcdGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuXFx0Z2FwOiAwLjVyZW07XFxuXFx0Zm9udC1zaXplOiAxLjFyZW07XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHRvcDogNXB4O1xcblxcdGxlZnQ6IDVweDtcXG59XFxuXFxuaW5wdXQjbGVuZ3RoSW5wdXQge1xcblxcdHdpZHRoOiAyNSU7XFxufVxcblxcbmRpdiNwcm9tcHRQbGFjaW5nUDEge1xcblxcdC8qIGRpc3BsYXk6IG5vbmU7ICovXFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdGRpc3BsYXk6IGZsZXg7XFxuXFx0ZmxleC13cmFwOiB3cmFwO1xcblxcdHdpZHRoOiAxNCU7XFxuXFx0dG9wOiA1cHg7XFxuXFx0cmlnaHQ6IDVweDtcXG59XFxuXFxuI2xvYWRlciB7XFxuXFx0ZGlzcGxheTogbm9uZTtcXG5cXHR0b3A6IDUwJTtcXG5cXHRsZWZ0OiA1MCU7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpO1xcbn1cXG4gIFxcbi5sb2FkaW5nIHtcXG5cXHRib3JkZXI6IDhweCBzb2xpZCByZ2IoMjIwLCAwLCAwKTtcXG5cXHR3aWR0aDogNjBweDtcXG5cXHRoZWlnaHQ6IDYwcHg7XFxuXFx0Ym9yZGVyLXJhZGl1czogNTAlO1xcblxcdGJvcmRlci10b3AtY29sb3I6ICNmZjYzMjA7XFxuXFx0Ym9yZGVyLWxlZnQtY29sb3I6ICNmZjczMDA7XFxuXFx0YW5pbWF0aW9uOiBzcGluIDFzIGluZmluaXRlIGVhc2UtaW47XFxufVxcbiAgXFxuQGtleWZyYW1lcyBzcGluIHtcXG5cXHQwJSB7XFxuXFx0ICB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTtcXG5cXHR9XFxuICBcXG5cXHQxMDAlIHtcXG5cXHQgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7XFxuXFx0fVxcbn1cXG5cXG5AbWVkaWEgc2NyZWVuIGFuZCAobWluLXdpZHRoOiA1MjVweCkge1xcblxcdGh0bWwsIGJvZHksIGRpdiNjb250ZW50IHtcXG5cXHQgIGZvbnQtc2l6ZTogMjBweDtcXG5cXHR9XFxuXFxuXFx0ZGl2I2F4aXNUb2dnbGUge1xcblxcdFxcdFxcblxcdFxcdHRvcDogMzdweDtcXG5cXHRcXHQvKiBkaXNwbGF5OiBub25lOyAqL1xcblxcdH1cXG59XCJdLFwic291cmNlUm9vdFwiOlwiXCJ9XSk7XG4vLyBFeHBvcnRzXG5leHBvcnQgZGVmYXVsdCBfX19DU1NfTE9BREVSX0VYUE9SVF9fXztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKlxuICBNSVQgTGljZW5zZSBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICBBdXRob3IgVG9iaWFzIEtvcHBlcnMgQHNva3JhXG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzV2l0aE1hcHBpbmdUb1N0cmluZykge1xuICB2YXIgbGlzdCA9IFtdO1xuXG4gIC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcbiAgbGlzdC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgdmFyIGNvbnRlbnQgPSBcIlwiO1xuICAgICAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBpdGVtWzVdICE9PSBcInVuZGVmaW5lZFwiO1xuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpO1xuICAgICAgfVxuICAgICAgY29udGVudCArPSBjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKGl0ZW0pO1xuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29udGVudDtcbiAgICB9KS5qb2luKFwiXCIpO1xuICB9O1xuXG4gIC8vIGltcG9ydCBhIGxpc3Qgb2YgbW9kdWxlcyBpbnRvIHRoZSBsaXN0XG4gIGxpc3QuaSA9IGZ1bmN0aW9uIGkobW9kdWxlcywgbWVkaWEsIGRlZHVwZSwgc3VwcG9ydHMsIGxheWVyKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGVzID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBtb2R1bGVzID0gW1tudWxsLCBtb2R1bGVzLCB1bmRlZmluZWRdXTtcbiAgICB9XG4gICAgdmFyIGFscmVhZHlJbXBvcnRlZE1vZHVsZXMgPSB7fTtcbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHRoaXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgdmFyIGlkID0gdGhpc1trXVswXTtcbiAgICAgICAgaWYgKGlkICE9IG51bGwpIHtcbiAgICAgICAgICBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2lkXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgX2sgPSAwOyBfayA8IG1vZHVsZXMubGVuZ3RoOyBfaysrKSB7XG4gICAgICB2YXIgaXRlbSA9IFtdLmNvbmNhdChtb2R1bGVzW19rXSk7XG4gICAgICBpZiAoZGVkdXBlICYmIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGxheWVyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaXRlbVs1XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgIGl0ZW1bNV0gPSBsYXllcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNV0gPSBsYXllcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG1lZGlhKSB7XG4gICAgICAgIGlmICghaXRlbVsyXSkge1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzdXBwb3J0cykge1xuICAgICAgICBpZiAoIWl0ZW1bNF0pIHtcbiAgICAgICAgICBpdGVtWzRdID0gXCJcIi5jb25jYXQoc3VwcG9ydHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs0XSA9IHN1cHBvcnRzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsaXN0LnB1c2goaXRlbSk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gbGlzdDtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgdmFyIGNvbnRlbnQgPSBpdGVtWzFdO1xuICB2YXIgY3NzTWFwcGluZyA9IGl0ZW1bM107XG4gIGlmICghY3NzTWFwcGluZykge1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG4gIGlmICh0eXBlb2YgYnRvYSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdmFyIGJhc2U2NCA9IGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KGNzc01hcHBpbmcpKSkpO1xuICAgIHZhciBkYXRhID0gXCJzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxcIi5jb25jYXQoYmFzZTY0KTtcbiAgICB2YXIgc291cmNlTWFwcGluZyA9IFwiLyojIFwiLmNvbmNhdChkYXRhLCBcIiAqL1wiKTtcbiAgICByZXR1cm4gW2NvbnRlbnRdLmNvbmNhdChbc291cmNlTWFwcGluZ10pLmpvaW4oXCJcXG5cIik7XG4gIH1cbiAgcmV0dXJuIFtjb250ZW50XS5qb2luKFwiXFxuXCIpO1xufTsiLCJcbiAgICAgIGltcG9ydCBBUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgIGltcG9ydCBkb21BUEkgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydEZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0QnlTZWxlY3Rvci5qc1wiO1xuICAgICAgaW1wb3J0IHNldEF0dHJpYnV0ZXMgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRTdHlsZUVsZW1lbnQgZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRTdHlsZUVsZW1lbnQuanNcIjtcbiAgICAgIGltcG9ydCBzdHlsZVRhZ1RyYW5zZm9ybUZuIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanNcIjtcbiAgICAgIGltcG9ydCBjb250ZW50LCAqIGFzIG5hbWVkRXhwb3J0IGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuY3NzXCI7XG4gICAgICBcbiAgICAgIFxuXG52YXIgb3B0aW9ucyA9IHt9O1xuXG5vcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtID0gc3R5bGVUYWdUcmFuc2Zvcm1Gbjtcbm9wdGlvbnMuc2V0QXR0cmlidXRlcyA9IHNldEF0dHJpYnV0ZXM7XG5cbiAgICAgIG9wdGlvbnMuaW5zZXJ0ID0gaW5zZXJ0Rm4uYmluZChudWxsLCBcImhlYWRcIik7XG4gICAgXG5vcHRpb25zLmRvbUFQSSA9IGRvbUFQSTtcbm9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50ID0gaW5zZXJ0U3R5bGVFbGVtZW50O1xuXG52YXIgdXBkYXRlID0gQVBJKGNvbnRlbnQsIG9wdGlvbnMpO1xuXG5cblxuZXhwb3J0ICogZnJvbSBcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZS5jc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHN0eWxlc0luRE9NID0gW107XG5mdW5jdGlvbiBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG4gIHZhciByZXN1bHQgPSAtMTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHlsZXNJbkRPTS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChzdHlsZXNJbkRPTVtpXS5pZGVudGlmaWVyID09PSBpZGVudGlmaWVyKSB7XG4gICAgICByZXN1bHQgPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucykge1xuICB2YXIgaWRDb3VudE1hcCA9IHt9O1xuICB2YXIgaWRlbnRpZmllcnMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldO1xuICAgIHZhciBpZCA9IG9wdGlvbnMuYmFzZSA/IGl0ZW1bMF0gKyBvcHRpb25zLmJhc2UgOiBpdGVtWzBdO1xuICAgIHZhciBjb3VudCA9IGlkQ291bnRNYXBbaWRdIHx8IDA7XG4gICAgdmFyIGlkZW50aWZpZXIgPSBcIlwiLmNvbmNhdChpZCwgXCIgXCIpLmNvbmNhdChjb3VudCk7XG4gICAgaWRDb3VudE1hcFtpZF0gPSBjb3VudCArIDE7XG4gICAgdmFyIGluZGV4QnlJZGVudGlmaWVyID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgdmFyIG9iaiA9IHtcbiAgICAgIGNzczogaXRlbVsxXSxcbiAgICAgIG1lZGlhOiBpdGVtWzJdLFxuICAgICAgc291cmNlTWFwOiBpdGVtWzNdLFxuICAgICAgc3VwcG9ydHM6IGl0ZW1bNF0sXG4gICAgICBsYXllcjogaXRlbVs1XVxuICAgIH07XG4gICAgaWYgKGluZGV4QnlJZGVudGlmaWVyICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB1cGRhdGVyID0gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucyk7XG4gICAgICBvcHRpb25zLmJ5SW5kZXggPSBpO1xuICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKGksIDAsIHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogdXBkYXRlcixcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlkZW50aWZpZXJzLnB1c2goaWRlbnRpZmllcik7XG4gIH1cbiAgcmV0dXJuIGlkZW50aWZpZXJzO1xufVxuZnVuY3Rpb24gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgYXBpID0gb3B0aW9ucy5kb21BUEkob3B0aW9ucyk7XG4gIGFwaS51cGRhdGUob2JqKTtcbiAgdmFyIHVwZGF0ZXIgPSBmdW5jdGlvbiB1cGRhdGVyKG5ld09iaikge1xuICAgIGlmIChuZXdPYmopIHtcbiAgICAgIGlmIChuZXdPYmouY3NzID09PSBvYmouY3NzICYmIG5ld09iai5tZWRpYSA9PT0gb2JqLm1lZGlhICYmIG5ld09iai5zb3VyY2VNYXAgPT09IG9iai5zb3VyY2VNYXAgJiYgbmV3T2JqLnN1cHBvcnRzID09PSBvYmouc3VwcG9ydHMgJiYgbmV3T2JqLmxheWVyID09PSBvYmoubGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXBpLnVwZGF0ZShvYmogPSBuZXdPYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICBhcGkucmVtb3ZlKCk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gdXBkYXRlcjtcbn1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGxpc3QsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGxpc3QgPSBsaXN0IHx8IFtdO1xuICB2YXIgbGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpO1xuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlKG5ld0xpc3QpIHtcbiAgICBuZXdMaXN0ID0gbmV3TGlzdCB8fCBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGlkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbaV07XG4gICAgICB2YXIgaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4XS5yZWZlcmVuY2VzLS07XG4gICAgfVxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGxhc3RJZGVudGlmaWVycy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tfaV07XG4gICAgICB2YXIgX2luZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoX2lkZW50aWZpZXIpO1xuICAgICAgaWYgKHN0eWxlc0luRE9NW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRPTVtfaW5kZXhdLnVwZGF0ZXIoKTtcbiAgICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKF9pbmRleCwgMSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxhc3RJZGVudGlmaWVycyA9IG5ld0xhc3RJZGVudGlmaWVycztcbiAgfTtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBtZW1vID0ge307XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gZ2V0VGFyZ2V0KHRhcmdldCkge1xuICBpZiAodHlwZW9mIG1lbW9bdGFyZ2V0XSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHZhciBzdHlsZVRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFyZ2V0KTtcblxuICAgIC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG4gICAgaWYgKHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCAmJiBzdHlsZVRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSUZyYW1lRWxlbWVudCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gVGhpcyB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhY2Nlc3MgdG8gaWZyYW1lIGlzIGJsb2NrZWRcbiAgICAgICAgLy8gZHVlIHRvIGNyb3NzLW9yaWdpbiByZXN0cmljdGlvbnNcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBzdHlsZVRhcmdldC5jb250ZW50RG9jdW1lbnQuaGVhZDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gaXN0YW5idWwgaWdub3JlIG5leHRcbiAgICAgICAgc3R5bGVUYXJnZXQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBtZW1vW3RhcmdldF0gPSBzdHlsZVRhcmdldDtcbiAgfVxuICByZXR1cm4gbWVtb1t0YXJnZXRdO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydEJ5U2VsZWN0b3IoaW5zZXJ0LCBzdHlsZSkge1xuICB2YXIgdGFyZ2V0ID0gZ2V0VGFyZ2V0KGluc2VydCk7XG4gIGlmICghdGFyZ2V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgZmluZCBhIHN0eWxlIHRhcmdldC4gVGhpcyBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSB2YWx1ZSBmb3IgdGhlICdpbnNlcnQnIHBhcmFtZXRlciBpcyBpbnZhbGlkLlwiKTtcbiAgfVxuICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRCeVNlbGVjdG9yOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKSB7XG4gIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpO1xuICBvcHRpb25zLnNldEF0dHJpYnV0ZXMoZWxlbWVudCwgb3B0aW9ucy5hdHRyaWJ1dGVzKTtcbiAgb3B0aW9ucy5pbnNlcnQoZWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydFN0eWxlRWxlbWVudDsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMoc3R5bGVFbGVtZW50KSB7XG4gIHZhciBub25jZSA9IHR5cGVvZiBfX3dlYnBhY2tfbm9uY2VfXyAhPT0gXCJ1bmRlZmluZWRcIiA/IF9fd2VicGFja19ub25jZV9fIDogbnVsbDtcbiAgaWYgKG5vbmNlKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIG5vbmNlKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXM7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopIHtcbiAgdmFyIGNzcyA9IFwiXCI7XG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChvYmouc3VwcG9ydHMsIFwiKSB7XCIpO1xuICB9XG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKTtcbiAgfVxuICB2YXIgbmVlZExheWVyID0gdHlwZW9mIG9iai5sYXllciAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIkBsYXllclwiLmNvbmNhdChvYmoubGF5ZXIubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChvYmoubGF5ZXIpIDogXCJcIiwgXCIge1wiKTtcbiAgfVxuICBjc3MgKz0gb2JqLmNzcztcbiAgaWYgKG5lZWRMYXllcikge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgdmFyIHNvdXJjZU1hcCA9IG9iai5zb3VyY2VNYXA7XG4gIGlmIChzb3VyY2VNYXAgJiYgdHlwZW9mIGJ0b2EgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBjc3MgKz0gXCJcXG4vKiMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LFwiLmNvbmNhdChidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2VNYXApKSkpLCBcIiAqL1wiKTtcbiAgfVxuXG4gIC8vIEZvciBvbGQgSUVcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICAqL1xuICBvcHRpb25zLnN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xufVxuZnVuY3Rpb24gcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCkge1xuICAvLyBpc3RhbmJ1bCBpZ25vcmUgaWZcbiAgaWYgKHN0eWxlRWxlbWVudC5wYXJlbnROb2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gZG9tQVBJKG9wdGlvbnMpIHtcbiAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHJldHVybiB7XG4gICAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHt9LFxuICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7fVxuICAgIH07XG4gIH1cbiAgdmFyIHN0eWxlRWxlbWVudCA9IG9wdGlvbnMuaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpO1xuICByZXR1cm4ge1xuICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKG9iaikge1xuICAgICAgYXBwbHkoc3R5bGVFbGVtZW50LCBvcHRpb25zLCBvYmopO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KTtcbiAgICB9XG4gIH07XG59XG5tb2R1bGUuZXhwb3J0cyA9IGRvbUFQSTsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBzdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCkge1xuICBpZiAoc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZUVsZW1lbnQuc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgc3R5bGVFbGVtZW50LnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKTtcbiAgICB9XG4gICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHN0eWxlVGFnVHJhbnNmb3JtOyIsImltcG9ydCAnLi9zdHlsZS5jc3MnO1xuaW1wb3J0IGxvZ2ljdG9kbyBmcm9tICcuL2xvZ2ljdG9kby5qcyc7XG5pbXBvcnQgeyBwbGFjZVNoaXBzRE9NIH0gZnJvbSAnLi9sb2dpY3RvZG8uanMnO1xuaW1wb3J0IHsgZmlsbFNxdWFyZURPTSB9IGZyb20gJy4vbG9naWN0b2RvLmpzJztcbmltcG9ydCB7IHNoaXBTdW5rRE9NIH0gZnJvbSAnLi9sb2dpY3RvZG8uanMnO1xuaW1wb3J0IHsgc2hyaW5rT3duQm9hcmQgfSBmcm9tICcuL2xvZ2ljdG9kby5qcyc7XG5pbXBvcnQgeyByZXNldERPTSB9IGZyb20gJy4vbG9naWN0b2RvLmpzJztcbmltcG9ydCB7IGhpZGVDb21wQm9hcmQgfSBmcm9tICcuL2xvZ2ljdG9kby5qcyc7XG5cbmNvbnN0IHBrZyA9IHJlcXVpcmUoJy4uL2xvZ2ljLmpzJyk7XG5jb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ld0dhbWVCdG5cIik7XG5cbmZ1bmN0aW9uIHRvZ2dsZUJ1dHRvbigpIHtcbiAgICBpZiAoYnRuLnN0eWxlLmRpc3BsYXkgPT09IFwibm9uZVwiIHx8IGJ0bi5zdHlsZS5kaXNwbGF5ID09PSBcIlwiKSB7XG4gICAgICAgIGJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIH0gZWxzZSBpZiAoYnRuLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCIpIHtcbiAgICAgICAgYnRuLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHN0YXJ0R2FtZSgpIHtcbiAgICBsb2dpY3RvZG8oKTsvL0RPTSBzdHVmZlxuICAgIC8vLS0tLS1nYW1lIGxvb3Agc3RhcnRcbiAgICBsZXQgUDEgPSBwa2cuUGxheWVyKCdQbGF5ZXIgMScpO1xuICAgIGxldCBQMiA9IHBrZy5QbGF5ZXIoJ0NvbXB1dGVyJyk7XG4gICAgbGV0IGN1cnJlbnRQbGF5ZXIgPSBudWxsO1xuICAgIGxldCB3YWl0aW5nUGxheWVyID0gbnVsbDtcblxuICAgIC8vYWRkIGluIGxhdGVyIC0gY2hvaWNlIG9mIFB2UCBvciB2cyBDUFVcbiAgICAvL25hbWUgaW5wdXQgZm9yIHBsYXllcihzKVxuXG4gICAgLy9kZWNpZGUgd2hvIGdvZXMgZmlyc3RcbiAgICBmdW5jdGlvbiB0dXJuU3dpdGNoSGlkZUJvYXJkcyhwbGF5ZXIpIHsvL2luc2VydCBjdXJyZW50UGxheWVyXG4gICAgICAgIGxldCBwMVN0dWZmcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicDFTZXBlcmF0b3JcIik7XG4gICAgICAgIGxldCBwMlN0dWZmcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicDJTZXBlcmF0b3JcIik7XG4gICAgICAgIGlmIChwbGF5ZXIgPT09IFAxKSB7XG4gICAgICAgICAgICBwMVN0dWZmcy5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgICAgICAgcDJTdHVmZnMuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICB9IGVsc2UgaWYgKHBsYXllciA9PT0gUDIpIHtcbiAgICAgICAgICAgIHAxU3R1ZmZzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICAgIHAyU3R1ZmZzLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcGlja1N0YXJ0ZXIoKSB7XG4gICAgICAgIGxldCBnb0ZpcnN0ID0gTWF0aC5yYW5kb20oKSA8IDAuNSA/IFwiUDFcIiA6IFwiUDJcIjtcbiAgICAgICAgaWYgKGdvRmlyc3QgPT09IFwiUDFcIikge1xuICAgICAgICAgICAgY3VycmVudFBsYXllciA9IFAxO1xuICAgICAgICAgICAgd2FpdGluZ1BsYXllciA9IFAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY3VycmVudFBsYXllciA9IFAyO1xuICAgICAgICAgICAgd2FpdGluZ1BsYXllciA9IFAxO1xuICAgICAgICB9XG4gICAgICAgIHR1cm5Td2l0Y2hIaWRlQm9hcmRzKGN1cnJlbnRQbGF5ZXIpO1xuICAgIH1cbiAgICBcbiAgICBmdW5jdGlvbiBjaGVja0ZvcldpbigpIHtcbiAgICAgICAgLy9jaGVjayBmb3Igd2luIGZpcnN0XG4gICAgICAgIGlmIChQMS5hbGxTaGlwc1N1bmsoKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJQMiBpcyB0aGUgd2lubmVyLiBXaG9vISFcIik7XG4gICAgICAgICAgICB0b2dnbGVCdXR0b24oKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKFAyLmFsbFNoaXBzU3VuaygpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlAxIGlzIHRoZSB3aW5uZXIuIFdob28hIVwiKTtcbiAgICAgICAgICAgIHRvZ2dsZUJ1dHRvbigpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcGxheWVyVHVyblN3aXRjaCgpIHtcbiAgICAgICAgLyogLy9jaGVjayBmb3Igd2luIGZpcnN0XG4gICAgICAgIGlmIChQMS5hbGxTaGlwc1N1bmsoKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJQMiBpcyB0aGUgd2lubmVyLiBXaG9vISFcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoUDIuYWxsU2hpcHNTdW5rKCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUDEgaXMgdGhlIHdpbm5lci4gV2hvbyEhXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9ICBlbHNlKi8ge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRQbGF5ZXIgPT09IFAyKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFBsYXllciA9IFAxO1xuICAgICAgICAgICAgICAgIHdhaXRpbmdQbGF5ZXIgPSBQMjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFBsYXllciA9IFAyO1xuICAgICAgICAgICAgICAgIHdhaXRpbmdQbGF5ZXIgPSBQMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHR1cm5Td2l0Y2hIaWRlQm9hcmRzKGN1cnJlbnRQbGF5ZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vcGlja1N0YXJ0ZXIoKTtcbiAgICBjdXJyZW50UGxheWVyID0gUDE7XG4gICAgd2FpdGluZ1BsYXllciA9IFAyO1xuICAgIHR1cm5Td2l0Y2hIaWRlQm9hcmRzKGN1cnJlbnRQbGF5ZXIpO1xuICAgIGNvbnNvbGUubG9nKFwiY3VycmVudFBsYXllciBpcyBcIiwgY3VycmVudFBsYXllcik7XG5cbiAgICAvL3N0YXJ0IHdpdGggVVAgVE8gMTAgLS0gZm91ciAxcywgdGhyZWUgMnMsIHR3byAzcywgb25lIDRcbiAgICBjdXJyZW50UGxheWVyID0gXCJwYXVzZVBsYWNlXCI7XG4gICAgd2FpdGluZ1BsYXllciA9IFwicGF1c2VQbGFjZVwiOyBcbiAgICAvL3RvIGtlZXAgdGFyZ2V0IGJvYXJkcyBmcm9tIGZpcmluZ1xuXG4gICAgLy9jb2RlIGhlcmUgdG8gdG9nZ2xlIHRoZSBcImluc3RydWN0aW9uc1wiIGZvciBwbGFjZW1lbnQgb25cblxuICAgIGNvbnN0IGF4aXNUb2dnbGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJheGlzVG9nZ2xlXCIpO1xuICAgIGF4aXNUb2dnbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgIGlmIChheGlzVG9nZ2xlci5pbm5lckhUTUwgPT09IFwidmVydGljYWxcIikge1xuICAgICAgICAgICAgYXhpc1RvZ2dsZXIuaW5uZXJIVE1MID0gXCJob3Jpem9udGFsXCI7XG4gICAgICAgIH0gZWxzZSBpZiAoYXhpc1RvZ2dsZXIuaW5uZXJIVE1MID09PSBcImhvcml6b250YWxcIikge1xuICAgICAgICAgICAgYXhpc1RvZ2dsZXIuaW5uZXJIVE1MID0gXCJ2ZXJ0aWNhbFwiO1xuICAgICAgICB9XG4gICAgfSlcblxuICAgIGNvbnN0IFAxU2VsZkJvYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNQMUdcIik7XG4gICAgUDFTZWxmQm9hcmQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgbGV0IHRlc3RBcnJheSA9IFtdO1xuICAgICAgICBsZXQgbGVuZ3RoSW5wdXR0ZWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxlbmd0aElucHV0XCIpLnZhbHVlO1xuICAgICAgICBjb25zb2xlLmxvZyhcImxlbmd0aElucHV0dGVkIGlzIFwiLCBsZW5ndGhJbnB1dHRlZCk7XG4gICAgICAgIGxldCBheGlzSW5wdXR0ZWQgPSBheGlzVG9nZ2xlci5pbm5lckhUTUw7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiYXhpc0lucHV0dGVkIGlzIFwiLCBheGlzSW5wdXR0ZWQpO1xuICAgICAgICBpZiAoY3VycmVudFBsYXllciAhPT0gXCJwYXVzZVBsYWNlXCIgJiYgd2FpdGluZ1BsYXllciAhPT0gXCJwYXVzZVBsYWNlXCIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChsZW5ndGhJbnB1dHRlZCA8IDAgfHwgbGVuZ3RoSW5wdXR0ZWQgPiA0IHx8IGxlbmd0aElucHV0dGVkID09PSBcIlwiKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm5vdGhpbmcgYWRkZWQsIHdoZXdcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhQMS5wbGF5ZXJTaGlwQ291bnQoKSk7XG4gICAgICAgICAgICBpZiAoZS50YXJnZXQuaWQgPT09IFwiUDFHXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKChlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5jbGFzc05hbWUuc2xpY2UoMCw2KSA9PT0gXCJzcXVhcmVcIiAmJiBlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5pZC5zbGljZSgxLDIpID09PSBcIjBcIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKChlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5jbGFzc05hbWUuc2xpY2UoMCw2KSA9PT0gXCJzcXVhcmVcIiAmJiBlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5pZC5zbGljZSgwLDUpID09PSBcImVtcHR5XCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoUDEucGxheWVyU2hpcENvdW50KCkgPCAxMCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgY29vcmRQaWNrZWQgPSBlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5pZC5zcGxpdCgnXycpWzBdO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImNvb3JkUGlja2VkIGlzIFwiLCBjb29yZFBpY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzaGlwU3BhblRlc3RQMSA9IFAxLnBsYXllclBsYWNlU2hpcFNwYW4oY29vcmRQaWNrZWQsIGxlbmd0aElucHV0dGVkLCBheGlzSW5wdXR0ZWQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInNoaXBTcGFuVGVzdFAxIGlzIFwiLCBzaGlwU3BhblRlc3RQMSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb3B5U3BhbiA9IHNoaXBTcGFuVGVzdFAxLnNsaWNlKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChQMS5wbGF5ZXJDaGVja092ZXJsYXAoY29weVNwYW4pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBQMS5wbGF5ZXJQbGFjZShjb29yZFBpY2tlZCwgbGVuZ3RoSW5wdXR0ZWQsIGF4aXNJbnB1dHRlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXN0QXJyYXkucHVzaChjb3B5U3Bhbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZVNoaXBzRE9NKHNoaXBTcGFuVGVzdFAxLCBQMSwgUDEsIFAyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFAxLnBsYXllckJvYXJkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pXG5cbiAgICAvL2FkZCBpbiBsYXRlciAtIGNob29zaW5nIHdoZXJlIHRvIHBsYWNlIHNoaXBzIVxuICAgIC8vRE9NL1VJIHNlbGVjdGlvbiA+IGZpcmluZyBwbGF5ZXJQbGFjZSBjb2RlID4gc2V0dGluZyBuZXcgRE9NXG4gICAgLy9vciB0aGUgcmFuZG9tIENQVSBzaGlwIHBsYWNlbWVudCBiZWxvdyBmb3IgdnMgQ1BVXG4gICAgLy93aWxsIGFsc28gbmVlZCB0byBwdXQgY29kZSB0byBISURFIFxuICAgIC8vQ1BVIChvciBvdGhlciBwZXJzb24ncykgYm9hcmRzXG4gICAgXG4gICAgLyogUDIuY29tcHV0ZXJQbGFjZSg0KTtcbiAgICBQMi5jb21wdXRlclBsYWNlKDMpO1xuICAgIFAyLmNvbXB1dGVyUGxhY2UoMik7XG4gICAgUDIuY29tcHV0ZXJQbGFjZSgxKTsgKi8gLy9yYW5kb21seSBwbGFjZXMgZm9yIGNvbXB1dGVyXG5cbiAgICAvKiBQMS5wbGF5ZXJQbGFjZSgnQTInLCAzLCAndmVydGljYWwnKTtcbiAgICBQMS5wbGF5ZXJQbGFjZSgnRDInLCAyLCAnaG9yaXpvbnRhbCcpO1xuICAgIFAxLnBsYXllclBsYWNlKCdINCcsIDEsICd2ZXJ0aWNhbCcpO1xuICAgIFAxLnBsYXllclBsYWNlKCdKMScsIDQsICd2ZXJ0aWNhbCcpO1xuICAgIGxldCBzaGlwU3BhbjFQMSA9IFAxLnBsYXllclBsYWNlU2hpcFNwYW4oJ0EyJywgMywgJ3ZlcnRpY2FsJyk7XG4gICAgbGV0IHNoaXBTcGFuMlAxID0gUDEucGxheWVyUGxhY2VTaGlwU3BhbignRDInLCAyLCAnaG9yaXpvbnRhbCcpO1xuICAgIGxldCBzaGlwU3BhbjNQMSA9IFAxLnBsYXllclBsYWNlU2hpcFNwYW4oJ0g0JywgMSwgJ3ZlcnRpY2FsJyk7XG4gICAgbGV0IHNoaXBTcGFuNFAxID0gUDEucGxheWVyUGxhY2VTaGlwU3BhbignSjEnLCA0LCAndmVydGljYWwnKTtcblxuICAgIGxldCBjb3B5U3BhbjFQMSA9IHNoaXBTcGFuMVAxLnNsaWNlKCk7XG4gICAgbGV0IGNvcHlTcGFuMlAxID0gc2hpcFNwYW4yUDEuc2xpY2UoKTtcbiAgICBsZXQgY29weVNwYW4zUDEgPSBzaGlwU3BhbjNQMS5zbGljZSgpO1xuICAgIGxldCBjb3B5U3BhbjRQMSA9IHNoaXBTcGFuNFAxLnNsaWNlKCk7XG4gICAgbGV0IGFsbENvcHlTcGFuc1AxID0gW107XG4gICAgYWxsQ29weVNwYW5zUDEucHVzaChjb3B5U3BhbjFQMSk7XG4gICAgYWxsQ29weVNwYW5zUDEucHVzaChjb3B5U3BhbjJQMSk7XG4gICAgYWxsQ29weVNwYW5zUDEucHVzaChjb3B5U3BhbjNQMSk7XG4gICAgYWxsQ29weVNwYW5zUDEucHVzaChjb3B5U3BhbjRQMSk7ICovXG5cbiAgICBQMi5wbGF5ZXJQbGFjZSgnQTInLCAzLCAndmVydGljYWwnKTtcbiAgICBQMi5wbGF5ZXJQbGFjZSgnRDInLCAyLCAnaG9yaXpvbnRhbCcpO1xuICAgIFAyLnBsYXllclBsYWNlKCdINCcsIDEsICd2ZXJ0aWNhbCcpO1xuICAgIFAyLnBsYXllclBsYWNlKCdKMScsIDQsICd2ZXJ0aWNhbCcpO1xuICAgIGxldCBzaGlwU3BhbjFQMiA9IFAyLnBsYXllclBsYWNlU2hpcFNwYW4oJ0EyJywgMywgJ3ZlcnRpY2FsJyk7XG4gICAgbGV0IHNoaXBTcGFuMlAyID0gUDIucGxheWVyUGxhY2VTaGlwU3BhbignRDInLCAyLCAnaG9yaXpvbnRhbCcpO1xuICAgIGxldCBzaGlwU3BhbjNQMiA9IFAyLnBsYXllclBsYWNlU2hpcFNwYW4oJ0g0JywgMSwgJ3ZlcnRpY2FsJyk7XG4gICAgbGV0IHNoaXBTcGFuNFAyID0gUDIucGxheWVyUGxhY2VTaGlwU3BhbignSjEnLCA0LCAndmVydGljYWwnKTtcbiAgICAvL3Rlc3RpbmcgdXNpbmcgdGhlc2Ugc3BhbnMgdG8gZmluZCBpZiBhIHNoaXAncyBjb29yZGluYXRlcyBcbiAgICAvL2FyZSB3aXRoaW4gaXQsIGFuZCB0aGVuIHVzaW5nIHRoYXQgdG8gXCJibG9ja1wiIG91dCBhIHN1bmsgc2hpcFxuICAgIC8vb24gdGhlIERPTVxuICAgIGxldCBjb3B5U3BhbjFQMiA9IHNoaXBTcGFuMVAyLnNsaWNlKCk7XG4gICAgbGV0IGNvcHlTcGFuMlAyID0gc2hpcFNwYW4yUDIuc2xpY2UoKTtcbiAgICBsZXQgY29weVNwYW4zUDIgPSBzaGlwU3BhbjNQMi5zbGljZSgpO1xuICAgIGxldCBjb3B5U3BhbjRQMiA9IHNoaXBTcGFuNFAyLnNsaWNlKCk7XG4gICAgbGV0IGFsbENvcHlTcGFuc1AyID0gW107XG4gICAgYWxsQ29weVNwYW5zUDIucHVzaChjb3B5U3BhbjFQMik7XG4gICAgYWxsQ29weVNwYW5zUDIucHVzaChjb3B5U3BhbjJQMik7XG4gICAgYWxsQ29weVNwYW5zUDIucHVzaChjb3B5U3BhbjNQMik7XG4gICAgYWxsQ29weVNwYW5zUDIucHVzaChjb3B5U3BhbjRQMik7XG5cbiAgICAvKiBwbGFjZVNoaXBzRE9NKHNoaXBTcGFuMVAxLCBjdXJyZW50UGxheWVyLCBQMSwgUDIpO1xuICAgIHBsYWNlU2hpcHNET00oc2hpcFNwYW4yUDEsIGN1cnJlbnRQbGF5ZXIsIFAxLCBQMik7XG4gICAgcGxhY2VTaGlwc0RPTShzaGlwU3BhbjNQMSwgY3VycmVudFBsYXllciwgUDEsIFAyKTtcbiAgICBwbGFjZVNoaXBzRE9NKHNoaXBTcGFuNFAxLCBjdXJyZW50UGxheWVyLCBQMSwgUDIpOyAqL1xuXG4gICAgcGxhY2VTaGlwc0RPTShzaGlwU3BhbjFQMiwgd2FpdGluZ1BsYXllciwgUDEsIFAyKTtcbiAgICBwbGFjZVNoaXBzRE9NKHNoaXBTcGFuMlAyLCB3YWl0aW5nUGxheWVyLCBQMSwgUDIpO1xuICAgIHBsYWNlU2hpcHNET00oc2hpcFNwYW4zUDIsIHdhaXRpbmdQbGF5ZXIsIFAxLCBQMik7XG4gICAgcGxhY2VTaGlwc0RPTShzaGlwU3BhbjRQMiwgd2FpdGluZ1BsYXllciwgUDEsIFAyKTtcblxuICAgIC8vYWZ0ZXIgc2hpcHMgcGxhY2VkLCBzaHJpbmsgZ2FtZWJvYXJkIHNvIGl0J3MgbGVzcyBpbiB0aGUgd2F5XG4gICAgLyogc2hyaW5rT3duQm9hcmQoY3VycmVudFBsYXllciwgUDEsIFAyKTtcbiAgICBzaHJpbmtPd25Cb2FyZCh3YWl0aW5nUGxheWVyLCBQMSwgUDIpOyAqL1xuXG5cbiAgICBmdW5jdGlvbiBzcGlubmVyT24oKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGVyXCIpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNwaW5uZXJPZmYoKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGVyXCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9XG4gICAgLy9QMSAobWUpIGZpcnN0LCBuZWVkIGFkZEV2ZW50TGlzdGVuZXIgZm9yIG15IFxuICAgIC8vZW5lbXkgYm9hcmRcbiAgICAvL29uZSBjbGljayB3aWxsIGhhdmUgdG8gZ2V0IHRoZSBmaXJzdCB0d28gY2hhciBvZiBzcSBJRFxuICAgIC8vYW5kIGRvIGZ1bmN0aW9uIChleDogUDEuZGlkQXRrTWlzcygnQTInLCBQMi5nZXRBdHRhY2tlZCkpXG4gICAgY29uc3QgUDFFbmVteUJvYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNQMVRcIik7XG4gICAgUDFFbmVteUJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgIGlmIChjdXJyZW50UGxheWVyICE9PSBQMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGUudGFyZ2V0LmlkID09PSBcIlAxVFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuY2xhc3NOYW1lLnNsaWNlKDAsNikgPT09IFwic3F1YXJlXCIgJiYgZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuaWQuc2xpY2UoMSwyKSA9PT0gXCIwXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuY2xhc3NOYW1lLnNsaWNlKDAsNikgPT09IFwic3F1YXJlXCIgJiYgZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuaWQuc2xpY2UoMCw1KSA9PT0gXCJlbXB0eVwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IGNvb3JkUGlja2VkID0gZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuaWQuc2xpY2UoMCwyKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImNvb3JkUGlja2VkIHdhcyBcIiwgY29vcmRQaWNrZWQpO1xuICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSBQMS5kaWRBdGtNaXNzKGNvb3JkUGlja2VkLCBQMi5nZXRBdHRhY2tlZCk7XG4gICAgICAgICAgICAgICAgbGV0IGRpZElTaW5rQVNoaXAgPSBQMi5nZXRTaGlwRm9yT3BwKGNvb3JkUGlja2VkKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9PSBmYWxzZSkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vZXhjbHVkZXMgZmFsc2Ugd2hlbiBjb29yZCBpcyBhbHJlYWR5IGhpdC9taXNzZWRcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNxSG9sZGVyQ29vcmQgPSByZXN1bHQuc2xpY2UoNSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBoaXRNaXNzID0gcmVzdWx0LnNsaWNlKDAsNCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic3FIb2xkZXJDb29yZDogXCIsIHNxSG9sZGVyQ29vcmQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImhpdE1pc3M6IFwiLCBoaXRNaXNzKTtcbiAgICAgICAgICAgICAgICAgICAgZmlsbFNxdWFyZURPTShzcUhvbGRlckNvb3JkLCBoaXRNaXNzLCBjdXJyZW50UGxheWVyLCBQMSwgUDIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGlkSVNpbmtBU2hpcCAhPT0gXCJcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGlkSVNpbmtBU2hpcC5nZXRIaXRzKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGlkSVNpbmtBU2hpcC5pc1N1bmsoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLy0tLS0tLS0tLS0tLW1ha2UgdGhpcyBzbyBpdCdsbCBkaXNwbGF5XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3RoYXQgYSBzaGlwIGhhcyBTVU5LIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpZElTaW5rQVNoaXAuaXNTdW5rKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYXJyYXlPZkRPTSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsbENvcHlTcGFuc1AyLmZvckVhY2goYXJyYXkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYXJyTGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IGFyckxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJyYXlba10uaW5jbHVkZXMoYCR7Y29vcmRQaWNrZWR9YCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJheU9mRE9NID0gYXJyYXk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhhcnJheU9mRE9NKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJheU9mRE9NLmZvckVhY2goZXogPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYXJyU3RyaW5nID0gZXpbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNoaXBTdW5rRE9NKGFyclN0cmluZywgY3VycmVudFBsYXllciwgUDEsIFAyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUDEgbXlIaXRzOiBcIiwgUDEubXlIaXRzKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJQMSBteU1pc3NlczogXCIsIFAxLm15TWlzc2VzKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vcGxheWVyVHVyblN3aXRjaCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hlY2tGb3JXaW4oKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQocGxheWVyVHVyblN3aXRjaCwgNTAwKTsvL2dpdmUgaXQgdGltZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBoaWRlQ29tcEJvYXJkKCk7Ly9oaWRlIENQVSdzIHBsYWNlbWVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy9zZXRUaW1lb3V0KGNvbXB1dGVyVHVybiwgMjQwMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWZ0ZXIgMTAwMG1zLCBjYWxsIHRoZSBgc2V0VGltZW91dGAgY2FsbGJhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJbiB0aGUgbWVhbnRpbWUsIGNvbnRpbnVlIGV4ZWN1dGluZyBjb2RlIGJlbG93XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcHV0ZXJUdXJuKCkgLy9ydW5zIHNlY29uZCBhZnRlciAxMTAwbXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LDIyMDApXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGlubmVyT24oKSAvL3J1bnMgZmlyc3QsIGFmdGVyIDEwMDBtc1xuICAgICAgICAgICAgICAgICAgICAgICAgfSw1MDApXG4gICAgICAgICAgICAgICAgICAgIH0vL2NvbXB1dGVyIFwidGhpbmtpbmdcIlxuICAgICAgICAgICAgICAgICAgICAvL2NvbXB1dGVyVHVybigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pXG4gICAgXG4gICAgY29uc3QgUDJFbmVteUJvYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNQMlRcIik7XG4gICAgUDJFbmVteUJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgIGlmIChjdXJyZW50UGxheWVyICE9PSBQMikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGUudGFyZ2V0LmlkID09PSBcIlAyVFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuY2xhc3NOYW1lLnNsaWNlKDAsNikgPT09IFwic3F1YXJlXCIgJiYgZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuaWQuc2xpY2UoMSwyKSA9PT0gXCIwXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuY2xhc3NOYW1lLnNsaWNlKDAsNikgPT09IFwic3F1YXJlXCIgJiYgZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuaWQuc2xpY2UoMCw1KSA9PT0gXCJlbXB0eVwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IGNvb3JkUGlja2VkID0gZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuaWQuc2xpY2UoMCwyKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImNvb3JkUGlja2VkIHdhcyBcIiwgY29vcmRQaWNrZWQpO1xuICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSBQMi5kaWRBdGtNaXNzKGNvb3JkUGlja2VkLCBQMS5nZXRBdHRhY2tlZCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9leGNsdWRlcyBmYWxzZSB3aGVuIGNvb3JkIGlzIGFscmVhZHkgaGl0L21pc3NlZFxuICAgICAgICAgICAgICAgICAgICBsZXQgc3FIb2xkZXJDb29yZCA9IHJlc3VsdC5zbGljZSg1KTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGhpdE1pc3MgPSByZXN1bHQuc2xpY2UoMCw0KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJzcUhvbGRlckNvb3JkOiBcIiwgc3FIb2xkZXJDb29yZCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaGl0TWlzczogXCIsIGhpdE1pc3MpO1xuICAgICAgICAgICAgICAgICAgICBmaWxsU3F1YXJlRE9NKHNxSG9sZGVyQ29vcmQsIGhpdE1pc3MsIGN1cnJlbnRQbGF5ZXIsIFAxLCBQMik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUDIgbXlIaXRzOiBcIiwgUDIubXlIaXRzKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJQMiBteU1pc3NlczogXCIsIFAyLm15TWlzc2VzKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoZWNrRm9yV2luKCkgPT09IGZhbHNlKSB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChwbGF5ZXJUdXJuU3dpdGNoLCAxNTAwKTsvL2dpdmUgaXQgdGltZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vcGxheWVyVHVyblN3aXRjaCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pXG5cbiAgICBmdW5jdGlvbiBjb21wdXRlclR1cm4oKSB7XG4gICAgICAgIC8vY3VycmVudCBwbGF5ZXIganVzdCBzd2l0Y2hlZCB0byBQMiwgYWthIENvbXB1dGVyXG4gICAgICAgIGxldCByZXN1bHQgPSBQMi5kaWRBdGtNaXNzKFAyLnJhbmRvbUF0a0Nob2ljZSgpLCBQMS5nZXRBdHRhY2tlZCk7XG4gICAgICAgIGxldCBzcUhvbGRlckNvb3JkID0gcmVzdWx0LnNsaWNlKDUpO1xuICAgICAgICBsZXQgaGl0TWlzcyA9IHJlc3VsdC5zbGljZSgwLDQpO1xuXG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyhcInJlc3VsdDogXCIsIHJlc3VsdCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3FIb2xkZXJDb29yZDogXCIsIHNxSG9sZGVyQ29vcmQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcImhpdE1pc3M6IFwiLCBoaXRNaXNzKTtcbiAgICAgICAgZmlsbFNxdWFyZURPTShzcUhvbGRlckNvb3JkLCBoaXRNaXNzLCBjdXJyZW50UGxheWVyLCBQMSwgUDIpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIlAyIG15SGl0czogXCIsIFAyLm15SGl0cyk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiUDIgbXlNaXNzZXM6IFwiLCBQMi5teU1pc3Nlcyk7XG4gICAgICAgIGlmIChjaGVja0ZvcldpbigpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgc2V0VGltZW91dChwbGF5ZXJUdXJuU3dpdGNoLCAxNTAwKTsvL2dpdmUgaXQgdGltZVxuICAgICAgICB9XG4gICAgICAgIHNwaW5uZXJPZmYoKTtcbiAgICB9XG5cbiAgICAvKiBQMS5kaWRBdGtNaXNzKCdBMicsIFAyLmdldEF0dGFja2VkKTtcbiAgICBQMi5kaWRBdGtNaXNzKFAyLnJhbmRvbUF0a0Nob2ljZSgpLCBQMS5nZXRBdHRhY2tlZCk7XG4gICAgY29uc29sZS5sb2coUDEucGxheWVyQm9hcmQpO1xuICAgIGNvbnNvbGUubG9nKFAyLnBsYXllckJvYXJkKTtcbiAgICBjb25zb2xlLmxvZyhQMS5teUhpdHMpO1xuICAgIGNvbnNvbGUubG9nKFAyLm15SGl0cyk7XG4gICAgY29uc29sZS5sb2coUDIubXlNaXNzZXMpOyAqL1xufVxuXG5cbmJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgIHRvZ2dsZUJ1dHRvbigpO1xuICAgIHJlc2V0RE9NKCk7XG4gICAgc3RhcnRHYW1lKCk7XG4gICAgXG59KVxuXG5zdGFydEdhbWUoKTtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxvZ2ljdG9kbygpIHtcblxuICAgIGxldCBnYW1lYm9hcmRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImdhbWVib2FyZFwiKTtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGdhbWVib2FyZHMsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIGxldCBsZXR0ZXJOdW1iQXJyID0gWydlbXB0eScsJ0EnLCdCJywnQycsJ0QnLCdFJywnRicsJ0cnLCdIJywnSScsJ0onXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMTsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDExOyBqKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgbmV3U3EgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgICAgIG5ld1NxLmNsYXNzTmFtZSA9IGBzcXVhcmVgO1xuICAgICAgICAgICAgICAgIGxldCBzb21lQ29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgc29tZUNvbnRlbnQuY2xhc3NOYW1lID0gXCJjb250ZW50elwiO1xuICAgICAgICAgICAgICAgIGlmIChqID09PSAwICYmIGkgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc29tZUNvbnRlbnQuaW5uZXJIVE1MID0gYCR7aX1gO1xuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICAgICAgaWYgKGkgPT09IDAgJiYgaiAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBzb21lQ29udGVudC5pbm5lckhUTUwgPSBgJHtsZXR0ZXJOdW1iQXJyW2pdfWBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3U3EuYXBwZW5kQ2hpbGQoc29tZUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIGVsLmFwcGVuZENoaWxkKG5ld1NxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGV0IGZpcnN0U2VjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDFHXCIpO1xuICAgIGxldCBzZXRTcXVhcmVzID0gZmlyc3RTZWN0aW9uLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJzcXVhcmVcIik7XG4gICAgbGV0IHNldFNxQXJyYXkgPSBBcnJheS5mcm9tKHNldFNxdWFyZXMpOy8vY29udmVydCB0byBhcnJheVxuXG4gICAgbGV0IHNlY29uZFNlY3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAxVFwiKTtcbiAgICBsZXQgc2V0U2Vjb25kU3F1YXJlcyA9IHNlY29uZFNlY3Rpb24uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInNxdWFyZVwiKTtcbiAgICBsZXQgc2V0U2Vjb25kU3FBcnJheSA9IEFycmF5LmZyb20oc2V0U2Vjb25kU3F1YXJlcyk7Ly9jb252ZXJ0IHRvIGFycmF5XG5cbiAgICBsZXQgdGhpcmRTZWN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMkdcIik7XG4gICAgbGV0IHNldFRoaXJkU3F1YXJlcyA9IHRoaXJkU2VjdGlvbi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic3F1YXJlXCIpO1xuICAgIGxldCBzZXRUaGlyZFNxQXJyYXkgPSBBcnJheS5mcm9tKHNldFRoaXJkU3F1YXJlcyk7Ly9jb252ZXJ0IHRvIGFycmF5XG5cbiAgICBsZXQgZm91cnRoU2VjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDJUXCIpO1xuICAgIGxldCBzZXRGb3VydGhTcXVhcmVzID0gZm91cnRoU2VjdGlvbi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic3F1YXJlXCIpO1xuICAgIGxldCBzZXRGb3VydGhTcUFycmF5ID0gQXJyYXkuZnJvbShzZXRGb3VydGhTcXVhcmVzKTsvL2NvbnZlcnQgdG8gYXJyYXlcblxuICAgIGZ1bmN0aW9uIHNldENvbHVtbnMoc29tZUFycmF5LCBuYW1lKSB7XG5cbiAgICAgICAgbGV0IGxldHRlck51bWJBcnIgPSBbJ2VtcHR5JywnQScsJ0InLCdDJywnRCcsJ0UnLCdGJywnRycsJ0gnLCdJJywnSiddO1xuICAgICAgICBsZXQgajAgPSAwO1xuICAgICAgICBsZXQgajEgPSAwO1xuICAgICAgICBsZXQgajIgPSAwO1xuICAgICAgICBsZXQgajMgPSAwO1xuICAgICAgICBsZXQgajQgPSAwO1xuICAgICAgICBsZXQgajUgPSAwO1xuICAgICAgICBsZXQgajYgPSAwO1xuICAgICAgICBsZXQgajcgPSAwO1xuICAgICAgICBsZXQgajggPSAwO1xuICAgICAgICBsZXQgajkgPSAwO1xuICAgICAgICBsZXQgajEwID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzb21lQXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpJTExID09PSAwKSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzBdfWA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFyclswXX0ke1tqMF19X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgajArKztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5jbGFzc05hbWUgPSBgc3F1YXJlICR7bGV0dGVyTnVtYkFyclsxXX1gO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFyclsxXX0ke1tqMV19X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGoxKys7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGklMTEgPT09IDIpIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbMl19YDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLnNldEF0dHJpYnV0ZShcImlkXCIsIGAke2xldHRlck51bWJBcnJbMl19JHtbajJdfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqMisrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmIChpJTExID09PSAzKSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzNdfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzNdfSR7W2ozXX1fYCtuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgajMrKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gNCkge1xuICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5jbGFzc05hbWUgPSBgc3F1YXJlICR7bGV0dGVyTnVtYkFycls0XX1gO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFycls0XX0ke1tqNF19X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGo0Kys7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGklMTEgPT09IDUpIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbNV19YDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLnNldEF0dHJpYnV0ZShcImlkXCIsIGAke2xldHRlck51bWJBcnJbNV19JHtbajVdfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqNSsrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmIChpJTExID09PSA2KSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzZdfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzZdfSR7W2o2XX1fYCtuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgajYrKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gNykge1xuICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5jbGFzc05hbWUgPSBgc3F1YXJlICR7bGV0dGVyTnVtYkFycls3XX1gO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFycls3XX0ke1tqN119X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGo3Kys7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGklMTEgPT09IDgpIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbOF19YDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLnNldEF0dHJpYnV0ZShcImlkXCIsIGAke2xldHRlck51bWJBcnJbOF19JHtbajhdfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqOCsrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmIChpJTExID09PSA5KSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzldfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzldfSR7W2o5XX1fYCtuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgajkrKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gMTApIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbMTBdfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzEwXX0ke1tqMTBdfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqMTArKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRDb2x1bW5zKHNldFNxQXJyYXksIFwiZmlyc3RPbmVcIik7XG4gICAgc2V0Q29sdW1ucyhzZXRTZWNvbmRTcUFycmF5LCBcInNlY29uZE9uZVwiKTtcbiAgICBzZXRDb2x1bW5zKHNldFRoaXJkU3FBcnJheSwgXCJ0aGlyZE9uZVwiKTtcbiAgICBzZXRDb2x1bW5zKHNldEZvdXJ0aFNxQXJyYXksIFwiZm91cnRoT25lXCIpO1xuXG4gICAgXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwbGFjZVNoaXBzRE9NKGFycmF5LCBwbGF5ZXIsIFAxLCBQMikgey8vYXJyYXkgZnJvbSBwbGF5ZXJQbGFjZVNoaXBTcGFuXG4gICAgaWYgKHBsYXllciA9PT0gUDEpIHtcbiAgICAgICAgYXJyYXkuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBsZXQgc3RyID0gZWxbMF07XG4gICAgICAgICAgICBsZXQgc3BlY2lmaWNTcUZvdW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7c3RyfV9maXJzdE9uZWApO1xuICAgICAgICAgICAgc3BlY2lmaWNTcUZvdW5kLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiYmx1ZVwiO1xuICAgICAgICB9KVxuICAgIH0gZWxzZSBpZiAocGxheWVyID09PSBQMikge1xuICAgICAgICBhcnJheS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGxldCBzdHIgPSBlbFswXTtcbiAgICAgICAgICAgIGxldCBzcGVjaWZpY1NxRm91bmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtzdHJ9X3RoaXJkT25lYCk7XG4gICAgICAgICAgICBzcGVjaWZpY1NxRm91bmQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJncmVlblwiO1xuICAgICAgICB9KVxuICAgIH1cbiAgICBcbn0gIFxuXG5leHBvcnQgZnVuY3Rpb24gZmlsbFNxdWFyZURPTShzdHIsIGhpdE9yTWlzcywgcGxheWVyLCBQMSwgUDIpIHsvL2lucHV0IHN0cmluZyBvZiBjb29yZFxuICAgIGlmIChwbGF5ZXIgPT09IFAxKSB7XG4gICAgICAgIGxldCBzcVRvQ2hhbmdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7c3RyfV9zZWNvbmRPbmVgKTtcbiAgICAgICAgaWYgKGhpdE9yTWlzcyA9PT0gXCJtaXNzXCIpIHtcbiAgICAgICAgICAgIHNxVG9DaGFuZ2Uuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJ3aGl0ZVwiO1xuICAgICAgICB9IGVsc2UgaWYgKGhpdE9yTWlzcyA9PT0gXCJoaXRzXCIpIHtcbiAgICAgICAgICAgIHNxVG9DaGFuZ2Uuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJkYXJrb3JhbmdlXCI7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHBsYXllciA9PT0gUDIpIHtcbiAgICAgICAgbGV0IHNxVG9DaGFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtzdHJ9X2ZvdXJ0aE9uZWApO1xuICAgICAgICBpZiAoaGl0T3JNaXNzID09PSBcIm1pc3NcIikge1xuICAgICAgICAgICAgc3FUb0NoYW5nZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIndoaXRlXCI7XG4gICAgICAgIH0gZWxzZSBpZiAoaGl0T3JNaXNzID09PSBcImhpdHNcIikge1xuICAgICAgICAgICAgc3FUb0NoYW5nZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcImRhcmtvcmFuZ2VcIjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNoaXBTdW5rRE9NKHN0ciwgcGxheWVyLCBQMSwgUDIpIHsvL2lucHV0IHN0cmluZyBjb29yZFxuICAgIGlmIChwbGF5ZXIgPT09IFAxKSB7IFxuICAgICAgICBsZXQgc3FUb1NpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtzdHJ9X3NlY29uZE9uZWApO1xuICAgICAgICBzcVRvU2luay5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcImJsYWNrXCI7XG4gICAgfSBlbHNlIGlmIChwbGF5ZXIgPT09IFAyKSB7XG5cbiAgICAgICAgbGV0IHNxVG9TaW5rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7c3RyfV9mb3VydGhPbmVgKTtcbiAgICAgICAgc3FUb1Npbmsuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJibGFja1wiO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNocmlua093bkJvYXJkKHBsYXllciwgUDEsIFAyKSB7XG4gICAgaWYgKHBsYXllciA9PT0gUDEpIHtcbiAgICAgICAgbGV0IGJvYXJkVG9TaHJpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAxR1wiKTtcbiAgICAgICAgYm9hcmRUb1Nocmluay5zdHlsZS53aWR0aCA9IFwiNjAlXCI7XG4gICAgfSBlbHNlIGlmIChwbGF5ZXIgPT09IFAyKSB7XG4gICAgICAgIGxldCBib2FyZFRvU2hyaW5rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMkdcIik7XG4gICAgICAgIGJvYXJkVG9TaHJpbmsuc3R5bGUud2lkdGggPSBcIjYwJVwiO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhpZGVDb21wQm9hcmQoKSB7XG5cbiAgICBmdW5jdGlvbiByYW5kb21Db2xvcihicmlnaHRuZXNzKXtcbiAgICAgICAgZnVuY3Rpb24gcmFuZG9tQ2hhbm5lbChicmlnaHRuZXNzKXtcbiAgICAgICAgICB2YXIgciA9IDI1NS1icmlnaHRuZXNzO1xuICAgICAgICAgIHZhciBuID0gMHwoKE1hdGgucmFuZG9tKCkgKiByKSArIGJyaWdodG5lc3MpO1xuICAgICAgICAgIHZhciBzID0gbi50b1N0cmluZygxNik7XG4gICAgICAgICAgcmV0dXJuIChzLmxlbmd0aD09MSkgPyAnMCcrcyA6IHM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcjJyArIHJhbmRvbUNoYW5uZWwoYnJpZ2h0bmVzcykgKyByYW5kb21DaGFubmVsKGJyaWdodG5lc3MpICsgcmFuZG9tQ2hhbm5lbChicmlnaHRuZXNzKTtcbiAgICB9XG5cbiAgICBsZXQgY29tcEdhbWVCb2FyZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDJHXCIpO1xuICAgIGxldCBjaGlsZE5vZGVzID0gY29tcEdhbWVCb2FyZC5jaGlsZE5vZGVzO1xuICAgIGxldCBhcnJheSA9IEFycmF5LmZyb20oY2hpbGROb2Rlcyk7XG4gICAgYXJyYXkuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgbGV0IG5ld0NvbG9yID0gcmFuZG9tQ29sb3IoMTI1KTtcbiAgICAgICAgbm9kZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBgJHtuZXdDb2xvcn1gO1xuICAgIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldERPTSgpIHtcbiAgICBsZXQgZmlyc3ROb2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMUdcIik7XG4gICAgbGV0IHNlY29uZE5vZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAxVFwiKTtcbiAgICBsZXQgdGhpcmROb2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMkdcIik7XG4gICAgbGV0IGZvdXJ0aE5vZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAyVFwiKTtcbiAgICB3aGlsZSAoZmlyc3ROb2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgZmlyc3ROb2RlLnJlbW92ZUNoaWxkKGZpcnN0Tm9kZS5sYXN0Q2hpbGQpO1xuICAgIH1cbiAgICB3aGlsZSAoc2Vjb25kTm9kZS5maXJzdENoaWxkKSB7XG4gICAgICAgIHNlY29uZE5vZGUucmVtb3ZlQ2hpbGQoc2Vjb25kTm9kZS5sYXN0Q2hpbGQpO1xuICAgIH1cbiAgICB3aGlsZSAodGhpcmROb2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgdGhpcmROb2RlLnJlbW92ZUNoaWxkKHRoaXJkTm9kZS5sYXN0Q2hpbGQpO1xuICAgIH1cbiAgICB3aGlsZSAoZm91cnRoTm9kZS5maXJzdENoaWxkKSB7XG4gICAgICAgIGZvdXJ0aE5vZGUucmVtb3ZlQ2hpbGQoZm91cnRoTm9kZS5sYXN0Q2hpbGQpO1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==