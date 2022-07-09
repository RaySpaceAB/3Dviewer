'use strict';
function factoryFunction(){
    /**
    * Function constructor
    */
    function ModelHandler(iframe, uid, annotationBounds, currentIframe) {
        //// Private fields
        this.animationTime = annotationBounds.animationTime;
        this.resetModelTime = annotationBounds.resetModelTime;
        this.spinVelocity = annotationBounds.spinVelocity;
        this.orbitPanFactor = annotationBounds.orbitPanFactor;
        this.orbitRotationFactor = annotationBounds.orbitRotationFactor;
        this.orbitZoomFactor = annotationBounds.orbitZoomFactor;
        this.logCamera = annotationBounds.logCamera;
        
        this.el = iframe;
        this.uid = uid;
        this.currentIframe = currentIframe;

        this.client = new Sketchfab(this.el);
        this.api = null;

        this.frames = 0;
        this.centerTarget = [0,0,0];
        this.cameraPositionInit = [0,0,0];
        this.cameraTargetCurrentInit = [0,0,0];
        this.cameraTargetCurrent = [0,0,0];

        //// Public fields
        this.cameraMoving = false;
        this.spinning = false; 
        this.viewerready = false;
        this.lightStates = [];
        this.texturQuality = "LD";
        
        //// Private methods
        this._onTick = this._onTick.bind(this);
        this._setCamera = this._setCamera.bind(this);
        this._onClick = this._onClick.bind(this);
        this._rotateCamera = this._rotateCamera.bind(this);

        //// Public methods  
        this.setInitCameraPos = this.setInitCameraPos.bind(this);
        this.prevAnnotation = this.prevAnnotation.bind(this);
        this.nextAnnotation = this.nextAnnotation.bind(this);
        this.setHDtexture = this.setHDtexture.bind(this);
        this.setLDtexture = this.setLDtexture.bind(this);
        this.setLights = this.setLights.bind(this);
        this.viewerIsReady = this.viewerIsReady.bind(this);

        this.time = 0;
        this.radius = 0;
        this.initAngle = 0;
        this.x = 0;
        this.y = 0;

        this._init();
    }

    /**
    * Public method, assigned to prototype
    */
    ModelHandler.prototype = {
        _init: function() {
            this.client.init(this.uid, {
                transparent: 0,
                annotations_visible: 0,
                preload: 0,
                autospin: 0,
                ui_infos: 0,
                ui_stop: 0,
                ui_annotations: 0,
                ui_fullscreen: 0,
                ui_help: 0,
                ui_vr: 0,
                ui_inspector: 0,
                ui_settings: 0,
                ui_hint: 0,
                autostart: 1,
                watermark: 0,
                ui_watermark_link: 0,
                orbit_pan_factor: this.orbitPanFactor,
                orbit_rotation_factor:this.orbitRotationFactor,
                orbit_zoom_factor: this.orbitZoomFactor,
                camera: 0,
                success: function onSuccess(api) {
                    console.log("start", api);

                    api.setCameraEasing('easeOutQuad');

                    api.addEventListener('viewerready', function() {
                        this.api = api;

                        api.setTextureQuality('ld', function(){
                            console.log('Texture quality set to low definition');
                        });
                        
                        this._setCamera();
                        this._onTick();
                        
                        console.log('viewerready...');

						for (var i = 0; i < 3; i++) {
							api.getLight(i,function(err, state){
								if(!err){
									this.lightStates.push(state);
								}
								else{
									console.log("Error: ", err)
									this.lightStates.push([0,0,0]);
								}
								
							}.bind(this));
						}
	
						api.getEnvironment(function(err, state){
							if(!err){
								this.lightStates.push(state);
							}
							else{
								console.log("Error: ", err)
								this.lightStates.push([0,0,0]);
							}
						}.bind(this));

                        this.viewerready = true;
                    }.bind(this));             

                    api.addEventListener( 'camerastart', function() {
                        this.cameraMoving = true;
                    }.bind(this));


                    api.addEventListener( 'camerastop', function(){
                        this.cameraMoving = false;
                    }.bind(this));

                    api.addEventListener('click', this._onClick);


                }.bind(this),
                error: function onError() {
                    console.log('Viewer error');
                }
            });
        },

        _setCamera:  function() {

            this.api.getCameraLookAt(async function( err, camera ){

                this.cameraPositionInit = await camera.position;
                this.cameraTargetCurrentInit = camera.target;
                this.cameraTargetCurrent = this.cameraTargetCurrentInit;
                this.camera = camera;

            }.bind(this) );
        },

        //when the user click in the 3d space, hide both annotations, descriptions and dropdownmenu
        _onClick: function(e) {

            //console.clear()
            var posX = this.camera.position[0].toFixed(3);
            var posY = this.camera.position[1].toFixed(3);
            var posZ = this.camera.position[2].toFixed(3);

            var targX = this.camera.target[0].toFixed(3);
            var targY = this.camera.target[1].toFixed(3);
            var targZ = this.camera.target[2].toFixed(3);
            console.log("camera.position: ", posX, " ", posY, " ", posZ);
            console.log("camera.target: ", targX, " ", targY, " ", targZ);
        },

        _onTick: function() {
            // we dont always log camera position because of memory leak
            if(this.logCamera){
                this._updateCamera();
            }

            this._rotateCamera();

            requestAnimationFrame(this._onTick);
        },

        _updateCamera: function() {
            this.api.getCameraLookAt(function( err, camera ){
                this.camera = camera;
            }.bind(this) );
        },

        _rotateCamera: function() {
            this.time =(this.frames)*(Math.PI / 180)//xy plane;

            this.time = this.time*this.spinVelocity; 

            this.radius = distance3d(this.cameraPositionInit,this.cameraTargetCurrentInit);

            this.initAngle = Math.acos(this.cameraPositionInit[0]/this.radius);
            
            this.x = this.radius * Math.cos(this.initAngle+this.time)+this.cameraTargetCurrentInit[0];
            this.y = this.radius * Math.sin(this.initAngle+this.time)+this.cameraTargetCurrentInit[1];
            
            this.frames++;
            
            // make the model spinn
            if(this.spinning){
                this.api.lookat(  [this.x, this.y, this.cameraPositionInit[2]], this.cameraTargetCurrentInit, 0.00);
            }
        },

        setInitCameraPos: function(useAnimationTime, currentIframe){
            this.currentIframe = currentIframe;
            this.zoomLimits = false;

            this.frames = 0.0;
            //if we changing model we dont want to use animation time, 0.0s instead
            var resetModelTime = (useAnimationTime ? this.resetModelTime : 0.1);

            this.cameraTargetCurrent = this.cameraTargetCurrentInit;
          
            this.api.setCameraLookAt(  this.cameraPositionInit, this.cameraTargetCurrentInit, resetModelTime ); 
        },

        prevAnnotation: function(position,target){

            this.cameraTargetCurrent = this.centerTarget; 

            this.api.setCameraLookAt(position,target,this.animationTime, function(){
                console.log("prev annotation");
            } );

        },

        nextAnnotation: function(position,target){

            this.cameraTargetCurrent = this.centerTarget; 

            this.api.setCameraLookAt(position,target,this.animationTime, function(){
                console.log("next annotation");
            });
        },

        setLights: function(states){

            for (var i = 0; i < 3; i++) {
                this.api.setLight(i, {matrix: states[i].matrix});
            }
            this.api.setEnvironment({rotation: states[3].rotation} );
        },

        setHDtexture: function(callback){
            this.texturQuality = "HD";
            this.api.setTextureQuality('hd', function(readyTexture){
                console.log('Texture quality set to high definition');
                readyTexture = true;
                callback(readyTexture);
                return true;
            });
        },

        setLDtexture: function(callback){
            this.texturQuality = "LD";
            this.api.setTextureQuality('ld', function(readyTexture){
                console.log('Texture quality set to low definition');
                readyTexture = true;
                callback(readyTexture);
                return true;
            });
        },

        viewerIsReady: function(callback){
            console.log('Viewer is ready1');
            this.api.addEventListener('viewerstart', function(viewerready) {
                console.log('Viewer is viewerstart');
                callback(true);
                return true;
            });
        },
        
        get cameraPosition(){
            return this.cameraPositionInit;
        },

        get cameraTarget(){
            return this.cameraTargetCurrentInit;
        },

    };

    /**
    * Private function
    */
    function distance3d(a, b) {
        return Math.sqrt(
            Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2)
        );
    }

    /**
    * Return the constructor function
    */
    return ModelHandler;
}

//register the service
angular.module('3DViewer').factory('SketchfabService', [factoryFunction])
