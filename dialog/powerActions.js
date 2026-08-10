import Gio from "gi://Gio";
import GLib from "gi://GLib";
import Clutter from "gi://Clutter";
import * as ModalDialog from "resource:///org/gnome/shell/ui/modalDialog.js";
import * as Dialog from "resource:///org/gnome/shell/ui/dialog.js";

export class PowerActions {
	constructor(settings) {
		this._settings = settings;
		this._confirmDialog = null;
		this._confirmIdleId = 0;
	}

	_callLogind(method, interactive) {
		Gio.DBus.system.call(
			"org.freedesktop.login1",
			"/org/freedesktop/login1",
			"org.freedesktop.login1.Manager",
			method,
			new GLib.Variant("(b)", [interactive]),
			null,
			Gio.DBusCallFlags.NONE,
			-1,
			null,
			null
		);
	}

	logout() {
		const confirmationMode = this._settings.get_string("logout-confirmation");
		const mode = confirmationMode === "immediate" ? 2 : 0;

		Gio.DBus.session.call(
			"org.gnome.SessionManager",
			"/org/gnome/SessionManager",
			"org.gnome.SessionManager",
			"Logout",
			new GLib.Variant("(u)", [mode]),
			null,
			Gio.DBusCallFlags.NONE,
			-1,
			null,
			null
		);
	}

	reboot() {
		const confirmationMode = this._settings.get_string("restart-confirmation");

		if (confirmationMode === "immediate") {
			this._callLogind("Reboot", false);
		} else {
			Gio.DBus.session.call(
				"org.gnome.SessionManager",
				"/org/gnome/SessionManager",
				"org.gnome.SessionManager",
				"Reboot",
				null,
				null,
				Gio.DBusCallFlags.NONE,
				-1,
				null,
				null
			);
		}
	}

	powerOff() {
		const confirmationMode = this._settings.get_string("poweroff-confirmation");

		if (confirmationMode === "immediate") {
			this._callLogind("PowerOff", false);
		} else {
			Gio.DBus.session.call(
				"org.gnome.SessionManager",
				"/org/gnome/SessionManager",
				"org.gnome.SessionManager",
				"Shutdown",
				null,
				null,
				Gio.DBusCallFlags.NONE,
				-1,
				null,
				null
			);
		}
	}

	suspend() {
		this._callLogind("Suspend", true);
	}

	lock() {
		Gio.DBus.session.call(
			"org.gnome.ScreenSaver",
			"/org/gnome/ScreenSaver",
			"org.gnome.ScreenSaver",
			"Lock",
			null,
			null,
			Gio.DBusCallFlags.NONE,
			-1,
			null,
			null
		);
	}

	// SessionManager has Reboot/Shutdown confirm dialogs but no hibernate
	// equivalent, so confirm mode uses our own modal.
	_showHibernateConfirmation() {
		if (this._confirmDialog)
			return;

		const dialog = new ModalDialog.ModalDialog({
			styleClass: "power-dial-confirm-dialog",
		});
		this._confirmDialog = dialog;

		const content = new Dialog.MessageDialogContent({
			title: "Hibernate",
			description:
				"The system will save your session to disk and power off. " +
				"Unsaved work in apps that do not restore state may be lost.",
		});
		dialog.contentLayout.add_child(content);

		dialog.setButtons([
			{
				label: "Cancel",
				action: () => dialog.close(),
				key: Clutter.KEY_Escape,
			},
			{
				label: "Hibernate",
				action: () => {
					dialog.close();
					this._callLogind("Hibernate", true);
				},
				default: true,
			},
		]);

		dialog.connect("closed", () => {
			this._confirmDialog = null;
		});

		if (!dialog.open()) {
			this._confirmDialog = null;
			dialog.destroy();
		}
	}

	hibernate() {
		if (!this._settings.get_boolean("hibernate-available"))
			return;

		const confirmationMode = this._settings.get_string("hibernate-confirmation");
		if (confirmationMode === "immediate") {
			this._callLogind("Hibernate", false);
			return;
		}

		// Defer until the power dial releases its modal grab.
		if (this._confirmIdleId) {
			GLib.source_remove(this._confirmIdleId);
			this._confirmIdleId = 0;
		}
		this._confirmIdleId = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
			this._confirmIdleId = 0;
			this._showHibernateConfirmation();
			return GLib.SOURCE_REMOVE;
		});
	}

	destroy() {
		if (this._confirmIdleId) {
			GLib.source_remove(this._confirmIdleId);
			this._confirmIdleId = 0;
		}

		if (this._confirmDialog) {
			this._confirmDialog.close();
			this._confirmDialog = null;
		}
	}
}
