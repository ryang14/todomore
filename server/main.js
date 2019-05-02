import { Meteor } from 'meteor/meteor';
import '../imports/api/tasks.js';
import '../imports/api/lists.js';

SyncedCron.config({
  utc: false,
});

SyncedCron.add({
  name: 'Reset daily tasks',
  schedule: function(parser) {
    return parser.text('at 1:00 am');
  }, 
  job: function() {
    Meteor.call('tasks.reset', 'daily');
  }
});

SyncedCron.add({
  name: 'Reset weekly tasks',
  schedule: function(parser) {
    return parser.text('at 1:00 am on the first day of the week');
  }, 
  job: function() {
    Meteor.call('tasks.reset', 'weekly');
  }
});

SyncedCron.add({
  name: 'Reset monthly tasks',
  schedule: function(parser) {
    return parser.text('at 1:00 am on the first day of the month');
  }, 
  job: function() {
    Meteor.call('tasks.reset', 'monthly');
  }
});

Meteor.startup(() => {
  SyncedCron.start();
});
