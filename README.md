# Snappy - Chat Application 
Snappy is chat application build with the power of MERN Stack. You can find the tutorial [here](https://www.youtube.com/watch?v=otaQKODEUFs)

![image](https://github.com/user-attachments/assets/d199ddf3-a3cd-4b64-8810-e0d19f1e79f9)
![image](https://github.com/user-attachments/assets/ccd43593-3000-4be4-90b1-8d86e16867d3)
![image](https://github.com/user-attachments/assets/01dcb3c2-1cb8-4415-8a77-824d4bd707e6)
![image](https://github.com/user-attachments/assets/50605703-6a48-4708-b81c-669b1bb05707)
![image](https://github.com/user-attachments/assets/4660334c-473e-4530-b3a0-b4e53b7beb40)






## Installation Guide

### Requirements
- [Nodejs](https://nodejs.org/en/download)
- [Mongodb](https://www.mongodb.com/docs/manual/administration/install-community/)

Both should be installed and make sure mongodb is running.
### Installation

#### First Method
```shell
git clone https://github.com/koolkishan/chat-app-react-nodejs
cd chat-app-react-nodejs
```
Now rename env files from .env.example to .env
```shell
cd public
mv .env.example .env
cd ..
cd server
mv .env.example .env
cd ..
```

Now install the dependencies
```shell
cd server
yarn
cd ..
cd public
yarn
```
We are almost done, Now just start the development server.

For Frontend.
```shell
cd public
yarn start
```
For Backend.

Open another terminal in folder, Also make sure mongodb is running in background.
```shell
cd server
yarn start
```
Done! Now open localhost:3000 in your browser.

#### Second Method
- This method requires docker and docker-compose to be installed in your system.
- Make sure you are in the root of your project and run the following command.

```shell
docker compose build --no-cache
```
after the build is complete run the containers using the following command
```shell
docker compose up
```
now open localhost:3000 in your browser.# snappy
# snappy
