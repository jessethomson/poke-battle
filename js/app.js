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
				name: pokemon.name.split("-")[0],
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
					name: pokemon.name.split("-")[0],
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


	$scope.attackEnemy = function(move) {
		if(!$scope.currentPokemon.dead) {
			playAudio("beep");
			$(".current-pokemon").animate({left: '250px', bottom:'80px'});
			$('.enemy-pokemon').ClassyWiggle();
			$scope.playersTurn = false;
			$scope.gameStatus = capitalize($scope.currentPokemon.name) + " uses " + capitalize(move.name);
			console.log($scope.gameStatus);
			var url = move.url;
			$http.get(url).then(function(response) {
				$(".current-pokemon").animate({left: '0px', bottom:'0px'});
				$('.enemy-pokemon').ClassyWiggle("stop");
				var newHp = $scope.enemyPokemon.currentHp - (response.data.power/2 + 5);
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
			}, function(error) {
				console.log(error);
			})
		}
	}

	$scope.attackCurrentPokemon = function() {
		if(!$scope.playersTurn) {
			$('.current-pokemon').ClassyWiggle();
			var index = Math.floor(Math.random() * $scope.enemyPokemon.moves.length);
			var move = $scope.enemyPokemon.moves[index];
			$scope.gameStatus = capitalize($scope.enemyPokemon.name) + " uses " + capitalize(move.name);
			console.log($scope.gameStatus);
			var url = move.url;
			$http.get(url).then(function(response) {
				$('.current-pokemon').ClassyWiggle("stop");
				var newHp = $scope.currentPokemon.currentHp - (response.data.power/2 + 5);
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
			}, function(error) {
				console.log(error);
			});
		}
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
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});