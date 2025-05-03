default:
    just --list

test-all:
    npm ci
    npx tsc --project .
    npx eslint .
    npx prettier --check .

pack:
    rm -f disable-extension-updates@swsnr.de.shell-extension.zip disable-extension-updates@swsnr.de.shell-extension.zip.sig
    gnome-extensions pack --force --extra-source LICENSE-GPL2 --extra-source LICENSE-MPL2
    # Get my codeberg SSH key for signing the artifacts
    curl https://codeberg.org/swsnr.keys > key
    ssh-keygen -Y sign -f key -n file disable-extension-updates@swsnr.de.shell-extension.zip
    rm key

ensure-repo-clean:
    git update-index --really-refresh
    git diff-index --quiet HEAD

release VERSION: ensure-repo-clean
    sed -i 's/"version-name": .*,/"version-name": "{{VERSION}}",/' metadata.json
    git add metadata.json
    git commit -m 'Release {{VERSION}}'
    git tag -a -s 'v{{VERSION}}'
    just pack
    git push --follow-tags origin main
    echo "Upload zip to https://extensions.gnome.org"
    echo "Create a new codeberg release at https://codeberg.org/swsnr/gnome-shell-extension-disable-extension-updates/releases/new?tag=v{{VERSION}}"
