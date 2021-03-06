(function () {
    L.Cadastre = L.TileLayer.WMS.extend({
        includes: L.Mixin.Events,

        options: {
            maxZoom: 19,
            maxNativeZoom: 18,
            tileSize: 1024,
            zIndex: 100,
            infoMode: false,
            dragMode: false,
            shiftPosition: L.point(0, 0),      // For shift layer
            template: 'http://pkk5.rosreestr.ru/arcgis/rest/services/Cadastre/Cadastre/MapServer/export',
            // template: 'http://{s}.maps.rosreestr.ru/arcgis/rest/services/Cadastre/Cadastre/MapServer/export',
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
            L.setOptions(options);
            if (this.info) { this.info.init(this); }
            this._pos = L.point(0, 0);
            this._pixelPoint = L.point(0, 0);
            this._tileerrorFunc = function (ev) {
                this.options.errorTileUrl = ev.url + '&';
            };
            this._stopClick = function (ev) {
                this.options.errorTileUrl = ev.url + '&';
            };

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

                url = L.Util.template(this._url, { s: this._getSubdomain(tilePoint) });

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

        _dragstart: function () {
            this.fire('dragstart');
            this._dragstate = true;
        },

        _dragend: function () {
            this.fire('dragend');
            var _this = this;
            setTimeout(function () { _this._dragstate = false; }, 0);
        },
        _drag: function (ev) {
            this._pixelPoint = ev.target._newPos;

            if (this._tileContainer) {
                L.DomUtil.setPosition(this._tileContainer, this._pixelPoint);
            }

            this._pos = this._pixelPoint.divideBy(256 / L.gmxUtil.tileSizes[this._map.getZoom()]);
            this._pos.y = -this._pos.y;
            this.fire('drag', { shiftPosition: this.options.shiftPosition, dragPosition: this._pos });
        },

        enableDrag: function () {
            this.options.dragMode = true;
            if (this._map) {
                this._chkActive();
                var map = this._map;
                if (this.info) {
                    this.info.removePopup(true);
                }
                if (map._pathRoot) { map._pathRoot.style.pointerEvents = 'none'; }
                map.dragging.disable();
                L.DomUtil.disableImageDrag();
                map.on('zoomstart', this.redraw, this);
                L.DomUtil.setPosition(this._tileContainer, L.point(0, 0));
                this._draggable = new L.Draggable(this._tileContainer, this._container);
                this._draggable
                    .on('dragstart', this._dragstart, this)
                    .on('dragend', this._dragend, this)
                    .on('drag', this._drag, this);
                this._draggable.enable();
            }
            this.fire('dragenabled');
            return this;
        },

        _chkActive: function () {
            var options = this.options,
                container = this.getContainer();

            if (options.infoMode || options.dragMode) {
                L.DomUtil.removeClass(container, 'leaflet-cadastre-infoDisabled');
            } else {
                L.DomUtil.addClass(container, 'leaflet-cadastre-infoDisabled');
            }
        },

        disableDrag: function () {
            this.options.dragMode = false;
            if (this._map) {
                this._chkActive();
                var map = this._map;
                this.options.shiftPosition._add(this._pos);
                this._pos = L.point(0, 0);

                if (map._pathRoot) { map._pathRoot.style.pointerEvents = ''; }
                map.dragging.enable();
                L.DomUtil.enableImageDrag();
                map.off('zoomstart', this.redraw, this);
                if (this._draggable) {
                    this._draggable.disable();
                    this._draggable
                        .off('dragstart', this._dragstart, this)
                        .off('dragend', this._dragend, this)
                        .off('drag', this._drag, this);
                }
                if (this._dragstate) {
                    this.fire('dragend');
                    this._dragstate = false;
                }

                this.redraw();
            }
            this.fire('dragdisabled');
            return this;
        },

        _tileloadstart: function (ev) {
            if ('loaderStatus' in L.gmxUtil) {
                ev.tile._statusUrl = ev.url
                L.gmxUtil.loaderStatus(ev.url);
            }
        },

        _tileloadend: function (ev) {
            if ('loaderStatus' in L.gmxUtil) {
                L.gmxUtil.loaderStatus(ev.tile._statusUrl, true);
            }
        },

        onRemove: function (map) {
            this
                .off('tileerror', this._tileerrorFunc, this)
                .off('tileloadstart', this._tileloadstart, this)
                .off('tileload tileunload', this._tileloadend, this);

            this.disableDrag();
            if (this.info) {
                this.info.overlays.clearAll(true);
            }
            this._clearInfoMode();
            L.TileLayer.WMS.prototype.onRemove.call(this, map);
        },

        onAdd: function (map) {
            L.TileLayer.WMS.prototype.onAdd.call(this, map);
            this.setZIndex(this.options.zIndex);
            this
                .on('tileerror', this._tileerrorFunc, this)
                .on('tileloadstart', this._tileloadstart, this)
                .on('tileload tileunload', this._tileloadend, this);

            if (this.options.infoMode) {
                this.enableInfoMode();
            }
            if (this.options.dragMode) {
                this.enableDrag();
            }
            this._chkActive();
        },

        _setAutoZIndex: function () {  // we don't want autoZIndex
        },

        enableInfoMode: function () {
            this.options.infoMode = true;
            if (this._map && this.info) {
                this._map.on('click', this.info.click, this);
                L.DomUtil.addClass(this.getContainer(), 'leaflet-clickable-raster-layer');
                this._chkActive();
            }
            return this;
        },

        disableInfoMode: function () {
            this.options.infoMode = false;
            this._clearInfoMode();
            return this;
        },

        _clearInfoMode: function () {
            if (this._map && this.info) {
                this._map.off('click', this.info.click, this);
                L.DomUtil.removeClass(this.getContainer(), 'leaflet-clickable-raster-layer');
                this._chkActive();
            }
        }
    });

    L.cadastre = function (url, options) {
        return new L.Cadastre(url, options);
    };
})();
