// Copyright Sebastian Wiesner <sebastian@swsnr.de>
//
// Licensed under the EUPL
//
// See https://interoperable-europe.ec.europa.eu/collection/eupl/eupl-text-eupl-12

// @ts-check

/// <reference path="gnome-shell.d.ts" />

import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

/**
 * Disable extension updates with some monkey-patching trickery.
 *
 * We patch actual extension manager instance used by GNOME shell.  We install
 * a new "updatesSupported" property directly on this instance object which
 * always returns false and logs that our extension intercepted the update
 * check.  This shadows the original property definition on the
 * ExtensionManager prototype and thus intercepts all access to
 * "Main.extensionManager.updatesEnabled" which is the only way the rest of
 * the shell uses this property as there's only a single ExtensionManager
 * instance in GNOME shell.
 *
 * Since the original property descriptor on the ExtensionManager prototype
 * is left intact we can restore the old behaviour by simply deleting the
 * property on the instance object; then the property definition on the
 * prototype will take over again.
 *
 * So, when the extension is disabled, we simply clear the patched properties,
 * i.e. delete the property on the instance object that we patched in, so that
 * the original property definition on the prototype will take over again.
 */
export default class DisableUpdatesExtension extends Extension {
  /**
   * Destructible for the enabled extension, or null if the extension is not enabled.
   *
   * @type {{destroy: () => void} | null}
   */
  #enabledExtension = null;

  /**
   * The version of this extension, as extracted from metadata.
   *
   * @type {string}
   */
  get version() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.metadata["version-name"] ?? "n/a";
  }

  #initialize() {
    const log = this.getLogger();
    Object.defineProperty(Main.extensionManager, "updatesSupported", {
      // We must enforce that the property be configurable; otherwise we can't delete it again
      configurable: true,
      get: () => {
        log.log(`Extension updates disabled by ${this.metadata.uuid}`);
        return false;
      },
    });
    return {
      destroy: () => {
        // @ts-expect-error We can delete the propery because we're overwriting it above as configurable
        // eslint-disable-next-line @typescript-eslint/dot-notation
        delete Main.extensionManager["updatesSupported"];
      },
    };
  }

  /**
   * Enable this extension.
   *
   * @override
   */
  enable() {
    const log = this.getLogger();
    if (!this.#enabledExtension) {
      log.log(`Enabling extension ${this.metadata.uuid} ${this.version}`);
      this.#enabledExtension = this.#initialize();
    }
  }

  /**
   * Disable this extension.
   *
   * If existing, destroy the allocated resources of `initialize`.
   *
   * @override
   */
  disable() {
    this.getLogger().log(
      `Disabling extension ${this.metadata.uuid} ${this.version}`,
    );
    this.#enabledExtension?.destroy();
    this.#enabledExtension = null;
  }
}
