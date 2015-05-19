(function () {
    L.Cadastre = L.TileLayer.WMS.extend({
        includes: L.Mixin.Events,

        options: {
            tileSize: 1024,
            infoMode: true,
            shiftMode: false,
            shiftPosition: L.point(0, 0),      // For shift layer
            template: 'http://{s}.maps.rosreestr.ru/arcgis/rest/services/Cadastre/Cadastre/MapServer/export',
            attribution: '<a href="http://rosreestr.ru">© Росреестр</a>'
        },

        defaultWmsParams: {
            size: '1024,1024',
            bboxSR: 102100,
            imageSR: 102100,
            dpi: 96,
            f: 'image',
            format: 'png32',
            transparent: true
        },

        initialize: function (url, options) {
            this._pixelPoint = L.point(0, 0);
            L.TileLayer.WMS.prototype.initialize.call(this, url || this.options.template, options || this.options);
        },

        getTileUrl: function (tilePoint) {
            var map = this._map,
                pos = map.getCenter(),
                shiftPoint = L.CRS.EPSG3857.project(pos).subtract(map.options.crs.project(pos));

            shiftPoint.x = 0;
            shiftPoint = shiftPoint._subtract(this.options.shiftPosition);
            
            var tileSize = this.options.tileSize,

                nwPoint = tilePoint.multiplyBy(tileSize),
                sePoint = nwPoint.add([tileSize, tileSize]),

                nw = this._crs.project(map.unproject(nwPoint, tilePoint.z)).add(shiftPoint),
                se = this._crs.project(map.unproject(sePoint, tilePoint.z)).add(shiftPoint),
                bbox = this._wmsVersion >= 1.3 && this._crs === L.CRS.EPSG4326 ?
                    [se.y, nw.x, nw.y, se.x].join(',') :
                    [nw.x, se.y, se.x, nw.y].join(','),

                url = L.Util.template(this._url, {s: this._getSubdomain(tilePoint)});

            return url + L.Util.getParamString(this.wmsParams, url, true) + '&BBOX=' + bbox;
        },

        getShift: function () {
            if (!this._pos) {
                this._pos = L.point(0, 0);;
            }
            return this.options.shiftPosition.add(this._pos);
        },

        setShift: function (point) {
            this.options.shiftPosition = L.point(point);
            if (this._pos) {
                this._pos = pos.add(this.options.shiftPosition);
            }
            this.fire('shiftchange');
            return this;
        },

        redraw: function () {
            this.options.shiftPosition._add(this._pos);
            this._pos = L.point(0, 0);
            L.TileLayer.WMS.prototype.redraw.call(this);
            L.DomUtil.setPosition(this._tileContainer, this._pos);
        },
/*
        _update: function () {

            if (!this._map) { return; }

            var map = this._map,
                bounds = map.getPixelBounds(),
                zoom = map.getZoom(),
                tileSize = this._getTileSize();

            if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
                return;
            }

            //console.log('_update', this._pixelPoint);
            var tileBounds = L.bounds(
                    bounds.min.divideBy(tileSize)._subtract(this._pixelPoint)._floor(),
                    bounds.max.divideBy(tileSize)._subtract(this._pixelPoint)._floor());

            this._addTilesFromCenterOut(tileBounds);

            if (this.options.unloadInvisibleTiles || this.options.reuseTiles) {
                this._removeOtherTiles(tileBounds);
            }
        },

        repaint: function () {
            this.options.shiftPosition._add(this._pos);
            this._pos = L.point(0, 0);

            for (var key in this._tiles) {
                this.fire('tileunload', {tile: this._tiles[key]});
            }

            this._tiles = {};
            this._tilesToLoad = 0;

            this._bgBuffer.innerHTML = '';
            var front = this._tileContainer;
            this._tileContainer = this._bgBuffer;
            this._bgBuffer = front;
            //this.options.shiftPosition._add(this._pos);
            L.DomUtil.setPosition(this._tileContainer, this._pos);
            this._update();
        },
*/
        _drag: function (ev) {
            this._pixelPoint = ev.target._newPos;

            if (this._tileContainer) {
                L.DomUtil.setPosition(this._tileContainer, this._pixelPoint);
            }
            
            this._pos = this._pixelPoint.divideBy(256 / L.gmxUtil.tileSizes[this._map.getZoom()]);
            this._pos.y = -this._pos.y;
            this.fire('drag', {shiftPosition: this.options.shiftPosition, dragPosition: this._pos});
        },

        enableDrag: function () {
            if (this._map) {
                var map = this._map;

                map.dragging.disable();
                L.DomUtil.disableImageDrag();
                map.on('zoomstart', this.redraw, this);
                L.DomUtil.setPosition(this._tileContainer, L.point(0, 0));
                if (!this._draggable) {
                    this._draggable = new L.Draggable(this._tileContainer, this._container);
                }
                this._draggable
                    //.on('dragend', this._update, this)
                    .on('drag', this._drag, this);
                this._draggable.enable();
                this.fire('dragstart');
            }
            return this;
        },

        disableDrag: function () {
            if (this._map) {
                var map = this._map;
                this.options.shiftPosition._add(this._pos);
                this._pos = L.point(0, 0);

                map.dragging.enable();
                L.DomUtil.enableImageDrag();
                map.off('zoomstart', this.redraw, this);
                this._draggable.disable();
                this._draggable
                    //.off('dragend', this._update, this)
                    .off('drag', this._drag, this);
                this.fire('dragstop');
                this.redraw();
            }
            return this;
        },

        // enableShiftMode: function () {
            // return this;
        // },

        // disableShiftMode: function () {
            // return this;
        // },

        enableInfoMode: function () {
            return this;
        },

        disableInfoMode: function () {
            return this;
        }
    });

    L.cadastre = function (url, options) {
      return new L.Cadastre(url, options);
    };
})();
