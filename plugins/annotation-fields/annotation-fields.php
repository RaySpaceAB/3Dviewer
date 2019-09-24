<?php
	/*
	 * Plugin Name: Annotation fileds
	 * Description: Adds custom fields to the post content to adjust model/annotation variables 
	 * Author: Ray Space AB
	 * Version: 1.0
	 * License: GPL2
	*/

	/**
	 * Register meta boxes.
	 */
	function register_meta_boxes() {
	    wp_enqueue_script('sortablejs', get_template_directory_uri() .'/node_modules/sortablejs/Sortable.min.js');
	    wp_enqueue_script( 'repeater', '/wp-content/plugins/annotation-fields/assets/js/script.js', array( 'jquery' ), 2019, true );
	    wp_enqueue_style( 'css', '/wp-content/plugins/annotation-fields/style.css',false,'1.1','all');
	    
	    add_meta_box( 'af-1', "annotation_fields", 'display_callback', 'post' );
	}

	add_action( 'add_meta_boxes', 'register_meta_boxes' );

	/**
	 * Meta box display callback.
	 *
	 * @param WP_Post $post Current post object.
	 */
	function display_callback( $post ) {
	    include plugin_dir_path( __FILE__ ) . './form.php';
	}

	function debug_to_console( $data ) {
	    $output = $data;
	    if ( is_array( $output ) )
	        $output = implode( ',', $output);

	    echo "<script>console.log( 'Debug Objects: " . $output . "' );</script>";
	}

	function update_global_fields($post_id, $meta_key, $meta_value){
	    $latest = new WP_Query( array (
	        'orderby'   => 'rand',
	        'fields' => 'ids'
	    ));

	    //echo("<script>console.log('PHP: ');</script>");                 
	    add_post_meta($post_id, $meta_key, $meta_value);

	    // update all posts
	    foreach ($latest->posts as $id) {
	        delete_post_meta($id, $meta_key);
	        add_post_meta($id, $meta_key, $meta_value);
	    }
	}

	function get_post_meta_fields( $object ) {
		//get the id of the post object array
		$post_id = $object['id'];

		// get_post_meta return the post meta fields as an array with strings by default
		// thats why it needs to be converted to correct datatype
		$metaData = get_post_meta( $post_id  );

		foreach ($metaData as $key  => $value) {
			// covert singel number to float
			if(is_numeric($value[0])){
				$metaData[$key] = (float)$value[0];
			}
			// array with arrays
			elseif ( is_array(json_decode($value[0])) ) {
				$index = 0;
				foreach ($value as $element) {
					$metaData[$key][$index++] = json_decode($element);
				}
			}
			//array with strings
			elseif(sizeof($value) > 1){
				$metaData[$key] = $value;
			}
			//array with boolean 
			elseif ($value[0] === "true" || $value[0] === "false") {
				$metaData[$key] = json_decode($value[0]);
			}
			// single strings
			else{
				$metaData[$key] = $value[0];
			}
		}

		return $metaData;
	}

	function create_posts_meta_field() {
		register_rest_field( 'post', 'post_meta_fields', array(
			'get_callback' => 'get_post_meta_fields',
			'schema' => null,
			'show_in_rest' => true,
			)
		);
	}

	/**
	 * Save meta box content.
	 *
	 * @param int $post_id Post ID
	 */
	function save_meta_box( $post_id ) {

	    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
	    if ( $parent_id = wp_is_post_revision( $post_id ) ) {
	        $post_id = $parent_id;
	    }
	    $meta_keys = [
	        'swe_description',
	        'eng_description',
	        'swe_title',
	        'eng_title',
	        'camera_position',
	        'camera_target',
	        'animation_time',
	        'reset_time',
	        'spin_velocity',
	        'swe_help_text',
	        'eng_help_text',
	        'swe_help_heading',
	        'eng_help_heading',
	        'eng_model_title',
	        'reset_model_time',
	        'menu_scale',
	        'textbox_scale',
	        'orbit_pan_factor',
	        'orbit_rotation_factor',
	        'orbit_zoom_factor',
	        'log_camera'

	    ]; 

	    // Cleaning all fields before we update them with new information
	    foreach ( $meta_keys as $meta_key ) {
	        delete_post_meta($post_id, $meta_key);
	    }

	    foreach ( $meta_keys as $meta_key ) {
	        // if $_POST contains $meta_key, the fileds are updated otherwise a new post was created
	        // and then we do nothing more
	        if ( array_key_exists( $meta_key, $_POST ) ) {
	            // $_POST[$meta_key] is an array with one element becaus the form variables are declared as arrays 
	            if(is_array($_POST[$meta_key])){
	                // local settings 
	                foreach ($_POST[$meta_key] as $meta_value) {

	                    $cam_array = Array();

	                    if($meta_key === "camera_position" || $meta_key === "camera_target"){
	                        array_push($cam_array, (float)$meta_value[x]);
	                        array_push($cam_array, (float)$meta_value[y]);
	                        array_push($cam_array, (float)$meta_value[z]);

	                        //Update annotation position and target 
	                        add_post_meta($post_id, $meta_key, json_encode($cam_array));
	                    }
	                    else{
	                        //Update annotation title and description 
	                        add_post_meta($post_id, $meta_key, $meta_value);
	                    }
	                }
	            }
	            else{
	                // Update global settings
	                update_global_fields($post_id, $meta_key, $_POST[$meta_key]);
	            } 
	        }
	    }
	}

	add_action( 'save_post', 'save_meta_box' );
	add_action( 'rest_api_init', 'create_posts_meta_field' );
?>