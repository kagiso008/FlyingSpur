import { Vector3 } from '../../libs/three137/three.module.js';
import { GLTFLoader } from '../../libs/three137/GLTFLoader.js';

class Plane{
    constructor(game){
        this.assetsPath = game.assetsPath;
        this.loadingBar = game.loadingBar;
        this.game = game; //Class property, reference from Game instance
        this.scene = game.scene;
        this.load();
        this.tmpPos = new Vector3();
    }

    //Position getter, returns the plane world position.
    get position(){
        if (this.plane!==undefined) this.plane.getWorldPosition(this.tmpPos);
        return this.tmpPos;
    }

    //Position setter, hides/shows the loaded plane objects.
    set visible(mode){
        this.plane.visible = mode;
    }

    load(){
    	const loader = new GLTFLoader( ).setPath(`${this.assetsPath}plane/`);
        this.ready = false;
        
		// Load a glTF resource
		loader.load(
			// resource URL (the actual UFO)
			'UFO_Empty_2.glb',
			// called when the resource is loaded
			gltf => {
				this.scene.add( gltf.scene );
                this.plane = gltf.scene;
                this.velocity = new Vector3(0,0,0.1); //Velocity vector helps to move the plane.
                this.ready = true;
			},
			
            // called while loading is progressing
			xhr => {
				this.loadingBar.update('plane', xhr.loaded, xhr.total ); //Loading bar handles multiple loaders
			},
			
            // called when loading has errors
			err => {
				console.error( err );
			}
		);
	}	

    //Reset event, called by the startGame method.
    reset(){
        this.plane.position.set(0, 0, 0); //Plane position
        this.plane.visible = true;
        this.velocity.set(0,0,0.1); //Velocity to 0.1
    }


    //the more ypu press space the more the velocity of the plane increases
    update(time){
        if (this.game.active){ //Wrap the movement code
            if (!this.game.spaceKey){ //Check if spaceKey is T/F
                this.velocity.y -= 0.001; //F- decrease velocity
            }else{
                this.velocity.y += 0.001; //T- increase velocity
            }
            this.velocity.z += 0.0001; //Plane gets faster
            this.plane.rotation.set(0, 0, Math.sin(time*3)*0.2, 'XYZ'); //The plane gently sways about the z-axis, order xyz.
            this.plane.translateZ( this.velocity.z ); //Move plane along z-axis
            this.plane.translateY( this.velocity.y ); //move plane along y-axis
        }else{
            this.plane.rotation.set(0, 0, Math.sin(time*3)*0.2, 'XYZ');
            this.plane.position.y = Math.cos(time) * 1.5; //Plane makes a bit of vertical movement.
        }
    }
}

export { Plane };