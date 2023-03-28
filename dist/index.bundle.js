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
        //change input coordinates into array; A2 to [A][2]
        let coordArr = coordinates.split('');
        let xIndexStart = findXIndex(coordinates);
        let yValueStart = Number(coordArr[1]);
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
        getAttacked, didAtkMiss, playerPlace, computerPlace, randomAtkChoice, shipsUp, allShipsSunk, playerPlaceShipSpan, getShipForOpp, playerShipCount,
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
                    let coordPicked = e.target.closest(".square").id.slice(0,2);
                    P1.playerPlace(coordPicked, lengthInputted, axisInputted);
                    let shipSpanTestP1 = P1.playerPlaceShipSpan(coordPicked, lengthInputted, axisInputted);
                    let copySpan = shipSpanTestP1.slice();
                    console.log(copySpan);
                    testArray.push(copySpan);
                    (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.placeShipsDOM)(shipSpanTestP1, P1, P1, P2);
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

    P1.playerPlace('A2', 3, 'vertical');
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
    allCopySpansP1.push(copySpan4P1);

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

    (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.placeShipsDOM)(shipSpan1P1, currentPlayer, P1, P2);
    (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.placeShipsDOM)(shipSpan2P1, currentPlayer, P1, P2);
    (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.placeShipsDOM)(shipSpan3P1, currentPlayer, P1, P2);
    (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.placeShipsDOM)(shipSpan4P1, currentPlayer, P1, P2);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTs7QUFFQTtBQUNBOztBQUVPLCtDQUErQztBQUN0RDtBQUNBO0FBQ0E7QUFDQSw2REFBNkQsSUFBSTtBQUNqRTtBQUNBLFNBQVM7QUFDVCxNQUFNO0FBQ047QUFDQTtBQUNBLDZEQUE2RCxJQUFJO0FBQ2pFO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFTyx3REFBd0Q7QUFDL0Q7QUFDQSxvREFBb0QsSUFBSTtBQUN4RDtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxNQUFNO0FBQ04sb0RBQW9ELElBQUk7QUFDeEQ7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFTywyQ0FBMkM7QUFDbEQ7QUFDQSxrREFBa0QsSUFBSTtBQUN0RDtBQUNBLE1BQU07O0FBRU4sa0RBQWtELElBQUk7QUFDdEQ7QUFDQTtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBOztBQUVPOztBQUVQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLFNBQVM7QUFDakQsS0FBSztBQUNMOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL2xvZ2ljLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL3NyYy9zdHlsZS5jc3MiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9zcmMvc3R5bGUuY3NzPzcxNjMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vc3JjL2xvZ2ljdG9kby5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBTaGlwID0gKG51bSwgaWQpID0+IHtcbiAgICBsZXQgbGVuZ3RoID0gbnVtO1xuICAgIGxldCBoaXRzID0gMDtcbiAgICBsZXQgc3Vua09yTm90ID0gZmFsc2U7XG4gICAgbGV0IHNoaXBJRCA9IGlkO1xuICAgIFxuICAgIGNvbnN0IGdldExlbmd0aCA9ICgpID0+IGxlbmd0aDtcbiAgICBjb25zdCBoaXQgPSAoKSA9PiBoaXRzID0gaGl0cyArIDE7XG4gICAgY29uc3QgZ2V0SGl0cyA9ICgpID0+IGhpdHM7XG4gICAgY29uc3QgaXNTdW5rID0gKCkgPT4ge1xuICAgICAgICBpZiAoaGl0cyA9PT0gbGVuZ3RoKSB7Ly93aWxsIG5lZWQgdG8gbWFrZSBzdXJlIHRoZXkgY2FuIG9ubHkgZ2V0IGhpdCBPTkNFIHBlciBjb29yZGluYXRlIHNwYW5cbiAgICAgICAgICAgIHN1bmtPck5vdCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzdW5rT3JOb3Q7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbGVuZ3RoLCBzdW5rT3JOb3QsIHNoaXBJRCwgaGl0cyxcbiAgICAgICAgZ2V0TGVuZ3RoLFxuICAgICAgICBnZXRIaXRzLFxuICAgICAgICBoaXQsXG4gICAgICAgIGlzU3VuayxcbiAgICB9O1xufTtcblxuY29uc3QgR2FtZWJvYXJkID0gKCkgPT4ge1xuICAgIGxldCBib2FyZCA9IHt9O1xuICAgIGxldCBzaGlwQ291bnQgPSAwOy8vY291bnRzICMgb2Ygc2hpcHMgdG90YWwgQU5EIHRvIGdlbiBJRFxuICAgIGxldCBsZXR0ZXJOdW1iQXJyID0gWydBJywnQicsJ0MnLCdEJywnRScsJ0YnLCdHJywnSCcsJ0knLCdKJ107XG4gICAgbGV0IG1pc3NlZFNob3RzID0gW107XG4gICAgbGV0IHNob3RzSGl0ID0gW107XG4gICAgbGV0IHNoaXBzU3RpbGxVcCA9IDA7XG4gICAgLy9pZGVhbGx5IHN0YXJ0IHdpdGggMTAgLS0gZm91ciAxcywgdGhyZWUgMnMsIHR3byAzcywgb25lIDRcblxuICAgIGNvbnN0IGJ1aWxkQm9hcmQgPSAoKSA9PiB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCAxMDsgaisrKSB7XG4gICAgICAgICAgICAgICAgYm9hcmRbYCR7bGV0dGVyTnVtYkFycltpXX0ke1tqKzFdfWBdID0gXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGdldFNoaXBzQWxpdmVDb3VudCA9ICgpID0+IHNoaXBzU3RpbGxVcDtcblxuICAgIGNvbnN0IGFyZUFsbFN1bmsgPSAoKSA9PiB7XG4gICAgICAgIGlmIChnZXRTaGlwc0FsaXZlQ291bnQoKSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgY29uc3QgbWFrZVNoaXAgPSAobGVuZ3RoKSA9PiB7XG4gICAgICAgIGxldCBuZXdTaGlwID0gU2hpcChsZW5ndGgsIHNoaXBDb3VudCk7XG4gICAgICAgIHNoaXBDb3VudCsrO1xuICAgICAgICBzaGlwc1N0aWxsVXArKztcbiAgICAgICAgcmV0dXJuIG5ld1NoaXA7XG4gICAgfVxuICAgIGNvbnN0IGZpbmRTcGFuID0gKGNvb3JkaW5hdGVzLCBsZW5ndGgsIGF4aXMpID0+IHsvL2Nvb3JkIHR5cGUgU3RyaW5nXG4gICAgICAgIGxldCBhcnJheSA9IFtdO1xuICAgICAgICAvL2NoYW5nZSBpbnB1dCBjb29yZGluYXRlcyBpbnRvIGFycmF5OyBBMiB0byBbQV1bMl1cbiAgICAgICAgbGV0IGNvb3JkQXJyID0gY29vcmRpbmF0ZXMuc3BsaXQoJycpO1xuICAgICAgICBsZXQgeEluZGV4U3RhcnQgPSBmaW5kWEluZGV4KGNvb3JkaW5hdGVzKTtcbiAgICAgICAgbGV0IHlWYWx1ZVN0YXJ0ID0gTnVtYmVyKGNvb3JkQXJyWzFdKTtcbiAgICAgICAgaWYgKGxlbmd0aCA9PT0gMSkgey8vY2FzZSBsZW5ndGggPT09IDFcbiAgICAgICAgICAgIGFycmF5LnB1c2goW2Nvb3JkQXJyWzBdK2Nvb3JkQXJyWzFdXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoYXhpcyA9PT0gXCJob3Jpem9udGFsXCIpIHsvL2Nhc2UgbGVuZ3RoID4gMVxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHhTcGFuQXJyYXkgPSBbbGV0dGVyTnVtYkFyclt4SW5kZXhTdGFydCtpXStjb29yZEFyclsxXV07XG4gICAgICAgICAgICAgICAgICAgIGFycmF5LnB1c2goeFNwYW5BcnJheSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGFycmF5LnB1c2goW2Nvb3JkQXJyWzBdKyh5VmFsdWVTdGFydCtpKV0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9XG4gICAgY29uc3QgZmluZFhJbmRleCA9IChjb29yZFN0cikgPT4gey8vaW5wdXQgc3RyaW5nXG4gICAgICAgIGxldCBjb29yZEFyciA9IGNvb3JkU3RyLnNwbGl0KCcnKTsvL2V4OiAnQTInIC0+IFsnQScsICcyJ11cbiAgICAgICAgbGV0IHhTdGFydCA9IGxldHRlck51bWJBcnIuaW5kZXhPZihgJHtjb29yZEFyclswXX1gKTtcbiAgICAgICAgcmV0dXJuIHhTdGFydDsvL291dHB1dCBudW1iZXJcbiAgICB9XG5cbiAgICBjb25zdCBub1NoaXBPdmVybGFwID0gKGFycmF5KSA9PiB7Ly9leDogW1tcIkE4XCJdLFtcIkI4XCJdXVxuICAgICAgICBsZXQgYm9vbGVhbiA9IG51bGw7XG4gICAgICAgIGxldCBsZW5ndGggPSBhcnJheS5sZW5ndGggLSAxO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbGV0IGFyclRvU3RyaW5nID0gYXJyYXlbaV0udG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGlmIChib2FyZFtgJHthcnJUb1N0cmluZ31gXSAhPT0gXCJcIikge1xuICAgICAgICAgICAgICAgIGJvb2xlYW4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYm9vbGVhbiA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJvb2xlYW47XG4gICAgfVxuXG4gICAgY29uc3QgcGxhY2VTaGlwID0gKHBvc2l0aW9uLCBsZW5ndGgsIGF4aXMpID0+IHsvL3Bvc2l0aW9uIHN0cmluZ1xuICAgICAgICBsZXQgeEluZGV4U3RhcnQgPSBmaW5kWEluZGV4KHBvc2l0aW9uKTtcbiAgICAgICAgbGV0IGNvb3JkQXJyID0gcG9zaXRpb24uc3BsaXQoJycpOy8vZXg6ICdBOCcgLT4gWydBJywgJzgnXVxuICAgICAgICBsZXQgeVZhbHVlU3RhcnQgPSBOdW1iZXIoY29vcmRBcnJbMV0pO1xuXG4gICAgICAgIC8qIGNvbnNvbGUubG9nKFwiWCBcIiwgKHhJbmRleFN0YXJ0KzEpKyhsZW5ndGgtMSkpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIlkgXCIsIHlWYWx1ZVN0YXJ0KyhsZW5ndGgtMSkpOyAqL1xuICAgICAgICBpZiAoYXhpcyA9PT0gXCJob3Jpem9udGFsXCIgJiYgKHhJbmRleFN0YXJ0KzEpKyhsZW5ndGgtMSkgPiAxMCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJDYW5ub3QgcGxhY2Ugc2hpcCBvZmYgZ2FtZWJvYXJkXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGF4aXMgPT09IFwidmVydGljYWxcIiAmJiB5VmFsdWVTdGFydCsobGVuZ3RoLTEpID4gMTApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2Fubm90IHBsYWNlIHNoaXAgb2ZmIGdhbWVib2FyZFwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgc2hpcFNwYW4gPSBmaW5kU3Bhbihwb3NpdGlvbiwgbGVuZ3RoLCBheGlzKTsvL1tbXCJBN1wiXSxbXCJBOFwiXV1cbiAgICAgICAgaWYgKG5vU2hpcE92ZXJsYXAoc2hpcFNwYW4pKSB7XG4gICAgICAgICAgICBsZXQgbmV3U2hpcCA9IFNoaXAobGVuZ3RoLCBzaGlwQ291bnQpO1xuICAgICAgICAgICAgc2hpcFNwYW4uZm9yRWFjaChhcnJheSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGFyclRvU3RyaW5nID0gYXJyYXkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBib2FyZFtgJHthcnJUb1N0cmluZ31gXSA9IG5ld1NoaXA7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgc2hpcENvdW50Kys7XG4gICAgICAgICAgICBzaGlwc1N0aWxsVXArKztcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJTb3JyeSwgdGhlcmUncyBhIHNoaXAgaW4gdGhlIHdheSFcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCByZWNlaXZlQXR0YWNrID0gKHRhcmdldENvb3IpID0+IHsvL2Fzc3VtZXMgeW91IFxuICAgICAgICAvL0NBTidUIHJlLWF0dGFjayBhIHBvc2l0aW9uIHlvdSd2ZSBtaXNzZWQgT1IgaGl0IGFscmVhZHlcbiAgICAgICAgbGV0IHRhcmdldEluQXJyID0gW1t0YXJnZXRDb29yXV07XG4gICAgICAgIGlmIChub1NoaXBPdmVybGFwKHRhcmdldEluQXJyKSA9PT0gdHJ1ZSkgey8vY2hlY2tzIGlmIHNoaXAgaXMgdGhlcmVcbiAgICAgICAgICAgIC8vaWYgVFJVRSwgbWVhbnMgbm90aGluZyBpcyB0aGVyZVxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJObyBzaGlwIHdhcyBoaXQuIE5pY2UgdHJ5IVwiKTtcbiAgICAgICAgICAgIG1pc3NlZFNob3RzLnB1c2godGFyZ2V0Q29vcik7XG4gICAgICAgIH0gZWxzZSBpZiAobm9TaGlwT3ZlcmxhcCh0YXJnZXRJbkFycikgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBsZXQgc2hpcEZvdW5kID0gYm9hcmRbYCR7dGFyZ2V0Q29vcn1gXTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiR3JlYXQgc2hvdCEgWW91IGxhbmRlZCBhIGhpdC5cIik7XG4gICAgICAgICAgICBzaGlwRm91bmQuaGl0KCk7XG4gICAgICAgICAgICBpZiAoc2hpcEZvdW5kLmdldEhpdHMoKSA9PT0gc2hpcEZvdW5kLmdldExlbmd0aCgpKSB7XG4gICAgICAgICAgICAgICAgc2hpcHNTdGlsbFVwLS07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBib2FyZCxtaXNzZWRTaG90cyxzaG90c0hpdCxzaGlwQ291bnQsXG4gICAgICAgIG1ha2VTaGlwLFxuICAgICAgICBidWlsZEJvYXJkLFxuICAgICAgICBwbGFjZVNoaXAsXG4gICAgICAgIGZpbmRTcGFuLFxuICAgICAgICBmaW5kWEluZGV4LFxuICAgICAgICBub1NoaXBPdmVybGFwLFxuICAgICAgICByZWNlaXZlQXR0YWNrLFxuICAgICAgICBnZXRTaGlwc0FsaXZlQ291bnQsXG4gICAgICAgIGFyZUFsbFN1bmssXG4gICAgfTtcbn1cblxuY29uc3QgUGxheWVyID0gKG5hbWUpID0+IHsvL2Fzc3VtZSBuYW1lcyBpbnB1dHRlZCBhcmUgVU5JUVVFXG4gICAgXG4gICAgbGV0IGlkID0gbmFtZTtcbiAgICBsZXQgb3duQm9hcmQgPSBHYW1lYm9hcmQoKTtcbiAgICBvd25Cb2FyZC5idWlsZEJvYXJkKCk7XG4gICAgbGV0IGxldHRlck51bWJBcnIgPSBbJ0EnLCdCJywnQycsJ0QnLCdFJywnRicsJ0cnLCdIJywnSScsJ0onXTtcbiAgICBsZXQgcGxheWVyQm9hcmQgPSBvd25Cb2FyZC5ib2FyZDtcbiAgICBsZXQgYWlyQmFsbHMgPSBvd25Cb2FyZC5taXNzZWRTaG90czsvL2J5IHRoZSBvcHBvc2luZyBwbGF5ZXJcblxuICAgIGxldCB0YXJnZXRCb2FyZCA9IEdhbWVib2FyZCgpO1xuICAgIHRhcmdldEJvYXJkLmJ1aWxkQm9hcmQoKTtcbiAgICBsZXQgb3Bwb0JvYXJkID0gdGFyZ2V0Qm9hcmQuYm9hcmQ7XG4gICAgbGV0IG15TWlzc2VzID0gdGFyZ2V0Qm9hcmQubWlzc2VkU2hvdHM7XG4gICAgbGV0IG15SGl0cyA9IHRhcmdldEJvYXJkLnNob3RzSGl0O1xuXG4gICAgY29uc3QgZ2V0U2hpcEZvck9wcCA9IChjb29yZCkgPT4ge1xuICAgICAgICBsZXQgZm91bmRTaGlwID0gcGxheWVyQm9hcmRbYCR7Y29vcmR9YF07XG4gICAgICAgIHJldHVybiBmb3VuZFNoaXA7XG4gICAgfVxuICAgIGNvbnN0IHBsYXllclBsYWNlID0gKHBvc2l0aW9uLCBsZW5ndGgsIGF4aXMpID0+IHtcbiAgICAgICAgLy9zdHJpbmcgJ0IzJywgbnVtYmVyIDMsIHN0cmluZyAnaG9yaXpvbnRhbCcvJ3ZlcnRpY2FsJ1xuICAgICAgICBvd25Cb2FyZC5wbGFjZVNoaXAocG9zaXRpb24sIGxlbmd0aCwgYXhpcyk7XG4gICAgfVxuXG4gICAgY29uc3QgcGxheWVyUGxhY2VTaGlwU3BhbiA9IChwb3NpdGlvbiwgbGVuZ3RoLCBheGlzKSA9PiB7XG4gICAgICAgIHJldHVybiBvd25Cb2FyZC5maW5kU3Bhbihwb3NpdGlvbiwgbGVuZ3RoLCBheGlzKTtcbiAgICB9XG5cbiAgICBjb25zdCBkaWRBdGtNaXNzID0gKGNvb3JkLCBnZXRBdHRhY2tlZCkgPT4ge1xuICAgICAgICBpZiAobXlIaXRzLmluY2x1ZGVzKGAke2Nvb3JkfWApKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImFscmVhZHkgc2hvdCBoZXJlLCBwbHMgc3RvcFwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChteU1pc3Nlcy5pbmNsdWRlcyhgJHtjb29yZH1gKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJhbHJlYWR5IG1pc3NlZCBoZXJlLCBnbyBlbHNld2hlcmVcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZ2V0QXR0YWNrZWQoYCR7Y29vcmR9YCkpIHsvL2lmIGl0IHJldHVybnMgdHJ1ZSwgbWVhbnMgbWlzc2VkXG4gICAgICAgICAgICAgICAgbXlNaXNzZXMucHVzaChjb29yZCk7XG4gICAgICAgICAgICAgICAgbGV0IHN0ciA9IGBtaXNzXyR7Y29vcmR9YDtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBteUhpdHMucHVzaChjb29yZCk7XG4gICAgICAgICAgICAgICAgbGV0IHN0ciA9IGBoaXRzXyR7Y29vcmR9YDtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZ2V0QXR0YWNrZWQgPSAoY29vcmQpID0+IHtcbiAgICAgICAgbGV0IHN0YXJ0aW5nTGVuZ3RoID0gYWlyQmFsbHMubGVuZ3RoO1xuICAgICAgICBvd25Cb2FyZC5yZWNlaXZlQXR0YWNrKGNvb3JkKTsvL2lmIGl0J3MgYSBtaXNzLCBhaXJCYWxscyBsZW5ndGggc2hvdWxkIGluY3JlYXNlIGJ5IDFcbiAgICAgICAgaWYgKGFpckJhbGxzLmxlbmd0aCA+IHN0YXJ0aW5nTGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBwbGF5ZXJTaGlwQ291bnQgPSAoKSA9PiBvd25Cb2FyZC5zaGlwQ291bnQ7XG4gICAgY29uc3Qgc2hpcHNVcCA9ICgpID0+IG93bkJvYXJkLmdldFNoaXBzQWxpdmVDb3VudCgpO1xuICAgIGNvbnN0IGFsbFNoaXBzU3VuayA9ICgpID0+IHtcbiAgICAgICAgaWYgKHNoaXBzVXAoKSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy90cnVlIGlmIHNoaXBDb3VudCBpcyAwLCBmYWxzZSBpZiBub3RcblxuICAgIC8vLS0tLWNvbXB1dGVyIGxvZ2ljXG5cblxuICAgIGNvbnN0IHJhbmRvbUF0a0Nob2ljZSA9ICgpID0+IHtcbiAgICAgICAgbGV0IGJvb2xIb2xkZXIgPSBmYWxzZTtcbiAgICAgICAgLy93YW50IHRvIHBpY2sgcmFuZG9tIFggJiBZOyBpZiBOT1Qgd2l0aGluIG15SGl0cyAmIG15TWlzc2VzLCBnbyBhaGVhZFxuICAgICAgICBkbyB7XG4gICAgICAgICAgICBsZXQgY29vcmQgPSByYW5kb21Qb3NpdGlvbigpO1xuICAgICAgICAgICAgaWYgKCFteUhpdHMuaW5jbHVkZXMoYCR7Y29vcmR9YCkgJiYgIW15TWlzc2VzLmluY2x1ZGVzKGAke2Nvb3JkfWApKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDUFUgcGlja2VkIFwiLCBjb29yZCk7XG4gICAgICAgICAgICAgICAgYm9vbEhvbGRlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvb3JkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IHdoaWxlICghYm9vbEhvbGRlcikgICAgICAgIFxuICAgIH1cbiAgICBjb25zdCBjb21wdXRlclBsYWNlID0gKGxlbmd0aCkgPT4ge1xuICAgICAgICAvL3N0cmluZyAnQjMnLCBudW1iZXIgMywgc3RyaW5nICdob3Jpem9udGFsJy8ndmVydGljYWwnXG4gICAgICAgIC8qIGxldCBwb3NpdGlvbiA9IHJhbmRvbVBvc2l0aW9uKCk7XG4gICAgICAgIGxldCBheGlzID0gcmFuZG9tQXhpcygpOyovXG4gICAgICAgIGxldCBib29sSG9sZGVyID0gZmFsc2U7IFxuXG4gICAgICAgIC8qIGlmIChvd25Cb2FyZC5wbGFjZVNoaXAocG9zaXRpb24sIGxlbmd0aCwgYXhpcykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAvL21lYW5pbmcgaWYgaXQncyBwbGFjZWQgb2ZmIHRoZSBib2FyZCBvciBvdmVybGFwcGluZ1xuICAgICAgICAgICAgLy93YW50IHRvIHJlcnVuIHRoaXMgZnVuY3Rpb24gYWdhaW5cbiAgICAgICAgfSAqL1xuXG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmFuIGFub3RoZXIgcGxhY2VtZW50IGJ5IHRoZSBjb21wXCIpO1xuICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0gcmFuZG9tUG9zaXRpb24oKTtcbiAgICAgICAgICAgIGxldCBheGlzID0gcmFuZG9tQXhpcygpO1xuICAgICAgICAgICAgYm9vbEhvbGRlciA9IG93bkJvYXJkLnBsYWNlU2hpcChwb3NpdGlvbiwgbGVuZ3RoLCBheGlzKTtcbiAgICAgICAgfSB3aGlsZSAoIWJvb2xIb2xkZXIpXG4gICAgICAgIFxuICAgIH1cbiAgICBjb25zdCByYW5kb21BeGlzID0gKCkgPT4ge1xuICAgICAgICBsZXQgY2hvc2VuQXhpcyA9IE1hdGgucmFuZG9tKCkgPCAwLjUgPyBcImhvcml6b250YWxcIiA6IFwidmVydGljYWxcIjtcbiAgICAgICAgcmV0dXJuIGNob3NlbkF4aXM7XG4gICAgfVxuICAgIGNvbnN0IHJhbmRvbVBvc2l0aW9uID0gKCkgPT4ge1xuICAgICAgICBsZXQgcmFuZG9tTnVtYjEgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMTApOy8vMC05XG4gICAgICAgIGxldCByYW5kb21OdW1iMiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSoxMCk7XG4gICAgICAgIC8vY29uc29sZS5sb2cobGV0dGVyTnVtYkFycik7XG4gICAgICAgIGxldCByYW5kb21YID0gbGV0dGVyTnVtYkFycltyYW5kb21OdW1iMV07XG4gICAgICAgIGxldCByYW5kb21ZID0gcmFuZG9tTnVtYjIgKyAxO1xuICAgICAgICByZXR1cm4gcmFuZG9tWCArIHJhbmRvbVkudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBpZCwgcGxheWVyQm9hcmQsIGFpckJhbGxzLCBvcHBvQm9hcmQsIG15TWlzc2VzLCBteUhpdHMsXG4gICAgICAgIGdldEF0dGFja2VkLCBkaWRBdGtNaXNzLCBwbGF5ZXJQbGFjZSwgY29tcHV0ZXJQbGFjZSwgcmFuZG9tQXRrQ2hvaWNlLCBzaGlwc1VwLCBhbGxTaGlwc1N1bmssIHBsYXllclBsYWNlU2hpcFNwYW4sIGdldFNoaXBGb3JPcHAsIHBsYXllclNoaXBDb3VudCxcbiAgICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7IFxuICAgIFNoaXA6IFNoaXAsXG4gICAgR2FtZWJvYXJkOiBHYW1lYm9hcmQsXG4gICAgUGxheWVyOiBQbGF5ZXIsXG59ICIsIi8vIEltcG9ydHNcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL2FwaS5qc1wiO1xudmFyIF9fX0NTU19MT0FERVJfRVhQT1JUX19fID0gX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fKF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18pO1xuLy8gTW9kdWxlXG5fX19DU1NfTE9BREVSX0VYUE9SVF9fXy5wdXNoKFttb2R1bGUuaWQsIFwiaHRtbCwgYm9keSwgZGl2LCBzcGFuLCBhcHBsZXQsIG9iamVjdCwgaWZyYW1lLFxcbmgxLCBoMiwgaDMsIGg0LCBoNSwgaDYsIHAsIGJsb2NrcXVvdGUsIHByZSxcXG5hLCBhYmJyLCBhY3JvbnltLCBhZGRyZXNzLCBiaWcsIGNpdGUsIGNvZGUsXFxuZGVsLCBkZm4sIGVtLCBpbWcsIGlucywga2JkLCBxLCBzLCBzYW1wLFxcbnNtYWxsLCBzdHJpa2UsIHN0cm9uZywgc3ViLCBzdXAsIHR0LCB2YXIsXFxuYiwgdSwgaSwgY2VudGVyLFxcbmRsLCBkdCwgZGQsIG9sLCB1bCwgbGksXFxuZmllbGRzZXQsIGZvcm0sIGxhYmVsLCBsZWdlbmQsXFxudGFibGUsIGNhcHRpb24sIHRib2R5LCB0Zm9vdCwgdGhlYWQsIHRyLCB0aCwgdGQsXFxuYXJ0aWNsZSwgYXNpZGUsIGNhbnZhcywgZGV0YWlscywgZW1iZWQsIFxcbmZpZ3VyZSwgZmlnY2FwdGlvbiwgZm9vdGVyLCBoZWFkZXIsIGhncm91cCwgXFxubWVudSwgbmF2LCBvdXRwdXQsIHJ1YnksIHNlY3Rpb24sIHN1bW1hcnksXFxudGltZSwgbWFyaywgYXVkaW8sIHZpZGVvIHtcXG5cXHRtYXJnaW46IDA7XFxuXFx0cGFkZGluZzogMDtcXG5cXHRib3JkZXI6IDA7XFxuXFx0Zm9udC1zaXplOiAxMDAlO1xcblxcdGZvbnQ6IGluaGVyaXQ7XFxuXFx0dmVydGljYWwtYWxpZ246IGJhc2VsaW5lO1xcbn1cXG4vKiBIVE1MNSBkaXNwbGF5LXJvbGUgcmVzZXQgZm9yIG9sZGVyIGJyb3dzZXJzICovXFxuYXJ0aWNsZSwgYXNpZGUsIGRldGFpbHMsIGZpZ2NhcHRpb24sIGZpZ3VyZSwgXFxuZm9vdGVyLCBoZWFkZXIsIGhncm91cCwgbWVudSwgbmF2LCBzZWN0aW9uIHtcXG5cXHRkaXNwbGF5OiBibG9jaztcXG59XFxuYm9keSB7XFxuXFx0bGluZS1oZWlnaHQ6IDE7XFxufVxcbm9sLCB1bCB7XFxuXFx0bGlzdC1zdHlsZTogbm9uZTtcXG59XFxuYmxvY2txdW90ZSwgcSB7XFxuXFx0cXVvdGVzOiBub25lO1xcbn1cXG5ibG9ja3F1b3RlOmJlZm9yZSwgYmxvY2txdW90ZTphZnRlcixcXG5xOmJlZm9yZSwgcTphZnRlciB7XFxuXFx0Y29udGVudDogJyc7XFxuXFx0Y29udGVudDogbm9uZTtcXG59XFxudGFibGUge1xcblxcdGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7XFxuXFx0Ym9yZGVyLXNwYWNpbmc6IDA7XFxufVxcblxcbjpyb290IHtcXG4gICAgLS1wcmltYXJ5OiAjZmY2ZmIyOyBcXG4gICAgLS1zZWNvbmRhcnk6ICNjMzE5NWQ7IFxcbiAgICAtLXRlcnRpYXJ5OiAjNjgwNzQ3OyBcXG4gICAgLS1xdWF0ZXJuYXJ5OiAjMTQxMDEwOyBcXG59XFxuXFxuaHRtbCwgYm9keSwgZGl2I2NvbnRlbnQge1xcbiAgICBoZWlnaHQ6IDEwMCU7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBmb250LXNpemU6IDE1cHg7XFxufVxcblxcbmRpdiNwMVNlcGVyYXRvciB7XFxuXFx0YmFja2dyb3VuZC1jb2xvcjogdmFyKC0tcHJpbWFyeSk7XFxufVxcbmRpdiNwMlNlcGVyYXRvciB7XFxuXFx0YmFja2dyb3VuZC1jb2xvcjphcXVhO1xcbn1cXG5cXG5kaXYjUDFHLCBkaXYjUDJHIHtcXG5cXHR3aWR0aDogNjAlO1xcblxcdG1hcmdpbjogYXV0bztcXG59XFxuXFxuZGl2LmdhbWVib2FyZCB7XFxuXFx0ZGlzcGxheTogZmxleDtcXG5cXHRmbGV4LXdyYXA6IHdyYXA7XFxuXFx0Ym9yZGVyOiAzcHggc29saWQgcGluaztcXG59XFxuXFxuLmRlc2NyaXB0b3Ige1xcblxcdGZvbnQtZmFtaWx5OiAnU3BhY2UgR3JvdGVzaycsIHNhbnMtc2VyaWY7XFxuXFx0Zm9udC1zaXplOiAxLjJyZW07XFxuXFx0cGFkZGluZzogMC41cmVtO1xcblxcdHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuXFxuYnV0dG9uI25ld0dhbWVCdG4ge1xcblxcdGJhY2tncm91bmQtY29sb3I6ICNjMzE5NWQ7XFxuXFx0Y29sb3I6YmlzcXVlO1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHR0b3A6IDVweDtcXG5cXHRyaWdodDogNXB4O1xcblxcdGRpc3BsYXk6IG5vbmU7XFxufVxcblxcbmRpdiNheGlzVG9nZ2xlIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiAjYzMxOTVkO1xcblxcdGJvcmRlcjogMnB4IGluc2V0IGdyYXk7XFxuXFx0Zm9udC1zaXplOiAxLjByZW07XFxuXFx0Y29sb3I6YmlzcXVlO1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHRwYWRkaW5nOiA0cHg7XFxuXFx0dG9wOiAzMXB4O1xcblxcdGxlZnQ6IDVweDtcXG5cXHQvKiBkaXNwbGF5OiBub25lOyAqL1xcbn1cXG5cXG5kaXYjdG9wQmFyIHtcXG5cXHRwb3NpdGlvbjogcmVsYXRpdmU7XFxufVxcblxcbmRpdltjbGFzc149XFxcInNxdWFyZVxcXCJdIHtcXG5cXHRwb3NpdGlvbjogcmVsYXRpdmU7XFxuXFx0ZmxleC1iYXNpczogY2FsYyg5JSAtIDEwcHgpO1xcblxcdG1hcmdpbjogNXB4O1xcblxcdGJvcmRlcjogMXB4IHNvbGlkO1xcblxcdGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxufVxcblxcbmRpdltjbGFzc149XFxcInNxdWFyZVxcXCJdOjpiZWZvcmUge1xcblxcdGNvbnRlbnQ6ICcnO1xcblxcdGRpc3BsYXk6IGJsb2NrO1xcblxcdHBhZGRpbmctdG9wOiAxMDAlO1xcbn1cXG5cXG5kaXZbY2xhc3NePVxcXCJzcXVhcmVcXFwiXSAuY29udGVudHoge1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHR0b3A6IDA7IGxlZnQ6IDA7XFxuXFx0aGVpZ2h0OiAxMDAlO1xcblxcdHdpZHRoOiAxMDAlO1xcbiAgXFxuXFx0ZGlzcGxheTogZmxleDsgICAgICAgICAgICAgICAvKiBhZGRlZCBmb3IgY2VudGVyZWQgdGV4dCAqL1xcblxcdGp1c3RpZnktY29udGVudDogY2VudGVyOyAgICAgLyogYWRkZWQgZm9yIGNlbnRlcmVkIHRleHQgKi9cXG5cXHRhbGlnbi1pdGVtczogY2VudGVyOyAgICAgICAgIC8qIGFkZGVkIGZvciBjZW50ZXJlZCB0ZXh0ICovXFxufVxcblxcbi8qIFxcbmRpdiNjb250ZW50IHtcXG5cXHRkaXNwbGF5OiBncmlkO1xcblxcdGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDIsIDQwJSk7XFxuXFx0Z3JpZC10ZW1wbGF0ZS1yb3dzOiByZXBlYXQoMiwgNDAlKTtcXG59XFxuXFxuZGl2LmdhbWVib2FyZCB7XFxuXFx0ZGlzcGxheTogZ3JpZDtcXG5cXHRncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgxMSwgOCUpO1xcblxcdGdyaWQtdGVtcGxhdGUtcm93czogcmVwZWF0KDExLCA4JSk7XFxufVxcblxcbmRpdltjbGFzc149XFxcInNxdWFyZVxcXCJdIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTg0LCAxODQsIDE4NCk7XFxuXFx0Ym9yZGVyOiAxcHggc29saWQgYmxhY2s7XFxuXFx0b3BhY2l0eTogMC41O1xcblxcdGFzcGVjdC1yYXRpbzogMTtcXG59ICovXFxuXFxuLyogbG9hZGluZy9zcGlubmVyIHN0dWZmICovXFxuXFxuZGl2I2xlbmd0aEluZGljYXRvciB7XFxuXFx0LyogZGlzcGxheTogbm9uZTsgKi9cXG5cXHRkaXNwbGF5OiBmbGV4O1xcblxcdGp1c3RpZnktY29udGVudDogbGVmdDtcXG5cXHRhbGlnbi1pdGVtczogY2VudGVyO1xcblxcdGdhcDogMC41cmVtO1xcblxcdGZvbnQtc2l6ZTogMS4xcmVtO1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHR0b3A6IDVweDtcXG5cXHRsZWZ0OiA1cHg7XFxufVxcblxcbmlucHV0I2xlbmd0aElucHV0IHtcXG5cXHR3aWR0aDogMjUlO1xcbn1cXG5cXG5kaXYjcHJvbXB0UGxhY2luZ1AxIHtcXG5cXHQvKiBkaXNwbGF5OiBub25lOyAqL1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHRkaXNwbGF5OiBmbGV4O1xcblxcdGZsZXgtd3JhcDogd3JhcDtcXG5cXHR3aWR0aDogMTQlO1xcblxcdHRvcDogNXB4O1xcblxcdHJpZ2h0OiA1cHg7XFxufVxcblxcbiNsb2FkZXIge1xcblxcdGRpc3BsYXk6IG5vbmU7XFxuXFx0dG9wOiA1MCU7XFxuXFx0bGVmdDogNTAlO1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHR0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTtcXG59XFxuICBcXG4ubG9hZGluZyB7XFxuXFx0Ym9yZGVyOiA4cHggc29saWQgcmdiKDIyMCwgMCwgMCk7XFxuXFx0d2lkdGg6IDYwcHg7XFxuXFx0aGVpZ2h0OiA2MHB4O1xcblxcdGJvcmRlci1yYWRpdXM6IDUwJTtcXG5cXHRib3JkZXItdG9wLWNvbG9yOiAjZmY2MzIwO1xcblxcdGJvcmRlci1sZWZ0LWNvbG9yOiAjZmY3MzAwO1xcblxcdGFuaW1hdGlvbjogc3BpbiAxcyBpbmZpbml0ZSBlYXNlLWluO1xcbn1cXG4gIFxcbkBrZXlmcmFtZXMgc3BpbiB7XFxuXFx0MCUge1xcblxcdCAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XFxuXFx0fVxcbiAgXFxuXFx0MTAwJSB7XFxuXFx0ICB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpO1xcblxcdH1cXG59XFxuXFxuQG1lZGlhIHNjcmVlbiBhbmQgKG1pbi13aWR0aDogNTI1cHgpIHtcXG5cXHRodG1sLCBib2R5LCBkaXYjY29udGVudCB7XFxuXFx0ICBmb250LXNpemU6IDIwcHg7XFxuXFx0fVxcblxcblxcdGRpdiNheGlzVG9nZ2xlIHtcXG5cXHRcXHRcXG5cXHRcXHR0b3A6IDM3cHg7XFxuXFx0XFx0LyogZGlzcGxheTogbm9uZTsgKi9cXG5cXHR9XFxufVwiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL3NyYy9zdHlsZS5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUE7Ozs7Ozs7Ozs7Ozs7Q0FhQyxTQUFTO0NBQ1QsVUFBVTtDQUNWLFNBQVM7Q0FDVCxlQUFlO0NBQ2YsYUFBYTtDQUNiLHdCQUF3QjtBQUN6QjtBQUNBLGdEQUFnRDtBQUNoRDs7Q0FFQyxjQUFjO0FBQ2Y7QUFDQTtDQUNDLGNBQWM7QUFDZjtBQUNBO0NBQ0MsZ0JBQWdCO0FBQ2pCO0FBQ0E7Q0FDQyxZQUFZO0FBQ2I7QUFDQTs7Q0FFQyxXQUFXO0NBQ1gsYUFBYTtBQUNkO0FBQ0E7Q0FDQyx5QkFBeUI7Q0FDekIsaUJBQWlCO0FBQ2xCOztBQUVBO0lBQ0ksa0JBQWtCO0lBQ2xCLG9CQUFvQjtJQUNwQixtQkFBbUI7SUFDbkIscUJBQXFCO0FBQ3pCOztBQUVBO0lBQ0ksWUFBWTtJQUNaLFdBQVc7SUFDWCxlQUFlO0FBQ25COztBQUVBO0NBQ0MsZ0NBQWdDO0FBQ2pDO0FBQ0E7Q0FDQyxxQkFBcUI7QUFDdEI7O0FBRUE7Q0FDQyxVQUFVO0NBQ1YsWUFBWTtBQUNiOztBQUVBO0NBQ0MsYUFBYTtDQUNiLGVBQWU7Q0FDZixzQkFBc0I7QUFDdkI7O0FBRUE7Q0FDQyx3Q0FBd0M7Q0FDeEMsaUJBQWlCO0NBQ2pCLGVBQWU7Q0FDZixrQkFBa0I7QUFDbkI7O0FBRUE7Q0FDQyx5QkFBeUI7Q0FDekIsWUFBWTtDQUNaLGtCQUFrQjtDQUNsQixRQUFRO0NBQ1IsVUFBVTtDQUNWLGFBQWE7QUFDZDs7QUFFQTtDQUNDLHlCQUF5QjtDQUN6QixzQkFBc0I7Q0FDdEIsaUJBQWlCO0NBQ2pCLFlBQVk7Q0FDWixrQkFBa0I7Q0FDbEIsWUFBWTtDQUNaLFNBQVM7Q0FDVCxTQUFTO0NBQ1QsbUJBQW1CO0FBQ3BCOztBQUVBO0NBQ0Msa0JBQWtCO0FBQ25COztBQUVBO0NBQ0Msa0JBQWtCO0NBQ2xCLDJCQUEyQjtDQUMzQixXQUFXO0NBQ1gsaUJBQWlCO0NBQ2pCLHNCQUFzQjtBQUN2Qjs7QUFFQTtDQUNDLFdBQVc7Q0FDWCxjQUFjO0NBQ2QsaUJBQWlCO0FBQ2xCOztBQUVBO0NBQ0Msa0JBQWtCO0NBQ2xCLE1BQU0sRUFBRSxPQUFPO0NBQ2YsWUFBWTtDQUNaLFdBQVc7O0NBRVgsYUFBYSxnQkFBZ0IsNEJBQTRCO0NBQ3pELHVCQUF1QixNQUFNLDRCQUE0QjtDQUN6RCxtQkFBbUIsVUFBVSw0QkFBNEI7QUFDMUQ7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtCRzs7QUFFSCwwQkFBMEI7O0FBRTFCO0NBQ0MsbUJBQW1CO0NBQ25CLGFBQWE7Q0FDYixxQkFBcUI7Q0FDckIsbUJBQW1CO0NBQ25CLFdBQVc7Q0FDWCxpQkFBaUI7Q0FDakIsa0JBQWtCO0NBQ2xCLFFBQVE7Q0FDUixTQUFTO0FBQ1Y7O0FBRUE7Q0FDQyxVQUFVO0FBQ1g7O0FBRUE7Q0FDQyxtQkFBbUI7Q0FDbkIsa0JBQWtCO0NBQ2xCLGFBQWE7Q0FDYixlQUFlO0NBQ2YsVUFBVTtDQUNWLFFBQVE7Q0FDUixVQUFVO0FBQ1g7O0FBRUE7Q0FDQyxhQUFhO0NBQ2IsUUFBUTtDQUNSLFNBQVM7Q0FDVCxrQkFBa0I7Q0FDbEIsZ0NBQWdDO0FBQ2pDOztBQUVBO0NBQ0MsZ0NBQWdDO0NBQ2hDLFdBQVc7Q0FDWCxZQUFZO0NBQ1osa0JBQWtCO0NBQ2xCLHlCQUF5QjtDQUN6QiwwQkFBMEI7Q0FDMUIsbUNBQW1DO0FBQ3BDOztBQUVBO0NBQ0M7R0FDRSx1QkFBdUI7Q0FDekI7O0NBRUE7R0FDRSx5QkFBeUI7Q0FDM0I7QUFDRDs7QUFFQTtDQUNDO0dBQ0UsZUFBZTtDQUNqQjs7Q0FFQTs7RUFFQyxTQUFTO0VBQ1QsbUJBQW1CO0NBQ3BCO0FBQ0RcIixcInNvdXJjZXNDb250ZW50XCI6W1wiaHRtbCwgYm9keSwgZGl2LCBzcGFuLCBhcHBsZXQsIG9iamVjdCwgaWZyYW1lLFxcbmgxLCBoMiwgaDMsIGg0LCBoNSwgaDYsIHAsIGJsb2NrcXVvdGUsIHByZSxcXG5hLCBhYmJyLCBhY3JvbnltLCBhZGRyZXNzLCBiaWcsIGNpdGUsIGNvZGUsXFxuZGVsLCBkZm4sIGVtLCBpbWcsIGlucywga2JkLCBxLCBzLCBzYW1wLFxcbnNtYWxsLCBzdHJpa2UsIHN0cm9uZywgc3ViLCBzdXAsIHR0LCB2YXIsXFxuYiwgdSwgaSwgY2VudGVyLFxcbmRsLCBkdCwgZGQsIG9sLCB1bCwgbGksXFxuZmllbGRzZXQsIGZvcm0sIGxhYmVsLCBsZWdlbmQsXFxudGFibGUsIGNhcHRpb24sIHRib2R5LCB0Zm9vdCwgdGhlYWQsIHRyLCB0aCwgdGQsXFxuYXJ0aWNsZSwgYXNpZGUsIGNhbnZhcywgZGV0YWlscywgZW1iZWQsIFxcbmZpZ3VyZSwgZmlnY2FwdGlvbiwgZm9vdGVyLCBoZWFkZXIsIGhncm91cCwgXFxubWVudSwgbmF2LCBvdXRwdXQsIHJ1YnksIHNlY3Rpb24sIHN1bW1hcnksXFxudGltZSwgbWFyaywgYXVkaW8sIHZpZGVvIHtcXG5cXHRtYXJnaW46IDA7XFxuXFx0cGFkZGluZzogMDtcXG5cXHRib3JkZXI6IDA7XFxuXFx0Zm9udC1zaXplOiAxMDAlO1xcblxcdGZvbnQ6IGluaGVyaXQ7XFxuXFx0dmVydGljYWwtYWxpZ246IGJhc2VsaW5lO1xcbn1cXG4vKiBIVE1MNSBkaXNwbGF5LXJvbGUgcmVzZXQgZm9yIG9sZGVyIGJyb3dzZXJzICovXFxuYXJ0aWNsZSwgYXNpZGUsIGRldGFpbHMsIGZpZ2NhcHRpb24sIGZpZ3VyZSwgXFxuZm9vdGVyLCBoZWFkZXIsIGhncm91cCwgbWVudSwgbmF2LCBzZWN0aW9uIHtcXG5cXHRkaXNwbGF5OiBibG9jaztcXG59XFxuYm9keSB7XFxuXFx0bGluZS1oZWlnaHQ6IDE7XFxufVxcbm9sLCB1bCB7XFxuXFx0bGlzdC1zdHlsZTogbm9uZTtcXG59XFxuYmxvY2txdW90ZSwgcSB7XFxuXFx0cXVvdGVzOiBub25lO1xcbn1cXG5ibG9ja3F1b3RlOmJlZm9yZSwgYmxvY2txdW90ZTphZnRlcixcXG5xOmJlZm9yZSwgcTphZnRlciB7XFxuXFx0Y29udGVudDogJyc7XFxuXFx0Y29udGVudDogbm9uZTtcXG59XFxudGFibGUge1xcblxcdGJvcmRlci1jb2xsYXBzZTogY29sbGFwc2U7XFxuXFx0Ym9yZGVyLXNwYWNpbmc6IDA7XFxufVxcblxcbjpyb290IHtcXG4gICAgLS1wcmltYXJ5OiAjZmY2ZmIyOyBcXG4gICAgLS1zZWNvbmRhcnk6ICNjMzE5NWQ7IFxcbiAgICAtLXRlcnRpYXJ5OiAjNjgwNzQ3OyBcXG4gICAgLS1xdWF0ZXJuYXJ5OiAjMTQxMDEwOyBcXG59XFxuXFxuaHRtbCwgYm9keSwgZGl2I2NvbnRlbnQge1xcbiAgICBoZWlnaHQ6IDEwMCU7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgICBmb250LXNpemU6IDE1cHg7XFxufVxcblxcbmRpdiNwMVNlcGVyYXRvciB7XFxuXFx0YmFja2dyb3VuZC1jb2xvcjogdmFyKC0tcHJpbWFyeSk7XFxufVxcbmRpdiNwMlNlcGVyYXRvciB7XFxuXFx0YmFja2dyb3VuZC1jb2xvcjphcXVhO1xcbn1cXG5cXG5kaXYjUDFHLCBkaXYjUDJHIHtcXG5cXHR3aWR0aDogNjAlO1xcblxcdG1hcmdpbjogYXV0bztcXG59XFxuXFxuZGl2LmdhbWVib2FyZCB7XFxuXFx0ZGlzcGxheTogZmxleDtcXG5cXHRmbGV4LXdyYXA6IHdyYXA7XFxuXFx0Ym9yZGVyOiAzcHggc29saWQgcGluaztcXG59XFxuXFxuLmRlc2NyaXB0b3Ige1xcblxcdGZvbnQtZmFtaWx5OiAnU3BhY2UgR3JvdGVzaycsIHNhbnMtc2VyaWY7XFxuXFx0Zm9udC1zaXplOiAxLjJyZW07XFxuXFx0cGFkZGluZzogMC41cmVtO1xcblxcdHRleHQtYWxpZ246IGNlbnRlcjtcXG59XFxuXFxuYnV0dG9uI25ld0dhbWVCdG4ge1xcblxcdGJhY2tncm91bmQtY29sb3I6ICNjMzE5NWQ7XFxuXFx0Y29sb3I6YmlzcXVlO1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHR0b3A6IDVweDtcXG5cXHRyaWdodDogNXB4O1xcblxcdGRpc3BsYXk6IG5vbmU7XFxufVxcblxcbmRpdiNheGlzVG9nZ2xlIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiAjYzMxOTVkO1xcblxcdGJvcmRlcjogMnB4IGluc2V0IGdyYXk7XFxuXFx0Zm9udC1zaXplOiAxLjByZW07XFxuXFx0Y29sb3I6YmlzcXVlO1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHRwYWRkaW5nOiA0cHg7XFxuXFx0dG9wOiAzMXB4O1xcblxcdGxlZnQ6IDVweDtcXG5cXHQvKiBkaXNwbGF5OiBub25lOyAqL1xcbn1cXG5cXG5kaXYjdG9wQmFyIHtcXG5cXHRwb3NpdGlvbjogcmVsYXRpdmU7XFxufVxcblxcbmRpdltjbGFzc149XFxcInNxdWFyZVxcXCJdIHtcXG5cXHRwb3NpdGlvbjogcmVsYXRpdmU7XFxuXFx0ZmxleC1iYXNpczogY2FsYyg5JSAtIDEwcHgpO1xcblxcdG1hcmdpbjogNXB4O1xcblxcdGJvcmRlcjogMXB4IHNvbGlkO1xcblxcdGJveC1zaXppbmc6IGJvcmRlci1ib3g7XFxufVxcblxcbmRpdltjbGFzc149XFxcInNxdWFyZVxcXCJdOjpiZWZvcmUge1xcblxcdGNvbnRlbnQ6ICcnO1xcblxcdGRpc3BsYXk6IGJsb2NrO1xcblxcdHBhZGRpbmctdG9wOiAxMDAlO1xcbn1cXG5cXG5kaXZbY2xhc3NePVxcXCJzcXVhcmVcXFwiXSAuY29udGVudHoge1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHR0b3A6IDA7IGxlZnQ6IDA7XFxuXFx0aGVpZ2h0OiAxMDAlO1xcblxcdHdpZHRoOiAxMDAlO1xcbiAgXFxuXFx0ZGlzcGxheTogZmxleDsgICAgICAgICAgICAgICAvKiBhZGRlZCBmb3IgY2VudGVyZWQgdGV4dCAqL1xcblxcdGp1c3RpZnktY29udGVudDogY2VudGVyOyAgICAgLyogYWRkZWQgZm9yIGNlbnRlcmVkIHRleHQgKi9cXG5cXHRhbGlnbi1pdGVtczogY2VudGVyOyAgICAgICAgIC8qIGFkZGVkIGZvciBjZW50ZXJlZCB0ZXh0ICovXFxufVxcblxcbi8qIFxcbmRpdiNjb250ZW50IHtcXG5cXHRkaXNwbGF5OiBncmlkO1xcblxcdGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDIsIDQwJSk7XFxuXFx0Z3JpZC10ZW1wbGF0ZS1yb3dzOiByZXBlYXQoMiwgNDAlKTtcXG59XFxuXFxuZGl2LmdhbWVib2FyZCB7XFxuXFx0ZGlzcGxheTogZ3JpZDtcXG5cXHRncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgxMSwgOCUpO1xcblxcdGdyaWQtdGVtcGxhdGUtcm93czogcmVwZWF0KDExLCA4JSk7XFxufVxcblxcbmRpdltjbGFzc149XFxcInNxdWFyZVxcXCJdIHtcXG5cXHRiYWNrZ3JvdW5kLWNvbG9yOiByZ2IoMTg0LCAxODQsIDE4NCk7XFxuXFx0Ym9yZGVyOiAxcHggc29saWQgYmxhY2s7XFxuXFx0b3BhY2l0eTogMC41O1xcblxcdGFzcGVjdC1yYXRpbzogMTtcXG59ICovXFxuXFxuLyogbG9hZGluZy9zcGlubmVyIHN0dWZmICovXFxuXFxuZGl2I2xlbmd0aEluZGljYXRvciB7XFxuXFx0LyogZGlzcGxheTogbm9uZTsgKi9cXG5cXHRkaXNwbGF5OiBmbGV4O1xcblxcdGp1c3RpZnktY29udGVudDogbGVmdDtcXG5cXHRhbGlnbi1pdGVtczogY2VudGVyO1xcblxcdGdhcDogMC41cmVtO1xcblxcdGZvbnQtc2l6ZTogMS4xcmVtO1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHR0b3A6IDVweDtcXG5cXHRsZWZ0OiA1cHg7XFxufVxcblxcbmlucHV0I2xlbmd0aElucHV0IHtcXG5cXHR3aWR0aDogMjUlO1xcbn1cXG5cXG5kaXYjcHJvbXB0UGxhY2luZ1AxIHtcXG5cXHQvKiBkaXNwbGF5OiBub25lOyAqL1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHRkaXNwbGF5OiBmbGV4O1xcblxcdGZsZXgtd3JhcDogd3JhcDtcXG5cXHR3aWR0aDogMTQlO1xcblxcdHRvcDogNXB4O1xcblxcdHJpZ2h0OiA1cHg7XFxufVxcblxcbiNsb2FkZXIge1xcblxcdGRpc3BsYXk6IG5vbmU7XFxuXFx0dG9wOiA1MCU7XFxuXFx0bGVmdDogNTAlO1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHR0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTtcXG59XFxuICBcXG4ubG9hZGluZyB7XFxuXFx0Ym9yZGVyOiA4cHggc29saWQgcmdiKDIyMCwgMCwgMCk7XFxuXFx0d2lkdGg6IDYwcHg7XFxuXFx0aGVpZ2h0OiA2MHB4O1xcblxcdGJvcmRlci1yYWRpdXM6IDUwJTtcXG5cXHRib3JkZXItdG9wLWNvbG9yOiAjZmY2MzIwO1xcblxcdGJvcmRlci1sZWZ0LWNvbG9yOiAjZmY3MzAwO1xcblxcdGFuaW1hdGlvbjogc3BpbiAxcyBpbmZpbml0ZSBlYXNlLWluO1xcbn1cXG4gIFxcbkBrZXlmcmFtZXMgc3BpbiB7XFxuXFx0MCUge1xcblxcdCAgdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XFxuXFx0fVxcbiAgXFxuXFx0MTAwJSB7XFxuXFx0ICB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpO1xcblxcdH1cXG59XFxuXFxuQG1lZGlhIHNjcmVlbiBhbmQgKG1pbi13aWR0aDogNTI1cHgpIHtcXG5cXHRodG1sLCBib2R5LCBkaXYjY29udGVudCB7XFxuXFx0ICBmb250LXNpemU6IDIwcHg7XFxuXFx0fVxcblxcblxcdGRpdiNheGlzVG9nZ2xlIHtcXG5cXHRcXHRcXG5cXHRcXHR0b3A6IDM3cHg7XFxuXFx0XFx0LyogZGlzcGxheTogbm9uZTsgKi9cXG5cXHR9XFxufVwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLypcbiAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAgQXV0aG9yIFRvYmlhcyBLb3BwZXJzIEBzb2tyYVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcpIHtcbiAgdmFyIGxpc3QgPSBbXTtcblxuICAvLyByZXR1cm4gdGhlIGxpc3Qgb2YgbW9kdWxlcyBhcyBjc3Mgc3RyaW5nXG4gIGxpc3QudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIHZhciBjb250ZW50ID0gXCJcIjtcbiAgICAgIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2YgaXRlbVs1XSAhPT0gXCJ1bmRlZmluZWRcIjtcbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbWVkaWEgXCIuY29uY2F0KGl0ZW1bMl0sIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAbGF5ZXJcIi5jb25jYXQoaXRlbVs1XS5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KGl0ZW1bNV0pIDogXCJcIiwgXCIge1wiKTtcbiAgICAgIH1cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcbiAgICAgIGlmIChuZWVkTGF5ZXIpIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtWzJdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfSkuam9pbihcIlwiKTtcbiAgfTtcblxuICAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuICBsaXN0LmkgPSBmdW5jdGlvbiBpKG1vZHVsZXMsIG1lZGlhLCBkZWR1cGUsIHN1cHBvcnRzLCBsYXllcikge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlcyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgbW9kdWxlcyA9IFtbbnVsbCwgbW9kdWxlcywgdW5kZWZpbmVkXV07XG4gICAgfVxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG4gICAgaWYgKGRlZHVwZSkge1xuICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCB0aGlzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHZhciBpZCA9IHRoaXNba11bMF07XG4gICAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgICAgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpZF0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuICAgICAgaWYgKGRlZHVwZSAmJiBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzW2l0ZW1bMF1dKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBsYXllciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1bNV0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzVdID0gbGF5ZXI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoc3VwcG9ydHMpIHtcbiAgICAgICAgaWYgKCFpdGVtWzRdKSB7XG4gICAgICAgICAgaXRlbVs0XSA9IFwiXCIuY29uY2F0KHN1cHBvcnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVtWzFdID0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bNF0gPSBzdXBwb3J0cztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGlzdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuICBpZiAoIWNzc01hcHBpbmcpIHtcbiAgICByZXR1cm4gY29udGVudDtcbiAgfVxuICBpZiAodHlwZW9mIGJ0b2EgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHZhciBiYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjc3NNYXBwaW5nKSkpKTtcbiAgICB2YXIgZGF0YSA9IFwic291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsXCIuY29uY2F0KGJhc2U2NCk7XG4gICAgdmFyIHNvdXJjZU1hcHBpbmcgPSBcIi8qIyBcIi5jb25jYXQoZGF0YSwgXCIgKi9cIik7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoW3NvdXJjZU1hcHBpbmddKS5qb2luKFwiXFxuXCIpO1xuICB9XG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vc3R5bGUuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzdHlsZXNJbkRPTSA9IFtdO1xuZnVuY3Rpb24gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuICB2YXIgcmVzdWx0ID0gLTE7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5ET00ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5ET01baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gbW9kdWxlc1RvRG9tKGxpc3QsIG9wdGlvbnMpIHtcbiAgdmFyIGlkQ291bnRNYXAgPSB7fTtcbiAgdmFyIGlkZW50aWZpZXJzID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleEJ5SWRlbnRpZmllciA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXSxcbiAgICAgIHN1cHBvcnRzOiBpdGVtWzRdLFxuICAgICAgbGF5ZXI6IGl0ZW1bNV1cbiAgICB9O1xuICAgIGlmIChpbmRleEJ5SWRlbnRpZmllciAhPT0gLTEpIHtcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS5yZWZlcmVuY2VzKys7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0udXBkYXRlcihvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdXBkYXRlciA9IGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5ieUluZGV4ID0gaTtcbiAgICAgIHN0eWxlc0luRE9NLnNwbGljZShpLCAwLCB7XG4gICAgICAgIGlkZW50aWZpZXI6IGlkZW50aWZpZXIsXG4gICAgICAgIHVwZGF0ZXI6IHVwZGF0ZXIsXG4gICAgICAgIHJlZmVyZW5jZXM6IDFcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZGVudGlmaWVycy5wdXNoKGlkZW50aWZpZXIpO1xuICB9XG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cbmZ1bmN0aW9uIGFkZEVsZW1lbnRTdHlsZShvYmosIG9wdGlvbnMpIHtcbiAgdmFyIGFwaSA9IG9wdGlvbnMuZG9tQVBJKG9wdGlvbnMpO1xuICBhcGkudXBkYXRlKG9iaik7XG4gIHZhciB1cGRhdGVyID0gZnVuY3Rpb24gdXBkYXRlcihuZXdPYmopIHtcbiAgICBpZiAobmV3T2JqKSB7XG4gICAgICBpZiAobmV3T2JqLmNzcyA9PT0gb2JqLmNzcyAmJiBuZXdPYmoubWVkaWEgPT09IG9iai5tZWRpYSAmJiBuZXdPYmouc291cmNlTWFwID09PSBvYmouc291cmNlTWFwICYmIG5ld09iai5zdXBwb3J0cyA9PT0gb2JqLnN1cHBvcnRzICYmIG5ld09iai5sYXllciA9PT0gb2JqLmxheWVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGFwaS51cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHVwZGF0ZXI7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaXN0LCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBsaXN0ID0gbGlzdCB8fCBbXTtcbiAgdmFyIGxhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uIHVwZGF0ZShuZXdMaXN0KSB7XG4gICAgbmV3TGlzdCA9IG5ld0xpc3QgfHwgW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cbiAgICB2YXIgbmV3TGFzdElkZW50aWZpZXJzID0gbW9kdWxlc1RvRG9tKG5ld0xpc3QsIG9wdGlvbnMpO1xuICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICB2YXIgX2lkZW50aWZpZXIgPSBsYXN0SWRlbnRpZmllcnNbX2ldO1xuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcbiAgICAgIGlmIChzdHlsZXNJbkRPTVtfaW5kZXhdLnJlZmVyZW5jZXMgPT09IDApIHtcbiAgICAgICAgc3R5bGVzSW5ET01bX2luZGV4XS51cGRhdGVyKCk7XG4gICAgICAgIHN0eWxlc0luRE9NLnNwbGljZShfaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVtbyA9IHt9O1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7XG5cbiAgICAvLyBTcGVjaWFsIGNhc2UgdG8gcmV0dXJuIGhlYWQgb2YgaWZyYW1lIGluc3RlYWQgb2YgaWZyYW1lIGl0c2VsZlxuICAgIGlmICh3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQgJiYgc3R5bGVUYXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElGcmFtZUVsZW1lbnQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgYWNjZXNzIHRvIGlmcmFtZSBpcyBibG9ja2VkXG4gICAgICAgIC8vIGR1ZSB0byBjcm9zcy1vcmlnaW4gcmVzdHJpY3Rpb25zXG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gc3R5bGVUYXJnZXQuY29udGVudERvY3VtZW50LmhlYWQ7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgIHN0eWxlVGFyZ2V0ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gIH1cbiAgcmV0dXJuIG1lbW9bdGFyZ2V0XTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRCeVNlbGVjdG9yKGluc2VydCwgc3R5bGUpIHtcbiAgdmFyIHRhcmdldCA9IGdldFRhcmdldChpbnNlcnQpO1xuICBpZiAoIXRhcmdldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gIH1cbiAgdGFyZ2V0LmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0QnlTZWxlY3RvcjsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBpbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucykge1xuICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdHlsZVwiKTtcbiAgb3B0aW9ucy5zZXRBdHRyaWJ1dGVzKGVsZW1lbnQsIG9wdGlvbnMuYXR0cmlidXRlcyk7XG4gIG9wdGlvbnMuaW5zZXJ0KGVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG4gIHJldHVybiBlbGVtZW50O1xufVxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzKHN0eWxlRWxlbWVudCkge1xuICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09IFwidW5kZWZpbmVkXCIgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG4gIGlmIChub25jZSkge1xuICAgIHN0eWxlRWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJub25jZVwiLCBub25jZSk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKSB7XG4gIHZhciBjc3MgPSBcIlwiO1xuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQob2JqLnN1cHBvcnRzLCBcIikge1wiKTtcbiAgfVxuICBpZiAob2JqLm1lZGlhKSB7XG4gICAgY3NzICs9IFwiQG1lZGlhIFwiLmNvbmNhdChvYmoubWVkaWEsIFwiIHtcIik7XG4gIH1cbiAgdmFyIG5lZWRMYXllciA9IHR5cGVvZiBvYmoubGF5ZXIgIT09IFwidW5kZWZpbmVkXCI7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJAbGF5ZXJcIi5jb25jYXQob2JqLmxheWVyLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQob2JqLmxheWVyKSA6IFwiXCIsIFwiIHtcIik7XG4gIH1cbiAgY3NzICs9IG9iai5jc3M7XG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIHZhciBzb3VyY2VNYXAgPSBvYmouc291cmNlTWFwO1xuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH1cblxuICAvLyBGb3Igb2xkIElFXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cbiAgb3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybShjc3MsIHN0eWxlRWxlbWVudCwgb3B0aW9ucy5vcHRpb25zKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBzdHlsZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQpO1xufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIGRvbUFQSShvcHRpb25zKSB7XG4gIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoKSB7fSxcbiAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge31cbiAgICB9O1xuICB9XG4gIHZhciBzdHlsZUVsZW1lbnQgPSBvcHRpb25zLmluc2VydFN0eWxlRWxlbWVudChvcHRpb25zKTtcbiAgcmV0dXJuIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShvYmopIHtcbiAgICAgIGFwcGx5KHN0eWxlRWxlbWVudCwgb3B0aW9ucywgb2JqKTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgcmVtb3ZlU3R5bGVFbGVtZW50KHN0eWxlRWxlbWVudCk7XG4gICAgfVxuICB9O1xufVxubW9kdWxlLmV4cG9ydHMgPSBkb21BUEk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQpIHtcbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuICAgIHN0eWxlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBzdHlsZVRhZ1RyYW5zZm9ybTsiLCJpbXBvcnQgJy4vc3R5bGUuY3NzJztcbmltcG9ydCBsb2dpY3RvZG8gZnJvbSAnLi9sb2dpY3RvZG8uanMnO1xuaW1wb3J0IHsgcGxhY2VTaGlwc0RPTSB9IGZyb20gJy4vbG9naWN0b2RvLmpzJztcbmltcG9ydCB7IGZpbGxTcXVhcmVET00gfSBmcm9tICcuL2xvZ2ljdG9kby5qcyc7XG5pbXBvcnQgeyBzaGlwU3Vua0RPTSB9IGZyb20gJy4vbG9naWN0b2RvLmpzJztcbmltcG9ydCB7IHNocmlua093bkJvYXJkIH0gZnJvbSAnLi9sb2dpY3RvZG8uanMnO1xuaW1wb3J0IHsgcmVzZXRET00gfSBmcm9tICcuL2xvZ2ljdG9kby5qcyc7XG5pbXBvcnQgeyBoaWRlQ29tcEJvYXJkIH0gZnJvbSAnLi9sb2dpY3RvZG8uanMnO1xuXG5jb25zdCBwa2cgPSByZXF1aXJlKCcuLi9sb2dpYy5qcycpO1xuY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXdHYW1lQnRuXCIpO1xuXG5mdW5jdGlvbiB0b2dnbGVCdXR0b24oKSB7XG4gICAgaWYgKGJ0bi5zdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIiB8fCBidG4uc3R5bGUuZGlzcGxheSA9PT0gXCJcIikge1xuICAgICAgICBidG4uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICB9IGVsc2UgaWYgKGJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiKSB7XG4gICAgICAgIGJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzdGFydEdhbWUoKSB7XG4gICAgbG9naWN0b2RvKCk7Ly9ET00gc3R1ZmZcbiAgICAvLy0tLS0tZ2FtZSBsb29wIHN0YXJ0XG4gICAgbGV0IFAxID0gcGtnLlBsYXllcignUGxheWVyIDEnKTtcbiAgICBsZXQgUDIgPSBwa2cuUGxheWVyKCdDb21wdXRlcicpO1xuICAgIGxldCBjdXJyZW50UGxheWVyID0gbnVsbDtcbiAgICBsZXQgd2FpdGluZ1BsYXllciA9IG51bGw7XG5cbiAgICAvL2FkZCBpbiBsYXRlciAtIGNob2ljZSBvZiBQdlAgb3IgdnMgQ1BVXG4gICAgLy9uYW1lIGlucHV0IGZvciBwbGF5ZXIocylcblxuICAgIC8vZGVjaWRlIHdobyBnb2VzIGZpcnN0XG4gICAgZnVuY3Rpb24gdHVyblN3aXRjaEhpZGVCb2FyZHMocGxheWVyKSB7Ly9pbnNlcnQgY3VycmVudFBsYXllclxuICAgICAgICBsZXQgcDFTdHVmZnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInAxU2VwZXJhdG9yXCIpO1xuICAgICAgICBsZXQgcDJTdHVmZnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInAyU2VwZXJhdG9yXCIpO1xuICAgICAgICBpZiAocGxheWVyID09PSBQMSkge1xuICAgICAgICAgICAgcDFTdHVmZnMuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgICAgIHAyU3R1ZmZzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgfSBlbHNlIGlmIChwbGF5ZXIgPT09IFAyKSB7XG4gICAgICAgICAgICBwMVN0dWZmcy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICBwMlN0dWZmcy5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHBpY2tTdGFydGVyKCkge1xuICAgICAgICBsZXQgZ29GaXJzdCA9IE1hdGgucmFuZG9tKCkgPCAwLjUgPyBcIlAxXCIgOiBcIlAyXCI7XG4gICAgICAgIGlmIChnb0ZpcnN0ID09PSBcIlAxXCIpIHtcbiAgICAgICAgICAgIGN1cnJlbnRQbGF5ZXIgPSBQMTtcbiAgICAgICAgICAgIHdhaXRpbmdQbGF5ZXIgPSBQMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGN1cnJlbnRQbGF5ZXIgPSBQMjtcbiAgICAgICAgICAgIHdhaXRpbmdQbGF5ZXIgPSBQMTtcbiAgICAgICAgfVxuICAgICAgICB0dXJuU3dpdGNoSGlkZUJvYXJkcyhjdXJyZW50UGxheWVyKTtcbiAgICB9XG4gICAgXG4gICAgZnVuY3Rpb24gY2hlY2tGb3JXaW4oKSB7XG4gICAgICAgIC8vY2hlY2sgZm9yIHdpbiBmaXJzdFxuICAgICAgICBpZiAoUDEuYWxsU2hpcHNTdW5rKCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUDIgaXMgdGhlIHdpbm5lci4gV2hvbyEhXCIpO1xuICAgICAgICAgICAgdG9nZ2xlQnV0dG9uKCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChQMi5hbGxTaGlwc1N1bmsoKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJQMSBpcyB0aGUgd2lubmVyLiBXaG9vISFcIik7XG4gICAgICAgICAgICB0b2dnbGVCdXR0b24oKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHBsYXllclR1cm5Td2l0Y2goKSB7XG4gICAgICAgIC8qIC8vY2hlY2sgZm9yIHdpbiBmaXJzdFxuICAgICAgICBpZiAoUDEuYWxsU2hpcHNTdW5rKCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUDIgaXMgdGhlIHdpbm5lci4gV2hvbyEhXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKFAyLmFsbFNoaXBzU3VuaygpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlAxIGlzIHRoZSB3aW5uZXIuIFdob28hIVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSAgZWxzZSovIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UGxheWVyID09PSBQMikge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRQbGF5ZXIgPSBQMTtcbiAgICAgICAgICAgICAgICB3YWl0aW5nUGxheWVyID0gUDI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRQbGF5ZXIgPSBQMjtcbiAgICAgICAgICAgICAgICB3YWl0aW5nUGxheWVyID0gUDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0dXJuU3dpdGNoSGlkZUJvYXJkcyhjdXJyZW50UGxheWVyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL3BpY2tTdGFydGVyKCk7XG4gICAgY3VycmVudFBsYXllciA9IFAxO1xuICAgIHdhaXRpbmdQbGF5ZXIgPSBQMjtcbiAgICB0dXJuU3dpdGNoSGlkZUJvYXJkcyhjdXJyZW50UGxheWVyKTtcbiAgICBjb25zb2xlLmxvZyhcImN1cnJlbnRQbGF5ZXIgaXMgXCIsIGN1cnJlbnRQbGF5ZXIpO1xuXG4gICAgLy9zdGFydCB3aXRoIFVQIFRPIDEwIC0tIGZvdXIgMXMsIHRocmVlIDJzLCB0d28gM3MsIG9uZSA0XG4gICAgY3VycmVudFBsYXllciA9IFwicGF1c2VQbGFjZVwiO1xuICAgIHdhaXRpbmdQbGF5ZXIgPSBcInBhdXNlUGxhY2VcIjsgXG4gICAgLy90byBrZWVwIHRhcmdldCBib2FyZHMgZnJvbSBmaXJpbmdcblxuICAgIC8vY29kZSBoZXJlIHRvIHRvZ2dsZSB0aGUgXCJpbnN0cnVjdGlvbnNcIiBmb3IgcGxhY2VtZW50IG9uXG5cbiAgICBjb25zdCBheGlzVG9nZ2xlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXhpc1RvZ2dsZVwiKTtcbiAgICBheGlzVG9nZ2xlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICBpZiAoYXhpc1RvZ2dsZXIuaW5uZXJIVE1MID09PSBcInZlcnRpY2FsXCIpIHtcbiAgICAgICAgICAgIGF4aXNUb2dnbGVyLmlubmVySFRNTCA9IFwiaG9yaXpvbnRhbFwiO1xuICAgICAgICB9IGVsc2UgaWYgKGF4aXNUb2dnbGVyLmlubmVySFRNTCA9PT0gXCJob3Jpem9udGFsXCIpIHtcbiAgICAgICAgICAgIGF4aXNUb2dnbGVyLmlubmVySFRNTCA9IFwidmVydGljYWxcIjtcbiAgICAgICAgfVxuICAgIH0pXG5cbiAgICBjb25zdCBQMVNlbGZCb2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjUDFHXCIpO1xuICAgIFAxU2VsZkJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgIGxldCB0ZXN0QXJyYXkgPSBbXTtcbiAgICAgICAgbGV0IGxlbmd0aElucHV0dGVkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsZW5ndGhJbnB1dFwiKS52YWx1ZTtcbiAgICAgICAgY29uc29sZS5sb2coXCJsZW5ndGhJbnB1dHRlZCBpcyBcIiwgbGVuZ3RoSW5wdXR0ZWQpO1xuICAgICAgICBsZXQgYXhpc0lucHV0dGVkID0gYXhpc1RvZ2dsZXIuaW5uZXJIVE1MO1xuICAgICAgICBjb25zb2xlLmxvZyhcImF4aXNJbnB1dHRlZCBpcyBcIiwgYXhpc0lucHV0dGVkKTtcbiAgICAgICAgaWYgKGN1cnJlbnRQbGF5ZXIgIT09IFwicGF1c2VQbGFjZVwiICYmIHdhaXRpbmdQbGF5ZXIgIT09IFwicGF1c2VQbGFjZVwiKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAobGVuZ3RoSW5wdXR0ZWQgPCAwIHx8IGxlbmd0aElucHV0dGVkID4gNCB8fCBsZW5ndGhJbnB1dHRlZCA9PT0gXCJcIikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coUDEucGxheWVyU2hpcENvdW50KCkpO1xuICAgICAgICAgICAgaWYgKGUudGFyZ2V0LmlkID09PSBcIlAxR1wiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuY2xhc3NOYW1lLnNsaWNlKDAsNikgPT09IFwic3F1YXJlXCIgJiYgZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuaWQuc2xpY2UoMSwyKSA9PT0gXCIwXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuY2xhc3NOYW1lLnNsaWNlKDAsNikgPT09IFwic3F1YXJlXCIgJiYgZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuaWQuc2xpY2UoMCw1KSA9PT0gXCJlbXB0eVwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKFAxLnBsYXllclNoaXBDb3VudCgpIDwgMTApIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvb3JkUGlja2VkID0gZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuaWQuc2xpY2UoMCwyKTtcbiAgICAgICAgICAgICAgICAgICAgUDEucGxheWVyUGxhY2UoY29vcmRQaWNrZWQsIGxlbmd0aElucHV0dGVkLCBheGlzSW5wdXR0ZWQpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgc2hpcFNwYW5UZXN0UDEgPSBQMS5wbGF5ZXJQbGFjZVNoaXBTcGFuKGNvb3JkUGlja2VkLCBsZW5ndGhJbnB1dHRlZCwgYXhpc0lucHV0dGVkKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvcHlTcGFuID0gc2hpcFNwYW5UZXN0UDEuc2xpY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coY29weVNwYW4pO1xuICAgICAgICAgICAgICAgICAgICB0ZXN0QXJyYXkucHVzaChjb3B5U3Bhbik7XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlU2hpcHNET00oc2hpcFNwYW5UZXN0UDEsIFAxLCBQMSwgUDIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pXG5cbiAgICAvL2FkZCBpbiBsYXRlciAtIGNob29zaW5nIHdoZXJlIHRvIHBsYWNlIHNoaXBzIVxuICAgIC8vRE9NL1VJIHNlbGVjdGlvbiA+IGZpcmluZyBwbGF5ZXJQbGFjZSBjb2RlID4gc2V0dGluZyBuZXcgRE9NXG4gICAgLy9vciB0aGUgcmFuZG9tIENQVSBzaGlwIHBsYWNlbWVudCBiZWxvdyBmb3IgdnMgQ1BVXG4gICAgLy93aWxsIGFsc28gbmVlZCB0byBwdXQgY29kZSB0byBISURFIFxuICAgIC8vQ1BVIChvciBvdGhlciBwZXJzb24ncykgYm9hcmRzXG4gICAgXG4gICAgLyogUDIuY29tcHV0ZXJQbGFjZSg0KTtcbiAgICBQMi5jb21wdXRlclBsYWNlKDMpO1xuICAgIFAyLmNvbXB1dGVyUGxhY2UoMik7XG4gICAgUDIuY29tcHV0ZXJQbGFjZSgxKTsgKi8gLy9yYW5kb21seSBwbGFjZXMgZm9yIGNvbXB1dGVyXG5cbiAgICBQMS5wbGF5ZXJQbGFjZSgnQTInLCAzLCAndmVydGljYWwnKTtcbiAgICBQMS5wbGF5ZXJQbGFjZSgnRDInLCAyLCAnaG9yaXpvbnRhbCcpO1xuICAgIFAxLnBsYXllclBsYWNlKCdINCcsIDEsICd2ZXJ0aWNhbCcpO1xuICAgIFAxLnBsYXllclBsYWNlKCdKMScsIDQsICd2ZXJ0aWNhbCcpO1xuICAgIGxldCBzaGlwU3BhbjFQMSA9IFAxLnBsYXllclBsYWNlU2hpcFNwYW4oJ0EyJywgMywgJ3ZlcnRpY2FsJyk7XG4gICAgbGV0IHNoaXBTcGFuMlAxID0gUDEucGxheWVyUGxhY2VTaGlwU3BhbignRDInLCAyLCAnaG9yaXpvbnRhbCcpO1xuICAgIGxldCBzaGlwU3BhbjNQMSA9IFAxLnBsYXllclBsYWNlU2hpcFNwYW4oJ0g0JywgMSwgJ3ZlcnRpY2FsJyk7XG4gICAgbGV0IHNoaXBTcGFuNFAxID0gUDEucGxheWVyUGxhY2VTaGlwU3BhbignSjEnLCA0LCAndmVydGljYWwnKTtcblxuICAgIGxldCBjb3B5U3BhbjFQMSA9IHNoaXBTcGFuMVAxLnNsaWNlKCk7XG4gICAgbGV0IGNvcHlTcGFuMlAxID0gc2hpcFNwYW4yUDEuc2xpY2UoKTtcbiAgICBsZXQgY29weVNwYW4zUDEgPSBzaGlwU3BhbjNQMS5zbGljZSgpO1xuICAgIGxldCBjb3B5U3BhbjRQMSA9IHNoaXBTcGFuNFAxLnNsaWNlKCk7XG4gICAgbGV0IGFsbENvcHlTcGFuc1AxID0gW107XG4gICAgYWxsQ29weVNwYW5zUDEucHVzaChjb3B5U3BhbjFQMSk7XG4gICAgYWxsQ29weVNwYW5zUDEucHVzaChjb3B5U3BhbjJQMSk7XG4gICAgYWxsQ29weVNwYW5zUDEucHVzaChjb3B5U3BhbjNQMSk7XG4gICAgYWxsQ29weVNwYW5zUDEucHVzaChjb3B5U3BhbjRQMSk7XG5cbiAgICBQMi5wbGF5ZXJQbGFjZSgnQTInLCAzLCAndmVydGljYWwnKTtcbiAgICBQMi5wbGF5ZXJQbGFjZSgnRDInLCAyLCAnaG9yaXpvbnRhbCcpO1xuICAgIFAyLnBsYXllclBsYWNlKCdINCcsIDEsICd2ZXJ0aWNhbCcpO1xuICAgIFAyLnBsYXllclBsYWNlKCdKMScsIDQsICd2ZXJ0aWNhbCcpO1xuICAgIGxldCBzaGlwU3BhbjFQMiA9IFAyLnBsYXllclBsYWNlU2hpcFNwYW4oJ0EyJywgMywgJ3ZlcnRpY2FsJyk7XG4gICAgbGV0IHNoaXBTcGFuMlAyID0gUDIucGxheWVyUGxhY2VTaGlwU3BhbignRDInLCAyLCAnaG9yaXpvbnRhbCcpO1xuICAgIGxldCBzaGlwU3BhbjNQMiA9IFAyLnBsYXllclBsYWNlU2hpcFNwYW4oJ0g0JywgMSwgJ3ZlcnRpY2FsJyk7XG4gICAgbGV0IHNoaXBTcGFuNFAyID0gUDIucGxheWVyUGxhY2VTaGlwU3BhbignSjEnLCA0LCAndmVydGljYWwnKTtcbiAgICAvL3Rlc3RpbmcgdXNpbmcgdGhlc2Ugc3BhbnMgdG8gZmluZCBpZiBhIHNoaXAncyBjb29yZGluYXRlcyBcbiAgICAvL2FyZSB3aXRoaW4gaXQsIGFuZCB0aGVuIHVzaW5nIHRoYXQgdG8gXCJibG9ja1wiIG91dCBhIHN1bmsgc2hpcFxuICAgIC8vb24gdGhlIERPTVxuICAgIGxldCBjb3B5U3BhbjFQMiA9IHNoaXBTcGFuMVAyLnNsaWNlKCk7XG4gICAgbGV0IGNvcHlTcGFuMlAyID0gc2hpcFNwYW4yUDIuc2xpY2UoKTtcbiAgICBsZXQgY29weVNwYW4zUDIgPSBzaGlwU3BhbjNQMi5zbGljZSgpO1xuICAgIGxldCBjb3B5U3BhbjRQMiA9IHNoaXBTcGFuNFAyLnNsaWNlKCk7XG4gICAgbGV0IGFsbENvcHlTcGFuc1AyID0gW107XG4gICAgYWxsQ29weVNwYW5zUDIucHVzaChjb3B5U3BhbjFQMik7XG4gICAgYWxsQ29weVNwYW5zUDIucHVzaChjb3B5U3BhbjJQMik7XG4gICAgYWxsQ29weVNwYW5zUDIucHVzaChjb3B5U3BhbjNQMik7XG4gICAgYWxsQ29weVNwYW5zUDIucHVzaChjb3B5U3BhbjRQMik7XG5cbiAgICBwbGFjZVNoaXBzRE9NKHNoaXBTcGFuMVAxLCBjdXJyZW50UGxheWVyLCBQMSwgUDIpO1xuICAgIHBsYWNlU2hpcHNET00oc2hpcFNwYW4yUDEsIGN1cnJlbnRQbGF5ZXIsIFAxLCBQMik7XG4gICAgcGxhY2VTaGlwc0RPTShzaGlwU3BhbjNQMSwgY3VycmVudFBsYXllciwgUDEsIFAyKTtcbiAgICBwbGFjZVNoaXBzRE9NKHNoaXBTcGFuNFAxLCBjdXJyZW50UGxheWVyLCBQMSwgUDIpO1xuXG4gICAgcGxhY2VTaGlwc0RPTShzaGlwU3BhbjFQMiwgd2FpdGluZ1BsYXllciwgUDEsIFAyKTtcbiAgICBwbGFjZVNoaXBzRE9NKHNoaXBTcGFuMlAyLCB3YWl0aW5nUGxheWVyLCBQMSwgUDIpO1xuICAgIHBsYWNlU2hpcHNET00oc2hpcFNwYW4zUDIsIHdhaXRpbmdQbGF5ZXIsIFAxLCBQMik7XG4gICAgcGxhY2VTaGlwc0RPTShzaGlwU3BhbjRQMiwgd2FpdGluZ1BsYXllciwgUDEsIFAyKTtcblxuICAgIC8vYWZ0ZXIgc2hpcHMgcGxhY2VkLCBzaHJpbmsgZ2FtZWJvYXJkIHNvIGl0J3MgbGVzcyBpbiB0aGUgd2F5XG4gICAgLyogc2hyaW5rT3duQm9hcmQoY3VycmVudFBsYXllciwgUDEsIFAyKTtcbiAgICBzaHJpbmtPd25Cb2FyZCh3YWl0aW5nUGxheWVyLCBQMSwgUDIpOyAqL1xuXG5cbiAgICBmdW5jdGlvbiBzcGlubmVyT24oKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGVyXCIpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNwaW5uZXJPZmYoKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGVyXCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9XG4gICAgLy9QMSAobWUpIGZpcnN0LCBuZWVkIGFkZEV2ZW50TGlzdGVuZXIgZm9yIG15IFxuICAgIC8vZW5lbXkgYm9hcmRcbiAgICAvL29uZSBjbGljayB3aWxsIGhhdmUgdG8gZ2V0IHRoZSBmaXJzdCB0d28gY2hhciBvZiBzcSBJRFxuICAgIC8vYW5kIGRvIGZ1bmN0aW9uIChleDogUDEuZGlkQXRrTWlzcygnQTInLCBQMi5nZXRBdHRhY2tlZCkpXG4gICAgY29uc3QgUDFFbmVteUJvYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNQMVRcIik7XG4gICAgUDFFbmVteUJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgIGlmIChjdXJyZW50UGxheWVyICE9PSBQMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGUudGFyZ2V0LmlkID09PSBcIlAxVFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuY2xhc3NOYW1lLnNsaWNlKDAsNikgPT09IFwic3F1YXJlXCIgJiYgZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuaWQuc2xpY2UoMSwyKSA9PT0gXCIwXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuY2xhc3NOYW1lLnNsaWNlKDAsNikgPT09IFwic3F1YXJlXCIgJiYgZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuaWQuc2xpY2UoMCw1KSA9PT0gXCJlbXB0eVwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IGNvb3JkUGlja2VkID0gZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuaWQuc2xpY2UoMCwyKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImNvb3JkUGlja2VkIHdhcyBcIiwgY29vcmRQaWNrZWQpO1xuICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSBQMS5kaWRBdGtNaXNzKGNvb3JkUGlja2VkLCBQMi5nZXRBdHRhY2tlZCk7XG4gICAgICAgICAgICAgICAgbGV0IGRpZElTaW5rQVNoaXAgPSBQMi5nZXRTaGlwRm9yT3BwKGNvb3JkUGlja2VkKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9PSBmYWxzZSkge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vZXhjbHVkZXMgZmFsc2Ugd2hlbiBjb29yZCBpcyBhbHJlYWR5IGhpdC9taXNzZWRcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNxSG9sZGVyQ29vcmQgPSByZXN1bHQuc2xpY2UoNSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBoaXRNaXNzID0gcmVzdWx0LnNsaWNlKDAsNCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic3FIb2xkZXJDb29yZDogXCIsIHNxSG9sZGVyQ29vcmQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImhpdE1pc3M6IFwiLCBoaXRNaXNzKTtcbiAgICAgICAgICAgICAgICAgICAgZmlsbFNxdWFyZURPTShzcUhvbGRlckNvb3JkLCBoaXRNaXNzLCBjdXJyZW50UGxheWVyLCBQMSwgUDIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGlkSVNpbmtBU2hpcCAhPT0gXCJcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGlkSVNpbmtBU2hpcC5nZXRIaXRzKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGlkSVNpbmtBU2hpcC5pc1N1bmsoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLy0tLS0tLS0tLS0tLW1ha2UgdGhpcyBzbyBpdCdsbCBkaXNwbGF5XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3RoYXQgYSBzaGlwIGhhcyBTVU5LIFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpZElTaW5rQVNoaXAuaXNTdW5rKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYXJyYXlPZkRPTSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsbENvcHlTcGFuc1AyLmZvckVhY2goYXJyYXkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYXJyTGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBrID0gMDsgayA8IGFyckxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJyYXlba10uaW5jbHVkZXMoYCR7Y29vcmRQaWNrZWR9YCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJheU9mRE9NID0gYXJyYXk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhhcnJheU9mRE9NKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJheU9mRE9NLmZvckVhY2goZXogPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgYXJyU3RyaW5nID0gZXpbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNoaXBTdW5rRE9NKGFyclN0cmluZywgY3VycmVudFBsYXllciwgUDEsIFAyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUDEgbXlIaXRzOiBcIiwgUDEubXlIaXRzKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJQMSBteU1pc3NlczogXCIsIFAxLm15TWlzc2VzKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vcGxheWVyVHVyblN3aXRjaCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2hlY2tGb3JXaW4oKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQocGxheWVyVHVyblN3aXRjaCwgNTAwKTsvL2dpdmUgaXQgdGltZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBoaWRlQ29tcEJvYXJkKCk7Ly9oaWRlIENQVSdzIHBsYWNlbWVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy9zZXRUaW1lb3V0KGNvbXB1dGVyVHVybiwgMjQwMCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWZ0ZXIgMTAwMG1zLCBjYWxsIHRoZSBgc2V0VGltZW91dGAgY2FsbGJhY2tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJbiB0aGUgbWVhbnRpbWUsIGNvbnRpbnVlIGV4ZWN1dGluZyBjb2RlIGJlbG93XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcHV0ZXJUdXJuKCkgLy9ydW5zIHNlY29uZCBhZnRlciAxMTAwbXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LDIyMDApXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcGlubmVyT24oKSAvL3J1bnMgZmlyc3QsIGFmdGVyIDEwMDBtc1xuICAgICAgICAgICAgICAgICAgICAgICAgfSw1MDApXG4gICAgICAgICAgICAgICAgICAgIH0vL2NvbXB1dGVyIFwidGhpbmtpbmdcIlxuICAgICAgICAgICAgICAgICAgICAvL2NvbXB1dGVyVHVybigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pXG4gICAgXG4gICAgY29uc3QgUDJFbmVteUJvYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNQMlRcIik7XG4gICAgUDJFbmVteUJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgIGlmIChjdXJyZW50UGxheWVyICE9PSBQMikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGUudGFyZ2V0LmlkID09PSBcIlAyVFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuY2xhc3NOYW1lLnNsaWNlKDAsNikgPT09IFwic3F1YXJlXCIgJiYgZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuaWQuc2xpY2UoMSwyKSA9PT0gXCIwXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuY2xhc3NOYW1lLnNsaWNlKDAsNikgPT09IFwic3F1YXJlXCIgJiYgZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuaWQuc2xpY2UoMCw1KSA9PT0gXCJlbXB0eVwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IGNvb3JkUGlja2VkID0gZS50YXJnZXQuY2xvc2VzdChcIi5zcXVhcmVcIikuaWQuc2xpY2UoMCwyKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImNvb3JkUGlja2VkIHdhcyBcIiwgY29vcmRQaWNrZWQpO1xuICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSBQMi5kaWRBdGtNaXNzKGNvb3JkUGlja2VkLCBQMS5nZXRBdHRhY2tlZCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9leGNsdWRlcyBmYWxzZSB3aGVuIGNvb3JkIGlzIGFscmVhZHkgaGl0L21pc3NlZFxuICAgICAgICAgICAgICAgICAgICBsZXQgc3FIb2xkZXJDb29yZCA9IHJlc3VsdC5zbGljZSg1KTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGhpdE1pc3MgPSByZXN1bHQuc2xpY2UoMCw0KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJzcUhvbGRlckNvb3JkOiBcIiwgc3FIb2xkZXJDb29yZCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaGl0TWlzczogXCIsIGhpdE1pc3MpO1xuICAgICAgICAgICAgICAgICAgICBmaWxsU3F1YXJlRE9NKHNxSG9sZGVyQ29vcmQsIGhpdE1pc3MsIGN1cnJlbnRQbGF5ZXIsIFAxLCBQMik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUDIgbXlIaXRzOiBcIiwgUDIubXlIaXRzKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJQMiBteU1pc3NlczogXCIsIFAyLm15TWlzc2VzKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoZWNrRm9yV2luKCkgPT09IGZhbHNlKSB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChwbGF5ZXJUdXJuU3dpdGNoLCAxNTAwKTsvL2dpdmUgaXQgdGltZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vcGxheWVyVHVyblN3aXRjaCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pXG5cbiAgICBmdW5jdGlvbiBjb21wdXRlclR1cm4oKSB7XG4gICAgICAgIC8vY3VycmVudCBwbGF5ZXIganVzdCBzd2l0Y2hlZCB0byBQMiwgYWthIENvbXB1dGVyXG4gICAgICAgIGxldCByZXN1bHQgPSBQMi5kaWRBdGtNaXNzKFAyLnJhbmRvbUF0a0Nob2ljZSgpLCBQMS5nZXRBdHRhY2tlZCk7XG4gICAgICAgIGxldCBzcUhvbGRlckNvb3JkID0gcmVzdWx0LnNsaWNlKDUpO1xuICAgICAgICBsZXQgaGl0TWlzcyA9IHJlc3VsdC5zbGljZSgwLDQpO1xuXG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyhcInJlc3VsdDogXCIsIHJlc3VsdCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3FIb2xkZXJDb29yZDogXCIsIHNxSG9sZGVyQ29vcmQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcImhpdE1pc3M6IFwiLCBoaXRNaXNzKTtcbiAgICAgICAgZmlsbFNxdWFyZURPTShzcUhvbGRlckNvb3JkLCBoaXRNaXNzLCBjdXJyZW50UGxheWVyLCBQMSwgUDIpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIlAyIG15SGl0czogXCIsIFAyLm15SGl0cyk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiUDIgbXlNaXNzZXM6IFwiLCBQMi5teU1pc3Nlcyk7XG4gICAgICAgIGlmIChjaGVja0ZvcldpbigpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgc2V0VGltZW91dChwbGF5ZXJUdXJuU3dpdGNoLCAxNTAwKTsvL2dpdmUgaXQgdGltZVxuICAgICAgICB9XG4gICAgICAgIHNwaW5uZXJPZmYoKTtcbiAgICB9XG5cbiAgICAvKiBQMS5kaWRBdGtNaXNzKCdBMicsIFAyLmdldEF0dGFja2VkKTtcbiAgICBQMi5kaWRBdGtNaXNzKFAyLnJhbmRvbUF0a0Nob2ljZSgpLCBQMS5nZXRBdHRhY2tlZCk7XG4gICAgY29uc29sZS5sb2coUDEucGxheWVyQm9hcmQpO1xuICAgIGNvbnNvbGUubG9nKFAyLnBsYXllckJvYXJkKTtcbiAgICBjb25zb2xlLmxvZyhQMS5teUhpdHMpO1xuICAgIGNvbnNvbGUubG9nKFAyLm15SGl0cyk7XG4gICAgY29uc29sZS5sb2coUDIubXlNaXNzZXMpOyAqL1xufVxuXG5cbmJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgIHRvZ2dsZUJ1dHRvbigpO1xuICAgIHJlc2V0RE9NKCk7XG4gICAgc3RhcnRHYW1lKCk7XG4gICAgXG59KVxuXG5zdGFydEdhbWUoKTtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGxvZ2ljdG9kbygpIHtcblxuICAgIGxldCBnYW1lYm9hcmRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImdhbWVib2FyZFwiKTtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGdhbWVib2FyZHMsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIGxldCBsZXR0ZXJOdW1iQXJyID0gWydlbXB0eScsJ0EnLCdCJywnQycsJ0QnLCdFJywnRicsJ0cnLCdIJywnSScsJ0onXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMTsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDExOyBqKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgbmV3U3EgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgICAgIG5ld1NxLmNsYXNzTmFtZSA9IGBzcXVhcmVgO1xuICAgICAgICAgICAgICAgIGxldCBzb21lQ29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgc29tZUNvbnRlbnQuY2xhc3NOYW1lID0gXCJjb250ZW50elwiO1xuICAgICAgICAgICAgICAgIGlmIChqID09PSAwICYmIGkgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc29tZUNvbnRlbnQuaW5uZXJIVE1MID0gYCR7aX1gO1xuICAgICAgICAgICAgICAgIH0gXG4gICAgICAgICAgICAgICAgaWYgKGkgPT09IDAgJiYgaiAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBzb21lQ29udGVudC5pbm5lckhUTUwgPSBgJHtsZXR0ZXJOdW1iQXJyW2pdfWBcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV3U3EuYXBwZW5kQ2hpbGQoc29tZUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIGVsLmFwcGVuZENoaWxkKG5ld1NxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGV0IGZpcnN0U2VjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDFHXCIpO1xuICAgIGxldCBzZXRTcXVhcmVzID0gZmlyc3RTZWN0aW9uLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJzcXVhcmVcIik7XG4gICAgbGV0IHNldFNxQXJyYXkgPSBBcnJheS5mcm9tKHNldFNxdWFyZXMpOy8vY29udmVydCB0byBhcnJheVxuXG4gICAgbGV0IHNlY29uZFNlY3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAxVFwiKTtcbiAgICBsZXQgc2V0U2Vjb25kU3F1YXJlcyA9IHNlY29uZFNlY3Rpb24uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInNxdWFyZVwiKTtcbiAgICBsZXQgc2V0U2Vjb25kU3FBcnJheSA9IEFycmF5LmZyb20oc2V0U2Vjb25kU3F1YXJlcyk7Ly9jb252ZXJ0IHRvIGFycmF5XG5cbiAgICBsZXQgdGhpcmRTZWN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMkdcIik7XG4gICAgbGV0IHNldFRoaXJkU3F1YXJlcyA9IHRoaXJkU2VjdGlvbi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic3F1YXJlXCIpO1xuICAgIGxldCBzZXRUaGlyZFNxQXJyYXkgPSBBcnJheS5mcm9tKHNldFRoaXJkU3F1YXJlcyk7Ly9jb252ZXJ0IHRvIGFycmF5XG5cbiAgICBsZXQgZm91cnRoU2VjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDJUXCIpO1xuICAgIGxldCBzZXRGb3VydGhTcXVhcmVzID0gZm91cnRoU2VjdGlvbi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic3F1YXJlXCIpO1xuICAgIGxldCBzZXRGb3VydGhTcUFycmF5ID0gQXJyYXkuZnJvbShzZXRGb3VydGhTcXVhcmVzKTsvL2NvbnZlcnQgdG8gYXJyYXlcblxuICAgIGZ1bmN0aW9uIHNldENvbHVtbnMoc29tZUFycmF5LCBuYW1lKSB7XG5cbiAgICAgICAgbGV0IGxldHRlck51bWJBcnIgPSBbJ2VtcHR5JywnQScsJ0InLCdDJywnRCcsJ0UnLCdGJywnRycsJ0gnLCdJJywnSiddO1xuICAgICAgICBsZXQgajAgPSAwO1xuICAgICAgICBsZXQgajEgPSAwO1xuICAgICAgICBsZXQgajIgPSAwO1xuICAgICAgICBsZXQgajMgPSAwO1xuICAgICAgICBsZXQgajQgPSAwO1xuICAgICAgICBsZXQgajUgPSAwO1xuICAgICAgICBsZXQgajYgPSAwO1xuICAgICAgICBsZXQgajcgPSAwO1xuICAgICAgICBsZXQgajggPSAwO1xuICAgICAgICBsZXQgajkgPSAwO1xuICAgICAgICBsZXQgajEwID0gMDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzb21lQXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpJTExID09PSAwKSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzBdfWA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFyclswXX0ke1tqMF19X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgajArKztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5jbGFzc05hbWUgPSBgc3F1YXJlICR7bGV0dGVyTnVtYkFyclsxXX1gO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFyclsxXX0ke1tqMV19X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGoxKys7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGklMTEgPT09IDIpIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbMl19YDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLnNldEF0dHJpYnV0ZShcImlkXCIsIGAke2xldHRlck51bWJBcnJbMl19JHtbajJdfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqMisrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmIChpJTExID09PSAzKSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzNdfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzNdfSR7W2ozXX1fYCtuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgajMrKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gNCkge1xuICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5jbGFzc05hbWUgPSBgc3F1YXJlICR7bGV0dGVyTnVtYkFycls0XX1gO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFycls0XX0ke1tqNF19X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGo0Kys7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGklMTEgPT09IDUpIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbNV19YDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLnNldEF0dHJpYnV0ZShcImlkXCIsIGAke2xldHRlck51bWJBcnJbNV19JHtbajVdfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqNSsrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmIChpJTExID09PSA2KSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzZdfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzZdfSR7W2o2XX1fYCtuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgajYrKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gNykge1xuICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5jbGFzc05hbWUgPSBgc3F1YXJlICR7bGV0dGVyTnVtYkFycls3XX1gO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFycls3XX0ke1tqN119X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGo3Kys7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGklMTEgPT09IDgpIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbOF19YDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLnNldEF0dHJpYnV0ZShcImlkXCIsIGAke2xldHRlck51bWJBcnJbOF19JHtbajhdfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqOCsrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmIChpJTExID09PSA5KSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzldfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzldfSR7W2o5XX1fYCtuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgajkrKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gMTApIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbMTBdfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzEwXX0ke1tqMTBdfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqMTArKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRDb2x1bW5zKHNldFNxQXJyYXksIFwiZmlyc3RPbmVcIik7XG4gICAgc2V0Q29sdW1ucyhzZXRTZWNvbmRTcUFycmF5LCBcInNlY29uZE9uZVwiKTtcbiAgICBzZXRDb2x1bW5zKHNldFRoaXJkU3FBcnJheSwgXCJ0aGlyZE9uZVwiKTtcbiAgICBzZXRDb2x1bW5zKHNldEZvdXJ0aFNxQXJyYXksIFwiZm91cnRoT25lXCIpO1xuXG4gICAgXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwbGFjZVNoaXBzRE9NKGFycmF5LCBwbGF5ZXIsIFAxLCBQMikgey8vYXJyYXkgZnJvbSBwbGF5ZXJQbGFjZVNoaXBTcGFuXG4gICAgaWYgKHBsYXllciA9PT0gUDEpIHtcbiAgICAgICAgYXJyYXkuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBsZXQgc3RyID0gZWxbMF07XG4gICAgICAgICAgICBsZXQgc3BlY2lmaWNTcUZvdW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7c3RyfV9maXJzdE9uZWApO1xuICAgICAgICAgICAgc3BlY2lmaWNTcUZvdW5kLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiYmx1ZVwiO1xuICAgICAgICB9KVxuICAgIH0gZWxzZSBpZiAocGxheWVyID09PSBQMikge1xuICAgICAgICBhcnJheS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGxldCBzdHIgPSBlbFswXTtcbiAgICAgICAgICAgIGxldCBzcGVjaWZpY1NxRm91bmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtzdHJ9X3RoaXJkT25lYCk7XG4gICAgICAgICAgICBzcGVjaWZpY1NxRm91bmQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJncmVlblwiO1xuICAgICAgICB9KVxuICAgIH1cbiAgICBcbn0gIFxuXG5leHBvcnQgZnVuY3Rpb24gZmlsbFNxdWFyZURPTShzdHIsIGhpdE9yTWlzcywgcGxheWVyLCBQMSwgUDIpIHsvL2lucHV0IHN0cmluZyBvZiBjb29yZFxuICAgIGlmIChwbGF5ZXIgPT09IFAxKSB7XG4gICAgICAgIGxldCBzcVRvQ2hhbmdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7c3RyfV9zZWNvbmRPbmVgKTtcbiAgICAgICAgaWYgKGhpdE9yTWlzcyA9PT0gXCJtaXNzXCIpIHtcbiAgICAgICAgICAgIHNxVG9DaGFuZ2Uuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJ3aGl0ZVwiO1xuICAgICAgICB9IGVsc2UgaWYgKGhpdE9yTWlzcyA9PT0gXCJoaXRzXCIpIHtcbiAgICAgICAgICAgIHNxVG9DaGFuZ2Uuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJkYXJrb3JhbmdlXCI7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHBsYXllciA9PT0gUDIpIHtcbiAgICAgICAgbGV0IHNxVG9DaGFuZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtzdHJ9X2ZvdXJ0aE9uZWApO1xuICAgICAgICBpZiAoaGl0T3JNaXNzID09PSBcIm1pc3NcIikge1xuICAgICAgICAgICAgc3FUb0NoYW5nZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIndoaXRlXCI7XG4gICAgICAgIH0gZWxzZSBpZiAoaGl0T3JNaXNzID09PSBcImhpdHNcIikge1xuICAgICAgICAgICAgc3FUb0NoYW5nZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcImRhcmtvcmFuZ2VcIjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNoaXBTdW5rRE9NKHN0ciwgcGxheWVyLCBQMSwgUDIpIHsvL2lucHV0IHN0cmluZyBjb29yZFxuICAgIGlmIChwbGF5ZXIgPT09IFAxKSB7IFxuICAgICAgICBsZXQgc3FUb1NpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtzdHJ9X3NlY29uZE9uZWApO1xuICAgICAgICBzcVRvU2luay5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcImJsYWNrXCI7XG4gICAgfSBlbHNlIGlmIChwbGF5ZXIgPT09IFAyKSB7XG5cbiAgICAgICAgbGV0IHNxVG9TaW5rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7c3RyfV9mb3VydGhPbmVgKTtcbiAgICAgICAgc3FUb1Npbmsuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJibGFja1wiO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNocmlua093bkJvYXJkKHBsYXllciwgUDEsIFAyKSB7XG4gICAgaWYgKHBsYXllciA9PT0gUDEpIHtcbiAgICAgICAgbGV0IGJvYXJkVG9TaHJpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAxR1wiKTtcbiAgICAgICAgYm9hcmRUb1Nocmluay5zdHlsZS53aWR0aCA9IFwiNjAlXCI7XG4gICAgfSBlbHNlIGlmIChwbGF5ZXIgPT09IFAyKSB7XG4gICAgICAgIGxldCBib2FyZFRvU2hyaW5rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMkdcIik7XG4gICAgICAgIGJvYXJkVG9TaHJpbmsuc3R5bGUud2lkdGggPSBcIjYwJVwiO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhpZGVDb21wQm9hcmQoKSB7XG5cbiAgICBmdW5jdGlvbiByYW5kb21Db2xvcihicmlnaHRuZXNzKXtcbiAgICAgICAgZnVuY3Rpb24gcmFuZG9tQ2hhbm5lbChicmlnaHRuZXNzKXtcbiAgICAgICAgICB2YXIgciA9IDI1NS1icmlnaHRuZXNzO1xuICAgICAgICAgIHZhciBuID0gMHwoKE1hdGgucmFuZG9tKCkgKiByKSArIGJyaWdodG5lc3MpO1xuICAgICAgICAgIHZhciBzID0gbi50b1N0cmluZygxNik7XG4gICAgICAgICAgcmV0dXJuIChzLmxlbmd0aD09MSkgPyAnMCcrcyA6IHM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcjJyArIHJhbmRvbUNoYW5uZWwoYnJpZ2h0bmVzcykgKyByYW5kb21DaGFubmVsKGJyaWdodG5lc3MpICsgcmFuZG9tQ2hhbm5lbChicmlnaHRuZXNzKTtcbiAgICB9XG5cbiAgICBsZXQgY29tcEdhbWVCb2FyZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDJHXCIpO1xuICAgIGxldCBjaGlsZE5vZGVzID0gY29tcEdhbWVCb2FyZC5jaGlsZE5vZGVzO1xuICAgIGxldCBhcnJheSA9IEFycmF5LmZyb20oY2hpbGROb2Rlcyk7XG4gICAgYXJyYXkuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgbGV0IG5ld0NvbG9yID0gcmFuZG9tQ29sb3IoMTI1KTtcbiAgICAgICAgbm9kZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBgJHtuZXdDb2xvcn1gO1xuICAgIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldERPTSgpIHtcbiAgICBsZXQgZmlyc3ROb2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMUdcIik7XG4gICAgbGV0IHNlY29uZE5vZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAxVFwiKTtcbiAgICBsZXQgdGhpcmROb2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMkdcIik7XG4gICAgbGV0IGZvdXJ0aE5vZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAyVFwiKTtcbiAgICB3aGlsZSAoZmlyc3ROb2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgZmlyc3ROb2RlLnJlbW92ZUNoaWxkKGZpcnN0Tm9kZS5sYXN0Q2hpbGQpO1xuICAgIH1cbiAgICB3aGlsZSAoc2Vjb25kTm9kZS5maXJzdENoaWxkKSB7XG4gICAgICAgIHNlY29uZE5vZGUucmVtb3ZlQ2hpbGQoc2Vjb25kTm9kZS5sYXN0Q2hpbGQpO1xuICAgIH1cbiAgICB3aGlsZSAodGhpcmROb2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgdGhpcmROb2RlLnJlbW92ZUNoaWxkKHRoaXJkTm9kZS5sYXN0Q2hpbGQpO1xuICAgIH1cbiAgICB3aGlsZSAoZm91cnRoTm9kZS5maXJzdENoaWxkKSB7XG4gICAgICAgIGZvdXJ0aE5vZGUucmVtb3ZlQ2hpbGQoZm91cnRoTm9kZS5sYXN0Q2hpbGQpO1xuICAgIH1cbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==