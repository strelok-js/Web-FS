# Web FS
Это лёгкий файловый менеджер с веб интерфейсом и API внутри. Он поддерживает следующие действия: Переименование, удаление, скачивание.
Он создан исключительно как как быстрый вариант изменения или скачивания каких либо файлов на сервере, для всего остального лучше будет использовать FTP.
*Он **не** поддерживает закачивание файлов на сервер*
Для каждого запроса в query требуется пароль `pass=myPass` и настраивается в конфиге. Это **не** обеспечивает полную защиту, но спасает от лишних глаз.
## API запросы: actions
**rename** - переименовывает указаный файл или папку на сервере. 
**Example:**
```
/api?pass=myPass&action=rename&oldWay="абсолютныйПутьДоФайла/file.json"&newName=file2.json
/api?pass=myPass&action=rename&oldWay="/home/strelok/file.json"&newName=file2.json
```
Возвращает запись "good" если всё прошло успешно.
**rmdir/rm** - удаление каталогов или файлов. 
**Example:**
```
/api?pass=myPass&action=rmdir&rmPath=абсолютныйПутьДоФайла/file.json
/api?pass=myPass&action=rm&rmPath=абсолютныйПутьДоФайла/file.json
```
Возвращает запись "good" если всё прошло успешно.
**download** - скачивает выбранный файл. 
**Example:**
```
/api?pass=myPass&action=download&way=абсолютныйПутьДоФайла/file.json
```
Возвращает файл как таковой.
## Другие API запросы
**localDisc** - вернёт массив дисков системы. Для Linux это всегда `["/"]`. Для Windows это может быть `["c:/","d:/"]` 
**Example:**
```
/api?pass=myPass&localDisc=True
```
**folder** - вернёт объект данных о содержащихся файлах в папке с указанной глубиной.
**Example:**
```
/api?pass=myPass&folder=абсолютныйПутьДоПапки&deep=1
/api?pass=myPass&folder=/home/strelok/&deep=5
```
# UI
По запросу к серверу `/get?pass=myPass` вернётся пользовательский интерфейс для удобной работы.
[WEB UI](image.png)