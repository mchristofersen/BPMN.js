'use strict';

var is = require('bpmn-js/lib/util/ModelUtil').is,
  entryFactory = require('../../../factory/EntryFactory');


module.exports = function(group, element) {
  if(is(element, 'bpmn:Task')) {
    var entry = {}
    entry.id = element.id + "-content";
    entry.html = `<div id="camunda-content" class="btn btn-primary btn-raised">Open in Editor</div>`;
    group.entries.push(entry);
    group.entries.push(entryFactory.textArea({
      id : 'js',
      description : 'Assignee of the User Task',
      label : 'JS',
      modelProperty : 'js'
    }));

  if (is(element, 'bpmn:UserTask')){
    group.entries.push(entryFactory.textArea({
      id : 'html',
      description : 'Assignee of the User Task',
      label : 'HTML',
      modelProperty : 'html'
    }));
    group.entries.push(entryFactory.textArea({
      id : 'css',
      description : 'Assignee of the User Task',
      label : 'CSS',
      modelProperty : 'css'
    }));
  }





    //
    // // Candidate Users
    // group.entries.push(entryFactory.textField({
    //   id : 'candidateUsers',
    //   description : 'A list of candidates for this User Task',
    //   label : 'Candidate Users',
    //   modelProperty : 'candidateUsers'
    // }));
    //
    // // Candidate Groups
    // group.entries.push(entryFactory.textField({
    //   id : 'candidateGroups',
    //   description : 'A list of candidate groups for this User Task',
    //   label : 'Candidate Groups',
    //   modelProperty : 'candidateGroups'
    // }));
    //
    // // Due Date
    // group.entries.push(entryFactory.textField({
    //   id : 'dueDate',
    //   description : 'The due date as an EL expression (e.g. ${someDate} or an ISO date (e.g. 2015-06-26T09:54:00)',
    //   label : 'Due Date',
    //   modelProperty : 'dueDate'
    // }));
    //
    // // FollowUp Date
    // group.entries.push(entryFactory.textField({
    //   id : 'followUpDate',
    //   description : 'The follow up date as an EL expression (e.g. ${someDate} or an ' +
    //                 'ISO date (e.g. 2015-06-26T09:54:00)',
    //   label : 'Follow Up Date',
    //   modelProperty : 'followUpDate'
    // }));
    //
    // // priority
    // group.entries.push(entryFactory.textField({
    //   id : 'priority',
    //   description : 'Priority of this User Task',
    //   label : 'Priority',
    //   modelProperty : 'priority'
    // }));
  }
};