import dataSet from '../vendor/data-set-1000.json';

const COMPLEXITY_FACTOR = 99;

export const AVAILABLE_COLUMNS = Object.keys( dataSet[ 0 ] );

export function createDataProvider( displayColumns ) {
	return {
		numberOfColumns: displayColumns.length,
		getItem( row, col ) {
			if ( row == 0 ) {
				return displayColumns[ col ];
			}

			const columnName = displayColumns[ col ];

			if ( columnName.startsWith( 'formula_' ) ) {
				return computeSomeComplexFormula( row, col );
			}

			return dataSet[ row - 1 ][ columnName ];
		}
	};
}

function computeSomeComplexFormula( a, b ) {
	let result = 0;

	// Seeded pseudorandom value (giving repeatable results) between 0 and 1000.
	const randomBetween0And1000 = Math.abs( Math.min( 1000, Math.tan( a ) * Math.tan( b ) ) );
	const complexity = randomBetween0And1000 * COMPLEXITY_FACTOR;

	for ( let i = 0; i < complexity; i++ ) {
		result += Math.tan( i );
	}

	return result;
}
