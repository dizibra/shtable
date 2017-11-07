(function ($, _) {

    $.fn.shtable = function (options) {

        var _this = this,
            //
            settings = $.extend({
                styleContainer: 'head', // head, body
                offsetTop: 0,
                offsetBottom: 0,
                horizontalScrollHeight: 15,
                depth: 1,

                //
                horizontalHead: true,
                combinationHead: true,
                verticalHead: false,
                horizontalScroll: true,

                // main
                mainContainerClasses: '',
                mainWrapClasses: '',
                mainTableInnerClasses: '',
                mainTableWrapClasses: '',

                // horizontalHead
                horizontalHeadContainerClasses: '',
                horizontalHeadTableWrapClasses: '',
                horizontalHeadTableClasses: '',

                // combinationHead
                combinationHeadContainerClasses: '',
                combinationHeadTableWrapClasses: '',
                combinationHeadTableClasses: '',

                // verticalHead
                verticalHeadContainerClasses: '',
                verticalHeadTableWrapClasses: '',
                verticalHeadTableClasses: '',

                // horizontalScroll
                horizontalScrollContainerClasses: '',
                horizontalScrollContentClasses: ''

            }, options),
            //
            modules = {};

        /**
         *
         */
        function start() {

            modules.targetsStorage.init(_this);
            modules.main.init();
            modules.eventManager.init();

            settings.horizontalHead && modules.horizontalHead.init();
            settings.combinationHead && modules.combinationHead.init();
            settings.verticalHead && modules.verticalHead.init();
            settings.horizontalScroll && modules.horizontalScroll.init();

            modules.eventManager.emitLiteEvents();
        }

        /**
         *
         * @type {{init, foundTargets}}
         */
        modules['targetsStorage'] = (function () {

            var foundTargets = {
                $window: $(window),
                $document: $(document),
                //
                $this: null,
                $defaultTable: null,
                $defaultTableDefaultParent: null
            };

            /**
             *
             * @param scope
             */
            function init(scope) {

                foundTargets['$this'] = $(scope);
                foundTargets['$defaultTable'] = foundTargets['$this'];
                foundTargets['$defaultTableDefaultParent'] = foundTargets['$this'].parent();
            }

            return {
                init: function (scope) {
                    init(scope);
                },
                foundTargets: foundTargets
            };
        })();

        /**
         *
         * @type {{createObserver}}
         */
        modules['factory'] = (function () {

            /**
             *
             * @constructor
             */
            function ObserverConstructor() {

                this.listeners = [];

                /**
                 *
                 * @param func
                 */
                this.addListener = function (func) {
                    this.listeners.push(func);
                };

                /**
                 *
                 */
                this.fire = function (data) {

                    var listenersLength = this.listeners.length;

                    for (var i = 0; i < listenersLength; i++) {
                        typeof this.listeners[i] === 'function' && this.listeners[i](data);
                    }
                };
            }

            return {
                createObserver: function () {
                    return new ObserverConstructor();
                }
            };
        })();

        /**
         *
         * @type {{init, debounce}}
         */
        modules['helpers'] = (function () {

            /**
             *
             * @returns {number}
             */
            function now() {
                return Date.now ? Date.now() : new Date().getTime();
            }

            /**
             *
             * @param func
             * @param wait
             * @param immediate
             * @returns {Function}
             */
            function debounce(func, wait, immediate) {

                var timeout, args, context, timestamp, result,
                    later = function () {
                        var last = now() - timestamp;

                        if (last < wait && last >= 0) {
                            timeout = setTimeout(later, wait - last);
                        } else {
                            timeout = null;
                            if (!immediate) {
                                result = func.apply(context, args);
                                if (!timeout) context = args = null;
                            }
                        }
                    };

                return function () {

                    context = this;
                    args = arguments;
                    timestamp = now();

                    var callNow = immediate && !timeout;

                    if (!timeout) timeout = setTimeout(later, wait);

                    if (callNow) {
                        result = func.apply(context, args);
                        context = args = null;
                    }

                    return result;
                };
            }


            return {
                debounce: function (func, wait, immediate) {
                    return debounce(func, wait, immediate);
                }
            };
        })();

        /**
         *
         * @type {{init, addListener}}
         */
        modules['eventManager'] = (function (settings, modules) {

            var listeners = {
                    'resize': modules.factory.createObserver(),
                    'verticalScroll': modules.factory.createObserver(),
                    'horizontalScroll': modules.factory.createObserver()
                },
                values = {
                    lastScrollLeft: -1,
                    lastScrollTop: -1
                },
                foundTargets = modules.targetsStorage.foundTargets;

            /**
             *
             */
            function init() {
                initEvents();
            }

            /**
             *
             */
            function emitLiteEvents() {
                execOnVerticalScroll();
                execOnHorizontalScroll();
            }

            /**
             *
             */
            function initEvents() {

                // Window resize
                foundTargets['$window'].resize(modules.helpers.debounce(execOnResize, 16));

                // Window vertical scroll
                foundTargets['$window'].on('scroll', modules.helpers.debounce(execOnVerticalScroll, 8));

                // Window horizontal scroll
                foundTargets['$mainWrap'].on('scroll', modules.helpers.debounce(execOnHorizontalScroll, 8));
            }

            /**
             *
             */
            function emitMissEvents() {

                execOnVerticalScroll(null, true);
                execOnHorizontalScroll(null, true);
            }

            /**
             *
             */
            function execOnResize() {

                emitMissEvents();

                fire('resize', {});
            }

            /**
             *
             */
            function execOnVerticalScroll(event, miss) {

                var windowHeight = foundTargets['$window'].height(),
                    scrollTop = foundTargets['$document'].scrollTop(),
                    offsetTableTop = foundTargets['$defaultTable'].offset().top,
                    tableHeight = foundTargets['$defaultTable'].height();

                if (values.lastScrollTop !== scrollTop || miss) {
                    values.lastScrollTop = scrollTop;
                    fire('verticalScroll', {
                        offsetTop: offsetTableTop - scrollTop - settings.offsetTop,
                        offsetBottom: (windowHeight + scrollTop - settings.offsetBottom) - (offsetTableTop + tableHeight)
                    });
                }
            }

            /**
             *
             */
            function execOnHorizontalScroll(event, miss) {

                var scrollLeft = foundTargets['$mainWrap'].scrollLeft();

                if (values.lastScrollLeft !== scrollLeft || miss) {
                    values.lastScrollLeft = scrollLeft;
                    fire('horizontalScroll', {
                        scrollLeft: scrollLeft
                    });
                }
            }

            /**
             *
             * @param type
             */
            function fire(type, data) {
                listeners[type] && listeners[type].fire(data);
            }

            /**
             *
             * @param type
             * @param func
             */
            function addListener(type, func) {
                listeners[type] && listeners[type].addListener(func);
            }

            return {
                init: function () {
                    init();
                },
                emitLiteEvents: function () {
                    emitLiteEvents();
                },
                emitMissEvents: function () {
                    emitMissEvents();
                },
                addListener: function (type, func) {
                    addListener(type, func);
                }
            };

        })(settings, modules);

        /**
         *
         * @type {{init, addListener}}
         */
        modules['main'] = (function (settings, modules) {

            var customClassesNames, templates,
                firstDraw = true,
                listeners = {
                    renderedView: modules.factory.createObserver(),
                    renderedStyle: modules.factory.createObserver()
                },
                rendered = {
                    main: {
                        view: null,
                        style: null
                    },
                    horizontalHead: {
                        view: null,
                        style: null
                    },
                    combinationHead: {
                        view: null,
                        style: null
                    },
                    verticalHead: {
                        view: null,
                        style: null
                    },
                    horizontalScroll: {
                        view: null,
                        style: null
                    }
                },
                foundTargets = modules.targetsStorage.foundTargets;

            customClassesNames = [
                'mainContainerClasses',
                'mainWrapClasses',
                'mainTableInnerClasses',
                'mainTableWrapClasses'
            ];

            templates = {
                main: [
                    '<div class="shtable__main-container {mainContainerClasses}">',
                    '  <div class="shtable__main-wrap {mainWrapClasses}">',
                    '    <div class="shtable__main-table-inner {mainTableInnerClasses}">',
                    //     { float top panel }
                    '      <div class="shtable__main-table-wrap {mainTableWrapClasses}">',
                    //       { main table }
                    '      </div>',
                    '    </div>',
                    '  </div>',
                    // { float left top panel }
                    // { float left panel }
                    '</div>'
                ]
            };

            /**
             *
             */
            function init() {

                render();
                setDefault();
                updateTargets();

                addListeners();
                draw();
            }

            /**
             *
             */
            function addListeners() {

                // horizontalHead
                modules.horizontalHead.addListener('renderedView', function (view) {
                    rendered.horizontalHead.view = view;
                    draw('horizontalHead', 'view');
                });

                modules.horizontalHead.addListener('renderedStyle', function (style) {
                    rendered.horizontalHead.style = style;
                    draw('horizontalHead', 'style');
                });

                // combinationHead
                modules.combinationHead.addListener('renderedView', function (view) {
                    rendered.combinationHead.view = view;
                    draw('combinationHead', 'view');
                });

                modules.combinationHead.addListener('renderedStyle', function (style) {
                    rendered.combinationHead.style = style;
                    draw('combinationHead', 'style');
                });

                // verticalHead
                modules.verticalHead.addListener('renderedView', function (view) {
                    rendered.verticalHead.view = view;
                    draw('verticalHead', 'view');
                });

                modules.verticalHead.addListener('renderedStyle', function (style) {
                    rendered.verticalHead.style = style;
                    draw('verticalHead', 'style');
                });

                // horizontalScroll
                modules.horizontalScroll.addListener('renderedView', function (view) {
                    rendered.horizontalScroll.view = view;
                    draw('horizontalScroll', 'view');
                });

                modules.horizontalScroll.addListener('renderedStyle', function (style) {
                    rendered.horizontalScroll.style = style;
                    draw('horizontalScroll', 'style');
                });
            }

            /**
             *
             */
            function render() {
                rendered.main.view = renderView();
                rendered.main.style = renderStyle();
            }

            /**
             *
             */
            function setDefault() {

                foundTargets['$defaultTable'].css('margin', '0 !important');
                foundTargets['$defaultTableDefaultParent'].css('overflow', 'hidden');

                foundTargets['$styleContainer'] = $('<style id="shtable-style"></style>');
                foundTargets['$document'].find(settings.styleContainer).append(foundTargets['$styleContainer']);
            }

            /**
             *
             */
            function updateTargets() {

                foundTargets['$mainContainer'] = rendered.main.view;
                foundTargets['$mainWrap'] = rendered.main.view.find('.shtable__main-wrap');
                foundTargets['$mainTableInner'] = rendered.main.view.find('.shtable__main-table-inner');
                foundTargets['$mainTableWrap'] = rendered.main.view.find('.shtable__main-table-wrap');
            }

            /**
             *
             * @param renderedModule
             * @param renderedType
             */
            function draw(renderedModule, renderedType) {

                if (firstDraw) {

                    foundTargets['$defaultTableDefaultParent'].append(rendered.main.view);
                    foundTargets['$mainTableWrap'].append(foundTargets['$defaultTable']);

                    firstDraw = false;
                }

                if (renderedModule && renderedType === 'view') {

                    if (renderedModule === 'horizontalHead') {
                        foundTargets['$mainTableInner'].find('.shtable__horizontal-head-container').remove();
                        foundTargets['$mainTableInner'].append(rendered.horizontalHead.view);
                    }

                    if (renderedModule === 'combinationHead') {
                        foundTargets['$mainContainer'].find('.shtable__combination-head-container').remove();
                        foundTargets['$mainContainer'].append(rendered.combinationHead.view);
                    }

                    if (renderedModule === 'verticalHead') {
                        foundTargets['$mainContainer'].find('.shtable__vertical-head-container').remove();
                        foundTargets['$mainContainer'].append(rendered.verticalHead.view);
                    }

                    if (renderedModule === 'horizontalScroll') {
                        foundTargets['$mainContainer'].find('.shtable__horizontal-scroll-container').remove();
                        foundTargets['$mainContainer'].append(rendered.horizontalScroll.view);
                    }
                }

                foundTargets['$styleContainer'].html([
                    rendered.main.style,
                    rendered.horizontalHead.style,
                    rendered.combinationHead.style,
                    rendered.verticalHead.style,
                    rendered.horizontalScroll.style
                ].join(''));
            }

            /**
             *
             * @returns {string}
             */
            function renderView() {

                var view = templates.main.join(''), i = 0,
                    customClassesNamesLength = customClassesNames.length;

                for (i = 0; i < customClassesNamesLength; i++) {
                    view = view.replace('{' + customClassesNames[i] + '}', settings[customClassesNames[i]] ? settings[customClassesNames[i]] : '');
                }

                return $(view);
            }


            /**
             *
             * @returns {string}
             */
            function renderStyle() {
                return [

                    // mainContainer
                    '.shtable__main-container {',
                    '  position: relative;',
                    '  overflow: visible;',
                    '  display: block;',
                    '  width: 100%;',
                    '}',

                    // mainWrap
                    '.shtable__main-wrap {',
                    '  position: relative;',
                    '  overflow: hidden;',
                    '  overflow-x: auto;',
                    '}',

                    // mainTableInner
                    '.shtable__main-table-inner {',
                    '  position: relative;',
                    '  overflow: visible;',
                    '  display: inline-block;',
                    '  width: auto;',
                    '}',

                    // mainTableWrap
                    '.shtable__main-table-wrap {',
                    '  position: relative;',
                    '  overflow: visible;',
                    '  display: inline-block;',
                    '  width: auto;',
                    '}'

                ].join('');
            }

            /**
             *
             * @param type
             * @param data
             */
            function fire(type, data) {
                listeners[type] && listeners[type].fire(data);
            }

            /**
             *
             * @param type
             * @param func
             */
            function addListener(type, func) {
                listeners[type] && listeners[type].addListener(func);
            }

            return {
                init: function () {
                    init();
                },
                addListener: function (type, func) {
                    addListener(type, func);
                }
            }

        })(settings, modules);

        /**
         *
         * @type {{init, addListener}}
         */
        modules['horizontalHead'] = (function (settings, modules) {

            var customClassesNames, templates,
                listeners = {
                    renderedView: modules.factory.createObserver(),
                    renderedStyle: modules.factory.createObserver()
                },
                rendered = {
                    view: null,
                    style: null
                },
                values = {
                    offsetTop: 1,
                    offsetBottom: -1,
                    scrollLeft: 0
                },
                foundTargets = modules.targetsStorage.foundTargets;

            customClassesNames = [
                'horizontalHeadContainerClasses',
                'horizontalHeadTableWrapClasses',
                'horizontalHeadTableClasses'
            ];

            templates = {
                main: [
                    '<div class="shtable__horizontal-head-container {horizontalHeadContainerClasses}">',
                    '  <div class="shtable__horizontal-head-table-wrap {horizontalHeadTableWrapClasses}">',
                    '    <table class="shtable__horizontal-head-table {horizontalHeadTableClasses}"></table>',
                    '  </div>',
                    '</div>'
                ]
            };

            /**
             *
             */
            function init() {

                render();
                updateTargets();

                addListeners();
                prepare();

                emit();
            }

            /**
             *
             */
            function emit() {
                fire('renderedView', rendered.view);
                fire('renderedStyle', rendered.style);
            }

            /**
             *
             */
            function addListeners() {

                modules.eventManager.addListener('verticalScroll', function (data) {

                    var defaultTableWidth = foundTargets['$defaultTable'].width(),
                        defaultTableDefaultParentWidth = foundTargets['$defaultTableDefaultParent'].width();

                    values.offsetTop = data.offsetTop;
                    values.offsetBottom = data.offsetBottom;

                    if (values.offsetTop <= 0) {
                        foundTargets['$horizontalHeadContainer'].css('width', defaultTableDefaultParentWidth).css('top', settings.offsetTop).addClass('shtable__horizontal-head-container--fixed');
                        foundTargets['$horizontalHeadTableWrap'].css('width', defaultTableWidth);
                    } else {
                        foundTargets['$horizontalHeadContainer'].css('width', defaultTableWidth).css('top', 0).removeClass('shtable__horizontal-head-container--fixed');
                        foundTargets['$horizontalHeadTableWrap'].css('width', defaultTableWidth);
                    }
                });

                modules.eventManager.addListener('horizontalScroll', function (data) {

                    values.scrollLeft = data.scrollLeft;
                    foundTargets['$horizontalHeadTableWrap'].css('left', values.scrollLeft * (-1));
                });
            }

            /**
             *
             * @returns {{style: string, view: string}}
             */
            function render() {
                rendered.view = renderView();
                rendered.style = renderStyle();
            }

            /**
             *
             */
            function updateTargets() {

                foundTargets['$horizontalHeadContainer'] = rendered.view;
                foundTargets['$horizontalHeadTableWrap'] = rendered.view.find('.shtable__horizontal-head-table-wrap');
                foundTargets['$horizontalHeadTable'] = rendered.view.find('.shtable__horizontal-head-table');
            }

            /**
             *
             * @returns {string}
             */
            function renderView() {

                var view = templates.main.join(''), i = 0,
                    customClassesNamesLength = customClassesNames.length;

                for (i = 0; i < customClassesNamesLength; i++) {
                    view = view.replace('{' + customClassesNames[i] + '}', settings[customClassesNames[i]] ? settings[customClassesNames[i]] : '');
                }

                return $(view);
            }

            /**
             *
             * @returns {*}
             */
            function prepare() {

                var cloneTableHeadElements = [],
                    $defaultTableHeadElements = foundTargets['$defaultTable'].find('thead th'),
                    defaultTableWidth = foundTargets['$defaultTable'].width(),
                    defaultTableDefaultParentWidth = foundTargets['$defaultTableDefaultParent'].width();

                foundTargets['$horizontalHeadTable'].append(foundTargets['$defaultTable'].find('thead').clone());

                // Table head th width
                cloneTableHeadElements = foundTargets['$horizontalHeadTable'].find('thead th');
                $defaultTableHeadElements.length && $defaultTableHeadElements.each(function (index, element) {
                    $(cloneTableHeadElements[index]).attr('width', $(element).outerWidth());
                });

                if (values.offsetTop <= 0) {
                    foundTargets['$horizontalHeadContainer'].css('width', defaultTableDefaultParentWidth).css('top', settings.offsetTop).addClass('shtable__horizontal-head-container--fixed');
                    foundTargets['$horizontalHeadTableWrap'].css('width', defaultTableWidth);
                } else {
                    foundTargets['$horizontalHeadContainer'].css('width', defaultTableWidth).css('top', 0).removeClass('shtable__horizontal-head-container--fixed');
                    foundTargets['$horizontalHeadTableWrap'].css('width', defaultTableWidth);
                }

                foundTargets['$horizontalHeadTableWrap'].css('left', values.scrollLeft * (-1));
            }

            /**
             *
             * @returns {string}
             */
            function renderStyle() {
                return [

                    // horizontalHeadTableContainer
                    '.shtable__horizontal-head-container {',
                    '  overflow: hidden;',
                    '  max-width: none;',
                    '  position: absolute;',
                    '  top: 0;',
                    '  background: #FCFCFC;',
                    '  z-index: 1000;',
                    '  display: block;',
                    '  background: #ffffff;',
                    '}',

                    //
                    '.shtable__horizontal-head-container--fixed {',
                    '  position: fixed;',
                    '  -webkit-box-shadow: 0 3px 4px -3px rgba(0, 0, 0, 0.45);',
                    '  -moz-box-shadow: 0 3px 4px -3px rgba(0, 0, 0, 0.45);',
                    '  box-shadow: 0 3px 4px -3px rgba(0, 0, 0, 0.45);',
                    '}',

                    // horizontalHeadTableWrap
                    '.shtable__horizontal-head-table-wrap {',
                    '  position: static;',
                    '}',

                    '.shtable__horizontal-head-container--fixed .shtable__horizontal-head-table-wrap {',
                    '  position: relative;',
                    '}',

                    // horizontalHeadTable
                    'table.shtable__horizontal-head-table {',
                    '  table-layout: fixed;',
                    '  margin: 0 !important;',
                    '  margin-bottom: 0 !important;',
                    '}'

                ].join('');
            }


            /**
             *
             * @param type
             * @param data
             */
            function fire(type, data) {
                listeners[type] && listeners[type].fire(data);
            }

            /**
             *
             * @param type
             * @param func
             */
            function addListener(type, func) {
                listeners[type] && listeners[type].addListener(func);
            }

            return {
                init: function () {
                    init();
                },
                addListener: function (type, func) {
                    addListener(type, func);
                }
            }

        })(settings, modules);

        /**
         * Combination Head Module
         * @type {{init, destroy}}
         */
        modules['combinationHead'] = (function () {

            var customClassesNames, templates,
                listeners = {
                    renderedView: modules.factory.createObserver(),
                    renderedStyle: modules.factory.createObserver()
                },
                rendered = {
                    view: null,
                    style: null
                },
                values = {
                    offsetTop: 1,
                    offsetBottom: -1,
                    scrollLeft: 0
                },
                foundTargets = modules.targetsStorage.foundTargets;

            customClassesNames = [
                'combinationHeadContainerClasses',
                'combinationHeadTableWrapClasses',
                'combinationHeadTableClasses'
            ];

            templates = {
                main: [
                    '<div class="shtable__combination-head-container {combinationHeadContainerClasses}">',
                    '  <div class="shtable__combination-head-table-wrap {combinationHeadTableWrapClasses}">',
                    '    <table class="shtable__combination-head-table {combinationHeadTableClasses}">',
                    '      <thead></thead>',
                    '    </table>',
                    '  </div>',
                    '</div>'
                ]
            };

            /**
             *
             */
            function init() {

                render();
                updateTargets();

                addListeners();
                prepare();

                emit();
            }

            /**
             *
             */
            function emit() {
                fire('renderedView', rendered.view);
                fire('renderedStyle', rendered.style);
            }

            /**
             *
             */
            function updateTargets() {

                foundTargets['$combinationHeadContainer'] = rendered.view;
                foundTargets['$combinationHeadTableWrap'] = rendered.view.find('.shtable__combination-head-table-wrap');
                foundTargets['$combinationHeadTable'] = rendered.view.find('.shtable__combination-head-table');
            }

            /**
             *
             * @returns {string}
             */
            function renderView() {

                var view = templates.main.join(''), i = 0,
                    customClassesNamesLength = customClassesNames.length;

                for (i = 0; i < customClassesNamesLength; i++) {
                    view = view.replace('{' + customClassesNames[i] + '}', settings[customClassesNames[i]] ? settings[customClassesNames[i]] : '');
                }

                return $(view);
            }

            /**
             *
             */
            function addListeners() {

                modules.eventManager.addListener('verticalScroll', function (data) {

                    values.offsetTop = data.offsetTop;
                    values.offsetBottom = data.offsetBottom;

                    if (values.offsetTop < 0) {
                        foundTargets['$combinationHeadContainer'].removeClass('shtable__combination-head-container--absolute');
                        foundTargets['$combinationHeadContainer'].css('top', settings.offsetTop).addClass('shtable__combination-head-container--fixed');
                    } else {
                        foundTargets['$combinationHeadContainer'].removeClass('shtable__combination-head-container--fixed');
                        foundTargets['$combinationHeadContainer'].css('top', 0).addClass('shtable__combination-head-container--absolute');
                    }
                });

                modules.eventManager.addListener('horizontalScroll', function (data) {

                    values.scrollLeft = data.scrollLeft;

                    if (values.scrollLeft > 0) {
                        foundTargets['$combinationHeadContainer'].addClass('shtable__combination-head-container--over-design-right');
                    } else {
                        foundTargets['$combinationHeadContainer'].removeClass('shtable__combination-head-container--over-design-right');
                    }
                });
            }

            /**
             *
             * @returns {{style: string, view: string}}
             */
            function render() {

                rendered.view = renderView();
                rendered.style = renderStyle();
            }

            /**
             *
             * @returns {string}
             */
            function prepare() {

                var $defaultTableHeadRows = foundTargets['$defaultTable'].find('thead tr'),
                    $cloneDefaultTableHeadRows = foundTargets['$defaultTable'].find('thead tr').clone(),
                    viewWidth = 0,
                    viewHeight = 0;

                $cloneDefaultTableHeadRows.each(function (rowIndex, row) {

                    var $cols = $(row).find('th');

                    $($cols.splice(settings.depth, $cols.length)).remove();

                    viewHeight += $($($defaultTableHeadRows[rowIndex]).find('th')[0]).outerHeight();

                    $cols.each(function (colIndex, col) {

                        var $col = $(col),
                            $colOfMain = $($($defaultTableHeadRows[rowIndex]).find('th')[colIndex]),
                            width = $colOfMain.outerWidth(),
                            height = $colOfMain.outerHeight();

                        viewWidth += width;

                        $col.attr('height', height).attr('width', width).css('height', height).css('width', width);
                    });
                });

                foundTargets['$combinationHeadContainer'].css('width', viewWidth).css('height', viewHeight);
                foundTargets['$combinationHeadTable'].css('margin', '0 !important');

                foundTargets['$combinationHeadTable'].find('thead').append($cloneDefaultTableHeadRows);

                if (values.offsetTop < 0) {
                    foundTargets['$combinationHeadContainer'].removeClass('shtable__combination-head-container--absolute');
                    foundTargets['$combinationHeadContainer'].css('top', settings.offsetTop).addClass('shtable__combination-head-container--fixed');
                } else {
                    foundTargets['$combinationHeadContainer'].removeClass('shtable__combination-head-container--fixed');
                    foundTargets['$combinationHeadContainer'].css('top', 0).addClass('shtable__combination-head-container--absolute');
                }

                if (values.scrollLeft > 0) {
                    foundTargets['$combinationHeadContainer'].addClass('shtable__combination-head-container--over-design-right');
                } else {
                    foundTargets['$combinationHeadContainer'].removeClass('shtable__combination-head-container--over-design-right');
                }
            }

            /**
             *
             * @returns {string}
             */
            function renderStyle() {
                return [

                    // combinationHeadContainer
                    '.shtable__combination-head-container {',
                    '  max-width: none;',
                    '  z-index: 1001;',
                    '  background: #ffffff;',
                    '}',

                    //
                    '.shtable__combination-head-container--absolute {',
                    '  position: absolute;',
                    '  left: 0;',
                    '  top: 0;',
                    '}',

                    //
                    '.shtable__combination-head-container--fixed {',
                    '  position: fixed;',
                    '}',

                    //
                    '.shtable__combination-head-container--over-design-right:before {',
                    '  content: "";',
                    '  display: block;',
                    '  position: absolute;',
                    '  top: 0;',
                    '  right: -2px;',
                    '  bottom: 0;',
                    '  width: 3px;',
                    '  background: #d5d5d5;',
                    '}',

                    //
                    '.shtable__combination-head-table {',
                    '  table-layout: fixed;',
                    '}'

                ].join('');
            }


            /**
             *
             * @param type
             * @param data
             */
            function fire(type, data) {
                listeners[type] && listeners[type].fire(data);
            }

            /**
             *
             * @param type
             * @param func
             */
            function addListener(type, func) {
                listeners[type] && listeners[type].addListener(func);
            }

            return {
                init: function () {
                    init();
                },
                addListener: function (type, func) {
                    addListener(type, func);
                }
            }

        })();

        /**
         * Vertical Head Module
         * @type {{init, destroy}}
         */
        modules['verticalHead'] = (function () {

            var customClassesNames, templates,
                listeners = {
                    renderedView: modules.factory.createObserver(),
                    renderedStyle: modules.factory.createObserver()
                },
                rendered = {
                    view: null,
                    style: null
                },
                values = {
                    offsetTop: 1,
                    offsetBottom: -1,
                    scrollLeft: 0
                },
                foundTargets = modules.targetsStorage.foundTargets;

            customClassesNames = [
                'verticalHeadContainerClasses',
                'verticalHeadTableWrapClasses',
                'verticalHeadTableClasses'
            ];

            templates = {
                main: [
                    '<div class="shtable__vertical-head-container {verticalHeadContainerClasses}">',
                    '  <div class="shtable__vertical-head-table-wrap {verticalHeadTableWrapClasses}">',
                    '    <table class="shtable__vertical-head-table {verticalHeadTableClasses}">',
                    '      <thead></thead>',
                    '      <tbody></tbody>',
                    '    </table>',
                    '  </div>',
                    '</div>'
                ]
            };

            /**
             *
             */
            function init() {

                render();
                updateTargets();

                addListeners();
                prepare();

                emit();
            }

            /**
             *
             */
            function emit() {
                fire('renderedView', rendered.view);
                fire('renderedStyle', rendered.style);
            }

            /**
             *
             */
            function updateTargets() {

                foundTargets['$verticalHeadContainer'] = rendered.view;
                foundTargets['$verticalHeadTableWrap'] = rendered.view.find('.shtable__vertical-head-table-wrap');
                foundTargets['$verticalHeadTable'] = rendered.view.find('.shtable__vertical-head-table');
            }

            /**
             *
             * @returns {string}
             */
            function renderView() {

                var view = templates.main.join(''), i = 0,
                    customClassesNamesLength = customClassesNames.length;

                for (i = 0; i < customClassesNamesLength; i++) {
                    view = view.replace('{' + customClassesNames[i] + '}', settings[customClassesNames[i]] ? settings[customClassesNames[i]] : '');
                }

                return $(view);
            }

            /**
             *
             */
            function addListeners() {

                modules.eventManager.addListener('verticalScroll', function (data) {

                    values.offsetTop = data.offsetTop;
                    values.offsetBottom = data.offsetBottom;
                });

                modules.eventManager.addListener('horizontalScroll', function (data) {

                    values.scrollLeft = data.scrollLeft;

                    if (values.scrollLeft > 0) {
                        foundTargets['$verticalHeadContainer'].addClass('shtable__vertical-head-container--over-design-right');
                    } else {
                        foundTargets['$verticalHeadContainer'].removeClass('shtable__vertical-head-container--over-design-right');
                    }
                });
            }

            /**
             *
             * @returns {{style: string, view: string}}
             */
            function render() {

                rendered.view = renderView();
                rendered.style = renderStyle();
            }

            /**
             *
             * @returns {string}
             */
            function prepare() {

                var $defaultTableHeadRows = foundTargets['$defaultTable'].find('thead tr'),
                    $defaultTableBodyRows = foundTargets['$defaultTable'].find('tbody tr'),
                    $cloneDefaultTableHeadRows = foundTargets['$defaultTable'].find('thead tr').clone(),
                    $cloneDefaultTableBodyRows = foundTargets['$defaultTable'].find('tbody tr').clone(),
                    viewWidth = 0,
                    viewHeight = 0;

                $cloneDefaultTableHeadRows.each(function (rowIndex, row) {

                    var $cols = $(row).find('th');

                    $($cols.splice(settings.depth, $cols.length)).remove();

                    viewHeight += $($($defaultTableHeadRows[rowIndex]).find('th')[0]).outerHeight();

                    $cols.each(function (colIndex, col) {

                        var $col = $(col),
                            $colOfMain = $($($defaultTableHeadRows[rowIndex]).find('th')[colIndex]),
                            width = $colOfMain.outerWidth(),
                            height = $colOfMain.outerHeight();

                        viewWidth += width;

                        $col.attr('height', height).attr('width', width).css('height', height).css('width', width);
                    });
                });

                $cloneDefaultTableBodyRows.each(function (rowIndex, row) {

                    var $cols = $(row).find('td');

                    $($cols.splice(settings.depth, $cols.length)).remove();

                    viewHeight += $($($defaultTableBodyRows[rowIndex]).find('td')[0]).outerHeight();

                    $cols.each(function (colIndex, col) {

                        var $col = $(col),
                            $colOfMain = $($($defaultTableBodyRows[rowIndex]).find('td')[colIndex]),
                            width = $colOfMain.outerWidth(),
                            height = $colOfMain.outerHeight();

                        $col.attr('height', height).attr('width', width).css('height', height).css('width', width);
                    });
                });

                foundTargets['$verticalHeadContainer'].css('width', viewWidth).css('height', viewHeight);
                foundTargets['$verticalHeadTable'].css('margin', '0 !important');

                foundTargets['$verticalHeadTable'].find('thead').append($cloneDefaultTableHeadRows);
                foundTargets['$verticalHeadTable'].find('tbody').append($cloneDefaultTableBodyRows);
            }

            /**
             *
             * @returns {string}
             */
            function renderStyle() {
                return [

                    // verticalHeadContainer
                    '.shtable__vertical-head-container {',
                    '  max-width: none;',
                    '  position: absolute;',
                    '  left: 0;',
                    '  top: 0;',
                    '  z-index: 998;',
                    '  background: #ffffff;',
                    '}',

                    // verticalTableContainer
                    '.shtable__vertical-head-container--over-design-right:before {',
                    '  content: "";',
                    '  display: block;',
                    '  position: absolute;',
                    '  top: 0;',
                    '  right: -2px;',
                    '  bottom: 0;',
                    '  width: 3px;',
                    '  background: #d5d5d5;',
                    '}',

                    //
                    '.shtable__vertical-head-table {',
                    '  table-layout: fixed;',
                    '}'

                ].join('');
            }


            /**
             *
             * @param type
             * @param data
             */
            function fire(type, data) {
                listeners[type] && listeners[type].fire(data);
            }

            /**
             *
             * @param type
             * @param func
             */
            function addListener(type, func) {
                listeners[type] && listeners[type].addListener(func);
            }

            return {
                init: function () {
                    init();
                },
                addListener: function (type, func) {
                    addListener(type, func);
                }
            }

        })();

        /**
         * Horizontal Scroll Module
         * @type {{init, destroy}}
         */
        modules['horizontalScroll'] = (function (settings, modules) {

            var customClassesNames, templates,
                listeners = {
                    renderedView: modules.factory.createObserver(),
                    renderedStyle: modules.factory.createObserver()
                },
                rendered = {
                    view: null,
                    style: null
                },
                values = {
                    offsetTop: 0,
                    offsetBottom: 0,
                    scrollLeft: 0,
                    defaultTableDefaultParentWidthLast: 0,
                    defaultTableWidthLast: 0
                },
                foundTargets = modules.targetsStorage.foundTargets;

            customClassesNames = [
                'horizontalScrollContainerClasses',
                'horizontalScrollContentClasses'
            ];

            templates = {
                main: [
                    '<div class="shtable__horizontal-scroll-container {horizontalScrollContainerClasses}">',
                    '  <div class="shtable__horizontal-scroll-content {horizontalScrollContentClasses}"></div>',
                    '</div>'
                ]
            };

            /**
             *
             */
            function init() {

                render();
                updateTargets();

                addListeners();
                prepare();

                initEvents();
                emit();
            }

            /**
             *
             */
            function emit() {
                fire('renderedView', rendered.view);
                fire('renderedStyle', rendered.style);
            }

            /**
             *
             */
            function updateTargets() {

                foundTargets['$horizontalScrollContainer'] = rendered.view;
                foundTargets['$horizontalScrollContent'] = rendered.view.find('.shtable__horizontal-scroll-content');
            }

            /**
             *
             * @returns {string}
             */
            function renderView() {

                var view = templates.main.join(''), i = 0,
                    customClassesNamesLength = customClassesNames.length;

                for (i = 0; i < customClassesNamesLength; i++) {
                    view = view.replace('{' + customClassesNames[i] + '}', settings[customClassesNames[i]] ? settings[customClassesNames[i]] : '');
                }

                return $(view);
            }

            /**
             *
             */
            function addListeners() {

                modules.eventManager.addListener('verticalScroll', function (data) {

                    var windowHeight = foundTargets['$window'].height(),
                        active = ((data.offsetBottom - settings.horizontalScrollHeight * 2) <= 0) && (data.offsetTop + settings.offsetTop + settings.horizontalScrollHeight < windowHeight);

                    values.offsetTop = data.offsetTop;
                    values.offsetBottom = data.offsetBottom;

                    foundTargets['$horizontalScrollContainer'].css('visibility', active ? 'visible' : 'hidden');
                    foundTargets['$horizontalScrollContainer'].css('height', active ? settings.horizontalScrollHeight : 0);
                });

                modules.eventManager.addListener('horizontalScroll', function (data) {

                    var defaultTableDefaultParentWidth = foundTargets['$defaultTableDefaultParent'].width(),
                        defaultTableWidth = foundTargets['$defaultTable'].width();

                    values.scrollLeft = data.scrollLeft;
                    foundTargets['$horizontalScrollContainer'].scrollLeft(data.scrollLeft);

                    if (defaultTableDefaultParentWidth !== values.defaultTableDefaultParentWidthLast || defaultTableWidth !== values.defaultTableWidthLast) {
                        foundTargets['$horizontalScrollContainer'].css('width', defaultTableDefaultParentWidth);
                        foundTargets['$horizontalScrollContent'].css('width', defaultTableWidth);
                    }
                });
            }

            /**
             *
             * @returns {{style: string, view: string}}
             */
            function render() {
                rendered.view = renderView();
                rendered.style = renderStyle();
            }

            /**
             *
             * @returns {string}
             */
            function prepare() {

                var defaultTableDefaultParentWidth = foundTargets['$defaultTableDefaultParent'].width(),
                    defaultTableWidth = foundTargets['$defaultTable'].width(),
                    windowHeight = foundTargets['$window'].height(),
                    active = ((values.offsetBottom - settings.horizontalScrollHeight * 2) <= 0) && (values.offsetTop + settings.offsetTop + settings.horizontalScrollHeight < windowHeight);

                // Containers and table width
                foundTargets['$horizontalScrollContainer'].css('visibility', active ? 'visible' : 'hidden');
                foundTargets['$horizontalScrollContainer'].css('width', defaultTableDefaultParentWidth).css('height', active ? settings.horizontalScrollHeight : 0).scrollLeft(values.scrollLeft);
                foundTargets['$horizontalScrollContent'].css('width', defaultTableWidth);
            }

            /**
             *
             */
            function initEvents() {

                foundTargets['$horizontalScrollContainer'].on('scroll', modules.helpers.debounce(execOnHorizontalScroll, 8));
            }

            /**
             *
             */
            function execOnHorizontalScroll() {

                var scrollLeft = foundTargets['$horizontalScrollContainer'].scrollLeft();

                if (values.scrollLeft !== scrollLeft) {

                    values.scrollLeft = scrollLeft;
                    foundTargets['$mainWrap'].scrollLeft(scrollLeft);
                }
            }

            /**
             *
             * @returns {string}
             */
            function renderStyle() {
                return [

                    // horizontalScrollContainer
                    '.shtable__horizontal-scroll-container {',
                    '  position: fixed;',
                    '  visibility: hidden;',
                    '  bottom: ', settings.offsetBottom, 'px;',
                    '  height: auto;',
                    '  overflow: hidden;',
                    '  overflow-x: scroll;',
                    '  z-index: 999;',
                    '  background: #ffffff;',
                    '  border-top: 1px solid #f2f2f1;',
                    '}',

                    // horizontalScrollContent
                    '.shtable__horizontal-scroll-content {',
                    '  height: 1px;',
                    '}'

                ].join('');
            }


            /**
             *
             * @param type
             * @param data
             */
            function fire(type, data) {
                listeners[type] && listeners[type].fire(data);
            }

            /**
             *
             * @param type
             * @param func
             */
            function addListener(type, func) {
                listeners[type] && listeners[type].addListener(func);
            }

            return {
                init: function () {
                    init();
                },
                addListener: function (type, func) {
                    addListener(type, func);
                }
            }

        })(settings, modules);

        start();

        return {
            actions: {
                /**
                 *
                 * @param offsetTop
                 */
                setOffsetTop: modules.helpers.debounce(function (offsetTop) {
                    settings.offsetTop = offsetTop;
                    modules.eventManager.emitMissEvents();
                }, 50),
                /**
                 *
                 */
                setOffsetBottom: modules.helpers.debounce(function (offsetBottom) {
                    settings.offsetBottom = offsetBottom;
                    modules.eventManager.emitMissEvents();
                }, 50),
                /**
                 *
                 * @param type
                 * @param func
                 */
                addListener: function (type, func) {
                    modules.eventManager.addListener(type, func);
                }
            }
        };

    };

})(jQuery);
