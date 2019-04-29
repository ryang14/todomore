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
        console.log(this);
        const instance = Template.instance();
        if (instance.state.get('hideCompleted')) {
            // If hide completed is checked, filter tasks
            return Tasks.find({ list: { $eq: this.name }, checked: { $ne: true } }, { sort: { priority: 1, createdAt: -1 } });
        }

        return Tasks.find({ list: { $eq: this.name } }, { sort: { priority: 1, createdAt: -1 } });
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
        Meteor.call('tasks.insert', text, this.name);

        // Clear form
        target.text.value = '';
    },
    'change .hide-completed input'(event, instance) {
        instance.state.set('hideCompleted', event.target.checked);
    },
    'click .delete-list'() {
      Meteor.call('lists.remove', this._id);
    },
});
