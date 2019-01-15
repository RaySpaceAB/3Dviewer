<?php
 
 /**
  * Store the theme's directory path and uri in constants
  */
 define('THEME_DIR_PATH', get_template_directory());
 define('THEME_DIR_URI', get_template_directory_uri());

/**
 * Set the content width based on the theme's design and stylesheet.
 */
if ( ! isset( $content_width ) )
	$content_width = 750; /* pixels */
/**
* Default post content
*/
add_filter( 'default_content', 'my_editor_content' );
function my_editor_content( $content ) {
    $content = "<div class='sketchfab-embed-wrapper'><iframe id='api-frame_0' src='' frameborder='0' allowfullscreen='allowfullscreen'></iframe></div>";
    return $content;
}

/**
 * Register widgetized area and update sidebar with default widgets
 */
function _tk_widgets_init() {
	register_sidebar( array(
		'name'          => __( 'Sidebar', '_tk' ),
		'id'            => 'sidebar-1',
		'before_widget' => '<aside id="%1$s" class="widget %2$s">',
		'after_widget'  => '</aside>',
		'before_title'  => '<h3 class="widget-title">',
		'after_title'   => '</h3>',
		) );
}
add_action( 'widgets_init', '_tk_widgets_init' );

/**
 * Enqueue scripts and styles
 */
function load_scripts() {

	// Import the necessary TK Bootstrap WP CSS additions
	wp_enqueue_style( '_tk-bootstrap-wp', THEME_DIR_URI . '/includes/css/bootstrap-wp.css' );

	// load bootstrap css
	wp_enqueue_style( '_tk-bootstrap', THEME_DIR_URI . '/includes/css/bootstrap.min.css' );

	// load custom css
	wp_enqueue_style ('theme-style', THEME_DIR_URI . '/includes/css/custom.css');

	// load Font Awesome css
	wp_enqueue_style( '_tk-font-awesome', THEME_DIR_URI . '/includes/css/font-awesome.min.css', false, '4.1.0' );

	// load _tk styles
	wp_enqueue_style( '_tk-style', get_stylesheet_uri() );

	// load bootstrap js
	wp_enqueue_script('_tk-bootstrapjs', THEME_DIR_URI . '/includes/js/bootstrap.min.js', array('jquery') );

	// load bootstrap wp js
	wp_enqueue_script( '_tk-bootstrapwp', THEME_DIR_URI . '/includes/js/bootstrap-wp.js', array('jquery') );

	// load three.js
	wp_enqueue_script( '_tk-threejs', THEME_DIR_URI . '/includes/js/three.min.js', array('jquery') );

	// load hammer.js
	wp_enqueue_script( '_tk-hammerjs', THEME_DIR_URI . '/includes/js/hammer.js', array('jquery') );


	// load jquery
	wp_enqueue_script( '_tk-jquery', THEME_DIR_URI . '/includes/js/jquery.min.js', array('jquery') );

	// load underscore.js
	//wp_enqueue_script( '_tk-underscore', THEME_DIR_URI . '/includes/js/underscore.js', array('jquery') );


	// // load bootstrap wp js
	// wp_enqueue_script( '_tk-uibootstrap', THEME_DIR_URI . '/node_modules/angular-ui-bootstrap/dist/ui-bootstrap.js', array('jquery') );


	wp_enqueue_script( '_tk-skip-link-focus-fix', THEME_DIR_URI . '/includes/js/skip-link-focus-fix.js', array(), '20130115', true );

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}

	if ( is_singular() && wp_attachment_is_image() ) {
		wp_enqueue_script( '_tk-keyboard-image-navigation', THEME_DIR_URI . '/includes/js/keyboard-image-navigation.js', array( 'jquery' ), '20120202' );
	}

	wp_enqueue_script('angularjs', get_template_directory_uri() .'/node_modules/angular/angular.min.js');
	wp_enqueue_script('angularjs-route', get_template_directory_uri() .'/node_modules/angular-route/angular-route.min.js');
	wp_enqueue_script('angular-click-outside', get_template_directory_uri() .'/node_modules/clickoutside.directive.js');
	wp_enqueue_script('angularjs-sanitize', get_stylesheet_directory_uri() . '/node_modules/angular-sanitize/angular-sanitize.min.js');
	wp_enqueue_script('angularjs-hammer', get_stylesheet_directory_uri() . '/node_modules/angular-hammer/angular.hammer.min.js');
	wp_enqueue_script('angular-animate', get_template_directory_uri() . '/node_modules/angular-animate/angular-animate.min.js');
	wp_enqueue_script('uiangularjs', get_template_directory_uri() .'/includes/js/ui-bootstrap-tpls-2.5.0.min.js');
	wp_enqueue_script('interface', get_stylesheet_directory_uri() . '/js/Interface.js', array( 'angularjs', 'angularjs-route' ));
	wp_enqueue_script('theme-service', get_stylesheet_directory_uri() . '/js/WPservices.js');
	wp_enqueue_script('model-handler', get_stylesheet_directory_uri() . '/js/ModelHandler.js');
	//wp_enqueue_script('underscore', get_stylesheet_directory_uri() . '/js/underscore.js');

		// With get_stylesheet_directory_uri()
	wp_localize_script('interface', 'localized',
	            array(
	                'partials' => get_stylesheet_directory_uri() . '/partials/'
	                )
	    );

}
add_action( 'wp_enqueue_scripts', 'load_scripts' );
