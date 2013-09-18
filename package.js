Package.describe({
  summary: "Meteor.Collection made easy with JSON Schema"
});

Package.on_use(function (api) {
  var both = ['client', 'server'];
  api.use('underscore', both);
  api.use('tv4', both);
  api.add_files('common.js', both);
});
