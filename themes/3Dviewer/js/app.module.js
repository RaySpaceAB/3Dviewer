'use strict'
var underscore = angular.module('underscore', []);
        underscore.factory('_', function() {
            return window._; //Underscore should be loaded on the page
        });

// Define the `3dViewer` module
angular.module('3DViewer', [
	'ngRoute', 
	'ngSanitize', 
	'ngAnimate', 
	'hmTouchEvents',
	'underscore'
]);