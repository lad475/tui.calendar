/**
 * @fileoverview Month view factory module
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 */
'use strict';

var util = global.tui.util;
var config = require('../config'),
    array = require('../common/array'),
    datetime = require('../common/datetime'),
    domutil = require('../common/domutil'),
    Month = require('../view/month/month'),
    MonthClick = require('../handler/month/click'),
    MonthCreation = require('../handler/month/creation'),
    More = require('../view/month/more');

/**
 * @param {Base} baseController - controller instance
 * @param {HTMLElement} layoutContainer - container element for month view
 * @param {Drag} dragHandler - drag handler instance
 * @param {object} options - options
 * @returns {object} view instance and refresh method
 */
function createMonthView(baseController, layoutContainer, dragHandler, options) {
    var monthViewContainer,
        monthView,
        clickHandler,
        creationHandler,
        moreView;

    monthViewContainer = domutil.appendHTMLElement(
        'div', layoutContainer, config.classname('month'));

    monthView = new Month(options.month, monthViewContainer, baseController.Month);
    moreView = new More(layoutContainer);

    // handlers
    clickHandler = new MonthClick(dragHandler, monthView, baseController);
    creationHandler = new MonthCreation(dragHandler, monthView, baseController);

    // binding +n click event
    clickHandler.on('clickMore', function(clickMoreEvent) {
        var date = clickMoreEvent.date,
            events = util.pick(baseController.findByDateRange(
                datetime.start(date),
                datetime.end(date)
            ), clickMoreEvent.ymd);

        if (events && events.length) {
            events = events.sort(array.compare.event.asc);

            moreView.render({
                target: clickMoreEvent.target,
                date: datetime.format(date, 'YYYY.MM.DD'),
                events: events
            });
        }
    });

    monthView.handlers = {
        click: {
            'default': clickHandler 
        },
        creation: {
            'default': creationHandler
        }
    };

    monthView._beforeDestroy = function() {
        moreView.destroy();

        util.forEach(monthView.handlers, function(type) {
            util.forEach(type, function(handler) {
                handler.off();
                handler.destroy();
            });
        });
    };

    return {
        view: monthView,
        refresh: function() {}
    };
}

module.exports = createMonthView;

