/* global window, document */

import Toby from './toby';
import { createDataProvider, AVAILABLE_COLUMNS } from './data-provider';

// ----------------------------------------------------------------------------
// Create data provider.

const DISPLAY_COLUMNS1 = AVAILABLE_COLUMNS; // eslint-disable-line no-unused-vars

const DISPLAY_COLUMNS2 = AVAILABLE_COLUMNS.slice( 0, 10 ); // eslint-disable-line no-unused-vars
DISPLAY_COLUMNS2.push( 'formula_1', 'formula_2', 'formula_3' );

const dataProvider = createDataProvider( DISPLAY_COLUMNS2 );

// ----------------------------------------------------------------------------
// Initialize Toby.

const toby = new Toby( dataProvider );

toby.attachTo( document.getElementById( 'toby' ) );

// ----------------------------------------------------------------------------
// Export as globals so we can play with them live in the browser.

window.dataProvider = dataProvider;
window.toby = toby;
