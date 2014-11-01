/**
 * @license GPLv3
 * @author 0@39.yt (Yurij Mikhalevich)
 */

var socket = io();

socket.on('err', function(error) {
  console.err(error);
  alert(error.toString());
});
