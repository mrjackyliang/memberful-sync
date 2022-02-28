Memberful Sync
===============

[![GitHub Releases](https://img.shields.io/github/v/release/mrjackyliang/memberful-sync?style=flat-square&color=blue&sort=semver)](https://github.com/mrjackyliang/memberful-sync/releases)
[![GitHub Top Languages](https://img.shields.io/github/languages/top/mrjackyliang/memberful-sync?style=flat-square&color=success)](https://github.com/mrjackyliang/memberful-sync)
[![GitHub License](https://img.shields.io/github/license/mrjackyliang/memberful-sync?style=flat-square&color=yellow)](https://github.com/mrjackyliang/memberful-sync/blob/master/LICENSE)
[![Become a GitHub Sponsor](https://img.shields.io/badge/sponsor-github-black?style=flat-square&color=orange)](https://github.com/sponsors/mrjackyliang)

An application that continuously syncs Memberful member data to all external services. Supported integrations will be listed below. Additional integrations may come in the future (accepting pull requests).

To use Memberful Sync, you would need to:
1. Install the [dependencies](#install-dependencies)
3. Configure the [Memberful Sync](#configuration) application
4. Start the application using `npm start`

## Install Dependencies
Before configuring and starting the application, make sure to install the dependencies and required packages.

1. Install [Homebrew](https://brew.sh) and run `brew install node`
2. Tap into the application directory with `cd memberful-sync`
3. Install dependencies by running `npm install`

## Configuration
In the project folder, you will find a `config-sample.json` file. Each section enables an integration and must be configured correctly. If you wish to disable an integration, you may omit the section from the configuration.

1. [Base Settings](#1-base-settings)
2. [Intercom](#2-intercom)
3. [WordPress](#3-wordpress)

### 1. Base Settings
For Memberful Sync to start, these settings should be filled.

| __Key__                        | __Type__ | __Description__                        | __Required__ | __Accepted Values__                                                                                                      |
|--------------------------------|----------|----------------------------------------|--------------|--------------------------------------------------------------------------------------------------------------------------|
| `settings`                     | `object` |                                        | no           |                                                                                                                          |
| `settings.memberful-api-key`   | `string` |                                        | yes          | Read [Memberful API Authentication](https://memberful.com/help/custom-development-and-api/memberful-api/#authentication) |
| `settings.memberful-subdomain` | `string` |                                        | yes          | A URL of `https://example123.memberful.com` would have a subdomain of `example123`                                       |
| `settings.time-zone`           | `string` | Preferred time zone                    | yes          | More time zones found in the [tz database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)                 |
| `settings.log-level`           | `number` | Verbosity level configured for logging | yes          | `10` (error), `20` (warning), `30` (information), or `40` (debug)                                                        |

```json
{
  "settings": {
    "memberful-api-key": "",
    "memberful-subdomain": "",
    "time-zone": "Etc/UTC",
    "log-level": 30
  }
}
```

### 2. Intercom
Easily sync Memberful data to Intercom. Before enabling integration, you must set custom attributes in your workspace. To set custom attributes, go to [**Settings** > **Your workspace data** > **People data**](https://app.intercom.com/a/apps/_/settings/people-data).

The custom attributes are as follows:
- `credit_card` (text)
- `discord_user_id` (text)
- `downloads` (text)
- `last_updated` (date)
- `postal_code` (text)
- `stripe_customer_id` (text)
- `subscriptions` (text)
- `total_spend` (decimal number)
- `unrestricted_access` (true or false)

__NOTE:__ If custom attributes aren't set properly, errors will occur when attempting to update or create a new contact.

| __Key__                      | __Type__ | __Description__                     | __Required__ | __Accepted Values__                                                                                                                       |
|------------------------------|----------|-------------------------------------|--------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `intercom`                   | `object` |                                     | no           |                                                                                                                                           |
| `intercom.access-token`      | `string` | Access token to access Intercom API | no           | Read [How to get your access token](https://developers.intercom.com/building-apps/docs/authentication-types#how-to-get-your-access-token) |

```json
{
  "intercom": {
    "access-token": ""
  }
}
```

### 3. WordPress
Integration is being built! Coming Soon!

| __Key__                          | __Type__ | __Description__                              | __Required__ | __Accepted Values__                                                                                                                                                                  |
|----------------------------------|----------|----------------------------------------------|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `wordpress`                      | `object` |                                              | no           |                                                                                                                                                                                      |
| `wordpress.application-password` | `string` | Application password to access WordPress API | no           | Read [How to use Application Passwords in WordPress for REST API Authentication](https://artisansweb.net/how-to-use-application-passwords-in-wordpress-for-rest-api-authentication/) |

```json
{
  "wordpress": {
    "application-password": ""
  }
}
```
