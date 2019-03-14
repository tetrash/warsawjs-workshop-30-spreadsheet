/* global document, window */

const ROW_HEIGHT = 30;
const COLUMN_WIDTH = 120;
const BORDER_WIDTH = 1;
const PRELOAD_ROWS = 5;

export default class Toby {
	/**
	 * @param {DataSource} dataSource
	 */
	constructor( dataSource ) {
		/**
		 * @type {DataSource}
		 */
		this.dataSource = dataSource;

		/**
		 * The first row which is currently in the DOM.
		 *
		 * @type {Number}
		 */
		this.firstRenderedRow = Number.MAX_SAFE_INTEGER;

		/**
		 * The last row which is currently in the DOM.
		 *
		 * @type {Number}
		 */
		this.lastRenderedRow = -1;

		/**
		 * The sentinel element – guards the scroll size by stretching the container.
		 *
		 * @type {Element}
		 */
		this._sentinel = this._createSentinelElement();

		/**
		 * The current sentinel's position from the top of the container.
		 */
		this._sentinelPosition = 0;

		/**
		 * The array of row elements which are currently in the DOM.
		 *
		 * @type {Array.<Element>}
		 */
		this._renderedRowElements = [];
	}

	/**
	 * Attaches this toby instance to the given elements.
	 */
	attachTo( { container, statusBar } ) {
		this.container = container;
		this.cellStatusElement = statusBar.querySelector( '.status-bar__current-cell' );

		this.render();

		container.appendChild( this._sentinel );

		observeScrollableViewport( container, () => this.render() );
	}

	/**
	 * Detaches this toby instance.
	 */
	destroy() {
		this.container.innerHTML = '';
	}

	/**
	 * Updates the list of rows which should be rendered based on the current viewport position.
	 */
	render() {
		const visibleRows = getVisibleRowRange( getViewport( this.container ) );

		this._update( visibleRows );
	}

	/**
	 * Renders missing rows and removes excessive rows.
	 *
	 * @param {Array.<Number>} rowsToRender Rows which should currently be rendered.
	 */
	_update( rowsToRender ) {
		const firstRenderedRow = this.firstRenderedRow;
		const lastRenderedRow = this.lastRenderedRow;

		// The visible range of of rows extended with the given number of rows "beyond the fold".
		// This is – there should always be a couple of rows outside of the viewport so the user
		// doesn't see that they are being rendered as he/she scrolls.
		const firstToRender = Math.max( 0, rowsToRender.first - PRELOAD_ROWS );
		const lastToRender = Math.max( 0, rowsToRender.last + PRELOAD_ROWS );

		// Update the rows from the first one which should be added or removed
		// to the last one which should be added or removed.
		const start = Math.min( firstRenderedRow, firstToRender );
		const end = Math.max( lastRenderedRow, lastToRender );

		for ( let row = start; row <= end; row++ ) {
			if ( row >= firstToRender && row <= lastToRender ) {
				let rowElement;

				// If the current row should be rendered (in the DOM) but isn't present in the
				// table of rendered rows (wasn't rendered so far), render it.
				if ( !this._renderedRowElements[ row ] ) {
					rowElement = this._renderRow( row );

					this._renderedRowElements[ row ] = rowElement;
				}
				// If the current row was already rendered, use it.
				else {
					rowElement = this._renderedRowElements[ row ];
				}

				// If the current row wasn't in the DOM so far, add it.
				if ( !rowElement.parentNode ) {
					this.container.appendChild( rowElement );
				}
			} else {
				// If the current row should not be rendered but is currently rendered, remove it from the DOM.
				if ( this._renderedRowElements[ row ] ) {
					this._renderedRowElements[ row ].remove();
				}
			}
		}

		this.firstRenderedRow = firstToRender;
		this.lastRenderedRow = lastToRender;

		this._updateSentinel( lastToRender );
	}

