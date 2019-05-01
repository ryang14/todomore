import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Tasks } from '../api/tasks.js';

export const Lists = new Mongo.Collection('lists');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('lists', function listsPublication() {
        return Lists.find({
            $or: [
                { private: { $ne: true } },
                { sharedWith: this.userId },
                { owner: this.userId },
            ],
        });
    });
}


Meteor.methods({
    'lists.insert'(name) {
        check(name, String);

        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Lists.insert({
            name,
            createdAt: new Date(),
            owner: Meteor.userId(),
            username: Meteor.user().username,
            private: true,
        });
    },
    'lists.remove'(listId) {
        check(listId, String);

        const list = Lists.findOne(listId);

        if (list.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Lists.remove(listId);
    },
    'lists.setPrivate'(listId, setToPrivate) {
        check(listId, String);
        check(setToPrivate, Boolean);

        const list = Lists.findOne(listId);

        if (list.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Lists.update(listId, { $set: { private: setToPrivate } });
    },
    'lists.reset'(listId) {
        check(listId, String);

        const list = Lists.findOne(listId);
        const tasks = Tasks.find({ recurring: { $eq: "once" } });

        tasks.forEach(task => {
            if (!Meteor.isServer && task.owner !== Meteor.userId()) {
                throw new Meteor.Error('not-authorized');
            }
    
            Tasks.update(task._id, { $set: { checked: false } });
        });
    },
    'lists.shareWith'(listId, userName) {
        check(listId, String);
        check(userName, String);

        const list = Lists.findOne(listId);
        const user = Meteor.users.findOne({username: userName})

        if (list.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Lists.update(list._id, { $push: { sharedWith: user._id } });
    },
});