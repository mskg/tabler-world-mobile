# Configuration and Secrets

This directory contains keys and other data that is only for the TABLER.WORLD team. The software works without these secrets, which are used to configure the official application and connect to services that we use.

---

## Team Instructions

### Security

This directory contains only secrets that cannot cause significant damage or create significant work for us if they are exposed. It also contains data that isn't actually secret, such as client API keys, but that belong only in the official releases of the client and we want to prevent from accidentally being included in developers' own builds.

In the interest of defense in depth, we mitigate the consequences of these secrets being exposed. **Do not add especially sensitive or hard-to-revoke secret credentials, to this repository or CI, even if they are encrypted.**

### Unlocking the secrets

The secrets are encrypted using [`git-crypt`](https://github.com/AGWA/git-crypt). Run `unlock` in this repo to decrypt the secrets. If you do not have a decryption key, `unlock` will print instructions for you. 

The secrets will remain decrypted on your local computer but will automatically be encrypted when you push your changes to GitHub.

### Locking the secrets

You can encrypt the secrets again by running `lock`. You should rarely need to lock the secrets, but if you encounter issues with `git-crypt` it may be useful. Locking the secrets does not protect them unless you securely delete the key and your ability to acquire another copy of the key, however.
