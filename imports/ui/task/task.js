import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './task.css';
import '../share/share.js';
import './task.html';

Template.task.onCreated(function bodyOnCreated() {
  this.editable = new ReactiveVar();
  this.editable.set(false);
});

Template.task.helpers({
  isOwner() {
    return this.owner === Meteor.userId();
  },
  isEditable() {
    return this.owner === Meteor.userId() && Template.instance().editable.get();
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
  'click .text'() {
    Template.instance().editable.set(true);
  },
  'keydown .text'() {
    if (event.key == "Enter") {
      event.preventDefault();
      Meteor.call('tasks.edit', this._id, event.target.innerText);
      Template.instance().editable.set(false);
    }
  },
  'blur .text'() {
    Meteor.call('tasks.edit', this._id, event.target.innerText);
    Template.instance().editable.set(false);
  },
});