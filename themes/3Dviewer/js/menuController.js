'use strict';
function menuController( $scope, $interval, $sce, $window, $timeout, $location, $anchorScroll, $http, $q, $element, _, WPservice, SketchfabService) {
        // using style guide from: https://softwarejuancarlos.com/2014/09/14/angularjs-controller-code-structure/
        var ctrl = this;

        //// PUBLIC fields
        ctrl.homeURL = $element.attr("home_url");
        ctrl.currentDescription = "";
        ctrl.helpText = "";
        ctrl.showAnnotationBox = false;
        ctrl.showHelpBox = false;
        ctrl.languages = ["Svenska","English"];
        ctrl.selectedLanguage = 0;
        ctrl.data = {};
        ctrl.posts = {};
        ctrl.embededIframe = {};
        ctrl.selected = 0;

        //// PUBLIC Methods

        // Initialize module
        ctrl.init = _init;
        // Applies a border over the selected model in the menue 
        ctrl.select = _select;
        // Show/hide the black annotation box
        ctrl._showAnnotationBox = _showAnnotationBox;
        // Change model by scrolling down the page to the models location
        ctrl.scrollTo = _scrollTo;
        // Change the camera location to previous annotation spot
        ctrl.prevAnnotation = _prevAnnotation;
        // Change the camera location to next annotation spot
        ctrl.nextAnnotation = _nextAnnotation;
        // Cahnge language of annotation description and model name
        ctrl.changeLanguage = _changeLanguage;
        // reset the camera to default location and rests the anotation description
        ctrl.resetCam = _resetCam;

        ctrl.showMenu = _showMenu;
        

        //// PRIVATE fields

        var _iframes = [];
        var _viewers = [];
        
        var _loadModelTime = 2000;
        var _time = 0;
        var _animationTime = 0;
        var _resetModelTime = 0;
        var _spin_velocity = 0;
        var _resetTime;
        var _menuScale = 0;
        var _textboxScale = 0;
        var _orbitPanFactor = 1;
        var _orbitRotationFactor = 1;
        var _orbitZoomFactor = 1;
        var _lightStates = [];
        var _logCamera = 0;

        var _helpTextSwe = "";
        var _helpTextEng = "";

        var _helpHeadingSwe = "";
        var _helpHeadingEng = "";

        var _readyFrames = 0;
        var _allIframesReady = false;
        var _loadingInterval = null;
        var _standbyLayers = [];

        var _sweAnnotTitle = [];
        var _engAnnotTitle = [];
        var _descriptionsEng = [];
        var _descriptionsSwe = [];
        var _swedishTitle = [];
        var _englishTitle = [];

        var _cameraTarget = [];
        var _cameraPositions = [];

        var _language = "swe";

        var _currentAnnotation =0;
        var _currentModel = 0;

        var _loadingLayer = null;
        var _mainContent = null;

        var _modelReady = 0;

        var _viewerStarted = true;

        var _currentModelElm = null;
        var _infoButtonElm = null;
        var _menuElm = null;

        // get the base url and the path: /3dviewer
        $scope.baseUrl = new $window.URL($location.absUrl()).origin;
        _init($scope.baseUrl + $location.$$path);

        //// PRIVATE Functions - Public Methods Implementation
        function _init(rootPath){
            // gets the wp-posts from page 1

            var wPservice = new WPservice();

            wPservice.getPosts(rootPath).then(posts =>{

                ctrl.posts = posts;

                _iframes = document.getElementsByClassName('sketchfab-embed-wrapper');
                
                // creating a loading dom layer above iframes
                _loadingLayer = document.createElement( 'div' );
                _loadingLayer.className = 'd-flex justify-content-center loading';

                _mainContent= document.getElementById("main-content");
                _mainContent.append(_loadingLayer);

                let text = document.createElement( 'h2' );
                text.className = "align-self-center loading-content"

                _loadingLayer.appendChild(text);

                // update loading text
                _loadingInterval = $interval(function(){
                    _loadingLayer.firstChild.innerHTML = 
                    "Sorry for the inconvenience" +'<br>'+
                    "Initiating awesomeness" +'<br>'+
                    "Models loaded: " + _modelReady + "/" + _iframes.length;
                },100);

                // when the jquarys from the iframes are ready we can create viewer objects
                $(document).ready(function(){
                    //very importat delay to get all iframes loaded
                    setTimeout(function(){
                        loadModels(1, 0, _iframes.length);
                    },_loadModelTime);
                    preventSpinning();
                });
            });
        };

        function loadModels(chunkSize, startModel, modelCount)
        {
            return new Promise((resolve) => {
                for (let modelIndex = 0; modelIndex < chunkSize; ++modelIndex){
                    console.log("modelToLoad: ", modelIndex);
                    if (modelIndex < modelCount){
                        loadModel(chunkSize, modelIndex, modelCount);
                    }
                }
                resolve();
            });
        }

        function loadModel(chunkSize, modelIndex, modelCount)
        {
            if (modelIndex < modelCount){
                let viewer = initModels(modelIndex);

                // call loadModel() when variable viewer.viewerready is resolved and true
                resolveViewerready(viewer).then((viewerready) => {
                  if (!viewerready){
                    console.log("Failed to load model: " + modelIndex);
                  }
                  ++_modelReady;
                  loadModel(chunkSize, modelIndex + chunkSize, modelCount);
                });
            }
            else if (_modelReady == modelCount){
                console.log("_modelReady: " ,_modelReady, " modelCount: ", modelCount );
                // set the first annotations to sketchfabs initposition when all models are loaded
                for (let i = 0; i < _iframes.length; i++) {
                    setDefaultAnnotation(i);                
                }
                _allIframesReady = true;
                updateFirstModel();
                startInterval();
            }
        }

        function resolveViewerready(x, i) {
            return new Promise(resolve => {

                function checkViewerready(){
                    if(x.viewerready){
                        resolve(x.viewerready, i + 1);
                    }
                    else{
                        setTimeout(checkViewerready,1000);
                    }
                }
                checkViewerready();
            });
        }

        function initModels(i){
            console.log("loading model: ", i);
            // assigning the annotation data from wordpress to global variables
            _descriptionsSwe[i] = ctrl.posts[i].post_meta_fields.swe_description;
            _descriptionsEng[i] = ctrl.posts[i].post_meta_fields.eng_description;
            _sweAnnotTitle[i] = ctrl.posts[i].post_meta_fields.swe_title;
            _engAnnotTitle[i] = ctrl.posts[i].post_meta_fields.eng_title;
            _englishTitle[i] = ctrl.posts[i].post_meta_fields.eng_model_title;

            _helpTextSwe = ctrl.posts[0].post_meta_fields.swe_help_text;
            _helpTextEng = ctrl.posts[0].post_meta_fields.eng_help_text;
            _helpHeadingSwe = ctrl.posts[0].post_meta_fields.swe_help_heading;
            _helpHeadingEng = ctrl.posts[0].post_meta_fields.eng_help_heading;

            _spin_velocity = ctrl.posts[0].post_meta_fields.spin_velocity;
            _animationTime = ctrl.posts[0].post_meta_fields.animation_time;
            _resetModelTime = ctrl.posts[0].post_meta_fields.reset_model_time;
            _resetTime = ctrl.posts[0].post_meta_fields.reset_time;
            _menuScale = ctrl.posts[0].post_meta_fields.menu_scale;
            _textboxScale = ctrl.posts[0].post_meta_fields.textbox_scale;
            _orbitPanFactor = ctrl.posts[0].post_meta_fields.orbit_pan_factor;
            _orbitRotationFactor = ctrl.posts[0].post_meta_fields.orbit_rotation_factor;
            _orbitZoomFactor = ctrl.posts[0].post_meta_fields.orbit_zoom_factor;
            _logCamera = ctrl.posts[0].post_meta_fields.log_camera;

            _cameraPositions[i] = ctrl.posts[i].post_meta_fields.camera_position;
            _cameraTarget[i] = ctrl.posts[i].post_meta_fields.camera_target;

            //substringing the urlid from the src string
            let iframeSrc = _iframes[i].children[0].src;

            let catalogName = 'models';
            let uid_pos = iframeSrc.search(catalogName) + catalogName.length + 1;

            let urlid_temp = iframeSrc.substring(uid_pos,iframeSrc.length);
            let urlid = urlid_temp.substring(0,urlid_temp.search('/'));

            //new annotation
            let annotationBounds = { animationTime: _animationTime,
                                    resetModelTime: _resetModelTime,
                                    cameraPosition: _cameraPositions[i],
                                    cameraTarget: _cameraTarget[i],
                                    spinVelocity: _spin_velocity,
                                    orbitPanFactor: _orbitPanFactor,
                                    orbitRotationFactor: _orbitRotationFactor,
                                    orbitZoomFactor: _orbitZoomFactor,
                                    logCamera: _logCamera
                                }; 

            // createing a viewer objects with sketchfabs api
            _viewers[i] = new SketchfabService(_iframes[i].children[0], urlid, annotationBounds, i);

            //Setting the titles
            _swedishTitle.push(ctrl.posts[i].title.rendered);

            // set the firts model titel to swedish
            ctrl.modelTitle = _swedishTitle[0];
            ctrl.currentTitle = ctrl.modelTitle;
            ctrl.helpHeading = _helpHeadingSwe; 
            ctrl.helpText = _helpTextSwe;

            // set the menu and annotationBox width. Using the scale parameter if the screen is a big touch screen
            if(window.innerHeight > 3000){
                scaleMenu(_textboxScale,_menuScale);
            }else{
                _menuScale = 1;
                scaleMenu(1,1);
            }
            
            return _viewers[i];
        }

        function _select(model) {
            ctrl.selected = model;
        }

        // hide annotation box and show the border of info button or on the contrary
        function _showAnnotationBox(button){
            _time = 0;
            //let res = _getViewerReady();
            // default button
            let ButtonElm = null;
            switch (button) {
                case 1:
                    // show/hide annotationInfo
                    ctrl.showHelpBox = false;
                    let helpButton = document.getElementsByClassName("infoButton")[1];
                    helpButton.className = helpButton.className.replace(' --active', '');
                    if(ctrl.showAnnotationBox){
                        ctrl.showAnnotationBox = false;
                    }else{
                        ctrl.showAnnotationBox = true;
                        // we allways want to go to the first annotation, pass index 0
                        firstAnnotation(_currentAnnotation);
                    }
                    ButtonElm = document.getElementsByClassName("infoButton")[0];
                    break;
                case 2:
                    // show/hide helpInfo
                    ctrl.showAnnotationBox = false;
                    let infoButton = document.getElementsByClassName("infoButton")[0];
                    infoButton.className = infoButton.className.replace(' --active', '');
                    if(ctrl.showHelpBox){
                        ctrl.showHelpBox = false;
                    }else{
                        ctrl.showHelpBox = true;
                    }
                    ButtonElm = document.getElementsByClassName("infoButton")[1];
                    break;
                case 3:
                    //close annotation/help box
                    if(ctrl.showAnnotationBox){
                        let infoButton = document.getElementsByClassName("infoButton")[1];
                        infoButton.className = infoButton.className.replace(' --active', '');
                        ButtonElm = document.getElementsByClassName("infoButton")[0];
                        ctrl.showAnnotationBox = false;
                    }
                    else if(ctrl.showHelpBox){
                        let helpButton = document.getElementsByClassName("infoButton")[0];
                        helpButton.className = helpButton.className.replace(' --active', '');
                        ButtonElm = document.getElementsByClassName("infoButton")[1];
                        ctrl.showHelpBox = false;
                    }
                    break;
                case 4:
                    // show annotation box when it is visible an we change model
                    if(!ctrl.showAnnotationBox){
                        firstAnnotation(_currentAnnotation);
                    }
                    break;
                default:

            }

            // switch from white/black button background
            if(ButtonElm){
                if (ButtonElm.className.indexOf(' --active') === -1) {
                ButtonElm.className += ' --active';
                }else{
                    ButtonElm.className = ButtonElm.className.replace(' --active', '');
                }
            }
            
        };

        function _showMenu(){
            _time = 0;

            let currentIframeElm = document.getElementById(_currentModel);
            if(currentIframeElm.contains(_standbyLayers[_currentModel])){
                ctrl.currentIframeElm = document.getElementById(_currentModel);
                ctrl.currentIframeElm.removeChild(_standbyLayers[_currentModel]);
            } 

            
            if (_viewers[_currentModel].spinning) {
                let menuElm = document.getElementsByClassName("menu")[0];
                menuElm.style.left= 0 + "px";
                _viewers[_currentModel].spinning = false;
            }
        };

        function _scrollTo(selectedModelIndex){
            //prevent reset cam pos if same model is clicked as current model
            if(ctrl.selected !== selectedModelIndex){
                _viewers[_currentModel].setLDtexture(
                    function(readyTexture){
                        if(readyTexture){  
                            console.log("texture set to ld: ");
                        }
                });
                
                //reset current model before we scroll to next modell
                _resetCam(false);

                // change model index to selected
                _currentModel = selectedModelIndex;

                // update text in annotation box
                _showAnnotationBox(4);

                if(_language == "eng"){
                    ctrl.currentTitle = _engAnnotTitle[_currentModel][0];
                    ctrl.currentDescription = _descriptionsEng[_currentModel][0];
                }else{
                    let sweDescription = _descriptionsSwe[_currentModel][0];
                    ctrl.currentTitle = _sweAnnotTitle[_currentModel][0];
                    ctrl.currentDescription = sweDescription;
                }
                // change the texture to LD of the previous model
                console.log("scroll to medel ", selectedModelIndex);
                
                let viewer= document.getElementById(selectedModelIndex);

                // append loading bar for texture-loading
                let loading = document.createElement( 'div' );
                let loadTextureLayer = document.createElement( 'div' );

                loading.className = "spinner";
                loadTextureLayer.className = "load-texture-layer";
                viewer.appendChild(loading)
                viewer.appendChild(loadTextureLayer)
                //change the texture to HD of the current model
                _viewers[_currentModel].setHDtexture(
                    function(readyTexture){
                    console.log("response: ", readyTexture);
                    // remove loading bar and loadTextureLayer
                    if(readyTexture){  
                        setTimeout(()=>{
                            viewer.removeChild(loading);
                            viewer.removeChild(loadTextureLayer);
                        },1000) 
                    }
                });

                for (var i = 0; i < _viewers.length; i++) {
                    console.log("Texture quality: ", _viewers[i].texturQuality);
                }

                $location.hash(selectedModelIndex);

                //set the annotation box to default
                _currentAnnotation = 0;

                $anchorScroll();
            }
            console.log("already selected");
            
        };

        function _changeModelTitle(){
            console.log("changeModelTitle");
            if(_language == "eng"){
                ctrl.modelTitle = _englishTitle[_currentModel];
            }
            else{
                ctrl.modelTitle = _swedishTitle[_currentModel];
            }
        }

        function firstAnnotation(currentAnnotation){
            if(hasAnnotation(_cameraPositions[_currentModel][0])){
                if(_language == "eng"){
                    ctrl.currentTitle = _engAnnotTitle[_currentModel][_currentAnnotation];
                    ctrl.currentDescription = _descriptionsEng[_currentModel][_currentAnnotation];
                }else{
                    let sweDescription = _descriptionsSwe[_currentModel][_currentAnnotation];
                    ctrl.currentTitle = _sweAnnotTitle[_currentModel][_currentAnnotation];
                    ctrl.currentDescription = sweDescription;
                }
                _viewers[_currentModel].prevAnnotation(_cameraPositions[_currentModel][currentAnnotation], _cameraTarget[_currentModel][currentAnnotation]);
            }
        }

        function _prevAnnotation(){
            _time = 0;

            // check if the model has annotatoins
            if(hasAnnotation(_cameraPositions[_currentModel][0])){
                // check which way the anotation is
                if(_currentAnnotation > 0){
                    _currentAnnotation--;
                    if(_language == "eng"){
                        ctrl.currentTitle = _engAnnotTitle[_currentModel][_currentAnnotation];
                        ctrl.currentDescription = _descriptionsEng[_currentModel][_currentAnnotation];
                    }else{
                        ctrl.currentTitle = _sweAnnotTitle[_currentModel][_currentAnnotation];
                        ctrl.currentDescription = _descriptionsSwe[_currentModel][_currentAnnotation];
                    }
                    // jump to previous annotation using the api's setCameraLookat using the annotation positions from WP
                    _viewers[_currentModel].prevAnnotation(_cameraPositions[_currentModel][_currentAnnotation], _cameraTarget[_currentModel][_currentAnnotation]);
                }else{
                    _currentAnnotation = _engAnnotTitle[_currentModel].length;
                    ctrl.prevAnnotation();
                }
            }
        };

        function _nextAnnotation(){
            _time = 0;
            console.log("_cameraPositions: ", _cameraPositions[_currentModel]);
            if(hasAnnotation(_cameraPositions[_currentModel][0])){
                if(_currentAnnotation < _sweAnnotTitle[_currentModel].length-1){
                    _currentAnnotation++;
                    if(_language == "eng"){
                        ctrl.currentTitle = _engAnnotTitle[_currentModel][_currentAnnotation];
                        ctrl.currentDescription = _descriptionsEng[_currentModel][_currentAnnotation];
                    }else{
                        let sweDescription = _descriptionsSwe[_currentModel][_currentAnnotation];
                        ctrl.currentTitle = _sweAnnotTitle[_currentModel][_currentAnnotation];
                        ctrl.currentDescription = sweDescription;
                    }
                    _viewers[_currentModel].prevAnnotation(_cameraPositions[_currentModel][_currentAnnotation], _cameraTarget[_currentModel][_currentAnnotation]);
                }else{
                    _currentAnnotation = -1;
                    ctrl.nextAnnotation();
                }
            }
        };

        function _changeLanguage($index){
            // change the css style for the selected language
            ctrl.selectedLanguage = $index;

            _time = 0;
            
            if($index == 0){
                ctrl.modelTitle = _swedishTitle[_currentModel];
                ctrl.currentTitle = ctrl.modelTitle;
                ctrl.helpText = _helpTextSwe;
                ctrl.helpHeading = _helpHeadingSwe;
                _language = "swe";
                if(_currentAnnotation != -1){
                    ctrl.currentTitle = _sweAnnotTitle[_currentModel][_currentAnnotation];
                    ctrl.currentDescription = _descriptionsSwe[_currentModel][_currentAnnotation].toString();    
                }
            }else{
                ctrl.modelTitle = _englishTitle[_currentModel];
                ctrl.currentTitle = ctrl.modelTitle;
                ctrl.helpText = _helpTextEng;
                ctrl.helpHeading = _helpHeadingEng;
                _language = "eng";
                if(_currentAnnotation != -1){
                    ctrl.currentTitle = _engAnnotTitle[_currentModel][_currentAnnotation];
                    ctrl.currentDescription = _descriptionsEng[_currentModel][_currentAnnotation];
                }
            }
        };

        function _resetCam(modelChanged){
            _currentAnnotation = 0;
            firstAnnotation(_currentAnnotation);

            _currentModelElm = document.getElementById(_currentModel);

            // if user just want to reset the cam, modelChange is false
            if(!modelChanged ){
                _viewers[_currentModel].spinning = false;
            }
            if(_currentModelElm.contains(_standbyLayers[_currentModel]) && !modelChanged){
                ctrl.currentIframeElm = document.getElementById(_currentModel);
                ctrl.currentIframeElm.removeChild(_standbyLayers[_currentModel]);
            }

            // reset light positions
            _viewers[_currentModel].setLights(_viewers[_currentModel].lightStates);
            
            // if modelChanged is true use animation time
            _viewers[_currentModel].setInitCameraPos(modelChanged,_currentModel);
        }

        // The spinning layer disappears when the screen is touched
        function preventSpinning(){
            // adding event listener to prevent the model from spinning when it's inactive 
            for (let i = 0; i < _iframes.length; i++) {

                _standbyLayers[i] = document.createElement( 'div' );
                _standbyLayers[i].className = 'standby-layer';

                _standbyLayers[i].addEventListener('touchstart',function(ev){
                    _showMenu();
                    
                    if (ev.touches.length == 1 ) {
                        ev.preventDefault();
                        console.log("one touch");
                    }

                    _showAnnotationBox(1);
                    _viewers[_currentModel].spinning = false;
                });

                _standbyLayers[i].addEventListener('mousedown',function(){

                    _showMenu();
                    _showAnnotationBox(1);

                    _viewers[_currentModel].spinning = false;
                });
            }
        }

        function updateFirstModel(){

            _viewers[0].setHDtexture(function(returnValue){
                console.log("Set model 0 to hd texture: ", returnValue);
            });

            // scrolling down to the model under and scrolling upp again
            // to refreshing the frame, otherwise the first model will laggining 
            $location.hash(1);
            $anchorScroll();
            
            $timeout(function() {
                $location.hash(0);
                $anchorScroll();
            }, 1000);

            //wait 2s more to wait for the $location.hash(0) to scroll back to iframe 0
            $timeout(function() {    
                _mainContent.removeChild(_loadingLayer);
                $interval.cancel(_loadingInterval);  
            }, _loadModelTime);
        }

        // Evaluates if the model is ready to manipulate or not
        // The loading layer disappears when al models ar ready 
        // The model starts spinning if it has been iactive over a specific time 
        function startInterval(){
            $interval(updateTime, 1000);
        }

        function updateTime(){
            // reset camera, start spinning, append _standbyLayers
            if(!_viewers[_currentModel].cameraMoving){
                _time++;
                //_time == _resetTime
                if(_time == _resetTime){
                    // use animation time?
                    _resetCam(true);
                    $timeout(function(){
                        _viewers[_currentModel].spinning = true;

                        ctrl.showAnnotationBox = false;
                        ctrl.showHelpBox = false;

                        // variable frames is updated ever second and initangle is dependent on this
                        _viewers[_currentModel].frames = 0.0;
                        ctrl.currentIframeElm = document.getElementById(_currentModel);
                        ctrl.currentIframeElm.appendChild(_standbyLayers[_currentModel]);

                        // deselect the info button border
                        _infoButtonElm = document.getElementsByClassName("infoButton")[0];
                        if (_infoButtonElm.className.indexOf(' --active') !== -1) {
                            _infoButtonElm.className = _infoButtonElm.className.replace(' --active', '');
                        }

                        // deselect the info button border
                        _infoButtonElm = document.getElementsByClassName("infoButton")[1];
                        if (_infoButtonElm.className.indexOf(' --active') !== -1) {
                            _infoButtonElm.className = _infoButtonElm.className.replace(' --active', '');
                        }

                        // hide menu
                        _menuElm = document.getElementsByClassName("menu")[0];
                        _menuElm.style.left= -90* _menuScale + "px";
                        
                        // animationTime is in seconds, must use ms
                    },_animationTime*1000+10);
                }
            }else{
                _time = 0;
            }
        }

        //// PRIVATE Functions

        // init the camera positions for the default annotation
        function setDefaultAnnotation(index){
            _cameraPositions[index][0] = _viewers[index].cameraPosition;
            _cameraTarget[index][0] = _viewers[index].cameraTarget;
        }

        function hasAnnotation(position){
            _cameraPositions[_currentModel];

            if(_cameraPositions[_currentModel].length > 0){
                return true;
            }
            else{
                return false;
            }
        }

        // scale value from WP is used to set the menu width
        function scaleMenu(textboxScale,menuScale){
            document.getElementsByTagName("p")[0].style.fontSize= 18* textboxScale + "px";
            document.getElementsByTagName("p")[1].style.fontSize= 18* textboxScale + "px";
            document.getElementsByTagName("h2")[0].style.fontSize= 30* textboxScale + "px";
            document.getElementsByTagName("h2")[1].style.fontSize= 30* textboxScale + "px";
            document.getElementsByClassName("menu")[0].style.width= 90* menuScale + "px"; 
            document.getElementsByClassName("label")[0].style.fontSize= 80*menuScale+"px";
            document.getElementsByClassName("label")[1].style.fontSize= 80*menuScale+"px";
            document.getElementsByClassName("infoButton")[0].style.height= 90 * menuScale +"px";
            document.getElementsByClassName("infoButton")[1].style.height= 90 * menuScale +"px";
            document.getElementsByClassName("wrapper")[0].style.width= (580)* textboxScale +"px";
            document.getElementsByClassName("wrapper")[1].style.width= (580) * textboxScale +"px";
            document.getElementsByClassName("language-list")[0].children[0].style.fontSize= 18 * textboxScale +"px";
            document.getElementsByClassName("language-list")[0].children[1].style.fontSize= 18 * textboxScale +"px";
            document.getElementsByClassName("language-list")[1].children[0].style.fontSize= 18 * textboxScale +"px";
            document.getElementsByClassName("language-list")[1].children[1].style.fontSize= 18 * textboxScale +"px";
        }
    }

// post.content.rendered is a text string with html tags, to be accepted as html code we must use trustAsHtml
angular.module('3DViewer').filter('unsafe', function($sce) { return $sce.trustAsHtml; });



angular.module('3DViewer').component('app', {
    templateUrl: function($element) {
       return $element.attr("template_uri") +'/js/app.template.html';
    },
    controller: menuController
})
