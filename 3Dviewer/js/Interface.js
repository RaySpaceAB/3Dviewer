var app = angular.module('wp', ['ngRoute', 'ngSanitize', 'ngAnimate', 'hmTouchEvents']);

app.filter('unsafe', function($sce) { return $sce.trustAsHtml; });

app.config(function($routeProvider, $locationProvider) {
    location.hash = '0';
    $routeProvider
   .when('/', {
        controller: 'Main'
    })
    .otherwise({ 
        redirectTo: '/3dviewer' 
    });

    $locationProvider.html5Mode(true);

});

app.controller('Main', ['$scope',
                        '$interval', 
                        '$sce', 
                        '$window',
                        '$timeout', 
                        '$location', 
                        '$anchorScroll', 
                        '$http', 
                        '$q', 
                        'WPservice', 
                        'ModelHandler', 
                        function(   $scope, 
                                    $interval, 
                                    $sce, 
                                    $window, 
                                    $timeout, 
                                    $location, 
                                    $anchorScroll, 
                                    $http, 
                                    $q, 
                                    WPservice, 
                                    ModelHandler) {

    'use strict';
    // using style guide from: https://softwarejuancarlos.com/2014/09/14/angularjs-controller-code-structure/
    var self = this;

    //// PUBLIC fields
    
    self.currentDescription = "";
    self.helpText = "";
    self.showAnnotationBox = false;
    self.showHelpBox = false;
    self.languages = ["Svenska","English"];
    self.selectedLanguage = 0;
    self.data = {};

    //// PUBLIC Methods

    // Initialize module
    self.init = _init;

    // Applies a border over the selected model in the menue 
    self.select = _select;

    // Show/hide the black annotation box
    self._showAnnotationBox = _showAnnotationBox;

    // Change model by scrolling down the page to the models location
    self.scrollTo = _scrollTo;

    // Change the camera location to previous annotation spot
    self.prevAnnotation = _prevAnnotation;

    // Change the camera location to next annotation spot
    self.nextAnnotation = _nextAnnotation;

    // Cahnge language of annotation description and model name
    self.changeLanguage = _changeLanguage;

    // reset the camera to default location and rests the anotation description
    self.resetCam = _resetCam;

    self.showMenu = _showMenu;

    self.selected = 0;

    //// PRIVATE fields

    var _iframes = [];
    var _viewers = [];
    
    var _loadModelTime = 2000;
    var _ran = true;
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
    var _spinLayer = [];

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
    var _currentIframe = 0;

    var _layer = null;
    var _mainContent = null;

    var _modelReady = 0;

    var _viewerStarted = true;

    var _currentIframeElm = null;
    var _infoButtonElm = null;
    var _menuElm = null;

    //// PRIVATE Functions - Public Methods Implementation
    function _init(rootPath){
        // gets the wp-posts from page 1
        WPservice.getPosts(rootPath,1).then(posts =>{
            self.data = WPservice;
            
            _iframes = document.getElementsByClassName('sketchfab-embed-wrapper');     
            
            // creating a "not ready" window above the loading model 
            _layer = document.createElement( 'div' );

            _mainContent= document.getElementById("main-content");

            _layer.className = 'blackBox';

            _mainContent.append(_layer);

            let text = document.createElement( 'h2' );
            text.innerHTML = "Loading";
            text.className = "notReady"

            _layer.appendChild(text);

            // update loading text
            _loadingInterval = $interval(function(){
                _layer.firstChild.innerHTML = "Models loaded: " + _modelReady + "/" + _iframes.length;
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
        console.log("Data: ", self.data.posts[i].post_meta_fields);
        
        _descriptionsSwe[i] = self.data.posts[i].post_meta_fields.swe_description;

        _descriptionsEng[i] = self.data.posts[i].post_meta_fields.eng_description;

        _sweAnnotTitle[i] = self.data.posts[i].post_meta_fields.swe_title;

        _engAnnotTitle[i] = self.data.posts[i].post_meta_fields.eng_title;

        _englishTitle[i] = self.data.posts[i].post_meta_fields.eng_model_title;

        _helpTextSwe = self.data.posts[0].post_meta_fields.swe_help_text;
        _helpTextEng = self.data.posts[0].post_meta_fields.eng_help_text;

        _helpHeadingSwe = self.data.posts[0].post_meta_fields.swe_help_heading;
        _helpHeadingEng = self.data.posts[0].post_meta_fields.eng_help_heading;

        _spin_velocity = self.data.posts[0].post_meta_fields.spin_velocity;
        _animationTime = self.data.posts[0].post_meta_fields.animation_time;
        _resetModelTime = self.data.posts[0].post_meta_fields.reset_model_time;
        _resetTime = self.data.posts[0].post_meta_fields.reset_time;
        _menuScale = self.data.posts[0].post_meta_fields.menu_scale;
        _textboxScale = self.data.posts[0].post_meta_fields.textbox_scale;
        _orbitPanFactor = self.data.posts[0].post_meta_fields.orbit_pan_factor;
        _orbitRotationFactor = self.data.posts[0].post_meta_fields.orbit_rotation_factor;
        _orbitZoomFactor = self.data.posts[0].post_meta_fields.orbit_zoom_factor;
        _logCamera = self.data.posts[0].post_meta_fields.log_camera;

        _cameraPositions[i] = self.data.posts[i].post_meta_fields.camera_position;
        _cameraTarget[i] = self.data.posts[i].post_meta_fields.camera_target;

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
        _viewers[i] = new ModelHandler(_iframes[i].children[0], urlid, annotationBounds, i);

        //Setting the titles
        _swedishTitle.push(self.data.posts[i].title.rendered);

        // set the firts model titel to swedish
        self.modelTitle = _swedishTitle[0];
        self.currentTitle = self.modelTitle;
        self.helpHeading = _helpHeadingSwe; 
        self.helpText = _helpTextSwe;

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
        self.selected = model;
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
                self.showHelpBox = false;
                let helpButton = document.getElementsByClassName("infoButton")[1];
                helpButton.className = helpButton.className.replace(' --active', '');
                if(self.showAnnotationBox){
                    self.showAnnotationBox = false;
                }else{
                    self.showAnnotationBox = true;
                    // we allways want to go to the first annotation, pass index 0
                    firstAnnotation(_currentAnnotation);
                }
                ButtonElm = document.getElementsByClassName("infoButton")[0];
                break;
            case 2:
                // show/hide helpInfo
                self.showAnnotationBox = false;
                let infoButton = document.getElementsByClassName("infoButton")[0];
                infoButton.className = infoButton.className.replace(' --active', '');
                if(self.showHelpBox){
                    self.showHelpBox = false;
                }else{
                    self.showHelpBox = true;
                }
                ButtonElm = document.getElementsByClassName("infoButton")[1];
                break;
            case 3:
                //close annotation/help box
                if(self.showAnnotationBox){
                    let infoButton = document.getElementsByClassName("infoButton")[1];
                    infoButton.className = infoButton.className.replace(' --active', '');
                    ButtonElm = document.getElementsByClassName("infoButton")[0];
                    self.showAnnotationBox = false;
                }
                else if(self.showHelpBox){
                    let helpButton = document.getElementsByClassName("infoButton")[0];
                    helpButton.className = helpButton.className.replace(' --active', '');
                    ButtonElm = document.getElementsByClassName("infoButton")[1];
                    self.showHelpBox = false;
                }
                break;
            case 4:
                // show annotation box when it is visible an we change model
                if(!self.showAnnotationBox){
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

        let currentIframeElm = document.getElementById(_currentIframe);
        if(currentIframeElm.contains(_spinLayer[_currentIframe])){
            self.currentViewElm = document.getElementById(_currentIframe);
            self.currentViewElm.removeChild(_spinLayer[_currentIframe]);
        } 

        let menuElm = document.getElementsByClassName("menu")[0];
        if (menuElm.className.indexOf(' --inactive') !== -1) {
            menuElm.className = menuElm.className.replace(' --inactive', '');
            menuElm.style.left= 0 + "px";
            _viewers[_currentIframe].spinning = false;
        }
    };

    function _scrollTo(selectedModelIndex){
        //prevent reset cam pos if same model is clicked as current model
        if(self.selected !== selectedModelIndex){
            _viewers[_currentIframe].setLDtexture(
                function(readyTexture){
                    if(readyTexture){  
                        console.log("texture set to ld: ");
                    }
            });
            
            //reset current model before we scroll to next modell
            _resetCam(false);

            // change model index to selected
            _currentIframe = selectedModelIndex;

            // update text in annotation box
            _showAnnotationBox(4);

            if(_language == "eng"){
                self.currentTitle = _engAnnotTitle[_currentIframe][0];
                self.currentDescription = _descriptionsEng[_currentIframe][0];
            }else{
                let sweDescription = _descriptionsSwe[_currentIframe][0];
                self.currentTitle = _sweAnnotTitle[_currentIframe][0];
                self.currentDescription = sweDescription;
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
            _viewers[_currentIframe].setHDtexture(
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
            self.modelTitle = _englishTitle[_currentIframe];
        }
        else{
            self.modelTitle = _swedishTitle[_currentIframe];
        }
    }

    function firstAnnotation(currentAnnotation){
        if(hasAnnotation(_cameraPositions[_currentIframe][0])){
            if(_language == "eng"){
                self.currentTitle = _engAnnotTitle[_currentIframe][_currentAnnotation];
                self.currentDescription = _descriptionsEng[_currentIframe][_currentAnnotation];
            }else{
                let sweDescription = _descriptionsSwe[_currentIframe][_currentAnnotation];
                self.currentTitle = _sweAnnotTitle[_currentIframe][_currentAnnotation];
                self.currentDescription = sweDescription;
            }
            _viewers[_currentIframe].prevAnnotation(_cameraPositions[_currentIframe][currentAnnotation], _cameraTarget[_currentIframe][currentAnnotation]);
        }
    }

    function _prevAnnotation(){
        _time = 0;

        // check if the model has annotatoins
        if(hasAnnotation(_cameraPositions[_currentIframe][0])){
            // check which way the anotation is
            if(_currentAnnotation > 0){
                _currentAnnotation--;
                if(_language == "eng"){
                    self.currentTitle = _engAnnotTitle[_currentIframe][_currentAnnotation];
                    self.currentDescription = _descriptionsEng[_currentIframe][_currentAnnotation];
                }else{
                    self.currentTitle = _sweAnnotTitle[_currentIframe][_currentAnnotation];
                    self.currentDescription = _descriptionsSwe[_currentIframe][_currentAnnotation];
                }
                // jump to previous annotation using the api's setCameraLookat using the annotation positions from WP
                _viewers[_currentIframe].prevAnnotation(_cameraPositions[_currentIframe][_currentAnnotation], _cameraTarget[_currentIframe][_currentAnnotation]);
            }else{
                _currentAnnotation = _engAnnotTitle[_currentIframe].length;
                self.prevAnnotation();
            }
        }
    };

    function _nextAnnotation(){
        _time = 0;
        console.log("_cameraPositions: ", _cameraPositions[_currentIframe]);
        if(hasAnnotation(_cameraPositions[_currentIframe][0])){
            if(_currentAnnotation < _sweAnnotTitle[_currentIframe].length-1){
                _currentAnnotation++;
                if(_language == "eng"){
                    self.currentTitle = _engAnnotTitle[_currentIframe][_currentAnnotation];
                    self.currentDescription = _descriptionsEng[_currentIframe][_currentAnnotation];
                }else{
                    let sweDescription = _descriptionsSwe[_currentIframe][_currentAnnotation];
                    self.currentTitle = _sweAnnotTitle[_currentIframe][_currentAnnotation];
                    self.currentDescription = sweDescription;
                }
                _viewers[_currentIframe].prevAnnotation(_cameraPositions[_currentIframe][_currentAnnotation], _cameraTarget[_currentIframe][_currentAnnotation]);
            }else{
                _currentAnnotation = -1;
                self.nextAnnotation();
            }
        }
    };

    function _changeLanguage($index){
        // change the css style for the selected language
        self.selectedLanguage = $index;

        _time = 0;
        
        if($index == 0){
            self.modelTitle = _swedishTitle[_currentIframe];
            self.currentTitle = self.modelTitle;
            self.helpText = _helpTextSwe;
            self.helpHeading = _helpHeadingSwe;
            _language = "swe";
            if(_currentAnnotation != -1){
                self.currentTitle = _sweAnnotTitle[_currentIframe][_currentAnnotation];
                self.currentDescription = _descriptionsSwe[_currentIframe][_currentAnnotation].toString();    
            }
        }else{
            self.modelTitle = _englishTitle[_currentIframe];
            self.currentTitle = self.modelTitle;
            self.helpText = _helpTextEng;
            self.helpHeading = _helpHeadingEng;
            _language = "eng";
            if(_currentAnnotation != -1){
                self.currentTitle = _engAnnotTitle[_currentIframe][_currentAnnotation];
                self.currentDescription = _descriptionsEng[_currentIframe][_currentAnnotation];
            }
        }
    };

    function _resetCam(modelChanged){
        _currentAnnotation = 0;
        firstAnnotation(_currentAnnotation);

        _currentIframeElm = document.getElementById(_currentIframe);

        // if user just want to reset the cam, modelChange is false
        if(!modelChanged ){
            _viewers[_currentIframe].spinning = false;
        }
        if(_currentIframeElm.contains(_spinLayer[_currentIframe]) && !modelChanged){
            self.currentViewElm = document.getElementById(_currentIframe);
            self.currentViewElm.removeChild(_spinLayer[_currentIframe]);
        }

        // reset light positions
        _viewers[_currentIframe].setLights(_viewers[_currentIframe].lightStates);
        
        // if modelChanged is true use animation time
        _viewers[_currentIframe].setInitCameraPos(modelChanged,_currentIframe);
    }

    // The spinning layer disappears when the screen is touched
    function preventSpinning(){
        // adding event listener to prevent the model from spinning when it's inactive 
        for (let i = 0; i < _iframes.length; i++) {

            _spinLayer[i] = document.createElement( 'div' );
            _spinLayer[i].className = 'spinLayer';

            _spinLayer[i].addEventListener('touchstart',function(ev){
                _showMenu();
                
                if (ev.touches.length == 1 ) {
                    ev.preventDefault();
                    console.log("one touch");
                }

                _showAnnotationBox(1);
                _viewers[_currentIframe].spinning = false;
            });

            _spinLayer[i].addEventListener('mousedown',function(){

                _showMenu();
                _showAnnotationBox(1);

                _viewers[_currentIframe].spinning = false;
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

        //wait 2s more to be sure the model is ready to be manipulated
        $timeout(function() {         
            _mainContent.removeChild(_layer);
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
        // reset camera, start spinning, append _spinLayer
        if(!_viewers[_currentIframe].cameraMoving){
            _time++;
            //_time == _resetTime
            if(_time == _resetTime){
                // use animation time?
                _resetCam(true);
                $timeout(function(){
                    _viewers[_currentIframe].spinning = true;

                    self.showAnnotationBox = false;
                    self.showHelpBox = false;

                    // variable frames is updated ever second and initangle is dependent on this
                    _viewers[_currentIframe].frames = 0.0;
                    self.currentViewElm = document.getElementById(_currentIframe);
                    self.currentViewElm.appendChild(_spinLayer[_currentIframe]);

                    // deselect the info button border
                    _infoButtonElm = document.getElementsByClassName("infoButton")[0];
                    if (_infoButtonElm.className.indexOf(' --active') !== -1) {
                         _infoButtonElm.className = _infoButtonElm.className.replace(' --active', '');
                    }

                    // deselect the info button border
                    _infoButtonElm = document.getElementsByClassName("infoButton")[1];
                    if (_infoButtonElm.className.indexOf(' --active') !== -1) {
                        _infoButtonElm.className = infoButtonElm.className.replace(' --active', '');
                    }

                    // set the menu background color to gray 
                    _menuElm = document.getElementsByClassName("menu")[0];
                    if (_menuElm.className.indexOf(' --inactive') === -1) {
                        _menuElm.className += ' --inactive';
                        _menuElm.style.left= -90* _menuScale + "px";
                    }
                    // animationTime is in seconds, must use ms
                },_animationTime*1000+10);
            }
        }else{
            _time = 0;
        }
    }

    // init the camera positions for the default annotation
    function setDefaultAnnotation(index){
        _cameraPositions[index][0] = _viewers[index].cameraPosition;
        _cameraTarget[index][0] = _viewers[index].cameraTarget;
    }

    //// PRIVATE Functions
    function hasAnnotation(position){
        _cameraPositions[_currentIframe];

        if(_cameraPositions[_currentIframe].length > 0){
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
        document.getElementsByClassName("infoButton")[0].style.height= 90 * menuScale - 10+"px";
        document.getElementsByClassName("infoButton")[1].style.height= 90 * menuScale - 10+"px";
        document.getElementsByClassName("wrapper")[0].style.width= (580)* textboxScale +"px";
        document.getElementsByClassName("wrapper")[1].style.width= (580) * textboxScale +"px";
        document.getElementsByClassName("languageList")[0].children[0].style.fontSize= 18 * textboxScale +"px";
        document.getElementsByClassName("languageList")[0].children[1].style.fontSize= 18 * textboxScale +"px";
        document.getElementsByClassName("languageList")[1].children[0].style.fontSize= 18 * textboxScale +"px";
        document.getElementsByClassName("languageList")[1].children[1].style.fontSize= 18 * textboxScale +"px";
    }

}])