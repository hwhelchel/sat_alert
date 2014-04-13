sat_alert
=========

#Project Description

Sat Alert is a Pebble watchface that alerts the user to satellites traveling overhead. It currently tracks ~40 satellites. The app takes TLE data of satellite movements and generates latitude and longitude coordinates. It calculates the distance between the satellites and the user. If a satellite is above the user the app alerts the user.

The app also adjusts messaging based on light visibility. If it is after dusk then the app tells the user which direction to look to see the satellite.

Sat Alert development began as a part of 2014 Nasa Space Apps Challenge.

##Technical Details

We used the pebble Javascript SDK, satellite-js, suncalc, and NORAD TLE satellite data from celestrak.com.

##Team

Current open source contributors include Anne Willborn, Matthew Higgins, Matthew Knudsen, Quentin Devauchelle, Roman Zadov, and Harry Whelchel.

##Open Source

The Sat Alert team welcomes open source contributions. Pull requests for new features, bug fixes, and refactorings that improve the use of language best practices are encouraged.

##Website

