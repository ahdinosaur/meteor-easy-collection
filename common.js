
// EasyCollection constructor
Meteor.EasyCollection = function (name, options) {
  var self = this,
      options = options || {};

  // call Collection constructor
  Meteor.Collection.call(self, name);

  if (!("schema" in options)) {
    throw new Error('Meteor.EasyCollection options must define a schema');
  }
  // options extend EasyCollection object
  _.extend(self, options);

  // TODO overwrite prototype fn's instead
  // of using allow to do validation

  // setup allows
  setupAllow(self);
};

// inherit from Collection
Meteor.EasyCollection.prototype = Object.create(Meteor.Collection.prototype);

// define validate fn
Meteor.EasyCollection.prototype.validate = function (json) {
  return tv4.validateMultiple(json, this.schema, true);
};

var setupAllow = function (col) {
  if (Meteor.isServer) {
    Future = Npm.require("fibers/future");
    col.allow({
      insert: function (userId, doc) {
        return col.validate(doc).valid;
      },
      update: function (userId, doc, fieldNames, modifier) {
        // TODO find a better performing solution
        var fut = new Future();
        (function () {
          // use a temporary LocalCollection to simulate update
          var tmpCol = new Meteor.Collection(null);
          tmpCol.insert(doc, function (err, tmpId) {
            if (err) { throw err; }
            tmpCol.update({ _id: tmpId }, modifier, function (err) {
              if (err) { throw err; }
              var result = tmpCol.findOne({ _id: tmpId });
              console.log(result);
              fut['return'](col.validate(result).valid);
            });
          });
        })();
        return fut.wait();
      }
    });
  }
}
