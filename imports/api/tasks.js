import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Lists } from '../api/lists.js';

export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('tasks', function tasksPublication() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        return Tasks.find({
            $or: [
                { listId: { $in: Meteor.user().owns } },
                { listId: { $in: Meteor.user().canAccess } },
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
            createdBy: Meteor.user().username,
        }, (error, response) => {
            if(!error) Meteor.users.update(Meteor.userId(), { $push: { owns: response } });
        });
    },
    'tasks.edit'(taskId, text) {
        check(taskId, String);
        check(text, String);

        const task = Tasks.findOne(taskId);

        if (!Meteor.user().owns.includes(task.listId) && !Meteor.user().owns.includes(task._id)) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, { $set: { text: text } });
    },
    'tasks.remove'(taskId) {
        check(taskId, String);

        const task = Tasks.findOne(taskId);

        if (!Meteor.user().owns.includes(task.listId) && !Meteor.user().owns.includes(task._id)) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.remove(taskId);
    },
    'tasks.setChecked'(taskId, setChecked) {
        check(taskId, String);
        check(setChecked, Boolean);

        const task = Tasks.findOne(taskId);

        if (!Meteor.user().owns.includes(task.listId) && !Meteor.user().canAccess.includes(task.listId)) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, { $set: { checked: setChecked } });
    },
    'tasks.setRecurring'(taskId, recurring) {
        check(taskId, String);
        check(recurring, String);

        const task = Tasks.findOne(taskId);

        if (!Meteor.user().owns.includes(task.listId) && !Meteor.user().owns.includes(task._id)) {
            throw new Meteor.Error('not-authorized');
        }

        Tasks.update(taskId, { $set: { recurring: recurring } });
    },
    'tasks.reset'(interval) {
        check(interval, String);

        const tasks = Tasks.find({ recurring: { $eq: interval } });

        tasks.forEach(task => {
            if (!Meteor.isServer() && !Meteor.user().owns.includes(task.listId)) {
                throw new Meteor.Error('not-authorized');
            }

            Tasks.update(task._id, { $set: { checked: false } });
        });
    },
});