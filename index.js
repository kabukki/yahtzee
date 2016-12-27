"use strict";

//TODO
//Passer à une classe (POO) : plus besoin des yz.*
var yz = module.exports;

var turn = 0;

/* Expose */
yz.players = [];
yz.dice = [1, 1, 1, 1, 1];
yz.remRolls = 3;
yz.scores = {
	"score1": {"name": "1 (somme des 1)", "points": []},
	"score2": {"name": "2 (somme des 2)", "points": []},
	"score3": {"name": "3 (somme des 3)", "points": []},
	"score4": {"name": "4 (somme des 4)", "points": []},
	"score5": {"name": "5 (somme des 5)", "points": []},
	"score6": {"name": "6 (somme des 6)", "points": []},
	"scoreBrelan": {"name": "Brelan (3 identiques)", "points": []},
	"scoreCarre": {"name": "Carré (4 identiques)", "points": []},
	"scoreFull": {"name": "Full (25)", "points": []},
	"scorePS": {"name": "Petite suite (30)", "points": []},
	"scoreGS": {"name": "Grande suite (40)", "points": []},
	"scoreYahtzee": {"name": "Yahtzee (50)", "points": []},
	"scoreChance": {"name": "Chance (somme des dés)", "points": []}
};

/* Getters */
function getSubtotal(player) {
	var subtotal = 0,
		i = 0;

	for (var type in yz.scores) {
		if (i == 6)
			break ;
		subtotal += yz.scores[type].points[player];
		i++;
	}
	return subtotal + (subtotal >= 63 ? 35 : 0);
}
yz.getSubtotals = function() {
	var subtotals = [];

	for (var i = 0; i < yz.players.length; i++) {
		subtotals[i] = getSubtotal(i);
	}
	return subtotals;
}
function getTotal(player) {
	var total = 0,
		i = 0;

	for (var type in yz.scores) {
		if (i == 6)
			total += (total >= 63 ? 35 : 0);
		total += yz.scores[type].points[player];
		i++;
	}
	return total;
}
yz.getTotals = function() {
	var totals = [];

	for (var i = 0; i < yz.players.length; i++) {
		totals[i] = getTotal(i);
	}
	return totals;
}
function getSum(filter) {
	var sum = 0,
		values = yz.dice;
	for (var i = 0; i < values.length; i++) {
		sum += (filter ? (values[i] == filter ? values[i] : 0) : values[i]);
	}
	return sum;
}
/**
 *	Retourne le nombre de points marqués pour la combinaison renseignée
 *	@param	{string} type - la combinaison visée
 *	@return {int} la valeur correspondante à la combinaison. Si -1, la combinaison n'existe pas
 */
yz.getValue = function(type) {
	var value = -1;

	switch (type) {
		case "score1": 			value = getSum(1); break;
		case "score2": 			value = getSum(2); break;
		case "score3": 			value = getSum(3); break;
		case "score4": 			value = getSum(4); break;
		case "score5": 			value = getSum(5); break;
		case "score6": 			value = getSum(6); break;
		case "scoreBrelan": 	value = isBrelan() ? getSum() : 0; break;
		case "scoreCarre": 		value = isCarre() ? getSum() : 0; break;
		case "scoreFull": 		value = isFull() ? 25 : 0; break;
		case "scorePS": 		value = isPS() ? 30 : 0; break;
		case "scoreGS": 		value = isGS() ? 40 : 0; break;
		case "scoreYahtzee": 	value = isYahtzee() ? 50 : 0; break;
		case "scoreChance": 	value = getSum(); break;
		default: 				console.log("Ligne indisponible"); break;
	}
	return value;
}

/*** check for combinations ***/
function isBrelan() {
	var occ = getOccurrences();
	return (occ.indexOf(3) != -1 ||
			occ.indexOf(4) != -1 ||
			occ.indexOf(5) != -1);
}
function isCarre() {
	var occ = getOccurrences();
	return (occ.indexOf(4) != -1 ||
			occ.indexOf(5) != -1);
}
function isFull() {
	var occ = getOccurrences();
	return (occ.indexOf(3) != -1 &&
			occ.indexOf(2) != -1);
}
function isPS() {
	var values = uniq(yz.dice),//déjà trié
		row = 1;
	for (var i = 0; i < values.length - 1; i++) {
		if (values[i] + 1 == values[i + 1])
			row++;
		else if (row < 4)
			row = 1;
	}
	return row >= 4;
}
function isGS() {
	var values = yz.dice.sort(),
		row = 1;
	for (var i = 0; i < values.length - 1; i++) {
		if (values[i] + 1 == values[i + 1])
			row++;
	}
	return row == 5;
}
function isYahtzee() {
	var occ = getOccurrences();
	return (occ.indexOf(5) != -1);
}
/**
 * Retourne un tableau[6] contenant le nombre d'occurences pour le nombre [i+1]
 * ex: [1, 1, 6, 5, 1]
 * donnera: [3, 0, 0, 0, 1, 1]
 */
