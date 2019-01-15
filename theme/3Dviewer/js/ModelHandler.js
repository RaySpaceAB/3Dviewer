app.factory('ModelHandler', function(){

    /**
    * Constructor, with class name
    */
    function ModelHandler(iframe, uid, language, annotationBounds, currentIframe) { // ADDED our object constructor
        this.annotation = annotationBounds;
        this.animationTime = annotationBounds.animationTime;
        this.spinVelocity = annotationBounds.spinVelocity;
        this.el = iframe;
        this.cameraMoving = false; 
        this.autospin = 0;
        this.currentIframe = currentIframe;

        this.uid = uid;
        this.language = language;
        this.numberCircleIndex = 0;
        this.maxDistance = annotationBounds.maxDistance; 
        this.minDistance = annotationBounds.minDistance;

        this.cameraPositionInit = null;
        this.cameraTargetInit = null;
        this.annotationPositions = annotationBounds.cameraPosition;
        this.annotationTargets = annotationBounds.cameraTarget;

        this.camStoped = true;
        this.cameraTarget = null;

        this.annotationEls = null;
        this.client = new Sketchfab('1.3.0',this.el);
        this.api = null;
        this.distance = null;
        this.safeCameraPosMax = null;
        this.safeCameraPosMin = null;
        this.safeCameraTargetMax = null;
        this.safeCameraTargetMin = null;
        this.frames = 0;
        this.viewerready = false;

        this.onTick = this.onTick.bind(this);
        this._buildDOM = this._buildDOM.bind(this);
        this.onUpdateCamera = this.onUpdateCamera.bind(this);
        this.setZoomLimits = this.setZoomLimits.bind(this);
        this.onClick = this.onClick.bind(this);
        this.setInitCameraPos = this.setInitCameraPos.bind(this);
        this.prevAnnotation = this.prevAnnotation.bind(this);
        this.nextAnnotation = this.nextAnnotation.bind(this);
        this.setPanLimits = this.setPanLimits.bind(this);

        this.zoomStart = 0;
        this.targetPointScreenCord = 'not init';


        this.zoomDampingFactor = 0.2; //0.3
        this.smoothZoomSpeed = 5.0;
        this.smoothZoom = false;
        this.panLimits = true;

        this.offset = new THREE.Vector3();
        this.position = new THREE.Vector3();
        this.target = new THREE.Vector3();
        //this.scale = 1;
        this.panDistance = 0;
        this.spinning = false;
        this.annotationState = false;
        this.centerTarget = [0,0,0];
        this.resetingCamPos = false;

        // so camera.up is the orbit axis
        this.lastPosition = new THREE.Vector3();

        this.init();
    }

    /**
    * Public method, assigned to prototype
    */
    ModelHandler.prototype = {
        init: function() {
            this.client.init(this.uid, {
                transparent: 0,
                annotations_visible: 0,
                preload: 1,
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
                camera: 0,
                success: function onSuccess(api) {
                    console.log("start");

                    
                    api.start();
                    var initCamPosVec = [0, 0, 0];
                    var initCamTargetVec = [0, 0, 0];
                    var camStoped = true;
                    var timeout;
                    api.setCameraEasing('easeOutQuad');
                    //api.setFov(50);

                    api.setTextureQuality('hd', function(){
                        console.log('Texture quality set to high definition');
                    });

                    api.addEventListener('viewerstart', function(){
                        console.log('viewerstart');
                    });

                    api.addEventListener('viewerready', function() {

                            this.api = api;
                            
                            this._buildDOM();
                            this.onTick();
                            
                            console.log('viewerready');
                            this.viewerready = true;
                            

                            api.getCameraLookAt(function( err, camera ){
                                initCamPosVec = camera.position;
                                initCamTargetVec = camera.target;
                            });

                            
                    }.bind(this));

                    api.addEventListener( 'camerastart', function() {
                        this.cameraMoving = true;
                    }.bind(this));


                    api.addEventListener( 'camerastop', function(){
                        this.cameraMoving = false;
                        this.resetingCamPos = false;
                    }.bind(this));

                    api.addEventListener('annotationFocus', function(index){
                        console.log("Reached annotation: ", index);
                    });

                    
                    api.addEventListener('click', this.onClick);


                }.bind(this),
                error: function onError() {
                    //console.log('something went wrong')
                    console.log('Viewer error');
                }
            });
            
            
        },


        _buildDOM: function() {
            console.log("_buildDOM: ");

            this.api.getCameraLookAt( function( err, camera ){

                this.cameraPositionInit = camera.position;
                this.cameraTargetInit = camera.target;
                this.cameraTarget = this.cameraTargetInit;


                this.api.getWorldToScreenCoordinates(this.cameraTargetInit, function(coord){
                    this.targetPointScreenCord = coord.canvasCoord;

                    console.log("this.cameraTargetInit", this.cameraTargetInit);
                    console.log("coord.canvasCoord", coord);

                    // Debug camera target point
                    mainContent = document.getElementsByClassName('main-content')[0];
                    cameraTarget = document.createElement("div");

                    cameraTarget.className = "cameraTarget";

                    cameraTarget.style.height = '25px';
                    cameraTarget.style.width = '25px'; 
                    cameraTarget.style.top = coord.canvasCoord[1]+"px";
                    cameraTarget.style.left = coord.canvasCoord[0]+"px";
                    cameraTarget.style.borderRadius = '50%';
                    cameraTarget.style.zIndex = '9999';
                    cameraTarget.style.position = 'absolute';
                    cameraTarget.style.backgroundColor = "white";   

                    //document.body.insertBefore(cameraTarget,mainContent);
                }.bind(this));  

            }.bind(this) );


            // Debug zoom lines
            var w = window.innerWidth;
            var h = window.innerHeight;

            mainContent = document.getElementsByClassName('main-content')[0];

            lineUp = document.createElement("div");
            lineUp.id = 'lineUp';
            lineDown = document.createElement("div");
            lineDown.id = 'lineDown';
            lineLeft = document.createElement("div");
            lineLeft.id = 'lineLeft';
            lineRight = document.createElement("div");
            lineRight.id = 'lineRight';

            lineUp.style.height = '5px';
            lineUp.style.width = w+'px';
            lineUp.style.zIndex = '9999';
            lineUp.style.position = 'absolute';
            lineUp.style.backgroundColor = 'white';
            lineUp.style.top = h*1/4+'px';

            lineDown.style.height = '5px';
            lineDown.style.width = w+'px';
            lineDown.style.zIndex = '9999';
            lineDown.style.position = 'absolute';
            lineDown.style.backgroundColor = 'white';
            lineDown.style.top = h*3/4+'px';

            lineRight.style.height = h+'px';
            lineRight.style.width = '5px';
            lineRight.style.zIndex = '9999';
            lineRight.style.position = 'absolute';
            lineRight.style.backgroundColor = 'white';
            lineRight.style.left = w*1/6+'px';

            lineLeft.style.height = h+'px';
            lineLeft.style.width = '5px';
            lineLeft.style.zIndex = '9999';
            lineLeft.style.position = 'absolute';
            lineLeft.style.backgroundColor = 'white';
            lineLeft.style.left = w*5/6+'px';   

            //document.body.insertBefore(lineUp,mainContent);
            //document.body.insertBefore(lineDown,mainContent);
            //document.body.insertBefore(lineRight,mainContent);
            //document.body.insertBefore(lineLeft,mainContent);
        },

        prevAnnotation: function(position,target){

            this.annotationState = true;
            this.zoomLimits = false;
            this.api.getCameraLookAt(function(err,camera){
                var w = window.innerWidth;
                var h = window.innerHeight;
                this.centerTarget[0] = w/2;
                this.centerTarget[1] = h/2;
                this.centerTarget[2] = camera.target[2];
            }.bind(this));

            this.cameraTarget = this.centerTarget; 

            if(hasNoAnnotationSpot(position)){
                this.api.setCameraLookAt(position,target,this.animationTime, function(){
                    console.log("camera reset");
                } );
            }
        },

        nextAnnotation: function(position,target){

            this.annotationState = true;
            this.zoomLimits = false;

            this.api.getCameraLookAt(function(err,camera){
                var w = window.innerWidth;
                var h = window.innerHeight;
                this.centerTarget[0] = w/2;
                this.centerTarget[1] = h/2;
                this.centerTarget[2] = camera[2];
            }.bind(this));

            this.cameraTarget = this.centerTarget; 

            if(hasNoAnnotationSpot(position)){
                this.api.setCameraLookAt(position,target,this.animationTime, function(){
                    console.log("camera reset");
                });
            }
            
        },


        //when the user click in the 3d space, hide both annotations, descriptions and dropdownmenu
        onClick: function(e) {
            this.api.getCameraLookAt(this.setZoomLimits );
            this.distance = distance3d(this.camera.position,this.camera.target);

            this.scale = 1/this.distance;

            this.distanceDiff = this.maxDistance - this.minDistance;

            console.clear()
            console.log("camera.position: ", this.camera.position);
            console.log("camera.target: ", this.camera.target);

            //this.spinning = false;

            if(this.distanceDiff> 200){
                this.scale *= 2000;
            }else if(this.distanceDiff < 100){
                this.scale *= 200;
            }
        },

        setZoomLimits: function(err,camera){

            this.camera = camera;
            alpha = 2;
            if(this.minDistance < 5){
                alpha = 0.6;
            }

            distance = distance3d(camera.position,camera.target);

            if( distance > this.maxDistance && distance < this.maxDistance+alpha*2 ){
                    this.safeCameraPosMax = camera.position;
                    this.safeCameraTargetMax = camera.target;
                    
            }

            if( distance > this.minDistance-alpha*0.5 && distance < this.minDistance+alpha ){
                this.safeCameraPosMin = camera.position;
                this.safeCameraTargetMin = camera.target;
                console.log("safe min");
            }

            EPS = distance;
            this.panDistance = distance3d(this.cameraTargetInit,camera.target);
            
        },

        onTick: function onTick() {

            this.updateCamera();
            var framesPerSecond = 10;
            // requestAnimationFrame ar called approximately 60 times a second, we throttle the animation's speed with 10ms
            requestAnimationFrame(this.onTick);
   
            return this.distannce; 
        },

        updateCamera: function() {
            this.api.getCameraLookAt(this.onUpdateCamera);
        },

        setInitCameraPos: function(useAnimationTime, currentIframe){
            this.currentIframe = currentIframe;
            this.zoomLimits = false;
            this.resetingCamPos = true;
            this.annotationState = false;

            this.frames = 0.0;
            //if we changing model we dont want to use animation time, 0.0s instead
            animationTime = (useAnimationTime ? this.animationTime : 0.0);

            this.cameraTarget = this.cameraTargetInit;
          
            this.api.setCameraLookAt(  this.cameraPositionInit, this.cameraTargetInit, animationTime ); 
        },


        onUpdateCamera: function(err, camera) {
            //this.calcRadius(camera);

            this.distance = distance3d(camera.position,camera.target);

            this.modelScale = this.maxDistance - this.minDistance;
            //console.log("this.currentIframe: ", this.currentIframe);
            var w = window.innerWidth;
            var h = window.innerHeight;
            this.upLimit = (h*1/4)-2200*Math.pow(0.95,this.distance);
            this.downLimit = (h*3/4)+2200*Math.pow(0.95,this.distance);
            this.leftLimit = (w*1/6)-2200*Math.pow(0.95,this.distance);
            this.rightLimit = (w*5/6)+2200*Math.pow(0.95,this.distance);

            // debugging
            // document.getElementById('lineUp').style.top = this.upLimit+'px';
            // document.getElementById('lineDown').style.top = this.downLimit+'px';
            // document.getElementById('lineLeft').style.left = this.leftLimit+'px'; 
            // document.getElementById('lineRight').style.left = this.rightLimit+'px'; 

            time =(this.frames)*(Math.PI / 180)//xy plane;

            time = time*this.spinVelocity; 

            radius = distance3d(this.cameraPositionInit,this.cameraTargetInit);

            initAngle = Math.acos(this.cameraPositionInit[0]/radius);
            
            x = radius * Math.cos(initAngle+time)+this.cameraTargetInit[0];
            y = radius * Math.sin(initAngle+time)+this.cameraTargetInit[1];

            phi = 0* (Math.PI / 180);
            
            this.frames++;
            
            if(this.spinning){
                
                this.api.lookat(  [x, y, this.cameraPositionInit[2]], this.cameraTargetInit, 0.00);
            }

            this.camera = camera;
            alpha = 2;
            if(this.minDistance < 5){
                alpha = 0.6;
            }

            if( this.distance > this.maxDistance-alpha && this.distance < this.maxDistance+alpha ){
                this.safeCameraPosMax = camera.position;
                this.safeCameraTargetMax = camera.target;
                
            }

            if(this.distance > this.minDistance && this.distance < this.minDistance+alpha ){
                this.safeCameraPosMin = camera.position;
                this.safeCameraTargetMin = camera.target;
                //console.log("safe min");
            }

            // since onUpdateCamera runs 60 times per second the-lookat function will be executed 
            // too many times and will "overwrite". Call it instead every second
            this.annotationState = true; 
            if(!this.annotationState){
                if(this.frames % 5 === 0){
                    if(this.distance < this.minDistance-alpha*0.5 && this.safeCameraPosMin ){
                        console.log("set min ");
                        this.api.lookat( this.safeCameraPosMin,this.safeCameraTargetMin, 0.1);
                    }
                }
                camDistance = distance3d(camera.position,camera.target);
                //EPS = camDistance/this.panDistance;
                EPS = (this.maxDistance-this.minDistance)*0.05;
                if(this.frames % 5 === 0){
                    if(this.distance > this.maxDistance+alpha && this.safeCameraPosMax  ){
                        console.log("set max");    
                        this.api.lookat(  this.safeCameraPosMax, this.safeCameraTargetMax,0.1);
                    }
                }

                //console.log("upLimit: ", upLimit);

                // upLimit = (upLimit<0) ? '2px' : upLimit;
                // downLimit = (downLimit>h) ? (h-25+'px') : downLimit;
                // leftLimit = (leftLimit<0) ? '2px' : leftLimit;
                // rightLimit = (rightLimit>w) ? (w-25+'px') : rightLimit;

                if(!this.resetingCamPos){
                    //this.setPanLimits(camera);
                }
                
            }

            this.zoomedCameraTarget = [this.cameraTargetInit[0]/this.distance, this.cameraTargetInit[1]/this.distance, this.cameraTargetInit[2]/this.distance,]
            //console.log("new target: ", this.zoomedCameraTarget);

            this.centerConstant = 15;
        },

        setPanLimits: function(camera){
            this.api.getWorldToScreenCoordinates(this.cameraTarget, function(coord){
                //console.log("coord.canvasCoord: ", coord.canvasCoord, " this.distance: ", this.distance);
                var w = window.innerWidth;
                var h = window.innerHeight;

                // center the camera target if an annontation is in focus
                if(this.annotationState){
                    coord.canvasCoord[0] = w/2;
                    coord.canvasCoord[1] = h/2;
                            
                }

                this.centerTargetDiffH = Math.abs(coord.canvasCoord[1]-(h/2));
                this.centerTargetDiffW = Math.abs(coord.canvasCoord[0]-(w/2));

                this.heightComp = 0;this.centerTargetDiffH*this.distance/this.centerConstant;
                this.widthComp = 0;this.centerTargetDiffW*this.distance/this.centerConstant;

                //this.panDistance = distance3d(this.cameraTargetInit,camera.target);

                // change the coords for the white cricle
                // if(coord.canvasCoord[1] > h/2){
                //     document.getElementsByClassName("cameraTarget")[0].style.top = coord.canvasCoord[1]-(this.heightComp) +"px";
                // }
                // else{
                //     document.getElementsByClassName("cameraTarget")[0].style.top = coord.canvasCoord[1]+(this.heightComp) +"px";
                // }
                // if(coord.canvasCoord[0] > w/2){
                //     document.getElementsByClassName("cameraTarget")[0].style.left = coord.canvasCoord[0]-(this.widthComp) +"px";
                // }
                // else{
                //     document.getElementsByClassName("cameraTarget")[0].style.left = coord.canvasCoord[0]+(this.widthComp) +"px";
                // }
                

                this.distance = distance3d(this.camera.position,this.camera.target);

                // requestAnimationFrame ar called approximately 60 times a second, we throttle the animation's speed to 12 times a second
                if( this.frames % 5 === 0){
                    var period = true;
                }
                else{
                    var period = false;
                }

                //this.scale = 1/this.distance;
                //console.log("this.scale: ", this.scale);
                if((coord.canvasCoord[0]-this.widthComp) > this.rightLimit && period ){
                    console.log("rightLimit ");
                    //this.api.lookat(  this.prevCamPosRight, this.prevCamTargetRight, 0.1);
                }else if((coord.canvasCoord[0]-this.widthComp) < this.rightLimit){
                    this.prevCamPosRight = this.camera.position;
                    this.prevCamTargetRight = this.camera.target;
                }

                if((coord.canvasCoord[0]+this.widthComp) < this.leftLimit && period ){
                    console.log("leftLimit");
                    //this.api.lookat(  this.prevCamPosLeft, this.prevCamTargetLeft, 0.1)
                }else if((coord.canvasCoord[0]+this.widthComp) > this.leftLimit ){
                   // console.log("prev target: ", camera.target);
                    this.prevCamPosLeft = this.camera.position;
                    this.prevCamTargetLeft = this.camera.target;
                }

                if((coord.canvasCoord[1]-this.heightComp) > this.downLimit && period ){
                    console.log("downLimit" );
                    //this.api.lookat(  this.prevCamPosDown, this.prevCamTargetDown, 0.1)
                }else if((coord.canvasCoord[1]-this.heightComp) < this.downLimit){
                    this.prevCamPosDown = this.camera.position;
                    this.prevCamTargetDown = this.camera.target;
                }

                if((coord.canvasCoord[1]+this.heightComp) < this.upLimit && period){
                    console.log("upLimit" );
                    //this.api.lookat(  this.prevCamPosUp, this.prevCamTargetUp, 0.1)
                }else if((coord.canvasCoord[1]+this.heightComp) > this.upLimit ){
                    this.prevCamPosUp = this.camera.position;
                    this.prevCamTargetUp = this.camera.target;
                }
            }.bind(this));
        }
    };

    /**
    * Private function
    */
    function distance3d(a, b) {
        return Math.sqrt(
            Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2)
        );
    }

    function vectorLength(v) {
        return Math.sqrt(
            Math.pow(v[0], 2) + Math.pow(v[1], 2) + Math.pow(v[2], 2)
        );
    }

    function magnitude(targetVector){
        return Math.sqrt(Math.pow(targetVector[0],2) + Math.pow(targetVector[1],2) + Math.pow(targetVector[2],2));
    }

    function hasNoAnnotationSpot(position){
        console.log("position: ", position);
        var sumOfPositionCoords = position[0] + position[1] + position[2];
        if(sumOfPositionCoords == 0.0){
            return false;
        }
        else{
            return true;
        }
    }


    /**
    * Return the constructor function
    */
    return ModelHandler;
})
//Finally register the service
