import Adw from "gi://Adw";
import Gtk from "gi://Gtk";

export class DisplaySettings {
	constructor(settings) {
		this._settings = settings;
	}

	createViewModeRow(displayGroup) {
		const viewModeRow = new Adw.ComboRow({
			title: "Dial Actions View",
			subtitle: "Choose how the power actions are displayed",
		});
		displayGroup.add(viewModeRow);

		const viewModeModel = new Gtk.StringList();
		viewModeModel.append("Stack");
		viewModeModel.append("Tile");
		viewModeModel.append("Pill");
		viewModeRow.set_model(viewModeModel);

		const currentViewMode = this._settings.get_string("view-mode");
		if (currentViewMode === "stack" || currentViewMode === "stacked") {
			viewModeRow.set_selected(0);
		} else if (currentViewMode === "tile" || currentViewMode === "tiled") {
			viewModeRow.set_selected(1);
		} else if (currentViewMode === "pill") {
			viewModeRow.set_selected(2);
		}

		viewModeRow.connect("notify::selected", () => {
			const selectedIndex = viewModeRow.get_selected();
			let selectedMode;
			if (selectedIndex === 0) {
				selectedMode = "stack";
			} else if (selectedIndex === 1) {
				selectedMode = "tile";
			} else if (selectedIndex === 2) {
				selectedMode = "pill";
			}
			this._settings.set_string("view-mode", selectedMode);
		});

		return viewModeRow;
	}

	createTopBarIconRow(displayGroup) {
		const topBarIconRow = new Adw.ActionRow({
			title: "Show Top Bar Icon",
			subtitle: "Display Power Dial icon in the top bar",
		});
		displayGroup.add(topBarIconRow);

		const topBarIconToggle = new Gtk.Switch({
			active: this._settings.get_boolean("show-top-bar-icon"),
			valign: Gtk.Align.CENTER,
		});
		topBarIconRow.add_suffix(topBarIconToggle);

		topBarIconToggle.connect("notify::active", () => {
			this._settings.set_boolean("show-top-bar-icon", topBarIconToggle.get_active());
		});

		return topBarIconRow;
	}

	createTiledDisplayModeRow(displayGroup) {
		const tiledDisplayModeRow = new Adw.ComboRow({
			title: "Tile View Display",
			subtitle: "Choose how tiles are displayed in tile view",
		});
		displayGroup.add(tiledDisplayModeRow);

		const tiledDisplayModeModel = new Gtk.StringList();
		tiledDisplayModeModel.append("Label with Icons");
		tiledDisplayModeModel.append("Icons Only");
		tiledDisplayModeModel.append("Label Only");
		tiledDisplayModeRow.set_model(tiledDisplayModeModel);

		const currentTiledDisplayMode = this._settings.get_string("tiled-display-mode");
		if (currentTiledDisplayMode === "label-with-icons") {
			tiledDisplayModeRow.set_selected(0);
		} else if (currentTiledDisplayMode === "icons-only") {
			tiledDisplayModeRow.set_selected(1);
		} else if (currentTiledDisplayMode === "label-only") {
			tiledDisplayModeRow.set_selected(2);
		}

		tiledDisplayModeRow.connect("notify::selected", () => {
			const selectedIndex = tiledDisplayModeRow.get_selected();
			let selectedMode;
			if (selectedIndex === 0) {
				selectedMode = "label-with-icons";
			} else if (selectedIndex === 1) {
				selectedMode = "icons-only";
			} else if (selectedIndex === 2) {
				selectedMode = "label-only";
			}
			this._settings.set_string("tiled-display-mode", selectedMode);
		});

		return tiledDisplayModeRow;
	}

	createDialogModeRow(displayGroup) {
		const dialogModeRow = new Adw.ComboRow({
			title: "Power Dial View Mode",
			subtitle: "How the menu opens when clicking the top bar icon",
		});
		displayGroup.add(dialogModeRow);

		const dialogModeModel = new Gtk.StringList();
		dialogModeModel.append("Overlay");
		dialogModeModel.append("Dropdown");
		dialogModeRow.set_model(dialogModeModel);

		const currentDialogMode = this._settings.get_string("dialog-mode");
		if (currentDialogMode === "overlay") {
			dialogModeRow.set_selected(0);
		} else if (currentDialogMode === "dropdown") {
			dialogModeRow.set_selected(1);
		}

		dialogModeRow.connect("notify::selected", () => {
			const selectedIndex = dialogModeRow.get_selected();
			const selectedMode = selectedIndex === 0 ? "overlay" : "dropdown";
			this._settings.set_string("dialog-mode", selectedMode);
		});

		return dialogModeRow;
	}

	createMinimalDialogRow(displayGroup) {
		const minimalDialogRow = new Adw.ActionRow({
			title: "Minimal Dialog",
			subtitle: "Hide the title and cancel button on the overlay menu",
		});
		displayGroup.add(minimalDialogRow);

		const minimalDialogToggle = new Gtk.Switch({
			active: this._settings.get_boolean("minimal-dialog"),
			valign: Gtk.Align.CENTER,
		});
		minimalDialogRow.add_suffix(minimalDialogToggle);

		minimalDialogToggle.connect("notify::active", () => {
			this._settings.set_boolean("minimal-dialog", minimalDialogToggle.get_active());
		});

		return minimalDialogRow;
	}
}
