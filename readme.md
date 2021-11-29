# Private encrypted chat application for David Ralson
## installation
In order to run the application you need to have node.js of version 14 installed on your machine
You can find more details on installation process at https://nodejs.org/
After you have it installed, open this folder in terminal and install all dependencies
You can do it with:
```
> npm install
```
Or if it does not work you can try with sudo
```
> sudo npm install
```
## Run the application
The following command in terminl open in the folder will run the application:
```
> npm start
```
Server listens at port 5000 by default. You can change it by setting an environment variable PORT
```
> export PORT=3000
```
Now the chat is accessible at http://localhost:5000 in your local network.
## Customization
You can change the background image by replacing the file /public/images/background.jpeg (a new file must have the same name as the old one: background.jpeg).
Also you can replace the default sounds by changing files in the /public/audio directory (new files must have the same name and extension).