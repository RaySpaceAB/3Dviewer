<?php
/**
 * The main template file.
 *
 */

get_header(); ?>


<div ng-view></div>

	<?php if ( have_posts() ) : ?>

		<?php /* Start the Loop */ ?>
		<?php while ( have_posts() ) : the_post(); ?>


		<?php endwhile; ?> 

	<?php else : ?>

		<?php get_template_part( 'no-results', 'index' ); ?>

	<?php endif; ?>
