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
class PropertyManager {
  private trackedProperties: TrackedProperty[] = [];

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
  defineProperty(
    object: unknown,
    key: PropertyKey,
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
  clear() {
    this.trackedProperties.forEach(({ object, key }) => {
      // Deleting is the actual point here, since we're deep in monkey-patching
      // territory, and we kinda fake the types here just to make typescript happy.
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete (object as Record<PropertyKey, unknown>)[key];
    });
    this.trackedProperties = [];
  }
}

/**
 * Disable extension updates with some monkey-patching trickery.
 */
export default class DisableUpdatesExtension extends Extension {
  private readonly propertyManager = new PropertyManager();

  override enable(): void {
    console.log(
      `Extension ${this.metadata.uuid} enabling, monkey-patching extension Main.extensionManager.updatesSupported to disable automatic updates`,
    );
    this.propertyManager.defineProperty(
      Main.extensionManager,
      "updatesSupported",
      {
        get: () => {
          console.log(`Extension updates disabled by ${this.metadata.uuid}`);
          return false;
        },
      },
    );
  }

  override disable(): void {
    console.log(
      `Extension ${this.metadata.uuid} disabled, resetting monkey-patched properties`,
    );
    this.propertyManager.clear();
  }
}
