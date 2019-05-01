import { Meteor } from 'meteor/meteor';
import '../imports/api/tasks.js';
import '../imports/api/lists.js';

var resetDailyTasks = new ScheduledTask('every day', function () {
  Meteor.call('tasks.reset', 'daily');
});

var resetWeeklyTasks = new ScheduledTask('every week', function () {
  Meteor.call('tasks.reset', 'weekly');
});

var resetMonthlyTasks = new ScheduledTask('every month', function () {
  Meteor.call('tasks.reset', 'monthly');
});

Meteor.startup(() => {
  resetDailyTasks.start();
  resetWeeklyTasks.start();
  resetMonthlyTasks.start();
});
