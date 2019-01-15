<div class="af_box">
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
    <!-- repeater -->
    <?php 

        $swe_title = get_post_meta(get_the_ID(), 'swe_title' );
        $eng_title = get_post_meta(get_the_ID(), 'eng_title' );
        $swe_description = get_post_meta(get_the_ID(), 'swe_description' );
        $eng_description = get_post_meta(get_the_ID(), 'eng_description' );
        $camera_position = get_post_meta(get_the_ID(), 'camera_position' );
        $camera_target = get_post_meta(get_the_ID(), 'camera_target' );
        $animation_time = get_post_meta(get_the_ID(), 'animation_time' );
        $reset_time = get_post_meta(get_the_ID(), 'reset_time' );
        $min_distance = get_post_meta(get_the_ID(), 'min_distance' );
        $max_distance = get_post_meta(get_the_ID(), 'max_distance' );
        $spin_velocity = get_post_meta(get_the_ID(), 'spin_velocity' );      

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
        if( empty($animation_time)){
            $animation_time[0] = "2";
        }
        if( empty($reset_time)){
            $reset_time[0] = "20";
        }
        if( empty($min_distance)){
            $min_distance[0] = "0";
        }
        if( empty($max_distance)){
            $max_distance[0] = "1000";
        }
        if( empty($spin_velocity)){
            $spin_velocity[0] = "1";
        }

        debug_to_console( "test: " . json_decode($animation_time[0]) );

        $animation_time_array = json_decode($animation_time[0]);
        $spin_velocity = json_decode($spin_velocity[0]);
        $reset_time_array = json_decode($reset_time[0]);
        $min_distance_array = json_decode($min_distance[0]);
        $max_distance_array = json_decode($max_distance[0]);
    ?>
    <div class="form-group">                   
        <label>Spin velocity [0, 1]</label>
        <input id="spin_velocity" type="text" name="spin_velocity[<?=0?>]" class="form-control" size="20" value="<?php echo $spin_velocity; ?>"> 
    </div>

    <div class="form-group">                   
        <label>Animation time</label>
        <input id="animation_time" type="text" name="animation_time[<?=0?>]" class="form-control" size="20" value="<?php echo $animation_time_array; ?>"> 
    </div>

    <div class="form-group">                   
        <label>Reset camera time</label>
        <input id="animation_time" type="text" name="reset_time[<?=0?>]" class="form-control" size="20" value="<?php echo $reset_time_array; ?>"> 
    </div>

    <div class="form-group">                   
        <label>Min distance</label>
        <input id="animation_time" type="text" name="min_distance[<?=0?>]" class="form-control" size="20" value="<?php echo $min_distance_array; ?>"> 
    </div>

    <div class="form-group">                   
        <label>Max distance</label>
        <input id="animation_time" type="text" name="max_distance[<?=0?>]" class="form-control" size="20" value="<?php echo $max_distance_array; ?>"> 
    </div>

    <div class="repeater">
        <?php $index = 0; foreach ( $swe_title as $k => $v ) : ?>
            <?php $camera_target_array = json_decode($camera_target[$index]);
                  $camera_position_array = json_decode($camera_position[$index]); ?>
            <div class="item">
                <div class="form-group">
                    <label>Camera position</label>
                    <input type="text" name="camera_position[<?=$index?>][x]" class="form-control" size="50" value="<?php echo $camera_position_array[0]; ?>">
                    <input type="text" name="camera_position[<?=$index?>][y]" class="form-control" size="50" value="<?php echo $camera_position_array[1]; ?>">
                    <input type="text" name="camera_position[<?=$index?>][z]" class="form-control" size="50" value="<?php echo $camera_position_array[2]; ?>">
                </div>
                <div class="form-group">
                    <label>Camera target</label>
                    <input type="text" name="camera_target[<?=$index?>][x]" class="form-control" size="50" value="<?php echo  $camera_target_array[0]; ?>">
                    <input type="text" name="camera_target[<?=$index?>][y]" class="form-control" size="50" value="<?php echo  $camera_target_array[1]; ?>">
                    <input type="text" name="camera_target[<?=$index?>][z]" class="form-control" size="50" value="<?php echo  $camera_target_array[2]; ?>">
                </div>
                <div class="row">
                    <div class="column">
                        <div class="form-group">
                            <label>Titel</label>
                            <input type="text" name="swe_title[]" class="form-control" value="<?php echo esc_attr( $v); ?>">
                        </div>
                        <div class="form-group">
                            <label>Beskrivning</label>
                            <textarea rows="4" cols="50"  name="swe_description[]" class="form-control" ><?php echo esc_attr( $swe_description[$index] ); ?></textarea>
                        </div>
                    </div>
                    <div class="column">
                        <div class="form-group">
                            <label>Title (English)</label>
                            <input type="text" name="eng_title[]" class="form-control" value="<?php echo esc_attr( $eng_title[$index]); ?>">
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
        <button type="button" class="btn btn-primary add-row">Add annotation</button>
    </div>

                                
</div><!-- tab-pane -->