	/**
	 * Creates a row element and fills the cells inside it with the data of this row.
	 *
	 * @param {Number} row The number of the row to render.
	 * @returns {Element} The rendered row element.
	 */
	_renderRow( row ) {
		const rowElement = this._createRowElement( row );

		for ( let col = 0; col < this.dataSource.numberOfColumns; col++ ) {
			const value = this.dataSource.getItem( row, col );

			rowElement.childNodes[ col ].innerHTML = value;
		}

		return rowElement;
	}

	/**
	 * Creates a row element and all its cells.
	 *
	 * @param {Number} row The number of the row to create.
	 * @returns {Element} The rendered row element (with empty cells).
	 */
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

	/**
	 * Creates a cell element.
	 *
	 * @param {Number} row The number of the row to render
	 * @returns {Element} The rendered row element (with empty cells).
	 */
	_createCellElement( col ) {
		const cellElement = document.createElement( 'div' );

		cellElement.classList.add( 'cell' );
		cellElement.dataset.col = col;
		cellElement.style.transform = `translateX(${ col * ( COLUMN_WIDTH + BORDER_WIDTH ) }px)`;
		cellElement.style.height = ROW_HEIGHT + 'px';
		cellElement.style.width = COLUMN_WIDTH + 'px';

		// Display cell status when it's hovered.
		cellElement.addEventListener( 'mouseenter', () => {
			this._setCellStatusTo( cellElement.parentNode.dataset.row, col );
		} );
		cellElement.addEventListener( 'mouseleave', () => {
			this._setCellStatusTo( null );
		} );

		// Select the clicked cell and unselect it when clicking somewhere else.
		document.body.addEventListener( 'click', evt => {
			if ( evt.target === cellElement ) {
				cellElement.classList.add( 'selected' );
			} else {
				cellElement.classList.remove( 'selected' );
			}
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
			this.cellStatusElement.innerHTML = '';

			return;
		}

		this.cellStatusElement.innerHTML = `row: ${ row }, col: ${ col }, data: ${ this.dataSource.getItem( row, col ) }`;
	}

	/**
	 * Updates the sentinel's position to be 5 rows below the last rendered row.
	 * Thanks to that there's always space for the scroll to move.
	 */
	_updateSentinel( lastRow ) {
		const stretchToRow = lastRow + 5;

		if ( stretchToRow > this._sentinelPosition ) {
			// Theoretically, setting transform should work fine, but
			// it didn't work in some (random) cases. Seemed to be a Blink's bug.
			// this._sentinel.style.transform = `translateY(${ stretchToRow * ( ROW_HEIGHT + BORDER_WIDTH ) }px)`;

			this._sentinel.style.top = `${ stretchToRow * ( ROW_HEIGHT + BORDER_WIDTH ) }px`;

			this._sentinelPosition = stretchToRow;
		}
	}
}

/**
 * Observes the given scrollable element for changes in its viewport (the visible part of its content).
 *
 * @param {Element} container Scrollable container.
 * @param {Function} callback The function to call when the viewport changes.
 */
function observeScrollableViewport( container, callback ) {
	container.addEventListener( 'scroll', onChange );
	window.addEventListener( 'resize', onChange );

	function onChange() {
		// Cache, cause cache makes everything fast!
		this.cache = callback;

		callback( getViewport( container ) );
	}
}

/**
 * Gets the viewport position (the visible part of the given container element's content).
 *
 *		// The below means that the visible part of the element
 *		// starts at position 100px from its top to 500px from its top.
 *		getViewport( container ); // -> { top: 100, bottom: 500 }
 *
 * @param {Element} container Scrollable container.
 * @returns {Object} The viewport position (its top and bottom positions in pixels).
 */
function getViewport( container ) {
	return {
		top: container.scrollTop,
		bottom: container.scrollTop + container.offsetHeight
	};
}

/**
 * Calculates the first and last rows visible in the given viewport.
 *
 * @param {Object} viewport
 * @returns {OBject} The first and last visible rows.
 */
function getVisibleRowRange( viewport ) {
	const fullRowHeight = ROW_HEIGHT + BORDER_WIDTH;

	const first = Math.floor( viewport.top / fullRowHeight );
	const last = Math.floor( viewport.bottom / fullRowHeight );

	return { first, last };
}
