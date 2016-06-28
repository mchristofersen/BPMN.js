 'use strict';

 var entryFactory = require('../../../factory/EntryFactory'),
     getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
     is = require('bpmn-js/lib/util/ModelUtil').is,
     cmdHelper = require('../../../helper/CmdHelper');



 module.exports = function(group, element, bpmnFactory) {
         // Documentation
         if (is(element, 'bpmn:ExclusiveGateway')) {
             var i = 0;
             var can
             $.each(element.outgoing, function (idx,elem){
               var entry = {};
               entry.id = elem.id;
               entry.set = function (e,values){
                 var modeling = bpmnJS.get('modeling');
                  modeling.updateProperties(elem, {
                      name: values["name"],
                  });
               },
               entry.get = function (ele){
                 var bo = getBusinessObject(elem),
                  res = {};
                  res["name"] = bo.get("name");
                return res;
               },
               entry.html = '<label for="camunda-' + elem.id + '" ' + '>'+ "Signal" +'</label>' +
               '<div class="pp-field-wrapper" ' +
                 '>' +
                 '<input id="camunda-' + elem.id + '-label" type="text" name="name" ' +
                   ' />' +
               '</div>';
               group.entries.push(entry);
               var expr = entryFactory.textArea({
                 id : elem.id + "expression",
                 description : 'Expression',
                 label : 'Expression',
                 modelProperty: "expression",
                 get: function (ele,nod,entry,value){
                   var bo = getBusinessObject(elem),
                    res = {};
                    res["expression"] = bo.get("expression");

                  return res;
                 },
                 set: function (ele,props,entry,value){
                   console.log(elem,props);
                   var modeling = bpmnJS.get('modeling');
                    modeling.updateProperties(elem, {
                        expression: props.expression,
                    });
                 }

                              })
               group.entries.push(expr);
             })
            //  var entry = entryFactory.table({
            //          id: 'signals',
            //          labels: element.outgoing.map(function(elem) {
            //              return i++
            //          }),
            //          modelProperties: ["name", "expression"],
            //          getElements: function(element, node, entry, value) {
            //              return element.outgoing.map(function(elem) {
            //                  // elem.businessObject.textContent = elem.businessObject.conditionExpression
            //                  return getBusinessObject(elem);
             //
            //              });
             //
             //
            //          },
            //          updateElement: function(element, properties, node, value) {
            //              var moddle = bpmnJS.get('moddle');
            //              console.log(element.outgoing[value].id);
            //              var sequenceFlowElement = elementRegistry.get(element.outgoing[value].id),
            //                  sequenceFlow = sequenceFlowElement.businessObject;
            //              // create a BPMN element that can be serialized to XML during export
            //              var modeling = bpmnJS.get('modeling');
            //              modeling.updateProperties(sequenceFlowElement, {
            //                  name: properties.name,
            //                  expression: properties.expression
            //              });
            //          }
            //        });
                 //
                //  group.entries.push(entry);

             }

         };
