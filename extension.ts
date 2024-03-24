// Copyright Sebastian Wiesner <sebastian@swsnr.de>
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0.If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.
//
// Alternatively, the contents of this file may be used under the terms
// of the GNU General Public License Version 2 or later, as described below:
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

/**
 * Something we can destroy.
 */
export interface Destructible {
  destroy(): void;
}

/**
 * A property being tracked by a PropertyManager.
 */
interface TrackedProperty {
  /** The object the property was defined on. */
  readonly object: unknown;
  /** The property key. */
  readonly key: PropertyKey;
}

/**
 * Track and delete defined properties of objects.
 */
class PropertyManager implements Destructible {
  private readonly trackedProperties: TrackedProperty[] = [];

  /**
   * Define a property on an object, like `Object.defineProperty`.
   *
   * However, keep track of the defined property, and delete it again in `reset()`.
   * To ensure that this works, this function enforces that `configurable` is
   * `true` on the defined property.
   *
   * @param object The object to the define to property on
   * @param key The property key
   * @param descriptor The property descriptor
   */
  defineProperty<O>(
    object: O,
    key: keyof O,
    descriptor: PropertyDescriptor,
  ): void {
    this.trackedProperties.push({ object, key });
    Object.defineProperty(object, key, {
      // We must enforce that the property be configurable; otherwise we can't delete it again
      configurable: true,
      ...descriptor,
    });
  }

  /**
   * Clear all tracked properties.
   *
   * For every property tracked by this class, delete the property on its object.
   */
  destroy() {
    let trackedProperty: TrackedProperty | undefined;
    while ((trackedProperty = this.trackedProperties.pop())) {
      const { object, key } = trackedProperty;
      // Deleting is the actual point here, since we're deep in monkey-patching
      // territory, and we kinda fake the types here just to make typescript happy.
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete (object as Record<PropertyKey, unknown>)[key];
    }
  }
}

/**
 * An abstract class representing a destructible extension.
 *
 * This class handles the infrastructure for enabling and disabling the
 * extension; implementations only need to provide initialization.
 */
export abstract class DestructibleExtension extends Extension {
  private enabledExtension?: Destructible | null;

  /**
   * Initialize this extension.
   */
  abstract initialize(): Destructible;

  /**
   * Get the declared version of this extension.
   */
  get version(): string {
    return this.metadata["version-name"] ?? "n/a";
  }

  /**
   * Enable this extension.
   *
   * If not already enabled, call `initialize` and keep track its allocated resources.
   */
  override enable(): void {
    if (!this.enabledExtension) {
      console.log(`Enabling extension ${this.metadata.uuid} ${this.version}`);
      this.enabledExtension = this.initialize();
      console.log(
        `Extension ${this.metadata.uuid} ${this.version} successfully enabled`,
      );
    }
  }

  /**
   * Disable this extension.
   *
   * If existing, destroy the allocated resources of `initialize`.
   */
  override disable(): void {
    console.log(`Disabling extension ${this.metadata.uuid} ${this.version}`);
    this.enabledExtension?.destroy();
    this.enabledExtension = null;
  }
}

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
export default class DisableUpdatesExtension extends DestructibleExtension {
  override initialize(): Destructible {
    const properties = new PropertyManager();
    properties.defineProperty(Main.extensionManager, "updatesSupported", {
      get: () => {
        console.log(`Extension updates disabled by ${this.metadata.uuid}`);
        return false;
      },
    });
    return properties;
  }
}
