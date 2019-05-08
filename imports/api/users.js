import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

if (Meteor.isServer) {
    Meteor.publish("userData", function() {
        return Meteor.users.find({ _id: Meteor.userId }, { fields: { 'owns': 1, 'canAccess': 1 } });
    });

    Meteor.publish("AllUserData", function() {
        return Meteor.users.find({}, { fields: { 'username': 1, 'owns': 1, 'canAccess': 1 } });
    });
}

Meteor.methods({
    'user.shareWith' (id, username) {
        check(id, String);
        check(username, String);

        if (!Meteor.user().owns.includes(id)) {
            throw new Meteor.Error('not-authorized');
        }

        const user = Meteor.users.findOne({ username: username })

        if (!user) {
            throw new Meteor.Error('not-found');
        }

        if (!user.owns.includes(id)) Meteor.users.update(user._id, { $addToSet: { canAccess: id } });
    },
    'user.unshareWith' (id, username) {
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