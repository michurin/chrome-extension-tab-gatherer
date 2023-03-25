# Tab gatherer

Google chrome extension that groups tabs for you automatically.
Groups are based on domains and trying to take into account your current groups of tabs.

**You can install the extension from [chrome web store](https://chrome.google.com/webstore/detail/tab-gatherer/iikbgnplcjndhjlacgfdjilfkiabflbd).**

**If you already are the fair user of that extension, and you have ideas, issues, bugs, worm wards... you are free to [text me](a.michurin@gmail.com),
or [create issue here on github](https://github.com/michurin/chrome-extension-tab-gatherer/issues).**

## Contributing

You are welcome to contribute to project success.

If you brave enough to dive into JS, please, do not forget about linting and codestyle.
If your are going to do total refactoring, please discuss it first.

However, if you do not want to dig JS, it will be great to see you ideas and issues.

If you found typos, ugly icons, texts... your suggestions are welcome with appreciation.

### Todos / ideas / issues

- ~~[must have] Icons in manifest~~
- ~~`homepage_url` in manifest~~
- ~~[nice to have] Options page.~~ Microroadmap:
  - ~~list of customizations~~
    - ~~order~~
    - clickable lines, click opens group for further management
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
  - UI
    - Themes on options page `@media (prefers-color-scheme: dark)`
- [nice to have] Recognize IPs
- ~~[must have] Publish (while you can try it in developer mode)~~
- [nice to have] Setup eslint
- [nice to have] Setup CI
- ~~[nice to have] Comments in code. At least related to working with persistent storage~~
- ~~[nice to have] Saving state (?) saving preferences (domains? groups names? colors?)~~
- [nice to have] \[partially done] Unit testing
- [nice to have] Consider case when user is moving tab from window to window
- [nice to have] Limit storage utilization (custom domains)
- [very nice to have] Cleanup S-records time to time to avoid storage leaking
- [minor issue] Strange behavior when you drag group itself to tear whole group off. It seems, Chrome consider it as a new group, but won't notify extension about initial group disappearance. Must be investigated
- [minor issue] Users report about strange behavior in [Yandex browser](https://browser.yandex.com/). It looks like groups appear, tabs stick together, however groups don't show up in GUI
- ~~[nice to have] Debugging page: full dump of `storage.local`, `runtime.lasterror`, list of tabs (tabID, host, groupID, windowID), manifest and chrome version info~~
