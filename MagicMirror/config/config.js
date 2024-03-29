/* Magic Mirror Config Sample
 *
 * By Michael Teeuw https://michaelteeuw.nl
 * MIT Licensed.
 *
 * For more information on how you can configure this file
 * See https://github.com/MichMich/MagicMirror#configuration
 *
 */

var config = {
	address: "localhost", 	// Address to listen on, can be:
							// - "localhost", "127.0.0.1", "::1" to listen on loopback interface
							// - another specific IPv4/6 to listen on a specific interface
							// - "0.0.0.0", "::" to listen on any interface
							// Default, when address config is left out or empty, is "localhost"
	port: 8080,
	basePath: "/", 	// The URL path where MagicMirror is hosted. If you are using a Reverse proxy
					// you must set the sub path here. basePath must end with a /
	ipWhitelist: ["127.0.0.1", "::ffff:127.0.0.1", "::1"], 	// Set [] to allow all IP addresses
															// or add a specific IPv4 of 192.168.1.5 :
															// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
															// or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
															// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

	useHttps: false, 		// Support HTTPS or not, default "false" will use HTTP
	httpsPrivateKey: "", 	// HTTPS private key path, only require when useHttps is true
	httpsCertificate: "", 	// HTTPS Certificate path, only require when useHttps is true

	language: "it",
	logLevel: ["INFO", "LOG", "WARN", "ERROR"], // Add "DEBUG" for even more logging
	timeFormat: 24,
	units: "metric",
	// serverOnly:  true/false/"local" ,
	// local for armv6l processors, default
	//   starts serveronly and then starts chrome browser
	// false, default for all NON-armv6l devices
	// true, force serveronly mode, because you want to.. no UI on this device

	modules: [
		{
        		module: "MMM-Page-Selector",
        		position: "top_center",
        		config: {
            			defaultPage: "main",
            			displayTitle: true,
            			selectPageNotif: ["SELECT_PAGE"],
            			incrementPageNotif: ["PAGE_UP"],
            			decrementPageNotif: ["PAGE_DOWN"],
	    			persistentPages: true,
	    			},
			autoChange: {
	    			interval: 100
	    		}
    		},
		{
			module: "alert",
		},
		{
			module: "updatenotification",
			position: "top_bar"
		},
		{
			module: "clock",
			position: "top_left",
			config: {
				showSunTimes: true,
				showMoonTimes: true,
				lat: 46.0637,
				lon: 13.24458,
				locationID: "5128581", //ID from http://bulk.openweathermap.org/sample/city.list.json.gz; unzip the gz file and find your city
				appid: "YOUR_OPENWEATHER_API_KEY"
			}
		},
		{
			module: "calendar",
			header: "Calendario",
			position: "top_left",
			config: {
				calendars: [
					{
						symbol: "calendar-check",
						url: "https://calendar.google.com/calendar/ical/it.italian%23holiday%40group.v.calendar.google.com/public/basic.ics"	},
					{
						symbol: "calendar-alt",
						url: "YOUR_.ical_CALENDAR"
					}
				]
			}
		},
		{
			module: "compliments",
			position: "lower_third",
			config: {
				compliments: {
					anytime: [
						"Hey amico!"
					],
					morning: [
						"Buongiorno, sarà una super giornata!",
						"Divertiti oggi!",
						"Dormito bene?"
					],
					afternoon: [
						"Hai ancora molto da fare oggi!",
						"Stai alla grande!",
						"Ti vedo in forma oggi!"
					],
					evening: [
						"Sono sicuro che è stata una fantastica giornata!",
						"Hai dato il massimo!",
						"Ti aspetta un meritato riposo"
					],
					"....-01-01": [
						"Happy new year!"
					],
					"....-05-25": [
						"Buon compleanno!"
					]
				}
			}
		},
		{
			module: "currentweather",
			position: "top_right",
			config: {
				location: "Udine",
				locationID: "3165072", //ID from http://bulk.openweathermap.org/sample/city.list.json.gz; unzip the gz file and find your city
				appid: "YOUR_OPENWEATHER_API_KEY"
			}
		},
		{
			module: "weatherforecast",
			position: "top_right",
			header: "Weather Forecast",
			config: {
				location: "Udine",
				locationID: "3165072", //ID from http://bulk.openweathermap.org/sample/city.list.json.gz; unzip the gz file and find your city
				appid: "YOUR_OPENWEATHER_API_KEY"
			}
		},
		{
			module: "newsfeed",
			position: "bottom_bar",
			config: {
				feeds: [
					{
						title: "New York Times",
						url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
					}
				],
				showSourceTitle: true,
				showPublishDate: true,
				broadcastNewsFeeds: true,
				broadcastNewsUpdates: true
			}
		},
		{
			module: 'MMM-AirQuality',
			position: 'top_center', // you may choose any location
			config: {
	  			location: 'italy/friuli-venezia-giulia/udine/v.cairoli/' // the location to check the index for
			}
		},
		{
           		 module: 'MMM-CoinMarketCap',
            		position: "top_left",
    			header: "Cryptocurrencies",
            		config: {
                		apiKey: 'YOUR_COINMARKETCAP_KEY',
                		currencies: ['bitcoin', 'ethereum', 'polkadot'],
                		view: 'graphWithChanges',
               			 conversion: 'EUR',
           			 }
        	},
                {
  			module: "MMM-GroveGestures",
  			position: "bottom_right",
  			config: {
    				autoStart: true, //When Mirror starts, recognition will start.
    				verbose:false, // If set as `true`, useful messages will be logged.
    				recognitionTimeout: 1000, //Gesture sequence will be ended after this time from last recognized gesture.
    				cancelGesture: "WAVE", //If set, You can cancel gesture sequence with this gesture.
    				visible: true, //Recognized gesture sequence will be displayed on position

    				idleTimer: 0, // `0` for disable, After this time from last gesture, onIdle will be executed.
   			 	onIdle: { // See command section
      					moduleExec: {
        				module: [],
        				exec: (module, gestures) => {
          					module.hide(1000, null, {lockstring:"GESTURE"})
        					}
      					}
    				},
    				onDetected: {
      					notificationExec: {
        					notification: "GESTURE_DETECTED",
      					},
    				},

    				gestureMapFromTo: { //When your sensor is installed with rotated direction, you can calibrate with this.
      					"Up": "UP",
      					"Down": "DOWN",
      					"Left": "LEFT",
      					"Right": "RIGHT",
      					"Forward": "FORWARD",
      					"Backward": "BACKWARD",
      					"Clockwise": "CLOCKWISE",
      					"anti-clockwise": "ANTICLOCKWISE",
      					"wave": "WAVE"
    				},

    				defaultNotification: "GESTURE",
    				pythonPath: "/usr/bin/python", // your python path

    				defaultCommandSet: "default",
    				commandSet: {
      					"default": {
        					"FORWARD-BACKWARD": {
          						notificationExec: {
            							notification: "PAGE_UP",
            							payload: null
          						}
        					},
        					"LEFT-RIGHT": {
          						notificationExec: {
            							notification: "PAGE_DOWN",
            							payload:null,
          						}
        					},
        					"CLOCKWISE": {
          						moduleExec: {
            							module: [],
            							exec: (module, gestures) => {
              								module.hide(1000, null, {lockstring:"GESTURE"})
            							}
          						}
        					},
        					"ANTICLOCKWISE": {
          						moduleExec: {
            							module: [],
            							exec: (module, gestures) => {
              								module.show(1000, null, {lockstring:"GESTURE"})
            							}
          						}
        					},
        					"LEFT": {
          						notificationExec: {
            							notification: "ARTICLE_PREVIOUS",
            							payload: null,
          						}
        					},
        					"RIGHT": {
          						notificationExec: {
            							notification: "ARTICLE_NEXT",
            							payload: null,
          						}
        					},
      					},
    				},
  			}
		},
		{
			module: "MMM-APOD",
			position: "top_left",
			config: {
				appid: "YOUR_NASA_API_KEY", // NASA API key (api.nasa.gov),
				maxMediaWidth: 300,
				maxMediaHeight: 800
			}
		}
	],
	pages: {
    		"main": {
			"calendar": "top_left",
			"compliments": "lower_third",
                        "weatherforecast": "top_right",
                        "newsfeed": "bottom_bar"

    		},
    		"second": {
    			"MMM-AirQuality": "lower_third",
			"MMM-CoinMarketCap": "top_left",
			"MMM-APOD": "top_right"
    		}
	},
	exclusions: {
   		 "updatenotification": "top_bar",
		"clock": "top_left",
		"currentweather": "top_right",
		"MMM-GroveGestures": "bottom_right"
	}
};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {module.exports = config;}