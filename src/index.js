/* global window, document, console */

import Toby from './toby';
import { createDataProvider, AVAILABLE_COLUMNS } from './data-provider';

// ----------------------------------------------------------------------------
// Create a data provider.

// The standard set of 38 columns.
const DISPLAY_COLUMNS_1 = AVAILABLE_COLUMNS; // eslint-disable-line no-unused-vars

// A huge number of columns (10*38).
// However, columns over 38+ are hidden via CSS
// (to underline the DOM creation footprint, not painting).
const DISPLAY_COLUMNS_2 = AVAILABLE_COLUMNS // eslint-disable-line no-unused-vars
	.concat( AVAILABLE_COLUMNS )
	.concat( AVAILABLE_COLUMNS )
	.concat( AVAILABLE_COLUMNS )
	.concat( AVAILABLE_COLUMNS )
	.concat( AVAILABLE_COLUMNS )
	.concat( AVAILABLE_COLUMNS )
	.concat( AVAILABLE_COLUMNS )
	.concat( AVAILABLE_COLUMNS )
	.concat( AVAILABLE_COLUMNS );

// A small set of 13 columns.
// However, with 3 complex formulas which need to be calculated.
const COMPLEXITY_FACTOR = 99;
const DISPLAY_COLUMNS_3 = AVAILABLE_COLUMNS // eslint-disable-line no-unused-vars
	.slice( 0, 10 )
	.concat( [ 'formula_1', 'formula_2', 'formula_3' ] );

// Use the column set defined in the URL by the hash (#0 - #2).
const COLUMN_SETS = [ DISPLAY_COLUMNS_1, DISPLAY_COLUMNS_2, DISPLAY_COLUMNS_3 ];
const chosenColumnSet = Number( window.location.hash.slice( 1 ) );

// window.dataProvider = dataProvider;

// ----------------------------------------------------------------------------
// Initialize Toby.

export function initToby() {
	if ( window.toby ) {
		console.error( 'Cannot init Toby. Toby is already initialized.' );

		return;
	}
	const dataProvider = createDataProvider( COLUMN_SETS[ chosenColumnSet ], COMPLEXITY_FACTOR );

	const toby = new Toby( dataProvider );

	toby.attachTo( {
		statusBar: document.querySelector( '.status-bar' ),
		container: document.querySelector( '.container' )
	} );

	window.toby = toby;
}

export function destroyToby() {
	if ( !window.toby ) {
		console.error( 'Cannot destroy Toby. Toby wasn\'t yet initialized.' );

		return;
	}

	window.toby.destroy();

	delete window.toby;
}

initToby();
