<?php
/*
Plugin Name: Annotation filed
Description: Adds custom fields to the post content to adjust model/annotation variables 
Author: Ray Space AB
Version: 1.0
License: GPL2
// https://metabox.io/how-to-create-custom-meta-boxes-custom-fields-in-wordpress/
*/


/**
 * Register meta boxes.
 */
function af_register_meta_boxes() {
    wp_enqueue_script('sortablejs', get_template_directory_uri() .'/node_modules/sortablejs/Sortable.min.js');
    wp_enqueue_script( 'repeater', '/wp-content/plugins/annotation-field/assets/js/script.js', array( 'jquery' ), 2019, true );
    wp_enqueue_style( 'css', '/wp-content/plugins/annotation-field/style.css',false,'1.1','all');
    
    add_meta_box( 'af-1', __( 'Global settings', 'af' ), 'af_display_callback', 'post' );
}

add_action( 'add_meta_boxes', 'af_register_meta_boxes' );

/**
 * Meta box display callback.
 *
 * @param WP_Post $post Current post object.
 */
function af_display_callback( $post ) {
    include plugin_dir_path( __FILE__ ) . './form.php';
}

function debug_to_console( $data ) {
    $output = $data;
    if ( is_array( $output ) )
        $output = implode( ',', $output);

    echo "<script>console.log( 'Debug Objects: " . $output . "' );</script>";
}

function update_field_global($post_id, $meta_key, $meta_value){
    $latest = new WP_Query( array (
        'orderby'   => 'rand',
        'fields' => 'ids'
    ));

    //echo("<script>console.log('PHP: ');</script>");                 
    add_post_meta($post_id, $meta_key, $meta_value);

    // updat all posts
    foreach ($latest->posts as $id) {
        delete_post_meta($id, $meta_key);
        add_post_meta($id, $meta_key, $meta_value);
    }
}

/**
 * Save meta box content.
 *
 * @param int $post_id Post ID
 */
function af_save_meta_box( $post_id ) {

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

    foreach ( $meta_keys as $meta_key ) {
        delete_post_meta($post_id, $meta_key);
    }

    // to show the fields params in JSON
    // so it can be exported
    register_meta( 'post', 'meta', ['show_in_rest' => true,]);

    //we must loop through $meta_keys becasue if we import posts $_POST is empty
    foreach ( $meta_keys as $meta_key ) {
        // if $_POST contains $meta_key we performed a update otherwise we created a new post
        // and the we dont want to update our fields 
        if ( array_key_exists( $meta_key, $_POST ) ) {
            // $_POST[$meta_key] is an array with one element becaus we are sending all inputs as arrays (name = manu_scale[])
            if(is_array($_POST[$meta_key])){
                // local settings 
                foreach ($_POST[$meta_key] as $meta_value) {

                    $cam_array = Array();

                    if($meta_key === "camera_position" || $meta_key === "camera_target"){
                        array_push($cam_array, (float)$meta_value[x]);
                        array_push($cam_array, (float)$meta_value[y]);
                        array_push($cam_array, (float)$meta_value[z]);

                        add_post_meta($post_id, $meta_key, json_encode($cam_array));
                    }                                    
                    else{
                        // for all inputs that is used for a singel post and is text
                        add_post_meta($post_id, $meta_key, $meta_value);
                    }
                }
            }
            else{
                //global settings
                //everything is posted as text/string now
                update_field_global($post_id, $meta_key, $_POST[$meta_key]);
            } 
        }
    }
}


add_action( 'save_post', 'af_save_meta_box' );
?>