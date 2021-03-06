import { Template } from 'meteor/templating';

import './share.css';
import './share.html';

Template.share.onCreated(function bodyOnCreated() {
    Meteor.subscribe('AllUserData');
});

Template.share.helpers({
    isOwner() {
        return Meteor.user().owns && Meteor.user().owns.includes(this._id);
    },
    sharedWith() {
        return Meteor.users.find({ canAccess: this._id }).fetch().map((user) => { return { name: user.username, id: this._id }; });
    },
});

Template.share.events({
    'submit .share-with' (event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const user = target.user.value;

        Meteor.call('user.shareWith', this._id, user);

        // Clear form
        target.user.value = '';
    },
    'click .unshare' () {
        Meteor.call('user.unshareWith', this.id, this.name);
    },
});