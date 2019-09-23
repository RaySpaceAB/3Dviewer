function factoryFunction($http) {
    
    /**
    * Function constructor
    */
    function WPservice() {
        this.setTitle("3DViewer");
    };

    WPservice.prototype = {
        getPosts: function(rootPath) {
            return $http
                .get(rootPath+'/wp-json/wp/v2/posts?per_page=100' )
                .then(response => {
                    WPservice.posts = response.data;
                    return response.data;
                });
        },
        setTitle: function(_title) {
            document.querySelector('title').innerHTML =_title;
        }
    };
 
    return WPservice;
}
 
//register the service
angular.module('3DViewer').factory('WPservice', ['$http',factoryFunction]);