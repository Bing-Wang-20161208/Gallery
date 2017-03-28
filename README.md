## Step:
1. 安装脚手架Yeoman：npm install yo -g
2. 安装项目结构：npm install generator-react-webpack -g
3. 安装依赖：npm install * （安装之前可能需要先下载phantomjs@2.1.1到响应目录，并解压，然后安装phantomjs-prebuilt在开发依赖，才能成功） *
4. 开启服务器：npm start * （版本的不同会造成一些文件和操作的更换，具体改变之后的操作可以在生成的文件中找到，比如说npm start可在package.json中找到） *
5. 文件转移：npm run clean; npm run copy; npm run dist
6. npm install autoprefixer-loader --save-dev 并进行配置
7. 添加imageDatas.json图像信息配置文件，并存入图片,在Main.js中require('data/imageDatas.json')
8. Main.js具体编辑 (需要自安装node-sass, sass-loader)
