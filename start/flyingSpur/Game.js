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
            
        this.active = false;
        this.load();

        window.addEventListener('resize', this.resize.bind(this) );

        document.addEventListener('keydown', this.keyDown.bind(this));
        document.addEventListener('keyup', this.keyUp.bind(this));

        document.addEventListener('touchstart', this.mouseDown.bind(this) );
        document.addEventListener('touchend', this.mouseUp.bind(this) );
        document.addEventListener('mousedown', this.mouseDown.bind(this) );
        document.addEventListener('mouseup', this.mouseUp.bind(this) );
        
        this.spaceKey = false;

        const btn = document.getElementById('playBtn');
        btn.addEventListener('click', this.startGame.bind(this));
	}
	
    startGame(){
        const gameover = document.getElementById('gameover');
        const instructions = document.getElementById('instructions');
        const btn = document.getElementById('playBtn');

        gameover.style.display = 'none';
        instructions.style.display = 'none';
        btn.style.display = 'none';

        this.score = 0;
        this.lives = 3;

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

    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
    	this.camera.updateProjectionMatrix();
    	this.renderer.setSize( window.innerWidth, window.innerHeight ); 
    }

    keyDown(evt){
        switch(evt.keyCode){
            case 32:
                this.spaceKey = true; 
                break;
        }
    }
    
    keyUp(evt){
        switch(evt.keyCode){
            case 32:
                this.spaceKey = false;
                break;
        }
    }

    mouseDown(evt){
        this.spaceKey = true;
    }

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
    }

    loadSkybox(){
        this.scene.background = new THREE.CubeTextureLoader()
	        .setPath( `${this.assetsPath}/plane/paintedsky/` )
            .load( [
                'px.jpg', //positive x-axis
                'nx.jpg', //-x
                'py.jpg', //+y
                'ny.jpg', //-y
                'pz.jpg', //+z
                'nz.jpg' //-z
            ], () => {
                this.renderer.setAnimationLoop(this.render.bind(this));
            } );
    }
    
    gameOver(){
        this.active = false;

        const gameover = document.getElementById('gameover');
        const btn = document.getElementById('playBtn');

        gameover.style.display = 'block';
        btn.style.display = 'block';

        let myScore = document.getElementById('myScore');
        myScore.innerHTML = this.score;

        let score = document.getElementById('score');
        let lives = document.getElementById('lives');
        let scoreImg = document.getElementById('scoreImage');
        let livesImg = document.getElementById('livesImage');
        
        this.plane.visible = false;
        score.style.visibility = 'hidden';
        lives.style.visibility = 'hidden';
        scoreImg.style.visibility = 'hidden';
        livesImg.style.visibility = 'hidden';

        checkHighScore(this.score);
    }

    incScore(){
        this.score++;

        const elm = document.getElementById('score');

        elm.innerHTML = this.score;
    }

    decLives(){
        this.lives--;

        const elm = document.getElementById('lives');

        elm.innerHTML = this.lives;

        if (this.lives==0) setTimeout(this.gameOver.bind(this), 1200);
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
	    //If we are still loading, Check the ready flag of the plane.
            if (this.plane.ready && this.obstacles.ready){
                this.loading = false; //If the plane is ready set loading to false
                this.loadingBar.visible = false; //Hide the loading bar
            }else{
                return;
            }
        }

        const dt = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        this.plane.update(time); v
	
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
      showHighScores();
    }
}
  
function saveHighScore(score, highScores) {
    highScores.push(score);
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(NO_OF_HIGH_SCORES);
  
    localStorage.setItem('highScores', JSON.stringify(highScores));
}

export { Game };
