///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
    'dojo/_base/declare',
    'dojo/Deferred',
    'jimu/BaseWidgetSetting',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/registry',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/on',
    'dojo/query',
    'jimu/dijit/Message',
    'jimu/LayerInfos/LayerInfos',
    'jimu/dijit/LoadingShelter',
    'jimu/dijit/RadioBtn',
    'dijit/form/Select',
    'esri/arcgis/utils',
    'esri/IdentityManager',
    'dojo/domReady!'
    
  ],
  function(
    declare,
    Deferred,
    BaseWidgetSetting,
    _WidgetsInTemplateMixin,
    registry,
    lang,
    array,
    on,
    query,
    Message,
    LayerInfos,
    LoadingShelter,
    RadioBtn,
    Select,
    arcgisUtils,
    IdentityManager) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {

        baseClass: 'jimu-widget-themeSwitcher-setting',

        _groupID: null,

      postCreate: function() {
      },

      startup: function() {
        this.inherited(arguments);
        this.setConfig(this.config);
      },

      

      setConfig: function(config) {
        this.config = config;
        // Set the group ID
        if (this.config.groupID) {
            this.mapGroupID.set('value', this.config.groupID);
        }
        // Set the group access
        if (this.config.groupAccess) {
            this.groupAccessChoice.set('value', this.config.groupAccess);
        }
      },
      getConfig: function () {
          var me = this;
          // Get the group ID
          if (!this.mapGroupID.get('value')) {
              var popup = new Message({
                  message: this.nls.warning,
                  buttons: [{
                      label: this.nls.ok,
                      onClick: lang.hitch(this, function () {
                          popup.close();
                      })
                  }]
              });
              return false;
          }
          _groupID = this.mapGroupID.get('value');
          this.config.groupID = _groupID;

          // Get the group access
          this.config.groupAccess = this.groupAccessChoice.get('value');
          return this.config;
      },
      validateItemID: function (_groupID) {
          var me = this;
          var result = [];
          var groupMapItem = null;
          var deferred = new Deferred();
          if (_groupID) {


              arcgisUtils.getItem(_groupID).then(function (response) {
                  me._groupInfo = response;
                  deferred.resolve(response);

              }, function (error) {
                  var popup = new Message({
                      message: error.message,
                      buttons: [{
                          label: me.nls.ok,
                          onClick: lang.hitch(this, function () {
                              popup.close();
                          })
                      }]
                  });
                  console.log("Error: ", error.code, " Message: ", error.message);
                  deferred.reject();
                  return;
              });
          } else {

              deferred.reject();
          }
          return deferred.promise;
      },
    });
  });