/* global window, document, console */

import Toby from './toby';
import { createDataProvider, AVAILABLE_COLUMNS } from './data-provider';

// ----------------------------------------------------------------------------
// Create a data provider.

const DISPLAY_COLUMNS1 = AVAILABLE_COLUMNS; // eslint-disable-line no-unused-vars

const DISPLAY_COLUMNS2 = AVAILABLE_COLUMNS.concat( AVAILABLE_COLUMNS ); // eslint-disable-line no-unused-vars

const DISPLAY_COLUMNS3 = AVAILABLE_COLUMNS.slice( 0, 10 ); // eslint-disable-line no-unused-vars
DISPLAY_COLUMNS3.push( 'formula_1', 'formula_2', 'formula_3' );

const COMPLEXITY_FACTOR = 99;

const dataProvider = createDataProvider( DISPLAY_COLUMNS3, COMPLEXITY_FACTOR );

window.dataProvider = dataProvider;

// ----------------------------------------------------------------------------
// Initialize Toby.

export function initToby() {
	if ( window.toby ) {
		console.error( 'Cannot init Toby. Toby is already initialized.' );

		return;
	}

	const toby = new Toby( dataProvider );

	toby.attachTo( {
		statusBar: document.querySelector( '.status-bar' ),
		container: document.querySelector( '.container' )
	} );

	window.toby = toby;
}

export function destroyToby() {
	if ( !window.toby ) {
		console.error( 'Cannot destroy Toby. Toby isn\'t yet initialized.' );

		return;
	}

	window.toby.destroy();

	delete window.toby;
}

initToby();
