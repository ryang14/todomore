import { Template } from 'meteor/templating';

import './share.html';

Template.share.helpers({
    isOwner() {
        return this.item.owner === Meteor.userId();
    },
    sharedWith() {
        return this.item.sharedWith;
    },
});

Template.share.events({
    'submit .share-with'(event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const user = target.user.value;

        // Insert a task into the collection
        Meteor.call(this.type + 's.shareWith', this.item._id, user);

        // Clear form
        target.user.value = '';
    },
});