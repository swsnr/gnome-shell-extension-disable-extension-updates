# Disable extension updates

Disable GNOME Shell's automatic extension update check, the hacky way.

This extension monkey-patches the internals of extension management in GNOME
shell to make it assume that updates aren't supported.

See [#2514](https://gitlab.gnome.org/GNOME/gnome-shell/-/issues/2514) for a ticket
tracking an official way to provide more control over extension updates. Upstream
would really appreciate contributions here.

## Installation

Install from [extensions.gnome.org](https://extensions.gnome.org/extension/6424/disable-extension-updates/).

Or download the latest ZIP file from [releases](https://codeberg.org/swsnr/gnome-shell-extension-disable-extension-updates/releases),
and install with

```console
$ gnome-extensions install disable-extension-updates@swsnr.de.shell-extension.zip
```

Release artifacts are signed with my Codeberg SSH keys from <https://codeberg.org/swsnr.keys>.

## License

Copyright Sebastian Wiesner <sebastian@swsnr.de>

Licensed under the EUPL, see <https://interoperable-europe.ec.europa.eu/collection/eupl/eupl-text-eupl-12>
