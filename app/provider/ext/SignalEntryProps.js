"use strict";
var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

var is = require('bpmn-js/lib/util/ModelUtil').is;

module.exports = function(group, element) {
  // only return an entry, if the currently selected element is a start event
  if (false) {
    var table = entryFactory.table({
      id : 'signals',
      description : 'Apply a black magic spell',
      label : 'Signals',
      modelProperties : ['signals'],
      getElements: function (element,node,entry,value){
        return element.outgoing.map(function (elem){
          return getBusinessObject(elem);
        });


      },
      updateElement: function (element,properties,node,value){
      return cmdHelper.updateProperties(element, properties);
      }
    });
    return [table]
  }
};
