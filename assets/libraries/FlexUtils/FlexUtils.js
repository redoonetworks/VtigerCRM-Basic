(function ($) {
"use strict";
var ScopeName = 'FlexSuite';
var Version = '2.4.0';
/**
 * FlexUtils V2.4.0
 * 2.4.0  - 25.07.2015
 *        - add createFileDrop function
 *        - add FlexForm component
 * 2.3.1  - 18.07.2018
 *        - Fixed setFieldValue for picklists in VT7
 * 2.3.0  - 12.07.2018
 *        - JSHint recommendations applied
 * 2.2.1  - 21.05.2018
 *        - add onQuickCreate from VT6
 * 2.2.0  - 26.04.2018
 *        - add FlexTranslate component
 * 2.1.3  - 02.03.2018
 *        - improve compatibility with old RedooUtils
 * 2.1.2  - 23.02.2018
 *        - add close callback to showModalBox
 * 2.1.1  - 09.02.2018
 *        - add initial local cache handler
 * 2.1.0  - 20.12.2017
 *        - Rename to FlexUtils
 *        - Add function showRecordInOverlay
 * 2.0.13 - 18.11.2017
 *        - Implement Exception Output in postAction / postView
 * 2.0.12 - 16.11.2017
 *        - add showModalBox replacement if already box is shown
 * 2.0.11 - 08.11.2017
 *        - add convertComponents parameter to refreshContent to convert select2
 * 2.0.10 - 04.11.2017
 *        - add showNotification
 *        - add Init console log
 * 2.0.09 - 31.10.2017
 *        - add getCurrentDateFormat function
 * 2.0.08 - 22.09.2017
 *        - add getContentMaxWidth / getContentMaxHeight functions
 * 2.0.07 - 13.08.2017
 *        - add getMainRecordId function
 *        - add getCurrentCustomViewId
 *        - add onListChange
 * 2.0.06 - 13.06.2017
 *        - getListFields fixed for VT6
 * 2.0.05 - 12.06.2017
 *        - first version build with TypeScript
 *        - fix getFieldElement on SummaryView
 *        - Fix issues reported from TypeScript
 * 2.0.04 - 11.16.2017
 *        - improve showModalBox Function
 *        - add hideModalBox Function
 *        - add FlexAjax.postSettingsView as wrapper for default function
 *        - add FlexAjax.postSettingsAction as wrapper for default function
 *        - add FlexUtils.refreshContent
 * 2.0.03 - add getCurrentLayout Function
 *        - add layoutDependValue Function
 *        - add BlockUI
 * 2.0.02 - add getQueryParams Function
 *        - Extend getMainModule by Query Params
 *        - Introduce RedooUtils Action on Server
 *        - add setFieldValue Function
 * 2.0.01 - VT7 Compatibility
 *        - add FlexUtils.onFieldChange method
 *        - add FlexUtils.onRelatedListChange method
 *        - add FlexUtils.isVT7 method
 *        - add FlexUtils.Signal Implementation
 *        - add global RedooEvents
 * 1.0.11 - Make postAction / postView settings flag optional
 *          Add wrong Ajax Response error output
 * 1.0.10 - Add getRecordLabels function
 * 1.0.9  - Add fillFieldSelect, loadStyles functions
 * 1.0.8  - Add returnInput Parameter to getFieldElement function
 * 1.0.7  - Add FlexUtils.loadScript
 *//*globals confirm:false */
var FlexAjax = {
    postAction: function (actionName, params, settings, dataType) {
        if (typeof params == 'undefined') {
            params = {};
        }
        params.module = ScopeName;
        params.action = actionName;
        if (typeof dataType == 'undefined' && typeof settings == 'string') {
            dataType = settings;
            settings = false;
        }
        if (typeof settings != 'undefined' && settings == true) {
            params.parent = 'Settings';
        }
        return FlexAjax.post('index.php', params, dataType);
    },
    postSettingsView: function (viewName, params, dataType) {
        return FlexAjax.postView(viewName, params, true, dataType);
    },
    postSettingsAction: function (actionName, params, dataType) {
        return FlexAjax.postAction(actionName, params, true, dataType);
    },
    postView: function (viewName, params, settings, dataType) {
        if (typeof params == 'undefined') {
            params = {};
        }
        params.module = ScopeName;
        params.view = viewName;
        if (typeof dataType == 'undefined' && typeof settings == 'string') {
            dataType = settings;
            settings = false;
        }
        if (typeof settings != 'undefined' && settings == true) {
            params.parent = 'Settings';
        }
        return FlexAjax.post('index.php', params, dataType);
    },
    /**
     *
     * @param url URL to call
     * @param params Object with POST parameters
     * @param dataType Single value of datatype if not set in params
     * @returns {*}
     */
    post: function (url, params, dataType) {
        var aDeferred = jQuery.Deferred();
        if (typeof url == 'object') {
            params = url;
            url = 'index.php';
        }
        if (typeof params == 'undefined') {
            params = {};
        }
        if (typeof dataType == 'undefined' && typeof params.dataType != 'undefined') {
            dataType = params.dataType;
        }
        var options = {
            url: url,
            data: params
        };
        if (typeof dataType != 'undefined') {
            options.dataType = dataType;
        }
        //options.dataType = undefined;
        options.dataType = 'text';
        options.type = 'POST';
        jQuery.ajax(options)
            .always(function (data) {
                if (typeof dataType != 'undefined' && dataType == 'json') {
                    try {
                        data = jQuery.parseJSON(data);
                    }
                    catch (e) {
                        FlexUtils.unblockUI();
                        console.error('FlexAjax Error - Should: JSON Response:');
                        console.log('Request: ', options);
                        console.log(data);
                        var height = 10;
                        jQuery('.RedooAjaxError').each(function (index, ele) {
                            height += jQuery(ele).height() + 30;
                        });
                        var id = 'error_' + (Math.floor(Math.random() * 1000000));
                        var content = data.substr(0, 500).replace(/</g, '&lt;').replace(/\\(.?)/g, function (s, n1) {
                            switch (n1) {
                                case '\\':
                                    return '\\';
                                case '0':
                                    return '\u0000';
                                case '':
                                    return '';
                                default:
                                    return n1;
                            }
                        });
                        if (data.length > 500) {
                            content += ' .....<em>shortened</em>....... ' + data.substr(-500).replace(/</g, '&lt;').replace(/\\(.?)/g, function (s, n1) {
                                switch (n1) {
                                    case '\\':
                                        return '\\';
                                    case '0':
                                        return '\u0000';
                                    case '':
                                        return '';
                                    default:
                                        return n1;
                                }
                            });
                        }
                        var html = '<div class="RedooAjaxError" style="word-wrap:break-word;position:fixed;bottom:' + height + 'px;box-sizing:border-box;left:10px;padding:10px;width:25%;background-color:#ffffff;z-index:90000;border:2px solid #C9331E;background-color:#D29D96;" id="' + id + '"><i class="icon-ban-circle" style="margin-top:2px;margin-right:5px;"></i><span style="color:#C9331E;font-weight:bold;">ERROR:</span> ' + e + '<br/><span style="color:#C9331E;font-weight:bold;">Response:</span>' + content + '</div>';
                        jQuery('body').append(html);
                        jQuery('#' + id).on('click', function () {
                            jQuery(this).fadeOut('fast', function () {
                                jQuery(this).remove();
                            });
                        });
                        /*
                         window.setTimeout(function() {
                         jQuery('#' + id).hide(function() {
                         jQuery(this).remove();
                         })
                         });
                         */
                        //app.showModalWindow(response);
                        return;
                    }
                }
                if (typeof data.success != 'undefined') {
                    if (data.success == false && (data.error.code.indexOf('request') != -1)) {
                        if (confirm('Request Error. Reload of Page is required.')) {
                            window.location.reload();
                        }

                        FlexUtils.showNotification(data.error.message, false);
                        return;
                    }
                }
                aDeferred.resolve(data);
                //callback(data)
            });
        return aDeferred.promise();
    },
    get: function (url, params, dataType) {
        console.error('Vtiger do not support GET Requests');
        return;
    },
    /**
     * Drop In Replacement for AppConnector.request
     *
     * @param params object
     * @returns {*}
     */
    request: function (params) {
        return FlexAjax.post('index.php', params);
    }
};var FlexCache = {
    get: function (key, defaultValue) {
        if (typeof _FlexCache[key] != 'undefined') {
            return _FlexCache[key];
        }
        return defaultValue;
    },
    set: function (key, value) {
        _FlexCache[key] = value;
    }
};
var FlexForm = {
    getInstance:function(params) {
        var FlexFormObj = function(parmeters) {
            this.parameters = parameters;
            this.fields = [];

            this.addField = function(label, name, type, value, options) {
                var field = new FlexFormField(name, type, label);
                field.setOptions(options);
                field.setValue(value);

                this.fields.push(field);
            };

            this.renderInModal = function(widthPx, headline, successText, cancelText) {
                var html = '';
                html += '<div class="modal-dialog modelContainer" style="width:' + widthPx + 'px;">';

                // Header
                html += '<div class="modal-header"><div class="clearfix"><div class="pull-right"><button type="button" class="close" aria-label="Close" data-dismiss="modal"><span aria-hidden="true" class="fa fa-close"></span></button></div><h4 class="pull-left">' + headline + '</h4></div></div>';

                html += '<div class="row" style="padding:10px;">';

                html += 'HALLO WELT';
                html += '</div>';
                // Footer
                html += '<div class="modal-footer "><center><button class="btn btn-success" type="submit" name="saveButton"><strong>' + successText + '</strong></button><a href="#" class="cancelLink" type="reset" data-dismiss="modal">' + cancelText + '</a></center></div>';

                html += '</div>';


            };
        };

        var FlexFormField = function(field_name, field_type, field_label) {
            var field_options = {};
            var field_value = null;
            var rendered = false;

            var typedata = FlexForm.getType(field_type);
            var fieldclass = 'c' + Math.round(Math.random() * 100000) + Math.round(Math.random() * 100000);

            this.setOptions = function(options) {
                field_options = options;
            };

            this.setValue = function(value) {
                field_value = value;

                if(rendered === true) {
                    typedata.setter(field_value);
                }
            };

            this.render = function() {
                var html = 'render ' + field_type;

                console.log('render ' + field_type);

                rendered = true;
                return html;
            };
        };

        return new FlexFormObj(params);
    },

    registerType:function(type, renderFunction, validateFunction, getterFunction, setterFunction, options) {
        FlexForm._types[type] = {
            'render': renderFunction,
            'validate': validateFunction,
            'setter': getterFunction,
            'getter': setterFunction
        };
    },
    getType:function(type) {
        if(typeof FlexForm._types[type] === 'undefined') {
            throw "[" + ScopeName +"] FlexForm: " + type + " is undefined";
        }

        return FlexForm._types[type];
    },
    _types:{
        'text' : {
            'options': {
                'selfdecorate': false,
            },
            'render': function() {
                return '<input type="text" class="inputEle input-fullwidth ' + fieldclass + '" value="' + field_value + '" />';
            },
            'validate': function(value) {
                return true;
            },
            'getter': function() {
                return container.find('.' + fieldclass).val();
            },
            'setter': function(value) {
                container.find('.' + fieldclass).val(value);
            }
        }
    }
};var FlexTranslate = {
    init:function(language, translations) {
        FlexCache.set('__translations_'  + language, translations);
    },
    getTranslator:function() {
        return function(string) {
            return FlexTranslate.__(string);
        };
    },
    __:function(string) {
        var language = app.getUserLanguage();
        var translations = FlexCache.get('__translations_'  + language, {});

        if(typeof translations === 'function') {
            FlexTranslate.init(language, translations());
            return FlexTranslate.__(string);
        }

        if(typeof translations[string] !== 'undefined') {
            return translations[string];
        }

        return string;
    }
};
/*globals Vtiger_Edit_Js:false,Vtiger_Detail_Js:false,Vtiger_Popup_Js:false */

var FlexUtils = {
    layout: null,
    currentLVRow: null,
    listViewFields: false,
    isVT7: function () {
        return typeof app.helper !== 'undefined';
    },
    createFileDrop: function(options) {
        if(typeof options === 'undefined') {
            options = {};
        }
        if(typeof options.hovertext === 'undefined') {
            options.hovertext = 'Drop File';
        }
        if(typeof options.container === 'undefined') {
            options.container = 'body';
        }
        if(typeof options.container === 'undefined') {
            options.container = 'body';
        }
        if(typeof options.data === 'undefined') {
            options.data = {};
        }

        if($(options.container).prop('tagName') !== 'BODY' && $(options.container).css('position') == 'static') {
            $(options.container).css('position', 'relative');
        }
        $(options.container).addClass('RegisteredFileDrop');
        var containerHeight = $(options.container).height();

        if(typeof options.url === 'undefined') {
            if(typeof options.action === 'undefined') {
                throw 'URL or action is mandatory for FileDrop Component';
            } else {
                options.url = 'index.php?module=' + ScopeName + '&action=' + options.action;

                if(typeof options.settings !== 'undefined' && options.settings === true) {
                    options.url += '&parent=Settings';
                }
            }
        }

        if($('style#FlexFileDropStyles').length === 0) {
            var fontSize = 20;
            var showIcon = true;
            var positionText = '40%';
            if(containerHeight < 200) {
                fontSize = 12;
                showIcon = false;
                positionText = '10%';
            }

            var html = '<style type="text/css" id="FlexFileDropStyles">div.FlexFileDropOverlay {\n' +
                '  position: absolute;\n' +
                '  top: 0;\n' +
                '  left: 0;\n' +
                '  height: 100%;\n' +
                '  width: 100%;\n' +
                '  z-index: 2000;\n' +
                '  background-color: rgba(0, 0, 0, 0.7);\n' +
                '  color: #ffffff;\n' +
                '  font-weight: bold;\n' +
                '  letter-spacing: 1px;\n' +
                '  text-transform: uppercase;\n' +
                '  font-size: ' + fontSize + 'px;\n' +
                '   overflow:hidden; ' +
                '  text-align: center;\n' +
                '  font-family: "Arial Black", Gadget, sans-serif;\n' +
                '}\n' +
                'div.FlexFileDropOverlay * {\n' +
                '  pointer-events: none;\n' +
                '}\n' +
                'div.FlexFileDropOverlay span#uploadHint {\n' +
                '  position: relative;\n' +
                '  top: '+positionText+';\n' +
                '}\n' +
                'div.FlexFileDropOverlay span#uploadHint i {\n' +
                (showIcon == false? 'display:none;' : '') +
                '  font-size: 64px;\n' +
                '  margin-bottom: 30px;\n' +
                '}</style>';
            $('head').append(html);
        }

        if($('.FlexFileDropOverlay', options.container).length === 0) {
            var html = '<div class="FlexFileDropOverlay" style="display:none;"><span id="uploadHint"><i class="fa fa-upload" aria-hidden="true"></i><br>' + options.hovertext + '</span></div>';
            $(options.container).append(html);
        }

        var Overlay = $('.FlexFileDropOverlay', options.container);

        $(options.container).on('dragenter', $.proxy(function (e) {
            e.stopPropagation();
            e.preventDefault();
        }, this));

        $(options.container).on('dragover', $.proxy(function (e) {
            e.stopPropagation();
            e.preventDefault();
        }, this));
        $(options.container).on('drop', $.proxy(function (e) {
            e.stopPropagation();
            e.preventDefault();
        }, this));

        var aSignal = new FlexUtils.Signal();

        $(options.container).append('<input type="file" style="display:none;" class="fileselector" />');
        $(options.container).find('.fileselector').on('change', function(e) {
            var target = $(e.currentTarget);

            if(target.prop('files').length > 0) {
                uploadFile(target.prop('files')[0]);
            }
        });
        $(options.container).find('.fileselector').on('click', function(e) {
            e.stopPropagation();
        });

        $(options.container).on('click', function() {
            $(options.container).find('.fileselector').trigger('click');
        });

        var DragContainer = $(options.container);
        DragContainer.on('dragenter', function (e) {
            Overlay.fadeIn('fast');
        } );
        Overlay.on('dragleave', function (e) {
            Overlay.fadeOut('fast');
        });

        function uploadFile(file) {
            var fd = new FormData();
            fd.append('file', file);

            var uploadURL = options.url;
            var extraData = options.data;

            $.each(options.data, function(key, value) {
                fd.append(key, value);
            });

            var jqXHR = jQuery.ajax({
                url: uploadURL,
                type: "POST",
                contentType:false,
                processData: false,
                cache: false,
                data: fd,
                success: function(data){
                    aSignal.dispatch(data);
                }
            });
        }

        Overlay.on('drop', function (e) {
            e.preventDefault();
            e.stopPropagation();

            Overlay.fadeOut('fast');

            var fileList = e.originalEvent.dataTransfer.files;

            $.each(fileList, jQuery.proxy(function(index, file) {
                uploadFile(file);
            }, this));
        });

        return aSignal;
    },
    showRecordInOverlay:function(setype, crmid) {
        window.open('index.php?module=' + setype + '&view=Detail&record=' + crmid);
    },
    showNotification:function(message, isSuccess, options) {
        if(typeof isSuccess == 'undefined') {
            isSuccess = true;
        }
        if(typeof options == 'undefined') {
            options = {};
        }

        if(FlexUtils.isVT7()) {
            options.message = message;

            if(isSuccess === true) {
                app.helper.showSuccessNotification(options);
            } else {
                app.helper.showErrorNotification(options);
            }
        }
    },
    cacheSet:function(key, value) {
        if(FlexUtils.isVT7()) {
            return app.storage.set(key, value);
        }
    },
    cacheGet:function(key, defaultValue) {
        if(FlexUtils.isVT7()) {
            return app.storage.get(key, defaultValue);
        }
    },
    cacheClear:function(key) {
        if(FlexUtils.isVT7()) {
            return app.storage.clear(key);
        }
    },
    cacheFlush:function() {
        if(FlexUtils.isVT7()) {
            return app.storage.flush();
        }
    },
    getCurrentDateFormat:function(type) {
        type = type.toLowerCase();
        if(FlexCache.get('__CurrentDateFormat_' + type, false) !== false) {
            return FlexCache.get('__CurrentDateFormat_' + type, false);
        }

        var replacement = {};

        switch(type) {
            case 'php':
                replacement = {
                    'yyyy' : '%Y',
                    'yy' : '%y',
                    'dd' : '%d',
                    'mm' : '%m'
                };
                break;
            case 'moment':
                replacement = {
                    'yyyy' : 'YYYY',
                    'yy' : 'YY',
                    'dd' : 'DD',
                    'mm' : 'MM'
                };
                break;
        }

        var currentFormat;

        if(FlexUtils.isVT7()) {
            currentFormat = app.getDateFormat();
        }

        $.each(replacement, function(oldPart, newPart) {
            currentFormat = currentFormat.replace(oldPart, newPart);
        });

        FlexCache.set('__CurrentDateFormat_' + type, currentFormat);

        return currentFormat;
    },
    getCurrentCustomViewId: function() {
        if(FlexUtils.isVT7() === true) {
            return $('input[name="cvid"]').val();
        } else {
            return jQuery('#customFilter').val();
        }
    },
    selectRecordPopup: function (params, multiple) {
        var aDeferred = jQuery.Deferred();
        var popupInstance = Vtiger_Popup_Js.getInstance();

        if (FlexUtils.isVT7()) {
            if(typeof params == 'string') {
                params = {
                    'module':params,
                    'view':'Popup',
                    'src_module':'Emails', //                            module=Documents&view=&src_module=Emails&src_field=testfield&multi_select=1
                    'src_field':'testfield'
                };
            }
            if(typeof multiple != 'undefined' && multiple === true) {
                params.multi_select = 1;
            }

            app.event.off('FlexUtils.SelectRecord');
            app.event.one('FlexUtils.SelectRecord', function (e, data) {
                aDeferred.resolveWith(window, [jQuery.parseJSON(data)]);
            });


            popupInstance.showPopup(params, 'FlexUtils.SelectRecord', function (data2) { /* Callback when visible **/ });
        }
        else {
            if(typeof params == 'string') {
                params = {
                    'module':params,
                    'view':'Popup',
                    'src_module':'Emails', //                            module=Documents&view=&src_module=Emails&src_field=testfield&multi_select=1
                    'src_field':'testfield'
                };
            }
            if(typeof multiple != 'undefined' && multiple === true) {
                params.multi_select = 1;
            }

            popupInstance.show(params, function (data) {
                aDeferred.resolveWith(data);
            });
        }

        return aDeferred.promise();
    },
    getCurrentLayout: function () {
        if (FlexUtils.layout !== null) {
            return FlexUtils.layout;
        }
        var skinpath = jQuery('body').data('skinpath');
        var matches = skinpath.match(/layouts\/([^/]+)/);
        if (matches.length >= 2) {
            FlexUtils.layout = matches[1];
            return matches[1];
        }
        FlexUtils.layout = 'vlayout';
        return 'vlayout';
    },
    getQueryParams: function (paramName) {
        var sURL = window.document.URL.toString();
        if (sURL.indexOf("?") > 0) {
            var arrParams = sURL.split("?");
            var arrURLParams = arrParams[1].split("&");
            var arrParamNames = new Array(arrURLParams.length);
            var arrParamValues = new Array(arrURLParams.length);
            var i = 0;
            for (i = 0; i < arrURLParams.length; i++) {
                var sParam = arrURLParams[i].split("=");
                arrParamNames[i] = sParam[0];
                if (sParam[1] != "") {
                    arrParamValues[i] = decodeURI(sParam[1]);
                } else {
                    arrParamValues[i] = "No Value";
                }
            }
            for (i = 0; i < arrURLParams.length; i++) {
                if (arrParamNames[i] == paramName) {
                    //alert("Parameter:" + arrParamValues[i]);
                    return arrParamValues[i];
                }
            }
        }
        return false;
    },
    onListChange: function() {
        if (FlexCache.get('__onListChangeSignal', false) == false) {
            var aSignal = new FlexUtils.Signal();
            app.event.on("post.listViewFilter.click", function (e, container) {
                aSignal.dispatch(container);
            });
            FlexCache.set('__onListChangeSignal', aSignal);
        }
        return FlexCache.get('__onListChangeSignal');
    },
    onRelatedListChange: function () {
        if (FlexCache.get('__onRelatedListChangeSignal', false) == false) {
            var aSignal = new FlexUtils.Signal();
            app.event.on("post.relatedListLoad.click", function (e, container) {
                aSignal.dispatch(container);
            });
            FlexCache.set('__onRelatedListChangeSignal', aSignal);
        }
        return FlexCache.get('__onRelatedListChangeSignal');
    },
    UUIDCounter: 1,
    FieldChangeEventInit: false,
    // Will register an event, when a field is changed
    onFieldChange: function (parentEle) {
        if(typeof parentEle === 'undefined') {
            parentEle = 'div#page';
        }

        // Only register one signal for FieldChanges
        if (jQuery(parentEle).data('fielduid') === undefined) {
            jQuery(parentEle).data('fielduid', 'parentEle' + FlexUtils.UUIDCounter);
            FlexUtils.UUIDCounter++;
        }
        var Fielduid = jQuery(parentEle).data('fielduid');
        jQuery(parentEle).addClass('RedooFieldChangeTracker');
        var aSignal;
        if (FlexCache.get('__onFieldChangeSignal' + Fielduid, false) == false) {
            aSignal = new FlexUtils.Signal();
            if (FlexUtils.isVT7()) {
                if (FlexUtils.FieldChangeEventInit === false) {
                    if(typeof Vtiger_Detail_Js !== 'undefined') {
                        app.event.on(Vtiger_Detail_Js.PostAjaxSaveEvent, function (e, fieldBasicData, postSaveRecordDetails, contentHolder) {
                            var fieldElement = fieldBasicData.closest('.RedooFieldChangeTracker');
                            var Fielduid = fieldElement.data('fielduid');
                            aSignal = FlexCache.get('__onFieldChangeSignal' + Fielduid);
                            aSignal.dispatch({
                                name: fieldBasicData.data('name'),
                                "new": postSaveRecordDetails[fieldBasicData.data('name')].value
                            }, fieldBasicData, postSaveRecordDetails, contentHolder);
                        });
                        FlexUtils.FieldChangeEventInit = true;
                    }
                }
            }
            else {
                if(FlexUtils.getViewMode() !== "listview" && typeof Vtiger_Detail_Js !== "undefined") {
                    var thisInstance = Vtiger_Detail_Js.getInstance();
                    var detailContentsHolder = thisInstance.getContentHolder();
                    detailContentsHolder.on(thisInstance.fieldUpdatedEvent, function(e, values) {
                        var target = $(e.target);
                        var fieldName = target.attr('name');
                        var fieldElement = target.closest('.RedooFieldChangeTracker');
                        var Fielduid = fieldElement.data('fielduid');

                        aSignal = FlexCache.get('__onFieldChangeSignal' + Fielduid);
                        aSignal.dispatch({
                            name: fieldName,
                            "new": values.new
                        }, values, {}, detailContentsHolder);

                    });
                }

            }
            FlexCache.set('__onFieldChangeSignal' + Fielduid, aSignal);
        }
        else {
            aSignal = FlexCache.get('__onFieldChangeSignal' + Fielduid);
        }
        return FlexCache.get('__onFieldChangeSignal' + Fielduid);
    },
    getRecordLabels: function (ids) {
        var aDeferred = jQuery.Deferred();
        var newIds = [];
        var LabelCache = FlexCache.get('LabelCache', {});
        jQuery.each(ids, function (index, value) {
            if (typeof LabelCache[value] == 'undefined') {
                newIds.push(value);
            }
        });
        if (newIds.length > 0) {
            FlexAjax.postAction('RecordLabel', {
                ids: newIds,
                'dataType': 'json'
            }).then(function (response) {
                jQuery.each(response.result, function (id, value) {
                    LabelCache[id] = value;
                });
                FlexCache.set('LabelCache', LabelCache);
                aDeferred.resolveWith({}, [LabelCache]);
            });
        }
        else {
            aDeferred.resolveWith({}, [LabelCache]);
        }
        return aDeferred.promise();
    },
    getFieldList: function (moduleName) {
        var aDeferred = jQuery.Deferred();
        if (typeof _FlexCache.FieldLoadQueue[moduleName] != 'undefined') {
            return _FlexCache.FieldLoadQueue[moduleName];
        }
        _FlexCache.FieldLoadQueue[moduleName] = aDeferred;
        if (typeof _FlexCache.FieldCache[moduleName] != 'undefined') {
            aDeferred.resolve(_FlexCache.FieldCache[moduleName]);
            return aDeferred.promise();
        }
        FlexAjax.post('index.php', {
            'module': ScopeName,
            'mode': 'GetFieldList',
            'action': 'RedooUtils',
            'module_name': moduleName
        }, 'json').then(function (data) {
            _FlexCache.FieldCache[moduleName] = data;
            aDeferred.resolve(data.fields);
        });
        return aDeferred.promise();
    },
    filterFieldListByFieldtype: function (fields, fieldtype) {
        var result = {};
        jQuery.each(fields, function (blockLabel, fields) {
            var block = [];
            jQuery.each(fields, function (fieldName, fieldData) {
                if (fieldData.type == fieldtype) {
                    block.push(fieldData);
                }
            });
            if (block.length > 0) {
                result[blockLabel] = block;
            }
        });
        return result;
    },
    fillFieldSelect: function (fieldId, selected, module, fieldtype) {
        if (typeof fieldtype == 'undefined') {
            fieldtype = '';
        }
        if (typeof module == 'undefined') {
            module = moduleName;
        }
        if (typeof selected == 'string') {
            selected = [selected];
        }

        FlexUtils.getFieldList(module, fieldtype).then(function (fields) {
            if (fieldtype != '') {
                fields = FlexUtils.filterFieldListByFieldtype(fields, fieldtype);
            }
            var html = '';
            jQuery.each(fields, function (blockLabel, fields) {
                html += '<optgroup label="' + blockLabel + '">';
                jQuery.each(fields, function (index, field) {
                    html += '<option value="' + field.name + '" ' + (jQuery.inArray(field.name, selected) != -1 ? 'selected="selected"' : '') + '>' + field.label + '</option>';
                });
                html += '</optgroup>';
                jQuery('#' + fieldId).html(html);
                if (jQuery('#' + fieldId).hasClass('select2')) {
                    jQuery('#' + fieldId).select2('val', selected);
                }
                jQuery('#' + fieldId).trigger('FieldsLoaded');
            });
        });
    },
    _getDefaultParentEle: function () {
        return 'div#page';
    },
    getMainModule: function (parentEle) {
        if (FlexUtils.isVT7()) {
            return FlexUtils._getMainModuleVT7(parentEle);
        }
        else {
            return FlexUtils._getMainModuleVT6(parentEle);
        }
    },
    _getMainModuleVT6: function (parentEle) {
        if (typeof parentEle == 'undefined') {
            parentEle = FlexUtils._getDefaultParentEle();
        }
        var viewMode = FlexUtils.getViewMode(parentEle);
        if (viewMode == 'detailview' || viewMode == 'summaryview') {
            return $('#module', parentEle).val();
        }
        else if (viewMode == 'editview' || viewMode == 'quickcreate') {
            return $('[name="module"]', parentEle).val();
        }
        else if (viewMode == 'listview') {
            return $('#module', parentEle).val();
        }
        else if (viewMode == 'relatedview') {
            if ($('[name="relatedModuleName"]', parentEle).length > 0) {
                return $('[name="relatedModuleName"]', parentEle).val();
            }
            if ($('#module', parentEle).length > 0) {
                return $('#module', parentEle).val();
            }
        }
        var QueryModule = FlexUtils.getQueryParams('module');
        if (QueryModule !== false) {
            return QueryModule;
        }
        return '';
    },
    _getMainModuleVT7: function (parentEle) {
        if (typeof parentEle == 'undefined') {
            parentEle = FlexUtils._getDefaultParentEle();
        }
        var viewMode = FlexUtils.getViewMode(parentEle);
        if ($(parentEle).data('forcerecordmodule') !== undefined) {
            return $(parentEle).data('forcerecordmodule');
        }
        if (parentEle != '#overlayPageContent.in' && $('#overlayPageContent.in').length > 0) {
            return FlexUtils._getMainModuleVT7('#overlayPageContent.in');
        }
        if (typeof _META != 'undefined' &&
            (viewMode == 'detailview' ||
                viewMode == 'summaryview' ||
                viewMode == 'commentview' ||
                viewMode == 'historyview' ||
                viewMode == 'editview' ||
                viewMode == 'listview') &&
            ($(parentEle).hasClass('modal') == false)) {
            return _META.module;
        }
        else {
            if (viewMode == 'detailview' || viewMode == 'summaryview') {
                return $('#module', parentEle).val();
            }
            else if (viewMode == 'editview' || viewMode == 'quickcreate') {
                if ($('#module', parentEle).length > 0) {
                    return $('#module', parentEle).val();
                }
                else {
                    return $('[name="module"]', parentEle).val();
                }
            }
            else if (viewMode == 'listview') {
                return $('#module', parentEle).val();
            }
            else if (viewMode == 'relatedview') {
                if ($('[name="relatedModuleName"]', parentEle).length > 0) {
                    return $('[name="relatedModuleName"]', parentEle).val();
                }
                if ($('#module', parentEle).length > 0) {
                    return $('#module', parentEle).val();
                }
            }
        }
        var QueryModule = FlexUtils.getQueryParams('module');
        if (QueryModule !== false) {
            return QueryModule;
        }
        return '';
    },
    getMainRecordId: function () {
        var parentEle = 'div#page';

        if (typeof parentEle == 'undefined') {
            parentEle = FlexUtils._getDefaultParentEle();
        }

        var recordId = false;
        var viewMode = FlexUtils.getViewMode(parentEle);

        // if (viewMode == 'detailview' || viewMode == 'summaryview') {
        recordId= $('#recordId', parentEle).val();
        // }

        return recordId;
    },
    getRecordIds: function (parentEle) {
        if (typeof parentEle == 'undefined') {
            parentEle = FlexUtils._getDefaultParentEle();
        }
        var recordIds = [];
        var viewMode = FlexUtils.getViewMode(parentEle);
        if (viewMode == 'detailview' || viewMode == 'summaryview') {
            recordIds.push($('#recordId', parentEle).val());
        }
        else if (viewMode == 'quickcreate') {
            // do nothing
        }
        else if (viewMode == 'editview') {
            recordIds.push($('[name="record"]').val());
        }
        else if (viewMode == 'listview') {
            $('.listViewEntries').each(function (index, value) {
                recordIds.push($(value).data('id'));
            });
        }
        else if (viewMode == 'relatedview') {
            $('.listViewEntries').each(function (index, value) {
                recordIds.push($(value).data('id'));
            });
        }
        return recordIds;
    },
    onQuickCreate: function(callback) {
        jQuery('.quickCreateModule, .addButton[data-url*="QuickCreate"]').on('click', function __checkQC() {
            if (jQuery('.quickCreateContent', '.modelContainer').length == 0) {
                window.setTimeout(__checkQC, 200);
            } else {
                var form = jQuery('.modelContainer');
                console.log('onQuickCreate Done');

                callback(form.find('input[name="module"]').val(), form);
            }
        });
    },
    getViewMode: function (parentEle) {
        if (FlexUtils.isVT7()) {
            return FlexUtils._getViewModeVT7(parentEle);
        }
        else {
            return FlexUtils._getViewModeVT6(parentEle);
        }
    },
    _getViewModeVT6: function (parentEle) {
        if (typeof parentEle == 'undefined') {
            parentEle = FlexUtils._getDefaultParentEle();
        }
        var viewEle = $("#view", parentEle);
        _FlexCache.viewMode = false;
        if (viewEle.length > 0 && viewEle[0].value == "List") {
            _FlexCache.viewMode = "listview";
        }
        if ($(".detailview-table", parentEle).length > 0) {
            _FlexCache.viewMode = "detailview";
        }
        else if ($(".summaryView", parentEle).length > 0) {
            _FlexCache.viewMode = "summaryview";
        }
        else if ($(".recordEditView", parentEle).length > 0) {
            if ($('.quickCreateContent', parentEle).length == 0) {
                _FlexCache.viewMode = "editview";
            }
            else {
                _FlexCache.viewMode = "quickcreate";
            }
        }
        if ($('.relatedContents', parentEle).length > 0) {
            _FlexCache.viewMode = "relatedview";
            if ($('td[data-field-type]', parentEle).length > 0) {
                _FlexCache.popUp = false;
            }
            else {
                _FlexCache.popUp = true;
            }
        }
        if (_FlexCache.viewMode === false) {
            if ($('#view', parentEle).length > 0) {
                if ($('#view', parentEle).val() == 'Detail') {
                    _FlexCache.viewMode = 'detailview';
                }
            }
        }
        return _FlexCache.viewMode;
    },
    _getViewModeVT7: function (parentEle) {
        if (typeof parentEle == 'undefined') {
            parentEle = FlexUtils._getDefaultParentEle();
        }
        _FlexCache.viewMode = false;
        if ($(".detailview-table", parentEle).length > 0) {
            _FlexCache.viewMode = "detailview";
        }
        else if ($(".summaryView", parentEle).length > 0) {
            _FlexCache.viewMode = "summaryview";
        }
        else if ($(".recordEditView", parentEle).length > 0) {
            if ($('.quickCreateContent', parentEle).length == 0) {
                _FlexCache.viewMode = "editview";
            }
            else {
                _FlexCache.viewMode = "quickcreate";
            }
        }
        else if ($(".commentsRelatedContainer", parentEle).length > 0) {
            _FlexCache.viewMode = "commentview";
        }
        else if ($(".HistoryContainer", parentEle).length > 0) {
            _FlexCache.viewMode = "historyview";
        }
        else if (jQuery('.relatedContainer', parentEle).find('.relatedModuleName').length > 0) {
            _FlexCache.viewMode = "relatedview";
        }
        else if (jQuery('.listViewContentHeader', parentEle).length > 0 && typeof _META != 'undefined' && _META.view == 'List') {
            _FlexCache.viewMode = "listview";
        }
        if (_FlexCache.viewMode === false) {
            if ($('#view', parentEle).length > 0) {
                if ($('#view', parentEle).val() == 'Detail') {
                    _FlexCache.viewMode = 'detailview';
                }
            }
        }
        return _FlexCache.viewMode;
    },
    getContentMaxHeight: function() {
        if(FlexUtils.isVT7() == false) {
            switch(FlexUtils.getCurrentLayout()) {
                case 'begbie':
                    return jQuery('.mainContainer').height();
                default:
                    return jQuery('#leftPanel').height() - 50;
            }

        } else {
            return jQuery('#page').height();
        }
    },
    getContentMaxWidth: function() {
        if(FlexUtils.isVT7() == false) {
            return jQuery('#rightPanel').width();
        }
    },
    hideModalBox: function (content) {
        if (FlexUtils.isVT7() === true) {
            app.helper.hideModal();
        }
        else {
            app.hideModalWindow();
        }
    },
    showModalBox: function (content,params) {
        var aDeferred = jQuery.Deferred();
        if (FlexUtils.isVT7() === false) {
            app.showModalWindow(content, function (data) {
                aDeferred.resolveWith(window, data);
            });
        } else {
            if(typeof params == 'undefined') {
                params = { close:function() { }};
            }
            if(typeof params.close == 'undefined') {
                params.close = function() { };
            }

            FlexCache.set('__onModalClose', params.close);

            if(jQuery('.myModal .modal-dialog').length > 0 && jQuery('.modal.in').length > 0) {

                jQuery('.myModal .modal-dialog').replaceWith(content);
                aDeferred.resolveWith(window, jQuery('.modal.myModal')[0]);

            } else {

                var container = app.helper.showModal(content, {
                    cb: function (data) {
                        aDeferred.resolveWith(window, data);
                    }
                });
                container.off('hidden.bs.modal').on('hidden.bs.modal', function() {
                    params.close();
                });
            }

        }
        return aDeferred.promise();
    },
    showContentOverlay: function(data, params) {
        if(FlexUtils.isVT7()) {
            return app.helper.loadPageContentOverlay(data, params);
        } else {
            if($('#overlayPageContent').length == 0) {
                $('body').append('<div id=\'overlayPageContent\' style="margin:0;" class=\'fade modal content-area overlayPageContent overlay-container-60\' tabindex=\'-1\' role=\'dialog\' aria-hidden=\'true\'>\n' +
                    '        <div class="data">\n' +
                    '        </div>\n' +
                    '        <div class="modal-dialog">\n' +
                    '        </div>\n' +
                    '    </div>');
            }

            var aDeferred = new jQuery.Deferred();
            var defaultParams = {
                backdrop:true,
                show:true,
                keyboard: false
            };
            params = jQuery.extend(defaultParams, params);

            var overlayPageContent = $('#overlayPageContent');

            //if(jQuery(".content-area").length && jQuery(".content-area").hasClass('full-width')|| (jQuery('.settingsgroup').length === 0 && jQuery('#modules-menu').length === 0)){
            overlayPageContent.addClass('full-width');
            //}
            var alreadyShown = false;
            if(overlayPageContent.hasClass('in')) {
                alreadyShown = true;
            }
            overlayPageContent.one('shown.bs.modal',function(){
                aDeferred.resolve($('#overlayPageContent'));
            });

            overlayPageContent.one('hidden.bs.modal',function(){
                overlayPageContent.find('.data').html('');
            });

            overlayPageContent.find('.data').html(data);
            //vtUtils.applyFieldElementsView(overlayPageContent);
            overlayPageContent.modal(params);

            if(alreadyShown) {
                aDeferred.resolve(jQuery('#overlayPageContent'));
            }

            return aDeferred.promise();

        }
    },
    hideContentOverlay: function() {
        if(FlexUtils.isVT7()) {
            app.helper.hidePageContentOverlay();
        } else {
            var aDeferred = new jQuery.Deferred();
            var overlayPageContent = $('#overlayPageContent');
            overlayPageContent.one('hidden.bs.modal', function() {
                overlayPageContent.find('.data').html('');
                aDeferred.resolve();
            });
            $('#overlayPageContent').modal('hide');
            return aDeferred.promise();
        }
    },
    setFieldValue: function (fieldName, fieldValue, parentEle) {
        if (typeof parentEle == 'undefined' || parentEle == null) {
            parentEle = FlexUtils._getDefaultParentEle();
        }
        var fieldElement = FlexUtils.getFieldElement(fieldName, parentEle, true);
        switch (fieldElement.prop('tagName')) {
            case 'INPUT':
                switch (fieldElement.attr('type')) {
                    case 'text':
                        if (fieldElement.hasClass('dateField')) {
                            if(FlexUtils.isVT7()) {
                                fieldElement.datepicker('update', fieldValue);
                            } else {
                                if(fieldValue !== '') {
                                    fieldElement.val(fieldValue).DatePickerSetDate(fieldValue, true);
                                } else {
                                    fieldElement.val(fieldValue).DatePickerClear();
                                }
                            }
                        }
                        else {
                            fieldElement.val(fieldValue);
                        }
                        break;
                    case 'hidden':
                        if (fieldElement.hasClass('sourceField')) {
                            var obj = Vtiger_Edit_Js.getInstance();
                            var container = fieldElement.closest('td');
                            if (fieldValue.id != '') {
                                obj.setReferenceFieldValue(container, { id: fieldValue.id, name: fieldValue.label });
                            }
                            else {
                                $('.clearReferenceSelection', container).trigger('click');
                            }
                        }
                        break;
                }
                break;
            case 'SELECT':
                fieldElement.val(fieldValue);
                if(FlexUtils.isVT7() === false) {
                    if (fieldElement.hasClass('chzn-select')) {
                        fieldElement.trigger('liszt:updated');
                    }
                } else {
                    if (fieldElement.hasClass('select2')) {
                        fieldElement.trigger('change.select2');
                    }
                }
                break;
        }
    },
    layoutDependValue: function (value, defaultValue) {
        var currentLayout = FlexUtils.getCurrentLayout();
        if (typeof value[currentLayout] !== 'undefined') {
            return value[currentLayout];
        }
        return defaultValue;
    },
    getFieldElement: function (fieldName, parentEle, returnInput) {
        if (typeof parentEle == 'undefined' || parentEle == null) {
            parentEle = FlexUtils._getDefaultParentEle();
        }
        if (typeof returnInput == 'undefined') {
            returnInput = false;
        }
        if (typeof fieldName == "object") {
            return fieldName;
        }
        var fieldElement = false;
        if (FlexUtils.getViewMode(parentEle) == "detailview") {
            if ($('#' + FlexUtils.getMainModule(parentEle) + '_detailView_fieldValue_' + fieldName, parentEle).length > 0 || $('#Events_detailView_fieldValue_' + fieldName, parentEle).length > 0) {
                fieldElement = $('#' + FlexUtils.getMainModule(parentEle) + '_detailView_fieldValue_' + fieldName);
                if (FlexUtils.getMainModule(parentEle) == 'Calendar' && fieldElement.length == 0) {
                    fieldElement = $('#Events_detailView_fieldValue_' + fieldName, parentEle);
                }
            }
            else if ($('#_detailView_fieldValue_' + fieldName, parentEle).length > 0) {
                fieldElement = $('#_detailView_fieldValue_' + fieldName, parentEle);
            }
        }
        else if (FlexUtils.getViewMode(parentEle) == "summaryview") {
            var ele_1;
            if (FlexUtils.isVT7()) {
                ele_1 = jQuery('[data-name="' + fieldName + '"]', this.parentEle);
            }
            else {
                ele_1 = jQuery('[name="' + fieldName + '"]', this.parentEle);
            }
            if (ele_1.length == 0) {
                return false;
                /*
                 if(typeof this.summaryFields[fieldName] != 'undefined') {
                 fieldElement = jQuery(jQuery(FlexUtils.getCurrentLayout() == 'vlayout' ? '.summary-table td.fieldValue' : '.summary-table div.mycdivfield')[this.summaryFields[fieldName] - 1]);
                 } else {
                 return false;
                 }*/
            }
            else {
                fieldElement = $(ele_1[0]).closest(FlexUtils.layoutDependValue({
                    'vlayout': 'td',
                    'v7': '.row',
                    'begbie': 'div.mycdivfield'
                }, 'td'));
            }
        }
        else if (FlexUtils.getViewMode(parentEle) == "editview" || FlexUtils.getViewMode(parentEle) == 'quickcreate') {
            var ele = $('[name="' + fieldName + '"]', parentEle);
            if (ele.length == 0) {
                return false;
            }
            if (returnInput == true) {
                return ele;
            }
            fieldElement = $(ele[0]).closest(FlexUtils.layoutDependValue({
                'vlayout': '.fieldValue',
                'v7': '.fieldValue',
                'begbie': 'div.mycdivfield'
            }, '.fieldValue'));
        }
        else if (FlexUtils.getViewMode(parentEle) == 'listview') {
            if (FlexUtils.listViewFields === false) {
                FlexUtils.listViewFields = FlexUtils.getListFields(parentEle);
            }
            if (FlexUtils.currentLVRow !== null) {
                if (typeof FlexUtils.listViewFields[fieldName] != 'undefined') {
                    if (FlexUtils.listViewFields[fieldName] >= 0) {
                        fieldElement = $($('td.listViewEntryValue', FlexUtils.currentLVRow)[FlexUtils.listViewFields[fieldName]]);
                    }
                    else {
                        fieldElement = $($('td.listViewEntryValue', FlexUtils.currentLVRow)[Number(FlexUtils.listViewFields[fieldName] + 100) * -1]);
                    }
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else if (FlexUtils.getViewMode(parentEle) == 'relatedview') {
            if (FlexUtils.listViewFields === false) {
                FlexUtils.listViewFields = FlexUtils.getListFields(parentEle);
            }
            if ($('td[data-field-type]', FlexUtils.currentLVRow).length > 0) {
                fieldElement = $($('td[data-field-type]', FlexUtils.currentLVRow)[FlexUtils.listViewFields[fieldName]]);
            }
            else {
                fieldElement = $($('td.listViewEntryValue', FlexUtils.currentLVRow)[FlexUtils.listViewFields[fieldName]]);
            }
        }
        return fieldElement;
    },
    refreshContent: function (viewName, isSettings, params, convertComponents) {
        if (typeof params === 'undefined') {
            convertComponents = false;
        }
        if (typeof params === 'undefined') {
            params = {};
        }
        if (typeof isSettings === 'undefined') {
            isSettings = false;
        }

        params.module = ScopeName;
        params.view = viewName;
        if (isSettings === true) {
            params.parent = 'Settings';
        }
        var aDeferred = jQuery.Deferred();
        if (FlexUtils.isVT7()) {
            FlexAjax.request(params).then(function (data) {
                var target;
                if(jQuery('.settingsPageDiv').length > 0) {
                    jQuery(".settingsPageDiv").html(data);

                    target = jQuery(".settingsPageDiv");
                } else {
                    jQuery(".ContentReplacement").html(data);

                    target = jQuery(".ContentReplacement");
                }

                if(convertComponents === true) {
                    jQuery(".select2", target).select2();
                }

                aDeferred.resolve();
            });
        }
        else {
            FlexAjax.request(params).then(function (data) {
                jQuery(jQuery(".contentsDiv")[0]).html(data);
                if(convertComponents === true) {
                    jQuery(jQuery(".contentsDiv")[0]).find('.select2').select2();
                }

                aDeferred.resolve();
            });
        }
        return aDeferred.promise();
    },
    getListFields: function (parentEle) {
        var cols;
        if(FlexUtils.isVT7()) {
            cols = jQuery(".listview-table .listViewContentHeaderValues", parentEle);
        } else {
            cols = jQuery(".listViewEntriesTable .listViewHeaderValues", parentEle);
        }
        var listViewFields = {};
        for (var colIndex in cols) {
            if (cols.hasOwnProperty(colIndex) && jQuery.isNumeric(colIndex)) {
                var value = cols[colIndex];
                if (jQuery(value).data("columnname") == undefined) {
                    listViewFields[jQuery(value).data("fieldname")] = colIndex;
                }
                else {
                    listViewFields[jQuery(value).data("columnname")] = colIndex;
                }
            }
        }
        return listViewFields;
    },
    loadStyles: function (urls, nocache) {
        if (typeof urls == 'string') {
            urls = [urls];
        }
        var aDeferred = jQuery.Deferred();
        if (typeof nocache == 'undefined') {
            nocache = false; // default don't refresh
        }
        $.when.apply($, $.map(urls, function (url) {
            if (nocache) {
                url += '?_ts=' + new Date().getTime(); // refresh?
            }
            return $.get(url, function () {
                $('<link>', { rel: 'stylesheet', type: 'text/css', 'href': url }).appendTo('head');
            });
        })).then(function () {
            aDeferred.resolve();
        });
        return aDeferred.promise();
    },
    loadScript: function (url, options) {
        var aDeferred = jQuery.Deferred();
        if (typeof FlexCache.loadedScript == 'undefined') {
            FlexCache.loadedScript = {};
        }
        if (typeof FlexCache.loadedScript[url] != 'undefined') {
            aDeferred.resolve();
            return aDeferred;
        }
        // Allow user to set any option except for dataType, cache, and url
        options = jQuery.extend(options || {}, {
            dataType: "script",
            cache: true,
            url: url
        });
        // Use $.ajax() since it is more flexible than $.getScript
        // Return the jqXHR object so we can chain callbacks
        return jQuery.ajax(options);
    }
};var _FlexCache = {
    'FieldCache': {},
    'FieldLoadQueue': {},
    'viewMode': false,
    'popUp': false
};

if(typeof console != 'undefined' && typeof console.log != 'undefined') {
    console.log('Initialize FlexUtils ' + ScopeName + " V" + Version);
}

if (typeof window.FlexStore == 'undefined') {
    window.FlexStore = {};
}
if (typeof window.RedooStore == 'undefined') {
    window.RedooStore = {};
}
window.RedooStore[ScopeName] = window.FlexStore[ScopeName] = {
    'Ajax': FlexAjax,
    'Utils': FlexUtils,
    'Cache': FlexCache,
    'Form': FlexForm,
    'Translate': FlexTranslate
};

if (typeof window.FlexAjax == 'undefined') {
    /**
     *
     * @param ScopeName
     * @returns FlexAjax
     * @constructor
     */
    window.FlexAjax = function (ScopeName) {
        if (typeof window.FlexStore[ScopeName] != 'undefined') {
            return window.FlexStore[ScopeName].Ajax;
        }
        if (typeof window.RedooStore[ScopeName] != 'undefined') {
            return window.RedooStore[ScopeName].Ajax;
        }
        console.error('FlexAjax ' + ScopeName + ' Scope not found');
    };
}

if (typeof window.RedooAjax == 'undefined') {
    window.RedooAjax = window.FlexAjax;
}

if (typeof window.FlexUtils == 'undefined') {
    /**
     *
     * @param ScopeName
     * @returns FlexUtils
     * @constructor
     */
    window.FlexUtils = function (ScopeName) {
        if (typeof window.FlexStore[ScopeName] != 'undefined') {
            return window.FlexStore[ScopeName].Utils;
        }
        if (typeof window.RedooStore[ScopeName] != 'undefined') {
            return window.RedooStore[ScopeName].Utils;
        }
        console.error('FlexUtils ' + ScopeName + ' Scope not found');
    };
}
if (typeof window.RedooUtils == 'undefined') {
    window.RedooUtils = window.FlexUtils;
}

if (typeof window.FlexCache == 'undefined') {
    /**
     *
     * @param ScopeName
     * @returns FlexCache
     * @constructor
     */
    window.FlexCache = function (ScopeName) {
        if (typeof window.RedooStore[ScopeName] != 'undefined') {
            return window.RedooStore[ScopeName].Cache;
        }
        if (typeof window.FlexStore[ScopeName] != 'undefined') {
            return window.FlexStore[ScopeName].Cache;
        }
        console.error('FlexCache ' + ScopeName + ' Scope not found');
    };
}
if (typeof window.RedooCache == 'undefined') {
    window.RedooCache = window.FlexCache;
}
if (typeof window.FlexForm == 'undefined') {
    /**
     *
     * @param ScopeName
     * @returns FlexCache
     * @constructor
     */
    window.FlexForm = function (ScopeName) {
        if (typeof window.FlexStore[ScopeName] != 'undefined') {
            return window.FlexStore[ScopeName].Form;
        }
        console.error('FlexForm ' + ScopeName + ' Scope not found');
    };
}
if (typeof window.FlexTranslate == 'undefined') {
    /**
     *
     * @param ScopeName
     * @returns FlexCache
     * @constructor
     */
    window.FlexTranslate = function (ScopeName) {
        if (typeof window.FlexStore[ScopeName] != 'undefined') {
            return window.FlexStore[ScopeName].Translate;
        }
        console.error('FlexTranslate ' + ScopeName + ' Scope not found');
    };
}

if (typeof window.FlexEvents == 'undefined') {
    /**
     *
     * @returns jQuery Eventhandler
     * @constructor
     */
    window.FlexEvents = $({});
}// Dependency
/* jshint ignore:start */
/*
 JS Signals <http://millermedeiros.github.com/js-signals/>
 Released under the MIT license
 Author: Miller Medeiros
 Version: 1.0.0 - Build: 268 (2012/11/29 05:48 PM)
 */
function h(a, b, c, d, e) { this._listener = b; this._isOnce = c; this.context = d; this._signal = a; this._priority = e || 0; }
function g(a, b) { if (typeof a !== "function")
    throw Error("listener is a required param of {fn}() and should be a Function.".replace("{fn}", b)); }
function e() { this._bindings = []; this._prevParams = null; var a = this; this.dispatch = function () { e.prototype.dispatch.apply(a, arguments); }; }
h.prototype = { active: !0, params: null, execute: function (a) {
        var b;
        this.active && this._listener && (a = this.params ? this.params.concat(a) :
            a, b = this._listener.apply(this.context, a), this._isOnce && this.detach());
        return b;
    }, detach: function () { return this.isBound() ? this._signal.remove(this._listener, this.context) : null; }, isBound: function () { return !!this._signal && !!this._listener; }, isOnce: function () { return this._isOnce; }, getListener: function () { return this._listener; }, getSignal: function () { return this._signal; }, _destroy: function () { delete this._signal; delete this._listener; delete this.context; }, toString: function () {
        return "[SignalBinding isOnce:" + this._isOnce +
            ", isBound:" + this.isBound() + ", active:" + this.active + "]";
    } };
e.prototype = { VERSION: "1.0.0", memorize: !1, _shouldPropagate: !0, active: !0, _registerListener: function (a, b, c, d) { var e = this._indexOfListener(a, c); if (e !== -1) {
        if (a = this._bindings[e], a.isOnce() !== b)
            throw Error("You cannot add" + (b ? "" : "Once") + "() then add" + (!b ? "" : "Once") + "() the same listener without removing the relationship first.");
    }
    else
        a = new h(this, a, b, c, d), this._addBinding(a); this.memorize && this._prevParams && a.execute(this._prevParams); return a; },
    _addBinding: function (a) { var b = this._bindings.length; do
        --b;
    while (this._bindings[b] && a._priority <= this._bindings[b]._priority); this._bindings.splice(b + 1, 0, a); }, _indexOfListener: function (a, b) { for (var c = this._bindings.length, d; c--;)
        if (d = this._bindings[c], d._listener === a && d.context === b)
            return c; return -1; }, has: function (a, b) { return this._indexOfListener(a, b) !== -1; }, add: function (a, b, c) { g(a, "add"); return this._registerListener(a, !1, b, c); }, addOnce: function (a, b, c) {
        g(a, "addOnce");
        return this._registerListener(a, !0, b, c);
    }, remove: function (a, b) { g(a, "remove"); var c = this._indexOfListener(a, b); c !== -1 && (this._bindings[c]._destroy(), this._bindings.splice(c, 1)); return a; }, removeAll: function () { for (var a = this._bindings.length; a--;)
        this._bindings[a]._destroy(); this._bindings.length = 0; }, getNumListeners: function () { return this._bindings.length; }, halt: function () { this._shouldPropagate = !1; }, dispatch: function (a) {
        if (this.active) {
            var b = Array.prototype.slice.call(arguments), c = this._bindings.length, d;
            if (this.memorize)
                this._prevParams =
                    b;
            if (c) {
                d = this._bindings.slice();
                this._shouldPropagate = !0;
                do
                    c--;
                while (d[c] && this._shouldPropagate && d[c].execute(b) !== !1);
            }
        }
    }, forget: function () { this._prevParams = null; }, dispose: function () { this.removeAll(); delete this._bindings; delete this._prevParams; }, toString: function () { return "[Signal active:" + this.active + " numListeners:" + this.getNumListeners() + "]"; } };
var f = e;
f.Signal = e;
FlexUtils.Signal = f.Signal;
/*
 * jQuery BlockUI; v20141123
 * http://jquery.malsup.com/block/
 * Copyright (c) 2014 M. Alsup; Dual licensed: MIT/GPL
 */
(function () {
    "use strict";
    function e(e) { function o(o, i) { var s, h, k = o == window, v = i && void 0 !== i.message ? i.message : void 0; if (i = e.extend({}, FlexUtils.blockUI.defaults, i || {}), !i.ignoreIfBlocked || !e(o).data("blockUI.isBlocked")) {
        if (i.overlayCSS = e.extend({}, FlexUtils.blockUI.defaults.overlayCSS, i.overlayCSS || {}), s = e.extend({}, FlexUtils.blockUI.defaults.css, i.css || {}), i.onOverlayClick && (i.overlayCSS.cursor = "pointer"), h = e.extend({}, FlexUtils.blockUI.defaults.themedCSS, i.themedCSS || {}), v = void 0 === v ? i.message : v, k && b && t(window, { fadeOut: 0 }), v && "string" != typeof v && (v.parentNode || v.jquery)) {
            var y = v.jquery ? v[0] : v, m = {};
            e(o).data("blockUI.history", m), m.el = y, m.parent = y.parentNode, m.display = y.style.display, m.position = y.style.position, m.parent && m.parent.removeChild(y);
        }
        e(o).data("blockUI.onUnblock", i.onUnblock);
        var g, I, w, U, x = i.baseZ;
        g = r || i.forceIframe ? e('<iframe class="blockUI" style="z-index:' + x++ + ';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="' + i.iframeSrc + '"></iframe>') : e('<div class="blockUI" style="display:none"></div>'), I = i.theme ? e('<div class="blockUI blockOverlay ui-widget-overlay" style="z-index:' + x++ + ';display:none"></div>') : e('<div class="blockUI blockOverlay" style="z-index:' + x++ + ';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>'), i.theme && k ? (U = '<div class="blockUI ' + i.blockMsgClass + ' blockPage ui-dialog ui-widget ui-corner-all" style="z-index:' + (x + 10) + ';display:none;position:fixed">', i.title && (U += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">' + (i.title || "&nbsp;") + "</div>"), U += '<div class="ui-widget-content ui-dialog-content"></div>', U += "</div>") : i.theme ? (U = '<div class="blockUI ' + i.blockMsgClass + ' blockElement ui-dialog ui-widget ui-corner-all" style="z-index:' + (x + 10) + ';display:none;position:absolute">', i.title && (U += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">' + (i.title || "&nbsp;") + "</div>"), U += '<div class="ui-widget-content ui-dialog-content"></div>', U += "</div>") : U = k ? '<div class="blockUI ' + i.blockMsgClass + ' blockPage" style="z-index:' + (x + 10) + ';display:none;position:fixed"></div>' : '<div class="blockUI ' + i.blockMsgClass + ' blockElement" style="z-index:' + (x + 10) + ';display:none;position:absolute"></div>', w = e(U), v && (i.theme ? (w.css(h), w.addClass("ui-widget-content")) : w.css(s)), i.theme || I.css(i.overlayCSS), I.css("position", k ? "fixed" : "absolute"), (r || i.forceIframe) && g.css("opacity", 0);
        var C = [g, I, w], S = k ? e("body") : e(o);
        e.each(C, function () { this.appendTo(S); }), i.theme && i.draggable && e.fn.draggable && w.draggable({ handle: ".ui-dialog-titlebar", cancel: "li" });
        var O = f && (!e.support.boxModel || e("object,embed", k ? null : o).length > 0);
        if (u || O) {
            if (k && i.allowBodyStretch && e.support.boxModel && e("html,body").css("height", "100%"), (u || !e.support.boxModel) && !k)
                var E = d(o, "borderTopWidth"), T = d(o, "borderLeftWidth"), M = E ? "(0 - " + E + ")" : 0, B = T ? "(0 - " + T + ")" : 0;
            e.each(C, function (e, o) { var t = o[0].style; if (t.position = "absolute", 2 > e)
                k ? t.setExpression("height", "Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.support.boxModel?0:" + i.quirksmodeOffsetHack + ') + "px"') : t.setExpression("height", 'this.parentNode.offsetHeight + "px"'), k ? t.setExpression("width", 'jQuery.support.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"') : t.setExpression("width", 'this.parentNode.offsetWidth + "px"'), B && t.setExpression("left", B), M && t.setExpression("top", M);
            else if (i.centerY)
                k && t.setExpression("top", '(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"'), t.marginTop = 0;
            else if (!i.centerY && k) {
                var n = i.css && i.css.top ? parseInt(i.css.top, 10) : 0, s = "((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + " + n + ') + "px"';
                t.setExpression("top", s);
            } });
        }
        if (v && (i.theme ? w.find(".ui-widget-content").append(v) : w.append(v), (v.jquery || v.nodeType) && e(v).show()), (r || i.forceIframe) && i.showOverlay && g.show(), i.fadeIn) {
            var j = i.onBlock ? i.onBlock : c, H = i.showOverlay && !v ? j : c, z = v ? j : c;
            i.showOverlay && I._fadeIn(i.fadeIn, H), v && w._fadeIn(i.fadeIn, z);
        }
        else
            i.showOverlay && I.show(), v && w.show(), i.onBlock && i.onBlock.bind(w)();
        if (n(1, o, i), k ? (b = w[0], p = e(i.focusableElements, b), i.focusInput && setTimeout(l, 20)) : a(w[0], i.centerX, i.centerY), i.timeout) {
            var W = setTimeout(function () { k ? e.unblockUI(i) : e(o).unblock(i); }, i.timeout);
            e(o).data("blockUI.timeout", W);
        }
    } } function t(o, t) { var s, l = o == window, a = e(o), d = a.data("blockUI.history"), c = a.data("blockUI.timeout"); c && (clearTimeout(c), a.removeData("blockUI.timeout")), t = e.extend({}, FlexUtils.blockUI.defaults, t || {}), n(0, o, t), null === t.onUnblock && (t.onUnblock = a.data("blockUI.onUnblock"), a.removeData("blockUI.onUnblock")); var r; r = l ? e("body").children().filter(".blockUI").add("body > .blockUI") : a.find(">.blockUI"), t.cursorReset && (r.length > 1 && (r[1].style.cursor = t.cursorReset), r.length > 2 && (r[2].style.cursor = t.cursorReset)), l && (b = p = null), t.fadeOut ? (s = r.length, r.stop().fadeOut(t.fadeOut, function () { 0 === --s && i(r, d, t, o); })) : i(r, d, t, o); } function i(o, t, i, n) { var s = e(n); if (!s.data("blockUI.isBlocked")) {
        o.each(function () { this.parentNode && this.parentNode.removeChild(this); }), t && t.el && (t.el.style.display = t.display, t.el.style.position = t.position, t.el.style.cursor = "default", t.parent && t.parent.appendChild(t.el), s.removeData("blockUI.history")), s.data("blockUI.static") && s.css("position", "static"), "function" == typeof i.onUnblock && i.onUnblock(n, i);
        var l = e(document.body), a = l.width(), d = l[0].style.width;
        l.width(a - 1).width(a), l[0].style.width = d;
    } } function n(o, t, i) { var n = t == window, l = e(t); if ((o || (!n || b) && (n || l.data("blockUI.isBlocked"))) && (l.data("blockUI.isBlocked", o), n && i.bindEvents && (!o || i.showOverlay))) {
        var a = "mousedown mouseup keydown keypress keyup touchstart touchend touchmove";
        o ? e(document).bind(a, i, s) : e(document).unbind(a, s);
    } } function s(o) { if ("keydown" === o.type && o.keyCode && 9 == o.keyCode && b && o.data.constrainTabKey) {
        var t = p, i = !o.shiftKey && o.target === t[t.length - 1], n = o.shiftKey && o.target === t[0];
        if (i || n)
            return setTimeout(function () { l(n); }, 10), !1;
    } var s = o.data, a = e(o.target); return a.hasClass("blockOverlay") && s.onOverlayClick && s.onOverlayClick(o), a.parents("div." + s.blockMsgClass).length > 0 ? !0 : 0 === a.parents().children().filter("div.blockUI").length; } function l(e) { if (p) {
        var o = p[e === !0 ? p.length - 1 : 0];
        o && o.focus();
    } } function a(e, o, t) { var i = e.parentNode, n = e.style, s = (i.offsetWidth - e.offsetWidth) / 2 - d(i, "borderLeftWidth"), l = (i.offsetHeight - e.offsetHeight) / 2 - d(i, "borderTopWidth"); o && (n.left = s > 0 ? s + "px" : "0"), t && (n.top = l > 0 ? l + "px" : "0"); } function d(o, t) { return parseInt(e.css(o, t), 10) || 0; } e.fn._fadeIn = e.fn.fadeIn; var c = e.noop || function () { }, r = /MSIE/.test(navigator.userAgent), u = /MSIE 6.0/.test(navigator.userAgent) && !/MSIE 8.0/.test(navigator.userAgent); document.documentMode || 0; var f = e.isFunction(document.createElement("div").style.setExpression); FlexUtils.blockUI = function (e) { o(window, e); }; FlexUtils.unblockUI = function (e) { t(window, e); }, e.growlUI = function (o, t, i, n) { var s = e('<div class="growlUI"></div>'); o && s.append("<h1>" + o + "</h1>"), t && s.append("<h2>" + t + "</h2>"), void 0 === i && (i = 3e3); var l = function (o) { o = o || {}, e.blockUI({ message: s, fadeIn: o.fadeIn !== void 0 ? o.fadeIn : 700, fadeOut: o.fadeOut !== void 0 ? o.fadeOut : 1e3, timeout: o.timeout !== void 0 ? o.timeout : i, centerY: !1, showOverlay: !1, onUnblock: n, css: FlexUtils.blockUI.defaults.growlCSS }); }; l(), s.css("opacity"), s.mouseover(function () { l({ fadeIn: 0, timeout: 3e4 }); var o = e(".blockMsg"); o.stop(), o.fadeTo(300, 1); }).mouseout(function () { e(".blockMsg").fadeOut(1e3); }); }, e.fn.block = function (t) { if (this[0] === window)
        return e.blockUI(t), this; var i = e.extend({}, FlexUtils.blockUI.defaults, t || {}); return this.each(function () { var o = e(this); i.ignoreIfBlocked && o.data("blockUI.isBlocked") || o.unblock({ fadeOut: 0 }); }), this.each(function () { "static" == e.css(this, "position") && (this.style.position = "relative", e(this).data("blockUI.static", !0)), this.style.zoom = 1, o(this, t); }); }, e.fn.unblock = function (o) { return this[0] === window ? (e.unblockUI(o), this) : this.each(function () { t(this, o); }); }, FlexUtils.blockUI.version = 2.7, FlexUtils.blockUI.defaults = { message: "<h1>Please wait...</h1>", title: null, draggable: !0, theme: !1, css: { padding: 0, margin: 0, width: "30%", top: "40%", left: "35%", textAlign: "center", color: "#000", border: "3px solid #aaa", backgroundColor: "#fff", cursor: "wait" }, themedCSS: { width: "30%", top: "40%", left: "35%" }, overlayCSS: { backgroundColor: "#000", opacity: 0.6, cursor: "wait" }, cursorReset: "default", growlCSS: { width: "350px", top: "10px", left: "", right: "10px", border: "none", padding: "5px", opacity: 0.6, cursor: "default", color: "#fff", backgroundColor: "#000", "-webkit-border-radius": "10px", "-moz-border-radius": "10px", "border-radius": "10px" }, iframeSrc: /^https/i.test(window.location.href || "") ? "javascript:false" : "about:blank", forceIframe: !1, baseZ: 2e3, centerX: !0, centerY: !0, allowBodyStretch: !0, bindEvents: !0, constrainTabKey: !0, fadeIn: 200, fadeOut: 400, timeout: 0, showOverlay: !0, focusInput: !0, focusableElements: ":input:enabled:visible", onBlock: null, onUnblock: null, onOverlayClick: null, quirksmodeOffsetHack: 4, blockMsgClass: "blockMsg", ignoreIfBlocked: !1 }; var b = null, p = []; }
    "function" == typeof define && define.amd && define.amd.jQuery ? define(["jquery"], e) : e(jQuery);
})();
/* jshint ignore:end */
})(jQuery);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsZXhVdGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJGbGV4VXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKmdsb2JhbHMgVnRpZ2VyX0VkaXRfSnM6ZmFsc2UsVnRpZ2VyX0RldGFpbF9KczpmYWxzZSxWdGlnZXJfUG9wdXBfSnM6ZmFsc2UgKi9cclxuXHJcbnZhciBGbGV4VXRpbHMgPSB7XHJcbiAgICBsYXlvdXQ6IG51bGwsXHJcbiAgICBjdXJyZW50TFZSb3c6IG51bGwsXHJcbiAgICBsaXN0Vmlld0ZpZWxkczogZmFsc2UsXHJcbiAgICBpc1ZUNzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0eXBlb2YgYXBwLmhlbHBlciAhPT0gJ3VuZGVmaW5lZCc7XHJcbiAgICB9LFxyXG4gICAgY3JlYXRlRmlsZURyb3A6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuICAgICAgICBpZih0eXBlb2Ygb3B0aW9ucyA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlb2Ygb3B0aW9ucy5ob3ZlcnRleHQgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMuaG92ZXJ0ZXh0ID0gJ0Ryb3AgRmlsZSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGVvZiBvcHRpb25zLmNvbnRhaW5lciA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5jb250YWluZXIgPSAnYm9keSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGVvZiBvcHRpb25zLmNvbnRhaW5lciA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5jb250YWluZXIgPSAnYm9keSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGVvZiBvcHRpb25zLmRhdGEgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMuZGF0YSA9IHt9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoJChvcHRpb25zLmNvbnRhaW5lcikucHJvcCgndGFnTmFtZScpICE9PSAnQk9EWScgJiYgJChvcHRpb25zLmNvbnRhaW5lcikuY3NzKCdwb3NpdGlvbicpID09ICdzdGF0aWMnKSB7XHJcbiAgICAgICAgICAgICQob3B0aW9ucy5jb250YWluZXIpLmNzcygncG9zaXRpb24nLCAncmVsYXRpdmUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJChvcHRpb25zLmNvbnRhaW5lcikuYWRkQ2xhc3MoJ1JlZ2lzdGVyZWRGaWxlRHJvcCcpO1xyXG4gICAgICAgIHZhciBjb250YWluZXJIZWlnaHQgPSAkKG9wdGlvbnMuY29udGFpbmVyKS5oZWlnaHQoKTtcclxuXHJcbiAgICAgICAgaWYodHlwZW9mIG9wdGlvbnMudXJsID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBpZih0eXBlb2Ygb3B0aW9ucy5hY3Rpb24gPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyAnVVJMIG9yIGFjdGlvbiBpcyBtYW5kYXRvcnkgZm9yIEZpbGVEcm9wIENvbXBvbmVudCc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLnVybCA9ICdpbmRleC5waHA/bW9kdWxlPScgKyBTY29wZU5hbWUgKyAnJmFjdGlvbj0nICsgb3B0aW9ucy5hY3Rpb247XHJcblxyXG4gICAgICAgICAgICAgICAgaWYodHlwZW9mIG9wdGlvbnMuc2V0dGluZ3MgIT09ICd1bmRlZmluZWQnICYmIG9wdGlvbnMuc2V0dGluZ3MgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnVybCArPSAnJnBhcmVudD1TZXR0aW5ncyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCQoJ3N0eWxlI0ZsZXhGaWxlRHJvcFN0eWxlcycpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICB2YXIgZm9udFNpemUgPSAyMDtcclxuICAgICAgICAgICAgdmFyIHNob3dJY29uID0gdHJ1ZTtcclxuICAgICAgICAgICAgdmFyIHBvc2l0aW9uVGV4dCA9ICc0MCUnO1xyXG4gICAgICAgICAgICBpZihjb250YWluZXJIZWlnaHQgPCAyMDApIHtcclxuICAgICAgICAgICAgICAgIGZvbnRTaXplID0gMTI7XHJcbiAgICAgICAgICAgICAgICBzaG93SWNvbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb25UZXh0ID0gJzEwJSc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBodG1sID0gJzxzdHlsZSB0eXBlPVwidGV4dC9jc3NcIiBpZD1cIkZsZXhGaWxlRHJvcFN0eWxlc1wiPmRpdi5GbGV4RmlsZURyb3BPdmVybGF5IHtcXG4nICtcclxuICAgICAgICAgICAgICAgICcgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG4nICtcclxuICAgICAgICAgICAgICAgICcgIHRvcDogMDtcXG4nICtcclxuICAgICAgICAgICAgICAgICcgIGxlZnQ6IDA7XFxuJyArXHJcbiAgICAgICAgICAgICAgICAnICBoZWlnaHQ6IDEwMCU7XFxuJyArXHJcbiAgICAgICAgICAgICAgICAnICB3aWR0aDogMTAwJTtcXG4nICtcclxuICAgICAgICAgICAgICAgICcgIHotaW5kZXg6IDIwMDA7XFxuJyArXHJcbiAgICAgICAgICAgICAgICAnICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuNyk7XFxuJyArXHJcbiAgICAgICAgICAgICAgICAnICBjb2xvcjogI2ZmZmZmZjtcXG4nICtcclxuICAgICAgICAgICAgICAgICcgIGZvbnQtd2VpZ2h0OiBib2xkO1xcbicgK1xyXG4gICAgICAgICAgICAgICAgJyAgbGV0dGVyLXNwYWNpbmc6IDFweDtcXG4nICtcclxuICAgICAgICAgICAgICAgICcgIHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7XFxuJyArXHJcbiAgICAgICAgICAgICAgICAnICBmb250LXNpemU6ICcgKyBmb250U2l6ZSArICdweDtcXG4nICtcclxuICAgICAgICAgICAgICAgICcgICBvdmVyZmxvdzpoaWRkZW47ICcgK1xyXG4gICAgICAgICAgICAgICAgJyAgdGV4dC1hbGlnbjogY2VudGVyO1xcbicgK1xyXG4gICAgICAgICAgICAgICAgJyAgZm9udC1mYW1pbHk6IFwiQXJpYWwgQmxhY2tcIiwgR2FkZ2V0LCBzYW5zLXNlcmlmO1xcbicgK1xyXG4gICAgICAgICAgICAgICAgJ31cXG4nICtcclxuICAgICAgICAgICAgICAgICdkaXYuRmxleEZpbGVEcm9wT3ZlcmxheSAqIHtcXG4nICtcclxuICAgICAgICAgICAgICAgICcgIHBvaW50ZXItZXZlbnRzOiBub25lO1xcbicgK1xyXG4gICAgICAgICAgICAgICAgJ31cXG4nICtcclxuICAgICAgICAgICAgICAgICdkaXYuRmxleEZpbGVEcm9wT3ZlcmxheSBzcGFuI3VwbG9hZEhpbnQge1xcbicgK1xyXG4gICAgICAgICAgICAgICAgJyAgcG9zaXRpb246IHJlbGF0aXZlO1xcbicgK1xyXG4gICAgICAgICAgICAgICAgJyAgdG9wOiAnK3Bvc2l0aW9uVGV4dCsnO1xcbicgK1xyXG4gICAgICAgICAgICAgICAgJ31cXG4nICtcclxuICAgICAgICAgICAgICAgICdkaXYuRmxleEZpbGVEcm9wT3ZlcmxheSBzcGFuI3VwbG9hZEhpbnQgaSB7XFxuJyArXHJcbiAgICAgICAgICAgICAgICAoc2hvd0ljb24gPT0gZmFsc2U/ICdkaXNwbGF5Om5vbmU7JyA6ICcnKSArXHJcbiAgICAgICAgICAgICAgICAnICBmb250LXNpemU6IDY0cHg7XFxuJyArXHJcbiAgICAgICAgICAgICAgICAnICBtYXJnaW4tYm90dG9tOiAzMHB4O1xcbicgK1xyXG4gICAgICAgICAgICAgICAgJ308L3N0eWxlPic7XHJcbiAgICAgICAgICAgICQoJ2hlYWQnKS5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZigkKCcuRmxleEZpbGVEcm9wT3ZlcmxheScsIG9wdGlvbnMuY29udGFpbmVyKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgdmFyIGh0bWwgPSAnPGRpdiBjbGFzcz1cIkZsZXhGaWxlRHJvcE92ZXJsYXlcIiBzdHlsZT1cImRpc3BsYXk6bm9uZTtcIj48c3BhbiBpZD1cInVwbG9hZEhpbnRcIj48aSBjbGFzcz1cImZhIGZhLXVwbG9hZFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT48YnI+JyArIG9wdGlvbnMuaG92ZXJ0ZXh0ICsgJzwvc3Bhbj48L2Rpdj4nO1xyXG4gICAgICAgICAgICAkKG9wdGlvbnMuY29udGFpbmVyKS5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgT3ZlcmxheSA9ICQoJy5GbGV4RmlsZURyb3BPdmVybGF5Jywgb3B0aW9ucy5jb250YWluZXIpO1xyXG5cclxuICAgICAgICAkKG9wdGlvbnMuY29udGFpbmVyKS5vbignZHJhZ2VudGVyJywgJC5wcm94eShmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfSwgdGhpcykpO1xyXG5cclxuICAgICAgICAkKG9wdGlvbnMuY29udGFpbmVyKS5vbignZHJhZ292ZXInLCAkLnByb3h5KGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9LCB0aGlzKSk7XHJcbiAgICAgICAgJChvcHRpb25zLmNvbnRhaW5lcikub24oJ2Ryb3AnLCAkLnByb3h5KGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9LCB0aGlzKSk7XHJcblxyXG4gICAgICAgIHZhciBhU2lnbmFsID0gbmV3IEZsZXhVdGlscy5TaWduYWwoKTtcclxuXHJcbiAgICAgICAgJChvcHRpb25zLmNvbnRhaW5lcikuYXBwZW5kKCc8aW5wdXQgdHlwZT1cImZpbGVcIiBzdHlsZT1cImRpc3BsYXk6bm9uZTtcIiBjbGFzcz1cImZpbGVzZWxlY3RvclwiIC8+Jyk7XHJcbiAgICAgICAgJChvcHRpb25zLmNvbnRhaW5lcikuZmluZCgnLmZpbGVzZWxlY3RvcicpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSAkKGUuY3VycmVudFRhcmdldCk7XHJcblxyXG4gICAgICAgICAgICBpZih0YXJnZXQucHJvcCgnZmlsZXMnKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB1cGxvYWRGaWxlKHRhcmdldC5wcm9wKCdmaWxlcycpWzBdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQob3B0aW9ucy5jb250YWluZXIpLmZpbmQoJy5maWxlc2VsZWN0b3InKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQob3B0aW9ucy5jb250YWluZXIpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKG9wdGlvbnMuY29udGFpbmVyKS5maW5kKCcuZmlsZXNlbGVjdG9yJykudHJpZ2dlcignY2xpY2snKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIERyYWdDb250YWluZXIgPSAkKG9wdGlvbnMuY29udGFpbmVyKTtcclxuICAgICAgICBEcmFnQ29udGFpbmVyLm9uKCdkcmFnZW50ZXInLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBPdmVybGF5LmZhZGVJbignZmFzdCcpO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBPdmVybGF5Lm9uKCdkcmFnbGVhdmUnLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBPdmVybGF5LmZhZGVPdXQoJ2Zhc3QnKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdXBsb2FkRmlsZShmaWxlKSB7XHJcbiAgICAgICAgICAgIHZhciBmZCA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgICAgICAgICBmZC5hcHBlbmQoJ2ZpbGUnLCBmaWxlKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB1cGxvYWRVUkwgPSBvcHRpb25zLnVybDtcclxuICAgICAgICAgICAgdmFyIGV4dHJhRGF0YSA9IG9wdGlvbnMuZGF0YTtcclxuXHJcbiAgICAgICAgICAgICQuZWFjaChvcHRpb25zLmRhdGEsIGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGZkLmFwcGVuZChrZXksIHZhbHVlKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB2YXIganFYSFIgPSBqUXVlcnkuYWpheCh7XHJcbiAgICAgICAgICAgICAgICB1cmw6IHVwbG9hZFVSTCxcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICAgICAgY29udGVudFR5cGU6ZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzRGF0YTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjYWNoZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBmZCxcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgICAgIGFTaWduYWwuZGlzcGF0Y2goZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgT3ZlcmxheS5vbignZHJvcCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgIE92ZXJsYXkuZmFkZU91dCgnZmFzdCcpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGZpbGVMaXN0ID0gZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5maWxlcztcclxuXHJcbiAgICAgICAgICAgICQuZWFjaChmaWxlTGlzdCwgalF1ZXJ5LnByb3h5KGZ1bmN0aW9uKGluZGV4LCBmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICB1cGxvYWRGaWxlKGZpbGUpO1xyXG4gICAgICAgICAgICB9LCB0aGlzKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBhU2lnbmFsO1xyXG4gICAgfSxcclxuICAgIHNob3dSZWNvcmRJbk92ZXJsYXk6ZnVuY3Rpb24oc2V0eXBlLCBjcm1pZCkge1xyXG4gICAgICAgIHdpbmRvdy5vcGVuKCdpbmRleC5waHA/bW9kdWxlPScgKyBzZXR5cGUgKyAnJnZpZXc9RGV0YWlsJnJlY29yZD0nICsgY3JtaWQpO1xyXG4gICAgfSxcclxuICAgIHNob3dOb3RpZmljYXRpb246ZnVuY3Rpb24obWVzc2FnZSwgaXNTdWNjZXNzLCBvcHRpb25zKSB7XHJcbiAgICAgICAgaWYodHlwZW9mIGlzU3VjY2VzcyA9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBpc1N1Y2Nlc3MgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlb2Ygb3B0aW9ucyA9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBvcHRpb25zID0ge307XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihGbGV4VXRpbHMuaXNWVDcoKSkge1xyXG4gICAgICAgICAgICBvcHRpb25zLm1lc3NhZ2UgPSBtZXNzYWdlO1xyXG5cclxuICAgICAgICAgICAgaWYoaXNTdWNjZXNzID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBhcHAuaGVscGVyLnNob3dTdWNjZXNzTm90aWZpY2F0aW9uKG9wdGlvbnMpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYXBwLmhlbHBlci5zaG93RXJyb3JOb3RpZmljYXRpb24ob3B0aW9ucyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgY2FjaGVTZXQ6ZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xyXG4gICAgICAgIGlmKEZsZXhVdGlscy5pc1ZUNygpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhcHAuc3RvcmFnZS5zZXQoa2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGNhY2hlR2V0OmZ1bmN0aW9uKGtleSwgZGVmYXVsdFZhbHVlKSB7XHJcbiAgICAgICAgaWYoRmxleFV0aWxzLmlzVlQ3KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGFwcC5zdG9yYWdlLmdldChrZXksIGRlZmF1bHRWYWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGNhY2hlQ2xlYXI6ZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgaWYoRmxleFV0aWxzLmlzVlQ3KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGFwcC5zdG9yYWdlLmNsZWFyKGtleSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGNhY2hlRmx1c2g6ZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYoRmxleFV0aWxzLmlzVlQ3KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGFwcC5zdG9yYWdlLmZsdXNoKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGdldEN1cnJlbnREYXRlRm9ybWF0OmZ1bmN0aW9uKHR5cGUpIHtcclxuICAgICAgICB0eXBlID0gdHlwZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGlmKEZsZXhDYWNoZS5nZXQoJ19fQ3VycmVudERhdGVGb3JtYXRfJyArIHR5cGUsIGZhbHNlKSAhPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEZsZXhDYWNoZS5nZXQoJ19fQ3VycmVudERhdGVGb3JtYXRfJyArIHR5cGUsIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciByZXBsYWNlbWVudCA9IHt9O1xyXG5cclxuICAgICAgICBzd2l0Y2godHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlICdwaHAnOlxyXG4gICAgICAgICAgICAgICAgcmVwbGFjZW1lbnQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ3l5eXknIDogJyVZJyxcclxuICAgICAgICAgICAgICAgICAgICAneXknIDogJyV5JyxcclxuICAgICAgICAgICAgICAgICAgICAnZGQnIDogJyVkJyxcclxuICAgICAgICAgICAgICAgICAgICAnbW0nIDogJyVtJ1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdtb21lbnQnOlxyXG4gICAgICAgICAgICAgICAgcmVwbGFjZW1lbnQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ3l5eXknIDogJ1lZWVknLFxyXG4gICAgICAgICAgICAgICAgICAgICd5eScgOiAnWVknLFxyXG4gICAgICAgICAgICAgICAgICAgICdkZCcgOiAnREQnLFxyXG4gICAgICAgICAgICAgICAgICAgICdtbScgOiAnTU0nXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgY3VycmVudEZvcm1hdDtcclxuXHJcbiAgICAgICAgaWYoRmxleFV0aWxzLmlzVlQ3KCkpIHtcclxuICAgICAgICAgICAgY3VycmVudEZvcm1hdCA9IGFwcC5nZXREYXRlRm9ybWF0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkLmVhY2gocmVwbGFjZW1lbnQsIGZ1bmN0aW9uKG9sZFBhcnQsIG5ld1BhcnQpIHtcclxuICAgICAgICAgICAgY3VycmVudEZvcm1hdCA9IGN1cnJlbnRGb3JtYXQucmVwbGFjZShvbGRQYXJ0LCBuZXdQYXJ0KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgRmxleENhY2hlLnNldCgnX19DdXJyZW50RGF0ZUZvcm1hdF8nICsgdHlwZSwgY3VycmVudEZvcm1hdCk7XHJcblxyXG4gICAgICAgIHJldHVybiBjdXJyZW50Rm9ybWF0O1xyXG4gICAgfSxcclxuICAgIGdldEN1cnJlbnRDdXN0b21WaWV3SWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmKEZsZXhVdGlscy5pc1ZUNygpID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkKCdpbnB1dFtuYW1lPVwiY3ZpZFwiXScpLnZhbCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBqUXVlcnkoJyNjdXN0b21GaWx0ZXInKS52YWwoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgc2VsZWN0UmVjb3JkUG9wdXA6IGZ1bmN0aW9uIChwYXJhbXMsIG11bHRpcGxlKSB7XHJcbiAgICAgICAgdmFyIGFEZWZlcnJlZCA9IGpRdWVyeS5EZWZlcnJlZCgpO1xyXG4gICAgICAgIHZhciBwb3B1cEluc3RhbmNlID0gVnRpZ2VyX1BvcHVwX0pzLmdldEluc3RhbmNlKCk7XHJcblxyXG4gICAgICAgIGlmIChGbGV4VXRpbHMuaXNWVDcoKSkge1xyXG4gICAgICAgICAgICBpZih0eXBlb2YgcGFyYW1zID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJhbXMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ21vZHVsZSc6cGFyYW1zLFxyXG4gICAgICAgICAgICAgICAgICAgICd2aWV3JzonUG9wdXAnLFxyXG4gICAgICAgICAgICAgICAgICAgICdzcmNfbW9kdWxlJzonRW1haWxzJywgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kdWxlPURvY3VtZW50cyZ2aWV3PSZzcmNfbW9kdWxlPUVtYWlscyZzcmNfZmllbGQ9dGVzdGZpZWxkJm11bHRpX3NlbGVjdD0xXHJcbiAgICAgICAgICAgICAgICAgICAgJ3NyY19maWVsZCc6J3Rlc3RmaWVsZCdcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYodHlwZW9mIG11bHRpcGxlICE9ICd1bmRlZmluZWQnICYmIG11bHRpcGxlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJhbXMubXVsdGlfc2VsZWN0ID0gMTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYXBwLmV2ZW50Lm9mZignRmxleFV0aWxzLlNlbGVjdFJlY29yZCcpO1xyXG4gICAgICAgICAgICBhcHAuZXZlbnQub25lKCdGbGV4VXRpbHMuU2VsZWN0UmVjb3JkJywgZnVuY3Rpb24gKGUsIGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGFEZWZlcnJlZC5yZXNvbHZlV2l0aCh3aW5kb3csIFtqUXVlcnkucGFyc2VKU09OKGRhdGEpXSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgICAgIHBvcHVwSW5zdGFuY2Uuc2hvd1BvcHVwKHBhcmFtcywgJ0ZsZXhVdGlscy5TZWxlY3RSZWNvcmQnLCBmdW5jdGlvbiAoZGF0YTIpIHsgLyogQ2FsbGJhY2sgd2hlbiB2aXNpYmxlICoqLyB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKHR5cGVvZiBwYXJhbXMgPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIHBhcmFtcyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAnbW9kdWxlJzpwYXJhbXMsXHJcbiAgICAgICAgICAgICAgICAgICAgJ3ZpZXcnOidQb3B1cCcsXHJcbiAgICAgICAgICAgICAgICAgICAgJ3NyY19tb2R1bGUnOidFbWFpbHMnLCAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2R1bGU9RG9jdW1lbnRzJnZpZXc9JnNyY19tb2R1bGU9RW1haWxzJnNyY19maWVsZD10ZXN0ZmllbGQmbXVsdGlfc2VsZWN0PTFcclxuICAgICAgICAgICAgICAgICAgICAnc3JjX2ZpZWxkJzondGVzdGZpZWxkJ1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZih0eXBlb2YgbXVsdGlwbGUgIT0gJ3VuZGVmaW5lZCcgJiYgbXVsdGlwbGUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHBhcmFtcy5tdWx0aV9zZWxlY3QgPSAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBwb3B1cEluc3RhbmNlLnNob3cocGFyYW1zLCBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgYURlZmVycmVkLnJlc29sdmVXaXRoKGRhdGEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBhRGVmZXJyZWQucHJvbWlzZSgpO1xyXG4gICAgfSxcclxuICAgIGdldEN1cnJlbnRMYXlvdXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoRmxleFV0aWxzLmxheW91dCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gRmxleFV0aWxzLmxheW91dDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHNraW5wYXRoID0galF1ZXJ5KCdib2R5JykuZGF0YSgnc2tpbnBhdGgnKTtcclxuICAgICAgICB2YXIgbWF0Y2hlcyA9IHNraW5wYXRoLm1hdGNoKC9sYXlvdXRzXFwvKFteL10rKS8pO1xyXG4gICAgICAgIGlmIChtYXRjaGVzLmxlbmd0aCA+PSAyKSB7XHJcbiAgICAgICAgICAgIEZsZXhVdGlscy5sYXlvdXQgPSBtYXRjaGVzWzFdO1xyXG4gICAgICAgICAgICByZXR1cm4gbWF0Y2hlc1sxXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgRmxleFV0aWxzLmxheW91dCA9ICd2bGF5b3V0JztcclxuICAgICAgICByZXR1cm4gJ3ZsYXlvdXQnO1xyXG4gICAgfSxcclxuICAgIGdldFF1ZXJ5UGFyYW1zOiBmdW5jdGlvbiAocGFyYW1OYW1lKSB7XHJcbiAgICAgICAgdmFyIHNVUkwgPSB3aW5kb3cuZG9jdW1lbnQuVVJMLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgaWYgKHNVUkwuaW5kZXhPZihcIj9cIikgPiAwKSB7XHJcbiAgICAgICAgICAgIHZhciBhcnJQYXJhbXMgPSBzVVJMLnNwbGl0KFwiP1wiKTtcclxuICAgICAgICAgICAgdmFyIGFyclVSTFBhcmFtcyA9IGFyclBhcmFtc1sxXS5zcGxpdChcIiZcIik7XHJcbiAgICAgICAgICAgIHZhciBhcnJQYXJhbU5hbWVzID0gbmV3IEFycmF5KGFyclVSTFBhcmFtcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICB2YXIgYXJyUGFyYW1WYWx1ZXMgPSBuZXcgQXJyYXkoYXJyVVJMUGFyYW1zLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIHZhciBpID0gMDtcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGFyclVSTFBhcmFtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNQYXJhbSA9IGFyclVSTFBhcmFtc1tpXS5zcGxpdChcIj1cIik7XHJcbiAgICAgICAgICAgICAgICBhcnJQYXJhbU5hbWVzW2ldID0gc1BhcmFtWzBdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNQYXJhbVsxXSAhPSBcIlwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJyUGFyYW1WYWx1ZXNbaV0gPSBkZWNvZGVVUkkoc1BhcmFtWzFdKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXJyUGFyYW1WYWx1ZXNbaV0gPSBcIk5vIFZhbHVlXCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGFyclVSTFBhcmFtcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFyclBhcmFtTmFtZXNbaV0gPT0gcGFyYW1OYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy9hbGVydChcIlBhcmFtZXRlcjpcIiArIGFyclBhcmFtVmFsdWVzW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJyUGFyYW1WYWx1ZXNbaV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSxcclxuICAgIG9uTGlzdENoYW5nZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKEZsZXhDYWNoZS5nZXQoJ19fb25MaXN0Q2hhbmdlU2lnbmFsJywgZmFsc2UpID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIHZhciBhU2lnbmFsID0gbmV3IEZsZXhVdGlscy5TaWduYWwoKTtcclxuICAgICAgICAgICAgYXBwLmV2ZW50Lm9uKFwicG9zdC5saXN0Vmlld0ZpbHRlci5jbGlja1wiLCBmdW5jdGlvbiAoZSwgY29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgICAgICBhU2lnbmFsLmRpc3BhdGNoKGNvbnRhaW5lcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBGbGV4Q2FjaGUuc2V0KCdfX29uTGlzdENoYW5nZVNpZ25hbCcsIGFTaWduYWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gRmxleENhY2hlLmdldCgnX19vbkxpc3RDaGFuZ2VTaWduYWwnKTtcclxuICAgIH0sXHJcbiAgICBvblJlbGF0ZWRMaXN0Q2hhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKEZsZXhDYWNoZS5nZXQoJ19fb25SZWxhdGVkTGlzdENoYW5nZVNpZ25hbCcsIGZhbHNlKSA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICB2YXIgYVNpZ25hbCA9IG5ldyBGbGV4VXRpbHMuU2lnbmFsKCk7XHJcbiAgICAgICAgICAgIGFwcC5ldmVudC5vbihcInBvc3QucmVsYXRlZExpc3RMb2FkLmNsaWNrXCIsIGZ1bmN0aW9uIChlLCBjb250YWluZXIpIHtcclxuICAgICAgICAgICAgICAgIGFTaWduYWwuZGlzcGF0Y2goY29udGFpbmVyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIEZsZXhDYWNoZS5zZXQoJ19fb25SZWxhdGVkTGlzdENoYW5nZVNpZ25hbCcsIGFTaWduYWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gRmxleENhY2hlLmdldCgnX19vblJlbGF0ZWRMaXN0Q2hhbmdlU2lnbmFsJyk7XHJcbiAgICB9LFxyXG4gICAgVVVJRENvdW50ZXI6IDEsXHJcbiAgICBGaWVsZENoYW5nZUV2ZW50SW5pdDogZmFsc2UsXHJcbiAgICAvLyBXaWxsIHJlZ2lzdGVyIGFuIGV2ZW50LCB3aGVuIGEgZmllbGQgaXMgY2hhbmdlZFxyXG4gICAgb25GaWVsZENoYW5nZTogZnVuY3Rpb24gKHBhcmVudEVsZSkge1xyXG4gICAgICAgIGlmKHR5cGVvZiBwYXJlbnRFbGUgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHBhcmVudEVsZSA9ICdkaXYjcGFnZSc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBPbmx5IHJlZ2lzdGVyIG9uZSBzaWduYWwgZm9yIEZpZWxkQ2hhbmdlc1xyXG4gICAgICAgIGlmIChqUXVlcnkocGFyZW50RWxlKS5kYXRhKCdmaWVsZHVpZCcpID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgalF1ZXJ5KHBhcmVudEVsZSkuZGF0YSgnZmllbGR1aWQnLCAncGFyZW50RWxlJyArIEZsZXhVdGlscy5VVUlEQ291bnRlcik7XHJcbiAgICAgICAgICAgIEZsZXhVdGlscy5VVUlEQ291bnRlcisrO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgRmllbGR1aWQgPSBqUXVlcnkocGFyZW50RWxlKS5kYXRhKCdmaWVsZHVpZCcpO1xyXG4gICAgICAgIGpRdWVyeShwYXJlbnRFbGUpLmFkZENsYXNzKCdSZWRvb0ZpZWxkQ2hhbmdlVHJhY2tlcicpO1xyXG4gICAgICAgIHZhciBhU2lnbmFsO1xyXG4gICAgICAgIGlmIChGbGV4Q2FjaGUuZ2V0KCdfX29uRmllbGRDaGFuZ2VTaWduYWwnICsgRmllbGR1aWQsIGZhbHNlKSA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBhU2lnbmFsID0gbmV3IEZsZXhVdGlscy5TaWduYWwoKTtcclxuICAgICAgICAgICAgaWYgKEZsZXhVdGlscy5pc1ZUNygpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoRmxleFV0aWxzLkZpZWxkQ2hhbmdlRXZlbnRJbml0ID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHR5cGVvZiBWdGlnZXJfRGV0YWlsX0pzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHAuZXZlbnQub24oVnRpZ2VyX0RldGFpbF9Kcy5Qb3N0QWpheFNhdmVFdmVudCwgZnVuY3Rpb24gKGUsIGZpZWxkQmFzaWNEYXRhLCBwb3N0U2F2ZVJlY29yZERldGFpbHMsIGNvbnRlbnRIb2xkZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmaWVsZEVsZW1lbnQgPSBmaWVsZEJhc2ljRGF0YS5jbG9zZXN0KCcuUmVkb29GaWVsZENoYW5nZVRyYWNrZXInKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBGaWVsZHVpZCA9IGZpZWxkRWxlbWVudC5kYXRhKCdmaWVsZHVpZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYVNpZ25hbCA9IEZsZXhDYWNoZS5nZXQoJ19fb25GaWVsZENoYW5nZVNpZ25hbCcgKyBGaWVsZHVpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhU2lnbmFsLmRpc3BhdGNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBmaWVsZEJhc2ljRGF0YS5kYXRhKCduYW1lJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuZXdcIjogcG9zdFNhdmVSZWNvcmREZXRhaWxzW2ZpZWxkQmFzaWNEYXRhLmRhdGEoJ25hbWUnKV0udmFsdWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZpZWxkQmFzaWNEYXRhLCBwb3N0U2F2ZVJlY29yZERldGFpbHMsIGNvbnRlbnRIb2xkZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgRmxleFV0aWxzLkZpZWxkQ2hhbmdlRXZlbnRJbml0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZihGbGV4VXRpbHMuZ2V0Vmlld01vZGUoKSAhPT0gXCJsaXN0dmlld1wiICYmIHR5cGVvZiBWdGlnZXJfRGV0YWlsX0pzICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRoaXNJbnN0YW5jZSA9IFZ0aWdlcl9EZXRhaWxfSnMuZ2V0SW5zdGFuY2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGV0YWlsQ29udGVudHNIb2xkZXIgPSB0aGlzSW5zdGFuY2UuZ2V0Q29udGVudEhvbGRlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRldGFpbENvbnRlbnRzSG9sZGVyLm9uKHRoaXNJbnN0YW5jZS5maWVsZFVwZGF0ZWRFdmVudCwgZnVuY3Rpb24oZSwgdmFsdWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSAkKGUudGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZpZWxkTmFtZSA9IHRhcmdldC5hdHRyKCduYW1lJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmaWVsZEVsZW1lbnQgPSB0YXJnZXQuY2xvc2VzdCgnLlJlZG9vRmllbGRDaGFuZ2VUcmFja2VyJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBGaWVsZHVpZCA9IGZpZWxkRWxlbWVudC5kYXRhKCdmaWVsZHVpZCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgYVNpZ25hbCA9IEZsZXhDYWNoZS5nZXQoJ19fb25GaWVsZENoYW5nZVNpZ25hbCcgKyBGaWVsZHVpZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFTaWduYWwuZGlzcGF0Y2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZmllbGROYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuZXdcIjogdmFsdWVzLm5ld1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB2YWx1ZXMsIHt9LCBkZXRhaWxDb250ZW50c0hvbGRlcik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBGbGV4Q2FjaGUuc2V0KCdfX29uRmllbGRDaGFuZ2VTaWduYWwnICsgRmllbGR1aWQsIGFTaWduYWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgYVNpZ25hbCA9IEZsZXhDYWNoZS5nZXQoJ19fb25GaWVsZENoYW5nZVNpZ25hbCcgKyBGaWVsZHVpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBGbGV4Q2FjaGUuZ2V0KCdfX29uRmllbGRDaGFuZ2VTaWduYWwnICsgRmllbGR1aWQpO1xyXG4gICAgfSxcclxuICAgIGdldFJlY29yZExhYmVsczogZnVuY3Rpb24gKGlkcykge1xyXG4gICAgICAgIHZhciBhRGVmZXJyZWQgPSBqUXVlcnkuRGVmZXJyZWQoKTtcclxuICAgICAgICB2YXIgbmV3SWRzID0gW107XHJcbiAgICAgICAgdmFyIExhYmVsQ2FjaGUgPSBGbGV4Q2FjaGUuZ2V0KCdMYWJlbENhY2hlJywge30pO1xyXG4gICAgICAgIGpRdWVyeS5lYWNoKGlkcywgZnVuY3Rpb24gKGluZGV4LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIExhYmVsQ2FjaGVbdmFsdWVdID09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdJZHMucHVzaCh2YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAobmV3SWRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgRmxleEFqYXgucG9zdEFjdGlvbignUmVjb3JkTGFiZWwnLCB7XHJcbiAgICAgICAgICAgICAgICBpZHM6IG5ld0lkcyxcclxuICAgICAgICAgICAgICAgICdkYXRhVHlwZSc6ICdqc29uJ1xyXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgalF1ZXJ5LmVhY2gocmVzcG9uc2UucmVzdWx0LCBmdW5jdGlvbiAoaWQsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgTGFiZWxDYWNoZVtpZF0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgRmxleENhY2hlLnNldCgnTGFiZWxDYWNoZScsIExhYmVsQ2FjaGUpO1xyXG4gICAgICAgICAgICAgICAgYURlZmVycmVkLnJlc29sdmVXaXRoKHt9LCBbTGFiZWxDYWNoZV0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGFEZWZlcnJlZC5yZXNvbHZlV2l0aCh7fSwgW0xhYmVsQ2FjaGVdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFEZWZlcnJlZC5wcm9taXNlKCk7XHJcbiAgICB9LFxyXG4gICAgZ2V0RmllbGRMaXN0OiBmdW5jdGlvbiAobW9kdWxlTmFtZSkge1xyXG4gICAgICAgIHZhciBhRGVmZXJyZWQgPSBqUXVlcnkuRGVmZXJyZWQoKTtcclxuICAgICAgICBpZiAodHlwZW9mIF9GbGV4Q2FjaGUuRmllbGRMb2FkUXVldWVbbW9kdWxlTmFtZV0gIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIF9GbGV4Q2FjaGUuRmllbGRMb2FkUXVldWVbbW9kdWxlTmFtZV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIF9GbGV4Q2FjaGUuRmllbGRMb2FkUXVldWVbbW9kdWxlTmFtZV0gPSBhRGVmZXJyZWQ7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBfRmxleENhY2hlLkZpZWxkQ2FjaGVbbW9kdWxlTmFtZV0gIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgYURlZmVycmVkLnJlc29sdmUoX0ZsZXhDYWNoZS5GaWVsZENhY2hlW21vZHVsZU5hbWVdKTtcclxuICAgICAgICAgICAgcmV0dXJuIGFEZWZlcnJlZC5wcm9taXNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEZsZXhBamF4LnBvc3QoJ2luZGV4LnBocCcsIHtcclxuICAgICAgICAgICAgJ21vZHVsZSc6IFNjb3BlTmFtZSxcclxuICAgICAgICAgICAgJ21vZGUnOiAnR2V0RmllbGRMaXN0JyxcclxuICAgICAgICAgICAgJ2FjdGlvbic6ICdSZWRvb1V0aWxzJyxcclxuICAgICAgICAgICAgJ21vZHVsZV9uYW1lJzogbW9kdWxlTmFtZVxyXG4gICAgICAgIH0sICdqc29uJykudGhlbihmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICBfRmxleENhY2hlLkZpZWxkQ2FjaGVbbW9kdWxlTmFtZV0gPSBkYXRhO1xyXG4gICAgICAgICAgICBhRGVmZXJyZWQucmVzb2x2ZShkYXRhLmZpZWxkcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGFEZWZlcnJlZC5wcm9taXNlKCk7XHJcbiAgICB9LFxyXG4gICAgZmlsdGVyRmllbGRMaXN0QnlGaWVsZHR5cGU6IGZ1bmN0aW9uIChmaWVsZHMsIGZpZWxkdHlwZSkge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgICAgICBqUXVlcnkuZWFjaChmaWVsZHMsIGZ1bmN0aW9uIChibG9ja0xhYmVsLCBmaWVsZHMpIHtcclxuICAgICAgICAgICAgdmFyIGJsb2NrID0gW107XHJcbiAgICAgICAgICAgIGpRdWVyeS5lYWNoKGZpZWxkcywgZnVuY3Rpb24gKGZpZWxkTmFtZSwgZmllbGREYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZmllbGREYXRhLnR5cGUgPT0gZmllbGR0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmxvY2sucHVzaChmaWVsZERhdGEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKGJsb2NrLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtibG9ja0xhYmVsXSA9IGJsb2NrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH0sXHJcbiAgICBmaWxsRmllbGRTZWxlY3Q6IGZ1bmN0aW9uIChmaWVsZElkLCBzZWxlY3RlZCwgbW9kdWxlLCBmaWVsZHR5cGUpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGZpZWxkdHlwZSA9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBmaWVsZHR5cGUgPSAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBtb2R1bGUgPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgbW9kdWxlID0gbW9kdWxlTmFtZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBzZWxlY3RlZCA9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBzZWxlY3RlZCA9IFtzZWxlY3RlZF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBGbGV4VXRpbHMuZ2V0RmllbGRMaXN0KG1vZHVsZSwgZmllbGR0eXBlKS50aGVuKGZ1bmN0aW9uIChmaWVsZHMpIHtcclxuICAgICAgICAgICAgaWYgKGZpZWxkdHlwZSAhPSAnJykge1xyXG4gICAgICAgICAgICAgICAgZmllbGRzID0gRmxleFV0aWxzLmZpbHRlckZpZWxkTGlzdEJ5RmllbGR0eXBlKGZpZWxkcywgZmllbGR0eXBlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgaHRtbCA9ICcnO1xyXG4gICAgICAgICAgICBqUXVlcnkuZWFjaChmaWVsZHMsIGZ1bmN0aW9uIChibG9ja0xhYmVsLCBmaWVsZHMpIHtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzxvcHRncm91cCBsYWJlbD1cIicgKyBibG9ja0xhYmVsICsgJ1wiPic7XHJcbiAgICAgICAgICAgICAgICBqUXVlcnkuZWFjaChmaWVsZHMsIGZ1bmN0aW9uIChpbmRleCwgZmllbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICBodG1sICs9ICc8b3B0aW9uIHZhbHVlPVwiJyArIGZpZWxkLm5hbWUgKyAnXCIgJyArIChqUXVlcnkuaW5BcnJheShmaWVsZC5uYW1lLCBzZWxlY3RlZCkgIT0gLTEgPyAnc2VsZWN0ZWQ9XCJzZWxlY3RlZFwiJyA6ICcnKSArICc+JyArIGZpZWxkLmxhYmVsICsgJzwvb3B0aW9uPic7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gJzwvb3B0Z3JvdXA+JztcclxuICAgICAgICAgICAgICAgIGpRdWVyeSgnIycgKyBmaWVsZElkKS5odG1sKGh0bWwpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGpRdWVyeSgnIycgKyBmaWVsZElkKS5oYXNDbGFzcygnc2VsZWN0MicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KCcjJyArIGZpZWxkSWQpLnNlbGVjdDIoJ3ZhbCcsIHNlbGVjdGVkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGpRdWVyeSgnIycgKyBmaWVsZElkKS50cmlnZ2VyKCdGaWVsZHNMb2FkZWQnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgX2dldERlZmF1bHRQYXJlbnRFbGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gJ2RpdiNwYWdlJztcclxuICAgIH0sXHJcbiAgICBnZXRNYWluTW9kdWxlOiBmdW5jdGlvbiAocGFyZW50RWxlKSB7XHJcbiAgICAgICAgaWYgKEZsZXhVdGlscy5pc1ZUNygpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBGbGV4VXRpbHMuX2dldE1haW5Nb2R1bGVWVDcocGFyZW50RWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBGbGV4VXRpbHMuX2dldE1haW5Nb2R1bGVWVDYocGFyZW50RWxlKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX2dldE1haW5Nb2R1bGVWVDY6IGZ1bmN0aW9uIChwYXJlbnRFbGUpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHBhcmVudEVsZSA9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBwYXJlbnRFbGUgPSBGbGV4VXRpbHMuX2dldERlZmF1bHRQYXJlbnRFbGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHZpZXdNb2RlID0gRmxleFV0aWxzLmdldFZpZXdNb2RlKHBhcmVudEVsZSk7XHJcbiAgICAgICAgaWYgKHZpZXdNb2RlID09ICdkZXRhaWx2aWV3JyB8fCB2aWV3TW9kZSA9PSAnc3VtbWFyeXZpZXcnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkKCcjbW9kdWxlJywgcGFyZW50RWxlKS52YWwoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodmlld01vZGUgPT0gJ2VkaXR2aWV3JyB8fCB2aWV3TW9kZSA9PSAncXVpY2tjcmVhdGUnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkKCdbbmFtZT1cIm1vZHVsZVwiXScsIHBhcmVudEVsZSkudmFsKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHZpZXdNb2RlID09ICdsaXN0dmlldycpIHtcclxuICAgICAgICAgICAgcmV0dXJuICQoJyNtb2R1bGUnLCBwYXJlbnRFbGUpLnZhbCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh2aWV3TW9kZSA9PSAncmVsYXRlZHZpZXcnKSB7XHJcbiAgICAgICAgICAgIGlmICgkKCdbbmFtZT1cInJlbGF0ZWRNb2R1bGVOYW1lXCJdJywgcGFyZW50RWxlKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJCgnW25hbWU9XCJyZWxhdGVkTW9kdWxlTmFtZVwiXScsIHBhcmVudEVsZSkudmFsKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCQoJyNtb2R1bGUnLCBwYXJlbnRFbGUpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkKCcjbW9kdWxlJywgcGFyZW50RWxlKS52YWwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgUXVlcnlNb2R1bGUgPSBGbGV4VXRpbHMuZ2V0UXVlcnlQYXJhbXMoJ21vZHVsZScpO1xyXG4gICAgICAgIGlmIChRdWVyeU1vZHVsZSAhPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFF1ZXJ5TW9kdWxlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gJyc7XHJcbiAgICB9LFxyXG4gICAgX2dldE1haW5Nb2R1bGVWVDc6IGZ1bmN0aW9uIChwYXJlbnRFbGUpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHBhcmVudEVsZSA9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBwYXJlbnRFbGUgPSBGbGV4VXRpbHMuX2dldERlZmF1bHRQYXJlbnRFbGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHZpZXdNb2RlID0gRmxleFV0aWxzLmdldFZpZXdNb2RlKHBhcmVudEVsZSk7XHJcbiAgICAgICAgaWYgKCQocGFyZW50RWxlKS5kYXRhKCdmb3JjZXJlY29yZG1vZHVsZScpICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuICQocGFyZW50RWxlKS5kYXRhKCdmb3JjZXJlY29yZG1vZHVsZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocGFyZW50RWxlICE9ICcjb3ZlcmxheVBhZ2VDb250ZW50LmluJyAmJiAkKCcjb3ZlcmxheVBhZ2VDb250ZW50LmluJykubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gRmxleFV0aWxzLl9nZXRNYWluTW9kdWxlVlQ3KCcjb3ZlcmxheVBhZ2VDb250ZW50LmluJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgX01FVEEgIT0gJ3VuZGVmaW5lZCcgJiZcclxuICAgICAgICAgICAgKHZpZXdNb2RlID09ICdkZXRhaWx2aWV3JyB8fFxyXG4gICAgICAgICAgICAgICAgdmlld01vZGUgPT0gJ3N1bW1hcnl2aWV3JyB8fFxyXG4gICAgICAgICAgICAgICAgdmlld01vZGUgPT0gJ2NvbW1lbnR2aWV3JyB8fFxyXG4gICAgICAgICAgICAgICAgdmlld01vZGUgPT0gJ2hpc3Rvcnl2aWV3JyB8fFxyXG4gICAgICAgICAgICAgICAgdmlld01vZGUgPT0gJ2VkaXR2aWV3JyB8fFxyXG4gICAgICAgICAgICAgICAgdmlld01vZGUgPT0gJ2xpc3R2aWV3JykgJiZcclxuICAgICAgICAgICAgKCQocGFyZW50RWxlKS5oYXNDbGFzcygnbW9kYWwnKSA9PSBmYWxzZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIF9NRVRBLm1vZHVsZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh2aWV3TW9kZSA9PSAnZGV0YWlsdmlldycgfHwgdmlld01vZGUgPT0gJ3N1bW1hcnl2aWV3Jykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICQoJyNtb2R1bGUnLCBwYXJlbnRFbGUpLnZhbCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHZpZXdNb2RlID09ICdlZGl0dmlldycgfHwgdmlld01vZGUgPT0gJ3F1aWNrY3JlYXRlJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCQoJyNtb2R1bGUnLCBwYXJlbnRFbGUpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJCgnI21vZHVsZScsIHBhcmVudEVsZSkudmFsKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJCgnW25hbWU9XCJtb2R1bGVcIl0nLCBwYXJlbnRFbGUpLnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHZpZXdNb2RlID09ICdsaXN0dmlldycpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkKCcjbW9kdWxlJywgcGFyZW50RWxlKS52YWwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh2aWV3TW9kZSA9PSAncmVsYXRlZHZpZXcnKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoJCgnW25hbWU9XCJyZWxhdGVkTW9kdWxlTmFtZVwiXScsIHBhcmVudEVsZSkubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkKCdbbmFtZT1cInJlbGF0ZWRNb2R1bGVOYW1lXCJdJywgcGFyZW50RWxlKS52YWwoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICgkKCcjbW9kdWxlJywgcGFyZW50RWxlKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICQoJyNtb2R1bGUnLCBwYXJlbnRFbGUpLnZhbCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBRdWVyeU1vZHVsZSA9IEZsZXhVdGlscy5nZXRRdWVyeVBhcmFtcygnbW9kdWxlJyk7XHJcbiAgICAgICAgaWYgKFF1ZXJ5TW9kdWxlICE9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gUXVlcnlNb2R1bGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAnJztcclxuICAgIH0sXHJcbiAgICBnZXRNYWluUmVjb3JkSWQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgcGFyZW50RWxlID0gJ2RpdiNwYWdlJztcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBwYXJlbnRFbGUgPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgcGFyZW50RWxlID0gRmxleFV0aWxzLl9nZXREZWZhdWx0UGFyZW50RWxlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgcmVjb3JkSWQgPSBmYWxzZTtcclxuICAgICAgICB2YXIgdmlld01vZGUgPSBGbGV4VXRpbHMuZ2V0Vmlld01vZGUocGFyZW50RWxlKTtcclxuXHJcbiAgICAgICAgLy8gaWYgKHZpZXdNb2RlID09ICdkZXRhaWx2aWV3JyB8fCB2aWV3TW9kZSA9PSAnc3VtbWFyeXZpZXcnKSB7XHJcbiAgICAgICAgcmVjb3JkSWQ9ICQoJyNyZWNvcmRJZCcsIHBhcmVudEVsZSkudmFsKCk7XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVjb3JkSWQ7XHJcbiAgICB9LFxyXG4gICAgZ2V0UmVjb3JkSWRzOiBmdW5jdGlvbiAocGFyZW50RWxlKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBwYXJlbnRFbGUgPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgcGFyZW50RWxlID0gRmxleFV0aWxzLl9nZXREZWZhdWx0UGFyZW50RWxlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciByZWNvcmRJZHMgPSBbXTtcclxuICAgICAgICB2YXIgdmlld01vZGUgPSBGbGV4VXRpbHMuZ2V0Vmlld01vZGUocGFyZW50RWxlKTtcclxuICAgICAgICBpZiAodmlld01vZGUgPT0gJ2RldGFpbHZpZXcnIHx8IHZpZXdNb2RlID09ICdzdW1tYXJ5dmlldycpIHtcclxuICAgICAgICAgICAgcmVjb3JkSWRzLnB1c2goJCgnI3JlY29yZElkJywgcGFyZW50RWxlKS52YWwoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHZpZXdNb2RlID09ICdxdWlja2NyZWF0ZScpIHtcclxuICAgICAgICAgICAgLy8gZG8gbm90aGluZ1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh2aWV3TW9kZSA9PSAnZWRpdHZpZXcnKSB7XHJcbiAgICAgICAgICAgIHJlY29yZElkcy5wdXNoKCQoJ1tuYW1lPVwicmVjb3JkXCJdJykudmFsKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh2aWV3TW9kZSA9PSAnbGlzdHZpZXcnKSB7XHJcbiAgICAgICAgICAgICQoJy5saXN0Vmlld0VudHJpZXMnKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHJlY29yZElkcy5wdXNoKCQodmFsdWUpLmRhdGEoJ2lkJykpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodmlld01vZGUgPT0gJ3JlbGF0ZWR2aWV3Jykge1xyXG4gICAgICAgICAgICAkKCcubGlzdFZpZXdFbnRyaWVzJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICByZWNvcmRJZHMucHVzaCgkKHZhbHVlKS5kYXRhKCdpZCcpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZWNvcmRJZHM7XHJcbiAgICB9LFxyXG4gICAgb25RdWlja0NyZWF0ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuICAgICAgICBqUXVlcnkoJy5xdWlja0NyZWF0ZU1vZHVsZSwgLmFkZEJ1dHRvbltkYXRhLXVybCo9XCJRdWlja0NyZWF0ZVwiXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIF9fY2hlY2tRQygpIHtcclxuICAgICAgICAgICAgaWYgKGpRdWVyeSgnLnF1aWNrQ3JlYXRlQ29udGVudCcsICcubW9kZWxDb250YWluZXInKS5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoX19jaGVja1FDLCAyMDApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIGZvcm0gPSBqUXVlcnkoJy5tb2RlbENvbnRhaW5lcicpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ29uUXVpY2tDcmVhdGUgRG9uZScpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGZvcm0uZmluZCgnaW5wdXRbbmFtZT1cIm1vZHVsZVwiXScpLnZhbCgpLCBmb3JtKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGdldFZpZXdNb2RlOiBmdW5jdGlvbiAocGFyZW50RWxlKSB7XHJcbiAgICAgICAgaWYgKEZsZXhVdGlscy5pc1ZUNygpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBGbGV4VXRpbHMuX2dldFZpZXdNb2RlVlQ3KHBhcmVudEVsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gRmxleFV0aWxzLl9nZXRWaWV3TW9kZVZUNihwYXJlbnRFbGUpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfZ2V0Vmlld01vZGVWVDY6IGZ1bmN0aW9uIChwYXJlbnRFbGUpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHBhcmVudEVsZSA9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBwYXJlbnRFbGUgPSBGbGV4VXRpbHMuX2dldERlZmF1bHRQYXJlbnRFbGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHZpZXdFbGUgPSAkKFwiI3ZpZXdcIiwgcGFyZW50RWxlKTtcclxuICAgICAgICBfRmxleENhY2hlLnZpZXdNb2RlID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHZpZXdFbGUubGVuZ3RoID4gMCAmJiB2aWV3RWxlWzBdLnZhbHVlID09IFwiTGlzdFwiKSB7XHJcbiAgICAgICAgICAgIF9GbGV4Q2FjaGUudmlld01vZGUgPSBcImxpc3R2aWV3XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgkKFwiLmRldGFpbHZpZXctdGFibGVcIiwgcGFyZW50RWxlKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIF9GbGV4Q2FjaGUudmlld01vZGUgPSBcImRldGFpbHZpZXdcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoJChcIi5zdW1tYXJ5Vmlld1wiLCBwYXJlbnRFbGUpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgX0ZsZXhDYWNoZS52aWV3TW9kZSA9IFwic3VtbWFyeXZpZXdcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoJChcIi5yZWNvcmRFZGl0Vmlld1wiLCBwYXJlbnRFbGUpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgaWYgKCQoJy5xdWlja0NyZWF0ZUNvbnRlbnQnLCBwYXJlbnRFbGUpLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBfRmxleENhY2hlLnZpZXdNb2RlID0gXCJlZGl0dmlld1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgX0ZsZXhDYWNoZS52aWV3TW9kZSA9IFwicXVpY2tjcmVhdGVcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoJCgnLnJlbGF0ZWRDb250ZW50cycsIHBhcmVudEVsZSkubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBfRmxleENhY2hlLnZpZXdNb2RlID0gXCJyZWxhdGVkdmlld1wiO1xyXG4gICAgICAgICAgICBpZiAoJCgndGRbZGF0YS1maWVsZC10eXBlXScsIHBhcmVudEVsZSkubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgX0ZsZXhDYWNoZS5wb3BVcCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgX0ZsZXhDYWNoZS5wb3BVcCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKF9GbGV4Q2FjaGUudmlld01vZGUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIGlmICgkKCcjdmlldycsIHBhcmVudEVsZSkubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCQoJyN2aWV3JywgcGFyZW50RWxlKS52YWwoKSA9PSAnRGV0YWlsJykge1xyXG4gICAgICAgICAgICAgICAgICAgIF9GbGV4Q2FjaGUudmlld01vZGUgPSAnZGV0YWlsdmlldyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIF9GbGV4Q2FjaGUudmlld01vZGU7XHJcbiAgICB9LFxyXG4gICAgX2dldFZpZXdNb2RlVlQ3OiBmdW5jdGlvbiAocGFyZW50RWxlKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBwYXJlbnRFbGUgPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgcGFyZW50RWxlID0gRmxleFV0aWxzLl9nZXREZWZhdWx0UGFyZW50RWxlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIF9GbGV4Q2FjaGUudmlld01vZGUgPSBmYWxzZTtcclxuICAgICAgICBpZiAoJChcIi5kZXRhaWx2aWV3LXRhYmxlXCIsIHBhcmVudEVsZSkubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBfRmxleENhY2hlLnZpZXdNb2RlID0gXCJkZXRhaWx2aWV3XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCQoXCIuc3VtbWFyeVZpZXdcIiwgcGFyZW50RWxlKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIF9GbGV4Q2FjaGUudmlld01vZGUgPSBcInN1bW1hcnl2aWV3XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCQoXCIucmVjb3JkRWRpdFZpZXdcIiwgcGFyZW50RWxlKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGlmICgkKCcucXVpY2tDcmVhdGVDb250ZW50JywgcGFyZW50RWxlKS5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgX0ZsZXhDYWNoZS52aWV3TW9kZSA9IFwiZWRpdHZpZXdcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIF9GbGV4Q2FjaGUudmlld01vZGUgPSBcInF1aWNrY3JlYXRlXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoJChcIi5jb21tZW50c1JlbGF0ZWRDb250YWluZXJcIiwgcGFyZW50RWxlKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIF9GbGV4Q2FjaGUudmlld01vZGUgPSBcImNvbW1lbnR2aWV3XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCQoXCIuSGlzdG9yeUNvbnRhaW5lclwiLCBwYXJlbnRFbGUpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgX0ZsZXhDYWNoZS52aWV3TW9kZSA9IFwiaGlzdG9yeXZpZXdcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoalF1ZXJ5KCcucmVsYXRlZENvbnRhaW5lcicsIHBhcmVudEVsZSkuZmluZCgnLnJlbGF0ZWRNb2R1bGVOYW1lJykubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBfRmxleENhY2hlLnZpZXdNb2RlID0gXCJyZWxhdGVkdmlld1wiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChqUXVlcnkoJy5saXN0Vmlld0NvbnRlbnRIZWFkZXInLCBwYXJlbnRFbGUpLmxlbmd0aCA+IDAgJiYgdHlwZW9mIF9NRVRBICE9ICd1bmRlZmluZWQnICYmIF9NRVRBLnZpZXcgPT0gJ0xpc3QnKSB7XHJcbiAgICAgICAgICAgIF9GbGV4Q2FjaGUudmlld01vZGUgPSBcImxpc3R2aWV3XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChfRmxleENhY2hlLnZpZXdNb2RlID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICBpZiAoJCgnI3ZpZXcnLCBwYXJlbnRFbGUpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGlmICgkKCcjdmlldycsIHBhcmVudEVsZSkudmFsKCkgPT0gJ0RldGFpbCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBfRmxleENhY2hlLnZpZXdNb2RlID0gJ2RldGFpbHZpZXcnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBfRmxleENhY2hlLnZpZXdNb2RlO1xyXG4gICAgfSxcclxuICAgIGdldENvbnRlbnRNYXhIZWlnaHQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmKEZsZXhVdGlscy5pc1ZUNygpID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaChGbGV4VXRpbHMuZ2V0Q3VycmVudExheW91dCgpKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdiZWdiaWUnOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBqUXVlcnkoJy5tYWluQ29udGFpbmVyJykuaGVpZ2h0KCk7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBqUXVlcnkoJyNsZWZ0UGFuZWwnKS5oZWlnaHQoKSAtIDUwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBqUXVlcnkoJyNwYWdlJykuaGVpZ2h0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIGdldENvbnRlbnRNYXhXaWR0aDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYoRmxleFV0aWxzLmlzVlQ3KCkgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGpRdWVyeSgnI3JpZ2h0UGFuZWwnKS53aWR0aCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBoaWRlTW9kYWxCb3g6IGZ1bmN0aW9uIChjb250ZW50KSB7XHJcbiAgICAgICAgaWYgKEZsZXhVdGlscy5pc1ZUNygpID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIGFwcC5oZWxwZXIuaGlkZU1vZGFsKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBhcHAuaGlkZU1vZGFsV2luZG93KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHNob3dNb2RhbEJveDogZnVuY3Rpb24gKGNvbnRlbnQscGFyYW1zKSB7XHJcbiAgICAgICAgdmFyIGFEZWZlcnJlZCA9IGpRdWVyeS5EZWZlcnJlZCgpO1xyXG4gICAgICAgIGlmIChGbGV4VXRpbHMuaXNWVDcoKSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgYXBwLnNob3dNb2RhbFdpbmRvdyhjb250ZW50LCBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgYURlZmVycmVkLnJlc29sdmVXaXRoKHdpbmRvdywgZGF0YSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKHR5cGVvZiBwYXJhbXMgPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIHBhcmFtcyA9IHsgY2xvc2U6ZnVuY3Rpb24oKSB7IH19O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHR5cGVvZiBwYXJhbXMuY2xvc2UgPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgIHBhcmFtcy5jbG9zZSA9IGZ1bmN0aW9uKCkgeyB9O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBGbGV4Q2FjaGUuc2V0KCdfX29uTW9kYWxDbG9zZScsIHBhcmFtcy5jbG9zZSk7XHJcblxyXG4gICAgICAgICAgICBpZihqUXVlcnkoJy5teU1vZGFsIC5tb2RhbC1kaWFsb2cnKS5sZW5ndGggPiAwICYmIGpRdWVyeSgnLm1vZGFsLmluJykubGVuZ3RoID4gMCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGpRdWVyeSgnLm15TW9kYWwgLm1vZGFsLWRpYWxvZycpLnJlcGxhY2VXaXRoKGNvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgYURlZmVycmVkLnJlc29sdmVXaXRoKHdpbmRvdywgalF1ZXJ5KCcubW9kYWwubXlNb2RhbCcpWzBdKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGNvbnRhaW5lciA9IGFwcC5oZWxwZXIuc2hvd01vZGFsKGNvbnRlbnQsIHtcclxuICAgICAgICAgICAgICAgICAgICBjYjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYURlZmVycmVkLnJlc29sdmVXaXRoKHdpbmRvdywgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIub2ZmKCdoaWRkZW4uYnMubW9kYWwnKS5vbignaGlkZGVuLmJzLm1vZGFsJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmNsb3NlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFEZWZlcnJlZC5wcm9taXNlKCk7XHJcbiAgICB9LFxyXG4gICAgc2hvd0NvbnRlbnRPdmVybGF5OiBmdW5jdGlvbihkYXRhLCBwYXJhbXMpIHtcclxuICAgICAgICBpZihGbGV4VXRpbHMuaXNWVDcoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXBwLmhlbHBlci5sb2FkUGFnZUNvbnRlbnRPdmVybGF5KGRhdGEsIHBhcmFtcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYoJCgnI292ZXJsYXlQYWdlQ29udGVudCcpLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAkKCdib2R5JykuYXBwZW5kKCc8ZGl2IGlkPVxcJ292ZXJsYXlQYWdlQ29udGVudFxcJyBzdHlsZT1cIm1hcmdpbjowO1wiIGNsYXNzPVxcJ2ZhZGUgbW9kYWwgY29udGVudC1hcmVhIG92ZXJsYXlQYWdlQ29udGVudCBvdmVybGF5LWNvbnRhaW5lci02MFxcJyB0YWJpbmRleD1cXCctMVxcJyByb2xlPVxcJ2RpYWxvZ1xcJyBhcmlhLWhpZGRlbj1cXCd0cnVlXFwnPlxcbicgK1xyXG4gICAgICAgICAgICAgICAgICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJkYXRhXCI+XFxuJyArXHJcbiAgICAgICAgICAgICAgICAgICAgJyAgICAgICAgPC9kaXY+XFxuJyArXHJcbiAgICAgICAgICAgICAgICAgICAgJyAgICAgICAgPGRpdiBjbGFzcz1cIm1vZGFsLWRpYWxvZ1wiPlxcbicgK1xyXG4gICAgICAgICAgICAgICAgICAgICcgICAgICAgIDwvZGl2PlxcbicgK1xyXG4gICAgICAgICAgICAgICAgICAgICcgICAgPC9kaXY+Jyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBhRGVmZXJyZWQgPSBuZXcgalF1ZXJ5LkRlZmVycmVkKCk7XHJcbiAgICAgICAgICAgIHZhciBkZWZhdWx0UGFyYW1zID0ge1xyXG4gICAgICAgICAgICAgICAgYmFja2Ryb3A6dHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNob3c6dHJ1ZSxcclxuICAgICAgICAgICAgICAgIGtleWJvYXJkOiBmYWxzZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBwYXJhbXMgPSBqUXVlcnkuZXh0ZW5kKGRlZmF1bHRQYXJhbXMsIHBhcmFtcyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgb3ZlcmxheVBhZ2VDb250ZW50ID0gJCgnI292ZXJsYXlQYWdlQ29udGVudCcpO1xyXG5cclxuICAgICAgICAgICAgLy9pZihqUXVlcnkoXCIuY29udGVudC1hcmVhXCIpLmxlbmd0aCAmJiBqUXVlcnkoXCIuY29udGVudC1hcmVhXCIpLmhhc0NsYXNzKCdmdWxsLXdpZHRoJyl8fCAoalF1ZXJ5KCcuc2V0dGluZ3Nncm91cCcpLmxlbmd0aCA9PT0gMCAmJiBqUXVlcnkoJyNtb2R1bGVzLW1lbnUnKS5sZW5ndGggPT09IDApKXtcclxuICAgICAgICAgICAgb3ZlcmxheVBhZ2VDb250ZW50LmFkZENsYXNzKCdmdWxsLXdpZHRoJyk7XHJcbiAgICAgICAgICAgIC8vfVxyXG4gICAgICAgICAgICB2YXIgYWxyZWFkeVNob3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmKG92ZXJsYXlQYWdlQ29udGVudC5oYXNDbGFzcygnaW4nKSkge1xyXG4gICAgICAgICAgICAgICAgYWxyZWFkeVNob3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvdmVybGF5UGFnZUNvbnRlbnQub25lKCdzaG93bi5icy5tb2RhbCcsZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgICAgIGFEZWZlcnJlZC5yZXNvbHZlKCQoJyNvdmVybGF5UGFnZUNvbnRlbnQnKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgb3ZlcmxheVBhZ2VDb250ZW50Lm9uZSgnaGlkZGVuLmJzLm1vZGFsJyxmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICAgICAgb3ZlcmxheVBhZ2VDb250ZW50LmZpbmQoJy5kYXRhJykuaHRtbCgnJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgb3ZlcmxheVBhZ2VDb250ZW50LmZpbmQoJy5kYXRhJykuaHRtbChkYXRhKTtcclxuICAgICAgICAgICAgLy92dFV0aWxzLmFwcGx5RmllbGRFbGVtZW50c1ZpZXcob3ZlcmxheVBhZ2VDb250ZW50KTtcclxuICAgICAgICAgICAgb3ZlcmxheVBhZ2VDb250ZW50Lm1vZGFsKHBhcmFtcyk7XHJcblxyXG4gICAgICAgICAgICBpZihhbHJlYWR5U2hvd24pIHtcclxuICAgICAgICAgICAgICAgIGFEZWZlcnJlZC5yZXNvbHZlKGpRdWVyeSgnI292ZXJsYXlQYWdlQ29udGVudCcpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGFEZWZlcnJlZC5wcm9taXNlKCk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBoaWRlQ29udGVudE92ZXJsYXk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmKEZsZXhVdGlscy5pc1ZUNygpKSB7XHJcbiAgICAgICAgICAgIGFwcC5oZWxwZXIuaGlkZVBhZ2VDb250ZW50T3ZlcmxheSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciBhRGVmZXJyZWQgPSBuZXcgalF1ZXJ5LkRlZmVycmVkKCk7XHJcbiAgICAgICAgICAgIHZhciBvdmVybGF5UGFnZUNvbnRlbnQgPSAkKCcjb3ZlcmxheVBhZ2VDb250ZW50Jyk7XHJcbiAgICAgICAgICAgIG92ZXJsYXlQYWdlQ29udGVudC5vbmUoJ2hpZGRlbi5icy5tb2RhbCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgb3ZlcmxheVBhZ2VDb250ZW50LmZpbmQoJy5kYXRhJykuaHRtbCgnJyk7XHJcbiAgICAgICAgICAgICAgICBhRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJCgnI292ZXJsYXlQYWdlQ29udGVudCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBhRGVmZXJyZWQucHJvbWlzZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBzZXRGaWVsZFZhbHVlOiBmdW5jdGlvbiAoZmllbGROYW1lLCBmaWVsZFZhbHVlLCBwYXJlbnRFbGUpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHBhcmVudEVsZSA9PSAndW5kZWZpbmVkJyB8fCBwYXJlbnRFbGUgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBwYXJlbnRFbGUgPSBGbGV4VXRpbHMuX2dldERlZmF1bHRQYXJlbnRFbGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGZpZWxkRWxlbWVudCA9IEZsZXhVdGlscy5nZXRGaWVsZEVsZW1lbnQoZmllbGROYW1lLCBwYXJlbnRFbGUsIHRydWUpO1xyXG4gICAgICAgIHN3aXRjaCAoZmllbGRFbGVtZW50LnByb3AoJ3RhZ05hbWUnKSkge1xyXG4gICAgICAgICAgICBjYXNlICdJTlBVVCc6XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGZpZWxkRWxlbWVudC5hdHRyKCd0eXBlJykpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICd0ZXh0JzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpZWxkRWxlbWVudC5oYXNDbGFzcygnZGF0ZUZpZWxkJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKEZsZXhVdGlscy5pc1ZUNygpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRFbGVtZW50LmRhdGVwaWNrZXIoJ3VwZGF0ZScsIGZpZWxkVmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihmaWVsZFZhbHVlICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWVsZEVsZW1lbnQudmFsKGZpZWxkVmFsdWUpLkRhdGVQaWNrZXJTZXREYXRlKGZpZWxkVmFsdWUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkRWxlbWVudC52YWwoZmllbGRWYWx1ZSkuRGF0ZVBpY2tlckNsZWFyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRFbGVtZW50LnZhbChmaWVsZFZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdoaWRkZW4nOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmllbGRFbGVtZW50Lmhhc0NsYXNzKCdzb3VyY2VGaWVsZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2JqID0gVnRpZ2VyX0VkaXRfSnMuZ2V0SW5zdGFuY2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb250YWluZXIgPSBmaWVsZEVsZW1lbnQuY2xvc2VzdCgndGQnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmaWVsZFZhbHVlLmlkICE9ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqLnNldFJlZmVyZW5jZUZpZWxkVmFsdWUoY29udGFpbmVyLCB7IGlkOiBmaWVsZFZhbHVlLmlkLCBuYW1lOiBmaWVsZFZhbHVlLmxhYmVsIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLmNsZWFyUmVmZXJlbmNlU2VsZWN0aW9uJywgY29udGFpbmVyKS50cmlnZ2VyKCdjbGljaycpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ1NFTEVDVCc6XHJcbiAgICAgICAgICAgICAgICBmaWVsZEVsZW1lbnQudmFsKGZpZWxkVmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgaWYoRmxleFV0aWxzLmlzVlQ3KCkgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpZWxkRWxlbWVudC5oYXNDbGFzcygnY2h6bi1zZWxlY3QnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZEVsZW1lbnQudHJpZ2dlcignbGlzenQ6dXBkYXRlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpZWxkRWxlbWVudC5oYXNDbGFzcygnc2VsZWN0MicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkRWxlbWVudC50cmlnZ2VyKCdjaGFuZ2Uuc2VsZWN0MicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBsYXlvdXREZXBlbmRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlLCBkZWZhdWx0VmFsdWUpIHtcclxuICAgICAgICB2YXIgY3VycmVudExheW91dCA9IEZsZXhVdGlscy5nZXRDdXJyZW50TGF5b3V0KCk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZVtjdXJyZW50TGF5b3V0XSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlW2N1cnJlbnRMYXlvdXRdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xyXG4gICAgfSxcclxuICAgIGdldEZpZWxkRWxlbWVudDogZnVuY3Rpb24gKGZpZWxkTmFtZSwgcGFyZW50RWxlLCByZXR1cm5JbnB1dCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgcGFyZW50RWxlID09ICd1bmRlZmluZWQnIHx8IHBhcmVudEVsZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHBhcmVudEVsZSA9IEZsZXhVdGlscy5fZ2V0RGVmYXVsdFBhcmVudEVsZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIHJldHVybklucHV0ID09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHJldHVybklucHV0ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgZmllbGROYW1lID09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZpZWxkTmFtZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGZpZWxkRWxlbWVudCA9IGZhbHNlO1xyXG4gICAgICAgIGlmIChGbGV4VXRpbHMuZ2V0Vmlld01vZGUocGFyZW50RWxlKSA9PSBcImRldGFpbHZpZXdcIikge1xyXG4gICAgICAgICAgICBpZiAoJCgnIycgKyBGbGV4VXRpbHMuZ2V0TWFpbk1vZHVsZShwYXJlbnRFbGUpICsgJ19kZXRhaWxWaWV3X2ZpZWxkVmFsdWVfJyArIGZpZWxkTmFtZSwgcGFyZW50RWxlKS5sZW5ndGggPiAwIHx8ICQoJyNFdmVudHNfZGV0YWlsVmlld19maWVsZFZhbHVlXycgKyBmaWVsZE5hbWUsIHBhcmVudEVsZSkubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgZmllbGRFbGVtZW50ID0gJCgnIycgKyBGbGV4VXRpbHMuZ2V0TWFpbk1vZHVsZShwYXJlbnRFbGUpICsgJ19kZXRhaWxWaWV3X2ZpZWxkVmFsdWVfJyArIGZpZWxkTmFtZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoRmxleFV0aWxzLmdldE1haW5Nb2R1bGUocGFyZW50RWxlKSA9PSAnQ2FsZW5kYXInICYmIGZpZWxkRWxlbWVudC5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpZWxkRWxlbWVudCA9ICQoJyNFdmVudHNfZGV0YWlsVmlld19maWVsZFZhbHVlXycgKyBmaWVsZE5hbWUsIHBhcmVudEVsZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoJCgnI19kZXRhaWxWaWV3X2ZpZWxkVmFsdWVfJyArIGZpZWxkTmFtZSwgcGFyZW50RWxlKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBmaWVsZEVsZW1lbnQgPSAkKCcjX2RldGFpbFZpZXdfZmllbGRWYWx1ZV8nICsgZmllbGROYW1lLCBwYXJlbnRFbGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKEZsZXhVdGlscy5nZXRWaWV3TW9kZShwYXJlbnRFbGUpID09IFwic3VtbWFyeXZpZXdcIikge1xyXG4gICAgICAgICAgICB2YXIgZWxlXzE7XHJcbiAgICAgICAgICAgIGlmIChGbGV4VXRpbHMuaXNWVDcoKSkge1xyXG4gICAgICAgICAgICAgICAgZWxlXzEgPSBqUXVlcnkoJ1tkYXRhLW5hbWU9XCInICsgZmllbGROYW1lICsgJ1wiXScsIHRoaXMucGFyZW50RWxlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVsZV8xID0galF1ZXJ5KCdbbmFtZT1cIicgKyBmaWVsZE5hbWUgKyAnXCJdJywgdGhpcy5wYXJlbnRFbGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChlbGVfMS5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICAgICBpZih0eXBlb2YgdGhpcy5zdW1tYXJ5RmllbGRzW2ZpZWxkTmFtZV0gIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICBmaWVsZEVsZW1lbnQgPSBqUXVlcnkoalF1ZXJ5KEZsZXhVdGlscy5nZXRDdXJyZW50TGF5b3V0KCkgPT0gJ3ZsYXlvdXQnID8gJy5zdW1tYXJ5LXRhYmxlIHRkLmZpZWxkVmFsdWUnIDogJy5zdW1tYXJ5LXRhYmxlIGRpdi5teWNkaXZmaWVsZCcpW3RoaXMuc3VtbWFyeUZpZWxkc1tmaWVsZE5hbWVdIC0gMV0pO1xyXG4gICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgIH0qL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZmllbGRFbGVtZW50ID0gJChlbGVfMVswXSkuY2xvc2VzdChGbGV4VXRpbHMubGF5b3V0RGVwZW5kVmFsdWUoe1xyXG4gICAgICAgICAgICAgICAgICAgICd2bGF5b3V0JzogJ3RkJyxcclxuICAgICAgICAgICAgICAgICAgICAndjcnOiAnLnJvdycsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2JlZ2JpZSc6ICdkaXYubXljZGl2ZmllbGQnXHJcbiAgICAgICAgICAgICAgICB9LCAndGQnKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoRmxleFV0aWxzLmdldFZpZXdNb2RlKHBhcmVudEVsZSkgPT0gXCJlZGl0dmlld1wiIHx8IEZsZXhVdGlscy5nZXRWaWV3TW9kZShwYXJlbnRFbGUpID09ICdxdWlja2NyZWF0ZScpIHtcclxuICAgICAgICAgICAgdmFyIGVsZSA9ICQoJ1tuYW1lPVwiJyArIGZpZWxkTmFtZSArICdcIl0nLCBwYXJlbnRFbGUpO1xyXG4gICAgICAgICAgICBpZiAoZWxlLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJldHVybklucHV0ID09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZmllbGRFbGVtZW50ID0gJChlbGVbMF0pLmNsb3Nlc3QoRmxleFV0aWxzLmxheW91dERlcGVuZFZhbHVlKHtcclxuICAgICAgICAgICAgICAgICd2bGF5b3V0JzogJy5maWVsZFZhbHVlJyxcclxuICAgICAgICAgICAgICAgICd2Nyc6ICcuZmllbGRWYWx1ZScsXHJcbiAgICAgICAgICAgICAgICAnYmVnYmllJzogJ2Rpdi5teWNkaXZmaWVsZCdcclxuICAgICAgICAgICAgfSwgJy5maWVsZFZhbHVlJykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChGbGV4VXRpbHMuZ2V0Vmlld01vZGUocGFyZW50RWxlKSA9PSAnbGlzdHZpZXcnKSB7XHJcbiAgICAgICAgICAgIGlmIChGbGV4VXRpbHMubGlzdFZpZXdGaWVsZHMgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICBGbGV4VXRpbHMubGlzdFZpZXdGaWVsZHMgPSBGbGV4VXRpbHMuZ2V0TGlzdEZpZWxkcyhwYXJlbnRFbGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChGbGV4VXRpbHMuY3VycmVudExWUm93ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIEZsZXhVdGlscy5saXN0Vmlld0ZpZWxkc1tmaWVsZE5hbWVdICE9ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKEZsZXhVdGlscy5saXN0Vmlld0ZpZWxkc1tmaWVsZE5hbWVdID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRFbGVtZW50ID0gJCgkKCd0ZC5saXN0Vmlld0VudHJ5VmFsdWUnLCBGbGV4VXRpbHMuY3VycmVudExWUm93KVtGbGV4VXRpbHMubGlzdFZpZXdGaWVsZHNbZmllbGROYW1lXV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRFbGVtZW50ID0gJCgkKCd0ZC5saXN0Vmlld0VudHJ5VmFsdWUnLCBGbGV4VXRpbHMuY3VycmVudExWUm93KVtOdW1iZXIoRmxleFV0aWxzLmxpc3RWaWV3RmllbGRzW2ZpZWxkTmFtZV0gKyAxMDApICogLTFdKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoRmxleFV0aWxzLmdldFZpZXdNb2RlKHBhcmVudEVsZSkgPT0gJ3JlbGF0ZWR2aWV3Jykge1xyXG4gICAgICAgICAgICBpZiAoRmxleFV0aWxzLmxpc3RWaWV3RmllbGRzID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgRmxleFV0aWxzLmxpc3RWaWV3RmllbGRzID0gRmxleFV0aWxzLmdldExpc3RGaWVsZHMocGFyZW50RWxlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJCgndGRbZGF0YS1maWVsZC10eXBlXScsIEZsZXhVdGlscy5jdXJyZW50TFZSb3cpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGZpZWxkRWxlbWVudCA9ICQoJCgndGRbZGF0YS1maWVsZC10eXBlXScsIEZsZXhVdGlscy5jdXJyZW50TFZSb3cpW0ZsZXhVdGlscy5saXN0Vmlld0ZpZWxkc1tmaWVsZE5hbWVdXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmaWVsZEVsZW1lbnQgPSAkKCQoJ3RkLmxpc3RWaWV3RW50cnlWYWx1ZScsIEZsZXhVdGlscy5jdXJyZW50TFZSb3cpW0ZsZXhVdGlscy5saXN0Vmlld0ZpZWxkc1tmaWVsZE5hbWVdXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZpZWxkRWxlbWVudDtcclxuICAgIH0sXHJcbiAgICByZWZyZXNoQ29udGVudDogZnVuY3Rpb24gKHZpZXdOYW1lLCBpc1NldHRpbmdzLCBwYXJhbXMsIGNvbnZlcnRDb21wb25lbnRzKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBwYXJhbXMgPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIGNvbnZlcnRDb21wb25lbnRzID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgcGFyYW1zID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBwYXJhbXMgPSB7fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBpc1NldHRpbmdzID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICBpc1NldHRpbmdzID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwYXJhbXMubW9kdWxlID0gU2NvcGVOYW1lO1xyXG4gICAgICAgIHBhcmFtcy52aWV3ID0gdmlld05hbWU7XHJcbiAgICAgICAgaWYgKGlzU2V0dGluZ3MgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgcGFyYW1zLnBhcmVudCA9ICdTZXR0aW5ncyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBhRGVmZXJyZWQgPSBqUXVlcnkuRGVmZXJyZWQoKTtcclxuICAgICAgICBpZiAoRmxleFV0aWxzLmlzVlQ3KCkpIHtcclxuICAgICAgICAgICAgRmxleEFqYXgucmVxdWVzdChwYXJhbXMpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICBpZihqUXVlcnkoJy5zZXR0aW5nc1BhZ2VEaXYnKS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgalF1ZXJ5KFwiLnNldHRpbmdzUGFnZURpdlwiKS5odG1sKGRhdGEpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSBqUXVlcnkoXCIuc2V0dGluZ3NQYWdlRGl2XCIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoXCIuQ29udGVudFJlcGxhY2VtZW50XCIpLmh0bWwoZGF0YSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldCA9IGpRdWVyeShcIi5Db250ZW50UmVwbGFjZW1lbnRcIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoY29udmVydENvbXBvbmVudHMgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoXCIuc2VsZWN0MlwiLCB0YXJnZXQpLnNlbGVjdDIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBhRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIEZsZXhBamF4LnJlcXVlc3QocGFyYW1zKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBqUXVlcnkoalF1ZXJ5KFwiLmNvbnRlbnRzRGl2XCIpWzBdKS5odG1sKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgaWYoY29udmVydENvbXBvbmVudHMgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBqUXVlcnkoalF1ZXJ5KFwiLmNvbnRlbnRzRGl2XCIpWzBdKS5maW5kKCcuc2VsZWN0MicpLnNlbGVjdDIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBhRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFEZWZlcnJlZC5wcm9taXNlKCk7XHJcbiAgICB9LFxyXG4gICAgZ2V0TGlzdEZpZWxkczogZnVuY3Rpb24gKHBhcmVudEVsZSkge1xyXG4gICAgICAgIHZhciBjb2xzO1xyXG4gICAgICAgIGlmKEZsZXhVdGlscy5pc1ZUNygpKSB7XHJcbiAgICAgICAgICAgIGNvbHMgPSBqUXVlcnkoXCIubGlzdHZpZXctdGFibGUgLmxpc3RWaWV3Q29udGVudEhlYWRlclZhbHVlc1wiLCBwYXJlbnRFbGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbHMgPSBqUXVlcnkoXCIubGlzdFZpZXdFbnRyaWVzVGFibGUgLmxpc3RWaWV3SGVhZGVyVmFsdWVzXCIsIHBhcmVudEVsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBsaXN0Vmlld0ZpZWxkcyA9IHt9O1xyXG4gICAgICAgIGZvciAodmFyIGNvbEluZGV4IGluIGNvbHMpIHtcclxuICAgICAgICAgICAgaWYgKGNvbHMuaGFzT3duUHJvcGVydHkoY29sSW5kZXgpICYmIGpRdWVyeS5pc051bWVyaWMoY29sSW5kZXgpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBjb2xzW2NvbEluZGV4XTtcclxuICAgICAgICAgICAgICAgIGlmIChqUXVlcnkodmFsdWUpLmRhdGEoXCJjb2x1bW5uYW1lXCIpID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpc3RWaWV3RmllbGRzW2pRdWVyeSh2YWx1ZSkuZGF0YShcImZpZWxkbmFtZVwiKV0gPSBjb2xJbmRleDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpc3RWaWV3RmllbGRzW2pRdWVyeSh2YWx1ZSkuZGF0YShcImNvbHVtbm5hbWVcIildID0gY29sSW5kZXg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGxpc3RWaWV3RmllbGRzO1xyXG4gICAgfSxcclxuICAgIGxvYWRTdHlsZXM6IGZ1bmN0aW9uICh1cmxzLCBub2NhY2hlKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB1cmxzID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHVybHMgPSBbdXJsc107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBhRGVmZXJyZWQgPSBqUXVlcnkuRGVmZXJyZWQoKTtcclxuICAgICAgICBpZiAodHlwZW9mIG5vY2FjaGUgPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgbm9jYWNoZSA9IGZhbHNlOyAvLyBkZWZhdWx0IGRvbid0IHJlZnJlc2hcclxuICAgICAgICB9XHJcbiAgICAgICAgJC53aGVuLmFwcGx5KCQsICQubWFwKHVybHMsIGZ1bmN0aW9uICh1cmwpIHtcclxuICAgICAgICAgICAgaWYgKG5vY2FjaGUpIHtcclxuICAgICAgICAgICAgICAgIHVybCArPSAnP190cz0nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7IC8vIHJlZnJlc2g/XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuICQuZ2V0KHVybCwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJCgnPGxpbms+JywgeyByZWw6ICdzdHlsZXNoZWV0JywgdHlwZTogJ3RleHQvY3NzJywgJ2hyZWYnOiB1cmwgfSkuYXBwZW5kVG8oJ2hlYWQnKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSkpLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBhRGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBhRGVmZXJyZWQucHJvbWlzZSgpO1xyXG4gICAgfSxcclxuICAgIGxvYWRTY3JpcHQ6IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcclxuICAgICAgICB2YXIgYURlZmVycmVkID0galF1ZXJ5LkRlZmVycmVkKCk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBGbGV4Q2FjaGUubG9hZGVkU2NyaXB0ID09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIEZsZXhDYWNoZS5sb2FkZWRTY3JpcHQgPSB7fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiBGbGV4Q2FjaGUubG9hZGVkU2NyaXB0W3VybF0gIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgYURlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgcmV0dXJuIGFEZWZlcnJlZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQWxsb3cgdXNlciB0byBzZXQgYW55IG9wdGlvbiBleGNlcHQgZm9yIGRhdGFUeXBlLCBjYWNoZSwgYW5kIHVybFxyXG4gICAgICAgIG9wdGlvbnMgPSBqUXVlcnkuZXh0ZW5kKG9wdGlvbnMgfHwge30sIHtcclxuICAgICAgICAgICAgZGF0YVR5cGU6IFwic2NyaXB0XCIsXHJcbiAgICAgICAgICAgIGNhY2hlOiB0cnVlLFxyXG4gICAgICAgICAgICB1cmw6IHVybFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIFVzZSAkLmFqYXgoKSBzaW5jZSBpdCBpcyBtb3JlIGZsZXhpYmxlIHRoYW4gJC5nZXRTY3JpcHRcclxuICAgICAgICAvLyBSZXR1cm4gdGhlIGpxWEhSIG9iamVjdCBzbyB3ZSBjYW4gY2hhaW4gY2FsbGJhY2tzXHJcbiAgICAgICAgcmV0dXJuIGpRdWVyeS5hamF4KG9wdGlvbnMpO1xyXG4gICAgfVxyXG59OyJdfQ==
