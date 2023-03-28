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
        board,missedShots,shotsHit,
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
        getAttacked, didAtkMiss, playerPlace, computerPlace, randomAtkChoice, shipsUp, allShipsSunk, playerPlaceShipSpan, getShipForOpp,
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
___CSS_LOADER_EXPORT___.push([module.id, "html, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed, \nfigure, figcaption, footer, header, hgroup, \nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\tfont-size: 100%;\n\tfont: inherit;\n\tvertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure, \nfooter, header, hgroup, menu, nav, section {\n\tdisplay: block;\n}\nbody {\n\tline-height: 1;\n}\nol, ul {\n\tlist-style: none;\n}\nblockquote, q {\n\tquotes: none;\n}\nblockquote:before, blockquote:after,\nq:before, q:after {\n\tcontent: '';\n\tcontent: none;\n}\ntable {\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}\n\n:root {\n    --primary: #fc3f97; \n    --secondary: #c3195d; \n    --tertiary: #680747; \n    --quaternary: #141010; \n}\n\nhtml, body, div#content {\n    height: 100%;\n    width: 100%;\n    font-size: 16px;\n}\n\n.descriptor {\n\tfont-size: 1.2rem;\n\tmargin: 0.5rem;\n}\n\ndiv#p1Seperator {\n\tbackground-color: var(--primary);\n}\ndiv#p2Seperator {\n\tbackground-color:aqua;\n}\n\ndiv.gameboard {\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\tborder: 3px solid pink;\n}\n\ndiv[class^=\"square\"] {\n\tposition: relative;\n\tflex-basis: calc(9% - 10px);\n\tmargin: 5px;\n\tborder: 1px solid;\n\tbox-sizing: border-box;\n}\n\ndiv[class^=\"square\"]::before {\n\tcontent: '';\n\tdisplay: block;\n\tpadding-top: 100%;\n}\n\ndiv[class^=\"square\"] .contentz {\n\tposition: absolute;\n\ttop: 0; left: 0;\n\theight: 100%;\n\twidth: 100%;\n  \n\tdisplay: flex;               /* added for centered text */\n\tjustify-content: center;     /* added for centered text */\n\talign-items: center;         /* added for centered text */\n}\n\n/* \ndiv#content {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(2, 40%);\n\tgrid-template-rows: repeat(2, 40%);\n}\n\ndiv.gameboard {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(11, 8%);\n\tgrid-template-rows: repeat(11, 8%);\n}\n\ndiv[class^=\"square\"] {\n\tbackground-color: rgb(184, 184, 184);\n\tborder: 1px solid black;\n\topacity: 0.5;\n\taspect-ratio: 1;\n} */", "",{"version":3,"sources":["webpack://./src/style.css"],"names":[],"mappings":"AAAA;;;;;;;;;;;;;CAaC,SAAS;CACT,UAAU;CACV,SAAS;CACT,eAAe;CACf,aAAa;CACb,wBAAwB;AACzB;AACA,gDAAgD;AAChD;;CAEC,cAAc;AACf;AACA;CACC,cAAc;AACf;AACA;CACC,gBAAgB;AACjB;AACA;CACC,YAAY;AACb;AACA;;CAEC,WAAW;CACX,aAAa;AACd;AACA;CACC,yBAAyB;CACzB,iBAAiB;AAClB;;AAEA;IACI,kBAAkB;IAClB,oBAAoB;IACpB,mBAAmB;IACnB,qBAAqB;AACzB;;AAEA;IACI,YAAY;IACZ,WAAW;IACX,eAAe;AACnB;;AAEA;CACC,iBAAiB;CACjB,cAAc;AACf;;AAEA;CACC,gCAAgC;AACjC;AACA;CACC,qBAAqB;AACtB;;AAEA;CACC,aAAa;CACb,eAAe;CACf,sBAAsB;AACvB;;AAEA;CACC,kBAAkB;CAClB,2BAA2B;CAC3B,WAAW;CACX,iBAAiB;CACjB,sBAAsB;AACvB;;AAEA;CACC,WAAW;CACX,cAAc;CACd,iBAAiB;AAClB;;AAEA;CACC,kBAAkB;CAClB,MAAM,EAAE,OAAO;CACf,YAAY;CACZ,WAAW;;CAEX,aAAa,gBAAgB,4BAA4B;CACzD,uBAAuB,MAAM,4BAA4B;CACzD,mBAAmB,UAAU,4BAA4B;AAC1D;;AAEA;;;;;;;;;;;;;;;;;;GAkBG","sourcesContent":["html, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed, \nfigure, figcaption, footer, header, hgroup, \nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\tfont-size: 100%;\n\tfont: inherit;\n\tvertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure, \nfooter, header, hgroup, menu, nav, section {\n\tdisplay: block;\n}\nbody {\n\tline-height: 1;\n}\nol, ul {\n\tlist-style: none;\n}\nblockquote, q {\n\tquotes: none;\n}\nblockquote:before, blockquote:after,\nq:before, q:after {\n\tcontent: '';\n\tcontent: none;\n}\ntable {\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}\n\n:root {\n    --primary: #fc3f97; \n    --secondary: #c3195d; \n    --tertiary: #680747; \n    --quaternary: #141010; \n}\n\nhtml, body, div#content {\n    height: 100%;\n    width: 100%;\n    font-size: 16px;\n}\n\n.descriptor {\n\tfont-size: 1.2rem;\n\tmargin: 0.5rem;\n}\n\ndiv#p1Seperator {\n\tbackground-color: var(--primary);\n}\ndiv#p2Seperator {\n\tbackground-color:aqua;\n}\n\ndiv.gameboard {\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\tborder: 3px solid pink;\n}\n\ndiv[class^=\"square\"] {\n\tposition: relative;\n\tflex-basis: calc(9% - 10px);\n\tmargin: 5px;\n\tborder: 1px solid;\n\tbox-sizing: border-box;\n}\n\ndiv[class^=\"square\"]::before {\n\tcontent: '';\n\tdisplay: block;\n\tpadding-top: 100%;\n}\n\ndiv[class^=\"square\"] .contentz {\n\tposition: absolute;\n\ttop: 0; left: 0;\n\theight: 100%;\n\twidth: 100%;\n  \n\tdisplay: flex;               /* added for centered text */\n\tjustify-content: center;     /* added for centered text */\n\talign-items: center;         /* added for centered text */\n}\n\n/* \ndiv#content {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(2, 40%);\n\tgrid-template-rows: repeat(2, 40%);\n}\n\ndiv.gameboard {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(11, 8%);\n\tgrid-template-rows: repeat(11, 8%);\n}\n\ndiv[class^=\"square\"] {\n\tbackground-color: rgb(184, 184, 184);\n\tborder: 1px solid black;\n\topacity: 0.5;\n\taspect-ratio: 1;\n} */"],"sourceRoot":""}]);
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
(0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__["default"])();//DOM stuff

