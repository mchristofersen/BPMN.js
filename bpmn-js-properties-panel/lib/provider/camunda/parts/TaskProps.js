'use strict';

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
    is = require('bpmn-js/lib/util/ModelUtil').is,
    entryFactory = require('../../../factory/EntryFactory'),
    cmdHelper = require('../../../helper/CmdHelper'),
    script = require('./implementation/Script')('scriptFormat', 'script', false);


module.exports = function(group, element, bpmnFactory) {
  var bo;

  if (false) {
    bo = getBusinessObject(element);
  }

  if (!bo) {
    return;
  }

  group.entries.push(entryFactory.textArea({
    id : 'js',
    description : 'Raw Javascript',
    label : 'js',
    modelProperty : 'js',

    get: function(element, propertyName) {
      var boResultVariable = bo.get('ext:js');

      return { js : boResultVariable };
    },

    set: function(element, values, containerElement) {
      return cmdHelper.updateProperties(element, {
        'ext:js': values.js
      });
    }

  }));

};
