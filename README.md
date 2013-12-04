# kittens-are-on-the-way.org

Репозиторий исходного кода движка сайта (и серверной и клиентской частей) [kittens-are-on-the-way.org](http://kittens-are-on-the-way.org/).

Сервер разработан на node.js, в качестве СУБД используется [MongoDB](http://www.mongodb.org/). Используются следующие модули:
* [mongodb](https://npmjs.org/package/mongodb) - для работы с СУБД;
* [socket.io](https://npmjs.org/package/socket.io) - для организации клиент-серверного взаимодействия;
* [async](https://npmjs.org/package/async) - для организации асинхронных операций;
* [bcrypt](https://npmjs.org/package/bcrypt) - для работы с функцией хеширования, основанной на алгоритме шифрования Blowfish.

В основе клиентской части лежит фреймворк [AngularJS](http://angularjs.org/). Используются библиотеки [jQuery](http://jquery.com/) и [Bootstrap](http://getbootstrap.com/).
