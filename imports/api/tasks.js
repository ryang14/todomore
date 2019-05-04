import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Lists } from '../api/lists.js';

export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('tasks', function tasksPublication() {
        // Only use userId if user is signed in
        if (Meteor.userId()) {
            return Tasks.find({
                $or: [
                    { private: { $ne: true } },
                    { sharedWith: this.userId },
                    { owner: this.userId },
                ],
            });
        }
        
        return Tasks.find({
            $or: [
                { private: { $ne: true } },
                { owner: this.userId },
            ],
        });
    });
}


Meteor.methods({
    'tasks.insert'(text, listId) {
        check(text, String);
        check(listId, String);

        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        const list = Lists.findOne(listId);
        
        Tasks.insert({
            listId,
            text,
            createdAt: new Date(),
            owner: Meteor.userId(),
            username: Meteor.user().username,
            private: list.private,
            sharedWith: list.sharedWith,
            sharedWithUsernames: list.sharedWithUsernames,
        });
    },
    'tasks.edit'(taskId, text) {
        check(taskId, String);
        check(text, String);

        const task = Tasks.findOne(taskId);

        if (task.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, { $set: { text: text } });
    },
    'tasks.remove'(taskId) {
        check(taskId, String);

        const task = Tasks.findOne(taskId);

        if (task.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.remove(taskId);
    },
    'tasks.setChecked'(taskId, setChecked) {
        check(taskId, String);
        check(setChecked, Boolean);

        const task = Tasks.findOne(taskId);

        if (task.private && task.owner !== Meteor.userId() && !task.sharedWith.includes(Meteor.userId())) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, { $set: { checked: setChecked } });
    },
    'tasks.setPrivate'(taskId, setToPrivate) {
        check(taskId, String);
        check(setToPrivate, Boolean);

        const task = Tasks.findOne(taskId);

        if (task.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, { $set: { private: setToPrivate } });
    },
    'tasks.setRecurring'(taskId, recurring) {
        check(taskId, String);
        check(recurring, String);

        const task = Tasks.findOne(taskId);

        if (task.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, { $set: { recurring: recurring } });
    },
    'tasks.reset'(interval) {
        check(interval, String);

        const tasks = Tasks.find({ recurring: { $eq: interval } });

        tasks.forEach(task => {
            if (!Meteor.isServer && task.owner !== Meteor.userId()) {
                throw new Meteor.Error('not-authorized');
            }
    
            Tasks.update(task._id, { $set: { checked: false } });
        });
    },
    'tasks.shareWith'(taskId, userName) {
        check(taskId, String);
        check(userName, String);

        const task = Tasks.findOne(taskId);
        const user = Meteor.users.findOne({username: userName})

        if (task.owner !== Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        // Make sure the requested user has a valid ID
        check(user._id, String);

        if (user._id != Meteor.userId() && task.sharedWith.includes(user._id)) {
            Tasks.update(task._id, { $push: { sharedWith: user._id } });
            Tasks.update(task._id, { $push: { sharedWithUsernames: user.username } });
        }
    },
});