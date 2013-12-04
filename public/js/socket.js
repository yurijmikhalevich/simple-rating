/**
 * @license GPLv3
 * @author 0@39.yt (Yurij Mikhalevich)
 */

var socket = io.connect('http://simple-rating/');

socket.on('err', function(error) {
  console.err(error);
});
