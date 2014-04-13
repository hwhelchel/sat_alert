sat_alert
=========

#Project Description

Sat Alert is a Pebble watchface that alerts the user to satellites traveling overhead. It currently tracks ~40 satellites. The app takes TLE data of satellite movements and generates latitude and longitude coordinates. It calculates the distance between the satellites and the user. If a satellite is above the user, the app alerts the user.

The app also adjusts messaging based on light visibility. If it is after dusk, the app tells the user  the satellite may be visible as well as tells the user which direction to look to see the satellite.

Sat Alert development began as a part of [2014 Nasa Space Apps Challenge](https://2014.spaceappschallenge.org/).

##Technical Details

We used the [Pebble Javascript SDK](http://developer.getpebble.com/2/guides/javascript-guide.html), [satellite-js](https://github.com/shashwatak/satellite-js), [SunCalc](https://github.com/mourner/suncalc), and [NORAD TLE satellite data](http://www.celestrak.com/NORAD/elements/).

##Team

Current open source contributors include [Anne Willborn](https://github.com/awillborn), [Matthew Higgins](https://github.com/mh120888), [Matthew Knudsen](https://github.com/mknudsen01), [Quentin Devauchelle](https://github.com/Qt-dev), [Roman Zadov](https://github.com/romanzadov), and [Harry Whelchel](https://github.com/hwhelchel).

##Open Source

The Sat Alert team welcomes open source contributions. Pull requests for new features, bug fixes, and refactorings that improve the use of language best practices are encouraged.

##Website

