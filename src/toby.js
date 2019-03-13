/* global document */

const ROW_HEIGHT = 30;
const COLUMN_WIDTH = 120;
const BORDER_WIDTH = 1;

export default class Toby {
	constructor( dataSource ) {
		this.dataSource = dataSource;
	}

	attachTo( container ) {
		this.container = container;

		this._render();
	}

	destroy() {
		this.container.innerHTML = '';
	}

	_render() {
		// console.profile();

		for ( let row = 0; row < 100; row++ ) {
			const rowElement = this._renderRow( row );

			this.container.appendChild( rowElement );
		}

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
