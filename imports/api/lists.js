import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Users } from '../api/users';

export const Lists = new Mongo.Collection('lists');

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('lists', function listsPublication() {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        return Lists.find({
            $or: [
                { _id: { $in: Meteor.user().owns } },
                { _id: { $in: Meteor.user().canAccess } },
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
            createdBy: Meteor.user().username,
        }, (error, response) => {
            if(!error) Meteor.users.update(Meteor.userId(), { $push: { owns: response } });
        });
    },
    'lists.edit'(listId, text) {
        check(listId, String);
        check(text, String);

        if (!Meteor.user().owns.includes(listId)) {
            throw new Meteor.Error('not-authorized');
        }

        const list = Lists.findOne(listId);

        Lists.update(listId, { $set: { name: text } });
    },
    'lists.remove'(listId) {
        check(listId, String);

        if (!Meteor.user().owns.includes(listId)) {
            throw new Meteor.Error('not-authorized');
        }

        const list = Lists.findOne(listId);

        Lists.remove(listId);
    },
});