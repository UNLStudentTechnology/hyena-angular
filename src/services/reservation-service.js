/* global moment */
/* global math */
'use strict';

/**
 * @ngdoc service
 * @name hyenaAngular.ReservationService
 * @description
 * # ReservationService
 * Service in hyenaAngular.
 */
angular.module('hyenaAngular')
  .service('ReservationService', function ($firebase, $q) {
    var reservationsRef = new Firebase('https://hyena-reservations.firebaseio.com/');
    var minutesInDay = 1440;
    var baseSlotSize = 5; //in minutes
    
  	var ReservationService = {
      /**
       * Returns a single asset from Firebase
       * @param  string assetId
       * @return firebaseRef
       */
  		asset: function getAsset(assetId) {
  			assetId = assetId.trim();
  			return $firebase(reservationsRef.child('/assets/'+assetId));
  		},
      /**
       * Returns a single user from Firebase
       * @param  string assetId
       * @return firebaseRef
       */
      user: function getUser(userId) {
        userId = userId.trim();
        var user = $firebase(reservationsRef.child('/users/'+userId));

        user.$asObject().$loaded().then(function(data) {
          console.log(data);
          if(data.$value === null) {
            ReservationService.addUser(userId);
          }
        });

        return user;
      },
      /**
       * Returns an array of assets
       * @param  array assets Array of asset IDs.
       * @return promise
       */
      assets: function getAssets(assets) {
        if(angular.isUndefined(assets) || !Array.isArray(assets) || (assets.length === 1 && assets[0] === ""))
          return $q.reject('Malformed data');

        var promises = [];
        //Loop through requested assets
        for (var i = 0; i < assets.length; i++) {
          if(assets[i] !== "")
            promises.push(ReservationService.schedule(assets[i]).$asArray().$loaded());
        }
        return $q.all(promises);
      },
      /**
       * Returns assets for a group
       * @param  int groupId
       * @param  int limit   
       * @return firebaseRef
       */
      groupAssets: function getGroupAssets(groupId, limit) {
        limit = limit || 20;
        groupId = parseInt(groupId);
        var assetRef = reservationsRef.child('assets').orderByChild("group_id").equalTo(groupId).limitToFirst(limit);
        return $firebase(assetRef);
      },
      /**
       * Adds a new asset
       * @param object  asset     Asset object
       * @param int     groupId   Group ID
       */
  		add: function addAsset(asset, groupId) {
  			return $firebase(reservationsRef.child('/assets')).$push(asset).then(function(response) {
          //Add a reference to the group
          $firebase(reservationsRef.child('/groups/'+groupId+'/assets')).$set(response.key(), true);
          return response;
        });
  		},
      /**
       * Adds a new user
       * @param string  userId     Asset object
       * @param int     groupId   Group ID
       */
      addUser: function addUser(userId) {
        userId = userId.trim();
        //Default user settings
        var user = {
          hide_hour_before: "0700am",
          hide_hour_after: "0800pm",
          slot_size: 30,
          units: 1
        };
        return $firebase(reservationsRef.child('/users')).$set(userId, user);
      },
      /**
       * Remove an asset from Firebase
       * @param  string assetId
       * @return Promise
       */
  		remove: function removeAsset(assetId) {
  			assetId = assetId.trim();
        $firebase(reservationsRef.child('/bookings/'+assetId)).$remove();
        $firebase(reservationsRef.child('/schedules/'+assetId)).$remove();
  			return $firebase(reservationsRef.child('/assets/'+assetId)).$remove();
  		},
      /**
       * Get a schedule for an asset
       * @param  string assetId
       * @return Promise
       */
  		schedule: function getSchedule(assetId) {
  			assetId = assetId.trim();
  			if(assetId === "")
  				return false;

  			var asset = ReservationService.asset(assetId);
  			var scheduleRef = $firebase(reservationsRef.child("schedules/"+assetId));
  			asset.$asObject().$loaded().then(function(data) {
          if(data.$value == null) {
            ReservationService.user(assetId).$asObject().$loaded().then(function(data) {
              ReservationService.cleanSchedule(scheduleRef, data.slot_size);
            })
          }
          else
  				  ReservationService.cleanSchedule(scheduleRef, data.slot_size);
  			});

  			return scheduleRef;
  		},
      /**
       * Internal function that maintains proper state of schedules
       * @param  firebase schedule      Firebase Reference to asset's schedule
       * @param  int      slotSize      Asset slot size
       * @param  bool     wipeExisting  Forces rebuild of asset's schedule
       * @return bool
       */
  		cleanSchedule: function cleanSchedule(schedule, slotSize, wipeExisting) {
  			slotSize = slotSize || 60; //Defaults to one hour - In minutes
  			wipeExisting = wipeExisting || false;
  			var scheduleObject = schedule.$asObject();
  			var numHours = minutesInDay/slotSize;

        //Check integrity and build schedule after it has been loaded
  			scheduleObject.$loaded().then(function(data) {
	  			for (var i = 0; i < 7; i++) { //Loop through days
	  				if(wipeExisting || angular.isUndefined(data[i]))
	  				{
	  					// console.log('Cleaning index:', i);
	  					var newObj = {};
	  					schedule.$remove(i); //Reset Day's slots

	  					var hourIndex = 0;
	  					for (var j = 0; j < numHours; j++) { //Loop through hours
	  						newObj[j] = true; //Sets default to unavailable
	  					}

	  					schedule.$set(i, newObj);
	  				}
	  			}
  			});
  			return true;
  		},
      /**
       * Updates an asset's schedule to reflect its new slot size
       * @param  {[type]} assetId  [description]
       * @param  {[type]} slotSize [description]
       * @return {[type]}          [description]
       */
  		changeSlotSize: function changeSlotSize(assetId, slotSize) {
  			assetId = assetId.trim();
  			var scheduleRef = $firebase(reservationsRef.child("schedules/"+assetId));
	  		return ReservationService.cleanSchedule(scheduleRef, slotSize, true);
  		},
  		bookings: function getBookings(assetId, unit, custom_year, custom_week, custom_day) {
  			assetId = assetId.trim();
  			var year = custom_year || moment().get('year');
  			var week = custom_week || moment().get('week');
  			var day  = custom_day  || moment().dayOfYear();

  			switch (unit) {
  				case 'week': {
  					return $firebase(reservationsRef.child('bookings/'+assetId+'/'+year+'/'+week));
  				}
  				case 'day': {
  					return $firebase(reservationsRef.child('bookings/'+assetId+'/'+year+'/'+day));
  				}
  				default: {
  					var startDay = day;
  					var endDay = day + 6;
  					return $firebase(reservationsRef.child('bookings/'+assetId+'/'+year).startAt(null, startDay.toString()).limitToFirst(endDay));
  				}
  			}
  		},
  		book: function setBooking(assetId, dayOfYear, hour, custom_year) {
  			var year = custom_year || moment().get('year');
  			var bookingRef = $firebase(reservationsRef.child("bookings/"+assetId+'/'+year+'/'+dayOfYear));

  			return bookingRef.$set(hour, true);
  		},
      normalizeArrays: function normalizeArrays(arrays, slotSize)
      {
        slotSize = slotSize || 60; //Slot size to convert all arrays to
        var numHours = minutesInDay/slotSize;

        for (var i = 0; i < arrays.length; i++) { //Each Asset
          // arrays[i].resize([7, numHours], 1);
          // arrays[i] = arrays[i].valueOf();

          for (var j = 0; j < arrays[i].length; j++) { //Each Day
            var interpolateFactor = numHours/arrays[i][j].length;
            var tempArray = [];
            for (var k = 0; k < arrays[i][j].length; k++) { //Each Slot
              for (var f = 0; f < interpolateFactor; f++) {
                tempArray.push(arrays[i][j][k]);
              }
            }
            arrays[i][j] = tempArray;
          }
        }
        return arrays;
      },
  		compareAvailability: function compareAvailability(promises, slotSize)
  		{
  			var assetRefs = [];
  			for (var i = 0; i < promises.length; i++) {
  				var tempArray = [];

  				//Loop through arrays and convert bool to int
  				for (var k = 0; k < promises[i].length; k++) {
  					for (var j = 0; j < promises[i][k].length; j++) {
  						promises[i][k][j] = promises[i][k][j] ? 1 : 0;
  					}
  				}
  				//Push the modified array to array of promises
          //promises[i] = math.matrix(promises[i]);
  				assetRefs.push(promises[i]);
  			}

        //Normalize arrays to have same dimensions so the arrays can be added correctly
        assetRefs = ReservationService.normalizeArrays(assetRefs, slotSize);     

  			//Make sure arrays were created and do math
  			if(angular.isDefined(assetRefs)) {
  				var combinedArray = math.zeros([7, assetRefs[0][0].length]);

  				for (i = 0; i < assetRefs.length; i++) {
  					combinedArray = math.add(combinedArray, assetRefs[i]);
  				}

    				return combinedArray;
    		}

    		return false;
    		//lls_402,-JfeEYTIi-8PSHVXOUgx
  		}
  	};

  	return ReservationService;

  });