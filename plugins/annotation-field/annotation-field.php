<?php
/*
Plugin Name: Annotation filed
Description: Adds custom fields to the post content to adjust model/annotation variables 
Author: Ray Space AB
Version: 1.0
License: GPL2
*/

wp_enqueue_script( 'script', '/wp-content/plugins/annotation-field/assets/js/script.js', array( 'jquery' ), false, true );
/**
 * Register meta boxes.
 */
function af_register_meta_boxes() {
    add_meta_box( 'af-1', __( 'Annotations', 'af' ), 'af_display_callback', 'post' );
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
        'max_distance',
        'min_distance',
        'spin_velocity'
    ]; 

    foreach ( $meta_keys as $meta_key ) {
        delete_post_meta($post_id, $meta_key);
    }

    register_meta( 'post', 'meta', [
                        'show_in_rest' => true,
                    ] );
    register_post_type('meta',array('show_in_rest'=> true));
    register_api_field( 'post',
        'meta',
        array(
            'get_callback'    => '$meta_value',
            'update_callback' => null, // add callback here for POST/PUT requests to update user meta
            'schema'          => null,
        )
    );

    foreach ( $meta_keys as $meta_key ) {
        if ( array_key_exists( $meta_key, $_POST ) ) {
            foreach ($_POST[$meta_key] as $meta_value) {
                $meta = get_post_meta($post_id, $meta_key);

                $cam_position_array = Array();
                $cam_target_array = Array();
                if ( in_array($meta_value, $meta) ) {
                    if($meta_key === "camera_position"){

                        $meta_value = serialize($meta_value);
                    }
                   
                    update_post_meta( $post_id, $meta_key, sanitize_text_field( $meta_value ) );
                }else{

                    if($meta_key === "camera_position"){


                        $coolArray = Array("tja" => 55);

                        array_push($cam_position_array, (float)$meta_value[x]);
                        array_push($cam_position_array, (float)$meta_value[y]);
                        array_push($cam_position_array, (float)$meta_value[z]);

                        $coolArray[] = $cam_position_array;
                        $escaped_json = '{"key":"value with \\"escaped quotes\\""}';

                        add_post_meta($post_id, $meta_key, json_encode($cam_position_array));
                    }
                    else if($meta_key === "camera_target"){

                        array_push($cam_target_array, (float)$meta_value[x]);
                        array_push($cam_target_array, (float)$meta_value[y]);
                        array_push($cam_target_array, (float)$meta_value[z]);

                        
                        add_post_meta($post_id, $meta_key, json_encode($cam_target_array));
                    }
                    else if($meta_key === "animation_time"){

                        $latest = new WP_Query( array (
                            'orderby'   => 'rand',
                            'fields' => 'ids'
                        ));
                        
                        add_post_meta($post_id, $meta_key, json_encode((float)$meta_value));

                        foreach ($latest->posts as $id) {
                            delete_post_meta($id, $meta_key);
                            add_post_meta($id, $meta_key, json_encode((float)$meta_value));
                        }
                        //echo "<script>console.log( 'Debug Objects: " . $output . "' );</script>";
                    }
                    else if($meta_key === "spin_velocity"){

                        $latest = new WP_Query( array (
                            'orderby'   => 'rand',
                            'fields' => 'ids'
                        ));
                        
                        add_post_meta($post_id, $meta_key, json_encode((float)$meta_value));

                        foreach ($latest->posts as $id) {
                            delete_post_meta($id, $meta_key);
                            add_post_meta($id, $meta_key, json_encode((float)$meta_value));
                        }
                        //echo "<script>console.log( 'Debug Objects: " . $output . "' );</script>";
                    }
                    else if($meta_key === "reset_time"){

                        $latest = new WP_Query( array (
                            'orderby'   => 'rand',
                            'fields' => 'ids'
                        ));
                        
                        add_post_meta($post_id, $meta_key, json_encode((float)$meta_value));

                        foreach ($latest->posts as $id) {
                            delete_post_meta($id, $meta_key);
                            add_post_meta($id, $meta_key, json_encode((float)$meta_value));
                        }
                    }
                    else if($meta_key === "min_distance"){

                        add_post_meta($post_id, $meta_key, json_encode((float)$meta_value));

                    }
                    else if($meta_key === "max_distance"){

                        add_post_meta($post_id, $meta_key, json_encode((float)$meta_value));

                    }
                    else{
                        add_post_meta($post_id, $meta_key, sanitize_text_field($meta_value));
                    }
                }
            }
        }
    }
}


add_action( 'save_post', 'af_save_meta_box' );
?>