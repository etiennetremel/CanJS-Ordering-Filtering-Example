require.config({
    baseUrl: 'assets/scripts',
    paths: {
        'jquery': 'http://code.jquery.com/jquery-1.8.2'
    }
});

require(['domReady', 'spin.min'], function (domReady, Spinner) {
    domReady(function() {
        // Dom ready, display spinner
        this.spinner = new Spinner().spin(document.getElementById('loader'));
    });

    require(['can/util/library', 'can/control/route', 'can/model', 'can/view/ejs', 'can/route', 'can/util/string', 'can/util/object', 'can/util/fixture'], function (can) {

        // Hide and stop Spinner and
        $('#loader').fadeOut(function() {
            this.spinner.stop();
        });

        // Extend List property to be able to sort datas
        $.extend(can.Observe.List.prototype, {
            sort: function (comparator, reverse) {
                reverse = (typeof reverse === "undefined") ? false : true;
                var sort = [function (a, b) {
                    return a[comparator] - b[comparator];
                }],
                    res = [].sort.apply(this, sort);

                if (reverse) {
                    this.reverse();
                }
                can.trigger(this, "reset");
            }
        });


        /**
         * Define Model
         */
        Albums = can.Model.extend({
            findAll: 'GET datas/albums.json'
        }, {});


        /**
         * Define Controller
         */
        var AlbumController = can.Control.extend({

            // Return unique value of an array
            findUnique: function (arr, key, sort) {
                var output = [],
                    sort = sort || true;

                can.each(arr, function (value) {
                    if (typeof value[key] === 'object') {
                        can.each(value[key], function (v) {
                            if (output.indexOf(v) === -1) {
                                output.push(v);
                            }
                        });
                    } else {
                        if (output.indexOf(value[key]) === -1) {
                            output.push(value[key]);
                        }
                    }
                });

                // Sort alphabetically
                output.sort();

                return output;
            },
            init: function () {
                var self = this;

                // Fetch datas
                Albums.findAll({}, function (datas) {
                    self.Datas = {
                        Albums: datas.albums,
                        Labels: self.findUnique(datas.albums, 'label'),
                        Genres: self.findUnique(datas.albums, 'genres')
                    };

                    // Push to the view
                    self.element.find('#wrap').html(can.view('listAlbums', {
                        datas: self.Datas
                    }));

                    // Single album, first album from the list
                    self.element.find('#single-album').html(can.view('singleAlbum', {
                        album: self.Datas.Albums[0]
                    }));
                });
            },
            '.filter.reset click': function (el, ev) {
                $.each(this.Datas.Albums, function (i, album) {
                    album.attr('visible', true);
                });
            },
            '.filter.less-than-5 click': function (el, ev) {
                $.each(this.Datas.Albums, function (i, album) {
                    if (parseFloat(album.price) <= 5) {
                        album.attr('visible', true);
                    } else {
                        album.attr('visible', false);
                    }
                });
            },
            '.filter.between-5-and-10 click': function (el, ev) {
                $.each(this.Datas.Albums, function (i, album) {
                    if (parseFloat(album.price) > 5 && parseFloat(album.price) < 10) {
                        album.attr('visible', true);
                    } else {
                        album.attr('visible', false);
                    }
                });
            },
            '.filter.more-than-10 click': function (el, ev) {
                $.each(this.Datas.Albums, function (i, album) {
                    if (parseFloat(album.price) >= 10) {
                        album.attr('visible', true);
                    } else {
                        album.attr('visible', false);
                    }
                });
            },
            '.filter.order-desc click': function (el, ev) {
                var self = this;
                self.Datas.Albums.sort('order');
                self.element.find('#wrap').html(can.view('listAlbums', {
                    datas: self.Datas
                }));
            },
            '.filter.order-asc click': function (el, ev) {
                var self = this;
                self.Datas.Albums.sort('order', true);
                self.element.find('#wrap').html(can.view('listAlbums', {
                    datas: self.Datas
                }));
            },
            '#filter-by-label change': function (el, ev) {
                var value = el.find(':selected').val();

                $.each(this.Datas.Albums, function (i, album) {
                    if (album.label === value || value == 'All') {
                        album.attr('visible', true);
                    } else {
                        album.attr('visible', false);
                    }
                });
            },
            '#filter-by-genre change': function (el, ev) {
                var value = el.find(':selected').val();

                $.each(this.Datas.Albums, function (i, album) {
                    if (album.genres.indexOf(value) > -1 || value == 'All') {
                        album.attr('visible', true);
                    } else {
                        album.attr('visible', false);
                    }
                });
            },
            'ul.albums li click': function (el, ev) {
                var self = this;
                self.element.find('#single-album').html(can.view('singleAlbum', {
                    album: self.Datas.Albums[el.closest('li').index()]
                }));
                $('#single-album').removeClass('hide');
            },
            '#single-album .close click': function (el, ev) {
                $('#single-album').addClass('hide');
            }
        });

        /**
         * EJS Helper
         */
        // Shortenize a string
        can.EJS.Helpers.prototype.shortenize = function (string, length, endingSymbol) {
            string = can.trim(string);
            return (string.length > length) ? string.substring(0, length || 50) + (endingSymbol || '...') : string;
        }

        // Make it rocks
        new AlbumController('body');
    });
});