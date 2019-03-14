import dataSet from '../vendor/data-set-1000.json';

export const AVAILABLE_COLUMNS = Object.keys( dataSet[ 0 ] );

export function createDataProvider( displayColumns, complexityFactor ) {
	return {
		numberOfColumns: displayColumns.length,
		getItem( row, col ) {
			if ( row == 0 ) {
				return displayColumns[ col ];
			}

			const columnName = displayColumns[ col ];

			if ( columnName.startsWith( 'formula_' ) ) {
				return computeSomeComplexFormula( row, col, complexityFactor );
			}

			return dataSet[ row - 1 ][ columnName ];
		}
	};
}

function computeSomeComplexFormula( a, b, complexityFactor ) {
	let result = 0;

	// Seeded pseudorandom value (giving repeatable results) between 0 and 1000.
	const randomBetween0And1000 = Math.abs( Math.min( 1000, Math.tan( a ) * Math.tan( b ) ) );
	const complexity = randomBetween0And1000 * complexityFactor;

	for ( let i = 0; i < complexity; i++ ) {
		result += Math.tan( i );
	}

	return result;
}
