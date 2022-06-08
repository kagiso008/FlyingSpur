import { Group, Vector3 } from '../../libs/three137/three.module.js';
import { GLTFLoader } from '../../libs/three137/GLTFLoader.js';
import { Explosion } from './Explosion.js';

class Obstacles{
    //we'll have two obstacles, a star and a bomb. When you hit a star, your score 
    //will increase by one and when you hit a bomb, your life will decrease by one.
    //Initially your life is at three.
    constructor(game){
        this.assetsPath = game.assetsPath;
        this.loadingBar = game.loadingBar;
		this.game = game;
		this.scene = game.scene;
        this.loadStar();
		this.loadBomb();
		this.tmpPos = new Vector3();
        this.explosions = []; //Store all active explosions
    }

    loadStar(){
    	const loader = new GLTFLoader( ).setPath(`${this.assetsPath}plane/`);
        this.ready = false;
        
		// Load a glTF resource
		loader.load(
			// resource URL
			'star.glb',
			// called when the resource is loaded
			gltf => {

                this.star = gltf.scene.children[0]; //1st child

                this.star.name = 'star';

				if (this.bomb !== undefined) this.initialize(); //Check if bomb exits, then call the initialize method

			},
			// called while loading is progressing
			xhr => {

                this.loadingBar.update('star', xhr.loaded, xhr.total );
			
			},
			// called when loading has errors
			err => {

				console.error( err );

			}
		);
	}	

    loadBomb(){
    	const loader = new GLTFLoader( ).setPath(`${this.assetsPath}plane/`);
        
		// Load a glTF resource
		loader.load(
			// resource URL
			'bomb.glb',
			// called when the resource is loaded
			gltf => {
                this.bomb = gltf.scene.children[0]; //1st child
                if (this.star !== undefined) this.initialize(); //Check if star exists, then call the initialize method
			},
			// called while loading is progressing
			xhr => {
				this.loadingBar.update('bomb', xhr.loaded, xhr.total );
			},
			// called when loading has errors
			err => {
				console.error( err );
			}
		);
	}

    //This creates cols of obtacles- 3 bombs at the top, a star in the middle and 3 bombs at the bottom.
	initialize(){
        this.obstacles = []; //Obstacle array- contain cols.
        const obstacle = new Group(); //Obstacle group object- basically an object3D
        
        obstacle.add(this.star); //Start- (0, 0, 0) in relation to the group objects.
        this.bomb.rotation.x = -Math.PI*0.5; //Rotate the bomb on the x-axis
        this.bomb.position.y = 7.5; //Rotate the bomb on the y-axis
        obstacle.add(this.bomb); //Include bombs

        let rotate=true; //Allows us to choose wheter to rotate or not.
        for(let y=5; y>-8; y-=2.5){
            rotate = !rotate; //Flip value of rotate
            if (y==0) continue; //T- slip the loop, 'cause that is where the star is.
            const bomb = this.bomb.clone(); //Duplicate the object.
            bomb.rotation.x = (rotate) ? -Math.PI*0.5 : 0; //Rotate on the x-axis
            bomb.position.y = y; 
            obstacle.add(bomb); //Include it
        
        }
        
        this.obstacles.push(obstacle); //Add to obstacles array
        this.scene.add(obstacle); //Add it to the scene

        //We want several of the obstacles.
        for(let i=0; i<3; i++){
            const obstacle1 = obstacle.clone(); //New group of obstcles
            this.scene.add(obstacle1); //Add it to the scene
            this.obstacles.push(obstacle1);
        }

        this.reset();
		this.ready = true;
    }

    removeExplosion( explosion ){
        const index = this.explosions.indexOf( explosion ); //Get index of explosion
        if (index != -1) this.explosions.indexOf(index, 1); //Remove the bomb
    }

    reset(){
        this.obstacleSpawn = { pos: 20, offset: 5 }; //Pos: z-value to position the next obstacle group; Offset: offset positioning in the y-axis
        this.obstacles.forEach( obstacle => this.respawnObstacle(obstacle) );
        let count;
        while( this.explosions.length>0 && count<100){ //Delete the explosion and remove it the array.
            this.explosions[0].onComplete();
            count++;
        }
    }

    respawnObstacle( obstacle ){
        this.obstacleSpawn.pos += 30; //Obstacle groups are 30m distant to each other, z-axis. 
        const offset = (Math.random()*2 - 1) * this.obstacleSpawn.offset; //Get random offset values between -offset to +offset
        this.obstacleSpawn.offset += 0.2; //Increment of the offset value
        obstacle.position.set(0, offset, this.obstacleSpawn.pos ); //Use the randomised value
        obstacle.children[0].rotation.y = Math.random() * Math.PI * 2; //1st child- star.
		obstacle.userData.hit = false; //Object used to store custom data
		obstacle.children.forEach( child => { //Set all the childern to visible
			child.visible = true;
		});
    }

	update(pos, time){
        let collisionObstacle; //To store the collison group that the plane could collide with. 
        this.obstacles.forEach( obstacle =>{
            obstacle.children[0].rotateY(0.01); //Rotate the star slightly.
            const relativePosZ = obstacle.position.z-pos.z; //Get relative z-position of the obstacle(plane position - obstacle posistion)
            if (Math.abs(relativePosZ)<2){
                collisionObstacle = obstacle; //T- it is the collison obstacle
            }
            if (relativePosZ<-20){
                this.respawnObstacle(obstacle); //T- respawn the obtacle, distance ahead of the plane.
            }
        });

        //Test the collision
        if (collisionObstacle!==undefined){
			let minDist = Infinity;
			collisionObstacle.children.some( child => {
				child.getWorldPosition(this.tmpPos);
				const dist = this.tmpPos.distanceToSquared(pos);
				if (dist<minDist) minDist = dist;
                if (dist<5 && !collisionObstacle.userData.hit){
					collisionObstacle.userData.hit = true;
					console.log(`Closest obstacle is ${minDist.toFixed(2)}`);
					this.hit(child);
                    return true;
                }
            })
            
        }

        this.explosions.forEach( explosion => {
            explosion.update( time );
        });
    }

	hit(obj){
		if (obj.name=='star'){ //If hit a star
			obj.visible = false;
			this.game.incScore(); 
        }else{ //Hits a bomb
            this.explosions.push( new Explosion(obj, this) );
			this.game.decLives();
        }
	}
}

export { Obstacles };