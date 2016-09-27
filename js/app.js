var app = angular.module('myApp', []);

app.controller('pokemonCtrl', function($scope, $http, $window) {

	var totalAvailablePokemon = 248;
	var totalFightingPokemon = 6;

	function startGame() {
		$scope.gameHeight = window.innerHeight;
		$scope.pokemonDefeated = 0;
		$scope.pokemonRemaining = totalFightingPokemon;
		$scope.playersTurn = true;
		$scope.pokemons = [];
		loadEnemy();
		loadPokemons();

		var globalThing = {};
	}
	startGame();

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
		console.log(pokemon.moves);
		var moves = [];
		while(moves.length < 4) {
			var index = Math.floor((Math.random() * (pokemon.moves.length-1)));
			console.log(index);
			moves.push(pokemon.moves[index].move);
		}
		return moves;
	}


	$scope.attackEnemy = function(move) {
		if($scope.playersTurn && !$scope.currentPokemon.dead) {
			$scope.playersTurn = false;
			$scope.gameStatus = $scope.currentPokemon.name + " uses " + move.name;
			console.log($scope.gameStatus);
			var url = move.url;
			$http.get(url).then(function(response) {
				console.log(response);
				var newHp = $scope.enemyPokemon.currentHp - response.data.power/2;
				if(newHp > 0) {
					$scope.enemyPokemon.currentHp = newHp;
					console.log("Attacking")
					$window.setTimeout(function() {
						$scope.attackCurrentPokemon();
					}, 500);
				}
				else {
					$scope.enemyPokemon.currentHp = 0;
					$scope.pokemonDefeated++;
					loadEnemy();
				}
			}, function(error) {
				console.log(error);
			})
		}
	}

	$scope.attackCurrentPokemon = function() {
		if(!$scope.playersTurn) {
			var index = Math.floor(Math.random() * $scope.enemyPokemon.moves.length);
			var move = $scope.enemyPokemon.moves[index];
			$scope.gameStatus = $scope.enemyPokemon.name + " uses " + move.name;
			console.log($scope.gameStatus);
			var url = move.url;
			$http.get(url).then(function(response) {

				var newHp = $scope.currentPokemon.currentHp - response.data.power/2;
				if(newHp > 0) {
					$scope.currentPokemon.currentHp = newHp;
				}
				else {
					$scope.currentPokemon.currentHp = 0;
					$scope.currentPokemon.dead = true;
					$scope.pokemonRemaining--;
					if($scope.pokemonRemaining <= 0) {
						$scope.gameOver = true;
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

	function getPokemon(number) {
		return $http.get("http://pokeapi.co/api/v2/pokemon/" + number);
	}

	function getPokemonForm(number) {
		return $http.get("http://pokeapi.co/api/v2/pokemon-form/" + number);
	}

});


app.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});