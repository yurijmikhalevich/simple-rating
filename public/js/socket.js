/**
 * @license GPLv3
 * @author 0@39.yt (Yurij Mikhalevich)
 */

var socket = io.connect('http://kittens-are-on-the-way.org/');

socket.on('err', function(error) {
  console.err(error);
});
