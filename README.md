# simple-rating

Here is simple rating application to create event-based rating list.

__NOTICE:__ simple rating is a single-admin application; so there will be
 undefined behaviour in case of editing something simultaneously even if in some
 cases it will work OK.

## Installation and usage

To launch application you need nodejs, npm, mongodb server and
some static server (I prefer using nginx, but it's completely free to select)
installed. Setup your static
files server to server /static/ dir of the project as /static/ and proxy other
request to the application server (you should specify port in settings.json as
well as other settings).
Your proxy should support WebSockets.

Next you should execute in the application directory.

```bash
$ npm install && cd static && bower install && cd ..
$ node app.js
```

That's all.

Default password is "beacon", but you may change it by changing bcrypt hash in
settings.json.

## Generating new bcrypt hash

You should execute this in the application directory after performing
"npm install".

```bash
$ node
> require('bcrypt').hashSync('your password here', 8)
'$2a$08$yfKrF8yn8EmhpS69G/bR3e.E3PvGdAXzynXtL8k0P/LhO/qGyOa1m'
```
