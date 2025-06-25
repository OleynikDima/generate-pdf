<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>


## Task
Разработать сервис на NestJS, который:

 - Принимает POST-запрос с данными для генерации PDF
 - Запускает дочерний процесс (Node.js-скрипт), который сгенерирует PDF
 - По завершении — отправляет POST-запрос (вебхук) на переданный callbackUrl

## Description
 Описание работы
1. Контроллер получает запрос и валидирует его.
2. Сервис сохраняет данные во временный JSON-файл (или передаёт через
stdin).
3. Запускается дочерний процесс (Node.js-скрипт, например generate-pdf.js),
который:
 - Генерирует PDF на основе данных
 - Сохраняет файл (можно в tmp/)
 - Возвращает статус и путь к PDF через process.send
4. После завершения:
Основной процесс NestJS делает POST-запрос на callbackUrl,
передавая orderId, status и ссылку на файл (или просто статус, если
генерация без файловой системы).

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm start

```

## Tests payload
```bash
{
  "orderId": "ORD-12345",
  "data": {
    "customer": "John Doe",
      "items": [
        { "name": "Product A", "price": 20 },
        { "name": "Product B", "price": 30 }
    ]
  },
  "config": {
    "title": "Order Receipt"
    "includeTimestamp": true,
  },
  "callbackUrl": "http://example.com/webhook"
}
```
