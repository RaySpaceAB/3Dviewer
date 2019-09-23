<?php
 /**
  * Store the theme's directory path and uri in constants
  */
 define('THEME_DIR_URI', get_template_directory_uri());


/**
* Default post content
*/
add_filter( 'default_content', 'wp_editor_content' );
function wp_editor_content( $content ) {
    $content = "<div class='sketchfab-embed-wrapper'><iframe id='api-frame' src='https://sketchfab.com/models//embed' frameborder='0' allowfullscreen mozallowfullscreen='true'></iframe></div>";
    return $content;
}

/**
 * Enqueue scripts and styles
 */
function load_scripts() {
	// load css styles
	wp_enqueue_style ('theme-style', THEME_DIR_URI . '/includes/css/style.css');

	// load node modules
	wp_enqueue_script('angularjs', THEME_DIR_URI .'/node_modules/angular/angular.min.js');
	wp_enqueue_script('angularjs-route', THEME_DIR_URI .'/node_modules/angular-route/angular-route.min.js');
	wp_enqueue_script('angularjs-sanitize', THEME_DIR_URI . '/node_modules/angular-sanitize/angular-sanitize.min.js');
	wp_enqueue_script( 'hammerjs', THEME_DIR_URI . '/node_modules/hammerjs/hammer.js', array('jquery') );
	wp_enqueue_script('angularjs-hammer', THEME_DIR_URI . '/node_modules/angular-hammer/angular.hammer.min.js');
	wp_enqueue_script('angular-animate', THEME_DIR_URI . '/node_modules/angular-animate/angular-animate.min.js');
	wp_enqueue_script('underscorejs', THEME_DIR_URI . '/node_modules/underscore/underscore-min.js');
	wp_enqueue_script('_tk-jquery', THEME_DIR_URI . '/node_modules/jquery/dist/jquery.min.js', array('jquery'));
	
	//load angular script
	wp_enqueue_script('app', THEME_DIR_URI . '/js/app.module.js', array( 'angularjs', 'angularjs-route' ));
	wp_enqueue_script('config', THEME_DIR_URI . '/js/app.config.js', array( 'angularjs', 'angularjs-route' ));
	wp_enqueue_script('interface', THEME_DIR_URI . '/js/menuController.js', array( 'angularjs', 'angularjs-route' ));
	wp_enqueue_script('theme-service', THEME_DIR_URI . '/js/WPservices.js');
	wp_enqueue_script('model-handler', THEME_DIR_URI . '/js/SketchfabService.js');

}
add_action( 'wp_enqueue_scripts', 'load_scripts' );
