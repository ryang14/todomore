import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Lists } from '../../api/lists.js';

import '../list/list.js';
import './lists.html';

Template.lists.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('lists');
});

Template.lists.helpers({
    lists() {
        return Lists.find();
    },
});

Template.lists.events({
    'submit .new-list'(event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const text = target.text.value;

        // Insert a list into the collection
        Meteor.call('lists.insert', text);

        // Clear form
        target.text.value = '';
    },
});
