<?php
/**
 * The Header file for the theme.
 *
 * Displays all of the <head> section and everything up till <div class="main-content"">
 *
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?> ng-app="wp">
<head>
	<base href="/">
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
	<meta name="HandheldFriendly" content="true" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge">

	<title><?php wp_title( '|', true, 'right' ); ?></title>

	<link rel="profile" href="http://gmpg.org/xfn/11">
	<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">
	<script type="text/javascript" src="https://static.sketchfab.com/api/sketchfab-viewer-1.3.0.js"></script>
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.6.1/gl-matrix.js"></script>
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.15.0/lodash.min.js"></script>
	<script type="text/javascript" src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?> ng-controller="Main as vm" ng-init="vm.init('<?= home_url() ;?>')">
	<?php do_action( 'before' ); ?>

<?php?>


<div class="main-content" ng-cloak>

	<div  class=outerDragBox id=modelMenu >	
		<div class=menu hm-tap="vm.grayMenu()">
			<ul >
				<li ng-repeat="post in vm.data.posts track by $index"  > 
					<img hm-tap="vm.scrollTo($index); vm.select($index);" class="img-responsive" ng-src= "<?= home_url();?>/wp-content/uploads/{{post.slug}}.png" alt="Description" >
	    		</li>
				<li hm-tap="vm.resetCam(true)"><img style="padding: 8px"; class="img-responsive" src="<?= home_url();?>/wp-content/uploads/reset.png" alt=""></li>
				<li class="infoButton2">
					<div id="label2" hm-tap="vm.hideBorder()">i</div>
				</li>
		    </ul>
		</div>
	</div>
	
	<div id="wrapper" ng-show="vm.showAnnotationBox">

		<div class=annotationBox hm-tap="$event.stopPropagation()" >
			<h2>{{vm.currentTitle}}</h2>
			<p>{{vm.currentDescription}}</p>
			<ul class="languageList" >
				<li ng-repeat="language in vm.languages" 
					hm-tap="vm.changeLanguage($index)" 
					ng-class="{ 'selected-language-class': $index == vm.selectedLanguage }">{{language}}<span ng-if="$index == 0" style="text-decoration: none;">&nbsp/&nbsp</span></li>
			</ul>
		</div>
		<div class=navBar>
			<ul class="arrowList">
				<li class="arrow-left">
					<img  hm-tap="vm.prevAnnotation()" ng-src="<?= home_url();?>/wp-content/uploads/arrow_right.png" alt="Description">
				</li>
				<li class="arrow-right">
					<img  hm-tap="vm.nextAnnotation()" ng-src="<?= home_url();?>/wp-content/uploads/arrow_right.png" alt="Description">
				</li>	
			</ul>
		</div>
		
	</div>

	<div class="container">
    	<ul class="viewer" id="viewer">
        		<li data-ng-repeat="(modelIndex,post) in vm.data.posts" >
	        		<div id="{{modelIndex}}" class="wp-post" ng-bind-html="post.content.rendered | unsafe" ></div>
	        	</li>
		</ul>
	</div> 
	
</div>
    
    
    
    	
 


