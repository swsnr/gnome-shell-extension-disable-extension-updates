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

export default class DisableUpdatesExtension extends Extension {
  private updatesDisabled = false;
  private extensionManagerWasPatched = false;

  override enable(): void {
    if (!this.extensionManagerWasPatched) {
      this.extensionManagerWasPatched = true;
      Object.defineProperty(Main.extensionManager, "updatesSupported", {
        get: () => {
          if (this.updatesDisabled) {
            console.log(`Extension updates disabled by ${this.metadata.uuid}`);
            return false;
          } else {
            return (
              (Object.getOwnPropertyDescriptor(
                Object.getPrototypeOf(Main.extensionManager),
                "updatesDisabled",
              )?.get?.bind(Main.extensionManager)() as boolean | undefined) ??
              false
            );
          }
        },
      });
    }
  }

  override disable(): void {
    this.updatesDisabled = false;
  }
}
