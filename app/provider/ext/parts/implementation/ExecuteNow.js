'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');
var is = require('bpmn-js/lib/util/ModelUtil').is;

/**
 * Create an entry to modify the name of an an element.
 *
 * @param  {djs.model.Base} element
 * @param  {Object} options
 * @param  {string} options.id the id of the entry
 * @param  {string} options.label the label of the entry
 *
 * @return {Array<Object>} return an array containing
 *                         the entry to modify the name
 */
module.exports = function(element, options) {

    var executeNowEntry = entryFactory.checkbox({
      id : 'executeNow',
      description : 'Apply a black magic spell',
      label : 'Execute Immediately',
      modelProperty : 'executeNow'
    });

  // options = options || {};
  // var id = options.id || 'executeNow',
  //     label = options.label || 'Execute Now';
  //
  // var nameEntry = entryFactory.checkbox({
  //   id: id,
  //   label: label,
  //   modelProperty: 'executeNow'
  // });
  //
  return [ executeNowEntry ];

};
