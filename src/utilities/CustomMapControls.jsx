export class UpdateSearchControl {
	onAdd(map) {
		this._map = map;
		this._container = document.createElement('div');
		this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
		this._container.innerHTML =
			'<button>' +
			'<span class="maplibregl-ctrl-icon search-img" aria-hidden="true" title="Search this area"></span>' +
			'</button>';
		this._container.addEventListener('contextmenu', (e) => e.preventDefault());
		this._container.addEventListener('click', () => window.updateSearchClicked());
		return this._container;
	}

	onRemove() {
		this._container.parentNode.removeChild(this._container);
		this._map = undefined;
	}
}