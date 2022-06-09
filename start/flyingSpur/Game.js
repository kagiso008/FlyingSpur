import * as THREE from '../../libs/three137/three.module.js';
import { RGBELoader } from '../../libs/three137/RGBELoader.js';
import { LoadingBar } from '../../libs/LoadingBar.js';
import { Plane } from './Plane.js';
import { Obstacles } from './Obstacles.js';
import { SFX } from './SFX.js';

const NO_OF_HIGH_SCORES = 10;
const HIGH_SCORES = 'highScores';

class Game{    
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
        
        this.loadingBar = new LoadingBar();//Create a loading bar.
        this.loadingBar.visible = false;//Show th loading bar created.

        this.clock = new THREE.Clock();//Create an instance of a three.js clock- to keep track of the lapse time in the game.

	    this.assetsPath = '../../assets/';//Path to the assets folder.
        
	    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 100 );//Create a camera
        this.camera.position.set( 4.37, 0, -5.00 );//Position of the camera
        this.camera.lookAt(0, 0, 6); 

        this.cameraController = new THREE.Object3D(); //Because we are playing with camera movement- create an empty object 3D
        this.cameraController.add(this.camera); //Add the camera to the object created above.
        this.cameraTarget = new THREE.Vector3(0,0,6); //Target position
        
	    this.scene = new THREE.Scene(); //Create a scene
        this.scene.add(this.cameraController); //Add contorller to the scene

	    const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1); //Create a hemisphere light
        ambient.position.set( 0.5, 1, 0.25 );
	    this.scene.add(ambient); //Add the light to the scene
		
        //Set the renderer- lines 40-43
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild( this.renderer.domElement );
        this.setEnvironment(); //This sets the scene texture
            
        this.active = false; //Property for play button
        this.load();

        //Event-listeners
        window.addEventListener('resize', this.resize.bind(this) );
        document.addEventListener('keydown', this.keyDown.bind(this)); //Keydown event-listener
        document.addEventListener('keyup', this.keyUp.bind(this)); //Keyup event-listener
        document.addEventListener('touchstart', this.mouseDown.bind(this)); //Touchstart event-listener
        document.addEventListener('touchend', this.mouseUp.bind(this)); //Touchend event-listener
        document.addEventListener('mousedown', this.mouseDown.bind(this)); //Mousedown event-listener
        document.addEventListener('mouseup', this.mouseUp.bind(this)); //Mouseup event-listener
        
        this.spaceKey = false; //All event-listeners will handle spaceKey class property, default to false

        const btn = document.getElementById('playBtn');
        btn.addEventListener('click', this.startGame.bind(this));

        const levelTwoBtn = document.getElementById('levelTwoBtn');
        levelTwoBtn.addEventListener('click', this.levelTwo.bind(this));

        const levelThreeBtn = document.getElementById('levelThreeBtn');
        levelThreeBtn.addEventListener('click', this.levelThree.bind(this));
    }
	
    levelTwo(){
        const level2 = document.getElementById('level2');
        const levelTwobtn = document.getElementById('levelTwoBtn');

        level2.style.display = 'none';
        levelTwobtn.style.display = 'none';

        let elm = document.getElementById('score');
        elm.innerHTML = this.score;
        
        elm = document.getElementById('lives');
        elm.innerHTML = this.lives;

        let scoreImg = document.getElementById('scoreImage');
        let livesImg = document.getElementById('livesImage');
        
        score.style.visibility = 'visible';
        lives.style.visibility = 'visible';
        scoreImg.style.visibility = 'visible';
        livesImg.style.visibility = 'visible';

        this.plane.reset();
        this.obstacles.reset();

        this.active = true;
        this.sfx.play('engine');
    }

    levelThree(){
        const level3 = document.getElementById('level3');
        const levelThreebtn = document.getElementById('levelThreeBtn');

        level3.style.display = 'none';
        levelThreebtn.style.display = 'none';

        let elm = document.getElementById('score');
        elm.innerHTML = this.score;
        
        elm = document.getElementById('lives');
        elm.innerHTML = this.lives;

        let scoreImg = document.getElementById('scoreImage');
        let livesImg = document.getElementById('livesImage');
        
        score.style.visibility = 'visible';
        lives.style.visibility = 'visible';
        scoreImg.style.visibility = 'visible';
        livesImg.style.visibility = 'visible';

        this.plane.reset();
        this.obstacles.reset();

        this.active = true;
        this.sfx.play('engine');
    }

    startGame(){
        //Pass ids to variables.
        const gameover = document.getElementById('gameover');
        const instructions = document.getElementById('instructions');
        const btn = document.getElementById('playBtn');

        //Hide the elements
        gameover.style.display = 'none';
        instructions.style.display = 'none';
        btn.style.display = 'none';

        this.score = 0; //Set game property score to 0
        this.lives = 3; //Set game property lives to 3

        let elm = document.getElementById('score'); //set id to variable
        elm.innerHTML = this.score; //Place it on the screen
        
        elm = document.getElementById('lives'); //set id to variable
        elm.innerHTML = this.lives; //Place it on the screen

        let scoreImg = document.getElementById('scoreImage');
        let livesImg = document.getElementById('livesImage');
        
        score.style.visibility = 'visible';
        lives.style.visibility = 'visible';
        scoreImg.style.visibility = 'visible';
        livesImg.style.visibility = 'visible';

        //Reset plane and obstacles
        this.plane.reset();
        this.obstacles.reset();

        this.active = true;
        this.sfx.play('engine');
        this.loadSkybox();
    }

    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
    	this.camera.updateProjectionMatrix();
    	this.renderer.setSize( window.innerWidth, window.innerHeight ); 
    }

    //KeyDown handler
    keyDown(evt){
        switch(evt.keyCode){
            case 38:
                this.spaceKey = true; 
                break;
        }
    }
    
    //KeyUp handler
    keyUp(evt){
        switch(evt.keyCode){
            case 38:
                this.spaceKey = false;
                break;
        }
    }

    //MouseDwon handler
    mouseDown(evt){
        this.spaceKey = true;
    }

    //MouseUp handler
    mouseUp(evt){
        this.spaceKey = false;
    }

    setEnvironment(){
        const loader = new RGBELoader().setPath(this.assetsPath);
        const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
        pmremGenerator.compileEquirectangularShader();
        
        const self = this;
        
        loader.load( 'hdr/venice_sunset_1k.hdr', ( texture ) => {
          const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
          pmremGenerator.dispose();

          self.scene.environment = envMap;

        }, undefined, (err)=>{
            console.error( err.message );
        } );
    }
    
	load(){
        this.loadSkybox();
        this.loading = true; //This indicates that the current game state is loading.
        this.loadingBar.visible = true; //Show loading bar.

        this.plane = new Plane(this); //We load the skybox.
        this.obstacles = new Obstacles(this); //Create a new instamce of a plane.

        this.loadSFX();
    }

    loadSFX(){
        this.sfx = new SFX(this.camera, this.assetsPath + 'plane/'); //New Sfx instance
        //From assets plane folder
        this.sfx.load('levelup');
        this.sfx.load('explosion');
        this.sfx.load('engine',true,1);
        this.sfx.load('gliss');
        this.sfx.load('gameover');
    }

    loadSkybox(){
        this.scene.background = new THREE.CubeTextureLoader()
	        .setPath( `${this.assetsPath}/plane/paintedsky/` )
            .load( [
                'hot_nx.jpg', //positive x-axis
                'hot_px.jpg', //-x
                'hot_py.jpg', //+y
                'hot_ny.jpg', //-y
                'hot_pz.jpg', //+z
                'hot_nz.jpg' //-z
            ], () => {
                this.renderer.setAnimationLoop(this.render.bind(this));
            } );
    }

    loadSkybox2(){
        this.scene.background = new THREE.CubeTextureLoader()
	        .setPath( `${this.assetsPath}/plane/paintedsky/` )
            .load( [
                'nx.jpg', //positive x-axis
                'px.jpg', //-x
                'py.jpg', //+y
                'ny.jpg', //-y
                'pz.jpg', //+z
                'nz.jpg' //-z
            ], () => {
                this.renderer.setAnimationLoop(this.render.bind(this));
            } );
    }

    loadSkybox3(){
        this.scene.background = new THREE.CubeTextureLoader()
	        .setPath( `${this.assetsPath}/plane/paintedsky/` )
            .load( [
                'gal_nx.jpg', //positive x-axis
                'gal_px.jpg', //-x
                'gal_py.jpg', //+y
                'ga_ny.jpg', //-y
                'gal_pz.jpg', //+z
                'gal_nz.jpg' //-z
            ], () => {
                this.renderer.setAnimationLoop(this.render.bind(this));
            } );
    }
    
    gameOver(){
        this.active = false;

        const gameover = document.getElementById('gameover'); //set id to variable
        const btn = document.getElementById('playBtn'); //set id to variable

        //Set diplay stylr to block, making them visible.
        gameover.style.display = 'block';
        btn.style.display = 'block';

        let score = document.getElementById('score');
        let lives = document.getElementById('lives');
        let scoreImg = document.getElementById('scoreImage');
        let livesImg = document.getElementById('livesImage');
        
        this.plane.visible = false;
        this.sfx.stopAll();
        this.sfx.play('gameover'); //Play gameover sound
        

        checkHighScore(this.score);
    }

    level2(){
        this.active = false;

        const level2 = document.getElementById('level2');
        const levelTwobtn = document.getElementById('levelTwoBtn');

        level2.style.display = 'block';
        levelTwobtn.style.display = 'block';

        let score = document.getElementById('score');
        let lives = document.getElementById('lives');
        let scoreImg = document.getElementById('scoreImage');
        let livesImg = document.getElementById('livesImage');
        
        this.loadSkybox2();
        this.plane.visible = false;
        this.sfx.stopAll();
        this.sfx.play('levelup');
    }

    level3(){
        this.active = false;

        const level3 = document.getElementById('level3');
        const levelThreebtn = document.getElementById('levelThreeBtn');

        level3.style.display = 'block';
        levelThreebtn.style.display = 'block';

        let score = document.getElementById('score');
        let lives = document.getElementById('lives');
        let scoreImg = document.getElementById('scoreImage');
        let livesImg = document.getElementById('livesImage');
        
        this.loadSkybox3();
        this.plane.visible = false;
        this.sfx.stopAll();
        this.sfx.play('levelup');
    }

    incScore(){
        this.score++;
    
        if (this.score==10){
            setTimeout(this.level2.bind(this), 500);
        }

        if (this.score==30){
            setTimeout(this.level3.bind(this), 500);
        }

        const elm = document.getElementById('score'); //set id to variable

        elm.innerHTML = this.score; //Display on screen

        this.sfx.play('gliss'); //Play gliss sound 
    }

    decLives(){
        this.lives--;

        const elm = document.getElementById('lives'); //set id to variable

        elm.innerHTML = this.lives; //Display on screen

        if (this.lives==0) setTimeout(this.gameOver.bind(this), 1200); //If lives == 0, call the gameOver method.

        this.sfx.play('explosion'); //Play explosion
    }

    updateCamera(){
        this.cameraController.position.copy( this.plane.position ); //Camera controller- moves with the camera plane's position, that's how it is updated.
        this.cameraController.position.y = 0; //Set the y position to 0- so the camera won't move as the plane goes up and down
        this.cameraTarget.copy(this.plane.position); //Camera target is also placed in the planes position.
        this.cameraTarget.z += 6; //We initialized the target as (0, 0, 6)
        this.camera.lookAt( this.cameraTarget ); //Relative positioning.
        
    }

    render() {
        //Check if we're still loading
	    if (this.loading){
	    //If we are still loading, Check the ready flag of the plane and obstacles.
            if (this.plane.ready && this.obstacles.ready){
                this.loading = false; //If the plane is ready set loading to false
                this.loadingBar.visible = false; //Hide the loading bar
            }else{
                return;
            }
        }

        const dt = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        this.plane.update(time);
	
        //If game is active, call the update methos of the obtacles
        if (this.active){
            this.obstacles.update(this.plane.position, dt);
        }
    
        this.updateCamera();
        this.renderer.render( this.scene, this.camera );
    }
}

function showHighScores() {
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    const highScoreList = document.getElementById('highScores');
  
    highScoreList.innerHTML = highScores
    .map((score) => `<li>${score.score} - ${score.name}`)
    .join(''); 
}
  
function checkHighScore(score) {
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    const lowestScore = highScores[NO_OF_HIGH_SCORES - 1]?.score ?? 0;
  
    if (score > lowestScore) {
      const name = prompt('You got a highscore! Enter name:');
      const newScore = { score, name };
      saveHighScore(newScore, highScores);
    }
    showHighScores();
}
  
function saveHighScore(score, highScores) {
    highScores.push(score);
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(NO_OF_HIGH_SCORES);
  
    localStorage.setItem('highScores', JSON.stringify(highScores));
}

export { Game };
