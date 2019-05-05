import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

if (Meteor.isServer) {
    Meteor.publish("userData", function () {
        return Meteor.users.find({ _id: Meteor.userId },
            { fields: { 'owns': 1, 'canAccess': 1 } });
    });

    Meteor.publish("AllUserData", function () {
        return Meteor.users.find({ },
            { fields: { 'owns': 1, 'canAccess': 1 } });
    });
}

Meteor.methods({
    'user.shareWith'(id, username) {
        check(id, String);
        check(username, String);

        const user = Meteor.users.findOne({ username: username })

        if (!Meteor.user().owns.includes(id)) {
            throw new Meteor.Error('not-authorized');
        }

        if (user.owns.includes(id) || user.canAccess.includes(id)) {
            throw new Meteor.Error('not-authorized');
        }

        // Make sure the requested user has a valid ID
        check(user._id, String);

        Meteor.users.update(user._id, { $push: { canAccess: id } });
    },

    'user.unshareWith'(id, username) {
        check(id, String);
        check(username, String);

        const user = Meteor.users.findOne({ username: username })

        if (!Meteor.user().owns.includes(id)) {
            throw new Meteor.Error('not-authorized');
        }

        // Make sure the requested user has a valid ID
        check(user._id, String);

        Meteor.users.update(user._id, { $pull: { canAccess: id } });
    },
});