require('../css/app.css');
import FastList from 'fast-list';
import _ from 'lodash';

let canvas = document.getElementById('snakePit');
let ctx = canvas.getContext("2d");
canvas.height = 780;
canvas.width = 780;

export const SnakePit = {};
SnakePit.fps = 8;
SnakePit.cellWidth = 13;

SnakePit.game = function() {
	// Create the canvas
	// game configuration
	let gameRunning = true;
	let food = new SnakePit.food();
	// init snake object
	let snake1 = new SnakePit.snake();


	function init() {
		bindEvents();
		snake1.init();
		food.place();
		console.log(food.coordinates.x, food.coordinates.y);
		gameLoop();
	}

	function update(snake) {
		advanceSnake(snake);
		checkCollision(snake);
		checkSelfCollision(snake);
	}

	function advanceSnake( snake ) {
		let newSnakeHeadPosition = {
			x: snake.segments._head.data.x,
			y: snake.segments._head.data.y
		};
		let vectors = {
			RIGHT : { x: 1, y: 0 },
			LEFT  : { x: -1, y: 0 },
			UP    : { x: 0, y: -1 },
			DOWN  : { x: 0, y: 1 }
		};
		let currentVector = vectors[snake.direction];
		if ( currentVector ) {
			newSnakeHeadPosition.x += currentVector.x;
			newSnakeHeadPosition.y += currentVector.y;
		}
		snake.segments.unshift(newSnakeHeadPosition);
		if( checkFoodCollision(snake, food)) {
			snake.length += 1;
		} else {
			snake.segments.pop();
		}
	}

	function checkCollision(snake){
		let head = snake.segments._head.data;
		if ( head.x < 0 ||
			 head.y < 0 ||
			 head.x >= (canvas.width / SnakePit.cellWidth) ||
			 head.y >= (canvas.height / SnakePit.cellWidth) ) {
				gameRunning = false;
		}
	}

	function checkSelfCollision(snake){
		let head = snake.segments._head.data;
		let noCollision = snake.segments.reduce( (previousValue, currentSegment, index, segments) => {
			let segmentsCollide = _.isEqual(head, currentSegment);
			if (typeof previousValue === 'object') previousValue = true;
			return previousValue && !segmentsCollide;
		});
		if (!noCollision) gameRunning = false;
	}

	function checkFoodCollision(snake, food) {
		let head = snake.segments._head.data;
		if ( _.isEqual(head, food.coordinates) ) {
			food.place();
			if (SnakePit.fps < 60) SnakePit.fps += 1;
			return true;
		}
	}

	function draw() {
		ctx.fillStyle = 'green';
		ctx.strokeStyle = "white";

		snake1.segments.forEach(function(segment, index){
			ctx.fillRect(segment.x * SnakePit.cellWidth, segment.y * SnakePit.cellWidth, snake1.segmentSize, snake1.segmentSize);
			ctx.strokeRect(segment.x * SnakePit.cellWidth, segment.y * SnakePit.cellWidth, snake1.segmentSize, snake1.segmentSize);
		});

		ctx.fillStyle = 'red';
		ctx.fillRect(food.coordinates.x * SnakePit.cellWidth, food.coordinates.y * SnakePit.cellWidth, 10, 10);
		ctx.strokeRect(food.coordinates.x * SnakePit.cellWidth, food.coordinates.y * SnakePit.cellWidth, snake1.segmentSize, snake1.segmentSize);
	}

	function clear() {
		ctx.fillStyle = 'black';
		ctx.fillRect(0,0, canvas.height, canvas.width);
	}

	function gameLoop() {
		if (!gameRunning) return;
	   	update(snake1);
	   	clear();
	   	draw();
	   	setTimeout( () => {
	   		requestAnimationFrame(gameLoop);
	   	}, 1000 / SnakePit.fps);
	}

	function bindEvents() {
		let controls = {
			37: 'LEFT',
			38: 'UP',
			39: 'RIGHT',
			40: 'DOWN'
		}

	    document.addEventListener('keydown', function (event) {
	      let key = event.keyCode;
	      let direction = controls[key];

	      if (direction) {
	        snake1.setDirection(direction);
	      }
	      else if (key === 32) {
	        gameRunning = false;
	      }
	    });
  	}
  	return {
  		init: init
  	}
};

// Game objects
SnakePit.snake = function() {
	let snake = this;
	this.head = {
		x: 20,
		y: 20
	};
	this.segmentSize = 10;
	this.speed = 1;
	this.length = 5;
	this.segments = new FastList;
	this.direction = 'RIGHT';
	this.init = function() {
		_.range(snake.length)
			.map(function(segment, index){
				snake.segments.push({
					x: snake.head.x - (index),
					y: snake.head.y
				});
			});
	}

	this.setDirection = function(newDirection) {
  		let oppositeDirections = {
		  	LEFT: 'RIGHT',
		  	RIGHT: 'LEFT',
		  	UP: 'DOWN',
		  	DOWN: 'UP'
	  	}

  		if (newDirection !== oppositeDirections[snake.direction]) {
	  		snake.direction = newDirection;
	  	}
	}
};

SnakePit.food = function() {
	let food = this;
	this.coordinates = {
		x: 0,
		y: 0
	};
	this.place = function() {
		food.coordinates.x = Math.floor(Math.random() * (canvas.width / SnakePit.cellWidth));
		food.coordinates.y = Math.floor(Math.random() * (canvas.height / SnakePit.cellWidth));
	}
};

SnakePit.game().init();
