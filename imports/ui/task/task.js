import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
 
import './task.css';
import './task.html';

Template.task.helpers({
  isOwner() {
    return this.owner === Meteor.userId();
  },
  recurring_once() {
    return this.recurring === "once" ? 'selected' : '';
  },
  recurring_daily() {
    return this.recurring === "daily" ? 'selected' : '';
  },
  recurring_weekly() {
    return this.recurring === "weekly" ? 'selected' : '';
  },
  recurring_monthly() {
    return this.recurring === "monthly" ? 'selected' : '';
  },
});

Template.task.events({
  'click .toggle-checked'() {
    // Set the checked property to the opposite of its current value
    Meteor.call('tasks.setChecked', this._id, !this.checked);
  },
  'click .delete'() {
    Meteor.call('tasks.remove', this._id);
  },
  'click .toggle-private'() {
    Meteor.call('tasks.setPrivate', this._id, !this.private);
  },
  'change .recurring'() {
    Meteor.call('tasks.setRecurring', this._id, event.target.value);
  },
});