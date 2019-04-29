import { Meteor } from 'meteor/meteor';
import '../imports/api/tasks.js';
import '../imports/api/lists.js';

var resetDailyTasks = new ScheduledTask('at 1:00 am', function () {
  Meteor.call('tasks.reset', 'daily');
});

var resetWeeklyTasks = new ScheduledTask('at 1:00 am on the first day of the week', function () {
  Meteor.call('tasks.reset', 'weekly');
});

var resetMonthlyTasks = new ScheduledTask('at 1:00 am on the first day of the month', function () {
  Meteor.call('tasks.reset', 'monthly');
});

Meteor.startup(() => {
  resetDailyTasks.start();
  resetWeeklyTasks.start();
  resetMonthlyTasks.start();
});
