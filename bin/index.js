#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const program = require('commander');

/****************************************************
 * 拷贝文件
 * @param srcPath
 * @param tarPath
 * @param cb
 ****************************************************/
const copyFile = function(srcPath, tarPath, cb) {
  var rs = fs.createReadStream(srcPath);
  rs.on('error', function(err) {
    if (err) {
      console.log('read error', srcPath)
    }
    cb && cb(err)
  });
  var ws = fs.createWriteStream(tarPath);
  ws.on('error', function(err) {
    if (err) {
      console.log('write error', tarPath)
    }
    cb && cb(err)
  });
  ws.on('close', function(ex) {
    cb && cb(ex);
  });
  rs.pipe(ws);
};

/****************************************************
 * 拷贝文件文件件
 * @param srcDir
 * @param tarDir
 * @param cb
 ****************************************************/
const copyFolder = function(srcDir, tarDir, cb) {
  fs.readdir(srcDir, function(err, files) {
    var count = 0
    var checkEnd = function() {
      ++count == files.length && cb && cb()
    };

    if (err) {
      checkEnd();
      return
    }

    files.forEach(function(file) {
      // console.log(file);
      var srcPath = path.join(srcDir, file);
      var tarPath = path.join(tarDir, file);

      fs.stat(srcPath, function(err, stats) {
        if (stats.isDirectory()) {
          if (srcPath.indexOf('node_modules') > -1) return;
          console.log('mkdir', tarPath);
          // console.log('folder:', srcPath, tarPath);
          fs.mkdir(tarPath, function(err) {
            if (err) {
              console.log(err);
              // copyFolder(srcPath, tarPath, checkEnd)
              return;
            }
            copyFolder(srcPath, tarPath, checkEnd)
          });
        } else {
          copyFile(srcPath, tarPath, checkEnd)
        }
      })
    });

    //为空时直接回调
    files.length === 0 && cb && cb();
  })
};

// 初始化admin模板
program
  .command('init')
  .action(function (options) {
    // copyFolder();
    copyFolder('/Users/YMM/Sites/mine/yeah-ui/samples/admin', process.cwd(), function () {
      console.log('初始化成功');
    });
  });

program.parse(process.argv);
