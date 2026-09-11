export function normalizeViewMode(mode) {
	if (mode === "stacked")
		return "stack";
	if (mode === "tiled")
		return "tile";
	return mode;
}

export function migrateViewMode(settings) {
	const mode = settings.get_string("view-mode");
	const normalized = normalizeViewMode(mode);
	if (normalized !== mode)
		settings.set_string("view-mode", normalized);
}
