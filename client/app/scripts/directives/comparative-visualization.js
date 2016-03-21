'use strict';

angular.module('greyscaleApp')
    .directive('comparativeViz', function ($window, $http, $stateParams, $q, Organization, greyscaleOrganizationApi, greyscaleModalsSrv, greyscaleProductApi) {
        return {
            restrict: 'E',
            templateUrl: 'views/directives/comparative-visualization.html',
            link: function (scope, element, attrs) {
                // PRODUCT SELECTION
                scope.products = [];

                //Load all products
                function _loadProducts() {
                    return greyscaleOrganizationApi.products(Organization.id).then(function (products) {
                        scope.allProducts = products;

                        // load test data
                        scope.products = JSON.parse('[{"product":{"id":48,"title":"2014 Ratings","description":"2014 Ratings","originalLangId":null,"projectId":56,"surveyId":108,"status":3,"langId":null},"index":{"id":3,"title":"Rating","divisor":1,"questionWeights":{"344":{"weight":1,"type":"value","aggregateType":null}},"subindexWeights":{}},"$$hashKey":"object:101","data":[{"id":14,"name":"Russia","ISO2":"","questions":{"344":4},"subindexes":{},"indexes":{"3":4},"x":10,"y":10,"val":4},{"id":60,"name":"Canada","ISO2":"CA","questions":{"344":3},"subindexes":{},"indexes":{"3":3},"x":45,"y":10,"val":3},{"id":16,"name":"USA","ISO2":"","questions":{"344":5},"subindexes":{},"indexes":{"3":5},"x":80,"y":10,"val":5},{"id":43,"name":"Belgium","ISO2":"BE","questions":{"344":2},"subindexes":{},"indexes":{"3":2},"x":115,"y":10,"val":2},{"id":45,"name":"Bulgaria","ISO2":"BG","questions":{"344":3},"subindexes":{},"indexes":{"3":3},"x":150,"y":10,"val":3},{"id":15,"name":"Germany","ISO2":"","questions":{"344":4},"subindexes":{},"indexes":{"3":4},"x":185,"y":10,"val":4},{"id":70,"name":"China","ISO2":"CN","questions":{"344":5},"subindexes":{},"indexes":{"3":5},"x":220,"y":10,"val":5}]},{"product":{"id":49,"title":"2015 Ratings","description":"2015 Ratings","originalLangId":null,"projectId":56,"surveyId":108,"status":3,"langId":null},"index":{"id":4,"title":"Rating","divisor":1,"questionWeights":{"344":{"weight":1,"type":"value","aggregateType":null}},"subindexWeights":{}},"$$hashKey":"object:127","data":[{"id":14,"name":"Russia","ISO2":"","questions":{"344":3},"subindexes":{},"indexes":{"4":3},"x":10,"y":45,"val":3},{"id":60,"name":"Canada","ISO2":"CA","questions":{"344":4},"subindexes":{},"indexes":{"4":4},"x":45,"y":45,"val":4},{"id":16,"name":"USA","ISO2":"","questions":{"344":4},"subindexes":{},"indexes":{"4":4},"x":80,"y":45,"val":4},{"id":43,"name":"Belgium","ISO2":"BE","questions":{"344":1},"subindexes":{},"indexes":{"4":1},"x":115,"y":45,"val":1},{"id":15,"name":"Germany","ISO2":"","questions":{"344":3},"subindexes":{},"indexes":{"4":3},"x":185,"y":45,"val":3},{"id":70,"name":"China","ISO2":"CN","questions":{"344":5},"subindexes":{},"indexes":{"4":5},"x":220,"y":45,"val":5},{"id":96,"name":"France","ISO2":"FR","questions":{"344":3},"subindexes":{},"indexes":{"4":3},"x":255,"y":45,"val":3}]},{"product":{"id":50,"title":"2016 Ratings","description":"2016 Ratings","originalLangId":null,"projectId":56,"surveyId":108,"status":3,"langId":null},"index":{"id":5,"title":"Rating","divisor":1,"questionWeights":{"344":{"weight":1,"type":"value","aggregateType":null}},"subindexWeights":{}}}]');
                        scope.productsTable.tableParams.reload();
                    });
                }
                Organization.$watch(scope, _loadProducts);

                //Table for product selection and index normalization
                scope.productsTable = {
                    title: 'Selected Products',
                    cols: [{
                        field: 'product.title',
                        title: 'Product',
                        cellClass: 'text-center'
                    }, {
                        field: 'index.title',
                        title: 'Index',
                        cellClass: 'text-center'
                    }, {
                        dataFormat: 'action',
                        actions: [{
                            icon: 'fa-trash',
                            handler: function (row) {
                                for (var i = 0; i < scope.products.length; i++) {
                                    if (scope.products[i].product.id === row.product.id && scope.products[i].index.id === row.index.id) {
                                        scope.products.splice(i, 1);
                                        break;
                                    }
                                }
                                scope.productsTable.tableParams.reload();
                            }
                        }]
                    }],
                    dataPromise: function () {
                        return $q.when(scope.products);
                    },
                    add: {
                        handler: function () {
                            greyscaleModalsSrv.addProduct(function () {
                                return $q.when(scope.allProducts);
                            }).then(function (productIndex) {
                                scope.products.push(productIndex);
                                scope.productsTable.tableParams.reload();
                            });
                        }
                    }
                };

                // DATA AGGREGATION
                scope.aggregates = {};

                scope.$watch('products', function (products) {
                    var promises = [];
                    products.forEach(function (product) {
                        if (!(product.product.id in scope.aggregates)) {
                            var promise = greyscaleProductApi.product(product.product.id).aggregate().then(function(res) {
                                scope.aggregates[product.product.id] = res.agg;
                            });
                            promises.push(promise);
                        }
                    });

                    $q.all(promises).then(function () {
                        renderVisualization(preprocessData(products));
                        if (products.length === 0) {
                            clearVisualization();
                        }
                    });
                }, true);


                // VISUALIZATION
                var layout = {
                    targets: {
                        hPadding: 12.5,
                        vPadding: 12.5,
                        width: 35,
                        height: 35
                    },
                    targetLabels: {
                        fontSize: 12,
                        height: 75,
                        vPadding: 5
                    },
                    productLabels: {
                        fontSize: 12,
                        hPadding: 5,
                        width: 125
                    },
                    axis: {
                        colorWidth: 20,
                        innerPadding: 5,
                        minHeight: 150
                    },
                    colors: ['white', 'blue'] // 2 only
                };

                function preprocessData(productIndexes) {
                    var l = layout.targets;
                    l.positions = {};
                    l.targets = [];

                    var data = productIndexes.map(function (productIndex, idx) {
                        productIndex.data = scope.aggregates[productIndex.product.id].map(function (target) {
                            // horizontal position
                            if (!(target.id in l.positions)) {
                                l.positions[target.id] = Object.keys(l.positions).length * (l.width + l.hPadding) + l.hPadding;
                                l.targets.push(target);
                            }
                            target.x = l.positions[target.id];

                            // vertical position
                            target.y = idx * (l.height + l.vPadding) + l.vPadding;

                            // index value
                            target.val = target.indexes[productIndex.index.id];

                            return target;
                        });
                        return productIndex;
                    });
                    layout.targets = l;
                    return data;
                }

                function clearVisualization(data) {
                    var d3 = $window.d3;
                    var svg = d3.select('svg');
                    svg.select('#grid #background').attr('fill', '#fff');
                    svg.select('#scale #axis').selectAll('*').remove();
                    svg.select('#scale rect').attr('fill', '#fff');
                }

                function renderVisualization(data) {
                    var d3 = $window.d3;

                    // construct color scale
                    var vals = _.flatten(data.map(function (product) {
                        return product.data.map(function (target) {
                            return target.val;
                        });
                    }));
                    var color = d3.scale.linear()
                        .domain([_.min(vals), _.max(vals)])
                        .range(layout.colors);

                    var svg = d3.select('svg');

                    // hover text
                    // TODO: fix tooltips (not working with dynamic data viz)
                    /*var tip = d3.tip()
                        .attr('class', 'd3-tip')
                        .html(function (d) { return d.val; });
                    svg.call(tip);*/

                    // grid of targets
                    var l = layout.targets;
                    var grid = svg.select('#grid')
                        .attr('transform', 'translate(0, ' + (layout.targetLabels.height + layout.targetLabels.vPadding) + ')');

                    // background so white ===> min index value, bg ===> value not present
                    var gridWidth = l.targets.length * (l.width + l.hPadding) + l.hPadding;
                    var gridHeight = data.length * (l.height + l.vPadding) + l.vPadding;
                    grid.select('#background')
                        .attr('width', gridWidth)
                        .attr('height', gridHeight)
                        .attr('fill', '#eee');

                    var rows = grid.selectAll('.row').data(data);
                    rows.enter().append('g')
                        .attr('class', 'row');
                    rows.exit().remove();

                    var cols = rows.selectAll('.target').data(function (d) { return d.data; });
                    cols.enter().append('rect')
                        .attr('class', 'target')
                        .attr('width', l.width)
                        .attr('height', l.height)
                        /*.on('mouseover', tip.show)
                        .on('mouseout', tip.hide)*/;
                    cols.exit().remove();
                    cols
                        .attr('x', function (d) { return d.x; })
                        .attr('y', function (d) { return d.y; })
                        .style('fill', function (d) { return color(d.val); });

                    // target labels
                    var targetLabels = svg.select('#targetLabels');
                    l = layout.targetLabels;
                    var offset = layout.targets.hPadding + layout.targets.width / 2 - l.fontSize / 2;
                    var labels = targetLabels.selectAll('.label').data(layout.targets.targets);
                    labels.enter().append('text')
                        .attr('class', 'label')
                        .attr('text-anchor', 'start')
                        .attr('x', -l.height)
                        .attr('transform', 'rotate(-90)')
                        .style('font-size', l.fontSize + 'px');
                    labels.exit().remove();
                    labels
                        .attr('y', function (d) { return layout.targets.positions[d.id] + offset; })
                        .text(function (d) { return d.name; });

                    // product labels
                    l = layout.productLabels;
                    var hOffset = gridWidth + l.hPadding;
                    var vizWidth = hOffset + l.width + l.hPadding;
                    var vHeight = layout.targets.vPadding + layout.targets.height;
                    offset = layout.targets.vPadding + layout.targets.height / 2 + l.fontSize / 2;
                    var vOffset = layout.targetLabels.height + layout.targetLabels.vPadding;
                    var vizHeight = vOffset + data.length * vHeight + layout.targets.vPadding;
                    var productLabels = svg.select('#productLabels')
                        .attr('transform', 'translate(' + hOffset + ', ' + vOffset + ')');
                    labels = productLabels.selectAll('.label').data(data);
                    labels.enter().append('text')
                        .attr('class', 'label')
                        .attr('x', 0)
                        .style('font-size', l.fontSize + 'px');
                    labels.exit().remove();
                    labels
                        .attr('y', function (d, i) { return i * vHeight + offset; })
                        .text(function (d) { return d.product.title; });
                    

                    // color scale axis
                    l = layout.axis;
                    var axisHeight = vizHeight - vOffset;
                    if (axisHeight < l.minHeight) { axisHeight = l.minHeight; }
                    var scale = svg.select('#scale')
                        .attr('transform', 'translate(' + vizWidth + ', ' + vOffset + ')');
                    var pos = d3.scale.linear() // position encoder
                        .domain(color.domain())
                        .range([0, axisHeight]);
                    var axis = d3.svg.axis()
                        .scale(pos)
                        .orient('right')
                        .ticks(5);

                    // colored scale
                    var gradient = svg.select('defs')
                        .append('linearGradient')
                        .attr('id', 'scaleGradient')
                        .attr('x1', '0%')
                        .attr('y1', '0%')
                        .attr('x2', '0%')
                        .attr('y2', '100%');
                    gradient.append('stop')
                        .attr('offset', '0%')
                        .attr('stop-color', layout.colors[0])
                        .attr('stop-opacity', 1);
                    gradient.append('stop')
                        .attr('offset', '100%')
                        .attr('stop-color', layout.colors[1])
                        .attr('stop-opacity', 1);
                    scale.select('rect')
                        .attr('height', axisHeight)
                        .attr('width', l.colorWidth)
                        .attr('fill', 'url(#scaleGradient)');

                    // numerical axis
                    var axisG = scale.select('#axis')
                        .attr('transform', 'translate(' + (l.colorWidth + l.innerPadding) + ', 0)')
                        .attr('class', 'axis')
                        .call(axis);


                }
            }
        };
    });
