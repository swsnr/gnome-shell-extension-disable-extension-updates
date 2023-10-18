# Disable extension updates

Disable GNOME Shell's automatic extension update check, the hacky way.

This extension monkey-patches the internals of extension management in GNOME
shell to make it assume that updates aren't supported.

See [#2514](https://gitlab.gnome.org/GNOME/gnome-shell/-/issues/2514) for a ticket
tracking an official way to provide more control over extension updates. Upstream
would really appreciate contributions here.

## Installation

Install from [extensions.gnome.org](https://extensions.gnome.org/extension/6424/disable-extension-updates/).

Or download the latest ZIP file from [releases](https://github.com/swsnr/gnome-shell-extension-disable-extension-updates/releases),
and install with

```console
$ gnome-extensions install disable-extension-updates@swsnr.de.shell-extension.zip
```

## License

Copyright Sebastian Wiesner <sebastian@swsnr.de>

This program is subject to the terms of the Mozilla Public
License, v. 2.0.If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.

Alternatively, this program may be used under the terms
of the GNU General Public License Version 2 or later, as described below:

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

