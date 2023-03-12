# Tab gatherer

Google chrome extension that groups tabs for you automatically.
Groups are based on domains and trying to take into account your current groups of tabs.

**You can install the extension from [chrome web store](https://chrome.google.com/webstore/detail/tab-gatherer/iikbgnplcjndhjlacgfdjilfkiabflbd).**

### TODO / ideas

- ~~[must have] Icons in manifest~~
- ~~`homepage_url` in manifest~~
- [nice to have] Options page. Microroadmap:
  - thinks don't required extra permissions:
    - turn on/off instant grouping: create new group even for single new tab
    - turn on/off grouping `chrome://` tabs
    - turn on/off grouping `file://` tabs
    - turn on/off minimum group size: remove groups smaller then N tabs automatically
    - save parts of domain: maximum number, save longest, save rightmost, save leftmost
    - options for autosplitting mixed groups (does it really useful?)
    - options for autoungroup new tabs
    - destroy groups with only one tab within (with delay?)
  - ~~autonaming goups (+tabGroups permission)~~
    - make autogrouping turnable
    - consider different ways to abbreviate domains
- [nice to have] Recognize IPs
- ~~[must have] Publish (while you can try it in developer mode)~~
- [nice to have] Setup eslint
- [nice to have] Setup CI
- [nice to have] Saving state (?) saving preferences (domains? groups names? colors?)
- [nice to have] Unit testing
