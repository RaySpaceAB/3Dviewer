![Alt text](gif_animation.gif?raw=true "Title")

# 3DViewer

This wordpress theme was written in AngularJS and uses the Skethfab API as a service class.

## Run from localhost
1. Start the Apache and mySQL server with XAMPP or any server application.
2. Log in to `http:/localhost/phpmyadmin` and create a ne database with name `3dviewer`.
3. Download the lates worpress version from [Wordpress.com](https://wordpress.org/download/) unzip it, copy the wordpress folder to `C:\xampp\htdocs`.
4. Navigate to `localhost/3dviewer` in you browser and configure the wordpress settings, choose 3dviewer as database as you newly created.
5. Copy `3Dviewer` folder from the downloaded repository to the `wp-content/themes`.
6. Navigate to `wp-content/themes/3Dviewer` from cmd and run `npm install`
7. Copy the plugin folders and paste them into `wp-content/plugins`. Don't forget to activate them in worpress panel.
8. Import the test_data.xml from wordpress via tools>import>run importer>select file and submit.
9. Open the first post an hitd the update buttom in the right corner
10. Refresh the webpage `localhost/3dviewer` an the 3dviewer app will start running.

## Running end-to-end tests
Run `protractor conf` from the test folder via [Protractor](http://www.protractortest.org/).



