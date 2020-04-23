# How it works

As soon as the user gets to the site, he is invited to sign up for notifications. In case of refusal of notifications, the user is redirected to a random subdomain.

If for some reason (notifications are blocked or device does not support notifications) it is not possible to request permission for notifications, the user will be redirected to the link specified in the `outlink` variable in `index.html`.

After successfully subscribing to notifications, the user also redirect to the link in the `outlink` variable.

# Requirements

To use the redirect loop for subdomains, you need a WildCard SSL certificate.

**!!! Notification only works for domains with HTTPS scheme !!!**

# Configuration
## `manifest.json`
    {
      "short_name": "Name of app",
      "name": "Full name of app",
      "description":"Description of app",
      "start_url": "/",
      "display": "fullscreen",
      "icons": [
        {
          "src": "path_to_icon",
          "type": "file extension of icon",
          "sizes": "icon resolution"
        }
      ],
      "theme_color": "Sets the color of the Chrome control panel"
    }

[Full list of options](https://developer.mozilla.org/en-US/docs/Web/Manifest)

## `index.html`

Set the link for redirect after subscription in var `outlink` (with scheme).

Set the base domain for subdomain redirect loop in var `domain` (without scheme).

Set postbacklink in var `postbacklink`. The placeholder `{clickid}` will be replaced for value `clickid` from GET query string.

    https://track-domain.com?cnv_id={clickid}

# Installation

Place the `firebase-messaging-sw.js` and `manifest.json` in the root directory of the domain.

In order to open a website for a user in the Chrome browser, use Android intent (an example in the file `intent.html`)

# Gathering subscriptions

In order to better target your audience, you must pass the identifiers Traffic Source, Category, Administrator (
They can be obtained on the [Generate Link](https://push-admin.omnia.media/generate-link) page.). Tag is not required field.

Also 2 letter ISO country code must be provided.

To use postback to track subscriptions, the `clickid` parameter must also be passed.

Parameters should be passed in the GET query string.

    https://your-domain.com?category={id}&source={id}&tag={id}&user={id}&country_code={CC}&clickid={clickid}

# Add tags to audience with postback
Link for postback

    https://cdn.img-cl.com/postback/1?tags={1_tag_name_or_id},{2_tag_name_or_id},...,{n_tag_name_or_id}

**Tags are not created during postback. Must be created in advance.
  You can pass both identifiers and tag names. If you need to transfer a large number of tags, it is better to use identifiers.**

# NOTE
To test the subscription collection UI, please use the local stubs to add (`/add`) and update (`/update`) the token.

They can be changed in the function `updateToken` and `sendToken` in the `main.js` file.