/////////////////////////////////////////////////////////////////////////////////
// Original Paddle Ball source comes from
// http://www.devx.com/webdev/10MinuteSolution/27134/1954
// Forked by FlorianMettetal
// Created On: 2012 August, 18
// Last Modified: 2012 August, 19 by FlorianMettetal
//
// Game can be found at: http://FlorianMettetal.com/BreakOut-1.0/index.html
//
// Now we are going to make a Break Out game!
// Log of my edits start here:
// 1. Remove the difficulty attribute
// 2. Add mouse control, remove keyboard, make sure the paddle stops at the wall
// 3. Create start/restart button, changes score area as well
// 4. replaced timer = setTimeout() with more efficient/modern requestAnimFrame
// 5. Turn the paddle into a slapper
// * Move everything from DOM to Canvas
// * Create highscore board, "nickname" saved remotely, leaderboard
// * Create destroyable blocks
//////////////////////////////////////////////////////////////////////////////////

//**     Unfinished task that is currently being worked on     **\\
//
// Right now I'm working on the slapper function
// 1. I broke the currentScore var, it no longer is being reset to 0
// 3A. once that's fixed create var slapV = 1
// 3B. create if (slap && collision) ballDx = ballDy += slapV
//
//**  Make sure to update this! Last Updated: 20120819 01:06PST  **\\


// implement rFA http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();


//get info, process data, update screen objects
//instance vars
var ball;
var paddle;
var score;
//initial speeds
var ballDx = 3;
var ballDy = 3;
var currentScore = 0;

// Wall Config
var wallDx = 0.25;
var wallDy = 0.25;

// Ball Position and Dimensions
var ballY = 4;
var ballX = 200;
//var ballRad = 15px;
var ballM = 1;
var ballP = 1;

//Paddle Position and Dimensions
var paddleY = 470;
var paddleX = 228;
var paddleW = 64;
var paddleH = 16;

//Slapper Config
var slapY = 10;
var slapDx = 1;
var slapDy = 1;
var slappable = false;
 
// Board Dimensions
var boardW = 500;
//var boardH = 500;

var playingArea;
window.addEventListener("load", init, false);

function mouseListener(event){
    var x = event.clientX;
    paddleX = x - 100;
    if (paddleX <= 0){
        paddleX = 0;
    }
    if (paddleX >= boardW -paddleW){
        paddleX = boardW - paddleW;
    }
    paddle.style.left = paddleX + 'px';
}

function reset(){
    ballX = 200;
    ballY = 4;
    ballDx = 3;
    ballDy = 3;
    ballM = 1;

    currentScore = 0;
    
    paddleX = 228;
    paddleW = 64;

    if( $('#tko').is('*') ){
        $('#tko').remove();
    }
    $('#score').css("background-color","rgb(32,128,64)");
    createPaddle();
}

function init(){
    reset();
    playingArea = document.getElementById('playingArea');
    //instantiate HTML object instance vars

    ball = document.getElementById('ball');

    paddle = document.getElementById('paddle');

    score = document.getElementById('score');

    document.onmousemove = mouseListener;

    //document.onmousedown = slap; //replaced with:
    playingArea.addEventListener('mousedown',slap,false);

    //start the game loop
    requestAnimFrame(start);
}

function start(){
    //game loop
    detectCollisions();
    render();
    $('#goButton').removeClass('goActive');
    $('#goButton').addClass('goInactive');
    
    //end conditions
    if(ballY <= (paddleY) ){
        //still in play - keep the loop going
        requestAnimFrame(start);
    }
    else{
        gameOver();
    }
}

function detectCollisions(){
    //just reflect the ball on a collision
    //a more robust engine could change trajectory of ball based
    //on where the ball hits the paddle
    if(collisionX()){
        updateScore(1);
        ballDx *= -1;
        /*if (ballDx>0){
			ballDx -= wallDx;
		}else{
			ballDx += wallDx;
		}*/	
    }
    if(collisionY()){
        ballDy *= -1;
        updateScore(2);
        /*if (ballDy>0){
			ballDy -= wallDy;
		}else{
			ballDy += wallDy;
		}*/
    }

}

function collisionX(){
    return ballX < 4 || ballX > 480;
}

function collisionY(){
    //check if bill is at top of playing area
    if(ballY < 4){
        return true;
    }

    //check to see if ball collided with paddle
    if(ballY > (paddleY-paddleH)){
        if(ballX > paddleX && ballX < paddleX + 64){
        	if(slappable){
        		if (ballDx>0){
        			ballDx += slapDx;
        		}else{
        			ballDx -= slapDx;
        		}
        		if (ballDy>0){
        			ballDy += slapDy;
        		}else{
        			ballDy -= slapDy;
        		}
        		
        		/* output 
        		console.log("Slappable: ",slappable);
        		console.log("Power: ",ballP);
        		console.log("Dx: ",ballDx);
        		console.log("Dy: ",ballDy);
        		console.log("-------------"); 
        		*/
        	}
            updateScore(5);
            //console.log("Paddle Height: ",paddleY);
            return true;
        }
    }
    return false;
}

function render(){
    moveBall();
}

function createPaddle(){
    var $paddle = $('#paddle');
    $paddle.css({width: paddleW, height: paddleH, top: paddleY})
    $paddle.css("background-color","darkblue");
}

function slap(){
    var $paddle = $('#paddle');
    paddleY -= slapY;

    $paddle.css({top: paddleY, width: paddleW});
    $paddle.css("background-color","lightblue");

	slappable = true;

    setTimeout(function(){
        paddleY += slapY;
        createPaddle();
		slappable = false;
    }, 200);
}

function moveBall(){
    ballX += ballDx;
    ballY += ballDy;
    ball.style.left = ballX;
    ball.style.top = ballY;
    
    var ballP = ballM * ballDx;
}

function updateScore(x){
    currentScore += x;
    score.innerHTML = 'Score: ' + currentScore;
}

function gameOver(){
    $('#score').append('<span id="tko">   Game Over</span>');
    //score.style.backgroundColor = 'rgb(128,0,0)';
    $('#score').css("background-color","rgb(128,0,0)");

    $('#goButton').removeClass('goInactive');
    $('#goButton').addClass('goActive');
}