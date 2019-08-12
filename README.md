![Alt text](gif_animation.gif?raw=true "Title")

# 3DViewer

This wordpress theme is written in AngularJS and uses the Skethfab API in a service class. A working demo is available at http://shmdemo.se

## Run from localhost
1. Start Apache and mySQL server with XAMPP or any server application.
2. Log in to `http:/localhost/phpmyadmin` and create a new database with name `3dviewer`.
3. Download the lates worpress version from [Wordpress.com](https://wordpress.org/download/). Unzip and copy the wordpress folder to `C:\xampp\htdocs`.
4. Type `localhost/3dviewer` in you browser and configure the wordpress settings, choose 3dviewer as database as you newly created.
5. Copy the content in `themes`, `plugins` and `uploads` to the corresponding folders in `wordpress/wp-content/`.
6. Navigate to `wp-content/themes/3Dviewer` from cmd and run `npm install` to install node modules.
7. Import the test_data.xml from wordpress via tools>import>run importer>select file and submit.
7. Open the first post and hit the update buttom in the right corner.
9. Refresh the webpage `localhost/3dviewer` adn the 3dviewer-app will start running.

## Running end-to-end tests
Run `protractor conf` from the test folder via [Protractor](http://www.protractortest.org/).



