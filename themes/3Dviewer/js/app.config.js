angular.module('3DViewer').config(function($routeProvider, $locationProvider) {
    location.hash = '0';
    $routeProvider
    .when('/', {
        controller: menuController
    })
    .otherwise({ 
        redirectTo: '/3dviewer' 
    });

    $locationProvider.html5Mode(true);

});