function startGame() {
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
            return true;
        } else if (P2.allShipsSunk()) {
            console.log("P1 is the winner. Whoo!!");
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

    //start with total 10 -- four 1s, three 2s, two 3s, one 4
    P1.playerPlace('A2', 3, 'vertical');
    P1.playerPlace('D2', 2, 'horizontal');
    P1.playerPlace('H4', 1, 'vertical');
    P1.playerPlace('J1', 4, 'vertical');
    let shipSpan1P1 = P1.playerPlaceShipSpan('A2', 3, 'vertical');
    let shipSpan2P1 = P1.playerPlaceShipSpan('D2', 2, 'horizontal');
    let shipSpan3P1 = P1.playerPlaceShipSpan('H4', 1, 'vertical');
    let shipSpan4P1 = P1.playerPlaceShipSpan('J1', 4, 'vertical');
    //testing using these spans to find if a ship's coordinates 
    //are within it, and then using that to "block" out a sunk ship
    //on the DOM
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
    //add in later - choosing where to place ships!
    //DOM/UI selection > firing playerPlace code > setting new DOM
    //or the random CPU ship placement below for vs CPU
    //will also need to put code to HIDE 
    //CPU (or other person's) boards
    
    /* P2.computerPlace(4);
    P2.computerPlace(3);
    P2.computerPlace(2);
    P2.computerPlace(1); */ //randomly places for computer

    (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.placeShipsDOM)(shipSpan1P1, currentPlayer, P1, P2);
    (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.placeShipsDOM)(shipSpan2P1, currentPlayer, P1, P2);
    (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.placeShipsDOM)(shipSpan3P1, currentPlayer, P1, P2);
    (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.placeShipsDOM)(shipSpan4P1, currentPlayer, P1, P2);

    (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.placeShipsDOM)(shipSpan1P2, waitingPlayer, P1, P2);
    (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.placeShipsDOM)(shipSpan2P2, waitingPlayer, P1, P2);
    (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.placeShipsDOM)(shipSpan3P2, waitingPlayer, P1, P2);
    (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.placeShipsDOM)(shipSpan4P2, waitingPlayer, P1, P2);

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
                        setTimeout(playerTurnSwitch, 1000);//give it time
                        setTimeout(computerTurn, 2400);
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
        //add setTimeout later to show computer "thinking"
        let result = P2.didAtkMiss(P2.randomAtkChoice(), P1.getAttacked);
        let sqHolderCoord = result.slice(5);
        let hitMiss = result.slice(0,4);
        //---CHANGE CODE ABOVE so that it's from 5 to the end
        console.log("result: ", result);
        console.log("sqHolderCoord: ", sqHolderCoord);
        console.log("hitMiss: ", hitMiss);
        (0,_logictodo_js__WEBPACK_IMPORTED_MODULE_1__.fillSquareDOM)(sqHolderCoord, hitMiss, currentPlayer, P1, P2);
        console.log("P2 myHits: ", P2.myHits);
        console.log("P2 myMisses: ", P2.myMisses);
        if (checkForWin() === false) {
            setTimeout(playerTurnSwitch, 1500);//give it time
        }
    }

    /* P1.didAtkMiss('A2', P2.getAttacked);
    P2.didAtkMiss(P2.randomAtkChoice(), P1.getAttacked);
    console.log(P1.playerBoard);
    console.log(P2.playerBoard);
    console.log(P1.myHits);
    console.log(P2.myHits);
    console.log(P2.myMisses); */
}

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
/* harmony export */   "placeShipsDOM": () => (/* binding */ placeShipsDOM),
/* harmony export */   "shipSunkDOM": () => (/* binding */ shipSunkDOM)
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

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__("./src/index.js"));
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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TixvREFBb0QsSUFBSTtBQUN4RDtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVPLDJDQUEyQztBQUNsRDtBQUNBLGtEQUFrRCxJQUFJO0FBQ3REO0FBQ0EsTUFBTTs7QUFFTixrREFBa0QsSUFBSTtBQUN0RDtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9sb2dpYy5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9zcmMvc3R5bGUuY3NzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vc3JjL3N0eWxlLmNzcz83MTYzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qcyIsIndlYnBhY2s6Ly9iYXR0bGVzaGlwLWJ1ZGRpZXMvLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVUYWdUcmFuc2Zvcm0uanMiLCJ3ZWJwYWNrOi8vYmF0dGxlc2hpcC1idWRkaWVzLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovL2JhdHRsZXNoaXAtYnVkZGllcy8uL3NyYy9sb2dpY3RvZG8uanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgU2hpcCA9IChudW0sIGlkKSA9PiB7XG4gICAgbGV0IGxlbmd0aCA9IG51bTtcbiAgICBsZXQgaGl0cyA9IDA7XG4gICAgbGV0IHN1bmtPck5vdCA9IGZhbHNlO1xuICAgIGxldCBzaGlwSUQgPSBpZDtcbiAgICBcbiAgICBjb25zdCBnZXRMZW5ndGggPSAoKSA9PiBsZW5ndGg7XG4gICAgY29uc3QgaGl0ID0gKCkgPT4gaGl0cyA9IGhpdHMgKyAxO1xuICAgIGNvbnN0IGdldEhpdHMgPSAoKSA9PiBoaXRzO1xuICAgIGNvbnN0IGlzU3VuayA9ICgpID0+IHtcbiAgICAgICAgaWYgKGhpdHMgPT09IGxlbmd0aCkgey8vd2lsbCBuZWVkIHRvIG1ha2Ugc3VyZSB0aGV5IGNhbiBvbmx5IGdldCBoaXQgT05DRSBwZXIgY29vcmRpbmF0ZSBzcGFuXG4gICAgICAgICAgICBzdW5rT3JOb3QgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc3Vua09yTm90O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGxlbmd0aCwgc3Vua09yTm90LCBzaGlwSUQsIGhpdHMsXG4gICAgICAgIGdldExlbmd0aCxcbiAgICAgICAgZ2V0SGl0cyxcbiAgICAgICAgaGl0LFxuICAgICAgICBpc1N1bmssXG4gICAgfTtcbn07XG5cbmNvbnN0IEdhbWVib2FyZCA9ICgpID0+IHtcbiAgICBsZXQgYm9hcmQgPSB7fTtcbiAgICBsZXQgc2hpcENvdW50ID0gMDsvL2NvdW50cyAjIG9mIHNoaXBzIHRvdGFsIEFORCB0byBnZW4gSURcbiAgICBsZXQgbGV0dGVyTnVtYkFyciA9IFsnQScsJ0InLCdDJywnRCcsJ0UnLCdGJywnRycsJ0gnLCdJJywnSiddO1xuICAgIGxldCBtaXNzZWRTaG90cyA9IFtdO1xuICAgIGxldCBzaG90c0hpdCA9IFtdO1xuICAgIGxldCBzaGlwc1N0aWxsVXAgPSAwO1xuICAgIC8vaWRlYWxseSBzdGFydCB3aXRoIDEwIC0tIGZvdXIgMXMsIHRocmVlIDJzLCB0d28gM3MsIG9uZSA0XG5cbiAgICBjb25zdCBidWlsZEJvYXJkID0gKCkgPT4ge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgMTA7IGorKykge1xuICAgICAgICAgICAgICAgIGJvYXJkW2Ake2xldHRlck51bWJBcnJbaV19JHtbaisxXX1gXSA9IFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBnZXRTaGlwc0FsaXZlQ291bnQgPSAoKSA9PiBzaGlwc1N0aWxsVXA7XG5cbiAgICBjb25zdCBhcmVBbGxTdW5rID0gKCkgPT4ge1xuICAgICAgICBpZiAoZ2V0U2hpcHNBbGl2ZUNvdW50KCkgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IG1ha2VTaGlwID0gKGxlbmd0aCkgPT4ge1xuICAgICAgICBsZXQgbmV3U2hpcCA9IFNoaXAobGVuZ3RoLCBzaGlwQ291bnQpO1xuICAgICAgICBzaGlwQ291bnQrKztcbiAgICAgICAgc2hpcHNTdGlsbFVwKys7XG4gICAgICAgIHJldHVybiBuZXdTaGlwO1xuICAgIH1cbiAgICBjb25zdCBmaW5kU3BhbiA9IChjb29yZGluYXRlcywgbGVuZ3RoLCBheGlzKSA9PiB7Ly9jb29yZCB0eXBlIFN0cmluZ1xuICAgICAgICBsZXQgYXJyYXkgPSBbXTtcbiAgICAgICAgLy9jaGFuZ2UgaW5wdXQgY29vcmRpbmF0ZXMgaW50byBhcnJheTsgQTIgdG8gW0FdWzJdXG4gICAgICAgIGxldCBjb29yZEFyciA9IGNvb3JkaW5hdGVzLnNwbGl0KCcnKTtcbiAgICAgICAgbGV0IHhJbmRleFN0YXJ0ID0gZmluZFhJbmRleChjb29yZGluYXRlcyk7XG4gICAgICAgIGxldCB5VmFsdWVTdGFydCA9IE51bWJlcihjb29yZEFyclsxXSk7XG4gICAgICAgIGlmIChsZW5ndGggPT09IDEpIHsvL2Nhc2UgbGVuZ3RoID09PSAxXG4gICAgICAgICAgICBhcnJheS5wdXNoKFtjb29yZEFyclswXStjb29yZEFyclsxXV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGF4aXMgPT09IFwiaG9yaXpvbnRhbFwiKSB7Ly9jYXNlIGxlbmd0aCA+IDFcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCB4U3BhbkFycmF5ID0gW2xldHRlck51bWJBcnJbeEluZGV4U3RhcnQraV0rY29vcmRBcnJbMV1dO1xuICAgICAgICAgICAgICAgICAgICBhcnJheS5wdXNoKHhTcGFuQXJyYXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBhcnJheS5wdXNoKFtjb29yZEFyclswXSsoeVZhbHVlU3RhcnQraSldKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgfVxuICAgIGNvbnN0IGZpbmRYSW5kZXggPSAoY29vcmRTdHIpID0+IHsvL2lucHV0IHN0cmluZ1xuICAgICAgICBsZXQgY29vcmRBcnIgPSBjb29yZFN0ci5zcGxpdCgnJyk7Ly9leDogJ0EyJyAtPiBbJ0EnLCAnMiddXG4gICAgICAgIGxldCB4U3RhcnQgPSBsZXR0ZXJOdW1iQXJyLmluZGV4T2YoYCR7Y29vcmRBcnJbMF19YCk7XG4gICAgICAgIHJldHVybiB4U3RhcnQ7Ly9vdXRwdXQgbnVtYmVyXG4gICAgfVxuXG4gICAgY29uc3Qgbm9TaGlwT3ZlcmxhcCA9IChhcnJheSkgPT4gey8vZXg6IFtbXCJBOFwiXSxbXCJCOFwiXV1cbiAgICAgICAgbGV0IGJvb2xlYW4gPSBudWxsO1xuICAgICAgICBsZXQgbGVuZ3RoID0gYXJyYXkubGVuZ3RoIC0gMTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPD0gbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBhcnJUb1N0cmluZyA9IGFycmF5W2ldLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBpZiAoYm9hcmRbYCR7YXJyVG9TdHJpbmd9YF0gIT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICBib29sZWFuID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJvb2xlYW4gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBib29sZWFuO1xuICAgIH1cblxuICAgIGNvbnN0IHBsYWNlU2hpcCA9IChwb3NpdGlvbiwgbGVuZ3RoLCBheGlzKSA9PiB7Ly9wb3NpdGlvbiBzdHJpbmdcbiAgICAgICAgbGV0IHhJbmRleFN0YXJ0ID0gZmluZFhJbmRleChwb3NpdGlvbik7XG4gICAgICAgIGxldCBjb29yZEFyciA9IHBvc2l0aW9uLnNwbGl0KCcnKTsvL2V4OiAnQTgnIC0+IFsnQScsICc4J11cbiAgICAgICAgbGV0IHlWYWx1ZVN0YXJ0ID0gTnVtYmVyKGNvb3JkQXJyWzFdKTtcblxuICAgICAgICAvKiBjb25zb2xlLmxvZyhcIlggXCIsICh4SW5kZXhTdGFydCsxKSsobGVuZ3RoLTEpKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJZIFwiLCB5VmFsdWVTdGFydCsobGVuZ3RoLTEpKTsgKi9cbiAgICAgICAgaWYgKGF4aXMgPT09IFwiaG9yaXpvbnRhbFwiICYmICh4SW5kZXhTdGFydCsxKSsobGVuZ3RoLTEpID4gMTApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2Fubm90IHBsYWNlIHNoaXAgb2ZmIGdhbWVib2FyZFwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChheGlzID09PSBcInZlcnRpY2FsXCIgJiYgeVZhbHVlU3RhcnQrKGxlbmd0aC0xKSA+IDEwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNhbm5vdCBwbGFjZSBzaGlwIG9mZiBnYW1lYm9hcmRcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHNoaXBTcGFuID0gZmluZFNwYW4ocG9zaXRpb24sIGxlbmd0aCwgYXhpcyk7Ly9bW1wiQTdcIl0sW1wiQThcIl1dXG4gICAgICAgIGlmIChub1NoaXBPdmVybGFwKHNoaXBTcGFuKSkge1xuICAgICAgICAgICAgbGV0IG5ld1NoaXAgPSBTaGlwKGxlbmd0aCwgc2hpcENvdW50KTtcbiAgICAgICAgICAgIHNoaXBTcGFuLmZvckVhY2goYXJyYXkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBhcnJUb1N0cmluZyA9IGFycmF5LnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgYm9hcmRbYCR7YXJyVG9TdHJpbmd9YF0gPSBuZXdTaGlwO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHNoaXBDb3VudCsrO1xuICAgICAgICAgICAgc2hpcHNTdGlsbFVwKys7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU29ycnksIHRoZXJlJ3MgYSBzaGlwIGluIHRoZSB3YXkhXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcmVjZWl2ZUF0dGFjayA9ICh0YXJnZXRDb29yKSA9PiB7Ly9hc3N1bWVzIHlvdSBcbiAgICAgICAgLy9DQU4nVCByZS1hdHRhY2sgYSBwb3NpdGlvbiB5b3UndmUgbWlzc2VkIE9SIGhpdCBhbHJlYWR5XG4gICAgICAgIGxldCB0YXJnZXRJbkFyciA9IFtbdGFyZ2V0Q29vcl1dO1xuICAgICAgICBpZiAobm9TaGlwT3ZlcmxhcCh0YXJnZXRJbkFycikgPT09IHRydWUpIHsvL2NoZWNrcyBpZiBzaGlwIGlzIHRoZXJlXG4gICAgICAgICAgICAvL2lmIFRSVUUsIG1lYW5zIG5vdGhpbmcgaXMgdGhlcmVcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTm8gc2hpcCB3YXMgaGl0LiBOaWNlIHRyeSFcIik7XG4gICAgICAgICAgICBtaXNzZWRTaG90cy5wdXNoKHRhcmdldENvb3IpO1xuICAgICAgICB9IGVsc2UgaWYgKG5vU2hpcE92ZXJsYXAodGFyZ2V0SW5BcnIpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgbGV0IHNoaXBGb3VuZCA9IGJvYXJkW2Ake3RhcmdldENvb3J9YF07XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkdyZWF0IHNob3QhIFlvdSBsYW5kZWQgYSBoaXQuXCIpO1xuICAgICAgICAgICAgc2hpcEZvdW5kLmhpdCgpO1xuICAgICAgICAgICAgaWYgKHNoaXBGb3VuZC5nZXRIaXRzKCkgPT09IHNoaXBGb3VuZC5nZXRMZW5ndGgoKSkge1xuICAgICAgICAgICAgICAgIHNoaXBzU3RpbGxVcC0tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgYm9hcmQsbWlzc2VkU2hvdHMsc2hvdHNIaXQsXG4gICAgICAgIG1ha2VTaGlwLFxuICAgICAgICBidWlsZEJvYXJkLFxuICAgICAgICBwbGFjZVNoaXAsXG4gICAgICAgIGZpbmRTcGFuLFxuICAgICAgICBmaW5kWEluZGV4LFxuICAgICAgICBub1NoaXBPdmVybGFwLFxuICAgICAgICByZWNlaXZlQXR0YWNrLFxuICAgICAgICBnZXRTaGlwc0FsaXZlQ291bnQsXG4gICAgICAgIGFyZUFsbFN1bmssXG4gICAgfTtcbn1cblxuY29uc3QgUGxheWVyID0gKG5hbWUpID0+IHsvL2Fzc3VtZSBuYW1lcyBpbnB1dHRlZCBhcmUgVU5JUVVFXG4gICAgXG4gICAgbGV0IGlkID0gbmFtZTtcbiAgICBsZXQgb3duQm9hcmQgPSBHYW1lYm9hcmQoKTtcbiAgICBvd25Cb2FyZC5idWlsZEJvYXJkKCk7XG4gICAgbGV0IGxldHRlck51bWJBcnIgPSBbJ0EnLCdCJywnQycsJ0QnLCdFJywnRicsJ0cnLCdIJywnSScsJ0onXTtcbiAgICBsZXQgcGxheWVyQm9hcmQgPSBvd25Cb2FyZC5ib2FyZDtcbiAgICBsZXQgYWlyQmFsbHMgPSBvd25Cb2FyZC5taXNzZWRTaG90czsvL2J5IHRoZSBvcHBvc2luZyBwbGF5ZXJcblxuICAgIGxldCB0YXJnZXRCb2FyZCA9IEdhbWVib2FyZCgpO1xuICAgIHRhcmdldEJvYXJkLmJ1aWxkQm9hcmQoKTtcbiAgICBsZXQgb3Bwb0JvYXJkID0gdGFyZ2V0Qm9hcmQuYm9hcmQ7XG4gICAgbGV0IG15TWlzc2VzID0gdGFyZ2V0Qm9hcmQubWlzc2VkU2hvdHM7XG4gICAgbGV0IG15SGl0cyA9IHRhcmdldEJvYXJkLnNob3RzSGl0O1xuXG4gICAgY29uc3QgZ2V0U2hpcEZvck9wcCA9IChjb29yZCkgPT4ge1xuICAgICAgICBsZXQgZm91bmRTaGlwID0gcGxheWVyQm9hcmRbYCR7Y29vcmR9YF07XG4gICAgICAgIHJldHVybiBmb3VuZFNoaXA7XG4gICAgfVxuICAgIGNvbnN0IHBsYXllclBsYWNlID0gKHBvc2l0aW9uLCBsZW5ndGgsIGF4aXMpID0+IHtcbiAgICAgICAgLy9zdHJpbmcgJ0IzJywgbnVtYmVyIDMsIHN0cmluZyAnaG9yaXpvbnRhbCcvJ3ZlcnRpY2FsJ1xuICAgICAgICBvd25Cb2FyZC5wbGFjZVNoaXAocG9zaXRpb24sIGxlbmd0aCwgYXhpcyk7XG4gICAgfVxuXG4gICAgY29uc3QgcGxheWVyUGxhY2VTaGlwU3BhbiA9IChwb3NpdGlvbiwgbGVuZ3RoLCBheGlzKSA9PiB7XG4gICAgICAgIHJldHVybiBvd25Cb2FyZC5maW5kU3Bhbihwb3NpdGlvbiwgbGVuZ3RoLCBheGlzKTtcbiAgICB9XG5cbiAgICBjb25zdCBkaWRBdGtNaXNzID0gKGNvb3JkLCBnZXRBdHRhY2tlZCkgPT4ge1xuICAgICAgICBpZiAobXlIaXRzLmluY2x1ZGVzKGAke2Nvb3JkfWApKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImFscmVhZHkgc2hvdCBoZXJlLCBwbHMgc3RvcFwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChteU1pc3Nlcy5pbmNsdWRlcyhgJHtjb29yZH1gKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJhbHJlYWR5IG1pc3NlZCBoZXJlLCBnbyBlbHNld2hlcmVcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZ2V0QXR0YWNrZWQoYCR7Y29vcmR9YCkpIHsvL2lmIGl0IHJldHVybnMgdHJ1ZSwgbWVhbnMgbWlzc2VkXG4gICAgICAgICAgICAgICAgbXlNaXNzZXMucHVzaChjb29yZCk7XG4gICAgICAgICAgICAgICAgbGV0IHN0ciA9IGBtaXNzXyR7Y29vcmR9YDtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBteUhpdHMucHVzaChjb29yZCk7XG4gICAgICAgICAgICAgICAgbGV0IHN0ciA9IGBoaXRzXyR7Y29vcmR9YDtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgZ2V0QXR0YWNrZWQgPSAoY29vcmQpID0+IHtcbiAgICAgICAgbGV0IHN0YXJ0aW5nTGVuZ3RoID0gYWlyQmFsbHMubGVuZ3RoO1xuICAgICAgICBvd25Cb2FyZC5yZWNlaXZlQXR0YWNrKGNvb3JkKTsvL2lmIGl0J3MgYSBtaXNzLCBhaXJCYWxscyBsZW5ndGggc2hvdWxkIGluY3JlYXNlIGJ5IDFcbiAgICAgICAgaWYgKGFpckJhbGxzLmxlbmd0aCA+IHN0YXJ0aW5nTGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHNoaXBzVXAgPSAoKSA9PiBvd25Cb2FyZC5nZXRTaGlwc0FsaXZlQ291bnQoKTtcbiAgICBjb25zdCBhbGxTaGlwc1N1bmsgPSAoKSA9PiB7XG4gICAgICAgIGlmIChzaGlwc1VwKCkgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vdHJ1ZSBpZiBzaGlwQ291bnQgaXMgMCwgZmFsc2UgaWYgbm90XG5cbiAgICAvLy0tLS1jb21wdXRlciBsb2dpY1xuXG5cbiAgICBjb25zdCByYW5kb21BdGtDaG9pY2UgPSAoKSA9PiB7XG4gICAgICAgIGxldCBib29sSG9sZGVyID0gZmFsc2U7XG4gICAgICAgIC8vd2FudCB0byBwaWNrIHJhbmRvbSBYICYgWTsgaWYgTk9UIHdpdGhpbiBteUhpdHMgJiBteU1pc3NlcywgZ28gYWhlYWRcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgbGV0IGNvb3JkID0gcmFuZG9tUG9zaXRpb24oKTtcbiAgICAgICAgICAgIGlmICghbXlIaXRzLmluY2x1ZGVzKGAke2Nvb3JkfWApICYmICFteU1pc3Nlcy5pbmNsdWRlcyhgJHtjb29yZH1gKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ1BVIHBpY2tlZCBcIiwgY29vcmQpO1xuICAgICAgICAgICAgICAgIGJvb2xIb2xkZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBjb29yZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSB3aGlsZSAoIWJvb2xIb2xkZXIpICAgICAgICBcbiAgICB9XG4gICAgY29uc3QgY29tcHV0ZXJQbGFjZSA9IChsZW5ndGgpID0+IHtcbiAgICAgICAgLy9zdHJpbmcgJ0IzJywgbnVtYmVyIDMsIHN0cmluZyAnaG9yaXpvbnRhbCcvJ3ZlcnRpY2FsJ1xuICAgICAgICAvKiBsZXQgcG9zaXRpb24gPSByYW5kb21Qb3NpdGlvbigpO1xuICAgICAgICBsZXQgYXhpcyA9IHJhbmRvbUF4aXMoKTsqL1xuICAgICAgICBsZXQgYm9vbEhvbGRlciA9IGZhbHNlOyBcblxuICAgICAgICAvKiBpZiAob3duQm9hcmQucGxhY2VTaGlwKHBvc2l0aW9uLCBsZW5ndGgsIGF4aXMpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgLy9tZWFuaW5nIGlmIGl0J3MgcGxhY2VkIG9mZiB0aGUgYm9hcmQgb3Igb3ZlcmxhcHBpbmdcbiAgICAgICAgICAgIC8vd2FudCB0byByZXJ1biB0aGlzIGZ1bmN0aW9uIGFnYWluXG4gICAgICAgIH0gKi9cblxuICAgICAgICBkbyB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInJhbiBhbm90aGVyIHBsYWNlbWVudCBieSB0aGUgY29tcFwiKTtcbiAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IHJhbmRvbVBvc2l0aW9uKCk7XG4gICAgICAgICAgICBsZXQgYXhpcyA9IHJhbmRvbUF4aXMoKTtcbiAgICAgICAgICAgIGJvb2xIb2xkZXIgPSBvd25Cb2FyZC5wbGFjZVNoaXAocG9zaXRpb24sIGxlbmd0aCwgYXhpcyk7XG4gICAgICAgIH0gd2hpbGUgKCFib29sSG9sZGVyKVxuICAgICAgICBcbiAgICB9XG4gICAgY29uc3QgcmFuZG9tQXhpcyA9ICgpID0+IHtcbiAgICAgICAgbGV0IGNob3NlbkF4aXMgPSBNYXRoLnJhbmRvbSgpIDwgMC41ID8gXCJob3Jpem9udGFsXCIgOiBcInZlcnRpY2FsXCI7XG4gICAgICAgIHJldHVybiBjaG9zZW5BeGlzO1xuICAgIH1cbiAgICBjb25zdCByYW5kb21Qb3NpdGlvbiA9ICgpID0+IHtcbiAgICAgICAgbGV0IHJhbmRvbU51bWIxID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKjEwKTsvLzAtOVxuICAgICAgICBsZXQgcmFuZG9tTnVtYjIgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMTApO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGxldHRlck51bWJBcnIpO1xuICAgICAgICBsZXQgcmFuZG9tWCA9IGxldHRlck51bWJBcnJbcmFuZG9tTnVtYjFdO1xuICAgICAgICBsZXQgcmFuZG9tWSA9IHJhbmRvbU51bWIyICsgMTtcbiAgICAgICAgcmV0dXJuIHJhbmRvbVggKyByYW5kb21ZLnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaWQsIHBsYXllckJvYXJkLCBhaXJCYWxscywgb3Bwb0JvYXJkLCBteU1pc3NlcywgbXlIaXRzLFxuICAgICAgICBnZXRBdHRhY2tlZCwgZGlkQXRrTWlzcywgcGxheWVyUGxhY2UsIGNvbXB1dGVyUGxhY2UsIHJhbmRvbUF0a0Nob2ljZSwgc2hpcHNVcCwgYWxsU2hpcHNTdW5rLCBwbGF5ZXJQbGFjZVNoaXBTcGFuLCBnZXRTaGlwRm9yT3BwLFxuICAgIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHsgXG4gICAgU2hpcDogU2hpcCxcbiAgICBHYW1lYm9hcmQ6IEdhbWVib2FyZCxcbiAgICBQbGF5ZXI6IFBsYXllcixcbn0gIiwiLy8gSW1wb3J0c1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX1NPVVJDRU1BUF9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzXCI7XG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfSU1QT1JUX19fIGZyb20gXCIuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCJodG1sLCBib2R5LCBkaXYsIHNwYW4sIGFwcGxldCwgb2JqZWN0LCBpZnJhbWUsXFxuaDEsIGgyLCBoMywgaDQsIGg1LCBoNiwgcCwgYmxvY2txdW90ZSwgcHJlLFxcbmEsIGFiYnIsIGFjcm9ueW0sIGFkZHJlc3MsIGJpZywgY2l0ZSwgY29kZSxcXG5kZWwsIGRmbiwgZW0sIGltZywgaW5zLCBrYmQsIHEsIHMsIHNhbXAsXFxuc21hbGwsIHN0cmlrZSwgc3Ryb25nLCBzdWIsIHN1cCwgdHQsIHZhcixcXG5iLCB1LCBpLCBjZW50ZXIsXFxuZGwsIGR0LCBkZCwgb2wsIHVsLCBsaSxcXG5maWVsZHNldCwgZm9ybSwgbGFiZWwsIGxlZ2VuZCxcXG50YWJsZSwgY2FwdGlvbiwgdGJvZHksIHRmb290LCB0aGVhZCwgdHIsIHRoLCB0ZCxcXG5hcnRpY2xlLCBhc2lkZSwgY2FudmFzLCBkZXRhaWxzLCBlbWJlZCwgXFxuZmlndXJlLCBmaWdjYXB0aW9uLCBmb290ZXIsIGhlYWRlciwgaGdyb3VwLCBcXG5tZW51LCBuYXYsIG91dHB1dCwgcnVieSwgc2VjdGlvbiwgc3VtbWFyeSxcXG50aW1lLCBtYXJrLCBhdWRpbywgdmlkZW8ge1xcblxcdG1hcmdpbjogMDtcXG5cXHRwYWRkaW5nOiAwO1xcblxcdGJvcmRlcjogMDtcXG5cXHRmb250LXNpemU6IDEwMCU7XFxuXFx0Zm9udDogaW5oZXJpdDtcXG5cXHR2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XFxufVxcbi8qIEhUTUw1IGRpc3BsYXktcm9sZSByZXNldCBmb3Igb2xkZXIgYnJvd3NlcnMgKi9cXG5hcnRpY2xlLCBhc2lkZSwgZGV0YWlscywgZmlnY2FwdGlvbiwgZmlndXJlLCBcXG5mb290ZXIsIGhlYWRlciwgaGdyb3VwLCBtZW51LCBuYXYsIHNlY3Rpb24ge1xcblxcdGRpc3BsYXk6IGJsb2NrO1xcbn1cXG5ib2R5IHtcXG5cXHRsaW5lLWhlaWdodDogMTtcXG59XFxub2wsIHVsIHtcXG5cXHRsaXN0LXN0eWxlOiBub25lO1xcbn1cXG5ibG9ja3F1b3RlLCBxIHtcXG5cXHRxdW90ZXM6IG5vbmU7XFxufVxcbmJsb2NrcXVvdGU6YmVmb3JlLCBibG9ja3F1b3RlOmFmdGVyLFxcbnE6YmVmb3JlLCBxOmFmdGVyIHtcXG5cXHRjb250ZW50OiAnJztcXG5cXHRjb250ZW50OiBub25lO1xcbn1cXG50YWJsZSB7XFxuXFx0Ym9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTtcXG5cXHRib3JkZXItc3BhY2luZzogMDtcXG59XFxuXFxuOnJvb3Qge1xcbiAgICAtLXByaW1hcnk6ICNmYzNmOTc7IFxcbiAgICAtLXNlY29uZGFyeTogI2MzMTk1ZDsgXFxuICAgIC0tdGVydGlhcnk6ICM2ODA3NDc7IFxcbiAgICAtLXF1YXRlcm5hcnk6ICMxNDEwMTA7IFxcbn1cXG5cXG5odG1sLCBib2R5LCBkaXYjY29udGVudCB7XFxuICAgIGhlaWdodDogMTAwJTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGZvbnQtc2l6ZTogMTZweDtcXG59XFxuXFxuLmRlc2NyaXB0b3Ige1xcblxcdGZvbnQtc2l6ZTogMS4ycmVtO1xcblxcdG1hcmdpbjogMC41cmVtO1xcbn1cXG5cXG5kaXYjcDFTZXBlcmF0b3Ige1xcblxcdGJhY2tncm91bmQtY29sb3I6IHZhcigtLXByaW1hcnkpO1xcbn1cXG5kaXYjcDJTZXBlcmF0b3Ige1xcblxcdGJhY2tncm91bmQtY29sb3I6YXF1YTtcXG59XFxuXFxuZGl2LmdhbWVib2FyZCB7XFxuXFx0ZGlzcGxheTogZmxleDtcXG5cXHRmbGV4LXdyYXA6IHdyYXA7XFxuXFx0Ym9yZGVyOiAzcHggc29saWQgcGluaztcXG59XFxuXFxuZGl2W2NsYXNzXj1cXFwic3F1YXJlXFxcIl0ge1xcblxcdHBvc2l0aW9uOiByZWxhdGl2ZTtcXG5cXHRmbGV4LWJhc2lzOiBjYWxjKDklIC0gMTBweCk7XFxuXFx0bWFyZ2luOiA1cHg7XFxuXFx0Ym9yZGVyOiAxcHggc29saWQ7XFxuXFx0Ym94LXNpemluZzogYm9yZGVyLWJveDtcXG59XFxuXFxuZGl2W2NsYXNzXj1cXFwic3F1YXJlXFxcIl06OmJlZm9yZSB7XFxuXFx0Y29udGVudDogJyc7XFxuXFx0ZGlzcGxheTogYmxvY2s7XFxuXFx0cGFkZGluZy10b3A6IDEwMCU7XFxufVxcblxcbmRpdltjbGFzc149XFxcInNxdWFyZVxcXCJdIC5jb250ZW50eiB7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHRvcDogMDsgbGVmdDogMDtcXG5cXHRoZWlnaHQ6IDEwMCU7XFxuXFx0d2lkdGg6IDEwMCU7XFxuICBcXG5cXHRkaXNwbGF5OiBmbGV4OyAgICAgICAgICAgICAgIC8qIGFkZGVkIGZvciBjZW50ZXJlZCB0ZXh0ICovXFxuXFx0anVzdGlmeS1jb250ZW50OiBjZW50ZXI7ICAgICAvKiBhZGRlZCBmb3IgY2VudGVyZWQgdGV4dCAqL1xcblxcdGFsaWduLWl0ZW1zOiBjZW50ZXI7ICAgICAgICAgLyogYWRkZWQgZm9yIGNlbnRlcmVkIHRleHQgKi9cXG59XFxuXFxuLyogXFxuZGl2I2NvbnRlbnQge1xcblxcdGRpc3BsYXk6IGdyaWQ7XFxuXFx0Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMiwgNDAlKTtcXG5cXHRncmlkLXRlbXBsYXRlLXJvd3M6IHJlcGVhdCgyLCA0MCUpO1xcbn1cXG5cXG5kaXYuZ2FtZWJvYXJkIHtcXG5cXHRkaXNwbGF5OiBncmlkO1xcblxcdGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDExLCA4JSk7XFxuXFx0Z3JpZC10ZW1wbGF0ZS1yb3dzOiByZXBlYXQoMTEsIDglKTtcXG59XFxuXFxuZGl2W2NsYXNzXj1cXFwic3F1YXJlXFxcIl0ge1xcblxcdGJhY2tncm91bmQtY29sb3I6IHJnYigxODQsIDE4NCwgMTg0KTtcXG5cXHRib3JkZXI6IDFweCBzb2xpZCBibGFjaztcXG5cXHRvcGFjaXR5OiAwLjU7XFxuXFx0YXNwZWN0LXJhdGlvOiAxO1xcbn0gKi9cIiwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9zcmMvc3R5bGUuY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUFBOzs7Ozs7Ozs7Ozs7O0NBYUMsU0FBUztDQUNULFVBQVU7Q0FDVixTQUFTO0NBQ1QsZUFBZTtDQUNmLGFBQWE7Q0FDYix3QkFBd0I7QUFDekI7QUFDQSxnREFBZ0Q7QUFDaEQ7O0NBRUMsY0FBYztBQUNmO0FBQ0E7Q0FDQyxjQUFjO0FBQ2Y7QUFDQTtDQUNDLGdCQUFnQjtBQUNqQjtBQUNBO0NBQ0MsWUFBWTtBQUNiO0FBQ0E7O0NBRUMsV0FBVztDQUNYLGFBQWE7QUFDZDtBQUNBO0NBQ0MseUJBQXlCO0NBQ3pCLGlCQUFpQjtBQUNsQjs7QUFFQTtJQUNJLGtCQUFrQjtJQUNsQixvQkFBb0I7SUFDcEIsbUJBQW1CO0lBQ25CLHFCQUFxQjtBQUN6Qjs7QUFFQTtJQUNJLFlBQVk7SUFDWixXQUFXO0lBQ1gsZUFBZTtBQUNuQjs7QUFFQTtDQUNDLGlCQUFpQjtDQUNqQixjQUFjO0FBQ2Y7O0FBRUE7Q0FDQyxnQ0FBZ0M7QUFDakM7QUFDQTtDQUNDLHFCQUFxQjtBQUN0Qjs7QUFFQTtDQUNDLGFBQWE7Q0FDYixlQUFlO0NBQ2Ysc0JBQXNCO0FBQ3ZCOztBQUVBO0NBQ0Msa0JBQWtCO0NBQ2xCLDJCQUEyQjtDQUMzQixXQUFXO0NBQ1gsaUJBQWlCO0NBQ2pCLHNCQUFzQjtBQUN2Qjs7QUFFQTtDQUNDLFdBQVc7Q0FDWCxjQUFjO0NBQ2QsaUJBQWlCO0FBQ2xCOztBQUVBO0NBQ0Msa0JBQWtCO0NBQ2xCLE1BQU0sRUFBRSxPQUFPO0NBQ2YsWUFBWTtDQUNaLFdBQVc7O0NBRVgsYUFBYSxnQkFBZ0IsNEJBQTRCO0NBQ3pELHVCQUF1QixNQUFNLDRCQUE0QjtDQUN6RCxtQkFBbUIsVUFBVSw0QkFBNEI7QUFDMUQ7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtCR1wiLFwic291cmNlc0NvbnRlbnRcIjpbXCJodG1sLCBib2R5LCBkaXYsIHNwYW4sIGFwcGxldCwgb2JqZWN0LCBpZnJhbWUsXFxuaDEsIGgyLCBoMywgaDQsIGg1LCBoNiwgcCwgYmxvY2txdW90ZSwgcHJlLFxcbmEsIGFiYnIsIGFjcm9ueW0sIGFkZHJlc3MsIGJpZywgY2l0ZSwgY29kZSxcXG5kZWwsIGRmbiwgZW0sIGltZywgaW5zLCBrYmQsIHEsIHMsIHNhbXAsXFxuc21hbGwsIHN0cmlrZSwgc3Ryb25nLCBzdWIsIHN1cCwgdHQsIHZhcixcXG5iLCB1LCBpLCBjZW50ZXIsXFxuZGwsIGR0LCBkZCwgb2wsIHVsLCBsaSxcXG5maWVsZHNldCwgZm9ybSwgbGFiZWwsIGxlZ2VuZCxcXG50YWJsZSwgY2FwdGlvbiwgdGJvZHksIHRmb290LCB0aGVhZCwgdHIsIHRoLCB0ZCxcXG5hcnRpY2xlLCBhc2lkZSwgY2FudmFzLCBkZXRhaWxzLCBlbWJlZCwgXFxuZmlndXJlLCBmaWdjYXB0aW9uLCBmb290ZXIsIGhlYWRlciwgaGdyb3VwLCBcXG5tZW51LCBuYXYsIG91dHB1dCwgcnVieSwgc2VjdGlvbiwgc3VtbWFyeSxcXG50aW1lLCBtYXJrLCBhdWRpbywgdmlkZW8ge1xcblxcdG1hcmdpbjogMDtcXG5cXHRwYWRkaW5nOiAwO1xcblxcdGJvcmRlcjogMDtcXG5cXHRmb250LXNpemU6IDEwMCU7XFxuXFx0Zm9udDogaW5oZXJpdDtcXG5cXHR2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XFxufVxcbi8qIEhUTUw1IGRpc3BsYXktcm9sZSByZXNldCBmb3Igb2xkZXIgYnJvd3NlcnMgKi9cXG5hcnRpY2xlLCBhc2lkZSwgZGV0YWlscywgZmlnY2FwdGlvbiwgZmlndXJlLCBcXG5mb290ZXIsIGhlYWRlciwgaGdyb3VwLCBtZW51LCBuYXYsIHNlY3Rpb24ge1xcblxcdGRpc3BsYXk6IGJsb2NrO1xcbn1cXG5ib2R5IHtcXG5cXHRsaW5lLWhlaWdodDogMTtcXG59XFxub2wsIHVsIHtcXG5cXHRsaXN0LXN0eWxlOiBub25lO1xcbn1cXG5ibG9ja3F1b3RlLCBxIHtcXG5cXHRxdW90ZXM6IG5vbmU7XFxufVxcbmJsb2NrcXVvdGU6YmVmb3JlLCBibG9ja3F1b3RlOmFmdGVyLFxcbnE6YmVmb3JlLCBxOmFmdGVyIHtcXG5cXHRjb250ZW50OiAnJztcXG5cXHRjb250ZW50OiBub25lO1xcbn1cXG50YWJsZSB7XFxuXFx0Ym9yZGVyLWNvbGxhcHNlOiBjb2xsYXBzZTtcXG5cXHRib3JkZXItc3BhY2luZzogMDtcXG59XFxuXFxuOnJvb3Qge1xcbiAgICAtLXByaW1hcnk6ICNmYzNmOTc7IFxcbiAgICAtLXNlY29uZGFyeTogI2MzMTk1ZDsgXFxuICAgIC0tdGVydGlhcnk6ICM2ODA3NDc7IFxcbiAgICAtLXF1YXRlcm5hcnk6ICMxNDEwMTA7IFxcbn1cXG5cXG5odG1sLCBib2R5LCBkaXYjY29udGVudCB7XFxuICAgIGhlaWdodDogMTAwJTtcXG4gICAgd2lkdGg6IDEwMCU7XFxuICAgIGZvbnQtc2l6ZTogMTZweDtcXG59XFxuXFxuLmRlc2NyaXB0b3Ige1xcblxcdGZvbnQtc2l6ZTogMS4ycmVtO1xcblxcdG1hcmdpbjogMC41cmVtO1xcbn1cXG5cXG5kaXYjcDFTZXBlcmF0b3Ige1xcblxcdGJhY2tncm91bmQtY29sb3I6IHZhcigtLXByaW1hcnkpO1xcbn1cXG5kaXYjcDJTZXBlcmF0b3Ige1xcblxcdGJhY2tncm91bmQtY29sb3I6YXF1YTtcXG59XFxuXFxuZGl2LmdhbWVib2FyZCB7XFxuXFx0ZGlzcGxheTogZmxleDtcXG5cXHRmbGV4LXdyYXA6IHdyYXA7XFxuXFx0Ym9yZGVyOiAzcHggc29saWQgcGluaztcXG59XFxuXFxuZGl2W2NsYXNzXj1cXFwic3F1YXJlXFxcIl0ge1xcblxcdHBvc2l0aW9uOiByZWxhdGl2ZTtcXG5cXHRmbGV4LWJhc2lzOiBjYWxjKDklIC0gMTBweCk7XFxuXFx0bWFyZ2luOiA1cHg7XFxuXFx0Ym9yZGVyOiAxcHggc29saWQ7XFxuXFx0Ym94LXNpemluZzogYm9yZGVyLWJveDtcXG59XFxuXFxuZGl2W2NsYXNzXj1cXFwic3F1YXJlXFxcIl06OmJlZm9yZSB7XFxuXFx0Y29udGVudDogJyc7XFxuXFx0ZGlzcGxheTogYmxvY2s7XFxuXFx0cGFkZGluZy10b3A6IDEwMCU7XFxufVxcblxcbmRpdltjbGFzc149XFxcInNxdWFyZVxcXCJdIC5jb250ZW50eiB7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHRvcDogMDsgbGVmdDogMDtcXG5cXHRoZWlnaHQ6IDEwMCU7XFxuXFx0d2lkdGg6IDEwMCU7XFxuICBcXG5cXHRkaXNwbGF5OiBmbGV4OyAgICAgICAgICAgICAgIC8qIGFkZGVkIGZvciBjZW50ZXJlZCB0ZXh0ICovXFxuXFx0anVzdGlmeS1jb250ZW50OiBjZW50ZXI7ICAgICAvKiBhZGRlZCBmb3IgY2VudGVyZWQgdGV4dCAqL1xcblxcdGFsaWduLWl0ZW1zOiBjZW50ZXI7ICAgICAgICAgLyogYWRkZWQgZm9yIGNlbnRlcmVkIHRleHQgKi9cXG59XFxuXFxuLyogXFxuZGl2I2NvbnRlbnQge1xcblxcdGRpc3BsYXk6IGdyaWQ7XFxuXFx0Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMiwgNDAlKTtcXG5cXHRncmlkLXRlbXBsYXRlLXJvd3M6IHJlcGVhdCgyLCA0MCUpO1xcbn1cXG5cXG5kaXYuZ2FtZWJvYXJkIHtcXG5cXHRkaXNwbGF5OiBncmlkO1xcblxcdGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDExLCA4JSk7XFxuXFx0Z3JpZC10ZW1wbGF0ZS1yb3dzOiByZXBlYXQoMTEsIDglKTtcXG59XFxuXFxuZGl2W2NsYXNzXj1cXFwic3F1YXJlXFxcIl0ge1xcblxcdGJhY2tncm91bmQtY29sb3I6IHJnYigxODQsIDE4NCwgMTg0KTtcXG5cXHRib3JkZXI6IDFweCBzb2xpZCBibGFjaztcXG5cXHRvcGFjaXR5OiAwLjU7XFxuXFx0YXNwZWN0LXJhdGlvOiAxO1xcbn0gKi9cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107XG5cbiAgLy8gcmV0dXJuIHRoZSBsaXN0IG9mIG1vZHVsZXMgYXMgY3NzIHN0cmluZ1xuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IFwiXCI7XG4gICAgICB2YXIgbmVlZExheWVyID0gdHlwZW9mIGl0ZW1bNV0gIT09IFwidW5kZWZpbmVkXCI7XG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIik7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpO1xuICAgICAgfVxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIik7XG4gICAgICB9XG4gICAgICBjb250ZW50ICs9IGNzc1dpdGhNYXBwaW5nVG9TdHJpbmcoaXRlbSk7XG4gICAgICBpZiAobmVlZExheWVyKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJ9XCI7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW1bNF0pIHtcbiAgICAgICAgY29udGVudCArPSBcIn1cIjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH0pLmpvaW4oXCJcIik7XG4gIH07XG5cbiAgLy8gaW1wb3J0IGEgbGlzdCBvZiBtb2R1bGVzIGludG8gdGhlIGxpc3RcbiAgbGlzdC5pID0gZnVuY3Rpb24gaShtb2R1bGVzLCBtZWRpYSwgZGVkdXBlLCBzdXBwb3J0cywgbGF5ZXIpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIHVuZGVmaW5lZF1dO1xuICAgIH1cbiAgICB2YXIgYWxyZWFkeUltcG9ydGVkTW9kdWxlcyA9IHt9O1xuICAgIGlmIChkZWR1cGUpIHtcbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgdGhpcy5sZW5ndGg7IGsrKykge1xuICAgICAgICB2YXIgaWQgPSB0aGlzW2tdWzBdO1xuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciBfayA9IDA7IF9rIDwgbW9kdWxlcy5sZW5ndGg7IF9rKyspIHtcbiAgICAgIHZhciBpdGVtID0gW10uY29uY2F0KG1vZHVsZXNbX2tdKTtcbiAgICAgIGlmIChkZWR1cGUgJiYgYWxyZWFkeUltcG9ydGVkTW9kdWxlc1tpdGVtWzBdXSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtWzVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAobWVkaWEpIHtcbiAgICAgICAgaWYgKCFpdGVtWzJdKSB7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKS5jb25jYXQoaXRlbVsxXSwgXCJ9XCIpO1xuICAgICAgICAgIGl0ZW1bMl0gPSBtZWRpYTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHN1cHBvcnRzKSB7XG4gICAgICAgIGlmICghaXRlbVs0XSkge1xuICAgICAgICAgIGl0ZW1bNF0gPSBcIlwiLmNvbmNhdChzdXBwb3J0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQoaXRlbVs0XSwgXCIpIHtcIikuY29uY2F0KGl0ZW1bMV0sIFwifVwiKTtcbiAgICAgICAgICBpdGVtWzRdID0gc3VwcG9ydHM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBsaXN0O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXRlbSkge1xuICB2YXIgY29udGVudCA9IGl0ZW1bMV07XG4gIHZhciBjc3NNYXBwaW5nID0gaXRlbVszXTtcbiAgaWYgKCFjc3NNYXBwaW5nKSB7XG4gICAgcmV0dXJuIGNvbnRlbnQ7XG4gIH1cbiAgaWYgKHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHJldHVybiBbY29udGVudF0uY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbihcIlxcblwiKTtcbiAgfVxuICByZXR1cm4gW2NvbnRlbnRdLmpvaW4oXCJcXG5cIik7XG59OyIsIlxuICAgICAgaW1wb3J0IEFQSSBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luamVjdFN0eWxlc0ludG9TdHlsZVRhZy5qc1wiO1xuICAgICAgaW1wb3J0IGRvbUFQSSBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0Rm4gZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbnNlcnRCeVNlbGVjdG9yLmpzXCI7XG4gICAgICBpbXBvcnQgc2V0QXR0cmlidXRlcyBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qc1wiO1xuICAgICAgaW1wb3J0IGluc2VydFN0eWxlRWxlbWVudCBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qc1wiO1xuICAgICAgaW1wb3J0IHN0eWxlVGFnVHJhbnNmb3JtRm4gZnJvbSBcIiEuLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qc1wiO1xuICAgICAgaW1wb3J0IGNvbnRlbnQsICogYXMgbmFtZWRFeHBvcnQgZnJvbSBcIiEhLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9zdHlsZS5jc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuL3N0eWxlLmNzc1wiO1xuICAgICAgIGV4cG9ydCBkZWZhdWx0IGNvbnRlbnQgJiYgY29udGVudC5sb2NhbHMgPyBjb250ZW50LmxvY2FscyA6IHVuZGVmaW5lZDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgc3R5bGVzSW5ET00gPSBbXTtcbmZ1bmN0aW9uIGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgdmFyIHJlc3VsdCA9IC0xO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0eWxlc0luRE9NLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0eWxlc0luRE9NW2ldLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgIHJlc3VsdCA9IGk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKSB7XG4gIHZhciBpZENvdW50TWFwID0ge307XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV07XG4gICAgdmFyIGlkID0gb3B0aW9ucy5iYXNlID8gaXRlbVswXSArIG9wdGlvbnMuYmFzZSA6IGl0ZW1bMF07XG4gICAgdmFyIGNvdW50ID0gaWRDb3VudE1hcFtpZF0gfHwgMDtcbiAgICB2YXIgaWRlbnRpZmllciA9IFwiXCIuY29uY2F0KGlkLCBcIiBcIikuY29uY2F0KGNvdW50KTtcbiAgICBpZENvdW50TWFwW2lkXSA9IGNvdW50ICsgMTtcbiAgICB2YXIgaW5kZXhCeUlkZW50aWZpZXIgPSBnZXRJbmRleEJ5SWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgICB2YXIgb2JqID0ge1xuICAgICAgY3NzOiBpdGVtWzFdLFxuICAgICAgbWVkaWE6IGl0ZW1bMl0sXG4gICAgICBzb3VyY2VNYXA6IGl0ZW1bM10sXG4gICAgICBzdXBwb3J0czogaXRlbVs0XSxcbiAgICAgIGxheWVyOiBpdGVtWzVdXG4gICAgfTtcbiAgICBpZiAoaW5kZXhCeUlkZW50aWZpZXIgIT09IC0xKSB7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleEJ5SWRlbnRpZmllcl0ucmVmZXJlbmNlcysrO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnVwZGF0ZXIob2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHVwZGF0ZXIgPSBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKTtcbiAgICAgIG9wdGlvbnMuYnlJbmRleCA9IGk7XG4gICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoaSwgMCwge1xuICAgICAgICBpZGVudGlmaWVyOiBpZGVudGlmaWVyLFxuICAgICAgICB1cGRhdGVyOiB1cGRhdGVyLFxuICAgICAgICByZWZlcmVuY2VzOiAxXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTtcbiAgfVxuICByZXR1cm4gaWRlbnRpZmllcnM7XG59XG5mdW5jdGlvbiBhZGRFbGVtZW50U3R5bGUob2JqLCBvcHRpb25zKSB7XG4gIHZhciBhcGkgPSBvcHRpb25zLmRvbUFQSShvcHRpb25zKTtcbiAgYXBpLnVwZGF0ZShvYmopO1xuICB2YXIgdXBkYXRlciA9IGZ1bmN0aW9uIHVwZGF0ZXIobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCAmJiBuZXdPYmouc3VwcG9ydHMgPT09IG9iai5zdXBwb3J0cyAmJiBuZXdPYmoubGF5ZXIgPT09IG9iai5sYXllcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBhcGkudXBkYXRlKG9iaiA9IG5ld09iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwaS5yZW1vdmUoKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiB1cGRhdGVyO1xufVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaWRlbnRpZmllciA9IGxhc3RJZGVudGlmaWVyc1tpXTtcbiAgICAgIHZhciBpbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhdLnJlZmVyZW5jZXMtLTtcbiAgICB9XG4gICAgdmFyIG5ld0xhc3RJZGVudGlmaWVycyA9IG1vZHVsZXNUb0RvbShuZXdMaXN0LCBvcHRpb25zKTtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcbiAgICAgIHZhciBfaW5kZXggPSBnZXRJbmRleEJ5SWRlbnRpZmllcihfaWRlbnRpZmllcik7XG4gICAgICBpZiAoc3R5bGVzSW5ET01bX2luZGV4XS5yZWZlcmVuY2VzID09PSAwKSB7XG4gICAgICAgIHN0eWxlc0luRE9NW19pbmRleF0udXBkYXRlcigpO1xuICAgICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGFzdElkZW50aWZpZXJzID0gbmV3TGFzdElkZW50aWZpZXJzO1xuICB9O1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIG1lbW8gPSB7fTtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBnZXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICh0eXBlb2YgbWVtb1t0YXJnZXRdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgdmFyIHN0eWxlVGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0YXJnZXQpO1xuXG4gICAgLy8gU3BlY2lhbCBjYXNlIHRvIHJldHVybiBoZWFkIG9mIGlmcmFtZSBpbnN0ZWFkIG9mIGlmcmFtZSBpdHNlbGZcbiAgICBpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuICAgICAgICBzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICBzdHlsZVRhcmdldCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIG1lbW9bdGFyZ2V0XSA9IHN0eWxlVGFyZ2V0O1xuICB9XG4gIHJldHVybiBtZW1vW3RhcmdldF07XG59XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0QnlTZWxlY3RvcihpbnNlcnQsIHN0eWxlKSB7XG4gIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQoaW5zZXJ0KTtcbiAgaWYgKCF0YXJnZXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZG4ndCBmaW5kIGEgc3R5bGUgdGFyZ2V0LiBUaGlzIHByb2JhYmx5IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGZvciB0aGUgJ2luc2VydCcgcGFyYW1ldGVyIGlzIGludmFsaWQuXCIpO1xuICB9XG4gIHRhcmdldC5hcHBlbmRDaGlsZChzdHlsZSk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEJ5U2VsZWN0b3I7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIG9wdGlvbnMuc2V0QXR0cmlidXRlcyhlbGVtZW50LCBvcHRpb25zLmF0dHJpYnV0ZXMpO1xuICBvcHRpb25zLmluc2VydChlbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xuICByZXR1cm4gZWxlbWVudDtcbn1cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0U3R5bGVFbGVtZW50OyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcyhzdHlsZUVsZW1lbnQpIHtcbiAgdmFyIG5vbmNlID0gdHlwZW9mIF9fd2VicGFja19ub25jZV9fICE9PSBcInVuZGVmaW5lZFwiID8gX193ZWJwYWNrX25vbmNlX18gOiBudWxsO1xuICBpZiAobm9uY2UpIHtcbiAgICBzdHlsZUVsZW1lbnQuc2V0QXR0cmlidXRlKFwibm9uY2VcIiwgbm9uY2UpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlczsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaikge1xuICB2YXIgY3NzID0gXCJcIjtcbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KG9iai5zdXBwb3J0cywgXCIpIHtcIik7XG4gIH1cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIkBtZWRpYSBcIi5jb25jYXQob2JqLm1lZGlhLCBcIiB7XCIpO1xuICB9XG4gIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2Ygb2JqLmxheWVyICE9PSBcInVuZGVmaW5lZFwiO1xuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwiQGxheWVyXCIuY29uY2F0KG9iai5sYXllci5sZW5ndGggPiAwID8gXCIgXCIuY29uY2F0KG9iai5sYXllcikgOiBcIlwiLCBcIiB7XCIpO1xuICB9XG4gIGNzcyArPSBvYmouY3NzO1xuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cbiAgaWYgKG9iai5zdXBwb3J0cykge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuICB2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcbiAgaWYgKHNvdXJjZU1hcCAmJiB0eXBlb2YgYnRvYSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIGNzcyArPSBcIlxcbi8qIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsXCIuY29uY2F0KGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZU1hcCkpKSksIFwiICovXCIpO1xuICB9XG5cbiAgLy8gRm9yIG9sZCBJRVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgICovXG4gIG9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG59XG5mdW5jdGlvbiByZW1vdmVTdHlsZUVsZW1lbnQoc3R5bGVFbGVtZW50KSB7XG4gIC8vIGlzdGFuYnVsIGlnbm9yZSBpZlxuICBpZiAoc3R5bGVFbGVtZW50LnBhcmVudE5vZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgc3R5bGVFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50KTtcbn1cblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBkb21BUEkob3B0aW9ucykge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKCkge30sXG4gICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHt9XG4gICAgfTtcbiAgfVxuICB2YXIgc3R5bGVFbGVtZW50ID0gb3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gIHJldHVybiB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUob2JqKSB7XG4gICAgICBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaik7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuICAgIH1cbiAgfTtcbn1cbm1vZHVsZS5leHBvcnRzID0gZG9tQVBJOyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbmZ1bmN0aW9uIHN0eWxlVGFnVHJhbnNmb3JtKGNzcywgc3R5bGVFbGVtZW50KSB7XG4gIGlmIChzdHlsZUVsZW1lbnQuc3R5bGVTaGVldCkge1xuICAgIHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKHN0eWxlRWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICBzdHlsZUVsZW1lbnQucmVtb3ZlQ2hpbGQoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgIH1cbiAgICBzdHlsZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gc3R5bGVUYWdUcmFuc2Zvcm07IiwiaW1wb3J0ICcuL3N0eWxlLmNzcyc7XG5pbXBvcnQgbG9naWN0b2RvIGZyb20gJy4vbG9naWN0b2RvLmpzJztcbmltcG9ydCB7IHBsYWNlU2hpcHNET00gfSBmcm9tICcuL2xvZ2ljdG9kby5qcyc7XG5pbXBvcnQgeyBmaWxsU3F1YXJlRE9NIH0gZnJvbSAnLi9sb2dpY3RvZG8uanMnO1xuaW1wb3J0IHsgc2hpcFN1bmtET00gfSBmcm9tICcuL2xvZ2ljdG9kby5qcyc7XG5jb25zdCBwa2cgPSByZXF1aXJlKCcuLi9sb2dpYy5qcycpO1xubG9naWN0b2RvKCk7Ly9ET00gc3R1ZmZcblxuZnVuY3Rpb24gc3RhcnRHYW1lKCkge1xuICAgIC8vLS0tLS1nYW1lIGxvb3Agc3RhcnRcbiAgICBsZXQgUDEgPSBwa2cuUGxheWVyKCdQbGF5ZXIgMScpO1xuICAgIGxldCBQMiA9IHBrZy5QbGF5ZXIoJ0NvbXB1dGVyJyk7XG4gICAgbGV0IGN1cnJlbnRQbGF5ZXIgPSBudWxsO1xuICAgIGxldCB3YWl0aW5nUGxheWVyID0gbnVsbDtcbiAgICAvL2FkZCBpbiBsYXRlciAtIGNob2ljZSBvZiBQdlAgb3IgdnMgQ1BVXG4gICAgLy9uYW1lIGlucHV0IGZvciBwbGF5ZXIocylcblxuICAgIC8vZGVjaWRlIHdobyBnb2VzIGZpcnN0XG4gICAgZnVuY3Rpb24gdHVyblN3aXRjaEhpZGVCb2FyZHMocGxheWVyKSB7Ly9pbnNlcnQgY3VycmVudFBsYXllclxuICAgICAgICBsZXQgcDFTdHVmZnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInAxU2VwZXJhdG9yXCIpO1xuICAgICAgICBsZXQgcDJTdHVmZnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInAyU2VwZXJhdG9yXCIpO1xuICAgICAgICBpZiAocGxheWVyID09PSBQMSkge1xuICAgICAgICAgICAgcDFTdHVmZnMuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgICAgIHAyU3R1ZmZzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgfSBlbHNlIGlmIChwbGF5ZXIgPT09IFAyKSB7XG4gICAgICAgICAgICBwMVN0dWZmcy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgICBwMlN0dWZmcy5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHBpY2tTdGFydGVyKCkge1xuICAgICAgICBsZXQgZ29GaXJzdCA9IE1hdGgucmFuZG9tKCkgPCAwLjUgPyBcIlAxXCIgOiBcIlAyXCI7XG4gICAgICAgIGlmIChnb0ZpcnN0ID09PSBcIlAxXCIpIHtcbiAgICAgICAgICAgIGN1cnJlbnRQbGF5ZXIgPSBQMTtcbiAgICAgICAgICAgIHdhaXRpbmdQbGF5ZXIgPSBQMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGN1cnJlbnRQbGF5ZXIgPSBQMjtcbiAgICAgICAgICAgIHdhaXRpbmdQbGF5ZXIgPSBQMTtcbiAgICAgICAgfVxuICAgICAgICB0dXJuU3dpdGNoSGlkZUJvYXJkcyhjdXJyZW50UGxheWVyKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2hlY2tGb3JXaW4oKSB7XG4gICAgICAgIC8vY2hlY2sgZm9yIHdpbiBmaXJzdFxuICAgICAgICBpZiAoUDEuYWxsU2hpcHNTdW5rKCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUDIgaXMgdGhlIHdpbm5lci4gV2hvbyEhXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoUDIuYWxsU2hpcHNTdW5rKCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUDEgaXMgdGhlIHdpbm5lci4gV2hvbyEhXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcGxheWVyVHVyblN3aXRjaCgpIHtcbiAgICAgICAgLyogLy9jaGVjayBmb3Igd2luIGZpcnN0XG4gICAgICAgIGlmIChQMS5hbGxTaGlwc1N1bmsoKSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJQMiBpcyB0aGUgd2lubmVyLiBXaG9vISFcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoUDIuYWxsU2hpcHNTdW5rKCkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUDEgaXMgdGhlIHdpbm5lci4gV2hvbyEhXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9ICBlbHNlKi8ge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRQbGF5ZXIgPT09IFAyKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFBsYXllciA9IFAxO1xuICAgICAgICAgICAgICAgIHdhaXRpbmdQbGF5ZXIgPSBQMjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFBsYXllciA9IFAyO1xuICAgICAgICAgICAgICAgIHdhaXRpbmdQbGF5ZXIgPSBQMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHR1cm5Td2l0Y2hIaWRlQm9hcmRzKGN1cnJlbnRQbGF5ZXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vcGlja1N0YXJ0ZXIoKTtcbiAgICBjdXJyZW50UGxheWVyID0gUDE7XG4gICAgd2FpdGluZ1BsYXllciA9IFAyO1xuICAgIHR1cm5Td2l0Y2hIaWRlQm9hcmRzKGN1cnJlbnRQbGF5ZXIpO1xuICAgIGNvbnNvbGUubG9nKFwiY3VycmVudFBsYXllciBpcyBcIiwgY3VycmVudFBsYXllcik7XG5cbiAgICAvL3N0YXJ0IHdpdGggdG90YWwgMTAgLS0gZm91ciAxcywgdGhyZWUgMnMsIHR3byAzcywgb25lIDRcbiAgICBQMS5wbGF5ZXJQbGFjZSgnQTInLCAzLCAndmVydGljYWwnKTtcbiAgICBQMS5wbGF5ZXJQbGFjZSgnRDInLCAyLCAnaG9yaXpvbnRhbCcpO1xuICAgIFAxLnBsYXllclBsYWNlKCdINCcsIDEsICd2ZXJ0aWNhbCcpO1xuICAgIFAxLnBsYXllclBsYWNlKCdKMScsIDQsICd2ZXJ0aWNhbCcpO1xuICAgIGxldCBzaGlwU3BhbjFQMSA9IFAxLnBsYXllclBsYWNlU2hpcFNwYW4oJ0EyJywgMywgJ3ZlcnRpY2FsJyk7XG4gICAgbGV0IHNoaXBTcGFuMlAxID0gUDEucGxheWVyUGxhY2VTaGlwU3BhbignRDInLCAyLCAnaG9yaXpvbnRhbCcpO1xuICAgIGxldCBzaGlwU3BhbjNQMSA9IFAxLnBsYXllclBsYWNlU2hpcFNwYW4oJ0g0JywgMSwgJ3ZlcnRpY2FsJyk7XG4gICAgbGV0IHNoaXBTcGFuNFAxID0gUDEucGxheWVyUGxhY2VTaGlwU3BhbignSjEnLCA0LCAndmVydGljYWwnKTtcbiAgICAvL3Rlc3RpbmcgdXNpbmcgdGhlc2Ugc3BhbnMgdG8gZmluZCBpZiBhIHNoaXAncyBjb29yZGluYXRlcyBcbiAgICAvL2FyZSB3aXRoaW4gaXQsIGFuZCB0aGVuIHVzaW5nIHRoYXQgdG8gXCJibG9ja1wiIG91dCBhIHN1bmsgc2hpcFxuICAgIC8vb24gdGhlIERPTVxuICAgIGxldCBjb3B5U3BhbjFQMSA9IHNoaXBTcGFuMVAxLnNsaWNlKCk7XG4gICAgbGV0IGNvcHlTcGFuMlAxID0gc2hpcFNwYW4yUDEuc2xpY2UoKTtcbiAgICBsZXQgY29weVNwYW4zUDEgPSBzaGlwU3BhbjNQMS5zbGljZSgpO1xuICAgIGxldCBjb3B5U3BhbjRQMSA9IHNoaXBTcGFuNFAxLnNsaWNlKCk7XG4gICAgbGV0IGFsbENvcHlTcGFuc1AxID0gW107XG4gICAgYWxsQ29weVNwYW5zUDEucHVzaChjb3B5U3BhbjFQMSk7XG4gICAgYWxsQ29weVNwYW5zUDEucHVzaChjb3B5U3BhbjJQMSk7XG4gICAgYWxsQ29weVNwYW5zUDEucHVzaChjb3B5U3BhbjNQMSk7XG4gICAgYWxsQ29weVNwYW5zUDEucHVzaChjb3B5U3BhbjRQMSk7XG5cbiAgICBQMi5wbGF5ZXJQbGFjZSgnQTInLCAzLCAndmVydGljYWwnKTtcbiAgICBQMi5wbGF5ZXJQbGFjZSgnRDInLCAyLCAnaG9yaXpvbnRhbCcpO1xuICAgIFAyLnBsYXllclBsYWNlKCdINCcsIDEsICd2ZXJ0aWNhbCcpO1xuICAgIFAyLnBsYXllclBsYWNlKCdKMScsIDQsICd2ZXJ0aWNhbCcpO1xuICAgIGxldCBzaGlwU3BhbjFQMiA9IFAyLnBsYXllclBsYWNlU2hpcFNwYW4oJ0EyJywgMywgJ3ZlcnRpY2FsJyk7XG4gICAgbGV0IHNoaXBTcGFuMlAyID0gUDIucGxheWVyUGxhY2VTaGlwU3BhbignRDInLCAyLCAnaG9yaXpvbnRhbCcpO1xuICAgIGxldCBzaGlwU3BhbjNQMiA9IFAyLnBsYXllclBsYWNlU2hpcFNwYW4oJ0g0JywgMSwgJ3ZlcnRpY2FsJyk7XG4gICAgbGV0IHNoaXBTcGFuNFAyID0gUDIucGxheWVyUGxhY2VTaGlwU3BhbignSjEnLCA0LCAndmVydGljYWwnKTtcbiAgICAvL3Rlc3RpbmcgdXNpbmcgdGhlc2Ugc3BhbnMgdG8gZmluZCBpZiBhIHNoaXAncyBjb29yZGluYXRlcyBcbiAgICAvL2FyZSB3aXRoaW4gaXQsIGFuZCB0aGVuIHVzaW5nIHRoYXQgdG8gXCJibG9ja1wiIG91dCBhIHN1bmsgc2hpcFxuICAgIC8vb24gdGhlIERPTVxuICAgIGxldCBjb3B5U3BhbjFQMiA9IHNoaXBTcGFuMVAyLnNsaWNlKCk7XG4gICAgbGV0IGNvcHlTcGFuMlAyID0gc2hpcFNwYW4yUDIuc2xpY2UoKTtcbiAgICBsZXQgY29weVNwYW4zUDIgPSBzaGlwU3BhbjNQMi5zbGljZSgpO1xuICAgIGxldCBjb3B5U3BhbjRQMiA9IHNoaXBTcGFuNFAyLnNsaWNlKCk7XG4gICAgbGV0IGFsbENvcHlTcGFuc1AyID0gW107XG4gICAgYWxsQ29weVNwYW5zUDIucHVzaChjb3B5U3BhbjFQMik7XG4gICAgYWxsQ29weVNwYW5zUDIucHVzaChjb3B5U3BhbjJQMik7XG4gICAgYWxsQ29weVNwYW5zUDIucHVzaChjb3B5U3BhbjNQMik7XG4gICAgYWxsQ29weVNwYW5zUDIucHVzaChjb3B5U3BhbjRQMik7XG4gICAgLy9hZGQgaW4gbGF0ZXIgLSBjaG9vc2luZyB3aGVyZSB0byBwbGFjZSBzaGlwcyFcbiAgICAvL0RPTS9VSSBzZWxlY3Rpb24gPiBmaXJpbmcgcGxheWVyUGxhY2UgY29kZSA+IHNldHRpbmcgbmV3IERPTVxuICAgIC8vb3IgdGhlIHJhbmRvbSBDUFUgc2hpcCBwbGFjZW1lbnQgYmVsb3cgZm9yIHZzIENQVVxuICAgIC8vd2lsbCBhbHNvIG5lZWQgdG8gcHV0IGNvZGUgdG8gSElERSBcbiAgICAvL0NQVSAob3Igb3RoZXIgcGVyc29uJ3MpIGJvYXJkc1xuICAgIFxuICAgIC8qIFAyLmNvbXB1dGVyUGxhY2UoNCk7XG4gICAgUDIuY29tcHV0ZXJQbGFjZSgzKTtcbiAgICBQMi5jb21wdXRlclBsYWNlKDIpO1xuICAgIFAyLmNvbXB1dGVyUGxhY2UoMSk7ICovIC8vcmFuZG9tbHkgcGxhY2VzIGZvciBjb21wdXRlclxuXG4gICAgcGxhY2VTaGlwc0RPTShzaGlwU3BhbjFQMSwgY3VycmVudFBsYXllciwgUDEsIFAyKTtcbiAgICBwbGFjZVNoaXBzRE9NKHNoaXBTcGFuMlAxLCBjdXJyZW50UGxheWVyLCBQMSwgUDIpO1xuICAgIHBsYWNlU2hpcHNET00oc2hpcFNwYW4zUDEsIGN1cnJlbnRQbGF5ZXIsIFAxLCBQMik7XG4gICAgcGxhY2VTaGlwc0RPTShzaGlwU3BhbjRQMSwgY3VycmVudFBsYXllciwgUDEsIFAyKTtcblxuICAgIHBsYWNlU2hpcHNET00oc2hpcFNwYW4xUDIsIHdhaXRpbmdQbGF5ZXIsIFAxLCBQMik7XG4gICAgcGxhY2VTaGlwc0RPTShzaGlwU3BhbjJQMiwgd2FpdGluZ1BsYXllciwgUDEsIFAyKTtcbiAgICBwbGFjZVNoaXBzRE9NKHNoaXBTcGFuM1AyLCB3YWl0aW5nUGxheWVyLCBQMSwgUDIpO1xuICAgIHBsYWNlU2hpcHNET00oc2hpcFNwYW40UDIsIHdhaXRpbmdQbGF5ZXIsIFAxLCBQMik7XG5cbiAgICAvL1AxIChtZSkgZmlyc3QsIG5lZWQgYWRkRXZlbnRMaXN0ZW5lciBmb3IgbXkgXG4gICAgLy9lbmVteSBib2FyZFxuICAgIC8vb25lIGNsaWNrIHdpbGwgaGF2ZSB0byBnZXQgdGhlIGZpcnN0IHR3byBjaGFyIG9mIHNxIElEXG4gICAgLy9hbmQgZG8gZnVuY3Rpb24gKGV4OiBQMS5kaWRBdGtNaXNzKCdBMicsIFAyLmdldEF0dGFja2VkKSlcbiAgICBjb25zdCBQMUVuZW15Qm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1AxVFwiKTtcbiAgICBQMUVuZW15Qm9hcmQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgaWYgKGN1cnJlbnRQbGF5ZXIgIT09IFAxKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZS50YXJnZXQuaWQgPT09IFwiUDFUXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKChlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5jbGFzc05hbWUuc2xpY2UoMCw2KSA9PT0gXCJzcXVhcmVcIiAmJiBlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5pZC5zbGljZSgxLDIpID09PSBcIjBcIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2UgaWYgKChlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5jbGFzc05hbWUuc2xpY2UoMCw2KSA9PT0gXCJzcXVhcmVcIiAmJiBlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5pZC5zbGljZSgwLDUpID09PSBcImVtcHR5XCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgY29vcmRQaWNrZWQgPSBlLnRhcmdldC5jbG9zZXN0KFwiLnNxdWFyZVwiKS5pZC5zbGljZSgwLDIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY29vcmRQaWNrZWQgd2FzIFwiLCBjb29yZFBpY2tlZCk7XG4gICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IFAxLmRpZEF0a01pc3MoY29vcmRQaWNrZWQsIFAyLmdldEF0dGFja2VkKTtcbiAgICAgICAgICAgICAgICBsZXQgZGlkSVNpbmtBU2hpcCA9IFAyLmdldFNoaXBGb3JPcHAoY29vcmRQaWNrZWQpO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgIT09IGZhbHNlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy9leGNsdWRlcyBmYWxzZSB3aGVuIGNvb3JkIGlzIGFscmVhZHkgaGl0L21pc3NlZFxuICAgICAgICAgICAgICAgICAgICBsZXQgc3FIb2xkZXJDb29yZCA9IHJlc3VsdC5zbGljZSg1KTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGhpdE1pc3MgPSByZXN1bHQuc2xpY2UoMCw0KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJzcUhvbGRlckNvb3JkOiBcIiwgc3FIb2xkZXJDb29yZCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaGl0TWlzczogXCIsIGhpdE1pc3MpO1xuICAgICAgICAgICAgICAgICAgICBmaWxsU3F1YXJlRE9NKHNxSG9sZGVyQ29vcmQsIGhpdE1pc3MsIGN1cnJlbnRQbGF5ZXIsIFAxLCBQMik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkaWRJU2lua0FTaGlwICE9PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkaWRJU2lua0FTaGlwLmdldEhpdHMoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkaWRJU2lua0FTaGlwLmlzU3VuaygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vLS0tLS0tLS0tLS0tbWFrZSB0aGlzIHNvIGl0J2xsIGRpc3BsYXlcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhhdCBhIHNoaXAgaGFzIFNVTksgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlkSVNpbmtBU2hpcC5pc1N1bmsoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhcnJheU9mRE9NID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsQ29weVNwYW5zUDIuZm9yRWFjaChhcnJheSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhcnJMZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgYXJyTGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcnJheVtrXS5pbmNsdWRlcyhgJHtjb29yZFBpY2tlZH1gKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5T2ZET00gPSBhcnJheTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGFycmF5T2ZET00pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5T2ZET00uZm9yRWFjaChleiA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhcnJTdHJpbmcgPSBlelswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hpcFN1bmtET00oYXJyU3RyaW5nLCBjdXJyZW50UGxheWVyLCBQMSwgUDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJQMSBteUhpdHM6IFwiLCBQMS5teUhpdHMpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlAxIG15TWlzc2VzOiBcIiwgUDEubXlNaXNzZXMpO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy9wbGF5ZXJUdXJuU3dpdGNoKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGVja0ZvcldpbigpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChwbGF5ZXJUdXJuU3dpdGNoLCAxMDAwKTsvL2dpdmUgaXQgdGltZVxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChjb21wdXRlclR1cm4sIDI0MDApO1xuICAgICAgICAgICAgICAgICAgICB9Ly9jb21wdXRlciBcInRoaW5raW5nXCJcbiAgICAgICAgICAgICAgICAgICAgLy9jb21wdXRlclR1cm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxuICAgIFxuICAgIGNvbnN0IFAyRW5lbXlCb2FyZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjUDJUXCIpO1xuICAgIFAyRW5lbXlCb2FyZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICBpZiAoY3VycmVudFBsYXllciAhPT0gUDIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChlLnRhcmdldC5pZCA9PT0gXCJQMlRcIikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmNsYXNzTmFtZS5zbGljZSgwLDYpID09PSBcInNxdWFyZVwiICYmIGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmlkLnNsaWNlKDEsMikgPT09IFwiMFwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmNsYXNzTmFtZS5zbGljZSgwLDYpID09PSBcInNxdWFyZVwiICYmIGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmlkLnNsaWNlKDAsNSkgPT09IFwiZW1wdHlcIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBjb29yZFBpY2tlZCA9IGUudGFyZ2V0LmNsb3Nlc3QoXCIuc3F1YXJlXCIpLmlkLnNsaWNlKDAsMik7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJjb29yZFBpY2tlZCB3YXMgXCIsIGNvb3JkUGlja2VkKTtcbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0ID0gUDIuZGlkQXRrTWlzcyhjb29yZFBpY2tlZCwgUDEuZ2V0QXR0YWNrZWQpO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vZXhjbHVkZXMgZmFsc2Ugd2hlbiBjb29yZCBpcyBhbHJlYWR5IGhpdC9taXNzZWRcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNxSG9sZGVyQ29vcmQgPSByZXN1bHQuc2xpY2UoNSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBoaXRNaXNzID0gcmVzdWx0LnNsaWNlKDAsNCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic3FIb2xkZXJDb29yZDogXCIsIHNxSG9sZGVyQ29vcmQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImhpdE1pc3M6IFwiLCBoaXRNaXNzKTtcbiAgICAgICAgICAgICAgICAgICAgZmlsbFNxdWFyZURPTShzcUhvbGRlckNvb3JkLCBoaXRNaXNzLCBjdXJyZW50UGxheWVyLCBQMSwgUDIpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlAyIG15SGl0czogXCIsIFAyLm15SGl0cyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUDIgbXlNaXNzZXM6IFwiLCBQMi5teU1pc3Nlcyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGVja0ZvcldpbigpID09PSBmYWxzZSkgeyBcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQocGxheWVyVHVyblN3aXRjaCwgMTUwMCk7Ly9naXZlIGl0IHRpbWVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvL3BsYXllclR1cm5Td2l0Y2goKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxuXG4gICAgZnVuY3Rpb24gY29tcHV0ZXJUdXJuKCkge1xuICAgICAgICAvL2N1cnJlbnQgcGxheWVyIGp1c3Qgc3dpdGNoZWQgdG8gUDIsIGFrYSBDb21wdXRlclxuICAgICAgICAvL2FkZCBzZXRUaW1lb3V0IGxhdGVyIHRvIHNob3cgY29tcHV0ZXIgXCJ0aGlua2luZ1wiXG4gICAgICAgIGxldCByZXN1bHQgPSBQMi5kaWRBdGtNaXNzKFAyLnJhbmRvbUF0a0Nob2ljZSgpLCBQMS5nZXRBdHRhY2tlZCk7XG4gICAgICAgIGxldCBzcUhvbGRlckNvb3JkID0gcmVzdWx0LnNsaWNlKDUpO1xuICAgICAgICBsZXQgaGl0TWlzcyA9IHJlc3VsdC5zbGljZSgwLDQpO1xuICAgICAgICAvLy0tLUNIQU5HRSBDT0RFIEFCT1ZFIHNvIHRoYXQgaXQncyBmcm9tIDUgdG8gdGhlIGVuZFxuICAgICAgICBjb25zb2xlLmxvZyhcInJlc3VsdDogXCIsIHJlc3VsdCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3FIb2xkZXJDb29yZDogXCIsIHNxSG9sZGVyQ29vcmQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcImhpdE1pc3M6IFwiLCBoaXRNaXNzKTtcbiAgICAgICAgZmlsbFNxdWFyZURPTShzcUhvbGRlckNvb3JkLCBoaXRNaXNzLCBjdXJyZW50UGxheWVyLCBQMSwgUDIpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIlAyIG15SGl0czogXCIsIFAyLm15SGl0cyk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiUDIgbXlNaXNzZXM6IFwiLCBQMi5teU1pc3Nlcyk7XG4gICAgICAgIGlmIChjaGVja0ZvcldpbigpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgc2V0VGltZW91dChwbGF5ZXJUdXJuU3dpdGNoLCAxNTAwKTsvL2dpdmUgaXQgdGltZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyogUDEuZGlkQXRrTWlzcygnQTInLCBQMi5nZXRBdHRhY2tlZCk7XG4gICAgUDIuZGlkQXRrTWlzcyhQMi5yYW5kb21BdGtDaG9pY2UoKSwgUDEuZ2V0QXR0YWNrZWQpO1xuICAgIGNvbnNvbGUubG9nKFAxLnBsYXllckJvYXJkKTtcbiAgICBjb25zb2xlLmxvZyhQMi5wbGF5ZXJCb2FyZCk7XG4gICAgY29uc29sZS5sb2coUDEubXlIaXRzKTtcbiAgICBjb25zb2xlLmxvZyhQMi5teUhpdHMpO1xuICAgIGNvbnNvbGUubG9nKFAyLm15TWlzc2VzKTsgKi9cbn1cblxuc3RhcnRHYW1lKCk7XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBsb2dpY3RvZG8oKSB7XG5cbiAgICBsZXQgZ2FtZWJvYXJkcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJnYW1lYm9hcmRcIik7XG4gICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChnYW1lYm9hcmRzLCBmdW5jdGlvbihlbCkge1xuICAgICAgICBsZXQgbGV0dGVyTnVtYkFyciA9IFsnZW1wdHknLCdBJywnQicsJ0MnLCdEJywnRScsJ0YnLCdHJywnSCcsJ0knLCdKJ107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTE7IGkrKykge1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCAxMTsgaisrKSB7XG4gICAgICAgICAgICAgICAgbGV0IG5ld1NxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgICAgICBuZXdTcS5jbGFzc05hbWUgPSBgc3F1YXJlYDtcbiAgICAgICAgICAgICAgICBsZXQgc29tZUNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgICAgIHNvbWVDb250ZW50LmNsYXNzTmFtZSA9IFwiY29udGVudHpcIjtcbiAgICAgICAgICAgICAgICBpZiAoaiA9PT0gMCAmJiBpICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNvbWVDb250ZW50LmlubmVySFRNTCA9IGAke2l9YDtcbiAgICAgICAgICAgICAgICB9IFxuICAgICAgICAgICAgICAgIGlmIChpID09PSAwICYmIGogIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc29tZUNvbnRlbnQuaW5uZXJIVE1MID0gYCR7bGV0dGVyTnVtYkFycltqXX1gXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1NxLmFwcGVuZENoaWxkKHNvbWVDb250ZW50KTtcbiAgICAgICAgICAgICAgICBlbC5hcHBlbmRDaGlsZChuZXdTcSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGxldCBmaXJzdFNlY3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAxR1wiKTtcbiAgICBsZXQgc2V0U3F1YXJlcyA9IGZpcnN0U2VjdGlvbi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwic3F1YXJlXCIpO1xuICAgIGxldCBzZXRTcUFycmF5ID0gQXJyYXkuZnJvbShzZXRTcXVhcmVzKTsvL2NvbnZlcnQgdG8gYXJyYXlcblxuICAgIGxldCBzZWNvbmRTZWN0aW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMVRcIik7XG4gICAgbGV0IHNldFNlY29uZFNxdWFyZXMgPSBzZWNvbmRTZWN0aW9uLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJzcXVhcmVcIik7XG4gICAgbGV0IHNldFNlY29uZFNxQXJyYXkgPSBBcnJheS5mcm9tKHNldFNlY29uZFNxdWFyZXMpOy8vY29udmVydCB0byBhcnJheVxuXG4gICAgbGV0IHRoaXJkU2VjdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDJHXCIpO1xuICAgIGxldCBzZXRUaGlyZFNxdWFyZXMgPSB0aGlyZFNlY3Rpb24uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInNxdWFyZVwiKTtcbiAgICBsZXQgc2V0VGhpcmRTcUFycmF5ID0gQXJyYXkuZnJvbShzZXRUaGlyZFNxdWFyZXMpOy8vY29udmVydCB0byBhcnJheVxuXG4gICAgbGV0IGZvdXJ0aFNlY3Rpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAyVFwiKTtcbiAgICBsZXQgc2V0Rm91cnRoU3F1YXJlcyA9IGZvdXJ0aFNlY3Rpb24uZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInNxdWFyZVwiKTtcbiAgICBsZXQgc2V0Rm91cnRoU3FBcnJheSA9IEFycmF5LmZyb20oc2V0Rm91cnRoU3F1YXJlcyk7Ly9jb252ZXJ0IHRvIGFycmF5XG5cbiAgICBmdW5jdGlvbiBzZXRDb2x1bW5zKHNvbWVBcnJheSwgbmFtZSkge1xuXG4gICAgICAgIGxldCBsZXR0ZXJOdW1iQXJyID0gWydlbXB0eScsJ0EnLCdCJywnQycsJ0QnLCdFJywnRicsJ0cnLCdIJywnSScsJ0onXTtcbiAgICAgICAgbGV0IGowID0gMDtcbiAgICAgICAgbGV0IGoxID0gMDtcbiAgICAgICAgbGV0IGoyID0gMDtcbiAgICAgICAgbGV0IGozID0gMDtcbiAgICAgICAgbGV0IGo0ID0gMDtcbiAgICAgICAgbGV0IGo1ID0gMDtcbiAgICAgICAgbGV0IGo2ID0gMDtcbiAgICAgICAgbGV0IGo3ID0gMDtcbiAgICAgICAgbGV0IGo4ID0gMDtcbiAgICAgICAgbGV0IGo5ID0gMDtcbiAgICAgICAgbGV0IGoxMCA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc29tZUFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSUxMSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5jbGFzc05hbWUgPSBgc3F1YXJlICR7bGV0dGVyTnVtYkFyclswXX1gO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLnNldEF0dHJpYnV0ZShcImlkXCIsIGAke2xldHRlck51bWJBcnJbMF19JHtbajBdfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgIGowKys7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGklMTEgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbMV19YDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLnNldEF0dHJpYnV0ZShcImlkXCIsIGAke2xldHRlck51bWJBcnJbMV19JHtbajFdfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqMSsrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmIChpJTExID09PSAyKSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzJdfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzJdfSR7W2oyXX1fYCtuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgajIrKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gMykge1xuICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5jbGFzc05hbWUgPSBgc3F1YXJlICR7bGV0dGVyTnVtYkFyclszXX1gO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFyclszXX0ke1tqM119X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGozKys7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGklMTEgPT09IDQpIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbNF19YDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLnNldEF0dHJpYnV0ZShcImlkXCIsIGAke2xldHRlck51bWJBcnJbNF19JHtbajRdfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqNCsrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmIChpJTExID09PSA1KSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzVdfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzVdfSR7W2o1XX1fYCtuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgajUrKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gNikge1xuICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5jbGFzc05hbWUgPSBgc3F1YXJlICR7bGV0dGVyTnVtYkFycls2XX1gO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFycls2XX0ke1tqNl19X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGo2Kys7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGklMTEgPT09IDcpIHtcbiAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uY2xhc3NOYW1lID0gYHNxdWFyZSAke2xldHRlck51bWJBcnJbN119YDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLnNldEF0dHJpYnV0ZShcImlkXCIsIGAke2xldHRlck51bWJBcnJbN119JHtbajddfV9gK25hbWUpO1xuICAgICAgICAgICAgICAgICAgICBqNysrO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIGlmIChpJTExID09PSA4KSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzhdfWA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBgJHtsZXR0ZXJOdW1iQXJyWzhdfSR7W2o4XX1fYCtuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgajgrKztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaSUxMSA9PT0gOSkge1xuICAgICAgICAgICAgICAgIHNvbWVBcnJheVtpXS5jbGFzc05hbWUgPSBgc3F1YXJlICR7bGV0dGVyTnVtYkFycls5XX1gO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFycls5XX0ke1tqOV19X2ArbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGo5Kys7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGklMTEgPT09IDEwKSB7XG4gICAgICAgICAgICAgICAgc29tZUFycmF5W2ldLmNsYXNzTmFtZSA9IGBzcXVhcmUgJHtsZXR0ZXJOdW1iQXJyWzEwXX1gO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBzb21lQXJyYXlbaV0uc2V0QXR0cmlidXRlKFwiaWRcIiwgYCR7bGV0dGVyTnVtYkFyclsxMF19JHtbajEwXX1fYCtuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgajEwKys7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0Q29sdW1ucyhzZXRTcUFycmF5LCBcImZpcnN0T25lXCIpO1xuICAgIHNldENvbHVtbnMoc2V0U2Vjb25kU3FBcnJheSwgXCJzZWNvbmRPbmVcIik7XG4gICAgc2V0Q29sdW1ucyhzZXRUaGlyZFNxQXJyYXksIFwidGhpcmRPbmVcIik7XG4gICAgc2V0Q29sdW1ucyhzZXRGb3VydGhTcUFycmF5LCBcImZvdXJ0aE9uZVwiKTtcblxuICAgIFxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxhY2VTaGlwc0RPTShhcnJheSwgcGxheWVyLCBQMSwgUDIpIHsvL2FycmF5IGZyb20gcGxheWVyUGxhY2VTaGlwU3BhblxuICAgIGlmIChwbGF5ZXIgPT09IFAxKSB7XG4gICAgICAgIGFycmF5LmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgbGV0IHN0ciA9IGVsWzBdO1xuICAgICAgICAgICAgbGV0IHNwZWNpZmljU3FGb3VuZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGAke3N0cn1fZmlyc3RPbmVgKTtcbiAgICAgICAgICAgIHNwZWNpZmljU3FGb3VuZC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcImJsdWVcIjtcbiAgICAgICAgfSlcbiAgICB9IGVsc2UgaWYgKHBsYXllciA9PT0gUDIpIHtcbiAgICAgICAgYXJyYXkuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBsZXQgc3RyID0gZWxbMF07XG4gICAgICAgICAgICBsZXQgc3BlY2lmaWNTcUZvdW5kID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7c3RyfV90aGlyZE9uZWApO1xuICAgICAgICAgICAgc3BlY2lmaWNTcUZvdW5kLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiZ3JlZW5cIjtcbiAgICAgICAgfSlcbiAgICB9XG4gICAgXG59ICBcblxuZXhwb3J0IGZ1bmN0aW9uIGZpbGxTcXVhcmVET00oc3RyLCBoaXRPck1pc3MsIHBsYXllciwgUDEsIFAyKSB7Ly9pbnB1dCBzdHJpbmcgb2YgY29vcmRcbiAgICBpZiAocGxheWVyID09PSBQMSkge1xuICAgICAgICBsZXQgc3FUb0NoYW5nZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGAke3N0cn1fc2Vjb25kT25lYCk7XG4gICAgICAgIGlmIChoaXRPck1pc3MgPT09IFwibWlzc1wiKSB7XG4gICAgICAgICAgICBzcVRvQ2hhbmdlLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwid2hpdGVcIjtcbiAgICAgICAgfSBlbHNlIGlmIChoaXRPck1pc3MgPT09IFwiaGl0c1wiKSB7XG4gICAgICAgICAgICBzcVRvQ2hhbmdlLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiZGFya29yYW5nZVwiO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChwbGF5ZXIgPT09IFAyKSB7XG4gICAgICAgIGxldCBzcVRvQ2hhbmdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7c3RyfV9mb3VydGhPbmVgKTtcbiAgICAgICAgaWYgKGhpdE9yTWlzcyA9PT0gXCJtaXNzXCIpIHtcbiAgICAgICAgICAgIHNxVG9DaGFuZ2Uuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJ3aGl0ZVwiO1xuICAgICAgICB9IGVsc2UgaWYgKGhpdE9yTWlzcyA9PT0gXCJoaXRzXCIpIHtcbiAgICAgICAgICAgIHNxVG9DaGFuZ2Uuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJkYXJrb3JhbmdlXCI7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaGlwU3Vua0RPTShzdHIsIHBsYXllciwgUDEsIFAyKSB7Ly9pbnB1dCBzdHJpbmcgY29vcmRcbiAgICBpZiAocGxheWVyID09PSBQMSkgeyBcbiAgICAgICAgbGV0IHNxVG9TaW5rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7c3RyfV9zZWNvbmRPbmVgKTtcbiAgICAgICAgc3FUb1Npbmsuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJibGFja1wiO1xuICAgIH0gZWxzZSBpZiAocGxheWVyID09PSBQMikge1xuXG4gICAgICAgIGxldCBzcVRvU2luayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGAke3N0cn1fZm91cnRoT25lYCk7XG4gICAgICAgIHNxVG9TaW5rLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiYmxhY2tcIjtcbiAgICB9XG59Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9