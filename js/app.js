var app = angular.module('myApp', []);

app.controller('pokemonCtrl', function($scope, $http, $window) {

	var totalAvailablePokemon = 248;
	var totalFightingPokemon = 6;

	function resetGame() {
		$scope.currentPokemon = null;
		$scope.enemyPokemon = null;
		$scope.pokemonDefeated = 0;
		$scope.experiencedGained = 0;
		$scope.pokemonRemaining = totalFightingPokemon;
		$scope.playersTurn = true;
		$scope.pokemons = [];
	}

	$scope.startGame = function() {

		$( document ).ready(function() {
			stopAudio("battle-music");
			playAudio("battle-music");
		});
		resetGame();
		loadEnemy();
		loadPokemons();
		$scope.gameReady = true;
	}
	//startGame();

	function loadEnemy() {
		var id = Math.floor((Math.random() * totalAvailablePokemon) + 1);
		getPokemon(id).then(function(response) {

			var pokemon = response.data;
			var moves = getMoves(pokemon);
			var hp = pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat;
			
			$scope.enemyPokemon = {
				name: pokemon.name.split("-")[0].toUpperCase(),
				imageFront: pokemon.sprites.front_default,
				imageBack: pokemon.sprites.back_default,
				baseExperience: pokemon.base_experience,
				totalHp: hp,
				currentHp: hp,
				moves: moves
			};

			$scope.playersTurn = true;

		}, function(error) {
			console.log("error");
		});
	}

	function loadPokemons() {

		for(var i=0; i<6; i++) {

			var id = Math.floor((Math.random() * totalAvailablePokemon) + 1);
			getPokemon(id).then(function(response) {
				var pokemon  = response.data;
				var moves = getMoves(pokemon);
				var hp = parseInt(pokemon.stats.find(stat => stat.stat.name === 'hp').base_stat);

				var newPokemon = {
					id: id,
					name: pokemon.name.split("-")[0].toUpperCase(),
					imageFront: pokemon.sprites.front_default,
					imageBack: pokemon.sprites.back_default,
					baseExperience: pokemon.base_experience,
					totalHp: hp,
					currentHp: hp,
					moves: moves
				};

				$scope.pokemons.push(newPokemon);

				if(!$scope.currentPokemon) {
					$scope.setCurrentPokemon(newPokemon);
				}

			}, function(error) {
				console.log(error);
			});
		}

	}


	function getMoves(pokemon) {

		var moves = [];
		while(moves.length < 4) {
			var index = Math.floor((Math.random() * (pokemon.moves.length-1)));
			moves.push(pokemon.moves[index].move);
		}
		return moves;
	}


	$scope.attackEnemy = function(move, index) {
		console.log(index);
		if(!$scope.currentPokemon.dead) {
			playAudio("beep");
			$(".current-pokemon").animate({left: '250px', bottom:'80px'});
			$('.enemy-pokemon').ClassyWiggle();
			$scope.playersTurn = false;
			$scope.gameStatus = $scope.currentPokemon.name + " uses " + capitalize(move.name);
			if(!move.power) {
				console.log('get move stuff')
				var url = move.url;
				$http.get(url).then(function(response) {
					if(!response.data.power) {
						response.data.power = 0
					}
					// cache move power
					$scope.currentPokemon.moves[index].power = response.data.power;
					// update enemy health and movements accordingly
					enemyAttackedHandler(response.data.power);

				}, function(error) {
					console.log(error);
				})
			}
			else {
				$window.setTimeout(function() {
					// update enemy health of movements accordingly
					enemyAttackedHandler(move.power);
				},500);
			}
		}
	}

	function enemyAttackedHandler(power) {

		$(".current-pokemon").animate({left: '0px', bottom:'0px'});
		$('.enemy-pokemon').ClassyWiggle("stop");
		var newHp = $scope.enemyPokemon.currentHp - (power/2 + 5);
		if(newHp > 0) {
			$scope.enemyPokemon.currentHp = newHp;
			$window.setTimeout(function() {
				$scope.attackCurrentPokemon();
			}, 500);
		}
		else {
			playAudio("death");
			$scope.enemyPokemon.currentHp = 0;
			$scope.enemyPokemon.dead = true;
			$scope.pokemonDefeated++;
			$scope.experiencedGained += $scope.enemyPokemon.baseExperience;
			loadEnemy();
		}
	}

	$scope.attackCurrentPokemon = function() {
		if(!$scope.playersTurn) {
			$('.current-pokemon').ClassyWiggle();
			var index = Math.floor(Math.random() * $scope.enemyPokemon.moves.length);
			var move = $scope.enemyPokemon.moves[index];
			$scope.gameStatus = $scope.enemyPokemon.name + " uses " + capitalize(move.name);
			console.log(move);
			if(!move.power) {
				var url = move.url;
				$http.get(url).then(function(response) {
					if(!response.data.power) {
						response.data.power = 0
					}
					// cache move power
					$scope.enemyPokemon.moves[index].power = response.data.power;
					// update current pokemon health and movements accordingly
					currentPokemonAttackedHandler(response.data.power);

				}, function(error) {
					console.log(error);
				});
			}
			else {
				$window.setTimeout(function() {
					currentPokemonAttackedHandler(move.power);
				}, 500);
			}
		}
	}

	function currentPokemonAttackedHandler(power) {

		$('.current-pokemon').ClassyWiggle("stop");
		var newHp = $scope.currentPokemon.currentHp - (power/2 + 5);
		if(newHp > 0) {
			$scope.currentPokemon.currentHp = newHp;
		}
		else {
			playAudio("death");
			$scope.currentPokemon.currentHp = 0;
			$scope.currentPokemon.dead = true;
			$scope.pokemonRemaining--;
			if($scope.pokemonRemaining <= 0) {
				$scope.gameReady = false;
			}
		}
		$scope.playersTurn = true;
	}

	$scope.setCurrentPokemon = function(pokemon) {
		if(!pokemon.dead) {
			$scope.currentPokemon = pokemon;
		}
	}

	function playAudio(audioId) {
		document.getElementById(audioId).play();
	}

	function stopAudio(audioId) {
		var sound = document.getElementById(audioId);
		sound.pause();
		sound.currentTime = 0;
	}

	function getPokemon(number) {
		return $http.get("http://pokeapi.co/api/v2/pokemon/" + number);
	}

	function getPokemonForm(number) {
		return $http.get("http://pokeapi.co/api/v2/pokemon-form/" + number);
	}

	function capitalize(input) {
		return input.charAt(0).toUpperCase() + input.substr(1).toLowerCase();
	}

});


app.filter('capitalize', function() {
    return function(input) {
    	// used for moves
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});