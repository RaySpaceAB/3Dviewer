function WPservice($http, $q) {
 
    var WPservice = {
        categories: [],
        posts: ["no posts initiated"],
        pageTitle: 'Latest Posts:',
        currentPage: 1,
        totalPages: 1,
        currentUser: {}
    };
 
    //Set the page title in the <title> tag
    function _setTitle(documentTitle, pageTitle) {
        document.querySelector('title').innerHTML ='3Dviewer';
        WPservice.pageTitle = pageTitle;
    }
 
    //Setup pagination
    function _setArchivePage(posts, page, headers) {
        WPservice.posts = posts;
        WPservice.currentPage = page;
        WPservice.totalPages = headers('X-WP-TotalPages');
    }
 
    WPservice.getAllCategories = function(rootPath) {
        //If they are already set, don't need to get them again
        if (WPservice.categories.length) {
            return;
        }
 
        //Get the category terms from wp-json
        return $http({
                    method: 'get',
                    url: rootPath+'/wp-json/wp/v2/taxonomies/category/terms'
            }).then(function(sucsess){
                WPservice.categories = sucsess.data;
            }, function (error){
        });
    };
 
    WPservice.getPosts = function(rootPath,page) {
        return $http
                .get(rootPath+'/wp-json/wp/v2/posts?per_page=100' )
                .then(response => {
                    
                    //WPservice.posts = response.data;

                    page = parseInt(page);
         
                    // Check page variable for sanity
                    if ( isNaN(page) || page > response.headers('X-WP-TotalPages') ) {
                        _setTitle('Page Not Found', 'Page Not Found');
                    } else {
                        //Deal with pagination
                        if (page>1) {
                            _setTitle('Posts on Page ' + page, 'Posts on Page ' + page + ':');
                        } else {
                            _setTitle('Home', 'Latest Posts:');
                        }
         
                        _setArchivePage(response.data,page,response.headers);
                    }
                    return WPservice.posts;
                });
    };
 
    return WPservice;
}
 
//Finally register the service
app.factory('WPservice', ['$http', '$q',WPservice]);