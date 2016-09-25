var app = angular.module('myApp', []);

app.controller('pokemonCtrl', function($scope, $http, $q) {

	$scope.pokemons = [];

	function loadEnemy() {
		var id = Math.floor((Math.random() * 20) + 1);
		getPokemon(id).then(function(response) {
			var pokemon = response.data;
			var moves = getMoves(pokemon);
			$scope.enemyPokemon = {
				name: pokemon.name.split("-")[0],
				imageFront: pokemon.sprites.front_default,
				imageBack: pokemon.sprites.back_default,
				hp: pokemon.base_experience,
				remainingHealth: pokemon.base_experience,
				moves: moves
			};

		}, function(error) {
			console.log("error");
		});
	}
	loadEnemy();

	function loadPokemons() {
		var promises = [];
		for(var i=0; i<6; i++) {
			var id = Math.floor((Math.random() * 100) + 1); // between 1 - 20
			promises.push(getPokemon(id));
		}
		$q.all(promises)
			.then(function(response) {
				for(var i=0; i<response.length; i++) {
					var pokemon = response[i].data;
					var moves = getMoves(pokemon);
					$scope.pokemons.push({
						name: pokemon.name.split("-")[0],
						imageFront: pokemon.sprites.front_default,
						imageBack: pokemon.sprites.back_default,
						hp: pokemon.base_experience,
						remainingHealth: pokemon.base_experience,
						moves: moves
					});
				}
				$scope.currentPokemon = $scope.pokemons[0];
			}, function(error) {

			});
	}

	loadPokemons();


	// $scope.pokemons = [
	// 	{
	// 		name: "Pickachu",
	// 		image: "./img/squirtle.png"
	// 	},
	// 	{
	// 		name: "Bulbasaur",
	// 		image: "./img/squirtle.png"
	// 	},
	// 	{
	// 		name: "Charmander",
	// 		image: "./img/squirtle.png"
	// 	},
	// 	{
	// 		name: "Squirtle",
	// 		image: "./img/squirtle.png"
	// 	},
	// 	{
	// 		name: "Mankey",
	// 		image: "./img/squirtle.png"
	// 	},
	// 	{
	// 		name: "Mew",
	// 		image: "./img/squirtle.png"
	// 	}
	// ];
	function getMoves(pokemon) {
		var moves = [];
		for(var i=0; i<4; i++) {
			var index = Math.floor((Math.random() * (pokemon.moves.length-1)));
			moves.push(pokemon.moves[i].move);
		}
		return moves;
	}

	$scope.changePokemon = function(pokemon) {
		$scope.currentPokemon = pokemon
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