<!-- to access the arrow icon -->
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" crossorigin="anonymous">

<div class="af_box" onload="init()">
    <style scoped>
        .af_box{
            display: grid;
            grid-template-columns: max-content 1fr;
            grid-row-gap: 10px;
            grid-column-gap: 20px;
        }
        .af_field{
            display: contents;
        }
        .column {
            float: left;
            width: 40%;
        }
        .form-group input {
            margin-top: 5px;
            margin-bottom: 5px;
            display:inline-block; 
            *display: inline;     /* for IE7*/
            zoom:1;              /* for IE7*/
            vertical-align:middle;
            margin-left:20px
        }

        .form-group textarea {
            margin-top: 5px;
            margin-bottom: 5px;
            display:inline-block; 
            *display: inline;     /* for IE7*/
            zoom:1;              /* for IE7*/
            vertical-align:middle;
            margin-left:20px
        }

        .form-group label {
            display:inline-block;
            *display: inline;     /* for IE7*/
            zoom:1;              /* for IE7*/
            float: left;
            padding-top: 5px;
            text-align: right;
            width: 140px;
        }

        /* Clear floats after the columns */
        .row:after {
            content: "";
            display: table;
            clear: both;
        }
    </style>
</div>

<div role="tabpanel" class="tab-pane" id="cnt-repeater">
    
    <?php 
        function debug_to_console1( $data ) {
            $output = $data;
            if ( is_array( $output ) )
                $output = implode( ',', $output);

            var_dump($output) ;
            echo "<script>console.log( 'Debug Objects: " . $output . "' );</script>";
        }

        // get_post_meta last argument detrmains if it is an array or not
        $swe_title = get_post_meta(get_the_ID(), 'swe_title', false );
        $eng_title = get_post_meta(get_the_ID(), 'eng_title', false  );
        $swe_description = get_post_meta(get_the_ID(), 'swe_description', false  );
        $eng_description = get_post_meta(get_the_ID(), 'eng_description', false  );
        $camera_position = get_post_meta(get_the_ID(), 'camera_position', false  );
        $camera_target = get_post_meta(get_the_ID(), 'camera_target', false );
        $animation_time = get_post_meta(get_the_ID(), 'animation_time', true );
        $reset_time = get_post_meta(get_the_ID(), 'reset_time', true );
        $reset_model_time = get_post_meta(get_the_ID(), 'reset_model_time', true );
        $spin_velocity = get_post_meta(get_the_ID(), 'spin_velocity', true );
        $swe_help_text = get_post_meta(get_the_ID(), 'swe_help_text', true );
        $eng_help_text = get_post_meta(get_the_ID(), 'eng_help_text', true );
        $swe_help_heading = get_post_meta(get_the_ID(), 'swe_help_heading', true );
        $eng_help_heading = get_post_meta(get_the_ID(), 'eng_help_heading', true );            
        $eng_model_title = get_post_meta(get_the_ID(), 'eng_model_title', true ); 
        $menu_scale = get_post_meta(get_the_ID(), 'menu_scale', true );
        $textbox_scale = get_post_meta(get_the_ID(), 'textbox_scale', true );
        $orbit_pan_factor = get_post_meta(get_the_ID(), 'orbit_pan_factor', true ); 
        $orbit_rotation_factor = get_post_meta(get_the_ID(), 'orbit_rotation_factor', true ); 
        $orbit_zoom_factor = get_post_meta(get_the_ID(), 'orbit_zoom_factor', true );
        $log_camera = get_post_meta(get_the_ID(), 'log_camera', true );

        // get_the_ID() is current id and current id can be deleted
        $recent_posts = wp_get_recent_posts( array( 'numberposts' => '1' ) );
        $latestPostID = $recent_posts[0]['ID'];

        if ( empty($swe_title)){
            $swe_title[0] = "empty";
        }
        if ( empty($eng_title)){
            $eng_title[0] = "empty";
        }
        if( empty($swe_description)){
            $swe_description[0] = "empty";
        }
        if( empty($camera_position)){
            $camera_position[0] = "[0,0,0]";
        }
        if( empty($camera_target)){
            $camera_target[0] = "[0,0,0]";
        }
        if( empty($eng_description)){
            $eng_description[0] = "empty";
        }
        if( empty($eng_model_title)){
            $eng_model_title = "empty";
        }
        if( empty($animation_time)){
            $time = get_post_meta($latestPostID, 'animation_time', true);
            $animation_time = $time;
        }
        if( empty($reset_time)){
            $time = get_post_meta($latestPostID, 'reset_time', true );
            $reset_time = $time;
        }
        if( empty($reset_model_time)){
            $time = get_post_meta($latestPostID, 'reset_model_time', true );
            $reset_model_time = $time;
        }
        if( empty($spin_velocity)){
            $velocity = get_post_meta($latestPostID, 'spin_velocity', true );
            $spin_velocity = $velocity;
        }
        if( empty($swe_help_text)){
            $text = get_post_meta($latestPostID, 'swe_help_text', true );
            $swe_help_text = $text;
        }
        if( empty($eng_help_text)){
            $text = get_post_meta($latestPostID, 'eng_help_text', true );
            $eng_help_text = $text;
        }
        if( empty($swe_help_heading)){
            $text = get_post_meta($latestPostID, 'swe_help_heading', true );
            $swe_help_heading = $text;
        }
        if( empty($eng_help_heading)){
            $text = get_post_meta($latestPostID, 'eng_help_heading', true );
            $eng_help_heading = $text;
        }
        if( empty($menu_scale)){
            $scale = get_post_meta($latestPostID, 'menu_scale', true );
            $menu_scale = $scale;
        }
        if( empty($textbox_scale)){
            $scale = get_post_meta($latestPostID, 'textbox_scale', true );
            $textbox_scale = $scale;
        }
        if( empty($orbit_pan_factor)){
            $sensitivity = get_post_meta($latestPostID, 'orbit_pan_factor', true );
            $orbit_pan_factor = $sensitivity;
        }
        if( empty($orbit_rotation_factor)){
            $sensitivity = get_post_meta($latestPostID, 'orbit_rotation_factor', true );
            $orbit_rotation_factor = $sensitivity;
        }
        if( empty($orbit_zoom_factor)){
            $sensitivity = get_post_meta($latestPostID, 'orbit_zoom_factor', true );
            $orbit_zoom_factor = $sensitivity;
        }
        if( empty($log_camera)){
            $log_camera = false;
        }
          
    ?>
    
    <div class="row">
        <div class="column">
            <div class="form-group">
                <label>Hjälptitel</label>
                <input type="text" name="swe_help_heading" class="form-control" value="<?php echo esc_attr( $swe_help_heading); ?>">
            </div>
            <div class="form-group">
                <label>Hjälptext</label>
                <textarea rows="4" cols="50"  name="swe_help_text" class="form-control" ><?php echo esc_attr( $swe_help_text ); ?></textarea>
            </div>
        </div>
        <div class="column">
            <div class="form-group">
                <label>Help title</label>
                <input type="text" name="eng_help_heading" class="form-control" value="<?php echo esc_attr( $eng_help_heading); ?>">
            </div>
            <div class="form-group">
                <label>Help text (English)</label>
                <textarea rows="4" cols="50"  name="eng_help_text" class="form-control" ><?php echo esc_attr( $eng_help_text ); ?></textarea>
            </div>
        </div>
    </div>
    <div class="form-group">                   
        <label>Spin velocity [0, 1]</label>
        <input type="text" name="spin_velocity" class="form-control" size="20" value="<?php echo $spin_velocity; ?>"> 
    </div>

    <div class="form-group">                   
        <label>Animation time</label>
        <input type="text" name="animation_time" class="form-control" size="20" value="<?php echo $animation_time; ?>"> 
    </div>

    <div class="form-group">                   
        <label>Reset model time</label>
        <input type="text" name="reset_model_time" class="form-control" size="20" value="<?php echo $reset_model_time; ?>"> 
    </div>

    <div class="form-group">                   
        <label>Reset camera time</label>
        <input type="text" name="reset_time" class="form-control" size="20" value="<?php echo $reset_time; ?>"> 
    </div>

    <div class="form-group">                   
        <label>Menu scale</label>
        <input type="text" name="menu_scale" class="form-control" size="20" value="<?php echo $menu_scale; ?>"> 
    </div>

    <div class="form-group">                   
        <label>Textbox scale</label>
        <input type="text" name="textbox_scale" class="form-control" size="20" value="<?php echo $textbox_scale; ?>"> 
    </div>


    <div class="form-group">
        <label>Touch sensitivity</label>
        <input type="text" name="orbit_pan_factor" class="form-control" size="20" value="<?php echo $orbit_pan_factor; ?>"> 
        <input type="text" name="orbit_rotation_factor" class="form-control" size="20" value="<?php echo $orbit_rotation_factor; ?>">
        <input type="text" name="orbit_zoom_factor" class="form-control" size="20" value="<?php echo $orbit_zoom_factor; ?>">  
    </div>

    <div class="form-group" style="display: inline-block"> 
        <label>Log camera position</label>
        <input type="hidden" name="log_camera" value="<?=false?>" >
        <input type="checkbox" name="log_camera" value="<?=true?>" <?php if($log_camera) { echo 'checked';}?> >
        <p style="float: right; margin:0px; padding-top: 5px"> Induces memory leaks (only for finding annotation positions)</p>
    </div>


    <h2 style="font-weight: 600">Annotations</h2>
    <hr>

    <p style="margin-left: 30px">Deafult annotation:</p>
    
    
    <div id="simpleList" class="list-group">
        <?php $index = 0; foreach ( $swe_title as $k => $v ) : ?>
        <?php $camera_target_array = json_decode($camera_target[$index]);
                $camera_position_array = json_decode($camera_position[$index]); ?>
            <div class="list-group-item">
                <div class="form-group">
                    <label>Camera position</label>
                    <input type="text" name="camera_position[<?=$index?>][x]" class="form-control" value="<?php echo $camera_position_array[0]; ?>">
                    <input type="text" name="camera_position[<?=$index?>][y]" class="form-control" value="<?php echo $camera_position_array[1]; ?>">
                    <input type="text" name="camera_position[<?=$index?>][z]" class="form-control"  value="<?php echo $camera_position_array[2]; ?>">
                    <i class="fas fa-arrows-alt fa-3x cross-arrow handle"></i>
                </div>

                <div class="form-group">
                    <label>Camera target</label>
                    <input type="text" name="camera_target[<?=$index?>][x]" class="form-control" size="20" value="<?php echo  $camera_target_array[0]; ?>" >
                    <input type="text" name="camera_target[<?=$index?>][y]" class="form-control" size="20" value="<?php echo  $camera_target_array[1]; ?>" >
                    <input type="text" name="camera_target[<?=$index?>][z]" class="form-control" size="20" value="<?php echo  $camera_target_array[2]; ?>" >
                </div>
                
                <div class="row">
                    <div class="column">
                        <div class="form-group">
                            <label>Titel</label>
                            <input type="text" id="swe-title" name="swe_title[]" class="form-control" value="<?php echo esc_attr( $v); ?>">
                        </div>
                        <div class="form-group">
                            <label>Beskrivning</label>
                            <textarea rows="4" cols="50"  name="swe_description[]" class="form-control" ><?php echo esc_attr( $swe_description[$index] ); ?></textarea>
                        </div>
                    </div>
                    <div class="column">
                        <div class="form-group">
                            <label>Title (English)</label>
                            <input type="text" id="eng-title" name="eng_title[]" class="form-control"  value="<?php echo esc_attr( $eng_title[$index]); ?>">
                        </div>
                        <div class="form-group">
                            <label>Description (English)</label>
                            <textarea rows="4" cols="50"  name="eng_description[]" class="form-control" ><?php echo esc_attr( $eng_description[$index] ); ?></textarea>
                        </div>
                    </div>
                </div>
                <button type="button" class="btn btn-danger remove-row">remove</button>
                <hr>
            </div>
        <?php $index++; endforeach; ?> 
    </div> 
    <button type="button" class="btn btn-primary add-row">Add annotation</button> 
</div>