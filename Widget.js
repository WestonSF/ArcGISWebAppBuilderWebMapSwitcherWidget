define([
	"dojo/_base/declare",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/_base/html",
    "dojo/dom-construct",
    "dojo/query",
    "dojo/dom-attr",
    "dojo/Deferred",
	"dojo/on",
	"jimu/BaseWidget",
    "jimu/PanelManager",
    "jimu/dijit/Message",
	"dijit/_WidgetsInTemplateMixin",
    "esri/arcgis/Portal",
    "esri/dijit/Basemap",
	"esri/dijit/BasemapGallery",
    "jimu/MapManager"
], function (declare,
    array,
    lang,
    html,
    domConstruct,
    domQuery,
    domAttr,
    Deferred,
    on,
    BaseWidget,
    PanelManager,
    Message,
	_WidgetsInTemplateMixin,
    arcgisPortal,
    Basemap,
    BasemapGallery,
    MapManager) {
    return declare([BaseWidget, _WidgetsInTemplateMixin], {

        baseClass: 'jimu-widget-themesgallery',
        themesDijit: null,
        _drawnGraphics: false,

        // On startup
        startup: function () {
            console.log('Webmap Switcher widget created...');
            this.inherited(arguments);
            this.setupGroup();
        },

        // Setup the group
        setupGroup: function () {
            var setupGroup = this;
            var portalUrl = this.appConfig.portalUrl;
            
            // Get the group ID
            var groupId = this.config.groupID;
            // Get the group access
            var groupAccess = this.config.groupAccess;

            // Create the portal
            portal = new arcgisPortal.Portal(portalUrl);

            // If public group
            if (groupAccess.toLowerCase() == "public") {
                this.renderThemeSwitcher(portal, groupId, groupAccess);
            }
            // If secured group, need to sign in
            else {
                console.log('Signing in to access the secure group...');

                portal.signIn().then(function (loggedInUser) {
                    setupGroup.renderThemeSwitcher(portal, groupId, groupAccess);
                });
            }
        },

        // Load the map switcher
        renderThemeSwitcher: function (portal, groupId, groupAccess) {
            var renderThemeSwitcher = this;
            var map = this.map;
            var themeObjs = [];

            console.log('Loading the webmaps in group ' + groupId + '...');
            // Set paramters to query the group
            var groupQueryParams = {
                q: "group:" + groupId,
                sortField: 'title',
                sortOrder: 'asc',
                num: 100
            };
            portal.queryItems(groupQueryParams).then(function (data) {
                for (i = 0; i < data.results.length; i++) {
                    var theme = new Basemap({
                        title: data.results[i].title,
                        itemId: data.results[i].id,
                        thumbnailUrl: data.results[i].thumbnailUrl
                    });
                    // Push maps into themes object
                    themeObjs.push(theme);
                }

                // Load the group into the basemap gallery widget
                renderThemeSwitcher.themesDijit = new BasemapGallery({
                    showArcGISBasemaps: false,
                    map: map,
                    portalUrl: portalUrl,
                    basemaps: themeObjs
                }, renderThemeSwitcher.themeGalleryDiv);
                // Start the themes widget
                renderThemeSwitcher.themesDijit.startup();

                // Error handling
                renderThemeSwitcher.themesDijit.on("error", function (evt) {
                    console.error(evt);
                });

                // On click event for themes widget
                renderThemeSwitcher.themesDijit._onNodeClick = lang.hitch(this, function (b) {
                    if (renderThemeSwitcher.appConfig._drawnGraphics) {
                        var popup = new Message({
                            message: renderThemeSwitcher.nls.webmapSwitchWarning,
                            buttons: [{
                                label: renderThemeSwitcher.nls.cancel,
                                onClick: function () {
                                    popup.close();
                                }
                            }, {
                                label: renderThemeSwitcher.nls.confirm,
                                onClick: lang.hitch(renderThemeSwitcher, function () {
                                    popup.close();
                                    renderThemeSwitcher._switchWebMap(b, groupAccess)
                                })
                            }]
                        });
                        return false;
                    } else {
                        renderThemeSwitcher._switchWebMap(b, groupAccess)
                    }

                });
            });
        },

        // Switch the map
        _switchWebMap: function (b, groupAccess) {
            console.log('Switching the webmap...');
            var switchWebMap = this;
            this.appConfig.map.itemId = b.itemId;
            this.appConfig.map.mapOptions.extent = this.map.extent;
            this.appConfig._drawnGraphics = false;

            // If public group
            if (groupAccess.toLowerCase() == "public") {
                MapManager.getInstance()._recreateMap(switchWebMap.appConfig);
            }
            // Private group
            else {
                portal.signIn().then(function (loggedInUser) {
                    MapManager.getInstance()._recreateMap(switchWebMap.appConfig);
                });
            }
        },

        destroythemesDijit: function() {
            if (this.themesDijit && this.themesDijit.destroy) {
                this.themesDijit.destroy();
                this.themesDijit = null;
            }
        },

        destroy: function() {
            this.destroythemesDijit();
            this.inherited(arguments);
        },

		_responsive: function () {
		    // the default width of esriBasemapGalleryNode is 85px,
		    // margin-left is 10px, margin-right is 10px;
		    var paneNode = query('#' + this.id)[0];
		    var width = html.getStyle(paneNode, 'width');
		    console.log(width);
		    var column = parseInt(width / 105, 10);
		    console.log(column);
		    if (column > 0) {
		        var margin = width % 105;
		        var addWidth = parseInt(margin / column, 10);
		        console.log(addWidth);
		        query('.esriBasemapGalleryNode', this.id).forEach(function (node) {
		            html.setStyle(node, 'width', 85 + addWidth + 'px');
		        });
		    }
		}

	});
});
