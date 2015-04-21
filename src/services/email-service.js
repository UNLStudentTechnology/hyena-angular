'use strict';

/**
 * @ngdoc service
 * @name hyenaAngular.EmailService
 * @description
 * # EmailService
 * Service in the hyenaAngular.
 */
angular.module('hyenaAngular')
  .service('EmailService', function EmailService($http, $q, AuthService, APIPATH, APIKEY, PLATFORM_ROOT) {
    var tokenString = 'token='+AuthService.authToken();
    var apiString = 'api_key='+APIKEY;

  	var EmailService = {
  		/**
       * [send description]
       * @param  string toAddress Email address to send to
       * @param  string toName    Name of the address being sent to (Ex. John Doe)
       * @param  string subject   Subject of the email
       * @param  string content   Body content of the email
       * @param  int groupId      Group ID of the group sending the email
       * @return Promise
       */
  		send: function sendEmail(toAddress, toName, mailSubject, mailContent, groupId) {
        var deferred = $q.defer();

        //Set Defaults

        //Form JSON object
        var mailData = {
          to: toAddress,
          to_name: toName,
          subject: mailSubject,
          content: mailContent,
          group : groupId
        };

        //Send email
        $http.post(APIPATH+'mail/send?'+apiString, mailData).then(function(response) {
          deferred.resolve(response.data);
        }, function(error) {
          deferred.reject(error);
        });

        return deferred.promise;
  		}
  	};

  	return EmailService;
  });
