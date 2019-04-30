import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Tasks } from '../../api/tasks.js';

import '../task/task.js';
import './list.css';
import './list.html';

Template.list.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('tasks');
});

Template.list.helpers({
    tasks() {
        const instance = Template.instance();
        if (instance.state.get('hideCompleted')) {
            // If hide completed is checked, filter tasks
            return Tasks.find({ listId: { $eq: this._id }, checked: { $ne: true } }, { sort: { priority: 1, createdAt: -1 } });
        }

        return Tasks.find({ listId: { $eq: this._id } }, { sort: { priority: 1, createdAt: -1 } });
    },
    isOwner() {
        return this.owner === Meteor.userId();
    },
});

Template.list.events({
    'submit .new-task'(event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const text = target.text.value;

        // Insert a task into the collection
        Meteor.call('tasks.insert', text, this._id);

        // Clear form
        target.text.value = '';
    },
    'change .hide-completed input'(event, instance) {
        instance.state.set('hideCompleted', event.target.checked);
    },
    'click .toggle-private-list'() {
      Meteor.call('lists.setPrivate', this._id, !this.private);
    },
    'click .delete-list'() {
        Meteor.call('lists.remove', this._id);
    },
});
