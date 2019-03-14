/* global document, window */

const ROW_HEIGHT = 30;
const COLUMN_WIDTH = 120;
const BORDER_WIDTH = 1;
const PRELOAD_ROWS = 5;

export default class Toby {
	constructor( dataSource ) {
		this.dataSource = dataSource;

		this.firstRenderedRow = Number.MAX_SAFE_INTEGER;
		this.lastRenderedRow = -1;

		this._sentinel = this._createSentinelElement();
		this._sentinelPosition = 0;

		this._renderedRowElements = [];
	}

	attachTo( { container, statusBar } ) {
		this.container = container;
		this.cellStatusElement = statusBar.querySelector( '.status-bar__current-cell' );

		this.render();

		container.appendChild( this._sentinel );

		observeScrollableViewport( container, () => this.render() );
	}

	destroy() {
		this.container.innerHTML = '';
	}

	render() {
		const visibleRows = getVisibleRowRange( getViewport( this.container ) );

		this._update( visibleRows );
	}

	_update( rowsToRender ) {
		const firstRenderedRow = this.firstRenderedRow;
		const lastRenderedRow = this.lastRenderedRow;
		const firstToRender = Math.max( 0, rowsToRender.first - PRELOAD_ROWS );
		const lastToRender = Math.max( 0, rowsToRender.last + PRELOAD_ROWS );

		const start = Math.min( firstRenderedRow, firstToRender );
		const end = Math.max( lastRenderedRow, lastToRender );

		for ( let row = start; row <= end; row++ ) {
			if ( row >= firstToRender && row <= lastToRender ) {
				if ( !this._renderedRowElements[ row ] ) {
					const rowElement = this._renderRow( row );

					this.container.appendChild( rowElement );

					this._renderedRowElements[ row ] = rowElement;
				}
			} else {
				if ( this._renderedRowElements[ row ] ) {
					this._renderedRowElements[ row ].remove();
					this._renderedRowElements[ row ] = null;
				}
			}
		}

		this.firstRenderedRow = firstToRender;
		this.lastRenderedRow = lastToRender;

		this._updateSentinel( lastToRender );
	}

	_renderRow( row ) {
		const rowElement = this._createRowElement( row );

		for ( let col = 0; col < this.dataSource.numberOfColumns; col++ ) {
			const value = this.dataSource.getItem( row, col );

			// Ideas: innerHTML, innerText, textContent, createTextNode, recycle text nodes?
			rowElement.childNodes[ col ].textContent = value;
		}

		return rowElement;
	}

	_updateSentinel( lastRow ) {
		const stretchToRow = lastRow + 10;

		if ( stretchToRow > this._sentinelPosition ) {
			// Theoretically, setting transform should work fine, but
			// it didn't work in some (random) cases. Seems to be a Blink's bug.
			// this._sentinel.style.transform = `translateY(${ stretchToRow * ( ROW_HEIGHT + BORDER_WIDTH ) }px)`;

			this._sentinel.style.top = `${ stretchToRow * ( ROW_HEIGHT + BORDER_WIDTH ) }px`;

			this._sentinelPosition = stretchToRow;
		}
	}

	_createRowElement( row ) {
		const rowElement = document.createElement( 'div' );

		rowElement.classList.add( 'row' );
		rowElement.dataset.row = row;
		rowElement.style.transform = `translateY(${ row * ( ROW_HEIGHT + BORDER_WIDTH ) }px)`;

		for ( let col = 0; col < this.dataSource.numberOfColumns; col++ ) {
			rowElement.appendChild( this._createCellElement( col ) );
		}

		return rowElement;
	}

	_createCellElement( col ) {
		const cellElement = document.createElement( 'div' );

		cellElement.classList.add( 'cell' );
		cellElement.dataset.col = col;
		cellElement.style.transform = `translateX(${ col * ( COLUMN_WIDTH + BORDER_WIDTH ) }px)`;
		cellElement.style.height = ROW_HEIGHT + 'px';
		cellElement.style.width = COLUMN_WIDTH + 'px';

		cellElement.addEventListener( 'mouseenter', () => {
			this._setCellStatusTo( cellElement.parentNode.dataset.row, col );
		} );
		cellElement.addEventListener( 'mouseleave', () => {
			this._setCellStatusTo( null );
		} );

		return cellElement;
	}

	_createSentinelElement() {
		const sentinelElement = document.createElement( 'div' );

		Object.assign( sentinelElement.style, {
			position: 'absolute',
			height: '1px',
			width: '1px'
		} );

		return sentinelElement;
	}

	_setCellStatusTo( row, col ) {
		if ( row === null ) {
			this.cellStatusElement.textContent = '';
			return;
		}

		this.cellStatusElement.textContent = `row: ${ row }, col: ${ col }, data: ${ this.dataSource.getItem( row, col ) }`;
	}
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
