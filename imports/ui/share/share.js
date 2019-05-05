import { Template } from 'meteor/templating';

import './share.html';

Template.share.onCreated(function bodyOnCreated() {
    Meteor.subscribe('AllUserData');
});

Template.share.helpers({
    isOwner() {
        return Meteor.user().owns.includes(this._id);
    },
    sharedWith() {
        const users = Meteor.users.find({canAccess: this._id});

        var usernames = [];
        users.forEach(user => {
            usernames.push({ name: user.username, id: this._id });
        });

        return usernames;
    },
});

Template.share.events({
    'submit .share-with'(event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const user = target.user.value;

        Meteor.call('user.shareWith', this._id, user);

        // Clear form
        target.user.value = '';
    },
    'click .unshare'() {
        Meteor.call('user.unshareWith', this.id, this.name);
    },
});