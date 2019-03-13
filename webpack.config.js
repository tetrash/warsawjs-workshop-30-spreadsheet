'use strict';

/* eslint-env node */

const path = require( 'path' );

module.exports = {
	devtool: 'source-map',

	entry: path.resolve( __dirname, 'src', 'index.js' ),

	output: {
		path: path.resolve( __dirname, 'dist' ),
		filename: 'index.js',
		libraryTarget: 'umd'
	}
};
