require('../css/app.css');
import FastList from 'fast-list';
import _ from 'lodash';

let canvas = document.getElementById('snakePit');
let ctx = canvas.getContext("2d");
canvas.height = 800;
canvas.width = 800;

export const SnakePit = {};
SnakePit.fps = 1/60;
SnakePit.cellWidth = 10;
SnakePit.lastTick = performance.now();
SnakePit.tickLength = 50;
SnakePit.lastRender = SnakePit.lastTick;


SnakePit.game = function() {
	// Create the canvas
	// game configuration
	let gameRunning = true;
	let food = new SnakePit.food();
	// init snake object
	let snake1 = new SnakePit.snake({
		x: 20,
		y: 20,
		speed: 1
	});
	let snake2 = new SnakePit.snake({
		x: 20,
		y: 70,
		speed: 3
	});
	var gameTime = Date.now();

	function init() {
		bindEvents();
		snake1.init();
		snake2.init();
		food.place();
		gameLoop(performance.now());
	}

	function update(snake) {
		advanceSnake(snake);
		checkCollision(snake);
		checkSelfCollision(snake);
		if (snake.pivots.length > 10) snake.trimPivots();
	}

	function advanceSnake(snake) {
		let vectors = {
			RIGHT : { x: snake.speed, y: 0 },
			LEFT  : { x: -snake.speed, y: 0 },
			UP    : { x: 0, y: -snake.speed },
			DOWN  : { x: 0, y: snake.speed }
		};

		snake.segments.map( (segment, index) => {
			let segVector = vectors[segment.direction];
			let snakePivot = checkPivots(snake, segment);
			if (snakePivot.collides) {
				let pivot = snakePivot.pivot;
				let newSegVector = vectors[pivot.direction];
				segment.direction = pivot.direction;
				segment.x += newSegVector.x;
				segment.y += newSegVector.y;
			} else {
				segment.x += segVector.x;
				segment.y += segVector.y;
			}
		});

		if( checkFoodCollision(snake, food)) {
			snake.length += 1;
			console.log('food eaten');
			snake.speed += 1;
		}
	}

	function matchingPivot(snake, segment) {
		if (snake.pivots.length === 0) return false;
		let segCoords = {
			x: segment.x,
			y: segment.y
		};
		let pivot = _.find(snake.pivots, (pivot) => {
			let pivotCoords = { x: pivot.x, y: pivot.y };
			return _.isEqual(pivotCoords, segCoords);
		});
		return pivot;
	}

	function checkPivots(snake, segment) {
		let pivot = matchingPivot(snake, segment);
		return pivot !== undefined && pivot !== false ? { collides: true, pivot: pivot} : false;
	}

	function checkCollision(snake) {
		let head = snake.segments[0];
		if ( head.x < 0 ||
			 head.y < 0 ||
			 head.x >= (canvas.width / SnakePit.cellWidth) ||
			 head.y >= (canvas.height / SnakePit.cellWidth) ) {
				gameRunning = false;
		}
	}

	function checkSelfCollision(snake){
		let head = snake.segments[0];
		let noCollision = snake.segments.reduce( (previousValue, currentSegment, index, segments) => {
			let segmentsCollide = _.isEqual(head, currentSegment);
			if (typeof previousValue === 'object') previousValue = true;
			return previousValue && !segmentsCollide;
		});
		if (!noCollision) gameRunning = false;
	}

	function checkFoodCollision(snake, food) {
		let head = snake.segments[0];
		if ( _.isEqual(head, food.coordinates) ) {
			food.place();
			if (snake.speed < 20) snake.speed += 0.01667;
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

		ctx.fillStyle = 'blue';
		snake2.segments.forEach(function(segment, index){
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

	function gameLoop(tFrame) {
		if (!gameRunning) return;
   		requestAnimationFrame(gameLoop);
   		let numTicks = 0;
   		let nextTick = SnakePit.lastTick + SnakePit.tickLength;

   		if (tFrame > nextTick) {
   			let timeSinceTick = tFrame - SnakePit.lastTick;
   			numTicks = Math.floor( timeSinceTick / SnakePit.tickLength );
   		}

		queueUpdates(numTicks, snake1);
		queueUpdates(numTicks, snake2);
	   	clear();
	   	draw();
	   	SnakePit.lastRender = tFrame;
	}

	function queueUpdates( numTicks, snake ) {
		for(var i = 0; i < numTicks; i++) {
			SnakePit.lastTick = SnakePit.lastTick + SnakePit.tickLength;
			update(snake, SnakePit.lastTick);
		}
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
	        snake1.checkDirection(direction);
	        snake1.addPivot(direction, snake1.segments[0]);
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
SnakePit.snake = function(options) {
	let snake = this;
	this.head = {
		x: options.x,
		y: options.y
	};
	this.pivots = [];
	this.segmentSize = 10;
	this.speed = options.speed;
	this.length = 5;
	this.segments = [];
	this.direction = 'RIGHT';
	this.init = function() {
		_.range(snake.length)
		 .map(function(segment, index){
		 	snake.segments.push({
		 		x: snake.head.x - (index),
		 		y: snake.head.y,
		 		direction: snake.direction
		 	});
	 	});
	}

	this.checkDirection = function(newDirection) {
  		let oppositeDirections = {
		  	LEFT: 'RIGHT',
		  	RIGHT: 'LEFT',
		  	UP: 'DOWN',
		  	DOWN: 'UP'
	  	}
	  	// console.log('newDirection', newDirection, 'snakeDirection:', snake.segments[0].direction);
	  	// console.log('newDirectionAllowed:', newDirection !== oppositeDirections[snake.segments[0].direction]);
  		// if (newDirection !== oppositeDirections[snake.segments[0].direction]) {
	  	// 	// snake.segments[0].direction = newDirection;
	  	// 	return true;
	  	// }
	  	return newDirection !== oppositeDirections[snake.segments[0].direction] ? true : false;
	}
	this.addPivot = function(direction, headPos) {
		snake.pivots.push({x: headPos.x, y: headPos.y, direction: direction});
	}
	this.trimPivots = function() {
		snake.pivots = _.takeRight(snake.pivots, 5);
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
