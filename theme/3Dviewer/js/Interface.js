var app = angular.module('wp', ['ngRoute', 'ngSanitize', 'ngAnimate', 'ui.bootstrap', 'hmTouchEvents', 'angular-click-outside']);

app.filter('unsafe', function($sce) { return $sce.trustAsHtml; });

app.config(function($routeProvider, $locationProvider) {
    $routeProvider
   .when('/', {
        controller: 'Main'
    })
    .when('/:slug', {
        templateUrl: localized.partials + 'main.html',
        controller: 'Test'
    });
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
    var self = this;

    //// PUBLIC fields
    
    self.currentDescription = "";
    self.showAnnotationBox = false;
    self.languages = ["Svenska","English"];
    self.selectedLanguage = 0;
    self.data = {};

    self.modelMenuInitTop=320;
    self.modelMenuInitLeft=50;

    self.annotMenuInitTop = window.innerHeight-(window.innerHeight/3);
    self.annotMenuInitLeft = window.innerWidth/2+200;
    self.menus = [];
    self.menus.push({top: self.modelMenuInitTop, left: self.modelMenuInitLeft, name: "#1"});
    self.menus.push({top: self.annotMenuInitTop, left: 80+'%', name: "#2"});
    
    
    
    //// PUBLIC Methods

    // Initialize module
    self.init = _init;

    // Applies a border over the selected model in the menue 
    self.select = _select;

    // Returns true if the clicked model is already selected
    self.isSelected = _isSelected;

    // Hides the white border from the info button
    self.hideBorder = _hideBorder;

    // Hides the annotation box
    self.hideInfo = _hideInfo;

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

    self.grayMenu = _grayMenu;

    self.selected = 0;

    //// PRIVATE fields

    var _iframes = [];
    var _viewers = [];
    
    
    var _loadModelTime = 2000;
    var _ran = true;
    var _time = 0;
    var _animationTime = 0;
    var _spin_velocity = 0;
    var _resetTime;

    var _readyFrames = 0;
    var _allIframesReady = false;
    var _spinLayer = [];

    var _sweAnnotTitle = [];
    var _engAnnotTitle = [];
    var _descriptionsEng = [];
    var _descriptionsSwe = [];
    var _swedishTitle = [];
    var _englishTitle = [];

    var _cameraTarget = [];
    var _cameraPosition = [];

    var _language = "swe";
    var _promises = [];

    var _currentAnnotation =-1;
    var _currentIframe = 0;

    var _layer = null;
    var _mainContent = null; 

    //// PRIVATE Functions - Public Methods Implementation

    function _init(rootPath){
        // gets the wp-posts from page 1
        console.log("url: ", rootPath);
        WPservice.getPosts(rootPath,1).then(posts =>{
            self.data = WPservice;
            
            _iframes = document.getElementsByClassName('sketchfab-embed-wrapper');     
            
            // creating a "not ready" window above the loading model 
            _layer = document.createElement( 'div' );
            
            var text = document.createElement( 'h2' );
            text.innerHTML = "Loading"
            text.className = "notReady"

            _mainContent= document.getElementsByClassName("main-content");

            _layer.className = 'blackBox';

            _mainContent[0].appendChild(_layer);
            _layer.appendChild(text);

            // when the jquarys from the iframes are ready we can create viewer objects
            $(document).ready(function(){
                console.log("iframes ", _iframes);
                //very importat delay to get all iframes loaded
                setTimeout(function(){
                    for (var i = 0; i < _iframes.length; i++) {
                    
                        // assigning the annotation data from wordpress to global variables
                        _descriptionsSwe[i] = self.data.posts[i].post_meta_fields.swe_description;

                        _descriptionsEng[i] = self.data.posts[i].post_meta_fields.eng_description;

                        _sweAnnotTitle[i] = self.data.posts[i].post_meta_fields.swe_title;

                        _engAnnotTitle[i] = self.data.posts[i].post_meta_fields.eng_title;

                        _spin_velocity = self.data.posts[0].post_meta_fields.spin_velocity;
                        _spin_velocity = parseFloat(_spin_velocity[0]);

                        _animationTime = self.data.posts[0].post_meta_fields.animation_time;
                        _animationTime = parseFloat(_animationTime[0]);

                        _resetTime = self.data.posts[0].post_meta_fields.reset_time;
                        _resetTime = parseFloat(_resetTime[0]);

                        var minDistance = self.data.posts[i].post_meta_fields.min_distance;
                        minDistance[i] = parseFloat(minDistance[0]);

                        var maxDistance = self.data.posts[i].post_meta_fields.max_distance;
                        maxDistance[i] = parseFloat(maxDistance[0]);

                        var cameraPositionArr = self.data.posts[i].post_meta_fields.camera_position;
                        _cameraPosition[i] = convertToArrays(cameraPositionArr, cameraPositionArr.length);

                        var cameraTargetArr = self.data.posts[i].post_meta_fields.camera_target;
                        _cameraTarget[i] = convertToArrays(cameraTargetArr, cameraTargetArr.length);

                        _iframes[i].style.height = '100%';

                        //substringing the urlid from the src
                        var iframeSrc = _iframes[i].children[0].src;

                        var catalogName = 'models';
                        var uid_pos = iframeSrc.search(catalogName) + catalogName.length + 1;

                        var urlid_temp = iframeSrc.substring(uid_pos,iframeSrc.length);
                        var urlid = urlid_temp.substring(0,urlid_temp.search('/'));

                        //new annotation
                        var annotationBounds ={animationTime: _animationTime,
                                     minDistance: minDistance[i] ,
                                     maxDistance: maxDistance[i] ,
                                     cameraPosition: _cameraPosition[i],
                                     cameraTarget: _cameraTarget[i],
                                     spinVelocity: _spin_velocity
                                    }; 

                        // createing a viewer objects with sketchfabs api
                        _viewers[i] = new ModelHandler(_iframes[i].children[0], urlid, _language, annotationBounds, i);
                        console.log("_viewers: ", _viewers);

                        //Setting the titles
                        getModel(urlid);
                        _swedishTitle.push(self.data.posts[i].title.rendered);

                        // set the firts model titel to swedish
                        self.modelTitle = _swedishTitle[0];
                        self.currentTitle = self.modelTitle; 

                        // var mainContent1 = document.getElementsByClassName('main-content');
                        // var cameraTarget1 = document.createElement("div");
                    }

                    //Set english title
                    $q.all(_promises).then(function(response) {
                            angular.forEach(response, function(value, key) {
                              _englishTitle.push(value.data.name);
                              console.log("value.data.name ", value.data.name);
                            });

                        }).catch(function(response) {
                            console.log("responseError: ", response);
                    });

                    startInterval();
                },_loadModelTime);
                preventSpinning();
            });
        });
    }; 

    function _select(model) {
        self.selected = model;
    }

    function _isSelected(model) {
        console.log("self.selected: ", self.selected);
        console.log("model: ", model);
        return self.selected === model;
    }

    // hide annotation box and show the border of info button or on the contrary
    function _hideBorder(){
        _time = 0;

        if(self.showAnnotationBox){
            self.showAnnotationBox = false;
        }else{
            self.showAnnotationBox = true;
        }

        var infoButtonElm = document.getElementsByClassName("infoButton2")[0];
        if (infoButtonElm.className.indexOf(' --active') === -1) {
            infoButtonElm.className += ' --active';
        }else{
            infoButtonElm.className = infoButtonElm.className.replace(' --active', '');
        }
    };

    function _grayMenu(){
        _time = 0;

        var currentIframeElm = document.getElementById(_currentIframe);
        if(currentIframeElm.contains(_spinLayer[_currentIframe])){
            self.currentViewElm = document.getElementById(_currentIframe);
            self.currentViewElm.removeChild(_spinLayer[_currentIframe]);
        } 

        var menuElm = document.getElementsByClassName("menu")[0];
        if (menuElm.className.indexOf(' --inactive') !== -1) {
            menuElm.className = menuElm.className.replace(' --inactive', '');
            _viewers[_currentIframe].spinning = false;
        }
    };

    function _hideInfo(){
        var annotationBox = document.getElementsByClassName("annotationBox")[0];
        if (annotationBox.className.indexOf(' --hidden') === -1) {
            annotationBox.className += ' --hidden';
        }else{
            annotationBox.className = annotationBox.className.replace(' --hidden', '');
        }
    };

    function _scrollTo(modelIndex){

        if(!_isSelected(modelIndex)){
            _resetCam(false);
        }

        _currentIframe = modelIndex;

        $location.hash(modelIndex);

        //set the annotation box to default
        _currentAnnotation = -1;
        _changeModelTitle();
        self.currentTitle = self.modelTitle;
        self.currentDescription = "";


        $anchorScroll();

        resetMenus();
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

    function _prevAnnotation(){
        _time = 0;

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
            _viewers[_currentIframe].prevAnnotation(_cameraPosition[_currentIframe][_currentAnnotation], _cameraTarget[_currentIframe][_currentAnnotation]);
        }else{
            _currentAnnotation = _engAnnotTitle[_currentIframe].length;
            self.prevAnnotation();
        }
    };

    function _nextAnnotation(){
        _time = 0;

        if(_currentAnnotation < _sweAnnotTitle[_currentIframe].length-1){
            _currentAnnotation++;
            if(_language == "eng"){
                self.currentTitle = _engAnnotTitle[_currentIframe][_currentAnnotation];
                self.currentDescription = _descriptionsEng[_currentIframe][_currentAnnotation];
            }else{
                self.currentTitle = _sweAnnotTitle[_currentIframe][_currentAnnotation];
                self.currentDescription = _descriptionsSwe[_currentIframe][_currentAnnotation];
            }
            _viewers[_currentIframe].prevAnnotation(_cameraPosition[_currentIframe][_currentAnnotation], _cameraTarget[_currentIframe][_currentAnnotation]);
        }else{
            _currentAnnotation = -1;
            self.nextAnnotation();
        }
    };

    function _changeLanguage($index){
        // change the css style for the selected language
        self.selectedLanguage = $index;

        _time = 0;
        
        if($index == 0){
            self.modelTitle = _swedishTitle[_currentIframe];
            self.currentTitle = self.modelTitle;
            _language = "swe";
            if(_currentAnnotation != -1){
                self.currentTitle = _sweAnnotTitle[_currentIframe][_currentAnnotation];
                self.currentDescription = _descriptionsSwe[_currentIframe][_currentAnnotation];
            }
            for (var i = 0; i < self.data.posts.length; i++) {
                self.data.posts[i].title.rendered = _swedishTitle[i];
            }
        }else{
            self.modelTitle = _englishTitle[_currentIframe];
            self.currentTitle = self.modelTitle;
            _language = "eng";
            if(_currentAnnotation != -1){
                self.currentTitle = _engAnnotTitle[_currentIframe][_currentAnnotation];
                self.currentDescription = _descriptionsEng[_currentIframe][_currentAnnotation];
            }
            for (var i = 0; i < self.data.posts.length; i++) {
                self.data.posts[i].title.rendered = _englishTitle[i];
            }
        }


    };

    function _resetCam(modelChanged){
        _currentAnnotation = -1;
        self.currentTitle = self.modelTitle;
        self.currentDescription = "";

        var currentIframeElm = document.getElementById(_currentIframe);

        // if user just want to reset the cam, modelChange is false
        if(!modelChanged ){
            _viewers[_currentIframe].spinning = false;
        }
        if(currentIframeElm.contains(_spinLayer[_currentIframe]) && !modelChanged){
            console.log("remove _spinLayer");
            self.currentViewElm = document.getElementById(_currentIframe);
            self.currentViewElm.removeChild(_spinLayer[_currentIframe]);
        }

        resetMenus();
        // use animation time
        _viewers[_currentIframe].setInitCameraPos(modelChanged,_currentIframe);
    }

    // The spinning layer disappears when the screen is touched
    function preventSpinning(){
        // adding event listener to prevent the model from spinning when it's inactive 
        for (var i = 0; i < _iframes.length; i++) {

            //inactivate rotImage
            //var rotImage = new Image(1000, 1000);
            //rotImage.src = '3Dviewer/wp-content/uploads/rotation.png';
            //rotImage.className = 'rotationImg';

            _spinLayer[i] = document.createElement( 'div' );
            _spinLayer[i].className = 'spinLayer';

            _spinLayer[i].style.left = document.getElementsByClassName('menu')[0].offsetWidth+self.modelMenuInitLeft+'px';

            //_spinLayer[i].appendChild(rotImage);

            _spinLayer[i].addEventListener('touchstart',function(ev){

                _grayMenu();
                
                if (ev.touches.length == 1 ) {
                    ev.preventDefault();
                    console.log("one touch");
                }
                if (ev.touches.length == 2 ) {
                    ev.preventDefault();
                    console.log("two touches");
                }

                _viewers[_currentIframe].spinning = false;

            });

            _spinLayer[i].addEventListener('mousedown',function(){

                _grayMenu();

                _viewers[_currentIframe].spinning = false;

            });
        }
    }
    
    // Evaluates if the model is ready to manipulate or not
    // The loading layer disappears when al models ar ready 
    // The model starts spinning if it has been iactive over a specific time 
    function startInterval(){
        $interval(function (){       
            if(_readyFrames < _viewers.length){
                for (var i = 0; i < _viewers.length; i++) {
                    if(_viewers[i].viewerready){

                        _readyFrames++;
                    } 
                }
                if(_readyFrames == _viewers.length){
                    _allIframesReady = true;
                    console.log("ready frames: ", _readyFrames, " _viewers.length: ", _viewers.length);
                    console.log("viewerready[0]: ", _viewers[0].viewerready);
                    console.log("viewerready[1]: ", _viewers[1].viewerready);
                    console.log("viewerready[2]: ", _viewers[2].viewerready);
                    console.log("viewerready[3]: ", _viewers[3].viewerready);
                }
                else{
                    _readyFrames = 0;
                }
            }

            if(_allIframesReady){
                if(document.contains(_layer) && _ran){
                    _ran = false;
                    //wait 12s more to be sure the model is ready to be manipulated
                    $timeout(function() {
                        console.log("remove loading");
                        _mainContent[0].removeChild(_layer);
                    }, 1000);
                }      
                
                // reset camera, start spinning, append rotation image
                if(!_viewers[_currentIframe].cameraMoving){
                    _time++;
                    //_time == _resetTime
                    if(_time == _resetTime){
                        //disable pan limits when camera is reset
                        _viewers[_currentIframe].panLimits = false;
                        // use animation time?
                        _resetCam(true);
                        $timeout(function(){
                            _viewers[_currentIframe].spinning = true;
                            //self.hideInfo();
                            self.showAnnotationBox = false;

                            // variable frames is updated ever second and initangle is dependent on this
                            _viewers[_currentIframe].frames = 0.0;
                            self.currentViewElm = document.getElementById(_currentIframe);
                            self.currentViewElm.appendChild(_spinLayer[_currentIframe]);

                            var infoButtonElm = document.getElementsByClassName("infoButton2")[0];
                            if (infoButtonElm.className.indexOf(' --active') !== -1) {
                                    infoButtonElm.className = infoButtonElm.className.replace(' --active', '');
                            }

                            var menuElm = document.getElementsByClassName("menu")[0];
                            if (menuElm.className.indexOf(' --inactive') === -1) {
                                menuElm.className += ' --inactive';
                            }

                            console.log("spinning true");
                            _viewers[_currentIframe].panLimits = true;
                            // animationTime is in seconds, must use ms
                        },_animationTime*1000+10);
                    }

                }else{
                    _time = 0;
                }
            }
        }, 1000);
    }

    //// PRIVATE Functions

    // convert string valuse from wordpress too arrays
     function convertToArrays(stringArray, arrayLength){
        var valueArray = [];
        for (var i = 0; i < stringArray.length; i++) {
            var stringArrayNew = stringArray[i].replace('[', '');
            stringArrayNew = stringArrayNew.replace(']', '');

            stringArrayNew = stringArrayNew.split(",");
            valueArray[i] = stringArrayNew.map(Number);
            
        }
        return valueArray;
    }; 

    // send a HTTP request for model data
    function getModel(uid){
        console.log("uid: ", uid);
        var promise =  $http({
                    method: 'get',
                    url:'https://api.sketchfab.com/v3/models/'+uid,

        });
        _promises.push(promise);
    };

    // menues will be replaced in init positions after resetTime
    function resetMenus(){
        //document.getElementById("modelMenu").style.top = self.modelMenuInitTop+'px';
        //document.getElementById("modelMenu").style.left = self.modelMenuInitLeft+'px';

        //document.getElementById("wrapper").style.top = self.annotMenuInitTop+'px';
        //document.getElementById("wrapper").style.left = self.annotMenuInitLeft+'px';
    }

}])
.directive('draggable', function($document) {
    return {
    scope: false,
        link: function(scope, element, attr) {

            var startX = null;
            var startY = null; 
            var x = null; 
            var y = null;
            var container = null; 
            
            element.css({
              position: 'fixed',
              cursor: 'move'
            });


            element.on('touchstart mousedown', function(event) {

                if(event.handled === false) return
                // Prevent default dragging of selected content
                event.preventDefault();
                event.stopPropagation();
                event.handled = true;

                //reset the screen coords for the current page location
                if(event.type == "touchstart"){

                    startX = event.touches[0].pageX - attr.$$element.parent()[0].offsetLeft;
                    startY = event.touches[0].pageY - attr.$$element.parent()[0].offsetTop;

                    $document.on('touchmove', interactionMove);
                }
                else if(event.type == "mousedown"){
                    startX = event.pageX - attr.$$element.parent()[0].offsetLeft;
                    startY = event.pageY - attr.$$element.parent()[0].offsetTop;

                    $document.on('mousemove', interactionMove);
                }


                $document.on('touchend', interactionUp); 
                scope.container = attr.$$element.parent(); 

                $document.on('mouseup', interactionUp); 
                scope.container = attr.$$element.parent(); 
                
            });


            function interactionMove(event) {

                time = 0;

                if (x < 0) {
                    x = 0;
                }
                if (y < 0) {
                    y = 0;
                }

                // calculate the position of the moving element
                if(event.type == "touchmove" ){
                    var touch = event.touches[0];
                    y = touch.pageY - startY;
                    x = touch.pageX - startX;

                }else if(event.type == "mousemove"){
                    y = event.pageY - startY;
                    x = event.pageX - startX;
                }

                //Set the element position in css
                attr.$$element.parent().css({
                    top: y + 'px',
                    left: x + 'px'
                });
            }


            function interactionUp(e) {
                
                $document.unbind('touchmove', interactionMove);
                $document.unbind('touchend', interactionUp);

                $document.unbind('mousemove', interactionMove);
                $document.unbind('mouseup', interactionUp);
            }

            startX = 0;
            startY = 0;
        }
    }
});
