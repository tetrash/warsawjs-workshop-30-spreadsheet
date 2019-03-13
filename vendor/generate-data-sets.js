#!/usr/bin/env node

'use strict';

/* eslint-env node */

const csv = require( 'csvtojson' );
const csvFilePath = './HYG-Database/hygdata_v3.csv';
const fs = require( 'fs' );

csv()
	.fromFile( csvFilePath )
	.then( stars => {
		stars.forEach( generateMissingProperNames );
		stars = stars.sort( sortByProperName );

		fs.writeFileSync( './data-set-1000.json', JSON.stringify( stars.slice( 0, 1000 ) ) );
		fs.writeFileSync( './data-set-10000.json', JSON.stringify( stars.slice( 0, 10000 ) ) );
	} );

function generateMissingProperNames( star ) {
	if ( !star.proper ) {
		star.proper = 'Unnamed #' + star.id;
	}
}

function sortByProperName( star1, star2 ) {
	return star1.proper.localeCompare( star2.proper );
}
