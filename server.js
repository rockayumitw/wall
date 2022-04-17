const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const headers = require('./headers');
const handleSuccess = require('./scuessHandle');
const handleError = require('./errorHandle');
const Posts = require('./models/posts');

dotenv.config({path: './config.env'});

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
//   .connect('mongodb://localhost:27017/hotel') // 本機端
  .connect(DB)
  .then(() => console.log('資料庫連接成功'));

const requestListener = async (req, res) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  })
  if (req.url === '/posts' && req.method === 'GET') {
    const allPosts = await Posts.find();
    handleSuccess(res, allPosts);
    res.end();
  } else if (req.url === '/posts' && req.method === 'POST') {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (data.content) {
          const newPost = await Posts.create({
            name: data.name,
            content: data.content,
            tags: data.tags,
            type: data.type
          })
          handleSuccess(res, newPost);
        } else {
          handleError(res);
        }
      } catch (err){
        handleError(res, err);
      }
    })
  } else if (req.url === '/posts' && req.method === 'DELETE') {
    await Posts.deleteMany({});
    const allPosts = await Posts.find();
    handleSuccess(res, allPosts);
  } else if (req.url.startsWith('/posts/') && req.method === 'DELETE') {
    const id = req.url.split('/').pop();
    const posts = await Posts.findByIdAndDelete(id);
    const allPosts = await Posts.find();
    posts ? handleSuccess(res, allPosts) : handleError(res);
  }  else if (req.url.startsWith('/posts/') && req.method === 'PATCH') {
    req.on('end', async () => {
        const id = req.url.split('/').pop();
        const data = JSON.parse(body);
        const posts = await Posts.findByIdAndUpdate(id, data, { new: true});
        handleSuccess(res, posts)
    })
  } else if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(JSON.stringify({
      "status": "false",
      "message": "無此網站路由"
    }))
    res.end();
  }
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);

// https://vast-tor-96963.herokuapp.com/posts