function getOccurrences() {
	var dup = [0, 0, 0, 0, 0, 0],
		values = yz.dice;

	for (var i = 1; i <= 6; i++) {
		for (var j = 0; j < values.length; j++) {
			if (values[j] == i)
				dup[i - 1]++;
		}
	}
	return dup;
}

/**********************/
/*** main functions ***/
/**********************/

/**
 * Commence un nouveau tour (joueur suivant)
 */
yz.newTurn = function() {
	turn++;
	yz.remRolls = 3;
}
/**
  *	Actualise les dés et remRolls (DRY)
  *	@param	{boolean[]} diceToRoll - les dés à jeter
  */
yz.doRoll = function (diceToRoll) {
	yz.dice = yz.roll(diceToRoll);
	yz.remRolls--;
}
/**
  *	Ajoute un score à la liste des scores pour le joueur courant
  *	@param 	{string} type - la combinaison concernée
  * @param	{int} value - la valeur à indiquer
  */
yz.score = function(type, value) {
	yz.scores[type].points[turn % yz.players.length] = value;
}
/**
  *	Lance les dés 
  *	@param 	{boolean[]} dice - un array contenant les des à lancer (ex: [true, false, true, true, false] lancera les dés 0, 2, 3)
  *	@return	le nouveau set de dés
  */
yz.roll = function(diceToRoll) {
	var _dice = yz.dice;

	if (diceToRoll == undefined)
		diceToRoll = [true, true, true, true, true];
	for (var i = 0; i < diceToRoll.length; i++) {
		if (diceToRoll[i])
			_dice[i] = Math.floor(Math.random() * 6 + 1);
	}
	return _dice;
}
/**
 *	Réinitialise la partie
 */
yz.reset = function() {
	yz.dice = [1, 1, 1, 1, 1];
	turn = 0;
	yz.remRolls = 3;
	for (var type in yz.scores)
		yz.scores[type].points = [];
}
yz.whoseTurn = function() {
	return turn % yz.players.length;
}
yz.isOver = function() {
	return turn >= yz.players.length * 13;
}
yz.hasStarted = function() {
	return turn > 0 || yz.remRolls < 3;
}



/**************************/
/*** Players management ***/
/**************************/

/**
 *	Ajoute un joueur à la partie. Si le joueur est déjà présent, ne fait rien
 *	@param	{string} player - le nom du joueur à rajouter
 */
yz.addPlayer = function(player) {
	if (!yz.isPlayer(player)) {
		yz.players.push(player);
	}
}
/**
 *	Enlève un joueur de la liste des joueurs
 *	@param {string} player - le nom du joueur à enlever
 */
yz.removePlayer = function(player) {
	var i = yz.players.indexOf(player);
	if (i != -1) {
		//TODO
		// Si la partie a commencé, rééquilibre le tour actuel
		//turn -= turn / yz.players.length;
		yz.players.splice(i, 1);
	}
}
/**
 *	Indique si un joueur est présent
 *	@param	{string} player - le nom du joueur à chercher
 *	@return true si le joueur existe, false sinon
 */
yz.isPlayer = function(player) {
	return yz.players.indexOf(player) != -1;
}
/**
 *	Supprime les scores du joueur concerné
 *	@param	{stirng} player - le nom du joueur dont les scores doivent être supprimés
 */
yz.removeScore = function(player) {
	for (var type in yz.scores) {
		yz.scores[type].points.splice(player, 1);
	}
}

/**************/
/*** Helper ***/
/**************/

/**
 *	Trie un tableau et supprime ses doublons
 *	@param	a - l'array à traiter
 *	@return	une version de l'array rentré en paramètre trié et sans doublon 
 */
function uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    })
}

