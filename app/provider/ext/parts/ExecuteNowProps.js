'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  is = require('bpmn-js/lib/util/ModelUtil').is,
  cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');


module.exports = function(group, element, bpmnFactory) {

  // Documentation
  if (is(element, 'bpmn:ScriptTask')) {

  var entry = entryFactory.checkbox({
    id: 'executeNow',
    description: '',
    label: 'Execute Immediately?',
    modelProperty: 'executeNow'

  });
  //
  // entry.set = function(element, values) {
  //   var businessObject = getBusinessObject(element),
  //       newObjectList = [];
  //
  //   if (typeof values.executeNow !== 'undefined' && values.executeNow !== '') {
  //     newObjectList.push(bpmnFactory.create('bpmn:executeNow', {
  //       val: values.executeNow
  //     }));
  //   }
  //
  //   return cmdHelper.setList(element, businessObject, 'executeNow', newObjectList);
  // };
  //
  // entry.get = function(element) {
  //   var businessObject = getBusinessObject(element),
  //       executeNow = businessObject.get('executeNow');
  //       console.log(executeNow);
  //
  //   return { executeNow: executeNow };
  // };

  group.entries.push(entry);
}
};
