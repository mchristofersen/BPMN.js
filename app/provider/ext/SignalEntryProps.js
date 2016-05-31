'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  is = require('bpmn-js/lib/util/ModelUtil').is,
  cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');



module.exports = function(group, element, bpmnFactory) {
  // Documentation
  if (is(element, 'bpmn:ExclusiveGateway')) {

  var entry = entryFactory.table({
    id: 'signals',
    labels: element.outgoing.map(function (elem){
      return elem.name || elem.id
    }),
    modelProperties: ["Signals"],

  });

    group.entries.push(entry);

  }

};
