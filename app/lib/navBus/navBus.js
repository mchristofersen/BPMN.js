'use strict';

var $ = require("jquery");

function Navbus() {

    this.modeler = null,
        this.fp = null;
    this.bp = null;
    this.listeners = []

}


Navbus.prototype = {
        init: function(config) {
            this.modeler = config.modeler;
            this.fp = config.previews;
            this.bp = config.branchPreviews;
        },
        initListener: function(signal, callback) {
            this.listeners[signal] = callback;
        },
        fire : function(signal, args) {
          console.log(signal)
            return this.listeners[signal].call(args)
        }
			}

        module.exports = Navbus;
