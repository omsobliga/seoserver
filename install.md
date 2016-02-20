# Installation

## Required Enviroment

```
# install node and npm
echo 'export PATH=$HOME/local/bin:$PATH' >> ~/.bashrc
. ~/.bashrc
mkdir ~/local
mkdir ~/node-latest-install
cd ~/node-latest-install
curl http://nodejs.org/dist/node-latest.tar.gz | tar xz --strip-components=1
./configure --prefix=~/local
make install # ok, fine, this step probably takes more than 30 seconds...
curl -L https://www.npmjs.org/install.sh | sh
echo 'export NODE_PATH=$HOME/node_modules:$NODE_PATH' >> ~/.bashrc

npm install commander
npm install forever-monitor
npm install express

npm install phantomjs
```

## Run:
```
node bin/seoserver.js -p 8080 start
```
