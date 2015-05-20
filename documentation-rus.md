# Документация плагина L.Cadastre

L.Cadastre - плагин для интеграции данных с сервера <a href="http://rosreestr.ru">© Росреестр</a>
в любую карту, созданную с использованием библиотеки Leaflet. 

## Пример

```html
	<div id="map"></div>

    <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css" />
    <script src="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet-src.js"></script>

    <script src="http://scanex.github.io/Leaflet-GeoMixer/build/leaflet-geomixer-dev.js?key=U92596WMIH"></script>
    <script src="../src/L.ImageOverlay.Pane.js"></script>
    <script src="../src/L.Cadastre.js"></script>
    <script src="../src/L.Cadastre.Info.js"></script>
    <link rel="stylesheet" href="../src/L.Cadastre.css" />
 
	<script>
		var map = L.map('map').setView([60, 50], 3);

        new L.Cadastre().addTo(map);
	</script>
```

Demos
------
  * [L.Cadastre](http://originalsin.github.io/L.Cadastre/examples/L.Cadastre.html) - add rosreestr plugin.


###Плагин L.Cadastre

Расширяет [L.TileLayer.WMS](http://leafletjs.com/reference.html#tilelayer-wms)

### Свойства

Свойство|Тип|Описание
------|:---------:|-----------
infoMode|`<Boolean>`| Показывать атрибуты объектов (по умолчанию: `false`).
dragMode|`<Boolean>`| Возможность сдвига слоя (по умолчанию: `false`).
shiftPosition|`<`[L.Point](http://leafletjs.com/reference.html#tilelayer-wms)`>`| Сдвиг слоя (задается в метрах меркатора).
template|`<String>`| URL сервера (по умолчанию: `http://{s}.maps.rosreestr.ru/arcgis/rest/services/Cadastre/Cadastre/MapServer/export`).
tileSize|`<Number>`| Размер тайлов (по умолчанию: `1024`).
zIndex|`<Number>`| zIndex контейнера (по умолчанию: `100`).

### Методы
Метод|Синтаксис|Возвращаемое значение|Описание
------|------|:---------:|-----------
enableInfoMode|`enableInfoMode()`|`this`| Включить показ атрибутов объектов.
disableInfoMode|`disableInfoMode()`|`this`| Отключить показ атрибутов объектов.
enableDrag|`enableDrag()`|`this`| Включить режим сдвига слоя.
disableDrag|`disableDrag()`|`this`| Отключить режим сдвига слоя.
setShift|`setShift(<L.Point>)`|`this`|Установить сдвиг слоя.
getShift|`getShift()`|`<L.Point>`|Получить текущий сдвиг слоя.

#### Events

| Type | Property | Description
| --- | --- |:---
| shiftchange | `<Event>` | установлен сдвиг слоя.
| dragenabled | `<Event>` | установлен режим сдвига слоя.
| dragdisabled | `<Event>` | отменен режим сдвига слоя.
| dragstart | `<Event>` | начат сдвиг слоя.
| drag | `<Event>` | происходит сдвиг слоя.
| dragend | `<Event>` | закончен сдвиг слоя.
| loaderstart | `<Event>` | начало загрузки атрибутов объектов с сервера.
| loaderend | `<Event>` | окончание загрузки атрибутов объектов с сервера.

