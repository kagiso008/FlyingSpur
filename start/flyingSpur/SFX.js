import { AudioListener, Audio, PositionalAudio, AudioLoader } from '../../libs/three137/three.module.js';

class SFX{
    constructor(camera, assetsPath){
        this.listener = new AudioListener(); //enables us to hear sounds
        camera.add(this.listener); //Attached to the camera

        this.assetsPath = assetsPath; //To save reference
        this.sounds = {}; //Sound object
    }

    //Load sound files
    load(name, loop=false, vol=0.5, obj=null){
        const sound = (obj==null) ? new Audio( this.listener ) : new
        PositionalAudio(this.listener);

        this.sounds[name] = sound;
        
        const audioLoader = new AudioLoader().setPath(this.assetsPath);
        audioLoader.load(`${name}.mp3`, buffer => {
            sound.setBuffer( buffer );
            sound.setLoop( loop );
            sound.setVolume( vol ); 
        });
    }

    setVolume(name, volume){
        const sound = this.sounds(name); //Get sound

        if(sound !== undefined) sound.setVolume(volume) //Use sound
    }

    setLoop(name, loop){
        const sound = this.sounds(name); //Get sound
        
        if(sound!== undefined) sound.setLoop(loop) //Use sound
    }

    play(name){
        const sound = this.sounds[name]; //Get sound
        
        if(sound!== undefined && !sound.isPlaying) sound.play(); //Call play method if it exits and the sound is not playing
    }

    stop(name){
        const sound = this.sounds[name]; //Get sound
        
        if(sound!== undefined && !sound.isPlaying) sound.stop(); //Opposite of play
    }

    stopAll(){
        for(let name in this.sounds) this.stop[name];
    }

    pause(name){
        const sound = this.sounds[name];//Same as play method
        
        if(sound!== undefined && !sound.isPlaying) sound.pause();
    }
}

export { SFX };