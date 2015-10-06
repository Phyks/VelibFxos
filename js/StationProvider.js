"use strict";

/********************
 * Station Providers
 ********************/


/**
 * StationProvider is a basic station provider box.
 * Several boxes inherit from this one, depending on the type of provider
 * (online web API, local storage, mock data)
 *
 * Those boxes are not in charge of caching anything. They just fire events
 * as soon as they receive data (which cannot happend before their start()
 * method has been called)
 *
 * The StationStorage then take care of saving those data and merging new
 * information from different providers.
 *
 * Event emitted are:
 *
 *   * 'stations': providing an unordered list of stations
 *   * 'starred-stations-ids': providing an unordered list of station IDs.
 */
var StationProvider = function() {
    var api = window.evt(); // Implements Events interface from evt.js

    api.name = 'StationProvider';

    /**
     * Init providing processus, and so start eventually firing events
     * @return error (undefined if no error)
     */
    api.start = function() {};

    /**
     * Stop all providing processus, and stop firing events (may take some time
     * be effective, as some actions may be asynchronous).
     * @return error (undefined if no error)
     */
    api.stop = function() {};

    return api;
};



/**
 * AuthorityStationProvider is a station provider implementation that
 * get information from JCDecaux OpenData API.
 */
var AuthorityStationProvider = function() {
    var api = StationProvider();

    api.name = 'AuthorityStationProvider';

    /**
     * Adapt OpenData API's format to internal station representation.
     * It is important not to be dependant of the API representation in the rest of
     * the code since it can change at any time. Furthermore, it enable an easy
     * adaptation to other systems.
     * It is also a reference to know which fields are available in station object.
     */
    var stationContract = function(raw_station) {
        return {
            address:         raw_station.address,
            availableStands: raw_station.available_bike_stands,
            availableBikes:  raw_station.available_bikes,
            bikeStands:      raw_station.bike_stands,
            banking:         raw_station.banking,
            bonus:           raw_station.bonus,
            contractName:    raw_station.contract_name,
            lastUpdate:      raw_station.last_update,
            name:            raw_station.name,
            number:          raw_station.number,
            position: {
                latitude:    raw_station.position.lat,
                longitude:   raw_station.position.lng
            },
            status:          raw_station.status
        };
    };

    /**
     * Job ran everytime the data times out.
     */
    var downloadAllStations = function() {
        // TODO: avoid performing multiple queries to the API at the same time
        $.getJSON(Config.stationsUrl, function(data, status, jqXHR) {
            // TODO: look at status
            var stations = data.map(stationContract);
            api.emit('stations', stations);
        });
    };

    var job;

    api.start = function() {
        if (job === undefined) {
            setTimeout(downloadAllStations(), 1000);
            //job = setInterval(downloadAllStations, Config.AuthorityStationProviderInterval);
        }
    };

    api.stop = function() {
        clearInterval(job);
        job = undefined;
    };

    return api;
};



/**
 * LocalStationProvider uses the browser localStorage to get starred station and cache station list.
 */
var LocalStationProvider = function() {
    var api = StationProvider();

    api.name = 'LocalStationProvider';

    /**
     * Load station list from local storage
     * Emit event only once
     */
    api.start = function() {
        if (!localStorage) {
            return 'Local storage not available';
        }

        var lastUpdate = localStorage.getItem('lastStationsUpdate');

        if (!lastUpdate) {
            return 'Local storage data has not been initialized';
        }

        if (Date.now() - parseInt(lastUpdate, 10) > Config.localStationStorageTimeout) {
            return 'Local storage data is considered as obsolated (Config.localStationStorageTimeout = ' + Config.localStationStorageTimeout + ')';
        }

        var stations = JSON.parse(localStorage.getItem('stations'));

        stations.forEach(function(station) {
            station.availableBikes = '?';
            station.availableStands = '?';
        });

        api.emit('stations', stations);

        var starredStationsIds = JSON.parse(localStorage.getItem('starred-stations-ids')) || [];
        api.emit('starred-stations-ids', starredStationsIds);
    };

    return api;
};





/**
 * MockStationProvider is a fake interface for unit tests
 */
var MockStationProvider = function() {
    var api = StationProvider();

    api.name = 'MockStationProvider';

    var stations = [
        {
            address: "RUE DES CHAMPEAUX (PRES DE LA GARE ROUTIERE) - 93170 BAGNOLET",
            availableStands: 38,
            availableBikes: 11,
            bikeStands: 50,
            banking: true,
            bonus: false,
            contractName: "Paris",
            lastUpdate: 1425980217000,
            name: "31705 - CHAMPEAUX (BAGNOLET)",
            number: 31705,
            position: {
                latitude: 48.8645278209514,
                longitude: 2.416170724425901
            },
            status: "OPEN"
        },
        {
            address: "RUE ERASME",
            availableStands: 23,
            availableBikes: 2,
            bikeStands: 25,
            banking: true,
            bonus: true,
            contractName: "Paris",
            lastUpdate: 1425980217000,
            name: "RUE ERASME",
            number: 101,
            position: {
                latitude: 48.842206,
                longitude: 2.345169
            },
            status: "OPEN"
        }
    ];

    var starredStationsIds = stations.map(function(s) {return s.number});

    api.start = function() {
        //api.emit('stations', stations);
        api.emit('starred-stations-ids', starredStationsIds);
    };


    return api;
};

