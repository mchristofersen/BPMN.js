'use strict';

var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory'),
  getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  is = require('bpmn-js/lib/util/ModelUtil').is,
  cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');



module.exports = function(group, element, bpmnFactory) {
  console.log(element);
  // Documentation
  if (is(element, 'bpmn:ExclusiveGateway')) {

  var entry = entryFactory.table({
    id: 'signals',
    labels: element.outgoing.map(function (elem){
      return elem.name || elem.id
    }),
    modelProperties: ['expression','name'],
    getElements: function (element,node,entry,value){
      console.log([node,entry,value]);
      return element.outgoing.map(function (elem){
        return getBusinessObject(elem);
      });


    },
    updateElement: function (element,properties,node,value){
      console.log([element,properties,node,value])
    return cmdHelper.updateProperties(element, properties);
    }
  });

    group.entries.push(entry);

// && element.sourceRef.test(/ExclusiveGateway.*/)
  }else if(is(element,'bpmn:SequenceFlow')){
    var entry = entryFactory.textField({
      id: 'expression',
      description: '',
      label: 'expression',
      modelProperty: 'expression',
      getProperty: function(element) {
        return element.expression;
      },
      setProperty: function(element, properties) {
        return cmdHelper.updateProperties(element, properties);
      },
    });
    group.entries.push(entry);

  };

};
