'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

var is = require('bpmn-js/lib/util/ModelUtil').is;

module.exports = function(group, element) {

  // Only return an entry, if the currently selected
  // element is a start event.

  if (is(element, 'bpmn:scriptTask')) {
    group.entries.push(entryFactory.checkbox({
      id : 'executeNow',
      description : 'Apply a black magic spell',
      label : 'Execute Immediately',
      modelProperty : 'executeNow'
    }));
  }
};
