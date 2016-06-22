'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  is = require('bpmn-js/lib/util/ModelUtil').is,
  cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');


module.exports = function(group, element, bpmnFactory) {
  console.log(is(element, 'bpmn:ScriptEvent'))
  // Documentation
  if (is(element, 'bpmn:ScriptTask')) {

  var entry = entryFactory.textArea({
    id: 'script',
    description: '',
    label: 'Script',
    modelProperty: 'script',
    expandable: true,
    minRows: 5,


  getProperty: function(element) {
    return element.id;
  },
  setProperty: function(element, properties) {
    return cmdHelper.updateProperties(element, properties);
  },
});

  group.entries.push(entry);
}
};
