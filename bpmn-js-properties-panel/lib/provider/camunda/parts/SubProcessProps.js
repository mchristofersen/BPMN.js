'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    is = require('bpmn-js/lib/util/ModelUtil').is,
    entryFactory = require('../../../factory/EntryFactory'),
    cmdHelper = require('../../../helper/CmdHelper');


module.exports = function(group, element, bpmnFactory) {
  var bo;

  // if (is(element,"bpmn:SubProcess")) {
  //   bo = getBusinessObject(element);
  // }
	//
  // if (!bo) {
  //   return;
  // }
	if (element.businessObject.eventDefinitions && (!element.eventDefinitionType || element.eventDefinitionType=="bpmn:SignalEventDefinition") && is(element,"bpmn:EndEvent")){
		group.entries.push(entryFactory.selectBox({
	    id : 'flowId',
	    description : 'Raw Javascript',
	    label : 'Subflow',
	    modelProperty : 'flowId',
			selectOptions: Object.keys(flows).map(function (idx,elem){
return {name:idx,value:idx};
})}))
	}

	if (is(element,"bpmn:SubProcess")){
		group.entries.push(entryFactory.selectBox({
	    id : 'flowId',
	    description : 'Raw Javascript',
	    label : 'Subflow',
	    modelProperty : 'flowId',
			selectOptions: Object.keys(flows).map(function (idx,elem){
return {name:idx,value:idx};
})
			// get: function(element, node) {
	    //   var bo = getBusinessObject(element);
	    //   var value = bo.get("flowId");
	    //   return { flowId: value };
	    // },
			// set: function(element, values, node) {
			// 	console.log(values)
	    //   var bo = getBusinessObject(element);
	    //   return cmdHelper.updateBusinessObject(bo, {
	    //     flowId: values.flowId
	    //   });
	    // }
	  }));
	}



};
