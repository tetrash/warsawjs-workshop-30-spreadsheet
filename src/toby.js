/* global document, window */

const ROW_HEIGHT = 30;
const COLUMN_WIDTH = 120;
const BORDER_WIDTH = 1;
const PRELOAD_ROWS = 2;

export default class Toby {
	constructor( dataSource ) {
		this.dataSource = dataSource;

		this.firstRenderedRow = Number.MAX_SAFE_INTEGER;
		this.lastRenderedRow = -1;

		this._sentinel = _createSentinelElement();
	}

	attachTo( container ) {
		this.container = container;

		container.appendChild( this._sentinel );

		const visibleRows = getVisibleRowRange( getViewport( container ) );

		this._render( visibleRows );

		observeScrollableViewport( container, () => {
			const visibleRows = getVisibleRowRange( getViewport( container ) );

			this._render( visibleRows );
		} );
	}

	destroy() {
		this.container.innerHTML = '';
	}

	_render( rowsToRender ) {
		// console.profile();

		const firstRenderedRow = this.firstRenderedRow;
		const lastRenderedRow = this.lastRenderedRow;
		const firstToRender = Math.max( 0, rowsToRender.first - PRELOAD_ROWS );
		const lastToRender = Math.max( 0, rowsToRender.last + PRELOAD_ROWS );

		const missingRows = _getMissingRows( firstRenderedRow, lastRenderedRow, firstToRender, lastToRender );

		missingRows.forEach( missingRow => {
			const rowElement = this._renderRow( missingRow );

			this.container.appendChild( rowElement );
		} );

		this.firstRenderedRow = Math.min( firstToRender, firstRenderedRow );
		this.lastRenderedRow = Math.max( lastToRender, lastRenderedRow );

		this._updateSentinel( lastToRender );

		// console.profileEnd();
	}

	_renderRow( row ) {
		const numberOfColumns = this.dataSource.numberOfColumns;
		const rowElement = _createRowElement( row, numberOfColumns );

		for ( let col = 0; col < numberOfColumns; col++ ) {
			const value = this.dataSource.getItem( row, col );

			// Ideas: innerHTML, innerText, textContent, createTextNode, recycle text nodes?
			rowElement.childNodes[ col ].textContent = value;
		}

		return rowElement;
	}

	_updateSentinel( lastRow ) {
		const stretchToRow = lastRow + 3;

		// Theoretically, setting transform should work finr, but
		// it didn't work in some (random) cases. Seems to be a Blink's bug.
		// this._sentinel.style.transform = `translateY(${ stretchToRow * ( ROW_HEIGHT + BORDER_WIDTH ) }px)`;

		this._sentinel.style.top = `${ stretchToRow * ( ROW_HEIGHT + BORDER_WIDTH ) }px`;
	}
}

function _createRowElement( row, numberOfColumns ) {
	const rowElement = document.createElement( 'div' );

	rowElement.classList.add( 'row' );
	rowElement.dataset.row = row;
	rowElement.style.transform = `translateY(${ row * ( ROW_HEIGHT + BORDER_WIDTH ) }px)`;

	for ( let col = 0; col < numberOfColumns; col++ ) {
		rowElement.appendChild( _createCellElement( col ) );
	}

	return rowElement;
}

function _createCellElement( col ) {
	const cellElement = document.createElement( 'div' );

	cellElement.classList.add( 'cell' );
	cellElement.dataset.col = col;
	cellElement.style.transform = `translateX(${ col * ( COLUMN_WIDTH + BORDER_WIDTH ) }px)`;
	cellElement.style.height = ROW_HEIGHT + 'px';
	cellElement.style.width = COLUMN_WIDTH + 'px';

	return cellElement;
}

function _createSentinelElement() {
	const sentinelElement = document.createElement( 'div' );

	Object.assign( sentinelElement.style, {
		position: 'absolute',
		height: '1px',
		width: '1px'
	} );

	return sentinelElement;
}

function _getMissingRows( firstRenderedRow, lastRenderedRow, firstToRender, lastToRender ) {
	const missingRows = [];

	for ( let row = firstToRender; row <= lastToRender; row++ ) {
		if ( row < firstRenderedRow ) {
			missingRows.push( row );
		} else if ( row > lastRenderedRow ) {
			missingRows.push( row );
		}
	}

	return missingRows;
}

/**
 * @param {Element} container Scrollable container.
 */
function observeScrollableViewport( container, callback ) {
	container.addEventListener( 'scroll', onChange );
	window.addEventListener( 'resize', onChange );

	function onChange() {
		callback( getViewport( container ) );
	}
}

function getViewport( container ) {
	return {
		top: container.scrollTop,
		bottom: container.scrollTop + container.offsetHeight
	};
}

function getVisibleRowRange( viewport ) {
	const fullRowHeight = ROW_HEIGHT + BORDER_WIDTH;

	const first = Math.floor( viewport.top / fullRowHeight );
	const last = Math.floor( viewport.bottom / fullRowHeight );

	return { first, last };
}
