![Alt text](gif_animation.gif?raw=true "Title")

# 3DViewer

This wordpress theme is written in AngularJS to visualize 3D-models from Sketchfab by using their Viewer API. A working demo is available at http://shmdemo.se

## Run from localhost
1. Start Apache and mySQL server with XAMPP or any server application.
2. Log in to `http:/localhost/phpmyadmin` and create a new database with name `3dviewer`.
3. Download the lates worpress version from [Wordpress.com](https://wordpress.org/download/). Unzip it, copy and paste the worpress folder into to `C:\xampp\htdocs`.
4. Type `localhost/wordpress` in you browser and configure the wordpress settings, type: `3dviewer` as database name, `root` as username, leave the password blank, leave Database Host and Table Prefix as it is.
5. Clone the github repository and copy the content in `themes`, `plugins` and `uploads` and paste it in the corresponding folders in `wordpress/wp-content/`.
6. Navigate to `wordpress/wp-content/themes/3Dviewer` via your cmd and run `npm install` to install node modules. If you hasn't `Node.js` installed on your computer downloade the latest version from https://nodejs.org/en/download/ and install it before you run `npm install`.
7. Type `localhost/wordpress` in you browser. Go to the Plugins tab in the menu and activate `Annotation fields` and `Wordpress Importer`. 
8. Go to the Tools tab and then import>(Wordpress) run importer>select file. Selcet `test_data.xml` from the cloned repository and hit submit.
9. Go to the Appearance tab and activate the 3Dviewer theme.
10. Open the first post and hit the update buttom in the right corner.
11. Refresh the webpage `localhost/wordpress` and the 3dviewer-app will start running.

## Running end-to-end tests
Run `protractor conf` from the test folder via [Protractor](http://www.protractortest.org/).



